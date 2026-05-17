import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

async function getAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('sb_token')?.value;
  const session = token ? verifyToken(token) : null;
  if (!session || session.role !== 'admin') return null;
  return session;
}

function generateScheduleId(): string {
  return `SCH${new Date().getFullYear()}${String(Math.floor(Math.random() * 99999)).padStart(5, '0')}`;
}

// POST /api/admin/schedules — create a new schedule
export async function POST(req: NextRequest) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

  try {
    const { busId, routeId, departureTime, arrivalTime, daysOfWeek, price, effectiveFrom, effectiveUntil } =
      await req.json() as {
        busId: string; routeId: string;
        departureTime: string; arrivalTime: string;
        daysOfWeek: string[]; price: string;
        effectiveFrom: string; effectiveUntil?: string;
      };

    if (!busId) return NextResponse.json({ success: false, message: 'Bus is required' }, { status: 400 });
    if (!routeId) return NextResponse.json({ success: false, message: 'Route is required' }, { status: 400 });
    if (!departureTime) return NextResponse.json({ success: false, message: 'Departure time is required' }, { status: 400 });
    if (!arrivalTime) return NextResponse.json({ success: false, message: 'Arrival time is required' }, { status: 400 });
    if (!daysOfWeek?.length) return NextResponse.json({ success: false, message: 'At least one day of week is required' }, { status: 400 });
    if (!price || Number(price) <= 0) return NextResponse.json({ success: false, message: 'Valid price is required' }, { status: 400 });
    if (!effectiveFrom) return NextResponse.json({ success: false, message: 'Effective from date is required' }, { status: 400 });

    const bus = await prisma.bus.findUnique({ where: { bus_id: busId } });
    if (!bus) return NextResponse.json({ success: false, message: 'Bus not found' }, { status: 404 });

    const route = await prisma.route.findUnique({ where: { route_id: routeId } });
    if (!route) return NextResponse.json({ success: false, message: 'Route not found' }, { status: 404 });

    // Parse times as UTC Date objects (stored as TIME in DB)
    const [depH, depM] = departureTime.split(':').map(Number);
    const [arrH, arrM] = arrivalTime.split(':').map(Number);
    const depDate = new Date(0); depDate.setUTCHours(depH, depM, 0, 0);
    const arrDate = new Date(0); arrDate.setUTCHours(arrH, arrM, 0, 0);

    const schedule = await prisma.schedule.create({
      data: {
        schedule_id: generateScheduleId(),
        bus_id: bus.id,
        route_id: route.id,
        departure_time: depDate,
        arrival_time: arrDate,
        days_of_week: daysOfWeek,
        price: Number(price),
        effective_from: new Date(effectiveFrom + 'T00:00:00.000Z'),
        effective_until: effectiveUntil ? new Date(effectiveUntil + 'T00:00:00.000Z') : null,
        is_active: true,
      },
    });

    return NextResponse.json({ success: true, message: 'Schedule created', data: { scheduleId: schedule.schedule_id } });
  } catch (e) {
    console.error('Create schedule error:', e);
    return NextResponse.json({ success: false, message: 'Failed to create schedule' }, { status: 500 });
  }
}

// PATCH /api/admin/schedules — toggle active or update price
export async function PATCH(req: NextRequest) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json() as { scheduleId: string; isActive?: boolean; price?: number };
    const { scheduleId, isActive, price } = body;

    if (!scheduleId) return NextResponse.json({ success: false, message: 'Schedule ID required' }, { status: 400 });

    const data: Record<string, unknown> = {};
    if (typeof isActive === 'boolean') data.is_active = isActive;
    if (price !== undefined && price > 0) data.price = price;

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ success: false, message: 'Nothing to update' }, { status: 400 });
    }

    await prisma.schedule.update({ where: { schedule_id: scheduleId }, data });
    return NextResponse.json({ success: true, message: 'Schedule updated' });
  } catch (e) {
    console.error('Update schedule error:', e);
    return NextResponse.json({ success: false, message: 'Update failed' }, { status: 500 });
  }
}

// DELETE /api/admin/schedules — delete a schedule (only if no bookings)
export async function DELETE(req: NextRequest) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const scheduleId = searchParams.get('scheduleId');
    if (!scheduleId) return NextResponse.json({ success: false, message: 'Schedule ID required' }, { status: 400 });

    const schedule = await prisma.schedule.findUnique({
      where: { schedule_id: scheduleId },
      include: { _count: { select: { bookings: true } } },
    });

    if (!schedule) return NextResponse.json({ success: false, message: 'Schedule not found' }, { status: 404 });
    if (schedule._count.bookings > 0) {
      return NextResponse.json({ success: false, message: `Cannot delete — ${schedule._count.bookings} booking(s) exist. Deactivate instead.` }, { status: 409 });
    }

    await prisma.schedule.delete({ where: { schedule_id: scheduleId } });
    return NextResponse.json({ success: true, message: 'Schedule deleted' });
  } catch (e) {
    console.error('Delete schedule error:', e);
    return NextResponse.json({ success: false, message: 'Delete failed' }, { status: 500 });
  }
}
