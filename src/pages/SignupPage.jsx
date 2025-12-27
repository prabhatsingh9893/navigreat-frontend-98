import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../config';

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
    try {
      // ---------------------------------------------------------
      // STEP 1: Register
      // ---------------------------------------------------------
      const registerRes = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const registerData = await registerRes.json();

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
      console.error("Error:", error);
      toast.error("Something went wrong. Check console.");
    }
  };

  return (
    <div className="pt-24 md:pt-32 pb-20 bg-gray-50 min-h-screen flex justify-center items-center px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Create Account</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="username"
            onChange={handleChange}
            placeholder="Full Name"
            required
            className="w-full border p-3 rounded-lg"
          />

          <input
            type="email"
            name="email"
            onChange={handleChange}
            placeholder="Email Address"
            required
            className="w-full border p-3 rounded-lg"
          />

          <input
            type="password"
            name="password"
            onChange={handleChange}
            placeholder="Password (min 6 chars)"
            required
            className="w-full border p-3 rounded-lg"
          />

          <select
            name="role"
            onChange={handleChange}
            className="w-full border p-3 rounded-lg bg-white"
          >
            <option value="student">I am a Student</option>
            <option value="mentor">I am a Mentor</option>
          </select>

          <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700 transition">
            Sign Up
          </button>
        </form>

        <p className="mt-4 text-center text-gray-600">
          Already have an account? <Link to="/login" className="text-blue-600 font-bold">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default SignupPage;