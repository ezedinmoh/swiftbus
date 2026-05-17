import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('sb_token')?.value;
    const session = token ? verifyToken(token) : null;
    if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const [total, upcoming, completed, totalSpentAgg] = await Promise.all([
      prisma.booking.count({ where: { user_id: session.dbId } }),
      prisma.booking.count({
        where: {
          user_id: session.dbId,
          booking_status: 'confirmed',
          travel_date: { gte: new Date() },
        },
      }),
      prisma.booking.count({
        where: { user_id: session.dbId, booking_status: 'completed' },
      }),
      prisma.booking.aggregate({
        where: { user_id: session.dbId, payment_status: 'paid' },
        _sum: { total_amount: true },
      }),
    ]);

    const totalSpent = totalSpentAgg._sum.total_amount
      ? Number(totalSpentAgg._sum.total_amount)
      : 0;

    return NextResponse.json({
      success: true,
      data: { total_bookings: total, upcoming_trips: upcoming, completed_trips: completed, total_spent: totalSpent },
    });
  } catch (e) {
    console.error('Stats error:', e);
    return NextResponse.json({ success: false, message: 'Failed to load stats' }, { status: 500 });
  }
}
