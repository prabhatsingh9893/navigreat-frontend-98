import { signInWithPopup, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, provider } from '../firebaseConfig';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../config';
import { ArrowLeft, User as UserIcon, Lock, Mail, ChevronRight, Sparkles } from 'lucide-react';

// Simple Loader Component for internal use
const ProcessingOverlay = ({ text, onCancel }) => (
  <div className="fixed inset-0 bg-white/90 z-50 flex flex-col items-center justify-center p-4 backdrop-blur-sm">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
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
  const navigate = useNavigate();

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
        alert("Login Failed: " + (data.message || "Unknown Backend Error"));
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
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Server Error");
    }
  };

  // --- 2. Google Login (Preferred: Popup, Fallback: Redirect) ---
  // --- 2. Google Login (Smart Handler) ---
  const handleGoogleLogin = async () => {
    setStatusMessage("Connecting to Google...");

    // Simple User Agent Check for Mobile
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    try {
      if (isMobile) {
        // Mobile: Prefer Redirect immediately to avoid popup blocks
        setVerifying(true);
        setStatusMessage("Redirecting to Google...");
        await signInWithRedirect(auth, provider);
      } else {
        // Desktop: Prefer Popup for better UX
        const result = await signInWithPopup(auth, provider);
        verifyWithBackend(result.user);
      }
    } catch (error) {
      console.error("Google Login Error:", error);

      // Fallback Logic
      if (error.code === 'auth/popup-blocked' || error.code === 'auth/popup-closed-by-user') {
        try {
          setVerifying(true);
          setStatusMessage("Redirecting to Google...");
          await signInWithRedirect(auth, provider);
        } catch (redirectError) {
          setVerifying(false); // Only reset if redirect failed synchronously
          toast.error("Login Failed: " + redirectError.message);
        }
      } else {
        setVerifying(false);
        toast.error("Login Error: " + error.message);
      }
    }
  };

  if (verifying) {
    return <ProcessingOverlay text={statusMessage} onCancel={() => setVerifying(false)} />;
  }

  return (
    <div className="min-h-screen bg-white flex relative overflow-hidden">

      {/* LEFT: Illustrative Side (Desktop Only) */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 relative items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1543269865-cbf427effbad?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80')] bg-cover bg-center opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/80 to-purple-900/80"></div>

        <div className="relative z-10 p-12 text-white max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 border border-blue-400/30 rounded-full text-blue-200 text-sm font-medium mb-6">
              <Sparkles size={14} /> Future awaits
            </div>
            <h1 className="text-5xl font-extrabold tracking-tight leading-tight mb-6">Welcome to <br />NaviGreat.</h1>
            <p className="text-lg text-blue-100/80 leading-relaxed">
              Connect with mentors from top IITs & NITs. Your journey to a dream career starts with a single step.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex gap-4"
          >
            <div className="flex -space-x-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-12 h-12 rounded-full border-2 border-slate-900 bg-slate-700 flex items-center justify-center text-xs">
                  <UserIcon size={20} className="text-slate-400" />
                </div>
              ))}
            </div>
            <div className="flex flex-col justify-center">
              <span className="font-bold text-lg">500+</span>
              <span className="text-sm text-blue-200">Students active now</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* RIGHT: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-slate-50 relative">
        <Link to="/" className="absolute top-8 left-8 text-slate-500 hover:text-slate-900 flex items-center gap-2 font-medium transition-colors">
          <ArrowLeft size={20} /> Back to Home
        </Link>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md bg-white p-10 rounded-3xl shadow-xl shadow-slate-200 border border-slate-100"
        >
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-slate-900">Welcome Back</h2>
            <p className="text-slate-500 mt-2">Please enter your details to sign in.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 text-slate-400" size={20} />
                <input
                  type="email"
                  name="email"
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 text-slate-400" size={20} />
                <input
                  type="password"
                  name="password"
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400"
                />
              </div>
              <div className="text-right pt-1">
                <Link to="/forgot-password" className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline">Forgot Password?</Link>
              </div>
            </div>

            <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 active:scale-[0.98] transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 group">
              Sign In <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="my-8 flex items-center gap-4">
            <div className="h-px bg-slate-200 flex-1"></div>
            <span className="text-slate-400 text-sm font-medium uppercase tracking-wider">Or continue with</span>
            <div className="h-px bg-slate-200 flex-1"></div>
          </div>

          <button
            onClick={handleGoogleLogin}
            className="w-full bg-white border border-slate-200 text-slate-700 py-3.5 rounded-xl font-bold hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-3 group"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5 group-hover:scale-110 transition-transform" />
            Sign in with Google
          </button>

          {/* Fallback Button for Stubborn Mobile Devices */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={async () => {
                setVerifying(true);
                setStatusMessage("Redirecting...");
                await signInWithRedirect(auth, provider);
              }}
              className="text-xs text-slate-400 hover:text-blue-600 font-medium transition-colors"
            >
              Having specific trouble? Use Alternate Login
            </button>
          </div>

          <p className="mt-8 text-center text-slate-600">
            Don't have an account? <Link to="/signup" className="text-blue-600 font-bold hover:underline">Create Account</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default LoginPage;