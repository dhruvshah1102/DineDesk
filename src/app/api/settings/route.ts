import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

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

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: {
         name: true,
         email: true,
         phone: true,
         address: true,
         themeColor: true,
         logoUrl: true
      }
    });

    return NextResponse.json(tenant);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const tenantId = await getTenantId();
    if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const data = await req.json();

    const allowedUpdates = {
       name: data.name,
       phone: data.phone,
       address: data.address,
       themeColor: data.themeColor
    };

    const tenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: allowedUpdates
    });

    return NextResponse.json({ success: true, tenant });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
