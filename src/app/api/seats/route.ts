import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET /api/seats?scheduleId=...&date=...
// Returns list of occupied seat numbers for a given schedule + date
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const scheduleId = searchParams.get('scheduleId');
    const date = searchParams.get('date');

    if (!scheduleId || !date) {
      return NextResponse.json({ success: false, message: 'scheduleId and date are required' }, { status: 400 });
    }

    const schedule = await prisma.schedule.findUnique({
      where: { schedule_id: scheduleId },
      select: { id: true, bus: { select: { total_seats: true } } },
    });

    if (!schedule) {
      return NextResponse.json({ success: false, message: 'Schedule not found' }, { status: 404 });
    }

    const travelDate = new Date(`${date}T00:00:00.000Z`);

    // Get all confirmed/pending bookings for this schedule+date
    const bookings = await prisma.booking.findMany({
      where: {
        schedule_id: schedule.id,
        travel_date: travelDate,
        booking_status: { in: ['confirmed', 'pending'] },
      },
      select: { selected_seats: true },
    });

    // Flatten all occupied seat numbers
    const occupied: number[] = [];
    for (const b of bookings) {
      if (Array.isArray(b.selected_seats)) {
        occupied.push(...(b.selected_seats as number[]));
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        occupied,
        total_seats: schedule.bus.total_seats,
        available: schedule.bus.total_seats - occupied.length,
      },
    });
  } catch (e) {
    console.error('Seats error:', e);
    return NextResponse.json({ success: false, message: 'Failed to load seat data' }, { status: 500 });
  }
}
