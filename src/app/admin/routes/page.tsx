import { prisma } from '@/lib/prisma';
import AdminRoutesClient from './AdminRoutesClient';

export default async function AdminRoutesPage() {
  const [routes, cities] = await Promise.all([
    prisma.route.findMany({
      include: {
        origin_city: { select: { name: true, city_code: true } },
        destination_city: { select: { name: true, city_code: true } },
        _count: { select: { schedules: true } },
      },
      orderBy: [{ origin_city: { name: 'asc' } }, { destination_city: { name: 'asc' } }],
    }),
    prisma.city.findMany({ where: { is_active: true }, orderBy: { name: 'asc' }, select: { id: true, city_code: true, name: true } }),
  ]);

  const formatted = routes.map(r => ({
    id: r.route_id,
    origin: r.origin_city.name,
    originCode: r.origin_city.city_code,
    destination: r.destination_city.name,
    destinationCode: r.destination_city.city_code,
    distanceKm: r.distance_km ?? 0,
    durationHours: r.estimated_duration_hours ? Number(r.estimated_duration_hours) : 0,
    basePrice: Number(r.base_price),
    isActive: r.is_active,
    scheduleCount: r._count.schedules,
  }));

  return <AdminRoutesClient routes={formatted} cities={cities} />;
}
