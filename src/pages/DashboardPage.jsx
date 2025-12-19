import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// Icons
import {
    Share2, BadgeCheck, Users, Clock, Star, Video, Trash2, Plus,
    UploadCloud, Edit2, X, Save, GraduationCap, Camera, LogOut,
    Settings, Copy, Loader2, Calendar
} from "lucide-react";
import toast from 'react-hot-toast';

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

    // ✅ NEW STATE: CLASS SCHEDULER
    const [schedule, setSchedule] = useState({
        topic: "",
        date: "",
        startTime: "",
        duration: "60" // Default 1 hour
    });

    // ... (Modals State) ...

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
                const [mentorRes, lectureRes, sessionRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/mentors/${userId}`),
                    fetch(`${API_BASE_URL}/lectures/${userId}`),
                    fetch(`${API_BASE_URL}/sessions/${userId}`) // ✅ Fetch Sessions
                ]);

                const parseResponse = async (res) => res.ok ? res.json() : null;

                const mentorData = await parseResponse(mentorRes);
                const lectureData = await parseResponse(lectureRes);
                const sessionData = await parseResponse(sessionRes);

                if (mentorData && mentorData.success) {
                    const m = mentorData.mentor || mentorData.user;
                    setProfile(prev => ({ ...prev, ...m }));
                }

                if (lectureData && lectureData.success) setLectures(lectureData.lectures);

                // ✅ Set Sessions
                if (sessionData && sessionData.success) {
                    // Sort by date/time
                    const sorted = sessionData.sessions.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
                    setSessions(sorted);
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
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    mentorId: user.id,
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
        await fetch(`${API_BASE_URL}/mentors/${user.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
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
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mentorId: user.id, title: newLecture.title, url: newLecture.url })
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
            await fetch(`${API_BASE_URL}/lectures/${id}`, { method: 'DELETE' });
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
                                <img src={editForm.image || profile.image || `https://ui-avatars.com/api/?name=${editForm.username}`} className="w-full h-full rounded-full object-cover border-4 border-gray-100 shadow-md" alt="Preview" />
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
            <div className="h-64 bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 relative shadow-lg">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                <button onClick={() => { localStorage.removeItem('userData'); navigate('/login'); }} className="absolute top-6 right-6 bg-white/10 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-white/20 flex items-center gap-2 border border-white/20 transition z-20">
                    <LogOut size={16} /> Logout
                </button>
            </div>

            <div className="max-w-7xl mx-auto px-4 -mt-28 relative z-10">
                <div className="flex flex-col sm:flex-row items-end gap-8 mb-8">
                    <div className="relative group">
                        <img src={profile.image || `https://ui-avatars.com/api/?name=${profile.username}&size=200`} className="w-44 h-44 rounded-full border-[6px] border-white shadow-2xl bg-white object-cover" alt="Profile" />
                        <div className="absolute bottom-4 right-4 bg-blue-600 text-white p-1.5 rounded-full border-4 border-white"><BadgeCheck size={20} /></div>
                    </div>

                    <div className="flex-1 mb-4 text-center sm:text-left">
                        <h1 className="text-4xl font-extrabold text-gray-900 drop-shadow-sm">{profile.username || "Mentor"}</h1>
                        <p className="text-gray-600 text-lg font-medium mt-1 flex items-center justify-center sm:justify-start gap-2">
                            {profile.role} <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span> {profile.college || "Add College"}
                        </p>
                    </div>

                    <div className="flex gap-3 mb-4 w-full sm:w-auto">
                        <button onClick={() => { setEditForm(profile); setIsZoomModal(true); }} className="flex-1 sm:flex-none bg-white border-2 border-red-100 text-red-600 px-5 py-3 rounded-xl font-bold hover:bg-red-50 transition flex items-center justify-center gap-2 shadow-sm"><Video size={18} /> Setup Class</button>
                        <button onClick={() => { setEditForm(profile); setIsEditing(true); }} className="flex-1 sm:flex-none bg-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"><Edit2 size={18} /> Edit Profile</button>
                        <button onClick={() => navigate(`/mentor/${user.id}`)} className="bg-gray-800 text-white px-4 py-3 rounded-xl hover:bg-black transition shadow-lg"><Share2 size={18} /></button>
                    </div>
                </div>
            </div>

            {/* --- MAIN GRID --- */}
            <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* LEFT COLUMN: Stats, About, Lectures */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: "Students", val: "100+", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
                            { label: "Lectures", val: lectures.length, icon: Video, color: "text-purple-600", bg: "bg-purple-50" },
                            { label: "Rating", val: "4.9", icon: Star, color: "text-amber-500", bg: "bg-amber-50" },
                            { label: "Exp", val: "2+ Yrs", icon: Clock, color: "text-green-600", bg: "bg-green-50" },
                        ].map((s, i) => (
                            <div key={i} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3 hover:shadow-md transition">
                                <div className={`p-3 rounded-xl ${s.bg}`}><s.icon className={s.color} size={20} /></div>
                                <div><div className="font-bold text-xl text-gray-800">{s.val}</div><div className="text-xs text-gray-500 uppercase font-bold">{s.label}</div></div>
                            </div>
                        ))}
                    </div>

                    {/* About */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-800"><BadgeCheck className="text-blue-500" /> About Me</h2>
                        <p className="text-gray-600 leading-relaxed whitespace-pre-wrap text-lg">{profile.about || "No bio added yet."}</p>
                        <div className="mt-6 flex flex-wrap gap-2">
                            <div className="px-4 py-2 bg-gray-50 rounded-lg border border-gray-100 text-sm font-bold text-gray-600 flex items-center gap-2">
                                <GraduationCap size={16} /> {profile.college || "University"}
                            </div>
                        </div>
                    </div>

                    {/* Lectures List */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                        <h2 className="text-xl font-bold mb-6 text-gray-800">Uploaded Resources ({lectures.length})</h2>
                        {lectures.length === 0 ? (
                            <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                                <Video className="mx-auto text-gray-300 mb-2" size={40} />
                                <p className="text-gray-400 font-medium">No lectures uploaded yet.</p>
                            </div>
                        ) : (
                            <div className="grid sm:grid-cols-2 gap-4">
                                {lectures.map(l => {
                                    const vidId = getYouTubeID(l.url);
                                    return (
                                        <div key={l._id} className="border border-gray-200 rounded-xl overflow-hidden group relative bg-white hover:shadow-lg transition flex flex-col">
                                            <div className="h-40 bg-gray-200 relative overflow-hidden">
                                                <img src={vidId ? `https://img.youtube.com/vi/${vidId}/mqdefault.jpg` : "https://via.placeholder.com/300x200"} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" alt="Thumb" />
                                                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300"><Video className="text-white drop-shadow-lg" size={40} /></div>
                                            </div>
                                            <div className="p-4 flex-1 flex flex-col justify-between">
                                                <h4 className="font-bold text-gray-800 line-clamp-2 mb-2 leading-snug">{l.title}</h4>
                                                <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                                                    <a href={l.url} target="_blank" rel="noreferrer" className="text-blue-600 text-sm font-bold hover:underline">Watch Video</a>
                                                    <button onClick={() => handleDeleteLecture(l._id)} className="text-gray-400 hover:text-red-500 p-1.5 rounded-lg transition"><Trash2 size={16} /></button>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT COLUMN: Scheduler & Add Lecture */}
                <div className="space-y-6">

                    {/* 🔥 NEW: CLASS SCHEDULER UI 🔥 */}
                    <div className="bg-white p-6 rounded-2xl shadow-lg border border-blue-100 sticky top-6 z-0">
                        <div className="flex items-center gap-3 mb-5 text-blue-800 border-b border-blue-50 pb-4">
                            <div className="bg-blue-100 p-2 rounded-lg"><Calendar size={24} /></div>
                            <h3 className="font-bold text-lg">Schedule Class</h3>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Topic / Title</label>
                                <input value={schedule.topic} onChange={e => setSchedule({ ...schedule, topic: e.target.value })} placeholder="e.g. Doubt Session" className="w-full p-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none bg-gray-50 focus:bg-white transition" />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">Date</label>
                                    <input type="date" value={schedule.date} onChange={e => setSchedule({ ...schedule, date: e.target.value })} className="w-full p-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none bg-gray-50 focus:bg-white transition" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">Time</label>
                                    <input type="time" value={schedule.startTime} onChange={e => setSchedule({ ...schedule, startTime: e.target.value })} className="w-full p-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none bg-gray-50 focus:bg-white transition" />
                                </div>
                            </div>

                            <button onClick={handleScheduleClass} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 shadow-md hover:shadow-lg transition flex justify-center gap-2 items-center">
                                <Plus size={18} /> Schedule Now
                            </button>
                        </div>

                        {/* ✅ UPCOMING SESSIONS LIST */}
                        {sessions.length > 0 && (
                            <div className="mt-6 border-t pt-4">
                                <h4 className="text-sm font-bold text-gray-500 uppercase mb-3 text-center">Your Scheduled Classes</h4>
                                <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar">
                                    {sessions.map(s => (
                                        <div key={s._id} className="bg-blue-50 border border-blue-100 p-3 rounded-lg flex justify-between items-center group hover:bg-white hover:shadow-md transition">
                                            <div>
                                                <div className="font-bold text-gray-800 text-sm">{s.title}</div>
                                                <div className="text-xs text-blue-600 font-medium">
                                                    {new Date(s.startTime).toLocaleDateString()} • {new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleStartSession(s)}
                                                className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 transition shadow-sm"
                                                title="Start Meeting as Host"
                                            >
                                                <Video size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Add Lecture Card */}
                    <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-6 rounded-2xl text-white shadow-xl">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-white/20 p-2 rounded-lg"><UploadCloud size={24} /></div>
                            <div>
                                <h3 className="font-bold text-lg leading-tight">Add Lecture</h3>
                                <p className="text-indigo-100 text-xs">Upload YouTube Link</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <input placeholder="Video Title" value={newLecture.title} onChange={e => setNewLecture({ ...newLecture, title: e.target.value })} className="w-full p-3 rounded-xl text-gray-900 bg-white/95 border-0 focus:ring-2 focus:ring-white/50 placeholder:text-gray-400" />
                            <input placeholder="YouTube URL" value={newLecture.url} onChange={e => setNewLecture({ ...newLecture, url: e.target.value })} className="w-full p-3 rounded-xl text-gray-900 bg-white/95 border-0 focus:ring-2 focus:ring-white/50 placeholder:text-gray-400" />

                            <button onClick={handleAddLecture} disabled={uploading} className="w-full bg-white text-indigo-700 font-bold py-3 rounded-xl hover:bg-indigo-50 transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-70">
                                {uploading ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                                {uploading ? "Uploading..." : "Upload Video"}
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default DashboardPage;