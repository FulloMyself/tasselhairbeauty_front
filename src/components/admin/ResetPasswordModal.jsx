import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const ResetPasswordModal = ({ user, onClose, onSuccess }) => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);
    const [resetHistory, setResetHistory] = useState([]);
    const [showHistory, setShowHistory] = useState(false);

    useEffect(() => {
        // Fetch user's password reset history
        fetchResetHistory();
    }, [user]);

    const fetchResetHistory = async () => {
        try {
            const response = await api.get(`/admin/users/${user._id}/reset-history`);
            setResetHistory(response.data.data || []);
        } catch (error) {
            // Silent fail - history is optional
        }
    };

    const generateRandomPassword = () => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
        let password = '';
        for (let i = 0; i < 10; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setNewPassword(password);
        setConfirmPassword(password);
    };

    const handleCopyPassword = () => {
        navigator.clipboard.writeText(newPassword).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            const response = await api.put(`/admin/users/${user._id}/reset-password`, {
                newPassword
            });
            
            onSuccess?.({
                email: user.email,
                password: newPassword,
                message: response.data.message
            });
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleString('en-ZA', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="admin-modal" onClick={onClose}>
            <div className="admin-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto' }}>
                <div className="admin-modal-header">
                    <h3><i className="fas fa-key"></i> Reset Password</h3>
                    <button className="admin-modal-close" onClick={onClose}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                <div className="admin-modal-body">
                    {/* User Info */}
                    <div style={{ 
                        padding: '12px 16px', 
                        background: 'var(--soft)', 
                        borderRadius: '8px', 
                        marginBottom: '1.5rem' 
                    }}>
                        <p style={{ margin: 0 }}><strong>{user.firstName} {user.lastName}</strong></p>
                        <p style={{ margin: '4px 0 0', color: 'var(--muted)', fontSize: '0.85rem' }}>{user.email}</p>
                        <span className={`role-badge role-${user.role}`} style={{ marginTop: '8px', display: 'inline-block' }}>
                            {user.role}
                        </span>
                    </div>

                    {/* Password Reset History */}
                    {resetHistory.length > 0 && (
                        <div style={{ marginBottom: '1.5rem' }}>
                            <button 
                                className="btn btn-outline btn-sm"
                                onClick={() => setShowHistory(!showHistory)}
                                style={{ marginBottom: showHistory ? '1rem' : 0 }}
                            >
                                <i className="fas fa-history"></i> 
                                {showHistory ? 'Hide' : 'Show'} Password Reset History ({resetHistory.length})
                            </button>
                            
                            {showHistory && (
                                <div style={{ 
                                    maxHeight: '200px', 
                                    overflowY: 'auto',
                                    border: '1px solid var(--light)',
                                    borderRadius: '8px'
                                }}>
                                    {resetHistory.map((entry, idx) => (
                                        <div key={idx} style={{
                                            padding: '10px 14px',
                                            borderBottom: idx < resetHistory.length - 1 ? '1px solid var(--light)' : 'none',
                                            fontSize: '0.85rem'
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                <span style={{ color: 'var(--muted)', fontSize: '0.75rem' }}>
                                                    {formatDate(entry.requestedAt || entry.createdAt)}
                                                </span>
                                                <span className={`status-badge status-${entry.status || 'completed'}`}>
                                                    {entry.status || 'completed'}
                                                </span>
                                            </div>
                                            {entry.tempPassword && (
                                                <p style={{ margin: '4px 0 0', fontSize: '0.8rem' }}>
                                                    <strong>Previous temp password:</strong>{' '}
                                                    <code style={{ background: 'var(--soft)', padding: '1px 6px', borderRadius: '3px' }}>
                                                        {entry.tempPassword}
                                                    </code>
                                                </p>
                                            )}
                                            {entry.method && (
                                                <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: 'var(--muted)' }}>
                                                    Method: {entry.method}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {error && (
                        <div className="admin-alert admin-alert-error">
                            <i className="fas fa-exclamation-circle"></i> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>
                                <i className="fas fa-lock"></i> New Password *
                            </label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <input
                                    type="text"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    minLength="6"
                                    placeholder="Enter new password"
                                    style={{ flex: 1 }}
                                />
                                <button
                                    type="button"
                                    className="btn btn-outline btn-sm"
                                    onClick={generateRandomPassword}
                                    title="Generate random password"
                                    style={{ whiteSpace: 'nowrap' }}
                                >
                                    <i className="fas fa-dice"></i> Generate
                                </button>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>
                                <i className="fas fa-check-circle"></i> Confirm Password *
                            </label>
                            <input
                                type="text"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                placeholder="Confirm new password"
                            />
                        </div>

                        {newPassword && (
                            <div style={{
                                padding: '12px',
                                background: '#d1fae5',
                                borderRadius: '8px',
                                marginBottom: '1rem',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                flexWrap: 'wrap',
                                gap: '8px'
                            }}>
                                <div>
                                    <strong style={{ color: '#065f46' }}>New Password:</strong>
                                    <code style={{ 
                                        marginLeft: '8px', 
                                        background: 'white', 
                                        padding: '2px 8px', 
                                        borderRadius: '4px',
                                        fontSize: '0.9rem'
                                    }}>
                                        {newPassword}
                                    </code>
                                </div>
                                <button
                                    type="button"
                                    className="btn btn-sm"
                                    onClick={handleCopyPassword}
                                    style={{ 
                                        background: copied ? '#065f46' : 'var(--gold)', 
                                        color: 'white',
                                        fontSize: '11px',
                                        padding: '4px 10px'
                                    }}
                                >
                                    <i className={`fas fa-${copied ? 'check' : 'copy'}`}></i>
                                    {copied ? ' Copied!' : ' Copy'}
                                </button>
                            </div>
                        )}

                        <div className="admin-alert admin-alert-warning" style={{ marginBottom: '1rem' }}>
                            <i className="fas fa-exclamation-triangle"></i>
                            Share this password securely with the user. They can change it after logging in via Profile Settings.
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button type="button" className="btn btn-outline" onClick={onClose}>
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                {loading ? (
                                    <><i className="fas fa-spinner fa-spin"></i> Resetting...</>
                                ) : (
                                    <><i className="fas fa-key"></i> Reset Password</>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordModal;