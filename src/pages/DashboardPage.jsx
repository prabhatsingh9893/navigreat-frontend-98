import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// Icons
import {
    Share2, BadgeCheck, Users, Clock, Star, Video, Trash2, Plus,
    UploadCloud, Edit2, X, Save, GraduationCap, Camera, LogOut,
    Settings, Copy, Loader2, Calendar
} from "lucide-react";
import toast from 'react-hot-toast';
import Avatar from '../components/Avatar'; // ✅ Import Avatar Component

// API URL Constant
import { API_BASE_URL } from '../config';

const DashboardPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    // User Data
    const [user, setUser] = useState(null);
    const [sessions, setSessions] = useState([]); // ✅ NEW: Sessions List
    const [profile, setProfile] = useState({
        username: "", role: "Mentor", about: "", college: "", branch: "", image: "",
        meetingId: "", passcode: "",
        skills: ["Career Guidance"], badges: ["Verified Mentor"]
    });
    const [lectures, setLectures] = useState([]);
    const [bookings, setBookings] = useState([]); // ✅ NEW: Bookings State

    // ✅ NEW STATE: CLASS SCHEDULER
    const [schedule, setSchedule] = useState({
        topic: "",
        date: "",
        startTime: "",
        duration: "60" // Default 1 hour
    });

    // Modals State
    const [isEditing, setIsEditing] = useState(false);
    const [isZoomModal, setIsZoomModal] = useState(false);

    const [editForm, setEditForm] = useState({});
    const [newLecture, setNewLecture] = useState({ title: "", url: "" });

    // --- HELPER: Get YouTube ID safely ---
    const getYouTubeID = (url) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    // --- HELPER: Copy to Clipboard ---
    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard!");
    };

    // --- 1. INITIAL FETCH ---
    useEffect(() => {
        const fetchData = async () => {
            try {
                const storedUser = localStorage.getItem('userData');
                if (!storedUser) { navigate('/login'); return; }

                let parsedUser;
                try { parsedUser = JSON.parse(storedUser); }
                catch (e) { localStorage.removeItem('userData'); navigate('/login'); return; }

                setUser(parsedUser);

                const userId = parsedUser.id || parsedUser._id;
                if (!userId) { localStorage.removeItem('userData'); navigate('/login'); return; }

                // Parallel Fetching (Added Sessions)
                const [mentorRes, lectureRes, sessionRes, bookingRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/mentors/${userId}`),
                    fetch(`${API_BASE_URL}/lectures/${userId}`),
                    fetch(`${API_BASE_URL}/sessions/${userId}`), // ✅ Fetch Sessions
                    fetch(`${API_BASE_URL}/sessions/${userId}`),
                    fetch(`${API_BASE_URL}/my-bookings`, { // ✅ Use Smart Route
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
                    setEditForm(prev => ({ ...prev, ...m })); // ✅ Initialize editForm with saved data
                }

                if (lectureData && lectureData.success) setLectures(lectureData.lectures);

                // ✅ Set Sessions
                if (sessionData && sessionData.success) {
                    // Sort by date/time
                    const sorted = sessionData.sessions.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
                    setSessions(sorted);
                }

                // ✅ Set Bookings
                if (bookingData && bookingData.success) {
                    setBookings(bookingData.bookings);
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

    // ... (helper functions) ...

    const handleStartSession = (session) => {
        if (!profile.meetingId || !profile.passcode) {
            toast.error("Please setup Zoom Meeting ID in profile first!");
            return;
        }
        // Navigate to LiveSession as HOST (Role 1)
        navigate('/session', {
            state: {
                meetingNumber: profile.meetingId,
                passWord: profile.passcode,
                role: 1, // ✅ HOST ROLE
                username: profile.username
            }
        });
    };

    // --- 2. SAVE HANDLERS ---

    // ✅ NEW: HANDLE SCHEDULE CLASS
    const handleScheduleClass = async () => {
        if (!schedule.topic || !schedule.date || !schedule.startTime) {
            toast.error("Please fill all details"); return;
        }

        // Combine Date and Time
        const startDateTime = new Date(`${schedule.date}T${schedule.startTime}`);
        // Calculate End Time
        const endDateTime = new Date(startDateTime.getTime() + schedule.duration * 60000);

        const loadingToast = toast.loading("Scheduling Class...");

        try {
            const res = await fetch(`${API_BASE_URL}/sessions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    mentorId: user._id,
                    title: schedule.topic,
                    startTime: startDateTime,
                    endTime: endDateTime
                })
            });
            const data = await res.json();

            if (data.success) {
                toast.success("Class Scheduled Successfully! 📅");
                setSchedule({ topic: "", date: "", startTime: "", duration: "60" }); // Reset Form
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

    const handleSaveProfile = async () => {
        const loadingToast = toast.loading("Saving Profile...");
        try {
            await updateBackend(editForm);
            setProfile({ ...profile, ...editForm });
            setIsEditing(false);
            toast.dismiss(loadingToast);
            toast.success("Profile Updated!");
        } catch (error) { toast.dismiss(loadingToast); }
    };

    const handleSaveZoom = async () => {
        if (!editForm.meetingId || !editForm.passcode) {
            toast.error("Enter both ID and Passcode"); return;
        }
        const loadingToast = toast.loading("Configuring...");
        try {
            await updateBackend({ meetingId: editForm.meetingId, passcode: editForm.passcode });
            setProfile({ ...profile, meetingId: editForm.meetingId, passcode: editForm.passcode });
            setIsZoomModal(false);
            toast.dismiss(loadingToast);
            toast.success("Settings Saved!");
        } catch (error) { toast.dismiss(loadingToast); }
    };

    const updateBackend = async (dataToUpdate) => {
        await fetch(`${API_BASE_URL}/mentors/${user._id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(dataToUpdate)
        });
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5000000) { toast.error("Max 5MB"); return; }
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onloadend = () => setEditForm({ ...editForm, image: reader.result });
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
                body: JSON.stringify({ mentorId: user._id, title: newLecture.title, url: newLecture.url })
            });
            const data = await res.json();
            if (data.success) {
                setLectures([...lectures, data.lecture]);
                setNewLecture({ title: '', url: '' });
                toast.success("Lecture Uploaded!");
            }
        } catch (error) { toast.error("Error uploading"); }
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
        } catch (error) { toast.error("Failed to delete"); }
    };

    if (loading) return (
        <div className="h-screen flex flex-col items-center justify-center gap-4 text-blue-600">
            <Loader2 className="animate-spin" size={48} />
            <p className="font-bold animate-pulse">Loading Dashboard...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 font-sans pb-20 relative">

            {/* --- MODAL 1: EDIT PROFILE --- */}
            {isEditing && (
                <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl p-6 flex flex-col max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6 border-b pb-4">
                            <h3 className="text-xl font-bold">Edit Profile</h3>
                            <button onClick={() => setIsEditing(false)} className="hover:bg-gray-100 p-2 rounded-full"><X /></button>
                        </div>

                        <div className="flex justify-center mb-6">
                            <div className="relative w-32 h-32 group">
                                <Avatar
                                    src={editForm.image || profile.image}
                                    name={editForm.username}
                                    size="w-32 h-32"
                                    fontSize="text-4xl"
                                />
                                <label className="absolute bottom-0 right-0 bg-blue-600 p-2.5 rounded-full text-white cursor-pointer hover:bg-blue-700 shadow-lg transition hover:scale-110">
                                    <Camera size={18} /><input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                                </label>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <input value={editForm.username} onChange={e => setEditForm({ ...editForm, username: e.target.value })} className="w-full border p-3 rounded-xl" placeholder="Full Name" />
                            <textarea value={editForm.about} onChange={e => setEditForm({ ...editForm, about: e.target.value })} className="w-full border p-3 rounded-xl" rows="4" placeholder="About yourself..." />
                            <div className="grid md:grid-cols-2 gap-4">
                                <input value={editForm.college} onChange={e => setEditForm({ ...editForm, college: e.target.value })} className="w-full border p-3 rounded-xl" placeholder="College" />
                                <input value={editForm.branch} onChange={e => setEditForm({ ...editForm, branch: e.target.value })} className="w-full border p-3 rounded-xl" placeholder="Branch" />
                            </div>
                        </div>
                        <button onClick={handleSaveProfile} className="mt-6 w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 shadow-lg flex items-center justify-center gap-2"><Save size={18} /> Save Changes</button>
                    </div>
                </div>
            )}

            {/* --- MODAL 2: ZOOM SETTINGS --- */}
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
                            <div className="bg-blue-50 p-4 rounded-xl text-sm text-blue-700">Enter your <b>Zoom Personal Meeting ID</b>.</div>
                            <div className="relative">
                                <input value={editForm.meetingId} onChange={e => setEditForm({ ...editForm, meetingId: e.target.value })} className="w-full border-2 border-gray-200 p-3 rounded-xl focus:border-red-500 outline-none font-mono text-lg pr-10" placeholder="Zoom ID" />
                                {editForm.meetingId && <button onClick={() => copyToClipboard(editForm.meetingId)} className="absolute right-3 top-3.5 text-gray-400 hover:text-blue-600"><Copy size={18} /></button>}
                            </div>
                            <input value={editForm.passcode} onChange={e => setEditForm({ ...editForm, passcode: e.target.value })} className="w-full border-2 border-gray-200 p-3 rounded-xl focus:border-red-500 outline-none font-mono text-lg" placeholder="Passcode" />
                        </div>
                        <button onClick={handleSaveZoom} className="w-full bg-red-600 text-white py-3.5 rounded-xl font-bold hover:bg-red-700 shadow-lg flex items-center justify-center gap-2"><Settings size={18} /> Save Configuration</button>
                    </div>
                </div>
            )}

            {/* --- HEADER --- */}
            <div className="h-72 bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 relative shadow-2xl overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 animate-pulse"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>

                <button onClick={() => { localStorage.removeItem('userData'); navigate('/login'); }} className="absolute top-6 right-6 bg-white/10 backdrop-blur-md text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-white/20 flex items-center gap-2 border border-white/10 transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] z-20">
                    <LogOut size={16} /> Logout
                </button>
            </div>

            <div className="max-w-7xl mx-auto px-6 -mt-32 relative z-10">
                <div className="flex flex-col md:flex-row items-end gap-8 mb-12">
                    {/* Profile Image */}
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full blur opacity-25 group-hover:opacity-75 transition duration-500"></div>
                        <Avatar
                            src={profile.image}
                            name={profile.username}
                            size="w-48 h-48"
                            fontSize="text-6xl"
                            className="bg-white border-[6px] border-white shadow-2xl relative"
                        />
                        <div className="absolute bottom-5 right-5 bg-blue-600 text-white p-2 rounded-full border-4 border-white shadow-lg" title="Verified Mentor"><BadgeCheck size={24} /></div>
                    </div>

                    {/* Profile Info */}
                    <div className="flex-1 mb-2 text-center md:text-left">
                        <h1 className="text-3xl font-bold text-white drop-shadow-md tracking-tight mb-2">{profile.username || "Mentor Name"}</h1>
                        <p className="text-white text-lg font-medium flex items-center justify-center md:justify-start gap-3 mt-2">
                            <span className="bg-white text-blue-900 px-4 py-1 rounded-full font-bold shadow-lg uppercase text-xs tracking-wider">{profile.role}</span>
                            <span className="hidden md:inline text-white/40">•</span>
                            <span className="flex items-center gap-2 text-white font-semibold drop-shadow-md"><GraduationCap size={20} /> {profile.college || "University Not Set"}</span>
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 mb-4 w-full md:w-auto">
                        {user?.role === 'mentor' && (
                            <button onClick={() => { setEditForm(profile); setIsZoomModal(true); }} className="flex-1 md:flex-none bg-white text-gray-900 border border-gray-200 px-6 py-3 rounded-xl font-bold hover:bg-gray-50 hover:border-blue-300 hover:text-blue-600 transition-all shadow-sm flex items-center justify-center gap-2 group">
                                <div className="p-1.5 bg-red-100 text-red-600 rounded-lg group-hover:scale-110 transition"><Video size={18} /></div> Setup Class
                            </button>
                        )}
                        <button onClick={() => { setEditForm(profile); setIsEditing(true); }} className="flex-1 md:flex-none bg-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 hover:shadow-blue-300 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2">
                            <Edit2 size={18} /> Edit Profile
                        </button>
                        {user?.role === 'mentor' && (
                            <button onClick={() => navigate(`/mentor/${user.id}`)} className="bg-gray-800 text-white px-4 py-3 rounded-xl hover:bg-black transition shadow-lg hover:shadow-xl hover:-translate-y-0.5"><Share2 size={20} /></button>
                        )}
                    </div>
                </div>
            </div>
            {/* --- STUDENT DASHBOARD VIEW --- */}
            {user?.role === 'student' ? (
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 pb-10">
                    <div className="md:col-span-2 space-y-6">
                        {/* 1. MY REQUESTS */}
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                                <h3 className="font-bold text-xl text-gray-800 flex items-center gap-2"><Clock size={22} className="text-blue-600" /> My Booking Requests</h3>
                            </div>
                            <div className="p-0">
                                {bookings?.length === 0 ? (
                                    <div className="p-8 text-center text-gray-400">You haven't booked any sessions yet.</div>
                                ) : (
                                    bookings?.map((b) => (
                                        <div key={b._id} className="p-6 border-b border-gray-100 hover:bg-gray-50 transition">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h4 className="font-bold text-gray-900 text-lg">Mentor: {b.mentorName || "Unknown"}</h4>
                                                    <p className="text-sm text-gray-500">{new Date(b.date).toLocaleDateString()}</p>
                                                </div>
                                                <span className="bg-yellow-100 text-yellow-700 text-xs font-bold px-3 py-1 rounded-full uppercase">Pending</span>
                                            </div>
                                            <p className="text-gray-600 bg-white p-3 border border-gray-200 rounded-lg italic text-sm">"{b.message}"</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* 2. FIND MENTORS CTA */}
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
                            <div>
                                <h3 className="text-2xl font-bold mb-2">Need Guidance?</h3>
                                <p className="text-blue-100">Browse our list of expert mentors and book your session today.</p>
                            </div>
                            <button onClick={() => navigate('/mentors')} className="bg-white text-blue-600 px-8 py-3 rounded-xl font-bold hover:bg-gray-50 transition shadow-lg whitespace-nowrap">Find Mentors</button>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                            <h3 className="font-bold text-gray-800 mb-4">Quick Actions</h3>
                            <button onClick={() => navigate('/mentors')} className="w-full bg-gray-50 border border-gray-200 p-4 rounded-xl font-bold text-gray-700 hover:bg-gray-100 flex items-center gap-3 transition mb-3">
                                <Users size={20} /> Browse Mentors
                            </button>
                            <button onClick={() => { setEditForm(profile); setIsEditing(true); }} className="w-full bg-gray-50 border border-gray-200 p-4 rounded-xl font-bold text-gray-700 hover:bg-gray-100 flex items-center gap-3 transition">
                                <Settings size={20} /> Profile Settings
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                /* --- MENTOR DASHBOARD VIEW (Original) --- */
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* LEFT COLUMN */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { label: "Students", val: "100+", icon: Users, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
                                { label: "Lectures", val: lectures?.length || 0, icon: Video, color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-100" },
                                { label: "Rating", val: "4.9", icon: Star, color: "text-amber-500", bg: "bg-amber-50", border: "border-amber-100" },
                                { label: "Experience", val: "2+ Yrs", icon: Clock, color: "text-green-600", bg: "bg-green-50", border: "border-green-100" },
                            ].map((s, i) => (
                                <div key={i} className={`bg-white p-5 rounded-2xl shadow-sm border ${s.border} flex items-center gap-4 hover:shadow-md hover:scale-[1.02] transition-all duration-300 cursor-default`}>
                                    <div className={`p-3.5 rounded-xl ${s.bg} ${s.color}`}><s.icon size={24} /></div>
                                    <div><div className="font-extrabold text-2xl text-gray-800 leading-none mb-1">{s.val}</div><div className="text-xs text-gray-500 uppercase font-bold tracking-wide">{s.label}</div></div>
                                </div>
                            ))}
                        </div>

                        {/* About Section */}
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-5"><BadgeCheck size={120} /></div>
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-gray-800 relative z-10">
                                <span className="bg-blue-100 p-2 rounded-lg text-blue-600"><BadgeCheck size={24} /></span> About Me
                            </h2>
                            <div className="relative z-10">
                                <p className="text-gray-600 leading-loose text-lg whitespace-pre-wrap font-medium">{profile.about || "Write something about yourself to inspire students..."}</p>
                                <div className="mt-8 flex flex-wrap gap-3">
                                    <div className="px-5 py-2.5 bg-gray-50 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 flex items-center gap-2 hover:bg-gray-100 transition">
                                        <GraduationCap size={18} className="text-gray-400" /> {profile.college || "University"}
                                    </div>
                                    <div className="px-5 py-2.5 bg-gray-50 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 flex items-center gap-2 hover:bg-gray-100 transition">
                                        <div className="w-2 h-2 rounded-full bg-green-500"></div> {profile.branch || "Branch"}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Lectures List */}
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-bold text-gray-800">Uploaded Resources <span className="text-gray-400 font-medium ml-2 text-lg">({lectures?.length || 0})</span></h2>
                                <button onClick={() => document.getElementById('add-lecture').scrollIntoView({ behavior: 'smooth' })} className="text-blue-600 font-bold text-sm hover:underline md:hidden">Add New</button>
                            </div>

                            {lectures?.length === 0 ? (
                                <div className="text-center py-16 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                                    <Video className="mx-auto text-gray-300 mb-4" size={56} />
                                    <h3 className="text-gray-900 font-bold text-lg">No content yet</h3>
                                    <p className="text-gray-500 font-medium mt-1">Start by uploading your first video lecture.</p>
                                </div>
                            ) : (
                                <div className="grid sm:grid-cols-2 gap-6">
                                    {lectures.map(l => {
                                        const vidId = getYouTubeID(l.url);
                                        return (
                                            <div key={l._id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
                                                <div className="h-48 bg-gray-900 relative overflow-hidden">
                                                    <img src={vidId ? `https://img.youtube.com/vi/${vidId}/mqdefault.jpg` : "https://via.placeholder.com/300x200"} className="w-full h-full object-cover opacity-80 group-hover:scale-105 group-hover:opacity-100 transition duration-700" alt="Thumb" />
                                                    <a href={l.url} target="_blank" rel="noreferrer" className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition">
                                                        <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition"><Video className="text-red-600 ml-1" size={24} /></div>
                                                    </a>
                                                </div>
                                                <div className="p-5 flex-1 flex flex-col justify-between">
                                                    <h4 className="font-bold text-gray-800 mb-2 leading-snug line-clamp-2 text-lg group-hover:text-blue-700 transition">{l.title}</h4>
                                                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-50">
                                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">YouTube</span>
                                                        <button onClick={() => handleDeleteLecture(l._id)} className="text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition"><Trash2 size={18} /></button>
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

                        {/* CLASS SCHEDULER CARD */}
                        <div className="bg-white rounded-3xl shadow-xl shadow-blue-100/50 border border-white overflow-hidden sticky top-6 z-0">
                            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10"><Calendar size={80} /></div>
                                <h3 className="font-bold text-xl relative z-10 flex items-center gap-2"><Calendar size={22} className="text-blue-200" /> Schedule Class</h3>
                                <p className="text-blue-100 text-sm mt-1 relative z-10 font-medium">Create a new live session for students.</p>
                            </div>

                            <div className="p-6 space-y-5">
                                <div>
                                    <label className="text-xs font-extrabold text-gray-500 uppercase tracking-wider mb-1.5 block ml-1">Topic</label>
                                    <input value={schedule.topic} onChange={e => setSchedule({ ...schedule, topic: e.target.value })} placeholder="e.g. Weekly Doubt Clearing" className="w-full p-3.5 rounded-xl border-2 border-gray-100 focus:border-blue-500 outline-none bg-gray-50 focus:bg-white transition-all font-medium" />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-extrabold text-gray-500 uppercase tracking-wider mb-1.5 block ml-1">Date</label>
                                        <input type="date" value={schedule.date} onChange={e => setSchedule({ ...schedule, date: e.target.value })} className="w-full p-3.5 rounded-xl border-2 border-gray-100 focus:border-blue-500 outline-none bg-gray-50 focus:bg-white transition-all font-medium text-sm" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-extrabold text-gray-500 uppercase tracking-wider mb-1.5 block ml-1">Time</label>
                                        <input type="time" value={schedule.startTime} onChange={e => setSchedule({ ...schedule, startTime: e.target.value })} className="w-full p-3.5 rounded-xl border-2 border-gray-100 focus:border-blue-500 outline-none bg-gray-50 focus:bg-white transition-all font-medium text-sm" />
                                    </div>
                                </div>

                                <button onClick={handleScheduleClass} className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold hover:bg-black shadow-lg hover:shadow-xl transition-all flex justify-center gap-2 items-center group">
                                    <Plus size={20} className="group-hover:rotate-90 transition duration-300" /> Schedule Session
                                </button>
                            </div>

                            {/* UPCOMING LIST */}
                            {sessions?.length > 0 && (
                                <div className="border-t border-gray-100 bg-gray-50/50 p-4">
                                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-2">Upcoming Classes</h4>
                                    <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar pr-1">
                                        {sessions.map(s => (
                                            <div key={s._id} className="bg-white border border-gray-200 p-4 rounded-xl flex justify-between items-center group hover:border-blue-300 transition-colors shadow-sm">
                                                <div>
                                                    <div className="font-bold text-gray-800 text-sm mb-1">{s.title}</div>
                                                    <div className="text-xs text-blue-600 font-bold bg-blue-50 px-2 py-1 rounded-md inline-block border border-blue-100">
                                                        {new Date(s.startTime).toLocaleDateString(undefined, { weekday: 'short' })}, {new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleStartSession(s)}
                                                    className="bg-green-100 text-green-700 p-2.5 rounded-xl hover:bg-green-600 hover:text-white transition-all shadow-sm"
                                                    title="Start Meeting"
                                                >
                                                    <Video size={18} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* BOOKINGS CARD */}
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                                <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2"><Users size={20} className="text-purple-600" /> Requests</h3>
                                <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-1 rounded-full">{bookings?.length || 0} New</span>
                            </div>

                            {bookings?.length === 0 ? (
                                <div className="p-8 text-center bg-gray-50/50">
                                    <p className="text-gray-400 text-sm font-medium italic">No pending requests.</p>
                                </div>
                            ) : (
                                <div className="max-h-80 overflow-y-auto custom-scrollbar p-0">
                                    {bookings?.map((b, idx) => (
                                        <div key={b._id} className={`p-5 hover:bg-purple-50 transition-colors ${idx !== (bookings?.length || 0) - 1 ? 'border-b border-gray-100' : ''}`}>
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-bold text-gray-800 text-sm">{b.studentEmail || "Student"}</h4>
                                                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wide">
                                                    {new Date(b.date).toLocaleDateString()}
                                                </span>
                                            </div>
                                            {b.message ? (
                                                <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-2 rounded-lg border border-gray-100">"{b.message}"</p>
                                            ) : <span className="text-xs text-gray-400 italic">No message attached</span>}

                                            <div className="mt-3 flex gap-2">
                                                <button className="flex-1 text-xs font-bold bg-white border border-gray-200 py-2 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition">Dismiss</button>
                                                <button className="flex-1 text-xs font-bold bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition shadow-sm shadow-purple-200">Reply</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* ADD LECTURE CARD */}
                        <div id="add-lecture" className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-3xl text-white shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-5"><UploadCloud size={100} /></div>
                            <div className="flex items-center gap-4 mb-6 relative z-10">
                                <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10"><UploadCloud size={24} className="text-cyan-400" /></div>
                                <div>
                                    <h3 className="font-bold text-lg leading-tight">Upload Content</h3>
                                    <p className="text-gray-400 text-xs font-medium mt-0.5">Share knowledge with students</p>
                                </div>
                            </div>
                            <div className="space-y-4 relative z-10">
                                <input placeholder="Video Title" value={newLecture.title} onChange={e => setNewLecture({ ...newLecture, title: e.target.value })} className="w-full p-4 rounded-xl text-white bg-black/20 border border-white/10 focus:border-cyan-500/50 outline-none focus:bg-black/40 placeholder:text-gray-500 transition-all font-medium text-sm" />
                                <input placeholder="YouTube URL" value={newLecture.url} onChange={e => setNewLecture({ ...newLecture, url: e.target.value })} className="w-full p-4 rounded-xl text-white bg-black/20 border border-white/10 focus:border-cyan-500/50 outline-none focus:bg-black/40 placeholder:text-gray-500 transition-all font-medium text-sm" />

                                <button onClick={handleAddLecture} disabled={uploading} className="w-full bg-cyan-500 text-black font-extrabold py-4 rounded-xl hover:bg-cyan-400 transition shadow-[0_0_20px_rgba(34,211,238,0.3)] flex items-center justify-center gap-2 disabled:opacity-70 mt-2">
                                    {uploading ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
                                    {uploading ? "Publishing..." : "Upload Video"}
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
};

export default DashboardPage;