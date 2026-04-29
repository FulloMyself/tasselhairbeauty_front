import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="not-found" style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '40px 20px',
      background: 'var(--cream)'
    }}>
      <h1 style={{
        fontSize: '6rem',
        color: 'var(--gold)',
        marginBottom: '1rem',
        fontFamily: 'var(--font-serif)'
      }}>404</h1>
      <h2 style={{
        fontSize: '2rem',
        marginBottom: '1rem',
        color: 'var(--deep)'
      }}>Page Not Found</h2>
      <p style={{
        color: 'var(--muted)',
        marginBottom: '2rem',
        maxWidth: '400px'
      }}>
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link to="/" className="btn btn-primary">
        <i className="fas fa-home"></i> Return Home
      </Link>
    </div>
  );
};

export default NotFound;