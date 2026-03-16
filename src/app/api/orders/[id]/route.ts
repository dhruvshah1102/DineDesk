import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// CUSTOMER/POLLER: GET Order status by ID
// Anyone with the specific GUID can poll this to track their food
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      select: { status: true, paymentStatus: true }
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (err) {
    console.error('Fetch order error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
