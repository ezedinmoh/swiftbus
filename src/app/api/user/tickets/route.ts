import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('sb_token')?.value;
    const session = token ? verifyToken(token) : null;
    if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status'); // 'upcoming' | 'past' | null (all)
    const page = Math.max(1, Number(searchParams.get('page') ?? '1'));
    const limit = 10;

    const where: Record<string, unknown> = { user_id: session.dbId };
    if (status === 'upcoming') {
      where.travel_date = { gte: new Date() };
      where.booking_status = { in: ['confirmed', 'pending'] };
    } else if (status === 'past') {
      where.OR = [
        { travel_date: { lt: new Date() } },
        { booking_status: { in: ['completed', 'cancelled'] } },
      ];
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        orderBy: { booking_date: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.booking.count({ where }),
    ]);

    const formatted = bookings.map((b) => ({
      id: b.booking_id,
      from: b.from_city,
      to: b.to_city,
      date: b.travel_date,
      departureTime: b.departure_time,
      busCompany: b.bus_company,
      busType: b.bus_type,
      seats: b.selected_seats,
      passengers: b.passenger_count,
      amount: Number(b.total_amount),
      status: b.booking_status,
      paymentStatus: b.payment_status,
      bookedAt: b.booking_date,
    }));

    return NextResponse.json({
      success: true,
      data: { bookings: formatted, total, page, pages: Math.ceil(total / limit) },
    });
  } catch (e) {
    console.error('Tickets error:', e);
    return NextResponse.json({ success: false, message: 'Failed to load tickets' }, { status: 500 });
  }
}
