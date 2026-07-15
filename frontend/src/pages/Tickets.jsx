import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import api from '../api/axios';
import { Ticket, Plus, Search, Filter, MessageSquare, Clock } from 'lucide-react';

export default function Tickets() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Ticket Creator Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('other');
  const [priority, setPriority] = useState('medium');
  const [targetUserEmail, setTargetUserEmail] = useState('');
  const [submittingTicket, setSubmittingTicket] = useState(false);

  const loadTickets = () => {
    setLoading(true);
    const params = {
      status: statusFilter,
      priority: priorityFilter,
      category: categoryFilter
    };
    api.get('/crm/tickets', { params })
      .then(res => {
        if (res.data.success) {
          setTickets(res.data.tickets);
        }
      })
      .catch(err => console.error('Error loading tickets', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadTickets();
  }, [statusFilter, priorityFilter, categoryFilter]);

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!subject || !description || !targetUserEmail) {
      alert('Please fill out Subject, Description, and User Email.');
      return;
    }
    setSubmittingTicket(true);
    try {
      // Find the user by email first to associate them
      const userRes = await api.get(`/crm/contacts?search=${targetUserEmail}`);
      if (!userRes.data.success || userRes.data.contacts.length === 0) {
        alert('User with that email address not found. Register them first or verify spelling.');
        setSubmittingTicket(false);
        return;
      }
      const targetUser = userRes.data.contacts[0];

      // Submit ticket
      const ticketRes = await api.post('/crm/tickets', {
        subject,
        description,
        category,
        priority,
        userId: targetUser._id
      });

      if (ticketRes.data.success) {
        alert('Support ticket created successfully.');
        setShowCreateModal(false);
        setSubject('');
        setDescription('');
        setTargetUserEmail('');
        loadTickets();
      }
    } catch (err) {
      alert('Error creating ticket.');
    } finally {
      setSubmittingTicket(false);
    }
  };

  return (
    <>
      <Header title="CRM Support Desk" />
      <div className="crm-body">
        
        {/* Toolbar */}
        <div className="crm-card mb-6" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            {/* Status Filter */}
            <select className="crm-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ width: '150px' }}>
              <option value="">All Statuses</option>
              <option value="open">Open</option>
              <option value="in-progress">In Progress</option>
              <option value="waiting-on-user">Waiting on User</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>

            {/* Priority Filter */}
            <select className="crm-select" value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} style={{ width: '150px' }}>
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>

            {/* Category Filter */}
            <select className="crm-select" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} style={{ width: '180px' }}>
              <option value="">All Categories</option>
              <option value="damaged book">Damaged Book</option>
              <option value="late fee dispute">Late Fee Dispute</option>
              <option value="delivery issue">Delivery Issue</option>
              <option value="payment">Payment</option>
              <option value="account">Account</option>
              <option value="other">Other</option>
            </select>
          </div>

          <button className="crm-btn crm-btn-primary" onClick={() => setShowCreateModal(true)}>
            <Plus size={16} />
            <span>File Support Ticket</span>
          </button>
        </div>

        {/* Tickets Table */}
        <div className="crm-table-container">
          <table className="crm-table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Creator User</th>
                <th>Date Opened</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '30px 0', color: 'var(--primary)' }}>
                    Loading tickets queue...
                  </td>
                </tr>
              ) : tickets.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)' }}>
                    No tickets currently in queue.
                  </td>
                </tr>
              ) : (
                tickets.map(t => (
                  <tr key={t._id}>
                    <td>
                      <div className="font-semibold" style={{ color: 'var(--text-main)' }}>{t.subject}</div>
                      <div className="text-xs text-muted" style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                        <MessageSquare size={10} /> {t.messages?.length || 0} messages
                      </div>
                    </td>
                    <td style={{ textTransform: 'capitalize' }}>{t.category}</td>
                    <td>
                      <span className={`badge badge-${t.priority}`}>
                        {t.priority}
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge-${t.status === 'waiting-on-user' ? 'waiting' : t.status}`}>
                        {t.status}
                      </span>
                    </td>
                    <td>
                      <div>{t.user?.name || 'Community Member'}</div>
                      <div className="text-xs text-muted">{t.user?.email}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} />
                        <span>{new Date(t.createdAt).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        className="crm-btn crm-btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '12px' }}
                        onClick={() => navigate(`/crm/tickets/${t._id}`)}
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Create Ticket Modal */}
        {showCreateModal && (
          <div className="crm-modal-backdrop">
            <div className="crm-modal" style={{ width: '560px' }}>
              <div className="crm-modal-header">
                <h3 className="crm-modal-title">File Support Ticket</h3>
                <button onClick={() => setShowCreateModal(false)} style={{ color: 'var(--text-muted)' }}>✕</button>
              </div>
              <form onSubmit={handleCreateTicket}>
                <div className="crm-modal-body">
                  <div className="crm-form-group">
                    <label className="crm-form-label">Member Email Address</label>
                    <input 
                      type="email" 
                      className="crm-input" 
                      placeholder="user@example.com"
                      value={targetUserEmail}
                      onChange={(e) => setTargetUserEmail(e.target.value)}
                    />
                  </div>

                  <div className="crm-form-group">
                    <label className="crm-form-label">Ticket Subject</label>
                    <input 
                      type="text" 
                      className="crm-input" 
                      placeholder="e.g. Lost book fee adjustment"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                    />
                  </div>

                  <div className="crm-grid-metrics" style={{ gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '0' }}>
                    <div className="crm-form-group">
                      <label className="crm-form-label">Category</label>
                      <select className="crm-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                        <option value="damaged book">Damaged Book</option>
                        <option value="late fee dispute">Late Fee Dispute</option>
                        <option value="delivery issue">Delivery Issue</option>
                        <option value="payment">Payment</option>
                        <option value="account">Account</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div className="crm-form-group">
                      <label className="crm-form-label">Priority</label>
                      <select className="crm-select" value={priority} onChange={(e) => setPriority(e.target.value)}>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                  </div>

                  <div className="crm-form-group">
                    <label className="crm-form-label">Description of Issue</label>
                    <textarea 
                      className="crm-textarea" 
                      rows="4" 
                      placeholder="Describe the complaint or support detail in full..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                </div>
                <div className="crm-modal-footer">
                  <button type="button" className="crm-btn crm-btn-secondary" onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="crm-btn crm-btn-primary" disabled={submittingTicket}>
                    {submittingTicket ? 'Filing...' : 'Open Ticket'}
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
