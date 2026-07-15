import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import api from '../api/axios';
import { Settings as Gear, ShieldCheck, Mail, Lock } from 'lucide-react';

export default function Settings() {
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(true);

  // Email Template states
  const [dueReminderSubject, setDueReminderSubject] = useState('Book Due Date Reminder');
  const [dueReminderBody, setDueReminderBody] = useState('Hi {{name}},\nThis is a friendly reminder that your book "{{book_title}}" is due back on {{due_date}}.\nThank you!');
  const [savingTemplates, setSavingTemplates] = useState(false);

  useEffect(() => {
    // Load Audit Logs
    api.get('/crm/audit-log')
      .then(res => {
        if (res.data.success) {
          setLogs(res.data.logs);
        }
      })
      .catch(err => console.error('Error fetching audit logs', err))
      .finally(() => setLoadingLogs(false));
  }, []);

  const handleSaveTemplates = (e) => {
    e.preventDefault();
    setSavingTemplates(true);
    setTimeout(() => {
      alert('Outreach templates saved successfully.');
      setSavingTemplates(false);
    }, 800);
  };

  return (
    <>
      <Header title="CRM Portal Settings & Audits" />
      <div className="crm-body">
        
        {/* 2-column settings layout */}
        <div style={{ display: 'flex', gap: '24px' }}>
          
          {/* Left Panel: Template settings */}
          <div style={{ width: '400px', flexShrink: 0 }}>
            <div className="crm-card">
              <h4 className="mb-4" style={{ fontSize: '16px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail size={18} />
                <span>Outreach Email Templates</span>
              </h4>

              <form onSubmit={handleSaveTemplates}>
                <div className="crm-form-group">
                  <label className="crm-form-label">Rental Due Reminder (Email Subject)</label>
                  <input 
                    type="text" 
                    className="crm-input" 
                    value={dueReminderSubject}
                    onChange={(e) => setDueReminderSubject(e.target.value)}
                  />
                </div>

                <div className="crm-form-group">
                  <label className="crm-form-label">Rental Due Reminder (Email Body)</label>
                  <textarea 
                    className="crm-textarea" 
                    rows="6" 
                    value={dueReminderBody}
                    onChange={(e) => setDueReminderBody(e.target.value)}
                  />
                </div>

                <button type="submit" className="crm-btn crm-btn-primary w-full mt-4" disabled={savingTemplates}>
                  {savingTemplates ? 'Saving...' : 'Save Template Settings'}
                </button>
              </form>
            </div>
          </div>

          {/* Right Panel: Audit Logs */}
          <div style={{ flex: 1 }}>
            <div className="crm-card">
              <h4 className="mb-4" style={{ fontSize: '16px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={18} />
                <span>Super Admin Audit Trail</span>
              </h4>
              
              <div className="crm-table-container" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                <table className="crm-table">
                  <thead>
                    <tr>
                      <th>Timestamp</th>
                      <th>Admin actor</th>
                      <th>Action</th>
                      <th>Target type</th>
                      <th>Key Changes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingLogs ? (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center', padding: '20px 0' }}>Loading logs trail...</td>
                      </tr>
                    ) : logs.length === 0 ? (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center', padding: '20px 0' }}>No admin audit logs recorded.</td>
                      </tr>
                    ) : (
                      logs.map(log => (
                        <tr key={log._id}>
                          <td style={{ fontSize: '11px', whiteSpace: 'nowrap' }}>
                            {new Date(log.createdAt).toLocaleString()}
                          </td>
                          <td className="font-semibold" style={{ color: 'var(--text-main)' }}>{log.actor?.name}</td>
                          <td style={{ textTransform: 'capitalize' }}>
                            {log.action?.toLowerCase().replace(/_/g, ' ')}
                          </td>
                          <td>
                            <span className="badge badge-low">{log.targetType}</span>
                          </td>
                          <td style={{ fontSize: '12px' }}>
                            {log.afterValues ? (
                              <code style={{ color: 'var(--text-green)' }}>
                                {JSON.stringify(log.afterValues)}
                              </code>
                            ) : log.beforeValues ? (
                              <code style={{ color: 'var(--danger)' }}>
                                Removed: {JSON.stringify(log.beforeValues)}
                              </code>
                            ) : '-'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>

      </div>
    </>
  );
}
