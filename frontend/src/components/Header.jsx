import React, { useState, useEffect } from 'react';
import { Bell, User } from 'lucide-react';
import api from '../api/axios';

export default function Header({ title }) {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    // Fetch critical logs/notifications (e.g. recent open tickets)
    api.get('/crm/tickets?status=open')
      .then(res => {
        if (res.data.success) {
          const tickets = res.data.tickets.slice(0, 5).map(t => ({
            id: t._id,
            text: `New Ticket: ${t.subject}`,
            time: new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }));
          setNotifications(tickets);
        }
      })
      .catch(err => console.error('Error loading header alerts', err));
  }, []);

  return (
    <header className="crm-header">
      <h2 className="crm-header-title">{title || 'Next Level CRM'}</h2>

      <div className="crm-header-actions">
        <div style={{ position: 'relative' }}>
          <button 
            className="crm-notification-btn" 
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell size={20} />
            {notifications.length > 0 && <span className="crm-notification-dot" />}
          </button>

          {showNotifications && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: '45px',
              width: '280px',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              boxShadow: 'var(--shadow-md)',
              zIndex: 500,
              padding: '12px',
              color: 'var(--text-main)'
            }}>
              <h4 style={{ fontSize: '14px', fontWeight: 600, borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '8px' }}>
                Notifications ({notifications.length})
              </h4>
              {notifications.length === 0 ? (
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', padding: '10px 0' }}>
                  No new support alerts
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {notifications.map(n => (
                    <div key={n.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '4px 0', borderBottom: '1px dotted var(--border-color)' }}>
                      <span style={{ color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '180px' }}>{n.text}</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>{n.time}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
