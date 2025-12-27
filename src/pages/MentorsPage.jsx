import React, { useState, useEffect } from 'react';
import { Search, MapPin, BookOpen, User, Frown } from 'lucide-react'; // Frown icon add kiya empty state ke liye
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import Avatar from '../components/Avatar'; // ✅ Import Avatar

function MentorsPage() {
  const [mentors, setMentors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // 1. Fetch Mentors
  useEffect(() => {
    // Note: Development me localhost use karna tez hota hai, production me render wala link
    fetch(`${API_BASE_URL}/mentors`)
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
        setLoading(false);
      });
  }, []);

  // 2. Safe Filter Logic
  const filteredMentors = mentors.filter(mentor =>
    (mentor.username || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (mentor.college || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (mentor.branch || "").toLowerCase().includes(searchTerm.toLowerCase()) // Branch search bhi add kar diya
  );

  const handleViewProfile = (mentorId) => {
    navigate(`/mentor/${mentorId}`);
  };

  return (
    // ✅ FIX: "min-h-screen" ensure karta hai page hamesha full height rahe
    <div className="pt-24 md:pt-28 pb-20 bg-gray-50 min-h-screen w-full">
      <div className="max-w-7xl mx-auto px-4 md:px-6">

        {/* Title & Search Bar */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">Find Your Perfect Mentor</h1>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Stop guessing your career path. Connect with seniors from IITs, NITs, and Top Universities who have walked the road.
          </p>

          <div className="max-w-xl mx-auto relative group">
            <Search className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
            <input
              type="text"
              placeholder="Search by name, college, or branch..."
              className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 shadow-sm transition-all text-gray-700"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Mentors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

          {loading ? (
            // Loading Skeleton
            [1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="h-48 bg-gray-200 animate-pulse"></div>
                <div className="p-6 space-y-3">
                  <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                  <div className="h-16 bg-gray-100 rounded mt-4 animate-pulse"></div>
                </div>
              </div>
            ))
          ) : filteredMentors.length > 0 ? (
            filteredMentors.map((mentor) => (
              <div key={mentor._id} className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col group overflow-hidden">

                {/* Card Image with Gradient Overlay */}
                <div className="relative h-52 bg-gray-100 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
                  <Avatar
                    src={mentor.image}
                    name={mentor.username}
                    size="w-full h-full"
                    fontSize="text-6xl"
                    className="rounded-none group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute bottom-4 left-4 z-20 text-white">
                    <h3 className="font-bold text-xl leading-tight">{mentor.username}</h3>
                    <p className="text-white/80 text-xs font-medium uppercase tracking-wide mt-1">{mentor.role || "Mentor"}</p>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 flex flex-col flex-grow">
                  <div className="space-y-3 mb-6">
                    <div className="flex items-start gap-3 text-gray-700">
                      <MapPin size={18} className="text-blue-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm font-medium leading-tight">{mentor.college || "College Not Listed"}</span>
                    </div>

                    <div className="flex items-start gap-3 text-gray-600">
                      <BookOpen size={18} className="text-purple-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{mentor.branch || "General Engineering"}</span>
                    </div>
                  </div>

                  {/* About Preview */}
                  <div className="bg-gray-50 p-3 rounded-lg mb-6">
                    <p className="text-gray-500 text-sm line-clamp-2 italic">
                      "{mentor.about || "I am ready to guide juniors to achieve their dreams."}"
                    </p>
                  </div>

                  <button
                    onClick={() => handleViewProfile(mentor._id)}
                    className="mt-auto w-full bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white py-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                  >
                    <User size={18} /> View Profile
                  </button>
                </div>
              </div>
            ))
          ) : (
            // Empty State
            <div className="col-span-1 md:col-span-3 text-center py-20">
              <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
                <Frown size={48} className="text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">No mentors found</h3>
              <p className="text-gray-500 mt-2">We couldn't find anyone matching "{searchTerm}".</p>
              <button
                onClick={() => setSearchTerm('')}
                className="mt-4 text-blue-600 font-bold hover:underline"
              >
                Clear Search & Show All
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default MentorsPage;