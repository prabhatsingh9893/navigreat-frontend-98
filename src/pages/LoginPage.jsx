import { signInWithPopup, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, provider } from '../firebaseConfig';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../config';
import { Lock, Mail, ChevronRight, Eye, EyeOff, Star } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';

// Simple Loader Component for internal use
const ProcessingOverlay = ({ text, onCancel }) => (
  <div className="fixed inset-0 bg-white/90 z-50 flex flex-col items-center justify-center p-4 backdrop-blur-sm">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600 mb-4"></div>
    <h3 className="text-xl font-semibold text-gray-800 animate-pulse">{text}</h3>
    <p className="text-sm text-gray-500 mt-2">Please wait while we secure your session...</p>
    {onCancel && (
      <button
        onClick={onCancel}
        className="mt-6 text-sm text-red-500 hover:text-red-700 font-medium underline"
      >
        Cancel Request
      </button>
    )}
  </div>
);

function LoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [verifying, setVerifying] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (localStorage.getItem('token')) {
      navigate('/dashboard');
    }
  }, [navigate]);

  // --- Helper: Verify Logic for both Popup and Redirect ---
  const verifyWithBackend = async (user) => {
    if (!user) return;
    setVerifying(true);
    setStatusMessage("Verifying Google Account...");

    try {
      // Robust Payload to prevent 400 Errors
      const payload = {
        username: user.displayName || user.email.split('@')[0], // Fallback if name missing
        email: user.email,
        image: user.photoURL || "" // Fallback if photo missing
      };

      console.log("[vLoginFinal] Sending Payload:", payload);

      const response = await fetch(`${API_BASE_URL}/google-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userData', JSON.stringify(data.user));
        toast.success("Login Successful!");
        window.location.href = "/"; // Force refresh to update Header
      } else {
        setVerifying(false);
        console.error("[vLoginFinal] Backend Error:", data);
        toast.error(data.message || "Login Verification Failed");
      }
    } catch (error) {
      setVerifying(false);
      console.error("[vLoginFinal] Network Error:", error);
      toast.error("Network Error: Could not reach server.");
    }
  };

  // --- 0. Handle Auth State (Robust Listener) ---
  useEffect(() => {
    let isMounted = true;

    // A. Check for Redirect Result (Primary for Redirect Flow)
    const checkRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result && result.user) {
          console.log("[vAuth] Redirect Success:", result.user);
          if (isMounted) verifyWithBackend(result.user);
        }
      } catch (error) {
        console.error("[vAuth] Redirect Error:", error);
        toast.error("Mobile Login Error: " + error.message);
      }
    };
    checkRedirect();

    // B. Listen for Auth Changes (Backup for when RedirectResult is lost but Session exists)
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        console.log("[vAuth] Auth State Changed - User Detected:", user.email);
        if (isMounted) verifyWithBackend(user);
      } else {
        console.log("[vAuth] No User Session Found");
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- 1. Email/Password Login ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading("Logging in...");

    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      toast.dismiss(loadingToast);

      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userData', JSON.stringify(data.user));
        toast.success("Welcome back!");
        window.location.href = "/";
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.dismiss(loadingToast);
      toast.error("Server Error");
    }
  };

  // --- 2. Google Login (Universal Popup Handler) ---
  const handleGoogleLogin = async () => {
    setStatusMessage("Connecting to Google...");
    setVerifying(true);

    try {
      // Use Popup for ALL devices
      // Note: Redirect flow causes 'Missing Initial State' on many mobile browsers due to standard cookie blocking.
      // Popup is safer if domain is authorized.
      const result = await signInWithPopup(auth, provider);
      verifyWithBackend(result.user);
    } catch (error) {
      console.error("Google Login Popup Error:", error);

      if (error.code === 'auth/popup-blocked' || error.code === 'auth/popup-closed-by-user') {
        setVerifying(false);
        toast.error("Popup Blocked. Please allow popups for this site.");
      } else {
        setVerifying(false); // Reset
        toast.error("Login Error: " + error.message);
      }
    }
  };

  if (verifying) {
    return <ProcessingOverlay text={statusMessage} onCancel={() => setVerifying(false)} />;
  }

  const proof = (
    <div className="max-w-md">
      <figure className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 p-6">
        <div className="flex gap-1 mb-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star key={i} size={15} className="text-amber-400 fill-amber-400" />
          ))}
        </div>
        <blockquote className="text-[15px] leading-relaxed text-white/90">
          &ldquo;My mentor handed me the exact interview prep that landed my placement. One session did what months of guessing couldn&apos;t.&rdquo;
        </blockquote>
        <figcaption className="mt-4 flex items-center gap-3">
          <span className="grid place-items-center w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 text-white text-sm font-bold">P</span>
          <span className="text-sm">
            <span className="block font-semibold text-white">Priya Sharma</span>
            <span className="block text-white/60">IIT Delhi &middot; CSE</span>
          </span>
        </figcaption>
      </figure>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        {['IIT Delhi', 'IIT Bombay', 'NIT Trichy', 'BITS Pilani'].map((c) => (
          <span key={c} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-white/70">{c}</span>
        ))}
        <span className="px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-xs font-semibold text-teal-100">+30 more</span>
      </div>
    </div>
  );

  return (
    <AuthLayout
      eyebrow="Trusted by 500+ students"
      title="Guidance from those who've"
      highlight="already made it."
      subtitle="Log in to book 1-on-1 sessions with verified seniors from India's top engineering colleges."
      proof={proof}
    >
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Welcome back</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2">Sign in to pick up where you left off.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-semibold text-slate-700 dark:text-slate-200 ml-1">Email address</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={19} />
            <input
              id="email"
              type="email"
              name="email"
              onChange={handleChange}
              placeholder="you@example.com"
              required
              className="input-premium !pl-12"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between ml-1">
            <label htmlFor="password" className="text-sm font-semibold text-slate-700 dark:text-slate-200">Password</label>
            <Link to="/forgot-password" className="text-sm font-medium text-teal-600 dark:text-teal-400 hover:underline">Forgot password?</Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={19} />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              onChange={handleChange}
              placeholder="Enter your password"
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

        <button type="submit" className="w-full btn-primary py-4 rounded-xl text-base group">
          Sign in <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </form>

      <div className="my-7 flex items-center gap-4">
        <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />
        <span className="text-slate-400 dark:text-slate-500 text-xs font-semibold uppercase tracking-wider">or</span>
        <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />
      </div>

      <button
        onClick={handleGoogleLogin}
        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 py-3.5 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-teal-300 dark:hover:border-teal-600 transition-all flex items-center justify-center gap-3 group"
      >
        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="" className="w-5 h-5 group-hover:scale-110 transition-transform" />
        Sign in with Google
      </button>

      <div className="mt-5 text-center">
        <button
          type="button"
          onClick={async () => {
            setVerifying(true);
            setStatusMessage("Redirecting...");
            await signInWithRedirect(auth, provider);
          }}
          className="text-xs text-slate-400 dark:text-slate-500 hover:text-teal-600 dark:hover:text-teal-400 font-medium transition-colors"
        >
          Having trouble? Use alternate login
        </button>
      </div>

      <p className="mt-8 text-center text-sm text-slate-600 dark:text-slate-400">
        Don&apos;t have an account? <Link to="/signup" className="text-teal-600 dark:text-teal-400 font-bold hover:underline">Create one free</Link>
      </p>
    </AuthLayout>
  );
}

export default LoginPage;