import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast'; // Ensure react-hot-toast is installed
import { API_BASE_URL } from '../config';
import { Mail, ArrowRight, CheckCircle } from 'lucide-react';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await res.json();

            if (data.success) {
                setSent(true);
                toast.success("Reset link sent to your email!");
            } else {
                toast.error(data.message || "Something went wrong.");
            }
        } catch (error) {
            toast.error("Network Error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1A1A2E] via-[#16213E] to-[#0F3460] p-6">
            <div className="w-full max-w-md bg-white/10 backdrop-blur-lg border border-white/20 p-8 rounded-3xl shadow-2xl animate-fade-in-up">

                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-white mb-2">Recovery</h2>
                    <p className="text-blue-200 text-sm">Forgot your password? No worries.</p>
                </div>

                {!sent ? (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-blue-200 ml-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-12 py-3.5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3.5 rounded-xl font-bold text-lg shadow-lg hover:shadow-blue-500/30 transition transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? "Sending..." : <>Send Reset Link <ArrowRight size={20} /></>}
                        </button>
                    </form>
                ) : (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-green-400">
                            <CheckCircle size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Check your Email</h3>
                        <p className="text-gray-300">We've sent a password reset link to <b>{email}</b>.</p>
                    </div>
                )}

                <div className="mt-8 text-center">
                    <Link to="/login" className="text-sm text-gray-400 hover:text-white transition">Back to Login</Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
