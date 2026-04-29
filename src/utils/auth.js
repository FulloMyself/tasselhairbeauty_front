/**
 * Authentication utility functions
 */

/**
 * Check if user has specific role
 */
export const hasRole = (user, role) => {
  if (!user) return false;
  if (Array.isArray(role)) {
    return role.includes(user.role);
  }
  return user.role === role;
};

/**
 * Check if user is admin
 */
export const isAdmin = (user) => {
  return hasRole(user, 'admin');
};

/**
 * Check if user is staff
 */
export const isStaff = (user) => {
  return hasRole(user, ['staff', 'admin']);
};

/**
 * Check if user is customer
 */
export const isCustomer = (user) => {
  return hasRole(user, ['customer', 'admin']);
};

/**
 * Get user display name
 */
export const getUserDisplayName = (user) => {
  if (!user) return '';
  return `${user.firstName} ${user.lastName}`.trim();
};

/**
 * Get initials from user name
 */
export const getUserInitials = (user) => {
  if (!user) return '';
  const firstName = user.firstName?.[0] || '';
  const lastName = user.lastName?.[0] || '';
  return (firstName + lastName).toUpperCase();
};

/**
 * Check if token is expired
 */
export const isTokenExpired = (token) => {
  if (!token) return true;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

/**
 * Decode JWT token
 */
export const decodeToken = (token) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
};
