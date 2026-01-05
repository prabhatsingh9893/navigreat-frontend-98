import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, LogOut, LayoutDashboard, ChevronDown, User as UserIcon, Mail } from 'lucide-react';
import Avatar from '../components/Avatar'; // ✅ Import Avatar

// 👇 1. Import your new Logo here
import logo from '../assets/navigreat-feather-logo.png';

import { signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const updateHeaderUser = () => {
      const storedUser = localStorage.getItem('userData');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        setUser(null);
      }
    };

    // Initial check
    updateHeaderUser();

    // Listen for custom event
    window.addEventListener('userUpdated', updateHeaderUser);

    return () => {
      window.removeEventListener('userUpdated', updateHeaderUser);
    };
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth); // ✅ Ensure Firebase session is cleared
    } catch (error) {
      console.error("Firebase Logout Error:", error);
    }

    localStorage.removeItem('userData');
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
    setIsDropdownOpen(false);
  };

  return (
    <header className="fixed w-full bg-white/90 backdrop-blur-md shadow-sm z-50 border-b border-gray-100">
      <div className="container mx-auto px-6 py-3 flex justify-between items-center">

        {/* 👇 2. UPDATED LOGO SECTION */}
        <Link to="/" className="flex items-center gap-3 group">
          {/* Image Logo */}
          <img
            src={logo}
            alt="NaviGreat Logo"
            className="h-16 w-auto object-contain group-hover:scale-105 transition duration-300 mix-blend-multiply brightness-110 contrast-125"
          />
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link to="/" className="text-gray-600 hover:text-blue-600 font-medium">Home</Link>
          <Link to="/about" className="text-gray-600 hover:text-blue-600 font-medium">About</Link>
          <Link to="/contact" className="text-gray-600 hover:text-blue-600 font-medium">Contact</Link>

          {/* User Dropdown Section */}
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-3 focus:outline-none hover:bg-gray-50 px-3 py-2 rounded-xl transition border border-transparent hover:border-gray-200"
              >
                <div className="text-right hidden lg:block">
                  <p className="text-sm font-bold text-gray-800 leading-none">Hi, {user.username}</p>
                  <p className="text-xs text-blue-600 font-medium capitalize">{user.role}</p>
                </div>
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-blue-100 shadow-sm">
                  <Avatar
                    src={user.image}
                    name={user.username}
                    size="w-full h-full"
                    className="text-xs"
                  />
                </div>
                <ChevronDown size={16} className={`text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  <div className="px-5 py-4 border-b border-gray-50 bg-gray-50/50">
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Signed in as</p>
                    <p className="text-sm font-bold text-gray-800 truncate">{user.email}</p>
                  </div>
                  <div className="p-2">
                    <Link
                      to="/dashboard"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition group"
                    >
                      <LayoutDashboard size={18} />
                      <span className="font-medium">My Dashboard</span>
                    </Link>

                    <Link
                      to="/dashboard"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition group"
                    >
                      <UserIcon size={18} />
                      <span className="font-medium">Edit Profile</span>
                    </Link>

                    {/* MESSAGES/CHAT LINK */}
                    <Link
                      to="/chat"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition group"
                    >
                      <Mail size={18} />
                      <span className="font-medium">Messages</span>
                    </Link>
                  </div>
                  <div className="p-2 border-t border-gray-50">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-red-500 hover:bg-red-50 rounded-lg transition text-left group"
                    >
                      <LogOut size={18} />
                      <span className="font-medium">Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-gray-600 hover:text-blue-600 font-medium">Login</Link>
              <Link to="/signup" className="bg-blue-600 text-white px-6 py-2.5 rounded-full font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-500/30">
                Get Started
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button className="md:hidden text-gray-600" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t p-4 absolute w-full shadow-xl">
          <div className="flex flex-col space-y-4">
            <Link to="/" className="text-gray-600 font-medium" onClick={() => setIsOpen(false)}>Home</Link>
            <Link to="/about" className="text-gray-600 font-medium" onClick={() => setIsOpen(false)}>About</Link>
            <Link to="/contact" className="text-gray-600 font-medium" onClick={() => setIsOpen(false)}>Contact</Link>

            {user ? (
              <>
                <Link to="/dashboard" className="text-blue-600 font-bold flex items-center gap-2" onClick={() => setIsOpen(false)}>
                  <LayoutDashboard size={18} /> My Dashboard
                </Link>
                <Link to="/chat" className="text-purple-600 font-bold flex items-center gap-2" onClick={() => setIsOpen(false)}>
                  <Mail size={18} /> Messages
                </Link>
                <button onClick={handleLogout} className="text-red-500 font-bold flex items-center gap-2 text-left">
                  <LogOut size={18} /> Logout
                </button>
              </>
            ) : (
              <>
                <div className="border-t pt-4 flex flex-col gap-3">
                  <Link to="/login" className="text-gray-600 text-center py-2 border rounded-lg" onClick={() => setIsOpen(false)}>Login</Link>
                  <Link to="/signup" className="bg-blue-600 text-white text-center py-2 rounded-lg font-bold" onClick={() => setIsOpen(false)}>Sign Up</Link>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;