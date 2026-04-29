import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { AuthContext } from '../../context/AuthContext';
import api from '../../utils/api';
import '../styles/forms.css';

const registerSchema = yup.object().shape({
  firstName: yup.string().required('First name is required').min(2, 'First name must be at least 2 characters'),
  lastName: yup.string().required('Last name is required').min(2, 'Last name must be at least 2 characters'),
  email: yup.string().email('Invalid email').required('Email is required'),
  phone: yup.string().matches(/^[0-9\s\-\+\(\)]+$/, 'Invalid phone number').required('Phone number is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
  agreeToTerms: yup.boolean().oneOf([true], 'You must agree to the terms and conditions'),
});

const RegisterForm = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [apiError, setApiError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(registerSchema),
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setApiError(null);

    try {
      const response = await api.post('/api/auth/register', {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        password: data.password,
      });

      if (response.data.success) {
        const { user, token } = response.data.data;
        login(user, token);
        navigate('/customer/dashboard');
      }
    } catch (error) {
      setApiError(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
      <h2>Create Account</h2>

      {apiError && <div className="alert alert-error">{apiError}</div>}

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="firstName">First Name</label>
          <input
            id="firstName"
            type="text"
            placeholder="Enter your first name"
            {...register('firstName')}
            className={errors.firstName ? 'form-control error' : 'form-control'}
          />
          {errors.firstName && <span className="error-message">{errors.firstName.message}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="lastName">Last Name</label>
          <input
            id="lastName"
            type="text"
            placeholder="Enter your last name"
            {...register('lastName')}
            className={errors.lastName ? 'form-control error' : 'form-control'}
          />
          {errors.lastName && <span className="error-message">{errors.lastName.message}</span>}
        </div>
      </div>

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
        <label htmlFor="phone">Phone Number</label>
        <input
          id="phone"
          type="tel"
          placeholder="Enter your phone number"
          {...register('phone')}
          className={errors.phone ? 'form-control error' : 'form-control'}
        />
        {errors.phone && <span className="error-message">{errors.phone.message}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          placeholder="Enter your password (min 6 characters)"
          {...register('password')}
          className={errors.password ? 'form-control error' : 'form-control'}
        />
        {errors.password && <span className="error-message">{errors.password.message}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="confirmPassword">Confirm Password</label>
        <input
          id="confirmPassword"
          type="password"
          placeholder="Confirm your password"
          {...register('confirmPassword')}
          className={errors.confirmPassword ? 'form-control error' : 'form-control'}
        />
        {errors.confirmPassword && <span className="error-message">{errors.confirmPassword.message}</span>}
      </div>

      <div className="form-group form-check">
        <input
          id="agreeToTerms"
          type="checkbox"
          {...register('agreeToTerms')}
          className="form-check-input"
        />
        <label htmlFor="agreeToTerms" className="form-check-label">
          I agree to the terms and conditions
        </label>
        {errors.agreeToTerms && <span className="error-message">{errors.agreeToTerms.message}</span>}
      </div>

      <button type="submit" className="btn btn-primary btn-block" disabled={isSubmitting}>
        {isSubmitting ? 'Creating account...' : 'Create Account'}
      </button>

      <p className="text-center mt-3">
        Already have an account?{' '}
        <button type="button" className="link-btn" onClick={() => navigate('/login')}>
          Sign in here
        </button>
      </p>
    </form>
  );
};

export default RegisterForm;
