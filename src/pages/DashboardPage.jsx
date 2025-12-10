import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, Edit2, CheckCircle, UploadCloud, Save, Camera } from 'lucide-react';
import toast from 'react-hot-toast';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  
  // Edit Mode State
  const [isEditing, setIsEditing] = useState(false);
  
  // Profile State
  const [profile, setProfile] = useState({
    username: '',
    college: '',
    branch: '',
    about: '',
    image: '' // Isme photo ka data aayega
  });

  // Lectures State
  const [lecture, setLecture] = useState({ title: '', url: '' });
  const [myLectures, setMyLectures] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Check Login
    const storedUser = localStorage.getItem('userData');
    if (!storedUser) {
      navigate('/login');
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    
    // 2. Data Pre-fill karein
    setProfile({
        username: parsedUser.username || '',
        college: parsedUser.college || '',
        branch: parsedUser.branch || '',
        about: parsedUser.about || '',
        image: parsedUser.image || ''
    });

    // 3. Lectures layein (Agar Mentor hai)
    if (parsedUser.role === 'mentor') {
        fetch(`https://navigreat-backend-98.onrender.com/api/lectures/${parsedUser.id}`)
            .then(res => res.json())
            .then(data => { if(data.success) setMyLectures(data.lectures); })
            .finally(() => setLoading(false));
    } else {
        setLoading(false);
    }
  }, [navigate]);

  // --- 📸 NEW: IMAGE UPLOAD FUNCTION ---
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.readAsDataURL(file); // Photo ko code (Base64) me badal raha hai
        reader.onloadend = () => {
            setProfile({ ...profile, image: reader.result }); // Profile state me set kar diya
        };
    }
  };

  const handleProfileChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  // --- SAVE PROFILE ---
  const handleSaveProfile = async () => {
    const loadingToast = toast.loading("Updating Profile...");
    try {
        // Backend Limit badhana mat bhoolna server.js me!
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
            
            // Local Data Update
            const updatedUser = { ...user, ...data.mentor };
            localStorage.setItem('userData', JSON.stringify(updatedUser));
            setUser(updatedUser);
        } else {
            toast.error(data.message || "Failed");
        }
    } catch (error) {
        toast.dismiss(loadingToast);
        toast.error("Server Error (Check backend limit)");
    }
  };

  const handleAddLecture = async (e) => {
    e.preventDefault();
    if (!lecture.title || !lecture.url) return;
    const loadingToast = toast.loading("Uploading...");
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
            toast.success("Added!");
            setMyLectures([...myLectures, { ...lecture, _id: Date.now() }]);
            setLecture({ title: '', url: '' });
        }
    } catch (error) { toast.dismiss(loadingToast); }
  };

  const handleLogout = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
      navigate('/login');
  };

  if (loading || !user) return <div className="text-center pt-24">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* --- LEFT: Profile --- */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center relative">
            
            {/* 📸 Profile Image with Upload Button */}
            <div className="relative w-32 h-32 mx-auto mb-4 group">
                <img 
                    src={profile.image || user.image || `https://ui-avatars.com/api/?name=${user.username}&background=0D8ABC&color=fff`} 
                    alt="Profile" 
                    className="w-full h-full rounded-full object-cover border-4 border-blue-50" 
                />
                
                {/* Sirf Edit Mode me Camera Button dikhega */}
                {isEditing && (
                    <label className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full text-white cursor-pointer hover:bg-blue-700 shadow-md transition transform hover:scale-110">
                        <Camera size={18} />
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                )}
            </div>

            {isEditing ? (
                <input name="username" value={profile.username} onChange={handleProfileChange} className="text-center border p-1 rounded w-full font-bold mb-1" />
            ) : (
                <h2 className="text-2xl font-bold text-gray-800">{user.username}</h2>
            )}
            
            <p className="text-blue-600 font-medium capitalize flex justify-center items-center gap-1">
                {user.role} {user.role === 'mentor' && <CheckCircle size={16} />}
            </p>

            {/* Mentor Details Form */}
            {user.role === 'mentor' && (
                <div className="mt-6 space-y-4 text-left">
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase">College</label>
                        {isEditing ? <input name="college" value={profile.college} onChange={handleProfileChange} className="w-full border p-2 rounded mt-1" /> : <p className="font-medium">{user.college || "Not Added"}</p>}
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase">Branch</label>
                        {isEditing ? <input name="branch" value={profile.branch} onChange={handleProfileChange} className="w-full border p-2 rounded mt-1" /> : <p className="font-medium">{user.branch || "Not Added"}</p>}
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase">About</label>
                        {isEditing ? <textarea name="about" value={profile.about} onChange={handleProfileChange} className="w-full border p-2 rounded mt-1 h-20" /> : <p className="text-sm text-gray-600">{user.about || "No bio added."}</p>}
                    </div>

                    {isEditing ? (
                        <button onClick={handleSaveProfile} className="w-full bg-green-600 text-white py-2 rounded-lg flex justify-center gap-2 hover:bg-green-700">
                            <Save size={18} /> Save Changes
                        </button>
                    ) : (
                        <button onClick={() => setIsEditing(true)} className="w-full bg-blue-600 text-white py-2 rounded-lg flex justify-center gap-2 hover:bg-blue-700">
                            <Edit2 size={18} /> Edit Profile
                        </button>
                    )}
                </div>
            )}
            
            <button onClick={handleLogout} className="mt-4 w-full text-red-500 py-2 hover:bg-red-50 rounded-lg flex justify-center gap-2">
                <LogOut size={18} /> Logout
            </button>
          </div>
        </div>

        {/* --- RIGHT: Content --- */}
        <div className="lg:col-span-2 space-y-6">
           {user.role === 'mentor' ? (
            <>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><UploadCloud className="text-blue-600"/> Upload Content</h3>
                <form onSubmit={handleAddLecture} className="grid md:grid-cols-2 gap-4">
                  <input placeholder="Title" value={lecture.title} onChange={(e) => setLecture({...lecture, title: e.target.value})} className="border p-2 rounded" required />
                  <input placeholder="YouTube URL" value={lecture.url} onChange={(e) => setLecture({...lecture, url: e.target.value})} className="border p-2 rounded" required />
                  <button type="submit" className="md:col-span-2 bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Add Lecture</button>
                </form>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold mb-4">Your Lectures</h3>
                {myLectures.map((lec, i) => (
                    <div key={i} className="flex justify-between p-3 bg-gray-50 border mb-2 rounded">
                        <span>{lec.title}</span>
                        <a href={lec.url} target="_blank" rel="noreferrer" className="text-blue-600 text-sm">Watch</a>
                    </div>
                ))}
              </div>
            </>
          ) : (
            <div className="bg-white p-10 rounded-xl shadow text-center">
               <h2 className="text-2xl font-bold">Welcome Student!</h2>
               <button onClick={() => navigate('/mentors')} className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-full">Find Mentors</button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default DashboardPage;