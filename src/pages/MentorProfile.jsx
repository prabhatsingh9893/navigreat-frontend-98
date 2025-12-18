import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  CheckCircle, Video, Share2, MessageSquare, Zap, 
  Briefcase, Calendar, Clock, Star, Radio 
} from 'lucide-react';
import toast from 'react-hot-toast';

const MentorProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [mentor, setMentor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('about');
  
  // ✅ STATE: Iska true/false hona ghadi (Clock) par depend karega
  const [isLiveNow, setIsLiveNow] = useState(false);

  // --- 1. REAL TIME DATA SETUP (Automatic Dates) ---
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    // Hum "Aaj" ki date nikal rahe hain taaki ye hamesha Real Data lage
    const today = new Date();
    
    // SESSION 1: (Abhi se 2 ghante baad shuru hoga) -> LIVE NAHI DIKHEGA
    const session1Start = new Date(today);
    session1Start.setHours(today.getHours() + 2); // 🔴 Change '+ 2' to '- 1' to make it LIVE
    const session1End = new Date(session1Start);
    session1End.setHours(session1Start.getHours() + 1); // 1 ghante ki class

    // SESSION 2: (Kal subah 10 baje)
    const session2Start = new Date(today);
    session2Start.setDate(today.getDate() + 1);
    session2Start.setHours(10, 0, 0, 0);
    const session2End = new Date(session2Start);
    session2End.setHours(11, 0, 0, 0);

    setSessions([
        { 
            id: 101, 
            title: "Live Doubt Session: DSA", 
            startTime: session1Start, 
            endTime: session1End,   
        },
        { 
            id: 102, 
            title: "Mock Interview Prep", 
            startTime: session2Start, 
            endTime: session2End,
        }
    ]);
  }, []); // Sirf ek baar load hoga

  // --- 2. ⏰ REAL TIME CLOCK (Har 1 Second Check Karega) ---
  useEffect(() => {
    const checkLiveStatus = () => {
        const now = new Date(); // Abhi ka time (Real Time)

        const foundLiveSession = sessions.find(session => {
            return now >= session.startTime && now <= session.endTime;
        });

        const status = !!foundLiveSession;
        
        // Agar status badla hai (Live -> Offline ya Offline -> Live), tabhi update karo
        setIsLiveNow(prev => {
            if (prev !== status) {
                if(status) toast.success("🔴 Class is LIVE now!");
                else if(prev) toast("Class ended."); 
                return status;
            }
            return prev;
        });
    };

    // Turant check karo aur fir har second check karo
    checkLiveStatus();
    const intervalId = setInterval(checkLiveStatus, 1000);
    return () => clearInterval(intervalId);
  }, [sessions]);


  // --- FETCH DATA ---
  useEffect(() => {
    const fetchData = async () => {
        try {
            if (id) {
                const mRes = await fetch(`https://navigreat-backend-98.onrender.com/api/mentors/${id}`);
                const mData = await mRes.json();
                if (mData.success) setMentor(mData.mentor || mData.user);
            } 
        } catch (err) { console.error(err); } 
        finally { setLoading(false); }
    };
    fetchData();
  }, [id]);

  const handleBookSession = async () => { toast.success("Booking feature coming soon!"); };

  const handleJoinClass = () => {
      if (mentor?.meetingId && mentor?.passcode) {
          navigate('/session', { state: { meetingNumber: mentor.meetingId, passWord: mentor.passcode } });
          toast.success("Joining Live Class...");
      } else {
          toast.error("Meeting details not found.");
      }
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-bold text-gray-500">Loading...</div>;
  if (!mentor) return <div className="text-center py-20">Not Found</div>;

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
                            <button onClick={handleBookSession} className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold hover:bg-black transition shadow-lg flex items-center justify-center gap-2">
                                <Zap size={18} className="text-yellow-400"/> Book Priority Session
                            </button>
                        )}
                        <button className="w-full border border-slate-200 text-slate-700 py-3.5 rounded-xl font-bold hover:bg-slate-50 transition flex items-center justify-center gap-2">
                            <MessageSquare size={18} /> Chat with Mentor
                        </button>
                    </div>
                </div>
            </div>

            {/* === RIGHT CONTENT === */}
            <div className="lg:col-span-8 pt-4 lg:pt-0">
                
                {/* --- LIVE BANNER (Sirf Live hone par dikhega) --- */}
                {isLiveNow && (
                    <div className="bg-gradient-to-r from-red-500 to-pink-600 rounded-2xl p-1 mb-6 shadow-lg shadow-red-200 animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="bg-white rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="bg-red-50 p-3 rounded-full text-red-600"><Video size={24}/></div>
                                <div><h3 className="font-bold text-gray-900 text-lg">Live Session Started!</h3><p className="text-slate-500 text-sm">Join now to interact with {mentor.username}</p></div>
                            </div>
                            <button onClick={handleJoinClass} className="bg-red-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-red-700 transition w-full sm:w-auto shadow-md">Join Now</button>
                        </div>
                    </div>
                )}

                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 min-h-[400px]">
                    {activeTab === 'about' ? (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                             
                             {/* SCHEDULE LIST (Real Time) */}
                             <div className="border border-blue-100 bg-blue-50/30 rounded-2xl p-5">
                                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2"><Calendar size={16}/> Schedule</h3>
                                <div className="space-y-3">
                                    {sessions.map((session) => {
                                        const now = new Date();
                                        const isSessionLive = now >= session.startTime && now <= session.endTime;
                                        
                                        // Formatting Time for Display
                                        const timeString = session.startTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                                        const dateString = session.startTime.getDate() === now.getDate() ? "Today" : "Tomorrow";

                                        return (
                                            <div key={session.id} className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-full ${isSessionLive ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
                                                        {isSessionLive ? <Video size={20}/> : <Clock size={20}/>}
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
                            </div>

                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"><Briefcase size={20}/>About Me</h3>
                                <p className="text-gray-600 leading-8 text-lg whitespace-pre-wrap">{mentor.about || "Hello! I am a software engineer."}</p>
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