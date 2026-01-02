import { signInWithPopup, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, provider } from '../firebaseConfig';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../config';

// Simple Loader Component for internal use
const ProcessingOverlay = ({ text }) => (
  <div className="fixed inset-0 bg-white/90 z-50 flex flex-col items-center justify-center p-4">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
    <h3 className="text-xl font-semibold text-gray-800">{text}</h3>
    <p className="text-sm text-gray-500 mt-2">Please wait while we secure your session...</p>
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

  // --- 2. Google Login (Mobile = Redirect, Desktop = Popup) ---
  const handleGoogleLogin = async () => {
    try {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

      if (isMobile) {
        setVerifying(true);
        setStatusMessage("Redirecting to Google...");
        await signInWithRedirect(auth, provider);
        // Result will be handled by useEffect on page reload
      } else {
        const result = await signInWithPopup(auth, provider);
        verifyWithBackend(result.user);
      }

    } catch (error) {
      setVerifying(false);
      console.error("Google Login Error:", error);

      // Fallback: If popup somehow runs and fails (e.g. tablet treated as desktop), try redirect
      if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/popup-blocked') {
        toast.loading("Popup failed, retrying with Redirect...");
        await signInWithRedirect(auth, provider);
      } else {
        toast.error("Login Failed: " + error.message);
      }
    }
  };

  if (verifying) {
    return <ProcessingOverlay text={statusMessage} />;
  }

  return (
    <div className="pt-24 md:pt-32 pb-20 bg-gray-50 min-h-screen flex justify-center items-center px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Welcome Back</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="email" name="email" onChange={handleChange} placeholder="Email Address" required className="w-full border p-3 rounded-lg" />
          <input type="password" name="password" onChange={handleChange} placeholder="Password" required className="w-full border p-3 rounded-lg" />

          <div className="text-right">
            <Link to="/forgot-password" className="text-sm text-blue-500 hover:text-blue-700">Forgot Password?</Link>
          </div>

          <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700">Login</button>
        </form>

        <div className="mt-6 grid grid-cols-3 items-center text-gray-400">
          <hr className="border-gray-300" />
          <p className="text-center text-sm">OR</p>
          <hr className="border-gray-300" />
        </div>

        <button
          onClick={handleGoogleLogin}
          className="mt-6 w-full border border-gray-300 bg-white text-gray-700 p-3 rounded-lg font-bold hover:bg-gray-50 flex items-center justify-center gap-3 transition"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" />
          Continue with Google
        </button>

        {/* Fallback Button for Stubborn Mobile Devices */}
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={async () => {
              setVerifying(true);
              setStatusMessage("Redirecting...");
              await signInWithRedirect(auth, provider);
            }}
            className="text-xs text-blue-400 hover:text-blue-600 underline"
          >
            Having trouble? Click here for Alternative Login
          </button>
        </div>

        <p className="mt-4 text-center text-gray-600">
          New here? <Link to="/signup" className="text-blue-600 font-bold">Create Account</Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;