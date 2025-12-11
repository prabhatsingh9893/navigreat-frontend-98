import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, Edit2, CheckCircle, UploadCloud, Save, Camera, BookOpen, Video, Trash2, ExternalLink, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  
  // --- STATES ---
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Profile Data
  const [profile, setProfile] = useState({
    username: '',
    college: '',
    branch: '',
    about: '',
    image: '' 
  });

  // Lectures Data
  const [lecture, setLecture] = useState({ title: '', url: '' });
  const [myLectures, setMyLectures] = useState([]);

  // --- 1. INITIAL LOAD (UPDATED FOR DATA PERSISTENCE) ---
  useEffect(() => {
    const storedUser = localStorage.getItem('userData');
    if (!storedUser) {
      navigate('/login');
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    
    // Default values set karo
    setProfile({
        username: parsedUser.username || '',
        college: parsedUser.college || '',
        branch: parsedUser.branch || '',
        about: parsedUser.about || '',
        image: parsedUser.image || ''
    });

    // Agar Mentor hai, to SERVER se TAJAA DATA mangao
    if (parsedUser.role === 'mentor') {
        
        // A. Profile Data Fetch (Taaki College/Branch gayab na ho)
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
                    // LocalStorage update karo
                    localStorage.setItem('userData', JSON.stringify({ ...parsedUser, ...freshData }));
                }
            })
            .catch(err => console.error("Profile fetch error:", err));

        // B. Lectures Fetch
        fetch(`https://navigreat-backend-98.onrender.com/api/lectures/${parsedUser.id}`)
            .then(res => res.json())
            .then(data => { if(data.success) setMyLectures(data.lectures); })
            .catch(err => console.error("Error fetching lectures:", err))
            .finally(() => setLoading(false));
    } else {
        setLoading(false);
    }
  }, [navigate]);

  // --- 2. IMAGE UPLOAD LOGIC ---
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
        if (file.size > 2 * 1024 * 1024) {
            toast.error("Image size should be less than 2MB");
            return;
        }
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = () => {
            setProfile({ ...profile, image: reader.result });
        };
    }
  };

  const handleProfileChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  // --- 3. SAVE PROFILE ---
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
            toast.success("Profile Updated Successfully!");
            setIsEditing(false);
            
            const updatedDetails = data.mentor || data.user || profile;
            const updatedUser = { ...user, ...updatedDetails };
            
            localStorage.setItem('userData', JSON.stringify(updatedUser));
            setUser(updatedUser);
        } else {
            toast.error(data.message || "Failed to update");
        }
    } catch (error) {
        toast.dismiss(loadingToast);
        toast.error("Server Error (Check image size)");
    }
  };

  // --- 4. ADD LECTURE ---
  const handleAddLecture = async (e) => {
    e.preventDefault();
    if (!lecture.title || !lecture.url) return;
    
    const loadingToast = toast.loading("Uploading Lecture...");
    try {
        const res = await fetch('https://navigreat-backend-98.onrender.com/api/lectures', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                mentorId: user.id,
                title: lecture.title,
                url: lecture.url
            })
        });
        const data = await res.json();
        toast.dismiss(loadingToast);
        
        if(data.success) {
            toast.success("Lecture Added!");
            setMyLectures([...myLectures, data.lecture]); 
            setLecture({ title: '', url: '' });
        }
    } catch (error) { 
        toast.dismiss(loadingToast); 
        toast.error("Failed to add lecture");
    }
  };

  // --- 5. DELETE LECTURE (New Feature) ---
  const handleDeleteLecture = async (lectureId) => {
      if(!window.confirm("Are you sure you want to delete this lecture?")) return;
      
      const loadingToast = toast.loading("Deleting...");
      try {
          const res = await fetch(`https://navigreat-backend-98.onrender.com/api/lectures/${lectureId}`, {
              method: 'DELETE'
          });
          const data = await res.json();
          toast.dismiss(loadingToast);

          if (data.success) {
              setMyLectures(myLectures.filter(l => l._id !== lectureId));
              toast.success("Deleted successfully");
          } else {
              toast.error("Failed to delete");
          }
      } catch (err) {
          toast.dismiss(loadingToast);
          toast.error("Error deleting lecture");
      }
  };

  const handleLogout = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
      navigate('/login');
  };

  if (loading || !user) return <div className="text-center pt-24 font-bold text-gray-500">Loading Dashboard...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ================= LEFT COLUMN: PROFILE CARD ================= */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center relative">
            
            {/* 📸 IMAGE SECTION */}
            <div className="relative w-32 h-32 mx-auto mb-4 group">
                <img 
                    src={profile.image || user.image || `https://ui-avatars.com/api/?name=${user.username}&background=0D8ABC&color=fff`} 
                    alt="Profile" 
                    className="w-full h-full rounded-full object-cover border-4 border-blue-50 shadow-sm" 
                />
                {isEditing && (
                    <label className="absolute bottom-0 right-0 bg-blue-600 p-2.5 rounded-full text-white cursor-pointer hover:bg-blue-700 shadow-md transition transform hover:scale-110">
                        <Camera size={18} />
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                )}
            </div>

            {/* NAME & ROLE */}
            {isEditing ? (
                <input 
                    name="username" 
                    value={profile.username} 
                    onChange={handleProfileChange} 
                    className="text-center border-b-2 border-blue-200 p-1 rounded w-full font-bold text-xl mb-1 focus:outline-none focus:border-blue-600"
                    placeholder="Your Name"
                />
            ) : (
                <h2 className="text-2xl font-bold text-gray-800">{user.username}</h2>
            )}
            
            <p className="text-blue-600 font-medium capitalize flex justify-center items-center gap-1 mb-6">
                {user.role} {user.role === 'mentor' && <CheckCircle size={16} />}
            </p>

            {/* MENTOR DETAILS FORM */}
            {user.role === 'mentor' && (
                <div className="space-y-4 text-left bg-gray-50 p-4 rounded-xl">
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">College</label>
                        {isEditing ? (
                            <input name="college" value={profile.college} onChange={handleProfileChange} className="w-full border p-2 rounded-lg mt-1 bg-white" placeholder="Ex: IIT Delhi" />
                        ) : (
                            <p className="font-semibold text-gray-700">{user.college || "Not Added"}</p>
                        )}
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Branch</label>
                        {isEditing ? (
                            <input name="branch" value={profile.branch} onChange={handleProfileChange} className="w-full border p-2 rounded-lg mt-1 bg-white" placeholder="Ex: CSE" />
                        ) : (
                            <p className="font-semibold text-gray-700">{user.branch || "Not Added"}</p>
                        )}
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">About Me</label>
                        {isEditing ? (
                            <textarea name="about" value={profile.about} onChange={handleProfileChange} className="w-full border p-2 rounded-lg mt-1 h-24 bg-white" placeholder="Write a short bio..." />
                        ) : (
                            <p className="text-sm text-gray-600 leading-relaxed">{user.about || "No bio added yet."}</p>
                        )}
                    </div>
                </div>
            )}
            
            {/* ACTION BUTTONS */}
            <div className="mt-6 space-y-3">
                {user.role === 'mentor' && (
                    <>
                        {isEditing ? (
                            <button onClick={handleSaveProfile} className="w-full bg-green-600 text-white py-2.5 rounded-xl flex justify-center items-center gap-2 hover:bg-green-700 transition font-bold shadow-md">
                                <Save size={18} /> Save Changes
                            </button>
                        ) : (
                            <button onClick={() => setIsEditing(true)} className="w-full bg-blue-600 text-white py-2.5 rounded-xl flex justify-center items-center gap-2 hover:bg-blue-700 transition font-bold shadow-md">
                                <Edit2 size={18} /> Edit Profile
                            </button>
                        )}

                        {/* ✅ NEW: View Public Profile Button */}
                        <button 
                            onClick={() => navigate(`/mentor/${user.id}`)} 
                            className="w-full bg-white border border-gray-200 text-gray-700 py-2.5 rounded-xl flex justify-center items-center gap-2 hover:bg-gray-50 transition font-medium shadow-sm"
                        >
                            <Eye size={18} /> View Public Profile
                        </button>
                    </>
                )}

                <button onClick={handleLogout} className="w-full border border-red-200 text-red-500 py-2.5 rounded-xl flex justify-center items-center gap-2 hover:bg-red-50 transition font-medium">
                    <LogOut size={18} /> Logout
                </button>
            </div>
          </div>
        </div>

        {/* ================= RIGHT COLUMN: CONTENT ================= */}
        <div className="lg:col-span-2 space-y-6">
           
           {/* --- MENTOR VIEW --- */}
           {user.role === 'mentor' ? (
            <>
              {/* Upload Card */}
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                        <UploadCloud size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">Add New Resource</h3>
                </div>
                
                <form onSubmit={handleAddLecture} className="grid md:grid-cols-2 gap-4">
                  <input 
                    placeholder="Lecture Title (e.g. DSA Roadmap)" 
                    value={lecture.title} 
                    onChange={(e) => setLecture({...lecture, title: e.target.value})} 
                    className="border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition" 
                    required 
                  />
                  <input 
                    placeholder="YouTube Video URL" 
                    value={lecture.url} 
                    onChange={(e) => setLecture({...lecture, url: e.target.value})} 
                    className="border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition" 
                    required 
                  />
                  <button type="submit" className="md:col-span-2 bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-black transition shadow-lg">
                    Upload Lecture
                  </button>
                </form>
              </div>

              {/* Lecture List - FIXED with DELETE */}
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex items-center gap-3 mb-6">
                      <div className="bg-purple-100 p-3 rounded-full text-purple-600">
                          <Video size={24} />
                      </div>
                      <h3 className="text-xl font-bold text-gray-800">My Lectures</h3>
                  </div>

                  {myLectures.length === 0 ? (
                      <div className="text-center py-10 text-gray-400">
                          <BookOpen size={48} className="mx-auto mb-3 opacity-20" />
                          <p>No lectures uploaded yet.</p>
                      </div>
                  ) : (
                      <div className="grid gap-4">
                          {myLectures.map((lec) => (
                              <div key={lec._id} className="flex justify-between items-center p-4 border rounded-xl hover:bg-gray-50 transition">
                                  <div className="flex items-center gap-4">
                                      <div className="bg-red-100 text-red-600 p-2 rounded-lg">
                                          <Video size={20} />
                                      </div>
                                      <div>
                                          <h4 className="font-bold text-gray-800">{lec.title}</h4>
                                          <a href={lec.url} target="_blank" rel="noreferrer" className="text-sm text-blue-500 hover:underline flex items-center gap-1">
                                              Watch Video <ExternalLink size={12}/>
                                          </a>
                                      </div>
                                  </div>
                                  {/* ✅ NEW: Delete Button */}
                                  <button 
                                    onClick={() => handleDeleteLecture(lec._id)}
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                                    title="Delete Lecture"
                                  >
                                    <Trash2 size={18} />
                                  </button>
                              </div>
                          ))}
                      </div>
                  )}
              </div>
            </>
           ) : (
            // --- STUDENT VIEW ---
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center py-20">
                <div className="bg-green-100 w-16 h-16 mx-auto rounded-full flex items-center justify-center text-green-600 mb-4">
                    <User size={32} />
                </div>
                <h3 className="text-2xl font-bold text-gray-800">Welcome Student!</h3>
                <p className="text-gray-500 mt-2">Find a mentor to start your journey.</p>
                <button 
                    onClick={() => navigate('/find-mentor')} 
                    className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-md"
                >
                    Find Mentors
                </button>
            </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;