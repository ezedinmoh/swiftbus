import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import Link from 'next/link';
import AdminLogoutButton from './AdminLogoutButton';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    redirect('/login?next=/admin');
  }

  const navItems = [
    { href: '/admin',           icon: 'fa-tachometer-alt', label: 'Dashboard' },
    { href: '/admin/bookings',  icon: 'fa-ticket-alt',     label: 'Bookings' },
    { href: '/admin/users',     icon: 'fa-users',          label: 'Users' },
    { href: '/admin/buses',     icon: 'fa-bus',            label: 'Buses' },
    { href: '/admin/routes',    icon: 'fa-route',          label: 'Routes' },
    { href: '/admin/schedules', icon: 'fa-calendar-alt',   label: 'Schedules' },
  ];

  return (
    <div style={{ paddingTop: '70px', display: 'flex', minHeight: '100vh', background: '#f0f2f5' }}>

      {/* Sidebar */}
      <aside style={{
        width: '240px', background: '#ffffff',
        color: '#1e293b', display: 'flex', flexDirection: 'column',
        position: 'sticky', top: '70px', height: 'calc(100vh - 70px)', overflowY: 'auto',
        flexShrink: 0, borderRight: '1px solid #eef2f6',
        boxShadow: '2px 0 10px rgba(0,0,0,0.02)'
      }}>
        {/* Admin badge */}
        <div style={{ padding: '25px 20px', borderBottom: '1px solid #eef2f6' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'rgba(26,115,232,0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
              <i className="fas fa-user-shield"></i>
            </div>
            <div>
              <p style={{ fontWeight: 700, fontSize: '14px', color: '#1e293b' }}>{session.name}</p>
              <span style={{ fontSize: '11px', background: 'var(--secondary)', color: 'white', padding: '2px 8px', borderRadius: '10px', fontWeight: 600 }}>Admin</span>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ padding: '15px 10px', flex: 1 }}>
          <style>{`
            .sidebar-link {
              transition: all 0.2s;
            }
            .sidebar-link:hover {
              background: rgba(26,115,232,0.06) !important;
              color: var(--primary) !important;
            }
          `}</style>
          {navItems.map(item => (
            <Link key={item.href} href={item.href} className="sidebar-link" style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '12px 15px', borderRadius: '10px', color: '#475569',
              textDecoration: 'none', marginBottom: '4px', fontSize: '14px', fontWeight: 500,
            }}
            >
              <i className={`fas ${item.icon}`} style={{ width: '18px', textAlign: 'center', color: '#64748b' }}></i>
              {item.label}
            </Link>
          ))}
        </nav>

        <div style={{ padding: '15px 10px', borderTop: '1px solid #eef2f6' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 15px', color: '#64748b', textDecoration: 'none', fontSize: '13px', marginBottom: '5px', fontWeight: 500 }}>
            <i className="fas fa-home" style={{ width: '18px' }}></i> Back to Site
          </Link>
          <AdminLogoutButton />
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, padding: '30px', minWidth: 0 }}>
        {children}
      </main>
    </div>
  );
}
