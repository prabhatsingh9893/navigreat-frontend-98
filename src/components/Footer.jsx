import React from 'react';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

function Footer() {
  return (
    <footer id="footer" className="bg-gray-900 text-white pt-16 pb-8">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-bold mb-4">EduMentor<span className="text-blue-500">Connect</span></h3>
            <p className="text-gray-400">Bridging the gap between ambition and achievement through expert mentorship.</p>
          </div>
          {/* Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="/" className="hover:text-blue-400">Home</a></li>
              <li><a href="/#about" className="hover:text-blue-400">About Us</a></li>
              <li><a href="/#mentors" className="hover:text-blue-400">Find a Mentor</a></li>
            </ul>
          </div>
          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-gray-400">
              <li className="flex items-center gap-2"><Mail size={16}/> support@edumentor.com</li>
              <li className="flex items-center gap-2"><Phone size={16}/> +91 7974714605</li>
              <li className="flex items-center gap-2"><MapPin size={16}/> Bhopal, India</li>
            </ul>
          </div>
          {/* Social */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Follow Us</h4>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-blue-500"><Facebook /></a>
              <a href="#" className="hover:text-blue-500"><Twitter /></a>
              <a href="#" className="hover:text-blue-500"><Instagram /></a>
              <a href="#" className="hover:text-blue-500"><Linkedin /></a>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-8 text-center text-gray-500">
          <p>© 2025 EduMentor Connect. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;