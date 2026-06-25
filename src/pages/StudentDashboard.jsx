import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users, Clock, Star, Edit2, X, Save,
  GraduationCap, Camera, LogOut, Settings, Calendar, CheckCircle, Sparkles, ChevronRight, AlertCircle, Compass, BadgeCheck
} from "lucide-react";
import toast from 'react-hot-toast';
import Avatar from '../components/Avatar';
import { API_BASE_URL } from '../config';
import { uploadToCloudinary } from '../utils/upload';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [profile, setProfile] = useState({
    username: "", role: "", about: "", college: "", branch: "", image: "",
    meetingId: "", passcode: "", sessionFee: 500,
    skills: ["Career Guidance"], badges: []
  });
  const [mentorsList, setMentorsList] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedUser = localStorage.getItem('userData');
        if (!storedUser) { navigate('/login'); return; }

        let parsedUser;
        try { parsedUser = JSON.parse(storedUser); }
        catch { localStorage.removeItem('userData'); navigate('/login'); return; }

        setUser(parsedUser);
        const userId = parsedUser.id || parsedUser._id;
        if (!userId) { localStorage.removeItem('userData'); navigate('/login'); return; }

        const [mentorRes, bookingRes, activeMentorsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/mentors/${userId}`),
          fetch(`${API_BASE_URL}/my-bookings`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          }),
          fetch(`${API_BASE_URL}/mentors`)
        ]);

        const parseResponse = async (res) => res.ok ? res.json() : null;

        const mentorData = await parseResponse(mentorRes);
        const bookingData = await parseResponse(bookingRes);
        const activeMentorsData = await parseResponse(activeMentorsRes);

        if (mentorData && mentorData.success) {
          const m = mentorData.mentor || mentorData.user;
          setProfile(prev => ({ ...prev, ...m }));
          setEditForm(prev => ({ ...prev, ...m }));
        }

        if (bookingData && bookingData.success) {
          setBookings(bookingData.bookings);
        }

        if (activeMentorsData && activeMentorsData.success && Array.isArray(activeMentorsData.mentors)) {
          setMentorsList(activeMentorsData.mentors.filter(m => m.role === 'mentor').slice(0, 3));
        }

      } catch (error) {
        console.error("Dashboard Load Error:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const [selectedFile, setSelectedFile] = useState(null);

  const handleSaveProfile = async () => {
    const loadingToast = toast.loading("Saving Profile...");
    try {
      let imageUrl = editForm.image;

      if (selectedFile) {
        try {
          const uploadResult = await uploadToCloudinary(selectedFile);
          imageUrl = uploadResult.url;
        } catch (err) {
          console.error("Upload failed", err);
          toast.error("Image upload failed");
          toast.dismiss(loadingToast);
          return;
        }
      }

      const updatedData = { ...editForm, image: imageUrl };

      await fetch(`${API_BASE_URL}/mentors/${user._id || user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(updatedData)
      });

      setProfile(updatedData);
      setUser(prev => ({ ...prev, ...updatedData }));
      setIsEditing(false);
      setSelectedFile(null);

      const storedUser = JSON.parse(localStorage.getItem('userData') || '{}');
      const newUserData = { ...storedUser, ...updatedData };
      localStorage.setItem('userData', JSON.stringify(newUserData));

      window.dispatchEvent(new Event('userUpdated'));
      toast.dismiss(loadingToast);
      toast.success("Profile Updated!");
    } catch (error) {
      console.error(error);
      toast.dismiss(loadingToast);
      toast.error("Update failed");
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5000000) { toast.error("Max 5MB"); return; }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => setEditForm(prev => ({ ...prev, image: reader.result }));
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080d14] font-sans pb-20 relative animate-pulse">
      <div className="h-[72px] bg-white dark:bg-[#0d1117] border-b border-slate-200/60 dark:border-white/[0.06]" />
      <div className="h-72 bg-slate-200 dark:bg-slate-800" />
      <div className="max-w-7xl mx-auto px-6 -mt-32 relative z-10 space-y-6">
        <div className="flex items-end gap-8 mb-12">
          <div className="w-48 h-48 rounded-full bg-slate-300 dark:bg-slate-700 border-[6px] border-white dark:border-[#080d14] shadow-2xl" />
          <div className="flex-1 space-y-3">
            <div className="h-8 bg-slate-300 dark:bg-slate-700 rounded-lg w-1/3" />
            <div className="h-5 bg-slate-300 dark:bg-slate-700 rounded-lg w-1/4" />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080d14] font-sans pb-20 relative transition-colors duration-500">
      
      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#0d1520] dark:text-slate-200 rounded-3xl w-full max-w-2xl shadow-2xl p-6 flex flex-col max-h-[90vh] overflow-y-auto border border-slate-150/80 dark:border-slate-800/80 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6 border-b border-slate-150 dark:border-slate-800 pb-4">
              <h3 className="text-xl font-bold">Edit Profile</h3>
              <button onClick={() => setIsEditing(false)} className="hover:bg-gray-100 dark:hover:bg-slate-850 p-2 rounded-full"><X /></button>
            </div>

            <div className="flex justify-center mb-6">
              <div className="relative w-32 h-32 group">
                <Avatar
                  src={editForm.image || profile.image}
                  name={editForm.username}
                  size="w-32 h-32"
                  fontSize="text-4xl"
                />
                <label className="absolute bottom-0 right-0 bg-teal-600 p-2.5 rounded-full text-white cursor-pointer hover:bg-teal-700 shadow-lg transition hover:scale-110">
                  <Camera size={18} /><input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              </div>
            </div>

            <div className="space-y-4">
              <input value={editForm.username} onChange={e => setEditForm({ ...editForm, username: e.target.value })} className="w-full border border-slate-200 dark:border-slate-850 dark:bg-[#151f2e] dark:text-white p-3.5 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 transition" placeholder="Full Name" />
              <textarea value={editForm.about} onChange={e => setEditForm({ ...editForm, about: e.target.value })} className="w-full border border-slate-200 dark:border-slate-850 dark:bg-[#151f2e] dark:text-white p-3.5 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 transition" rows="4" placeholder="About yourself..." />
              <div className="grid md:grid-cols-2 gap-4">
                <input value={editForm.college} onChange={e => setEditForm({ ...editForm, college: e.target.value })} className="w-full border border-slate-200 dark:border-slate-850 dark:bg-[#151f2e] dark:text-white p-3.5 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 transition" placeholder="College" />
                <input value={editForm.branch} onChange={e => setEditForm({ ...editForm, branch: e.target.value })} className="w-full border border-slate-200 dark:border-slate-850 dark:bg-[#151f2e] dark:text-white p-3.5 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 transition" placeholder="Branch" />
              </div>
            </div>
            <button onClick={handleSaveProfile} className="mt-6 w-full bg-gradient-to-r from-teal-600 to-cyan-600 text-white py-3.5 rounded-xl font-bold hover:from-teal-700 hover:to-cyan-700 shadow-lg flex items-center justify-center gap-2 transition"><Save size={18} /> Save Changes</button>
          </div>
        </div>
      )}

      {/* Hero Banner Area */}
      <div className="h-72 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 relative shadow-2xl overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 animate-pulse"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

        <button onClick={() => { localStorage.removeItem('userData'); localStorage.removeItem('token'); navigate('/login'); }} className="absolute top-6 right-6 bg-white/10 backdrop-blur-md text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-white/20 flex items-center gap-2 border border-white/10 transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] z-20">
          <LogOut size={16} /> Logout
        </button>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-6 -mt-20 relative z-10">
        
        {/* Welcome Glass Card Header */}
        <div className="glass p-8 rounded-3xl border border-slate-200/50 dark:border-white/[0.06] shadow-xl flex flex-col md:flex-row items-center md:items-end justify-between gap-6 mb-10 transition-all">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6 text-center md:text-left w-full md:w-auto">
            <div className="relative group -mt-16 md:-mt-20">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full blur opacity-25 group-hover:opacity-75 transition duration-500"></div>
              <Avatar
                src={profile.image}
                name={profile.username}
                size="w-40 h-40"
                fontSize="text-5xl"
                className="bg-white dark:bg-slate-950 border-[6px] border-white dark:border-slate-900 shadow-2xl relative"
              />
            </div>
            <div className="space-y-1">
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center justify-center md:justify-start gap-2">
                Welcome back, {profile.username || "Student"}! <Sparkles className="w-6 h-6 text-amber-500 animate-pulse" />
              </h1>
              <p className="text-sm font-medium flex flex-wrap items-center justify-center md:justify-start gap-3 mt-1.5">
                <span className="bg-blue-600/10 text-blue-600 dark:text-blue-400 px-3 py-0.5 rounded-full font-bold uppercase text-[10px] tracking-widest border border-blue-500/20">Student</span>
                <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400 font-semibold text-xs">
                  <GraduationCap size={16} className="text-slate-400" /> {profile.college || "University not set"}
                </span>
              </p>
            </div>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <button onClick={() => { setEditForm(profile); setIsEditing(true); }} className="flex-1 md:flex-none btn-primary px-6 py-3.5 shadow-lg shadow-blue-500/20 hover:scale-[1.02] hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2">
              <Edit2 size={16} /> Edit Profile
            </button>
          </div>
        </div>

        {/* Dash Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT 2-COLUMN COLUMN */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* PROFILE COMPLETION ALERT */}
            {(!profile.college || !profile.branch || !profile.about?.trim()) && (
              <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 dark:border-amber-500/10 rounded-3xl p-6 flex flex-col sm:flex-row items-center gap-5 shadow-sm animate-pulse">
                <div className="p-4 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex-shrink-0">
                  <Sparkles size={24} />
                </div>
                <div className="flex-1 text-center sm:text-left space-y-0.5">
                  <p className="font-extrabold text-slate-900 dark:text-white">Complete your profile setup</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">Add your university details and biography to connect with aligned mentors.</p>
                </div>
                <button onClick={() => { setEditForm(profile); setIsEditing(true); }} className="px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-500 text-white hover:bg-amber-600 active:scale-95 transition-all shadow-md">
                  Complete Profile
                </button>
              </div>
            )}

            {/* Stats Cards Grid */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Requests Sent", val: bookings?.length || 0, icon: Users, color: "text-teal-500 dark:text-teal-400", bg: "bg-teal-50 dark:bg-teal-950/40", border: "border-teal-150/40 dark:border-teal-900/30", glow: "hover:shadow-teal-500/10" },
                { label: "Confirmed", val: bookings?.filter(b => b.status === 'confirmed').length || 0, icon: CheckCircle, color: "text-emerald-500 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/40", border: "border-emerald-150/40 dark:border-emerald-900/30", glow: "hover:shadow-emerald-500/10" },
                { label: "Pending", val: bookings?.filter(b => b.status !== 'confirmed' && b.status !== 'failed').length || 0, icon: Clock, color: "text-amber-500 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/10", border: "border-amber-150/40 dark:border-amber-900/30", glow: "hover:shadow-amber-500/10" },
              ].map((s, i) => (
                <div key={i} className={`bg-white dark:bg-[#0d1520] p-5 rounded-2xl border ${s.border} flex flex-col sm:flex-row items-center gap-3 sm:gap-4 hover:border-blue-400/40 hover:scale-[1.03] transition-all duration-300 shadow-sm ${s.glow} cursor-default text-center sm:text-left`}>
                  <div className={`p-3 rounded-xl ${s.color} ${s.bg}`}><s.icon size={22} /></div>
                  <div>
                    <div className="font-black text-2xl text-slate-800 dark:text-slate-100 leading-none mb-1">{s.val}</div>
                    <div className="text-[10px] text-slate-450 dark:text-slate-400 uppercase font-black tracking-widest">{s.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Active Mentors Catalog list */}
            <div className="bg-white dark:bg-[#0d1520] p-6 rounded-3xl border border-slate-150/80 dark:border-slate-800/80 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <h2 className="text-xl font-bold flex items-center gap-2.5 text-slate-800 dark:text-white">
                  <Compass className="w-5 h-5 text-blue-500 animate-spin-slow" /> Active Mentor Directory
                </h2>
                <button onClick={() => navigate('/mentors')} className="text-xs font-bold text-blue-500 hover:underline">
                  View All
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {mentorsList.length === 0 ? (
                  <div className="text-center py-10 bg-slate-50 dark:bg-[#151f2e]/20 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                    <Users className="mx-auto text-slate-350 mb-3" size={32} />
                    <h4 className="font-bold text-slate-700 dark:text-slate-200">No mentors available</h4>
                  </div>
                ) : (
                  mentorsList.map((mentor) => (
                    <div key={mentor._id} className="p-4 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/30 dark:hover:bg-slate-900/80 border border-slate-150/50 dark:border-slate-850 rounded-2xl flex items-center justify-between gap-4 transition duration-300">
                      <div className="flex items-center gap-3">
                        <Avatar src={mentor.image} name={mentor.username} size="w-12 h-12" fontSize="text-sm" className="ring-2 ring-blue-500/10" />
                        <div>
                          <h4 className="font-bold text-sm text-slate-900 dark:text-slate-150 flex items-center gap-1.5">
                            {mentor.username}
                            {mentor.isVerified && <BadgeCheck className="w-4 h-4 text-teal-500" />}
                          </h4>
                          <p className="text-xs text-slate-400 mt-0.5 font-medium">{mentor.college || "Senior Advisor"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => navigate(`/chat/${mentor._id || mentor.id}`)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-blue-500/10 hover:scale-105 active:scale-95"
                        >
                          Connect
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* MY REQUESTS SECTION */}
            <div className="bg-white dark:bg-[#0d1520] rounded-3xl border border-slate-150/80 dark:border-slate-800/80 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-150 dark:border-slate-800 flex items-center justify-between">
                <h3 className="font-bold text-xl text-gray-800 dark:text-white flex items-center gap-2"><Clock size={22} className="text-teal-650" /> My Booking Requests</h3>
              </div>
              
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {!bookings?.length ? (
                  <div className="px-6 py-12 text-center bg-slate-50/20 dark:bg-slate-900/10">
                    <p className="font-bold text-slate-700 dark:text-slate-200 mb-1">No bookings found</p>
                    <p className="text-xs text-slate-450 dark:text-slate-400 mb-5 max-w-xs mx-auto">Query and coordinate sessions with our verified guides.</p>
                    <button onClick={() => navigate('/mentors')} className="btn-primary px-6 py-3 rounded-xl text-xs">
                      Search mentors
                    </button>
                  </div>
                ) : (
                  bookings?.map((b) => (
                    <div key={b._id} className="p-6 hover:bg-slate-50 dark:hover:bg-[#151f2e]/60 transition duration-300">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-bold text-slate-850 dark:text-white text-md">Mentor: {b.mentorName || "Unknown Guide"}</h4>
                          <p className="text-xs text-slate-400 dark:text-slate-500 font-mono mt-0.5">{new Date(b.date).toLocaleDateString()}</p>
                        </div>
                        {b.status === 'confirmed' ? (
                          <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider scale-95 border border-emerald-500/20 shadow-sm shadow-emerald-500/10">Confirmed</span>
                        ) : b.status === 'failed' ? (
                          <span className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider scale-95 border border-red-500/20 shadow-sm shadow-red-500/10">Failed</span>
                        ) : (
                          <span className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider scale-95 border border-yellow-500/20 shadow-sm shadow-yellow-500/10">Pending Payment</span>
                        )}
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-[#151f2e] p-3 border border-slate-200 dark:border-slate-800/80 rounded-xl italic text-sm mt-3 leading-relaxed">&quot;{b.message}&quot;</p>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">
            
            {/* Ask a Doubt card component */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-650 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[220px] group border border-blue-500/30 shadow-blue-500/15">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-115 transition duration-500"><AlertCircle size={100} /></div>
              <div>
                <h3 className="font-extrabold text-lg flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-blue-200 animate-pulse" /> Ask a Doubt
                </h3>
                <p className="text-blue-100 text-xs leading-relaxed mt-2.5">
                  Reach out instantly to clarify concepts, plan examination prep maps, or review code scripts.
                </p>
              </div>
              <button 
                onClick={() => navigate('/chat')}
                className="w-full bg-white text-blue-700 py-3.5 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition shadow-lg active:scale-95 duration-200 mt-4"
              >
                Initiate Chat
              </button>
            </div>

            {/* Quick links Card */}
            <div className="bg-white dark:bg-[#0d1520] rounded-3xl border border-slate-150/80 dark:border-slate-800/80 p-6 space-y-3 shadow-sm">
              <h3 className="font-extrabold text-slate-800 dark:text-white mb-4">Student Shortcuts</h3>
              <button onClick={() => navigate('/mentors')} className="w-full bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-850 p-4 rounded-xl font-bold text-slate-700 dark:text-slate-350 hover:text-blue-600 flex items-center justify-between transition group">
                <span className="flex items-center gap-3"><Compass size={20} className="text-slate-450" /> Browse Mentors</span>
                <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
              </button>
              <button onClick={() => { setEditForm(profile); setIsEditing(true); }} className="w-full bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-850 p-4 rounded-xl font-bold text-slate-700 dark:text-slate-350 hover:text-blue-600 flex items-center justify-between transition group">
                <span className="flex items-center gap-3"><Settings size={20} className="text-slate-450" /> Settings & Profile</span>
                <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default StudentDashboard;
