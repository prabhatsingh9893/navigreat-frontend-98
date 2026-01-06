import React, { useEffect, useState } from 'react';
import { BookOpen, CheckCircle, ArrowRight, Sparkles, Users, Award, Star } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import FAQSection from '../components/FAQSection';
import { API_BASE_URL } from '../config';
import Avatar from '../components/Avatar';
import PageTransition from '../components/PageTransition';

// --- ANIMATED COUNTER ---
const Counter = ({ end, duration }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else { setCount(Math.ceil(start)); }
    }, 16);
    return () => clearInterval(timer);
  }, [end, duration]);
  return <span>{count}</span>;
};

// --- ANIMATION VARIANTS ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" }
  }
};

function HomePage() {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [text, setText] = useState("Dream Job");
  const words = ["Dream Job", "Top IITs", "Global Unis", "Success"];

  // Typewriter Effect
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setText(words[i]);
      i = (i + 1) % words.length;
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  // Fetch Mentors
  useEffect(() => {
    fetch(`${API_BASE_URL}/mentors`)
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.mentors)) setMentors(data.mentors);
        else setMentors([]);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <PageTransition className="pt-0"> {/* Wrapper for Global Transition */}
      <div className="font-sans bg-slate-50 min-h-screen">
        {/* 1. HERO SECTION (Video Background) */}
        {/* 1. HERO SECTION (Video Background - Light Theme) */}
        <section className="relative pt-32 pb-24 overflow-hidden min-h-[90vh] flex items-center bg-white">

          {/* ✅ VIDEO BACKGROUND */}
          <div className="absolute inset-0 z-0">
            {/* Subtle light overlay to ensure text contrast without hiding video */}
            <div className="absolute inset-0 bg-white/40 z-10" />
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            >
              <source src="https://videos.pexels.com/video-files/3129671/3129671-uhd_2560_1440_30fps.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>

          <div className="container mx-auto px-6 relative z-20">
            <motion.div
              className="flex flex-col md:flex-row items-center gap-12"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Left Content */}
              <div className="md:w-1/2 text-center md:text-left space-y-8">
                <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 font-semibold text-sm border border-blue-100 shadow-sm backdrop-blur-sm">
                  <Sparkles size={16} className="text-blue-600" />
                  <span>#1 Mentorship Platform</span>
                </motion.div>

                <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-extrabold text-slate-900 leading-tight tracking-tight">
                  Unlock Your <br />
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                    {text}
                  </span>
                </motion.h1>

                <motion.p variants={itemVariants} className="text-lg text-slate-600 leading-relaxed max-w-lg mx-auto md:mx-0 font-medium">
                  Stop guessing your career path. Connect with verified seniors from IITs & NITs who have already walked the road.
                </motion.p>

                <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                  <Link to="/mentors" className="bg-blue-600 text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-blue-500/25 hover:bg-blue-700 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2">
                    Find a Mentor <ArrowRight size={20} />
                  </Link>
                  <Link to="/become-mentor" className="bg-white text-slate-700 border border-slate-200 px-8 py-4 rounded-xl font-bold hover:bg-slate-50 transition-all hover:border-slate-300 backdrop-blur-sm bg-opacity-80">
                    Become a Mentor
                  </Link>
                </motion.div>

                <motion.div variants={itemVariants} className="flex items-center gap-4 justify-center md:justify-start pt-4">
                  <div className="flex -space-x-3">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-xs font-bold text-slate-500">
                        <Users size={16} />
                      </div>
                    ))}
                  </div>
                  <div className="text-sm font-medium text-slate-600">
                    <span className="font-bold text-slate-900">500+</span> Students Joined
                  </div>
                </motion.div>
              </div>

              {/* Right Image (Floating Cards) */}
              <motion.div variants={itemVariants} className="md:w-1/2 relative flex justify-center perspective-1000">
                <div className="relative">
                  <motion.div
                    initial={{ rotate: -2 }}
                    animate={{ rotate: 2 }}
                    transition={{ repeat: Infinity, duration: 4, repeatType: "mirror", ease: "easeInOut" }}
                    className="relative z-10"
                  >
                    <img
                      src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                      alt="Happy Students"
                      className="rounded-3xl shadow-2xl border-4 border-white/10 w-full max-w-md opacity-90 hover:opacity-100 transition duration-500"
                    />
                  </motion.div>

                  {/* Floating Badge */}
                  <motion.div
                    initial={{ y: 0 }}
                    animate={{ y: -10 }}
                    transition={{ repeat: Infinity, duration: 3, repeatType: "mirror", ease: "easeInOut" }}
                    className="absolute -left-6 top-10 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/50 flex items-center gap-3 z-20"
                  >
                    <div className="bg-green-100 p-2 rounded-full text-green-600"><CheckCircle size={24} /></div>
                    <div>
                      <p className="font-bold text-slate-800">Verified</p>
                      <p className="text-xs text-slate-500">Top Mentors</p>
                    </div>
                  </motion.div>

                  {/* Second Badge */}
                  <motion.div
                    initial={{ y: 0 }}
                    animate={{ y: 10 }}
                    transition={{ repeat: Infinity, duration: 3.5, repeatType: "mirror", ease: "easeInOut", delay: 0.5 }}
                    className="absolute -right-6 bottom-10 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/50 flex items-center gap-3 z-20"
                  >
                    <div className="bg-yellow-100 p-2 rounded-full text-yellow-600"><Star size={24} fill="currentColor" /></div>
                    <div>
                      <p className="font-bold text-slate-800">5.0 Rated</p>
                      <p className="text-xs text-slate-500">Student Choice</p>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* 2. STATS SECTION */}
        <section className="py-12 bg-white border-y border-slate-100">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { label: "IITs Covered", val: 23, color: "text-blue-600", bg: "bg-blue-50" },
                { label: "NITs Covered", val: 31, color: "text-purple-600", bg: "bg-purple-50" },
                { label: "Active Mentors", val: 50, color: "text-green-600", bg: "bg-green-50" },
                { label: "Happy Students", val: 500, color: "text-orange-600", bg: "bg-orange-50" },
              ].map((stat, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ scale: 1.05 }}
                  className="text-center p-6 rounded-2xl hover:bg-slate-50 transition-colors"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-xl bg-opacity-20 flex items-center justify-center mx-auto mb-4`}>
                    <Award size={24} />
                  </div>
                  <h3 className={`text-4xl font-extrabold ${stat.color} mb-2`}>
                    <Counter end={stat.val} duration={2000} />+
                  </h3>
                  <p className="font-semibold text-slate-500 text-sm">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* 3. MENTORS SECTION (Glass Cards) */}
        <section id="mentors" className="py-24 relative overflow-hidden">
          {/* Section Background Video */}
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-white/40 z-10" /> {/* Light overlay for visibility */}
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            >
              <source src="https://cdn.pixabay.com/video/2019/04/23/23011-332483109_large.mp4" type="video/mp4" />
            </video>
          </div>

          <div className="container mx-auto px-6 relative z-10">
            <div className="text-center mb-16 space-y-4">
              <span className="text-blue-600 font-bold tracking-wider uppercase text-sm bg-blue-50 px-4 py-1 rounded-full">Expert Guidance</span>
              <h2 className="text-4xl font-extrabold text-slate-900">Meet Your Future Mentors</h2>
              <p className="text-slate-500 max-w-2xl mx-auto">Get personalized guidance from students who have cracked the toughest exams.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {loading ? ([1, 2, 3].map((n) => <div key={n} className="h-96 bg-gray-200 rounded-2xl animate-pulse"></div>)) :
                (!mentors || mentors.length === 0) ? (<div className="col-span-3 text-center text-gray-500">No mentors found.</div>) : (
                  mentors.map((mentor) => (
                    <motion.div
                      key={mentor._id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      className="glass-card flex flex-col overflow-hidden group"
                    >
                      {/* Image */}
                      <div className="relative h-72 overflow-hidden bg-slate-100">
                        <Avatar
                          src={mentor.image}
                          name={mentor.username}
                          size="w-full h-full"
                          fontSize="text-4xl"
                          className="rounded-none object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur px-3 py-1.5 rounded-full text-xs font-bold text-slate-800 flex items-center gap-1 shadow-sm border border-white/20">
                          <CheckCircle size={12} className="text-blue-500" /> Verified
                        </div>
                        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-4 left-4 text-white">
                          <h3 className="text-xl font-bold truncate pr-4">{mentor.username}</h3>
                          <p className="text-gray-200 text-sm truncate">{mentor.college || "Top University"}</p>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="p-6 flex flex-col flex-grow">
                        <div className="flex items-center gap-2 text-slate-600 text-sm mb-6 bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <BookOpen size={16} className="text-blue-500" />
                          <span className="truncate font-medium">{mentor.branch || "Engineering"}</span>
                        </div>

                        <button
                          onClick={() => navigate(`/mentor/${mentor._id}`)}
                          className="mt-auto w-full group-hover:bg-blue-600 bg-slate-900 text-white py-3.5 rounded-xl font-bold transition-all duration-300 shadow-lg shadow-slate-200 group-hover:shadow-blue-200"
                        >
                          View Profile
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
            </div>

            <div className="text-center mt-20">
              <Link to="/mentors" className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm">
                View All Mentors <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </section>

        {/* 4. FAQ SECTION */}
        <FAQSection />

      </div>
    </PageTransition>
  );
}

export default HomePage;