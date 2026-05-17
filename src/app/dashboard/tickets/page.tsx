'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface Ticket {
  id: string;
  from: string;
  to: string;
  date: string;
  departureTime: string;
  busCompany: string;
  busType: string;
  seats: number[] | null;
  passengers: number;
  amount: number;
  status: string;
  paymentStatus: string;
  bookedAt: string;
}

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  confirmed: { bg: 'rgba(40,167,69,0.1)', color: 'var(--success)' },
  pending:   { bg: 'rgba(255,193,7,0.15)', color: '#856404' },
  cancelled: { bg: 'rgba(220,53,69,0.1)', color: 'var(--danger)' },
  completed: { bg: '#f8f9fa', color: 'var(--gray)' },
};

export default function MyTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [cancelling, setCancelling] = useState<string | null>(null);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (filter !== 'all') params.set('status', filter);
      const res = await fetch(`/api/user/tickets?${params}`);
      const json = await res.json();
      if (json.success) {
        setTickets(json.data.bookings);
        setTotalPages(json.data.pages);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [filter, page]);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  async function handleCancel(bookingId: string) {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    setCancelling(bookingId);
    try {
      const res = await fetch(`/api/booking/${bookingId}/cancel`, { method: 'POST' });
      const json = await res.json();
      if (json.success) {
        fetchTickets();
      } else {
        alert(json.message ?? 'Cancellation failed');
      }
    } catch {
      alert('Network error. Please try again.');
    } finally {
      setCancelling(null);
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '15px' }}>
        <h1 style={{ fontSize: '24px', color: 'var(--primary)' }}>My Tickets</h1>
        <Link href="/search" className="btn btn-primary" style={{ padding: '10px 20px' }}>
          <i className="fas fa-plus"></i> Book New Ticket
        </Link>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '25px', borderBottom: '2px solid #eee', paddingBottom: '0' }}>
        {(['all', 'upcoming', 'past'] as const).map(f => (
          <button
            key={f}
            onClick={() => { setFilter(f); setPage(1); }}
            style={{
              padding: '10px 20px', border: 'none', background: 'none', cursor: 'pointer',
              fontWeight: 600, fontSize: '14px', textTransform: 'capitalize',
              color: filter === f ? 'var(--primary)' : 'var(--gray)',
              borderBottom: filter === f ? '2px solid var(--primary)' : '2px solid transparent',
              marginBottom: '-2px', transition: 'all 0.2s',
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ background: 'white', borderRadius: '15px', height: '140px', animation: 'pulse 1.5s infinite', opacity: 0.6 }} />
          ))}
        </div>
      ) : tickets.length === 0 ? (
        <div style={{ background: 'white', borderRadius: '15px', padding: '60px 20px', textAlign: 'center', boxShadow: '0 5px 15px rgba(0,0,0,0.05)' }}>
          <i className="fas fa-ticket-alt" style={{ fontSize: '48px', color: '#ddd', marginBottom: '15px', display: 'block' }}></i>
          <h3 style={{ color: 'var(--gray)', marginBottom: '10px' }}>No {filter !== 'all' ? filter : ''} tickets found</h3>
          <p style={{ color: 'var(--gray)', fontSize: '14px', marginBottom: '20px' }}>
            {filter === 'upcoming' ? 'You have no upcoming trips.' : filter === 'past' ? 'No past journeys yet.' : 'Book your first ticket to get started.'}
          </p>
          <Link href="/search" className="btn btn-primary">Search Buses</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {tickets.map(ticket => {
            const s = STATUS_STYLES[ticket.status] ?? STATUS_STYLES.pending;
            const canCancel = ticket.status === 'confirmed' || ticket.status === 'pending';
            const seats = Array.isArray(ticket.seats) ? ticket.seats.join(', ') : '—';

            return (
              <div key={ticket.id} style={{ background: 'white', borderRadius: '15px', boxShadow: '0 5px 15px rgba(0,0,0,0.05)', overflow: 'hidden', display: 'flex', border: '1px solid #eee' }}>

                {/* Ticket Info */}
                <div style={{ flex: 1, padding: '25px', borderRight: '2px dashed #eee' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '8px' }}>
                    <span style={{ background: s.bg, color: s.color, padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, textTransform: 'capitalize' }}>
                      {ticket.status}
                    </span>
                    <span style={{ color: 'var(--gray)', fontSize: '13px' }}>
                      Booking ID: <strong>#{ticket.id}</strong>
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <div>
                      <p style={{ color: 'var(--gray)', fontSize: '11px', marginBottom: '4px' }}>FROM</p>
                      <h3 style={{ fontSize: '20px', fontWeight: 700 }}>{ticket.from}</h3>
                      <p style={{ fontSize: '13px', color: 'var(--gray)', marginTop: '3px' }}>{ticket.departureTime}</p>
                    </div>
                    <div style={{ flex: 1, margin: '0 20px', textAlign: 'center', position: 'relative' }}>
                      <i className="fas fa-bus" style={{ color: 'var(--secondary)', fontSize: '20px', background: 'white', zIndex: 2, position: 'relative', padding: '0 8px' }}></i>
                      <div style={{ position: 'absolute', top: '50%', left: 0, width: '100%', height: '1px', background: '#ddd', zIndex: 1 }}></div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ color: 'var(--gray)', fontSize: '11px', marginBottom: '4px' }}>TO</p>
                      <h3 style={{ fontSize: '20px', fontWeight: 700 }}>{ticket.to}</h3>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '12px', background: '#f8f9fa', padding: '12px 15px', borderRadius: '10px' }}>
                    <InfoItem label="Date" value={new Date(ticket.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} />
                    <InfoItem label="Company" value={ticket.busCompany} />
                    <InfoItem label="Seats" value={seats} />
                    <InfoItem label="Passengers" value={`${ticket.passengers} Adult${ticket.passengers > 1 ? 's' : ''}`} />
                  </div>
                </div>

                {/* Action Area */}
                <div style={{ width: '200px', background: '#f8f9fa', padding: '25px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                  <div style={{ textAlign: 'center', marginBottom: '5px' }}>
                    <p style={{ fontSize: '20px', fontWeight: 700, color: 'var(--primary)' }}>ETB {ticket.amount.toLocaleString()}</p>
                    <p style={{ fontSize: '11px', color: 'var(--gray)' }}>Total paid</p>
                  </div>

                  {ticket.status === 'confirmed' && (
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${ticket.id}`}
                      alt="QR Code"
                      style={{ width: '90px', height: '90px', borderRadius: '8px' }}
                    />
                  )}

                  {canCancel && (
                    <button
                      onClick={() => handleCancel(ticket.id)}
                      disabled={cancelling === ticket.id}
                      style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '13px', textDecoration: 'underline' }}
                    >
                      {cancelling === ticket.id ? 'Cancelling…' : 'Cancel Ticket'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '30px' }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn btn-outline" style={{ padding: '8px 16px' }}>
            <i className="fas fa-chevron-left"></i>
          </button>
          <span style={{ padding: '8px 16px', fontWeight: 600 }}>{page} / {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn btn-outline" style={{ padding: '8px 16px' }}>
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>
      )}
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p style={{ color: 'var(--gray)', fontSize: '11px', marginBottom: '3px' }}>{label}</p>
      <p style={{ fontWeight: 600, fontSize: '13px' }}>{value}</p>
    </div>
  );
}
