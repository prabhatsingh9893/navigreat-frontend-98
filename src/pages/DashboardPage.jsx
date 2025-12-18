import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// Icons
import { Share2, BadgeCheck, Users, Clock, Star, Video, Trash2, Plus, UploadCloud, Edit2, X, Save, GraduationCap, Camera, LogOut, Settings } from "lucide-react";
import toast from 'react-hot-toast';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  // User Data
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({
    username: "", role: "Mentor", about: "", college: "", branch: "", image: "",
    meetingId: "", passcode: "", // Zoom details in profile
    skills: ["Career Guidance"], badges: ["Verified Mentor"]
  });
  const [lectures, setLectures] = useState([]);
  
  // Modals State
  const [isEditing, setIsEditing] = useState(false); // For Profile
  const [isZoomModal, setIsZoomModal] = useState(false); // For Zoom (SEPARATE)
  
  const [editForm, setEditForm] = useState({});
  const [newLecture, setNewLecture] = useState({ title: "", url: "" });

  // --- 1. INITIAL FETCH ---
  useEffect(() => {
    const storedUser = localStorage.getItem('userData');
    if (!storedUser) { navigate('/login'); return; }
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);

    fetch(`https://navigreat-backend-98.onrender.com/api/mentors/${parsedUser.id}`)
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                const m = data.mentor || data.user;
                setProfile({
                    ...profile,
                    username: m.username || "",
                    about: m.about || "",
                    college: m.college || "",
                    branch: m.branch || "",
                    image: m.image || "",
                    meetingId: m.meetingId || "", // Fetch Zoom ID
                    passcode: m.passcode || ""    // Fetch Passcode
                });
            }
        })
        .finally(() => setLoading(false));

    fetch(`https://navigreat-backend-98.onrender.com/api/lectures/${parsedUser.id}`)
        .then(res => res.json())
        .then(data => { if (data.success) setLectures(data.lectures); });
  }, [navigate]);

  // --- 2. SAVE HANDLERS ---

  // Update Main Profile
  const handleSaveProfile = async () => {
    const loadingToast = toast.loading("Saving Profile...");
    try {
        await updateBackend(editForm);
        setProfile({...profile, ...editForm}); // Update UI
        setIsEditing(false);
        toast.dismiss(loadingToast);
        toast.success("Profile Updated!");
    } catch { toast.dismiss(loadingToast); }
  };

  // Update Zoom Details (Separate Function)
  const handleSaveZoom = async () => {
    if(!editForm.meetingId || !editForm.passcode) {
        toast.error("Please enter both ID and Passcode");
        return;
    }
    const loadingToast = toast.loading("Setting up Classroom...");
    try {
        await updateBackend({ meetingId: editForm.meetingId, passcode: editForm.passcode });
        setProfile({...profile, meetingId: editForm.meetingId, passcode: editForm.passcode}); // Update UI
        setIsZoomModal(false);
        toast.dismiss(loadingToast);
        toast.success("Classroom Ready!");
    } catch { toast.dismiss(loadingToast); }
  };

  // Common Backend Call
  const updateBackend = async (dataToUpdate) => {
      await fetch(`https://navigreat-backend-98.onrender.com/api/mentors/${user.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dataToUpdate)
      });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = () => setEditForm({ ...editForm, image: reader.result });
    }
  };

  const handleAddLecture = async () => {
    if (!newLecture.title || !newLecture.url) return;
    const toastId = toast.loading("Uploading...");
    try {
        const res = await fetch('https://navigreat-backend-98.onrender.com/api/lectures', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mentorId: user.id, title: newLecture.title, url: newLecture.url })
        });
        const data = await res.json();
        if(data.success) {
            setLectures([...lectures, data.lecture]);
            setNewLecture({ title: '', url: '' });
            toast.success("Lecture Added");
        }
    } catch { toast.error("Error"); } finally { toast.dismiss(toastId); }
  };

  const handleDeleteLecture = async (id) => {
      if(!window.confirm("Delete?")) return;
      await fetch(`https://navigreat-backend-98.onrender.com/api/lectures/${id}`, { method: 'DELETE' });
      setLectures(lectures.filter(l => l._id !== id));
      toast.success("Deleted");
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-bold text-blue-600">Loading Dashboard...</div>;

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-20 relative">
      
      {/* --- MODAL 1: EDIT PROFILE (Bio, Name, Image) --- */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
           <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl p-6 flex flex-col max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center mb-6 border-b pb-4">
                  <h3 className="text-xl font-bold">Edit Personal Details</h3>
                  <button onClick={() => setIsEditing(false)} className="hover:bg-gray-100 p-2 rounded-full"><X/></button>
              </div>
              
              <div className="flex justify-center mb-6">
                 <div className="relative w-32 h-32 group">
                    <img src={editForm.image || profile.image} className="w-full h-full rounded-full object-cover border-4 border-gray-100 shadow-md" alt="Preview"/>
                    <label className="absolute bottom-0 right-0 bg-blue-600 p-2.5 rounded-full text-white cursor-pointer hover:bg-blue-700 shadow-lg transition hover:scale-110">
                        <Camera size={18}/><input type="file" accept="image/*" className="hidden" onChange={handleImageUpload}/>
                    </label>
                 </div>
              </div>

              <div className="space-y-4">
                  <input value={editForm.username} onChange={e => setEditForm({...editForm, username: e.target.value})} className="w-full border p-3 rounded-xl" placeholder="Full Name" />
                  <textarea value={editForm.about} onChange={e => setEditForm({...editForm, about: e.target.value})} className="w-full border p-3 rounded-xl" rows="4" placeholder="About / Bio" />
                  <div className="grid md:grid-cols-2 gap-4">
                      <input value={editForm.college} onChange={e => setEditForm({...editForm, college: e.target.value})} className="w-full border p-3 rounded-xl" placeholder="College Name" />
                      <input value={editForm.branch} onChange={e => setEditForm({...editForm, branch: e.target.value})} className="w-full border p-3 rounded-xl" placeholder="Branch/Degree" />
                  </div>
              </div>
              
              <button onClick={handleSaveProfile} className="mt-6 w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 shadow-lg flex items-center justify-center gap-2">
                  <Save size={18}/> Save Changes
              </button>
           </div>
        </div>
      )}

      {/* --- MODAL 2: ZOOM SETTINGS (Separated) --- */}
      {isZoomModal && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
           <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6 animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-2 text-red-600">
                      <div className="p-2 bg-red-100 rounded-lg"><Video size={24}/></div>
                      <h3 className="text-xl font-bold">Classroom Setup</h3>
                  </div>
                  <button onClick={() => setIsZoomModal(false)} className="hover:bg-gray-100 p-2 rounded-full"><X/></button>
              </div>
              
              <div className="space-y-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-xl text-sm text-blue-700 mb-4">
                      Enter your <b>Zoom Personal Meeting ID</b> here. Students will use this to join your sessions automatically.
                  </div>
                  <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Meeting ID (PMI)</label>
                      <input 
                          value={editForm.meetingId} 
                          onChange={e => setEditForm({...editForm, meetingId: e.target.value})} 
                          className="w-full border-2 border-gray-200 p-3 rounded-xl focus:border-red-500 outline-none font-mono text-lg" 
                          placeholder="845 221 9988" 
                      />
                  </div>
                  <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Passcode</label>
                      <input 
                          value={editForm.passcode} 
                          onChange={e => setEditForm({...editForm, passcode: e.target.value})} 
                          className="w-full border-2 border-gray-200 p-3 rounded-xl focus:border-red-500 outline-none font-mono text-lg" 
                          placeholder="123456" 
                      />
                  </div>
              </div>
              
              <button onClick={handleSaveZoom} className="w-full bg-red-600 text-white py-3.5 rounded-xl font-bold hover:bg-red-700 shadow-lg flex items-center justify-center gap-2">
                  <Settings size={18}/> Save Configuration
              </button>
           </div>
        </div>
      )}

      {/* --- HEADER --- */}
      <div className="h-64 bg-gradient-to-br from-blue-700 to-indigo-700 relative">
          <button onClick={() => { localStorage.removeItem('userData'); navigate('/login'); }} className="absolute top-6 right-6 bg-white/10 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-white/20 flex items-center gap-2">
              <LogOut size={16}/> Logout
          </button>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 -mt-24 relative z-10">
         <div className="flex flex-col sm:flex-row items-end gap-8 mb-8">
            <div className="relative">
                <img src={profile.image || `https://ui-avatars.com/api/?name=${profile.username}`} className="w-44 h-44 rounded-full border-[6px] border-white shadow-2xl bg-white object-cover" alt="Profile"/>
                <div className="absolute bottom-4 right-4 bg-blue-600 text-white p-1.5 rounded-full border-4 border-white"><BadgeCheck size={20}/></div>
            </div>
            
            <div className="flex-1 mb-4 text-center sm:text-left">
               <h1 className="text-4xl font-extrabold text-gray-900">{profile.username}</h1>
               <p className="text-gray-600 text-lg font-medium mt-1">{profile.role} • {profile.college}</p>
            </div>

            {/* ACTION BUTTONS (Split Edit & Zoom) */}
            <div className="flex gap-3 mb-4 w-full sm:w-auto">
                {/* 1. SETUP CLASSROOM BUTTON */}
                <button 
                    onClick={() => { setEditForm(profile); setIsZoomModal(true); }} 
                    className="flex-1 sm:flex-none bg-white border-2 border-red-100 text-red-600 px-5 py-3 rounded-xl font-bold hover:bg-red-50 transition flex items-center justify-center gap-2"
                >
                    <Video size={18}/> Setup Class
                </button>

                {/* 2. EDIT PROFILE BUTTON */}
                <button 
                    onClick={() => { setEditForm(profile); setIsEditing(true); }} 
                    className="flex-1 sm:flex-none bg-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
                >
                    <Edit2 size={18}/> Edit Profile
                </button>
                
                <button onClick={() => navigate(`/mentor/${user.id}`)} className="bg-gray-800 text-white px-4 py-3 rounded-xl hover:bg-black transition"><Share2 size={18}/></button>
            </div>
         </div>
      </div>

      {/* --- CONTENT GRID --- */}
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Left Side: Stats & About */}
         <div className="lg:col-span-2 space-y-8">
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Students", val: "100+", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
                    { label: "Lectures", val: lectures.length, icon: Video, color: "text-purple-600", bg: "bg-purple-50" },
                    { label: "Rating", val: "4.9", icon: Star, color: "text-amber-500", bg: "bg-amber-50" },
                    { label: "Exp", val: "2+ Yrs", icon: Clock, color: "text-green-600", bg: "bg-green-50" },
                ].map((s, i) => (
                    <div key={i} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3">
                        <div className={`p-3 rounded-xl ${s.bg}`}><s.icon className={s.color} size={20}/></div>
                        <div><div className="font-bold text-xl">{s.val}</div><div className="text-xs text-gray-500 uppercase font-bold">{s.label}</div></div>
                    </div>
                ))}
            </div>

            {/* About Box */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
               <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><BadgeCheck className="text-blue-500"/> About Me</h2>
               <p className="text-gray-600 leading-relaxed whitespace-pre-wrap text-lg">
                   {profile.about || "No bio added yet. Click 'Edit Profile' to add details."}
               </p>
               <div className="mt-6 flex gap-2">
                   <div className="px-4 py-2 bg-gray-50 rounded-lg border border-gray-100 text-sm font-bold text-gray-600 flex items-center gap-2">
                       <GraduationCap size={16}/> {profile.college || "College N/A"}
                   </div>
               </div>
            </div>
            
            {/* Lectures List */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
               <h2 className="text-xl font-bold mb-6">Uploaded Resources ({lectures.length})</h2>
               {lectures.length === 0 ? <p className="text-gray-400 italic">No lectures uploaded yet.</p> : (
                   <div className="grid sm:grid-cols-2 gap-4">
                      {lectures.map(l => (
                         <div key={l._id} className="border border-gray-200 rounded-xl overflow-hidden group relative bg-white hover:shadow-lg transition">
                            <div className="h-40 bg-gray-200 relative">
                                <img src={`https://img.youtube.com/vi/${l.url.split('v=')[1]?.split('&')[0]}/0.jpg`} className="w-full h-full object-cover" alt="Thumbnail"/>
                                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"><Video className="text-white"/></div>
                            </div>
                            <div className="p-4">
                               <h4 className="font-bold text-gray-800 line-clamp-1 mb-2">{l.title}</h4>
                               <div className="flex justify-between items-center">
                                   <a href={l.url} target="_blank" rel="noreferrer" className="text-blue-600 text-sm font-bold hover:underline">Watch</a>
                                   <button onClick={() => handleDeleteLecture(l._id)} className="text-gray-400 hover:text-red-500 transition"><Trash2 size={16}/></button>
                               </div>
                            </div>
                         </div>
                      ))}
                   </div>
               )}
            </div>
         </div>

         {/* Right Sidebar (Add Lecture) */}
         <div className="space-y-6">
             <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-2xl text-white shadow-xl sticky top-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-white/20 p-2 rounded-lg"><UploadCloud size={24}/></div>
                    <h3 className="font-bold text-lg">Add New Lecture</h3>
                </div>
                <div className="space-y-4">
                    <input placeholder="Lecture Title" value={newLecture.title} onChange={e => setNewLecture({...newLecture, title: e.target.value})} className="w-full p-3 rounded-xl text-gray-900 bg-white/90 border-0 focus:ring-2 ring-white/50"/>
                    <input placeholder="YouTube URL" value={newLecture.url} onChange={e => setNewLecture({...newLecture, url: e.target.value})} className="w-full p-3 rounded-xl text-gray-900 bg-white/90 border-0 focus:ring-2 ring-white/50"/>
                    <button onClick={handleAddLecture} className="w-full bg-white text-blue-700 font-bold py-3 rounded-xl hover:bg-blue-50 transition shadow-lg flex justify-center gap-2">
                        <Plus size={18}/> Upload Now
                    </button>
                </div>
             </div>
         </div>
      </div>
    </div>
  );
};

export default DashboardPage;