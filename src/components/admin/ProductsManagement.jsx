import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import AddProductModal from './AddProductModal';
import EditProductModal from './EditProductModal';
import ConfirmDialog from './ConfirmDialog';

const ProductsManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);

  const categories = ['all', ...new Set(products.map(p => p.category))];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/admin/products');
      setProducts(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(p => {
    const categoryMatch = filter === 'all' || p.category === filter;
    if (!searchTerm.trim()) return categoryMatch;
    const search = searchTerm.toLowerCase();
    return categoryMatch && (
      p.name?.toLowerCase().includes(search) ||
      p.category?.toLowerCase().includes(search) ||
      p.brand?.toLowerCase().includes(search) ||
      p.sku?.toLowerCase().includes(search)
    );
  });

  const handleDelete = (product) => {
    setConfirmDialog({
      title: 'Delete Product',
      message: `Are you sure you want to delete "${product.name}"?`,
      confirmText: 'Delete',
      type: 'danger',
      onConfirm: async () => {
        try {
          await api.delete(`/admin/products/${product._id}`);
          fetchProducts();
          setConfirmDialog(null);
        } catch (error) {
          alert('Failed to delete product');
        }
      }
    });
  };

  const handleToggleActive = async (product) => {
    try {
      await api.put(`/admin/products/${product._id}`, { 
        isActive: !product.isActive 
      });
      fetchProducts();
    } catch (error) {
      alert('Failed to update product');
    }
  };

  if (loading) return (
    <div className="loading-spinner">
      <i className="fas fa-spinner fa-spin"></i> Loading products...
    </div>
  );

  return (
    <div className="products-management">
      <div className="section-header">
        <h2>Products Management</h2>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div className="admin-search">
            <i className="fas fa-search search-icon"></i>
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button className="search-clear" onClick={() => setSearchTerm('')}>
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            <i className="fas fa-plus"></i> Add Product
          </button>
        </div>
      </div>

      <div className="filter-tabs">
        {categories.map(cat => (
          <button 
            key={cat}
            className={`filter-tab ${filter === cat ? 'active' : ''}`} 
            onClick={() => setFilter(cat)}
          >
            {cat === 'all' ? 'All Products' : cat}
          </button>
        ))}
      </div>

      {searchTerm && (
        <div className="search-results-info">
          <i className="fas fa-search"></i>
          <span>Found <strong>{filteredProducts.length}</strong> result{filteredProducts.length !== 1 ? 's' : ''}</span>
          <button className="search-clear-link" onClick={() => setSearchTerm('')}>
            <i className="fas fa-times"></i> Clear
          </button>
        </div>
      )}

      <div className="users-table-wrapper">
        <table className="users-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Brand</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map(product => (
              <tr key={product._id}>
                <td>
                  <div>
                    <strong>{product.name}</strong>
                    {product.sku && (
                      <>
                        <br />
                        <small style={{ color: 'var(--muted)' }}>SKU: {product.sku}</small>
                      </>
                    )}
                  </div>
                </td>
                <td><span className="badge-category">{product.category}</span></td>
                <td>{product.brand || '-'}</td>
                <td>R{product.price?.toFixed(2)}</td>
                <td>
                  <span className={`stock-badge ${product.quantity <= 5 ? 'low-stock' : product.quantity === 0 ? 'out-of-stock' : 'in-stock'}`}>
                    {product.quantity === 0 ? 'Out of Stock' : product.quantity <= 5 ? `${product.quantity} left` : product.quantity}
                  </span>
                </td>
                <td>
                  <button 
                    className={`status-toggle ${product.isActive ? 'active' : 'inactive'}`}
                    onClick={() => handleToggleActive(product)}
                  >
                    <i className={`fas fa-${product.isActive ? 'check-circle' : 'times-circle'}`}></i>
                    {product.isActive ? ' Active' : ' Inactive'}
                  </button>
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="btn-icon" title="Edit" onClick={() => setEditingProduct(product)}>
                      <i className="fas fa-edit"></i>
                    </button>
                    <button className="btn-icon text-error" title="Delete" onClick={() => handleDelete(product)}>
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredProducts.length === 0 && (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                  <div className="empty-state small">
                    <i className="fas fa-box"></i>
                    <p>{searchTerm ? 'No products match your search' : 'No products found'}</p>
                    {!searchTerm && (
                      <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                        <i className="fas fa-plus"></i> Add Your First Product
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Stats Summary */}
      <div className="services-stats">
        <div className="stat-item">
          <span className="stat-number">{products.length}</span>
          <span className="stat-label">Total Products</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{products.filter(p => p.isActive).length}</span>
          <span className="stat-label">Active</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{products.filter(p => p.quantity <= 5 && p.quantity > 0).length}</span>
          <span className="stat-label">Low Stock</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{products.filter(p => p.quantity === 0).length}</span>
          <span className="stat-label">Out of Stock</span>
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <AddProductModal 
          onClose={() => setShowAddModal(false)} 
          onSuccess={() => { setShowAddModal(false); fetchProducts(); }} 
        />
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <EditProductModal 
          product={editingProduct}
          onClose={() => setEditingProduct(null)} 
          onSuccess={() => { setEditingProduct(null); fetchProducts(); }} 
        />
      )}

      {/* Confirm Dialog */}
      {confirmDialog && (
        <ConfirmDialog 
          {...confirmDialog}
          onCancel={() => setConfirmDialog(null)}
        />
      )}
    </div>
  );
};

export default ProductsManagement;