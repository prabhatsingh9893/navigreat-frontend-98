import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import HomePage from './pages/HomePage.jsx';
import ContactPage from './pages/ContactPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import MentorsPage from './pages/MentorsPage.jsx';
import MentorSignupPage from './pages/MentorSignupPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import MentorProfile from './pages/MentorProfile.jsx'; // 👈 IMPORT THIS

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          
          {/* Mentor Related Routes */}
          <Route path="/mentors" element={<MentorsPage />} />
          <Route path="/become-mentor" element={<MentorSignupPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          
          {/* 👇 NEW ROUTE FOR PROFILE DETAILS */}
          <Route path="/mentor/:id" element={<MentorProfile />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;