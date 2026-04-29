import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const OrdersManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const statuses = ['all', 'pending', 'confirmed', 'paid', 'shipped', 'completed', 'cancelled'];

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/admin/orders');
      setOrders(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(o => {
    const statusMatch = filter === 'all' || o.status === filter;
    if (!searchTerm.trim()) return statusMatch;
    const search = searchTerm.toLowerCase();
    return statusMatch && (
      o.customerName?.toLowerCase().includes(search) ||
      o.customerEmail?.toLowerCase().includes(search) ||
      o._id?.toLowerCase().includes(search)
    );
  });

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await api.put(`/admin/orders/${orderId}`, { status: newStatus });
      fetchOrders();
    } catch (error) {
      alert('Failed to update order status');
    }
  };

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

  const getStatusFlow = (currentStatus) => {
    const flow = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['paid', 'cancelled'],
      paid: ['shipped', 'cancelled'],
      shipped: ['completed'],
      completed: [],
      cancelled: []
    };
    return flow[currentStatus] || [];
  };

  // Stats
  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    completed: orders.filter(o => o.status === 'completed').length,
    revenue: orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + (o.totalAmount || 0), 0),
    averageOrder: orders.filter(o => o.status === 'completed').length > 0 
      ? orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + (o.totalAmount || 0), 0) / orders.filter(o => o.status === 'completed').length 
      : 0
  };

  if (loading) return (
    <div className="loading-spinner">
      <i className="fas fa-spinner fa-spin"></i> Loading orders...
    </div>
  );

  return (
    <div className="orders-management">
      <div className="section-header">
        <h2>Orders Management</h2>
        <div className="admin-search">
          <i className="fas fa-search search-icon"></i>
          <input 
            type="text" 
            placeholder="Search by customer or order ID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button className="search-clear" onClick={() => setSearchTerm('')}>
              <i className="fas fa-times"></i>
            </button>
          )}
        </div>
      </div>

      {/* Stats Summary */}
      <div className="services-stats">
        <div className="stat-item">
          <span className="stat-number">{stats.total}</span>
          <span className="stat-label">Total Orders</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{stats.pending}</span>
          <span className="stat-label">Pending</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">R{stats.revenue.toFixed(2)}</span>
          <span className="stat-label">Total Revenue</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">R{stats.averageOrder.toFixed(2)}</span>
          <span className="stat-label">Avg Order Value</span>
        </div>
      </div>

      <div className="filter-tabs">
        {statuses.map(status => (
          <button 
            key={status}
            className={`filter-tab ${filter === status ? 'active' : ''}`} 
            onClick={() => setFilter(status)}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
            {status !== 'all' && ` (${orders.filter(o => o.status === status).length})`}
          </button>
        ))}
      </div>

      <div className="users-table-wrapper">
        <table className="users-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map(order => (
              <tr key={order._id}>
                <td>
                  <small style={{ fontFamily: 'monospace', color: 'var(--muted)' }}>
                    #{order._id?.substring(order._id.length - 8)}
                  </small>
                </td>
                <td>
                  <strong>{order.customerName || 'N/A'}</strong>
                  <br />
                  <small style={{ color: 'var(--muted)' }}>{order.customerEmail || ''}</small>
                </td>
                <td>
                  <span className="items-count">{order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}</span>
                </td>
                <td>
                  <strong>R{(order.totalAmount || 0).toFixed(2)}</strong>
                </td>
                <td>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}</td>
                <td>
                  <span className="status-badge" style={{
                    background: getStatusColor(order.status).bg,
                    color: getStatusColor(order.status).color
                  }}>
                    {order.status}
                  </span>
                </td>
                <td>
                  <div className="action-buttons" style={{ flexDirection: 'column', gap: '4px' }}>
                    {getStatusFlow(order.status).map(nextStatus => (
                      <button 
                        key={nextStatus}
                        className="btn btn-sm btn-primary" 
                        onClick={() => handleStatusUpdate(order._id, nextStatus)}
                        style={{ 
                          fontSize: '11px', 
                          padding: '4px 8px',
                          ...(nextStatus === 'cancelled' ? { background: 'var(--error)', borderColor: 'var(--error)' } : {})
                        }}
                      >
                        <i className={`fas fa-${nextStatus === 'cancelled' ? 'times' : nextStatus === 'completed' ? 'check-double' : 'arrow-right'}`}></i>
                        {' '}{nextStatus.charAt(0).toUpperCase() + nextStatus.slice(1)}
                      </button>
                    ))}
                    <button 
                      className="btn btn-sm btn-outline" 
                      onClick={() => setSelectedOrder(order)}
                      style={{ fontSize: '11px', padding: '4px 8px' }}
                    >
                      <i className="fas fa-eye"></i> View
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredOrders.length === 0 && (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                  <div className="empty-state small">
                    <i className="fas fa-shopping-cart"></i>
                    <p>No orders found</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="admin-modal" onClick={() => setSelectedOrder(null)}>
          <div className="admin-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '650px' }}>
            <div className="admin-modal-header">
              <h3><i className="fas fa-shopping-cart"></i> Order Details</h3>
              <button className="admin-modal-close" onClick={() => setSelectedOrder(null)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="admin-modal-body">
              <div className="booking-detail-grid">
                <div className="detail-item">
                  <label>Order ID</label>
                  <p style={{ fontFamily: 'monospace' }}>#{selectedOrder._id}</p>
                </div>
                <div className="detail-item">
                  <label>Status</label>
                  <span className="status-badge" style={{
                    background: getStatusColor(selectedOrder.status).bg,
                    color: getStatusColor(selectedOrder.status).color
                  }}>
                    {selectedOrder.status}
                  </span>
                </div>
                <div className="detail-item">
                  <label>Customer</label>
                  <p>{selectedOrder.customerName}</p>
                </div>
                <div className="detail-item">
                  <label>Email</label>
                  <p>{selectedOrder.customerEmail || 'N/A'}</p>
                </div>
                <div className="detail-item">
                  <label>Date</label>
                  <p>{selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString() : 'N/A'}</p>
                </div>
                <div className="detail-item">
                  <label>Total</label>
                  <p><strong>R{(selectedOrder.totalAmount || 0).toFixed(2)}</strong></p>
                </div>
              </div>
              
              <div style={{ marginTop: '1.5rem' }}>
                <h4 style={{ marginBottom: '1rem', color: 'var(--gold)' }}>Order Items</h4>
                <table className="users-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Price</th>
                      <th>Qty</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items?.map((item, idx) => (
                      <tr key={idx}>
                        <td>{item.name || item.productName || 'Product'}</td>
                        <td>R{(item.price || 0).toFixed(2)}</td>
                        <td>{item.quantity || 1}</td>
                        <td>R{((item.price || 0) * (item.quantity || 1)).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {selectedOrder.shippingAddress && (
                <div className="detail-item full-width" style={{ marginTop: '1rem' }}>
                  <label>Shipping Address</label>
                  <p>{selectedOrder.shippingAddress}</p>
                </div>
              )}
              {selectedOrder.notes && (
                <div className="detail-item full-width">
                  <label>Notes</label>
                  <p>{selectedOrder.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersManagement;