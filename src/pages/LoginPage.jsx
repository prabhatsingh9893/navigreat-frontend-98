import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, provider } from '../firebaseConfig'; // <--- Import Firebase
import { signInWithPopup } from 'firebase/auth';
import toast from 'react-hot-toast';

function LoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- 1. Normal Login Logic ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading("Logging in...");
    
    try {
      const response = await fetch('https://navigreat-backend-98.onrender.com/api/login', {
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
        navigate('/dashboard');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Server Error");
    }
  };

  // --- 2. Google Login Logic (New) ---
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user; // Google से यूजर का डेटा मिला
      
      // अब इस डेटा को अपने Backend को भेजो
      const response = await fetch('https://navigreat-backend-98.onrender.com/api/google-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: user.displayName,
          email: user.email,
        }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userData', JSON.stringify(data.user));
        toast.success("Google Login Successful!");
        navigate('/dashboard');
      }
    } catch (error) {
      console.error(error);
      toast.error("Google Login Failed");
    }
  };

  return (
    <div className="pt-32 pb-20 bg-gray-50 min-h-screen flex justify-center items-center">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Welcome Back</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="email" name="email" onChange={handleChange} placeholder="Email Address" required className="w-full border p-3 rounded-lg" />
          <input type="password" name="password" onChange={handleChange} placeholder="Password" required className="w-full border p-3 rounded-lg" />
          <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700">Login</button>
        </form>

        <div className="mt-6 grid grid-cols-3 items-center text-gray-400">
          <hr className="border-gray-300" />
          <p className="text-center text-sm">OR</p>
          <hr className="border-gray-300" />
        </div>

        {/* Google Button */}
        <button 
          onClick={handleGoogleLogin}
          className="mt-6 w-full border border-gray-300 bg-white text-gray-700 p-3 rounded-lg font-bold hover:bg-gray-50 flex items-center justify-center gap-3 transition"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6"/>
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