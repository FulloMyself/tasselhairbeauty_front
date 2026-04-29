import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const AddSpecialModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'general',
    discountType: 'percentage',
    discountValue: '',
    serviceIds: [],
    productIds: [],
    originalPrice: '',
    poster: '',
    startDate: '',
    endDate: '',
    isActive: true,
    isFeatured: false,
    tags: '',
    termsAndConditions: ''
  });
  const [services, setServices] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchServicesAndProducts();
  }, []);

  const fetchServicesAndProducts = async () => {
    try {
      const [servicesRes, productsRes] = await Promise.all([
        api.get('/admin/services'),
        api.get('/admin/products')
      ]);
      setServices(servicesRes.data.data || []);
      setProducts(productsRes.data.data || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox' && (name === 'serviceIds' || name === 'productIds')) {
      // Handle multi-select
      return;
    }
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleServiceToggle = (serviceId) => {
    setFormData(prev => ({
      ...prev,
      serviceIds: prev.serviceIds.includes(serviceId)
        ? prev.serviceIds.filter(id => id !== serviceId)
        : [...prev.serviceIds, serviceId]
    }));
  };

  const handleProductToggle = (productId) => {
    setFormData(prev => ({
      ...prev,
      productIds: prev.productIds.includes(productId)
        ? prev.productIds.filter(id => id !== productId)
        : [...prev.productIds, productId]
    }));
  };

  const calculateDiscountedPrice = () => {
    if (!formData.originalPrice || !formData.discountValue) return 0;
    const original = parseFloat(formData.originalPrice);
    const discount = parseFloat(formData.discountValue);
    if (formData.discountType === 'percentage') {
      return original * (1 - discount / 100);
    }
    return Math.max(0, original - discount);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        ...formData,
        discountValue: parseFloat(formData.discountValue),
        originalPrice: parseFloat(formData.originalPrice) || 0,
        discountedPrice: calculateDiscountedPrice(),
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
      };

      await api.post('/admin/specials', payload);
      onSuccess?.();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create special');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-modal" onClick={onClose}>
      <div className="admin-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="admin-modal-header">
          <h3><i className="fas fa-tag"></i> Add New Special</h3>
          <button className="admin-modal-close" onClick={onClose}><i className="fas fa-times"></i></button>
        </div>
        {error && <div className="admin-alert admin-alert-error"><i className="fas fa-exclamation-circle"></i> {error}</div>}
        <form onSubmit={handleSubmit} className="admin-form">
          <div className="admin-modal-body">
            <div className="form-group">
              <label><i className="fas fa-heading"></i> Title *</label>
              <input type="text" name="title" value={formData.title} onChange={handleChange} required placeholder="e.g., Midweek Glow Special" />
            </div>
            <div className="form-group">
              <label><i className="fas fa-pen"></i> Description *</label>
              <textarea name="description" value={formData.description} onChange={handleChange} required rows="3" placeholder="Describe the special offer..." />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label><i className="fas fa-tag"></i> Type</label>
                <select name="type" value={formData.type} onChange={handleChange}>
                  <option value="general">General</option>
                  <option value="service">Service</option>
                  <option value="product">Product</option>
                  <option value="bundle">Bundle</option>
                </select>
              </div>
              <div className="form-group">
                <label><i className="fas fa-percent"></i> Discount Type</label>
                <select name="discountType" value={formData.discountType} onChange={handleChange}>
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (R)</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label><i className="fas fa-tag"></i> Discount Value *</label>
                <input type="number" name="discountValue" value={formData.discountValue} onChange={handleChange} required min="0" step="0.01" placeholder={formData.discountType === 'percentage' ? 'e.g., 20' : 'e.g., 100'} />
              </div>
              <div className="form-group">
                <label><i className="fas fa-money-bill"></i> Original Price (optional)</label>
                <input type="number" name="originalPrice" value={formData.originalPrice} onChange={handleChange} min="0" step="0.01" placeholder="e.g., 550" />
              </div>
            </div>
            {formData.originalPrice > 0 && formData.discountValue > 0 && (
              <div style={{ padding: '1rem', background: 'var(--soft)', borderRadius: '8px', marginBottom: '1rem' }}>
                <p style={{ margin: 0 }}>Discounted Price: <strong>R{calculateDiscountedPrice().toFixed(2)}</strong></p>
              </div>
            )}
            <div className="form-row">
              <div className="form-group">
                <label><i className="fas fa-calendar"></i> Start Date *</label>
                <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label><i className="fas fa-calendar-check"></i> End Date *</label>
                <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} required />
              </div>
            </div>
            <div className="form-group">
              <label><i className="fas fa-image"></i> Poster URL</label>
              <input type="text" name="poster" value={formData.poster} onChange={handleChange} placeholder="/assets/specials/your-poster.jpeg" />
            </div>
            {(formData.type === 'service' || formData.type === 'bundle') && (
              <div className="form-group">
                <label><i className="fas fa-cut"></i> Services</label>
                <div className="checkbox-grid">
                  {services.slice(0, 10).map(s => (
                    <label key={s._id} className="checkbox-label">
                      <input type="checkbox" checked={formData.serviceIds.includes(s._id)} onChange={() => handleServiceToggle(s._id)} />
                      <span>{s.name} - R{s.basePrice}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
            {(formData.type === 'product' || formData.type === 'bundle') && (
              <div className="form-group">
                <label><i className="fas fa-box"></i> Products</label>
                <div className="checkbox-grid">
                  {products.slice(0, 10).map(p => (
                    <label key={p._id} className="checkbox-label">
                      <input type="checkbox" checked={formData.productIds.includes(p._id)} onChange={() => handleProductToggle(p._id)} />
                      <span>{p.name} - R{p.price}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
            <div className="form-group">
              <label><i className="fas fa-tags"></i> Tags (comma-separated)</label>
              <input type="text" name="tags" value={formData.tags} onChange={handleChange} placeholder="e.g., summer, glow, beauty" />
            </div>
            <div className="form-group">
              <label><i className="fas fa-file-contract"></i> Terms & Conditions</label>
              <textarea name="termsAndConditions" value={formData.termsAndConditions} onChange={handleChange} rows="2" placeholder="Any terms and conditions..." />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="checkbox-label">
                  <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} />
                  <span>Active immediately</span>
                </label>
              </div>
              <div className="form-group">
                <label className="checkbox-label">
                  <input type="checkbox" name="isFeatured" checked={formData.isFeatured} onChange={handleChange} />
                  <span>Featured special</span>
                </label>
              </div>
            </div>
          </div>
          <div className="admin-modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <><i className="fas fa-spinner fa-spin"></i> Creating...</> : <><i className="fas fa-plus"></i> Create Special</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSpecialModal;