import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import api from '../utils/api';

const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '27729605153';

const ShopPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { items, total, itemCount, addItem, updateQuantity, removeItem, clearCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('/customer/products');
        setProducts(response.data.data || []);
      } catch (error) {
        console.error('Failed to load products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const categories = ['all', ...new Set(products.map(p => p.category).filter(Boolean))];

  const filteredProducts = products.filter(p => {
    const categoryMatch = activeCategory === 'all' || p.category === activeCategory;
    if (!searchTerm.trim()) return categoryMatch;
    const search = searchTerm.toLowerCase();
    return categoryMatch && (
      p.name?.toLowerCase().includes(search) ||
      p.brand?.toLowerCase().includes(search) ||
      p.description?.toLowerCase().includes(search)
    );
  });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleAddToCart = (product) => {
    addItem({
      id: product._id,
      name: product.name,
      price: product.price,
      image: product.displayImage || product.image,
      category: product.category
    });
  };

  const handleCheckout = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (items.length === 0) {
      alert('Your cart is empty');
      return;
    }

    setCheckoutLoading(true);
    try {
      const orderResponse = await api.post('/customer/orders', {
        items: items.map((item) => ({
          productId: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price
        })),
        totalAmount: total,
        notes: 'Customer order placed from web shop.',
        shippingAddress: user?.customerProfile?.address || ''
      });

      const orderNumber = orderResponse.data?.data?.orderNumber || 'N/A';

      const orderLines = items
        .map((item) => `• ${item.quantity}x ${item.name} @ R${item.price.toFixed(2)} = R${(item.price * item.quantity).toFixed(2)}`)
        .join('\n');

      const message = `🛍️ *NEW PRODUCT ORDER*\n\n` +
        `*Order #:* ${orderNumber}\n` +
        `*Customer:* ${user.firstName} ${user.lastName}\n` +
        `*Email:* ${user.email || 'N/A'}\n` +
        `*Phone:* ${user.phone || 'N/A'}\n\n` +
        `*Order Items:*\n${orderLines}\n\n` +
        `*Total:* R${total.toFixed(2)}\n\n` +
        `Please confirm this order and arrange payment/collection.`;

      window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');
      clearCart();
      alert(`Order ${orderNumber} placed successfully! We'll contact you via WhatsApp to confirm.`);
    } catch (error) {
      console.error('Checkout failed:', error);
      alert('Unable to place your order. Please try again later.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const getStockStatus = (quantity) => {
    if (quantity === 0) return { text: 'Out of Stock', class: 'out-of-stock' };
    if (quantity <= 5) return { text: `${quantity} left`, class: 'low-stock' };
    return { text: 'In Stock', class: 'in-stock' };
  };

  const getProductImage = (product) => {
    if (product.displayImage) return product.displayImage;
    if (product.image) return product.image;
    if (product.images && product.images.length > 0) return product.images[0];
    return null;
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Hair Care': '#c4a97d',
      'Nail Care': '#c4968a',
      "Men's Grooming": '#1a1a18',
      'Skincare': '#f0e8e2',
      'Accessories': '#9a8060'
    };
    return colors[category] || '#9a8060';
  };

  return (
    <div className="page-content customer-shop-page">
      {/* Back Navigation */}
      <div className="shop-back-navigation">
        <button className="back-nav-btn" onClick={() => navigate(-1)}>
          <i className="fas fa-arrow-left"></i> Back
        </button>
        <Link to="/dashboard" className="back-nav-btn">
          <i className="fas fa-home"></i> Dashboard
        </Link>
        <Link to="/booking" className="back-nav-btn">
          <i className="fas fa-calendar-check"></i> Book Appointment
        </Link>
      </div>

      <div className="page-header">
        <h1>Shop Products</h1>
        <p>Choose from our salon retail selection, then confirm your order via WhatsApp.</p>
        <div className="service-search" style={{ maxWidth: '400px', margin: '1rem auto' }}>
          <i className="fas fa-search"></i>
          <input type="text" placeholder="Search products..." value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} />
          {searchTerm && (
            <button className="search-clear" onClick={() => setSearchTerm('')}>
              <i className="fas fa-times"></i>
            </button>
          )}
        </div>
      </div>

      {categories.length > 1 && (
        <div className="category-nav">
          {categories.map(cat => (
            <button key={cat} className={`category-nav-btn ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => { setActiveCategory(cat); setCurrentPage(1); }}>
              {cat === 'all' ? 'All Products' : cat}
              <span className="category-count">
                {cat === 'all' ? products.length : products.filter(p => p.category === cat).length}
              </span>
            </button>
          ))}
        </div>
      )}

      <div className="shop-layout">
        <section className="product-grid">
          {loading ? (
            <div className="loading-spinner"><i className="fas fa-spinner fa-spin"></i> Loading products...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-box-open"></i>
              <p>No products found.</p>
            </div>
          ) : (
            <>
              <div className="results-info" style={{ marginBottom: '1rem' }}>
                Showing {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
              </div>
              <div className="product-grid-container">
                {paginatedProducts.map((product) => {
                  const stock = getStockStatus(product.quantity);
                  const productImage = getProductImage(product);
                  const categoryColor = getCategoryColor(product.category);
                  
                  return (
                    <div key={product._id} className="product-card-customer">
                      <div className="product-card-image">
                        {productImage ? (
                          <img 
                            src={productImage} 
                            alt={product.name}
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.parentNode.querySelector('.product-image-placeholder').style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div 
                          className="product-image-placeholder" 
                          style={{ 
                            display: productImage ? 'none' : 'flex',
                            background: `linear-gradient(135deg, ${categoryColor} 0%, ${categoryColor}dd 100%)`
                          }}
                        >
                          <i className="fas fa-box" style={{ color: 'white', fontSize: '2.5rem', opacity: 0.7 }}></i>
                        </div>
                        <span className={`stock-badge ${stock.class}`}>{stock.text}</span>
                        {product.isFeatured && (
                          <span className="featured-product-badge">
                            <i className="fas fa-star"></i> Featured
                          </span>
                        )}
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
                          onClick={() => handleAddToCart(product)}
                          disabled={product.quantity === 0}
                          style={{ width: '100%' }}
                        >
                          <i className="fas fa-cart-plus"></i> {product.quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              {totalPages > 1 && (
                <div className="pagination">
                  <button className="pagination-btn" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                    <i className="fas fa-chevron-left"></i>
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button key={page} className={`pagination-btn ${currentPage === page ? 'active' : ''}`} onClick={() => setCurrentPage(page)}>
                      {page}
                    </button>
                  ))}
                  <button className="pagination-btn" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                    <i className="fas fa-chevron-right"></i>
                  </button>
                </div>
              )}
            </>
          )}
        </section>

        <aside className="shop-cart-panel">
          <div className="cart-header">
            <h2>Your Cart</h2>
            <span>{itemCount} item{itemCount !== 1 ? 's' : ''}</span>
          </div>
          {items.length === 0 ? (
            <div className="empty-state small">
              <i className="fas fa-shopping-cart"></i>
              <p>Your cart is empty.</p>
            </div>
          ) : (
            <div className="cart-items">
              {items.map((item) => (
                <div key={item.id} className="cart-item">
                  <div className="cart-item-info">
                    <h4>{item.name}</h4>
                    <span>R{item.price.toFixed(2)} each</span>
                  </div>
                  <div className="cart-item-actions">
                    <button className="qty-btn" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                      <i className="fas fa-minus"></i>
                    </button>
                    <span className="qty-value">{item.quantity}</span>
                    <button className="qty-btn" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                      <i className="fas fa-plus"></i>
                    </button>
                    <span className="cart-item-subtotal">R{(item.price * item.quantity).toFixed(2)}</span>
                    <button className="cart-remove" onClick={() => removeItem(item.id)} title="Remove">
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              ))}
              <div className="cart-summary">
                <div className="cart-total-row">
                  <span>Total</span>
                  <strong>R{total.toFixed(2)}</strong>
                </div>
                <button className="btn btn-primary" onClick={handleCheckout} disabled={checkoutLoading} style={{ width: '100%' }}>
                  {checkoutLoading ? (
                    <><i className="fas fa-spinner fa-spin"></i> Sending...</>
                  ) : (
                    <><i className="fab fa-whatsapp"></i> Checkout via WhatsApp</>
                  )}
                </button>
                <button className="btn btn-outline" onClick={clearCart} style={{ width: '100%', marginTop: '0.5rem' }}>
                  <i className="fas fa-trash"></i> Clear Cart
                </button>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};

export default ShopPage;