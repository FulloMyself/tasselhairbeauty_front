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
    image: '',
    additionalImages: '',
    isActive: true,
    isFeatured: false,
    tags: ''
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
      const payload = {
        name: formData.name,
        category: formData.category,
        description: formData.description,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity),
        brand: formData.brand,
        sku: formData.sku,
        image: formData.image || null,
        images: formData.additionalImages 
          ? formData.additionalImages.split('\n').map(url => url.trim()).filter(Boolean)
          : [],
        isActive: formData.isActive,
        isFeatured: formData.isFeatured,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : []
      };

      await api.post('/admin/products', payload);
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
            {/* Product Name */}
            <div className="form-group">
              <label><i className="fas fa-tag"></i> Product Name *</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="e.g., Argan Oil Serum" />
            </div>
            
            {/* Category & Brand */}
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
            
            {/* Description */}
            <div className="form-group">
              <label><i className="fas fa-pen"></i> Description *</label>
              <textarea name="description" value={formData.description} onChange={handleChange} required rows="3" placeholder="Describe the product..." />
            </div>
            
            {/* Price & Quantity */}
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
            
            {/* SKU & Active */}
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

            {/* Main Image URL */}
            <div className="form-group">
              <label><i className="fas fa-image"></i> Main Image URL</label>
              <input 
                type="text" 
                name="image" 
                value={formData.image} 
                onChange={handleChange} 
                placeholder="/assets/images/product-image.jpg or full URL" 
              />
              {formData.image && (
                <div style={{ marginTop: '8px' }}>
                  <img 
                    src={formData.image} 
                    alt="Product preview" 
                    style={{ 
                      width: '100%', 
                      maxHeight: '200px', 
                      objectFit: 'cover', 
                      borderRadius: '8px',
                      border: '1px solid var(--light)'
                    }}
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>
              )}
              <small style={{ color: 'var(--muted)', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
                Enter a URL for the product image. Use images from your assets folder.
              </small>
            </div>

            {/* Additional Images */}
            <div className="form-group">
              <label><i className="fas fa-images"></i> Additional Image URLs (one per line)</label>
              <textarea 
                name="additionalImages" 
                value={formData.additionalImages} 
                onChange={handleChange} 
                rows="2"
                placeholder="/assets/images/image1.jpg&#10;/assets/images/image2.jpg" 
              />
            </div>

            {/* Featured & Tags */}
            <div className="form-row">
              <div className="form-group">
                <label><i className="fas fa-star"></i> Featured Product</label>
                <label className="checkbox-label" style={{ marginTop: '8px' }}>
                  <input type="checkbox" name="isFeatured" checked={formData.isFeatured} onChange={handleChange} />
                  <span>Show on homepage</span>
                </label>
              </div>
              <div className="form-group">
                <label><i className="fas fa-tags"></i> Tags (comma-separated)</label>
                <input type="text" name="tags" value={formData.tags} onChange={handleChange} placeholder="e.g., popular, new, sale" />
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