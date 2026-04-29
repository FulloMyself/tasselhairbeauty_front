import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

const ProfileEditor = ({ onUpdate }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    // Basic fields (all roles)
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    // Customer fields
    address: '',
    city: '',
    zipCode: '',
    dateOfBirth: '',
    preferredServices: [],
    // Staff fields
    bio: '',
    instagram: '',
    whatsapp: '',
    specializations: [],
    // Password change
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [activeSection, setActiveSection] = useState('personal');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Service categories for preferences/specializations
  const serviceCategories = [
    'Kiddies Hair',
    'Barber',
    'Adult Hair',
    'Nails',
    'Skin & Beauty'
  ];

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        email: user.email || '',
        address: user.customerProfile?.address || '',
        city: user.customerProfile?.city || '',
        zipCode: user.customerProfile?.zipCode || '',
        dateOfBirth: user.customerProfile?.dateOfBirth?.split('T')[0] || '',
        preferredServices: user.customerProfile?.preferredServices || [],
        bio: user.staffProfile?.bio || '',
        instagram: user.staffProfile?.instagram || '',
        whatsapp: user.staffProfile?.whatsapp || '',
        specializations: user.staffProfile?.specializations || [],
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      // Handle array fields (preferredServices, specializations)
      const arrayName = name;
      const currentArray = [...formData[arrayName]];
      
      if (checked) {
        currentArray.push(value);
      } else {
        const index = currentArray.indexOf(value);
        if (index > -1) currentArray.splice(index, 1);
      }
      
      setFormData({ ...formData, [arrayName]: currentArray });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handlePersonalInfoSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone
      };

      // Add role-specific fields
      if (user?.role === 'customer') {
        updateData.address = formData.address;
        updateData.city = formData.city;
        updateData.zipCode = formData.zipCode;
        updateData.dateOfBirth = formData.dateOfBirth;
        updateData.preferredServices = formData.preferredServices;
      }

      if (user?.role === 'staff') {
        updateData.bio = formData.bio;
        updateData.instagram = formData.instagram;
        updateData.whatsapp = formData.whatsapp;
        updateData.specializations = formData.specializations;
      }

      if (user?.role === 'admin' && formData.email !== user.email) {
        updateData.email = formData.email;
      }

      const response = await api.put('/auth/profile', updateData);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      onUpdate?.();
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to update profile' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    if (formData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }

    setLoading(true);

    try {
      await api.post('/auth/change-password', {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });
      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setFormData({
        ...formData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to change password' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-editor">
      <h2>Profile Settings</h2>
      
      {/* Section Tabs */}
      <div className="profile-tabs">
        <button 
          className={`profile-tab ${activeSection === 'personal' ? 'active' : ''}`}
          onClick={() => setActiveSection('personal')}
        >
          <i className="fas fa-user"></i> Personal Info
        </button>
        <button 
          className={`profile-tab ${activeSection === 'password' ? 'active' : ''}`}
          onClick={() => setActiveSection('password')}
        >
          <i className="fas fa-lock"></i> Change Password
        </button>
      </div>

      {/* Message Display */}
      {message && (
        <div className={`alert alert-${message.type}`}>
          <i className={`fas fa-${message.type === 'success' ? 'check-circle' : 'exclamation-circle'}`}></i>
          {message.text}
        </div>
      )}

      {/* Personal Info Section */}
      {activeSection === 'personal' && (
        <form onSubmit={handlePersonalInfoSubmit} className="profile-form">
          <div className="form-section">
            <h3>Basic Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label><i className="fas fa-user"></i> First Name</label>
                <input 
                  type="text" 
                  name="firstName" 
                  value={formData.firstName} 
                  onChange={handleChange} 
                  required 
                />
              </div>
              <div className="form-group">
                <label><i className="fas fa-user"></i> Last Name</label>
                <input 
                  type="text" 
                  name="lastName" 
                  value={formData.lastName} 
                  onChange={handleChange} 
                  required 
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label><i className="fas fa-envelope"></i> Email</label>
                <input 
                  type="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleChange}
                  disabled={user?.role !== 'admin'}
                  title={user?.role !== 'admin' ? 'Only admins can change email' : ''}
                />
              </div>
              <div className="form-group">
                <label><i className="fas fa-phone"></i> Phone</label>
                <input 
                  type="tel" 
                  name="phone" 
                  value={formData.phone} 
                  onChange={handleChange} 
                  placeholder="071 234 5678"
                />
              </div>
            </div>
          </div>

          {/* Customer-specific fields */}
          {user?.role === 'customer' && (
            <div className="form-section">
              <h3>Customer Details</h3>
              <div className="form-group">
                <label><i className="fas fa-map-marker-alt"></i> Address</label>
                <input 
                  type="text" 
                  name="address" 
                  value={formData.address} 
                  onChange={handleChange} 
                  placeholder="123 Main Street"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label><i className="fas fa-city"></i> City</label>
                  <input 
                    type="text" 
                    name="city" 
                    value={formData.city} 
                    onChange={handleChange} 
                    placeholder="Johannesburg"
                  />
                </div>
                <div className="form-group">
                  <label><i className="fas fa-envelope"></i> Zip Code</label>
                  <input 
                    type="text" 
                    name="zipCode" 
                    value={formData.zipCode} 
                    onChange={handleChange} 
                    placeholder="2000"
                  />
                </div>
              </div>
              <div className="form-group">
                <label><i className="fas fa-calendar"></i> Date of Birth</label>
                <input 
                  type="date" 
                  name="dateOfBirth" 
                  value={formData.dateOfBirth} 
                  onChange={handleChange} 
                />
              </div>
              
              <div className="form-group">
                <label><i className="fas fa-heart"></i> Preferred Services</label>
                <div className="checkbox-grid">
                  {serviceCategories.map(cat => (
                    <label key={cat} className="checkbox-label">
                      <input 
                        type="checkbox" 
                        name="preferredServices" 
                        value={cat}
                        checked={formData.preferredServices.includes(cat)}
                        onChange={handleChange}
                      />
                      <span>{cat}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Staff-specific fields */}
          {user?.role === 'staff' && (
            <div className="form-section">
              <h3>Staff Profile</h3>
              <div className="form-group">
                <label><i className="fas fa-pen"></i> Bio</label>
                <textarea 
                  name="bio" 
                  value={formData.bio} 
                  onChange={handleChange} 
                  rows="3"
                  placeholder="Tell clients about yourself..."
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label><i className="fab fa-instagram"></i> Instagram</label>
                  <input 
                    type="text" 
                    name="instagram" 
                    value={formData.instagram} 
                    onChange={handleChange} 
                    placeholder="https://instagram.com/..."
                  />
                </div>
                <div className="form-group">
                  <label><i className="fab fa-whatsapp"></i> WhatsApp</label>
                  <input 
                    type="text" 
                    name="whatsapp" 
                    value={formData.whatsapp} 
                    onChange={handleChange} 
                    placeholder="https://wa.me/..."
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label><i className="fas fa-tools"></i> Specializations</label>
                <div className="checkbox-grid">
                  {serviceCategories.map(cat => (
                    <label key={cat} className="checkbox-label">
                      <input 
                        type="checkbox" 
                        name="specializations" 
                        value={cat}
                        checked={formData.specializations.includes(cat)}
                        onChange={handleChange}
                      />
                      <span>{cat}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? (
              <><i className="fas fa-spinner fa-spin"></i> Saving...</>
            ) : (
              <><i className="fas fa-save"></i> Save Changes</>
            )}
          </button>
        </form>
      )}

      {/* Password Change Section */}
      {activeSection === 'password' && (
        <form onSubmit={handlePasswordSubmit} className="profile-form">
          <div className="form-section">
            <h3>Change Password</h3>
            <div className="form-group">
              <label><i className="fas fa-key"></i> Current Password</label>
              <input 
                type="password" 
                name="currentPassword" 
                value={formData.currentPassword} 
                onChange={handleChange} 
                required
                placeholder="Enter current password"
              />
            </div>
            <div className="form-group">
              <label><i className="fas fa-lock"></i> New Password</label>
              <input 
                type="password" 
                name="newPassword" 
                value={formData.newPassword} 
                onChange={handleChange} 
                required
                minLength="6"
                placeholder="At least 6 characters"
              />
            </div>
            <div className="form-group">
              <label><i className="fas fa-check-circle"></i> Confirm New Password</label>
              <input 
                type="password" 
                name="confirmPassword" 
                value={formData.confirmPassword} 
                onChange={handleChange} 
                required
                placeholder="Confirm new password"
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? (
              <><i className="fas fa-spinner fa-spin"></i> Updating...</>
            ) : (
              <><i className="fas fa-key"></i> Change Password</>
            )}
          </button>
        </form>
      )}
    </div>
  );
};

export default ProfileEditor;