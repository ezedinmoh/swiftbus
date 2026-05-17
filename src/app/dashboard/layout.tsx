import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import LogoutButton from './LogoutButton';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) {
    redirect('/login?next=/dashboard');
  }

  return (
    <div style={{ paddingTop: '70px', backgroundColor: '#f8f9fa', minHeight: '100vh', display: 'flex' }}>

      {/* Sidebar */}
      <aside style={{
        width: '260px', background: 'white', borderRight: '1px solid #eee',
        padding: '30px 20px', display: 'flex', flexDirection: 'column',
        position: 'sticky', top: '70px', height: 'calc(100vh - 70px)', overflowY: 'auto',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px', paddingBottom: '20px', borderBottom: '1px solid #eee' }}>
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%',
            background: 'var(--primary)', color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '30px', margin: '0 auto 10px',
          }}>
            <i className="fas fa-user"></i>
          </div>
          <h3 style={{ fontSize: '16px', fontWeight: 600 }}>{session.name}</h3>
          <p style={{ color: 'var(--gray)', fontSize: '12px', marginTop: '4px' }}>{session.email}</p>
          {session.role === 'admin' && (
            <span style={{ fontSize: '11px', background: 'var(--secondary)', color: 'white', padding: '2px 10px', borderRadius: '10px', marginTop: '6px', display: 'inline-block' }}>
              Admin
            </span>
          )}
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          <Link href="/dashboard" style={navItemStyle}>
            <i className="fas fa-home" style={{ width: '20px', color: 'var(--primary)' }}></i>
            Overview
          </Link>
          <Link href="/dashboard/tickets" style={navItemStyle}>
            <i className="fas fa-ticket-alt" style={{ width: '20px', color: 'var(--primary)' }}></i>
            My Tickets
          </Link>
          <Link href="/dashboard/profile" style={navItemStyle}>
            <i className="fas fa-user-edit" style={{ width: '20px', color: 'var(--primary)' }}></i>
            Profile Settings
          </Link>
          {session.role === 'admin' && (
            <Link href="/admin" style={{ ...navItemStyle, color: 'var(--secondary)' }}>
              <i className="fas fa-cog" style={{ width: '20px', color: 'var(--secondary)' }}></i>
              Admin Panel
            </Link>
          )}
        </nav>

        <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid #eee' }}>
          <LogoutButton />
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '40px', minWidth: 0 }}>
        {children}
      </main>

    </div>
  );
}

const navItemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '15px',
  padding: '12px 15px',
  borderRadius: '10px',
  color: 'var(--dark)',
  textDecoration: 'none',
  transition: 'all 0.2s',
  fontWeight: 500,
  fontSize: '14px',
};
