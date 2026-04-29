import React, { useState } from 'react';
import api from '../../utils/api';

const AddProductModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    price: '',
    quantity: '',
    brand: '',
    sku: '',
    isActive: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = ['Hair Care', 'Nail Care', "Men's Grooming", 'Skincare', 'Accessories'];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/admin/products', formData);
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-modal" onClick={onClose}>
      <div className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h3><i className="fas fa-box"></i> Add New Product</h3>
          <button className="admin-modal-close" onClick={onClose}><i className="fas fa-times"></i></button>
        </div>
        
        {error && <div className="admin-alert admin-alert-error"><i className="fas fa-exclamation-circle"></i> {error}</div>}
        
        <form onSubmit={handleSubmit} className="admin-form">
          <div className="admin-modal-body">
            <div className="form-group">
              <label><i className="fas fa-tag"></i> Product Name *</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="e.g., Argan Oil Serum" />
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
                <label><i className="fas fa-trademark"></i> Brand</label>
                <input type="text" name="brand" value={formData.brand} onChange={handleChange} placeholder="e.g., Tassel Professional" />
              </div>
            </div>
            
            <div className="form-group">
              <label><i className="fas fa-pen"></i> Description *</label>
              <textarea name="description" value={formData.description} onChange={handleChange} required rows="3" placeholder="Describe the product..." />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label><i className="fas fa-money-bill"></i> Price (R) *</label>
                <input type="number" name="price" value={formData.price} onChange={handleChange} required min="0" step="0.01" placeholder="299" />
              </div>
              <div className="form-group">
                <label><i className="fas fa-cubes"></i> Stock Quantity *</label>
                <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} required min="0" placeholder="25" />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label><i className="fas fa-barcode"></i> SKU</label>
                <input type="text" name="sku" value={formData.sku} onChange={handleChange} placeholder="e.g., TAS-HC-001" />
              </div>
              <div className="form-group">
                <label><i className="fas fa-check-circle"></i> Active</label>
                <label className="checkbox-label" style={{ marginTop: '8px' }}>
                  <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} />
                  <span>Product is available for sale</span>
                </label>
              </div>
            </div>
          </div>
          
          <div className="admin-modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <><i className="fas fa-spinner fa-spin"></i> Creating...</> : <><i className="fas fa-plus"></i> Create Product</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;