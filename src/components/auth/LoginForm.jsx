import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { AuthContext } from '../../context/AuthContext';
import api from '../../utils/api';
import '../styles/forms.css';

const loginSchema = yup.object().shape({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  rememberMe: yup.boolean(),
});

const LoginForm = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [apiError, setApiError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setApiError(null);

    try {
      const response = await api.post('/api/auth/login', {
        email: data.email,
        password: data.password,
      });

      if (response.data.success) {
        const { user, token } = response.data.data;
        login(user, token);

        // Redirect based on role
        if (user.role === 'admin') {
          navigate('/admin/dashboard');
        } else if (user.role === 'staff') {
          navigate('/staff/dashboard');
        } else {
          navigate('/customer/dashboard');
        }
      }
    } catch (error) {
      setApiError(error.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
      <h2>Sign In</h2>

      {apiError && <div className="alert alert-error">{apiError}</div>}

      <div className="form-group">
        <label htmlFor="email">Email Address</label>
        <input
          id="email"
          type="email"
          placeholder="Enter your email"
          {...register('email')}
          className={errors.email ? 'form-control error' : 'form-control'}
        />
        {errors.email && <span className="error-message">{errors.email.message}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          placeholder="Enter your password"
          {...register('password')}
          className={errors.password ? 'form-control error' : 'form-control'}
        />
        {errors.password && <span className="error-message">{errors.password.message}</span>}
      </div>

      <div className="form-group form-check">
        <input
          id="rememberMe"
          type="checkbox"
          {...register('rememberMe')}
          className="form-check-input"
        />
        <label htmlFor="rememberMe" className="form-check-label">
          Remember me
        </label>
      </div>

      <button type="submit" className="btn btn-primary btn-block" disabled={isSubmitting}>
        {isSubmitting ? 'Signing in...' : 'Sign In'}
      </button>

      <p className="text-center mt-3">
        Don't have an account?{' '}
        <button type="button" className="link-btn" onClick={() => navigate('/register')}>
          Register here
        </button>
      </p>

      <p className="text-center mt-2">
        <button type="button" className="link-btn" onClick={() => navigate('/forgot-password')}>
          Forgot password?
        </button>
      </p>
    </form>
  );
};

export default LoginForm;
