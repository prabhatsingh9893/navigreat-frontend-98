import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    CheckCircle, Video, Share2, MessageSquare, Zap,
    Briefcase, Calendar, Clock, Radio, MapPin,
    ExternalLink, ArrowLeft, User as UserIcon
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
    const [activeTab, setActiveTab] = useState('about');
    const [isLiveNow, setIsLiveNow] = useState(false);
    const [sessions, setSessions] = useState([]);
    const [lectures, setLectures] = useState([]);

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
                const startBuffer = 5 * 60 * 1000;
                const endBuffer = 10 * 60 * 1000;
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
    const handleBookSession = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            toast.error("Please login to book a session!");
            navigate('/login');
            return;
        }

        const confirmBooking = window.confirm(`Book a session with ${mentor.username}?`);
        if (!confirmBooking) return;

        try {
            const res = await fetch(`${API_BASE_URL}/book`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    mentorId: mentor._id || mentor.id,
                    mentorName: mentor.username,
                    message: "I am interested in mentorship."
                })
            });

            const data = await res.json();
            if (res.ok) {
                toast.success(data.message || "Booking request sent! Redirecting...");
                setTimeout(() => navigate('/dashboard'), 2000);
            } else {
                toast.error(data.message || "Booking failed");
            }
        } catch (err) {
            console.error(err);
            toast.error("Network Error");
        }
    };

    const handleJoinClass = () => {
        if (mentor?.meetingId && mentor?.passcode) {
            navigate('/session', { state: { meetingNumber: mentor.meetingId, passWord: mentor.passcode, mentorId: mentor._id } });
            toast.success("Joining Live Class...");
        } else {
            toast.error("Meeting details not found.");
        }
    };

    if (loading) return <div className="h-screen flex items-center justify-center font-bold text-gray-500 animate-pulse">Loading Profile...</div>;
    if (!mentor) return <div className="text-center py-20 text-red-500 font-bold">Mentor Not Found</div>;

    return (
        <div className="bg-white min-h-screen relative font-sans">

            {/* Header / Cover */}
            <div className="h-96 relative bg-slate-900 overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80')] bg-cover bg-center opacity-30"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent"></div>

                <div className="absolute top-8 left-8 z-30">
                    <button onClick={() => navigate('/mentors')} className="flex items-center gap-2 text-white/80 hover:text-white transition font-medium bg-black/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 hover:bg-black/30">
                        <ArrowLeft size={18} /> Back to Mentors
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
                            className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-6 border border-slate-100 relative overflow-hidden"
                        >
                            {/* LIVE Indicator */}
                            {isLiveNow && (
                                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-500 to-pink-500 animate-pulse"></div>
                            )}

                            <div className="flex flex-col items-center text-center">
                                {/* Image Ring */}
                                <div className="relative w-40 h-40 mb-5 z-20 cursor-pointer" onClick={isLiveNow ? handleJoinClass : null}>
                                    <div className={`p-1.5 rounded-full h-full w-full bg-white ${isLiveNow ? 'ring-4 ring-red-500 ring-offset-4 ring-offset-white animate-pulse' : 'ring-1 ring-slate-100 shadow-lg'}`}>
                                        <img
                                            src={mentor.image || `https://api.dicebear.com/7.x/initials/svg?seed=${mentor.username}&size=512`}
                                            alt={mentor.username}
                                            className="w-full h-full rounded-full object-cover"
                                        />
                                    </div>
                                    {isLiveNow ? (
                                        <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-3 py-1 rounded-full text-[10px] font-bold border-4 border-white tracking-widest shadow-lg animate-bounce uppercase">LIVE NOW</div>
                                    ) : (
                                        <div className="absolute bottom-2 right-2 bg-green-500 text-white p-1.5 rounded-full border-4 border-white shadow-md"><CheckCircle size={16} fill="currentColor" /></div>
                                    )}
                                </div>

                                <h1 className="text-3xl font-extrabold text-slate-900 capitalize mb-2">{mentor.username}</h1>

                                <div className="flex items-center justify-center gap-2 mb-6">
                                    <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100 flex items-center gap-1">
                                        <Briefcase size={12} /> {mentor.role || "Mentor"}
                                    </span>
                                    <span className="px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold border border-purple-100 flex items-center gap-1">
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
                                            {sessions.filter(s => new Date(s.startTime) > new Date()).sort((a, b) => new Date(a.startTime) - new Date(b.startTime))[0] ? (
                                                <div className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl flex flex-col items-center justify-center gap-1">
                                                    <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                                                        <Calendar size={12} /> Next Session
                                                    </div>
                                                    <div className="text-xl font-bold text-slate-800">
                                                        {new Date(sessions.filter(s => new Date(s.startTime) > new Date()).sort((a, b) => new Date(a.startTime) - new Date(b.startTime))[0].startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                    <div className="text-sm font-medium text-blue-600">
                                                        {new Date(sessions.filter(s => new Date(s.startTime) > new Date()).sort((a, b) => new Date(a.startTime) - new Date(b.startTime))[0].startTime).toLocaleDateString([], { month: 'long', day: 'numeric', weekday: 'short' })}
                                                    </div>
                                                </div>
                                            ) : (
                                                <button onClick={handleBookSession} className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-black transition shadow-xl shadow-slate-200 flex items-center justify-center gap-2 group">
                                                    <Zap size={18} className="text-yellow-400 group-hover:scale-110 transition" /> Book Priority Session
                                                </button>
                                            )}
                                        </>
                                    )}
                                    <button onClick={() => navigate(`/chat/${mentor._id}`)} className="w-full bg-white border-2 border-slate-100 text-slate-600 py-3.5 rounded-xl font-bold hover:border-blue-500 hover:text-blue-600 transition flex items-center justify-center gap-2">
                                        <MessageSquare size={18} /> Chat with Mentor
                                    </button>
                                    <button className="w-full bg-white border-2 border-slate-100 text-slate-600 py-3.5 rounded-xl font-bold hover:border-purple-500 hover:text-purple-600 transition flex items-center justify-center gap-2">
                                        <Share2 size={18} /> Share Profile
                                    </button>
                                </div>
                            </div>
                        </motion.div>

                        {/* Quick Stats */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            className="mt-6 grid grid-cols-2 gap-4"
                        >
                            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center">
                                <div className="text-2xl font-extrabold text-blue-600">{lectures.length}</div>
                                <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Lectures</div>
                            </div>
                            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center">
                                <div className="text-2xl font-extrabold text-purple-600">4.9</div>
                                <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Rating</div>
                            </div>
                        </motion.div>
                    </div>

                    {/* === RIGHT CONTENT === */}
                    <div className="lg:col-span-8">
                        {/* Live Banner Mobile */}
                        {isLiveNow && (
                            <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl p-1 mb-6 shadow-xl shadow-red-200 animate-in slide-in-from-top-4 duration-500 lg:hidden">
                                <div className="bg-white rounded-xl p-4 flex flex-row items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-red-50 p-2.5 rounded-full text-red-600 animate-pulse"><Video size={20} /></div>
                                        <div><h3 className="font-bold text-gray-900 text-sm">Live Session Active!</h3></div>
                                    </div>
                                    <button onClick={handleJoinClass} className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md">Join</button>
                                </div>
                            </div>
                        )}

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5 }}
                            className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden min-h-[600px]"
                        >
                            <div className="p-8">
                                <div className="flex flex-col space-y-8">

                                    {/* About Section */}
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                                            <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><UserIcon size={20} /></div>
                                            About Me
                                        </h3>
                                        <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                                            <p className="text-slate-600 leading-8 text-lg whitespace-pre-wrap font-medium">
                                                {mentor.about || "No bio added yet."}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Schedule Section */}
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                                            <div className="p-2 bg-purple-50 rounded-lg text-purple-600"><Calendar size={20} /></div>
                                            Upcoming Schedule
                                        </h3>

                                        <div className="relative">
                                            {/* Timeline Line */}
                                            <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-slate-100"></div>

                                            {sessions.filter(s => new Date(s.endTime) > new Date()).length === 0 ? (
                                                <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
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
                                                                <div className={`absolute left-[11px] top-6 w-3 h-3 rounded-full border-2 border-white shadow-sm z-10 ${isSessionLive ? 'bg-red-500 animate-pulse ring-4 ring-red-100' : 'bg-blue-500'}`}></div>

                                                                <div className={`bg-white p-5 rounded-2xl border ${isSessionLive ? 'border-red-200 shadow-red-100 ring-1 ring-red-100' : 'border-slate-100 hover:border-slate-300'} shadow-sm transition-all group-hover:shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
                                                                    <div>
                                                                        <h4 className="font-bold text-slate-800 text-lg mb-1">{session.title}</h4>
                                                                        <div className="flex items-center gap-3 text-sm">
                                                                            <span className={`font-bold ${isSessionLive ? 'text-red-600' : 'text-slate-500'}`}>
                                                                                {isSessionLive ? '🔴 HAPPENING NOW' : dateString}
                                                                            </span>
                                                                            {!isSessionLive && <span className="w-1 h-1 bg-slate-300 rounded-full"></span>}
                                                                            {!isSessionLive && <span className="text-slate-400 font-medium">{timeString}</span>}
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
                                            <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                                                <div className="p-2 bg-orange-50 rounded-lg text-orange-600"><Video size={20} /></div>
                                                Recorded Sessions
                                            </h3>
                                            <div className="grid md:grid-cols-2 gap-6">
                                                {lectures.map((lecture) => {
                                                    const videoId = getYouTubeID(lecture.url);
                                                    return (
                                                        <div key={lecture._id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
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
                                                                <div className="h-40 bg-slate-50 flex items-center justify-center text-slate-400 font-medium">
                                                                    Video Unavailable
                                                                </div>
                                                            )}
                                                            <div className="p-4">
                                                                <h4 className="font-bold text-slate-800 leading-snug line-clamp-2 mb-3 group-hover:text-blue-600 transition">{lecture.title}</h4>
                                                                <a href={lecture.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-red-500 uppercase tracking-wide transition">
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
        </div>
    );
};

export default MentorProfile;