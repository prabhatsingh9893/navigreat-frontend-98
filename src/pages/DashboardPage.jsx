import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, Edit2, CheckCircle, UploadCloud, Save, Camera, Video, Trash2, ExternalLink, Eye, FileText, Link as LinkIcon, BarChart3, Users, Star } from 'lucide-react';
import toast from 'react-hot-toast';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Profile Data
  const [profile, setProfile] = useState({
    username: '', college: '', branch: '', about: '', image: '' 
  });

  // Lectures Data
  const [lecture, setLecture] = useState({ title: '', url: '' });
  const [myLectures, setMyLectures] = useState([]);

  // --- INITIAL LOAD ---
  useEffect(() => {
    const storedUser = localStorage.getItem('userData');
    if (!storedUser) {
      navigate('/login');
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    
    setProfile({
        username: parsedUser.username || '',
        college: parsedUser.college || '',
        branch: parsedUser.branch || '',
        about: parsedUser.about || '',
        image: parsedUser.image || ''
    });

    // Fetch Latest User Data
    fetch(`https://navigreat-backend-98.onrender.com/api/mentors/${parsedUser.id}`)
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                const freshData = data.mentor || data.user;
                setProfile({
                    username: freshData.username || parsedUser.username,
                    college: freshData.college || '',
                    branch: freshData.branch || '',
                    about: freshData.about || '',
                    image: freshData.image || parsedUser.image || ''
                });
                localStorage.setItem('userData', JSON.stringify({ ...parsedUser, ...freshData }));
            }
        })
        .catch(err => console.error("Profile fetch error:", err));

    // Fetch Lectures (Only for Mentor)
    if (parsedUser.role === 'mentor') {
        fetch(`https://navigreat-backend-98.onrender.com/api/lectures/${parsedUser.id}`)
            .then(res => res.json())
            .then(data => { if(data.success) setMyLectures(data.lectures); })
            .catch(err => console.error("Error fetching lectures:", err))
            .finally(() => setLoading(false));
    } else {
        setLoading(false);
    }
  }, [navigate]);

  // --- HANDLERS ---
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
        if (file.size > 2 * 1024 * 1024) {
            toast.error("Image size should be less than 2MB");
            return;
        }
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = () => { setProfile({ ...profile, image: reader.result }); };
    }
  };

  const handleSaveProfile = async () => {
    const loadingToast = toast.loading("Saving Changes...");
    try {
        const response = await fetch(`https://navigreat-backend-98.onrender.com/api/mentors/${user.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(profile)
        });
        const data = await response.json();
        toast.dismiss(loadingToast);

        if (data.success) {
            toast.success("Profile Updated!");
            setIsEditing(false);
            const updatedUser = { ...user, ...(data.mentor || data.user || profile) };
            localStorage.setItem('userData', JSON.stringify(updatedUser));
            setUser(updatedUser);
        } else { toast.error(data.message || "Failed to update"); }
    } catch (error) { toast.dismiss(loadingToast); toast.error("Server Error"); }
  };

  const handleAddLecture = async (e) => {
    e.preventDefault();
    if (!lecture.title || !lecture.url) return;
    const loadingToast = toast.loading("Uploading...");
    try {
        const res = await fetch('https://navigreat-backend-98.onrender.com/api/lectures', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mentorId: user.id, title: lecture.title, url: lecture.url })
        });
        const data = await res.json();
        toast.dismiss(loadingToast);
        if(data.success) {
            toast.success("Lecture Added!");
            setMyLectures([...myLectures, data.lecture]); 
            setLecture({ title: '', url: '' });
        }
    } catch (error) { toast.dismiss(loadingToast); toast.error("Failed to add lecture"); }
  };

  const handleDeleteLecture = async (lectureId) => {
      if(!window.confirm("Delete this lecture?")) return;
      try {
          const res = await fetch(`https://navigreat-backend-98.onrender.com/api/lectures/${lectureId}`, { method: 'DELETE' });
          const data = await res.json();
          if (data.success) {
              setMyLectures(myLectures.filter(l => l._id !== lectureId));
              toast.success("Deleted!");
          }
      } catch (err) { toast.error("Error deleting"); }
  };

  const handleLogout = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
      navigate('/login');
  };

  if (loading || !user) return <div className="flex justify-center items-center h-screen text-blue-600 font-bold">Loading Dashboard...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ================= LEFT: PRO PROFILE CARD ================= */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">
            
            {/* 🎨 Cover Background */}
            <div className="h-24 bg-gradient-to-r from-blue-600 to-purple-600"></div>

            <div className="text-center px-6 pb-6 relative">
                {/* 📸 Image */}
                <div className="relative w-28 h-28 mx-auto -mt-14 mb-4 group">
                    <img 
                        src={profile.image || user.image || `https://ui-avatars.com/api/?name=${user.username}&background=0D8ABC&color=fff`} 
                        alt="Profile" 
                        className="w-full h-full rounded-full object-cover border-4 border-white shadow-md bg-white" 
                    />
                    {isEditing && (
                        <label className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full text-white cursor-pointer hover:bg-blue-700 shadow-lg transition hover:scale-110">
                            <Camera size={16} />
                            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                        </label>
                    )}
                </div>

                {/* Name & Role */}
                {isEditing ? (
                    <input name="username" value={profile.username} onChange={(e) => setProfile({...profile, username: e.target.value})} className="text-center border-b-2 border-blue-200 p-1 w-full font-bold text-xl mb-1 focus:outline-none" placeholder="Name"/>
                ) : (
                    <h2 className="text-2xl font-bold text-gray-800 capitalize">{user.username}</h2>
                )}
                
                <p className="text-blue-600 font-medium capitalize flex justify-center items-center gap-1 mb-6">
                    {user.role} {user.role === 'mentor' && <CheckCircle size={16} />}
                </p>

                {/* Details */}
                <div className="space-y-4 text-left bg-gray-50 p-4 rounded-xl mb-6">
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase">College</label>
                        {isEditing ? <input name="college" value={profile.college} onChange={(e) => setProfile({...profile, college: e.target.value})} className="w-full border p-2 rounded mt-1 text-sm" placeholder="IIT/NIT Name" /> : <p className="font-semibold text-gray-700">{user.college || "Not Added"}</p>}
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase">Branch</label>
                        {isEditing ? <input name="branch" value={profile.branch} onChange={(e) => setProfile({...profile, branch: e.target.value})} className="w-full border p-2 rounded mt-1 text-sm" placeholder="CSE/ECE" /> : <p className="font-semibold text-gray-700">{user.branch || "Not Added"}</p>}
                    </div>
                </div>

                {/* Buttons */}
                <div className="space-y-3">
                    {isEditing ? (
                        <button onClick={handleSaveProfile} className="w-full bg-green-600 text-white py-2.5 rounded-xl flex justify-center items-center gap-2 hover:bg-green-700 font-bold shadow-md"><Save size={18} /> Save</button>
                    ) : (
                        <button onClick={() => setIsEditing(true)} className="w-full bg-white border border-blue-600 text-blue-600 py-2.5 rounded-xl flex justify-center items-center gap-2 hover:bg-blue-50 font-bold transition"><Edit2 size={18} /> Edit Profile</button>
                    )}
                    {user.role === 'mentor' && <button onClick={() => navigate(`/mentor/${user.id}`)} className="w-full bg-gray-100 text-gray-700 py-2.5 rounded-xl flex justify-center gap-2 hover:bg-gray-200 font-medium"><Eye size={18} /> Public View</button>}
                    <button onClick={handleLogout} className="w-full text-red-500 py-2 rounded-xl flex justify-center gap-2 hover:bg-red-50 font-medium"><LogOut size={18} /> Logout</button>
                </div>
            </div>
          </div>
        </div>

        {/* ================= RIGHT: CONTENT ================= */}
        <div className="lg:col-span-2 space-y-6">
           
           {user.role === 'mentor' ? (
            <>
              {/* 📊 1. NEW STATS SECTION */}
              <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
                      <div className="bg-blue-100 p-3 rounded-lg text-blue-600"><BarChart3 size={24} /></div>
                      <div><p className="text-gray-500 text-xs font-bold uppercase">Lectures</p><h4 className="text-xl font-bold">{myLectures.length}</h4></div>
                  </div>
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
                      <div className="bg-purple-100 p-3 rounded-lg text-purple-600"><Users size={24} /></div>
                      <div><p className="text-gray-500 text-xs font-bold uppercase">Students</p><h4 className="text-xl font-bold">128</h4></div>
                  </div>
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
                      <div className="bg-yellow-100 p-3 rounded-lg text-yellow-600"><Star size={24} /></div>
                      <div><p className="text-gray-500 text-xs font-bold uppercase">Rating</p><h4 className="text-xl font-bold">4.9</h4></div>
                  </div>
              </div>

              {/* 📤 2. UPLOAD CARD (Improved) */}
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-blue-50 p-2 rounded-lg text-blue-600"><UploadCloud size={24} /></div>
                    <h3 className="text-xl font-bold text-gray-800">Add New Resource</h3>
                </div>
                
                <form onSubmit={handleAddLecture} className="grid md:grid-cols-2 gap-4">
                  {/* Icon Inputs */}
                  <div className="relative">
                      <FileText className="absolute left-3 top-3.5 text-gray-400" size={18} />
                      <input placeholder="Lecture Title" value={lecture.title} onChange={(e) => setLecture({...lecture, title: e.target.value})} className="w-full pl-10 border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" required />
                  </div>
                  <div className="relative">
                      <LinkIcon className="absolute left-3 top-3.5 text-gray-400" size={18} />
                      <input placeholder="YouTube URL" value={lecture.url} onChange={(e) => setLecture({...lecture, url: e.target.value})} className="w-full pl-10 border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" required />
                  </div>
                  
                  {/* Gradient Button */}
                  <button type="submit" className="md:col-span-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-bold hover:shadow-lg hover:opacity-90 transition transform active:scale-95">
                    Upload Lecture
                  </button>
                </form>
              </div>

              {/* 📚 3. LECTURE LIST (Better Empty State) */}
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex items-center gap-3 mb-6">
                      <div className="bg-purple-50 p-2 rounded-lg text-purple-600"><Video size={24} /></div>
                      <h3 className="text-xl font-bold text-gray-800">My Lectures</h3>
                  </div>

                  {myLectures.length === 0 ? (
                      <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                          <img src="https://cdn-icons-png.flaticon.com/512/7486/7486744.png" alt="Empty" className="w-24 h-24 mx-auto mb-4 opacity-50 grayscale" />
                          <p className="text-gray-500 font-medium">No lectures uploaded yet.</p>
                          <p className="text-gray-400 text-sm">Start sharing your knowledge!</p>
                      </div>
                  ) : (
                      <div className="space-y-3">
                          {myLectures.map((lec) => (
                              <div key={lec._id} className="flex justify-between items-center p-4 border rounded-xl hover:bg-gray-50 transition group">
                                  <div className="flex items-center gap-4">
                                      <div className="bg-red-100 text-red-600 p-2.5 rounded-lg group-hover:bg-red-600 group-hover:text-white transition"><Video size={20} /></div>
                                      <div>
                                          <h4 className="font-bold text-gray-800">{lec.title}</h4>
                                          <a href={lec.url} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline flex items-center gap-1">Watch Video <ExternalLink size={10}/></a>
                                      </div>
                                  </div>
                                  <button onClick={() => handleDeleteLecture(lec._id)} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition"><Trash2 size={18} /></button>
                              </div>
                          ))}
                      </div>
                  )}
              </div>
            </>
           ) : (
            // STUDENT WELCOME
            <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 text-center">
                <div className="bg-green-100 w-20 h-20 mx-auto rounded-full flex items-center justify-center text-green-600 mb-6">
                    <User size={40} />
                </div>
                <h3 className="text-3xl font-bold text-gray-800 capitalize">Welcome, {user.username}!</h3>
                <p className="text-gray-500 mt-2 text-lg">Your learning journey starts here.</p>
                <div className="mt-8 flex justify-center gap-4">
                    <button onClick={() => navigate('/mentors')} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 shadow-lg hover:shadow-xl transition">Find Mentors</button>
                    <button onClick={() => setIsEditing(true)} className="bg-gray-100 text-gray-700 px-8 py-3 rounded-xl font-bold hover:bg-gray-200 transition">Update Profile</button>
                </div>
            </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;