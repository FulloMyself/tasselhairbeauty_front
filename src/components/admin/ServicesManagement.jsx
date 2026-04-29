import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import AddServiceModal from './AddServiceModal';
import EditServiceModal from './EditServiceModal';
import ConfirmDialog from './ConfirmDialog';

const ServicesManagement = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);

  const categories = ['all', 'Kiddies Hair', 'Barber', 'Adult Hair', 'Nails', 'Skin & Beauty'];

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await api.get('/admin/services');
      setServices(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch services:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredServices = services.filter(s => {
    const categoryMatch = filter === 'all' || s.category === filter;
    if (!searchTerm.trim()) return categoryMatch;
    const search = searchTerm.toLowerCase();
    return categoryMatch && (
      s.name?.toLowerCase().includes(search) ||
      s.category?.toLowerCase().includes(search) ||
      s.description?.toLowerCase().includes(search)
    );
  });

  const handleDelete = (service) => {
    setConfirmDialog({
      title: 'Delete Service',
      message: `Are you sure you want to delete "${service.name}"? This action cannot be undone.`,
      confirmText: 'Delete',
      type: 'danger',
      onConfirm: async () => {
        try {
          await api.delete(`/admin/services/${service._id}`);
          fetchServices();
          setConfirmDialog(null);
        } catch (error) {
          alert('Failed to delete service');
        }
      }
    });
  };

  const handleToggleAvailability = async (service) => {
    try {
      await api.put(`/admin/services/${service._id}`, { 
        isAvailable: !service.isAvailable 
      });
      fetchServices();
    } catch (error) {
      alert('Failed to update service');
    }
  };

  if (loading) return (
    <div className="loading-spinner">
      <i className="fas fa-spinner fa-spin"></i> Loading services...
    </div>
  );

  return (
    <div className="services-management">
      <div className="section-header">
        <h2>Services Management</h2>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div className="admin-search">
            <i className="fas fa-search search-icon"></i>
            <input 
              type="text" 
              placeholder="Search services..." 
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
            <i className="fas fa-plus"></i> Add Service
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
            {cat === 'all' ? 'All Services' : cat}
          </button>
        ))}
      </div>

      {searchTerm && (
        <div className="search-results-info">
          <i className="fas fa-search"></i>
          <span>Found <strong>{filteredServices.length}</strong> result{filteredServices.length !== 1 ? 's' : ''}</span>
          <button className="search-clear-link" onClick={() => setSearchTerm('')}>
            <i className="fas fa-times"></i> Clear
          </button>
        </div>
      )}

      <div className="users-table-wrapper">
        <table className="users-table">
          <thead>
            <tr>
              <th>Service Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Duration</th>
              <th>Available</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredServices.map(service => (
              <tr key={service._id}>
                <td>
                  <strong>{service.name}</strong>
                  <br />
                  <small style={{ color: 'var(--muted)' }}>{service.description?.substring(0, 60)}...</small>
                </td>
                <td><span className="badge-category">{service.category}</span></td>
                <td>R{service.basePrice?.toFixed(2)}</td>
                <td>{service.estimatedDuration} mins</td>
                <td>
                  <button 
                    className={`status-toggle ${service.isAvailable ? 'active' : 'inactive'}`}
                    onClick={() => handleToggleAvailability(service)}
                    title={service.isAvailable ? 'Click to disable' : 'Click to enable'}
                  >
                    <i className={`fas fa-${service.isAvailable ? 'check-circle' : 'times-circle'}`}></i>
                    {service.isAvailable ? ' Available' : ' Unavailable'}
                  </button>
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="btn-icon" title="Edit" onClick={() => setEditingService(service)}>
                      <i className="fas fa-edit"></i>
                    </button>
                    <button className="btn-icon text-error" title="Delete" onClick={() => handleDelete(service)}>
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredServices.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                  <div className="empty-state small">
                    <i className="fas fa-cut"></i>
                    <p>{searchTerm ? 'No services match your search' : 'No services found'}</p>
                    {!searchTerm && (
                      <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                        <i className="fas fa-plus"></i> Add Your First Service
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
          <span className="stat-number">{services.length}</span>
          <span className="stat-label">Total Services</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{services.filter(s => s.isAvailable).length}</span>
          <span className="stat-label">Available</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{services.filter(s => !s.isAvailable).length}</span>
          <span className="stat-label">Unavailable</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{categories.length - 1}</span>
          <span className="stat-label">Categories</span>
        </div>
      </div>

      {/* Add Service Modal */}
      {showAddModal && (
        <AddServiceModal 
          onClose={() => setShowAddModal(false)} 
          onSuccess={() => { setShowAddModal(false); fetchServices(); }} 
        />
      )}

      {/* Edit Service Modal */}
      {editingService && (
        <EditServiceModal 
          service={editingService}
          onClose={() => setEditingService(null)} 
          onSuccess={() => { setEditingService(null); fetchServices(); }} 
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

export default ServicesManagement;