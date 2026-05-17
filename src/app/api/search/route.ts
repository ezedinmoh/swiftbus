import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

function ok(data: unknown) {
  return NextResponse.json({ success: true, data });
}

function err(message: string, status = 400, extra?: Record<string, unknown>) {
  return NextResponse.json({ success: false, message, ...(extra ?? {}) }, { status });
}

function formatTime(t: Date) {
  const hh = String(t.getUTCHours()).padStart(2, '0');
  const mm = String(t.getUTCMinutes()).padStart(2, '0');
  return `${hh}:${mm}:00`;
}

function toNumber(v: unknown) {
  if (typeof v === 'number') return v;
  if (typeof v === 'string') return Number(v);
  if (v && typeof v === 'object' && 'toNumber' in (v as any) && typeof (v as any).toNumber === 'function') {
    return (v as any).toNumber();
  }
  return Number(v);
}

function normalizeCityCode(city: string): string {
  const clean = city.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (clean === 'bahirdar') return 'bahir-dar';
  if (clean === 'gonder') return 'gondar';
  if (clean === 'hawasa') return 'hawassa';
  if (clean === 'arbaminch') return 'arbaminch';
  if (clean === 'adama' || clean === 'nazreth' || clean === 'adamanazreth') return 'adama';
  if (clean === 'addisababa') return 'addis-ababa';
  if (clean === 'diredawa') return 'dire-dawa';
  
  const standardCodes = ['addis-ababa', 'bahir-dar', 'gondar', 'mekele', 'hawassa', 'dire-dawa', 'jimma', 'adama', 'dessie', 'kombolcha', 'arbaminch'];
  const match = standardCodes.find(code => code.replace(/-/g, '') === clean);
  if (match) return match;
  
  return city.toLowerCase().replace(/\s+/g, '-');
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action') ?? '';

  try {
    if (action === 'get_cities') {
      const cities = await prisma.city.findMany({
        where: { is_active: true },
        select: { city_code: true, name: true, region: true, latitude: true, longitude: true },
        orderBy: { name: 'asc' },
      });
      return ok(cities);
    }

    if (action === 'get_routes') {
      const routes = await prisma.route.findMany({
        where: { is_active: true },
        include: {
          origin_city: { select: { city_code: true, name: true } },
          destination_city: { select: { city_code: true, name: true } },
        },
        orderBy: [{ origin_city: { name: 'asc' } }, { destination_city: { name: 'asc' } }],
      });

      const formatted = routes.map((r) => ({
        id: r.route_id,
        origin: { code: r.origin_city.city_code, name: r.origin_city.name },
        destination: { code: r.destination_city.city_code, name: r.destination_city.name },
        distance_km: r.distance_km ?? null,
        duration_hours: r.estimated_duration_hours != null ? toNumber(r.estimated_duration_hours) : null,
        base_price: toNumber(r.base_price),
      }));
      return ok(formatted);
    }

    if (action === 'search_buses') {
      const fromParam = searchParams.get('from') ?? '';
      const toParam = searchParams.get('to') ?? '';
      const date = searchParams.get('date') ?? '';
      const passengers = Math.max(1, Math.min(10, Number(searchParams.get('passengers') ?? '1') || 1));

      if (!fromParam) return err("Parameter 'from' is required");
      if (!toParam) return err("Parameter 'to' is required");
      if (!date) return err("Parameter 'date' is required");

      const from = normalizeCityCode(fromParam);
      const to = normalizeCityCode(toParam);

      const travelDate = new Date(`${date}T00:00:00.000Z`);
      if (Number.isNaN(travelDate.getTime())) return err('Invalid travel date');

      const dayOfWeek = new Intl.DateTimeFormat('en-US', { weekday: 'long', timeZone: 'UTC' })
        .format(travelDate)
        .toLowerCase();

      const schedules = await prisma.schedule.findMany({
        where: {
          is_active: true,
          effective_from: { lte: travelDate },
          OR: [{ effective_until: null }, { effective_until: { gte: travelDate } }],
          route: {
            is_active: true,
            origin_city: { city_code: from },
            destination_city: { city_code: to },
          },
          bus: {
            status: 'active',
            company: { is_active: true },
          },
        },
        include: {
          bus: { include: { company: true } },
          route: { include: { origin_city: true, destination_city: true } },
        },
      });

      const results = schedules
        .filter((s) => {
          let days: string[] = [];
          if (Array.isArray(s.days_of_week)) {
            days = s.days_of_week as string[];
          } else if (typeof s.days_of_week === 'string') {
            try {
              days = JSON.parse(s.days_of_week);
            } catch {
              days = [];
            }
          }
          return days.includes(dayOfWeek);
        })
        .map((s) => {
          const totalSeats = s.bus.total_seats;
          const availableSeatCount = totalSeats; // TODO: compute from bus_seats/bookings when we migrate booking/seats.

          const dep = formatTime(s.departure_time);
          const dur = s.route.estimated_duration_hours != null ? toNumber(s.route.estimated_duration_hours) : 0;
          const arr = new Date(Date.UTC(1970, 0, 1, s.departure_time.getUTCHours(), s.departure_time.getUTCMinutes(), 0));
          arr.setUTCSeconds(arr.getUTCSeconds() + Math.round(dur * 3600));

          return {
            id: s.schedule_id,
            schedule_id: s.schedule_id,
            company: {
              id: s.bus.company.company_id,
              name: s.bus.company.name,
              rating: s.bus.company.rating != null ? toNumber(s.bus.company.rating) : 0,
            },
            bus: {
              id: s.bus.bus_id,
              number: s.bus.bus_number,
              type: s.bus.bus_type,
              total_seats: totalSeats,
              amenities: s.bus.amenities ?? [],
            },
            route: {
              id: s.route.route_id,
              origin: { code: s.route.origin_city.city_code, name: s.route.origin_city.name },
              destination: { code: s.route.destination_city.city_code, name: s.route.destination_city.name },
              distance_km: s.route.distance_km ?? 0,
              duration_hours: dur,
            },
            schedule: {
              departure_time: dep,
              arrival_time: formatTime(arr),
              travel_date: date,
            },
            pricing: {
              base_price: toNumber(s.price),
              total_price: toNumber(s.price) * passengers,
              currency: 'ETB',
            },
            availability: {
              available_seats: availableSeatCount,
              seats_needed: passengers,
              is_available: availableSeatCount >= passengers,
            },
          };
        })
        .filter((r) => r.availability.is_available)
        .sort((a, b) => a.schedule.departure_time.localeCompare(b.schedule.departure_time));

      return ok({
        buses: results,
        search_params: { from, to, date, passengers },
        total_results: results.length,
      });
    }

    return err('Invalid action', 400);
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Search failed';
    return err('Search failed. Please try again.', 500, { debug: message });
  }
}

