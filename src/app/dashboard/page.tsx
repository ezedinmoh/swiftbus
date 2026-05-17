import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

function statusBadge(status: string) {
  const map: Record<string, { bg: string; color: string }> = {
    confirmed: { bg: 'rgba(40,167,69,0.1)', color: 'var(--success)' },
    pending:   { bg: 'rgba(255,193,7,0.15)', color: '#856404' },
    cancelled: { bg: 'rgba(220,53,69,0.1)', color: 'var(--danger)' },
    completed: { bg: '#f8f9fa', color: 'var(--gray)' },
  };
  const s = map[status] ?? map.pending;
  return (
    <span style={{ padding: '4px 12px', background: s.bg, color: s.color, borderRadius: '20px', fontSize: '12px', fontWeight: 600, textTransform: 'capitalize' }}>
      {status}
    </span>
  );
}

export default async function DashboardOverview() {
  const session = await getSession();
  if (!session) return null;

  // Fetch stats and recent bookings in parallel
  const [stats, recentBookings] = await Promise.all([
    prisma.booking.groupBy({
      by: ['booking_status'],
      where: { user_id: session.dbId },
      _count: { booking_status: true },
    }),
    prisma.booking.findMany({
      where: { user_id: session.dbId },
      orderBy: { booking_date: 'desc' },
      take: 5,
    }),
  ]);

  const totalSpentAgg = await prisma.booking.aggregate({
    where: { user_id: session.dbId, payment_status: 'paid' },
    _sum: { total_amount: true },
  });

  const countByStatus = Object.fromEntries(stats.map((s) => [s.booking_status, s._count.booking_status]));
  const activeBookings = (countByStatus['confirmed'] ?? 0) + (countByStatus['pending'] ?? 0);
  const pastJourneys = countByStatus['completed'] ?? 0;
  const totalSpent = totalSpentAgg._sum.total_amount ? Number(totalSpentAgg._sum.total_amount) : 0;

  return (
    <div>
      <h1 style={{ fontSize: '24px', color: 'var(--primary)', marginBottom: '8px' }}>
        Welcome back, {session.name.split(' ')[0]}!
      </h1>
      <p style={{ color: 'var(--gray)', marginBottom: '30px', fontSize: '14px' }}>
        Here's a summary of your travel activity.
      </p>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <StatCard icon="fa-ticket-alt" iconBg="rgba(26,115,232,0.1)" iconColor="var(--primary)" value={activeBookings} label="Active Bookings" />
        <StatCard icon="fa-history" iconBg="rgba(40,167,69,0.1)" iconColor="var(--success)" value={pastJourneys} label="Past Journeys" />
        <StatCard icon="fa-wallet" iconBg="rgba(255,109,0,0.1)" iconColor="var(--secondary)" value={`ETB ${totalSpent.toLocaleString()}`} label="Total Spent" />
      </div>

      {/* Recent Activity */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '20px' }}>Recent Bookings</h2>
        <Link href="/dashboard/tickets" style={{ color: 'var(--primary)', fontSize: '14px', fontWeight: 500 }}>
          View all <i className="fas fa-arrow-right"></i>
        </Link>
      </div>

      {recentBookings.length === 0 ? (
        <div style={{ background: 'white', borderRadius: '15px', padding: '60px 20px', textAlign: 'center', boxShadow: '0 5px 15px rgba(0,0,0,0.05)' }}>
          <i className="fas fa-ticket-alt" style={{ fontSize: '48px', color: '#ddd', marginBottom: '15px', display: 'block' }}></i>
          <h3 style={{ color: 'var(--gray)', marginBottom: '10px' }}>No bookings yet</h3>
          <p style={{ color: 'var(--gray)', fontSize: '14px', marginBottom: '20px' }}>Start your journey by searching for available buses.</p>
          <Link href="/search" className="btn btn-primary">Search Buses</Link>
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: '15px', boxShadow: '0 5px 15px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ background: '#f8f9fa', borderBottom: '2px solid #eee' }}>
                <tr>
                  {['Booking ID', 'Route', 'Date', 'Company', 'Amount', 'Status'].map(h => (
                    <th key={h} style={{ padding: '15px 20px', fontWeight: 600, color: 'var(--gray)', fontSize: '13px', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((b) => (
                  <tr key={b.booking_id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '15px 20px', fontWeight: 600, fontSize: '13px' }}>#{b.booking_id}</td>
                    <td style={{ padding: '15px 20px', fontSize: '14px' }}>{b.from_city} → {b.to_city}</td>
                    <td style={{ padding: '15px 20px', fontSize: '13px', color: 'var(--gray)', whiteSpace: 'nowrap' }}>
                      {new Date(b.travel_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td style={{ padding: '15px 20px', fontSize: '13px' }}>{b.bus_company}</td>
                    <td style={{ padding: '15px 20px', fontSize: '13px', fontWeight: 600 }}>ETB {Number(b.total_amount).toLocaleString()}</td>
                    <td style={{ padding: '15px 20px' }}>{statusBadge(b.booking_status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, iconBg, iconColor, value, label }: {
  icon: string; iconBg: string; iconColor: string; value: string | number; label: string;
}) {
  return (
    <div style={{ background: 'white', padding: '25px', borderRadius: '15px', boxShadow: '0 5px 15px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '20px' }}>
      <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: iconBg, color: iconColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>
        <i className={`fas ${icon}`}></i>
      </div>
      <div>
        <h3 style={{ fontSize: '22px', fontWeight: 700 }}>{value}</h3>
        <p style={{ color: 'var(--gray)', fontSize: '13px', marginTop: '2px' }}>{label}</p>
      </div>
    </div>
  );
}
