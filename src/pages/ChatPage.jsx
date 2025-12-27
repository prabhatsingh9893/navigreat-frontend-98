import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from "socket.io-client";
import { Send, User as UserIcon, MessageSquare, ArrowLeft } from 'lucide-react';
import { API_BASE_URL } from '../config';

// Initialize Socket outside component to avoid re-connections
// Note: API_BASE_URL usually ends with /api, we need root domain for socket
const SOCKET_URL = API_BASE_URL.replace('/api', '');
const socket = io(SOCKET_URL);

const ChatPage = () => {
    const { userId: targetUserId } = useParams();
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [currentUser, setCurrentUser] = useState(null);
    const [targetUser, setTargetUser] = useState(null);
    const [contactList, setContactList] = useState([]);
    const [isTyping, setIsTyping] = useState(false); // ⌨️
    const scrollRef = useRef();
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

        // Join my own room to receive messages
        const joinRoom = () => {
            console.log("Joined Room:", user._id || user.id);
            socket.emit("join_room", user._id || user.id);
        };

        if (socket.connected) joinRoom();
        socket.on("connect", joinRoom);

        // Fetch "Contacts"
        fetchContacts(user.role);

        return () => {
            socket.off("connect", joinRoom);
        };
    }, [navigate]);

    // 2. Fetch Target User Info & Messages
    useEffect(() => {
        if (!targetUserId || targetUserId === 'undefined' || !currentUser) return;

        // A. Fetch Target User Details
        fetch(`${API_BASE_URL}/mentors/${targetUserId}`) // Works for fetching basic user info too usually? Or need generic /users/:id route?
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

            // A. Update Messages Area (if open)
            if (isCurrentChat) {
                setMessages((prev) => [...prev, msg]);
                scrollToBottom();
                // If it's the current chat and I received it, assume read immediately in UI? 
                // Or let the next fetch handle it. For now, we don't increment badge if open.
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
                        // Increment badge if: 1. I am NOT sender AND 2. It is NOT the current open chat
                        unreadCount: (!isMe && targetUserId !== contact._id)
                            ? (contact.unreadCount || 0) + 1
                            : contact.unreadCount
                    };

                    // Remove current and move to top
                    newList.splice(index, 1);
                    newList.unshift(updatedContact);
                    return newList;
                } else {
                    // If contact not in list (New Conversation), we should ideally fetch it.
                    // For MVP, trigger a full re-fetch of contacts to be safe.
                    fetchContacts();
                    return prev;
                }
            });
        };

        socket.on("receive_message", handleReceiveMessage);

        // Typing Listeners
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

    const sendMessage = async () => {
        if (!newMessage.trim() || !targetUserId) return;

        const msgData = {
            sender: currentUser._id || currentUser.id,
            receiver: targetUserId,
            content: newMessage,
            timestamp: new Date()
        };

        // Emit Socket
        socket.emit("send_message", msgData);

        // Optimistic UI Update (Socket also sends back, but let's wait for safety or just append?)
        // Backend emits back to sender too in my code, so let's rely on that to avoid dupe.
        // Wait, strictly reliant on socket return might feel slow? 
        // My backend code: io.to(sender).emit... 
        // So it will come back via "receive_message".

        setNewMessage("");
    };

    const scrollToBottom = () => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Auto-scroll on new messages
    useEffect(() => {
        scrollToBottom();
    }, [messages]);


    return (
        <div className="flex h-[100dvh] bg-gray-100 pt-16">
            {/* Sidebar (Contacts) - Hidden on mobile if chatting */}
            <div className={`${targetUserId ? 'hidden md:flex' : 'flex'} w-full md:w-1/3 bg-white border-r border-gray-200 flex-col`}>
                <div className="p-4 border-b border-gray-100 bg-gray-50">
                    <h2 className="text-xl font-bold text-gray-800">Messages</h2>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {contactList.map(contact => (
                        <div
                            key={contact._id}
                            onClick={() => navigate(`/chat/${contact._id}`)}
                            className={`p-4 flex items-center gap-3 cursor-pointer hover:bg-blue-50 transition border-b border-gray-50 ${targetUserId === contact._id ? 'bg-blue-50 border-blue-200' : ''}`}
                        >
                            <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                                <img src={contact.image || `https://api.dicebear.com/7.x/initials/svg?seed=${contact.username}`} alt="avatar" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline mb-0.5">
                                    <h3 className="font-bold text-gray-800 text-sm truncate">{contact.username}</h3>
                                    {contact.lastMessageTime && (
                                        <span className="text-[10px] text-gray-400 flex-shrink-0">
                                            {new Date(contact.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    )}
                                </div>
                                <div className="flex justify-between items-center">
                                    <p className="text-xs text-gray-500 truncate">
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
                <div className="flex-1 flex flex-col bg-[#F3F4F6]">

                    {/* Header */}
                    <div className="p-4 bg-white border-b border-gray-200 flex items-center gap-3 shadow-sm z-10">
                        <button onClick={() => navigate('/chat')} className="md:hidden p-2 text-gray-600"><ArrowLeft size={20} /></button>
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold overflow-hidden">
                            {targetUser?.image ? <img src={targetUser.image} className="w-full h-full object-cover" /> : <UserIcon />}
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">{targetUser?.username || "Loading..."}</h3>
                            <p className="text-xs text-green-500 flex items-center gap-1">
                                {isTyping ? <span className="text-blue-500 font-bold animate-pulse">Typing...</span> : "● Online"}
                            </p>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map((msg, index) => {
                            const isMe = msg.sender === (currentUser._id || currentUser.id);
                            return (
                                <div key={index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[70%] p-3 rounded-2xl shadow-sm text-sm ${isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white text-gray-800 rounded-bl-none border border-gray-200'}`}>
                                        <p>{msg.content}</p>
                                        <div className={`text-[10px] mt-1 text-right ${isMe ? 'text-blue-200' : 'text-gray-400'}`}>
                                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={scrollRef}></div>
                    </div>

                    {/* Input */}
                    <div className="p-4 bg-white border-t border-gray-200">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => {
                                    setNewMessage(e.target.value);
                                    // Emit Typing
                                    socket.emit("typing", targetUserId);
                                    if (typingTimeout) clearTimeout(typingTimeout);
                                    typingTimeout = setTimeout(() => socket.emit("stop_typing", targetUserId), 2000);
                                }}
                                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                                placeholder="Type a message..."
                                className="flex-1 border border-gray-300 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                            />
                            <button
                                onClick={sendMessage}
                                className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 transition shadow-md active:scale-95"
                            >
                                <Send size={20} />
                            </button>
                        </div>
                    </div>

                </div>
            ) : (
                <div className="hidden md:flex flex-1 flex-col items-center justify-center text-gray-400 bg-gray-50">
                    <MessageSquare size={64} className="mb-4 opacity-20" />
                    <p className="text-lg font-medium">Select a user to start chatting</p>
                </div>
            )}
        </div>
    );
};

export default ChatPage;
