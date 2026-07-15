import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoadingScreen from './components/LoadingScreen';
import Sidebar from './components/Sidebar';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Contacts from './pages/Contacts';
import ContactDetail from './pages/ContactDetail';
import Tickets from './pages/Tickets';
import TicketDetail from './pages/TicketDetail';
import Tasks from './pages/Tasks';
import Segments from './pages/Segments';
import Campaigns from './pages/Campaigns';
import Hubs from './pages/Hubs';
import Settings from './pages/Settings';
import Rentals from './pages/Rentals';

const ProtectedLayout = ({ children }) => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) {
    // If not admin, logout and redirect to login
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="crm-layout">
      <Sidebar />
      <main className="crm-main">
        {children}
      </main>
    </div>
  );
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (user) return <Navigate to="/crm" replace />;
  return children;
};

export default function App() {
  const { loading } = useAuth();

  if (loading) return <LoadingScreen />;

  return (
    <Routes>
      {/* Auth */}
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />

      {/* CRM Routes */}
      <Route path="/crm" element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />
      <Route path="/crm/contacts" element={<ProtectedLayout><Contacts /></ProtectedLayout>} />
      <Route path="/crm/rentals" element={<ProtectedLayout><Rentals /></ProtectedLayout>} />
      <Route path="/crm/contacts/:id" element={<ProtectedLayout><ContactDetail /></ProtectedLayout>} />
      <Route path="/crm/tickets" element={<ProtectedLayout><Tickets /></ProtectedLayout>} />
      <Route path="/crm/tickets/:id" element={<ProtectedLayout><TicketDetail /></ProtectedLayout>} />
      <Route path="/crm/tasks" element={<ProtectedLayout><Tasks /></ProtectedLayout>} />
      <Route path="/crm/segments" element={<ProtectedLayout><Segments /></ProtectedLayout>} />
      <Route path="/crm/campaigns" element={<ProtectedLayout><Campaigns /></ProtectedLayout>} />
      <Route path="/crm/hubs" element={<ProtectedLayout><Hubs /></ProtectedLayout>} />
      <Route path="/crm/settings" element={<ProtectedLayout><Settings /></ProtectedLayout>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/crm" replace />} />
    </Routes>
  );
}
