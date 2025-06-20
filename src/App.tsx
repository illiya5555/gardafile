import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
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
import ChatWidget from './components/ChatWidget';
import LoginPage from './pages/LoginPage';
import SuccessPage from './pages/SuccessPage';
import ClientDashboard from './pages/ClientDashboard';
import { CalendarProvider } from './context/CalendarContext';
import { useLanguageContext } from './hooks/useLanguage';

// App wrapper to handle RTL/LTR based on language
const AppContent = () => {
  const { isRTL } = useLanguageContext();
  
  return (
    <Router>
      <div className={`min-h-screen bg-white ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
        <SEOHead />
        <Routes>
          {/* Admin route without header/footer */}
          <Route path="/admin" element={<AdminDashboard />} />
          
          {/* Auth routes without header/footer */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Dashboard route with header/footer */}
          <Route path="/dashboard" element={
            <>
              <Header />
              <ClientDashboard />
              <Footer />
              <ChatWidget />
            </>
          } />
          
          {/* Success page */}
          <Route path="/success" element={
            <>
              <Header />
              <SuccessPage />
              <Footer />
              <ChatWidget />
            </>
          } />
          
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
                  <Route path="/booking" element={
                    <CalendarProvider>
                      <BookingCalendarPage />
                    </CalendarProvider>
                  } />
                  <Route path="/book-now" element={
                    <CalendarProvider>
                      <BookingCalendarPage />
                    </CalendarProvider>
                  } />
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
};

function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

export default App;