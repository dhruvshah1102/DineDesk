import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { generateAndUploadQR } from '@/lib/qr';

async function getTenantId() {
  const token = cookies().get('menuflow_token')?.value;
  if (!token) return null;
  const payload = await verifyToken(token);
  return payload?.role === 'owner' ? payload.tenantId as string : null;
}

export async function GET() {
  try {
    const tenantId = await getTenantId();
    if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const tables = await prisma.cafeTable.findMany({
      where: { tenantId },
      orderBy: { tableNumber: 'asc' },
    });

    return NextResponse.json(tables);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const tenantId = await getTenantId();
    if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { tableNumber } = await req.json();
    if (isNaN(tableNumber)) return NextResponse.json({ error: 'Invalid table number' }, { status: 400 });

    const num = parseInt(tableNumber);

    const existing = await prisma.cafeTable.findFirst({
      where: { tenantId, tableNumber: num }
    });

    if (existing) {
      return NextResponse.json({ error: 'Table number already exists' }, { status: 400 });
    }

    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });

    const table = await prisma.cafeTable.create({
      data: {
        tenantId,
        tableNumber: num,
        isActive: true,
      }
    });

    // Fire and forget QR creation
    try {
      const qrUrl = await generateAndUploadQR(tenantId, tenant!.slug, num);
      await prisma.cafeTable.update({
        where: { id: table.id },
        data: { qrCodeUrl: qrUrl }
      });
      table.qrCodeUrl = qrUrl;
    } catch(e) {
      console.error('Failed to attach QR to new table:', e);
    }

    return NextResponse.json(table);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
