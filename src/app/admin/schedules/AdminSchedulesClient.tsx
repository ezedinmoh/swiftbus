'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface Schedule {
  id: string;
  busNumber: string;
  busCompany: string;
  route: string;
  departureTime: string;
  arrivalTime: string;
  daysOfWeek: string[];
  price: number;
  isActive: boolean;
  bookingCount: number;
  effectiveFrom: string;
}

interface BusOption  { id: string; label: string; }
interface RouteOption { id: string; label: string; }

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAY_VALUES = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 12px', borderRadius: '8px',
  border: '1px solid #ddd', fontSize: '14px', outline: 'none',
};

export default function AdminSchedulesClient({
  schedules, buses, routes,
}: {
  schedules: Schedule[];
  buses: BusOption[];
  routes: RouteOption[];
}) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [editPrice, setEditPrice] = useState<{ id: string; value: string } | null>(null);
  const [form, setForm] = useState({
    busId: '',
    routeId: '',
    departureTime: '',
    arrivalTime: '',
    daysOfWeek: [] as string[],
    price: '',
    effectiveFrom: new Date().toISOString().split('T')[0],
    effectiveUntil: '',
  });

  function toggleDay(day: string) {
    setForm(f => ({
      ...f,
      daysOfWeek: f.daysOfWeek.includes(day)
        ? f.daysOfWeek.filter(d => d !== day)
        : [...f.daysOfWeek, day],
    }));
  }

  function resetForm() {
    setForm({
      busId: '', routeId: '', departureTime: '', arrivalTime: '',
      daysOfWeek: [], price: '',
      effectiveFrom: new Date().toISOString().split('T')[0],
      effectiveUntil: '',
    });
    setFormError('');
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (form.daysOfWeek.length === 0) { setFormError('Select at least one day of week'); return; }
    setSaving(true); setFormError('');
    try {
      const res = await fetch('/api/admin/schedules', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (json.success) { setShowForm(false); resetForm(); router.refresh(); }
      else setFormError(json.message ?? 'Failed to create schedule');
    } catch { setFormError('Network error'); }
    finally { setSaving(false); }
  }

  async function toggleActive(scheduleId: string, current: boolean) {
    const res = await fetch('/api/admin/schedules', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ scheduleId, isActive: !current }),
    });
    const json = await res.json();
    if (json.success) router.refresh();
    else alert(json.message ?? 'Update failed');
  }

  async function savePrice(scheduleId: string, price: string) {
    if (!price || Number(price) <= 0) { alert('Enter a valid price'); return; }
    const res = await fetch('/api/admin/schedules', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ scheduleId, price: Number(price) }),
    });
    const json = await res.json();
    if (json.success) { setEditPrice(null); router.refresh(); }
    else alert(json.message ?? 'Update failed');
  }

  async function handleDelete(scheduleId: string, bookingCount: number) {
    if (bookingCount > 0) {
      alert(`Cannot delete — ${bookingCount} booking(s) exist. Deactivate instead.`);
      return;
    }
    if (!confirm('Delete this schedule permanently?')) return;
    const res = await fetch(`/api/admin/schedules?scheduleId=${scheduleId}`, { method: 'DELETE' });
    const json = await res.json();
    if (json.success) router.refresh();
    else alert(json.message ?? 'Delete failed');
  }

  function fmtDays(days: string[]) {
    return days.map(d => d.slice(0, 3).charAt(0).toUpperCase() + d.slice(1, 3)).join(', ');
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700 }}>Schedules</h1>
          <p style={{ color: 'var(--gray)', fontSize: '13px' }}>{schedules.length} schedules configured</p>
        </div>
        <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(true); }}>
          <i className="fas fa-plus"></i> Add Schedule
        </button>
      </div>

      {/* Create Schedule Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '15px', padding: '30px', width: '100%', maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Add New Schedule</h2>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: 'var(--gray)' }}>×</button>
            </div>

            {formError && (
              <div style={{ padding: '10px 14px', background: 'rgba(220,53,69,0.1)', color: 'var(--danger)', borderRadius: '8px', marginBottom: '15px', fontSize: '13px' }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Bus */}
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500 }}>Bus *</label>
                <select value={form.busId} onChange={e => setForm(f => ({ ...f, busId: e.target.value }))} required style={inputStyle}>
                  <option value="">Select bus</option>
                  {buses.map(b => <option key={b.id} value={b.id}>{b.label}</option>)}
                </select>
              </div>

              {/* Route */}
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500 }}>Route *</label>
                <select value={form.routeId} onChange={e => setForm(f => ({ ...f, routeId: e.target.value }))} required style={inputStyle}>
                  <option value="">Select route</option>
                  {routes.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
                </select>
              </div>

              {/* Times */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500 }}>Departure Time *</label>
                  <input type="time" value={form.departureTime} onChange={e => setForm(f => ({ ...f, departureTime: e.target.value }))} required style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500 }}>Arrival Time *</label>
                  <input type="time" value={form.arrivalTime} onChange={e => setForm(f => ({ ...f, arrivalTime: e.target.value }))} required style={inputStyle} />
                </div>
              </div>

              {/* Days of Week */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 500 }}>Days of Week *</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {DAY_VALUES.map((day, i) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      style={{
                        padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                        border: '1px solid',
                        borderColor: form.daysOfWeek.includes(day) ? 'var(--primary)' : '#ddd',
                        background: form.daysOfWeek.includes(day) ? 'var(--primary)' : 'white',
                        color: form.daysOfWeek.includes(day) ? 'white' : 'var(--gray)',
                        transition: 'all 0.15s',
                      }}
                    >
                      {DAYS[i]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500 }}>Price (ETB) *</label>
                <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} required min="1" placeholder="e.g. 350" style={inputStyle} />
              </div>

              {/* Effective dates */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500 }}>Effective From *</label>
                  <input type="date" value={form.effectiveFrom} onChange={e => setForm(f => ({ ...f, effectiveFrom: e.target.value }))} required style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500 }}>Effective Until</label>
                  <input type="date" value={form.effectiveUntil} onChange={e => setForm(f => ({ ...f, effectiveUntil: e.target.value }))} style={inputStyle} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '4px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving…' : 'Create Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      <div style={{ background: 'white', borderRadius: '15px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead style={{ background: '#f8f9fa' }}>
              <tr>
                {['Bus', 'Route', 'Departure', 'Arrival', 'Days', 'Price (ETB)', 'Bookings', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '13px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--gray)', whiteSpace: 'nowrap', borderBottom: '2px solid #eee' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {schedules.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ padding: '50px', textAlign: 'center', color: 'var(--gray)' }}>
                    <i className="fas fa-calendar-times" style={{ fontSize: '32px', display: 'block', marginBottom: '10px', opacity: 0.3 }}></i>
                    No schedules found. Add one to get started.
                  </td>
                </tr>
              ) : schedules.map(s => (
                <tr key={s.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                  <td style={{ padding: '13px 16px' }}>
                    <div style={{ fontWeight: 600 }}>{s.busNumber}</div>
                    <div style={{ fontSize: '11px', color: 'var(--gray)' }}>{s.busCompany}</div>
                  </td>
                  <td style={{ padding: '13px 16px', fontWeight: 500 }}>{s.route}</td>
                  <td style={{ padding: '13px 16px', fontWeight: 600, color: 'var(--primary)' }}>{s.departureTime}</td>
                  <td style={{ padding: '13px 16px' }}>{s.arrivalTime}</td>
                  <td style={{ padding: '13px 16px', fontSize: '12px', color: 'var(--gray)' }}>{fmtDays(s.daysOfWeek)}</td>

                  {/* Inline price edit */}
                  <td style={{ padding: '13px 16px' }}>
                    {editPrice?.id === s.id ? (
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <input
                          type="number"
                          value={editPrice.value}
                          onChange={e => setEditPrice({ id: s.id, value: e.target.value })}
                          style={{ width: '80px', padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--primary)', fontSize: '13px', outline: 'none' }}
                          autoFocus
                        />
                        <button onClick={() => savePrice(s.id, editPrice.value)}
                          style={{ background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '5px', padding: '4px 8px', cursor: 'pointer', fontSize: '12px' }}>✓</button>
                        <button onClick={() => setEditPrice(null)}
                          style={{ background: '#eee', border: 'none', borderRadius: '5px', padding: '4px 8px', cursor: 'pointer', fontSize: '12px' }}>✕</button>
                      </div>
                    ) : (
                      <span
                        onClick={() => setEditPrice({ id: s.id, value: String(s.price) })}
                        style={{ cursor: 'pointer', fontWeight: 600 }}
                        title="Click to edit price"
                      >
                        {s.price.toLocaleString()} <i className="fas fa-pencil-alt" style={{ fontSize: '10px', color: 'var(--gray)', marginLeft: '4px' }}></i>
                      </span>
                    )}
                  </td>

                  <td style={{ padding: '13px 16px', textAlign: 'center' }}>{s.bookingCount}</td>

                  <td style={{ padding: '13px 16px' }}>
                    <span style={{
                      padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600,
                      background: s.isActive ? 'rgba(40,167,69,0.1)' : 'rgba(220,53,69,0.1)',
                      color: s.isActive ? '#28a745' : '#dc3545',
                    }}>
                      {s.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>

                  <td style={{ padding: '13px 16px' }}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => toggleActive(s.id, s.isActive)}
                        style={{ padding: '5px 10px', borderRadius: '6px', border: '1px solid #ddd', background: 'white', cursor: 'pointer', fontSize: '11px', color: s.isActive ? 'var(--danger)' : 'var(--success)', whiteSpace: 'nowrap' }}
                      >
                        {s.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleDelete(s.id, s.bookingCount)}
                        style={{ padding: '5px 10px', borderRadius: '6px', border: '1px solid #ffcdd2', background: '#fff5f5', cursor: 'pointer', fontSize: '11px', color: 'var(--danger)' }}
                        title={s.bookingCount > 0 ? 'Has bookings — deactivate instead' : 'Delete schedule'}
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
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
