import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { slug, tableNumber, items, customerName, notes } = await req.json();

    if (!slug || !tableNumber || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Invalid order structure' }, { status: 400 });
    }

    const tenant = await prisma.tenant.findUnique({ where: { slug } });
    if (!tenant) return NextResponse.json({ error: 'Cafe not found' }, { status: 404 });

    const table = await prisma.cafeTable.findFirst({ where: { tenantId: tenant.id, tableNumber: tableNumber } });
    if (!table) return NextResponse.json({ error: 'Table not found' }, { status: 404 });

    let subtotal = 0;
    const orderItemsData = [];

    // Snapshot prices
    for (const item of items) {
       const menuItem = await prisma.menuItem.findUnique({ where: { id: item.menuItemId } });
       if (!menuItem || menuItem.tenantId !== tenant.id) continue;

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
        },
      }
    });

    // Mark table as occupied
    await prisma.cafeTable.update({
      where: { id: table.id },
      data: { isOccupied: true }
    });

    return NextResponse.json({ orderId: order.id });

  } catch (err) {
    console.error('Create order error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
