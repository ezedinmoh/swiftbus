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

function generateRouteId(): string {
  return `RT${new Date().getFullYear()}${String(Math.floor(Math.random() * 99999)).padStart(5, '0')}`;
}

export async function POST(req: NextRequest) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

  try {
    const { originCode, destinationCode, distanceKm, durationHours, basePrice } =
      await req.json() as { originCode: string; destinationCode: string; distanceKm?: string; durationHours?: string; basePrice: string };

    if (!originCode || !destinationCode) return NextResponse.json({ success: false, message: 'Origin and destination are required' }, { status: 400 });
    if (!basePrice) return NextResponse.json({ success: false, message: 'Base price is required' }, { status: 400 });

    const [origin, destination] = await Promise.all([
      prisma.city.findUnique({ where: { city_code: originCode } }),
      prisma.city.findUnique({ where: { city_code: destinationCode } }),
    ]);

    if (!origin) return NextResponse.json({ success: false, message: 'Origin city not found' }, { status: 404 });
    if (!destination) return NextResponse.json({ success: false, message: 'Destination city not found' }, { status: 404 });

    const route = await prisma.route.create({
      data: {
        route_id: generateRouteId(),
        origin_city_id: origin.id,
        destination_city_id: destination.id,
        distance_km: distanceKm ? Number(distanceKm) : null,
        estimated_duration_hours: durationHours ? Number(durationHours) : null,
        base_price: Number(basePrice),
        is_active: true,
      },
    });

    return NextResponse.json({ success: true, message: 'Route added', data: { routeId: route.route_id } });
  } catch (e: any) {
    console.error(e);
    if (e.code === 'P2002') return NextResponse.json({ success: false, message: 'This route already exists' }, { status: 409 });
    return NextResponse.json({ success: false, message: 'Failed to add route' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

  try {
    const { routeId, isActive } = await req.json() as { routeId: string; isActive: boolean };
    await prisma.route.update({ where: { route_id: routeId }, data: { is_active: isActive } });
    return NextResponse.json({ success: true, message: 'Route updated' });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ success: false, message: 'Update failed' }, { status: 500 });
  }
}
