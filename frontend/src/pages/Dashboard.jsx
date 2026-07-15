import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import api from '../api/axios';
import { 
  Users, 
  BookOpen, 
  AlertTriangle, 
  HelpCircle, 
  TrendingUp, 
  DollarSign 
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/crm/dashboard')
      .then(res => {
        if (res.data.success) {
          setStats(res.data.data);
        }
      })
      .catch(err => console.error('Error fetching CRM stats', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <p style={{ color: 'var(--primary)', fontWeight: 600 }}>Loading Dashboard Metrics...</p>
      </div>
    );
  }

  // Lifecycle Data
  const lifecycleData = stats ? [
    { name: 'Leads', count: stats.lifecycleFunnel.leads },
    { name: 'Active', count: stats.lifecycleFunnel.active },
    { name: 'At Risk', count: stats.lifecycleFunnel.atRisk },
    { name: 'Churned', count: stats.lifecycleFunnel.churned },
    { name: 'VIP', count: stats.lifecycleFunnel.vip }
  ] : [];

  // Monthly stats Data
  const monthlyData = stats?.monthlyStats ? stats.monthlyStats.map(s => ({
    name: `${s._id.month}/${s._id.year}`,
    Rentals: s.rentalsCount,
    Revenue: s.revenue
  })) : [];

  // Ticket Categories Pie Data
  const COLORS = ['#7A8F6E', '#C4906A', '#C9A84C', '#C9897A', '#3B2314', '#9B7B6A'];
  const ticketData = stats?.ticketCategories ? stats.ticketCategories.map(c => ({
    name: c._id || 'other',
    value: c.count
  })) : [];

  return (
    <>
      <Header title="CRM Relationship Dashboard" />
      <div className="crm-body">
        
        {/* Metric Cards */}
        <div className="crm-grid-metrics">
          <div className="crm-card crm-metric-card">
            <div className="crm-metric-icon" style={{ backgroundColor: 'var(--info-light)', color: 'var(--info)' }}>
              <Users size={24} />
            </div>
            <div>
              <div className="crm-metric-val">{stats?.lifecycleFunnel.leads || 0}</div>
              <div className="crm-metric-lbl">Total Leads</div>
            </div>
          </div>

          <div className="crm-card crm-metric-card">
            <div className="crm-metric-icon" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
              <BookOpen size={24} />
            </div>
            <div>
              <div className="crm-metric-val">{stats?.lifecycleFunnel.active || 0}</div>
              <div className="crm-metric-lbl">Active Renters</div>
            </div>
          </div>

          <div className="crm-card crm-metric-card">
            <div className="crm-metric-icon" style={{ backgroundColor: 'var(--danger-light)', color: 'var(--danger)' }}>
              <AlertTriangle size={24} />
            </div>
            <div>
              <div className="crm-metric-val">{stats?.overdueCount || 0}</div>
              <div className="crm-metric-lbl">Overdue Loans</div>
            </div>
          </div>

          <div className="crm-card crm-metric-card">
            <div className="crm-metric-icon" style={{ backgroundColor: 'var(--purple-light)', color: 'var(--purple)' }}>
              <HelpCircle size={24} />
            </div>
            <div>
              <div className="crm-metric-val">{stats?.supportTickets.open || 0}</div>
              <div className="crm-metric-lbl">Open Tickets</div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid-2 mb-6">
          
          {/* Funnel chart */}
          <div className="crm-card">
            <h3 className="mb-4" style={{ fontSize: '16px', fontWeight: 600 }}>Member Lifecycle Funnel</h3>
            <div style={{ width: '100%', height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={lifecycleData}>
                  <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} />
                  <YAxis stroke="var(--text-muted)" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card-hover)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }} />
                  <Bar dataKey="count" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Revenue chart */}
          <div className="crm-card">
            <h3 className="mb-4" style={{ fontSize: '16px', fontWeight: 600 }}>Rentals & Revenue Trend</h3>
            <div style={{ width: '100%', height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} />
                  <YAxis yAxisId="left" stroke="var(--text-muted)" fontSize={12} />
                  <YAxis yAxisId="right" orientation="right" stroke="var(--text-muted)" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card-hover)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }} />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="Rentals" stroke="#C4906A" strokeWidth={2} />
                  <Line yAxisId="right" type="monotone" dataKey="Revenue" stroke="#7A8F6E" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid-2">
          
          {/* Ticket categories */}
          <div className="crm-card" style={{ display: 'flex', flexDirection: 'column' }}>
            <h3 className="mb-4" style={{ fontSize: '16px', fontWeight: 600 }}>Support Inquiries by Type</h3>
            <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', height: '240px' }}>
              {ticketData.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>No support ticket data</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={ticketData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {ticketData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card-hover)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Hub partners */}
          <div className="crm-card">
            <h3 className="mb-4" style={{ fontSize: '16px', fontWeight: 600 }}>Top Nagpur Hub Partners</h3>
            <div className="crm-table-container">
              <table className="crm-table">
                <thead>
                  <tr>
                    <th>Host User</th>
                    <th>Area</th>
                    <th>Status</th>
                    <th>Rentals Routed</th>
                  </tr>
                </thead>
                <tbody>
                  {stats?.hubs.length === 0 ? (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center' }}>No collection hubs registered yet.</td>
                    </tr>
                  ) : (
                    stats?.hubs.map(h => (
                      <tr key={h._id}>
                        <td className="font-semibold">{h.hostUser?.name || 'Community Member'}</td>
                        <td>{h.area}</td>
                        <td>
                          <span className={`badge badge-${h.status}`}>
                            {h.status}
                          </span>
                        </td>
                        <td style={{ color: 'var(--primary)', fontWeight: 600 }}>
                          {h.performanceStats?.rentalsRouted || 0}
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
    </>
  );
}
