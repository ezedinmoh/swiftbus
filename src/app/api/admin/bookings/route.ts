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

// PATCH /api/admin/bookings — update booking status
export async function PATCH(req: NextRequest) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

  try {
    const { bookingId, status } = await req.json() as { bookingId: string; status: string };
    const valid = ['pending', 'confirmed', 'completed', 'cancelled'];
    if (!valid.includes(status)) return NextResponse.json({ success: false, message: 'Invalid status' }, { status: 400 });

    await prisma.booking.update({
      where: { booking_id: bookingId },
      data: {
        booking_status: status as any,
        ...(status === 'cancelled' ? { cancellation_date: new Date(), cancellation_reason: 'Cancelled by admin' } : {}),
      },
    });

    return NextResponse.json({ success: true, message: 'Booking updated' });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ success: false, message: 'Update failed' }, { status: 500 });
  }
}
