'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

type SearchBus = {
  id: string;
  company: { name: string; rating: number };
  bus: { type: string; amenities: unknown[] };
  schedule: { departure_time: string; arrival_time: string };
  pricing: { base_price: number };
  availability: { available_seats: number };
  route: { duration_hours: number };
};

type SortKey = 'cheapest' | 'earliest' | 'fastest';

const TIME_SLOTS = [
  { label: 'Morning (6AM – 12PM)',   id: 'morning',   start: 6,  end: 12 },
  { label: 'Afternoon (12PM – 6PM)', id: 'afternoon', start: 12, end: 18 },
  { label: 'Night (6PM – 6AM)',      id: 'night',     start: 18, end: 30 }, // 30 = next-day 6AM
];

function parseHour(timeStr: string) {
  return parseInt(timeStr.split(':')[0], 10);
}

function SearchResults() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const from       = searchParams.get('from') || '';
  const to         = searchParams.get('to') || '';
  const date       = searchParams.get('date') || '';
  const passengers = Number(searchParams.get('passengers') || '1') || 1;

  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [results, setResults]   = useState<SearchBus[]>([]);

  // Filter state
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [selectedTimes, setSelectedTimes]         = useState<string[]>([]);
  const [sortKey, setSortKey]                     = useState<SortKey>('earliest');

  const query = useMemo(() => ({ from, to, date, passengers }), [from, to, date, passengers]);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!from || !to || !date) return;
      setLoading(true);
      setError(null);
      setSelectedCompanies([]);
      setSelectedTimes([]);
      try {
        const qs = new URLSearchParams({ action: 'search_buses', from, to, date, passengers: String(passengers) });
        const res = await fetch(`/api/search?${qs}`);
        const json = await res.json();
        if (!json.success) throw new Error(json.message ?? 'Search failed');
        if (!cancelled) setResults(json.data.buses ?? []);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Search failed');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => { cancelled = true; };
  }, [query, from, to, date, passengers]);

  // Unique companies from results
  const companies = useMemo(() => [...new Set(results.map(b => b.company.name))].sort(), [results]);

  function toggleCompany(name: string) {
    setSelectedCompanies(prev =>
      prev.includes(name) ? prev.filter(c => c !== name) : [...prev, name]
    );
  }

  function toggleTime(id: string) {
    setSelectedTimes(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  }

  function clearFilters() {
    setSelectedCompanies([]);
    setSelectedTimes([]);
  }

  // Apply filters + sort
  const filtered = useMemo(() => {
    let list = [...results];

    if (selectedCompanies.length > 0) {
      list = list.filter(b => selectedCompanies.includes(b.company.name));
    }

    if (selectedTimes.length > 0) {
      list = list.filter(b => {
        const h = parseHour(b.schedule.departure_time);
        return selectedTimes.some(id => {
          const slot = TIME_SLOTS.find(s => s.id === id);
          if (!slot) return false;
          const h24 = h < 6 ? h + 24 : h; // treat 0-5 as 24-29 for night slot
          return h24 >= slot.start && h24 < slot.end;
        });
      });
    }

    switch (sortKey) {
      case 'cheapest':
        list.sort((a, b) => a.pricing.base_price - b.pricing.base_price);
        break;
      case 'earliest':
        list.sort((a, b) => a.schedule.departure_time.localeCompare(b.schedule.departure_time));
        break;
      case 'fastest':
        list.sort((a, b) => a.route.duration_hours - b.route.duration_hours);
        break;
    }

    return list;
  }, [results, selectedCompanies, selectedTimes, sortKey]);

  const hasActiveFilters = selectedCompanies.length > 0 || selectedTimes.length > 0;

  return (
    <div className="container" style={{ paddingTop: '100px', paddingBottom: '60px', minHeight: 'calc(100vh - 70px)' }}>
      <div className="section-title">
        <h2>Search Results</h2>
        <p>{from && to ? `Buses from ${from} to ${to}${date ? ` on ${date}` : ''}` : 'Find your next bus journey'}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '30px', alignItems: 'start' }}>

        {/* ── Filters Sidebar ── */}
        <div style={{ background: 'white', padding: '25px', borderRadius: '15px', boxShadow: '0 5px 15px rgba(0,0,0,0.05)', position: 'sticky', top: '90px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '12px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Filters</h3>
            {hasActiveFilters && (
              <button onClick={clearFilters} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}>
                Clear all
              </button>
            )}
          </div>

          {/* Company filter — built from live results */}
          <div style={{ marginBottom: '22px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '10px', color: 'var(--gray)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Bus Company</h4>
            {companies.length === 0 ? (
              <p style={{ fontSize: '13px', color: '#bbb' }}>No results yet</p>
            ) : companies.map(name => (
              <label key={name} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', cursor: 'pointer', fontSize: '14px' }}>
                <input
                  type="checkbox"
                  checked={selectedCompanies.includes(name)}
                  onChange={() => toggleCompany(name)}
                  style={{ accentColor: 'var(--primary)', width: '15px', height: '15px' }}
                />
                {name}
              </label>
            ))}
          </div>

          {/* Time filter */}
          <div style={{ marginBottom: '22px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '10px', color: 'var(--gray)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Departure Time</h4>
            {TIME_SLOTS.map(slot => (
              <label key={slot.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', cursor: 'pointer', fontSize: '14px' }}>
                <input
                  type="checkbox"
                  checked={selectedTimes.includes(slot.id)}
                  onChange={() => toggleTime(slot.id)}
                  style={{ accentColor: 'var(--primary)', width: '15px', height: '15px' }}
                />
                {slot.label}
              </label>
            ))}
          </div>

          {hasActiveFilters && (
            <div style={{ padding: '10px 12px', background: '#f0f4ff', borderRadius: '8px', fontSize: '12px', color: 'var(--primary)' }}>
              <i className="fas fa-filter" style={{ marginRight: '6px' }}></i>
              Showing {filtered.length} of {results.length} buses
            </div>
          )}
        </div>

        {/* ── Results ── */}
        <div>
          {(!from || !to) ? (
            <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '15px' }}>
              <i className="fas fa-search" style={{ fontSize: '48px', color: '#e0e0e0', marginBottom: '20px', display: 'block' }}></i>
              <h3>Start your search</h3>
              <p style={{ color: 'var(--gray)', marginTop: '10px' }}>Select departure and destination cities on the homepage.</p>
              <Link href="/" className="btn btn-primary" style={{ marginTop: '20px', display: 'inline-block' }}>Go to Homepage</Link>
            </div>
          ) : (
            <>
              {/* Sort bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
                <span style={{ fontWeight: 500, fontSize: '14px' }}>
                  {loading ? 'Searching…' : `${filtered.length} bus${filtered.length !== 1 ? 'es' : ''} found`}
                  {hasActiveFilters && results.length !== filtered.length && (
                    <span style={{ color: 'var(--gray)', fontWeight: 400 }}> (filtered from {results.length})</span>
                  )}
                </span>
                <select
                  value={sortKey}
                  onChange={e => setSortKey(e.target.value as SortKey)}
                  style={{ padding: '8px 15px', borderRadius: '8px', border: '1px solid #ddd', outline: 'none', fontSize: '14px', cursor: 'pointer' }}
                >
                  <option value="earliest">Sort: Earliest Departure</option>
                  <option value="cheapest">Sort: Cheapest First</option>
                  <option value="fastest">Sort: Fastest Journey</option>
                </select>
              </div>

              {error && (
                <div style={{ padding: '14px 16px', borderRadius: '12px', background: 'rgba(220,53,69,0.08)', border: '1px solid rgba(220,53,69,0.25)', color: '#b02a37', marginBottom: '15px' }}>
                  <i className="fas fa-exclamation-circle" style={{ marginRight: '8px' }}></i>{error}
                </div>
              )}

              {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {[1, 2, 3].map(i => (
                    <div key={i} style={{ background: 'white', borderRadius: '15px', height: '130px', animation: 'pulse 1.5s infinite', opacity: 0.6 }} />
                  ))}
                </div>
              ) : filtered.length === 0 && !error ? (
                <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '15px' }}>
                  <i className="fas fa-bus" style={{ fontSize: '48px', color: '#e0e0e0', marginBottom: '15px', display: 'block' }}></i>
                  <h3 style={{ color: 'var(--gray)' }}>{hasActiveFilters ? 'No buses match your filters' : 'No buses found'}</h3>
                  <p style={{ color: 'var(--gray)', marginTop: '8px', fontSize: '14px' }}>
                    {hasActiveFilters ? 'Try adjusting or clearing your filters.' : 'Try a different date or route.'}
                  </p>
                  {hasActiveFilters && (
                    <button onClick={clearFilters} className="btn btn-primary" style={{ marginTop: '15px' }}>Clear Filters</button>
                  )}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {filtered.map(bus => (
                    <div key={bus.id} style={{ background: 'white', padding: '25px', borderRadius: '15px', boxShadow: '0 5px 15px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', border: '1px solid #f0f0f0' }}>
                      <div style={{ flex: '1 1 180px' }}>
                        <h3 style={{ fontSize: '18px', color: 'var(--primary)', marginBottom: '6px', fontWeight: 700 }}>{bus.company.name}</h3>
                        <div style={{ fontSize: '12px', color: 'var(--gray)', textTransform: 'capitalize', marginBottom: '6px' }}>
                          {bus.bus.type.replace(/-/g, ' ')}
                        </div>
                        <div style={{ display: 'flex', gap: '12px', color: 'var(--gray)', fontSize: '13px' }}>
                          <span><i className="fas fa-wifi"></i> WiFi</span>
                          <span><i className="fas fa-snowflake"></i> AC</span>
                          <span><i className="fas fa-plug"></i> Charging</span>
                        </div>
                      </div>

                      <div style={{ flex: '1 1 280px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px' }}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '20px', fontWeight: 700 }}>{bus.schedule.departure_time.slice(0, 5)}</div>
                          <div style={{ fontSize: '12px', color: 'var(--gray)', marginTop: '3px' }}>{from}</div>
                        </div>
                        <div style={{ flex: 1, textAlign: 'center', position: 'relative' }}>
                          <div style={{ fontSize: '12px', color: 'var(--gray)', marginBottom: '6px' }}>{bus.route.duration_hours} hrs</div>
                          <div style={{ borderBottom: '2px dashed #ddd', position: 'relative' }}>
                            <i className="fas fa-bus" style={{ position: 'absolute', top: '-9px', left: '50%', transform: 'translateX(-50%)', color: 'var(--secondary)', background: 'white', padding: '0 4px' }}></i>
                          </div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '20px', fontWeight: 700 }}>{bus.schedule.arrival_time.slice(0, 5)}</div>
                          <div style={{ fontSize: '12px', color: 'var(--gray)', marginTop: '3px' }}>{to}</div>
                        </div>
                      </div>

                      <div style={{ flex: '0 0 160px', textAlign: 'right', borderLeft: '1px solid #eee', paddingLeft: '20px' }}>
                        <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--dark)', marginBottom: '4px' }}>
                          ETB {bus.pricing.base_price.toLocaleString()}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--success)', marginBottom: '14px' }}>
                          {bus.availability.available_seats} seats left
                        </div>
                        <Link
                          href={`/book?scheduleId=${encodeURIComponent(bus.id)}&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${encodeURIComponent(date)}&passengers=${passengers}`}
                          className="btn btn-primary"
                          style={{ display: 'block', textAlign: 'center', fontSize: '14px' }}
                        >
                          Select Seats
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div style={{ paddingTop: '120px', textAlign: 'center' }}>
        <i className="fas fa-spinner fa-spin" style={{ fontSize: '32px', color: 'var(--primary)' }}></i>
      </div>
    }>
      <SearchResults />
    </Suspense>
  );
}
