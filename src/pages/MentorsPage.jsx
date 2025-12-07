import React, { useState, useEffect } from 'react';
import { Search, MapPin, BookOpen, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // Navigation ke liye

function MentorsPage() {
  const [mentors, setMentors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate(); // Hook for navigation

  // 1. Fetch Mentors
  useEffect(() => {
    fetch('https://navigreat-backend-98.onrender.com/api/mentors')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.mentors)) {
          setMentors(data.mentors);
        } else {
          console.error("Format error: 'mentors' array not found", data);
          setMentors([]);
        }
      })
      .catch(err => {
        console.error("Error fetching mentors:", err);
        setMentors([]); 
      })
      .finally(() => {
        setLoading(false); // Ye hamesha chalega, chahe error ho ya success
      });
  }, []);

  // 2. Safe Filter Logic
  const filteredMentors = mentors.filter(mentor => 
     (mentor.username || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
     (mentor.college || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 3. Handle Navigation
  const handleViewProfile = (mentorId) => {
    // Yahan tumhara route define hona chahiye, e.g., /mentor/:id
    navigate(`/mentor/${mentorId}`);
  };

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
              className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:border-blue-500 shadow-sm transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Mentors Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          
          {loading ? (
            // Loading Skeleton (Professional Look)
            [1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 animate-pulse">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))
          ) : filteredMentors.length > 0 ? (
            filteredMentors.map((mentor) => (
              <div key={mentor._id} className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 group border border-gray-100 flex flex-col">
                
                {/* Card Image */}
                <div className="relative h-48 bg-blue-50 overflow-hidden">
                  <img 
                    src={mentor.image || `https://ui-avatars.com/api/?name=${mentor.username}&background=0D8ABC&color=fff&size=200`} 
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                    alt={mentor.username}
                    onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/200?text=Mentor"; }} 
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 pt-10">
                    <h3 className="text-white font-bold text-xl truncate">{mentor.username}</h3>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex items-center gap-2 text-blue-600 font-medium mb-2">
                    <MapPin size={16} className="flex-shrink-0"/> 
                    <span className="truncate">{mentor.college || "College Not Updated"}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-gray-500 text-sm mb-4">
                    <BookOpen size={16} className="flex-shrink-0"/> 
                    <span className="truncate">{mentor.branch || "Mentor"}</span>
                  </div>

                  <p className="text-gray-500 text-sm mb-6 line-clamp-2 min-h-[40px]">
                    {mentor.about || "Ready to guide you to your dream college."}
                  </p>

                  <button 
                    onClick={() => handleViewProfile(mentor._id)}
                    className="mt-auto w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 active:bg-blue-800 transition-colors flex items-center justify-center gap-2"
                  >
                    <User size={18} />
                    View Profile
                  </button>
                </div>
              </div>
            ))
          ) : (
            // Empty State
            <div className="col-span-3 text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
               <Search className="mx-auto h-12 w-12 text-gray-300 mb-3" />
               <p className="text-gray-500 text-lg">No mentors found matching "{searchTerm}"</p>
               <button 
                 onClick={() => setSearchTerm('')} 
                 className="mt-2 text-blue-600 font-medium hover:underline"
               >
                 Clear Search
               </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default MentorsPage;