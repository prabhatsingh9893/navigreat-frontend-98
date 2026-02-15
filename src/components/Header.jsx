import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, LogOut, LayoutDashboard, ChevronDown, User as UserIcon, Mail, Sun, Moon } from 'lucide-react';
import Avatar from '../components/Avatar'; // ✅ Import Avatar

// 👇 1. Import your new Logo here
import logo from '../assets/startup-logo.png';

import { signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);

  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [scrolled, setScrolled] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  // Theme Logic
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };


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

  // Dynamic Header Classes - Transparent on Home when at top, else Solid/Blur
  const isHome = location.pathname === '/';
  const headerClasses = `fixed w-full z-50 transition-all duration-300 ${isHome && !scrolled
    ? 'bg-transparent shadow-none border-b border-transparent'
    : 'bg-white/80 backdrop-blur-md dark:bg-slate-900/90 shadow-sm border-b border-gray-100 dark:border-gray-800'
    }`;

  // Text Color Logic: White on transparent home header, else Standard
  const textColorClass = isHome && !scrolled
    ? 'text-white/90 hover:text-white drop-shadow-sm'
    : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400';

  const iconColorClass = isHome && !scrolled
    ? 'text-white/90 hover:bg-white/10'
    : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800';

  return (
    <header className={headerClasses}>
      <div className="w-full px-4 md:px-8 flex justify-between items-center">

        {/* 👇 2. UPDATED LOGO SECTION */}
        <Link to="/" className="flex items-center gap-3 group">
          {/* Image Logo - Blend Mode for Seamless Background */}
          <img
            src={logo}
            alt="NaviGreat Logo"
            className="h-20 w-auto object-contain transition duration-300 pointer-events-none mix-blend-multiply dark:mix-blend-normal dark:brightness-110"
          />
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link to="/" className={`${textColorClass} font-medium transition-colors`}>Home</Link>
          <Link to="/about" className={`${textColorClass} font-medium transition-colors`}>About</Link>
          <Link to="/contact" className={`${textColorClass} font-medium transition-colors`}>Contact</Link>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-full transition-all ${iconColorClass}`}
            title="Toggle Theme"
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>

          {/* User Dropdown Section */}
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`flex items-center gap-3 focus:outline-none px-3 py-2 rounded-xl transition border border-transparent ${isHome && !scrolled
                    ? 'hover:bg-white/10 hover:border-white/20'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-200 dark:hover:border-gray-700'
                  }`}
              >
                <div className="text-right hidden lg:block">
                  <p className={`text-sm font-bold leading-none ${isHome && !scrolled ? 'text-white drop-shadow-sm' : 'text-gray-800 dark:text-gray-200'}`}>Hi, {user.username}</p>
                  <p className={`text-xs font-medium capitalize ${isHome && !scrolled ? 'text-blue-200' : 'text-blue-600 dark:text-blue-400'}`}>{user.role}</p>
                </div>
                <div className={`w-10 h-10 rounded-full overflow-hidden border-2 shadow-sm ${isHome && !scrolled ? 'border-white/50' : 'border-blue-100 dark:border-blue-900'}`}>
                  <Avatar
                    src={user.image}
                    name={user.username}
                    size="w-full h-full"
                    className="text-xs"
                  />
                </div>
                <ChevronDown size={16} className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''} ${isHome && !scrolled ? 'text-white/80' : 'text-gray-400 dark:text-gray-500'}`} />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-60 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  <div className="px-5 py-4 border-b border-gray-50 dark:border-gray-700 bg-gray-50/50 dark:bg-slate-800/50">
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">Signed in as</p>
                    <p className="text-sm font-bold text-gray-800 dark:text-gray-200 truncate">{user.email}</p>
                  </div>
                  <div className="p-2">
                    <Link
                      to="/dashboard"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition group"
                    >
                      <LayoutDashboard size={18} />
                      <span className="font-medium">My Dashboard</span>
                    </Link>

                    <Link
                      to="/dashboard"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition group"
                    >
                      <UserIcon size={18} />
                      <span className="font-medium">Edit Profile</span>
                    </Link>

                    {/* ADMIN PANEL LINK */}
                    {user.role === 'admin' && (
                      <Link
                        to="/admin"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/30 hover:text-green-600 dark:hover:text-green-400 rounded-lg transition group"
                      >
                        <div className="w-[18px] h-[18px] flex items-center justify-center rounded bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400">
                          <LayoutDashboard size={12} />
                        </div>
                        <span className="font-medium">Admin Panel</span>
                      </Link>
                    )}

                    {/* MESSAGES/CHAT LINK */}
                    <Link
                      to="/chat"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/30 hover:text-purple-600 dark:hover:text-purple-400 rounded-lg transition group"
                    >
                      <Mail size={18} />
                      <span className="font-medium">Messages</span>
                    </Link>
                  </div>
                  <div className="p-2 border-t border-gray-50 dark:border-gray-700">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition text-left group"
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
              <Link to="/login" className={`${textColorClass} font-medium transition-colors`}>Login</Link>
              <Link to="/signup" className="bg-blue-600 text-white px-6 py-2.5 rounded-full font-bold hover:bg-blue-700 dark:hover:bg-blue-600 transition shadow-lg shadow-blue-500/30">
                Get Started
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button className="md:hidden text-gray-600 dark:text-gray-300" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white dark:bg-slate-900 border-t dark:border-gray-800 p-4 absolute w-full shadow-xl">
          <div className="flex flex-col space-y-4">
            {/* Mobile Theme Toggle */}
            <div className="flex justify-between items-center px-2">
              <span className="text-gray-600 dark:text-gray-300 font-medium">Appearance</span>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 transition-all border border-gray-200 dark:border-gray-700"
              >
                {theme === 'light' ?
                  <div className="flex items-center gap-2 text-sm"><Moon size={16} /> Dark Mode</div> :
                  <div className="flex items-center gap-2 text-sm"><Sun size={16} /> Light Mode</div>
                }
              </button>
            </div>
            <div className="h-px bg-gray-100 dark:bg-gray-800 my-2"></div>

            <Link to="/" className="text-gray-600 dark:text-gray-300 font-medium" onClick={() => setIsOpen(false)}>Home</Link>
            <Link to="/about" className="text-gray-600 dark:text-gray-300 font-medium" onClick={() => setIsOpen(false)}>About</Link>
            <Link to="/contact" className="text-gray-600 dark:text-gray-300 font-medium" onClick={() => setIsOpen(false)}>Contact</Link>

            {user ? (
              <>
                <Link to="/dashboard" className="text-blue-600 dark:text-blue-400 font-bold flex items-center gap-2" onClick={() => setIsOpen(false)}>
                  <LayoutDashboard size={18} /> My Dashboard
                </Link>
                {user.role === 'admin' && (
                  <Link to="/admin" className="text-green-600 dark:text-green-400 font-bold flex items-center gap-2" onClick={() => setIsOpen(false)}>
                    <LayoutDashboard size={18} /> Admin Panel
                  </Link>
                )}
                <Link to="/chat" className="text-purple-600 dark:text-purple-400 font-bold flex items-center gap-2" onClick={() => setIsOpen(false)}>
                  <Mail size={18} /> Messages
                </Link>
                <button onClick={handleLogout} className="text-red-500 font-bold flex items-center gap-2 text-left">
                  <LogOut size={18} /> Logout
                </button>
              </>
            ) : (
              <>
                <div className="border-t dark:border-gray-800 pt-4 flex flex-col gap-3">
                  <Link to="/login" className="text-gray-600 dark:text-gray-300 text-center py-2 border dark:border-gray-700 rounded-lg" onClick={() => setIsOpen(false)}>Login</Link>
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