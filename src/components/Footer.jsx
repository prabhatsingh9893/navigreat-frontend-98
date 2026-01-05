import React from 'react';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, ArrowRight, Send } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="relative bg-slate-900 text-slate-300 pt-32 mt-32">

      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-blue-600/20 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-purple-600/20 rounded-full blur-3xl opacity-20"></div>
      </div>

      {/* 🚀 CTA BANNER (Floating Box) */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-11/12 max-w-6xl z-20">
        <div className="bg-gradient-to-r from-blue-700 to-purple-700 rounded-3xl p-8 md:p-12 shadow-2xl shadow-blue-900/40 flex flex-col md:flex-row items-center justify-between gap-8 text-white relative overflow-hidden ring-1 ring-white/10">

          {/* Background Pattern */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

          <div className="relative z-10 text-center md:text-left max-w-lg">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4 leading-tight">Your Feedback Matters!</h2>
            <p className="text-blue-100 text-lg font-medium">Help us improve NaviGreat. Share your thoughts and experience with us.</p>
          </div>

          <Link
            to="/contact"
            className="relative z-10 bg-white text-blue-700 px-8 py-4 rounded-full font-bold hover:bg-blue-50 transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1 flex items-center gap-2 group whitespace-nowrap text-lg"
          >
            Give Feedback <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container mx-auto px-6 pt-16 pb-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

          {/* Brand Info */}
          <div className="space-y-6">
            <h3 className="text-3xl font-extrabold text-white flex items-center gap-2">
              Navi<span className="text-blue-500">Great</span>
            </h3>
            <p className="text-slate-400 leading-relaxed">
              Bridging the gap between ambition and achievement. We connect aspiring engineers with verified mentors from IITs, NITs & Top Universities.
            </p>
            <div className="flex gap-4 pt-2">
              {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                <a key={i} href="#" className="bg-slate-800 p-3 rounded-xl hover:bg-blue-600 hover:text-white hover:-translate-y-1 transition-all duration-300 ring-1 ring-white/5">
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
              <span className="w-8 h-1 bg-blue-500 rounded-full"></span> Quick Links
            </h4>
            <ul className="space-y-4">
              {[
                { name: 'Home', path: '/' },
                { name: 'About Us', path: '/about' },
                { name: 'Find a Mentor', path: '/mentors' },
                { name: 'Become a Mentor', path: '/signup' }
              ].map((link, i) => (
                <li key={i}>
                  <Link to={link.path} className="text-slate-400 hover:text-white hover:translate-x-1 transition-all duration-200 flex items-center gap-2 font-medium">
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
              <span className="w-8 h-1 bg-purple-500 rounded-full"></span> Contact Us
            </h4>
            <ul className="space-y-5">
              <li className="flex items-start gap-4 group">
                <div className="bg-slate-800 p-2.5 rounded-lg text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <MapPin size={20} className="shrink-0" />
                </div>
                <span className="text-slate-400 text-sm leading-relaxed">Maulana Azad National Institute of Technology, Bhopal, India</span>
              </li>
              <li className="flex items-center gap-4 group">
                <div className="bg-slate-800 p-2.5 rounded-lg text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Phone size={20} className="shrink-0" />
                </div>
                <span className="text-slate-400">+91 7974714605</span>
              </li>
              <li className="flex items-center gap-4 group">
                <div className="bg-slate-800 p-2.5 rounded-lg text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Mail size={20} className="shrink-0" />
                </div>
                <span className="text-slate-400">support@navigreat.com</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-white font-bold text-lg mb-6">Stay Updated</h4>
            <p className="text-slate-400 text-sm mb-4 leading-relaxed">Subscribe to our newsletter to get the latest placement tips, news, and mentor updates.</p>
            <form className="relative group">
              <input
                type="email"
                placeholder="Your email address"
                className="w-full bg-slate-800/50 border border-slate-700 text-white pl-5 pr-12 py-4 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-500"
              />
              <button type="button" className="absolute right-2 top-2 bottom-2 bg-blue-600 px-3 rounded-lg text-white hover:bg-blue-700 transition shadow-lg flex items-center justify-center">
                <Send size={18} />
              </button>
            </form>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
          <p className="flex items-center gap-1">© 2025 <span className="text-slate-300 font-bold">NaviGreat</span>. All rights reserved.</p>
          <div className="flex gap-8">
            <Link to="/privacy" className="hover:text-white transition relative hover:underline decoration-blue-500 decoration-2 underline-offset-4">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white transition relative hover:underline decoration-blue-500 decoration-2 underline-offset-4">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;