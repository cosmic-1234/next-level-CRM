import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
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
  Receipt,
  X,
  Menu
} from 'lucide-react';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (mobileOpen && !e.target.closest('.crm-sidebar') && !e.target.closest('.crm-mobile-menu-btn')) {
        setMobileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [mobileOpen]);

  const getInitial = (name) => name ? name.charAt(0).toUpperCase() : 'A';

  const navItems = [
    { to: '/crm', icon: <LayoutDashboard size={18} />, label: 'Dashboard', end: true },
    { to: '/crm/contacts', icon: <Users size={18} />, label: 'Members 360' },
    { to: '/crm/rentals', icon: <Receipt size={18} />, label: 'Orders Ledger' },
    { to: '/crm/tickets', icon: <Ticket size={18} />, label: 'Support Desk' },
    { to: '/crm/tasks', icon: <CheckSquare size={18} />, label: 'Task Board' },
    { to: '/crm/segments', icon: <Layers size={18} />, label: 'Segmentation' },
    { to: '/crm/campaigns', icon: <Megaphone size={18} />, label: 'Campaigns' },
    { to: '/crm/hubs', icon: <MapPin size={18} />, label: 'Hub Pipeline' },
    { to: '/crm/settings', icon: <Settings size={18} />, label: 'Settings' },
  ];

  return (
    <>
      {/* Mobile Hamburger Button — rendered inside header area */}
      <button
        className="crm-mobile-menu-btn"
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
      >
        <Menu size={22} />
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && <div className="crm-sidebar-overlay" onClick={() => setMobileOpen(false)} />}

      <aside className={`crm-sidebar ${mobileOpen ? 'crm-sidebar--open' : ''}`}>
        {/* Logo */}
        <div className="crm-sidebar-logo">
          <div style={{ width: '32px', height: '32px', flexShrink: 0 }}>
            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: '#FAF6EE' }}>
              <circle cx="20" cy="20" r="19" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M20 30C20 30 8 22 8 14C8 10.7 10.7 8 14 8C16.4 8 18.5 9.4 20 11.5C21.5 9.4 23.6 8 26 8C29.3 8 32 10.7 32 14C32 22 20 30 20 30Z" fill="currentColor" opacity="0.15"/>
              <path d="M20 28C14 23 10 18 10 14C10 11.8 11.8 10 14 10C16.1 10 17.9 11.3 20 13.5C22.1 11.3 23.9 10 26 10C28.2 10 30 11.8 30 14C30 18 26 23 20 28Z" stroke="currentColor" strokeWidth="1.2" fill="none"/>
              <path d="M20 13V28M20 13C18 11 15 10 14 10" stroke="currentColor" strokeWidth="1"/>
            </svg>
          </div>
          <span style={{ fontSize: '18px', fontWeight: 700, fontFamily: 'var(--font-heading)', flex: 1 }}>
            Next Level CRM
          </span>
          {/* Close button on mobile */}
          <button
            className="crm-sidebar-close"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="crm-sidebar-menu">
          {navItems.map(({ to, icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `crm-menu-item ${isActive ? 'active' : ''}`}
            >
              {icon}
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="crm-sidebar-footer">
          <div className="crm-user-badge">
            <div className="crm-user-avatar">{getInitial(user?.name)}</div>
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
    </>
  );
}
