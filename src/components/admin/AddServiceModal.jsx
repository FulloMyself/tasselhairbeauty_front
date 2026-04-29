import React, { useState } from 'react';
import api from '../../utils/api';

const AddServiceModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    basePrice: '',
    estimatedDuration: '',
    isAvailable: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = ['Kiddies Hair', 'Barber', 'Adult Hair', 'Nails', 'Skin & Beauty'];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ 
      ...formData, 
      [name]: type === 'checkbox' ? checked : value 
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/admin/services', formData);
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create service');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-modal" onClick={onClose}>
      <div className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h3><i className="fas fa-cut"></i> Add New Service</h3>
          <button className="admin-modal-close" onClick={onClose}><i className="fas fa-times"></i></button>
        </div>
        
        {error && <div className="admin-alert admin-alert-error"><i className="fas fa-exclamation-circle"></i> {error}</div>}
        
        <form onSubmit={handleSubmit} className="admin-form">
          <div className="admin-modal-body">
            <div className="form-group">
              <label><i className="fas fa-tag"></i> Service Name *</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="e.g., Signature Haircut" />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label><i className="fas fa-list"></i> Category *</label>
                <select name="category" value={formData.category} onChange={handleChange} required>
                  <option value="">Select category</option>
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label><i className="fas fa-clock"></i> Duration (mins) *</label>
                <input type="number" name="estimatedDuration" value={formData.estimatedDuration} onChange={handleChange} required min="15" step="15" placeholder="60" />
              </div>
            </div>
            
            <div className="form-group">
              <label><i className="fas fa-pen"></i> Description *</label>
              <textarea name="description" value={formData.description} onChange={handleChange} required rows="3" placeholder="Describe the service..." />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label><i className="fas fa-money-bill"></i> Price (R) *</label>
                <input type="number" name="basePrice" value={formData.basePrice} onChange={handleChange} required min="0" step="0.01" placeholder="350" />
              </div>
              <div className="form-group">
                <label><i className="fas fa-check-circle"></i> Available</label>
                <label className="checkbox-label" style={{ marginTop: '8px' }}>
                  <input type="checkbox" name="isAvailable" checked={formData.isAvailable} onChange={handleChange} />
                  <span>Service is available for booking</span>
                </label>
              </div>
            </div>
          </div>
          
          <div className="admin-modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <><i className="fas fa-spinner fa-spin"></i> Creating...</> : <><i className="fas fa-plus"></i> Create Service</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddServiceModal;