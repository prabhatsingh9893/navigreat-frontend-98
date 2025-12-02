import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import HomePage from './pages/HomePage.jsx';
import ContactPage from './pages/ContactPage.jsx';
import LoginPage from './pages/LoginPage.jsx';   // <--- New
import SignupPage from './pages/SignupPage.jsx'; // <--- New

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/login" element={<LoginPage />} />   {/* <--- New */}
          <Route path="/signup" element={<SignupPage />} /> {/* <--- New */}
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;