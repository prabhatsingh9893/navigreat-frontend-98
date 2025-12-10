import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, BookOpen, Video, LogOut, Edit2, CheckCircle, UploadCloud } from 'lucide-react';
import toast from 'react-hot-toast'; // Toast notifications ke liye

const DashboardPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  
  // Profile State
  const [profile, setProfile] = useState({
    college: '',
    branch: '',
    experience: '',
    about: ''
  });

  // Lectures State
  const [lecture, setLecture] = useState({ title: '', url: '' });
  const [myLectures, setMyLectures] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Auth Check & User Data
    const storedUser = localStorage.getItem('userData');
    if (!storedUser) {
      navigate('/login');
      return;
    }
    
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    
    // Pre-fill profile data from localStorage (or fetch from API later)
    setProfile({
        college: parsedUser.college || '',
        branch: parsedUser.branch || '',
        experience: parsedUser.experience || '',
        about: parsedUser.about || ''
    });

    // 2. Fetch User's Lectures from Backend
    if (parsedUser.role === 'mentor') {
        fetch(`https://navigreat-backend-98.onrender.com/api/lectures/${parsedUser.id}`) // Assuming API exists
            .then(res => res.json())
            .then(data => {
                if(data.success) setMyLectures(data.lectures);
            })
            .catch(err => console.error("Failed to load lectures", err))
            .finally(() => setLoading(false));
    } else {
        setLoading(false);
    }

  }, [navigate]);

  // Handle Profile Input
  const handleProfileChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  // Save Profile Logic (API Integration)
  const handleSaveProfile = async () => {
    const loadingToast = toast.loading("Saving Profile...");
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
            // Update local storage to reflect changes immediately
            const updatedUser = { ...user, ...profile };
            localStorage.setItem('userData', JSON.stringify(updatedUser));
            setUser(updatedUser);
        } else {
            toast.error("Update Failed: " + data.message);
        }
    } catch (error) {
        toast.dismiss(loadingToast);
        toast.error("Server Error");
    }
  };

  // Handle Add Lecture Logic
  const handleAddLecture = async (e) => {
    e.preventDefault();
    if (!lecture.title || !lecture.url) return;

    const loadingToast = toast.loading("Uploading...");
    
    try {
        const res = await fetch('https://navigreat-backend-98.onrender.com/api/lectures', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                mentorId: user.id, // User ID bhejna zaroori hai
                title: lecture.title,
                url: lecture.url
            })
        });

        const data = await res.json();
        toast.dismiss(loadingToast);

        if(data.success) {
            toast.success("Lecture Added!");
            setMyLectures([...myLectures, { ...lecture, _id: Date.now() }]); // Optimistic Update
            setLecture({ title: '', url: '' }); // Reset form
        } else {
            toast.error("Upload Failed");
        }
    } catch (error) {
        toast.dismiss(loadingToast);
        toast.error("Server Error");
    }
  };

  const handleLogout = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
      navigate('/login');
  };

  if (loading || !user) return (
      <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* --- LEFT COLUMN: Profile Info --- */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* User Card */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
            <div className="relative z-10 w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-md -mt-10">
               {user.image ? (
                   <img src={user.image} alt="Profile" className="w-full h-full rounded-full object-cover" />
               ) : (
                   <User size={40} className="text-gray-400" />
               )}
            </div>
            <h2 className="text-2xl font-bold text-gray-800">{user.username}</h2>
            <p className="text-blue-600 font-medium capitalize flex items-center justify-center gap-1 mt-1">
                {user.role} {user.role === 'mentor' && <CheckCircle size={16} />}
            </p>
            
            <button 
                onClick={handleLogout}
                className="mt-6 flex items-center justify-center gap-2 text-red-500 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg w-full transition font-medium"
            >
                <LogOut size={18} /> Logout
            </button>
          </div>

          {/* Edit Profile (Only for Mentors) */}
          {user.role === 'mentor' && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-6 border-b pb-4">
                  <Edit2 size={20} className="text-blue-600" />
                  <h3 className="text-lg font-bold text-gray-800">Profile Details</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">College</label>
                    <input name="college" value={profile.college} onChange={handleProfileChange} className="w-full border p-2 rounded mt-1 focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Branch</label>
                    <input name="branch" value={profile.branch} onChange={handleProfileChange} className="w-full border p-2 rounded mt-1 focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Bio / About</label>
                    <textarea name="about" value={profile.about} onChange={handleProfileChange} className="w-full border p-2 rounded mt-1 h-24 focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <button 
                  onClick={handleSaveProfile}
                  className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </div>
          )}
        </div>

        {/* --- RIGHT COLUMN: Content --- */}
        <div className="lg:col-span-2 space-y-6">
          
          {user.role === 'mentor' ? (
            <>
              {/* Upload Section */}
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-6">
                    <UploadCloud size={24} className="text-blue-600" />
                    <h3 className="text-xl font-bold text-gray-800">Share Knowledge</h3>
                </div>
                
                <form onSubmit={handleAddLecture} className="grid md:grid-cols-2 gap-4">
                  <input 
                    placeholder="Lecture Title (e.g. DSA Roadmap)" 
                    value={lecture.title}
                    onChange={(e) => setLecture({...lecture, title: e.target.value})}
                    className="border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                  <input 
                    placeholder="Video URL (YouTube)" 
                    value={lecture.url}
                    onChange={(e) => setLecture({...lecture, url: e.target.value})}
                    className="border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                  <button type="submit" className="md:col-span-2 bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition shadow-md">
                    Upload Resource
                  </button>
                </form>
              </div>

              {/* List Section */}
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold mb-6 text-gray-800">Your Uploads</h3>
                
                {myLectures.length === 0 ? (
                  <div className="text-center py-10 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                      <BookOpen size={40} className="mx-auto mb-2 opacity-50" />
                      <p>No lectures added yet. Start sharing!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myLectures.map((lec, index) => (
                      <div key={index} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-gray-50 rounded-xl border border-gray-100 hover:bg-blue-50 transition group">
                        <div className="flex items-center gap-3 mb-2 sm:mb-0">
                            <div className="bg-white p-2 rounded-full shadow-sm text-red-500">
                                <Video size={20} />
                            </div>
                            <span className="font-semibold text-gray-700">{lec.title}</span>
                        </div>
                        <a 
                            href={lec.url} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="text-blue-600 text-sm font-medium bg-blue-100 px-4 py-1.5 rounded-full hover:bg-blue-200 transition"
                        >
                          Watch Video ↗
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            // Student Dashboard View
            <div className="bg-white p-12 rounded-2xl shadow-sm text-center border border-gray-100">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <BookOpen size={40} className="text-green-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-800 mb-2">Ready to Learn?</h3>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">Find expert mentors from top colleges and book your 1-on-1 guidance session today.</p>
              <button onClick={() => navigate('/mentors')} className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold hover:bg-blue-700 transition shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                Find Mentors Now
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default DashboardPage;