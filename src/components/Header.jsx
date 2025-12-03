import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  
  // Check if user is logged in
  const user = localStorage.getItem('user');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    alert("Logged out successfully!");
    navigate('/login');
  };

  return (
    <header className="fixed w-full bg-white z-50 shadow-sm top-0">
      <nav className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-bold text-gray-800">EduMentor<span className="text-blue-600">Connect</span></span>
          </Link>

          {/* Desktop Menu Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-600 hover:text-blue-600 font-medium">Home</Link>
            <a href="/#about" className="text-gray-600 hover:text-blue-600 font-medium">About Us</a>
            <Link to="/mentors" className="...">Mentors</Link>
            
            <Link to="/contact" className="text-gray-600 hover:text-blue-600 font-medium">Contact</Link>

            {/* Login / Logout Logic */}
            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-blue-600 font-bold">Hi, {user}</span>
                <button onClick={handleLogout} className="bg-red-500 text-white px-5 py-2 rounded-lg font-medium hover:bg-red-600 transition">
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex gap-4">
                <Link to="/login" className="text-gray-600 hover:text-blue-600 font-medium py-2">
                  Login
                </Link>
                <Link to="/signup" className="bg-blue-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-blue-700 transition">
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600 focus:outline-none">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-4 bg-white shadow-lg rounded-lg p-4 absolute w-full left-0">
            <Link to="/" className="block text-gray-600 hover:text-blue-600" onClick={() => setIsOpen(false)}>Home</Link>
            <Link to="/contact" className="block text-gray-600 hover:text-blue-600" onClick={() => setIsOpen(false)}>Contact</Link>
            
            {user ? (
              <>
                <div className="text-blue-600 font-bold py-2">Hi, {user}</div>
                <button onClick={() => { handleLogout(); setIsOpen(false); }} className="block w-full text-center bg-red-500 text-white py-2 rounded-lg">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="block text-gray-600 hover:text-blue-600" onClick={() => setIsOpen(false)}>Login</Link>
                <Link to="/signup" className="block w-full text-center bg-blue-600 text-white py-2 rounded-lg" onClick={() => setIsOpen(false)}>Sign Up</Link>
              </>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}

export default Header;