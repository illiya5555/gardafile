import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import SEOHead from './components/SEOHead';
import HomePage from './pages/HomePage';
import ExperiencePage from './pages/ExperiencePage';
import BookingPage from './pages/BookingPage';
import ChatWidget from './components/ChatWidget';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white">
        <SEOHead />
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/experience" element={<ExperiencePage />} />
            <Route path="/booking" element={<BookingPage />} />
          </Routes>
        </main>
        <Footer />
        <ChatWidget />
      </div>
    </Router>
  );
}

export default App;