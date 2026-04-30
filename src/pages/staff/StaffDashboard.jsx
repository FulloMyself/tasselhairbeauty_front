import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import UnifiedCalendar from '../../components/common/UnifiedCalendar';
import { downloadPayslip } from '../../utils/payslipGenerator';
import DashboardSidebar from '../../components/dashboard/DashboardSidebar';
import ProfileEditor from '../../components/dashboard/ProfileEditor';
import '../../styles/dashboard.css';

const StaffOverview = ({ user, stats, todayBookings }) => (
    <div className="dashboard-overview">
        <div className="welcome-card staff-welcome">
            <h2>Welcome, {user?.firstName}!</h2>
            <p>You have <strong>{todayBookings?.length || 0}</strong> appointment{todayBookings?.length !== 1 ? 's' : ''} today</p>
        </div>

        <div className="stats-grid">
            <div className="stat-card">
                <div className="stat-icon"><i className="fas fa-calendar-check"></i></div>
                <div className="stat-info">
                    <h3>{stats?.weeklyBookings || 0}</h3>
                    <p>This Week</p>
                </div>
            </div>
            <div className="stat-card">
                <div className="stat-icon"><i className="fas fa-star"></i></div>
                <div className="stat-info">
                    <h3>{stats?.averageRating || '5.0'}</h3>
                    <p>Avg Rating</p>
                </div>
            </div>
            <div className="stat-card">
                <div className="stat-icon"><i className="fas fa-money-bill"></i></div>
                <div className="stat-info">
                    <h3>R{stats?.monthlyEarnings || 0}</h3>
                    <p>This Month</p>
                </div>
            </div>
            <div className="stat-card">
                <div className="stat-icon"><i className="fas fa-clock"></i></div>
                <div className="stat-info">
                    <h3>{stats?.completionRate || 100}%</h3>
                    <p>Completion Rate</p>
                </div>
            </div>
        </div>

        <div className="today-schedule">
            <h3>Today's Schedule</h3>
            {todayBookings?.length === 0 ? (
                <div className="empty-state small">
                    <i className="fas fa-calendar"></i>
                    <p>No appointments scheduled for today</p>
                </div>
            ) : (
                <div className="schedule-timeline">
                    {todayBookings?.map((booking, idx) => (
                        <div key={idx} className="timeline-item">
                            <div className="timeline-time">{booking.time}</div>
                            <div className="timeline-content">
                                <h4>{booking.service}</h4>
                                <p>{booking.customer} • {booking.duration} mins</p>
                                {booking.notes && <p className="booking-notes"><i className="fas fa-pen"></i> {booking.notes}</p>}
                            </div>
                            <div className="timeline-status">
                                <span className={`status-badge status-${booking.status}`}>{booking.status}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    </div>
);

const ScheduleView = ({ schedule, loading }) => {
    const [selectedDate, setSelectedDate] = useState(new Date());

    const daysInMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate();
    const firstDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1).getDay();

    return (
        <div className="schedule-section">
            <div className="section-header">
                <h2>My Schedule</h2>
                <div className="month-navigation">
                    <button onClick={() => setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth() - 1)))}>
                        <i className="fas fa-chevron-left"></i>
                    </button>
                    <span>{selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                    <button onClick={() => setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth() + 1)))}>
                        <i className="fas fa-chevron-right"></i>
                    </button>
                </div>
            </div>

            <div className="calendar-grid">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="calendar-header">{day}</div>
                ))}

                {Array.from({ length: firstDay }).map((_, i) => (
                    <div key={`empty-${i}`} className="calendar-day empty"></div>
                ))}

                {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const dayBookings = schedule?.filter(b => b.date === dateStr) || [];

                    return (
                        <div key={day} className={`calendar-day ${dayBookings.length > 0 ? 'has-bookings' : ''}`}>
                            <span className="day-number">{day}</span>
                            {dayBookings.length > 0 && (
                                <div className="day-indicator">{dayBookings.length} booking{dayBookings.length !== 1 ? 's' : ''}</div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const PerformanceView = ({ performance, loading }) => {
    return (
        <div className="performance-section">
            <h2>Performance Metrics</h2>

            <div className="performance-grid">
                <div className="performance-card">
                    <h3>Customer Ratings</h3>
                    <div className="rating-display">
                        <span className="rating-value">{performance?.averageRating || '5.0'}</span>
                        <div className="rating-stars">
                            {'★'.repeat(Math.round(performance?.averageRating || 5))}
                            {'☆'.repeat(5 - Math.round(performance?.averageRating || 5))}
                        </div>
                        <p>{performance?.totalReviews || 0} reviews</p>
                    </div>
                </div>

                <div className="performance-card">
                    <h3>Bookings Completed</h3>
                    <div className="metric-value">{performance?.completedBookings || 0}</div>
                    <p>This month</p>
                </div>

                <div className="performance-card">
                    <h3>Total Earnings</h3>
                    <div className="metric-value">R{performance?.totalEarnings || 0}</div>
                    <p>This month</p>
                </div>

                <div className="performance-card">
                    <h3>Punctuality</h3>
                    <div className="metric-value">{performance?.punctuality || 100}%</div>
                    <p>On-time rate</p>
                </div>
            </div>

            <div className="recent-reviews">
                <h3>Recent Reviews</h3>
                {performance?.recentReviews?.length === 0 ? (
                    <p className="empty-text">No reviews yet</p>
                ) : (
                    performance?.recentReviews?.map((review, idx) => (
                        <div key={idx} className="review-item">
                            <div className="review-header">
                                <span className="review-rating">{'★'.repeat(review.rating)}</span>
                                <span className="review-date">{new Date(review.date).toLocaleDateString()}</span>
                            </div>
                            <p className="review-comment">{review.comment}</p>
                            <p className="review-customer">- {review.customer}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

const LeaveRequestForm = ({ onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        leaveType: 'annual',
        startDate: '',
        endDate: '',
        reason: ''
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/staff/leave-request', formData);
            onSubmit?.();
        } catch (error) {
            console.error('Failed to submit leave request:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="leave-request-form">
            <h3>Request Leave</h3>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Leave Type</label>
                    <select value={formData.leaveType} onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}>
                        <option value="annual">Annual Leave</option>
                        <option value="sick">Sick Leave</option>
                        <option value="personal">Personal Leave</option>
                        <option value="unpaid">Unpaid Leave</option>
                    </select>
                </div>
                <div className="form-row">
                    <div className="form-group">
                        <label>Start Date</label>
                        <input type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} required />
                    </div>
                    <div className="form-group">
                        <label>End Date</label>
                        <input type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} required />
                    </div>
                </div>
                <div className="form-group">
                    <label>Reason</label>
                    <textarea value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} rows="3" required />
                </div>
                <div className="form-buttons">
                    <button type="button" className="btn btn-outline" onClick={onCancel}>Cancel</button>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Submitting...' : 'Submit Request'}
                    </button>
                </div>
            </form>
        </div>
    );
};

const LeaveView = ({ leaveRequests, loading, onUpdate }) => {
    const [showForm, setShowForm] = useState(false);

    return (
        <div className="leave-section">
            <div className="section-header">
                <h2>Leave Requests</h2>
                <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                    <i className="fas fa-plus"></i> Request Leave
                </button>
            </div>

            {showForm && (
                <LeaveRequestForm
                    onSubmit={() => {
                        setShowForm(false);
                        onUpdate?.(); // Use the onUpdate prop
                    }}
                    onCancel={() => setShowForm(false)}
                />
            )}

            <div className="leave-list">
                {leaveRequests?.length === 0 ? (
                    <div className="empty-state">
                        <i className="fas fa-umbrella-beach"></i>
                        <p>No leave requests yet</p>
                    </div>
                ) : (
                    leaveRequests?.map(request => (
                        <div key={request.id} className="leave-card">
                            <div className="leave-header">
                                <span className={`leave-status status-${request.status}`}>{request.status}</span>
                                <span className="leave-type">{request.leaveType}</span>
                            </div>
                            <div className="leave-body">
                                <p><i className="fas fa-calendar"></i> {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}</p>
                                <p><i className="fas fa-clock"></i> {request.numberOfDays} day{request.numberOfDays !== 1 ? 's' : ''}</p>
                                <p><i className="fas fa-pen"></i> {request.reason}</p>
                            </div>
                            {request.status === 'approved' && (
                                <div className="leave-footer">
                                    <p>Approved by {request.approvedBy} on {new Date(request.approvalDate).toLocaleDateString()}</p>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

const PayrollView = ({ payroll, loading, user }) => {
    return (
        <div className="payroll-section">
            <h2>Payroll History</h2>

            {(!payroll || payroll.length === 0) ? (
                <div className="empty-state">
                    <i className="fas fa-money-bill"></i>
                    <p>No payroll records yet</p>
                </div>
            ) : (
                <div className="payroll-list">
                    {payroll.map(record => (
                        <div key={record.id || record._id} className="payroll-card">
                            <div className="payroll-header">
                                <h3>{record.payrollPeriod}</h3>
                                <span className={`payroll-status status-${record.status}`}>{record.status}</span>
                            </div>
                            <div className="payroll-body">
                                <div className="payroll-row">
                                    <span>Base Salary:</span>
                                    <span>R{(record.baseSalary || 0).toFixed(2)}</span>
                                </div>
                                <div className="payroll-row">
                                    <span>Bonuses:</span>
                                    <span className="text-success">+R{(record.bonuses || 0).toFixed(2)}</span>
                                </div>
                                <div className="payroll-row">
                                    <span>Deductions:</span>
                                    <span className="text-error">-R{((record.deductions || 0) + (record.leaveDeductions || 0)).toFixed(2)}</span>
                                </div>
                                <div className="payroll-row total">
                                    <span>Total Earnings:</span>
                                    <span>R{(record.totalEarnings || 0).toFixed(2)}</span>
                                </div>
                            </div>
                            <div className="payroll-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                {record.paymentDate && (
                                    <p>Paid on {new Date(record.paymentDate).toLocaleDateString()}</p>
                                )}
                                {record.status === 'paid' && (
                                    <button
                                        className="btn btn-sm btn-primary"
                                        onClick={() => downloadPayslip(record, `${user?.firstName} ${user?.lastName}`)}
                                        style={{ fontSize: '12px', padding: '6px 14px' }}
                                    >
                                        <i className="fas fa-download"></i> Download Payslip
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// Main Staff Dashboard Component
const StaffDashboard = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState(null);
    const [todayBookings, setTodayBookings] = useState([]);
    const [schedule, setSchedule] = useState([]);
    const [performance, setPerformance] = useState(null);
    const [leaveRequests, setLeaveRequests] = useState([]);
    const [payroll, setPayroll] = useState([]);
    const [loading, setLoading] = useState(true);

    const location = useLocation();

    const menuItems = [
        { id: 'overview', label: 'Overview', icon: 'fas fa-home' },
        { id: 'calendar', label: 'Calendar', icon: 'fas fa-calendar-alt' },
        { id: 'schedule', label: 'Schedule', icon: 'fas fa-calendar' },
        { id: 'performance', label: 'Performance', icon: 'fas fa-chart-line' },
        { id: 'leave', label: 'Leave', icon: 'fas fa-umbrella-beach' },
        { id: 'payroll', label: 'Payroll', icon: 'fas fa-money-bill' },
        { id: 'profile', label: 'Profile', icon: 'fas fa-user-cog' },
    ];

    useEffect(() => {
        fetchDashboardData();
    }, []);

    useEffect(() => {
        const path = location.pathname;

        if (path.includes('/leave-requests')) {
            setActiveTab('leave');
        } else if (path.includes('/payroll')) {
            setActiveTab('payroll');
        } else if (path.includes('/dashboard/profile')) {
            setActiveTab('profile');
        }
    }, [location.pathname]);

    const fetchDashboardData = async () => {
        try {
            const [statsRes, todayRes, scheduleRes, perfRes, leaveRes, payrollRes] = await Promise.all([
                api.get('/staff/stats'),
                api.get('/staff/today-bookings'),
                api.get('/staff/schedule'),
                api.get('/staff/performance'),
                api.get('/staff/leave-requests'),
                api.get('/staff/payroll')
            ]);
            setStats(statsRes.data.data || {});
            setTodayBookings(todayRes.data.data || []);
            setSchedule(scheduleRes.data.data || []);
            setPerformance(perfRes.data.data || {});
            setLeaveRequests(leaveRes.data.data || []);
            setPayroll(payrollRes.data.data || []);
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard staff-dashboard">
            <DashboardSidebar
                user={user}
                menuItems={menuItems}
                activeTab={activeTab}
                onTabChange={setActiveTab}
            />

            <div className="dashboard-content">
                {activeTab === 'overview' && <StaffOverview user={user} stats={stats} todayBookings={todayBookings} />}
                {activeTab === 'calendar' && <UnifiedCalendar userRole="staff" userId={user?._id} />}
                {activeTab === 'schedule' && <ScheduleView schedule={schedule} loading={loading} />}
                {activeTab === 'performance' && <PerformanceView performance={performance} loading={loading} />}
                {activeTab === 'leave' && <LeaveView leaveRequests={leaveRequests} loading={loading} onUpdate={fetchDashboardData} />}
                {activeTab === 'payroll' && <PayrollView payroll={payroll} loading={loading} user={user} />}
                {activeTab === 'profile' && <ProfileEditor user={user} onUpdate={fetchDashboardData} />}
            </div>
        </div>
    );
};

export default StaffDashboard;