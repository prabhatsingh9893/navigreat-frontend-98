import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  MapPin, BookOpen, CheckCircle, Video, Share2, 
  MessageSquare, Calendar, Zap, Briefcase, GraduationCap, Link as LinkIcon 
} from 'lucide-react';
import toast from 'react-hot-toast';

const MentorProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [mentor, setMentor] = useState(null);
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('about'); // 'about' or 'lectures'

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchData = async () => {
        try {
            const mRes = await fetch(`https://navigreat-backend-98.onrender.com/api/mentors/${id}`);
            const mData = await mRes.json();
            if (mData.success) setMentor(mData.mentor);

            const lRes = await fetch(`https://navigreat-backend-98.onrender.com/api/lectures/${id}`);
            const lData = await lRes.json();
            if (lData.success) setLectures(lData.lectures);
            
            setLoading(false);
        } catch (err) { console.error(err); setLoading(false); }
    };
    fetchData();
  }, [id]);

  const handleBookSession = async () => {
    const userData = localStorage.getItem('userData');
    if (!userData) { toast.error("🔒 Login first!"); navigate('/login'); return; }
    const user = JSON.parse(userData);
    const loadingToast = toast.loading("Booking...");
    try {
      const res = await fetch('https://navigreat-backend-98.onrender.com/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentEmail: user.email, mentorName: mentor.username }),
      });
      const data = await res.json();
      toast.dismiss(loadingToast);
      if (data.success) toast.success("Session Booked!");
      else toast.error("Failed");
    } catch { toast.dismiss(loadingToast); toast.error("Error"); }
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-bold text-gray-500">Loading Profile...</div>;
  if (!mentor) return <div className="text-center py-20">Mentor not found!</div>;

  return (
    <div className="bg-[#F8FAFC] min-h-screen">
      
      {/* 1. UNIQUE COVER (Geometric Pattern) */}
      <div className="h-64 relative bg-gray-900 overflow-hidden">
        {/* Abstract Background Shapes - Copyright Free Design */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-slate-900 to-slate-800"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute top-1/2 left-10 w-72 h-72 bg-purple-500 rounded-full blur-3xl opacity-10"></div>
        
        {/* Floating Particles (CSS) */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-10 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* === LEFT SIDEBAR (Sticky Profile Card) === */}
            <div className="lg:col-span-4">
                <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-6 border border-gray-100 sticky top-24">
                    
                    {/* Photo */}
                    <div className="relative w-36 h-36 mx-auto mb-4">
                        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full blur opacity-40"></div>
                        <img 
                            src={mentor.image || `https://ui-avatars.com/api/?name=${mentor.username}`} 
                            alt={mentor.username} 
                            className="w-full h-full rounded-full object-cover border-[6px] border-white relative z-10"
                        />
                        <div className="absolute bottom-2 right-2 z-20 bg-green-500 w-5 h-5 rounded-full border-4 border-white" title="Available"></div>
                    </div>

                    <div className="text-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-900 capitalize mb-1">{mentor.username}</h1>
                        <p className="text-sm font-medium text-slate-500 flex justify-center items-center gap-1">
                            {mentor.college}
                            <CheckCircle size={14} className="text-blue-500" />
                        </p>
                    </div>

                    {/* Quick Info Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        <div className="bg-slate-50 p-3 rounded-2xl text-center">
                            <Briefcase size={20} className="mx-auto text-blue-500 mb-1" />
                            <p className="text-xs text-gray-500 uppercase font-bold">Role</p>
                            <p className="text-sm font-semibold truncate">{mentor.role || "Mentor"}</p>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-2xl text-center">
                            <GraduationCap size={20} className="mx-auto text-purple-500 mb-1" />
                            <p className="text-xs text-gray-500 uppercase font-bold">Branch</p>
                            <p className="text-sm font-semibold truncate">{mentor.branch || "Engg"}</p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <button 
                        onClick={handleBookSession}
                        className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold hover:bg-black transition shadow-lg shadow-slate-900/20 flex items-center justify-center gap-2 mb-3"
                    >
                        <Zap size={18} /> Book Priority Session
                    </button>
                    <div className="flex gap-2">
                        <button className="flex-1 border border-gray-200 py-2.5 rounded-xl font-semibold text-gray-600 hover:bg-gray-50 flex justify-center gap-2">
                            <MessageSquare size={18} /> Chat
                        </button>
                        <button className="flex-1 border border-gray-200 py-2.5 rounded-xl font-semibold text-gray-600 hover:bg-gray-50 flex justify-center gap-2">
                            <Share2 size={18} /> Share
                        </button>
                    </div>
                </div>
            </div>

            {/* === RIGHT MAIN CONTENT (Tabs & Details) === */}
            <div className="lg:col-span-8">
                
                {/* Custom Tabs */}
                <div className="bg-white rounded-2xl p-2 mb-6 inline-flex shadow-sm border border-gray-100">
                    <button 
                        onClick={() => setActiveTab('about')}
                        className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'about' ? 'bg-blue-50 text-blue-600 shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        Overview
                    </button>
                    <button 
                        onClick={() => setActiveTab('lectures')}
                        className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'lectures' ? 'bg-blue-50 text-blue-600 shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        Lectures & Resources ({lectures.length})
                    </button>
                </div>

                {/* CONTENT AREA */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 min-h-[400px]">
                    
                    {activeTab === 'about' ? (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <div className="bg-yellow-100 p-2 rounded-lg text-yellow-600"><MapPin size={20}/></div>
                                    About Me
                                </h3>
                                <p className="text-gray-600 leading-8 text-lg">
                                    {mentor.about || "Hello! I am passionate about guiding juniors. I haven't updated my full bio yet, but I'm ready to help you with your career doubts."}
                                </p>
                            </div>
                            
                            {/* Expertise / Tags Section (Unique Touch) */}
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Areas of Expertise</h3>
                                <div className="flex flex-wrap gap-2">
                                    {['Career Guidance', 'Placement Prep', 'Mock Interviews', 'Resume Review', 'Coding'].map((tag, i) => (
                                        <span key={i} className="px-4 py-2 rounded-full bg-gray-50 text-gray-600 text-sm font-medium border border-gray-100 hover:border-blue-200 hover:text-blue-600 transition cursor-default">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {lectures.length > 0 ? (
                                lectures.map(lec => (
                                    <div key={lec._id} onClick={() => window.open(lec.url, '_blank')} className="group flex items-start gap-4 p-5 rounded-2xl border border-gray-100 hover:border-blue-300 hover:shadow-md transition cursor-pointer bg-gray-50 hover:bg-white">
                                        <div className="bg-red-100 text-red-600 p-4 rounded-xl group-hover:bg-red-600 group-hover:text-white transition">
                                            <Video size={24} />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-gray-800 text-lg group-hover:text-blue-600 transition">{lec.title}</h4>
                                            <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                                                <LinkIcon size={12}/> YouTube / External Resource
                                            </p>
                                        </div>
                                        <div className="self-center">
                                            <span className="text-xs font-bold bg-white border px-3 py-1 rounded-full text-gray-500 group-hover:bg-blue-600 group-hover:text-white transition">Watch</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12 text-gray-400">
                                    <Video size={48} className="mx-auto mb-3 opacity-20" />
                                    <p>No resources uploaded yet.</p>
                                </div>
                            )}
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