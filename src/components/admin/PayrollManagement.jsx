import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import ProcessPayrollModal from './ProcessPayrollModal';
import { downloadPayslip, downloadPayrollReport } from '../../utils/payslipGenerator';

const PayrollManagement = () => {
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showPayrollModal, setShowPayrollModal] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState(null);

  const statuses = ['all', 'draft', 'approved', 'paid'];

  useEffect(() => {
    fetchPayrolls();
  }, []);

  const fetchPayrolls = async () => {
    try {
      const response = await api.get('/admin/payroll');
      setPayrolls(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch payroll:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPayrolls = payrolls.filter(p => {
    const statusMatch = filter === 'all' || p.status === filter;
    if (!searchTerm.trim()) return statusMatch;
    const search = searchTerm.toLowerCase();
    return statusMatch && (
      p.staffName?.toLowerCase().includes(search) ||
      p.payrollPeriod?.toLowerCase().includes(search)
    );
  });

  const handleStatusUpdate = async (payrollId, newStatus) => {
    try {
      await api.put(`/admin/payroll/${payrollId}`, { status: newStatus });
      fetchPayrolls();
    } catch (error) {
      alert('Failed to update payroll status');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: { bg: '#fef3c7', color: '#92400e' },
      approved: { bg: '#dbeafe', color: '#1e40af' },
      paid: { bg: '#d1fae5', color: '#065f46' }
    };
    return colors[status] || { bg: '#e5e7eb', color: '#374151' };
  };

  const handleDownloadPayslip = (payroll) => {
    const staffName = payroll.staffName || 'Staff Member';
    downloadPayslip(payroll, staffName);
  };

  const handleDownloadReport = () => {
    const period = filter === 'all' ? 'all' : selectedPayroll?.payrollPeriod || 'all';
    downloadPayrollReport(payrolls, period);
  };

  const stats = {
    total: payrolls.length,
    totalPaid: payrolls.filter(p => p.status === 'paid').reduce((sum, p) => sum + (p.totalEarnings || 0), 0),
    pending: payrolls.filter(p => p.status === 'draft').length,
    paid: payrolls.filter(p => p.status === 'paid').length
  };

  if (loading) return (
    <div className="loading-spinner">
      <i className="fas fa-spinner fa-spin"></i> Loading payroll...
    </div>
  );

  return (
    <div className="payroll-management">
      <div className="section-header">
        <h2>Payroll Management</h2>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div className="admin-search">
            <i className="fas fa-search search-icon"></i>
            <input
              type="text"
              placeholder="Search by staff or period..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button className="search-clear" onClick={() => setSearchTerm('')}>
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>
          <button className="btn btn-outline" onClick={handleDownloadReport} title="Download Payroll Report">
            <i className="fas fa-download"></i> Report
          </button>
          <button className="btn btn-primary" onClick={() => setShowPayrollModal(true)}>
            <i className="fas fa-plus"></i> Process Payroll
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="services-stats">
        <div className="stat-item">
          <span className="stat-number">{stats.total}</span>
          <span className="stat-label">Total Records</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">R{stats.totalPaid.toFixed(2)}</span>
          <span className="stat-label">Total Paid Out</span>
        </div>
        <div className="stat-item">
          <span className="stat-number" style={{ color: '#92400e' }}>{stats.pending}</span>
          <span className="stat-label">Draft</span>
        </div>
        <div className="stat-item">
          <span className="stat-number" style={{ color: '#065f46' }}>{stats.paid}</span>
          <span className="stat-label">Paid</span>
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
          </button>
        ))}
      </div>

      <div className="users-table-wrapper">
        <table className="users-table">
          <thead>
            <tr>
              <th>Staff Member</th>
              <th>Period</th>
              <th>Base Salary</th>
              <th>Bonuses</th>
              <th>Deductions</th>
              <th>Total</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPayrolls.map(payroll => (
              <tr key={payroll._id}>
                <td>
                  <strong>{payroll.staffName || payroll.staffId?.firstName || 'N/A'}</strong>
                </td>
                <td>{payroll.payrollPeriod || 'N/A'}</td>
                <td>R{(payroll.baseSalary || 0).toFixed(2)}</td>
                <td style={{ color: 'var(--success)' }}>+R{(payroll.bonuses || 0).toFixed(2)}</td>
                <td style={{ color: 'var(--error)' }}>-R{((payroll.deductions || 0) + (payroll.leaveDeductions || 0)).toFixed(2)}</td>
                <td><strong>R{(payroll.totalEarnings || 0).toFixed(2)}</strong></td>
                <td>
                  <span className="status-badge" style={{
                    background: getStatusColor(payroll.status).bg,
                    color: getStatusColor(payroll.status).color
                  }}>
                    {payroll.status}
                  </span>
                </td>
                <td>
                  <div className="action-buttons" style={{ flexDirection: 'column', gap: '4px' }}>
                    {payroll.status === 'draft' && (
                      <button className="btn btn-sm btn-primary" onClick={() => handleStatusUpdate(payroll._id, 'approved')}
                        style={{ fontSize: '11px', padding: '4px 8px' }}>
                        <i className="fas fa-check"></i> Approve
                      </button>
                    )}
                    {payroll.status === 'approved' && (
                      <button className="btn btn-sm btn-primary" onClick={() => handleStatusUpdate(payroll._id, 'paid')}
                        style={{ fontSize: '11px', padding: '4px 8px', background: 'var(--success)', borderColor: 'var(--success)' }}>
                        <i className="fas fa-check-double"></i> Mark Paid
                      </button>
                    )}
                    {payroll.status === 'paid' && (
                      <button className="btn btn-sm btn-outline" onClick={() => handleDownloadPayslip(payroll)}
                        style={{ fontSize: '11px', padding: '4px 8px', color: 'var(--gold)', borderColor: 'var(--gold)' }}>
                        <i className="fas fa-download"></i> Payslip
                      </button>
                    )}
                    <button className="btn btn-sm btn-outline" onClick={() => setSelectedPayroll(payroll)}
                      style={{ fontSize: '11px', padding: '4px 8px' }}>
                      <i className="fas fa-eye"></i> View
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredPayrolls.length === 0 && (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>
                  <div className="empty-state small">
                    <i className="fas fa-money-bill"></i>
                    <p>No payroll records found</p>
                    <button className="btn btn-primary" onClick={() => setShowPayrollModal(true)}>
                      <i className="fas fa-plus"></i> Process First Payroll
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Payroll Detail Modal */}
      {selectedPayroll && (
        <div className="admin-modal" onClick={() => setSelectedPayroll(null)}>
          <div className="admin-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '550px' }}>
            <div className="admin-modal-header">
              <h3><i className="fas fa-file-invoice"></i> Payroll Details</h3>
              <button className="admin-modal-close" onClick={() => setSelectedPayroll(null)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="admin-modal-body">
              <div className="booking-detail-grid">
                <div className="detail-item">
                  <label>Staff Member</label>
                  <p>{selectedPayroll.staffName || 'N/A'}</p>
                </div>
                <div className="detail-item">
                  <label>Period</label>
                  <p>{selectedPayroll.payrollPeriod || 'N/A'}</p>
                </div>
                <div className="detail-item">
                  <label>Status</label>
                  <span className="status-badge" style={{
                    background: getStatusColor(selectedPayroll.status).bg,
                    color: getStatusColor(selectedPayroll.status).color
                  }}>
                    {selectedPayroll.status}
                  </span>
                </div>
                <div className="detail-item">
                  <label>Payment Date</label>
                  <p>{selectedPayroll.paymentDate ? new Date(selectedPayroll.paymentDate).toLocaleDateString() : 'Not paid'}</p>
                </div>
              </div>

              <div style={{ marginTop: '1.5rem', background: 'var(--soft)', padding: '1.5rem', borderRadius: '12px' }}>
                <h4 style={{ marginBottom: '1rem', color: 'var(--gold)' }}>Earnings Breakdown</h4>
                <div className="payroll-row">
                  <span>Base Salary</span>
                  <span>R{(selectedPayroll.baseSalary || 0).toFixed(2)}</span>
                </div>
                <div className="payroll-row">
                  <span>Bonuses</span>
                  <span style={{ color: 'var(--success)' }}>+R{(selectedPayroll.bonuses || 0).toFixed(2)}</span>
                </div>
                <div className="payroll-row">
                  <span>Deductions</span>
                  <span style={{ color: 'var(--error)' }}>-R{(selectedPayroll.deductions || 0).toFixed(2)}</span>
                </div>
                <div className="payroll-row">
                  <span>Leave Deductions</span>
                  <span style={{ color: 'var(--error)' }}>-R{(selectedPayroll.leaveDeductions || 0).toFixed(2)}</span>
                </div>
                <div className="payroll-row total" style={{ borderTop: '2px solid var(--gold)', paddingTop: '0.5rem', marginTop: '0.5rem', fontWeight: 'bold', fontSize: '1.1rem' }}>
                  <span>Total Earnings</span>
                  <span>R{(selectedPayroll.totalEarnings || 0).toFixed(2)}</span>
                </div>
              </div>

              {selectedPayroll.notes && (
                <div className="detail-item full-width" style={{ marginTop: '1rem' }}>
                  <label>Notes</label>
                  <p>{selectedPayroll.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Process Payroll Modal */}
      {showPayrollModal && (
        <ProcessPayrollModal
          onClose={() => setShowPayrollModal(false)}
          onSuccess={() => { setShowPayrollModal(false); fetchPayrolls(); }}
        />
      )}
    </div>
  );
};

export default PayrollManagement;