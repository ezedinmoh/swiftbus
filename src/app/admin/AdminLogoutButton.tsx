'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function AdminLogoutButton() {
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
        display: 'flex', alignItems: 'center', gap: '12px',
        padding: '10px 15px', borderRadius: '8px',
        background: 'rgba(220,53,69,0.15)', color: 'var(--danger)',
        border: 'none', cursor: 'pointer', width: '100%',
        fontSize: '13px', fontWeight: 500, transition: 'all 0.2s',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(220,53,69,0.25)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'rgba(220,53,69,0.15)')}
    >
      <i className="fas fa-sign-out-alt" style={{ width: '18px' }}></i>
      Logout
    </button>
  );
}
