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

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const tenantId = await getTenantId();
    if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { isAvailable } = await req.json();

    const result = await prisma.menuItem.updateMany({
      where: { id: params.id, tenantId },
      data: { isAvailable },
    });

    if (result.count === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
