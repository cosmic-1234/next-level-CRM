import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import api from '../api/axios';
import { 
  User, 
  Book, 
  ArrowLeft, 
  MessageSquare, 
  Lock, 
  Send, 
  CheckCircle 
} from 'lucide-react';

export default function TicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);

  // Edit ticket properties states
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [assignedAdmin, setAssignedAdmin] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [updatingProperties, setUpdatingProperties] = useState(false);

  // New message state
  const [messageBody, setMessageBody] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);

  // Fallback admins list
  const [admins, setAdmins] = useState([]);

  const loadTicket = () => {
    setLoading(true);
    api.get(`/crm/tickets/${id}`)
      .then(res => {
        if (res.data.success) {
          const t = res.data.ticket;
          setTicket(t);
          setStatus(t.status);
          setPriority(t.priority);
          setAssignedAdmin(t.assignedAdmin?._id || '');
          setResolutionNotes(t.resolutionNotes || '');
        }
      })
      .catch(err => {
        console.error('Error fetching ticket detail', err);
        alert('Ticket not found.');
        navigate('/crm/tickets');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadTicket();
  }, [id]);

  const handleUpdateProperties = async (e) => {
    e.preventDefault();
    setUpdatingProperties(true);
    try {
      const res = await api.patch(`/crm/tickets/${id}`, {
        status,
        priority,
        assignedAdmin: assignedAdmin || null,
        resolutionNotes
      });
      if (res.data.success) {
        alert('Ticket updated successfully.');
        loadTicket();
      }
    } catch (err) {
      alert('Error updating properties.');
    } finally {
      setUpdatingProperties(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageBody.trim()) return;
    setSendingMessage(true);
    try {
      const res = await api.post(`/crm/tickets/${id}/messages`, {
        body: messageBody,
        isInternal
      });
      if (res.data.success) {
        setMessageBody('');
        setIsInternal(false);
        loadTicket();
      }
    } catch (err) {
      alert('Error posting reply.');
    } finally {
      setSendingMessage(false);
    }
  };

  if (loading || !ticket) {
    return (
      <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <p style={{ color: '#10b981', fontWeight: 600 }}>Loading Ticket details...</p>
      </div>
    );
  }

  return (
    <>
      <Header title={`Manage Ticket: ${ticket.subject}`} />
      <div className="crm-body">
        
        {/* Back Link */}
        <button 
          className="crm-btn crm-btn-secondary mb-6"
          onClick={() => navigate('/crm/tickets')}
        >
          <ArrowLeft size={14} />
          <span>Back to Tickets queue</span>
        </button>

        {/* 2-column desk */}
        <div style={{ display: 'flex', gap: '24px' }}>
          
          {/* Main Content Area (Chat & resolution logs) */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Ticket Origin Detail */}
            <div className="crm-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #374151', paddingBottom: '12px', marginBottom: '16px' }}>
                <span className="text-muted text-xs">Opened: {new Date(ticket.createdAt).toLocaleString()}</span>
                <span className={`badge badge-${ticket.priority}`}>{ticket.priority} priority</span>
              </div>
              <p style={{ color: 'var(--text-main)', fontSize: '15px', fontWeight: 500 }}>Description</p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '6px' }}>{ticket.description}</p>
            </div>

            {/* Conversation Thread */}
            <div className="crm-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h4 style={{ fontSize: '15px', fontWeight: 600, borderBottom: '1px solid #374151', paddingBottom: '8px' }}>
                Conversation thread
              </h4>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '400px', overflowY: 'auto', paddingRight: '8px' }}>
                {ticket.messages?.map((m, idx) => (
                  <div 
                    key={idx} 
                    style={{
                      alignSelf: m.sender?.role === 'admin' ? 'flex-end' : 'flex-start',
                      width: '80%',
                      backgroundColor: m.isInternal ? 'rgba(196, 144, 106, 0.12)' : m.sender?.role === 'admin' ? 'var(--primary-light)' : 'rgba(59, 35, 20, 0.03)',
                      border: `1px solid ${m.isInternal ? '#C4906A' : m.sender?.role === 'admin' ? 'var(--primary)' : 'var(--border-color)'}`,
                      borderRadius: '8px',
                      padding: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                      <span className="font-semibold" style={{ color: 'var(--text-main)' }}>
                        {m.sender?.name} {m.sender?.role === 'admin' ? '(Admin)' : ''}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {m.isInternal && (
                          <span style={{ color: '#C4906A', display: 'flex', alignItems: 'center', gap: '2px' }}>
                            <Lock size={10} /> Internal Note
                          </span>
                        )}
                        <span>{new Date(m.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>{m.body}</p>
                  </div>
                ))}
              </div>

              {/* Message Composer */}
              <form onSubmit={handleSendMessage} style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginTop: '10px' }}>
                <div className="crm-form-group">
                  <textarea 
                    className="crm-textarea" 
                    rows="3" 
                    placeholder="Write your response here..."
                    value={messageBody}
                    onChange={(e) => setMessageBody(e.target.value)}
                    disabled={sendingMessage}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={isInternal}
                      onChange={(e) => setIsInternal(e.target.checked)}
                      disabled={sendingMessage}
                    />
                    <span style={{ color: '#a78bfa', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Lock size={12} /> Mark as Internal Note (hidden from reader)
                    </span>
                  </label>
                  <button type="submit" className="crm-btn crm-btn-primary" disabled={sendingMessage}>
                    <Send size={14} />
                    <span>Send Reply</span>
                  </button>
                </div>
              </form>

            </div>

          </div>

          {/* Right Column: Ticket properties panel */}
          <div style={{ width: '340px', flexShrink: 0 }}>
            <div className="crm-card mb-6">
              <h4 className="mb-4" style={{ fontSize: '15px', fontWeight: 600, borderBottom: '1px solid #374151', paddingBottom: '8px' }}>
                Ticket Properties
              </h4>

              <form onSubmit={handleUpdateProperties}>
                <div className="crm-form-group">
                  <label className="crm-form-label">Ticket Status</label>
                  <select 
                    className="crm-select" 
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="open">Open</option>
                    <option value="in-progress">In Progress</option>
                    <option value="waiting-on-user">Waiting on User</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

                <div className="crm-form-group">
                  <label className="crm-form-label">Ticket Priority</label>
                  <select 
                    className="crm-select" 
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div className="crm-form-group">
                  <label className="crm-form-label">Assign Agent Owner</label>
                  <select 
                    className="crm-select" 
                    value={assignedAdmin}
                    onChange={(e) => setAssignedAdmin(e.target.value)}
                  >
                    <option value="">Unassigned</option>
                    <option value={ticket.assignedAdmin?._id || ''}>
                      {ticket.assignedAdmin?.name || 'Current Admin'}
                    </option>
                  </select>
                </div>

                <div className="crm-form-group">
                  <label className="crm-form-label">Resolution Summary</label>
                  <textarea 
                    className="crm-textarea" 
                    rows="3" 
                    placeholder="Write final resolution summary once resolved..."
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                  />
                </div>

                <button type="submit" className="crm-btn crm-btn-primary w-full mt-4" disabled={updatingProperties}>
                  {updatingProperties ? 'Saving...' : 'Save ticket details'}
                </button>
              </form>
            </div>

            {/* User details */}
            <div className="crm-card">
              <h4 className="mb-4" style={{ fontSize: '15px', fontWeight: 600, borderBottom: '1px solid #374151', paddingBottom: '8px' }}>
                Contact Details
              </h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <div className="crm-user-avatar" style={{ width: '32px', height: '32px', fontSize: '12px' }}>
                  {ticket.user?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-semibold">{ticket.user?.name}</div>
                  <div className="text-xs text-muted">{ticket.user?.email}</div>
                </div>
              </div>
              <button 
                className="crm-btn crm-btn-secondary w-full"
                onClick={() => navigate(`/crm/contacts/${ticket.user?._id}`)}
              >
                Go to 360 Profile
              </button>
            </div>
          </div>

        </div>

      </div>
    </>
  );
}
