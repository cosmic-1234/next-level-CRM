import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import api from '../api/axios';
import { Plus, Users, Trash2, ShieldCheck, Download } from 'lucide-react';

export default function Segments() {
  const [segments, setSegments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selector
  const [selectedSegmentId, setSelectedSegmentId] = useState(null);
  const [segmentMembers, setSegmentMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  // New Segment form states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [name, setName] = useState('');
  const [area, setArea] = useState('');
  const [pincode, setPincode] = useState('');
  const [lifecycleStage, setLifecycleStage] = useState('');
  const [minRentalsCount, setMinRentalsCount] = useState('');
  const [minWishlistSize, setMinWishlistSize] = useState('');
  const [hasOverdueRentals, setHasOverdueRentals] = useState(false);
  const [submittingSegment, setSubmittingSegment] = useState(false);

  const loadSegments = () => {
    setLoading(true);
    api.get('/crm/segments')
      .then(res => {
        if (res.data.success) {
          setSegments(res.data.segments);
        }
      })
      .catch(err => console.error('Error fetching segments', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadSegments();
  }, []);

  const handleSelectSegment = (segmentId) => {
    setSelectedSegmentId(segmentId);
    setLoadingMembers(true);
    api.get(`/crm/segments/${segmentId}/members`)
      .then(res => {
        if (res.data.success) {
          setSegmentMembers(res.data.members);
          // Reload segments list to get updated memberCount cache
          api.get('/crm/segments').then(r => setSegments(r.data.segments));
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoadingMembers(false));
  };

  const handleCreateSegment = async (e) => {
    e.preventDefault();
    if (!name) return;
    setSubmittingSegment(true);

    const filterCriteria = {};
    if (area) filterCriteria.area = area;
    if (pincode) filterCriteria.pincode = pincode;
    if (lifecycleStage) filterCriteria.lifecycleStage = lifecycleStage;
    if (minRentalsCount) filterCriteria.minRentalsCount = minRentalsCount;
    if (minWishlistSize) filterCriteria.minWishlistSize = minWishlistSize;
    if (hasOverdueRentals) filterCriteria.hasOverdueRentals = true;

    try {
      const res = await api.post('/crm/segments', {
        name,
        filterCriteria
      });
      if (res.data.success) {
        alert('Segment created successfully.');
        setShowCreateModal(false);
        setName('');
        setArea('');
        setPincode('');
        setLifecycleStage('');
        setMinRentalsCount('');
        setMinWishlistSize('');
        setHasOverdueRentals(false);
        loadSegments();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating segment.');
    } finally {
      setSubmittingSegment(false);
    }
  };

  const handleDeleteSegment = async (segmentId, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this segment filter?')) return;
    try {
      const res = await api.delete(`/crm/segments/${segmentId}`);
      if (res.data.success) {
        if (selectedSegmentId === segmentId) {
          setSelectedSegmentId(null);
          setSegmentMembers([]);
        }
        loadSegments();
      }
    } catch (err) {
      alert('Error removing segment.');
    }
  };

  return (
    <>
      <Header title="CRM Segmentation Engine" />
      <div className="crm-body">
        
        {/* Main Columns */}
        <div style={{ display: 'flex', gap: '24px' }}>
          
          {/* Left panel: Segments List */}
          <div style={{ width: '360px', flexShrink: 0 }}>
            <div className="crm-card mb-6" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="font-semibold" style={{ fontSize: '15px' }}>Saved Segments</span>
              <button className="crm-btn crm-btn-primary" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => setShowCreateModal(true)}>
                <Plus size={14} />
                <span>New Segment</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {loading ? (
                <p style={{ color: 'var(--text-muted)' }}>Syncing segments list...</p>
              ) : segments.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>No saved segments created yet.</p>
              ) : (
                segments.map(s => (
                  <div 
                    key={s._id} 
                    className={`crm-card`} 
                    style={{ 
                      padding: '16px', 
                      cursor: 'pointer', 
                      borderColor: selectedSegmentId === s._id ? 'var(--primary)' : 'var(--border-color)',
                      backgroundColor: selectedSegmentId === s._id ? 'var(--primary-light)' : 'var(--bg-card)'
                    }}
                    onClick={() => handleSelectSegment(s._id)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)' }}>{s.name}</h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                          <Users size={10} /> {s.memberCount || 0} members matched
                        </div>
                      </div>
                      <button onClick={(e) => handleDeleteSegment(s._id, e)} style={{ color: 'var(--danger)' }}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right panel: Segment Members Resolution */}
          <div style={{ flex: 1 }}>
            {selectedSegmentId ? (
              <div className="crm-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #374151', paddingBottom: '12px', marginBottom: '16px' }}>
                  <h4 style={{ fontSize: '16px', fontWeight: 600 }}>Segment Members Listing</h4>
                  <button className="crm-btn crm-btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => alert('CSV exported (Simulated)')}>
                    <Download size={12} />
                    <span>Export CSV</span>
                  </button>
                </div>

                {loadingMembers ? (
                  <p style={{ color: 'var(--primary)', fontWeight: 500 }}>Compiling queries...</p>
                ) : segmentMembers.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)' }}>No members match the segment filter criteria.</p>
                ) : (
                  <div className="crm-table-container">
                    <table className="crm-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email / Contact</th>
                          <th>Nagpur Area</th>
                          <th>Lifecycle Stage</th>
                        </tr>
                      </thead>
                      <tbody>
                        {segmentMembers.map(m => (
                          <tr key={m._id}>
                            <td className="font-semibold" style={{ color: 'var(--text-main)' }}>{m.name}</td>
                            <td>
                              <div>{m.email}</div>
                              <div className="text-xs text-muted">{m.phone}</div>
                            </td>
                            <td>{m.address?.area || 'Nagpur'}</td>
                            <td>
                              <span className={`badge badge-${m.lifecycleStage}`}>
                                {m.lifecycleStage}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ) : (
              <div className="crm-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px', borderStyle: 'dashed' }}>
                <Users size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
                <h4 style={{ fontSize: '16px', fontWeight: 600 }}>No segment selected</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px', textAlign: 'center', maxWidth: '320px' }}>
                  Select a saved segment from the left sidebar or create a new filter query to compile member list.
                </p>
              </div>
            )}
          </div>

        </div>

        {/* Create Segment Modal */}
        {showCreateModal && (
          <div className="crm-modal-backdrop">
            <div className="crm-modal">
              <div className="crm-modal-header">
                <h3 className="crm-modal-title">Create Segmentation Filter</h3>
                <button onClick={() => setShowCreateModal(false)} style={{ color: 'var(--text-muted)' }}>✕</button>
              </div>
              <form onSubmit={handleCreateSegment}>
                <div className="crm-modal-body">
                  <div className="crm-form-group">
                    <label className="crm-form-label">Segment Name</label>
                    <input 
                      type="text" 
                      className="crm-input" 
                      placeholder="e.g. Dharampeth active readers"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  <div className="crm-grid-metrics" style={{ gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '0' }}>
                    <div className="crm-form-group">
                      <label className="crm-form-label">Nagpur Area</label>
                      <select className="crm-select" value={area} onChange={(e) => setArea(e.target.value)}>
                        <option value="">Any Area</option>
                        <option value="Dharampeth">Dharampeth</option>
                        <option value="Sitabuldi">Sitabuldi</option>
                        <option value="Sadar">Sadar</option>
                        <option value="Civil Lines">Civil Lines</option>
                        <option value="Bajaj Nagar">Bajaj Nagar</option>
                        <option value="Manewada">Manewada</option>
                        <option value="Wardha Road">Wardha Road</option>
                      </select>
                    </div>

                    <div className="crm-form-group">
                      <label className="crm-form-label">Lifecycle Stage</label>
                      <select className="crm-select" value={lifecycleStage} onChange={(e) => setLifecycleStage(e.target.value)}>
                        <option value="">Any Stage</option>
                        <option value="lead">Lead</option>
                        <option value="active">Active</option>
                        <option value="at-risk">At-Risk</option>
                        <option value="churned">Churned</option>
                        <option value="vip">VIP</option>
                      </select>
                    </div>
                  </div>

                  <div className="crm-grid-metrics" style={{ gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '0' }}>
                    <div className="crm-form-group">
                      <label className="crm-form-label">Min Rentals count</label>
                      <input 
                        type="number" 
                        className="crm-input" 
                        placeholder="e.g. 5"
                        value={minRentalsCount}
                        onChange={(e) => setMinRentalsCount(e.target.value)}
                      />
                    </div>

                    <div className="crm-form-group">
                      <label className="crm-form-label">Min Wishlist count</label>
                      <input 
                        type="number" 
                        className="crm-input" 
                        placeholder="e.g. 3"
                        value={minWishlistSize}
                        onChange={(e) => setMinWishlistSize(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="crm-form-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={hasOverdueRentals}
                        onChange={(e) => setHasOverdueRentals(e.target.checked)}
                      />
                      <span>Must have active overdue book loans</span>
                    </label>
                  </div>
                </div>
                <div className="crm-modal-footer">
                  <button type="button" className="crm-btn crm-btn-secondary" onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="crm-btn crm-btn-primary" disabled={submittingSegment}>
                    {submittingSegment ? 'Saving...' : 'Compile Segment'}
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
