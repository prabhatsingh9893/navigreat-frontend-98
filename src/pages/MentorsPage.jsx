import React, { useState, useEffect } from 'react';
import { Search, MapPin, BookOpen } from 'lucide-react';

function MentorsPage() {
  const [mentors, setMentors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // 1. Fetch Mentors from Backend
  useEffect(() => {
    fetch('https://navigreat-backend-98.onrender.com/api/mentors')
      .then(res => res.json())
      .then(data => {
        // ✅ FIX 1: Backend se "mentors" array nikalna zaroori hai
        if (data.success) {
          setMentors(data.mentors);
        } else {
          console.error("Failed to fetch");
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error:", err);
        setLoading(false);
      });
  }, []);

  // 2. Filter Logic (Safe Filter)
  const filteredMentors = mentors.filter(mentor => 
    (mentor.username || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (mentor.college || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="pt-28 pb-20 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-6">
        
        {/* Title & Search Bar */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Find Your Perfect Mentor</h1>
          <p className="text-gray-600 mb-8">Connect with seniors from IITs, NITs, and Top Universities.</p>
          
          <div className="max-w-xl mx-auto relative">
            <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search by name or college..." 
              className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:border-blue-500 shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Mentors Grid */}
        {loading ? (
          <div className="text-center py-20 text-blue-600 font-bold">Loading Mentors...</div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {filteredMentors.length > 0 ? (
              filteredMentors.map((mentor) => (
                // ✅ FIX 2: Use _id instead of id
                <div key={mentor._id} className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition group border border-gray-100">
                  
                  {/* Card Header / Image */}
                  <div className="relative h-48 bg-blue-50 flex items-center justify-center overflow-hidden">
                    {/* ✅ FIX 3: Agar image nahi hai to Auto-Avatar dikhao */}
                    <img 
                      src={mentor.image || `https://ui-avatars.com/api/?name=${mentor.username}&background=0D8ABC&color=fff&size=200`} 
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300" 
                      alt={mentor.username}
                      onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/200?text=Mentor"; }} // Fallback
                    />
                    
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                      {/* ✅ FIX 4: Use username instead of name */}
                      <h3 className="text-white font-bold text-xl">{mentor.username}</h3>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center gap-2 text-blue-600 font-medium mb-2">
                      <MapPin size={16}/> 
                      {mentor.college || "College Not Updated"}
                    </div>
                    
                    <div className="flex items-center gap-2 text-gray-500 text-sm mb-4">
                      <BookOpen size={16}/> 
                      {mentor.branch || "Mentor"}
                    </div>

                    {/* Bio (Optional) */}
                    <p className="text-gray-500 text-sm mb-4 line-clamp-2 h-10">
                      {mentor.about || "Ready to guide you to your dream college."}
                    </p>

                    <button className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition">
                      View Profile
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center py-10 bg-white rounded-xl shadow-sm">
                <p className="text-gray-500 text-lg">No mentors found matching "{searchTerm}" 😕</p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

export default MentorsPage;