import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Menu, X, LogOut, LayoutDashboard, ChevronDown,
  Mail, Sun, Moon, GraduationCap, MessageSquare, Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Avatar from '../components/Avatar';
import logo from '../assets/startup-logo.png';
import { signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { useTheme } from '../context/ThemeContext';

/* ─── Nav Links ─── */
const NAV_LINKS = [
  { to: '/',        label: 'Home'         },
  { to: '/mentors', label: 'Find Mentors' },
  { to: '/about',   label: 'About'        },
  { to: '/contact', label: 'Contact'      },
];

/* ─── Logo with image ─── */
const Logo = () => {
  return (
    <Link to="/" className="flex items-center group select-none">
      <img
        src={logo}
        alt="NaviGreat"
        className="h-12 w-auto object-contain pointer-events-none transition-all duration-300"
      />
    </Link>
  );
};

/* ─── Active underline indicator ─── */
const ActiveDot = () => (
  <motion.span
    layoutId="nav-underline"
    className="absolute -bottom-px left-3 right-3 h-0.5 rounded-full"
    style={{ background: 'linear-gradient(90deg, #4f46e5, #7c3aed)' }}
    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
  />
);

/* ══════════════════════════════════════════
   HEADER COMPONENT
   ══════════════════════════════════════════ */
const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [user, setUser]   = useState(null);
  const [scrolled, setScrolled] = useState(false);

  const { theme, toggleTheme } = useTheme();
  const navigate  = useNavigate();
  const location  = useLocation();
  const dropRef   = useRef(null);

  /* scroll detection */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* user sync */
  useEffect(() => {
    const sync = () => {
      const raw = localStorage.getItem('userData');
      setUser(raw ? JSON.parse(raw) : null);
    };
    sync();
    window.addEventListener('userUpdated', sync);
    return () => window.removeEventListener('userUpdated', sync);
  }, [location]);

  /* close dropdown on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropdownOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* lock body scroll when mobile menu open */
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  /* close mobile on route change */
  useEffect(() => { setMobileOpen(false); }, [location]);

  const handleLogout = async () => {
    try { await signOut(auth); } catch {}
    localStorage.removeItem('userData');
    localStorage.removeItem('token');
    setUser(null);
    setDropdownOpen(false);
    navigate('/login');
  };

  const isHome   = location.pathname === '/';
  const isTransparent = isHome && !scrolled;

  /* ── header background ── */
  const navBg = isTransparent
    ? 'bg-transparent'
    : 'bg-white/90 dark:bg-[#0d1117]/90 backdrop-blur-xl border-b border-slate-200/60 dark:border-white/[0.06]';

  /* ── link text colour ── */
  const linkColor = isTransparent
    ? 'text-slate-700 dark:text-white/80 hover:text-indigo-600 dark:hover:text-white'
    : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white';

  const activeLinkColor = isTransparent
    ? 'text-indigo-600 dark:text-white font-semibold'
    : 'text-indigo-600 dark:text-white font-semibold';

  return (
    <>
      {/* ════════════ DESKTOP HEADER ════════════ */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navBg}`}
        style={{ boxShadow: scrolled ? '0 1px 0 rgba(0,0,0,0.06)' : 'none' }}
      >
        <div className="max-w-7xl mx-auto px-5 md:px-8 h-[64px] flex items-center justify-between gap-8">

          {/* LEFT – Logo */}
          <Logo />

          {/* CENTER – Nav links (desktop) */}
          <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {NAV_LINKS.map(({ to, label }) => {
              const active = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  className={`relative px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-150 ${
                    active ? activeLinkColor : linkColor
                  }`}
                >
                  {label}
                  {active && <ActiveDot />}
                </Link>
              );
            })}
          </nav>

          {/* RIGHT – Actions */}
          <div className="hidden md:flex items-center gap-1.5">

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-all ${
                isTransparent
                  ? 'text-slate-500 dark:text-white/70 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10'
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06]'
              }`}
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            {/* Separator */}
            <div className={`w-px h-5 mx-1 ${isTransparent ? 'bg-slate-200/80 dark:bg-white/20' : 'bg-slate-200 dark:bg-white/[0.08]'}`} />

            {user ? (
              /* ── User dropdown ── */
              <div className="relative" ref={dropRef}>
                <button
                  onClick={() => setDropdownOpen(v => !v)}
                  className={`flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all ${
                    isTransparent
                      ? 'hover:bg-slate-100 dark:hover:bg-white/10'
                      : 'hover:bg-slate-100 dark:hover:bg-white/[0.06]'
                  }`}
                >
                  {/* Avatar */}
                  <div className="w-7 h-7 rounded-full overflow-hidden ring-2 ring-indigo-500/40 flex-shrink-0">
                    <Avatar src={user.image} name={user.username} size="w-full h-full" className="text-[10px]" />
                  </div>
                  {/* Name + role */}
                  <div className="text-left hidden lg:block">
                    <p className={`text-[13px] font-semibold leading-tight ${isTransparent ? 'text-slate-800 dark:text-white' : 'text-slate-800 dark:text-slate-100'}`}>
                      {user.username?.split(' ')[0]}
                    </p>
                    <p className={`text-[11px] capitalize ${isTransparent ? 'text-slate-500 dark:text-white/60' : 'text-slate-400 dark:text-slate-500'}`}>
                      {user.role}
                    </p>
                  </div>
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 flex-shrink-0 ${dropdownOpen ? 'rotate-180' : ''} ${
                      isTransparent ? 'text-slate-500 dark:text-white/50' : 'text-slate-400'
                    }`}
                  />
                </button>

                {/* Dropdown */}
                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0,  scale: 1    }}
                      exit   ={{ opacity: 0, y: 6, scale: 0.97 }}
                      transition={{ duration: 0.12, ease: 'easeOut' }}
                      className="absolute right-0 top-full mt-2 w-56 origin-top-right"
                    >
                      <div className="bg-white dark:bg-[#161b22] rounded-xl shadow-xl shadow-black/10 dark:shadow-black/50 border border-slate-200/60 dark:border-white/[0.08] overflow-hidden">
                        {/* User info */}
                        <div className="px-4 py-3 border-b border-slate-100 dark:border-white/[0.06]">
                          <p className="text-[13px] font-semibold text-slate-900 dark:text-white truncate">{user.username}</p>
                          <p className="text-xs text-slate-400 dark:text-slate-500 truncate mt-0.5">{user.email}</p>
                        </div>

                        {/* Menu */}
                        <div className="p-1">
                          <DropItem to="/dashboard" icon={<LayoutDashboard size={15}/>} onClick={() => setDropdownOpen(false)}>
                            Dashboard
                          </DropItem>
                          <DropItem to="/chat" icon={<MessageSquare size={15}/>} onClick={() => setDropdownOpen(false)}>
                            Messages
                          </DropItem>
                          {user.role === 'admin' && (
                            <DropItem to="/admin" icon={<Shield size={15}/>} onClick={() => setDropdownOpen(false)}>
                              Admin Panel
                            </DropItem>
                          )}
                        </div>

                        {/* Logout */}
                        <div className="p-1 border-t border-slate-100 dark:border-white/[0.06]">
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                          >
                            <LogOut size={15} /> Sign out
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              /* ── Auth buttons ── */
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className={`px-3.5 py-1.5 text-sm font-medium rounded-lg transition-all ${
                    isTransparent
                      ? 'text-slate-700 dark:text-white/80 hover:text-indigo-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10'
                      : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06]'
                  }`}
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-1.5 text-sm font-semibold text-white rounded-lg transition-all hover:opacity-90 hover:shadow-lg hover:shadow-indigo-500/20 active:scale-[0.98]"
                  style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' }}
                >
                  Get started
                </Link>
              </div>
            )}
          </div>

          {/* RIGHT – Hamburger (mobile) */}
          <button
            onClick={() => setMobileOpen(v => !v)}
            className={`md:hidden p-2 rounded-lg transition-colors ${
              isTransparent
                ? 'text-slate-600 dark:text-white/80 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.06]'
            }`}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {/* ════════════ MOBILE DRAWER ════════════ */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
              onClick={() => setMobileOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              key="drawer"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 350, damping: 35 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-[280px] bg-white dark:bg-[#0d1117] shadow-2xl flex flex-col md:hidden"
            >
              {/* Drawer top */}
              <div className="h-14 flex items-center justify-between px-5 border-b border-slate-100 dark:border-white/[0.06]">
                <Logo />
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">

                {/* User card */}
                {user && (
                  <div className="flex items-center gap-3 px-3 py-3 mb-3 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-100 dark:border-white/[0.06]">
                    <div className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-indigo-500/30 flex-shrink-0">
                      <Avatar src={user.image} name={user.username} size="w-full h-full" className="text-xs" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{user.username}</p>
                      <p className="text-xs text-indigo-500 capitalize">{user.role}</p>
                    </div>
                  </div>
                )}

                {/* Nav links */}
                {NAV_LINKS.map(({ to, label }) => {
                  const active = location.pathname === to;
                  return (
                    <Link
                      key={to}
                      to={to}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        active
                          ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.04] hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {active && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />}
                      {label}
                    </Link>
                  );
                })}

                {/* Divider */}
                <div className="h-px bg-slate-100 dark:bg-white/[0.06] my-3" />

                {user ? (
                  <>
                    <MobileItem to="/dashboard" icon={<LayoutDashboard size={16}/>} onClick={() => setMobileOpen(false)}>
                      Dashboard
                    </MobileItem>
                    <MobileItem to="/chat" icon={<MessageSquare size={16}/>} onClick={() => setMobileOpen(false)}>
                      Messages
                    </MobileItem>
                    {user.role === 'admin' && (
                      <MobileItem to="/admin" icon={<Shield size={16}/>} onClick={() => setMobileOpen(false)}>
                        Admin Panel
                      </MobileItem>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors mt-1"
                    >
                      <LogOut size={16} /> Sign out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setMobileOpen(false)}
                      className="block w-full text-center py-2.5 px-4 text-sm font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/[0.1] rounded-xl hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors"
                    >
                      Log in
                    </Link>
                    <Link
                      to="/signup"
                      onClick={() => setMobileOpen(false)}
                      className="block w-full text-center py-2.5 px-4 text-sm font-semibold text-white rounded-xl transition-all hover:opacity-90 mt-2"
                      style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
                    >
                      Get started free
                    </Link>
                  </>
                )}
              </div>

              {/* Footer: theme toggle */}
              <div className="px-4 py-4 border-t border-slate-100 dark:border-white/[0.06]">
                <button
                  onClick={toggleTheme}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.08] transition-colors"
                >
                  <span>Appearance</span>
                  <div className="flex items-center gap-2 text-slate-400">
                    {theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
                    <span className="text-xs">{theme === 'light' ? 'Dark mode' : 'Light mode'}</span>
                  </div>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

/* ─── Helpers ─── */
const DropItem = ({ to, icon, onClick, children }) => (
  <Link
    to={to}
    onClick={onClick}
    className="flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/[0.04] rounded-lg transition-colors"
  >
    <span className="text-slate-400 dark:text-slate-500">{icon}</span>
    {children}
  </Link>
);

const MobileItem = ({ to, icon, onClick, children }) => (
  <Link
    to={to}
    onClick={onClick}
    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.04] hover:text-slate-900 dark:hover:text-white transition-colors"
  >
    <span className="text-slate-400 dark:text-slate-500">{icon}</span>
    {children}
  </Link>
);

export default Header;