'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface Route {
  id: string; origin: string; originCode: string;
  destination: string; destinationCode: string;
  distanceKm: number; durationHours: number;
  basePrice: number; isActive: boolean; scheduleCount: number;
}
interface City { id: number; city_code: string; name: string; }

export default function AdminRoutesClient({ routes, cities }: { routes: Route[]; cities: City[] }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [form, setForm] = useState({ originCode: '', destinationCode: '', distanceKm: '', durationHours: '', basePrice: '' });

  const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', outline: 'none' };

  async function handleAddRoute(e: React.FormEvent) {
    e.preventDefault();
    if (form.originCode === form.destinationCode) { setFormError('Origin and destination must be different'); return; }
    setSaving(true); setFormError('');
    try {
      const res = await fetch('/api/admin/routes', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (json.success) { setShowForm(false); router.refresh(); }
      else setFormError(json.message ?? 'Failed to add route');
    } catch { setFormError('Network error'); }
    finally { setSaving(false); }
  }

  async function toggleActive(routeId: string, current: boolean) {
    const res = await fetch('/api/admin/routes', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ routeId, isActive: !current }),
    });
    const json = await res.json();
    if (json.success) router.refresh();
    else alert(json.message ?? 'Update failed');
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700 }}>Routes</h1>
          <p style={{ color: 'var(--gray)', fontSize: '13px' }}>{routes.length} routes configured</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <i className="fas fa-plus"></i> Add Route
        </button>
      </div>

      {/* Add Route Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '15px', padding: '30px', width: '100%', maxWidth: '480px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Add New Route</h2>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>×</button>
            </div>
            {formError && <div style={{ padding: '10px', background: 'rgba(220,53,69,0.1)', color: 'var(--danger)', borderRadius: '8px', marginBottom: '15px', fontSize: '13px' }}>{formError}</div>}
            <form onSubmit={handleAddRoute} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500 }}>Origin City *</label>
                  <select value={form.originCode} onChange={e => setForm(f => ({ ...f, originCode: e.target.value }))} required style={inputStyle}>
                    <option value="">Select city</option>
                    {cities.map(c => <option key={c.id} value={c.city_code}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500 }}>Destination City *</label>
                  <select value={form.destinationCode} onChange={e => setForm(f => ({ ...f, destinationCode: e.target.value }))} required style={inputStyle}>
                    <option value="">Select city</option>
                    {cities.map(c => <option key={c.id} value={c.city_code}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500 }}>Distance (km)</label>
                  <input type="number" value={form.distanceKm} onChange={e => setForm(f => ({ ...f, distanceKm: e.target.value }))} placeholder="e.g. 275" style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500 }}>Duration (hrs)</label>
                  <input type="number" step="0.5" value={form.durationHours} onChange={e => setForm(f => ({ ...f, durationHours: e.target.value }))} placeholder="e.g. 4.5" style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500 }}>Base Price (ETB) *</label>
                  <input type="number" value={form.basePrice} onChange={e => setForm(f => ({ ...f, basePrice: e.target.value }))} required placeholder="e.g. 350" style={inputStyle} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Add Route'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div style={{ background: 'white', borderRadius: '15px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead style={{ background: '#f8f9fa' }}>
              <tr>
                {['Route', 'Distance', 'Duration', 'Base Price', 'Schedules', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '13px 18px', textAlign: 'left', fontWeight: 600, color: 'var(--gray)', whiteSpace: 'nowrap', borderBottom: '2px solid #eee' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {routes.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: 'var(--gray)' }}>No routes found</td></tr>
              ) : routes.map(r => (
                <tr key={r.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                  <td style={{ padding: '13px 18px', fontWeight: 600 }}>{r.origin} → {r.destination}</td>
                  <td style={{ padding: '13px 18px' }}>{r.distanceKm ? `${r.distanceKm} km` : '—'}</td>
                  <td style={{ padding: '13px 18px' }}>{r.durationHours ? `${r.durationHours} hrs` : '—'}</td>
                  <td style={{ padding: '13px 18px', fontWeight: 600 }}>ETB {r.basePrice.toLocaleString()}</td>
                  <td style={{ padding: '13px 18px', textAlign: 'center' }}>{r.scheduleCount}</td>
                  <td style={{ padding: '13px 18px' }}>
                    <span style={{ padding: '3px 10px', background: r.isActive ? 'rgba(40,167,69,0.1)' : 'rgba(220,53,69,0.1)', color: r.isActive ? '#28a745' : '#dc3545', borderRadius: '20px', fontSize: '11px', fontWeight: 600 }}>
                      {r.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ padding: '13px 18px' }}>
                    <button onClick={() => toggleActive(r.id, r.isActive)}
                      style={{ padding: '5px 12px', borderRadius: '6px', border: '1px solid #ddd', background: 'white', cursor: 'pointer', fontSize: '12px', color: r.isActive ? 'var(--danger)' : 'var(--success)' }}>
                      {r.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
