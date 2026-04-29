/**
 * Frontend validation utilities
 */

/**
 * Validate email format
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password
 */
export const validatePassword = (password) => {
  return password && password.length >= 6;
};

/**
 * Validate phone number (basic)
 */
export const validatePhone = (phone) => {
  const phoneRegex = /^[0-9]{10,}$/;
  return phoneRegex.test(phone.replace(/\D/g, ''));
};

/**
 * Validate name
 */
export const validateName = (name) => {
  return name && name.trim().length >= 2;
};

/**
 * Validate required field
 */
export const validateRequired = (value) => {
  return value && value.toString().trim().length > 0;
};

/**
 * Validate min length
 */
export const validateMinLength = (value, minLength) => {
  return value && value.length >= minLength;
};

/**
 * Validate max length
 */
export const validateMaxLength = (value, maxLength) => {
  return !value || value.length <= maxLength;
};

/**
 * Validate number range
 */
export const validateNumberRange = (value, min, max) => {
  const num = Number(value);
  return num >= min && num <= max;
};

/**
 * Validate date format
 */
export const validateDate = (dateString) => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
};

/**
 * Validate credit card number (Luhn algorithm)
 */
export const validateCreditCard = (cardNumber) => {
  const cleaned = cardNumber.replace(/\D/g, '');
  if (cleaned.length < 13 || cleaned.length > 19) return false;

  let sum = 0;
  let isEven = false;

  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i], 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
};

/**
 * Get validation error message
 */
export const getValidationError = (fieldName, rule) => {
  const errors = {
    required: `${fieldName} is required`,
    email: 'Please enter a valid email address',
    password: 'Password must be at least 6 characters long',
    phone: 'Please enter a valid phone number',
    name: `${fieldName} must be at least 2 characters long`,
    minLength: (min) => `${fieldName} must be at least ${min} characters long`,
    maxLength: (max) => `${fieldName} must be at most ${max} characters long`,
    number: `${fieldName} must be a valid number`,
    date: `${fieldName} must be a valid date`,
    creditCard: 'Please enter a valid credit card number',
  };

  return typeof errors[rule] === 'function' ? errors[rule](rule) : errors[rule];
};
