import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [tempPassword, setTempPassword] = useState('');
  const [whatsAppLink, setWhatsAppLink] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await api.post('/auth/forgot-password', { email, phone });
      setMessage(response.data.message || 'If those details are registered, instructions have been sent.');
      setTempPassword(response.data.tempPassword || '');
      setWhatsAppLink(response.data.whatsAppLink || '');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to process your request. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* Back to Home Button */}
        <Link to="/" className="back-home-btn">
          <i className="fas fa-arrow-left"></i> Back to Home
        </Link>

        <div className="auth-header">
          <h1>Forgot Password</h1>
          <p>Enter your email and registered phone number to generate a temporary password.</p>
        </div>

        {message && !tempPassword && (
          <div className="alert alert-info" style={{ 
            background: 'rgba(59, 130, 246, 0.2)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            color: 'white',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '20px'
          }}>
            <i className="fas fa-info-circle" style={{ marginRight: '8px' }}></i>
            {message}
          </div>
        )}

        {error && (
          <div className="alert alert-error" style={{ 
            background: 'rgba(239, 68, 68, 0.2)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: 'white',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '20px'
          }}>
            <i className="fas fa-exclamation-circle" style={{ marginRight: '8px' }}></i>
            {error}
          </div>
        )}

        {/* Temporary Password Display */}
        {tempPassword && (
          <div style={{
            background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)',
            border: '2px solid #34d399',
            borderRadius: '12px',
            padding: '1.5rem',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            <div style={{
              width: '50px',
              height: '50px',
              background: '#065f46',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px'
            }}>
              <i className="fas fa-check" style={{ color: 'white', fontSize: '1.5rem' }}></i>
            </div>
            <p style={{ color: '#065f46', fontWeight: '600', margin: '0 0 8px', fontSize: '0.9rem' }}>
              Your Temporary Password
            </p>
            <div style={{
              background: 'white',
              padding: '12px 20px',
              borderRadius: '8px',
              display: 'inline-block',
              marginBottom: '12px'
            }}>
              <code style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                letterSpacing: '0.1em',
                color: '#065f46',
                fontFamily: 'monospace'
              }}>
                {tempPassword}
              </code>
            </div>
            <p style={{ color: '#065f46', fontSize: '0.85rem', margin: '8px 0 0' }}>
              Use this password to sign in, then change it in your Profile Settings.
            </p>
          </div>
        )}

        {/* WhatsApp Link */}
        {whatsAppLink && (
          <div style={{
            background: 'rgba(37, 211, 102, 0.15)',
            border: '1px solid rgba(37, 211, 102, 0.3)',
            borderRadius: '12px',
            padding: '1rem',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            <p style={{ color: 'white', margin: '0 0 8px', fontSize: '0.9rem' }}>
              <i className="fab fa-whatsapp" style={{ marginRight: '8px', color: '#25D366' }}></i>
              Need help? Contact us on WhatsApp
            </p>
            <a 
              href={whatsAppLink} 
              target="_blank" 
              rel="noreferrer" 
              className="btn btn-primary"
              style={{ 
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: '#25D366',
                border: 'none',
                color: 'white',
                padding: '10px 24px',
                borderRadius: '30px',
                textDecoration: 'none',
                fontSize: '0.85rem',
                fontWeight: '500'
              }}
            >
              <i className="fab fa-whatsapp"></i> Open WhatsApp
            </a>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '16px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
        }}>
          <div className="form-group">
            <label htmlFor="email">
              <i className="fas fa-envelope"></i> Email Address
            </label>
            <input
              id="email"
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="your@email.com"
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">
              <i className="fas fa-phone"></i> Registered Phone Number
            </label>
            <input
              id="phone"
              type="tel"
              name="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              placeholder="072 960 5153"
              autoComplete="tel"
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading} 
            style={{ width: '100%', marginTop: '10px' }}
          >
            {loading ? (
              <><i className="fas fa-spinner fa-spin"></i> Generating...</>
            ) : (
              <><i className="fas fa-key"></i> Generate Temporary Password</>
            )}
          </button>
        </form>

        <div style={{ 
          textAlign: 'center', 
          marginTop: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          <Link to="/login" style={{ 
            color: 'white', 
            fontWeight: '600',
            textDecoration: 'underline',
            fontSize: '0.9rem'
          }}>
            <i className="fas fa-sign-in-alt" style={{ marginRight: '6px' }}></i>
            Back to Sign In
          </Link>
          <Link to="/register" style={{ 
            color: 'rgba(255,255,255,0.7)', 
            textDecoration: 'underline',
            fontSize: '0.85rem'
          }}>
            Don't have an account? Register here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;