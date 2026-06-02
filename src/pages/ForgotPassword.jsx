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
        <button type="button" className="back-home-btn" onClick={() => navigate(-1)}>
          <i className="fas fa-arrow-left"></i> Back
        </button>

        <div className="auth-header">
          <h1>Forgot Password</h1>
          <p>Enter your email and registered phone number to generate a temporary password.</p>
        </div>

        {message && <div className="alert alert-success" style={{ marginBottom: '20px' }}>{message}</div>}
        {error && <div className="alert alert-error" style={{ marginBottom: '20px' }}>{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form" style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '16px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
        }}>
          <div className="form-group">
            <label htmlFor="email"><i className="fas fa-envelope"></i> Email Address</label>
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
            <label htmlFor="phone"><i className="fas fa-phone"></i> Registered Phone Number</label>
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

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', marginTop: '10px' }}>
            {loading ? (<><i className="fas fa-spinner fa-spin"></i> Sending...</>) : (<><i className="fas fa-paper-plane"></i> Generate Temporary Password</>) }
          </button>
        </form>

        {whatsAppLink && (
          <div className="reset-link-box" style={{ marginTop: '20px', padding: '1rem', border: '1px solid #ddd', borderRadius: '12px', background: '#f8f8f8' }}>
            <p style={{ margin: 0, fontWeight: 600 }}>Open WhatsApp:</p>
            <a href={whatsAppLink} target="_blank" rel="noreferrer" style={{ wordBreak: 'break-all', color: '#25D366' }}>{whatsAppLink}</a>
          </div>
        )}

        {tempPassword && (
          <div className="reset-link-box" style={{ marginTop: '20px', padding: '1rem', border: '1px solid #ddd', borderRadius: '12px', background: '#f8f8f8' }}>
            <p style={{ margin: 0, fontWeight: 600 }}>Your temporary password:</p>
            <p style={{ margin: '8px 0 0', fontSize: '1rem', fontWeight: 700, letterSpacing: '0.05em' }}>{tempPassword}</p>
            <p style={{ marginTop: '8px', fontSize: '0.9rem', color: '#555' }}>Use this password to sign in and then change it in your profile.</p>
          </div>
        )}

        <p style={{ textAlign: 'center', marginTop: '20px', color: 'black' }}>
          Remembered your password?{' '}
          <Link to="/login" style={{ color: 'black', fontWeight: '600', textDecoration: 'underline' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
