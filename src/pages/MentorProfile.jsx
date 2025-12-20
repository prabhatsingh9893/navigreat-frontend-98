import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    CheckCircle, Video, Share2, MessageSquare, Zap,
    Briefcase, Calendar, Clock, Star, Radio
} from 'lucide-react';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../config';

const MentorProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [mentor, setMentor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('about');

    // ✅ STATE: Live Status & Real Database Sessions
    const [isLiveNow, setIsLiveNow] = useState(false);
    const [sessions, setSessions] = useState([]);

    // --- 1. FETCH DATA (Mentor + Sessions) - SAFE MODE ---
    useEffect(() => {
        const fetchData = async () => {
            try {
                if (!id) return;

                // A. Fetch Mentor Profile
                const mRes = await fetch(`${API_BASE_URL}/mentors/${id}`);

                // Check if mentor request failed
                if (!mRes.ok) {
                    console.error("Mentor fetch failed with status:", mRes.status);
                    setLoading(false);
                    return;
                }

                const mData = await mRes.json();
                if (mData.success) setMentor(mData.mentor || mData.user);

                // B. ✅ FETCH REAL SESSIONS (SAFE CHECK ADDED)
                try {
                    const sRes = await fetch(`${API_BASE_URL}/sessions/${id}`);

                    // 🛑 SAFETY CHECK: Only parse JSON if status is OK (200-299)
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
                        // If 404 or 500 error, just log warning and keep sessions empty
                        console.warn(`Sessions API endpoint not found (Status: ${sRes.status}). Showing empty schedule.`);
                        setSessions([]);
                    }
                } catch (sessionErr) {
                    console.error("Error parsing session data:", sessionErr);
                    setSessions([]); // Fallback to empty list
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

    // --- 2. ⏰ REAL TIME LIVE CHECK (With 30 Min Buffer) ---
    useEffect(() => {
        const checkLiveStatus = () => {
            if (sessions.length === 0) return;

            const now = new Date(); // Current Time

            const foundLiveSession = sessions.find(session => {
                const start = new Date(session.startTime);
                const end = new Date(session.endTime);

                // ✅ 30 Minute Buffer Logic
                const bufferTime = 30 * 60 * 1000;

                const bufferStart = new Date(start.getTime() - bufferTime);
                const bufferEnd = new Date(end.getTime() + bufferTime);

                return now >= bufferStart && now <= bufferEnd;
            });

            const status = !!foundLiveSession;

            // Fix: Simply update value. Effect below handles Toast.
            setIsLiveNow(status);
        };

        checkLiveStatus();
        const intervalId = setInterval(checkLiveStatus, 1000);
        return () => clearInterval(intervalId);
    }, [sessions]);

    // ✅ FIX: Toast Logic in Separate Effect
    useEffect(() => {
        if (isLiveNow) {
            toast.success("🔴 Class is LIVE! Join now.", { id: 'live-toast' });
        }
    }, [isLiveNow]);


    // --- HANDLERS ---
    const handleBookSession = async () => { toast.success("Booking feature coming soon!"); };

    const handleJoinClass = () => {
        if (mentor?.meetingId && mentor?.passcode) {
            navigate('/session', { state: { meetingNumber: mentor.meetingId, passWord: mentor.passcode } });
            toast.success("Joining Live Class...");
        } else {
            toast.error("Meeting details not found.");
        }
    };

    if (loading) return <div className="h-screen flex items-center justify-center font-bold text-gray-500 animate-pulse">Loading Profile...</div>;
    if (!mentor) return <div className="text-center py-20 text-red-500 font-bold">Mentor Not Found</div>;

    return (
        <div className="bg-[#F8FAFC] min-h-screen">

            {/* HEADER */}
            <div className="h-52 md:h-64 relative bg-slate-900 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-slate-900"></div>
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10 pb-20">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* === LEFT SIDEBAR === */}
                    <div className="lg:col-span-4 flex flex-col items-center">

                        {/* --- IMAGE & LIVE RING --- */}
                        <div className="relative w-32 h-32 mb-4 z-20 cursor-pointer" onClick={isLiveNow ? handleJoinClass : null}>
                            <div className={`p-1 rounded-full h-full w-full bg-white ${isLiveNow ? 'ring-4 ring-red-500 ring-offset-4 ring-offset-slate-50 animate-pulse' : 'shadow-md'}`}>
                                <img
                                    src={mentor.image || `https://api.dicebear.com/7.x/initials/svg?seed=${mentor.username}&size=512`}
                                    alt={mentor.username}
                                    className="w-full h-full rounded-full object-cover border-[3px] border-white"
                                />
                            </div>
                            {isLiveNow ? (
                                <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-3 py-0.5 rounded-full text-[10px] font-bold border-2 border-white tracking-wider shadow-sm animate-bounce">LIVE</div>
                            ) : (
                                <div className="absolute bottom-1 right-1 bg-green-500 text-white p-1 rounded-full border-[3px] border-white shadow-sm"><CheckCircle size={14} fill="currentColor" /></div>
                            )}
                        </div>

                        <div className="text-center mb-6 w-full">
                            <h1 className="text-3xl font-extrabold text-gray-900 capitalize mb-1 leading-tight">{mentor.username}</h1>
                            <p className="text-sm font-medium text-slate-500 flex justify-center items-center gap-1 mb-3">{mentor.college}</p>
                        </div>

                        {/* --- BUTTONS --- */}
                        <div className="bg-white w-full rounded-3xl shadow-xl shadow-gray-200/50 p-6 border border-gray-100">
                            <div className="space-y-3 mb-4">
                                {isLiveNow ? (
                                    <button onClick={handleJoinClass} className="w-full bg-red-600 text-white py-3.5 rounded-xl font-bold hover:bg-red-700 shadow-lg shadow-red-200 flex items-center justify-center gap-2 animate-pulse">
                                        <Radio size={20} className="animate-ping absolute inline-flex opacity-75" />
                                        <Radio size={20} className="relative inline-flex" /> JOIN LIVE CLASS
                                    </button>
                                ) : (
                                    <>
                                        {/* ✅ Show Next Class Time if available */}
                                        {sessions.filter(s => new Date(s.startTime) > new Date()).sort((a, b) => new Date(a.startTime) - new Date(b.startTime))[0] ? (
                                            <div className="w-full bg-blue-50 border border-blue-200 text-blue-800 py-3.5 rounded-xl font-bold flex flex-col items-center justify-center gap-1 shadow-sm">
                                                <div className="flex items-center gap-2 text-xs uppercase tracking-widest opacity-70">
                                                    <Calendar size={14} /> Next Live Class
                                                </div>
                                                <div className="text-xl">
                                                    {new Date(sessions.filter(s => new Date(s.startTime) > new Date()).sort((a, b) => new Date(a.startTime) - new Date(b.startTime))[0].startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    <span className="text-sm ml-1 font-normal text-blue-600">
                                                        ({new Date(sessions.filter(s => new Date(s.startTime) > new Date()).sort((a, b) => new Date(a.startTime) - new Date(b.startTime))[0].startTime).toLocaleDateString([], { month: 'short', day: 'numeric' })})
                                                    </span>
                                                </div>
                                            </div>
                                        ) : (
                                            <button onClick={handleBookSession} className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold hover:bg-black transition shadow-lg flex items-center justify-center gap-2">
                                                <Zap size={18} className="text-yellow-400" /> Book Priority Session
                                            </button>
                                        )}
                                    </>
                                )}
                                <button className="w-full border border-slate-200 text-slate-700 py-3.5 rounded-xl font-bold hover:bg-slate-50 transition flex items-center justify-center gap-2">
                                    <MessageSquare size={18} /> Chat with Mentor
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* === RIGHT CONTENT === */}
                    <div className="lg:col-span-8 pt-4 lg:pt-0">

                        {/* --- LIVE BANNER --- */}
                        {isLiveNow && (
                            <div className="bg-gradient-to-r from-red-500 to-pink-600 rounded-2xl p-1 mb-6 shadow-lg shadow-red-200 animate-in fade-in slide-in-from-top-4 duration-500">
                                <div className="bg-white rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-red-50 p-3 rounded-full text-red-600"><Video size={24} /></div>
                                        <div><h3 className="font-bold text-gray-900 text-lg">Live Session Active!</h3><p className="text-slate-500 text-sm">Session started. Join {mentor.username} now.</p></div>
                                    </div>
                                    <button onClick={handleJoinClass} className="bg-red-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-red-700 transition w-full sm:w-auto shadow-md">Join Now</button>
                                </div>
                            </div>
                        )}

                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 min-h-[400px]">
                            {activeTab === 'about' ? (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

                                    {/* SCHEDULE LIST */}
                                    <div className="border border-blue-100 bg-blue-50/30 rounded-2xl p-5">
                                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2"><Calendar size={16} /> Upcoming Schedule</h3>

                                        {sessions.length === 0 ? (
                                            <p className="text-gray-400 text-center italic py-4">
                                                No upcoming sessions found for this mentor.
                                            </p>
                                        ) : (
                                            <div className="space-y-3">
                                                {sessions.map((session) => {
                                                    const now = new Date();
                                                    const start = new Date(session.startTime);
                                                    const end = new Date(session.endTime);

                                                    // Formatting Time for Display
                                                    const timeString = start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                                    const dateString = start.toLocaleDateString([], { month: 'short', day: 'numeric' });

                                                    // Check if specifically this session is live
                                                    const buffer = 30 * 60 * 1000;
                                                    const isSessionLive = now >= new Date(start.getTime() - buffer) && now <= new Date(end.getTime() + buffer);

                                                    return (
                                                        <div key={session._id || session.id} className={`flex justify-between items-center bg-white p-4 rounded-xl border ${isSessionLive ? 'border-red-200 bg-red-50/50' : 'border-gray-100'} shadow-sm`}>
                                                            <div className="flex items-center gap-3">
                                                                <div className={`p-2 rounded-full ${isSessionLive ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
                                                                    {isSessionLive ? <Video size={20} /> : <Clock size={20} />}
                                                                </div>
                                                                <div>
                                                                    <h4 className="font-bold text-gray-800">{session.title}</h4>
                                                                    <p className={`text-xs font-bold uppercase ${isSessionLive ? 'text-red-500' : 'text-gray-400'}`}>
                                                                        {isSessionLive ? '🔴 Live Now' : `${dateString}, ${timeString}`}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            {isSessionLive && <button onClick={handleJoinClass} className="px-4 py-2 rounded-lg text-sm font-bold bg-red-600 text-white hover:bg-red-700 shadow-md">Join</button>}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"><Briefcase size={20} />About Me</h3>
                                        <p className="text-gray-600 leading-8 text-lg whitespace-pre-wrap">{mentor.about || "No bio added yet."}</p>
                                    </div>
                                </div>
                            ) : (
                                <div>Resources go here...</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MentorProfile;