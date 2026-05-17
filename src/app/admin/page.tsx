import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export default async function AdminDashboard() {
  const [
    totalBookings,
    todayBookings,
    totalUsers,
    activeUsers,
    totalBuses,
    activeBuses,
    totalRevenue,
    todayRevenue,
    recentBookings,
    bookingsByStatus,
  ] = await Promise.all([
    prisma.booking.count(),
    prisma.booking.count({ where: { booking_date: { gte: startOfToday() } } }),
    prisma.user.count({ where: { role: 'user' } }),
    prisma.user.count({ where: { role: 'user', is_active: true } }),
    prisma.bus.count(),
    prisma.bus.count({ where: { status: 'active' } }),
    prisma.booking.aggregate({ where: { payment_status: 'paid' }, _sum: { total_amount: true } }),
    prisma.booking.aggregate({ where: { payment_status: 'paid', booking_date: { gte: startOfToday() } }, _sum: { total_amount: true } }),
    prisma.booking.findMany({
      orderBy: { booking_date: 'desc' },
      take: 8,
      include: { user: { select: { full_name: true, email: true } } },
    }),
    prisma.booking.groupBy({ by: ['booking_status'], _count: { booking_status: true } }),
  ]);

  const totalRev = Number(totalRevenue._sum.total_amount ?? 0);
  const todayRev = Number(todayRevenue._sum.total_amount ?? 0);
  const statusCounts = Object.fromEntries(bookingsByStatus.map(b => [b.booking_status, b._count.booking_status]));

  return (
    <div>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 700 }}>Admin Dashboard</h1>
        <p style={{ color: 'var(--gray)', fontSize: '14px', marginTop: '4px' }}>
          {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <StatCard icon="fa-ticket-alt" color="#1a73e8" bg="rgba(26,115,232,0.1)" label="Total Bookings" value={totalBookings} sub={`+${todayBookings} today`} />
        <StatCard icon="fa-users" color="#28a745" bg="rgba(40,167,69,0.1)" label="Active Users" value={activeUsers} sub={`${totalUsers} total`} />
        <StatCard icon="fa-bus" color="#ff6d00" bg="rgba(255,109,0,0.1)" label="Active Buses" value={activeBuses} sub={`${totalBuses} total`} />
        <StatCard icon="fa-wallet" color="#6f42c1" bg="rgba(111,66,193,0.1)" label="Total Revenue" value={`ETB ${totalRev.toLocaleString()}`} sub={`ETB ${todayRev.toLocaleString()} today`} />
      </div>

      {/* Booking Status Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px', marginBottom: '30px' }}>
        <div style={{ background: 'white', borderRadius: '15px', padding: '25px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
          <h3 style={{ fontSize: '16px', marginBottom: '20px', fontWeight: 600 }}>Booking Status Breakdown</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { status: 'confirmed', color: '#28a745', label: 'Confirmed' },
              { status: 'pending',   color: '#ffc107', label: 'Pending' },
              { status: 'completed', color: '#6c757d', label: 'Completed' },
              { status: 'cancelled', color: '#dc3545', label: 'Cancelled' },
            ].map(({ status, color, label }) => {
              const count = statusCounts[status] ?? 0;
              const pct = totalBookings > 0 ? Math.round((count / totalBookings) * 100) : 0;
              return (
                <div key={status}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '13px' }}>
                    <span style={{ fontWeight: 500 }}>{label}</span>
                    <span style={{ color: 'var(--gray)' }}>{count} ({pct}%)</span>
                  </div>
                  <div style={{ height: '8px', background: '#f0f0f0', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '4px', transition: 'width 0.5s' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Links */}
        <div style={{ background: 'white', borderRadius: '15px', padding: '25px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
          <h3 style={{ fontSize: '16px', marginBottom: '20px', fontWeight: 600 }}>Quick Actions</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {[
              { href: '/admin/bookings', icon: 'fa-ticket-alt', label: 'Manage Bookings', color: '#1a73e8' },
              { href: '/admin/users',    icon: 'fa-users',      label: 'Manage Users',    color: '#28a745' },
              { href: '/admin/buses',    icon: 'fa-bus',        label: 'Manage Buses',    color: '#ff6d00' },
              { href: '/admin/routes',   icon: 'fa-route',      label: 'Manage Routes',   color: '#6f42c1' },
              { href: '/admin/schedules',icon: 'fa-calendar',   label: 'Schedules',       color: '#17a2b8' },
              { href: '/search',         icon: 'fa-search',     label: 'Search Buses',    color: '#6c757d' },
            ].map(item => (
              <Link key={item.href} href={item.href} style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '12px 15px', borderRadius: '10px',
                background: '#f8f9fa', textDecoration: 'none', color: 'var(--dark)',
                fontSize: '13px', fontWeight: 500, transition: 'all 0.2s',
                border: '1px solid #eee',
              }}>
                <i className={`fas ${item.icon}`} style={{ color: item.color, width: '16px' }}></i>
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Bookings */}
      <div style={{ background: 'white', borderRadius: '15px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        <div style={{ padding: '20px 25px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Recent Bookings</h3>
          <Link href="/admin/bookings" style={{ color: 'var(--primary)', fontSize: '13px', fontWeight: 500 }}>View all →</Link>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead style={{ background: '#f8f9fa' }}>
              <tr>
                {['Booking ID', 'Passenger', 'Route', 'Date', 'Amount', 'Status'].map(h => (
                  <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontWeight: 600, color: 'var(--gray)', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentBookings.map(b => {
                const s = STATUS_STYLE[b.booking_status] ?? STATUS_STYLE.pending;
                return (
                  <tr key={b.booking_id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '12px 20px', fontWeight: 600 }}>#{b.booking_id}</td>
                    <td style={{ padding: '12px 20px' }}>
                      <p style={{ fontWeight: 500 }}>{b.user.full_name}</p>
                      <p style={{ color: 'var(--gray)', fontSize: '11px' }}>{b.user.email}</p>
                    </td>
                    <td style={{ padding: '12px 20px' }}>{b.from_city} → {b.to_city}</td>
                    <td style={{ padding: '12px 20px', whiteSpace: 'nowrap' }}>
                      {new Date(b.travel_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td style={{ padding: '12px 20px', fontWeight: 600 }}>ETB {Number(b.total_amount).toLocaleString()}</td>
                    <td style={{ padding: '12px 20px' }}>
                      <span style={{ padding: '3px 10px', background: s.bg, color: s.color, borderRadius: '20px', fontSize: '11px', fontWeight: 600, textTransform: 'capitalize' }}>
                        {b.booking_status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  confirmed: { bg: 'rgba(40,167,69,0.1)',  color: '#28a745' },
  pending:   { bg: 'rgba(255,193,7,0.15)', color: '#856404' },
  cancelled: { bg: 'rgba(220,53,69,0.1)',  color: '#dc3545' },
  completed: { bg: '#f8f9fa',              color: '#6c757d' },
};

function StatCard({ icon, color, bg, label, value, sub }: {
  icon: string; color: string; bg: string; label: string; value: string | number; sub: string;
}) {
  return (
    <div style={{ background: 'white', padding: '22px', borderRadius: '15px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: '18px' }}>
      <div style={{ width: '52px', height: '52px', borderRadius: '12px', background: bg, color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
        <i className={`fas ${icon}`}></i>
      </div>
      <div>
        <p style={{ color: 'var(--gray)', fontSize: '12px', marginBottom: '4px' }}>{label}</p>
        <h3 style={{ fontSize: '20px', fontWeight: 700 }}>{value}</h3>
        <p style={{ color: 'var(--gray)', fontSize: '11px', marginTop: '2px' }}>{sub}</p>
      </div>
    </div>
  );
}
