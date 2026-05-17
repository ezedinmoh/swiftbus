'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface Bus {
  id: string; dbId: number; number: string; company: string;
  type: string; totalSeats: number; status: string;
  licensePlate: string; model: string; scheduleCount: number;
}

interface Company { id: number; name: string; company_id: string; }

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  active:      { bg: 'rgba(40,167,69,0.1)',  color: '#28a745' },
  maintenance: { bg: 'rgba(255,193,7,0.15)', color: '#856404' },
  inactive:    { bg: 'rgba(220,53,69,0.1)',  color: '#dc3545' },
};

export default function AdminBusesClient({
  buses, companies, total, page, pages, currentQ, currentStatus,
}: {
  buses: Bus[]; companies: Company[]; total: number; page: number; pages: number;
  currentQ: string; currentStatus: string;
}) {
  const router = useRouter();
  const [q, setQ] = useState(currentQ);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [form, setForm] = useState({
    companyId: '', busNumber: '', busType: 'standard', totalSeats: '45',
    licensePlate: '', model: '',
  });

  function applyFilter(newStatus?: string, newQ?: string) {
    const params = new URLSearchParams();
    if (newStatus ?? currentStatus) params.set('status', newStatus ?? currentStatus);
    if (newQ ?? q) params.set('q', newQ ?? q);
    params.set('page', '1');
    router.push(`/admin/buses?${params.toString()}`);
  }

  async function handleAddBus(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setFormError('');
    try {
      const res = await fetch('/api/admin/buses', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (json.success) { setShowForm(false); router.refresh(); }
      else setFormError(json.message ?? 'Failed to add bus');
    } catch { setFormError('Network error'); }
    finally { setSaving(false); }
  }

  async function updateStatus(busId: string, newStatus: string) {
    const res = await fetch('/api/admin/buses', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ busId, status: newStatus }),
    });
    const json = await res.json();
    if (json.success) router.refresh();
    else alert(json.message ?? 'Update failed');
  }

  const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', outline: 'none' };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700 }}>Buses</h1>
          <p style={{ color: 'var(--gray)', fontSize: '13px' }}>{total} buses registered</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <i className="fas fa-plus"></i> Add Bus
        </button>
      </div>

      {/* Add Bus Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '15px', padding: '30px', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Add New Bus</h2>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--gray)' }}>×</button>
            </div>
            {formError && <div style={{ padding: '10px', background: 'rgba(220,53,69,0.1)', color: 'var(--danger)', borderRadius: '8px', marginBottom: '15px', fontSize: '13px' }}>{formError}</div>}
            <form onSubmit={handleAddBus} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500 }}>Bus Company *</label>
                <select value={form.companyId} onChange={e => setForm(f => ({ ...f, companyId: e.target.value }))} required style={inputStyle}>
                  <option value="">Select company</option>
                  {companies.map(c => <option key={c.id} value={c.company_id}>{c.name}</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500 }}>Bus Number *</label>
                  <input type="text" value={form.busNumber} onChange={e => setForm(f => ({ ...f, busNumber: e.target.value }))} required placeholder="e.g. BUS-001" style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500 }}>Bus Type *</label>
                  <select value={form.busType} onChange={e => setForm(f => ({ ...f, busType: e.target.value }))} style={inputStyle}>
                    <option value="economy">Economy</option>
                    <option value="standard">Standard</option>
                    <option value="standard-ac">Standard AC</option>
                    <option value="premium-ac">Premium AC</option>
                    <option value="luxury">Luxury</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500 }}>Total Seats *</label>
                  <input type="number" value={form.totalSeats} onChange={e => setForm(f => ({ ...f, totalSeats: e.target.value }))} required min="10" max="60" style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500 }}>License Plate</label>
                  <input type="text" value={form.licensePlate} onChange={e => setForm(f => ({ ...f, licensePlate: e.target.value }))} placeholder="e.g. AA-12345" style={inputStyle} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500 }}>Model</label>
                <input type="text" value={form.model} onChange={e => setForm(f => ({ ...f, model: e.target.value }))} placeholder="e.g. Yutong ZK6122H9" style={inputStyle} />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '5px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Add Bus'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={{ background: 'white', borderRadius: '12px', padding: '20px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center' }}>
        <input type="text" value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => e.key === 'Enter' && applyFilter(undefined, q)}
          placeholder="Search buses…" style={{ flex: 1, minWidth: '200px', padding: '10px 15px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', outline: 'none' }} />
        <select value={currentStatus} onChange={e => applyFilter(e.target.value)}
          style={{ padding: '10px 15px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', outline: 'none' }}>
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="maintenance">Maintenance</option>
          <option value="inactive">Inactive</option>
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
                {['Bus #', 'Company', 'Type', 'Seats', 'License', 'Model', 'Schedules', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '13px 18px', textAlign: 'left', fontWeight: 600, color: 'var(--gray)', whiteSpace: 'nowrap', borderBottom: '2px solid #eee' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {buses.length === 0 ? (
                <tr><td colSpan={9} style={{ padding: '40px', textAlign: 'center', color: 'var(--gray)' }}>No buses found</td></tr>
              ) : buses.map(b => {
                const s = STATUS_STYLE[b.status] ?? STATUS_STYLE.inactive;
                return (
                  <tr key={b.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                    <td style={{ padding: '13px 18px', fontWeight: 600 }}>{b.number}</td>
                    <td style={{ padding: '13px 18px' }}>{b.company}</td>
                    <td style={{ padding: '13px 18px', textTransform: 'capitalize' }}>{b.type.replace(/-/g, ' ')}</td>
                    <td style={{ padding: '13px 18px', textAlign: 'center' }}>{b.totalSeats}</td>
                    <td style={{ padding: '13px 18px' }}>{b.licensePlate}</td>
                    <td style={{ padding: '13px 18px' }}>{b.model}</td>
                    <td style={{ padding: '13px 18px', textAlign: 'center' }}>{b.scheduleCount}</td>
                    <td style={{ padding: '13px 18px' }}>
                      <span style={{ padding: '3px 10px', background: s.bg, color: s.color, borderRadius: '20px', fontSize: '11px', fontWeight: 600, textTransform: 'capitalize' }}>{b.status}</span>
                    </td>
                    <td style={{ padding: '13px 18px' }}>
                      <select value={b.status} onChange={e => updateStatus(b.id, e.target.value)}
                        style={{ padding: '5px 8px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '12px', cursor: 'pointer' }}>
                        <option value="active">Active</option>
                        <option value="maintenance">Maintenance</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {pages > 1 && (
          <div style={{ padding: '15px 20px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: 'var(--gray)' }}>Page {page} of {pages}</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              {page > 1 && <button className="btn btn-outline" style={{ padding: '6px 14px', fontSize: '13px' }} onClick={() => router.push(`/admin/buses?page=${page - 1}&status=${currentStatus}&q=${q}`)}>← Prev</button>}
              {page < pages && <button className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '13px' }} onClick={() => router.push(`/admin/buses?page=${page + 1}&status=${currentStatus}&q=${q}`)}>Next →</button>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
