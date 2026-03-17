import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');
    const tableNumber = searchParams.get('table');

    if (!slug || !tableNumber) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const tenant = await prisma.tenant.findUnique({ where: { slug } });
    if (!tenant) return NextResponse.json({ error: 'Cafe not found' }, { status: 404 });

    const orders = await prisma.order.findMany({
      where: {
        tenantId: tenant.id,
        tableNumber: parseInt(tableNumber, 10),
        paymentStatus: 'pending' // Only fetch unpaid orders for billing
      },
      include: {
        orderItems: true
      },
      orderBy: { placedAt: 'desc' }
    });

    return NextResponse.json(orders);
  } catch (err) {
    console.error('Fetch table orders error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
