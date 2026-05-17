'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface Booking {
  id: string;
  user: { name: string; email: string };
  from: string; to: string;
  date: string; company: string;
  passengers: number; amount: number;
  status: string; paymentStatus: string;
  bookedAt: string;
}

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  confirmed: { bg: 'rgba(40,167,69,0.1)',  color: '#28a745' },
  pending:   { bg: 'rgba(255,193,7,0.15)', color: '#856404' },
  cancelled: { bg: 'rgba(220,53,69,0.1)',  color: '#dc3545' },
  completed: { bg: '#f8f9fa',              color: '#6c757d' },
};

export default function AdminBookingsClient({
  bookings, total, page, pages, currentStatus, currentQ,
}: {
  bookings: Booking[]; total: number; page: number; pages: number;
  currentStatus: string; currentQ: string;
}) {
  const router = useRouter();
  const [q, setQ] = useState(currentQ);
  const [updating, setUpdating] = useState<string | null>(null);

  function applyFilter(newStatus?: string, newQ?: string) {
    const params = new URLSearchParams();
    if (newStatus ?? currentStatus) params.set('status', newStatus ?? currentStatus);
    if (newQ ?? q) params.set('q', newQ ?? q);
    params.set('page', '1');
    router.push(`/admin/bookings?${params.toString()}`);
  }

  async function updateStatus(bookingId: string, newStatus: string) {
    setUpdating(bookingId);
    try {
      const res = await fetch('/api/admin/bookings', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ bookingId, status: newStatus }),
      });
      const json = await res.json();
      if (json.success) router.refresh();
      else alert(json.message ?? 'Update failed');
    } catch { alert('Network error'); }
    finally { setUpdating(null); }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700 }}>Bookings</h1>
          <p style={{ color: 'var(--gray)', fontSize: '13px' }}>{total} total bookings</p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ background: 'white', borderRadius: '12px', padding: '20px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="text" value={q} onChange={e => setQ(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && applyFilter(undefined, q)}
          placeholder="Search by ID, route, passenger…"
          style={{ flex: 1, minWidth: '200px', padding: '10px 15px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', outline: 'none' }}
        />
        <select
          value={currentStatus}
          onChange={e => applyFilter(e.target.value)}
          style={{ padding: '10px 15px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', outline: 'none' }}
        >
          <option value="">All Statuses</option>
          <option value="confirmed">Confirmed</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <button className="btn btn-primary" onClick={() => applyFilter(undefined, q)} style={{ padding: '10px 20px' }}>
          <i className="fas fa-search"></i> Search
        </button>
      </div>

      {/* Table */}
      <div style={{ background: 'white', borderRadius: '15px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead style={{ background: '#f8f9fa' }}>
              <tr>
                {['Booking ID', 'Passenger', 'Route', 'Date', 'Company', 'Amount', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '13px 18px', textAlign: 'left', fontWeight: 600, color: 'var(--gray)', whiteSpace: 'nowrap', borderBottom: '2px solid #eee' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 ? (
                <tr><td colSpan={8} style={{ padding: '40px', textAlign: 'center', color: 'var(--gray)' }}>No bookings found</td></tr>
              ) : bookings.map(b => {
                const s = STATUS_STYLE[b.status] ?? STATUS_STYLE.pending;
                return (
                  <tr key={b.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                    <td style={{ padding: '13px 18px', fontWeight: 700 }}>#{b.id}</td>
                    <td style={{ padding: '13px 18px' }}>
                      <p style={{ fontWeight: 500 }}>{b.user.name}</p>
                      <p style={{ color: 'var(--gray)', fontSize: '11px' }}>{b.user.email}</p>
                    </td>
                    <td style={{ padding: '13px 18px', whiteSpace: 'nowrap' }}>{b.from} → {b.to}</td>
                    <td style={{ padding: '13px 18px', whiteSpace: 'nowrap' }}>
                      {new Date(b.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td style={{ padding: '13px 18px' }}>{b.company}</td>
                    <td style={{ padding: '13px 18px', fontWeight: 600 }}>ETB {b.amount.toLocaleString()}</td>
                    <td style={{ padding: '13px 18px' }}>
                      <span style={{ padding: '3px 10px', background: s.bg, color: s.color, borderRadius: '20px', fontSize: '11px', fontWeight: 600, textTransform: 'capitalize' }}>
                        {b.status}
                      </span>
                    </td>
                    <td style={{ padding: '13px 18px' }}>
                      <select
                        value={b.status}
                        disabled={updating === b.id}
                        onChange={e => updateStatus(b.id, e.target.value)}
                        style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '12px', cursor: 'pointer' }}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div style={{ padding: '15px 20px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: 'var(--gray)' }}>Page {page} of {pages}</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              {page > 1 && (
                <button className="btn btn-outline" style={{ padding: '6px 14px', fontSize: '13px' }}
                  onClick={() => router.push(`/admin/bookings?page=${page - 1}&status=${currentStatus}&q=${q}`)}>
                  ← Prev
                </button>
              )}
              {page < pages && (
                <button className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '13px' }}
                  onClick={() => router.push(`/admin/bookings?page=${page + 1}&status=${currentStatus}&q=${q}`)}>
                  Next →
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
