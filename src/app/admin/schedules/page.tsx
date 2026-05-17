import { prisma } from '@/lib/prisma';
import AdminSchedulesClient from './AdminSchedulesClient';

export default async function AdminSchedulesPage() {
  const [schedules, buses, routes] = await Promise.all([
    prisma.schedule.findMany({
      include: {
        bus: { include: { company: { select: { name: true } } } },
        route: { include: { origin_city: true, destination_city: true } },
        _count: { select: { bookings: true } },
      },
      orderBy: { created_at: 'desc' },
      take: 50,
    }),
    prisma.bus.findMany({
      where: { status: 'active' },
      include: { company: { select: { name: true } } },
      orderBy: { bus_number: 'asc' },
    }),
    prisma.route.findMany({
      where: { is_active: true },
      include: { origin_city: true, destination_city: true },
      orderBy: [{ origin_city: { name: 'asc' } }],
    }),
  ]);

  function fmtTime(d: Date) {
    return `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`;
  }

  const formatted = schedules.map(s => ({
    id: s.schedule_id,
    busNumber: s.bus.bus_number,
    busCompany: s.bus.company.name,
    route: `${s.route.origin_city.name} → ${s.route.destination_city.name}`,
    departureTime: fmtTime(s.departure_time),
    arrivalTime: fmtTime(s.arrival_time),
    daysOfWeek: s.days_of_week as string[],
    price: Number(s.price),
    isActive: s.is_active,
    bookingCount: s._count.bookings,
    effectiveFrom: s.effective_from.toISOString().split('T')[0],
  }));

  const busOptions = buses.map(b => ({ id: b.bus_id, label: `${b.bus_number} — ${b.company.name}` }));
  const routeOptions = routes.map(r => ({ id: r.route_id, label: `${r.origin_city.name} → ${r.destination_city.name}` }));

  return <AdminSchedulesClient schedules={formatted} buses={busOptions} routes={routeOptions} />;
}
