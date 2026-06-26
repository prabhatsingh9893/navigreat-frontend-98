import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from "socket.io-client";
import { Send, User as UserIcon, MessageSquare, ArrowLeft, Mic, StopCircle, Check, CheckCheck, Clock, RotateCw, AlertCircle } from 'lucide-react';
import { API_BASE_URL } from '../config';
import toast from 'react-hot-toast';

// Map a saved message's flags to a UI status (sent → delivered → read)
const statusFromMsg = (m) => (m.read ? 'read' : m.delivered ? 'delivered' : 'sent');
const newTempId = () => `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`;

// Initialize Socket
const SOCKET_URL = API_BASE_URL.replace('/api', '');
const socket = io(SOCKET_URL, {
    autoConnect: true,
    reconnection: true,
    reconnectionDelay: 3000,
    transports: ["websocket", "polling"]
});

const ChatPage = () => {
    const { userId: targetUserId } = useParams();
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [currentUser] = useState(() => {
        const userData = localStorage.getItem('userData');
        try {
            return userData ? JSON.parse(userData) : null;
        } catch {
            return null;
        }
    });
    const [targetUser, setTargetUser] = useState(null);
    const [contactList, setContactList] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState(new Set()); // ✅ Track Online Users
    const [isConnected, setIsConnected] = useState(socket.connected);

    // 🎙️ Voice Recording State
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    const scrollRef = useRef();
    const notificationSound = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3')); // Beep Sound
    const typingTimeoutRef = useRef(null);
    const targetRef = useRef(targetUserId);        // latest open conversation (for reconnect resync)
    const hasConnectedRef = useRef(false);          // distinguishes first connect from reconnect
    useEffect(() => { targetRef.current = targetUserId; }, [targetUserId]);

    // Utils & Helpers defined early to prevent accessed-before-declared issues
    const scrollToBottom = () => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const fetchContacts = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/contacts`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) setContactList(data.contacts);
        } catch (error) {
            console.error("Error fetching contacts:", error);
        }
    };

    // Fetch full message history for a conversation, normalise status, and mark read.
    const fetchMessages = (uid) => {
        if (!uid || uid === 'undefined' || !currentUser) return;
        const token = localStorage.getItem('token');
        fetch(`${API_BASE_URL}/messages/${uid}`, { headers: { Authorization: `Bearer ${token}` } })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setMessages(data.messages.map(m => ({ ...m, status: statusFromMsg(m) })));
                    window.dispatchEvent(new Event('messageNotificationSync'));
                    // Tell the other party we've read their messages (live read ticks)
                    socket.emit("mark_read", { senderId: uid, readerId: currentUser._id || currentUser.id });
                }
            })
            .catch(() => {});
    };

    useEffect(() => {
        if (!currentUser) {
            navigate('/login');
            return;
        }

        const handleConnect = () => {
            setIsConnected(true);
            socket.emit("register_user", currentUser._id || currentUser.id); // ✅ Emit register_user
            // On RECONNECT (not the first connect), resync so nothing was missed offline
            if (hasConnectedRef.current) {
                fetchContacts();
                if (targetRef.current) fetchMessages(targetRef.current);
            }
            hasConnectedRef.current = true;
        };

        const handleDisconnect = () => {
            setIsConnected(false);
        };

        if (socket.connected) {
            handleConnect();
        } else {
            setTimeout(() => {
                setIsConnected(false);
            }, 0);
        }

        socket.on("connect", handleConnect);
        socket.on("disconnect", handleDisconnect);

        // ✅ Online Status Listeners
        socket.on("get_online_users", (users) => {
            setOnlineUsers(new Set(users));
        });

        socket.on("user_online", (userId) => {
            setOnlineUsers(prev => new Set(prev).add(userId));
        });

        socket.on("user_offline", (userId) => {
            setOnlineUsers(prev => {
                const newSet = new Set(prev);
                newSet.delete(userId);
                return newSet;
            });
        });

        setTimeout(() => {
            fetchContacts();
        }, 0);

        return () => {
            socket.off("connect", handleConnect);
            socket.off("disconnect", handleDisconnect);
            socket.off("get_online_users");
            socket.off("user_online");
            socket.off("user_offline");
        };
    }, [navigate, currentUser]);


    // 2. Fetch Target User Info & Messages
    useEffect(() => {
        if (!targetUserId || targetUserId === 'undefined' || !currentUser) return;

        // A. Fetch Target User Details
        fetch(`${API_BASE_URL}/mentors/${targetUserId}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setTargetUser(data.mentor || data.user);
                }
            });

        // B. Fetch Message History (normalised + marks read)
        fetchMessages(targetUserId);

    }, [targetUserId, currentUser]);

    // 3. Socket Listeners
    useEffect(() => {
        const myId = currentUser?._id || currentUser?.id;

        const handleReceiveMessage = (msg) => {
            const isCurrentChat = (msg.sender === targetUserId || msg.receiver === targetUserId);
            const isMe = (msg.sender === myId);

            // A. Update Messages Area — reconcile optimistic bubbles + dedup
            if (isCurrentChat) {
                setMessages((prev) => {
                    // My own message echoing back: replace the optimistic temp
                    if (msg.tempId && prev.some(m => m.tempId === msg.tempId)) {
                        return prev.map(m => m.tempId === msg.tempId
                            ? { ...msg, tempId: msg.tempId, status: statusFromMsg(msg) }
                            : m);
                    }
                    // Already have it (duplicate echo) → ignore
                    if (msg._id && prev.some(m => m._id === msg._id)) return prev;
                    return [...prev, { ...msg, status: statusFromMsg(msg) }];
                });
                scrollToBottom();
                if (!isMe) {
                    // I'm viewing this thread → confirm delivered + read in real time
                    socket.emit("message_delivered", { messageId: msg._id, senderId: msg.sender });
                    socket.emit("mark_read", { senderId: msg.sender, readerId: myId });
                    const token = localStorage.getItem('token');
                    fetch(`${API_BASE_URL}/messages/${msg.sender}/read`, {
                        method: 'PUT',
                        headers: { Authorization: `Bearer ${token}` }
                    }).then(() => {
                        window.dispatchEvent(new Event('messageNotificationSync'));
                    }).catch(err => console.error("Error marking messages as read:", err));
                }
            } else if (!isMe) {
                // Message for another conversation → still confirm delivery
                socket.emit("message_delivered", { messageId: msg._id, senderId: msg.sender });
                // ✅ Improved Notification
                // Try to find sender name from contact list or just say "New Message"
                // contactList might be stale in closure, better to trust the update logic or fetch fresh
                // For now, generic or improved if possible.
                // We don't have sender name in 'msg' usually, only ID.
                toast(`New Message received`, {
                    icon: '📩',
                    style: { borderRadius: '10px', background: '#333', color: '#fff' }
                });

                // Play Sound
                notificationSound.current.play().catch(() => console.log("Audio play failed"));

                // Sync notification count
                window.dispatchEvent(new Event('messageNotificationSync'));
            }

            // B. Update Sidebar (Move to Top + Badge)
            setContactList(prev => {
                const newList = [...prev];
                const index = newList.findIndex(c => c._id === msg.sender || c._id === msg.receiver);

                if (index !== -1) {
                    const contact = newList[index];
                    const updatedContact = {
                        ...contact,
                        lastMessage: msg.content,
                        lastMessageTime: msg.timestamp,
                        unreadCount: (!isMe && targetUserId !== contact._id)
                            ? (contact.unreadCount || 0) + 1
                            : contact.unreadCount
                    };
                    newList.splice(index, 1);
                    newList.unshift(updatedContact);

                    // Trigger specific toast with name if found
                    if (!isMe && !isCurrentChat) {
                        toast.dismiss(); // Dismiss generic
                        toast.success(`${contact.username}: ${msg.content.substring(0, 20)}...`, {
                            icon: '💬',
                            duration: 4000
                        });
                    }

                    return newList;
                } else {
                    fetchContacts(); // Fetch text if new contact
                    return prev;
                }
            });
        };

        // Live delivery / read receipts for MY sent messages
        const handleStatus = ({ messageId, status }) => {
            setMessages(prev => prev.map(m => {
                if (m.sender !== myId) return m;
                if (status === 'read') return { ...m, read: true, delivered: true, status: 'read' };
                if (status === 'delivered') {
                    if (messageId && m._id !== messageId) return m;
                    return { ...m, delivered: true, status: m.read ? 'read' : 'delivered' };
                }
                return m;
            }));
        };

        socket.on("receive_message", handleReceiveMessage);
        socket.on("message_status", handleStatus);
        socket.on("display_typing", () => setIsTyping(true));
        socket.on("hide_typing", () => setIsTyping(false));

        return () => {
            socket.off("receive_message", handleReceiveMessage);
            socket.off("message_status", handleStatus);
            socket.off("display_typing");
            socket.off("hide_typing");
        };
    }, [targetUserId, currentUser]);



    // 🎙️ RECORDING LOGIC
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);

            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorderRef.current.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const reader = new FileReader();
                reader.readAsDataURL(audioBlob);
                reader.onloadend = () => {
                    sendAudioMessage(reader.result);
                };
                audioChunksRef.current = [];
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
        } catch (err) {
            console.error("Error accessing microphone:", err);
            toast.error("Could not access microphone.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
    };

    // Emit a (temp) message to the server with a reliable ACK + timeout.
    // Drives the optimistic bubble's status: sending → sent/delivered/read, or failed.
    const emitMessage = (msg) => {
        setMessages(prev => prev.map(m => m.tempId === msg.tempId ? { ...m, status: 'sending' } : m));
        if (!socket.connected) {
            setMessages(prev => prev.map(m => m.tempId === msg.tempId ? { ...m, status: 'failed' } : m));
            return;
        }
        socket.timeout(12000).emit("send_message", {
            sender: msg.sender,
            receiver: msg.receiver,
            content: msg.content,
            messageType: msg.messageType,
            audioUrl: msg.audioUrl,
            tempId: msg.tempId,
        }, (err, res) => {
            if (err || !res || !res.success) {
                setMessages(prev => prev.map(m => m.tempId === msg.tempId ? { ...m, status: 'failed' } : m));
            } else {
                setMessages(prev => prev.map(m => m.tempId === msg.tempId
                    ? { ...res.message, tempId: msg.tempId, status: statusFromMsg(res.message) }
                    : m));
            }
        });
    };

    // Add an optimistic bubble immediately, then send it.
    const dispatchMessage = ({ content, messageType = 'text', audioUrl = '' }) => {
        if (!targetUserId) return;
        const myId = currentUser._id || currentUser.id;
        const optimistic = {
            _id: newTempId(),
            tempId: newTempId(),
            sender: myId,
            receiver: targetUserId,
            content,
            messageType,
            audioUrl,
            timestamp: new Date().toISOString(),
            read: false,
            delivered: false,
            status: 'sending',
        };
        optimistic._id = optimistic.tempId; // keep them aligned for keying
        setMessages(prev => [...prev, optimistic]);
        scrollToBottom();
        emitMessage(optimistic);
    };

    const retryMessage = (msg) => emitMessage(msg);

    const sendAudioMessage = (base64Audio) => {
        dispatchMessage({ content: "🎤 Voice Message", messageType: 'audio', audioUrl: base64Audio });
    };

    const sendMessage = () => {
        const text = newMessage.trim();
        if (!text || !targetUserId) return;
        socket.emit("stop_typing", targetUserId);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        dispatchMessage({ content: text });
        setNewMessage("");
    };



    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const handleViewProfile = () => {
        if (targetUser) {
            navigate(`/mentor/${targetUser._id || targetUser.id}`);
        }
    };

    return (
        <div className="flex h-[calc(100vh-72px)] mt-[72px] bg-slate-50 dark:bg-[#080d14] font-sans transition-colors duration-300">
            {/* Sidebar */}
            <div className={`${targetUserId ? 'hidden md:flex' : 'flex'} w-full md:w-1/3 bg-white dark:bg-[#0d1520] border-r border-slate-200 dark:border-slate-800/80 flex-col`}>
                <div className="p-4 border-b border-slate-150 dark:border-slate-800/80 bg-slate-50/50 dark:bg-[#0d1520] flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Messages</h2>
                        {!isConnected && (
                            <span className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-pulse" title="Connecting to server..."></span>
                        )}
                    </div>
                    <span className="text-xs bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-400 border border-teal-100 dark:border-teal-900/30 px-2.5 py-1 rounded-full font-bold">{contactList.length} {contactList.length === 1 ? 'Contact' : 'Contacts'}</span>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {contactList.map(contact => (
                        <div
                            key={contact._id}
                            onClick={() => navigate(`/chat/${contact._id}`)}
                            className={`p-4 flex items-center gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-[#151f2e]/40 transition border-b border-slate-100 dark:border-slate-800/60 ${targetUserId === contact._id ? 'bg-teal-50/50 dark:bg-[#151f2e] border-r-4 border-r-teal-500' : ''}`}
                        >
                            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-[#151f2e] overflow-hidden flex-shrink-0 border border-slate-200 dark:border-slate-800 relative">
                                <img src={contact.image || `https://api.dicebear.com/7.x/initials/svg?seed=${contact.username}`} alt="avatar" className="w-full h-full object-cover" />
                                {onlineUsers.has(contact._id) && (
                                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-[#0d1520] rounded-full"></span>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline mb-0.5">
                                    <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm truncate">{contact.username}</h3>
                                    {contact.lastMessageTime && (
                                        <span className="text-[10px] text-slate-400 dark:text-slate-500 flex-shrink-0">
                                            {formatTime(contact.lastMessageTime)}
                                        </span>
                                    )}
                                </div>
                                <div className="flex justify-between items-center">
                                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate w-3/4">
                                        {contact.lastMessage || (contact.college ? contact.college : "Tap to chat")}
                                    </p>
                                    {contact.unreadCount > 0 && (
                                        <span className="bg-teal-600 text-white text-[10px] font-bold h-5 min-w-[20px] px-1 flex items-center justify-center rounded-full shadow-sm">
                                            {contact.unreadCount}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    {contactList.length === 0 && (
                        <div className="p-8 text-center">
                            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-[#151f2e] flex items-center justify-center mx-auto mb-4 text-teal-500">
                                <MessageSquare size={24} />
                            </div>
                            <p className="font-bold text-slate-600 dark:text-slate-300 text-sm mb-1">No conversations yet</p>
                            <p className="text-xs text-slate-400 dark:text-slate-500 mb-5">Message a mentor and your chats will appear here.</p>
                            <button onClick={() => navigate('/mentors')} className="btn-primary px-5 py-2.5 rounded-xl text-xs">Find a mentor</button>
                        </div>
                    )}
                </div>
            </div>

            {/* Chat Area */}
            {targetUserId ? (
                <div className="flex-1 flex flex-col bg-slate-100 dark:bg-[#080d14] relative">
                    {/* Subtle on-brand dot pattern (self-contained, no external asset) */}
                    <div className="absolute inset-0 opacity-[0.05] dark:opacity-[0.04] pointer-events-none text-teal-600 dark:text-teal-400" style={{ backgroundImage: "radial-gradient(currentColor 1px, transparent 1px)", backgroundSize: "20px 20px" }}></div>

                    {/* Header */}
                    <div className="p-3 bg-white dark:bg-[#0d1520] border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between shadow-sm z-10">
                        <div className="flex items-center gap-3">
                            <button onClick={() => navigate('/chat')} className="md:hidden p-2 text-slate-600 dark:text-slate-200"><ArrowLeft size={20} /></button>

                            {/* Clickable Profile Section */}
                            <div onClick={handleViewProfile} className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-[#151f2e] p-1 pr-4 rounded-lg transition">
                                <div className="w-10 h-10 rounded-full bg-teal-50 dark:bg-[#151f2e] flex items-center justify-center text-teal-600 dark:text-teal-400 font-bold overflow-hidden border border-slate-200 dark:border-slate-800">
                                    {targetUser?.image ? <img src={targetUser.image} className="w-full h-full object-cover" /> : <UserIcon />}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 dark:text-slate-100 hover:underline">{targetUser?.username || "Loading..."}</h3>
                                    <p className="text-xs flex items-center gap-1 font-medium">
                                        {isTyping ? (
                                            <span className="text-teal-500 font-bold animate-pulse">Typing...</span>
                                        ) : onlineUsers.has(targetUserId) ? (
                                            <span className="text-green-500 flex items-center gap-1">
                                                <span className="w-2 h-2 bg-green-500 rounded-full"></span> Online
                                            </span>
                                        ) : (
                                            <span className="text-gray-400">Offline</span>
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Connection Status Indicator */}
                        {!isConnected && (
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-500 dark:bg-amber-500/15 border border-amber-500/25 rounded-full text-xs font-medium animate-pulse">
                                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping"></span>
                                Connecting...
                            </div>
                        )}
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-2 z-10 custom-scrollbar">
                        {messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500 opacity-80">
                                <div className="bg-white/50 dark:bg-slate-900/40 p-4 rounded-full mb-3 border border-slate-200 dark:border-slate-800">
                                    <MessageSquare size={32} className="text-teal-400" />
                                </div>
                                <p className="text-sm font-medium">No messages yet</p>
                                <p className="text-xs">Say &quot;Hi&quot; to start the conversation! 👋</p>
                            </div>
                        ) : (
                            messages.map((msg) => {
                                const isMe = msg.sender === (currentUser._id || currentUser.id);
                                const failed = msg.status === 'failed';
                                return (
                                    <div key={msg.tempId || msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`relative max-w-[70%] p-3 px-4 rounded-2xl shadow-sm text-sm ${
                                            failed
                                                ? 'bg-red-50 dark:bg-red-900/20 text-slate-800 dark:text-slate-200 border border-red-200 dark:border-red-900/40 rounded-tr-none'
                                                : isMe
                                                    ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-tr-none'
                                                    : 'bg-white dark:bg-[#151f2e] text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-150/80 dark:border-slate-800/65'
                                        }`}>

                                            {msg.messageType === 'audio' ? (
                                                <div className="flex items-center gap-2 min-w-[200px] py-1">
                                                    <audio controls src={msg.audioUrl} className="w-full h-8 animate-in" />
                                                </div>
                                            ) : (
                                                <p className="leading-relaxed pb-1">{msg.content}</p>
                                            )}

                                            <div className="flex items-center justify-end gap-1 mt-0.5 select-none">
                                                <span className={`text-[10px] min-w-[45px] text-right ${failed ? 'text-red-500' : isMe ? 'text-teal-200' : 'text-slate-400 dark:text-slate-500'}`}>
                                                    {failed ? 'Failed' : formatTime(msg.timestamp)}
                                                </span>
                                                {isMe && !failed && (
                                                    <span>
                                                        {msg.status === 'sending'
                                                            ? <Clock size={13} className="text-teal-200/80" />
                                                            : msg.status === 'read'
                                                                ? <CheckCheck size={14} className="text-sky-300" />
                                                                : msg.status === 'delivered'
                                                                    ? <CheckCheck size={14} className="text-teal-200" />
                                                                    : <Check size={14} className="text-teal-200" />}
                                                    </span>
                                                )}
                                                {isMe && failed && (
                                                    <button onClick={() => retryMessage(msg)} title="Retry" className="ml-1 text-red-500 hover:text-red-600 flex items-center gap-0.5 font-bold">
                                                        <RotateCw size={12} /> Retry
                                                    </button>
                                                )}
                                            </div>
                                            {failed && (
                                                <span className="absolute -left-6 top-1/2 -translate-y-1/2 text-red-500"><AlertCircle size={15} /></span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                        <div ref={scrollRef}></div>
                    </div>

                    {/* Input */}
                    <div className="p-3 bg-white dark:bg-[#0d1520] border-t border-slate-200 dark:border-slate-800/80 z-10">
                        <div className="flex gap-2 items-center">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => {
                                    setNewMessage(e.target.value);
                                    socket.emit("typing", targetUserId);
                                    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
                                    typingTimeoutRef.current = setTimeout(() => socket.emit("stop_typing", targetUserId), 2000);
                                }}
                                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                                placeholder={isRecording ? "Recording audio..." : "Type a message..."}
                                disabled={isRecording}
                                className={`flex-1 border border-slate-200 dark:border-slate-850 rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white dark:focus:bg-[#0d1520] bg-slate-50 dark:bg-[#151f2e] text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition ${isRecording ? 'opacity-50 cursor-not-allowed bg-red-50 dark:bg-red-900/10' : ''}`}
                            />
                            <button
                                onClick={newMessage.trim() ? sendMessage : (isRecording ? stopRecording : startRecording)}
                                className={`${isRecording ? 'bg-red-500 hover:bg-red-600 animate-pulse' : 'bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700'} text-white p-3 rounded-full transition shadow-md active:scale-95 flex items-center justify-center`}
                            >
                                {newMessage.trim() ? <Send size={18} /> : (isRecording ? <StopCircle size={20} /> : <Mic size={20} />)}
                            </button>
                        </div>
                    </div>

                </div>
            ) : (
                <div className="hidden md:flex flex-1 flex-col items-center justify-center text-slate-400 dark:text-slate-500 bg-slate-50/50 dark:bg-[#080d14] border-l border-slate-200 dark:border-slate-800/80 border-b-[6px] border-b-teal-500">
                    <div className="w-40 h-40 bg-slate-100 dark:bg-[#151f2e] rounded-full flex items-center justify-center mb-6 border border-slate-200 dark:border-slate-850 shadow-inner">
                        <MessageSquare size={64} className="opacity-20 text-teal-500 dark:text-teal-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Welcome to Chat</h2>
                    <p className="mt-2 text-slate-500 dark:text-slate-400">Select a contact to start messaging.</p>
                    {!isConnected && (
                        <div className="mt-4 flex items-center gap-2 px-4 py-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded-lg text-sm font-medium animate-pulse">
                            <span className="w-2 h-2 bg-amber-500 rounded-full animate-ping"></span>
                            Connecting to real-time chat server...
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ChatPage;
