import { signInWithPopup, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { auth, provider } from '../firebaseConfig';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../config';

function LoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' });

  // --- Helper: Verify Logic for both Popup and Redirect ---
  const verifyWithBackend = async (user) => {
    const loadingToast = toast.loading("Verifying with Backend...");
    try {
      const response = await fetch(`${API_BASE_URL}/google-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: user.displayName,
          email: user.email,
          image: user.photoURL
        }),
      });

      const data = await response.json();
      toast.dismiss(loadingToast);

      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userData', JSON.stringify(data.user));
        toast.success("Google Login Successful!");
        window.location.href = "/";
      } else {
        toast.error("Backend Error: " + data.message);
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Login verification failed");
      console.error(error);
    }
  };

  // --- 0. Handle Redirect Result (For Mobile Flow) ---
  useEffect(() => {
    const checkRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result && result.user) {
          console.log("Redirect Login Success:", result.user);
          verifyWithBackend(result.user);
        }
      } catch (error) {
        console.error("Redirect Error:", error);
        // toast.error("Mobile Login Error: " + error.message);
      }
    };
    checkRedirect();
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

  // --- 2. Google Login (Robust: Try Popup, Fallback to Redirect) ---
  const handleGoogleLogin = async () => {
    try {
      // Attempt 1: Try Popup first (Better UX for Desktop)
      const result = await signInWithPopup(auth, provider);
      verifyWithBackend(result.user);
    } catch (error) {
      console.warn("Popup failed, switching to Redirect method...", error);

      // Attempt 2: If Popup fails (Mobile/Blocked), Try Redirect
      if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/popup-blocked' || error.code === 'auth/cancelled-popup-request') {
        try {
          toast.loading("Redirecting to Google...");
          await signInWithRedirect(auth, provider);
          // Result handled in useEffect
        } catch (redirectError) {
          console.error("Redirect Login Error:", redirectError);
          toast.error("Login Failed: " + redirectError.message);
        }
      } else {
        toast.error("Login Error: " + error.message);
      }
    }
  };

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

        <p className="mt-4 text-center text-gray-600">
          New here? <Link to="/signup" className="text-blue-600 font-bold">Create Account</Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;