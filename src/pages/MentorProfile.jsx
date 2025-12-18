import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  MapPin, CheckCircle, Video, Share2, MessageSquare, Zap, 
  Briefcase, GraduationCap, Link as LinkIcon, Calendar, Clock, 
  Star, Users, Radio 
} from 'lucide-react';
import toast from 'react-hot-toast';

const MentorProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [mentor, setMentor] = useState(null);
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('about'); 

  // --- 1. LIVE CHECK LOGIC ---
  const upcomingSessions = [
    { id: 101, title: "Doubt Clearing: System Design", time: "Now", status: "live" }, // Status 'live' hai
    { id: 102, title: "Mock Interview Prep", time: "Tomorrow, 10 AM", status: "upcoming" }
  ];

  // Agar list me koi bhi session 'live' hai, to Profile LIVE mode me chali jayegi
  const isLive = upcomingSessions.some(s => s.status === 'live');

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchData = async () => {
        try {
            if (id) {
                const mRes = await fetch(`https://navigreat-backend-98.onrender.com/api/mentors/${id}`);
                const mData = await mRes.json();
                if (mData.success) setMentor(mData.mentor || mData.user);

                const lRes = await fetch(`https://navigreat-backend-98.onrender.com/api/lectures/${id}`);
                const lData = await lRes.json();
                if (lData.success) setLectures(lData.lectures);
            } else {
                const savedProfile = localStorage.getItem("mentorProfile");
                const savedLectures = localStorage.getItem("mentorLectures");
                if (savedProfile) setMentor(JSON.parse(savedProfile));
                if (savedLectures) setLectures(JSON.parse(savedLectures));
            }
        } catch (err) { console.error(err); } 
        finally { setLoading(false); }
    };
    fetchData();
  }, [id]);

  const handleBookSession = async () => { toast.success("Feature coming soon!"); };

  const handleJoinClass = () => {
      if (mentor?.meetingId && mentor?.passcode) {
          navigate('/session', { 
              state: { 
                  meetingNumber: mentor.meetingId, 
                  passWord: mentor.passcode 
              } 
          });
          toast.success("Joining Live Class...");
      } else {
          if (!id) toast.error("Please add Zoom ID in Edit Profile!");
          else toast.error("Classroom details not found.");
      }
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-bold text-gray-500">Loading...</div>;
  if (!mentor) return <div className="text-center py-20">Not Found</div>;

  return (
    <div className="bg-[#F8FAFC] min-h-screen">
      
      {/* 1. COVER HEADER */}
      <div className="h-52 md:h-64 relative bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-slate-900"></div>
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* === LEFT SIDEBAR === */}
            <div className="lg:col-span-4 flex flex-col items-center">
                
                {/* --- 1. PROFILE IMAGE (With PW/Unacademy Style Live Ring) --- */}
                <div className="relative w-32 h-32 mb-4 z-20 cursor-pointer" onClick={isLive ? handleJoinClass : null}>
                    
                    {/* Glowing Red Ring if LIVE */}
                    <div className={`p-1 rounded-full h-full w-full bg-white ${isLive ? 'ring-4 ring-red-500 ring-offset-4 ring-offset-slate-50 animate-pulse' : 'shadow-md'}`}>
                        <img 
                            src={mentor.image || `https://api.dicebear.com/7.x/initials/svg?seed=${mentor.username}&size=512`} 
                            alt={mentor.username} 
                            className="w-full h-full rounded-full object-cover border-[3px] border-white"
                        />
                    </div>
                    
                    {/* Live Badge (Top) or Verified Badge (Bottom) */}
                    {isLive ? (
                        <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-3 py-0.5 rounded-full text-[10px] font-bold border-2 border-white tracking-wider shadow-sm animate-bounce">
                            LIVE
                        </div>
                    ) : (
                        <div className="absolute bottom-1 right-1 bg-green-500 text-white p-1 rounded-full border-[3px] border-white shadow-sm">
                            <CheckCircle size={14} fill="currentColor" />
                        </div>
                    )}
                </div>

                {/* --- 2. NAME & INFO --- */}
                <div className="text-center mb-6 w-full">
                    <h1 className="text-3xl font-extrabold text-gray-900 capitalize mb-1 leading-tight">
                        {mentor.username}
                    </h1>
                    <p className="text-sm font-medium text-slate-500 flex justify-center items-center gap-1 mb-3">
                        {mentor.college}
                    </p>
                    <div className="flex justify-center gap-2 flex-wrap">
                        <span className="px-3 py-1 bg-white text-blue-700 text-xs font-bold rounded-full border border-blue-100 shadow-sm">Ex-Google</span>
                        <span className="px-3 py-1 bg-white text-purple-700 text-xs font-bold rounded-full border border-purple-100 shadow-sm">AIR 24</span>
                    </div>
                </div>

                {/* --- 3. WHITE CARD (Actions) --- */}
                <div className="bg-white w-full rounded-3xl shadow-xl shadow-gray-200/50 p-6 border border-gray-100">
                    <div className="flex justify-between border-b border-gray-100 pb-4 mb-4 text-center">
                        <div>
                            <div className="text-lg font-bold text-gray-900 flex items-center justify-center gap-1">4.9 <Star size={12} fill="orange" className="text-orange-400"/></div>
                            <div className="text-[10px] uppercase font-bold text-gray-400">Rating</div>
                        </div>
                        <div className="border-l pl-4 border-gray-100">
                            <div className="text-lg font-bold text-gray-900">5k+</div>
                            <div className="text-[10px] uppercase font-bold text-gray-400">Students</div>
                        </div>
                        <div className="border-l pl-4 border-gray-100">
                            <div className="text-lg font-bold text-gray-900">120</div>
                            <div className="text-[10px] uppercase font-bold text-gray-400">Sessions</div>
                        </div>
                    </div>

                    <div className="space-y-3 mb-4">
                        
                        {/* 🔥 DYNAMIC MAIN BUTTON 🔥 */}
                        {isLive ? (
                            // Agar LIVE hai to ye dikhao
                            <button 
                                onClick={handleJoinClass} 
                                className="w-full bg-red-600 text-white py-3.5 rounded-xl font-bold hover:bg-red-700 shadow-lg shadow-red-200 flex items-center justify-center gap-2 animate-pulse"
                            >
                                <Radio size={20} className="animate-ping absolute inline-flex opacity-75" />
                                <Radio size={20} className="relative inline-flex" /> 
                                JOIN LIVE CLASS
                            </button>
                        ) : (
                            // Agar LIVE nahi hai to ye dikhao
                            <button 
                                onClick={handleBookSession} 
                                className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold hover:bg-black transition shadow-lg flex items-center justify-center gap-2"
                            >
                                <Zap size={18} className="text-yellow-400"/> Book Priority Session
                            </button>
                        )}
                        
                        {/* Secondary Button */}
                        <button className="w-full border border-slate-200 text-slate-700 py-3.5 rounded-xl font-bold hover:bg-slate-50 transition flex items-center justify-center gap-2">
                            <MessageSquare size={18} /> Chat with Mentor
                        </button>
                    </div>

                    <div className="flex gap-2 justify-center">
                        <button className="text-slate-400 hover:text-slate-600 text-sm font-semibold flex items-center gap-1"><Share2 size={14}/> Share Profile</button>
                    </div>
                </div>
            </div>

            {/* === RIGHT CONTENT === */}
            <div className="lg:col-span-8 pt-4 lg:pt-0">
                
                {/* --- 🔥 LIVE NOW BANNER (Only if Live) --- */}
                {isLive && (
                    <div className="bg-gradient-to-r from-red-500 to-pink-600 rounded-2xl p-1 mb-6 shadow-lg shadow-red-200 animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="bg-white rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                    </span>
                                    <div className="bg-red-50 p-3 rounded-full text-red-600">
                                        <Video size={24}/>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg">Live Session Started!</h3>
                                    <p className="text-slate-500 text-sm">Join now to interact with {mentor.username}</p>
                                </div>
                            </div>
                            <button onClick={handleJoinClass} className="bg-red-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-red-700 transition w-full sm:w-auto shadow-md">
                                Join Now
                            </button>
                        </div>
                    </div>
                )}

                {/* Tabs */}
                <div className="bg-white rounded-2xl p-2 mb-6 inline-flex shadow-sm border border-gray-100">
                    <button onClick={() => setActiveTab('about')} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'about' ? 'bg-blue-50 text-blue-600 shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}>Overview</button>
                    <button onClick={() => setActiveTab('lectures')} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'lectures' ? 'bg-blue-50 text-blue-600 shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}>Resources</button>
                </div>

                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 min-h-[400px]">
                    {activeTab === 'about' ? (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Schedule */}
                            <div className="border border-blue-100 bg-blue-50/30 rounded-2xl p-5">
                                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2"><Calendar size={16}/> Schedule</h3>
                                <div className="space-y-3">
                                    {upcomingSessions.map((session) => (
                                        <div key={session.id} className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-full ${session.status === 'live' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
                                                    {session.status === 'live' ? <Video size={20}/> : <Clock size={20}/>}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-800">{session.title}</h4>
                                                    <p className={`text-xs font-bold uppercase ${session.status === 'live' ? 'text-red-500' : 'text-gray-400'}`}>
                                                        {session.status === 'live' ? '🔴 Live Now' : session.time}
                                                    </p>
                                                </div>
                                            </div>
                                            {session.status === 'live' && (
                                                <button onClick={handleJoinClass} className="px-4 py-2 rounded-lg text-sm font-bold bg-red-600 text-white hover:bg-red-700 shadow-md">Join</button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"><div className="bg-yellow-100 p-2 rounded-lg text-yellow-600"><Briefcase size={20}/></div>About Me</h3>
                                <p className="text-gray-600 leading-8 text-lg whitespace-pre-wrap">{mentor.about || "Mentor bio loading..."}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {lectures.map(lec => (
                                <div key={lec._id} onClick={() => window.open(lec.url, '_blank')} className="group flex items-start gap-4 p-5 rounded-2xl border border-gray-100 hover:border-blue-300 transition cursor-pointer bg-gray-50 hover:bg-white">
                                    <div className="bg-red-100 text-red-600 p-4 rounded-xl"><Video size={24} /></div>
                                    <div className="flex-1"><h4 className="font-bold text-gray-800 text-lg">{lec.title}</h4></div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default MentorProfile;