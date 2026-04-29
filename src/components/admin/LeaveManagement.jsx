import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const LeaveManagement = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const statuses = ['all', 'pending', 'approved', 'rejected'];

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  const fetchLeaveRequests = async () => {
    try {
      const response = await api.get('/admin/leave-requests');
      setLeaveRequests(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch leave requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLeaves = leaveRequests.filter(l => {
    const statusMatch = filter === 'all' || l.status === filter;
    if (!searchTerm.trim()) return statusMatch;
    const search = searchTerm.toLowerCase();
    return statusMatch && (
      l.staffName?.toLowerCase().includes(search) ||
      l.leaveType?.toLowerCase().includes(search) ||
      l.reason?.toLowerCase().includes(search)
    );
  });

  const handleApprove = async (leaveId) => {
    setActionLoading(leaveId);
    try {
      await api.put(`/admin/leave-requests/${leaveId}`, { 
        status: 'approved',
        approvedBy: 'Admin',
        approvalDate: new Date().toISOString()
      });
      fetchLeaveRequests();
    } catch (error) {
      alert('Failed to approve leave request');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (leaveId) => {
    const reason = prompt('Reason for rejection (optional):');
    setActionLoading(leaveId);
    try {
      await api.put(`/admin/leave-requests/${leaveId}`, { 
        status: 'rejected',
        comments: reason || 'Rejected by admin'
      });
      fetchLeaveRequests();
    } catch (error) {
      alert('Failed to reject leave request');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: { bg: '#fef3c7', color: '#92400e' },
      approved: { bg: '#d1fae5', color: '#065f46' },
      rejected: { bg: '#fee2e2', color: '#991b1b' }
    };
    return colors[status] || { bg: '#e5e7eb', color: '#374151' };
  };

  const getLeaveTypeIcon = (type) => {
    const icons = {
      annual: 'fa-umbrella-beach',
      sick: 'fa-briefcase-medical',
      personal: 'fa-user-clock',
      unpaid: 'fa-clock'
    };
    return icons[type] || 'fa-calendar';
  };

  const stats = {
    total: leaveRequests.length,
    pending: leaveRequests.filter(l => l.status === 'pending').length,
    approved: leaveRequests.filter(l => l.status === 'approved').length,
    rejected: leaveRequests.filter(l => l.status === 'rejected').length,
    thisMonth: leaveRequests.filter(l => {
      const date = new Date(l.startDate);
      const now = new Date();
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).length
  };

  if (loading) return (
    <div className="loading-spinner">
      <i className="fas fa-spinner fa-spin"></i> Loading leave requests...
    </div>
  );

  return (
    <div className="leave-management">
      <div className="section-header">
        <h2>Leave Requests Management</h2>
        <div className="admin-search">
          <i className="fas fa-search search-icon"></i>
          <input 
            type="text" 
            placeholder="Search by staff or leave type..." 
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
          <span className="stat-label">Total Requests</span>
        </div>
        <div className="stat-item">
          <span className="stat-number" style={{ color: '#92400e' }}>{stats.pending}</span>
          <span className="stat-label">Pending</span>
        </div>
        <div className="stat-item">
          <span className="stat-number" style={{ color: '#065f46' }}>{stats.approved}</span>
          <span className="stat-label">Approved</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{stats.thisMonth}</span>
          <span className="stat-label">This Month</span>
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
            {status !== 'all' && ` (${leaveRequests.filter(l => l.status === status).length})`}
          </button>
        ))}
      </div>

      <div className="users-table-wrapper">
        <table className="users-table">
          <thead>
            <tr>
              <th>Staff Member</th>
              <th>Leave Type</th>
              <th>Dates</th>
              <th>Days</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredLeaves.map(leave => (
              <tr key={leave._id || leave.id}>
                <td>
                  <strong>{leave.staffName || 'Unknown Staff'}</strong>
                </td>
                <td>
                  <span className="leave-type-badge">
                    <i className={`fas ${getLeaveTypeIcon(leave.leaveType)}`}></i>
                    {' '}{leave.leaveType?.charAt(0).toUpperCase() + leave.leaveType?.slice(1)}
                  </span>
                </td>
                <td>
                  <div>{leave.startDate ? new Date(leave.startDate).toLocaleDateString() : 'N/A'}</div>
                  <small style={{ color: 'var(--muted)' }}>to {leave.endDate ? new Date(leave.endDate).toLocaleDateString() : 'N/A'}</small>
                </td>
                <td>
                  <span className="days-badge">{leave.numberOfDays || 0} day{leave.numberOfDays !== 1 ? 's' : ''}</span>
                </td>
                <td>
                  <div style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {leave.reason || 'No reason provided'}
                  </div>
                </td>
                <td>
                  <span className="status-badge" style={{
                    background: getStatusColor(leave.status).bg,
                    color: getStatusColor(leave.status).color
                  }}>
                    {leave.status}
                  </span>
                </td>
                <td>
                  <div className="action-buttons" style={{ flexDirection: 'column', gap: '4px' }}>
                    {leave.status === 'pending' && (
                      <>
                        <button 
                          className="btn btn-sm btn-primary" 
                          onClick={() => handleApprove(leave._id || leave.id)}
                          disabled={actionLoading === (leave._id || leave.id)}
                          style={{ fontSize: '11px', padding: '4px 8px', background: 'var(--success)', borderColor: 'var(--success)' }}
                        >
                          {actionLoading === (leave._id || leave.id) ? (
                            <i className="fas fa-spinner fa-spin"></i>
                          ) : (
                            <i className="fas fa-check"></i>
                          )}{' '}Approve
                        </button>
                        <button 
                          className="btn btn-sm btn-outline" 
                          onClick={() => handleReject(leave._id || leave.id)}
                          disabled={actionLoading === (leave._id || leave.id)}
                          style={{ fontSize: '11px', padding: '4px 8px', color: 'var(--error)', borderColor: 'var(--error)' }}
                        >
                          <i className="fas fa-times"></i> Reject
                        </button>
                      </>
                    )}
                    <button 
                      className="btn btn-sm btn-outline" 
                      onClick={() => setSelectedLeave(leave)}
                      style={{ fontSize: '11px', padding: '4px 8px' }}
                    >
                      <i className="fas fa-eye"></i> View
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredLeaves.length === 0 && (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                  <div className="empty-state small">
                    <i className="fas fa-umbrella-beach"></i>
                    <p>No leave requests found</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Leave Detail Modal */}
      {selectedLeave && (
        <div className="admin-modal" onClick={() => setSelectedLeave(null)}>
          <div className="admin-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '550px' }}>
            <div className="admin-modal-header">
              <h3><i className="fas fa-umbrella-beach"></i> Leave Request Details</h3>
              <button className="admin-modal-close" onClick={() => setSelectedLeave(null)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="admin-modal-body">
              <div className="booking-detail-grid">
                <div className="detail-item">
                  <label>Staff Member</label>
                  <p>{selectedLeave.staffName || 'N/A'}</p>
                </div>
                <div className="detail-item">
                  <label>Status</label>
                  <span className="status-badge" style={{
                    background: getStatusColor(selectedLeave.status).bg,
                    color: getStatusColor(selectedLeave.status).color
                  }}>
                    {selectedLeave.status}
                  </span>
                </div>
                <div className="detail-item">
                  <label>Leave Type</label>
                  <p style={{ textTransform: 'capitalize' }}>
                    <i className={`fas ${getLeaveTypeIcon(selectedLeave.leaveType)}`}></i>
                    {' '}{selectedLeave.leaveType}
                  </p>
                </div>
                <div className="detail-item">
                  <label>Number of Days</label>
                  <p>{selectedLeave.numberOfDays || 0} day{selectedLeave.numberOfDays !== 1 ? 's' : ''}</p>
                </div>
                <div className="detail-item">
                  <label>Start Date</label>
                  <p>{selectedLeave.startDate ? new Date(selectedLeave.startDate).toLocaleDateString() : 'N/A'}</p>
                </div>
                <div className="detail-item">
                  <label>End Date</label>
                  <p>{selectedLeave.endDate ? new Date(selectedLeave.endDate).toLocaleDateString() : 'N/A'}</p>
                </div>
                <div className="detail-item full-width">
                  <label>Reason</label>
                  <p>{selectedLeave.reason || 'No reason provided'}</p>
                </div>
                {selectedLeave.comments && (
                  <div className="detail-item full-width">
                    <label>Admin Comments</label>
                    <p>{selectedLeave.comments}</p>
                  </div>
                )}
                {selectedLeave.approvedBy && (
                  <div className="detail-item full-width">
                    <label>Approved/Rejected By</label>
                    <p>{selectedLeave.approvedBy} on {selectedLeave.approvalDate ? new Date(selectedLeave.approvalDate).toLocaleDateString() : 'N/A'}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveManagement;