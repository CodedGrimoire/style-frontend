import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import LoginPage from './pages/LoginPage';

import { AuthProvider } from './context/AuthContext';

import ServiceDetailsPage from './pages/ServiceDetailsPage';

 import ContactPage from './pages/ContactPage';


import BookingPage from './pages/BookingPage';


import Navbar from './components/Navbar';

import DecoratorDashboardPage from './pages/DecoratorDashboardPage';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';


import UserDashboardPage from './pages/UserDashboardPage';


import Loading from './components/Loading';
import Error from './components/Error';
import AuthErrorBanner from './components/AuthErrorBanner';


import HomePage from './pages/HomePage';
import ServicesPage from './pages/ServicesPage';

import PaymentPage from './pages/PaymentPage';



import AdminDashboardPage from './pages/AdminDashboardPage';

import AboutPage from './pages/AboutPage';

import RegisterPage from './pages/RegisterPage';


import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div>
          <Toaster
            position="top-right"
            toastOptions={
              
              {
              duration: 3000,
              style: 
              {
                background: '#2b2a2aff',
                color: 'white',
              },
              success: 
              
              {
                duration: 3000,
                iconTheme:
                
                {
                  primary: '#4ade80',
                  secondary: 'white',
                },
              },
              error: {
                duration: 3000,

                iconTheme: 
                
                {
                  primary: '#ef4444',
                  secondary: 'white',
                },
              },

            }}
          />
          <Navbar />
          <div style={
            
            
            { paddingTop: '80px',
            
            minHeight: 'calc(100vh - 80px)' 
            
            
            }}>


            <AuthErrorBanner />
            <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/service/:id" element={<ServiceDetailsPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            <Route
              path="/booking"
              element={
                <ProtectedRoute>
                  <BookingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payment"
              element={
                <ProtectedRoute>
                  <PaymentPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute requiredRole="user">
                  <UserDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/decorator"
              element={
                <ProtectedRoute requiredRole="decorator">
                  <DecoratorDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Error message="404 - Page Not Found" />} />
            </Routes>
          </div>
          <Footer />

          
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
