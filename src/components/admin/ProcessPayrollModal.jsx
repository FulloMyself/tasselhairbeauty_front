import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const ProcessPayrollModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    payrollPeriod: new Date().toISOString().slice(0, 7), // Current YYYY-MM
    staffId: '',
    baseSalary: '',
    bonuses: '0',
    deductions: '0',
    leaveDeductions: '0',
    notes: ''
  });
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchStaffList();
  }, []);

  const fetchStaffList = async () => {
    try {
      const response = await api.get('/admin/users');
      const staff = response.data.data?.filter(u => u.role === 'staff' && u.isActive) || [];
      setStaffList(staff);
    } catch (error) {
      console.error('Failed to fetch staff:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Auto-fill base salary when staff is selected
    if (name === 'staffId' && value) {
      const selectedStaff = staffList.find(s => s._id === value);
      if (selectedStaff?.staffProfile?.baseSalary) {
        setFormData(prev => ({
          ...prev,
          baseSalary: selectedStaff.staffProfile.baseSalary.toString()
        }));
      }
    }
  };

  const calculateTotal = () => {
    const base = parseFloat(formData.baseSalary) || 0;
    const bonuses = parseFloat(formData.bonuses) || 0;
    const deductions = parseFloat(formData.deductions) || 0;
    const leaveDeductions = parseFloat(formData.leaveDeductions) || 0;
    return base + bonuses - deductions - leaveDeductions;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        ...formData,
        baseSalary: parseFloat(formData.baseSalary),
        bonuses: parseFloat(formData.bonuses),
        deductions: parseFloat(formData.deductions),
        leaveDeductions: parseFloat(formData.leaveDeductions),
        totalEarnings: calculateTotal()
      };

      await api.post('/admin/payroll', payload);
      setSuccess('Payroll processed successfully!');
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to process payroll');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-modal" onClick={onClose}>
      <div className="admin-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '550px' }}>
        <div className="admin-modal-header">
          <h3><i className="fas fa-file-invoice"></i> Process Payroll</h3>
          <button className="admin-modal-close" onClick={onClose}><i className="fas fa-times"></i></button>
        </div>
        
        {error && <div className="admin-alert admin-alert-error"><i className="fas fa-exclamation-circle"></i> {error}</div>}
        {success && <div className="admin-alert admin-alert-success"><i className="fas fa-check-circle"></i> {success}</div>}
        
        <form onSubmit={handleSubmit} className="admin-form">
          <div className="admin-modal-body">
            <div className="form-row">
              <div className="form-group">
                <label><i className="fas fa-calendar"></i> Payroll Period *</label>
                <input type="month" name="payrollPeriod" value={formData.payrollPeriod} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label><i className="fas fa-user-tie"></i> Staff Member *</label>
                <select name="staffId" value={formData.staffId} onChange={handleChange} required>
                  <option value="">Select staff member</option>
                  {staffList.map(staff => (
                    <option key={staff._id} value={staff._id}>
                      {staff.firstName} {staff.lastName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="form-group">
              <label><i className="fas fa-money-bill"></i> Base Salary (R) *</label>
              <input type="number" name="baseSalary" value={formData.baseSalary} onChange={handleChange} required min="0" step="0.01" />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label><i className="fas fa-gift"></i> Bonuses (R)</label>
                <input type="number" name="bonuses" value={formData.bonuses} onChange={handleChange} min="0" step="0.01" />
              </div>
              <div className="form-group">
                <label><i className="fas fa-minus-circle"></i> Deductions (R)</label>
                <input type="number" name="deductions" value={formData.deductions} onChange={handleChange} min="0" step="0.01" />
              </div>
            </div>
            
            <div className="form-group">
              <label><i className="fas fa-umbrella-beach"></i> Leave Deductions (R)</label>
              <input type="number" name="leaveDeductions" value={formData.leaveDeductions} onChange={handleChange} min="0" step="0.01" />
            </div>
            
            <div className="form-group">
              <label><i className="fas fa-pen"></i> Notes</label>
              <textarea name="notes" value={formData.notes} onChange={handleChange} rows="2" placeholder="Any additional notes..." />
            </div>
            
            <div className="payroll-summary">
              <h4>Summary</h4>
              <div className="payroll-row">
                <span>Base Salary:</span>
                <span>R{parseFloat(formData.baseSalary || 0).toFixed(2)}</span>
              </div>
              <div className="payroll-row">
                <span>Bonuses:</span>
                <span className="text-success">+R{parseFloat(formData.bonuses || 0).toFixed(2)}</span>
              </div>
              <div className="payroll-row">
                <span>Deductions:</span>
                <span className="text-error">-R{parseFloat(formData.deductions || 0).toFixed(2)}</span>
              </div>
              <div className="payroll-row">
                <span>Leave Deductions:</span>
                <span className="text-error">-R{parseFloat(formData.leaveDeductions || 0).toFixed(2)}</span>
              </div>
              <div className="payroll-row total">
                <span>Total Earnings:</span>
                <span>R{calculateTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          <div className="admin-modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <><i className="fas fa-spinner fa-spin"></i> Processing...</> : <><i className="fas fa-check"></i> Process Payroll</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProcessPayrollModal;