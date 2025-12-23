import React, { useState, useEffect } from 'react';
import { Mail, Trash2, Loader2, CheckCircle, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../config';

const AdminMessagesPage = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMessages();
    }, []);

    const fetchMessages = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/contact`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await res.json();
            if (data.success) {
                setMessages(data.messages);
            } else {
                toast.error("Failed to load messages");
            }
        } catch (error) {
            console.error(error);
            toast.error("Server Error");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="h-screen flex items-center justify-center">
            <Loader2 className="animate-spin text-blue-600" size={48} />
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-blue-100 rounded-2xl text-blue-600">
                        <Mail size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Contact Messages</h1>
                        <p className="text-gray-500">View inquiries from the contact page</p>
                    </div>
                </div>

                <div className="grid gap-4">
                    {messages.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100">
                            <Mail className="mx-auto text-gray-300 mb-4" size={48} />
                            <h3 className="text-lg font-bold text-gray-700">No messages yet</h3>
                            <p className="text-gray-400">New inquiries will appear here.</p>
                        </div>
                    ) : (
                        messages.map((msg) => (
                            <div key={msg._id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition group">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-900">{msg.name}</h3>
                                        <a href={`mailto:${msg.email}`} className="text-blue-600 text-sm font-medium hover:underline">{msg.email}</a>
                                    </div>
                                    <span className="text-xs font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-full uppercase tracking-wide">
                                        {new Date(msg.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-gray-700 leading-relaxed whitespace-pre-wrap">
                                    {msg.message}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminMessagesPage;
