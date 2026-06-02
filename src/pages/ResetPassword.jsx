import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../utils/api';

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [token, setToken] = useState('');
  const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setToken(params.get('token') || '');
  }, [location.search]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!token) {
      setError('Password reset token is missing. Please use the link in your email.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/reset-password', {
        token,
        password: formData.password
      });
      setMessage(response.data.message || 'Password has been reset successfully.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to reset password. Please try again.');
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
          <h1>Reset Password</h1>
          <p>Choose a new password for your account.</p>
        </div>

        {message && <div className="alert alert-success" style={{ marginBottom: '20px' }}>{message}</div>}
        {error && <div className="alert alert-error" style={{ marginBottom: '20px' }}>{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form" style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '16px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
        }}>
          <div className="form-group password-field">
            <label htmlFor="password"><i className="fas fa-lock"></i> New Password</label>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="••••••••"
              autoComplete="new-password"
            />
            <button type="button" className="password-toggle" onClick={() => setShowPassword((prev) => !prev)}>
              <i className={showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'}></i>
            </button>
          </div>

          <div className="form-group password-field">
            <label htmlFor="confirmPassword"><i className="fas fa-lock"></i> Confirm New Password</label>
            <input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="••••••••"
            />
            <button type="button" className="password-toggle" onClick={() => setShowConfirmPassword((prev) => !prev)}>
              <i className={showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'}></i>
            </button>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', marginTop: '10px' }}>
            {loading ? (<><i className="fas fa-spinner fa-spin"></i> Resetting...</>) : (<><i className="fas fa-key"></i> Reset Password</>) }
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', color: 'black' }}>
          Return to{' '}
          <Link to="/login" style={{ color: 'black', fontWeight: '600', textDecoration: 'underline' }}>
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
