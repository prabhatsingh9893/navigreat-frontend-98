import React from 'react';
import { Award, Users, Target, ArrowRight, BookOpen, Heart, Zap, Globe, Star, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FadeIn } from '../components/Animations';
import PageTransition from '../components/PageTransition';

const values = [
  {
    icon: <BookOpen size={26} />,
    title: 'Quality First',
    desc: 'We manually verify every mentor. No shortcuts, no compromises on the quality of guidance you receive.',
    color: 'text-indigo-600 dark:text-indigo-400',
    bg: 'bg-indigo-50 dark:bg-indigo-900/20',
  },
  {
    icon: <Heart size={26} />,
    title: 'Student-Centric',
    desc: 'Every feature we build starts with one question: does this make students more successful?',
    color: 'text-rose-600 dark:text-rose-400',
    bg: 'bg-rose-50 dark:bg-rose-900/20',
  },
  {
    icon: <Globe size={26} />,
    title: 'Democratise Access',
    desc: 'Great mentorship shouldn\'t be a privilege. We\'re making it accessible to every deserving student.',
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
  },
  {
    icon: <Zap size={26} />,
    title: 'Speed & Simplicity',
    desc: 'From signup to your first session in under 10 minutes. No bureaucracy, no friction.',
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-900/20',
  },
];

const teamHighlights = [
  { val: '500+', label: 'Students Guided', color: 'text-indigo-600 dark:text-indigo-400' },
  { val: '50+', label: 'Expert Mentors', color: 'text-violet-600 dark:text-violet-400' },
  { val: '23+', label: 'IITs Covered', color: 'text-emerald-600 dark:text-emerald-400' },
  { val: '4.9★', label: 'Average Rating', color: 'text-amber-600 dark:text-amber-400' },
];

const AboutPage = () => {
  return (
    <PageTransition>
      <div className="font-sans bg-slate-50 dark:bg-[#080d14] text-slate-900 dark:text-slate-100 pt-20">

        {/* ====== 1. HERO ====== */}
        <section className="relative py-28 overflow-hidden">
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-violet-900 to-purple-900" />
          {/* Orbs */}
          <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-500/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
          {/* Grid */}
          <div className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
                                linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
              backgroundSize: '50px 50px'
            }}
          />

          <div className="container mx-auto px-6 relative z-10 text-center">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-indigo-200 text-sm font-bold tracking-wider mb-6">
                Our Mission
              </span>
              <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-8 leading-tight tracking-tight">
                Empowering the Next
                <br />
                <span className="text-gradient-cyan">Generation of Engineers</span>
              </h1>
              <p className="max-w-2xl mx-auto text-xl text-indigo-200/90 leading-relaxed">
                NaviGreat is bridging the gap between ambition and achievement. We connect aspiring students with verified mentors from top IITs and NITs to democratise career guidance.
              </p>
            </motion.div>
          </div>
        </section>

        {/* ====== 2. STATS STRIP ====== */}
        <section className="py-16 bg-white dark:bg-slate-900/50 border-y border-slate-100 dark:border-slate-800">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {teamHighlights.map((s, idx) => (
                <FadeIn key={idx} delay={idx * 0.1}>
                  <div className="text-center">
                    <p className={`text-4xl md:text-5xl font-extrabold ${s.color} mb-1`}>{s.val}</p>
                    <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">{s.label}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* ====== 3. OUR STORY ====== */}
        <section className="py-28">
          <div className="container mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <FadeIn direction="right">
                <div className="relative">
                  <img
                    src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                    alt="Team collaboration"
                    className="rounded-3xl shadow-2xl shadow-slate-200/60 dark:shadow-black/40 w-full object-cover"
                  />
                  {/* Floating card */}
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                    className="absolute -bottom-6 -right-6 bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                        <Star size={24} className="text-white fill-white" />
                      </div>
                      <div>
                        <p className="font-extrabold text-slate-900 dark:text-white text-xl">4.9/5</p>
                        <p className="text-slate-500 dark:text-slate-400 text-xs">Average session rating</p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </FadeIn>

              <FadeIn delay={0.2}>
                <div>
                  <span className="inline-block px-4 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-sm font-bold tracking-wide mb-6 border border-indigo-200 dark:border-indigo-800">
                    Why We Started
                  </span>
                  <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-6 leading-tight">
                    Talent is everywhere.
                    <br />
                    <span className="text-gradient-blue">Opportunity is not.</span>
                  </h2>
                  <div className="space-y-5 text-slate-600 dark:text-slate-400 leading-relaxed text-lg">
                    <p>
                      It started with a simple observation: many brilliant students fail to crack top exams or land dream jobs simply due to a lack of guidance — not ability.
                    </p>
                    <p>
                      We decided to build a platform that removes barriers. No more cold-emailing seniors or guessing your path. Get 1-on-1 mentorship from those who've already done it.
                    </p>
                  </div>
                  {/* Checklist */}
                  <ul className="mt-8 space-y-3">
                    {['Verified IIT & NIT mentors', 'Live 1-on-1 sessions', 'Personalised career roadmaps', 'Secure payment system'].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-slate-700 dark:text-slate-300 font-medium">
                        <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
                          <CheckCircle size={14} className="text-indigo-600 dark:text-indigo-400" />
                        </div>
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Link to="/mentors" className="btn-primary mt-10 px-8 py-4 rounded-2xl text-base inline-flex">
                    Meet Our Mentors <ArrowRight size={18} />
                  </Link>
                </div>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* ====== 4. OUR VALUES ====== */}
        <section className="py-24 bg-white dark:bg-slate-900/30">
          <div className="container mx-auto px-6">
            <FadeIn>
              <div className="text-center mb-16">
                <span className="inline-block px-4 py-1.5 rounded-full bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 text-sm font-bold tracking-wide mb-4 border border-violet-200 dark:border-violet-800">
                  Core Values
                </span>
                <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-4">
                  What Drives <span className="text-gradient-blue">Us</span>
                </h2>
              </div>
            </FadeIn>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((v, idx) => (
                <FadeIn key={idx} delay={idx * 0.1}>
                  <motion.div whileHover={{ y: -8 }} className="feature-card text-center p-8">
                    <div className={`w-14 h-14 rounded-2xl ${v.bg} ${v.color} flex items-center justify-center mx-auto mb-5`}>
                      {v.icon}
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">{v.title}</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{v.desc}</p>
                  </motion.div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* ====== 5. CTA ====== */}
        <section className="py-24 bg-slate-50 dark:bg-[#080d14]">
          <div className="container mx-auto px-6">
            <FadeIn>
              <div className="relative overflow-hidden rounded-3xl p-12 md:p-16 text-center"
                style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #a855f7 100%)' }}
              >
                <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10">
                  <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4">Ready to find your path?</h2>
                  <p className="text-indigo-200 text-lg max-w-xl mx-auto mb-10">
                    Join the NaviGreat community and get the guidance you deserve.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link to="/mentors"
                      className="bg-white text-indigo-700 px-8 py-4 rounded-2xl font-bold hover:bg-indigo-50 transition-all hover:-translate-y-1 shadow-xl flex items-center justify-center gap-2 group"
                    >
                      Find a Mentor <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link to="/contact"
                      className="bg-white/10 backdrop-blur-md border border-white/30 text-white px-8 py-4 rounded-2xl font-bold hover:bg-white/20 transition-all flex items-center justify-center gap-2"
                    >
                      Contact Us
                    </Link>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>

      </div>
    </PageTransition>
  );
};

export default AboutPage;
