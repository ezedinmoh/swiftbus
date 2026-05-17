'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function LogoutButton() {
  const { logout } = useAuth();
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.push('/');
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      style={{
        display: 'flex', alignItems: 'center', gap: '15px',
        padding: '12px 15px', borderRadius: '10px',
        color: 'var(--danger)', background: 'none', border: 'none',
        cursor: 'pointer', width: '100%', fontWeight: 500, fontSize: '14px',
        transition: 'background 0.2s',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(220,53,69,0.08)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'none')}
    >
      <i className="fas fa-sign-out-alt" style={{ width: '20px' }}></i>
      Logout
    </button>
  );
}
