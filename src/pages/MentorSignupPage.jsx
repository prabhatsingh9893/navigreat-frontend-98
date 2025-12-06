import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast'; // Agar toast install nahi hai to alert use karega

function MentorSignupPage() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({ 
    username: '', 
    email: '', 
    password: '',
    college: '', // Extra field
    branch: '',  // Extra field
    role: 'mentor' // 🔒 FIXED: Role hamesha 'mentor' rahega
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Simple Validation
    if(!formData.college || !formData.branch) {
      alert("Please fill College and Branch details to become a mentor.");
      return;
    }

    try {
      // 1. Register API Call
      const response = await fetch('https://navigreat-backend-98.onrender.com/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData), // Isme role: 'mentor' ja raha hai
      });
      
      const data = await response.json();

      if (response.ok) {
        // Success!
        alert("🎉 Welcome Mentor! Your profile is created.");
        
        // Auto Login Logic (Optional)
        if(data.token) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('userData', JSON.stringify(data.user));
            window.location.href = '/dashboard'; // Dashboard par bhejo
        } else {
            navigate('/login');
        }
      } else {
        alert("❌ Registration Failed: " + (data.message || "Error"));
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong!");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Join as a Mentor 🚀
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Guide juniors and build your personal brand.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <div className="mt-1">
                <input name="username" type="text" required onChange={handleChange} className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Email address</label>
              <div className="mt-1">
                <input name="email" type="email" required onChange={handleChange} className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
              </div>
            </div>

            {/* College (New Field) */}
            <div>
              <label className="block text-sm font-medium text-gray-700">College / University</label>
              <div className="mt-1">
                <input name="college" type="text" placeholder="e.g. IIT Delhi" required onChange={handleChange} className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
              </div>
            </div>

             {/* Branch (New Field) */}
             <div>
              <label className="block text-sm font-medium text-gray-700">Branch / Specialization</label>
              <div className="mt-1">
                <input name="branch" type="text" placeholder="e.g. Computer Science" required onChange={handleChange} className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <div className="mt-1">
                <input name="password" type="password" required onChange={handleChange} className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
              </div>
            </div>

            <div>
              <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                Register as Mentor
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Already have an account? <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">Login</Link>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MentorSignupPage;