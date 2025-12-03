import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function LoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = awaitfetch('https://navigreat-backend-98.onrender.com/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      
     if (data.success) {
  localStorage.setItem('token', data.token);
  // 👇 यहाँ बदलाव: अब हम पूरा यूजर ऑब्जेक्ट सेव कर रहे हैं
  localStorage.setItem('userData', JSON.stringify(data.user)); 
  
  alert("✅ Login Successful!");
  navigate('/dashboard'); // अब हम होम नहीं, Dashboard पर भेजेंगे
}else {
        alert("❌ Error: " + data.message);
      }
    } catch (error) {
      console.error("Error:", error);
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
        <p className="mt-4 text-center text-gray-600">
          New here? <Link to="/signup" className="text-blue-600 font-bold">Create Account</Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;