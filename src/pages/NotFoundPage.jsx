import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Home, Search } from 'lucide-react';
import { motion } from 'framer-motion';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080d14] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-200/30 dark:bg-indigo-900/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-200/30 dark:bg-violet-900/20 rounded-full blur-3xl" />

      <div className="relative z-10 text-center max-w-lg">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* 404 number */}
          <div className="relative mb-8">
            <h1 className="text-[160px] font-black leading-none text-slate-100 dark:text-slate-800 select-none">
              404
            </h1>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-2xl shadow-indigo-500/30">
                <Search size={44} className="text-white" />
              </div>
            </div>
          </div>

          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-4">
            Page Not Found
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed mb-10">
            {"Oops! The page you're looking for doesn't exist or has been moved."}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/" className="btn-primary px-8 py-4 rounded-2xl text-base">
              <Home size={18} /> Go Home
            </Link>
            <button onClick={() => window.history.back()} className="btn-secondary px-8 py-4 rounded-2xl text-base">
              <ArrowLeft size={18} /> Go Back
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFoundPage;
