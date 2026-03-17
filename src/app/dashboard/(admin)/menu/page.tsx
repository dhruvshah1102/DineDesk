import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import MenuManagerClient from '@/components/dashboard/MenuManagerClient';

export default async function MenuPage() {
  const token = cookies().get('menuflow_token')?.value;
  if (!token) redirect('/login');
  
  const payload = await verifyToken(token);
  if (!payload || !payload.tenantId) redirect('/login');

  const tenantId = payload.tenantId as string;

  const [categories, menuItems] = await Promise.all([
    prisma.category.findMany({
      where: { tenantId },
      orderBy: { sortOrder: 'asc' },
    }),
    prisma.menuItem.findMany({
      where: { tenantId },
      orderBy: { sortOrder: 'asc' },
    })
  ]);

  // Serialize Decimal to Number for React Client Components
  const serializedItems = menuItems.map(item => ({
    ...item,
    price: Number(item.price)
  }));

  return (
    <div className="h-full flex flex-col space-y-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Menu Manager</h1>
        <p className="text-gray-500 mt-1">Organize categories and upload menu items with ease.</p>
      </div>

      <div className="flex-1 overflow-hidden bg-white shadow-sm rounded-lg border border-gray-200">
        <MenuManagerClient initialCategories={categories} initialItems={serializedItems} />
      </div>
    </div>
  );
}
