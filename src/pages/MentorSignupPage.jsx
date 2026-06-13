import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import toast from 'react-hot-toast';
import { ArrowLeft, User as UserIcon, Lock, Mail, ChevronRight, Briefcase, GraduationCap, Sparkles, Loader2, UploadCloud, User, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

function MentorSignupPage() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    college: '',
    branch: '',
    role: 'mentor'
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.college || !formData.branch) {
      toast.error("Please fill College and Branch details.");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Creating your mentor profile...");

    // Create FormData for file upload
    const data = new FormData();
    data.append('username', formData.username);
    data.append('email', formData.email);
    data.append('password', formData.password);
    data.append('college', formData.college);
    data.append('branch', formData.branch);
    data.append('role', 'mentor');
    if (selectedFile) {
      data.append('image', selectedFile);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        body: data,
      });

      const responseData = await response.json();

      if (response.ok) {
        toast.success("Welcome aboard! Mentor profile created.", { id: toastId });

        if (responseData.token) {
          localStorage.setItem('token', responseData.token);
          localStorage.setItem('userData', JSON.stringify(responseData.user));
          setTimeout(() => {
            window.location.href = '/#/dashboard';
          }, 1500);
        } else {
          navigate('/login');
        }
      } else {
        toast.error(responseData.message || "Registration Failed", { id: toastId });
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Something went wrong. Please try again.", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-mesh-hero dark:bg-[#0b141a] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative">
   
  <button type="button" aria-label="Toggle dark mode" onClick={toggleTheme} className="absolute top-8 right-8 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
  </button>
  <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900 dark:text-white">
          Join as a Mentor 🚀
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
          Guide juniors and build your personal brand.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="glass-card py-8 px-4 border border-slate-100 dark:border-slate-800">
          <form className="space-y-6" onSubmit={handleSubmit}>

            {/* Profile Image Upload with Preview */}
            <div className="flex flex-col items-center space-y-4 mb-6">
              <div className="relative w-24 h-24 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center group hover:border-indigo-500 transition-colors cursor-pointer">
                {imagePreview ? (
                  <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="text-slate-400 dark:text-slate-500 w-10 h-10" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {selectedFile ? selectedFile.name : "Click to upload profile photo"}
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 ml-1">Full Name</label>
              <div className="mt-1">
                <input name="username" type="text" required onChange={handleChange} className="input-premium" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 ml-1">Email address</label>
              <div className="mt-1">
                <input name="email" type="email" required onChange={handleChange} className="input-premium" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 ml-1">College / University</label>
              <div className="mt-1">
                <input name="college" type="text" placeholder="e.g. IIT Delhi" required onChange={handleChange} className="input-premium" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 ml-1">Branch / Specialization</label>
              <div className="mt-1">
                <input name="branch" type="text" placeholder="e.g. Computer Science" required onChange={handleChange} className="input-premium" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 ml-1">Password</label>

              <div className="mt-1">
                <input name="password" type="password" required onChange={handleChange} className="input-premium" />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full btn-primary ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-5 w-5" />
                    Creating Account...
                  </>
                ) : (
                  "Register as Mentor"
                )}
              </button>
            </div>
          </form>

          <p className="mt-8 text-center text-slate-600 dark:text-slate-400">
            Already have an account? <Link to="/login" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">Log In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default MentorSignupPage;