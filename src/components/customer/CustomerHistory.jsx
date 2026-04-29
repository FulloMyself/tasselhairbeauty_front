import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const CustomerHistory = () => {
  const [activeTab, setActiveTab] = useState('bookings');
  const [bookings, setBookings] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const [bookingsRes, ordersRes] = await Promise.all([
        api.get('/customer/bookings'),
        api.get('/customer/orders')
      ]);
      setBookings(bookingsRes.data.data || []);
      setOrders(ordersRes.data.data || []);
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = bookings.filter(b => {
    if (filter === 'all') return true;
    return b.status === filter;
  });

  const filteredOrders = orders.filter(o => {
    if (filter === 'all') return true;
    return o.status === filter;
  });

  const getStatusColor = (status) => {
    const colors = {
      pending: { bg: '#fef3c7', color: '#92400e' },
      confirmed: { bg: '#dbeafe', color: '#1e40af' },
      paid: { bg: '#e0e7ff', color: '#3730a3' },
      shipped: { bg: '#fce7f3', color: '#9d174d' },
      completed: { bg: '#d1fae5', color: '#065f46' },
      cancelled: { bg: '#fee2e2', color: '#991b1b' }
    };
    return colors[status] || { bg: '#e5e7eb', color: '#374151' };
  };

  const getBookingStatusFlow = (status) => {
    const steps = ['pending', 'confirmed', 'completed'];
    if (status === 'cancelled') return ['cancelled'];
    const currentIndex = steps.indexOf(status);
    if (currentIndex === -1) return steps;
    return steps.map((step, i) => ({
      label: step,
      active: i <= currentIndex,
      current: i === currentIndex
    }));
  };

  if (loading) return (
    <div className="loading-spinner">
      <i className="fas fa-spinner fa-spin"></i> Loading history...
    </div>
  );

  const bookingStatuses = ['all', 'pending', 'confirmed', 'completed', 'cancelled'];
  const orderStatuses = ['all', 'pending', 'confirmed', 'paid', 'shipped', 'completed', 'cancelled'];

  return (
    <div className="customer-history">
      <h2>My History</h2>

      {/* Tabs */}
      <div className="history-tabs">
        <button 
          className={`history-tab ${activeTab === 'bookings' ? 'active' : ''}`}
          onClick={() => { setActiveTab('bookings'); setFilter('all'); }}
        >
          <i className="fas fa-calendar-check"></i> Bookings ({bookings.length})
        </button>
        <button 
          className={`history-tab ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => { setActiveTab('orders'); setFilter('all'); }}
        >
          <i className="fas fa-shopping-bag"></i> Orders ({orders.length})
        </button>
      </div>

      {/* Filter */}
      <div className="filter-tabs" style={{ marginTop: '1rem' }}>
        {(activeTab === 'bookings' ? bookingStatuses : orderStatuses).map(status => (
          <button
            key={status}
            className={`filter-tab ${filter === status ? 'active' : ''}`}
            onClick={() => setFilter(status)}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Bookings History */}
      {activeTab === 'bookings' && (
        <div className="history-list">
          {filteredBookings.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-calendar"></i>
              <p>No bookings found</p>
            </div>
          ) : (
            filteredBookings.map(booking => {
              const statusFlow = getBookingStatusFlow(booking.status);
              return (
                <div key={booking.id || booking._id} className="history-card">
                  <div className="history-card-header">
                    <div>
                      <span className="booking-number">#{booking.bookingNumber || booking.id?.substring(0, 8)}</span>
                      <span className="history-date">{new Date(booking.date || booking.createdAt).toLocaleDateString()}</span>
                    </div>
                    <span className="status-badge" style={{
                      background: getStatusColor(booking.status).bg,
                      color: getStatusColor(booking.status).color
                    }}>
                      {booking.status}
                    </span>
                  </div>
                  
                  <div className="history-card-body">
                    <div className="history-detail">
                      <i className="fas fa-cut"></i>
                      <span>{booking.service || 'Service'}</span>
                    </div>
                    {booking.staff && (
                      <div className="history-detail">
                        <i className="fas fa-user-tie"></i>
                        <span>{booking.staff}</span>
                      </div>
                    )}
                    <div className="history-detail">
                      <i className="fas fa-clock"></i>
                      <span>{booking.time || 'N/A'} • {booking.duration || 0} mins</span>
                    </div>
                    <div className="history-detail">
                      <i className="fas fa-users"></i>
                      <span>{booking.numberOfPeople || 1} person{booking.numberOfPeople !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="history-detail">
                      <i className="fas fa-tag"></i>
                      <span>R{(booking.price || 0).toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Status Progress */}
                  {booking.status !== 'cancelled' && (
                    <div className="status-progress">
                      {statusFlow.map((step, i) => (
                        <div key={i} className={`progress-step ${step.active ? 'active' : ''} ${step.current ? 'current' : ''}`}>
                          <div className="step-dot">
                            {step.active ? <i className="fas fa-check"></i> : <span>{i + 1}</span>}
                          </div>
                          <span className="step-label">{step.label}</span>
                          {i < statusFlow.length - 1 && <div className={`step-line ${statusFlow[i + 1].active ? 'active' : ''}`}></div>}
                        </div>
                      ))}
                    </div>
                  )}

                  {booking.specialRequests && (
                    <div className="history-notes">
                      <i className="fas fa-pen"></i> {booking.specialRequests}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Orders History */}
      {activeTab === 'orders' && (
        <div className="history-list">
          {filteredOrders.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-shopping-bag"></i>
              <p>No orders found</p>
            </div>
          ) : (
            filteredOrders.map(order => (
              <div key={order.id || order._id} className="history-card">
                <div className="history-card-header">
                  <div>
                    <span className="booking-number">Order #{order.id?.substring(0, 8) || 'N/A'}</span>
                    <span className="history-date">{new Date(order.date || order.createdAt).toLocaleDateString()}</span>
                  </div>
                  <span className="status-badge" style={{
                    background: getStatusColor(order.status).bg,
                    color: getStatusColor(order.status).color
                  }}>
                    {order.status}
                  </span>
                </div>
                
                <div className="history-card-body">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="order-item-row">
                      <span className="order-item-name">{item.quantity}x {item.name || item.productName || 'Product'}</span>
                      <span className="order-item-price">R{((item.price || 0) * (item.quantity || 1)).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                
                <div className="history-card-footer">
                  <div className="history-detail">
                    <i className="fas fa-money-bill"></i>
                    <span><strong>Total: R{(order.total || order.totalAmount || 0).toFixed(2)}</strong></span>
                  </div>
                  {order.shippingAddress && (
                    <div className="history-detail">
                      <i className="fas fa-map-marker-alt"></i>
                      <span>{order.shippingAddress}</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default CustomerHistory;