import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function SignupPage() {
  // 1. role: 'student' add kiya hai (Default value)
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
      const response = await fetch('https://navigreat-backend-98.onrender.com/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      // Error check karne ke liye console me print karein
      console.log("Server Response:", data); 

      if (response.ok) {
        // CASE 1: Agar Backend Token bhejta hai (Direct Login)
        if (data.token) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('userData', JSON.stringify(data.user || data));
            alert("✅ Account Created & Logged In!");
            window.location.href = '/'; // Seedha Home Page par
        } 
        // CASE 2: Agar sirf account banta hai par token nahi aata
        else {
            alert("✅ Account Created! Please Login.");
            navigate('/login');
        }
      } else {
        // Agar koi error aata hai (jaise Email already exists)
        alert("❌ Signup Failed: " + (data.message || JSON.stringify(data)));
      }
    } catch (error) {
      console.error("Error:", error);
      alert("❌ Something went wrong. Check console.");
    }
  };

  return (
    <div className="pt-32 pb-20 bg-gray-50 min-h-screen flex justify-center items-center">
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

          {/* 👇 NEW: Role Selection Dropdown (Isse Error 400 hat jana chahiye) 👇 */}
          <select 
            name="role" 
            onChange={handleChange} 
            className="w-full border p-3 rounded-lg bg-white"
          >
            <option value="student">I am a Student</option>
            <option value="mentor">I am a Mentor</option>
          </select>

          <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700 transition">
            Sign Up & Login
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