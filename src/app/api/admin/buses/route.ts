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

function generateBusId(): string {
  return `BUS${new Date().getFullYear()}${String(Math.floor(Math.random() * 99999)).padStart(5, '0')}`;
}

// POST /api/admin/buses — add a new bus
export async function POST(req: NextRequest) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

  try {
    const { companyId, busNumber, busType, totalSeats, licensePlate, model } =
      await req.json() as { companyId: string; busNumber: string; busType: string; totalSeats: string; licensePlate?: string; model?: string };

    if (!companyId) return NextResponse.json({ success: false, message: 'Company is required' }, { status: 400 });
    if (!busNumber?.trim()) return NextResponse.json({ success: false, message: 'Bus number is required' }, { status: 400 });

    // Map hyphenated form values to Prisma enum values
    const busTypeMap: Record<string, string> = {
      'standard-ac': 'standard_ac',
      'premium-ac': 'premium_ac',
    };
    const mappedBusType = busTypeMap[busType] ?? busType;
    const validBusTypes = ['economy', 'standard', 'standard_ac', 'premium_ac', 'luxury'];
    if (!validBusTypes.includes(mappedBusType)) {
      return NextResponse.json({ success: false, message: 'Invalid bus type' }, { status: 400 });
    }

    const company = await prisma.busCompany.findUnique({ where: { company_id: companyId } });
    if (!company) return NextResponse.json({ success: false, message: 'Company not found' }, { status: 404 });

    const bus = await prisma.bus.create({
      data: {
        bus_id: generateBusId(),
        company_id: company.id,
        bus_number: busNumber.trim(),
        bus_type: mappedBusType as any,
        total_seats: Number(totalSeats) || 45,
        license_plate: licensePlate?.trim() || null,
        model: model?.trim() || null,
        status: 'active',
      },
    });

    return NextResponse.json({ success: true, message: 'Bus added successfully', data: { busId: bus.bus_id } });
  } catch (e: any) {
    console.error(e);
    if (e.code === 'P2002') return NextResponse.json({ success: false, message: 'License plate already exists' }, { status: 409 });
    return NextResponse.json({ success: false, message: 'Failed to add bus' }, { status: 500 });
  }
}

// PATCH /api/admin/buses — update bus status
export async function PATCH(req: NextRequest) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

  try {
    const { busId, status } = await req.json() as { busId: string; status: string };
    const valid = ['active', 'maintenance', 'inactive'];
    if (!valid.includes(status)) return NextResponse.json({ success: false, message: 'Invalid status' }, { status: 400 });

    await prisma.bus.update({ where: { bus_id: busId }, data: { status: status as any } });
    return NextResponse.json({ success: true, message: 'Bus status updated' });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ success: false, message: 'Update failed' }, { status: 500 });
  }
}
