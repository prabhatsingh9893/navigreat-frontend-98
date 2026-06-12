import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../config';
import { motion } from 'framer-motion';
import { ArrowLeft, User as UserIcon, Lock, Mail, ChevronRight, Briefcase, GraduationCap, Sparkles } from 'lucide-react';

function SignupPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'student'
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading("Creating Account...");

    try {
      // ---------------------------------------------------------
      // STEP 1: Register
      // ---------------------------------------------------------
      const registerRes = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const registerData = await registerRes.json();
      toast.dismiss(loadingToast);

      if (!registerRes.ok) {
        toast.error("Signup Failed: " + (registerData.message || "Error occurred"));
        return;
      }

      // ---------------------------------------------------------
      // STEP 2: Auto Login
      // ---------------------------------------------------------
      const loginRes = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        }),
      });

      const loginData = await loginRes.json();

      if (loginRes.ok) {
        localStorage.setItem('token', loginData.token);
        localStorage.setItem('userData', JSON.stringify(loginData.user || loginData.result));
        toast.success("Account Created & Welcome!");
        window.location.href = '/';
      } else {
        toast.success("Account created, but auto-login failed. Please login manually.");
        navigate('/login');
      }

    } catch (error) {
      toast.dismiss(loadingToast);
      console.error("Error:", error);
      toast.error("Something went wrong. Check console.");
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0b141a] flex relative overflow-hidden">

      {/* LEFT: Illustrative Side (Desktop Only) */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 relative items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80')] bg-cover bg-center opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/90 to-violet-900/90"></div>

        <div className="relative z-10 p-12 text-white max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/20 border border-purple-400/30 rounded-full text-purple-200 text-sm font-medium mb-6">
              <Sparkles size={14} /> Join the Community
            </div>
            <h1 className="text-5xl font-extrabold tracking-tight leading-tight mb-6">Start Your <br />Journey Today.</h1>
            <p className="text-lg text-blue-100/80 leading-relaxed">
              Whether you&apos;re looking for guidance or ready to guide others, you&apos;re in the right place.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-2 gap-6"
          >
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/10">
              <GraduationCap className="text-blue-300 mb-2" size={24} />
              <h3 className="font-bold text-lg">For Students</h3>
              <p className="text-sm text-blue-200/70">Get advice from the best.</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/10">
              <Briefcase className="text-purple-300 mb-2" size={24} />
              <h3 className="font-bold text-lg">For Mentors</h3>
              <p className="text-sm text-blue-200/70">Share your experience.</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* RIGHT: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-slate-50 dark:bg-[#080d14] relative">
        <Link to="/" className="absolute top-8 left-8 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-2 font-medium transition-colors">
          <ArrowLeft size={20} /> Back to Home
        </Link>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md bg-white dark:bg-[#0d1520] p-10 rounded-3xl shadow-xl shadow-slate-200 dark:shadow-black/60 border border-slate-100 dark:border-slate-800"
        >
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Create Account</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2">Join us and start achieving your goals.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-200 ml-1">Full Name</label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-3.5 text-slate-400 dark:text-slate-500" size={20} />
                <input
                  type="text"
                  name="username"
                  onChange={handleChange}
                  placeholder="John Doe"
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-[#151f2e] border border-slate-200 dark:border-slate-800 rounded-xl focus:border-indigo-500 dark:focus:border-indigo-500 focus:bg-white dark:focus:bg-[#0d1520] focus:ring-4 focus:ring-indigo-500/10 dark:focus:ring-indigo-500/20 outline-none transition-all font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-200 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 text-slate-400 dark:text-slate-500" size={20} />
                <input
                  type="email"
                  name="email"
                  onChange={handleChange}
                  placeholder="john@example.com"
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-[#151f2e] border border-slate-200 dark:border-slate-800 rounded-xl focus:border-indigo-500 dark:focus:border-indigo-500 focus:bg-white dark:focus:bg-[#0d1520] focus:ring-4 focus:ring-indigo-500/10 dark:focus:ring-indigo-500/20 outline-none transition-all font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-200 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 text-slate-400 dark:text-slate-500" size={20} />
                <input
                  type="password"
                  name="password"
                  onChange={handleChange}
                  placeholder="Min 6 characters"
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-[#151f2e] border border-slate-200 dark:border-slate-800 rounded-xl focus:border-indigo-500 dark:focus:border-indigo-500 focus:bg-white dark:focus:bg-[#0d1520] focus:ring-4 focus:ring-indigo-500/10 dark:focus:ring-indigo-500/20 outline-none transition-all font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-200 ml-1">I want to apply as</label>

              <div className="grid grid-cols-2 gap-4">
                {/* Student Option (Selected) */}
                <div className="border-2 border-indigo-500 bg-indigo-50/50 dark:bg-[#151f2e] dark:border-indigo-500 p-4 rounded-xl flex items-center justify-center gap-2 cursor-default">
                  <div className="w-5 h-5 rounded-full border-[6px] border-indigo-600 dark:border-indigo-400 bg-white"></div>
                  <span className="font-bold text-indigo-700 dark:text-indigo-400">Student</span>
                </div>

                {/* Mentor Option (Link) */}
                <Link to="/signup/mentor" className="border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-[#111b21] p-4 rounded-xl flex items-center justify-center gap-2 transition-all group">
                  <div className="w-5 h-5 rounded-full border-2 border-slate-300 dark:border-slate-500 group-hover:border-purple-500 transition-colors"></div>
                  <span className="font-bold text-slate-600 dark:text-slate-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">Mentor</span>
                </Link>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 px-1">
                Mentors require a dedicated verification process. <Link to="/signup/mentor" className="text-purple-600 dark:text-purple-400 hover:underline">Register here</Link>.
              </p>
            </div>

            <button type="submit" className="w-full btn-primary py-4 rounded-xl text-base group mt-2">
              Create Account <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <p className="mt-8 text-center text-slate-600 dark:text-slate-400">
            Already have an account? <Link to="/login" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">Log In</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default SignupPage;