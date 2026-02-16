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
    reconnectionAttempts: 5,
    reconnectionDelay: 3000,
    transports: ["websocket", "polling"]
});

const ChatPage = () => {
    const { userId: targetUserId } = useParams();
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [currentUser, setCurrentUser] = useState(null);
    const [targetUser, setTargetUser] = useState(null);
    const [contactList, setContactList] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState(new Set()); // ✅ Track Online Users

    // 🎙️ Voice Recording State
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    const scrollRef = useRef();
    const notificationSound = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3')); // Beep Sound
    let typingTimeout = null;

    // 1. Auth Check & Setup
    useEffect(() => {
        const userData = localStorage.getItem('userData');
        if (!userData) {
            navigate('/login');
            return;
        }
        const user = JSON.parse(userData);
        setCurrentUser(user);

        const registerUser = () => {
            console.log("Registering Online:", user._id || user.id);
            socket.emit("register_user", user._id || user.id); // ✅ Emit register_user
        };

        if (socket.connected) registerUser();
        socket.on("connect", registerUser);

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

        fetchContacts(user.role);

        return () => {
            socket.off("connect", registerUser);
            socket.off("get_online_users");
            socket.off("user_online");
            socket.off("user_offline");
        };
    }, [navigate]);

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
                notificationSound.current.play().catch(e => console.log("Audio play failed"));
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

    // 4. Utils
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
        const msgData = {
            sender: currentUser._id || currentUser.id,
            receiver: targetUserId,
            content: newMessage,
            timestamp: new Date()
        };
        socket.emit("send_message", msgData);
        setNewMessage("");
    };

    const scrollToBottom = () => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
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
        <div className="flex h-[calc(100vh-64px)] mt-16 bg-gray-100 dark:bg-[#111b21]">
            {/* Sidebar */}
            <div className={`${targetUserId ? 'hidden md:flex' : 'flex'} w-full md:w-1/3 bg-white dark:bg-[#111b21] border-r border-gray-200 dark:border-[#2a3942] flex-col`}>
                <div className="p-4 border-b border-gray-100 dark:border-[#2a3942] bg-gray-50 dark:bg-[#202c33] flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-[#e9edef]">Messages</h2>
                    <span className="text-xs bg-blue-100 dark:bg-[#2a3942] text-blue-600 dark:text-[#00a884] px-2 py-1 rounded-full">{contactList.length} Contacts</span>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {contactList.map(contact => (
                        <div
                            key={contact._id}
                            onClick={() => navigate(`/chat/${contact._id}`)}
                            className={`p-4 flex items-center gap-3 cursor-pointer hover:bg-blue-50 dark:hover:bg-[#202c33] transition border-b border-gray-50 dark:border-[#2a3942] ${targetUserId === contact._id ? 'bg-blue-50 dark:bg-[#2a3942] border-blue-200 dark:border-[#2a3942]' : ''}`}
                        >
                            <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-[#2a3942] overflow-hidden flex-shrink-0 border border-gray-200 dark:border-[#2a3942] relative">
                                <img src={contact.image || `https://api.dicebear.com/7.x/initials/svg?seed=${contact.username}`} alt="avatar" className="w-full h-full object-cover" />
                                {onlineUsers.has(contact._id) && (
                                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-[#111b21] rounded-full"></span>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline mb-0.5">
                                    <h3 className="font-bold text-gray-800 dark:text-[#e9edef] text-sm truncate">{contact.username}</h3>
                                    {contact.lastMessageTime && (
                                        <span className="text-[10px] text-gray-400 dark:text-[#8696a0] flex-shrink-0">
                                            {formatTime(contact.lastMessageTime)}
                                        </span>
                                    )}
                                </div>
                                <div className="flex justify-between items-center">
                                    <p className="text-xs text-gray-500 dark:text-[#8696a0] truncate w-3/4">
                                        {contact.lastMessage || (contact.college ? contact.college : "Tap to chat")}
                                    </p>
                                    {contact.unreadCount > 0 && (
                                        <span className="bg-green-500 text-white text-[10px] font-bold h-5 min-w-[20px] px-1 flex items-center justify-center rounded-full shadow-sm">
                                            {contact.unreadCount}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    {contactList.length === 0 && <div className="p-8 text-center text-gray-400">No contacts found</div>}
                </div>
            </div>

            {/* Chat Area */}
            {targetUserId ? (
                <div className="flex-1 flex flex-col bg-[#e5ddd5] dark:bg-[#0b141a] relative"> {/* WhatsApp-like bg color */}
                    <div className="absolute inset-0 opacity-10 dark:opacity-5 pointer-events-none" style={{ backgroundImage: "url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')" }}></div>

                    {/* Header */}
                    <div className="p-3 bg-white dark:bg-[#202c33] border-b border-gray-200 dark:border-[#2a3942] flex items-center gap-3 shadow-sm z-10">
                        <button onClick={() => navigate('/chat')} className="md:hidden p-2 text-gray-600 dark:text-[#e9edef]"><ArrowLeft size={20} /></button>

                        {/* Clickable Profile Section */}
                        <div onClick={handleViewProfile} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#2a3942] p-1 pr-4 rounded-lg transition">
                            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-[#2a3942] flex items-center justify-center text-blue-600 dark:text-[#00a884] font-bold overflow-hidden border border-gray-200 dark:border-[#2a3942]">
                                {targetUser?.image ? <img src={targetUser.image} className="w-full h-full object-cover" /> : <UserIcon />}
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-[#e9edef] hover:underline">{targetUser?.username || "Loading..."}</h3>
                                <p className="text-xs flex items-center gap-1 font-medium">
                                    {isTyping ? (
                                        <span className="text-blue-500 font-bold animate-pulse">Typing...</span>
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

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-2 z-10 custom-scrollbar">
                        {messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-500 opacity-80">
                                <div className="bg-white/50 p-4 rounded-full mb-3">
                                    <MessageSquare size={32} className="text-blue-400" />
                                </div>
                                <p className="text-sm font-medium">No messages yet</p>
                                <p className="text-xs">Say "Hi" to start the conversation! 👋</p>
                            </div>
                        ) : (
                            messages.map((msg, index) => {
                                const isMe = msg.sender === (currentUser._id || currentUser.id);
                                return (
                                    <div key={index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`relative max-w-[70%] p-2 px-3 rounded-lg shadow-sm text-sm ${isMe ? 'bg-[#dcf8c6] dark:bg-[#005c4b] text-gray-800 dark:text-[#e9edef]' : 'bg-white dark:bg-[#202c33] text-gray-800 dark:text-[#e9edef]'}`}>

                                            {msg.messageType === 'audio' ? (
                                                <div className="flex items-center gap-2 min-w-[200px] py-1">
                                                    <audio controls src={msg.audioUrl} className="w-full h-8" />
                                                </div>
                                            ) : (
                                                <p className="leading-relaxed pb-1">{msg.content}</p>
                                            )}

                                            <div className="flex items-center justify-end gap-1 mt-0.5 select-none">
                                                <span className="text-[10px] text-gray-500 dark:text-[#8696a0] min-w-[45px] text-right">
                                                    {formatTime(msg.timestamp)}
                                                </span>
                                                {isMe && (
                                                    <span>
                                                        {msg.read ? <CheckCheck size={14} className="text-blue-500 dark:text-[#53bdeb]" /> : <Check size={14} className="text-gray-400 dark:text-[#8696a0]" />}
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
                    <div className="p-3 bg-white dark:bg-[#202c33] border-t border-gray-200 dark:border-[#2a3942] z-10">
                        <div className="flex gap-2 items-center">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => {
                                    setNewMessage(e.target.value);
                                    socket.emit("typing", targetUserId);
                                    if (typingTimeout) clearTimeout(typingTimeout);
                                    typingTimeout = setTimeout(() => socket.emit("stop_typing", targetUserId), 2000);
                                }}
                                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                                placeholder={isRecording ? "Recording audio..." : "Type a message..."}
                                disabled={isRecording}
                                className={`flex-1 border border-gray-300 dark:border-[#2a3942] rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#00a884] bg-gray-50 dark:bg-[#2a3942] dark:text-[#e9edef] placeholder-gray-400 dark:placeholder-[#8696a0] ${isRecording ? 'opacity-50 cursor-not-allowed bg-red-50 dark:bg-red-900/10' : ''}`}
                            />
                            <button
                                onClick={newMessage.trim() ? sendMessage : (isRecording ? stopRecording : startRecording)}
                                className={`${isRecording ? 'bg-red-500 hover:bg-red-600 animate-pulse' : 'bg-blue-600 hover:bg-blue-700'} text-white p-3 rounded-full transition shadow-md active:scale-95 flex items-center justify-center`}
                            >
                                {newMessage.trim() ? <Send size={18} /> : (isRecording ? <StopCircle size={20} /> : <Mic size={20} />)}
                            </button>
                        </div>
                    </div>

                </div>
            ) : (
                <div className="hidden md:flex flex-1 flex-col items-center justify-center text-gray-400 dark:text-[#8696a0] bg-gray-50 dark:bg-[#202c33] border-l border-gray-200 dark:border-[#2a3942] border-b-[6px] border-b-[#00a884]">
                    <div className="w-40 h-40 bg-gray-100 dark:bg-[#2a3942] rounded-full flex items-center justify-center mb-6">
                        <MessageSquare size={64} className="opacity-20 text-gray-500 dark:text-[#8696a0]" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-700 dark:text-[#e9edef]">Welcome to Chat</h2>
                    <p className="mt-2 text-gray-500 dark:text-[#8696a0]">Select a contact to start messaging.</p>
                </div>
            )}
        </div>
    );
};

export default ChatPage;
