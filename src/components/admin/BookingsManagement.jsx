import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const BookingsManagement = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [assigningBooking, setAssigningBooking] = useState(null);
    const [staffList, setStaffList] = useState([]);
    const [selectedStaff, setSelectedStaff] = useState('');
    const [assignLoading, setAssignLoading] = useState(false);

    const statuses = ['all', 'pending', 'confirmed', 'completed', 'cancelled'];

    useEffect(() => {
        fetchBookings();
        fetchStaffList();
    }, []);

    const fetchBookings = async () => {
        try {
            const response = await api.get('/admin/bookings');
            setBookings(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch staff list for assignment
    const fetchStaffList = async () => {
        try {
            const response = await api.get('/admin/users');
            const staff = response.data.data?.filter(u => u.role === 'staff' && u.isActive) || [];
            setStaffList(staff);
        } catch (error) {
            console.error('Failed to fetch staff:', error);
        }
    };

    // Staff assignment handlers
    const handleAssignStaff = (booking) => {
        setAssigningBooking(booking);
        setSelectedStaff(booking.staffId || '');
        setShowAssignModal(true);
    };

    const handleAssignSubmit = async () => {
        if (!selectedStaff) {
            alert('Please select a staff member');
            return;
        }

        setAssignLoading(true);
        try {
            await api.put(`/admin/bookings/${assigningBooking._id}/assign-staff`, {
                staffId: selectedStaff
            });
            fetchBookings();
            setShowAssignModal(false);
            setAssigningBooking(null);
        } catch (error) {
            alert('Failed to assign staff');
        } finally {
            setAssignLoading(false);
        }
    };

    const filteredBookings = bookings.filter(b => {
        const statusMatch = filter === 'all' || b.status === filter;
        const dateMatch = !dateFilter || b.date?.startsWith(dateFilter);
        if (!searchTerm.trim()) return statusMatch && dateMatch;
        const search = searchTerm.toLowerCase();
        return statusMatch && dateMatch && (
            b.customerName?.toLowerCase().includes(search) ||
            b.service?.toLowerCase().includes(search) ||
            b.staffName?.toLowerCase().includes(search) ||
            b.customerEmail?.toLowerCase().includes(search) ||
            b.bookingNumber?.toLowerCase().includes(search)
        );
    });

    const handleStatusUpdate = async (bookingId, newStatus) => {
        try {
            await api.put(`/admin/bookings/${bookingId}`, { status: newStatus });
            fetchBookings();
        } catch (error) {
            alert('Failed to update booking status');
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: { bg: '#fef3c7', color: '#92400e' },
            confirmed: { bg: '#dbeafe', color: '#1e40af' },
            completed: { bg: '#d1fae5', color: '#065f46' },
            cancelled: { bg: '#fee2e2', color: '#991b1b' }
        };
        return colors[status] || { bg: '#e5e7eb', color: '#374151' };
    };

    const stats = {
        total: bookings.length,
        today: bookings.filter(b => b.date === new Date().toISOString().split('T')[0]).length,
        pending: bookings.filter(b => b.status === 'pending').length,
        completed: bookings.filter(b => b.status === 'completed').length,
        revenue: bookings.filter(b => b.status === 'completed').reduce((sum, b) => sum + (b.price || 0), 0)
    };

    if (loading) return (
        <div className="loading-spinner">
            <i className="fas fa-spinner fa-spin"></i> Loading bookings...
        </div>
    );

    return (
        <div className="bookings-management">
            <div className="section-header">
                <h2>Bookings Management</h2>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div className="admin-search">
                        <i className="fas fa-search search-icon"></i>
                        <input type="text" placeholder="Search bookings..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        {searchTerm && (
                            <button className="search-clear" onClick={() => setSearchTerm('')}><i className="fas fa-times"></i></button>
                        )}
                    </div>
                    <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="date-filter"
                        style={{ padding: '8px 12px', border: '1px solid var(--light)', borderRadius: '8px' }} />
                </div>
            </div>

            {/* Stats Summary */}
            <div className="services-stats">
                <div className="stat-item"><span className="stat-number">{stats.total}</span><span className="stat-label">Total Bookings</span></div>
                <div className="stat-item"><span className="stat-number">{stats.today}</span><span className="stat-label">Today</span></div>
                <div className="stat-item"><span className="stat-number">{stats.pending}</span><span className="stat-label">Pending</span></div>
                <div className="stat-item"><span className="stat-number">R{stats.revenue.toFixed(2)}</span><span className="stat-label">Revenue</span></div>
            </div>

            <div className="filter-tabs">
                {statuses.map(status => (
                    <button key={status} className={`filter-tab ${filter === status ? 'active' : ''}`} onClick={() => setFilter(status)}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                        {status !== 'all' && ` (${bookings.filter(b => b.status === status).length})`}
                    </button>
                ))}
            </div>

            <div className="users-table-wrapper">
                <table className="users-table">
                    <thead>
                        <tr>
                            <th>Customer</th>
                            <th>Service</th>
                            <th>Staff</th>
                            <th>Date & Time</th>
                            <th>People</th>
                            <th>Price</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredBookings.map(booking => (
                            <tr key={booking._id}>
                                <td>
                                    <div>
                                        <strong>{booking.customerName || 'N/A'}</strong>
                                        <br /><small style={{ color: 'var(--muted)' }}>{booking.customerEmail || ''}</small>
                                        <br /><small style={{ color: 'var(--muted)', fontSize: '10px' }}>{booking.bookingNumber || ''}</small>
                                    </div>
                                </td>
                                <td>{booking.serviceName || booking.service || 'N/A'}</td>
                                <td>{booking.staffName || 'Unassigned'}</td>
                                <td>
                                    <div>{booking.date !== 'N/A' ? new Date(booking.date + 'T00:00:00').toLocaleDateString() : 'N/A'}</div>
                                    <small style={{ color: 'var(--muted)' }}>{booking.time || ''}</small>
                                </td>
                                <td>{booking.numberOfPeople || 1}</td>
                                <td>R{(booking.price || 0).toFixed(2)}</td>
                                <td>
                                    <span className="status-badge" style={{ background: getStatusColor(booking.status).bg, color: getStatusColor(booking.status).color }}>
                                        {booking.status}
                                    </span>
                                </td>
                                <td>
                                    <div className="action-buttons" style={{ flexDirection: 'column', gap: '4px' }}>
                                        {booking.status === 'pending' && (
                                            <>
                                                <button className="btn btn-sm btn-primary" onClick={() => handleStatusUpdate(booking._id, 'confirmed')}
                                                    style={{ fontSize: '11px', padding: '4px 8px' }}>
                                                    <i className="fas fa-check"></i> Confirm
                                                </button>
                                                <button className="btn btn-sm btn-outline" onClick={() => handleStatusUpdate(booking._id, 'cancelled')}
                                                    style={{ fontSize: '11px', padding: '4px 8px', color: 'var(--error)', borderColor: 'var(--error)' }}>
                                                    <i className="fas fa-times"></i> Cancel
                                                </button>
                                            </>
                                        )}
                                        {booking.status === 'confirmed' && (
                                            <button className="btn btn-sm btn-primary" onClick={() => handleStatusUpdate(booking._id, 'completed')}
                                                style={{ fontSize: '11px', padding: '4px 8px', background: 'var(--success)', borderColor: 'var(--success)' }}>
                                                <i className="fas fa-check-double"></i> Complete
                                            </button>
                                        )}
                                        {booking.status === 'completed' && (
                                            <span style={{ color: 'var(--success)', fontSize: '11px' }}><i className="fas fa-check-circle"></i> Done</span>
                                        )}
                                        {booking.status === 'cancelled' && (
                                            <span style={{ color: 'var(--error)', fontSize: '11px' }}><i className="fas fa-ban"></i> Cancelled</span>
                                        )}
                                        
                                        {/* ASSIGN STAFF BUTTON */}
                                        {(booking.status === 'pending' || booking.status === 'confirmed') && (
                                            <button className="btn btn-sm btn-outline" onClick={() => handleAssignStaff(booking)}
                                                style={{ fontSize: '11px', padding: '4px 8px', color: 'var(--gold)', borderColor: 'var(--gold)' }}>
                                                <i className="fas fa-user-plus"></i> {booking.staffName !== 'Unassigned' ? 'Change' : 'Assign'}
                                            </button>
                                        )}
                                        
                                        <button className="btn btn-sm btn-outline" onClick={() => setSelectedBooking(booking)}
                                            style={{ fontSize: '11px', padding: '4px 8px' }}>
                                            <i className="fas fa-eye"></i> View
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredBookings.length === 0 && (
                            <tr>
                                <td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>
                                    <div className="empty-state small"><i className="fas fa-calendar"></i><p>No bookings found</p></div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Booking Detail Modal */}
            {selectedBooking && (
                <div className="admin-modal" onClick={() => setSelectedBooking(null)}>
                    <div className="admin-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '650px' }}>
                        <div className="admin-modal-header">
                            <h3><i className="fas fa-calendar-check"></i> Booking Details</h3>
                            <button className="admin-modal-close" onClick={() => setSelectedBooking(null)}><i className="fas fa-times"></i></button>
                        </div>
                        <div className="admin-modal-body">
                            <div className="booking-detail-grid">
                                <div className="detail-item"><label>Booking Number</label><p style={{ fontFamily: 'monospace' }}>{selectedBooking.bookingNumber || 'N/A'}</p></div>
                                <div className="detail-item"><label>Status</label><span className="status-badge" style={{ background: getStatusColor(selectedBooking.status).bg, color: getStatusColor(selectedBooking.status).color }}>{selectedBooking.status}</span></div>
                                <div className="detail-item"><label>Customer</label><p>{selectedBooking.customerName || 'N/A'}</p></div>
                                <div className="detail-item"><label>Email</label><p>{selectedBooking.customerEmail || 'N/A'}</p></div>
                                <div className="detail-item"><label>Phone</label><p>{selectedBooking.customerPhone || 'N/A'}</p></div>
                                <div className="detail-item"><label>Staff</label><p>{selectedBooking.staffName || 'Unassigned'}</p></div>
                                <div className="detail-item"><label>Date</label><p>{selectedBooking.date !== 'N/A' ? new Date(selectedBooking.date + 'T00:00:00').toLocaleDateString() : 'N/A'}</p></div>
                                <div className="detail-item"><label>Time</label><p>{selectedBooking.time || 'N/A'}</p></div>
                                <div className="detail-item"><label>People</label><p>{selectedBooking.numberOfPeople || 1}</p></div>
                                <div className="detail-item"><label>Total</label><p><strong>R{(selectedBooking.price || 0).toFixed(2)}</strong></p></div>
                                <div className="detail-item"><label>Deposit</label><p>R{(selectedBooking.depositAmount || 0).toFixed(2)} {selectedBooking.depositPaid ? '(Paid)' : '(Unpaid)'}</p></div>
                                <div className="detail-item"><label>Payment</label><p style={{ textTransform: 'uppercase' }}>{selectedBooking.paymentMethod || 'N/A'}</p></div>
                            </div>
                            {selectedBooking.services && selectedBooking.services.length > 0 && (
                                <div style={{ marginTop: '1.5rem' }}>
                                    <h4 style={{ marginBottom: '1rem', color: 'var(--gold)', borderBottom: '2px solid var(--gold)', paddingBottom: '0.5rem' }}><i className="fas fa-list"></i> Services Booked</h4>
                                    <table className="users-table">
                                        <thead><tr><th>Service</th><th>Duration</th><th>Price</th><th>Qty</th><th>Subtotal</th></tr></thead>
                                        <tbody>
                                            {selectedBooking.services.map((s, idx) => (
                                                <tr key={idx}><td>{s.name}</td><td>{s.duration || 0} mins</td><td>R{(s.price || 0).toFixed(2)}</td><td>{s.quantity || 1}</td><td>R{((s.price || 0) * (s.quantity || 1)).toFixed(2)}</td></tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                            {(selectedBooking.specialRequests || selectedBooking.notes) && (
                                <div className="detail-item full-width" style={{ marginTop: '1rem' }}><label>Special Requests / Notes</label><p>{selectedBooking.specialRequests || selectedBooking.notes}</p></div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ASSIGN STAFF MODAL */}
            {showAssignModal && assigningBooking && (
                <div className="admin-modal" onClick={() => setShowAssignModal(false)}>
                    <div className="admin-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
                        <div className="admin-modal-header">
                            <h3><i className="fas fa-user-plus"></i> Assign Staff</h3>
                            <button className="admin-modal-close" onClick={() => setShowAssignModal(false)}><i className="fas fa-times"></i></button>
                        </div>
                        <div className="admin-modal-body">
                            <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--soft)', borderRadius: '8px' }}>
                                <p><strong>Booking:</strong> {assigningBooking.bookingNumber}</p>
                                <p><strong>Customer:</strong> {assigningBooking.customerName}</p>
                                <p><strong>Service:</strong> {assigningBooking.serviceName || assigningBooking.service}</p>
                                <p><strong>Date:</strong> {new Date(assigningBooking.date + 'T00:00:00').toLocaleDateString()}</p>
                                <p><strong>Current Staff:</strong> {assigningBooking.staffName || 'Unassigned'}</p>
                            </div>
                            <div className="form-group">
                                <label><i className="fas fa-user-tie"></i> Select Staff Member *</label>
                                <select value={selectedStaff} onChange={(e) => setSelectedStaff(e.target.value)}
                                    style={{ width: '100%', padding: '12px', border: '1px solid var(--light)', borderRadius: '8px', fontFamily: 'var(--font-sans)', fontSize: '1rem' }}>
                                    <option value="">Choose a staff member...</option>
                                    {staffList.map(staff => (
                                        <option key={staff._id} value={staff._id}>
                                            {staff.firstName} {staff.lastName} {staff.staffProfile?.specializations ? `(${staff.staffProfile.specializations.join(', ')})` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="admin-modal-footer">
                            <button className="btn btn-outline" onClick={() => setShowAssignModal(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleAssignSubmit} disabled={assignLoading || !selectedStaff}>
                                {assignLoading ? <><i className="fas fa-spinner fa-spin"></i> Assigning...</> : <><i className="fas fa-check"></i> Assign Staff</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookingsManagement;