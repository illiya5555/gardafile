import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
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
import ClientDashboard from './pages/ClientDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import LoginPage from './pages/LoginPage';
import ChatWidget from './components/ChatWidget';
import { CalendarProvider } from './context/CalendarContext';

function App() {
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check current auth status
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
        // Get user role
        const { data: profile } = await supabase
          .from('profiles')
          .select(`
            *,
            user_roles(role_name)
          `)
          .eq('id', user.id)
          .maybeSingle();
        
        setUserRole(profile?.user_roles?.role_name || null);
      }
      
      setLoading(false);
    };
    checkUser();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user || null);
        
        if (session?.user) {
          // Get user role
          const { data: profile } = await supabase
            .from('profiles')
            .select(`
              *,
              user_roles(role_name)
            `)
            .eq('id', session.user.id)
            .maybeSingle();
          
          setUserRole(profile?.user_roles?.role_name || null);
        } else {
          setUserRole(null);
        }
        
        if (event === 'SIGNED_OUT' || (event === 'TOKEN_REFRESHED' && !session)) {
          // Clear any stale session data
          await supabase.auth.signOut();
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Protected route component
  const ProtectedRoute = ({ children, allowedRoles = [] }: { children: React.ReactNode, allowedRoles?: string[] }) => {
    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    
    if (!user) return <Navigate to="/login" />;
    
    if (allowedRoles.length > 0 && !allowedRoles.includes(userRole || '')) {
      // Redirect based on role
      if (userRole === 'admin') return <Navigate to="/admin" />;
      if (userRole === 'manager') return <Navigate to="/manager" />;
      if (userRole === 'client') return <Navigate to="/dashboard" />;
      return <Navigate to="/" />;
    }
    
    return <>{children}</>;
  };

  return (
    <CalendarProvider>
      <Router>
        <div className="min-h-screen bg-white">
          <SEOHead />
          <Routes>
            {/* Admin route without header/footer */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Manager route without header/footer */}
            <Route 
              path="/manager" 
              element={
                <ProtectedRoute allowedRoles={['manager']}>
                  <ManagerDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Client Dashboard route with header/footer */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['client']}>
                  <>
                    <Header />
                    <ClientDashboard />
                    <Footer />
                  </>
                </ProtectedRoute>
              } 
            />
            
            {/* Login/Register route with header/footer */}
            <Route 
              path="/login" 
              element={
                <>
                  <Header />
                  <LoginPage />
                  <Footer />
                </>
              } 
            />
            
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
    </CalendarProvider>
  );
}

export default App;