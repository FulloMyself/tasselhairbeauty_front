import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useCart } from '../../context/CartContext';

const ProductBrowser = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [addMessage, setAddMessage] = useState(null);
  const itemsPerPage = 12;
  const { addItem } = useCart();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/customer/products');
      setProducts(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['all', ...new Set(products.map(p => p.category))];

  // Filter, sort, and paginate
  const filteredProducts = products.filter(p => {
    const categoryMatch = activeCategory === 'all' || p.category === activeCategory;
    if (!searchTerm.trim()) return categoryMatch;
    const search = searchTerm.toLowerCase();
    return categoryMatch && (
      p.name?.toLowerCase().includes(search) ||
      p.brand?.toLowerCase().includes(search) ||
      p.description?.toLowerCase().includes(search) ||
      p.sku?.toLowerCase().includes(search)
    );
  }).sort((a, b) => {
    switch (sortBy) {
      case 'price-low': return a.price - b.price;
      case 'price-high': return b.price - a.price;
      case 'name': return a.name.localeCompare(b.name);
      case 'brand': return (a.brand || '').localeCompare(b.brand || '');
      default: return 0;
    }
  });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStockBadge = (quantity) => {
    if (quantity === 0) return { text: 'Out of Stock', class: 'out-of-stock' };
    if (quantity <= 5) return { text: `Only ${quantity} left`, class: 'low-stock' };
    return { text: 'In Stock', class: 'in-stock' };
  };

  const handleAddToCart = (product, e) => {
    e.stopPropagation();
    addItem({ id: product._id, name: product.name, price: product.price, image: product.image });
    setAddMessage(`${product.name} added to cart!`);
    setTimeout(() => setAddMessage(null), 2000);
  };

  if (loading) return (
    <div className="loading-spinner">
      <i className="fas fa-spinner fa-spin"></i> Loading products...
    </div>
  );

  return (
    <div className="product-browser">
      <div className="service-browser-header">
        <h1>Shop Products</h1>
        <p>Browse our professional haircare, skincare, and beauty products</p>
        
        {/* Search & Sort */}
        <div className="product-controls">
          <div className="service-search">
            <i className="fas fa-search"></i>
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
            {searchTerm && (
              <button className="search-clear" onClick={() => setSearchTerm('')}>
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="name">Sort by Name</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="brand">Sort by Brand</option>
          </select>
        </div>
      </div>

      {/* Add to Cart Message */}
      {addMessage && (
        <div className="cart-message">
          <i className="fas fa-check-circle"></i> {addMessage}
        </div>
      )}

      {/* Category Navigation */}
      <div className="category-nav">
        {categories.map(cat => (
          <button
            key={cat}
            className={`category-nav-btn ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => { setActiveCategory(cat); setCurrentPage(1); }}
          >
            <span>{cat === 'all' ? 'All Products' : cat}</span>
            <span className="category-count">
              {cat === 'all' ? products.length : products.filter(p => p.category === cat).length}
            </span>
          </button>
        ))}
      </div>

      {/* Results Info */}
      <div className="results-info">
        <span>{filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found</span>
      </div>

      {/* Products Grid */}
      <div className="products-grid-customer">
        {paginatedProducts.map(product => {
          const stock = getStockBadge(product.quantity);
          return (
            <div key={product._id} className="product-card-customer" onClick={() => setSelectedProduct(product)}>
              <div className="product-card-image">
                {product.image ? (
                  <img src={product.image} alt={product.name} />
                ) : (
                  <div className="product-image-placeholder">
                    <i className="fas fa-box"></i>
                  </div>
                )}
                <span className={`stock-badge ${stock.class}`}>{stock.text}</span>
              </div>
              <div className="product-card-body">
                {product.brand && <span className="product-brand">{product.brand}</span>}
                <h3>{product.name}</h3>
                <p className="product-card-desc">{product.description?.substring(0, 60)}...</p>
                <div className="product-price-row">
                  <span className="product-price">R{product.price?.toFixed(2)}</span>
                  {product.sku && <span className="product-sku">SKU: {product.sku}</span>}
                </div>
                <button 
                  className="btn btn-primary btn-sm" 
                  onClick={(e) => handleAddToCart(product, e)}
                  disabled={product.quantity === 0}
                >
                  <i className="fas fa-cart-plus"></i> {product.quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button 
            className="pagination-btn" 
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            <i className="fas fa-chevron-left"></i>
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button key={page} className={`pagination-btn ${currentPage === page ? 'active' : ''}`} onClick={() => setCurrentPage(page)}>
              {page}
            </button>
          ))}
          <button 
            className="pagination-btn" 
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>
      )}

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="admin-modal" onClick={() => setSelectedProduct(null)}>
          <div className="admin-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="admin-modal-header">
              <h3>{selectedProduct.name}</h3>
              <button className="admin-modal-close" onClick={() => setSelectedProduct(null)}><i className="fas fa-times"></i></button>
            </div>
            <div className="admin-modal-body">
              {selectedProduct.image && (
                <img src={selectedProduct.image} alt={selectedProduct.name} style={{ width: '100%', borderRadius: '12px', marginBottom: '1rem', maxHeight: '300px', objectFit: 'cover' }} />
              )}
              {selectedProduct.brand && <p className="product-brand-large">{selectedProduct.brand}</p>}
              <p>{selectedProduct.description}</p>
              <div className="product-detail-meta">
                <div className="meta-item">
                  <i className="fas fa-money-bill"></i>
                  <span>R{selectedProduct.price?.toFixed(2)}</span>
                </div>
                <div className="meta-item">
                  <i className="fas fa-boxes"></i>
                  <span>{getStockBadge(selectedProduct.quantity).text}</span>
                </div>
                {selectedProduct.sku && (
                  <div className="meta-item">
                    <i className="fas fa-barcode"></i>
                    <span>SKU: {selectedProduct.sku}</span>
                  </div>
                )}
              </div>
              <button 
                className="btn btn-primary" 
                style={{ width: '100%', marginTop: '1rem' }}
                onClick={(e) => handleAddToCart(selectedProduct, e)}
                disabled={selectedProduct.quantity === 0}
              >
                <i className="fas fa-cart-plus"></i> {selectedProduct.quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductBrowser;