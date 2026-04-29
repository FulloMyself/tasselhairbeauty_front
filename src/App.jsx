import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { UserProvider } from './context/UserContext';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';
import Unauthorized from './pages/Unauthorized';
import RoleBasedDashboard from './pages/RoleBasedDashboard';

import CustomerDashboard from './pages/customer/CustomerDashboard';
import StaffDashboard from './pages/staff/StaffDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import ShopPage from './pages/ShopPage';
import ServicePage from './pages/customer/ServicePage';
import BookingPage from './pages/BookingPage';

// Components
import ProtectedRoute from './components/auth/ProtectedRoute';

// Styles - Import in correct order
import './styles/variables.css';
import './styles/global.css';
import './styles/components.css';
import './styles/auth.css';
import './styles/responsive.css';
import './styles/admin.css';
import './styles/dashboard.css';

function App() {
  // Future flags for React Router v7 compatibility
  const routerFuture = {
    v7_startTransition: true,
    v7_relativeSplatPath: true
  };
  const navigate = useNavigate();

  // Handle GitHub Pages SPA redirect from 404.html
  useEffect(() => {
    const redirect = sessionStorage.getItem('redirect');
    if (redirect) {
      sessionStorage.removeItem('redirect');
      navigate(redirect);
    }
  }, [navigate]);

  return (
    <Router future={routerFuture} basename="/tasselhairbeauty_front">
      <AuthProvider>
        <CartProvider>
          <UserProvider>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/unauthorized" element={<Unauthorized />} />

              {/* Protected Routes - Dashboard entry point that selects the right role dashboard */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <RoleBasedDashboard />
                </ProtectedRoute>
              } />

              {/* Customer Dashboard Routes */}
              <Route path="/customer/dashboard" element={
                <ProtectedRoute requiredRole="customer">
                  <CustomerDashboard />
                </ProtectedRoute>
              } />

              <Route path="/dashboard/book" element={
                <ProtectedRoute requiredRole="customer">
                  <ServicePage />
                </ProtectedRoute>
              } />

              <Route path="/dashboard/shop" element={
                <ProtectedRoute requiredRole="customer">
                  <ShopPage />
                </ProtectedRoute>
              } />

              <Route path="/dashboard/profile" element={
                <ProtectedRoute requiredRole="customer">
                  <CustomerDashboard />
                </ProtectedRoute>
              } />

              <Route path="/dashboard/history" element={
                <ProtectedRoute requiredRole="customer">
                  <CustomerDashboard />
                </ProtectedRoute>
              } />

              <Route path="/bookings" element={
                <ProtectedRoute requiredRole="customer">
                  <CustomerDashboard />
                </ProtectedRoute>
              } />

              <Route path="/orders" element={
                <ProtectedRoute requiredRole="customer">
                  <CustomerDashboard />
                </ProtectedRoute>
              } />

              <Route path="/shop" element={
                <ProtectedRoute requiredRole="customer">
                  <ShopPage />
                </ProtectedRoute>
              } />

              <Route path="/services" element={
                <ProtectedRoute requiredRole="customer">
                  <ServicePage />
                </ProtectedRoute>
              } />

              <Route path="/booking" element={
                <ProtectedRoute requiredRole="customer">
                  <BookingPage />
                </ProtectedRoute>
              } />

              {/* Staff Dashboard Routes */}
              <Route path="/staff/dashboard" element={
                <ProtectedRoute requiredRole="staff">
                  <StaffDashboard />
                </ProtectedRoute>
              } />

              <Route path="/staff/schedule" element={
                <ProtectedRoute requiredRole="staff">
                  <StaffDashboard />
                </ProtectedRoute>
              } />

              <Route path="/staff/performance" element={
                <ProtectedRoute requiredRole="staff">
                  <StaffDashboard />
                </ProtectedRoute>
              } />

              <Route path="/staff/leave" element={
                <ProtectedRoute requiredRole="staff">
                  <StaffDashboard />
                </ProtectedRoute>
              } />

              {/* Admin Dashboard Routes */}
              <Route path="/admin/dashboard" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              } />

              <Route path="/admin/users" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              } />

              <Route path="/admin/services" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              } />

              <Route path="/admin/products" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              } />

              <Route path="/admin/bookings" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              } />

              <Route path="/admin/analytics" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              } />

              <Route path="/admin/payroll" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              } />

              {/* 404 Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </UserProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;