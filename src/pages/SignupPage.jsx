import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../config';
import { User as UserIcon, Lock, Mail, ChevronRight, Briefcase, GraduationCap, Eye, EyeOff, CheckCircle } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';

function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
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

  const proof = (
    <div className="max-w-md">
      <ul className="space-y-3.5">
        {[
          'Verified mentors from IITs, NITs & top universities',
          '1-on-1 sessions, booked in minutes — not weeks',
          'Personalised roadmaps for placements, GATE & higher studies',
        ].map((item) => (
          <li key={item} className="flex items-start gap-3 text-white/85">
            <span className="mt-0.5 grid place-items-center w-5 h-5 rounded-full bg-teal-400/20 text-teal-300 flex-shrink-0">
              <CheckCircle size={14} />
            </span>
            <span className="text-[15px] leading-snug">{item}</span>
          </li>
        ))}
      </ul>

      <div className="mt-7 flex items-center gap-4 pt-6 border-t border-white/10">
        <div className="flex -space-x-2.5">
          {['A', 'R', 'P', 'S'].map((l) => (
            <span key={l} className="grid place-items-center w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 border-2 border-[#0a1622] text-white text-xs font-bold">{l}</span>
          ))}
        </div>
        <p className="text-sm text-white/70">
          <span className="font-bold text-white">500+</span> students already winning
        </p>
      </div>
    </div>
  );

  return (
    <AuthLayout
      eyebrow="Join the community"
      title="Start your journey"
      highlight="today."
      subtitle="Create a free account and connect with mentors who've walked the exact path you're on."
      proof={proof}
    >
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Create your account</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2">Free forever for students. Takes under 2 minutes.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label htmlFor="username" className="text-sm font-semibold text-slate-700 dark:text-slate-200 ml-1">Full name</label>
          <div className="relative">
            <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={19} />
            <input
              id="username"
              type="text"
              name="username"
              onChange={handleChange}
              placeholder="John Doe"
              required
              className="input-premium !pl-12"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-semibold text-slate-700 dark:text-slate-200 ml-1">Email address</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={19} />
            <input
              id="email"
              type="email"
              name="email"
              onChange={handleChange}
              placeholder="john@example.com"
              required
              className="input-premium !pl-12"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-semibold text-slate-700 dark:text-slate-200 ml-1">Password</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={19} />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              onChange={handleChange}
              placeholder="Min 6 characters"
              required
              className="input-premium !pl-12 !pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-3 top-1/2 -translate-y-1/2 grid place-items-center w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className="space-y-2.5">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-200 ml-1">I&apos;m joining as a</label>
          <div className="grid grid-cols-2 gap-3">
            {/* Student (selected) */}
            <div className="relative border-2 border-teal-500 bg-teal-50/60 dark:bg-teal-500/10 p-3.5 rounded-xl flex items-center gap-2.5 cursor-default">
              <GraduationCap size={20} className="text-teal-600 dark:text-teal-400" />
              <span className="font-bold text-sm text-teal-700 dark:text-teal-300">Student</span>
              <CheckCircle size={16} className="ml-auto text-teal-600 dark:text-teal-400" />
            </div>
            {/* Mentor (link) */}
            <Link
              to="/become-mentor"
              className="border border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-500/60 hover:bg-amber-50/50 dark:hover:bg-amber-500/5 p-3.5 rounded-xl flex items-center gap-2.5 transition-all group"
            >
              <Briefcase size={20} className="text-slate-400 group-hover:text-amber-500 transition-colors" />
              <span className="font-bold text-sm text-slate-600 dark:text-slate-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">Mentor</span>
            </Link>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 px-1">
            Mentors go through a quick verification. <Link to="/become-mentor" className="text-amber-600 dark:text-amber-400 font-medium hover:underline">Apply here</Link>.
          </p>
        </div>

        <button type="submit" className="w-full btn-primary py-4 rounded-xl text-base group mt-1">
          Create account <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-slate-600 dark:text-slate-400">
        Already have an account? <Link to="/login" className="text-teal-600 dark:text-teal-400 font-bold hover:underline">Log in</Link>
      </p>
    </AuthLayout>
  );
}

export default SignupPage;