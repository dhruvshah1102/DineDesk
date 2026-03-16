import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { getServiceSupabase } from '@/lib/supabase';

async function getTenantId() {
  const token = cookies().get('menuflow_token')?.value;
  if (!token) return null;
  const payload = await verifyToken(token);
  return payload?.role === 'owner' ? payload.tenantId as string : null;
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const tenantId = await getTenantId();
    if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const formData = await req.formData();
    const name = formData.get('name') as string;
    const categoryId = formData.get('categoryId') as string;
    const price = parseFloat(formData.get('price') as string);
    const description = formData.get('description') as string | null;
    const sortOrder = parseInt(formData.get('sortOrder') as string) || 0;
    const isAvailable = formData.get('isAvailable') === 'true';
    const isVeg = formData.get('isVeg') === 'true';
    const image = formData.get('image') as File | null;
    const existingImageUrl = formData.get('existingImageUrl') as string | null;

    if (!name || !categoryId || isNaN(price)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let imageUrl = existingImageUrl;

    if (image && image.size > 0) {
      const supabase = getServiceSupabase();
      const ext = image.name.split('.').pop();
      const filename = `${tenantId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
      
      const buffer = Buffer.from(await image.arrayBuffer());
      
      const { data, error } = await supabase.storage
        .from('menu-images')
        .upload(filename, buffer, { contentType: image.type, upsert: true });

      if (!error) {
        const { data: publicUrlData } = supabase.storage.from('menu-images').getPublicUrl(filename);
        imageUrl = publicUrlData.publicUrl;
      }
    }

    const menuItem = await prisma.menuItem.updateMany({
      where: { id: params.id, tenantId },
      data: {
        categoryId,
        name,
        description,
        price,
        imageUrl,
        isAvailable,
        isVeg,
        sortOrder,
      }
    });

    if (menuItem.count === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const tenantId = await getTenantId();
    if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const result = await prisma.menuItem.deleteMany({
      where: { id: params.id, tenantId },
    });

    if (result.count === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
