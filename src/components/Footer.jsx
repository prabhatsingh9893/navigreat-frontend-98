import React from 'react';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, ArrowRight, Send, Sparkles, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const footerLinks = {
  platform: [
    { name: 'Find a Mentor', path: '/mentors' },
    { name: 'Become a Mentor', path: '/become-mentor' },
    { name: 'How It Works', path: '/#how-it-works' },
    { name: 'Pricing', path: '/mentors' },
  ],
  company: [
    { name: 'About Us', path: '/about' },
    { name: 'Contact', path: '/contact' },
    { name: 'Privacy Policy', path: '/privacy' },
    { name: 'Terms of Service', path: '/terms' },
  ],
};

const socialLinks = [
  { Icon: Twitter, href: '#', label: 'Twitter', color: 'hover:bg-sky-500' },
  { Icon: Linkedin, href: 'https://www.linkedin.com/company/navigreat-the-path-finder/?viewAsMember=true', label: 'LinkedIn', color: 'hover:bg-blue-600' },
  { Icon: Instagram, href: '#', label: 'Instagram', color: 'hover:bg-pink-500' },
  { Icon: Facebook, href: '#', label: 'Facebook', color: 'hover:bg-blue-700' },
];

const Footer = () => {
  return (
    <footer className="relative bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 overflow-hidden border-t border-slate-200 dark:border-transparent">

      {/* Top gradient line */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-teal-500 to-transparent opacity-40 dark:opacity-30" />

      {/* Background orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 dark:bg-teal-600/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/10 dark:bg-cyan-600/10 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />
      </div>

      {/* ====== CTA BANNER ====== */}
      <div className="relative z-10 container mx-auto px-6 pt-20 pb-8">
        <div className="relative overflow-hidden rounded-3xl p-8 md:p-12 mb-20 border border-white/10"
          style={{ background: 'linear-gradient(135deg, #0d9488 0%, #0891b2 55%, #0ea5e9 100%)' }}
        >
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <div className="flex items-center gap-2 text-teal-50 font-semibold text-sm mb-3">
                <Sparkles size={14} className="text-amber-300" />
                Share Your Experience
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-2">Your Feedback Matters</h2>
              <p className="text-teal-50/90 max-w-md">Help us build a better NaviGreat. Share your thoughts and experience with the community.</p>
            </div>
            <Link
              to="/contact"
              className="flex-shrink-0 flex items-center gap-2 bg-white text-teal-700 px-7 py-4 rounded-2xl font-bold hover:bg-teal-50 transition-all hover:-translate-y-1 shadow-xl shadow-black/20 group whitespace-nowrap"
            >
              Give Feedback <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* ====== MAIN FOOTER GRID ====== */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

          {/* Brand */}
          <div className="lg:col-span-1">
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-4">
              Navi<span className="text-teal-600 dark:text-teal-400">Great</span>
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6">
              Bridging the gap between ambition and achievement. We connect aspiring engineers with verified mentors from IITs, NITs & Top Universities.
            </p>
            <div className="flex gap-3">
              {socialLinks.map(({ Icon, href, label, color }, i) => (
                <motion.a
                  key={i}
                  href={href}
                  target={href !== '#' ? '_blank' : undefined}
                  rel={href !== '#' ? 'noopener noreferrer' : undefined}
                  aria-label={label}
                  whileHover={{ y: -3 }}
                  className={`w-10 h-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-white ${color} transition-all duration-200 border border-slate-200 dark:border-slate-700/50 shadow-sm dark:shadow-none`}
                >
                  <Icon size={17} />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="text-slate-900 dark:text-white font-bold text-sm uppercase tracking-wider mb-6 flex items-center gap-2">
              <span className="w-6 h-0.5 bg-teal-500 rounded-full" />
              Platform
            </h4>
            <ul className="space-y-3">
              {footerLinks.platform.map((link, i) => (
                <li key={i}>
                  <Link
                    to={link.path}
                    className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-sm font-medium transition-all duration-200 flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-teal-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-slate-900 dark:text-white font-bold text-sm uppercase tracking-wider mb-6 flex items-center gap-2">
              <span className="w-6 h-0.5 bg-cyan-500 rounded-full" />
              Company
            </h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link, i) => (
                <li key={i}>
                  <Link
                    to={link.path}
                    className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-sm font-medium transition-all duration-200 flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div>
            <h4 className="text-slate-900 dark:text-white font-bold text-sm uppercase tracking-wider mb-6 flex items-center gap-2">
              <span className="w-6 h-0.5 bg-emerald-500 rounded-full" />
              Get In Touch
            </h4>
            <ul className="space-y-4 mb-8">
              {[
                { Icon: MapPin, text: 'MANIT Bhopal, Madhya Pradesh, India' },
                { Icon: Phone, text: '+91 7974714605', href: 'tel:+917974714605' },
                { Icon: Mail, text: 'support@navigreat.com', href: 'mailto:support@navigreat.com' },
              ].map(({ Icon, text, href }, i) => (
                <li key={i}>
                  {href ? (
                    <a href={href} className="flex items-start gap-3 group hover:text-slate-900 dark:hover:text-white transition-colors">
                      <div className="mt-0.5 p-1.5 rounded-lg bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 group-hover:bg-teal-600 group-hover:text-white transition-all flex-shrink-0 border border-slate-200 dark:border-transparent">
                        <Icon size={14} />
                      </div>
                      <span className="text-sm leading-relaxed">{text}</span>
                    </a>
                  ) : (
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 p-1.5 rounded-lg bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 flex-shrink-0 border border-slate-200 dark:border-transparent">
                        <Icon size={14} />
                      </div>
                      <span className="text-sm leading-relaxed">{text}</span>
                    </div>
                  )}
                </li>
              ))}
            </ul>

            {/* Newsletter */}
            <p className="text-xs text-slate-500 dark:text-slate-500 mb-3 font-medium uppercase tracking-wider">Newsletter</p>
            <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 min-w-0 bg-white dark:bg-slate-800/70 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm pl-4 pr-3 py-2.5 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
              <button
                type="button"
                className="flex-shrink-0 p-2.5 rounded-xl bg-teal-600 text-white hover:bg-teal-700 transition-all shadow-lg"
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-200 dark:border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-sm flex items-center gap-1.5">
            © {new Date().getFullYear()} <span className="text-slate-700 dark:text-slate-300 font-bold">NaviGreat</span>. Made with
            <Heart size={13} className="text-rose-500 fill-rose-500 mx-0.5" /> in India.
          </p>
          <div className="flex items-center gap-6 text-sm text-slate-500">
            <Link to="/privacy" className="hover:text-slate-900 dark:hover:text-white transition-colors">Privacy Policy</Link>
            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
            <Link to="/terms" className="hover:text-slate-900 dark:hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
