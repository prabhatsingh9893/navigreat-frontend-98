import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

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
      // STEP 1: Register (Account banana)
      // ---------------------------------------------------------
      const registerRes = await fetch('https://navigreat-backend-98.onrender.com/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      const registerData = await registerRes.json();

      if (!registerRes.ok) {
        // Agar account nahi bana (Ex: Email exists)
        alert("❌ Signup Failed: " + (registerData.message || "Error occurred"));
        return;
      }

      // ---------------------------------------------------------
      // STEP 2: Auto Login (Turant Login karna)
      // ---------------------------------------------------------
      // Jaise hi account bana, hum turant login API call kar denge
      const loginRes = await fetch('https://navigreat-backend-98.onrender.com/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,       // Wahi email jo abhi bhara
          password: formData.password  // Wahi password jo abhi bhara
        }),
      });

      const loginData = await loginRes.json();

      if (loginRes.ok) {
        // Login Success! Data save karein
        localStorage.setItem('token', loginData.token);
        localStorage.setItem('userData', JSON.stringify(loginData.user || loginData.result)); // Check backend key
        
        alert("✅ Account Created & Welcome!");
        
        // STEP 3: Redirect to Home Page
        window.location.href = '/'; 
      } else {
        // Agar account ban gaya par login fail hua
        alert("⚠️ Account created, but auto-login failed. Please login manually.");
        navigate('/login');
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