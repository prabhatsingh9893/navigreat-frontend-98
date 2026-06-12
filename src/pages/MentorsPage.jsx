import React, { useState, useEffect } from 'react';
import { Search, MapPin, BookOpen, User as UserIcon, Frown, Sparkles, Filter, ChevronRight, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import Avatar from '../components/Avatar';
import { motion, AnimatePresence } from 'framer-motion';
import { FadeIn } from '../components/Animations';
import { MentorCardSkeleton } from '../components/SkeletonLoader';

const BRANCH_FILTERS = ['All', 'CSE', 'ECE', 'Mechanical', 'Civil', 'Chemical', 'Electrical'];

function MentorsPage() {
  const [mentors, setMentors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_BASE_URL}/mentors`)
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.mentors)) setMentors(data.mentors);
        else setMentors([]);
      })
      .catch(() => setMentors([]))
      .finally(() => setLoading(false));
  }, []);

  const filteredMentors = mentors.filter(mentor => {
    const matchesSearch =
      (mentor.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (mentor.college || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (mentor.branch || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      activeFilter === 'All' ||
      (mentor.branch || '').toLowerCase().includes(activeFilter.toLowerCase());
    return matchesSearch && matchesFilter;
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', damping: 25, stiffness: 400 } }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-[#080d14] overflow-x-hidden">

      {/* ====== HERO ====== */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-violet-900 to-slate-900" />
        {/* Orbs */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-violet-600/15 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
        {/* Grid */}
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
        />

        <div className="max-w-5xl mx-auto px-6 relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-indigo-200 text-sm font-semibold mb-6">
              <Sparkles size={14} className="text-yellow-400" /> Connecting Ambitions
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6 leading-tight tracking-tight">
              Find Your Perfect{' '}
              <span className="text-gradient-cyan">Mentor</span>
            </h1>
            <p className="text-xl text-indigo-200/90 max-w-2xl mx-auto leading-relaxed mb-10">
              Connect with seniors from IITs, NITs, and Top Universities who've walked the road and are ready to guide you.
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="max-w-2xl mx-auto"
          >
            <div className="relative bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 flex items-center p-2 focus-within:border-white/40 focus-within:bg-white/15 transition-all duration-300">
              <Search className="ml-3 text-white/60 flex-shrink-0" size={22} />
              <input
                type="text"
                placeholder="Search by name, college, or branch..."
                className="w-full pl-3 pr-4 py-3 bg-transparent border-none outline-none text-white text-base placeholder:text-white/50 font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all">
                  <X size={18} />
                </button>
              )}
              <button className="flex-shrink-0 bg-white text-indigo-700 px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-50 transition-all shadow-lg shadow-black/10 text-sm hidden sm:block">
                Search
              </button>
            </div>
          </motion.div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-slate-50 dark:from-[#080d14] to-transparent" />
      </section>

      {/* ====== FILTERS + GRID ====== */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 pb-24">

        {/* Filter chips */}
        <div className="flex items-center gap-3 mb-10 overflow-x-auto pb-2 scrollbar-hide">
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-sm font-medium flex-shrink-0">
            <Filter size={15} /> Filter:
          </div>
          {BRANCH_FILTERS.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                activeFilter === filter
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25 scale-105'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:text-indigo-600 dark:hover:text-indigo-400'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Results count */}
        {!loading && (
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
            Showing <span className="font-bold text-slate-700 dark:text-slate-200">{filteredMentors.length}</span> mentor{filteredMentors.length !== 1 ? 's' : ''}
            {searchTerm && <> for "<span className="text-indigo-600 dark:text-indigo-400">{searchTerm}</span>"</>}
            {activeFilter !== 'All' && <> in <span className="text-violet-600 dark:text-violet-400">{activeFilter}</span></>}
          </p>
        )}

        {/* Mentors Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {loading ? (
            [1, 2, 3, 4, 5, 6].map((n) => <MentorCardSkeleton key={n} />)
          ) : filteredMentors.length > 0 ? (
            filteredMentors.map((mentor) => (
              <motion.div
                key={mentor._id}
                variants={itemVariants}
                className="mentor-card-premium group shadow-sm hover:shadow-2xl hover:shadow-indigo-100/50 dark:hover:shadow-black/40"
              >
                {/* Image */}
                <div className="relative h-64 overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
                  {/* Badge */}
                  <div className="absolute top-4 right-4 z-20 bg-white/15 backdrop-blur-md border border-white/20 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                    {mentor.role || 'Mentor'}
                  </div>
                  <Avatar
                    src={mentor.image}
                    name={mentor.username}
                    size="w-full h-full"
                    fontSize="text-6xl"
                    className="rounded-none group-hover:scale-110 transition-transform duration-700 object-cover"
                    loading="lazy"
                  />
                  {/* Name overlay */}
                  <div className="absolute bottom-5 left-5 z-20 text-white">
                    <h3 className="font-bold text-xl leading-tight mb-1">{mentor.username}</h3>
                    <p className="text-white/75 text-sm flex items-center gap-1.5">
                      <MapPin size={12} className="text-indigo-400" />
                      {mentor.college?.split(',')[0] || 'Top University'}
                    </p>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 bg-white dark:bg-slate-800 relative">
                  {/* Decorative circle */}
                  <div className="absolute -top-5 right-6 w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center text-white border-2 border-white dark:border-slate-800 shadow-lg z-20 group-hover:scale-110 transition duration-300">
                    <BookOpen size={16} />
                  </div>

                  <div className="mb-5 pt-2">
                    <span className="inline-block bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-lg text-xs font-bold border border-indigo-100 dark:border-indigo-800">
                      {mentor.branch || 'General Engineering'}
                    </span>
                  </div>

                  <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2 leading-relaxed mb-5">
                    "{mentor.about || 'Ready to guide juniors to achieve their dreams. Let\'s connect and discuss your future path.'}"
                  </p>

                  <button
                    onClick={() => navigate(`/mentor/${mentor._id}`)}
                    className="btn-primary w-full py-3 rounded-xl text-sm"
                  >
                    View Profile <ChevronRight size={16} />
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-3 text-center py-24">
              <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                <div className="absolute inset-0 bg-indigo-100 dark:bg-indigo-900/30 rounded-full animate-ping opacity-30" />
                <Frown size={44} className="text-slate-400 dark:text-slate-500 relative z-10" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">No mentors found</h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-8">
                {searchTerm
                  ? `We couldn't find anyone matching "${searchTerm}" in ${activeFilter !== 'All' ? activeFilter : 'any branch'}.`
                  : 'No mentors in this category yet. Check back soon!'
                }
              </p>
              <div className="flex items-center justify-center gap-3">
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="btn-secondary px-6 py-3 rounded-xl"
                  >
                    Clear Search
                  </button>
                )}
                {activeFilter !== 'All' && (
                  <button
                    onClick={() => setActiveFilter('All')}
                    className="btn-primary px-6 py-3 rounded-xl"
                  >
                    Show All Mentors
                  </button>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default MentorsPage;