import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import DashboardSidebar from '../../components/dashboard/DashboardSidebar';
import ProfileEditor from '../../components/dashboard/ProfileEditor';
import CustomerHistory from '../../components/customer/CustomerHistory'; // ADD THIS IMPORT
import '../../styles/dashboard.css';

// Customer Overview Component - Fixed with proper tab switching
const CustomerOverview = ({ user, stats, onTabChange }) => (
  <div className="dashboard-overview">
    <div className="welcome-card">
      <h2>Welcome back, {user?.firstName}!</h2>
      <p>You have <strong>{stats?.upcomingBookings || 0}</strong> upcoming appointment{stats?.upcomingBookings !== 1 ? 's' : ''}</p>
    </div>

    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-icon"><i className="fas fa-calendar-check"></i></div>
        <div className="stat-info">
          <h3>{stats?.totalBookings || 0}</h3>
          <p>Total Bookings</p>
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-icon"><i className="fas fa-shopping-bag"></i></div>
        <div className="stat-info">
          <h3>{stats?.totalOrders || 0}</h3>
          <p>Total Orders</p>
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-icon"><i className="fas fa-star"></i></div>
        <div className="stat-info">
          <h3>{user?.customerProfile?.loyaltyPoints || 0}</h3>
          <p>Loyalty Points</p>
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-icon"><i className="fas fa-wallet"></i></div>
        <div className="stat-info">
          <h3>R{user?.customerProfile?.totalSpent || 0}</h3>
          <p>Total Spent</p>
        </div>
      </div>
    </div>

    <div className="quick-actions-grid">
      <button className="quick-action-card" onClick={() => onTabChange('bookings')}>
        <i className="fas fa-calendar-plus"></i>
        <h3>Book Appointment</h3>
        <p>Schedule your next visit</p>
      </button>
      <Link to="/shop" className="quick-action-card">
        <i className="fas fa-shopping-cart"></i>
        <h3>Shop Products</h3>
        <p>Browse our retail collection</p>
      </Link>
      <button className="quick-action-card" onClick={() => onTabChange('history')}>
        <i className="fas fa-history"></i>
        <h3>View History</h3>
        <p>Past bookings & orders</p>
      </button>
      <button className="quick-action-card" onClick={() => onTabChange('profile')}>
        <i className="fas fa-user-edit"></i>
        <h3>Edit Profile</h3>
        <p>Update your information</p>
      </button>
    </div>
  </div>
);

// Bookings List Component
const BookingsList = ({ bookings, loading }) => {
  if (loading) return <div className="loading-spinner"><i className="fas fa-spinner fa-spin"></i> Loading...</div>;

  return (
    <div className="bookings-section">
      <div className="section-header">
        <h2>Your Bookings</h2>
        <Link to="/booking" className="btn btn-primary">Book New Appointment</Link>
      </div>

      {(!bookings || bookings.length === 0) ? (
        <div className="empty-state">
          <i className="fas fa-calendar"></i>
          <p>No bookings yet. Book your first appointment!</p>
          <Link to="/booking" className="btn btn-primary">Book Now</Link>
        </div>
      ) : (
        <div className="bookings-list">
          {bookings.map(booking => (
            <div key={booking.id || booking._id} className="booking-card">
              <div className="booking-header">
                <span className={`booking-status status-${booking.status}`}>{booking.status}</span>
                <span className="booking-date">{booking.date ? new Date(booking.date).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div className="booking-body">
                <h4>{booking.service}</h4>
                <p><i className="fas fa-user"></i> {booking.staff || 'Unassigned'}</p>
                <p><i className="fas fa-clock"></i> {booking.time || 'N/A'} • {booking.duration || 0} mins</p>
                <p><i className="fas fa-tag"></i> R{(booking.price || 0).toFixed(2)}</p>
              </div>
              {booking.status === 'pending' && (
                <div className="booking-actions">
                  <button className="btn btn-outline btn-sm text-error">Cancel</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Orders List Component - Updated with proper styling
const OrdersList = ({ orders, loading }) => {
  if (loading) return (
    <div className="loading-spinner">
      <i className="fas fa-spinner fa-spin"></i> Loading orders...
    </div>
  );

  const getStatusColor = (status) => {
    const colors = {
      pending: '#fef3c7',
      confirmed: '#dbeafe',
      paid: '#e0e7ff',
      shipped: '#fce7f3',
      completed: '#d1fae5',
      cancelled: '#fee2e2'
    };
    return colors[status] || '#e5e7eb';
  };

  const getStatusTextColor = (status) => {
    const colors = {
      pending: '#92400e',
      confirmed: '#1e40af',
      paid: '#3730a3',
      shipped: '#9d174d',
      completed: '#065f46',
      cancelled: '#991b1b'
    };
    return colors[status] || '#374151';
  };

  return (
    <div className="orders-section">
      <div className="section-header">
        <h2>Your Orders</h2>
        <Link to="/shop" className="btn btn-primary">
          <i className="fas fa-shopping-cart"></i> Shop Now
        </Link>
      </div>

      {(!orders || orders.length === 0) ? (
        <div className="empty-state">
          <i className="fas fa-shopping-bag"></i>
          <p>No orders yet. Start shopping!</p>
          <Link to="/shop" className="btn btn-primary">
            <i className="fas fa-shopping-cart"></i> Browse Products
          </Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map(order => (
            <div key={order.id || order._id} className="order-card">
              <div className="order-header">
                <span className="order-id">
                  <i className="fas fa-receipt" style={{ marginRight: '8px', color: 'var(--gold)' }}></i>
                  Order #{order.id?.substring(0, 8) || order._id?.substring(0, 8) || 'N/A'}
                </span>
                <span
                  className="order-status"
                  style={{
                    background: getStatusColor(order.status),
                    color: getStatusTextColor(order.status)
                  }}
                >
                  {order.status}
                </span>
              </div>
              <div className="order-body">
                <div className="order-items">
                  {order.items?.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="order-item">
                      <div className="order-item-image">
                        {item.image ? (
                          <img src={item.image} alt={item.name} />
                        ) : (
                          <div className="order-item-image-placeholder">
                            <i className="fas fa-box"></i>
                          </div>
                        )}
                      </div>
                      <div className="order-item-details">
                        <span className="order-item-name">{item.name || 'Product'}</span>
                        <div className="order-item-meta">
                          <span className="order-item-quantity">Qty: {item.quantity || 1}</span>
                          <span>R{(item.price || 0).toFixed(2)} each</span>
                        </div>
                      </div>
                      <span className="order-item-price">
                        R{((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                      </span>
                    </div>
                  ))}
                  {order.items?.length > 3 && (
                    <div className="more-items">
                      +{order.items.length - 3} more item{order.items.length - 3 !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>
                <div className="order-total">
                  <div>
                    <p className="order-date">
                      <i className="far fa-calendar-alt"></i>
                      {order.date ? new Date(order.date).toLocaleDateString('en-ZA', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : (order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-ZA', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'N/A')}
                    </p>
                  </div>
                  <p>Total: <span className="total-amount">R{(order.total || order.totalAmount || 0).toFixed(2)}</span></p>
                </div>
              </div>
              {order.shippingAddress && (
                <div className="order-footer">
                  <div className="shipping-info">
                    <i className="fas fa-map-marker-alt"></i>
                    <span>Ship to: {order.shippingAddress}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Loyalty Card Component
const LoyaltyCard = ({ user }) => {
  const tiers = ['bronze', 'silver', 'gold', 'platinum'];
  const currentTier = user?.customerProfile?.loyaltyTier || 'bronze';
  const points = user?.customerProfile?.loyaltyPoints || 0;
  const nextTier = tiers[tiers.indexOf(currentTier) + 1];
  const pointsNeeded = { bronze: 0, silver: 500, gold: 1500, platinum: 3000 };

  return (
    <div className="loyalty-section">
      <h2>Loyalty Program</h2>

      <div className={`loyalty-card tier-${currentTier}`}>
        <div className="loyalty-header">
          <i className="fas fa-crown"></i>
          <h3>{currentTier.charAt(0).toUpperCase() + currentTier.slice(1)} Member</h3>
        </div>
        <div className="loyalty-points">
          <span className="points-value">{points}</span>
          <span className="points-label">Loyalty Points</span>
        </div>
        {nextTier && (
          <div className="loyalty-progress">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${Math.min((points / pointsNeeded[nextTier]) * 100, 100)}%` }}></div>
            </div>
            <p>{pointsNeeded[nextTier] - points} points to {nextTier}</p>
          </div>
        )}
      </div>

      <div className="loyalty-benefits">
        <h4>Your Benefits</h4>
        <ul>
          {currentTier === 'bronze' && (
            <>
              <li><i className="fas fa-check"></i> Earn 1 point per R10 spent</li>
              <li><i className="fas fa-check"></i> Birthday discount</li>
            </>
          )}
          {currentTier === 'silver' && (
            <>
              <li><i className="fas fa-check"></i> Earn 1.5 points per R10 spent</li>
              <li><i className="fas fa-check"></i> 10% off products</li>
              <li><i className="fas fa-check"></i> Priority booking</li>
            </>
          )}
          {currentTier === 'gold' && (
            <>
              <li><i className="fas fa-check"></i> Earn 2 points per R10 spent</li>
              <li><i className="fas fa-check"></i> 15% off products</li>
              <li><i className="fas fa-check"></i> Free birthday treatment</li>
              <li><i className="fas fa-check"></i> Bring a friend discount</li>
            </>
          )}
          {currentTier === 'platinum' && (
            <>
              <li><i className="fas fa-check"></i> Earn 3 points per R10 spent</li>
              <li><i className="fas fa-check"></i> 20% off all services</li>
              <li><i className="fas fa-check"></i> Free monthly treatment</li>
              <li><i className="fas fa-check"></i> Exclusive event access</li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
};

// ============================================================
// MAIN CUSTOMER DASHBOARD COMPONENT
// ============================================================
const CustomerDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [bookings, setBookings] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: 'fas fa-home' },
    { id: 'bookings', label: 'My Bookings', icon: 'fas fa-calendar' },
    { id: 'orders', label: 'My Orders', icon: 'fas fa-shopping-bag' },
    { id: 'history', label: 'History', icon: 'fas fa-history' },
    { id: 'profile', label: 'Profile', icon: 'fas fa-user-cog' },
    { id: 'loyalty', label: 'Loyalty', icon: 'fas fa-star' },
  ];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [bookingsRes, ordersRes, statsRes] = await Promise.all([
        api.get('/customer/bookings'),
        api.get('/customer/orders'),
        api.get('/customer/stats')
      ]);
      setBookings(bookingsRes.data.data || []);
      setOrders(ordersRes.data.data || []);
      setStats(statsRes.data.data || {});
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard customer-dashboard">
      <DashboardSidebar
        user={user}
        menuItems={menuItems}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div className="dashboard-content">
        {activeTab === 'overview' && (
          <CustomerOverview
            user={user}
            stats={stats}
            onTabChange={setActiveTab}  // Pass setActiveTab to overview
          />
        )}
        {activeTab === 'bookings' && <BookingsList bookings={bookings} loading={loading} />}
        {activeTab === 'orders' && <OrdersList orders={orders} loading={loading} />}
        {activeTab === 'history' && <CustomerHistory />}
        {activeTab === 'profile' && <ProfileEditor user={user} onUpdate={fetchDashboardData} />}
        {activeTab === 'loyalty' && <LoyaltyCard user={user} />}
      </div>
    </div>
  );
};

export default CustomerDashboard;