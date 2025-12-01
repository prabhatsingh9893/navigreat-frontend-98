import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

function Header() {
  const [isOpen, setIsOpen] = useState(false);

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
            <a href="/#mentors" className="text-gray-600 hover:text-blue-600 font-medium">Mentors</a>
            <a href="/#faq" className="text-gray-600 hover:text-blue-600 font-medium">FAQ</a>
            
            {/* Contact Page Link */}
            <Link to="/contact" className="bg-blue-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-blue-700 transition">
              Contact
            </Link>
          </div>

          {/* Mobile Menu Button (Hamburger) */}
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
            <a href="/#about" className="block text-gray-600 hover:text-blue-600" onClick={() => setIsOpen(false)}>About Us</a>
            <a href="/#mentors" className="block text-gray-600 hover:text-blue-600" onClick={() => setIsOpen(false)}>Mentors</a>
            <Link to="/contact" className="block w-full text-center bg-blue-600 text-white py-2 rounded-lg" onClick={() => setIsOpen(false)}>
              Contact
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}

export default Header;