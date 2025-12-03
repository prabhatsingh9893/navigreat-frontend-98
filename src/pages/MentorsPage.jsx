import React, { useState, useEffect } from 'react';
import { Search, MapPin, BookOpen } from 'lucide-react';

function MentorsPage() {
  const [mentors, setMentors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Fetch Mentors from Backend
  useEffect(() => {
    fetch('https://navigreat-backend-98.onrender.com/api/mentors')
      .then(res => res.json())
      .then(data => setMentors(data))
      .catch(err => console.error("Error:", err));
  }, []);

  // 2. Filter Logic (Search by Name or College)
  const filteredMentors = mentors.filter(mentor => 
    mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mentor.college.toLowerCase().includes(searchTerm.toLowerCase())
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
              placeholder="Search by name or college (e.g. IIT Bombay)..." 
              className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:border-blue-500 shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Mentors Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {filteredMentors.length > 0 ? (
            filteredMentors.map((mentor) => (
              <div key={mentor.id} className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition group">
                <div className="relative">
                  <img src={mentor.image} className="w-full h-56 object-cover group-hover:scale-105 transition duration-300" alt={mentor.name}/>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                    <h3 className="text-white font-bold text-xl">{mentor.name}</h3>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 text-blue-600 font-medium mb-2">
                    <MapPin size={16}/> {mentor.college}
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 text-sm mb-4">
                    <BookOpen size={16}/> {mentor.role}
                  </div>
                  <button className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition">
                    View Profile
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center text-gray-500 py-10">
              No mentors found matching "{searchTerm}"
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default MentorsPage;