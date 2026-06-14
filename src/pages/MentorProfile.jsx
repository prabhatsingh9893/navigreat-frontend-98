import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    CheckCircle, Video, Share2, MessageSquare, Zap,
    Briefcase, Calendar, Clock, Radio, MapPin,
    ExternalLink, ArrowLeft, User as UserIcon, X
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../config';

const getYouTubeID = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

const MentorProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [mentor, setMentor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isLiveNow, setIsLiveNow] = useState(false);
    const [sessions, setSessions] = useState([]);
    const [lectures, setLectures] = useState([]);

    // 💳 Paytm Payment Integration States
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [bookingMessage, setBookingMessage] = useState("I am interested in mentorship.");
    const [isPaytmMockModalOpen, setIsPaytmMockModalOpen] = useState(false);
    const [mockOrderDetails, setMockOrderDetails] = useState(null);
    const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);

    // --- 1. FETCH DATA (Mentor + Sessions) - SAFE MODE ---
    useEffect(() => {
        const fetchData = async () => {
            try {
                if (!id) return;

                // A. Fetch Mentor Profile
                const mRes = await fetch(`${API_BASE_URL}/mentors/${id}`);

                if (!mRes.ok) {
                    console.error("Mentor fetch failed with status:", mRes.status);
                    setLoading(false);
                    return;
                }

                const mData = await mRes.json();
                if (mData.success) setMentor(mData.mentor || mData.user);

                // B. Fetch Real Sessions
                try {
                    const sRes = await fetch(`${API_BASE_URL}/sessions/${id}`);
                    if (sRes.ok) {
                        const sData = await sRes.json();
                        if (sData.success && Array.isArray(sData.sessions)) {
                            const formattedSessions = sData.sessions.map(session => ({
                                ...session,
                                startTime: new Date(session.startTime),
                                endTime: new Date(session.endTime)
                            }));
                            setSessions(formattedSessions);
                        }
                    } else {
                        console.warn(`Sessions API endpoint not found (Status: ${sRes.status}). Showing empty schedule.`);
                        setSessions([]);
                    }

                    // C. Fetch Lectures
                    const lRes = await fetch(`${API_BASE_URL}/lectures/${id}`);
                    if (lRes.ok) {
                        const lData = await lRes.json();
                        if (lData.success) setLectures(lData.lectures || []);
                    }

                } catch (sessionErr) {
                    console.error("Error parsing session data:", sessionErr);
                    setSessions([]);
                }

            } catch (err) {
                console.error("Global Fetch Error:", err);
                toast.error("Failed to load profile data");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    // --- 2. Live Check ---
    useEffect(() => {
        const checkLiveStatus = () => {
            if (sessions.length === 0) return;
            const now = new Date();
            const foundLiveSession = sessions.find(session => {
                const start = new Date(session.startTime);
                const end = new Date(session.endTime);
                const startBuffer = 15 * 60 * 1000; // Allow joining 15 mins early
                const endBuffer = 60 * 60 * 1000; // Allow joining up to 60 mins late (overrun)
                const bufferStart = new Date(start.getTime() - startBuffer);
                const bufferEnd = new Date(end.getTime() + endBuffer);
                return now >= bufferStart && now <= bufferEnd;
            });
            setIsLiveNow(!!foundLiveSession);
        };
        checkLiveStatus();
        const intervalId = setInterval(checkLiveStatus, 1000);
        return () => clearInterval(intervalId);
    }, [sessions]);

    useEffect(() => {
        if (isLiveNow) {
            toast.success("🔴 Class is LIVE! Join now.", { id: 'live-toast' });
        }
    }, [isLiveNow]);


    // --- HANDLERS ---
    const handleOpenBookingModal = () => {
        const token = localStorage.getItem('token');
        if (!token) {
            toast.error("Please login to book a session!");
            navigate('/login');
            return;
        }
        setIsBookingModalOpen(true);
    };

    const handleInitiatePayment = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            toast.error("Session expired. Please login again.");
            navigate('/login');
            return;
        }

        setIsPaymentProcessing(true);
        const loadingToast = toast.loading("Initiating Paytm checkout...");

        try {
            const res = await fetch(`${API_BASE_URL}/payment/initiate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    mentorId: mentor._id || mentor.id,
                    message: bookingMessage
                })
            });

            const data = await res.json();
            toast.dismiss(loadingToast);

            if (!res.ok || !data.success) {
                toast.error(data.message || "Payment initiation failed");
                setIsPaymentProcessing(false);
                return;
            }

            setIsBookingModalOpen(false);

            if (data.isMock) {
                setMockOrderDetails({
                    orderId: data.orderId,
                    amount: data.amount,
                    callbackUrl: data.callbackUrl
                });
                setIsPaytmMockModalOpen(true);
                setIsPaymentProcessing(false);
            } else {
                const { txnToken, orderId, amount, mid, paytmEnv } = data;
                
                const scriptUrl = paytmEnv === 'production' 
                    ? `https://securegw.paytm.in/merchantpgpui/checkoutjs/merchants/${mid}.js`
                    : `https://securegw-stage.paytm.in/merchantpgpui/checkoutjs/merchants/${mid}.js`;

                const loadScript = () => {
                    return new Promise((resolve) => {
                        const script = document.createElement('script');
                        script.src = scriptUrl;
                        script.onload = () => resolve(true);
                        script.onerror = () => resolve(false);
                        document.body.appendChild(script);
                    });
                };

                const scriptLoaded = await loadScript();
                if (!scriptLoaded || !window.Paytm) {
                    toast.error("Failed to load Paytm SDK");
                    setIsPaymentProcessing(false);
                    return;
                }

                const config = {
                    root: "",
                    flow: "DEFAULT",
                    data: {
                        orderId: orderId,
                        token: txnToken,
                        tokenType: "TXN_TOKEN",
                        amount: amount
                    },
                    handler: {
                        notifyMerchant: function(eventName, data) {
                            console.log("notifyMerchant handler", eventName, data);
                        }
                    }
                };

                if (window.Paytm.CheckoutJS) {
                    window.Paytm.CheckoutJS.init(config).then(function() {
                        window.Paytm.CheckoutJS.invoke();
                    }).catch(err => {
                        console.error("Paytm init failed:", err);
                        toast.error("Paytm checkout failed to load");
                    });
                }
                setIsPaymentProcessing(false);
            }
        } catch (err) {
            toast.dismiss(loadingToast);
            console.error("Payment initiation error:", err);
            toast.error("Network Error: Could not connect to payment service");
            setIsPaymentProcessing(false);
        }
    };

    const handleMockPaymentAction = async (status) => {
        const token = localStorage.getItem('token');
        if (!mockOrderDetails) return;

        setIsPaymentProcessing(true);
        const paymentToast = toast.loading(status === 'SUCCESS' ? "Processing payment transaction..." : "Cancelling payment...");

        try {
            const res = await fetch(`${API_BASE_URL}/payment/mock-callback`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    orderId: mockOrderDetails.orderId,
                    status: status
                })
            });

            const data = await res.json();
            toast.dismiss(paymentToast);

            if (res.ok && data.success) {
                setIsPaytmMockModalOpen(false);
                if (status === 'SUCCESS') {
                    toast.success("🎉 Session Booked Successfully! Payment Confirmed.");
                    navigate('/dashboard?payment=success');
                } else {
                    toast.error("❌ Payment Cancelled or Failed.");
                    navigate('/dashboard?payment=failed');
                }
            } else {
                toast.error(data.message || "Failed to process payment status");
            }
        } catch (err) {
            toast.dismiss(paymentToast);
            console.error("Mock payment status error:", err);
            toast.error("Network error updating booking status");
        } finally {
            setIsPaymentProcessing(false);
        }
    };

    const handleJoinClass = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            toast.error("Please login to join the live class!");
            navigate('/login');
            return;
        }

        const loadingToast = toast.loading("Verifying session authorization...");
        try {
            const res = await fetch(`${API_BASE_URL}/sessions/join/${mentor._id || mentor.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            toast.dismiss(loadingToast);

            if (data.success && data.meetingId && data.passcode) {
                navigate('/session', {
                    state: {
                        meetingNumber: data.meetingId,
                        passWord: data.passcode,
                        mentorId: mentor._id || mentor.id
                    }
                });
                toast.success("Joining Live Class...");
            } else {
                toast.error(data.message || "Failed to retrieve meeting details.");
            }
        } catch (err) {
            toast.dismiss(loadingToast);
            console.error("Join Class Error:", err);
            toast.error("Network Error: Could not connect to join session.");
        }
    };

    if (loading) return <div className="h-screen flex items-center justify-center font-bold text-gray-500 animate-pulse">Loading Profile...</div>;
    if (!mentor) return <div className="text-center py-20 text-red-500 font-bold">Mentor Not Found</div>;

    return (
        <div className="bg-slate-50 dark:bg-[#080d14] min-h-screen relative font-sans transition-colors duration-300">

            {/* Header / Cover */}
            <div className="h-96 relative bg-mesh-light dark:bg-mesh-hero noise-overlay overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-slate-50/40 to-transparent dark:from-[#080d14] dark:via-[#080d14]/40"></div>

                <div className="absolute top-8 left-8 z-30">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-700 dark:text-white/80 hover:text-indigo-600 dark:hover:text-white transition font-semibold bg-white/40 dark:bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-slate-200 dark:border-white/10 hover:bg-white/60 dark:hover:bg-white/20 shadow-sm">
                        <ArrowLeft size={18} /> {mentor?.role === 'mentor' ? 'Back to Mentors' : 'Back'}
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-40 relative z-10 pb-20">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* === LEFT SIDEBAR === */}
                    <div className="lg:col-span-4 flex flex-col">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="bg-white dark:bg-[#0d1520] rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-black/60 p-6 border border-slate-150/80 dark:border-slate-800/80 relative overflow-hidden"
                        >
                            {/* LIVE Indicator */}
                            {isLiveNow && (
                                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-500 to-pink-500 animate-pulse"></div>
                            )}

                            <div className="flex flex-col items-center text-center">
                                {/* Image Ring */}
                                <div className="relative w-40 h-40 mb-5 z-20 cursor-pointer" onClick={isLiveNow ? handleJoinClass : null}>
                                    <div className={`p-1.5 rounded-full h-full w-full bg-white dark:bg-[#0d1520] ${isLiveNow ? 'ring-4 ring-red-500 ring-offset-4 ring-offset-white dark:ring-offset-[#0d1520] animate-pulse' : 'ring-1 ring-slate-100 dark:ring-slate-800 shadow-lg'}`}>
                                        <img
                                            src={mentor.image || `https://api.dicebear.com/7.x/initials/svg?seed=${mentor.username}&size=512`}
                                            alt={mentor.username}
                                            className="w-full h-full rounded-full object-cover"
                                        />
                                    </div>
                                    {isLiveNow ? (
                                        <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-3 py-1 rounded-full text-[10px] font-bold border-4 border-white dark:border-[#0d1520] tracking-widest shadow-lg animate-bounce uppercase">LIVE NOW</div>
                                    ) : (
                                        <div className="absolute bottom-2 right-2 bg-indigo-500 text-white p-1.5 rounded-full border-4 border-white dark:border-[#0d1520] shadow-md"><CheckCircle size={16} fill="currentColor" /></div>
                                    )}
                                </div>

                                <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white capitalize mb-2">{mentor.username}</h1>

                                <div className="flex items-center justify-center gap-2 mb-6">
                                    <span className="px-3 py-1 rounded-full bg-indigo-50/80 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 text-xs font-bold border border-indigo-100/80 dark:border-indigo-900/30 flex items-center gap-1">
                                        <Briefcase size={12} /> {mentor.role || "Mentor"}
                                    </span>
                                    <span className="px-3 py-1 rounded-full bg-violet-50/80 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 text-xs font-bold border border-violet-100/80 dark:border-violet-900/30 flex items-center gap-1">
                                        <MapPin size={12} /> {mentor.college?.split(',')[0]}
                                    </span>
                                </div>

                                <div className="w-full space-y-3">
                                    {isLiveNow ? (
                                        <button onClick={handleJoinClass} className="w-full bg-red-600 text-white py-4 rounded-xl font-bold hover:bg-red-700 shadow-lg shadow-red-200 flex items-center justify-center gap-2 animate-pulse relative overflow-hidden group">
                                            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                                            <Radio size={20} className="animate-ping absolute inline-flex opacity-75" />
                                            <Radio size={20} className="relative inline-flex" /> JOIN LIVE CLASS
                                        </button>
                                    ) : (
                                        <>
                                            {/* Show Next Session Info if available - Only for Mentors */}
                                            {mentor.role === 'mentor' && sessions.filter(s => new Date(s.startTime) > new Date()).sort((a, b) => new Date(a.startTime) - new Date(b.startTime))[0] && (
                                                <div className="w-full bg-slate-50 dark:bg-[#151f2e] border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex flex-col items-center justify-center gap-1 mb-2">
                                                    <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                                                        <Calendar size={12} /> Next Session
                                                    </div>
                                                    <div className="text-xl font-bold text-slate-800 dark:text-slate-100">
                                                        {new Date(sessions.filter(s => new Date(s.startTime) > new Date()).sort((a, b) => new Date(a.startTime) - new Date(b.startTime))[0].startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                    <div className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                                                        {new Date(sessions.filter(s => new Date(s.startTime) > new Date()).sort((a, b) => new Date(a.startTime) - new Date(b.startTime))[0].startTime).toLocaleDateString([], { month: 'long', day: 'numeric', weekday: 'short' })}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Always show Book Session Button - Only for Mentors */}
                                            {mentor.role === 'mentor' && (
                                                <button onClick={handleOpenBookingModal} className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white py-4 rounded-xl font-bold hover:from-indigo-700 hover:to-violet-700 transition-all duration-300 shadow-lg shadow-indigo-500/20 hover:-translate-y-0.5 active:scale-[0.98] flex items-center justify-center gap-2 group">
                                                    <Zap size={18} className="text-yellow-300 fill-yellow-300 group-hover:scale-110 transition" /> Book Priority Session
                                                </button>
                                            )}
                                        </>
                                    )}
                                    <button onClick={() => navigate(`/chat/${mentor._id}`)} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 py-3.5 rounded-xl font-bold hover:border-indigo-500 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-300 hover:-translate-y-0.5 flex items-center justify-center gap-2 shadow-sm">
                                        <MessageSquare size={18} /> Chat with Mentor
                                    </button>
                                    <button onClick={() => {
                                        navigator.clipboard.writeText(window.location.href);
                                        toast.success("Profile link copied to clipboard!");
                                    }} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 py-3.5 rounded-xl font-bold hover:border-violet-500 dark:hover:border-violet-500 hover:text-violet-600 dark:hover:text-violet-400 transition-all duration-300 hover:-translate-y-0.5 flex items-center justify-center gap-2 shadow-sm">
                                        <Share2 size={18} /> Share Profile
                                    </button>
                                </div>
                            </div>
                        </motion.div>

                        {/* Quick Stats - Only for Mentors */}
                        {mentor.role === 'mentor' && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2, duration: 0.5 }}
                                className="mt-6 grid grid-cols-3 gap-4"
                            >
                                <div className="bg-white dark:bg-[#0d1520] p-4 rounded-2xl border border-slate-150/80 dark:border-slate-800/80 shadow-sm text-center flex flex-col justify-center items-center">
                                    <div className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">{lectures.length}</div>
                                    <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-1">Lectures</div>
                                </div>
                                <div className="bg-white dark:bg-[#0d1520] p-4 rounded-2xl border border-slate-150/80 dark:border-slate-800/80 shadow-sm text-center flex flex-col justify-center items-center">
                                    <div className="text-2xl font-extrabold text-violet-600 dark:text-violet-400">4.9</div>
                                    <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-1">Rating</div>
                                </div>
                                <div className="bg-white dark:bg-[#0d1520] p-4 rounded-2xl border border-slate-150/80 dark:border-slate-800/80 shadow-sm text-center flex flex-col justify-center items-center">
                                    <div className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400">₹{mentor.sessionFee || 500}</div>
                                    <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-1.5">Fee</div>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* === RIGHT CONTENT === */}
                    <div className="lg:col-span-8">
                        {/* Live Banner Mobile */}
                        {isLiveNow && (
                            <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl p-1 mb-6 shadow-xl shadow-red-200 animate-in slide-in-from-top-4 duration-500 lg:hidden">
                                <div className="bg-white dark:bg-[#202c33] rounded-xl p-4 flex flex-row items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-red-50 dark:bg-red-900/30 p-2.5 rounded-full text-red-600 dark:text-red-400 animate-pulse"><Video size={20} /></div>
                                        <div><h3 className="font-bold text-gray-900 dark:text-white text-sm">Live Session Active!</h3></div>
                                    </div>
                                    <button onClick={handleJoinClass} className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md">Join</button>
                                </div>
                            </div>
                        )}

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5 }}
                            className="bg-white dark:bg-[#0d1520] rounded-3xl shadow-sm border border-slate-150/80 dark:border-slate-800/80 overflow-hidden min-h-[600px]"
                        >
                            <div className="p-8">
                                <div className="flex flex-col space-y-8">

                                    {/* About Section */}
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-indigo-600 dark:text-indigo-400"><UserIcon size={20} /></div>
                                            About Me
                                        </h3>
                                        <div className="bg-slate-50/50 dark:bg-[#151f2e]/30 p-6 rounded-2xl border border-slate-150/80 dark:border-slate-800/80">
                                            <p className="text-slate-600 dark:text-slate-300 leading-8 text-lg whitespace-pre-wrap font-medium">
                                                {mentor.about || "No bio added yet."}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Schedule Section */}
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                            <div className="p-2 bg-violet-50 dark:bg-violet-900/20 rounded-lg text-violet-600 dark:text-violet-400"><Calendar size={20} /></div>
                                            Upcoming Schedule
                                        </h3>

                                        <div className="relative">
                                            {/* Timeline Line */}
                                            <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-slate-150 dark:bg-slate-800"></div>

                                            {sessions.filter(s => new Date(s.endTime) > new Date()).length === 0 ? (
                                                <div className="text-center py-10 bg-slate-50 dark:bg-[#151f2e]/20 rounded-2xl border border-dashed border-slate-200 dark:border-slate-850">
                                                    <p className="text-slate-400 font-medium">No upcoming sessions scheduled.</p>
                                                </div>
                                            ) : (
                                                <div className="space-y-4">
                                                    {sessions.filter(s => new Date(s.endTime) > new Date()).map((session) => {
                                                        const now = new Date();
                                                        const start = new Date(session.startTime);
                                                        const end = new Date(session.endTime);
                                                        const timeString = start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                                        const dateString = start.toLocaleDateString([], { month: 'short', day: 'numeric' });

                                                        const startBuffer = 5 * 60 * 1000;
                                                        const endBuffer = 10 * 60 * 1000;
                                                        const isSessionLive = now >= new Date(start.getTime() - startBuffer) && now <= new Date(end.getTime() + endBuffer);

                                                        return (
                                                            <div key={session._id || session.id} className={`relative pl-12 transition-all hover:pl-14 duration-300 group`}>
                                                                {/* Timeline Dot */}
                                                                <div className={`absolute left-[11px] top-6 w-3 h-3 rounded-full border-2 border-white dark:border-[#0d1520] shadow-sm z-10 ${isSessionLive ? 'bg-red-500 animate-pulse ring-4 ring-red-100 dark:ring-red-950' : 'bg-indigo-500 dark:bg-indigo-400'}`}></div>

                                                                <div className={`bg-white dark:bg-[#151f2e]/40 p-5 rounded-2xl border ${isSessionLive ? 'border-red-200 dark:border-red-900/50 shadow-red-100 dark:shadow-red-900/20 ring-1 ring-red-100 dark:ring-red-900/30' : 'border-slate-150/80 dark:border-slate-800/85 hover:border-indigo-300 dark:hover:border-indigo-800'} shadow-sm transition-all group-hover:shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
                                                                    <div>
                                                                        <h4 className="font-bold text-slate-800 dark:text-[#e2e8f0] text-lg mb-1">{session.title}</h4>
                                                                        <div className="flex items-center gap-3 text-sm">
                                                                            <span className={`font-bold ${isSessionLive ? 'text-red-600 dark:text-red-400' : 'text-slate-500 dark:text-[#8696a0]'}`}>
                                                                                {isSessionLive ? '🔴 HAPPENING NOW' : dateString}
                                                                            </span>
                                                                            {!isSessionLive && <span className="w-1 h-1 bg-slate-300 dark:bg-slate-700 rounded-full"></span>}
                                                                            {!isSessionLive && <span className="text-slate-400 dark:text-slate-500 font-medium">{timeString}</span>}
                                                                        </div>
                                                                    </div>
                                                                    {isSessionLive && (
                                                                        <button onClick={handleJoinClass} className="bg-red-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-red-700 shadow-lg shadow-red-200 transition whitespace-nowrap">
                                                                            Join Now
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Lectures Section */}
                                    {lectures.length > 0 && (
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                                <div className="p-2 bg-orange-50 dark:bg-orange-900/30 rounded-lg text-orange-600 dark:text-orange-400"><Video size={20} /></div>
                                                Recorded Sessions
                                            </h3>
                                            <div className="grid md:grid-cols-2 gap-6">
                                                {lectures.map((lecture) => {
                                                    const videoId = getYouTubeID(lecture.url);
                                                    return (
                                                        <div key={lecture._id} className="bg-white dark:bg-[#151f2e]/40 rounded-2xl shadow-sm border border-slate-150/80 dark:border-slate-800/80 overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                                            {videoId ? (
                                                                <div className="relative aspect-video bg-black/5 group-hover:bg-black/0 transition">
                                                                    <iframe
                                                                        width="100%"
                                                                        height="100%"
                                                                        src={`https://www.youtube.com/embed/${videoId}`}
                                                                        title={lecture.title}
                                                                        frameBorder="0"
                                                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                                        allowFullScreen
                                                                        className="absolute inset-0 pointer-events-none group-hover:pointer-events-auto"
                                                                    ></iframe>
                                                                </div>
                                                            ) : (
                                                                <div className="h-40 bg-slate-50 dark:bg-[#151f2e]/20 flex items-center justify-center text-slate-400 font-medium">
                                                                    Video Unavailable
                                                                </div>
                                                            )}
                                                            <div className="p-4">
                                                                <h4 className="font-bold text-slate-800 dark:text-[#e2e8f0] leading-snug line-clamp-2 mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">{lecture.title}</h4>
                                                                <a href={lecture.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-bold text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 uppercase tracking-wide transition">
                                                                    <ExternalLink size={12} /> Watch on YouTube
                                                                </a>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
                  {/* ================= BOOKING MODAL ================= */}
            {isBookingModalOpen && (
                <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white dark:bg-[#0d1520] dark:text-slate-200 rounded-3xl w-full max-w-lg shadow-2xl p-6 flex flex-col max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200 border border-slate-150/80 dark:border-slate-800/80">
                        <div className="flex justify-between items-center mb-6 border-b border-slate-150 dark:border-slate-800 pb-4">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <Zap className="text-yellow-500 fill-yellow-500" size={20} />
                                Confirm Priority Booking
                            </h3>
                            <button onClick={() => setIsBookingModalOpen(false)} className="hover:bg-gray-100 dark:hover:bg-slate-800 p-2 rounded-full"><X size={20} /></button>
                        </div>

                        <div className="space-y-4 mb-6">
                            <div className="bg-indigo-50 dark:bg-indigo-950/40 p-4 rounded-2xl flex items-center justify-between border border-indigo-100 dark:border-indigo-900/40">
                                <div>
                                    <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider">Mentorship Fee</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-semibold">Priority Booking with {mentor.username}</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">₹{mentor.sessionFee || 500}</span>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 block">Attach Message for Mentor</label>
                                <textarea 
                                    value={bookingMessage} 
                                    onChange={e => setBookingMessage(e.target.value)} 
                                    className="w-full border border-slate-200 dark:border-slate-850 dark:bg-[#151f2e] dark:text-white p-3.5 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-sm transition" 
                                    rows="4" 
                                    placeholder="Write a message detailing what you want to learn or discuss..." 
                                />
                            </div>

                            <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 font-semibold bg-slate-50 dark:bg-slate-900/20 p-3.5 rounded-xl border border-slate-150/80 dark:border-slate-800/80">
                                <CheckCircle className="text-indigo-500 flex-shrink-0" size={16} />
                                <span>Secure Payment via Paytm Checkout. Confirmation will reflect in your dashboard.</span>
                            </div>
                        </div>

                        <button 
                            onClick={handleInitiatePayment} 
                            disabled={isPaymentProcessing}
                            className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white py-4 rounded-xl font-bold hover:from-indigo-700 hover:to-violet-700 shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 transition hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-75 disabled:pointer-events-none"
                        >
                            {isPaymentProcessing ? "Initializing Checkout..." : `Pay ₹${mentor.sessionFee || 500} & Confirm Booking`}
                        </button>
                    </div>
                </div>
            )}

            {/* ================= MOCK PAYTM CHECKOUT MODAL ================= */}
            {isPaytmMockModalOpen && mockOrderDetails && (
                <div className="fixed inset-0 bg-black/70 z-[110] flex items-center justify-center p-4 backdrop-blur-md">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border-4 border-blue-600">
                        {/* Paytm Logo & Header */}
                        <div className="bg-[#002e6e] text-white p-5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="bg-white px-2.5 py-1.5 rounded-md shadow-inner">
                                    <span className="text-[#00b9f5] font-extrabold text-lg">Pay</span>
                                    <span className="text-[#002e6e] font-extrabold text-lg">tm</span>
                                </div>
                                <div>
                                    <h3 className="font-extrabold text-xs tracking-wide text-white">SECURE CHECKOUT</h3>
                                    <p className="text-[10px] text-blue-200 font-bold tracking-wider">SANDBOX ENVIRONMENT</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-[10px] block text-blue-200 uppercase font-bold">Amount to Pay</span>
                                <span className="text-xl font-extrabold text-[#00b9f5]">₹{mockOrderDetails.amount}.00</span>
                            </div>
                        </div>

                        {/* Sandbox Notice */}
                        <div className="bg-yellow-50 border-b border-yellow-200 p-3.5 text-xs text-yellow-800 font-medium flex items-center gap-2">
                            <span className="text-lg">⚠️</span>
                            <span><b>Mock Payment Gateway</b>: Real Paytm credentials are not configured in backend `.env`. You can simulate either success or failure.</span>
                        </div>

                        {/* Content / Simulator */}
                        <div className="p-6 space-y-6">
                            <div>
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Order Details</span>
                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 font-mono text-xs text-slate-600 space-y-1">
                                    <div><b>Order ID:</b> {mockOrderDetails.orderId}</div>
                                    <div><b>Currency:</b> INR</div>
                                    <div><b>Gateway Status:</b> Simulated Staging</div>
                                </div>
                            </div>

                            {/* Simulated Payment Methods */}
                            <div className="space-y-3">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Simulated Payment Method</span>
                                <div className="border border-blue-200 rounded-xl p-4 flex items-center gap-3 bg-blue-50/50 hover:bg-blue-50 transition cursor-pointer">
                                    <div className="w-5 h-5 rounded-full border-4 border-blue-600 bg-white"></div>
                                    <div className="font-bold text-slate-800 text-sm">Paytm Wallet / UPI (Simulated)</div>
                                </div>
                                <div className="border border-slate-150 rounded-xl p-4 flex items-center gap-3 opacity-65 bg-slate-50/50 hover:bg-slate-50 transition cursor-not-allowed">
                                    <div className="w-5 h-5 rounded-full border border-slate-300 bg-white"></div>
                                    <div className="font-bold text-slate-800 text-sm">Credit / Debit Card</div>
                                </div>
                                <div className="border border-slate-150 rounded-xl p-4 flex items-center gap-3 opacity-65 bg-slate-50/50 hover:bg-slate-50 transition cursor-not-allowed">
                                    <div className="w-5 h-5 rounded-full border border-slate-300 bg-white"></div>
                                    <div className="font-bold text-slate-800 text-sm">Net Banking</div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="p-6 bg-slate-50 border-t border-slate-100 flex flex-col gap-3">
                            <button 
                                onClick={() => handleMockPaymentAction('SUCCESS')} 
                                disabled={isPaymentProcessing}
                                className="w-full bg-[#00b9f5] hover:bg-[#0092c2] text-white py-4 rounded-xl font-bold shadow-lg transition flex items-center justify-center gap-2"
                            >
                                {isPaymentProcessing ? "Processing..." : `✅ PAY SUCCESSFULLY (₹${mockOrderDetails.amount}.00)`}
                            </button>
                            <button 
                                onClick={() => handleMockPaymentAction('FAILED')} 
                                disabled={isPaymentProcessing}
                                className="w-full bg-white hover:bg-slate-100 border border-slate-200 text-red-600 py-3 rounded-xl font-bold transition"
                            >
                                ❌ CANCEL TRANSACTION
                            </button>
                            <div className="text-[10px] text-center font-bold text-slate-400 tracking-wider">
                                SECURED BY PAYTM 128-BIT ENCRYPTION
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MentorProfile;