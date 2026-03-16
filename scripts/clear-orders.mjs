import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearOrders() {
  console.log('Clearing orders...');
  const payments = await prisma.payment.deleteMany({});
  console.log(`Deleted ${payments.count} payment(s)`);
  const items = await prisma.orderItem.deleteMany({});
  console.log(`Deleted ${items.count} order item(s)`);
  const orders = await prisma.order.deleteMany({});
  console.log(`Deleted ${orders.count} order(s)`);
  console.log('✅ All orders cleared!');
  await prisma.$disconnect();
}

clearOrders().catch(e => { console.error(e); process.exit(1); });
