import React, { Suspense } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast'; // 👉 1. IMPORT ADDED
import { AnimatePresence } from 'framer-motion';

import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import HomePage from './pages/HomePage.jsx';
import AboutPage from './pages/AboutPage.jsx';
import ContactPage from './pages/ContactPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import MentorsPage from './pages/MentorsPage.jsx';
import MentorSignupPage from './pages/MentorSignupPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import MentorProfile from './pages/MentorProfile.jsx';
import AdminMessagesPage from './pages/AdminMessagesPage.jsx';
import ChatPage from './pages/ChatPage.jsx';
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx';
import ResetPasswordPage from './pages/ResetPasswordPage.jsx';
import Loader from './components/Loader';
import ScrollToTop from './components/ScrollToTop'; // ✅ Scroll Fix
import AppPrivacy from './pages/AppPrivacy';
import AppTerms from './pages/AppTerms';
import NotFoundPage from './pages/NotFoundPage'; // ✅ 404 Page
import SessionEndedPage from './pages/SessionEndedPage'; // ✅ Auto Rejoin Page

// ✅ LAZY LOAD LIVE SESSION TO PREVENT CSS POLLUTION
const LiveSession = React.lazy(() => import('./pages/LiveSession.jsx'));

// 🔒 Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  const location = useLocation();

  return (
    <div className="w-full max-w-full overflow-x-hidden min-h-screen flex flex-col">

      {/* 👉 2. TOASTER COMPONENT ADDED HERE */}
      <Toaster position="top-center" reverseOrder={false} />
      <ScrollToTop />


      <Header />
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
            <Route path="/become-mentor" element={<MentorSignupPage />} />
            <Route path="/privacy" element={<AppPrivacy />} />
            <Route path="/terms" element={<AppTerms />} />

            {/* 🔒 Protected Routes (Require Login) */}
            <Route path="/mentors" element={<ProtectedRoute><MentorsPage /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/mentor/:id" element={<ProtectedRoute><MentorProfile /></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
            <Route path="/chat/:userId" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
            <Route path="/admin/messages" element={<ProtectedRoute><AdminMessagesPage /></ProtectedRoute>} />

            {/* ✅ ZOOM LIVE SESSION ROUTE WITH SUSPENSE & PROTECTION */}
            <Route
              path="/session"
              element={
                <ProtectedRoute>
                  <Suspense fallback={<div className="h-screen flex items-center justify-center"><Loader text="Loading Session..." /></div>}>
                    <LiveSession />
                  </Suspense>
                </ProtectedRoute>
              }
            />
            <Route path="/session-ended" element={<ProtectedRoute><SessionEndedPage /></ProtectedRoute>} />

            {/* 404 PAGE */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AnimatePresence>
      </main>
      <Footer />
    </div >
  );
}

export default App;