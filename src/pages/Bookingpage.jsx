import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const BookingPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedServices, setSelectedServices] = useState([]);
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        bookingDate: '',
        bookingTime: '',
        numberOfPeople: 1,
        bookedFor: 'myself',
        specialRequests: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const itemsPerPage = 12;

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

    const filteredServices = services.filter(s => {
        const categoryMatch = activeCategory === 'all' || s.category === activeCategory;
        if (!searchTerm.trim()) return categoryMatch;
        const search = searchTerm.toLowerCase();
        return categoryMatch && (
            s.name?.toLowerCase().includes(search) ||
            s.description?.toLowerCase().includes(search)
        );
    });

    const totalPages = Math.ceil(filteredServices.length / itemsPerPage);
    const paginatedServices = filteredServices.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleServiceToggle = (service) => {
        setSelectedServices(prev => {
            const exists = prev.find(s => s.serviceId === service._id);
            if (exists) {
                return prev.filter(s => s.serviceId !== service._id);
            }
            return [...prev, {
                serviceId: service._id,
                name: service.name,
                category: service.category,
                duration: service.estimatedDuration,
                price: service.basePrice,
                quantity: 1
            }];
        });
    };

    const handleQuantityChange = (serviceId, quantity) => {
        setSelectedServices(prev =>
            prev.map(s => s.serviceId === serviceId ? { ...s, quantity: Math.max(1, parseInt(quantity) || 1) } : s)
        );
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const calculateTotal = () => {
        return selectedServices.reduce((sum, s) => sum + (s.price * s.quantity), 0);
    };

    const handleNextStep = () => {
        if (selectedServices.length === 0) {
            alert('Please select at least one service');
            return;
        }
        setStep(2);
        window.scrollTo(0, 0);
    };

    const handleBackStep = () => {
        setStep(1);
        window.scrollTo(0, 0);
    };

    const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER;

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.bookingDate || !formData.bookingTime) {
            alert('Please select date and time');
            return;
        }

        if (!user) {
            navigate('/login');
            return;
        }

        setSubmitting(true);

        try {
            // STEP 1: Create booking in database
            const response = await api.post('/customer/bookings', {
                services: selectedServices,
                ...formData
            });

            const bookingData = response.data.data;

            // STEP 2: Build WhatsApp message
            const serviceLines = selectedServices
                .map(s => `• ${s.quantity}x ${s.name} (${s.duration} mins) @ R${s.price.toFixed(2)} = R${(s.price * s.quantity).toFixed(2)}`)
                .join('\n');

            const totalAmount = calculateTotal();
            const depositAmount = (totalAmount * 0.5).toFixed(2);

            const message = `💇 *NEW BOOKING REQUEST*\n\n` +
                `*Booking #:* ${bookingData.bookingNumber}\n` +
                `*Customer:* ${user.firstName} ${user.lastName}\n` +
                `*Email:* ${user.email || 'N/A'}\n` +
                `*Phone:* ${user.phone || 'N/A'}\n\n` +
                `*Services:*\n${serviceLines}\n\n` +
                `*Date:* ${new Date(formData.bookingDate).toLocaleDateString('en-ZA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}\n` +
                `*Time:* ${formData.bookingTime}\n` +
                `*People:* ${formData.numberOfPeople}\n` +
                `*Booked For:* ${formData.bookedFor}\n\n` +
                `*Total:* R${totalAmount.toFixed(2)}\n` +
                `*Deposit Required:* R${depositAmount}\n\n` +
                (formData.specialRequests ? `*Special Requests:* ${formData.specialRequests}\n\n` : '') +
                `Please confirm this booking via WhatsApp.`;

            // STEP 3: Open WhatsApp
            window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');

            // STEP 4: Show success and navigate
            alert(`Booking #${bookingData.bookingNumber} created successfully!\n\nWe'll confirm your appointment via WhatsApp.\n\nDeposit Required: R${depositAmount}`);
            navigate('/dashboard');
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to create booking');
        } finally {
            setSubmitting(false);
        }
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
            'Skin & Beauty': '#c4a97d'
        };
        return colors[category] || '#9a8060';
    };

    if (loading) return (
        <div className="loading-spinner" style={{ minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>
                <i className="fas fa-spinner fa-spin" style={{ fontSize: '3rem', color: 'var(--gold)' }}></i>
                <p style={{ marginTop: '1rem', color: 'var(--muted)' }}>Loading services...</p>
            </div>
        </div>
    );

    return (
        <div className="booking-page">
            <div className="booking-page-header">
                <h1>Book an Appointment</h1>
                <p>Select your services and preferred date/time</p>

                {/* Step Indicator */}
                <div className="booking-steps">
                    <div className={`booking-step ${step >= 1 ? 'active' : ''} ${step === 1 ? 'current' : ''}`}>
                        <div className="step-number">{step > 1 ? '✓' : '1'}</div>
                        <span>Select Services</span>
                    </div>
                    <div className="step-line-connector"></div>
                    <div className={`booking-step ${step >= 2 ? 'active' : ''} ${step === 2 ? 'current' : ''}`}>
                        <div className="step-number">2</div>
                        <span>Booking Details</span>
                    </div>
                </div>
            </div>

            {/* Step 1: Select Services */}
            {step === 1 && (
                <div className="booking-services-section">
                    {/* Search */}
                    <div className="service-search" style={{ maxWidth: '500px', margin: '0 auto 2rem' }}>
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

                    {/* Category Filter */}
                    <div className="category-nav">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                className={`category-nav-btn ${activeCategory === cat ? 'active' : ''}`}
                                onClick={() => { setActiveCategory(cat); setCurrentPage(1); }}
                                style={activeCategory === cat ? { background: getCategoryColor(cat), borderColor: getCategoryColor(cat) } : {}}
                            >
                                <i className={`fas ${getCategoryIcon(cat)}`}></i>
                                <span>{cat === 'all' ? 'All' : cat}</span>
                            </button>
                        ))}
                    </div>

                    {/* Results Count */}
                    <div className="results-info">
                        {filteredServices.length} service{filteredServices.length !== 1 ? 's' : ''} found
                        {searchTerm && <span> for "<strong>{searchTerm}</strong>"</span>}
                    </div>

                    {/* Services Grid */}
                    <div className="services-grid-booking">
                        {paginatedServices.map(service => {
                            const selected = selectedServices.find(s => s.serviceId === service._id);
                            return (
                                <div
                                    key={service._id}
                                    className={`service-card-booking ${selected ? 'selected' : ''}`}
                                    onClick={() => handleServiceToggle(service)}
                                >
                                    <div className="service-card-top">
                                        <div className="service-check-circle">
                                            {selected ? (
                                                <i className="fas fa-check-circle"></i>
                                            ) : (
                                                <i className="far fa-circle"></i>
                                            )}
                                        </div>
                                        <span className="service-category-label" style={{ background: getCategoryColor(service.category) }}>
                                            {service.category}
                                        </span>
                                    </div>
                                    <h3>{service.name}</h3>
                                    <p className="service-desc">{service.description?.substring(0, 50)}...</p>
                                    <div className="service-meta">
                                        <span className="service-price">R{service.basePrice?.toFixed(2)}</span>
                                        <span className="service-duration">
                                            <i className="fas fa-clock"></i> {service.estimatedDuration} mins
                                        </span>
                                    </div>
                                    {selected && (
                                        <div className="service-qty-control" onClick={(e) => e.stopPropagation()}>
                                            <label>Qty:</label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={selected.quantity}
                                                onChange={(e) => handleQuantityChange(service._id, e.target.value)}
                                            />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Pagination */}
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

                    {/* Selected Summary & Next Button */}
                    {selectedServices.length > 0 && (
                        <div className="selected-summary">
                            <div className="selected-summary-inner">
                                <div className="selected-count">
                                    <i className="fas fa-check-circle"></i>
                                    <span>{selectedServices.length} service{selectedServices.length !== 1 ? 's' : ''} selected</span>
                                </div>
                                <div className="selected-total">
                                    <span>Total: R{calculateTotal().toFixed(2)}</span>
                                </div>
                                <button className="btn btn-primary" onClick={handleNextStep}>
                                    Continue to Booking Details <i className="fas fa-arrow-right"></i>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Step 2: Booking Details */}
            {step === 2 && (
                <div className="booking-details-section">
                    <div className="booking-details-form">
                        <div className="selected-services-summary">
                            <h3>Selected Services</h3>
                            <div className="selected-services-list">
                                {selectedServices.map(s => (
                                    <div key={s.serviceId} className="selected-service-item">
                                        <span>{s.name} x{s.quantity}</span>
                                        <span>R{(s.price * s.quantity).toFixed(2)}</span>
                                    </div>
                                ))}
                                <div className="selected-service-total">
                                    <span>Total</span>
                                    <strong>R{calculateTotal().toFixed(2)}</strong>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <h3>Booking Details</h3>
                            <div className="form-row">
                                <div className="form-group">
                                    <label><i className="fas fa-calendar"></i> Preferred Date *</label>
                                    <input
                                        type="date"
                                        name="bookingDate"
                                        value={formData.bookingDate}
                                        onChange={handleChange}
                                        required
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                </div>
                                <div className="form-group">
                                    <label><i className="fas fa-clock"></i> Preferred Time *</label>
                                    <select name="bookingTime" value={formData.bookingTime} onChange={handleChange} required>
                                        <option value="">Select time</option>
                                        <option value="09:00">09:00 AM</option>
                                        <option value="10:00">10:00 AM</option>
                                        <option value="11:00">11:00 AM</option>
                                        <option value="12:00">12:00 PM</option>
                                        <option value="13:00">01:00 PM</option>
                                        <option value="14:00">02:00 PM</option>
                                        <option value="15:00">03:00 PM</option>
                                        <option value="16:00">04:00 PM</option>
                                        <option value="17:00">05:00 PM</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label><i className="fas fa-user"></i> Booking For *</label>
                                    <select name="bookedFor" value={formData.bookedFor} onChange={handleChange}>
                                        <option value="myself">Myself</option>
                                        <option value="child">Child</option>
                                        <option value="family">Family</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label><i className="fas fa-users"></i> Number of People</label>
                                    <input type="number" name="numberOfPeople" value={formData.numberOfPeople} onChange={handleChange} min="1" max="10" />
                                </div>
                            </div>
                            <div className="form-group">
                                <label><i className="fas fa-pen"></i> Special Requests</label>
                                <textarea name="specialRequests" value={formData.specialRequests} onChange={handleChange} rows="3" placeholder="Any special requests, allergies, or notes..." />
                            </div>
                            <div className="form-buttons">
                                <button type="button" className="btn btn-outline" onClick={handleBackStep}>
                                    <i className="fas fa-arrow-left"></i> Back to Services
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={submitting}>
                                    {submitting ? (
                                        <><i className="fas fa-spinner fa-spin"></i> Creating...</>
                                    ) : (
                                        <><i className="fas fa-calendar-check"></i> Confirm Booking</>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookingPage;