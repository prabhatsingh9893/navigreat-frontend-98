import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { auth, provider } from '../firebaseConfig';
import { signInWithPopup } from 'firebase/auth';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../config';

function LoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' });

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

  // --- 2. Google Login (POPUP Method) ---
  const handleGoogleLogin = async () => {
    try {
      // Step A: Firebase Popup Open
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      console.log("Firebase User:", user);

      // Step B: Send to Backend
      const loadingToast = toast.loading("Verifying with Backend...");

      const response = await fetch(`${API_BASE_URL}/google-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: user.displayName,
          email: user.email,
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
      console.error("Google Login Error:", error);
      toast.error("Login Failed: " + error.message);
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