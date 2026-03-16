import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import TablesClient from './TablesClient';

export default async function TablesPage() {
  const token = cookies().get('menuflow_token')?.value;
  if (!token) redirect('/login');
  
  const payload = await verifyToken(token);
  if (!payload || !payload.tenantId) redirect('/login');

  const tenantId = payload.tenantId as string;

  const tables = await prisma.cafeTable.findMany({
    where: { tenantId },
    orderBy: { tableNumber: 'asc' },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Tables & QR Codes</h1>
        <p className="text-gray-500 mt-1">Manage physical tables, print QR codes, and connect customers to your digital menu.</p>
      </div>

      <TablesClient initialTables={tables} />
    </div>
  );
}
