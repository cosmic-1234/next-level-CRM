import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import api from '../api/axios';
import { Search, Filter, ShieldAlert, ArrowRight, UserPlus } from 'lucide-react';

export default function Contacts() {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Load admins to support displaying assignments
  const [admins, setAdmins] = useState([]);

  useEffect(() => {
    // Load members
    setLoading(true);
    const params = {
      search,
      lifecycleStage: stageFilter,
      acquisitionSource: sourceFilter,
      tag: tagFilter,
      page,
      limit: 10
    };

    api.get('/crm/contacts', { params })
      .then(res => {
        if (res.data.success) {
          setContacts(res.data.contacts);
          setTotalPages(res.data.pagination.pages);
        }
      })
      .catch(err => console.error('Error fetching contacts', err))
      .finally(() => setLoading(false));
  }, [search, stageFilter, sourceFilter, tagFilter, page]);

  return (
    <>
      <Header title="Member 360 Directory" />
      <div className="crm-body">
        
        {/* Filters Toolbar */}
        <div className="crm-card mb-6" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            
            {/* Search */}
            <div style={{ flex: 1, minWidth: '260px', position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#9ca3af' }} />
              <input 
                type="text" 
                className="crm-input" 
                style={{ paddingLeft: '38px' }}
                placeholder="Search by name, email, or telephone..." 
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            </div>

            {/* Lifecycle Dropdown */}
            <div style={{ width: '160px' }}>
              <select 
                className="crm-select" 
                value={stageFilter} 
                onChange={(e) => { setStageFilter(e.target.value); setPage(1); }}
              >
                <option value="">All Stages</option>
                <option value="lead">Lead</option>
                <option value="active">Active</option>
                <option value="at-risk">At-Risk</option>
                <option value="churned">Churned</option>
                <option value="vip">VIP</option>
              </select>
            </div>

            {/* Source Dropdown */}
            <div style={{ width: '160px' }}>
              <select 
                className="crm-select" 
                value={sourceFilter} 
                onChange={(e) => { setSourceFilter(e.target.value); setPage(1); }}
              >
                <option value="">All Sources</option>
                <option value="organic">Organic</option>
                <option value="referral">Referral</option>
                <option value="hub walk-in">Hub Walk-in</option>
                <option value="forum">Forum</option>
                <option value="social">Social</option>
                <option value="ad campaign">Ad Campaign</option>
              </select>
            </div>

            {/* Custom Tag input */}
            <div style={{ width: '160px' }}>
              <input 
                type="text"
                className="crm-input"
                placeholder="Filter by Tag..."
                value={tagFilter}
                onChange={(e) => { setTagFilter(e.target.value); setPage(1); }}
              />
            </div>

          </div>
        </div>

        {/* Members Directory Grid */}
        <div className="crm-table-container">
          <table className="crm-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email / Contact</th>
                <th>Area / Nagpur</th>
                <th>Acquisition</th>
                <th>Lifecycle Stage</th>
                <th>Assigned Owner</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '30px 0', color: 'var(--primary)' }}>
                    Fetching records...
                  </td>
                </tr>
              ) : contacts.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)' }}>
                    No members matching filters found.
                  </td>
                </tr>
              ) : (
                contacts.map(c => (
                  <tr key={c._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="crm-user-avatar" style={{ width: '32px', height: '32px', fontSize: '12px' }}>
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold" style={{ color: 'var(--text-main)' }}>{c.name}</div>
                          {c.tags && c.tags.length > 0 && (
                            <div style={{ display: 'flex', gap: '4px', marginTop: '2px', flexWrap: 'wrap' }}>
                              {c.tags.slice(0, 3).map((t, idx) => (
                                <span key={idx} style={{ fontSize: '9px', backgroundColor: '#374151', color: '#9ca3af', padding: '1px 5px', borderRadius: '4px' }}>
                                  {t}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div>{c.email}</div>
                      <div className="text-xs text-muted">{c.phone || 'No phone'}</div>
                    </td>
                    <td>
                      <div>{c.address?.area || 'Nagpur'}</div>
                      <div className="text-xs text-muted">{c.address?.pincode}</div>
                    </td>
                    <td style={{ textTransform: 'capitalize' }}>{c.acquisitionSource || 'organic'}</td>
                    <td>
                      <span className={`badge badge-${c.lifecycleStage || 'lead'}`}>
                        {c.lifecycleStage || 'lead'}
                      </span>
                    </td>
                    <td>
                      {c.assignedOwner ? (
                        <span style={{ fontSize: '13px' }}>{c.assignedOwner.name}</span>
                      ) : (
                        <span className="text-muted text-xs">Unassigned</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        className="crm-btn crm-btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '12px' }}
                        onClick={() => navigate(`/crm/contacts/${c._id}`)}
                      >
                        <span>360 Profile</span>
                        <ArrowRight size={12} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '24px' }}>
            <button 
              className="crm-btn crm-btn-secondary" 
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(p - 1, 1))}
            >
              Previous
            </button>
            <span style={{ display: 'flex', alignItems: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
              Page {page} of {totalPages}
            </span>
            <button 
              className="crm-btn crm-btn-secondary" 
              disabled={page === totalPages}
              onClick={() => setPage(p => Math.min(p + 1, totalPages))}
            >
              Next
            </button>
          </div>
        )}

      </div>
    </>
  );
}
