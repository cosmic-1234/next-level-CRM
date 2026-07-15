import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import api from '../api/axios';
import { MapPin, Phone, User, BookOpen, Edit2, ShieldAlert } from 'lucide-react';

export default function Hubs() {
  const [hubs, setHubs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Performance modal
  const [selectedHub, setSelectedHub] = useState(null);
  const [performanceData, setPerformanceData] = useState(null);
  const [loadingPerformance, setLoadingPerformance] = useState(false);

  // Update Status Form
  const [status, setStatus] = useState('');
  const [agreementNotes, setAgreementNotes] = useState('');
  const [updatingHub, setUpdatingHub] = useState(false);

  const loadHubs = () => {
    setLoading(true);
    api.get('/crm/hubs')
      .then(res => {
        if (res.data.success) {
          setHubs(res.data.hubs);
        }
      })
      .catch(err => console.error('Error fetching hubs pipeline', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadHubs();
  }, []);

  const handleOpenPerformance = (hub) => {
    setSelectedHub(hub);
    setStatus(hub.status);
    setAgreementNotes(hub.agreementNotes || '');
    setLoadingPerformance(true);
    
    api.get(`/crm/hubs/${hub._id}/performance`)
      .then(res => {
        if (res.data.success) {
          setPerformanceData(res.data.data);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoadingPerformance(false));
  };

  const handleSaveHubProperties = async (e) => {
    e.preventDefault();
    setUpdatingHub(true);
    try {
      const res = await api.patch(`/crm/hubs/${selectedHub._id}`, {
        status,
        agreementNotes
      });
      if (res.data.success) {
        alert('Hub status and notes updated.');
        setSelectedHub(null);
        loadHubs();
      }
    } catch (err) {
      alert('Error updating hub.');
    } finally {
      setUpdatingHub(false);
    }
  };

  return (
    <>
      <Header title="Hub Partners CRM Pipeline" />
      <div className="crm-body">
        
        {/* Hub Pipeline Grid */}
        {loading ? (
          <p style={{ color: 'var(--primary)', fontWeight: 600 }}>Loading partner pipeline...</p>
        ) : hubs.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No neighborhood hubs registered.</p>
        ) : (
          <div className="grid-3">
            {hubs.map(h => (
              <div 
                key={h._id} 
                className="crm-card" 
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'space-between', 
                  gap: '16px',
                  borderColor: h.status === 'pending' ? 'var(--warning)' : h.status === 'active' ? 'var(--primary)' : 'var(--border-color)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={12} /> {h.area}
                    </span>
                    <span className={`badge badge-${h.status}`}>{h.status}</span>
                  </div>
                  <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-main)', marginTop: '6px' }}>{h.address}</h4>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>{h.description}</p>
                  
                  <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '10px', marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><User size={10} /> Host: {h.hostUser?.name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Phone size={10} /> Phone: {h.contactPhone}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #374151', paddingTop: '12px', marginTop: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--primary)', fontWeight: 600 }}>
                    <BookOpen size={12} /> {h.performanceStats?.rentalsRouted || 0} routed
                  </div>
                  <button className="crm-btn crm-btn-secondary" style={{ padding: '4px 8px', fontSize: '11px' }} onClick={() => handleOpenPerformance(h)}>
                    <Edit2 size={10} />
                    <span>Manage Hub</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Manage Hub Modal / Performance Drawer */}
        {selectedHub && (
          <div className="crm-modal-backdrop">
            <div className="crm-modal" style={{ width: '560px' }}>
              <div className="crm-modal-header">
                <h3 className="crm-modal-title">Manage Nagpur Collection Hub</h3>
                <button onClick={() => setSelectedHub(null)} style={{ color: 'var(--text-muted)' }}>✕</button>
              </div>
              <form onSubmit={handleSaveHubProperties}>
                <div className="crm-modal-body">
                   <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>Partner Performance Metrics</h4>
                  {loadingPerformance ? (
                    <p style={{ color: 'var(--primary)', fontSize: '12px' }}>Aggregating routed rentals statistics...</p>
                  ) : performanceData ? (
                    <div className="crm-grid-metrics" style={{ gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                      <div style={{ backgroundColor: 'rgba(59, 35, 20, 0.03)', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Total Rentals Routed</div>
                        <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-main)', marginTop: '4px' }}>{performanceData.metrics?.rentalsRoutedCount}</div>
                      </div>
                      <div style={{ backgroundColor: 'rgba(59, 35, 20, 0.03)', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Active Members Using Hub</div>
                        <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--primary)', marginTop: '4px' }}>{performanceData.metrics?.activeRentersCount}</div>
                      </div>
                    </div>
                  ) : null}

                  <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>Status & Agreement</h4>
                  <div className="crm-form-group">
                    <label className="crm-form-label">Application Status</label>
                    <select className="crm-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                      <option value="pending">Pending Admin Review</option>
                      <option value="active">Active (Visible to users)</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>

                  <div className="crm-form-group">
                    <label className="crm-form-label">Agreement Partnership Notes</label>
                    <textarea 
                      className="crm-textarea" 
                      rows="4" 
                      placeholder="Write partner agreement terms, payouts, or collections history..."
                      value={agreementNotes}
                      onChange={(e) => setAgreementNotes(e.target.value)}
                    />
                  </div>
                </div>
                <div className="crm-modal-footer">
                  <button type="button" className="crm-btn crm-btn-secondary" onClick={() => setSelectedHub(null)}>
                    Cancel
                  </button>
                  <button type="submit" className="crm-btn crm-btn-primary" disabled={updatingHub}>
                    {updatingHub ? 'Updating...' : 'Save Hub Partner'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </>
  );
}
