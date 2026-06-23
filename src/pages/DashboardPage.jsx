import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
// Icons
import {
    Share2, BadgeCheck, Users, Clock, Star, Video, Trash2, Plus,
    UploadCloud, Edit2, X, Save, GraduationCap, Camera, LogOut,
    Settings, Copy, Loader2, Calendar, CheckCircle, Sparkles, ChevronRight, Wallet
} from "lucide-react";
import toast from 'react-hot-toast';
import Avatar from '../components/Avatar'; // ✅ Import Avatar Component
import ReviewModal from '../components/ReviewModal'; // ✅ Import ReviewModal
import { MetricSkeleton, SessionRowSkeleton } from '../components/SkeletonLoader';

// API URL Constant
import { API_BASE_URL } from '../config';
import { uploadToCloudinary } from '../utils/upload'; // ✅ Import Upload Utility

const DashboardPage = () => {
    const navigate = useNavigate();
    const location = useLocation(); // ✅ Location Hook
    const [reviewMentorId, setReviewMentorId] = useState(null); // Review Modal State
    const [lastSession, setLastSession] = useState(null); // ✅ Rejoin State

    // --- 0. Active Session & Post-Meeting Check ---
    useEffect(() => {
        // Check for active session to rejoin
        const savedSession = sessionStorage.getItem('currentSession');
        if (savedSession) {
            try { setLastSession(JSON.parse(savedSession)); }
            catch { sessionStorage.removeItem('currentSession'); }
        }

        const params = new URLSearchParams(location.search);
        
        // 💳 Paytm Payment Status Check
        const paymentStatus = params.get('payment');
        if (paymentStatus === 'success') {
            toast.success("🎉 Session Booked Successfully! Payment Confirmed.", { duration: 6000 });
            navigate('/dashboard', { replace: true });
        } else if (paymentStatus === 'failed') {
            toast.error("❌ Payment Failed or Cancelled. Please try again.", { duration: 6000 });
            navigate('/dashboard', { replace: true });
        }

        if (params.get('meeting_ended')) {
            toast.success("Meeting Concluded Successfully!", { icon: '✅' });

            const mId = params.get('mentorId');
            const u = JSON.parse(localStorage.getItem('userData') || '{}');

            if (u.role === 'student' && mId) {
                setReviewMentorId(mId); // Open Review Modal
            } else if (u.role === 'mentor') {
                setTimeout(() => {
                    toast("📹 Tip: Upload the session recording to your resources!", { duration: 6000 });
                }, 1000);
            }

            // Clear URL param without reloading
            navigate('/dashboard', { replace: true });
        }
    }, [location, navigate]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    // User Data
    const [user, setUser] = useState(null);
    const [sessions, setSessions] = useState([]); // ✅ NEW: Sessions List
    const [profile, setProfile] = useState({
        username: "", role: "", about: "", college: "", branch: "", image: "",
        meetingId: "", passcode: "", sessionFee: 500,
        skills: ["Career Guidance"], badges: [] // ✅ Cleared hardcoded badges
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
                catch { localStorage.removeItem('userData'); navigate('/login'); return; }

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

    const handleStartSession = () => {
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
        const now = new Date();

        if (startDateTime < now) {
            toast.error("Cannot schedule classes in the past!");
            return;
        }

        // Calculate End Time
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

    const [selectedFile, setSelectedFile] = useState(null); // ✅ Store file for simple upload

    const handleSaveProfile = async () => {
        const loadingToast = toast.loading("Saving Profile...");
        try {
            let imageUrl = editForm.image;

            // 1. Upload to Cloudinary if new file selected
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

            // 2. Update Backend
            await updateBackend(updatedData);

            // 3. Update Local State
            setProfile(updatedData);
            setUser(prev => ({ ...prev, ...updatedData })); // Update user state
            setIsEditing(false);
            setSelectedFile(null); // Clear selected file

            // 4. Update LocalStorage & Notify Header
            const storedUser = JSON.parse(localStorage.getItem('userData') || '{}');
            const newUserData = { ...storedUser, ...updatedData };
            localStorage.setItem('userData', JSON.stringify(newUserData));

            // Dispatch custom event for Header to pick up changes
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
            await updateBackend({ meetingId: editForm.meetingId, passcode: editForm.passcode });
            setProfile({ ...profile, meetingId: editForm.meetingId, passcode: editForm.passcode });
            setIsZoomModal(false);
            toast.dismiss(loadingToast);
            toast.success("Settings Saved!");
        } catch { toast.dismiss(loadingToast); }
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
            setSelectedFile(file); // ✅ Store file for upload

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
                body: JSON.stringify({ mentorId: user._id, title: newLecture.title, url: newLecture.url })
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
        <div className="min-h-screen bg-slate-50 dark:bg-[#080d14] font-sans pb-20 relative">
            <div className="h-72 bg-mesh-light dark:bg-mesh-hero noise-overlay relative shadow-2xl overflow-hidden animate-pulse">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-slate-50/40 to-transparent dark:from-[#080d14] dark:via-[#080d14]/40"></div>
            </div>

            <div className="max-w-7xl mx-auto px-6 -mt-32 relative z-10">
                <div className="flex flex-col md:flex-row items-end gap-8 mb-12 animate-pulse">
                    <div className="w-48 h-48 rounded-full bg-slate-200 dark:bg-slate-700 border-[6px] border-white dark:border-[#080d14] shadow-2xl"></div>
                    <div className="flex-1 mb-2 space-y-3">
                        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-lg w-1/3 animate-pulse"></div>
                        <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded-lg w-1/4 animate-pulse"></div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <MetricSkeleton />
                            <MetricSkeleton />
                            <MetricSkeleton />
                        </div>
                        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 space-y-4">
                            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-lg w-1/5 animate-pulse"></div>
                            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full animate-pulse"></div>
                            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full animate-pulse"></div>
                            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 animate-pulse"></div>
                        </div>
                        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 space-y-4">
                            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-lg w-1/4 animate-pulse"></div>
                            <SessionRowSkeleton />
                            <SessionRowSkeleton />
                            <SessionRowSkeleton />
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 space-y-4">
                            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-lg w-1/3 animate-pulse"></div>
                            <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded-2xl animate-pulse"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#080d14] font-sans pb-20 relative">

            {/* --- MODAL 1: EDIT PROFILE --- */}
            {isEditing && (
                <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white dark:bg-[#0d1520] dark:text-slate-200 rounded-3xl w-full max-w-2xl shadow-2xl p-6 flex flex-col max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200 border border-slate-150/80 dark:border-slate-800/80">
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
                            {(profile.role === 'mentor' || user?.role === 'mentor') && (
                                <div className="mt-2">
                                    <label className="text-xs font-bold text-gray-500 dark:text-slate-400 mb-1.5 block">Session Fee (INR)</label>
                                    <input type="number" min="0" value={editForm.sessionFee || ""} onChange={e => setEditForm({ ...editForm, sessionFee: Number(e.target.value) })} className="w-full border border-slate-200 dark:border-slate-850 dark:bg-[#151f2e] dark:text-white p-3.5 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 transition" placeholder="Session Fee (e.g. 500)" />
                                </div>
                            )}
                        </div>
                        <button onClick={handleSaveProfile} className="mt-6 w-full bg-gradient-to-r from-teal-600 to-cyan-600 text-white py-3.5 rounded-xl font-bold hover:from-teal-700 hover:to-cyan-700 shadow-lg flex items-center justify-center gap-2 transition"><Save size={18} /> Save Changes</button>
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

            {/* --- HEADER --- */}
            <div className="h-72 bg-gradient-to-r from-slate-900 via-teal-900 to-slate-900 relative shadow-2xl overflow-hidden">
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
                        <div className="absolute -inset-1 bg-gradient-to-r from-teal-600 to-cyan-400 rounded-full blur opacity-25 group-hover:opacity-75 transition duration-500"></div>
                        <Avatar
                            src={profile.image}
                            name={profile.username}
                            size="w-48 h-48"
                            fontSize="text-6xl"
                            className="bg-white border-[6px] border-white shadow-2xl relative"
                        />
                        {/* Badge Logic */}
                        {profile.isVerified && (
                            <div className="absolute bottom-5 right-5 bg-teal-600 text-white p-2 rounded-full border-4 border-white shadow-lg" title="Verified Mentor"><BadgeCheck size={24} /></div>
                        )}
                        {!profile.isVerified && profile.verificationStatus === 'pending' && (
                            <div className="absolute bottom-5 right-5 bg-yellow-500 text-white p-2 rounded-full border-4 border-white shadow-lg" title="Verification Pending"><Clock size={24} /></div>
                        )}
                    </div>

                    {/* Profile Info — sits below the banner on the page bg */}
                    <div className="flex-1 mb-2 text-center md:text-left">
                        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">{profile.username || "Your Name"}</h1>
                        <p className="text-lg font-medium flex flex-wrap items-center justify-center md:justify-start gap-3 mt-2">
                            <span className="bg-teal-600 text-white px-4 py-1 rounded-full font-bold shadow-sm uppercase text-xs tracking-wider capitalize">{profile.role}</span>
                            <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-semibold">
                                <GraduationCap size={20} className="text-slate-400" /> {profile.college || "University not set"}
                            </span>
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 mb-4 w-full md:w-auto">
                        {user?.role === 'mentor' && (
                            <button onClick={() => { setEditForm(profile); setIsZoomModal(true); }} className="flex-1 md:flex-none bg-white dark:bg-slate-900 text-gray-900 dark:text-white border border-slate-200 dark:border-slate-800 px-6 py-3 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-slate-800 hover:border-teal-300 dark:hover:border-teal-600 hover:text-teal-600 dark:hover:text-teal-400 transition-all shadow-sm flex items-center justify-center gap-2 group">
                                <div className="p-1.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg group-hover:scale-110 transition"><Video size={18} /></div> Setup Class
                            </button>
                        )}
                        <button onClick={() => { setEditForm(profile); setIsEditing(true); }} className="flex-1 md:flex-none btn-primary px-6 py-3 shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2">
                            <Edit2 size={18} /> Edit Profile
                        </button>
                        <button onClick={() => navigate(`/mentor/${user._id || user.id}`)} className="bg-slate-800 hover:bg-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700 text-white px-4 py-3 rounded-xl transition shadow-lg hover:shadow-xl hover:-translate-y-0.5" title="View Public Profile"><Share2 size={20} /></button>
                    </div>
                </div>
            </div>
            {/* --- STUDENT DASHBOARD VIEW --- */}
            {user?.role === 'student' ? (
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 pb-10">
                    <div className="md:col-span-2 space-y-6">

                        {/* 0. PROFILE COMPLETION PROMPT */}
                        {(!profile.college || !profile.branch || !profile.about?.trim()) && (
                            <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 border border-amber-200 dark:border-amber-900/40 rounded-2xl p-5 flex items-center gap-4">
                                <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex-shrink-0">
                                    <Sparkles size={22} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-slate-900 dark:text-white">Complete your profile</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Add your college, branch and a short bio so mentors can guide you better.</p>
                                </div>
                                <button onClick={() => { setEditForm(profile); setIsEditing(true); }} className="btn-primary px-5 py-2.5 rounded-xl text-sm whitespace-nowrap flex-shrink-0">
                                    Complete <ChevronRight size={16} />
                                </button>
                            </div>
                        )}

                        {/* 0.1 STUDENT STATS GRID — booking activity */}
                        <div className="grid grid-cols-3 gap-4">
                            {[
                                { label: "Requests Sent", val: bookings?.length || 0, icon: Users, color: "text-teal-600 dark:text-teal-400", bg: "bg-teal-50 dark:bg-teal-950/40", border: "border-teal-100 dark:border-teal-900/30" },
                                { label: "Confirmed", val: bookings?.filter(b => b.status === 'confirmed').length || 0, icon: CheckCircle, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/40", border: "border-emerald-100 dark:border-emerald-900/30" },
                                { label: "Pending", val: bookings?.filter(b => b.status !== 'confirmed' && b.status !== 'failed').length || 0, icon: Clock, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/40", border: "border-amber-100 dark:border-amber-900/30" },
                            ].map((s, i) => (
                                <div key={i} className={`bg-white dark:bg-[#0d1520] p-5 rounded-2xl shadow-sm border ${s.border} flex flex-col sm:flex-row items-center gap-3 sm:gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 cursor-default text-center sm:text-left`}>
                                    <div className={`p-3.5 rounded-xl ${s.bg} ${s.color}`}><s.icon size={24} /></div>
                                    <div className="min-w-0">
                                        <div className="font-extrabold text-2xl text-gray-800 dark:text-gray-100 leading-none mb-1">{s.val}</div>
                                        <div className="text-[11px] text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wide">{s.label}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* 0.5. ABOUT ME SECTION */}
                        <div className="bg-white dark:bg-[#0d1520] p-8 rounded-3xl shadow-sm border border-slate-150/80 dark:border-slate-800/80 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-5 dark:opacity-[0.02]"><BadgeCheck size={120} /></div>
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-gray-800 dark:text-white relative z-10">
                                <span className="bg-teal-100/80 dark:bg-teal-900/20 p-2 rounded-lg text-teal-600 dark:text-teal-400"><BadgeCheck size={24} /></span> About Me
                            </h2>
                            <div className="relative z-10">
                                <p className="text-gray-600 dark:text-gray-350 leading-loose text-lg whitespace-pre-wrap font-medium">
                                    {profile.about?.trim() ? profile.about : <span className="italic text-gray-400">Write something about yourself to let mentors know you better...</span>}
                                </p>
                                <div className="mt-8 flex flex-wrap gap-3">
                                    <div className="px-5 py-2.5 bg-slate-50 dark:bg-[#151f2e] rounded-xl border border-slate-150/80 dark:border-slate-800/80 text-sm font-bold text-gray-600 dark:text-gray-300 flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-[#151f2e]/60 transition">
                                        <GraduationCap size={18} className="text-gray-400" /> {profile.college || "University Not Set"}
                                    </div>
                                    <div className="px-5 py-2.5 bg-slate-50 dark:bg-[#151f2e] rounded-xl border border-slate-150/80 dark:border-slate-800/80 text-sm font-bold text-gray-600 dark:text-gray-300 flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-[#151f2e]/60 transition">
                                        <div className="w-2 h-2 rounded-full bg-green-500"></div> {profile.branch || "Branch Not Set"}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 0.5. ACTIVE SESSION REJOIN CARD */}
                        {lastSession && (
                            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 rounded-3xl shadow-lg border border-green-400 mb-6 flex items-center justify-between gap-4 animate-in slide-in-from-top duration-300">
                                <div className="text-white">
                                    <h3 className="font-bold text-xl flex items-center gap-2">
                                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse border-2 border-white"></div>
                                        Active Session Detected
                                    </h3>
                                    <p className="text-green-50 text-sm mt-1">Class ID: {lastSession.meetingNumber}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            sessionStorage.removeItem('currentSession');
                                            setLastSession(null);
                                        }}
                                        className="bg-white/20 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-white/30 transition"
                                    >
                                        Dismiss
                                    </button>
                                    <button
                                        onClick={() => navigate('/session', { state: lastSession })}
                                        className="bg-white text-green-700 px-6 py-2 rounded-xl font-bold shadow-lg hover:bg-green-50 transition flex items-center gap-2"
                                    >
                                        <Video size={18} /> Rejoin Now
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* 1. MY REQUESTS */}
                        <div className="bg-white dark:bg-[#0d1520] rounded-3xl shadow-sm border border-slate-150/80 dark:border-slate-800/80 overflow-hidden">
                            <div className="p-6 border-b border-slate-150 dark:border-slate-800 flex items-center justify-between">
                                <h3 className="font-bold text-xl text-gray-800 dark:text-white flex items-center gap-2"><Clock size={22} className="text-teal-600" /> My Booking Requests</h3>
                            </div>
                            <div className="p-0">
                                {!bookings?.length ? (
                                    <div className="px-6 py-12 text-center">
                                        <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-[#151f2e] flex items-center justify-center mx-auto mb-4 text-slate-400">
                                            <Calendar size={26} />
                                        </div>
                                        <p className="font-bold text-slate-700 dark:text-slate-200 mb-1">No bookings yet</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-5 max-w-xs mx-auto">Find a mentor and book your first 1-on-1 session — your requests will show up here.</p>
                                        <button onClick={() => navigate('/mentors')} className="btn-primary px-6 py-3 rounded-xl text-sm">
                                            <Users size={16} /> Find a mentor
                                        </button>
                                    </div>
                                ) : (
                                    bookings?.map((b) => (
                                        <div key={b._id} className="p-6 border-b border-slate-150 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-[#151f2e]/60 transition">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h4 className="font-bold text-gray-900 dark:text-white text-lg">Mentor: {b.mentorName || "Unknown"}</h4>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(b.date).toLocaleDateString()}</p>
                                                </div>
                                                {b.status === 'confirmed' ? (
                                                    <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold px-3 py-1 rounded-full uppercase">Confirmed</span>
                                                ) : b.status === 'failed' ? (
                                                    <span className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-bold px-3 py-1 rounded-full uppercase">Failed</span>
                                                ) : (
                                                    <span className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs font-bold px-3 py-1 rounded-full uppercase">Pending Payment</span>
                                                )}
                                            </div>
                                            <p className="text-gray-600 dark:text-gray-300 bg-white dark:bg-[#151f2e] p-3 border border-slate-200 dark:border-slate-800 rounded-lg italic text-sm">&quot;{b.message}&quot;</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* 2. FIND MENTORS CTA */}
                        <div className="bg-gradient-to-r from-teal-600 to-cyan-600 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
                            <div>
                                <h3 className="text-2xl font-bold mb-2">Need Guidance?</h3>
                                <p className="text-teal-100">Browse our list of expert mentors and book your session today.</p>
                            </div>
                            <button onClick={() => navigate('/mentors')} className="bg-white text-teal-600 px-8 py-3 rounded-xl font-bold hover:bg-slate-50 transition shadow-lg whitespace-nowrap">Find Mentors</button>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white dark:bg-[#0d1520] rounded-3xl shadow-sm border border-slate-150/80 dark:border-slate-800/80 p-6">
                            <h3 className="font-bold text-gray-800 dark:text-white mb-4">Quick Actions</h3>
                            <button onClick={() => navigate('/mentors')} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl font-bold text-gray-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-teal-300 dark:hover:border-teal-600 hover:text-teal-600 dark:hover:text-teal-400 flex items-center gap-3 transition mb-3">
                                <Users size={20} /> Browse Mentors
                            </button>
                            <button onClick={() => { setEditForm(profile); setIsEditing(true); }} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl font-bold text-gray-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-teal-300 dark:hover:border-teal-600 hover:text-teal-600 dark:hover:text-teal-400 flex items-center gap-3 transition">
                                <Settings size={20} /> Profile Settings
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                /* --- MENTOR DASHBOARD VIEW (Original) --- */
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* VERIFICATION BANNER */}
                    {(profile.verificationStatus === 'pending' || profile.verificationStatus === 'rejected') && profile.role.toLowerCase() === 'mentor' && (
                        <div className={`col-span-1 lg:col-span-3 border-l-4 p-4 rounded-r-lg shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-3 ${profile.verificationStatus === 'rejected' ? 'bg-red-50 border-red-400' : 'bg-yellow-50 border-yellow-400'}`}>
                            <div className="flex items-center gap-3">
                                {profile.verificationStatus === 'rejected' ? <X className="text-red-500" size={24} /> : <Clock className="text-yellow-500" size={24} />}
                                <div>
                                    <h3 className={`text-lg font-bold ${profile.verificationStatus === 'rejected' ? 'text-red-800' : 'text-yellow-800'}`}>
                                        {profile.verificationStatus === 'rejected' ? 'Verification Rejected' : 'Verifying by Team'}
                                    </h3>
                                    <p className={`text-sm ${profile.verificationStatus === 'rejected' ? 'text-red-700' : 'text-yellow-700'}`}>
                                        {profile.verificationStatus === 'rejected' ? 'Your profile was rejected. Please update your details and contact support.' : 'Your profile is currently under review.'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={async () => {
                                    if (!window.confirm("Verify yourself immediately? (Dev Mode)")) return;
                                    const res = await fetch(`${API_BASE_URL}/dev/verify-me`, {
                                        method: 'PUT',
                                        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                                    });
                                    const data = await res.json();
                                    if (data.success) {
                                        toast.success("✅ DEV: Verified Successfully!");
                                        setProfile(prev => ({ ...prev, isVerified: true, verificationStatus: 'verified' }));
                                        window.location.reload();
                                    } else {
                                        toast.error("Failed to verify");
                                    }
                                }}
                                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-bold hover:bg-gray-100 shadow-sm whitespace-nowrap"
                            >
                                ⚡ Self Verify (Dev)
                            </button>
                        </div>
                    )}

                    {/* LEFT COLUMN */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { label: "Lectures", val: lectures?.length || 0, icon: Video, color: "text-teal-600 dark:text-teal-400", bg: "bg-teal-50 dark:bg-teal-950/40", border: "border-teal-100 dark:border-teal-900/30" },
                                { label: "Session Fee", val: `₹${profile.sessionFee || 500}`, icon: Wallet, color: "text-cyan-600 dark:text-cyan-400", bg: "bg-cyan-50 dark:bg-cyan-950/40", border: "border-cyan-100 dark:border-cyan-900/30" },
                                { label: "Rating", val: lectures?.length ? "4.9" : "New", icon: Star, color: "text-amber-500 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/10", border: "border-amber-100 dark:border-amber-900/30" },
                                { label: profile.isVerified ? "Verified" : "In review", val: profile.isVerified ? "✓" : "…", icon: BadgeCheck, color: profile.isVerified ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400", bg: profile.isVerified ? "bg-emerald-50 dark:bg-emerald-950/40" : "bg-amber-50 dark:bg-amber-900/10", border: profile.isVerified ? "border-emerald-100 dark:border-emerald-900/30" : "border-amber-100 dark:border-amber-900/30" },
                            ].map((s, i) => (
                                <div key={i} className={`bg-white dark:bg-[#0d1520] p-5 rounded-2xl shadow-sm border ${s.border} flex items-center gap-4 hover:shadow-md hover:scale-[1.02] transition-all duration-300 cursor-default`}>
                                    <div className={`p-3.5 rounded-xl ${s.bg} ${s.color}`}><s.icon size={24} /></div>
                                    <div><div className="font-extrabold text-2xl text-gray-800 dark:text-gray-100 leading-none mb-1">{s.val}</div><div className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wide">{s.label}</div></div>
                                </div>
                            ))}
                        </div>

                        {/* About Section */}
                        <div className="bg-white dark:bg-[#0d1520] p-8 rounded-3xl shadow-sm border border-slate-150/80 dark:border-slate-800/80 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-5 dark:opacity-[0.02]"><BadgeCheck size={120} /></div>
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-gray-800 dark:text-white relative z-10">
                                <span className="bg-teal-100/80 dark:bg-teal-900/20 p-2 rounded-lg text-teal-600 dark:text-[#2dd4bf]"><BadgeCheck size={24} /></span> About Me
                            </h2>
                            <div className="relative z-10">
                                <p className="text-gray-600 dark:text-gray-300 leading-loose text-lg whitespace-pre-wrap font-medium">{profile.about || "Write something about yourself to inspire students..."}</p>
                                <div className="mt-8 flex flex-wrap gap-3">
                                    <div className="px-5 py-2.5 bg-slate-50 dark:bg-[#151f2e] rounded-xl border border-slate-150/85 dark:border-slate-800 text-sm font-bold text-gray-600 dark:text-gray-300 flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-[#151f2e]/60 transition">
                                        <GraduationCap size={18} className="text-gray-400" /> {profile.college || "University"}
                                    </div>
                                    <div className="px-5 py-2.5 bg-slate-50 dark:bg-[#151f2e] rounded-xl border border-slate-150/85 dark:border-slate-800 text-sm font-bold text-gray-600 dark:text-gray-300 flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-[#151f2e]/60 transition">
                                        <div className="w-2 h-2 rounded-full bg-green-500"></div> {profile.branch || "Branch"}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Lectures List */}
                        <div className="bg-white dark:bg-[#0d1520] p-8 rounded-3xl shadow-sm border border-slate-150/80 dark:border-slate-800/80">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Uploaded Resources <span className="text-slate-400 font-medium ml-2 text-lg">({lectures?.length || 0})</span></h2>
                                <button onClick={() => document.getElementById('add-lecture').scrollIntoView({ behavior: 'smooth' })} className="text-teal-600 dark:text-teal-400 font-bold text-sm hover:underline md:hidden">Add New</button>
                            </div>

                            {lectures?.length === 0 ? (
                                <div className="text-center py-16 bg-slate-50 dark:bg-[#151f2e]/20 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-850">
                                    <Video className="mx-auto text-gray-300 mb-4" size={56} />
                                    <h3 className="text-gray-950 dark:text-white font-bold text-lg">No content yet</h3>
                                    <p className="text-slate-500 font-medium mt-1">Start by uploading your first video lecture.</p>
                                </div>
                            ) : (
                                <div className="grid sm:grid-cols-2 gap-6">
                                    {lectures.map(l => {
                                        const vidId = getYouTubeID(l.url);
                                        return (
                                            <div key={l._id} className="bg-white dark:bg-[#151f2e]/40 rounded-2xl overflow-hidden shadow-sm border border-slate-150/80 dark:border-slate-800/80 group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
                                                <div className="h-48 bg-gray-900 relative overflow-hidden">
                                                    <img src={vidId ? `https://img.youtube.com/vi/${vidId}/mqdefault.jpg` : "https://via.placeholder.com/300x200"} className="w-full h-full object-cover opacity-80 group-hover:scale-105 group-hover:opacity-100 transition duration-700" alt="Thumb" />
                                                    <a href={l.url} target="_blank" rel="noreferrer" className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition">
                                                        <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition"><Video className="text-red-600 ml-1" size={24} /></div>
                                                    </a>
                                                </div>
                                                <div className="p-5 flex-1 flex flex-col justify-between">
                                                    <h4 className="font-bold text-gray-800 dark:text-slate-200 mb-2 leading-snug line-clamp-2 text-lg group-hover:text-teal-600 dark:group-hover:text-teal-400 transition">{l.title}</h4>
                                                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-150 dark:border-slate-800">
                                                        <span className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">YouTube</span>
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
                        <div className="bg-white dark:bg-[#0d1520] rounded-3xl shadow-xl shadow-teal-100/10 dark:shadow-teal-950/20 border border-slate-150/80 dark:border-slate-800/80 overflow-hidden sticky top-6 z-0">
                            <div className="bg-gradient-to-r from-teal-600 to-cyan-600 p-6 text-white relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10"><Calendar size={80} /></div>
                                <h3 className="font-bold text-xl relative z-10 flex items-center gap-2"><Calendar size={22} className="text-teal-200" /> Schedule Class</h3>
                                <p className="text-teal-100 text-sm mt-1 relative z-10 font-medium">Create a new live session for students.</p>
                            </div>

                            <div className="p-6 space-y-5">
                                <div>
                                    <label className="text-xs font-extrabold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 block ml-1">Topic</label>
                                    <input value={schedule.topic} onChange={e => setSchedule({ ...schedule, topic: e.target.value })} placeholder="e.g. Weekly Doubt Clearing" className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 focus:border-teal-500 outline-none bg-slate-50 dark:bg-[#151f2e] focus:bg-white dark:focus:bg-[#0d1520] dark:text-white transition-all font-medium" />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-extrabold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 block ml-1">Date</label>
                                        <input type="date" value={schedule.date} onChange={e => setSchedule({ ...schedule, date: e.target.value })} className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 focus:border-teal-500 outline-none bg-slate-50 dark:bg-[#151f2e] focus:bg-white dark:focus:bg-[#0d1520] dark:text-white transition-all font-medium text-sm" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-extrabold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 block ml-1">Time</label>
                                        <input type="time" value={schedule.startTime} onChange={e => setSchedule({ ...schedule, startTime: e.target.value })} className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 focus:border-teal-500 outline-none bg-slate-50 dark:bg-[#151f2e] focus:bg-white dark:focus:bg-[#0d1520] dark:text-white transition-all font-medium text-sm" />
                                    </div>
                                </div>

                                <button onClick={handleScheduleClass} className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 text-white py-4 rounded-xl font-bold hover:from-teal-700 hover:to-cyan-700 shadow-lg shadow-teal-500/20 hover:-translate-y-0.5 transition-all flex justify-center gap-2 items-center group">
                                    <Plus size={20} className="group-hover:rotate-90 transition duration-300" /> Schedule Session
                                </button>
                            </div>

                            {/* UPCOMING LIST */}
                            {sessions?.length > 0 && (
                                <div className="border-t border-slate-150 dark:border-slate-850 bg-slate-50 dark:bg-[#151f2e]/20 p-4">
                                    <h4 className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-3 px-2">Upcoming Classes</h4>
                                    <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar pr-1">
                                        {sessions.map(s => (
                                            <div key={s._id} className="bg-white dark:bg-[#0d1520] border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex justify-between items-center group hover:border-teal-300 dark:hover:border-teal-800 transition-colors shadow-sm">
                                                <div>
                                                    <div className="font-bold text-gray-800 dark:text-slate-250 text-sm mb-1">{s.title}</div>
                                                    <div className="text-xs text-teal-600 dark:text-teal-400 font-bold bg-teal-50 dark:bg-teal-950/40 px-2 py-1 rounded-md inline-block border border-teal-150 dark:border-teal-900/30">
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
                        <div className="bg-white dark:bg-[#0d1520] rounded-3xl shadow-sm border border-slate-150/80 dark:border-slate-800/80 overflow-hidden">
                            <div className="p-5 border-b border-slate-150 dark:border-slate-800 flex items-center justify-between">
                                <h3 className="font-bold text-lg text-gray-800 dark:text-white flex items-center gap-2"><Users size={20} className="text-cyan-600" /> Requests</h3>
                                <span className="bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-400 text-xs font-bold px-2 py-1 rounded-full border border-teal-100 dark:border-teal-900/30">{bookings?.length || 0} New</span>
                            </div>

                            {bookings?.length === 0 ? (
                                <div className="p-8 text-center bg-slate-50/20 dark:bg-slate-900/10">
                                    <p className="text-gray-400 text-sm font-medium italic">No pending requests.</p>
                                </div>
                            ) : (
                                <div className="max-h-80 overflow-y-auto custom-scrollbar p-0">
                                    {bookings?.map((b, idx) => (
                                        <div key={b._id} className={`p-5 hover:bg-teal-50/30 dark:hover:bg-teal-950/25 transition-colors ${idx !== (bookings?.length || 0) - 1 ? 'border-b border-slate-150 dark:border-slate-800' : ''}`}>
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-bold text-gray-800 dark:text-slate-200 text-sm">{b.studentEmail || "Student"}</h4>
                                                <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-slate-500 tracking-wide">
                                                    {new Date(b.date).toLocaleDateString()}
                                                </span>
                                            </div>
                                            {b.message ? (
                                                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed bg-slate-50 dark:bg-[#151f2e] p-2 rounded-lg border border-slate-200 dark:border-slate-800">&quot;{b.message}&quot;</p>
                                            ) : <span className="text-xs text-gray-400 italic">No message attached</span>}

                                            <div className="mt-3 flex gap-2">
                                                <button className="flex-1 text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 py-2 rounded-lg text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 transition">Dismiss</button>
                                                <button className="flex-1 text-xs font-bold bg-gradient-to-r from-teal-600 to-cyan-600 text-white py-2 rounded-lg hover:from-teal-700 hover:to-cyan-700 transition shadow-md shadow-teal-500/10" onClick={() => navigate(`/chat/${b.studentId}`)}>Reply</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* ADD LECTURE CARD */}
                        <div id="add-lecture" className="bg-mesh-hero noise-overlay p-8 rounded-3xl text-white shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-5"><UploadCloud size={100} /></div>
                            <div className="flex items-center gap-4 mb-6 relative z-10">
                                <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10"><UploadCloud size={24} className="text-teal-400" /></div>
                                <div>
                                    <h3 className="font-bold text-lg leading-tight">Upload Content</h3>
                                    <p className="text-gray-400 text-xs font-medium mt-0.5">Share knowledge with students</p>
                                </div>
                            </div>
                            <div className="space-y-4 relative z-10">
                                <input placeholder="Video Title" value={newLecture.title} onChange={e => setNewLecture({ ...newLecture, title: e.target.value })} className="w-full p-4 rounded-xl text-white bg-black/20 border border-white/10 focus:border-teal-500/50 outline-none focus:bg-black/40 placeholder:text-gray-500 transition-all font-medium text-sm" />
                                <input placeholder="YouTube URL" value={newLecture.url} onChange={e => setNewLecture({ ...newLecture, url: e.target.value })} className="w-full p-4 rounded-xl text-white bg-black/20 border border-white/10 focus:border-teal-500/50 outline-none focus:bg-black/40 placeholder:text-gray-500 transition-all font-medium text-sm" />

                                <button onClick={handleAddLecture} disabled={uploading} className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-extrabold py-4 rounded-xl hover:from-teal-600 hover:to-cyan-600 transition shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2 disabled:opacity-70 mt-2">
                                    {uploading ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
                                    {uploading ? "Publishing..." : "Upload Video"}
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            )
            }

            {/* Review Modal */}
            {
                reviewMentorId && (
                    <ReviewModal
                        mentorId={reviewMentorId}
                        onClose={() => setReviewMentorId(null)}
                    />
                )
            }
        </div >
    );
};

export default DashboardPage;