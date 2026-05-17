import { prisma } from '@/lib/prisma';
import AdminBusesClient from './AdminBusesClient';

export default async function AdminBusesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; status?: string }>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? '1'));
  const q = sp.q ?? '';
  const status = sp.status ?? '';
  const limit = 15;

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (q) {
    where.OR = [
      { bus_number: { contains: q } },
      { license_plate: { contains: q } },
      { model: { contains: q } },
      { company: { name: { contains: q } } },
    ];
  }

  const [buses, total, companies] = await Promise.all([
    prisma.bus.findMany({
      where,
      orderBy: { created_at: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: { company: { select: { name: true } }, _count: { select: { schedules: true } } },
    }),
    prisma.bus.count({ where }),
    prisma.busCompany.findMany({ where: { is_active: true }, select: { id: true, name: true, company_id: true }, orderBy: { name: 'asc' } }),
  ]);

  const formatted = buses.map(b => ({
    id: b.bus_id,
    dbId: b.id,
    number: b.bus_number,
    company: b.company.name,
    type: b.bus_type,
    totalSeats: b.total_seats,
    status: b.status,
    licensePlate: b.license_plate ?? '—',
    model: b.model ?? '—',
    scheduleCount: b._count.schedules,
  }));

  return (
    <AdminBusesClient
      buses={formatted}
      companies={companies}
      total={total}
      page={page}
      pages={Math.ceil(total / limit)}
      currentQ={q}
      currentStatus={status}
    />
  );
}
