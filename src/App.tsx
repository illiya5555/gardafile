import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import SEOHead from './components/SEOHead';
import HomePage from './pages/HomePage';
import EventsPage from './pages/EventsPage';
import ServicesPage from './pages/ServicesPage';
import ContactPage from './pages/ContactPage';
import BookingCalendarPage from './pages/BookingCalendarPage';
import CorporateSailingPage from './pages/CorporateSailingPage';
import GiftCertificatesPage from './pages/GiftCertificatesPage';
import AdminDashboard from './pages/AdminDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import ClientDashboard from './pages/ClientDashboard';
import ChatWidget from './components/ChatWidget';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white">
        <SEOHead />
        <Routes>
          {/* Admin route without header/footer */}
          <Route path="/admin" element={<AdminDashboard />} />
          
          {/* Manager Dashboard route without header/footer */}
          <Route path="/manager-dashboard" element={<ManagerDashboard />} />
          
          {/* Client Dashboard route without header/footer */}
          <Route path="/client-dashboard" element={<ClientDashboard />} />
          
          {/* Regular routes with header/footer */}
          <Route path="/*" element={
            <>
              <Header />
              <main className="pt-20">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/events" element={<EventsPage />} />
                  <Route path="/services" element={<ServicesPage />} />
                  <Route path="/corporate-sailing" element={<CorporateSailingPage />} />
                  <Route path="/gift-certificates" element={<GiftCertificatesPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/booking" element={<BookingCalendarPage />} />
                  <Route path="/book-now" element={<BookingCalendarPage />} />
                </Routes>
              </main>
              <Footer />
              <ChatWidget />
            </>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;