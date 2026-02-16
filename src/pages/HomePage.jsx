import React, { useEffect, useState } from 'react';
import { BookOpen, CheckCircle, ArrowRight, Sparkles, Users, Award, Star } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import FAQSection from '../components/FAQSection';
import { API_BASE_URL } from '../config';
import Avatar from '../components/Avatar';
import PageTransition from '../components/PageTransition';
import { FadeIn } from '../components/Animations';

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

  // Detect Mobile for Performance Optimization
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
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
      <div className="font-sans bg-slate-50 dark:bg-[#0b141a] min-h-screen">
        {/* 1. HERO SECTION (Video Background) */}
        {/* 1. HERO SECTION (Video Background - Light Theme) */}
        <section className="relative pt-32 pb-24 overflow-hidden min-h-[90vh] flex items-center bg-white dark:bg-[#111b21]">

          {/* ✅ VIDEO BACKGROUND - Optimized for Performance */}
          <div className="absolute inset-0 z-0">
            {/* Overlay: Slightly more opaque on mobile to ensure text readability without expensive blur */}
            <div className={`absolute inset-0 z-10 ${isMobile ? 'bg-white/70 dark:bg-black/80' : 'bg-white/40 dark:bg-black/60'}`} />

            <img
              src="https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=1920"
              alt="Hero Background"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="container mx-auto px-6 relative z-20">
            <div className="flex flex-col md:flex-row items-center gap-12">
              {/* Left Content - Reduced Blur on Mobile */}
              <div className={`md:w-1/2 text-center md:text-left space-y-8 p-8 rounded-3xl ${isMobile ? 'bg-white/95 dark:bg-[#202c33]/95' : 'bg-white/70 dark:bg-[#202c33]/90 backdrop-blur-md'} shadow-sm border border-white/50 dark:border-[#2a3942]`}>
                <FadeIn delay={0.1}>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-semibold text-sm border border-blue-100 dark:border-blue-800 shadow-sm">
                    <Sparkles size={16} className="text-blue-600 dark:text-blue-400" />
                    <span>#1 Mentorship Platform</span>
                  </div>
                </FadeIn>

                <FadeIn delay={0.2}>
                  <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 dark:text-white leading-tight tracking-tight drop-shadow-sm">
                    Unlock Your <br />
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-700 dark:from-blue-400 dark:to-indigo-400">
                      {text}
                    </span>
                  </h1>
                </FadeIn>

                <FadeIn delay={0.3}>
                  <p className="text-lg text-slate-800 dark:text-[#e9edef] leading-relaxed max-w-lg mx-auto md:mx-0 font-bold">
                    Stop guessing your career path. Connect with verified seniors from IITs & NITs who have already walked the road.
                  </p>
                </FadeIn>

                <FadeIn delay={0.4}>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                    <Link to="/mentors" className="bg-blue-700 hover:bg-blue-800 dark:bg-[#00a884] dark:hover:bg-[#008f6f] text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-blue-500/25 dark:shadow-green-500/20 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2">
                      Find a Mentor <ArrowRight size={20} />
                    </Link>
                    <Link to="/become-mentor" className="bg-white dark:bg-[#202c33] text-slate-900 dark:text-[#e9edef] border border-slate-300 dark:border-[#2a3942] px-8 py-4 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-[#111b21] transition-all hover:border-slate-400 dark:hover:border-[#2a3942]">
                      Become a Mentor
                    </Link>
                  </div>
                </FadeIn>

                <FadeIn delay={0.5}>
                  <div className="flex items-center gap-4 justify-center md:justify-start pt-4">
                    <div className="flex -space-x-3">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className="w-10 h-10 rounded-full bg-slate-200 dark:bg-[#2a3942] border-2 border-white dark:border-[#111b21] flex items-center justify-center text-xs font-bold text-slate-500 dark:text-slate-400">
                          <Users size={16} />
                        </div>
                      ))}
                    </div>
                    <div className="text-sm font-medium text-slate-800 dark:text-[#e9edef]">
                      <span className="font-bold text-slate-900 dark:text-white">500+</span> Students Joined
                    </div>
                  </div>
                </FadeIn>
              </div>

              {/* Right Image (Floating Cards) */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="md:w-1/2 relative flex justify-center perspective-1000"
              >
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
                      className="rounded-3xl shadow-2xl border-4 border-white/10 dark:border-[#2a3942] w-full max-w-md opacity-90 hover:opacity-100 transition duration-500"
                    />
                  </motion.div>

                  {/* Floating Badge */}
                  <motion.div
                    initial={{ y: 0 }}
                    animate={{ y: -10 }}
                    transition={{ repeat: Infinity, duration: 3, repeatType: "mirror", ease: "easeInOut" }}
                    className="absolute -left-6 top-10 bg-white/90 dark:bg-[#202c33]/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/50 dark:border-[#2a3942] flex items-center gap-3 z-20"
                  >
                    <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full text-green-600 dark:text-green-400"><CheckCircle size={24} /></div>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-[#e9edef]">Verified</p>
                      <p className="text-xs text-slate-500 dark:text-[#8696a0]">Top Mentors</p>
                    </div>
                  </motion.div>

                  {/* Second Badge */}
                  <motion.div
                    initial={{ y: 0 }}
                    animate={{ y: 10 }}
                    transition={{ repeat: Infinity, duration: 3.5, repeatType: "mirror", ease: "easeInOut", delay: 0.5 }}
                    className="absolute -right-6 bottom-10 bg-white/90 dark:bg-[#202c33]/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/50 dark:border-[#2a3942] flex items-center gap-3 z-20"
                  >
                    <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded-full text-yellow-600 dark:text-yellow-400"><Star size={24} fill="currentColor" /></div>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-[#e9edef]">5.0 Rated</p>
                      <p className="text-xs text-slate-500 dark:text-[#8696a0]">Student Choice</p>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* 2. STATS SECTION */}
        <section className="py-12 bg-white dark:bg-[#111b21] border-y border-slate-100 dark:border-[#2a3942]">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { label: "IITs Covered", val: 23, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/20" },
                { label: "NITs Covered", val: 31, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-900/20" },
                { label: "Active Mentors", val: 50, color: "text-green-600 dark:text-green-400", bg: "bg-green-50 dark:bg-green-900/20" },
                { label: "Happy Students", val: 500, color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-900/20" },
              ].map((stat, idx) => (
                <FadeIn key={idx} delay={idx * 0.1}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="text-center p-6 rounded-2xl hover:bg-slate-50 dark:hover:bg-[#202c33] transition-colors"
                  >
                    <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-xl bg-opacity-20 flex items-center justify-center mx-auto mb-4`}>
                      <Award size={24} />
                    </div>
                    <h3 className={`text-4xl font-extrabold ${stat.color} mb-2`}>
                      <Counter end={stat.val} duration={2000} />+
                    </h3>
                    <p className="font-semibold text-slate-500 dark:text-[#8696a0] text-sm">{stat.label}</p>
                  </motion.div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* 3. MENTORS SECTION (Glass Cards) */}
        <section id="mentors" className="py-12 md:py-24 relative overflow-hidden bg-slate-50 dark:bg-[#0b141a]">
          {/* Section Background Video */}
          <div className="absolute inset-0 z-0">
            <div className={`absolute inset-0 z-10 ${isMobile ? 'bg-white/70 dark:bg-black/80' : 'bg-white/40 dark:bg-black/60'}`} />
            <img
              src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=1920"
              alt="Mentors Background"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="container mx-auto px-6 relative z-10">
            <FadeIn>
              <div className="text-center mb-12 md:mb-16 space-y-4">
                <span className="text-blue-600 dark:text-blue-400 font-bold tracking-wider uppercase text-sm bg-blue-50 dark:bg-blue-900/20 px-4 py-1 rounded-full">Expert Guidance</span>
                <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white">Meet Your Future Mentors</h2>
                <p className="text-slate-500 dark:text-[#8696a0] max-w-2xl mx-auto">Get personalized guidance from students who have cracked the toughest exams.</p>
              </div>
            </FadeIn>

            <div className="grid md:grid-cols-3 gap-6 md:gap-8">
              {loading ? ([1, 2, 3].map((n) => <div key={n} className="h-96 bg-gray-200 dark:bg-[#202c33] rounded-3xl animate-pulse"></div>)) :
                (!mentors || mentors.length === 0) ? (
                  <div className="col-span-3 flex flex-col items-center justify-center p-12 bg-white/50 dark:bg-[#202c33]/50 backdrop-blur-sm rounded-3xl text-center border border-white/40 dark:border-[#2a3942]">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-[#111b21] rounded-full flex items-center justify-center mb-4">
                      <Users size={32} className="text-slate-400 dark:text-slate-500" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-700 dark:text-[#e9edef]">No Mentors Found</h3>
                    <p className="text-slate-500 dark:text-[#8696a0] text-sm">Check back later for new mentors.</p>
                  </div>
                ) : (
                  mentors.map((mentor, index) => (
                    <FadeIn key={mentor._id} delay={index * 0.1}>
                      <div className="glass-card flex flex-col overflow-hidden group rounded-3xl border-0 shadow-xl shadow-slate-200/50 dark:shadow-black/50 bg-white dark:bg-[#202c33]">
                        {/* Image */}
                        <div className="relative h-72 md:h-80 overflow-hidden bg-slate-100 dark:bg-[#111b21]">
                          <Avatar
                            src={mentor.image}
                            name={mentor.username}
                            size="w-full h-full"
                            fontSize="text-5xl"
                            className="rounded-none object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                          <div className="absolute top-4 right-4 bg-white/95 dark:bg-[#202c33]/95 backdrop-blur px-3 py-1.5 rounded-full text-xs font-bold text-slate-800 dark:text-[#e9edef] flex items-center gap-1 shadow-sm border border-white/20 dark:border-[#2a3942] z-10">
                            <CheckCircle size={14} className="text-blue-500 dark:text-[#00a884]" /> Verified
                          </div>
                          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                          <div className="absolute bottom-5 left-5 text-white z-10">
                            <h3 className="text-2xl font-bold truncate pr-4 leading-tight mb-1 shadow-black/10 drop-shadow-md">{mentor.username}</h3>
                            <p className="text-gray-100 text-sm font-medium truncate opacity-90">{mentor.college || "Top University"}</p>
                          </div>
                        </div>

                        {/* Info */}
                        <div className="p-5 md:p-6 flex flex-col flex-grow bg-white dark:bg-[#202c33] relative">
                          <div className="flex items-center gap-3 text-slate-700 dark:text-[#e9edef] text-sm mb-5 bg-slate-50 dark:bg-[#111b21] p-3.5 rounded-2xl border border-slate-100 dark:border-[#2a3942]">
                            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg text-blue-600 dark:text-blue-400">
                              <BookOpen size={18} />
                            </div>
                            <div>
                              <p className="text-xs text-slate-400 dark:text-[#8696a0] font-bold uppercase tracking-wider">Branch</p>
                              <span className="font-bold text-slate-800 dark:text-[#e9edef] line-clamp-1">{mentor.branch || "Engineering"}</span>
                            </div>
                          </div>

                          <button
                            onClick={() => navigate(`/mentor/${mentor._id}`)}
                            className="mt-auto w-full bg-blue-600 hover:bg-blue-700 dark:bg-[#00a884] dark:hover:bg-[#008f6f] text-white py-3.5 rounded-2xl font-bold text-sm md:text-base transition-all duration-300 shadow-lg shadow-blue-500/20 dark:shadow-green-500/20 hover:shadow-blue-500/40 dark:hover:shadow-green-500/40 transform active:scale-[0.98] flex items-center justify-center gap-2"
                          >
                            View Profile <ArrowRight size={16} />
                          </button>
                        </div>
                      </div>
                    </FadeIn>
                  ))
                )}
            </div>

            <FadeIn delay={0.3}>
              <div className="text-center mt-20">
                <Link to="/mentors" className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white dark:bg-[#202c33] border border-slate-200 dark:border-[#2a3942] text-slate-700 dark:text-[#e9edef] font-bold hover:bg-slate-50 dark:hover:bg-[#2a3942] hover:border-slate-300 dark:hover:border-[#2a3942] transition-all shadow-sm">
                  View All Mentors <ArrowRight size={18} />
                </Link>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* 4. FAQ SECTION */}
        <FAQSection />

      </div>
    </PageTransition>
  );
}

export default HomePage;