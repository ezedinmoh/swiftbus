import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

function err(message: string, status = 400) {
  return NextResponse.json({ success: false, message }, { status });
}

// POST /api/payment — confirm payment for a booking
export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('sb_token')?.value;
    const session = token ? verifyToken(token) : null;
    if (!session) return err('Unauthorized', 401);

    const body = await req.json();
    const { bookingId, paymentMethod } = body as { bookingId: string; paymentMethod: string };

    if (!bookingId) return err('Booking ID is required');
    if (!paymentMethod) return err('Payment method is required');

    const validMethods = ['telebirr', 'cbe', 'dashen', 'card', 'cash'];
    if (!validMethods.includes(paymentMethod)) return err('Invalid payment method');

    // Verify booking belongs to this user and is pending
    const booking = await prisma.booking.findFirst({
      where: { booking_id: bookingId, user_id: session.dbId },
    });

    if (!booking) return err('Booking not found', 404);
    if (booking.booking_status === 'cancelled') return err('This booking has been cancelled');
    if (booking.payment_status === 'paid') return err('This booking is already paid');

    // Generate a transaction reference
    const txRef = `TXN${Date.now()}${Math.floor(Math.random() * 9999)}`;

    // Update booking to confirmed + paid
    await prisma.booking.update({
      where: { booking_id: bookingId },
      data: {
        booking_status: 'confirmed',
        payment_status: 'paid',
        payment_method: paymentMethod,
        payment_reference: txRef,
      },
    });

    // Update payment record
    await prisma.payment.updateMany({
      where: { booking_id: bookingId },
      data: {
        payment_method: paymentMethod as any,
        payment_status: 'completed',
        transaction_reference: txRef,
        payment_date: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Payment successful',
      data: {
        bookingId,
        transactionRef: txRef,
        paymentMethod,
        amount: Number(booking.total_amount),
        status: 'confirmed',
      },
    });
  } catch (e) {
    console.error('Payment error:', e);
    return err('Payment processing failed. Please try again.', 500);
  }
}
