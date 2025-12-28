import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast'; // 👉 1. IMPORT ADDED

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
import NotFoundPage from './pages/NotFoundPage'; // ✅ 404 Page

// ✅ LAZY LOAD LIVE SESSION TO PREVENT CSS POLLUTION
const LiveSession = React.lazy(() => import('./pages/LiveSession.jsx'));

function App() {
  return (
    <div className="w-full max-w-full overflow-x-hidden min-h-screen">

      {/* 👉 2. TOASTER COMPONENT ADDED HERE */}
      <Toaster position="top-center" reverseOrder={false} />
      <ScrollToTop />


      <Header />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

          {/* Mentor Related Routes */}
          <Route path="/mentors" element={<MentorsPage />} />
          <Route path="/become-mentor" element={<MentorSignupPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />

          {/* NEW ROUTE FOR PROFILE DETAILS */}
          <Route path="/mentor/:id" element={<MentorProfile />} />

          {/* ADMIN */}
          <Route path="/admin/messages" element={<AdminMessagesPage />} />


          {/* CHAT */}
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/chat/:userId" element={<ChatPage />} />

          {/* ✅ ZOOM LIVE SESSION ROUTE WITH SUSPENSE */}
          <Route
            path="/session"
            element={
              <Suspense fallback={<div className="h-screen flex items-center justify-center"><Loader text="Loading Session..." /></div>}>
                <LiveSession />
              </Suspense>
            }
          />

          {/* 404 PAGE */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
    </div >
  );
}

export default App;