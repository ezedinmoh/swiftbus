import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { Prisma } from '@prisma/client';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

function err(message: string, status = 400) {
  return NextResponse.json({ success: false, message }, { status });
}

function generateBookingId(): string {
  const year = new Date().getFullYear();
  const rand = String(Math.floor(Math.random() * 999999)).padStart(6, '0');
  return `SB${year}${rand}`;
}

// POST /api/booking — create a new booking
export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('sb_token')?.value;
    const session = token ? verifyToken(token) : null;
    if (!session) return err('Please log in to book a ticket', 401);

    const body = await req.json();
    const {
      scheduleId,
      travelDate,
      selectedSeats,
      passengers,       // array of { name, gender }
      contactEmail,
      contactPhone,
      totalAmount,
    } = body as {
      scheduleId: string;
      travelDate: string;
      selectedSeats: number[];
      passengers: { name: string; gender: string }[];
      contactEmail: string;
      contactPhone: string;
      totalAmount: number;
    };

    // Validate inputs
    if (!scheduleId) return err('Schedule ID is required');
    if (!travelDate) return err('Travel date is required');
    if (!selectedSeats?.length) return err('Please select at least one seat');
    if (!passengers?.length) return err('Passenger details are required');
    if (passengers.some(p => !p.name?.trim())) return err('All passenger names are required');

    // Fetch schedule with bus and route info from Prisma
    const schedule = await prisma.schedule.findUnique({
      where: { schedule_id: scheduleId },
      include: {
        bus: { include: { company: true } },
        route: {
          include: {
            origin_city: true,
            destination_city: true,
          },
        },
      },
    });

    if (!schedule || !schedule.is_active) return err('Schedule not found or unavailable', 404);

    const travelDateObj = new Date(`${travelDate}T00:00:00.000Z`);

    // Check seat availability — look for ALL conflicting confirmed/pending bookings
    const existingBookings = await prisma.booking.findMany({
      where: {
        schedule_id: schedule.id,
        travel_date: travelDateObj,
        booking_status: { in: ['confirmed', 'pending'] },
        selected_seats: { not: Prisma.DbNull },
      },
      select: { selected_seats: true },
    });

    const takenSeats = existingBookings.flatMap(b => (b.selected_seats as number[]) ?? []);
    const overlap = selectedSeats.filter(s => takenSeats.includes(s));
    if (overlap.length > 0) {
      return err(`Seats ${overlap.join(', ')} are already booked. Please choose different seats.`, 409);
    }

    // Calculate total: price × seats + 10% tax + ETB 25 service fee
    const pricePerSeat = Number(schedule.price);
    const baseFare = pricePerSeat * selectedSeats.length;
    const tax = baseFare * 0.10;
    const serviceFee = 25;
    const calculatedTotal = Math.round((baseFare + tax + serviceFee) * 100) / 100;

    const depTime = schedule.departure_time;
    const depTimeStr = `${String(depTime.getUTCHours()).padStart(2, '0')}:${String(depTime.getUTCMinutes()).padStart(2, '0')}`;

    const bookingId = generateBookingId();

    const booking = await prisma.booking.create({
      data: {
        booking_id: bookingId,
        user_id: session.dbId,
        schedule_id: schedule.id,
        bus_company: schedule.bus.company.name,
        bus_type: schedule.bus.bus_type,
        from_city: schedule.route.origin_city.name,
        to_city: schedule.route.destination_city.name,
        travel_date: travelDateObj,
        departure_time: depTimeStr,
        passenger_count: selectedSeats.length,
        selected_seats: selectedSeats,
        passenger_details: passengers.map((p, i) => ({
          seat: selectedSeats[i],
          name: p.name.trim(),
          gender: p.gender,
        })),
        total_amount: calculatedTotal,
        booking_status: 'pending',
        payment_status: 'pending',
        special_requirements: contactPhone ? `Contact: ${contactPhone}` : null,
      },
    });

    // Create a pending payment record
    const paymentId = `PAY${new Date().getFullYear()}${String(Math.floor(Math.random() * 999999)).padStart(6, '0')}`;
    await prisma.payment.create({
      data: {
        payment_id: paymentId,
        booking_id: bookingId,
        passenger_name: passengers[0]?.name ?? null,
        passenger_email: contactEmail ?? null,
        amount: calculatedTotal,
        payment_method: 'telebirr', // default, updated on payment
        payment_status: 'pending',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Booking created successfully',
      data: {
        bookingId: booking.booking_id,
        from: booking.from_city,
        to: booking.to_city,
        date: travelDate,
        departureTime: depTimeStr,
        busCompany: booking.bus_company,
        busType: booking.bus_type,
        seats: selectedSeats,
        passengers: selectedSeats.length,
        totalAmount: calculatedTotal,
        paymentId,
      },
    });
  } catch (e) {
    console.error('Booking error:', e);
    return err('Booking failed. Please try again.', 500);
  }
}
