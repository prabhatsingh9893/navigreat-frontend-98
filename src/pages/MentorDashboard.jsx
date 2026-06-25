import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Video, Trash2, Plus, UploadCloud, Edit2, X, Save,
  GraduationCap, Camera, LogOut, Settings, Copy, Loader2,
  Calendar, Star, BadgeCheck, Wallet, Bell, MessageSquare, ArrowUpRight, Users, ChevronRight
} from "lucide-react";
import toast from 'react-hot-toast';
import Avatar from '../components/Avatar';
import { MetricSkeleton, SessionRowSkeleton } from '../components/SkeletonLoader';
import { API_BASE_URL } from '../config';
import { uploadToCloudinary } from '../utils/upload';

const MentorDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [user, setUser] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [profile, setProfile] = useState({
    username: "", role: "", about: "", college: "", branch: "", image: "",
    meetingId: "", passcode: "", sessionFee: 500,
    skills: ["Career Guidance"], badges: []
  });
  const [lectures, setLectures] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [activeAlert, setActiveAlert] = useState(true);

  // Modals state
  const [isEditing, setIsEditing] = useState(false);
  const [isZoomModal, setIsZoomModal] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [newLecture, setNewLecture] = useState({ title: "", url: "" });

  const [schedule, setSchedule] = useState({
    topic: "", date: "", startTime: "", duration: "60"
  });

  const getYouTubeID = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const fetchContacts = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/contacts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setContacts(data.contacts);
      }
    } catch (error) {
      console.error("Error fetching contacts:", error);
    }
  };

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

        const [mentorRes, lectureRes, sessionRes, bookingRes] = await Promise.all([
          fetch(`${API_BASE_URL}/mentors/${userId}`),
          fetch(`${API_BASE_URL}/lectures/${userId}`),
          fetch(`${API_BASE_URL}/sessions/${userId}`),
          fetch(`${API_BASE_URL}/my-bookings`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          })
        ]);

        const parseResponse = async (res) => res.ok ? res.json() : null;

        const mentorData = await parseResponse(mentorRes);
        const lectureData = await parseResponse(lectureRes);
        const sessionData = await parseResponse(sessionRes);
        const bookingData = await parseResponse(bookingRes);

        if (mentorData && mentorData.success) {
          const m = mentorData.mentor || mentorData.user;
          setProfile(prev => ({ ...prev, ...m }));
          setEditForm(prev => ({ ...prev, ...m }));
        }

        if (lectureData && lectureData.success) setLectures(lectureData.lectures);

        if (sessionData && sessionData.success) {
          const sorted = sessionData.sessions.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
          setSessions(sorted);
        }

        if (bookingData && bookingData.success) {
          setBookings(bookingData.bookings);
        }

        await fetchContacts();

      } catch (error) {
        console.error("Dashboard Load Error:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleStartSession = () => {
    if (!profile.meetingId || !profile.passcode) {
      toast.error("Please setup Zoom Meeting ID in profile first!");
      return;
    }
    navigate('/session', {
      state: {
        meetingNumber: profile.meetingId,
        passWord: profile.passcode,
        role: 1,
        username: profile.username
      }
    });
  };

  const handleScheduleClass = async () => {
    if (!schedule.topic || !schedule.date || !schedule.startTime) {
      toast.error("Please fill all details"); return;
    }

    const startDateTime = new Date(`${schedule.date}T${schedule.startTime}`);
    const now = new Date();

    if (startDateTime < now) {
      toast.error("Cannot schedule classes in the past!");
      return;
    }

    const durationMinutes = parseInt(schedule.duration) || 60;
    const endDateTime = new Date(startDateTime.getTime() + durationMinutes * 60000);

    const loadingToast = toast.loading("Scheduling Class...");

    try {
      const res = await fetch(`${API_BASE_URL}/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          mentorId: user._id || user.id,
          title: schedule.topic,
          startTime: startDateTime,
          endTime: endDateTime
        })
      });
      const data = await res.json();

      if (data.success) {
        toast.success("Class Scheduled Successfully! 📅");
        setSchedule({ topic: "", date: "", startTime: "", duration: "60" });
        const sessionRes = await fetch(`${API_BASE_URL}/sessions/${user._id || user.id}`);
        const sessionData = await sessionRes.json();
        if (sessionData.success) {
          setSessions(sessionData.sessions.sort((a, b) => new Date(a.startTime) - new Date(b.startTime)));
        }
      } else {
        toast.error(data.message || "Failed to schedule");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server Error");
    } finally {
      toast.dismiss(loadingToast);
    }
  };

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

  const handleSaveZoom = async () => {
    if (!editForm.meetingId || !editForm.passcode) {
      toast.error("Enter both ID and Passcode"); return;
    }
    const loadingToast = toast.loading("Configuring...");
    try {
      await fetch(`${API_BASE_URL}/mentors/${user._id || user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ meetingId: editForm.meetingId, passcode: editForm.passcode })
      });
      setProfile({ ...profile, meetingId: editForm.meetingId, passcode: editForm.passcode });
      setIsZoomModal(false);
      toast.dismiss(loadingToast);
      toast.success("Settings Saved!");
    } catch { toast.dismiss(loadingToast); }
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

  const handleAddLecture = async () => {
    if (!newLecture.title || !newLecture.url) { toast.error("Fill all fields"); return; }
    if (!getYouTubeID(newLecture.url)) { toast.error("Invalid YouTube URL"); return; }

    setUploading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/lectures`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ mentorId: user._id || user.id, title: newLecture.title, url: newLecture.url })
      });
      const data = await res.json();
      if (data.success) {
        setLectures([...lectures, data.lecture]);
        setNewLecture({ title: '', url: '' });
        toast.success("Lecture Uploaded!");
      }
    } catch { toast.error("Error uploading"); }
    finally { setUploading(false); }
  };

  const handleDeleteLecture = async (id) => {
    if (!window.confirm("Delete this lecture?")) return;
    try {
      await fetch(`${API_BASE_URL}/lectures/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      setLectures(lectures.filter(l => l._id !== id));
      toast.success("Lecture Removed");
    } catch { toast.error("Failed to delete"); }
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
              <div className="mt-2">
                <label className="text-xs font-bold text-gray-500 dark:text-slate-400 mb-1.5 block">Session Fee (INR)</label>
                <input type="number" min="0" value={editForm.sessionFee || ""} onChange={e => setEditForm({ ...editForm, sessionFee: Number(e.target.value) })} className="w-full border border-slate-200 dark:border-slate-850 dark:bg-[#151f2e] dark:text-white p-3.5 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 transition" placeholder="Session Fee (e.g. 500)" />
              </div>
            </div>
            <button onClick={handleSaveProfile} className="mt-6 w-full bg-gradient-to-r from-teal-600 to-cyan-600 text-white py-3.5 rounded-xl font-bold hover:from-teal-700 hover:to-cyan-700 shadow-lg flex items-center justify-center gap-2 transition"><Save size={18} /> Save Changes</button>
          </div>
        </div>
      )}

      {/* Classroom Setup Modal */}
      {isZoomModal && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2 text-red-600">
                <div className="p-2 bg-red-100 rounded-lg"><Video size={24} /></div>
                <h3 className="text-xl font-bold">Classroom Setup</h3>
              </div>
              <button onClick={() => setIsZoomModal(false)} className="hover:bg-gray-100 p-2 rounded-full"><X /></button>
            </div>
            <div className="space-y-4 mb-6">
              <div className="bg-teal-50 p-4 rounded-xl text-sm text-teal-700 space-y-2">
                <p>Enter your <b>Zoom Personal Meeting ID</b>.</p>
                <p className="font-bold text-red-600">⚠️ Please DISABLE &quot;Waiting Room&quot; in your Zoom Settings so students can join automatically.</p>
              </div>
              <div className="relative">
                <input value={editForm.meetingId} onChange={e => setEditForm({ ...editForm, meetingId: e.target.value })} className="w-full border-2 border-gray-200 p-3 rounded-xl focus:border-red-500 outline-none font-mono text-lg pr-10" placeholder="Zoom ID" />
                {editForm.meetingId && <button onClick={() => copyToClipboard(editForm.meetingId)} className="absolute right-3 top-3.5 text-gray-400 hover:text-teal-600"><Copy size={18} /></button>}
              </div>
              <input value={editForm.passcode} onChange={e => setEditForm({ ...editForm, passcode: e.target.value })} className="w-full border-2 border-gray-200 p-3 rounded-xl focus:border-red-500 outline-none font-mono text-lg" placeholder="Passcode" />
            </div>
            <button onClick={handleSaveZoom} className="w-full bg-red-600 text-white py-3.5 rounded-xl font-bold hover:bg-red-700 shadow-lg flex items-center justify-center gap-2"><Settings size={18} /> Save Configuration</button>
          </div>
        </div>
      )}

      {/* Hero Banner Space */}
      <div className="h-72 bg-gradient-to-r from-slate-900 via-teal-900 to-slate-900 relative shadow-2xl overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 animate-pulse"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>

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
              <div className="absolute -inset-1 bg-gradient-to-r from-teal-650 to-cyan-400 rounded-full blur opacity-25 group-hover:opacity-75 transition duration-500"></div>
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
                {profile.username || "Mentor Workspace"} {profile.isVerified && <BadgeCheck className="w-7 h-7 text-teal-500 inline-block animate-pulse" />}
              </h1>
              <p className="text-sm font-medium flex flex-wrap items-center justify-center md:justify-start gap-3 mt-1.5">
                <span className="bg-teal-650/10 text-teal-600 dark:text-teal-400 px-3 py-0.5 rounded-full font-bold uppercase text-[10px] tracking-widest border border-teal-500/20">Mentor</span>
                <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400 font-semibold text-xs">
                  <GraduationCap size={16} className="text-slate-400" /> {profile.college || "University not set"}
                </span>
              </p>
            </div>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <button onClick={() => { setEditForm(profile); setIsZoomModal(true); }} className="flex-1 md:flex-none bg-white dark:bg-slate-900 text-gray-900 dark:text-white border border-slate-200 dark:border-slate-800 px-6 py-3.5 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-slate-800 hover:border-teal-300 dark:hover:border-teal-600 hover:text-teal-600 dark:hover:text-teal-400 transition-all shadow-sm flex items-center justify-center gap-2 group">
              <div className="p-1 bg-red-100 dark:bg-red-900/30 text-red-650 rounded-lg group-hover:scale-110 transition"><Video size={16} /></div> Setup Zoom
            </button>
            <button onClick={() => { setEditForm(profile); setIsEditing(true); }} className="flex-1 md:flex-none btn-primary px-6 py-3.5 shadow-lg shadow-blue-500/20 hover:scale-[1.02] hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2">
              <Edit2 size={16} /> Edit Profile
            </button>
          </div>
        </div>

        {/* Dashboard grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* TOP HEADER ALERT */}
          {activeAlert && (
            <div className="col-span-1 lg:col-span-3 bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 p-5 rounded-3xl flex items-center justify-between shadow-sm animate-pulse">
              <div className="flex items-center gap-3">
                <Bell className="w-6 h-6 animate-bounce" />
                <div className="text-sm font-extrabold">
                  Students waiting for help: Active chat requests are streaming live.
                </div>
              </div>
              <button onClick={() => setActiveAlert(false)} className="text-xs uppercase font-black hover:opacity-85 tracking-widest px-3 py-1.5 bg-amber-500/20 rounded-xl">
                Dismiss
              </button>
            </div>
          )}

          {/* LEFT 2-COLUMN */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Active Student Inbox thread */}
            <div className="bg-white dark:bg-[#0d1520] p-6 rounded-3xl border border-slate-150/80 dark:border-slate-800/80 shadow-sm space-y-6">
              <h2 className="text-xl font-bold flex items-center gap-2.5 text-gray-800 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-4">
                <MessageSquare className="w-5 h-5 text-teal-650" /> Active Student Inbox
              </h2>
              
              {contacts.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 dark:bg-[#151f2e]/20 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                  <MessageSquare className="mx-auto text-slate-300 mb-3 animate-pulse" size={36} />
                  <h4 className="font-bold text-slate-700 dark:text-slate-200">No active students</h4>
                  <p className="text-xs text-slate-500 mt-1">Student conversations will stream into this feed.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {contacts.map((contact) => (
                    <div 
                      key={contact._id} 
                      className="p-4 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/30 dark:hover:bg-slate-900/85 border border-slate-150/60 dark:border-slate-850 rounded-2xl flex items-center justify-between gap-4 transition duration-300 cursor-pointer"
                      onClick={() => navigate(`/chat/${contact._id}`)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-teal-500 text-white flex items-center justify-center font-black text-sm ring-2 ring-teal-500/10">
                          {contact.username?.charAt(0).toUpperCase() || 'S'}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-slate-900 dark:text-slate-150">{contact.username}</h4>
                          <p className="text-xs text-slate-400 mt-0.5">{contact.email}</p>
                        </div>
                      </div>
                      <button className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition shadow-md shadow-teal-600/10 hover:scale-105 active:scale-95">
                        Reply
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Stats Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Lectures", val: lectures?.length || 0, icon: Video, color: "text-teal-600 dark:text-teal-400", bg: "bg-teal-50 dark:bg-teal-950/40", border: "border-teal-100 dark:border-teal-900/30" },
                { label: "Session Fee", val: `₹${profile.sessionFee || 500}`, icon: Wallet, color: "text-cyan-600 dark:text-cyan-400", bg: "bg-cyan-50 dark:bg-cyan-950/40", border: "border-cyan-100 dark:border-cyan-900/30" },
                { label: "Rating", val: lectures?.length ? "4.9" : "New", icon: Star, color: "text-amber-500 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/10", border: "border-amber-100 dark:border-amber-900/30" },
                { label: profile.isVerified ? "Verified" : "In review", val: profile.isVerified ? "✓" : "…", icon: BadgeCheck, color: profile.isVerified ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400", bg: profile.isVerified ? "bg-emerald-50 dark:bg-emerald-950/40" : "bg-amber-50 dark:bg-amber-900/10", border: profile.isVerified ? "border-emerald-100 dark:border-emerald-900/30" : "border-amber-100 dark:border-amber-900/30" },
              ].map((s, i) => (
                <div key={i} className={`bg-white dark:bg-[#0d1520] p-5 rounded-2xl shadow-sm border ${s.border} flex items-center gap-4 hover:shadow-md hover:scale-[1.02] transition-all duration-300 cursor-default`}>
                  <div className={`p-3.5 rounded-xl ${s.bg} ${s.color}`}><s.icon size={24} /></div>
                  <div><div className="font-extrabold text-2xl text-gray-800 dark:text-gray-100 leading-none mb-1">{s.val}</div><div className="text-xs text-gray-555 dark:text-gray-400 uppercase font-bold tracking-wide">{s.label}</div></div>
                </div>
              ))}
            </div>

            {/* About Profile */}
            <div className="bg-white dark:bg-[#0d1520] p-8 rounded-3xl border border-slate-150/80 dark:border-slate-800/80 shadow-sm relative overflow-hidden">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-gray-800 dark:text-white">
                <span className="bg-teal-100/80 dark:bg-teal-900/20 p-2 rounded-lg text-teal-655 dark:text-[#2dd4bf]"><GraduationCap size={24} /></span> Biography & Overview
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-loose text-lg whitespace-pre-wrap font-medium">{profile.about || "Write something about yourself to inspire students..."}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <div className="px-5 py-2.5 bg-slate-50 dark:bg-[#151f2e] rounded-xl border border-slate-150/85 dark:border-slate-800 text-sm font-bold text-gray-650 dark:text-gray-300 flex items-center gap-2 transition">
                  <GraduationCap size={18} className="text-gray-450" /> {profile.college || "University"}
                </div>
                <div className="px-5 py-2.5 bg-slate-50 dark:bg-[#151f2e] rounded-xl border border-slate-150/85 dark:border-slate-800 text-sm font-bold text-gray-650 dark:text-gray-300 flex items-center gap-2 transition">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div> {profile.branch || "Branch"}
                </div>
              </div>
            </div>

            {/* Resources list upload */}
            <div className="bg-white dark:bg-[#0d1520] p-8 rounded-3xl border border-slate-150/80 dark:border-slate-800/80 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-8">Uploaded Resources <span className="text-slate-400 font-medium ml-2 text-lg">({lectures?.length || 0})</span></h2>
              {lectures?.length === 0 ? (
                <div className="text-center py-16 bg-slate-50 dark:bg-[#151f2e]/20 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-850">
                  <Video className="mx-auto text-gray-300 mb-4" size={56} />
                  <h3 className="text-gray-800 dark:text-white font-bold text-lg">No content yet</h3>
                  <p className="text-slate-500 font-medium mt-1">Upload YouTube links of your lectures.</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-6">
                  {lectures.map(l => {
                    const vidId = getYouTubeID(l.url);
                    return (
                      <div key={l._id} className="bg-white dark:bg-[#151f2e]/40 rounded-2xl overflow-hidden border border-slate-150/80 dark:border-slate-800/80 group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
                        <div className="h-48 bg-gray-900 relative overflow-hidden">
                          <img src={vidId ? `https://img.youtube.com/vi/${vidId}/mqdefault.jpg` : "https://via.placeholder.com/300x200"} className="w-full h-full object-cover opacity-80 group-hover:scale-105 group-hover:opacity-100 transition duration-700" alt="Thumb" />
                          <a href={l.url} target="_blank" rel="noreferrer" className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition">
                            <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition"><Video className="text-red-650 ml-1" size={24} /></div>
                          </a>
                        </div>
                        <div className="p-5 flex-1 flex flex-col justify-between">
                          <h4 className="font-bold text-gray-800 dark:text-slate-200 mb-2 leading-snug line-clamp-2 text-lg group-hover:text-teal-600 dark:group-hover:text-teal-400 transition">{l.title}</h4>
                          <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-150 dark:border-slate-800">
                            <span className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">YouTube</span>
                            <button onClick={() => handleDeleteLecture(l._id)} className="text-gray-450 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition"><Trash2 size={18} /></button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-8">
            
            {/* SESSIONS SCHEDULER */}
            <div className="bg-white dark:bg-[#0d1520] rounded-3xl shadow-xl shadow-teal-100/5 dark:shadow-teal-950/10 border border-slate-150/80 dark:border-slate-800/80 overflow-hidden">
              <div className="bg-gradient-to-r from-teal-600 to-cyan-600 p-6 text-white relative overflow-hidden">
                <h3 className="font-bold text-xl flex items-center gap-2"><Calendar size={22} className="text-teal-200 animate-pulse" /> Schedule Class</h3>
                <p className="text-teal-100 text-sm mt-1 font-medium">Create a new live classroom for students.</p>
              </div>
              <div className="p-6 space-y-5">
                <div>
                  <label className="text-xs font-extrabold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 block ml-1">Topic</label>
                  <input value={schedule.topic} onChange={e => setSchedule({ ...schedule, topic: e.target.value })} placeholder="e.g. Weekly Doubt Clearing" className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 focus:border-teal-500 outline-none bg-slate-50 dark:bg-[#151f2e] focus:bg-white dark:focus:bg-[#0d1520] dark:text-white transition-all font-medium" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-extrabold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 block ml-1">Date</label>
                    <input type="date" value={schedule.date} onChange={e => setSchedule({ ...schedule, date: e.target.value })} className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 focus:border-teal-500 outline-none bg-slate-50 dark:bg-[#151f2e] focus:bg-white dark:focus:bg-[#0d1520] dark:text-white transition-all font-medium text-sm font-sans" />
                  </div>
                  <div>
                    <label className="text-xs font-extrabold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 block ml-1">Time</label>
                    <input type="time" value={schedule.startTime} onChange={e => setSchedule({ ...schedule, startTime: e.target.value })} className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 focus:border-teal-500 outline-none bg-slate-50 dark:bg-[#151f2e] focus:bg-white dark:focus:bg-[#0d1520] dark:text-white transition-all font-medium text-sm font-sans" />
                  </div>
                </div>
                <button onClick={handleScheduleClass} className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 text-white py-4 rounded-xl font-bold hover:from-teal-700 hover:to-cyan-700 shadow-lg shadow-teal-500/20 hover:-translate-y-0.5 transition-all flex justify-center gap-2 items-center group active:scale-95 duration-200">
                  <Plus size={20} className="group-hover:rotate-90 transition duration-300" /> Schedule Session
                </button>
              </div>

              {sessions?.length > 0 && (
                <div className="border-t border-slate-150 dark:border-slate-850 bg-slate-50 dark:bg-[#151f2e]/20 p-4">
                  <h4 className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-3 px-2">Upcoming Classes</h4>
                  <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar pr-1">
                    {sessions.map(s => (
                      <div key={s._id} className="bg-white dark:bg-[#0d1520] border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex justify-between items-center group hover:border-teal-300 dark:hover:border-teal-800 transition-colors shadow-sm">
                        <div>
                          <div className="font-bold text-gray-800 dark:text-slate-200 text-sm mb-1">{s.title}</div>
                          <div className="text-xs text-teal-600 dark:text-teal-400 font-bold bg-teal-50 dark:bg-teal-950/40 px-2 py-1 rounded-md inline-block border border-teal-150 dark:border-teal-900/30">
                            {new Date(s.startTime).toLocaleDateString(undefined, { weekday: 'short' })}, {new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                        <button onClick={() => handleStartSession(s)} className="bg-green-100 text-green-700 p-2.5 rounded-xl hover:bg-green-600 hover:text-white transition-all shadow-sm">
                          <Video size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* REQUESTS CARD */}
            <div className="bg-white dark:bg-[#0d1520] rounded-3xl border border-slate-150/80 dark:border-slate-800/80 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-150 dark:border-slate-800 flex items-center justify-between">
                <h3 className="font-bold text-lg text-gray-800 dark:text-white flex items-center gap-2"><Users size={20} className="text-cyan-600" /> Student Booking Requests</h3>
                <span className="bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-400 text-xs font-bold px-2 py-1 rounded-full border border-teal-100 dark:border-teal-900/30">{bookings?.length || 0} New</span>
              </div>
              {bookings?.length === 0 ? (
                <div className="p-8 text-center bg-slate-50/20 dark:bg-slate-900/10">
                  <p className="text-gray-400 text-sm font-medium italic">No pending requests.</p>
                </div>
              ) : (
                <div className="max-h-80 overflow-y-auto custom-scrollbar p-0">
                  {bookings?.map((b, idx) => (
                    <div key={b._id} className={`p-5 hover:bg-teal-50/30 dark:hover:bg-teal-950/25 transition-colors ${idx !== (bookings?.length || 0) - 1 ? 'border-b border-slate-100 dark:border-slate-800' : ''}`}>
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-gray-800 dark:text-slate-200 text-sm">{b.studentEmail || "Student"}</h4>
                        <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-slate-400 tracking-wide font-mono">{new Date(b.date).toLocaleDateString()}</span>
                      </div>
                      {b.message ? (
                        <p className="text-sm text-gray-600 dark:text-gray-300 bg-slate-500/5 dark:bg-[#151f2e] p-2.5 border border-slate-200 dark:border-slate-850 rounded-lg leading-relaxed">&quot;{b.message}&quot;</p>
                      ) : <span className="text-xs text-gray-400 italic">No message attached</span>}
                      <div className="mt-3 flex gap-2">
                        <button className="flex-1 text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 py-2 rounded-lg text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800 transition">Dismiss</button>
                        <button className="flex-1 text-xs font-bold bg-gradient-to-r from-teal-600 to-cyan-600 text-white py-2 rounded-lg hover:from-teal-700 hover:to-cyan-700 transition shadow-md" onClick={() => navigate(`/chat/${b.studentId}`)}>Reply</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* CONTENT UPLOAD */}
            <div className="bg-white dark:bg-[#0d1520] rounded-3xl border border-slate-150/80 dark:border-slate-800/80 overflow-hidden shadow-sm">
              <div className="bg-gradient-to-r from-teal-600 to-cyan-600 p-6 text-white relative overflow-hidden">
                <h3 className="font-bold text-xl relative z-10 flex items-center gap-2"><UploadCloud size={22} className="text-teal-200 animate-pulse" /> Upload Content</h3>
                <p className="text-teal-100 text-sm mt-1 font-medium font-sans">Share video links with students</p>
              </div>
              <div className="p-6 space-y-4">
                <input placeholder="Video Title" value={newLecture.title} onChange={e => setNewLecture({ ...newLecture, title: e.target.value })} className="input-premium" />
                <input placeholder="YouTube URL" value={newLecture.url} onChange={e => setNewLecture({ ...newLecture, url: e.target.value })} className="input-premium" />
                <button onClick={handleAddLecture} disabled={uploading} className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-extrabold py-4 rounded-xl hover:from-teal-600 hover:to-cyan-600 transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-70 active:scale-95 duration-200">
                  {uploading ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
                  {uploading ? "Publishing..." : "Upload Video"}
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default MentorDashboard;
