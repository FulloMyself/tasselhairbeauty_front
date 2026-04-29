import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useNavigate } from 'react-router-dom';

const ServiceBrowser = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedService, setSelectedService] = useState(null);
    const itemsPerPage = 8;
    const navigate = useNavigate();

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            const response = await api.get('/customer/services');
            setServices(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch services:', error);
        } finally {
            setLoading(false);
        }
    };

    const categories = ['all', ...new Set(services.map(s => s.category))];

    // Filter and paginate
    const filteredServices = services.filter(s => {
        const categoryMatch = activeCategory === 'all' || s.category === activeCategory;
        if (!searchTerm.trim()) return categoryMatch;
        const search = searchTerm.toLowerCase();
        return categoryMatch && (
            s.name?.toLowerCase().includes(search) ||
            s.description?.toLowerCase().includes(search) ||
            s.category?.toLowerCase().includes(search)
        );
    });

    const totalPages = Math.ceil(filteredServices.length / itemsPerPage);
    const paginatedServices = filteredServices.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Group services by category for display
    const groupedServices = {};
    if (activeCategory === 'all') {
        categories.filter(c => c !== 'all').forEach(cat => {
            groupedServices[cat] = paginatedServices.filter(s => s.category === cat);
        });
    } else {
        groupedServices[activeCategory] = paginatedServices;
    }

    const handleBookNow = (service) => {
        navigate('/booking', { state: { selectedService: service } });
    };

    const getCategoryIcon = (category) => {
        const icons = {
            'Kiddies Hair': 'fa-child',
            'Barber': 'fa-cut',
            'Adult Hair': 'fa-female',
            'Nails': 'fa-hand-sparkles',
            'Skin & Beauty': 'fa-spa'
        };
        return icons[category] || 'fa-star';
    };

    const getCategoryColor = (category) => {
        const colors = {
            'Kiddies Hair': '#c4a97d',
            'Barber': '#1a1a18',
            'Adult Hair': '#9a8060',
            'Nails': '#c4968a',
            'Skin & Beauty': '#f0e8e2'
        };
        return colors[category] || '#9a8060';
    };

    if (loading) return (
        <div className="loading-spinner">
            <i className="fas fa-spinner fa-spin"></i> Loading services...
        </div>
    );

    return (
        <div className="service-browser">
            <div className="service-browser-header">
                <h1>Our Services</h1>
                <p>Browse our complete range of professional beauty services</p>

                {/* Search Bar */}
                <div className="service-search">
                    <i className="fas fa-search"></i>
                    <input
                        type="text"
                        placeholder="Search services..."
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    />
                    {searchTerm && (
                        <button className="search-clear" onClick={() => setSearchTerm('')}>
                            <i className="fas fa-times"></i>
                        </button>
                    )}
                </div>
            </div>

            {/* Category Navigation */}
            <div className="category-nav">
                {categories.map(cat => (
                    <button
                        key={cat}
                        className={`category-nav-btn ${activeCategory === cat ? 'active' : ''}`}
                        onClick={() => { setActiveCategory(cat); setCurrentPage(1); }}
                        style={activeCategory === cat ? { background: getCategoryColor(cat), borderColor: getCategoryColor(cat) } : {}}
                    >
                        <i className={`fas ${getCategoryIcon(cat)}`}></i>
                        <span>{cat === 'all' ? 'All Services' : cat}</span>
                        <span className="category-count">
                            {cat === 'all' ? services.length : services.filter(s => s.category === cat).length}
                        </span>
                    </button>
                ))}
            </div>

            {/* Results Info */}
            <div className="results-info">
                <span>Showing {filteredServices.length} service{filteredServices.length !== 1 ? 's' : ''}</span>
                {searchTerm && <span> for "<strong>{searchTerm}</strong>"</span>}
            </div>

            {/* Services Display by Category */}
            {Object.keys(groupedServices).map(category => (
                <div key={category} className="service-category-section">
                    <h2 className="category-title" style={{ color: getCategoryColor(category) }}>
                        <i className={`fas ${getCategoryIcon(category)}`}></i> {category}
                    </h2>
                    <div className="services-grid-customer">
                        {groupedServices[category].map(service => (
                            <div key={service._id} className="service-card-customer" onClick={() => setSelectedService(service)}>
                                <div className="service-card-header" style={{ background: getCategoryColor(category) }}>
                                    <i className={`fas ${getCategoryIcon(category)}`}></i>
                                </div>
                                <div className="service-card-body">
                                    <h3>{service.name}</h3>
                                    <p className="service-card-desc">{service.description?.substring(0, 80)}...</p>
                                    <div className="service-card-meta">
                                        <span className="service-price">R{service.basePrice?.toFixed(2)}</span>
                                        <span className="service-duration">
                                            <i className="fas fa-clock"></i> {service.estimatedDuration} mins
                                        </span>
                                    </div>
                                    <button className="btn btn-primary btn-sm" onClick={(e) => { e.stopPropagation(); handleBookNow(service); }}>
                                        <i className="fas fa-calendar-check"></i> Book Now
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}

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
                        <button
                            key={page}
                            className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                            onClick={() => setCurrentPage(page)}
                        >
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

            {filteredServices.length === 0 && (
                <div className="empty-state">
                    <i className="fas fa-search"></i>
                    <p>No services found matching your search</p>
                </div>
            )}

            {/* Service Detail Modal */}
            {selectedService && (
                <div className="admin-modal" onClick={() => setSelectedService(null)}>
                    <div className="admin-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
                        <div className="admin-modal-header">
                            <h3>{selectedService.name}</h3>
                            <button className="admin-modal-close" onClick={() => setSelectedService(null)}><i className="fas fa-times"></i></button>
                        </div>
                        <div className="admin-modal-body">
                            <div className="service-detail">
                                <p className="service-category-badge" style={{ background: getCategoryColor(selectedService.category) }}>
                                    {selectedService.category}
                                </p>
                                <p className="service-full-desc">{selectedService.description}</p>
                                <div className="service-detail-meta">
                                    <div className="meta-item">
                                        <i className="fas fa-money-bill"></i>
                                        <span>R{selectedService.basePrice?.toFixed(2)}</span>
                                    </div>
                                    <div className="meta-item">
                                        <i className="fas fa-clock"></i>
                                        <span>{selectedService.estimatedDuration} minutes</span>
                                    </div>
                                    <div className="meta-item">
                                        <i className={`fas fa-${selectedService.isAvailable ? 'check-circle' : 'times-circle'}`}
                                            style={{ color: selectedService.isAvailable ? 'var(--success)' : 'var(--error)' }}></i>
                                        <span>{selectedService.isAvailable ? 'Available' : 'Unavailable'}</span>
                                    </div>
                                </div>
                                {selectedService.isAvailable && (
                                    <button className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} onClick={() => { setSelectedService(null); handleBookNow(selectedService); }}>
                                        <i className="fas fa-calendar-check"></i> Book This Service
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ServiceBrowser;