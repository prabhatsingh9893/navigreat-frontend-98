import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import toast from 'react-hot-toast';
import { ArrowLeft, User as UserIcon, Lock, Mail, ChevronRight, Briefcase, GraduationCap, Sparkles, Loader2, UploadCloud, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';

function MentorSignupPage() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    college: '',
    branch: '',
    role: 'mentor'
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.college || !formData.branch) {
      toast.error("Please fill College and Branch details.");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Creating your mentor profile...");

    // Create FormData for file upload
    const data = new FormData();
    data.append('username', formData.username);
    data.append('email', formData.email);
    data.append('password', formData.password);
    data.append('college', formData.college);
    data.append('branch', formData.branch);
    data.append('role', 'mentor');
    if (selectedFile) {
      data.append('image', selectedFile);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        body: data,
      });

      const responseData = await response.json();

      if (response.ok) {
        toast.success("Welcome aboard! Mentor profile created.", { id: toastId });

        if (responseData.token) {
          localStorage.setItem('token', responseData.token);
          localStorage.setItem('userData', JSON.stringify(responseData.user));
          setTimeout(() => {
            window.location.href = '/#/dashboard';
          }, 1500);
        } else {
          navigate('/login');
        }
      } else {
        toast.error(responseData.message || "Registration Failed", { id: toastId });
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Something went wrong. Please try again.", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-mesh-hero dark:bg-[#0b141a] flex relative overflow-hidden">
      {/* LEFT: Illustrative Side (Desktop Only) */}
      <div className="hidden lg:flex w-1/2 bg-slate-100 dark:bg-slate-900 relative items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80')] bg-cover bg-center opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-teal-900/90 to-cyan-900/90"></div>

        <div className="relative z-10 p-12 max-w-lg glass-dark text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="animate-float mb-8"
            transition={{ delay: 0.2 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 border border-amber-400/30 rounded-full text-amber-200 text-sm font-medium mb-6">
              <Sparkles size={14} /> Join the Network
            </div>
            <h1 className="text-5xl font-extrabold tracking-tight leading-tight mb-6">Share Your <br />Experience.</h1>
            <p className="text-lg text-teal-100/80 leading-relaxed">
              Guide the next generation of engineers. Share your experience, help students navigate their careers, and build your professional brand.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-1 gap-4"
          >
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/10 flex gap-3 items-start">
              <div className="p-2 bg-teal-500/20 rounded-xl text-teal-300 flex-shrink-0">
                <Sparkles size={20} />
              </div>
              <div>
                <h3 className="font-bold text-base">Personal Brand</h3>
                <p className="text-sm text-teal-200/70">Build credibility among thousands of aspiring students.</p>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/10 flex gap-3 items-start">
              <div className="p-2 bg-amber-500/20 rounded-xl text-amber-300 flex-shrink-0">
                <Briefcase size={20} />
              </div>
              <div>
                <h3 className="font-bold text-base">Earn for Mentorship</h3>
                <p className="text-sm text-teal-200/70">Set your own session fees and get paid securely for your sessions.</p>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/10 flex gap-3 items-start">
              <div className="p-2 bg-emerald-500/20 rounded-xl text-emerald-300 flex-shrink-0">
                <GraduationCap size={20} />
              </div>
              <div>
                <h3 className="font-bold text-base">Flexible Hours</h3>
                <p className="text-sm text-teal-200/70">Post your available time slots and coordinate sessions at your convenience.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* RIGHT: Mentor Registration Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-slate-50 dark:bg-[#080d14] relative overflow-y-auto py-20">
        <Link to="/" className="absolute top-8 left-8 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-2 font-medium transition-colors">
          <ArrowLeft size={20} /> Back to Home
        </Link>
        <button type="button" aria-label="Toggle dark mode" onClick={toggleTheme} className="absolute top-8 right-8 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md glass-card p-10 mt-12 lg:mt-0"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gradient">Join as a Mentor</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2">Guide juniors and share your academic or industry expertise.</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Profile Image Upload with Preview */}
            <div className="flex flex-col items-center space-y-3 mb-6">
              <div className="relative w-24 h-24 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center group hover:border-teal-500 transition duration-300 cursor-pointer ring-4 ring-teal-500/10 hover:ring-teal-500/30">
                {imagePreview ? (
                  <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="text-slate-400 dark:text-slate-500 w-10 h-10" />
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                  <UploadCloud size={20} />
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold text-center leading-tight">
                {selectedFile ? selectedFile.name : "Click center to upload profile photo"}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-200 ml-1">Full Name</label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-3.5 text-slate-400 dark:text-slate-500" size={20} />
                <input
                  name="username"
                  type="text"
                  required
                  onChange={handleChange}
                  placeholder="e.g. John Doe"
                  className="input-premium !pl-12"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-200 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 text-slate-400 dark:text-slate-500" size={20} />
                <input
                  name="email"
                  type="email"
                  required
                  onChange={handleChange}
                  placeholder="e.g. john@example.com"
                  className="input-premium !pl-12"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-200 ml-1">College / University</label>
              <div className="relative">
                <GraduationCap className="absolute left-4 top-3.5 text-slate-400 dark:text-slate-500" size={20} />
                <input
                  name="college"
                  type="text"
                  placeholder="e.g. IIT Delhi"
                  required
                  onChange={handleChange}
                  className="input-premium !pl-12"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-200 ml-1">Branch / Specialization</label>
              <div className="relative">
                <Briefcase className="absolute left-4 top-3.5 text-slate-400 dark:text-slate-500" size={20} />
                <input
                  name="branch"
                  type="text"
                  placeholder="e.g. Computer Science"
                  required
                  onChange={handleChange}
                  className="input-premium !pl-12"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-200 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 text-slate-400 dark:text-slate-500" size={20} />
                <input
                  name="password"
                  type="password"
                  required
                  onChange={handleChange}
                  placeholder="Min 6 characters"
                  className="input-premium !pl-12"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full btn-primary py-4 rounded-xl text-base group mt-4 flex items-center justify-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5" />
                  Creating Account...
                </>
              ) : (
                <>
                  Register as Mentor
                  <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-slate-600 dark:text-slate-400 text-sm">
            Already have an account? <Link to="/login" className="text-teal-600 dark:text-teal-400 font-bold hover:underline">Log In</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default MentorSignupPage;