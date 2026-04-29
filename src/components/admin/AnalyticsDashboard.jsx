import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const AnalyticsDashboard = () => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState('month');
    const [selectedPeriod, setSelectedPeriod] = useState(new Date().toISOString().slice(0, 7));

    useEffect(() => {
        fetchAnalytics();
    }, [dateRange, selectedPeriod]);

    const fetchAnalytics = async () => {
        try {
            const response = await api.get(`/admin/analytics?range=${dateRange}&period=${selectedPeriod}`);
            setAnalytics(response.data.data || null);
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <i className="fas fa-spinner fa-spin" style={{ fontSize: '3rem', color: 'var(--gold)' }}></i>
                    <p style={{ marginTop: '1rem', color: 'var(--muted)' }}>Loading analytics...</p>
                </div>
            </div>
        );
    }

    if (!analytics) {
        return (
            <div style={{ minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <i className="fas fa-chart-bar" style={{ fontSize: '3rem', color: 'var(--muted)' }}></i>
                    <p style={{ marginTop: '1rem', color: 'var(--muted)' }}>No analytics data available yet.</p>
                    <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Data will appear as bookings and orders are created.</p>
                </div>
            </div>
        );
    }

    const maxMonthlyAmount = Math.max(...(analytics?.revenue?.monthly?.map(i => i.amount) || [1]), 1);
    const maxCategoryCount = Math.max(...(analytics?.bookings?.byCategory?.map(i => i.count) || [1]), 1);
    const colors = ['#9a8060', '#c4968a', '#1a1a18', '#c4a97d', '#f0e8e2'];

    return (
        <div className="analytics-dashboard">
            <div className="section-header">
                <h2>Analytics & Reports</h2>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <select
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                        style={{ padding: '8px 16px', border: '1px solid var(--light)', borderRadius: '8px', fontFamily: 'var(--font-sans)' }}
                    >
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                        <option value="quarter">This Quarter</option>
                        <option value="year">This Year</option>
                    </select>
                    <input
                        type="month"
                        value={selectedPeriod}
                        onChange={(e) => setSelectedPeriod(e.target.value)}
                        style={{ padding: '8px 16px', border: '1px solid var(--light)', borderRadius: '8px' }}
                    />
                </div>
            </div>

            {/* KPI Cards - Expanded */}
            <div className="kpi-grid">
                <div className="kpi-card">
                    <div className="kpi-icon" style={{ background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)' }}>
                        <i className="fas fa-money-bill" style={{ color: '#065f46' }}></i>
                    </div>
                    <div className="kpi-info">
                        <h3>R{(analytics?.revenue?.total || 0).toLocaleString()}</h3>
                        <p>Total Revenue</p>
                        <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                            Net: R{(analytics?.revenue?.net || 0).toLocaleString()}
                        </span>
                    </div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-icon" style={{ background: 'linear-gradient(135deg, #fee2e2, #fecaca)' }}>
                        <i className="fas fa-file-invoice" style={{ color: '#991b1b' }}></i>
                    </div>
                    <div className="kpi-info">
                        <h3>R{(analytics?.revenue?.expenses || 0).toLocaleString()}</h3>
                        <p>Total Expenses (Payroll)</p>
                    </div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-icon" style={{ background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)' }}>
                        <i className="fas fa-calendar-check" style={{ color: '#1e40af' }}></i>
                    </div>
                    <div className="kpi-info">
                        <h3>{analytics?.bookings?.total || 0}</h3>
                        <p>Total Bookings</p>
                        <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                            {analytics?.bookings?.completed || 0} completed • R{(analytics?.bookings?.total > 0 ? (analytics?.revenue?.total / analytics?.bookings?.total) : 0).toFixed(0)} avg
                        </span>
                    </div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-icon" style={{ background: 'linear-gradient(135deg, #fef3c7, #fde68a)' }}>
                        <i className="fas fa-users" style={{ color: '#92400e' }}></i>
                    </div>
                    <div className="kpi-info">
                        <h3>{analytics?.customers?.total || 0}</h3>
                        <p>Total Customers</p>
                        <span style={{ color: 'var(--success)', fontSize: '0.8rem' }}>
                            +{analytics?.customers?.newThisMonth || 0} new • {analytics?.customers?.returning || 0} returning
                        </span>
                    </div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-icon" style={{ background: 'linear-gradient(135deg, #e0e7ff, #c7d2fe)' }}>
                        <i className="fas fa-user-tie" style={{ color: '#3730a3' }}></i>
                    </div>
                    <div className="kpi-info">
                        <h3>{analytics?.staff?.total || 0}</h3>
                        <p>Active Staff</p>
                        <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                            R{(analytics?.staff?.totalPaid || 0).toLocaleString()} paid
                        </span>
                    </div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-icon" style={{ background: 'linear-gradient(135deg, #fce7f3, #fbcfe8)' }}>
                        <i className="fas fa-chart-bar" style={{ color: '#9d174d' }}></i>
                    </div>
                    <div className="kpi-info">
                        <h3>{analytics?.bookings?.pending || 0} pending</h3>
                        <p>Bookings Status</p>
                        <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                            {analytics?.bookings?.confirmed || 0} confirmed • {analytics?.bookings?.cancelled || 0} cancelled
                        </span>
                    </div>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="charts-grid">
                {/* Revenue Chart - Only show if there's data */}
                {(analytics?.revenue?.monthly?.some(i => i.amount > 0)) ? (
                    <div className="chart-card">
                        <h3><i className="fas fa-chart-line"></i> Revenue Overview</h3>
                        <div className="bar-chart">
                            {analytics?.revenue?.monthly?.map((item, idx) => (
                                <div key={idx} className="bar-item">
                                    <div className="bar-value" style={{ height: `${Math.max((item.amount / maxMonthlyAmount) * 200, item.amount > 0 ? 8 : 0)}px` }}>
                                        <span className="bar-tooltip">R{item.amount?.toLocaleString()}</span>
                                    </div>
                                    <span className="bar-label">{item.month}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="chart-card">
                        <h3><i className="fas fa-chart-line"></i> Revenue Overview</h3>
                        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted)' }}>
                            <i className="fas fa-chart-line" style={{ fontSize: '3rem', opacity: 0.3 }}></i>
                            <p style={{ marginTop: '1rem' }}>No revenue data yet</p>
                        </div>
                    </div>
                )}

                {/* Bookings by Category - Only show if there's data */}
                {(analytics?.bookings?.byCategory?.some(i => i.count > 0)) ? (
                    <div className="chart-card">
                        <h3><i className="fas fa-chart-pie"></i> Bookings by Category</h3>
                        <div className="category-list">
                            {analytics?.bookings?.byCategory?.map((cat, idx) => (
                                <div key={idx} className="category-item">
                                    <div className="category-info">
                                        <span className="category-name">{cat.category}</span>
                                        <span className="category-count">{cat.count} bookings</span>
                                    </div>
                                    <div className="category-bar">
                                        <div className="category-fill" style={{ width: `${(cat.count / maxCategoryCount) * 100}%`, background: colors[idx % colors.length] }}></div>
                                    </div>
                                    <span className="category-revenue">R{cat.revenue?.toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="chart-card">
                        <h3><i className="fas fa-chart-pie"></i> Bookings by Category</h3>
                        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted)' }}>
                            <i className="fas fa-chart-pie" style={{ fontSize: '3rem', opacity: 0.3 }}></i>
                            <p style={{ marginTop: '1rem' }}>No booking data yet</p>
                        </div>
                    </div>
                )}

                {/* Staff Performance */}
                <div className="chart-card">
                    <h3><i className="fas fa-user-tie"></i> Staff Performance</h3>
                    {analytics?.staff?.performance?.length > 0 ? (
                        <div className="staff-performance-list">
                            {analytics.staff.performance.map((staff, idx) => (
                                <div key={idx} className="staff-perf-item">
                                    <div className="staff-rank">#{idx + 1}</div>
                                    <div className="staff-info">
                                        <strong>{staff.name}</strong>
                                        <div className="staff-metrics">
                                            <span><i className="fas fa-calendar-check"></i> {staff.bookings}</span>
                                            <span><i className="fas fa-star" style={{ color: 'var(--gold)' }}></i> {staff.rating}</span>
                                            <span><i className="fas fa-money-bill"></i> R{staff.revenue?.toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <div className="staff-rating-bar">
                                        <div className="rating-fill" style={{ width: `${(staff.rating / 5) * 100}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted)' }}>
                            <i className="fas fa-user-tie" style={{ fontSize: '3rem', opacity: 0.3 }}></i>
                            <p style={{ marginTop: '1rem' }}>No staff performance data yet</p>
                        </div>
                    )}
                </div>

                {/* Top Customers */}
                <div className="chart-card">
                    <h3><i className="fas fa-star"></i> Top Customers</h3>
                    {analytics?.customers?.topCustomers?.length > 0 ? (
                        <div className="top-customers-list">
                            {analytics.customers.topCustomers.map((customer, idx) => (
                                <div key={idx} className="top-customer-item">
                                    <div className="customer-rank">#{idx + 1}</div>
                                    <div className="customer-info">
                                        <strong>{customer.name}</strong>
                                        <div className="customer-metrics">
                                            <span>{customer.bookings} bookings</span>
                                            <span>R{customer.spent?.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted)' }}>
                            <i className="fas fa-star" style={{ fontSize: '3rem', opacity: 0.3 }}></i>
                            <p style={{ marginTop: '1rem' }}>No customer data yet</p>
                        </div>
                    )}
                </div>

                {/* Quick Stats */}
                <div className="chart-card">
                    <h3><i className="fas fa-info-circle"></i> Quick Stats</h3>
                    <div className="quick-stats-grid">
                        <div className="quick-stat">
                            <span className="quick-stat-number">{analytics?.customers?.returning || 0}</span>
                            <span className="quick-stat-label">Returning Customers</span>
                        </div>
                        <div className="quick-stat">
                            <span className="quick-stat-number">{analytics?.bookings?.cancelled || 0}</span>
                            <span className="quick-stat-label">Cancelled Bookings</span>
                        </div>
                        <div className="quick-stat">
                            <span className="quick-stat-number">
                                {((analytics?.bookings?.completed || 0) / (analytics?.bookings?.total || 1) * 100).toFixed(1)}%
                            </span>
                            <span className="quick-stat-label">Completion Rate</span>
                        </div>
                        <div className="quick-stat">
                            <span className="quick-stat-number">{analytics?.staff?.total || 0}</span>
                            <span className="quick-stat-label">Active Staff</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Export Section */}
            <div className="export-section" style={{ marginTop: '2rem' }}>
                <h3>Export Reports</h3>
                <div className="export-buttons">
                    <button className="btn btn-outline" onClick={() => alert('PDF export coming soon!')}>
                        <i className="fas fa-file-pdf"></i> Export PDF Report
                    </button>
                    <button className="btn btn-outline" onClick={() => alert('Excel export coming soon!')}>
                        <i className="fas fa-file-excel"></i> Export Excel
                    </button>
                    <button className="btn btn-outline" onClick={() => alert('CSV export coming soon!')}>
                        <i className="fas fa-file-csv"></i> Export CSV
                    </button>
                    <button className="btn btn-outline" onClick={() => window.print()}>
                        <i className="fas fa-print"></i> Print Report
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsDashboard;