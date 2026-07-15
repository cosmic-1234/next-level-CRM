import React from 'react';

export default function LoadingScreen() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      width: '100vw',
      backgroundColor: 'var(--bg-main)',
      color: 'var(--primary)',
      gap: '20px'
    }}>
      <div style={{
        width: '50px',
        height: '50px',
        border: '4px solid var(--primary-light)',
        borderTop: '4px solid var(--primary)',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }} />
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <div style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: '18px' }}>
        Loading Next Level CRM...
      </div>
    </div>
  );
}
