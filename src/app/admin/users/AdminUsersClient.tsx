'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface User {
  id: string; name: string; email: string; phone: string;
  role: string; isActive: boolean; isVerified: boolean;
  joinedDate: string; lastLogin: string | null; bookingCount: number;
}

export default function AdminUsersClient({
  users, total, page, pages, currentQ, currentRole,
}: {
  users: User[]; total: number; page: number; pages: number;
  currentQ: string; currentRole: string;
}) {
  const router = useRouter();
  const [q, setQ] = useState(currentQ);
  const [updating, setUpdating] = useState<string | null>(null);

  function applyFilter(newRole?: string, newQ?: string) {
    const params = new URLSearchParams();
    if (newRole ?? currentRole) params.set('role', newRole ?? currentRole);
    if (newQ ?? q) params.set('q', newQ ?? q);
    params.set('page', '1');
    router.push(`/admin/users?${params.toString()}`);
  }

  async function toggleActive(userId: string, current: boolean) {
    setUpdating(userId);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ userId, isActive: !current }),
      });
      const json = await res.json();
      if (json.success) router.refresh();
      else alert(json.message ?? 'Update failed');
    } catch { alert('Network error'); }
    finally { setUpdating(null); }
  }

  return (
    <div>
      <div style={{ marginBottom: '25px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700 }}>Users</h1>
        <p style={{ color: 'var(--gray)', fontSize: '13px' }}>{total} registered users</p>
      </div>

      {/* Filters */}
      <div style={{ background: 'white', borderRadius: '12px', padding: '20px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="text" value={q} onChange={e => setQ(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && applyFilter(undefined, q)}
          placeholder="Search by name, email, phone…"
          style={{ flex: 1, minWidth: '200px', padding: '10px 15px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', outline: 'none' }}
        />
        <select value={currentRole} onChange={e => applyFilter(e.target.value)}
          style={{ padding: '10px 15px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', outline: 'none' }}>
          <option value="">All Roles</option>
          <option value="user">Users</option>
          <option value="admin">Admins</option>
        </select>
        <button className="btn btn-primary" onClick={() => applyFilter(undefined, q)} style={{ padding: '10px 20px' }}>
          <i className="fas fa-search"></i> Search
        </button>
      </div>

      <div style={{ background: 'white', borderRadius: '15px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead style={{ background: '#f8f9fa' }}>
              <tr>
                {['User', 'Phone', 'Role', 'Bookings', 'Joined', 'Last Login', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '13px 18px', textAlign: 'left', fontWeight: 600, color: 'var(--gray)', whiteSpace: 'nowrap', borderBottom: '2px solid #eee' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr><td colSpan={8} style={{ padding: '40px', textAlign: 'center', color: 'var(--gray)' }}>No users found</td></tr>
              ) : users.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                  <td style={{ padding: '13px 18px' }}>
                    <p style={{ fontWeight: 600 }}>{u.name}</p>
                    <p style={{ color: 'var(--gray)', fontSize: '11px' }}>{u.email}</p>
                  </td>
                  <td style={{ padding: '13px 18px' }}>{u.phone}</td>
                  <td style={{ padding: '13px 18px' }}>
                    <span style={{ padding: '3px 10px', background: u.role === 'admin' ? 'rgba(255,109,0,0.1)' : 'rgba(26,115,232,0.1)', color: u.role === 'admin' ? 'var(--secondary)' : 'var(--primary)', borderRadius: '20px', fontSize: '11px', fontWeight: 600 }}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ padding: '13px 18px', textAlign: 'center' }}>{u.bookingCount}</td>
                  <td style={{ padding: '13px 18px', whiteSpace: 'nowrap' }}>
                    {new Date(u.joinedDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td style={{ padding: '13px 18px', whiteSpace: 'nowrap', color: 'var(--gray)' }}>
                    {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '—'}
                  </td>
                  <td style={{ padding: '13px 18px' }}>
                    <span style={{ padding: '3px 10px', background: u.isActive ? 'rgba(40,167,69,0.1)' : 'rgba(220,53,69,0.1)', color: u.isActive ? '#28a745' : '#dc3545', borderRadius: '20px', fontSize: '11px', fontWeight: 600 }}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ padding: '13px 18px' }}>
                    <button
                      onClick={() => toggleActive(u.id, u.isActive)}
                      disabled={updating === u.id}
                      style={{ padding: '5px 12px', borderRadius: '6px', border: '1px solid #ddd', background: 'white', cursor: 'pointer', fontSize: '12px', color: u.isActive ? 'var(--danger)' : 'var(--success)' }}
                    >
                      {updating === u.id ? '…' : u.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {pages > 1 && (
          <div style={{ padding: '15px 20px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: 'var(--gray)' }}>Page {page} of {pages}</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              {page > 1 && <button className="btn btn-outline" style={{ padding: '6px 14px', fontSize: '13px' }} onClick={() => router.push(`/admin/users?page=${page - 1}&role=${currentRole}&q=${q}`)}>← Prev</button>}
              {page < pages && <button className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '13px' }} onClick={() => router.push(`/admin/users?page=${page + 1}&role=${currentRole}&q=${q}`)}>Next →</button>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
