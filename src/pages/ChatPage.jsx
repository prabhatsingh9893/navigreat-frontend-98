import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from "socket.io-client";
import { Send, User as UserIcon, MessageSquare, ArrowLeft, Mic, StopCircle, Check, CheckCheck } from 'lucide-react';
import { API_BASE_URL } from '../config';
import toast from 'react-hot-toast';

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

    useEffect(() => {
        if (!currentUser) {
            navigate('/login');
            return;
        }

        const handleConnect = () => {
            setIsConnected(true);
            console.log("Registering Online:", currentUser._id || currentUser.id);
            socket.emit("register_user", currentUser._id || currentUser.id); // ✅ Emit register_user
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

        // B. Fetch Message History
        const token = localStorage.getItem('token');
        fetch(`${API_BASE_URL}/messages/${targetUserId}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) setMessages(data.messages);
            });

    }, [targetUserId, currentUser]);

    // 3. Socket Listeners
    useEffect(() => {
        const handleReceiveMessage = (msg) => {
            const isCurrentChat = (msg.sender === targetUserId || msg.receiver === targetUserId);
            const isMe = (msg.sender === currentUser?._id || msg.sender === currentUser?.id);

            // A. Update Messages Area
            if (isCurrentChat) {
                setMessages((prev) => [...prev, msg]);
                scrollToBottom();
            } else if (!isMe) {
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

        socket.on("receive_message", handleReceiveMessage);
        socket.on("display_typing", () => setIsTyping(true));
        socket.on("hide_typing", () => setIsTyping(false));

        return () => {
            socket.off("receive_message", handleReceiveMessage);
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

    const sendAudioMessage = (base64Audio) => {
        if (!targetUserId) return;
        if (!socket.connected) {
            toast.error("Not connected to chat server. Please wait for reconnection...");
            return;
        }
        const msgData = {
            sender: currentUser._id || currentUser.id,
            receiver: targetUserId,
            content: "🎤 Voice Message",
            messageType: 'audio',
            audioUrl: base64Audio,
            timestamp: new Date()
        };
        socket.emit("send_message", msgData);
    };

    const sendMessage = async () => {
        if (!newMessage.trim() || !targetUserId) return;
        if (!socket.connected) {
            toast.error("Not connected to chat server. Please wait for reconnection...");
            return;
        }
        const msgData = {
            sender: currentUser._id || currentUser.id,
            receiver: targetUserId,
            content: newMessage,
            timestamp: new Date()
        };
        socket.emit("send_message", msgData);
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
        <div className="flex h-[calc(100vh-64px)] mt-16 bg-slate-50 dark:bg-[#080d14] font-sans transition-colors duration-300">
            {/* Sidebar */}
            <div className={`${targetUserId ? 'hidden md:flex' : 'flex'} w-full md:w-1/3 bg-white dark:bg-[#0d1520] border-r border-slate-200 dark:border-slate-800/80 flex-col`}>
                <div className="p-4 border-b border-slate-150 dark:border-slate-800/80 bg-slate-50/50 dark:bg-[#0d1520] flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Messages</h2>
                        {!isConnected && (
                            <span className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-pulse" title="Connecting to server..."></span>
                        )}
                    </div>
                    <span className="text-xs bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30 px-2.5 py-1 rounded-full font-bold">{contactList.length} Contacts</span>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {contactList.map(contact => (
                        <div
                            key={contact._id}
                            onClick={() => navigate(`/chat/${contact._id}`)}
                            className={`p-4 flex items-center gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-[#151f2e]/40 transition border-b border-slate-100 dark:border-slate-800/60 ${targetUserId === contact._id ? 'bg-indigo-50/50 dark:bg-[#151f2e] border-r-4 border-r-indigo-500' : ''}`}
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
                                        <span className="bg-indigo-600 text-white text-[10px] font-bold h-5 min-w-[20px] px-1 flex items-center justify-center rounded-full shadow-sm">
                                            {contact.unreadCount}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    {contactList.length === 0 && <div className="p-8 text-center text-slate-400">No contacts found</div>}
                </div>
            </div>

            {/* Chat Area */}
            {targetUserId ? (
                <div className="flex-1 flex flex-col bg-slate-100 dark:bg-[#080d14] relative">
                    <div className="absolute inset-0 opacity-5 dark:opacity-[0.02] pointer-events-none" style={{ backgroundImage: "url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')" }}></div>

                    {/* Header */}
                    <div className="p-3 bg-white dark:bg-[#0d1520] border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between shadow-sm z-10">
                        <div className="flex items-center gap-3">
                            <button onClick={() => navigate('/chat')} className="md:hidden p-2 text-slate-600 dark:text-slate-200"><ArrowLeft size={20} /></button>

                            {/* Clickable Profile Section */}
                            <div onClick={handleViewProfile} className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-[#151f2e] p-1 pr-4 rounded-lg transition">
                                <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-[#151f2e] flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold overflow-hidden border border-slate-200 dark:border-slate-800">
                                    {targetUser?.image ? <img src={targetUser.image} className="w-full h-full object-cover" /> : <UserIcon />}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 dark:text-slate-100 hover:underline">{targetUser?.username || "Loading..."}</h3>
                                    <p className="text-xs flex items-center gap-1 font-medium">
                                        {isTyping ? (
                                            <span className="text-indigo-500 font-bold animate-pulse">Typing...</span>
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
                                    <MessageSquare size={32} className="text-indigo-400" />
                                </div>
                                <p className="text-sm font-medium">No messages yet</p>
                                <p className="text-xs">Say &quot;Hi&quot; to start the conversation! 👋</p>
                            </div>
                        ) : (
                            messages.map((msg, index) => {
                                const isMe = msg.sender === (currentUser._id || currentUser.id);
                                return (
                                    <div key={index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`relative max-w-[70%] p-3 px-4 rounded-2xl shadow-sm text-sm ${isMe ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-tr-none' : 'bg-white dark:bg-[#151f2e] text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-150/80 dark:border-slate-800/65'}`}>

                                            {msg.messageType === 'audio' ? (
                                                <div className="flex items-center gap-2 min-w-[200px] py-1">
                                                    <audio controls src={msg.audioUrl} className="w-full h-8 animate-in" />
                                                </div>
                                            ) : (
                                                <p className="leading-relaxed pb-1">{msg.content}</p>
                                            )}

                                            <div className="flex items-center justify-end gap-1 mt-0.5 select-none">
                                                <span className={`text-[10px] min-w-[45px] text-right ${isMe ? 'text-indigo-200' : 'text-slate-400 dark:text-slate-500'}`}>
                                                    {formatTime(msg.timestamp)}
                                                </span>
                                                {isMe && (
                                                    <span>
                                                        {msg.read ? <CheckCheck size={14} className="text-indigo-200" /> : <Check size={14} className="text-indigo-300" />}
                                                    </span>
                                                )}
                                            </div>
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
                                className={`flex-1 border border-slate-200 dark:border-slate-850 rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-[#0d1520] bg-slate-50 dark:bg-[#151f2e] text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition ${isRecording ? 'opacity-50 cursor-not-allowed bg-red-50 dark:bg-red-900/10' : ''}`}
                            />
                            <button
                                onClick={newMessage.trim() ? sendMessage : (isRecording ? stopRecording : startRecording)}
                                className={`${isRecording ? 'bg-red-500 hover:bg-red-600 animate-pulse' : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700'} text-white p-3 rounded-full transition shadow-md active:scale-95 flex items-center justify-center`}
                            >
                                {newMessage.trim() ? <Send size={18} /> : (isRecording ? <StopCircle size={20} /> : <Mic size={20} />)}
                            </button>
                        </div>
                    </div>

                </div>
            ) : (
                <div className="hidden md:flex flex-1 flex-col items-center justify-center text-slate-400 dark:text-slate-500 bg-slate-50/50 dark:bg-[#080d14] border-l border-slate-200 dark:border-slate-800/80 border-b-[6px] border-b-indigo-500">
                    <div className="w-40 h-40 bg-slate-100 dark:bg-[#151f2e] rounded-full flex items-center justify-center mb-6 border border-slate-200 dark:border-slate-850 shadow-inner">
                        <MessageSquare size={64} className="opacity-20 text-indigo-500 dark:text-indigo-400" />
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
