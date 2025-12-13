import React from 'react';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, ArrowRight, Send } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    // ✅ FIX 1: 'mt-32' joda (taki upar space bane) aur 'overflow-hidden' hataya (taki banner kate nahi)
    <footer className="relative bg-slate-900 text-slate-300 pt-32 mt-32">
      
      {/* 🚀 CTA BANNER (Floating Box) */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-11/12 max-w-6xl z-20">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 md:p-12 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 text-white relative overflow-hidden">
            
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            
            <div className="relative z-10 text-center md:text-left">
                <h2 className="text-3xl font-extrabold mb-2">Ready to Launch Your Career?</h2>
                <p className="text-blue-100 text-lg">Join 500+ students and get guided by the best mentors today.</p>
            </div>
            <Link to="/mentors" className="relative z-10 bg-white text-blue-700 px-8 py-3.5 rounded-full font-bold hover:bg-blue-50 transition shadow-lg flex items-center gap-2 group">
                Find a Mentor <ArrowRight size={18} className="group-hover:translate-x-1 transition" />
            </Link>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container mx-auto px-6 pt-12 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-white flex items-center gap-2">
              🚀 EduMentor<span className="text-blue-500">Connect</span>
            </h3>
            <p className="text-slate-400 leading-relaxed text-sm">
              Bridging the gap between ambition and achievement. We connect aspiring engineers with verified mentors from IITs & NITs.
            </p>
            <div className="flex gap-4 pt-2">
              {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                <a key={i} href="#" className="bg-slate-800 p-2 rounded-lg hover:bg-blue-600 hover:text-white transition duration-300">
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold text-lg mb-6">Quick Links</h4>
            <ul className="space-y-3">
              {['Home', 'About Us', 'Find a Mentor', 'Become a Mentor'].map((link, i) => (
                <li key={i}>
                  <Link to="/" className="text-slate-400 hover:text-blue-400 transition flex items-center gap-2 text-sm group">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition"></span>
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white font-bold text-lg mb-6">Contact Us</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-blue-500 shrink-0 mt-1" />
                <span>Maulana Azad National Institute of Technology, Bhopal, India</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-blue-500 shrink-0" />
                <span>+91 7974714605</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-blue-500 shrink-0" />
                <span>support@edumentor.com</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-white font-bold text-lg mb-6">Stay Updated</h4>
            <p className="text-slate-400 text-xs mb-4">Subscribe to get latest placement tips & news.</p>
            <form className="relative">
                <input 
                  type="email" 
                  placeholder="Your email address" 
                  className="w-full bg-slate-800 border border-slate-700 text-white pl-4 pr-12 py-3 rounded-xl focus:outline-none focus:border-blue-500 text-sm"
                />
                <button type="button" className="absolute right-2 top-2 bg-blue-600 p-1.5 rounded-lg text-white hover:bg-blue-700 transition">
                  <Send size={16} />
                </button>
            </form>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
            <p>© 2025 EduMentor Connect. All rights reserved.</p>
            <div className="flex gap-6">
                <a href="#" className="hover:text-white transition">Privacy Policy</a>
                <a href="#" className="hover:text-white transition">Terms of Service</a>
                <a href="#" className="hover:text-white transition">Cookies Settings</a>
            </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;