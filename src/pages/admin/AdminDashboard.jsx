import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from 'react-router-dom';
import api from '../../utils/api';
import DashboardSidebar from '../../components/dashboard/DashboardSidebar';
import ProfileEditor from '../../components/dashboard/ProfileEditor';
import '../../styles/dashboard.css';
import '../../styles/admin.css';
import AddUserModal from '../../components/admin/AddUserModal';
import EditUserModal from '../../components/admin/EditUserModal';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import AddServiceModal from '../../components/admin/AddServiceModal';
import AddProductModal from '../../components/admin/AddProductModal';
import ProcessPayrollModal from '../../components/admin/ProcessPayrollModal';
import ServicesManagement from '../../components/admin/ServicesManagement';
import ProductsManagement from '../../components/admin/ProductsManagement';
import BookingsManagement from '../../components/admin/BookingsManagement';
import OrdersManagement from '../../components/admin/OrdersManagement';
import LeaveManagement from '../../components/admin/LeaveManagement';
import PayrollManagement from '../../components/admin/PayrollManagement';
import AnalyticsDashboard from '../../components/admin/AnalyticsDashboard';
import SpecialsManagement from '../../components/admin/SpecialsManagement';
import UnifiedCalendar from '../../components/common/UnifiedCalendar';


// Admin Overview Component
const AdminOverview = ({ stats, onAddStaff, onAddProduct, onAddService, onProcessPayroll }) => (
    <div className="admin-overview">
        <h2>Dashboard Overview</h2>

        <div className="stats-grid admin-stats">
            <div className="stat-card">
                <div className="stat-icon"><i className="fas fa-users"></i></div>
                <div className="stat-info">
                    <h3>{stats?.totalCustomers || 0}</h3>
                    <p>Total Customers</p>
                </div>
            </div>
            <div className="stat-card">
                <div className="stat-icon"><i className="fas fa-user-tie"></i></div>
                <div className="stat-info">
                    <h3>{stats?.totalStaff || 0}</h3>
                    <p>Staff Members</p>
                </div>
            </div>
            <div className="stat-card">
                <div className="stat-icon"><i className="fas fa-calendar-check"></i></div>
                <div className="stat-info">
                    <h3>{stats?.todayBookings || 0}</h3>
                    <p>Today's Bookings</p>
                </div>
            </div>
            <div className="stat-card">
                <div className="stat-icon"><i className="fas fa-shopping-cart"></i></div>
                <div className="stat-info">
                    <h3>{stats?.pendingOrders || 0}</h3>
                    <p>Pending Orders</p>
                </div>
            </div>
            <div className="stat-card">
                <div className="stat-icon"><i className="fas fa-money-bill"></i></div>
                <div className="stat-info">
                    <h3>R{stats?.monthlyRevenue || 0}</h3>
                    <p>Monthly Revenue</p>
                </div>
            </div>
            <div className="stat-card">
                <div className="stat-icon"><i className="fas fa-chart-line"></i></div>
                <div className="stat-info">
                    <h3>{stats?.growth || 0}%</h3>
                    <p>Monthly Growth</p>
                </div>
            </div>
        </div>

        <div className="admin-quick-actions">
            <h3>Quick Actions</h3>
            <div className="quick-actions-grid">
                <button className="quick-action-btn" onClick={onAddStaff}>
                    <i className="fas fa-user-plus"></i> Add Staff
                </button>
                <button className="quick-action-btn" onClick={onAddProduct}>
                    <i className="fas fa-box"></i> Add Product
                </button>
                <button className="quick-action-btn" onClick={onAddService}>
                    <i className="fas fa-cut"></i> Add Service
                </button>
                <button className="quick-action-btn" onClick={onProcessPayroll}>
                    <i className="fas fa-file-invoice"></i> Process Payroll
                </button>
            </div>
        </div>

        <div className="recent-activity">
            <h3>Recent Activity</h3>
            <div className="activity-list">
                {stats?.recentActivity?.map((activity, idx) => (
                    <div key={idx} className="activity-item">
                        <div className={`activity-icon activity-${activity.type}`}>
                            <i className={`fas fa-${activity.icon}`}></i>
                        </div>
                        <div className="activity-content">
                            <p>{activity.description}</p>
                            <span className="activity-time">{activity.time}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

// User Management Component
const UserManagement = ({ users, loading, onUserUpdate }) => {
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [confirmDialog, setConfirmDialog] = useState(null);
    const [actionLoading, setActionLoading] = useState(null);

    // Filter by role AND search term
    const filteredUsers = users?.filter(u => {
        // Role filter
        const roleMatch = filter === 'all' || u.role === filter;

        // Search filter - search across multiple fields
        if (!searchTerm.trim()) return roleMatch;

        const search = searchTerm.toLowerCase().trim();
        const searchMatch =
            u.firstName?.toLowerCase().includes(search) ||
            u.lastName?.toLowerCase().includes(search) ||
            u.email?.toLowerCase().includes(search) ||
            u.phone?.includes(search) ||
            u.role?.toLowerCase().includes(search) ||
            `${u.firstName} ${u.lastName}`.toLowerCase().includes(search);

        return roleMatch && searchMatch;
    }) || [];

    // Get search result count
    const resultCount = filteredUsers.length;
    const totalCount = users?.length || 0;

    const handleToggleStatus = async (user) => {
        setConfirmDialog({
            title: user.isActive ? 'Deactivate User' : 'Activate User',
            message: `Are you sure you want to ${user.isActive ? 'deactivate' : 'activate'} ${user.firstName} ${user.lastName}?`,
            confirmText: user.isActive ? 'Deactivate' : 'Activate',
            type: user.isActive ? 'danger' : 'warning',
            onConfirm: async () => {
                try {
                    setActionLoading(user._id);
                    await api.put(`/admin/users/${user._id}/toggle-status`);
                    onUserUpdate?.();
                    setConfirmDialog(null);
                } catch (error) {
                    console.error('Failed to toggle status:', error);
                    alert('Failed to update user status');
                } finally {
                    setActionLoading(null);
                }
            }
        });
    };

    const handleEdit = (user) => {
        setEditingUser(user);
    };

    const handleUserUpdated = () => {
        setEditingUser(null);
        onUserUpdate?.();
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const clearSearch = () => {
        setSearchTerm('');
    };

    return (
        <div className="user-management">
            <div className="section-header">
                <h2>User Management</h2>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div className="admin-search">
                        <i className="fas fa-search search-icon"></i>
                        <input
                            type="text"
                            placeholder="Search by name, email, phone..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                        />
                        {searchTerm && (
                            <button className="search-clear" onClick={clearSearch} title="Clear search">
                                <i className="fas fa-times"></i>
                            </button>
                        )}
                    </div>
                    <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                        <i className="fas fa-plus"></i> Add User
                    </button>
                </div>
            </div>

            <div className="filter-tabs">
                <button className={`filter-tab ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
                    All {!searchTerm && totalCount > 0 && `(${totalCount})`}
                </button>
                <button className={`filter-tab ${filter === 'customer' ? 'active' : ''}`} onClick={() => setFilter('customer')}>
                    Customers
                </button>
                <button className={`filter-tab ${filter === 'staff' ? 'active' : ''}`} onClick={() => setFilter('staff')}>
                    Staff
                </button>
                <button className={`filter-tab ${filter === 'admin' ? 'active' : ''}`} onClick={() => setFilter('admin')}>
                    Admins
                </button>
            </div>

            {/* Search Results Info */}
            {searchTerm && (
                <div className="search-results-info">
                    <i className="fas fa-search"></i>
                    <span>
                        Found <strong>{resultCount}</strong> result{resultCount !== 1 ? 's' : ''}
                        for "<strong>{searchTerm}</strong>"
                    </span>
                    {filter !== 'all' && (
                        <span> in <strong>{filter}</strong></span>
                    )}
                    <button className="search-clear-link" onClick={clearSearch}>
                        <i className="fas fa-times"></i> Clear search
                    </button>
                </div>
            )}

            <div className="users-table-wrapper">
                <table className="users-table">
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Role</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Status</th>
                            <th>Joined</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(user => (
                            <tr key={user._id || user.email}>
                                <td>
                                    <div className="user-cell">
                                        <div className="user-avatar-small">
                                            {user.firstName?.[0]}{user.lastName?.[0]}
                                        </div>
                                        <span>
                                            {/* Highlight matching text */}
                                            {searchTerm ? (
                                                <HighlightText
                                                    text={`${user.firstName} ${user.lastName}`}
                                                    highlight={searchTerm}
                                                />
                                            ) : (
                                                `${user.firstName} ${user.lastName}`
                                            )}
                                        </span>
                                    </div>
                                </td>
                                <td><span className={`role-badge role-${user.role}`}>{user.role}</span></td>
                                <td>
                                    {searchTerm ? (
                                        <HighlightText text={user.email} highlight={searchTerm} />
                                    ) : (
                                        user.email
                                    )}
                                </td>
                                <td>{user.phone || '-'}</td>
                                <td>
                                    <span className={`status-badge ${user.isActive ? 'status-active' : 'status-inactive'}`}>
                                        {user.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}</td>
                                <td>
                                    <div className="action-buttons">
                                        <button
                                            className="btn-icon"
                                            title="Edit User"
                                            onClick={() => handleEdit(user)}
                                        >
                                            <i className="fas fa-edit"></i>
                                        </button>
                                        <button
                                            className={`btn-icon ${user.isActive ? 'text-error' : ''}`}
                                            title={user.isActive ? 'Deactivate User' : 'Activate User'}
                                            onClick={() => handleToggleStatus(user)}
                                            disabled={actionLoading === user._id}
                                        >
                                            {actionLoading === user._id ? (
                                                <i className="fas fa-spinner fa-spin"></i>
                                            ) : (
                                                <i className={`fas fa-${user.isActive ? 'ban' : 'check'}`}></i>
                                            )}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredUsers.length === 0 && (
                            <tr>
                                <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                                    <div className="empty-state small">
                                        <i className="fas fa-search"></i>
                                        <p>{searchTerm ? 'No users match your search' : 'No users found'}</p>
                                        {searchTerm && (
                                            <button className="btn btn-outline btn-sm" onClick={clearSearch}>
                                                Clear search
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add User Modal */}
            {showAddModal && (
                <AddUserModal
                    onClose={() => setShowAddModal(false)}
                    onSuccess={() => {
                        setShowAddModal(false);
                        onUserUpdate?.();
                    }}
                />
            )}

            {/* Edit User Modal */}
            {editingUser && (
                <EditUserModal
                    user={editingUser}
                    onClose={() => setEditingUser(null)}
                    onSuccess={handleUserUpdated}
                />
            )}

            {/* Confirm Dialog */}
            {confirmDialog && (
                <ConfirmDialog
                    title={confirmDialog.title}
                    message={confirmDialog.message}
                    confirmText={confirmDialog.confirmText}
                    type={confirmDialog.type}
                    onConfirm={confirmDialog.onConfirm}
                    onCancel={() => setConfirmDialog(null)}
                />
            )}
        </div>
    );
};

// Highlight Text Component - Add this OUTSIDE the UserManagement component
const HighlightText = ({ text, highlight }) => {
    if (!highlight || !text) return <>{text}</>;

    const regex = new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);

    return (
        <>
            {parts.map((part, i) =>
                regex.test(part) ? (
                    <mark key={i} className="search-highlight">{part}</mark>
                ) : (
                    <span key={i}>{part}</span>
                )
            )}
        </>
    );
};

// ============================================================
// MAIN ADMIN DASHBOARD
// ============================================================
const AdminDashboard = () => {
    const { user } = useAuth();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [pendingLeave, setPendingLeave] = useState(0);
    const [loading, setLoading] = useState(true);
    const [showAddStaffModal, setShowAddStaffModal] = useState(false);
    const [showAddProductModal, setShowAddProductModal] = useState(false);
    const [showAddServiceModal, setShowAddServiceModal] = useState(false);
    const [showPayrollModal, setShowPayrollModal] = useState(false);

    // Use useCallback so this function can be passed as prop
    const fetchDashboardData = useCallback(async () => {
        try {
            const [statsRes, usersRes, analyticsRes, leaveRes] = await Promise.all([
                api.get('/admin/stats'),
                api.get('/admin/users'),
                api.get('/admin/analytics'),
                api.get('/admin/leave-requests/pending')
            ]);
            setStats(statsRes.data.data || {});
            setUsers(usersRes.data.data || []);
            setAnalytics(analyticsRes.data.data || {});
            setPendingLeave(leaveRes.data.data?.length || 0);
        } catch (error) {
            console.error('Failed to fetch admin data:', error);
        } finally {
            setLoading(false);
        }
    }, []); // Empty deps - this function is stable

    // Fetch data on mount
    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    // Handle URL path changes for tab selection
    useEffect(() => {
        const path = location.pathname;
        if (path.includes('/leave-requests')) setActiveTab('leave');
        else if (path.includes('/payroll')) setActiveTab('payroll');
        else if (path.includes('/users')) setActiveTab('users');
        else if (path.includes('/analytics')) setActiveTab('analytics');
        else if (path.includes('/profile')) setActiveTab('profile');
    }, [location.pathname]);

    const menuItems = [
        { id: 'overview', label: 'Dashboard', icon: 'fas fa-tachometer-alt' },
        { id: 'users', label: 'Users', icon: 'fas fa-users' },
        { id: 'services', label: 'Services', icon: 'fas fa-cut' },
        { id: 'products', label: 'Products', icon: 'fas fa-box' },
        { id: 'specials', label: 'Specials', icon: 'fas fa-tag' },
        { id: 'bookings', label: 'Bookings', icon: 'fas fa-calendar' },
        { id: 'orders', label: 'Orders', icon: 'fas fa-shopping-cart' },
        { id: 'leave', label: 'Leave', icon: 'fas fa-umbrella-beach', badge: pendingLeave || null, badgeType: 'warning' },
        { id: 'payroll', label: 'Payroll', icon: 'fas fa-money-bill' },
        { id: 'analytics', label: 'Analytics', icon: 'fas fa-chart-bar' },
        { id: 'profile', label: 'Profile', icon: 'fas fa-user-cog' },
        { id: 'calendar', label: 'Calendar', icon: 'fas fa-calendar-alt' },
    ];

    return (
        <div className="dashboard admin-dashboard">
            <DashboardSidebar
                user={user}
                menuItems={menuItems}
                activeTab={activeTab}
                onTabChange={setActiveTab}
            />

            <div className="dashboard-content">
                {activeTab === 'overview' && (
                    <AdminOverview
                        stats={stats}
                        onAddStaff={() => setShowAddStaffModal(true)}
                        onAddProduct={() => setShowAddProductModal(true)}
                        onAddService={() => setShowAddServiceModal(true)}
                        onProcessPayroll={() => setShowPayrollModal(true)}
                    />
                )}
                {activeTab === 'users' && (
                    <UserManagement
                        users={users}
                        loading={loading}
                        onUserUpdate={fetchDashboardData}
                    />
                )}
                {activeTab === 'analytics' && <AnalyticsDashboard analytics={analytics} loading={loading} />}
                {activeTab === 'profile' && <ProfileEditor user={user} onUpdate={fetchDashboardData} />}
                {!['overview', 'users', 'services', 'products', 'bookings', 'orders', 'leave', 'payroll', 'analytics', 'profile', 'calendar', 'specials'].includes(activeTab) && (
                    <div className="placeholder-content">
                        <h2>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Management</h2>
                        <p>Coming soon...</p>
                    </div>
                )}
                {activeTab === 'services' && <ServicesManagement />}
                {activeTab === 'products' && <ProductsManagement />}
                {activeTab === 'calendar' && <UnifiedCalendar userRole="admin" userId={user?._id} />}
                {activeTab === 'specials' && <SpecialsManagement />}
                {activeTab === 'bookings' && <BookingsManagement />}
                {activeTab === 'orders' && <OrdersManagement />}
                {activeTab === 'leave' && <LeaveManagement />}
                {activeTab === 'payroll' && <PayrollManagement />}

            </div>

            {/* Modals */}
            {showAddStaffModal && (
                <AddUserModal
                    onClose={() => setShowAddStaffModal(false)}
                    onSuccess={() => { setShowAddStaffModal(false); fetchDashboardData(); }}
                />
            )}
            {showAddServiceModal && (
                <AddServiceModal
                    onClose={() => setShowAddServiceModal(false)}
                    onSuccess={() => { setShowAddServiceModal(false); fetchDashboardData(); }}
                />
            )}
            {showAddProductModal && (
                <AddProductModal
                    onClose={() => setShowAddProductModal(false)}
                    onSuccess={() => { setShowAddProductModal(false); fetchDashboardData(); }}
                />
            )}
            {showPayrollModal && (
                <ProcessPayrollModal
                    onClose={() => setShowPayrollModal(false)}
                    onSuccess={() => { setShowPayrollModal(false); fetchDashboardData(); }}
                />
            )}
        </div>
    );
};
export default AdminDashboard;