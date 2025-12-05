import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Header() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // 1. Check if user is logged in
  useEffect(() => {
    const storedUser = localStorage.getItem('userData');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // 2. Logout Function
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    setUser(null);
    navigate('/login'); 
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-gray-800">
          EduMentor<span className="text-blue-600">Connect</span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-gray-600 hover:text-blue-600 font-medium">Home</Link>
          
          {/* 👇 Ye Line change ki hai: Ab ye seedha Footer par jayega 👇 */}
          <a href="#footer" className="text-gray-600 hover:text-blue-600 font-medium cursor-pointer">
            About
          </a>

          <Link to="/contact" className="text-gray-600 hover:text-blue-600 font-medium">Contact</Link>
          
          {/* Dynamic Login/Logout Section */}
          {user ? (
            <div className="flex items-center gap-4 ml-4">
              <span className="text-gray-800 font-semibold bg-gray-100 px-3 py-1 rounded-full">
                👤 {user.username ? user.username.split(" ")[0] : "User"}
              </span>
              
              <button 
                onClick={handleLogout}
                className="text-sm bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-lg hover:bg-red-600 hover:text-white transition"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 ml-4">
              <Link to="/login" className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition font-medium">
                Login
              </Link>
              <Link to="/signup" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium shadow-lg shadow-blue-500/30">
                Sign Up
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;