import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

function toNumber(v: unknown): number {
  if (typeof v === 'number') return v;
  if (v && typeof v === 'object' && 'toNumber' in (v as any)) return (v as any).toNumber();
  return Number(v);
}

export default async function RoutesPage() {
  const routes = await prisma.route.findMany({
    where: { is_active: true },
    include: {
      origin_city: { select: { city_code: true, name: true } },
      destination_city: { select: { city_code: true, name: true } },
    },
    orderBy: [{ origin_city: { name: 'asc' } }, { destination_city: { name: 'asc' } }],
  });

  return (
    <div style={{ paddingTop: '100px', paddingBottom: '60px', backgroundColor: '#f8f9fa', minHeight: 'calc(100vh - 70px)' }}>
      <div className="container">
        <div className="section-title">
          <h2>All Available Routes</h2>
          <p>Explore all bus routes connecting major cities across Ethiopia</p>
        </div>

        {routes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '15px' }}>
            <i className="fas fa-route" style={{ fontSize: '48px', color: '#e0e0e0', marginBottom: '15px', display: 'block' }}></i>
            <h3 style={{ color: 'var(--gray)' }}>No routes available yet</h3>
            <p style={{ color: 'var(--gray)', marginTop: '8px', fontSize: '14px' }}>Check back soon as we add more routes.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '25px' }}>
            {routes.map(r => {
              const price = toNumber(r.base_price);
              const duration = r.estimated_duration_hours ? toNumber(r.estimated_duration_hours) : null;
              const distance = r.distance_km;

              return (
                <div
                  key={r.route_id}
                  style={{
                    background: 'white', borderRadius: '15px', padding: '25px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.05)', borderLeft: '4px solid var(--primary)',
                    display: 'flex', flexDirection: 'column', gap: '15px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, fontSize: '17px' }}>{r.origin_city.name}</span>
                    <span style={{ color: 'var(--secondary)', fontSize: '18px' }}>
                      <i className="fas fa-arrow-right"></i>
                    </span>
                    <span style={{ fontWeight: 700, fontSize: '17px' }}>{r.destination_city.name}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--gray)', fontSize: '13px', flexWrap: 'wrap', gap: '6px' }}>
                    {duration && (
                      <span><i className="fas fa-clock" style={{ marginRight: '5px' }}></i>{duration} hrs</span>
                    )}
                    {distance && (
                      <span><i className="fas fa-road" style={{ marginRight: '5px' }}></i>{distance} km</span>
                    )}
                    <span style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '16px' }}>
                      from ETB {price.toLocaleString()}
                    </span>
                  </div>

                  <Link
                    href={`/search?from=${encodeURIComponent(r.origin_city.city_code)}&to=${encodeURIComponent(r.destination_city.city_code)}`}
                    className="btn btn-primary"
                    style={{ display: 'block', textAlign: 'center' }}
                  >
                    Find Buses
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
