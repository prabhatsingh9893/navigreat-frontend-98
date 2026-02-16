import React, { useState, useEffect } from 'react';
import { Search, MapPin, BookOpen, User as UserIcon, Frown, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import Avatar from '../components/Avatar';
import { motion } from 'framer-motion';

function MentorsPage() {
  const [mentors, setMentors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // 1. Fetch Mentors
  useEffect(() => {
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
    (mentor.branch || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewProfile = (mentorId) => {
    navigate(`/mentor/${mentorId}`);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', damping: 25, stiffness: 500 } }
  };

  return (
    <div className="pt-24 min-h-screen w-full relative overflow-x-hidden bg-slate-50 dark:bg-[#0b141a]">

      {/* 1. Header Background Video */}
      <div className="absolute top-0 left-0 w-full h-[600px] overflow-hidden rounded-b-[4rem] shadow-sm z-0">
        <div className="absolute inset-0 bg-white/60 dark:bg-black/80 z-10"></div> {/* Light overlay */}
        <img
          src="https://images.unsplash.com/photo-1531545514256-b1400bc00f31?auto=format&fit=crop&q=80&w=1920"
          alt="Mentors Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-50 dark:from-[#0b141a] to-transparent z-20"></div> {/* Fade out to list */}
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6">

        {/* Title & Search Bar */}
        <div className="text-center mb-16 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-bold text-sm mb-6 border border-blue-200 dark:border-blue-800 shadow-sm">
              <Sparkles size={16} /> Connecting Ambitions
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-6 tracking-tight leading-tight">
              Find Your Perfect <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Mentor</span>
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
              Stop guessing your career path. Connect with seniors from IITs, NITs, and Top Universities who have walked the road.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="max-w-2xl mx-auto relative group"
          >
            <div className="absolute inset-0 bg-blue-200 dark:bg-blue-900/50 blur-xl opacity-20 group-hover:opacity-30 transition duration-500 rounded-full"></div>
            <div className="relative bg-white dark:bg-[#202c33] rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center p-2 border border-gray-100 dark:border-[#2a3942] group-focus-within:border-blue-300 group-focus-within:ring-4 group-focus-within:ring-blue-100 dark:group-focus-within:ring-blue-900/50">
              <Search className="ml-4 text-gray-400 dark:text-gray-500 group-focus-within:text-blue-500 transition-colors" size={24} />
              <input
                type="text"
                placeholder="Search by name, college, or branch..."
                className="w-full pl-4 pr-6 py-3 bg-transparent border-none outline-none text-gray-700 dark:text-[#e9edef] text-lg placeholder:text-gray-400 dark:placeholder:text-gray-500 font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="bg-blue-600 text-white px-6 py-2.5 rounded-full font-bold hover:bg-blue-700 transition shadow-md hidden sm:block">
                Search
              </button>
            </div>
          </motion.div>
        </div>

        {/* Mentors Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >

          {loading ? (
            // Loading Skeleton
            [1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="bg-white dark:bg-[#202c33] rounded-3xl shadow-sm border border-gray-100 dark:border-[#2a3942] overflow-hidden h-[450px]">
                <div className="h-48 bg-gray-200 dark:bg-[#2a3942] animate-pulse"></div>
                <div className="p-8 space-y-4">
                  <div className="h-8 bg-gray-200 dark:bg-[#2a3942] rounded-lg w-3/4 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 dark:bg-[#2a3942] rounded w-1/2 animate-pulse"></div>
                  <div className="space-y-2 mt-6">
                    <div className="h-4 bg-gray-100 dark:bg-[#2a3942] rounded w-full animate-pulse"></div>
                    <div className="h-4 bg-gray-100 dark:bg-[#2a3942] rounded w-5/6 animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))
          ) : filteredMentors.length > 0 ? (
            filteredMentors.map((mentor) => (
              <motion.div
                key={mentor._id}
                variants={itemVariants}
                whileHover={{ y: -10 }}
                className="bg-white dark:bg-[#202c33] rounded-3xl shadow-sm hover:shadow-2xl hover:shadow-blue-100/50 dark:hover:shadow-black/50 transition-all duration-300 border border-gray-100 dark:border-[#2a3942] flex flex-col group overflow-hidden relative"
              >

                {/* Card Image with Gradient Overlay */}
                <div className="relative h-60 bg-gray-100 dark:bg-[#2a3942] overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10"></div>
                  <div className="absolute top-4 right-4 z-20 bg-white/20 backdrop-blur-md border border-white/20 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                    {mentor.role || "Mentor"}
                  </div>
                  <Avatar
                    src={mentor.image}
                    name={mentor.username}
                    size="w-full h-full"
                    fontSize="text-6xl"
                    className="rounded-none group-hover:scale-105 transition-transform duration-700 object-cover"
                  />
                  <div className="absolute bottom-6 left-6 z-20 text-white">
                    <h3 className="font-bold text-2xl leading-tight mb-1">{mentor.username}</h3>
                    <p className="text-white/80 text-sm font-medium flex items-center gap-1">
                      <MapPin size={14} className="text-blue-400" /> {mentor.college?.split(',')[0] || "University"}
                    </p>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 flex flex-col flex-grow relative">
                  {/* Decorative circle */}
                  <div className="absolute -top-6 right-8 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white border-4 border-white dark:border-[#202c33] shadow-lg z-20 group-hover:scale-110 transition duration-300">
                    <BookOpen size={20} />
                  </div>

                  <div className="mb-6 pt-2">
                    <div className="flex items-start gap-3 text-gray-600 dark:text-gray-300 mb-3">
                      <span className="bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-lg text-sm font-bold border border-purple-100 dark:border-purple-800 w-fit">
                        {mentor.branch || "General Engineering"}
                      </span>
                    </div>
                    <p className="text-gray-500 dark:text-[#8696a0] text-sm line-clamp-2 leading-relaxed">
                      "{mentor.about || "I am ready to guide juniors to achieve their dreams. Let's connect and discuss your future path."}"
                    </p>
                  </div>

                  <button
                    onClick={() => handleViewProfile(mentor._id)}
                    className="mt-auto w-full bg-white dark:bg-[#2a3942] border border-gray-200 dark:border-[#2a3942] text-gray-700 dark:text-[#e9edef] hover:border-blue-600 hover:text-blue-600 dark:hover:text-blue-400 py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 group-hover:bg-blue-600 group-hover:text-white group-hover:border-transparent group-hover:shadow-lg group-hover:shadow-blue-200 dark:group-hover:shadow-blue-900/50"
                  >
                    View Profile <UserIcon size={18} />
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            // Empty State
            <div className="col-span-1 md:col-span-3 text-center py-20">
              <div className="bg-gray-50 dark:bg-[#202c33] w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                <div className="absolute inset-0 bg-blue-100 dark:bg-blue-900/20 rounded-full animate-ping opacity-20"></div>
                <Frown size={56} className="text-gray-400 dark:text-gray-500 relative z-10" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No mentors found</h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-8">We couldn't find anyone matching "{searchTerm}". Try searching for a different name, college, or branch.</p>
              <button
                onClick={() => setSearchTerm('')}
                className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200"
              >
                Clear Search & Show All
              </button>
            </div>
          )}
        </motion.div>

      </div>
    </div>
  );
}

export default MentorsPage;