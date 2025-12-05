import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  
  // Mentor Profile State
  const [profile, setProfile] = useState({
    college: '',
    branch: '',
    experience: '',
    about: ''
  });

  // Lectures State
  const [lecture, setLecture] = useState({ title: '', url: '' });
  const [myLectures, setMyLectures] = useState([]);

  useEffect(() => {
    // 1. Check if user is logged in
    const storedUser = localStorage.getItem('userData');
    if (!storedUser) {
      navigate('/login');
    } else {
      setUser(JSON.parse(storedUser));
    }
  }, [navigate]);

  // Handle Profile Input
  const handleProfileChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  // Save Profile (API Call placeholder)
  const handleSaveProfile = async () => {
    // Yahan Backend API call aayega (e.g., /api/update-profile)
    console.log("Saving Profile:", profile);
    alert("✅ Profile Updated Successfully! (Now visible on Mentors Page)");
    
    // Real implementation example:
    /*
    const response = await fetch('YOUR_BACKEND_URL/api/update-profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: user.email, ...profile })
    });
    */
  };

  // Handle Add Lecture
  const handleAddLecture = (e) => {
    e.preventDefault();
    if (lecture.title && lecture.url) {
      // Add to local list (Backend me save karne ke liye alag API call lagega)
      setMyLectures([...myLectures, lecture]);
      setLecture({ title: '', url: '' }); // Reset form
      alert("✅ Lecture Added!");
    }
  };

  if (!user) return <div className="text-center mt-20">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-10 px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* --- LEFT COLUMN: Profile Settings --- */}
        <div className="md:col-span-1 space-y-6">
          
          {/* Welcome Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
              👤
            </div>
            <h2 className="text-xl font-bold">{user.username}</h2>
            <p className="text-gray-500 capitalize">{user.role || 'Student'}</p>
          </div>

          {/* Edit Profile Form */}
          {user.role === 'mentor' && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold mb-4">Edit Mentor Profile</h3>
              <div className="space-y-3">
                <input 
                  name="college" 
                  placeholder="College (e.g. IIT Bombay)" 
                  onChange={handleProfileChange}
                  className="w-full border p-2 rounded"
                />
                <input 
                  name="branch" 
                  placeholder="Branch (e.g. CSE)" 
                  onChange={handleProfileChange}
                  className="w-full border p-2 rounded"
                />
                <input 
                  name="experience" 
                  placeholder="Experience (e.g. 4th Year)" 
                  onChange={handleProfileChange}
                  className="w-full border p-2 rounded"
                />
                <textarea 
                  name="about" 
                  placeholder="Short Bio..." 
                  onChange={handleProfileChange}
                  className="w-full border p-2 rounded h-24"
                />
                <button 
                  onClick={handleSaveProfile}
                  className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                >
                  Save Profile
                </button>
              </div>
            </div>
          )}
        </div>

        {/* --- RIGHT COLUMN: Content Management --- */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Add Lecture Section */}
          {user.role === 'mentor' ? (
            <>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold mb-4">Upload Lecture / Resource</h3>
                <form onSubmit={handleAddLecture} className="flex gap-4 flex-col sm:flex-row">
                  <input 
                    placeholder="Lecture Title (e.g. DSA Roadmap)" 
                    value={lecture.title}
                    onChange={(e) => setLecture({...lecture, title: e.target.value})}
                    className="flex-1 border p-2 rounded"
                    required
                  />
                  <input 
                    placeholder="Video Link (YouTube URL)" 
                    value={lecture.url}
                    onChange={(e) => setLecture({...lecture, url: e.target.value})}
                    className="flex-1 border p-2 rounded"
                    required
                  />
                  <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">
                    Add
                  </button>
                </form>
              </div>

              {/* My Lectures List */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold mb-4">My Uploaded Lectures</h3>
                {myLectures.length === 0 ? (
                  <p className="text-gray-400">No lectures added yet.</p>
                ) : (
                  <div className="space-y-3">
                    {myLectures.map((lec, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded border">
                        <span className="font-medium">🎥 {lec.title}</span>
                        <a href={lec.url} target="_blank" rel="noreferrer" className="text-blue-600 text-sm hover:underline">
                          Watch Link
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            // Student View
            <div className="bg-white p-10 rounded-xl shadow text-center">
              <h3 className="text-2xl font-bold text-gray-800">Welcome, Student!</h3>
              <p className="text-gray-600 mt-2">Go to "Find Mentors" to start your journey.</p>
              <button onClick={() => navigate('/mentors')} className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-full">
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