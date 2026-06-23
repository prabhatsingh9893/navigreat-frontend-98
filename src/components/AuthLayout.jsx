import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Sun, Moon, Compass } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

/**
 * Shared branded shell for the auth pages (Login / Signup / Mentor signup).
 * Left: a branded Summit panel with real social proof (no stock photos).
 * Right: a centered form card passed in as `children`.
 */
const Wordmark = ({ className = '' }) => (
  <div className={`inline-flex items-center gap-2 font-extrabold tracking-tight ${className}`}>
    <span className="grid place-items-center w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 text-white shadow-lg shadow-teal-500/30">
      <Compass size={20} />
    </span>
    <span className="text-2xl">
      Navi<span className="text-teal-500 dark:text-teal-400">Great</span>
    </span>
  </div>
);

const AuthLayout = ({ eyebrow, title, highlight, subtitle, proof, children }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-[#080d14] relative overflow-hidden">

      {/* ============ LEFT — BRANDED PANEL (desktop) ============ */}
      <div className="hidden lg:flex w-[46%] xl:w-1/2 relative bg-mesh-hero overflow-hidden">
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)`,
            backgroundSize: '54px 54px',
          }}
        />
        {/* Floating orbs */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-teal-500/20 rounded-full blur-[120px]" />
        <div className="absolute -bottom-24 -right-16 w-96 h-96 bg-cyan-500/15 rounded-full blur-[120px]" />
        {/* Top + bottom subtle vignette */}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/40 to-transparent" />

        <div className="relative z-10 flex flex-col justify-between w-full p-12 xl:p-16 text-white">
          {/* Brand */}
          <Wordmark className="text-white" />

          {/* Headline block */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="max-w-md"
          >
            {eyebrow && (
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-teal-100 text-xs font-semibold tracking-wider uppercase mb-6">
                {eyebrow}
              </span>
            )}
            <h1 className="text-4xl xl:text-5xl font-extrabold leading-[1.1] tracking-tight mb-5">
              {title} {highlight && <span className="text-gradient-cyan">{highlight}</span>}
            </h1>
            <p className="text-base xl:text-lg text-slate-200/80 leading-relaxed">
              {subtitle}
            </p>
          </motion.div>

          {/* Proof slot */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
          >
            {proof}
          </motion.div>
        </div>
      </div>

      {/* ============ RIGHT — FORM ============ */}
      <div className="w-full lg:w-[54%] xl:w-1/2 flex items-center justify-center p-6 sm:p-10 relative">
        {/* Top controls */}
        <Link
          to="/"
          className="absolute top-7 left-7 inline-flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft size={18} /> Back to home
        </Link>
        <button
          type="button"
          aria-label="Toggle dark mode"
          onClick={toggleTheme}
          className="absolute top-7 right-7 grid place-items-center w-9 h-9 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="w-full max-w-[400px]"
        >
          {/* Mobile brand (panel hidden on small screens) */}
          <div className="lg:hidden mb-8 flex justify-center">
            <Wordmark className="text-slate-900 dark:text-white" />
          </div>

          {children}
        </motion.div>
      </div>
    </div>
  );
};

export default AuthLayout;
