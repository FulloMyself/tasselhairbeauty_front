import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const DashboardSidebar = ({ user, menuItems, activeTab, onTabChange }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const getRoleDisplay = () => {
    if (user?.role === 'admin') return 'Administrator';
    if (user?.role === 'staff') return 'Staff Member';
    return 'Customer';
  };

  return (
    <div className="dashboard-sidebar">
      <div className="user-profile-summary">
        <div className="user-avatar">
          {user?.profileImage ? (
            <img src={user.profileImage} alt={user.firstName} />
          ) : (
            <div className={`avatar-placeholder ${user?.role === 'admin' ? 'admin-avatar' : ''}`}>
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
          )}
        </div>
        <h3>{user?.firstName} {user?.lastName}</h3>
        <p className="user-role">{getRoleDisplay()}</p>
        {user?.role === 'staff' && (
          <>
            <p className="user-specialization">{user?.staffProfile?.specializations?.join(' • ') || 'Staff'}</p>
            <span className={`staff-status status-${user?.staffProfile?.status || 'active'}`}>
              {user?.staffProfile?.status || 'Active'}
            </span>
          </>
        )}
        {user?.role === 'customer' && (
          <div className="loyalty-mini">
            <i className="fas fa-star"></i>
            <span>{user?.customerProfile?.loyaltyPoints || 0} points</span>
          </div>
        )}
      </div>

      <nav className="dashboard-nav">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => onTabChange(item.id)}
          >
            <i className={item.icon}></i>
            <span>{item.label}</span>
            {item.badge && (
              <span className={`nav-badge ${item.badgeType || ''}`}>{item.badge}</span>
            )}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="nav-item logout-btn" onClick={handleLogout}>
          <i className="fas fa-sign-out-alt"></i>
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default DashboardSidebar;