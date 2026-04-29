import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, user, loading } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="loading-container" style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--cream)'
      }}>
        <div className="loading-spinner" style={{
          textAlign: 'center'
        }}>
          <i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem', color: 'var(--gold)' }}></i>
          <p style={{ marginTop: '1rem', color: 'var(--muted)' }}>Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check role requirements
  if (requiredRole && user?.role !== requiredRole) {
    // Admin can access everything
    if (user?.role === 'admin') {
      return children;
    }
    return <Navigate to="/unauthorized" replace />;
  }

  // Authenticated and authorized
  return children;
};

export default ProtectedRoute;