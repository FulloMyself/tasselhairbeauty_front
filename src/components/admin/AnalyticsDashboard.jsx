import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const AnalyticsDashboard = () => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState('month');
    const [selectedPeriod, setSelectedPeriod] = useState(new Date().toISOString().slice(0, 7));
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');

    useEffect(() => {
        fetchAnalytics();
    }, [dateRange, selectedPeriod]);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.append('range', dateRange);
            params.append('period', selectedPeriod);
            
            if (dateRange === 'custom') {
                params.append('startDate', customStartDate);
                params.append('endDate', customEndDate);
            }
            
            const response = await api.get(`/admin/analytics?${params}`);
            setAnalytics(response.data.data || null);
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApplyCustomRange = () => {
        if (customStartDate && customEndDate) {
            fetchAnalytics();
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

    // ========== EXPORT FUNCTIONS ==========
    const exportToCSV = () => {
        let csvContent = '';
        csvContent += 'Revenue Overview\nMonth,Amount\n';
        if (analytics?.revenue?.monthly) {
            analytics.revenue.monthly.forEach(item => {
                csvContent += `${item.month || 'N/A'},${item.amount || 0}\n`;
            });
        }
        csvContent += '\nBookings by Category\nCategory,Count,Revenue\n';
        if (analytics?.bookings?.byCategory) {
            analytics.bookings.byCategory.forEach(cat => {
                csvContent += `"${cat.category || 'N/A'}",${cat.count || 0},${cat.revenue || 0}\n`;
            });
        }
        csvContent += '\nStaff Performance\nName,Bookings,Completed,Revenue,Rating\n';
        if (analytics?.staff?.performance) {
            analytics.staff.performance.forEach(staff => {
                csvContent += `"${staff.name || 'N/A'}",${staff.bookings || 0},${staff.completed || 0},${staff.revenue || 0},${staff.rating || 0}\n`;
            });
        }
        csvContent += '\nTop Customers\nName,Bookings,Spent\n';
        if (analytics?.customers?.topCustomers) {
            analytics.customers.topCustomers.forEach(customer => {
                csvContent += `"${customer.name || 'N/A'}",${customer.bookings || 0},${customer.spent || 0}\n`;
            });
        }
        csvContent += '\nSummary\n';
        csvContent += `Total Revenue,${analytics?.revenue?.total || 0}\n`;
        csvContent += `Total Bookings,${analytics?.bookings?.total || 0}\n`;
        csvContent += `Total Customers,${analytics?.customers?.total || 0}\n`;
        csvContent += `Active Staff,${analytics?.staff?.total || 0}\n`;

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `tassel_analytics_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const exportToExcel = () => {
        let htmlContent = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="UTF-8"></head><body>`;
        htmlContent += `<h2>Tassel Hair & Beauty Studio - Analytics Report</h2><p>Generated: ${new Date().toLocaleDateString()}</p>`;
        htmlContent += '<h3>Revenue Overview</h3><table border="1"><tr><th>Month</th><th>Amount (R)</th></tr>';
        analytics?.revenue?.monthly?.forEach(item => {
            htmlContent += `<tr><td>${item.month}</td><td>R${(item.amount || 0).toLocaleString()}</td></tr>`;
        });
        htmlContent += `<tr><td><strong>Total</strong></td><td><strong>R${(analytics?.revenue?.total || 0).toLocaleString()}</strong></td></tr></table><br/>`;
        htmlContent += '<h3>Bookings by Category</h3><table border="1"><tr><th>Category</th><th>Count</th><th>Revenue (R)</th></tr>';
        analytics?.bookings?.byCategory?.forEach(cat => {
            htmlContent += `<tr><td>${cat.category}</td><td>${cat.count}</td><td>R${(cat.revenue || 0).toLocaleString()}</td></tr>`;
        });
        htmlContent += '</table><br/>';
        htmlContent += '<h3>Staff Performance</h3><table border="1"><tr><th>Name</th><th>Bookings</th><th>Completed</th><th>Revenue (R)</th><th>Rating</th></tr>';
        analytics?.staff?.performance?.forEach(staff => {
            htmlContent += `<tr><td>${staff.name}</td><td>${staff.bookings}</td><td>${staff.completed}</td><td>R${(staff.revenue || 0).toLocaleString()}</td><td>${staff.rating}</td></tr>`;
        });
        htmlContent += '</table><br/>';
        htmlContent += '<h3>Top Customers</h3><table border="1"><tr><th>Name</th><th>Bookings</th><th>Spent (R)</th></tr>';
        analytics?.customers?.topCustomers?.forEach(customer => {
            htmlContent += `<tr><td>${customer.name}</td><td>${customer.bookings}</td><td>R${(customer.spent || 0).toLocaleString()}</td></tr>`;
        });
        htmlContent += '</table><br/>';
        htmlContent += '<h3>Summary</h3><table border="1">';
        htmlContent += `<tr><td>Total Revenue</td><td>R${(analytics?.revenue?.total || 0).toLocaleString()}</td></tr>`;
        htmlContent += `<tr><td>Total Bookings</td><td>${analytics?.bookings?.total || 0}</td></tr>`;
        htmlContent += `<tr><td>Total Customers</td><td>${analytics?.customers?.total || 0}</td></tr>`;
        htmlContent += `<tr><td>Active Staff</td><td>${analytics?.staff?.total || 0}</td></tr>`;
        htmlContent += `<tr><td>Returning Customers</td><td>${analytics?.customers?.returning || 0}</td></tr>`;
        htmlContent += `<tr><td>Completion Rate</td><td>${((analytics?.bookings?.completed || 0) / (analytics?.bookings?.total || 1) * 100).toFixed(1)}%</td></tr>`;
        htmlContent += '</table></body></html>';

        const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `tassel_analytics_${new Date().toISOString().split('T')[0]}.xls`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const exportToPDF = () => {
        const printContent = document.createElement('div');
        printContent.innerHTML = `
    <div style="padding: 20px; font-family: Arial, sans-serif;">
      <h1 style="color: #9a8060; text-align: center;">Tassel Hair & Beauty Studio</h1>
      <h2 style="text-align: center;">Analytics Report</h2>
      <p style="text-align: center;">Generated: ${new Date().toLocaleDateString()}</p>
      <hr style="border: 1px solid #9a8060;" />
      <h3>Summary</h3>
      <table style="width: 100%; border-collapse: collapse;" border="1">
        <tr><td style="padding: 8px;"><strong>Total Revenue</strong></td><td style="padding: 8px;">R${(analytics?.revenue?.total || 0).toLocaleString()}</td></tr>
        <tr><td style="padding: 8px;"><strong>Total Bookings</strong></td><td style="padding: 8px;">${analytics?.bookings?.total || 0}</td></tr>
        <tr><td style="padding: 8px;"><strong>Completed Bookings</strong></td><td style="padding: 8px;">${analytics?.bookings?.completed || 0}</td></tr>
        <tr><td style="padding: 8px;"><strong>Pending Bookings</strong></td><td style="padding: 8px;">${analytics?.bookings?.pending || 0}</td></tr>
        <tr><td style="padding: 8px;"><strong>Total Customers</strong></td><td style="padding: 8px;">${analytics?.customers?.total || 0}</td></tr>
        <tr><td style="padding: 8px;"><strong>Active Staff</strong></td><td style="padding: 8px;">${analytics?.staff?.total || 0}</td></tr>
      </table>
      <br/>
      <p style="text-align: center; color: #8a7e78;">Tassel Hair & Beauty Studio • 101 Bellairs Drive, Glenvista • 072 960 5153</p>
    </div>`;

        const originalContent = document.body.innerHTML;
        document.body.innerHTML = printContent.innerHTML;

        setTimeout(() => {
            window.print();
            document.body.innerHTML = originalContent;
            window.location.reload();
        }, 500);
    };

    const maxMonthlyAmount = Math.max(...(analytics?.revenue?.monthly?.map(i => i.amount) || [1]), 1);
    const maxCategoryCount = Math.max(...(analytics?.bookings?.byCategory?.map(i => i.count) || [1]), 1);
    const colors = ['#9a8060', '#c4968a', '#1a1a18', '#c4a97d', '#f0e8e2'];

    return (
        <div className="analytics-dashboard">
            {/* Header with Filter Controls */}
            <div className="section-header">
                <h2>Analytics & Reports</h2>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    {/* Date Range Selector */}
                    <select
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                        style={{ padding: '10px 16px', border: '1px solid var(--light)', borderRadius: '8px', fontFamily: 'var(--font-sans)', background: 'var(--white)', cursor: 'pointer' }}
                    >
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                        <option value="quarter">This Quarter</option>
                        <option value="year">This Year</option>
                        <option value="custom">Custom Range</option>
                    </select>

                    {/* Month Picker - shown for month/quarter/year */}
                    {dateRange !== 'custom' && dateRange !== 'week' && (
                        <input
                            type="month"
                            value={selectedPeriod}
                            onChange={(e) => setSelectedPeriod(e.target.value)}
                            style={{ padding: '10px 16px', border: '1px solid var(--light)', borderRadius: '8px', fontFamily: 'var(--font-sans)' }}
                        />
                    )}

                    {/* Custom Date Range */}
                    {dateRange === 'custom' && (
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <input type="date" value={customStartDate} onChange={(e) => setCustomStartDate(e.target.value)}
                                style={{ padding: '10px 16px', border: '1px solid var(--light)', borderRadius: '8px' }} />
                            <span style={{ color: 'var(--muted)' }}>to</span>
                            <input type="date" value={customEndDate} onChange={(e) => setCustomEndDate(e.target.value)}
                                style={{ padding: '10px 16px', border: '1px solid var(--light)', borderRadius: '8px' }} />
                            <button className="btn btn-primary btn-sm" onClick={handleApplyCustomRange}
                                disabled={!customStartDate || !customEndDate}
                                style={{ padding: '10px 20px', whiteSpace: 'nowrap' }}>
                                <i className="fas fa-search"></i> Apply
                            </button>
                        </div>
                    )}

                    {/* Refresh Button */}
                    <button className="btn btn-outline btn-sm" onClick={fetchAnalytics} style={{ padding: '10px 16px' }} title="Refresh Data">
                        <i className="fas fa-sync-alt"></i>
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
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
                {/* Revenue Chart */}
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

                {/* Bookings by Category */}
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
                    <button className="btn btn-outline" onClick={() => exportToPDF()}>
                        <i className="fas fa-file-pdf"></i> Export PDF Report
                    </button>
                    <button className="btn btn-outline" onClick={() => exportToExcel()}>
                        <i className="fas fa-file-excel"></i> Export Excel
                    </button>
                    <button className="btn btn-outline" onClick={() => exportToCSV()}>
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