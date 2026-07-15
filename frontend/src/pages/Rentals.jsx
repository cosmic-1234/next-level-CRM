import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import api from '../api/axios';
import { Search, Filter, Clock, CreditCard, BookOpen, User, Mail, Phone, Calendar } from 'lucide-react';

export default function Rentals() {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setLoading(true);
    const params = {
      search,
      status: statusFilter,
      page,
      limit: 10
    };

    api.get('/crm/rentals', { params })
      .then(res => {
        if (res.data.success) {
          setRentals(res.data.rentals);
          setTotalPages(res.data.pagination.pages);
        }
      })
      .catch(err => console.error('Error fetching rentals history', err))
      .finally(() => setLoading(false));
  }, [search, statusFilter, page]);

  return (
    <>
      <Header title="Orders & Rentals Ledger" />
      <div className="crm-body">
        
        {/* Filters Toolbar */}
        <div className="crm-card mb-6" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            
            {/* Search */}
            <div style={{ flex: 1, minWidth: '280px', position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                className="crm-input" 
                style={{ paddingLeft: '38px' }}
                placeholder="Search by customer name, email, phone, or book..." 
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            </div>

            {/* Status Dropdown */}
            <div style={{ width: '180px' }}>
              <select 
                className="crm-select" 
                value={statusFilter} 
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending Review</option>
                <option value="approved">Approved</option>
                <option value="active">Active Loan</option>
                <option value="returned">Returned</option>
                <option value="overdue">Overdue</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

          </div>
        </div>

        {/* Orders Table */}
        <div className="crm-table-container">
          <table className="crm-table">
            <thead>
              <tr>
                <th>Order / Payment Info</th>
                <th>Customer Details</th>
                <th>Rented Book</th>
                <th>Duration & Fees</th>
                <th>Timeline</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '30px 0', color: 'var(--primary)' }}>
                    Aggregating orders database...
                  </td>
                </tr>
              ) : rentals.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)' }}>
                    No rental orders match the search criteria.
                  </td>
                </tr>
              ) : (
                rentals.map(r => (
                  <tr key={r._id}>
                    {/* Order & Payment info */}
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500, fontFamily: 'monospace' }}>
                          ID: {r._id}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-main)', fontWeight: 600, fontSize: '13px' }}>
                          <CreditCard size={12} className="text-muted" />
                          <span>{r.paymentNo}</span>
                        </div>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          Method: Cash/COD
                        </span>
                      </div>
                    </td>

                    {/* Customer Info */}
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: 'var(--text-main)' }}>
                          <User size={12} className="text-muted" />
                          <span>{r.user?.name || 'Unknown Member'}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: 'var(--text-muted)' }}>
                          <Mail size={11} />
                          <span>{r.user?.email || 'N/A'}</span>
                        </div>
                        {r.user?.phone && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: 'var(--text-muted)' }}>
                            <Phone size={11} />
                            <span>{r.user?.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Book Info */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {r.book?.cover ? (
                          <img 
                            src={r.book.cover} 
                            alt={r.book.title} 
                            style={{ width: '32px', height: '44px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border-color)' }} 
                          />
                        ) : (
                          <div style={{ width: '32px', height: '44px', backgroundColor: 'var(--bg-sidebar)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <BookOpen size={14} className="text-muted" />
                          </div>
                        )}
                        <div>
                          <div className="font-semibold" style={{ color: 'var(--text-main)', fontSize: '13.5px' }}>{r.book?.title || 'Unknown Title'}</div>
                          <div className="text-xs text-muted">by {r.book?.author || 'Unknown'}</div>
                        </div>
                      </div>
                    </td>

                    {/* Duration & fees */}
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--primary)', fontSize: '14px' }}>
                          ₹{r.totalCost}
                        </div>
                        <div className="text-xs text-muted">
                          {r.weeksDuration} {r.weeksDuration === 1 ? 'week' : 'weeks'} loan
                        </div>
                        <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
                          (₹{r.book?.pricePerWeek || 20}/week rate)
                        </div>
                      </div>
                    </td>

                    {/* Timeline */}
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11.5px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)' }}>
                          <Calendar size={11} />
                          <span>Req: {new Date(r.requestedAt).toLocaleDateString()}</span>
                        </div>
                        {r.rentedAt && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)' }}>
                            <Clock size={11} />
                            <span>Out: {new Date(r.rentedAt).toLocaleDateString()}</span>
                          </div>
                        )}
                        {r.dueDate && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: r.status === 'overdue' ? 'var(--danger)' : 'var(--text-secondary)', fontWeight: r.status === 'overdue' ? 600 : 400 }}>
                            <Clock size={11} />
                            <span>Due: {new Date(r.dueDate).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td>
                      <span className={`badge badge-${r.status}`}>
                        {r.status}
                      </span>
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
