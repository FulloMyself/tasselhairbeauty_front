import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Unauthorized = () => {
  const { user } = useAuth();

  return (
    <div className="unauthorized" style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '40px 20px',
      background: 'var(--cream)'
    }}>
      <div style={{
        fontSize: '4rem',
        color: 'var(--error)',
        marginBottom: '1rem'
      }}>
        <i className="fas fa-lock"></i>
      </div>
      <h1 style={{
        fontSize: '3rem',
        color: 'var(--gold)',
        marginBottom: '1rem',
        fontFamily: 'var(--font-serif)'
      }}>403</h1>
      <h2 style={{
        fontSize: '1.8rem',
        marginBottom: '1rem',
        color: 'var(--deep)'
      }}>Access Denied</h2>
      <p style={{
        color: 'var(--muted)',
        marginBottom: '0.5rem',
        maxWidth: '400px'
      }}>
        You don't have permission to access this page.
      </p>
      {user && (
        <p style={{
          color: 'var(--muted)',
          marginBottom: '2rem',
          fontSize: '0.9rem'
        }}>
          You are logged in as: <strong>{user.role}</strong>
        </p>
      )}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link to="/" className="btn btn-primary">
          <i className="fas fa-home"></i> Go Home
        </Link>
        {user && (
          <Link to="/dashboard" className="btn btn-outline">
            <i className="fas fa-tachometer-alt"></i> Go to Dashboard
          </Link>
        )}
      </div>
    </div>
  );
};

export default Unauthorized;