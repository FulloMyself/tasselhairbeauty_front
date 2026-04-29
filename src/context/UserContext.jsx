import React, { createContext, useState, useContext } from 'react';
import api from '../utils/api';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateProfile = async (profileData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.put('/auth/profile', profileData);
      setUserProfile(response.data.data.user);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearProfile = () => {
    setUserProfile(null);
  };

  const value = {
    userProfile,
    loading,
    error,
    updateProfile,
    clearProfile,
    setError
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};