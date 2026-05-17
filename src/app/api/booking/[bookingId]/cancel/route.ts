import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(
  _req: NextRequest,
  ctx: { params: Promise<{ bookingId: string }> }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('sb_token')?.value;
    const session = token ? verifyToken(token) : null;
    if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const { bookingId } = await ctx.params;

    const booking = await prisma.booking.findFirst({
      where: { booking_id: bookingId, user_id: session.dbId },
    });

    if (!booking) {
      return NextResponse.json({ success: false, message: 'Booking not found' }, { status: 404 });
    }

    if (!['confirmed', 'pending'].includes(booking.booking_status)) {
      return NextResponse.json({ success: false, message: 'This booking cannot be cancelled' }, { status: 400 });
    }

    // Check if travel date is in the future (can only cancel future trips)
    const now = new Date();
    if (booking.travel_date <= now) {
      return NextResponse.json({ success: false, message: 'Cannot cancel a past or ongoing trip' }, { status: 400 });
    }

    await prisma.booking.update({
      where: { booking_id: bookingId },
      data: {
        booking_status: 'cancelled',
        cancellation_date: new Date(),
        cancellation_reason: 'Cancelled by user',
      },
    });

    // If payment was made, mark for refund
    if (booking.payment_status === 'paid') {
      await prisma.payment.updateMany({
        where: { booking_id: bookingId },
        data: { payment_status: 'refunded', refund_date: new Date(), refund_amount: booking.total_amount },
      });
    }

    return NextResponse.json({ success: true, message: 'Booking cancelled successfully' });
  } catch (e) {
    console.error('Cancel booking error:', e);
    return NextResponse.json({ success: false, message: 'Cancellation failed' }, { status: 500 });
  }
}
