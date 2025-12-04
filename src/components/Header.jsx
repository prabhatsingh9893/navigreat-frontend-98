import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null); // User state
  const navigate = useNavigate();

  // Check Login Status everytime Header loads
  useEffect(() => {
    const storedData = localStorage.getItem('userData');
    if (storedData) {
      setUser(JSON.parse(storedData)); // Data को सही से पढ़ो
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    setUser(null);
    alert("Logged out successfully!");
    navigate('/login');
    window.location.reload(); // Logout के बाद रिफ्रेश करो
  };

  return (
    <header className="fixed w-full bg-white z-50 shadow-sm top-0">
      <nav className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-bold text-gray-800">EduMentor<span className="text-blue-600">Connect</span></span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-600 hover:text-blue-600 font-medium">Home</Link>
            <Link to="/mentors" className="text-gray-600 hover:text-blue-600 font-medium">Mentors</Link>
            <Link to="/contact" className="text-gray-600 hover:text-blue-600 font-medium">Contact</Link>

            {/* 👇 Login Check Logic Updated 👇 */}
            {user ? (
              <div className="flex items-center gap-4">
                <Link to="/dashboard" className="text-blue-600 font-bold hover:underline">
                  Hi, {user.username}
                </Link>
                <button onClick={handleLogout} className="bg-red-500 text-white px-5 py-2 rounded-lg font-medium hover:bg-red-600 transition">
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex gap-4">
                <Link to="/login" className="text-gray-600 hover:text-blue-600 font-medium py-2">Login</Link>
                <Link to="/signup" className="bg-blue-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-blue-700 transition">Sign Up</Link>
              </div>
            )}
          </div>

          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600 focus:outline-none">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Header;