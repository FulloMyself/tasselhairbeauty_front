import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import AddSpecialModal from './AddSpecialModal';
import EditSpecialModal from './EditSpecialModal';
import ConfirmDialog from './ConfirmDialog';

const SpecialsManagement = () => {
  const [specials, setSpecials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSpecial, setEditingSpecial] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [selectedSpecial, setSelectedSpecial] = useState(null);

  useEffect(() => {
    fetchSpecials();
  }, []);

  const fetchSpecials = async () => {
    try {
      const response = await api.get('/admin/specials');
      setSpecials(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch specials:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSpecials = specials.filter(s => {
    const now = new Date();
    const isActive = s.isActive && new Date(s.startDate) <= now && new Date(s.endDate) >= now;
    const isUpcoming = s.isActive && new Date(s.startDate) > now;
    const isExpired = !s.isActive || new Date(s.endDate) < now;

    const filterMatch = 
      filter === 'all' ||
      (filter === 'active' && isActive) ||
      (filter === 'upcoming' && isUpcoming) ||
      (filter === 'expired' && isExpired) ||
      (filter === 'featured' && s.isFeatured);

    if (!searchTerm.trim()) return filterMatch;
    const search = searchTerm.toLowerCase();
    return filterMatch && (
      s.title?.toLowerCase().includes(search) ||
      s.description?.toLowerCase().includes(search) ||
      s.type?.toLowerCase().includes(search)
    );
  });

  const handleDelete = (special) => {
    setConfirmDialog({
      title: 'Delete Special',
      message: `Are you sure you want to delete "${special.title}"?`,
      confirmText: 'Delete',
      type: 'danger',
      onConfirm: async () => {
        try {
          await api.delete(`/admin/specials/${special._id}`);
          fetchSpecials();
          setConfirmDialog(null);
        } catch (error) {
          alert('Failed to delete special');
        }
      }
    });
  };

  const handleToggleActive = async (special) => {
    try {
      await api.put(`/admin/specials/${special._id}`, { isActive: !special.isActive });
      fetchSpecials();
    } catch (error) {
      alert('Failed to update special');
    }
  };

  const handleToggleFeatured = async (special) => {
    try {
      await api.put(`/admin/specials/${special._id}`, { isFeatured: !special.isFeatured });
      fetchSpecials();
    } catch (error) {
      alert('Failed to update special');
    }
  };

  const getStatusBadge = (special) => {
    const now = new Date();
    if (!special.isActive) return { label: 'Inactive', class: 'status-inactive' };
    if (new Date(special.startDate) > now) return { label: 'Upcoming', class: 'status-pending' };
    if (new Date(special.endDate) < now) return { label: 'Expired', class: 'status-cancelled' };
    return { label: 'Active', class: 'status-active' };
  };

  const getDiscountDisplay = (special) => {
    if (special.discountType === 'percentage') {
      return `${special.discountValue}% OFF`;
    }
    return `R${special.discountValue} OFF`;
  };

  if (loading) return (
    <div className="loading-spinner">
      <i className="fas fa-spinner fa-spin"></i> Loading specials...
    </div>
  );

  const stats = {
    total: specials.length,
    active: specials.filter(s => {
      const now = new Date();
      return s.isActive && new Date(s.startDate) <= now && new Date(s.endDate) >= now;
    }).length,
    upcoming: specials.filter(s => s.isActive && new Date(s.startDate) > new Date()).length,
    featured: specials.filter(s => s.isFeatured).length
  };

  return (
    <div className="specials-management">
      <div className="section-header">
        <h2>Specials & Promotions</h2>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div className="admin-search">
            <i className="fas fa-search search-icon"></i>
            <input type="text" placeholder="Search specials..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            {searchTerm && <button className="search-clear" onClick={() => setSearchTerm('')}><i className="fas fa-times"></i></button>}
          </div>
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            <i className="fas fa-plus"></i> Add Special
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="services-stats">
        <div className="stat-item"><span className="stat-number">{stats.total}</span><span className="stat-label">Total</span></div>
        <div className="stat-item"><span className="stat-number" style={{ color: '#065f46' }}>{stats.active}</span><span className="stat-label">Active</span></div>
        <div className="stat-item"><span className="stat-number" style={{ color: '#92400e' }}>{stats.upcoming}</span><span className="stat-label">Upcoming</span></div>
        <div className="stat-item"><span className="stat-number" style={{ color: 'var(--gold)' }}>{stats.featured}</span><span className="stat-label">Featured</span></div>
      </div>

      {/* Filters */}
      <div className="filter-tabs">
        {['all', 'active', 'upcoming', 'expired', 'featured'].map(f => (
          <button key={f} className={`filter-tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Specials Grid */}
      <div className="specials-cards-grid">
        {filteredSpecials.map(special => {
          const status = getStatusBadge(special);
          return (
            <div key={special._id} className="special-management-card">
              <div className="special-card-header">
                {special.poster ? (
                  <img src={special.poster} alt={special.title} className="special-card-poster" />
                ) : (
                  <div className="special-card-placeholder">
                    <i className="fas fa-tag" style={{ fontSize: '3rem', color: 'var(--gold)' }}></i>
                  </div>
                )}
                <span className={`special-status-badge ${status.class}`}>{status.label}</span>
                {special.isFeatured && <span className="featured-badge"><i className="fas fa-star"></i> Featured</span>}
              </div>
              <div className="special-card-body">
                <h3>{special.title}</h3>
                <p className="special-description">{special.description}</p>
                <div className="special-discount">
                  <span className="discount-badge">{getDiscountDisplay(special)}</span>
                  <span className="special-type">{special.type}</span>
                </div>
                <div className="special-dates">
                  <span><i className="fas fa-calendar"></i> {new Date(special.startDate).toLocaleDateString()}</span>
                  <span>→</span>
                  <span><i className="fas fa-calendar-check"></i> {new Date(special.endDate).toLocaleDateString()}</span>
                </div>
                {special.originalPrice > 0 && (
                  <div className="special-pricing">
                    <span className="original-price">R{special.originalPrice.toFixed(2)}</span>
                    <span className="arrow">→</span>
                    <span className="discounted-price">R{special.discountedPrice.toFixed(2)}</span>
                  </div>
                )}
              </div>
              <div className="special-card-actions">
                <button className="btn btn-sm btn-outline" onClick={() => handleToggleFeatured(special)} title={special.isFeatured ? 'Remove Featured' : 'Make Featured'}>
                  <i className={`fas fa-star${special.isFeatured ? '' : '-o'}`}></i>
                </button>
                <button className="btn btn-sm btn-outline" onClick={() => handleToggleActive(special)} title={special.isActive ? 'Deactivate' : 'Activate'}>
                  <i className={`fas fa-${special.isActive ? 'ban' : 'check'}`}></i>
                </button>
                <button className="btn btn-sm btn-outline" onClick={() => setEditingSpecial(special)}>
                  <i className="fas fa-edit"></i>
                </button>
                <button className="btn btn-sm btn-outline text-error" onClick={() => handleDelete(special)}>
                  <i className="fas fa-trash"></i>
                </button>
                <button className="btn btn-sm btn-outline" onClick={() => setSelectedSpecial(special)}>
                  <i className="fas fa-eye"></i>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddSpecialModal onClose={() => setShowAddModal(false)} onSuccess={() => { setShowAddModal(false); fetchSpecials(); }} />
      )}
      {editingSpecial && (
        <EditSpecialModal special={editingSpecial} onClose={() => setEditingSpecial(null)} onSuccess={() => { setEditingSpecial(null); fetchSpecials(); }} />
      )}
      {confirmDialog && <ConfirmDialog {...confirmDialog} onCancel={() => setConfirmDialog(null)} />}
      
      {/* Detail Modal */}
      {selectedSpecial && (
        <div className="admin-modal" onClick={() => setSelectedSpecial(null)}>
          <div className="admin-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="admin-modal-header">
              <h3><i className="fas fa-tag"></i> {selectedSpecial.title}</h3>
              <button className="admin-modal-close" onClick={() => setSelectedSpecial(null)}><i className="fas fa-times"></i></button>
            </div>
            <div className="admin-modal-body">
              {selectedSpecial.poster && (
                <img src={selectedSpecial.poster} alt={selectedSpecial.title} style={{ width: '100%', borderRadius: '12px', marginBottom: '1rem' }} />
              )}
              <p style={{ marginBottom: '1rem' }}>{selectedSpecial.description}</p>
              <div className="booking-detail-grid">
                <div className="detail-item"><label>Type</label><p style={{ textTransform: 'capitalize' }}>{selectedSpecial.type}</p></div>
                <div className="detail-item"><label>Discount</label><p>{getDiscountDisplay(selectedSpecial)}</p></div>
                <div className="detail-item"><label>Start Date</label><p>{new Date(selectedSpecial.startDate).toLocaleDateString()}</p></div>
                <div className="detail-item"><label>End Date</label><p>{new Date(selectedSpecial.endDate).toLocaleDateString()}</p></div>
                {selectedSpecial.services?.length > 0 && (
                  <div className="detail-item full-width"><label>Services</label><p>{selectedSpecial.services.map(s => s.name).join(', ')}</p></div>
                )}
                {selectedSpecial.products?.length > 0 && (
                  <div className="detail-item full-width"><label>Products</label><p>{selectedSpecial.products.map(p => p.name).join(', ')}</p></div>
                )}
              </div>
              {selectedSpecial.termsAndConditions && (
                <div style={{ marginTop: '1rem' }}><label style={{ fontWeight: 'bold', marginBottom: '0.5rem', display: 'block' }}>Terms & Conditions</label><p style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>{selectedSpecial.termsAndConditions}</p></div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpecialsManagement;