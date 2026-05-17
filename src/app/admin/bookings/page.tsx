import { prisma } from '@/lib/prisma';
import AdminBookingsClient from './AdminBookingsClient';

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? '1'));
  const status = sp.status ?? '';
  const q = sp.q ?? '';
  const limit = 15;

  const where: Record<string, unknown> = {};
  if (status) where.booking_status = status;
  if (q) {
    where.OR = [
      { booking_id: { contains: q } },
      { from_city: { contains: q } },
      { to_city: { contains: q } },
      { bus_company: { contains: q } },
      { user: { full_name: { contains: q } } },
    ];
  }

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      orderBy: { booking_date: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: { user: { select: { full_name: true, email: true } } },
    }),
    prisma.booking.count({ where }),
  ]);

  const formatted = bookings.map(b => ({
    id: b.booking_id,
    user: { name: b.user.full_name, email: b.user.email },
    from: b.from_city,
    to: b.to_city,
    date: b.travel_date.toISOString(),
    company: b.bus_company,
    passengers: b.passenger_count,
    amount: Number(b.total_amount),
    status: b.booking_status,
    paymentStatus: b.payment_status,
    bookedAt: b.booking_date.toISOString(),
  }));

  return (
    <AdminBookingsClient
      bookings={formatted}
      total={total}
      page={page}
      pages={Math.ceil(total / limit)}
      currentStatus={status}
      currentQ={q}
    />
  );
}
