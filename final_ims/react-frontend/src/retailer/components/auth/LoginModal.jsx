import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function LoginModal({ isOpen, onClose, onLoginSuccess }) {
  const { login, loading } = useAuth();
  const [email, setEmail] = useState('john@gmail.com');
  const [password, setPassword] = useState('pass1234');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const session = await login(email, password);
      if (onLoginSuccess) {
        onLoginSuccess(session);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    }
  };

  const handleFillRetailer = () => {
    setEmail('john@gmail.com');
    setPassword('pass1234');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Sign In to Stock Overflow</h3>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div style={{
                background: '#fee2e2',
                color: '#b91c1c',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '13px',
                marginBottom: '16px',
                fontWeight: '500'
              }}>
                {error}
              </div>
            )}

            <div style={{
              background: '#eef2ff',
              border: '1px solid #c7d2fe',
              padding: '10px 12px',
              borderRadius: '8px',
              marginBottom: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#4338ca', textTransform: 'uppercase' }}>
                  Demo Retailer Account
                </div>
                <div style={{ fontSize: '12px', color: '#312e81' }}>
                  john@gmail.com / pass1234
                </div>
              </div>
              <button
                type="button"
                className="btn btn-sm btn-outline"
                style={{ fontSize: '11px', padding: '4px 8px' }}
                onClick={handleFillRetailer}
              >
                Auto-fill
              </button>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-control"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', marginTop: '8px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b' }}>
                <input type="checkbox" defaultChecked /> Remember me
              </label>
              <span style={{ color: '#4f46e5', cursor: 'pointer', fontWeight: '600' }}>Forgot password?</span>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
