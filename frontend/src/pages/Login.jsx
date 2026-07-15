import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { KeyRound, Mail, AlertTriangle } from 'lucide-react';

export default function Login() {
  const { login, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setLocalError('Please fill out all fields.');
      return;
    }
    try {
      setLocalError(null);
      setSubmitting(true);
      await login(email, password);
    } catch (err) {
      setLocalError(err.message || 'Authentication failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      width: '100vw',
      backgroundColor: 'var(--bg-main)',
      fontFamily: 'var(--font-sans)'
    }}>
      <div className="crm-card" style={{ width: '400px', padding: '36px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: '48px', height: '48px', marginBottom: '10px' }}>
            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: 'var(--primary)' }}>
              <circle cx="20" cy="20" r="19" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M20 30C20 30 8 22 8 14C8 10.7 10.7 8 14 8C16.4 8 18.5 9.4 20 11.5C21.5 9.4 23.6 8 26 8C29.3 8 32 10.7 32 14C32 22 20 30 20 30Z" fill="currentColor" opacity="0.15"/>
              <path d="M20 28C14 23 10 18 10 14C10 11.8 11.8 10 14 10C16.1 10 17.9 11.3 20 13.5C22.1 11.3 23.9 10 26 10C28.2 10 30 11.8 30 14C30 18 26 23 20 28Z" stroke="currentColor" strokeWidth="1.2" fill="none"/>
              <path d="M20 13V28M20 13C18 11 15 10 14 10" stroke="currentColor" strokeWidth="1"/>
            </svg>
          </div>
          <h1 style={{ fontSize: '28px', color: 'var(--primary)', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>Next Level CRM</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>Administrative Portal</p>
        </div>

        {(localError || error) && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            backgroundColor: 'var(--danger-light)',
            border: '1px solid var(--danger)',
            borderRadius: '6px',
            padding: '12px',
            color: 'var(--danger)',
            fontSize: '13px',
            marginBottom: '20px'
          }}>
            <AlertTriangle size={18} style={{ flexShrink: 0 }} />
            <span>{localError || error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="crm-form-group">
            <label className="crm-form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
              <input 
                type="email" 
                className="crm-input" 
                style={{ paddingLeft: '38px' }}
                placeholder="admin@nextdoorlibrary.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={submitting}
              />
            </div>
          </div>

          <div className="crm-form-group" style={{ marginBottom: '28px' }}>
            <label className="crm-form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <KeyRound size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
              <input 
                type="password" 
                className="crm-input" 
                style={{ paddingLeft: '38px' }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={submitting}
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="crm-btn crm-btn-primary"
            style={{ 
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: '13px 24px',
              marginTop: '8px'
            }}
            disabled={submitting}
          >
            {submitting ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
