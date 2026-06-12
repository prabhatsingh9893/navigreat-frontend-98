import React, { useEffect, useState } from 'react';
import {
  BookOpen, CheckCircle, ArrowRight, Sparkles, Users, Award, Star,
  Target, Zap, Shield, TrendingUp, MessageSquare, Calendar, GraduationCap,
  ChevronRight
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import FAQSection from '../components/FAQSection';
import { API_BASE_URL } from '../config';
import Avatar from '../components/Avatar';
import PageTransition from '../components/PageTransition';
import { FadeIn } from '../components/Animations';

// Animated Counter
const Counter = ({ end, duration = 2000 }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let startTimestamp = null;
    let animationFrameId;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setCount(Math.ceil(progress * end));
      if (progress < 1) animationFrameId = window.requestAnimationFrame(step);
    };
    animationFrameId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(animationFrameId);
  }, [end, duration]);
  return <span>{count}</span>;
};

// Typewriter with cursor
const TypewriterText = ({ words }) => {
  const [wordIndex, setWordIndex] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const current = words[wordIndex];
    let timeout;

    if (!isDeleting && displayed === current) {
      // Pause before deleting
      timeout = setTimeout(() => setIsDeleting(true), 1800);
    } else if (isDeleting && displayed === '') {
      // Pause before typing next word
      setIsDeleting(false);
      setWordIndex((prev) => (prev + 1) % words.length);
    } else {
      // Typing or deleting characters
      const speed = isDeleting ? 60 : 100;
      timeout = setTimeout(() => {
        const nextContent = isDeleting 
          ? current.substring(0, displayed.length - 1)
          : current.substring(0, displayed.length + 1);
        setDisplayed(nextContent);
      }, speed);
    }

    return () => clearTimeout(timeout);
  }, [displayed, isDeleting, wordIndex, words]);

  return (
    <span className="text-gradient-blue">
      {displayed}
      <span className="animate-pulse">|</span>
    </span>
  );
};

const steps = [
  {
    step: '01',
    icon: <GraduationCap size={28} />,
    title: 'Create Your Profile',
    desc: 'Sign up as a student in under 2 minutes. Tell us about your goals and the exam or career path you are targeting.',
    color: 'from-blue-500 to-indigo-600',
    glow: 'shadow-blue-500/20',
  },
  {
    step: '02',
    icon: <Users size={28} />,
    title: 'Browse Top Mentors',
    desc: 'Filter mentors by IIT, NIT, branch, and expertise. Read reviews and view full profiles before you connect.',
    color: 'from-violet-500 to-purple-600',
    glow: 'shadow-purple-500/20',
  },
  {
    step: '03',
    icon: <MessageSquare size={28} />,
    title: 'Book a Session',
    desc: 'Book a priority 1-on-1 session directly. Pay securely and get a confirmed calendar invite instantly.',
    color: 'from-pink-500 to-rose-600',
    glow: 'shadow-pink-500/20',
  },
  {
    step: '04',
    icon: <TrendingUp size={28} />,
    title: 'Achieve Your Goals',
    desc: 'Get personalised roadmaps, resume reviews, and insider tips. Track your progress toward your dream.',
    color: 'from-emerald-500 to-teal-600',
    glow: 'shadow-emerald-500/20',
  },
];

const features = [
  {
    icon: <Shield size={24} />,
    title: 'Verified Mentors',
    desc: 'Every mentor is manually verified. We confirm their college ID and academic credentials.',
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
  },
  {
    icon: <Zap size={24} />,
    title: 'Instant Booking',
    desc: 'Book a session in seconds. No back-and-forth emails. Get confirmed slots instantly.',
    color: 'text-yellow-600 dark:text-yellow-400',
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
  },
  {
    icon: <Target size={24} />,
    title: 'Goal-Focused',
    desc: 'Mentors tailor every session to your specific exam, internship, or placement target.',
    color: 'text-rose-600 dark:text-rose-400',
    bg: 'bg-rose-50 dark:bg-rose-900/20',
  },
  {
    icon: <Star size={24} />,
    title: 'Rated & Reviewed',
    desc: 'See real student reviews before booking. Transparent ratings keep quality high.',
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-900/20',
  },
  {
    icon: <Calendar size={24} />,
    title: 'Flexible Scheduling',
    desc: 'Mentors post their available slots. Book at a time that fits your study timetable.',
    color: 'text-violet-600 dark:text-violet-400',
    bg: 'bg-violet-50 dark:bg-violet-900/20',
  },
  {
    icon: <MessageSquare size={24} />,
    title: 'Live Chat',
    desc: 'Reach out to mentors via our built-in chat before and after your session.',
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
  },
];

const stats = [
  { label: 'IITs Covered', val: 23, suffix: '+', color: 'text-indigo-600 dark:text-indigo-400' },
  { label: 'NITs Covered', val: 31, suffix: '+', color: 'text-violet-600 dark:text-violet-400' },
  { label: 'Active Mentors', val: 50, suffix: '+', color: 'text-emerald-600 dark:text-emerald-400' },
  { label: 'Happy Students', val: 500, suffix: '+', color: 'text-amber-600 dark:text-amber-400' },
];

const testimonials = [
  {
    name: 'Priya Sharma',
    role: 'IIT Delhi, CSE',
    text: 'NaviGreat helped me crack my placement. My mentor gave me exact interview tips that actually worked!',
    avatar: 'PS',
    rating: 5,
  },
  {
    name: 'Rohan Verma',
    role: 'NIT Trichy, Mech',
    text: 'I was clueless about GATE prep. One session with my mentor and I had a 6-month roadmap ready.',
    avatar: 'RV',
    rating: 5,
  },
  {
    name: 'Ananya Singh',
    role: 'IIT Bombay, EE',
    text: 'The mentor verification process is rock solid. I felt safe and the quality of sessions was amazing.',
    avatar: 'AS',
    rating: 5,
  },
];

function HomePage() {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const words = ['Dream Job', 'Top IITs', 'Global Unis', 'Success', 'Dream Rank'];

  useEffect(() => {
    fetch(`${API_BASE_URL}/mentors`)
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.mentors)) setMentors(data.mentors.slice(0, 3));
        else setMentors([]);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <PageTransition className="pt-0">
      <div className="font-sans bg-slate-50 dark:bg-[#080d14] min-h-screen overflow-x-hidden">

        {/* ====== 1. HERO SECTION ====== */}
        <section className="relative min-h-screen flex items-center overflow-hidden">
          {/* Mesh gradient background */}
          <div className="absolute inset-0 bg-mesh-hero" />
          {/* Floating orbs */}
          <div className="absolute top-1/4 -left-32 w-96 h-96 bg-indigo-600/30 rounded-full blur-[100px] animate-float-slow" />
          <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-violet-600/20 rounded-full blur-[100px] animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px]" />

          {/* Grid pattern overlay */}
          <div className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
                                linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
              backgroundSize: '60px 60px'
            }}
          />

          <div className="container mx-auto px-6 relative z-10 py-32">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              {/* Left content */}
              <div className="lg:w-1/2 text-center lg:text-left">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-sm font-semibold mb-8">
                    <Sparkles size={14} className="text-yellow-400" />
                    <span>India's #1 Mentorship Platform for Engineers</span>
                    <div className="dot-glow ml-1" />
                  </div>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="text-5xl md:text-6xl xl:text-7xl font-extrabold text-white leading-[1.1] tracking-tight mb-6"
                >
                  Unlock Your
                  <br />
                  <TypewriterText words={words} />
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="text-lg md:text-xl text-slate-300/90 leading-relaxed max-w-xl mx-auto lg:mx-0 mb-10"
                >
                  Stop guessing your career path. Connect with verified seniors from IITs & NITs who've already walked the road — and won.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12"
                >
                  <Link
                    to="/mentors"
                    className="shimmer-btn text-white px-8 py-4 rounded-2xl font-bold shadow-2xl shadow-indigo-500/30 transition-all hover:-translate-y-1 flex items-center justify-center gap-2 group text-base"
                  >
                    Find a Mentor
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    to="/signup"
                    className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-8 py-4 rounded-2xl font-bold hover:bg-white/20 transition-all hover:-translate-y-1 flex items-center justify-center gap-2 text-base"
                  >
                    Become a Mentor
                  </Link>
                </motion.div>

                {/* Social proof */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="flex items-center gap-6 justify-center lg:justify-start"
                >
                  <div className="flex -space-x-3">
                    {['A', 'R', 'S', 'P'].map((letter, i) => (
                      <div key={i} className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 border-2 border-slate-900 flex items-center justify-center text-white text-xs font-bold shadow-lg">
                        {letter}
                      </div>
                    ))}
                  </div>
                  <div className="text-sm text-slate-300">
                    <span className="text-white font-bold">500+</span> students already winning
                  </div>
                  <div className="flex items-center gap-1">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} size={14} className="text-yellow-400 fill-yellow-400" />
                    ))}
                    <span className="text-slate-300 text-sm ml-1">5.0</span>
                  </div>
                </motion.div>
              </div>

              {/* Right: Hero visual */}
              <motion.div
                initial={{ opacity: 0, x: 60 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="lg:w-1/2 relative hidden lg:flex justify-center"
              >
                <div className="relative">
                  {/* Main image */}
                  <motion.div
                    animate={{ rotate: ['-1deg', '1deg', '-1deg'] }}
                    transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
                    className="relative z-10"
                  >
                    <img
                      src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=560&q=80"
                      alt="Students getting mentored"
                      className="rounded-3xl w-[420px] object-cover shadow-2xl shadow-black/50 border border-white/10"
                    />
                    {/* Glow border */}
                    <div className="absolute inset-0 rounded-3xl ring-1 ring-white/10" />
                  </motion.div>

                  {/* Floating card 1 */}
                  <motion.div
                    animate={{ y: [0, -12, 0] }}
                    transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
                    className="absolute -left-14 top-12 bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-2xl shadow-2xl flex items-center gap-3 z-20"
                  >
                    <div className="bg-green-400/20 p-2.5 rounded-xl">
                      <CheckCircle size={22} className="text-green-400" />
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm">IIT Delhi</p>
                      <p className="text-white/60 text-xs">Verified Mentor</p>
                    </div>
                  </motion.div>

                  {/* Floating card 2 */}
                  <motion.div
                    animate={{ y: [0, 12, 0] }}
                    transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut', delay: 1 }}
                    className="absolute -right-14 bottom-16 bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-2xl shadow-2xl flex items-center gap-3 z-20"
                  >
                    <div className="bg-yellow-400/20 p-2.5 rounded-xl">
                      <Star size={22} className="text-yellow-400 fill-yellow-400" />
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm">5.0 Rated</p>
                      <p className="text-white/60 text-xs">Student Choice</p>
                    </div>
                  </motion.div>

                  {/* Floating card 3 */}
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut', delay: 0.5 }}
                    className="absolute -right-10 top-8 bg-white/10 backdrop-blur-xl border border-white/20 px-4 py-3 rounded-2xl shadow-2xl z-20"
                  >
                    <div className="flex items-center gap-2">
                      <div className="dot-glow" />
                      <span className="text-white text-xs font-semibold">12 sessions live now</span>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Bottom fade */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-50 dark:from-[#080d14] to-transparent" />
        </section>

        {/* ====== 2. STATS STRIP ====== */}
        <section className="py-16 bg-white dark:bg-slate-900/40 border-y border-slate-100 dark:border-slate-800">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, idx) => (
                <FadeIn key={idx} delay={idx * 0.1}>
                  <motion.div whileHover={{ scale: 1.05 }} className="text-center group cursor-default">
                    <h3 className={`text-4xl md:text-5xl font-extrabold ${stat.color} mb-1`}>
                      <Counter end={stat.val} duration={2200} />{stat.suffix}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">{stat.label}</p>
                  </motion.div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* ====== 3. HOW IT WORKS ====== */}
        <section className="py-24 relative overflow-hidden bg-slate-50 dark:bg-[#080d14]">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/4 w-72 h-72 bg-indigo-200/30 dark:bg-indigo-900/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-violet-200/30 dark:bg-violet-900/20 rounded-full blur-3xl" />
          </div>
          <div className="container mx-auto px-6 relative z-10">
            <FadeIn>
              <div className="text-center mb-16">
                <span className="inline-block px-4 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-sm font-bold tracking-wide mb-4 border border-indigo-200 dark:border-indigo-800">
                  Simple Process
                </span>
                <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-4">
                  How It <span className="text-gradient-blue">Works</span>
                </h2>
                <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-lg">
                  From signup to your first session in less than 10 minutes. It really is that simple.
                </p>
              </div>
            </FadeIn>

            {/* Steps with connecting line */}
            <div className="relative">
              {/* Connection line (desktop) */}
              <div className="hidden md:block absolute top-16 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-blue-500 via-violet-500 to-emerald-500 z-0" />

              <div className="grid md:grid-cols-4 gap-6 relative z-10">
                {steps.map((s, idx) => (
                  <FadeIn key={idx} delay={idx * 0.15}>
                    <motion.div
                      whileHover={{ y: -8 }}
                      className={`step-card hover:shadow-2xl ${s.glow} group`}
                    >
                      {/* Step number circle */}
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center text-white mb-6 shadow-lg ${s.glow} shadow-lg mx-auto`}>
                        {s.icon}
                      </div>
                      <div className="absolute top-6 right-6 text-4xl font-black text-slate-100 dark:text-slate-800 group-hover:text-slate-200 dark:group-hover:text-slate-700 transition-colors">
                        {s.step}
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3 text-center">{s.title}</h3>
                      <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed text-center">{s.desc}</p>
                    </motion.div>
                  </FadeIn>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ====== 4. FEATURES GRID ====== */}
        <section className="py-24 bg-white dark:bg-slate-900/30">
          <div className="container mx-auto px-6">
            <FadeIn>
              <div className="text-center mb-16">
                <span className="inline-block px-4 py-1.5 rounded-full bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 text-sm font-bold tracking-wide mb-4 border border-violet-200 dark:border-violet-800">
                  Platform Features
                </span>
                <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-4">
                  Everything You <span className="text-gradient-blue">Need</span>
                </h2>
                <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-lg">
                  Built for students who are serious about their future. Every feature is designed to get you results.
                </p>
              </div>
            </FadeIn>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((f, idx) => (
                <FadeIn key={idx} delay={idx * 0.08}>
                  <motion.div whileHover={{ y: -6 }} className="feature-card group">
                    <div className={`w-12 h-12 rounded-xl ${f.bg} ${f.color} flex items-center justify-center mb-5`}>
                      {f.icon}
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{f.title}</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{f.desc}</p>
                  </motion.div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* ====== 5. TOP MENTORS ====== */}
        <section className="py-24 relative overflow-hidden bg-slate-50 dark:bg-[#080d14]">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-indigo-100/60 dark:bg-indigo-900/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-violet-100/60 dark:bg-violet-900/10 rounded-full blur-3xl" />
          </div>
          <div className="container mx-auto px-6 relative z-10">
            <FadeIn>
              <div className="text-center mb-16">
                <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-sm font-bold tracking-wide mb-4 border border-emerald-200 dark:border-emerald-800">
                  Expert Guidance
                </span>
                <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-4">
                  Meet Your Future <span className="text-gradient-blue">Mentors</span>
                </h2>
                <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-lg">
                  Handpicked seniors from top institutions. Real experience. Real results.
                </p>
              </div>
            </FadeIn>

            <div className="grid md:grid-cols-3 gap-8">
              {loading ? (
                [1, 2, 3].map((n) => (
                  <div key={n} className="h-96 bg-slate-200 dark:bg-slate-800 rounded-3xl animate-pulse" />
                ))
              ) : !mentors || mentors.length === 0 ? (
                <div className="col-span-3 text-center py-20">
                  <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users size={36} className="text-slate-400" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">No Mentors Yet</h3>
                  <p className="text-slate-500 dark:text-slate-400">Check back soon!</p>
                </div>
              ) : (
                mentors.map((mentor, index) => (
                  <FadeIn key={mentor._id} delay={index * 0.12}>
                    <motion.div
                      whileHover={{ y: -10 }}
                      className="mentor-card-premium group shadow-lg shadow-slate-200/50 dark:shadow-black/30"
                    >
                      {/* Image */}
                      <div className="relative h-72 overflow-hidden bg-slate-100 dark:bg-slate-800">
                        <Avatar
                          src={mentor.image}
                          name={mentor.username}
                          size="w-full h-full"
                          fontSize="text-5xl"
                          className="rounded-none object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        {/* Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                        {/* Verified badge */}
                        <div className="absolute top-4 right-4 bg-white/15 backdrop-blur px-3 py-1.5 rounded-full text-xs font-bold text-white flex items-center gap-1.5 border border-white/20">
                          <CheckCircle size={12} className="text-emerald-400" /> Verified
                        </div>
                        {/* Name overlay */}
                        <div className="absolute bottom-5 left-5 text-white z-10">
                          <h3 className="text-xl font-bold mb-0.5 drop-shadow-lg">{mentor.username}</h3>
                          <p className="text-white/80 text-sm">{mentor.college || 'Top University'}</p>
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="p-5">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="bg-indigo-100 dark:bg-indigo-900/30 p-1.5 rounded-lg">
                            <BookOpen size={16} className="text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{mentor.branch || 'Engineering'}</span>
                        </div>
                        <button
                          onClick={() => navigate(`/mentor/${mentor._id}`)}
                          className="btn-primary w-full rounded-xl py-3"
                        >
                          View Profile <ChevronRight size={16} />
                        </button>
                      </div>
                    </motion.div>
                  </FadeIn>
                ))
              )}
            </div>

            <FadeIn delay={0.3}>
              <div className="text-center mt-14">
                <Link to="/mentors" className="btn-secondary px-8 py-4 rounded-2xl text-base">
                  View All Mentors <ArrowRight size={18} />
                </Link>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* ====== 6. TESTIMONIALS ====== */}
        <section className="py-24 bg-white dark:bg-slate-900/30">
          <div className="container mx-auto px-6">
            <FadeIn>
              <div className="text-center mb-16">
                <span className="inline-block px-4 py-1.5 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 text-sm font-bold tracking-wide mb-4 border border-yellow-200 dark:border-yellow-800">
                  Success Stories
                </span>
                <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-4">
                  Students Love <span className="text-gradient-blue">NaviGreat</span>
                </h2>
              </div>
            </FadeIn>
            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((t, idx) => (
                <FadeIn key={idx} delay={idx * 0.1}>
                  <motion.div whileHover={{ y: -6 }} className="feature-card p-7">
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(t.rating)].map((_, i) => (
                        <Star key={i} size={16} className="text-yellow-400 fill-yellow-400" />
                      ))}
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-6 italic">
                      "{t.text}"
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-sm font-bold">
                        {t.avatar}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white text-sm">{t.name}</p>
                        <p className="text-slate-500 dark:text-slate-400 text-xs">{t.role}</p>
                      </div>
                    </div>
                  </motion.div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* ====== 7. CTA BANNER ====== */}
        <section className="py-24 bg-slate-50 dark:bg-[#080d14]">
          <div className="container mx-auto px-6">
            <FadeIn>
              <div className="relative overflow-hidden rounded-3xl p-12 md:p-16 text-center noise-overlay"
                style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #a855f7 100%)' }}
              >
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                  <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                </div>
                <div className="relative z-10">
                  <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
                    Ready to unlock your future?
                  </h2>
                  <p className="text-indigo-200 text-lg max-w-2xl mx-auto mb-10">
                    Join thousands of students who are already getting the guidance they need from India's best engineers.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link to="/mentors"
                      className="bg-white text-indigo-700 px-8 py-4 rounded-2xl font-bold hover:bg-indigo-50 transition-all hover:-translate-y-1 shadow-2xl shadow-black/20 flex items-center justify-center gap-2 group"
                    >
                      Browse Mentors <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link to="/signup"
                      className="bg-white/10 backdrop-blur-md border border-white/30 text-white px-8 py-4 rounded-2xl font-bold hover:bg-white/20 transition-all hover:-translate-y-1 flex items-center justify-center gap-2"
                    >
                      Sign Up Free
                    </Link>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* ====== 8. FAQ ====== */}
        <FAQSection />

      </div>
    </PageTransition>
  );
}

export default HomePage;