import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function MentorSignupPage() {
  const [formData, setFormData] = useState({ 
    username: '', 
    email: '', 
    password: '',
    role: 'Mentor', // यह अपने आप Mentor बन जाएगा
    college: '',
    expertise: ''
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
      
      if (data.success) {
        alert("✅ Mentor Application Submitted! Please Login.");
        navigate('/login');
      } else {
        alert("❌ Error: " + data.message);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="pt-32 pb-20 bg-blue-50 min-h-screen flex justify-center items-center">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-lg border-t-4 border-blue-600">
        <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">Join as a Mentor</h2>
        <p className="text-gray-500 text-center mb-6">Share your knowledge and guide juniors.</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" name="username" onChange={handleChange} placeholder="Full Name" required className="w-full border p-3 rounded-lg" />
          <input type="email" name="email" onChange={handleChange} placeholder="Email Address" required className="w-full border p-3 rounded-lg" />
          <input type="password" name="password" onChange={handleChange} placeholder="Create Password" required className="w-full border p-3 rounded-lg" />
          
          {/* ये दो बॉक्स सिर्फ मेंटर के लिए हैं */}
          <div className="grid grid-cols-2 gap-4">
            <input type="text" name="college" onChange={handleChange} placeholder="College (e.g. IIT Delhi)" required className="w-full border p-3 rounded-lg" />
            <input type="text" name="expertise" onChange={handleChange} placeholder="Expertise (e.g. AI/ML)" required className="w-full border p-3 rounded-lg" />
          </div>

          <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700 transition">
            Register as Mentor
          </button>
        </form>
        <p className="mt-4 text-center text-gray-600">
          Want to learn instead? <Link to="/signup" className="text-blue-600 font-bold">Join as Student</Link>
        </p>
      </div>
    </div>
  );
}

export default MentorSignupPage;