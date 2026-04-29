import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const EditServiceModal = ({ service, onClose, onSuccess }) => {
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

  useEffect(() => {
    if (service) {
      setFormData({
        name: service.name || '',
        category: service.category || '',
        description: service.description || '',
        basePrice: service.basePrice?.toString() || '',
        estimatedDuration: service.estimatedDuration?.toString() || '',
        isAvailable: service.isAvailable ?? true
      });
    }
  }, [service]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.put(`/admin/services/${service._id}`, {
        ...formData,
        basePrice: parseFloat(formData.basePrice),
        estimatedDuration: parseInt(formData.estimatedDuration)
      });
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update service');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-modal" onClick={onClose}>
      <div className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h3><i className="fas fa-edit"></i> Edit Service</h3>
          <button className="admin-modal-close" onClick={onClose}><i className="fas fa-times"></i></button>
        </div>
        
        {error && <div className="admin-alert admin-alert-error"><i className="fas fa-exclamation-circle"></i> {error}</div>}
        
        <form onSubmit={handleSubmit} className="admin-form">
          <div className="admin-modal-body">
            <div className="form-group">
              <label>Service Name *</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Category *</label>
                <select name="category" value={formData.category} onChange={handleChange} required>
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Duration (mins) *</label>
                <input type="number" name="estimatedDuration" value={formData.estimatedDuration} onChange={handleChange} required min="15" />
              </div>
            </div>
            <div className="form-group">
              <label>Description *</label>
              <textarea name="description" value={formData.description} onChange={handleChange} required rows="3" />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Price (R) *</label>
                <input type="number" name="basePrice" value={formData.basePrice} onChange={handleChange} required min="0" step="0.01" />
              </div>
              <div className="form-group">
                <label>Available</label>
                <label className="checkbox-label" style={{ marginTop: '8px' }}>
                  <input type="checkbox" name="isAvailable" checked={formData.isAvailable} onChange={handleChange} />
                  <span>Available for booking</span>
                </label>
              </div>
            </div>
          </div>
          <div className="admin-modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <><i className="fas fa-spinner fa-spin"></i> Saving...</> : <><i className="fas fa-save"></i> Save Changes</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditServiceModal;