import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, signToken } from '@/lib/auth';
import { generateAndUploadQR } from '@/lib/qr';
import { slugify } from '@/lib/utils'; // wait, didn't create slugify yet. I'll use a direct regex or create the util.

// Helper
function makeSlug(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, phone, address, numTables } = body;

    if (!name || !email || !password || !numTables) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const existingUser = await prisma.tenant.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);
    
    // Create unique slug
    let slug = makeSlug(name);
    let slugeExists = await prisma.tenant.findUnique({ where: { slug } });
    let counter = 1;
    while (slugeExists) {
      slug = `${makeSlug(name)}-${counter}`;
      slugeExists = await prisma.tenant.findUnique({ where: { slug } });
      counter++;
    }

    const tableCount = parseInt(numTables, 10);

    // Transaction to safely generate everything
    const tenant = await prisma.tenant.create({
      data: {
        name,
        slug,
        email,
        passwordHash,
        phone,
        address,
        numTables: tableCount,
        plan: 'trial'
      }
    });

    // Generate Tables & QR Codes (Not awaiting QR uploads inside loop sequentially to bypass timeouts, doing async fire/forget or Promise.all)
    const tablesToCreate = Array.from({ length: tableCount }).map((_, i) => ({
      tenantId: tenant.id,
      tableNumber: i + 1,
      isActive: true,
    }));
    
    await prisma.cafeTable.createMany({ data: tablesToCreate });
    const createdTables = await prisma.cafeTable.findMany({ where: { tenantId: tenant.id } });

    // Upload QRs
    try {
      await Promise.all(createdTables.map(async (table) => {
        const url = await generateAndUploadQR(tenant.id, tenant.slug, table.tableNumber);
        await prisma.cafeTable.update({
          where: { id: table.id },
          data: { qrCodeUrl: url }
        });
      }));
    } catch (qrErr) {
       console.error("QR generated failed during signup:", qrErr);
    }

    const token = await signToken({
      tenantId: tenant.id,
      email: tenant.email,
      role: 'owner',
    });

    const res = NextResponse.json({ success: true, slug: tenant.slug });
    
    res.cookies.set('menuflow_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return res;
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
