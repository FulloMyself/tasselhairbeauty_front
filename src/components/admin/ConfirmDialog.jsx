import React from 'react';

const ConfirmDialog = ({ title, message, confirmText, cancelText, onConfirm, onCancel, type = 'warning' }) => {
  return (
    <div className="admin-modal" onClick={onCancel}>
      <div className="admin-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
        <div className="admin-modal-header">
          <h3>{title || 'Confirm Action'}</h3>
          <button className="admin-modal-close" onClick={onCancel}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="admin-modal-body" style={{ textAlign: 'center', padding: '2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem', color: type === 'danger' ? 'var(--error)' : 'var(--warning)' }}>
            <i className={`fas fa-${type === 'danger' ? 'exclamation-triangle' : 'question-circle'}`}></i>
          </div>
          <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{message}</p>
        </div>
        
        <div className="admin-modal-footer" style={{ justifyContent: 'center' }}>
          <button className="btn btn-outline" onClick={onCancel}>
            {cancelText || 'Cancel'}
          </button>
          <button 
            className={`btn ${type === 'danger' ? 'btn-primary' : 'btn-primary'}`} 
            onClick={onConfirm}
            style={type === 'danger' ? { background: 'var(--error)', borderColor: 'var(--error)' } : {}}
          >
            {confirmText || 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;