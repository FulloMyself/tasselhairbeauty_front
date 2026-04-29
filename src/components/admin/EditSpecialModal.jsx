import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const EditSpecialModal = ({ special, onClose, onSuccess }) => {
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
    if (special) {
      setFormData({
        title: special.title || '',
        description: special.description || '',
        type: special.type || 'general',
        discountType: special.discountType || 'percentage',
        discountValue: special.discountValue?.toString() || '',
        serviceIds: special.services?.map(s => s._id || s) || [],
        productIds: special.products?.map(p => p._id || p) || [],
        originalPrice: special.originalPrice?.toString() || '',
        poster: special.poster || '',
        startDate: special.startDate ? new Date(special.startDate).toISOString().split('T')[0] : '',
        endDate: special.endDate ? new Date(special.endDate).toISOString().split('T')[0] : '',
        isActive: special.isActive ?? true,
        isFeatured: special.isFeatured ?? false,
        tags: special.tags?.join(', ') || '',
        termsAndConditions: special.termsAndConditions || ''
      });
    }
    fetchServicesAndProducts();
  }, [special]);

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

      await api.put(`/admin/specials/${special._id}`, payload);
      onSuccess?.();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update special');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-modal" onClick={onClose}>
      <div className="admin-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="admin-modal-header">
          <h3><i className="fas fa-edit"></i> Edit Special</h3>
          <button className="admin-modal-close" onClick={onClose}><i className="fas fa-times"></i></button>
        </div>
        
        {error && (
          <div className="admin-alert admin-alert-error">
            <i className="fas fa-exclamation-circle"></i> {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="admin-form">
          <div className="admin-modal-body">
            <div className="form-group">
              <label><i className="fas fa-heading"></i> Title *</label>
              <input type="text" name="title" value={formData.title} onChange={handleChange} required />
            </div>
            
            <div className="form-group">
              <label><i className="fas fa-pen"></i> Description *</label>
              <textarea name="description" value={formData.description} onChange={handleChange} required rows="3" />
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
                <input type="number" name="discountValue" value={formData.discountValue} onChange={handleChange} required min="0" step="0.01" />
              </div>
              <div className="form-group">
                <label><i className="fas fa-money-bill"></i> Original Price</label>
                <input type="number" name="originalPrice" value={formData.originalPrice} onChange={handleChange} min="0" step="0.01" />
              </div>
            </div>
            
            {formData.originalPrice > 0 && formData.discountValue > 0 && (
              <div style={{ padding: '1rem', background: 'var(--soft)', borderRadius: '8px', marginBottom: '1rem' }}>
                <p style={{ margin: 0 }}>
                  Discounted Price: <strong>R{calculateDiscountedPrice().toFixed(2)}</strong>
                </p>
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
              {formData.poster && (
                <img src={formData.poster} alt="Poster preview" style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '8px', marginTop: '0.5rem' }} />
              )}
            </div>
            
            {(formData.type === 'service' || formData.type === 'bundle') && services.length > 0 && (
              <div className="form-group">
                <label><i className="fas fa-cut"></i> Services</label>
                <div className="checkbox-grid">
                  {services.slice(0, 12).map(s => (
                    <label key={s._id} className="checkbox-label">
                      <input 
                        type="checkbox" 
                        checked={formData.serviceIds.includes(s._id)} 
                        onChange={() => handleServiceToggle(s._id)} 
                      />
                      <span>{s.name} - R{s.basePrice}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
            
            {(formData.type === 'product' || formData.type === 'bundle') && products.length > 0 && (
              <div className="form-group">
                <label><i className="fas fa-box"></i> Products</label>
                <div className="checkbox-grid">
                  {products.slice(0, 12).map(p => (
                    <label key={p._id} className="checkbox-label">
                      <input 
                        type="checkbox" 
                        checked={formData.productIds.includes(p._id)} 
                        onChange={() => handleProductToggle(p._id)} 
                      />
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
                  <span>Active</span>
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
              {loading ? (
                <><i className="fas fa-spinner fa-spin"></i> Saving...</>
              ) : (
                <><i className="fas fa-save"></i> Save Changes</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSpecialModal;