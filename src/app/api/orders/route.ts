import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

// OWNER: GET Orders list
export async function GET(req: Request) {
  try {
    const token = cookies().get('menuflow_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload || payload.role !== 'owner') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = payload.tenantId as string;
    
    const { searchParams } = new URL(req.url);
    const dateFilter = searchParams.get('date');
    
    let whereClause: any = { 
      tenantId, 
      status: { in: ['new', 'preparing', 'ready'] },
      paymentStatus: 'paid'
    };

    if (dateFilter === 'today') {
       const today = new Date();
       today.setHours(0, 0, 0, 0);
       whereClause.placedAt = { gte: today };
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        orderItems: true
      },
      orderBy: { placedAt: 'asc' }
    });

    return NextResponse.json(orders);
  } catch (err) {
    console.error('Fetch orders error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// CUSTOMER: POST create Order
export async function POST(req: Request) {
  try {
    const { slug, tableId, items, customerName, notes } = await req.json();

    if (!slug || !tableId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Invalid order structure' }, { status: 400 });
    }

    const tenant = await prisma.tenant.findUnique({ where: { slug } });
    if (!tenant) return NextResponse.json({ error: 'Cafe not found' }, { status: 404 });

    const table = await prisma.cafeTable.findUnique({ where: { id: tableId } });
    if (!table) return NextResponse.json({ error: 'Table not found' }, { status: 404 });

    let subtotal = 0;
    const orderItemsData = [];

    // Snapshot prices and calculate subtotal securely based on latest DB prices
    for (const item of items) {
       const menuItem = await prisma.menuItem.findUnique({ where: { id: item.menuItemId } });
       if (!menuItem) continue;

       const price = Number(menuItem.price);
       const lineTotal = price * item.quantity;
       subtotal += lineTotal;

       orderItemsData.push({
         menuItemId: menuItem.id,
         name: menuItem.name,
         price: price,
         quantity: item.quantity,
         lineTotal: lineTotal
       });
    }

    if (orderItemsData.length === 0) {
      return NextResponse.json({ error: 'No valid items in order' }, { status: 400 });
    }

    const taxAmount = subtotal * 0.05; // 5% GST
    const totalAmount = subtotal + taxAmount;

    const order = await prisma.order.create({
      data: {
        tenantId: tenant.id,
        tableId: table.id,
        tableNumber: table.tableNumber,
        status: 'new',
        paymentStatus: 'pending',
        subtotal,
        taxAmount,
        totalAmount,
        customerName,
        notes,
        orderItems: {
          create: orderItemsData
        }
      }
    });

    // Mark table as occupied
    await prisma.cafeTable.update({
      where: { id: tableId },
      data: { isOccupied: true }
    });

    return NextResponse.json({ orderId: order.id });

  } catch (err) {
    console.error('Create order error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
