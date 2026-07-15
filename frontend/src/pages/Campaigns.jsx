import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import api from '../api/axios';
import { Megaphone, Plus, Send, CheckCircle2, Eye, MousePointerClick, TrendingUp } from 'lucide-react';

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [segments, setSegments] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Campaign Form
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [name, setName] = useState('');
  const [channel, setChannel] = useState('email');
  const [targetSegmentId, setTargetSegmentId] = useState('');
  const [templateSubject, setTemplateSubject] = useState('');
  const [templateBody, setTemplateBody] = useState('');
  const [submittingCampaign, setSubmittingCampaign] = useState(false);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      api.get('/crm/campaigns'),
      api.get('/crm/segments')
    ])
      .then(([campRes, segRes]) => {
        if (campRes.data.success) setCampaigns(campRes.data.campaigns);
        if (segRes.data.success) {
          setSegments(segRes.data.segments);
          if (segRes.data.segments.length > 0) {
            setTargetSegmentId(segRes.data.segments[0]._id);
          }
        }
      })
      .catch(err => console.error('Error fetching campaigns data', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateCampaign = async (e) => {
    e.preventDefault();
    if (!name || !templateBody || !targetSegmentId) {
      alert('Please fill out Name, Target Segment, and Message Body.');
      return;
    }
    setSubmittingCampaign(true);
    try {
      const res = await api.post('/crm/campaigns', {
        name,
        channel,
        targetSegmentId,
        templateSubject,
        templateBody
      });
      if (res.data.success) {
        alert('Campaign draft created.');
        setShowCreateModal(false);
        setName('');
        setTemplateSubject('');
        setTemplateBody('');
        loadData();
      }
    } catch (err) {
      alert('Error creating campaign draft.');
    } finally {
      setSubmittingCampaign(false);
    }
  };

  const handleSendCampaign = async (campaignId) => {
    if (!window.confirm('Send this outreach campaign now? This logs interactions for all recipients.')) return;
    try {
      const res = await api.post(`/crm/campaigns/${campaignId}/send`);
      if (res.data.success) {
        alert(res.data.message);
        loadData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error executing campaign.');
    }
  };

  return (
    <>
      <Header title="Outbound Campaigns Desk" />
      <div className="crm-body">
        
        {/* Toolbar */}
        <div className="crm-card mb-6" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            Run retention and re-engagement campaigns via Email or WhatsApp.
          </p>
          <button className="crm-btn crm-btn-primary" onClick={() => setShowCreateModal(true)}>
            <Plus size={16} />
            <span>Launch Campaign</span>
          </button>
        </div>

        {/* Campaigns listing */}
        {loading ? (
          <p style={{ color: 'var(--primary)', fontWeight: 600 }}>Syncing campaigns history...</p>
        ) : campaigns.length === 0 ? (
          <div className="crm-card" style={{ textAlign: 'center', padding: '60px' }}>
            <Megaphone size={40} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
            <h4 style={{ fontSize: '16px', fontWeight: 600 }}>No campaigns launched yet</h4>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {campaigns.map(c => (
              <div key={c._id} className="crm-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                  <div>
                    <h4 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-main)' }}>{c.name}</h4>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Channel: <span style={{ textTransform: 'uppercase', color: 'var(--primary)', fontWeight: 600 }}>{c.channel}</span> • Target: <span style={{ color: 'var(--text-main)' }}>{c.targetSegment?.name}</span>
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span className={`badge badge-${c.status === 'sent' ? 'active' : 'waiting'}`}>{c.status}</span>
                    {c.status !== 'sent' && (
                      <button className="crm-btn crm-btn-primary" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => handleSendCampaign(c._id)}>
                        <Send size={12} />
                        <span>Send Now</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Statistics display if campaign has been sent */}
                {c.status === 'sent' && (
                  <div className="crm-grid-metrics" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '0', gap: '12px' }}>
                    <div style={{ backgroundColor: 'rgba(59, 35, 20, 0.03)', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                      <div className="text-xs text-muted">Messages Sent</div>
                      <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-main)', marginTop: '4px' }}>{c.stats?.sent}</div>
                    </div>
                    <div style={{ backgroundColor: 'rgba(59, 35, 20, 0.03)', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                      <div className="text-xs text-muted" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Eye size={12} /> Opens</div>
                      <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-green)', marginTop: '4px' }}>
                        {c.stats?.opened} <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>({Math.round((c.stats?.opened / c.stats?.sent) * 100)}%)</span>
                      </div>
                    </div>
                    <div style={{ backgroundColor: 'rgba(59, 35, 20, 0.03)', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                      <div className="text-xs text-muted" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MousePointerClick size={12} /> Clicks</div>
                      <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--info)', marginTop: '4px' }}>
                        {c.stats?.clicked} <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>({Math.round((c.stats?.clicked / c.stats?.sent) * 100)}%)</span>
                      </div>
                    </div>
                    <div style={{ backgroundColor: 'rgba(59, 35, 20, 0.03)', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                      <div className="text-xs text-muted" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><TrendingUp size={12} /> Conversions</div>
                      <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--purple)', marginTop: '4px' }}>
                        {c.stats?.converted} <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>({Math.round((c.stats?.converted / c.stats?.sent) * 100)}%)</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Create Campaign Modal */}
        {showCreateModal && (
          <div className="crm-modal-backdrop">
            <div className="crm-modal" style={{ width: '560px' }}>
              <div className="crm-modal-header">
                <h3 className="crm-modal-title">Create Campaign Draft</h3>
                <button onClick={() => setShowCreateModal(false)} style={{ color: 'var(--text-muted)' }}>✕</button>
              </div>
              <form onSubmit={handleCreateCampaign}>
                <div className="crm-modal-body">
                  <div className="crm-form-group">
                    <label className="crm-form-label">Campaign Name</label>
                    <input 
                      type="text" 
                      className="crm-input" 
                      placeholder="e.g. Nagpur Monsoon Reading Campaign"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  <div className="crm-grid-metrics" style={{ gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '0' }}>
                    <div className="crm-form-group">
                      <label className="crm-form-label">Channel</label>
                      <select className="crm-select" value={channel} onChange={(e) => setChannel(e.target.value)}>
                        <option value="email">Email</option>
                        <option value="WhatsApp">WhatsApp</option>
                        <option value="SMS">SMS</option>
                      </select>
                    </div>

                    <div className="crm-form-group">
                      <label className="crm-form-label">Target Segment</label>
                      <select className="crm-select" value={targetSegmentId} onChange={(e) => setTargetSegmentId(e.target.value)}>
                        {segments.map(s => (
                          <option key={s._id} value={s._id}>{s.name} ({s.memberCount} members)</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {channel === 'email' && (
                    <div className="crm-form-group">
                      <label className="crm-form-label">Subject</label>
                      <input 
                        type="text" 
                        className="crm-input" 
                        placeholder="e.g. Check out these books handpicked for you!"
                        value={templateSubject}
                        onChange={(e) => setTemplateSubject(e.target.value)}
                      />
                    </div>
                  )}

                  <div className="crm-form-group">
                    <label className="crm-form-label">Message Body Template (Merge tags: {"{{name}}"}, {"{{email}}"})</label>
                    <textarea 
                      className="crm-textarea" 
                      rows="6" 
                      placeholder="Hi {{name}},\nWe noticed you love reading... check out Nagpur's neighborhood hubs today!"
                      value={templateBody}
                      onChange={(e) => setTemplateBody(e.target.value)}
                    />
                  </div>
                </div>
                <div className="crm-modal-footer">
                  <button type="button" className="crm-btn crm-btn-secondary" onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="crm-btn crm-btn-primary" disabled={submittingCampaign}>
                    {submittingCampaign ? 'Creating...' : 'Create Draft'}
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
