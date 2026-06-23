import React, { Suspense, useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast'; // 👉 1. IMPORT ADDED
import { AnimatePresence } from 'framer-motion';
import { getToken } from 'firebase/messaging';
import { messaging } from './firebaseConfig';
import { API_BASE_URL } from './config';

import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import Loader from './components/Loader';
import ScrollToTop from './components/ScrollToTop';
// ✅ LAZY LOAD ALL PAGES TO REDUCE BUNDLE SIZE
const HomePage = React.lazy(() => import('./pages/HomePage.jsx'));
const AboutPage = React.lazy(() => import('./pages/AboutPage.jsx'));
const ContactPage = React.lazy(() => import('./pages/ContactPage.jsx'));
const LoginPage = React.lazy(() => import('./pages/LoginPage.jsx'));
const SignupPage = React.lazy(() => import('./pages/SignupPage.jsx'));
const MentorsPage = React.lazy(() => import('./pages/MentorsPage.jsx'));
const MentorSignupPage = React.lazy(() => import('./pages/MentorSignupPage.jsx'));
const DashboardPage = React.lazy(() => import('./pages/DashboardPage.jsx'));
const MentorProfile = React.lazy(() => import('./pages/MentorProfile.jsx'));
const AdminMessagesPage = React.lazy(() => import('./pages/AdminMessagesPage.jsx'));
const AdminPage = React.lazy(() => import('./pages/AdminPage.jsx'));
const ChatPage = React.lazy(() => import('./pages/ChatPage.jsx'));
const ForgotPasswordPage = React.lazy(() => import('./pages/ForgotPasswordPage.jsx'));
const ResetPasswordPage = React.lazy(() => import('./pages/ResetPasswordPage.jsx'));
const AppPrivacy = React.lazy(() => import('./pages/AppPrivacy'));
const AppTerms = React.lazy(() => import('./pages/AppTerms'));
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage'));
const SessionEndedPage = React.lazy(() => import('./pages/SessionEndedPage'));
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

  // Auth pages render as a full-screen branded shell — hide the marketing chrome.
  const authRoutes = ['/login', '/signup', '/become-mentor', '/signup/mentor', '/forgot-password'];
  const isAuthRoute = authRoutes.includes(location.pathname) || location.pathname.startsWith('/reset-password');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const setupNotifications = async () => {
        try {
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY || undefined;
            const fcmToken = await getToken(messaging, { vapidKey });

            if (fcmToken) {
              await fetch(`${API_BASE_URL}/users/save-fcm-token`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ fcmToken })
              });
              console.log("FCM Token registered successfully!");
            }
          }
        } catch (error) {
          console.warn("FCM push registration skipped or failed:", error);
        }
      };

      const timer = setTimeout(setupNotifications, 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <div className="w-full max-w-full overflow-x-hidden min-h-screen flex flex-col">

      {/* 👉 2. TOASTER COMPONENT ADDED HERE */}
      <Toaster position="top-center" reverseOrder={false} />
      <ScrollToTop />


      {!isAuthRoute && <Header />}
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          <Suspense fallback={<div className="h-screen flex items-center justify-center"><Loader text="Loading..." /></div>}>
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
              <Route path="/signup/mentor" element={<MentorSignupPage />} />
              <Route path="/privacy" element={<AppPrivacy />} />
              <Route path="/terms" element={<AppTerms />} />

              {/* 🔒 Protected Routes (Require Login) */}
              <Route path="/mentors" element={<ProtectedRoute><MentorsPage /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
              <Route path="/mentor/:id" element={<ProtectedRoute><MentorProfile /></ProtectedRoute>} />
              <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
              <Route path="/chat/:userId" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} /> {/* ✅ Admin Panel Route */}
              <Route path="/admin/messages" element={<ProtectedRoute><AdminMessagesPage /></ProtectedRoute>} />

              {/* ✅ ZOOM LIVE SESSION ROUTE WITH SUSPENSE (Nested Suspense handled by generic wrapper now, but keeping for safety) */}
              <Route
                path="/session"
                element={
                  <ProtectedRoute>
                    <LiveSession />
                  </ProtectedRoute>
                }
              />
              <Route path="/session-ended" element={<ProtectedRoute><SessionEndedPage /></ProtectedRoute>} />

              {/* 404 PAGE */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </AnimatePresence>
      </main>
      {!isAuthRoute && <Footer />}
    </div >
  );
}

export default App;