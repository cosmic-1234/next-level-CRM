import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import api from '../api/axios';
import { 
  Plus, 
  Trash2, 
  Clock, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Layers 
} from 'lucide-react';

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Task Creator Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('medium');
  const [submittingTask, setSubmittingTask] = useState(false);

  const loadTasks = () => {
    setLoading(true);
    api.get('/crm/tasks')
      .then(res => {
        if (res.data.success) {
          setTasks(res.data.tasks);
        }
      })
      .catch(err => console.error('Error fetching tasks', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!title || !dueDate) {
      alert('Please fill out Title and Due Date.');
      return;
    }
    setSubmittingTask(true);
    try {
      // Find current user profile to assign task to self (or can be customized)
      const meRes = await api.get('/crm/auth/me');
      const assignedAdminId = meRes.data.user._id;

      const res = await api.post('/crm/tasks', {
        title,
        description,
        dueDate,
        priority,
        assignedAdminId
      });

      if (res.data.success) {
        alert('Task created successfully.');
        setShowCreateModal(false);
        setTitle('');
        setDescription('');
        setDueDate('');
        loadTasks();
      }
    } catch (err) {
      alert('Error creating task.');
    } finally {
      setSubmittingTask(false);
    }
  };

  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      const res = await api.patch(`/crm/tasks/${taskId}`, {
        status: newStatus
      });
      if (res.data.success) {
        loadTasks();
      }
    } catch (err) {
      alert('Error updating status.');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      const res = await api.delete(`/crm/tasks/${taskId}`);
      if (res.data.success) {
        loadTasks();
      }
    } catch (err) {
      alert('Error removing task.');
    }
  };

  const getPriorityColor = (p) => {
    if (p === 'high') return '#fbbf24';
    if (p === 'urgent') return '#f87171';
    return '#9ca3af';
  };

  const todoTasks = tasks.filter(t => t.status === 'todo');
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress');
  const doneTasks = tasks.filter(t => t.status === 'done');

  return (
    <>
      <Header title="CRM Tasks Desk" />
      <div className="crm-body" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 100px)' }}>
        
        {/* Creator Trigger */}
        <div className="crm-card mb-6" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            Follow-up workflow board for admin outreach.
          </p>
          <button className="crm-btn crm-btn-primary" onClick={() => setShowCreateModal(true)}>
            <Plus size={16} />
            <span>Create CRM Task</span>
          </button>
        </div>

        {/* Kanban Board Container */}
        {loading ? (
          <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ color: '#10b981', fontWeight: 600 }}>Syncing board...</p>
          </div>
        ) : (
          <div className="kanban-board" style={{ flex: 1 }}>
            
            {/* Column: To Do */}
            <div className="kanban-col">
              <div className="kanban-col-header">
                <span>To Do</span>
                <span className="badge badge-low">{todoTasks.length}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', flex: 1 }}>
                 {todoTasks.map(t => (
                  <div key={t._id} className="kanban-card">
                    <div>
                      <span className="badge" style={{ backgroundColor: 'rgba(59, 35, 20, 0.05)', color: getPriorityColor(t.priority), padding: '2px 6px', fontSize: '9px' }}>
                        {t.priority}
                      </span>
                      <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)', marginTop: '6px' }}>{t.title}</h4>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>{t.description}</p>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', borderTop: '1px solid var(--border-color)', paddingTop: '8px', marginTop: '4px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: 'var(--danger)' }}>
                        <Clock size={10} /> {new Date(t.dueDate).toLocaleDateString()}
                      </span>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => handleDeleteTask(t._id)} style={{ color: 'var(--danger)' }}>
                          <Trash2 size={12} />
                        </button>
                        <button onClick={() => handleUpdateStatus(t._id, 'in-progress')} style={{ color: 'var(--text-green)' }}>
                          <ArrowRight size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Column: In Progress */}
            <div className="kanban-col">
              <div className="kanban-col-header">
                <span>In Progress</span>
                <span className="badge badge-medium">{inProgressTasks.length}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', flex: 1 }}>
                 {inProgressTasks.map(t => (
                  <div key={t._id} className="kanban-card">
                    <div>
                      <span className="badge" style={{ backgroundColor: 'rgba(59, 35, 20, 0.05)', color: getPriorityColor(t.priority), padding: '2px 6px', fontSize: '9px' }}>
                        {t.priority}
                      </span>
                      <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)', marginTop: '6px' }}>{t.title}</h4>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>{t.description}</p>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', borderTop: '1px solid var(--border-color)', paddingTop: '8px', marginTop: '4px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: 'var(--warning)' }}>
                        <Clock size={10} /> {new Date(t.dueDate).toLocaleDateString()}
                      </span>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => handleUpdateStatus(t._id, 'todo')} style={{ color: 'var(--text-muted)' }}>
                          <ArrowLeft size={12} />
                        </button>
                        <button onClick={() => handleDeleteTask(t._id)} style={{ color: 'var(--danger)' }}>
                          <Trash2 size={12} />
                        </button>
                        <button onClick={() => handleUpdateStatus(t._id, 'done')} style={{ color: 'var(--text-green)' }}>
                          <CheckCircle2 size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Column: Completed */}
            <div className="kanban-col">
              <div className="kanban-col-header">
                <span>Completed</span>
                <span className="badge badge-active">{doneTasks.length}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', flex: 1 }}>
                 {doneTasks.map(t => (
                  <div key={t._id} className="kanban-card" style={{ opacity: 0.7 }}>
                    <div>
                      <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-muted)', textDecoration: 'line-through' }}>{t.title}</h4>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', borderTop: '1px solid var(--border-color)', paddingTop: '8px', marginTop: '4px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>
                        Done
                      </span>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => handleUpdateStatus(t._id, 'in-progress')} style={{ color: 'var(--warning)' }}>
                          <ArrowLeft size={12} />
                        </button>
                        <button onClick={() => handleDeleteTask(t._id)} style={{ color: 'var(--danger)' }}>
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* Create Task Modal */}
        {showCreateModal && (
          <div className="crm-modal-backdrop">
            <div className="crm-modal">
              <div className="crm-modal-header">
                <h3 className="crm-modal-title">Create CRM Task</h3>
                <button onClick={() => setShowCreateModal(false)} style={{ color: 'var(--text-muted)' }}>✕</button>
              </div>
              <form onSubmit={handleCreateTask}>
                <div className="crm-modal-body">
                  <div className="crm-form-group">
                    <label className="crm-form-label">Task Title</label>
                    <input 
                      type="text" 
                      className="crm-input" 
                      placeholder="e.g. Follow up with churned VIP member"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>

                  <div className="crm-form-group">
                    <label className="crm-form-label">Notes / Details</label>
                    <textarea 
                      className="crm-textarea" 
                      rows="3" 
                      placeholder="Write context to remember..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>

                  <div className="crm-grid-metrics" style={{ gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '0' }}>
                    <div className="crm-form-group">
                      <label className="crm-form-label">Due Date</label>
                      <input 
                        type="date" 
                        className="crm-input" 
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                      />
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
                </div>
                <div className="crm-modal-footer">
                  <button type="button" className="crm-btn crm-btn-secondary" onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="crm-btn crm-btn-primary" disabled={submittingTask}>
                    {submittingTask ? 'Creating...' : 'Save Task'}
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
