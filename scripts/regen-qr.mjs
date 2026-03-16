import { PrismaClient } from '@prisma/client';
import QRCode from 'qrcode';

const prisma = new PrismaClient();

async function regenerateQRCodes() {
  const tables = await prisma.cafeTable.findMany({
    include: { tenant: { select: { slug: true } } }
  });

  console.log(`Found ${tables.length} table(s). Regenerating QR codes...`);

  for (const table of tables) {
    const slug = table.tenant.slug;
    const url = `http://localhost:3000/table/${table.tableNumber}?cafe=${slug}`;
    
    const dataUrl = await QRCode.toDataURL(url, {
      type: 'image/png',
      width: 400,
      margin: 2,
      color: { dark: '#111827', light: '#FFFFFF' }
    });

    await prisma.cafeTable.update({
      where: { id: table.id },
      data: { qrCodeUrl: dataUrl }
    });

    console.log(`✅ Table ${table.tableNumber} (${slug}) — QR regenerated`);
  }

  console.log('Done!');
  await prisma.$disconnect();
}

regenerateQRCodes().catch(e => { console.error(e); process.exit(1); });
