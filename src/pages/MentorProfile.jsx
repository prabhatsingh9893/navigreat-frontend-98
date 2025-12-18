import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  MapPin, CheckCircle, Video, Share2, MessageSquare, Zap, 
  Briefcase, GraduationCap, Link as LinkIcon, Calendar, Clock, 
  Star, Users 
} from 'lucide-react';
import toast from 'react-hot-toast';

const MentorProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [mentor, setMentor] = useState(null);
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('about'); 

  // --- MOCK SESSIONS ---
  const upcomingSessions = [
    { id: 101, title: "Live Doubt Session: DSA", time: "Now", status: "live" },
    { id: 102, title: "Mock Interview Prep", time: "Tomorrow, 10 AM", status: "upcoming" }
  ];

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
          toast.success("Connecting to Live Classroom...");
      } else {
          if (!id) {
             toast.error("Please add Zoom ID in Edit Profile first!");
          } else {
             toast.error("Classroom not active yet.");
          }
      }
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-bold text-gray-500">Loading...</div>;
  if (!mentor) return <div className="text-center py-20">Not Found</div>;

  return (
    <div className="bg-[#F8FAFC] min-h-screen">
      
      {/* 1. COVER HEADER */}
      <div className="h-64 relative bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-slate-900"></div>
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-10 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* === LEFT SIDEBAR === */}
            <div className="lg:col-span-4">
                <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-6 border border-gray-100 sticky top-24">
                    
                    {/* ✅ FIX 1: Spacing Increased (mb-8) to stop overlap */}
                    <div className="relative w-32 h-32 mx-auto mb-8">
                        <div className="p-1 bg-white rounded-full shadow-sm h-full w-full">
                            <img 
                                src={mentor.image || `https://api.dicebear.com/7.x/initials/svg?seed=${mentor.username}&size=512`} 
                                alt={mentor.username} 
                                className="w-full h-full rounded-full object-cover border-[4px] border-slate-50"
                            />
                        </div>
                        {/* ✅ FIX 2: Badge Positioned tighter to image */}
                        <div className="absolute bottom-1 right-1 z-20 bg-green-500 text-white p-1 rounded-full border-4 border-white shadow-sm" title="Verified">
                            <CheckCircle size={16} fill="currentColor" />
                        </div>
                    </div>

                    <div className="text-center mb-6">
                        {/* ✅ FIX 3: Bigger Font, No Overlap */}
                        <h1 className="text-3xl font-extrabold text-gray-900 capitalize mb-2 leading-tight">
                            {mentor.username}
                        </h1>
                        
                        <p className="text-sm font-medium text-slate-500 flex justify-center items-center gap-1 mb-4 px-4">
                            {mentor.college}
                        </p>
                        
                        <div className="flex justify-center gap-2 flex-wrap">
                            <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-100">Ex-Google</span>
                            <span className="px-3 py-1 bg-purple-50 text-purple-700 text-xs font-bold rounded-full border border-purple-100">AIR 24</span>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="flex justify-between border-t border-b border-gray-100 py-4 mb-6 text-center">
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

                    {/* Buttons */}
                    <div className="space-y-3 mb-3">
                        <button onClick={handleBookSession} className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold hover:bg-black transition shadow-lg flex items-center justify-center gap-2">
                            <Zap size={18} className="text-yellow-400"/> Book Priority Session
                        </button>
                        <button onClick={handleJoinClass} className="w-full bg-red-50 text-red-600 border border-red-100 py-3.5 rounded-xl font-bold hover:bg-red-100 transition flex items-center justify-center gap-2">
                            <Video size={18} /> Join Live Room
                        </button>
                    </div>

                    <div className="flex gap-2">
                        <button className="flex-1 border border-gray-200 py-2.5 rounded-xl font-semibold text-gray-600 hover:bg-gray-50 flex justify-center gap-2"><MessageSquare size={18} /> Chat</button>
                        <button className="flex-1 border border-gray-200 py-2.5 rounded-xl font-semibold text-gray-600 hover:bg-gray-50 flex justify-center gap-2"><Share2 size={18} /> Share</button>
                    </div>
                </div>
            </div>

            {/* === RIGHT CONTENT === */}
            <div className="lg:col-span-8">
                {/* Tabs */}
                <div className="bg-white rounded-2xl p-2 mb-6 inline-flex shadow-sm border border-gray-100">
                    <button onClick={() => setActiveTab('about')} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'about' ? 'bg-blue-50 text-blue-600 shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}>Overview</button>
                    <button onClick={() => setActiveTab('lectures')} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'lectures' ? 'bg-blue-50 text-blue-600 shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}>Resources ({lectures.length})</button>
                </div>

                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 min-h-[400px]">
                    
                    {activeTab === 'about' ? (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            
                            {/* Upcoming Sessions */}
                            <div className="border border-blue-100 bg-blue-50/30 rounded-2xl p-5">
                                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <Calendar size={16}/> Upcoming Sessions
                                </h3>
                                <div className="space-y-3">
                                    {upcomingSessions.map((session) => (
                                        <div key={session.id} className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-full ${session.status === 'live' ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-gray-100 text-gray-500'}`}>
                                                    <Video size={20}/>
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-800">{session.title}</h4>
                                                    <p className={`text-xs font-bold uppercase ${session.status === 'live' ? 'text-red-500' : 'text-gray-400'}`}>
                                                        {session.status === 'live' ? '🔴 Live Now' : session.time}
                                                    </p>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => session.status === 'live' ? handleJoinClass() : toast.success("Reminder Set!")}
                                                className={`px-4 py-2 rounded-lg text-sm font-bold ${
                                                    session.status === 'live' ? 'bg-red-600 text-white hover:bg-red-700 shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                }`}
                                            >
                                                {session.status === 'live' ? 'Join' : 'Notify'}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* About Me */}
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <div className="bg-yellow-100 p-2 rounded-lg text-yellow-600"><Briefcase size={20}/></div>
                                    About Me
                                </h3>
                                <p className="text-gray-600 leading-8 text-lg whitespace-pre-wrap">
                                    {mentor.about || "Hello! I am a software engineer passionate about helping students crack their dream companies."}
                                </p>
                            </div>
                            
                            {/* Expertise */}
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Areas of Expertise</h3>
                                <div className="flex flex-wrap gap-2">
                                    {mentor.skills && mentor.skills.length > 0 ? mentor.skills.map((tag, i) => (
                                        <span key={i} className="px-4 py-2 rounded-full bg-slate-50 text-slate-700 text-sm font-medium border border-slate-200">{tag}</span>
                                    )) : (
                                        <>
                                            <span className="px-4 py-2 rounded-full bg-slate-50 text-slate-700 text-sm font-medium border border-slate-200">Career Guidance</span>
                                            <span className="px-4 py-2 rounded-full bg-slate-50 text-slate-700 text-sm font-medium border border-slate-200">Placement Prep</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        // Lectures
                        <div className="space-y-4">
                            {lectures.length === 0 ? (
                                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                    <Video size={48} className="mx-auto mb-3 opacity-20" />
                                    <p className="text-slate-400 font-medium">No resources uploaded yet.</p>
                                </div>
                            ) : lectures.map(lec => (
                                    <div key={lec._id} onClick={() => window.open(lec.url, '_blank')} className="group flex items-start gap-4 p-5 rounded-2xl border border-gray-100 hover:border-blue-300 hover:shadow-md transition cursor-pointer bg-gray-50 hover:bg-white">
                                        <div className="bg-red-100 text-red-600 p-4 rounded-xl group-hover:bg-red-600 group-hover:text-white transition">
                                            <Video size={24} />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-gray-800 text-lg group-hover:text-blue-600 transition">{lec.title}</h4>
                                            <p className="text-sm text-gray-500 mt-1 flex items-center gap-1"><LinkIcon size={12}/> YouTube Resource</p>
                                        </div>
                                        <div className="self-center"><span className="text-xs font-bold bg-white border px-3 py-1 rounded-full text-gray-500 group-hover:bg-blue-600 group-hover:text-white transition">Watch</span></div>
                                    </div>
                                ))
                            }
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