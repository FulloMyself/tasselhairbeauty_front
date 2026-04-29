import React from 'react';
import { useAuth } from '../context/AuthContext';
import CustomerDashboard from './customer/CustomerDashboard';
import StaffDashboard from './staff/StaffDashboard';
import AdminDashboard from './admin/AdminDashboard';
import NotFound from './NotFound';

const RoleBasedDashboard = () => {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  switch (user.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'staff':
      return <StaffDashboard />;
    case 'customer':
      return <CustomerDashboard />;
    default:
      return <NotFound />;
  }
};

export default RoleBasedDashboard;
