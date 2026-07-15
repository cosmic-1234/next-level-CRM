import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  Ticket, 
  CheckSquare, 
  Layers, 
  Megaphone, 
  MapPin, 
  Settings, 
  LogOut,
  Receipt
} from 'lucide-react';

export default function Sidebar() {
  const { user, logout } = useAuth();

  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'A';
  };

  return (
    <aside className="crm-sidebar">
      <div className="crm-sidebar-logo" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: '32px', height: '32px', flexShrink: 0 }}>
          <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: 'var(--primary)' }}>
            <circle cx="20" cy="20" r="19" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M20 30C20 30 8 22 8 14C8 10.7 10.7 8 14 8C16.4 8 18.5 9.4 20 11.5C21.5 9.4 23.6 8 26 8C29.3 8 32 10.7 32 14C32 22 20 30 20 30Z" fill="currentColor" opacity="0.15"/>
            <path d="M20 28C14 23 10 18 10 14C10 11.8 11.8 10 14 10C16.1 10 17.9 11.3 20 13.5C22.1 11.3 23.9 10 26 10C28.2 10 30 11.8 30 14C30 18 26 23 20 28Z" stroke="currentColor" strokeWidth="1.2" fill="none"/>
            <path d="M20 13V28M20 13C18 11 15 10 14 10" stroke="currentColor" strokeWidth="1"/>
          </svg>
        </div>
        <span style={{ fontSize: '18px', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>Next Level CRM</span>
      </div>

      <nav className="crm-sidebar-menu">
        <NavLink to="/crm" end className={({ isActive }) => `crm-menu-item ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink to="/crm/contacts" className={({ isActive }) => `crm-menu-item ${isActive ? 'active' : ''}`}>
          <Users size={18} />
          <span>Members 360</span>
        </NavLink>

        <NavLink to="/crm/rentals" className={({ isActive }) => `crm-menu-item ${isActive ? 'active' : ''}`}>
          <Receipt size={18} />
          <span>Orders Ledger</span>
        </NavLink>

        <NavLink to="/crm/tickets" className={({ isActive }) => `crm-menu-item ${isActive ? 'active' : ''}`}>
          <Ticket size={18} />
          <span>Support Desk</span>
        </NavLink>

        <NavLink to="/crm/tasks" className={({ isActive }) => `crm-menu-item ${isActive ? 'active' : ''}`}>
          <CheckSquare size={18} />
          <span>Task Board</span>
        </NavLink>

        <NavLink to="/crm/segments" className={({ isActive }) => `crm-menu-item ${isActive ? 'active' : ''}`}>
          <Layers size={18} />
          <span>Segmentation</span>
        </NavLink>

        <NavLink to="/crm/campaigns" className={({ isActive }) => `crm-menu-item ${isActive ? 'active' : ''}`}>
          <Megaphone size={18} />
          <span>Campaigns</span>
        </NavLink>

        <NavLink to="/crm/hubs" className={({ isActive }) => `crm-menu-item ${isActive ? 'active' : ''}`}>
          <MapPin size={18} />
          <span>Hub Pipeline</span>
        </NavLink>

        <NavLink to="/crm/settings" className={({ isActive }) => `crm-menu-item ${isActive ? 'active' : ''}`}>
          <Settings size={18} />
          <span>Settings</span>
        </NavLink>
      </nav>

      <div className="crm-sidebar-footer">
        <div className="crm-user-badge">
          <div className="crm-user-avatar">
            {getInitial(user?.name)}
          </div>
          <div className="crm-user-info">
            <div className="crm-user-name" title={user?.name}>{user?.name}</div>
            <div className="crm-user-role">{user?.email}</div>
          </div>
        </div>
        <button onClick={logout} className="crm-notification-btn" title="Sign Out">
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
}
