import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import CustomerMenuClient from './CustomerMenuClient';

export default async function CustomerTablePage({ params, searchParams }: { params: { tableNumber: string }, searchParams: { slug?: string } }) {
  // If slug is somehow not in searchParams, middleware usually would rewrite, but we can also check headers natively if we strictly need to.
  // We'll read x-cafe-slug via headers in server component securely to allow fallback localhost params ?cafe=slug
  
  const { headers } = await import('next/headers');
  const slugHeader = headers().get('x-cafe-slug');
  const querySlug = searchParams.slug;
  const slug = slugHeader || querySlug;

  if (!slug) return notFound();

  const tenant = await prisma.tenant.findUnique({
    where: { slug: slug as string, isActive: true },
    include: {
       categories: {
          orderBy: { sortOrder: 'asc' }
       },
       menuItems: {
          where: { isAvailable: true },
          orderBy: { sortOrder: 'asc' }
       }
    }
  });

  if (!tenant) return notFound();

  const tableNumStr = params.tableNumber;

  // Validate table
  const table = await prisma.cafeTable.findFirst({
    where: { tenantId: tenant.id, tableNumber: parseInt(tableNumStr, 10), isActive: true }
  });

  if (!table) return (
     <div className="flex flex-col items-center justify-center p-8 text-center h-[50vh]">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Table Not Found</h1>
        <p className="text-gray-500">This QR code or link appears to be invalid or deactivated.</p>
     </div>
  );

  // Group items by category to maintain structure cleanly
  const groupedMenu = tenant.categories.map((cat: any) => ({
     id: cat.id,
     name: cat.name,
     items: tenant.menuItems.filter((item: any) => item.categoryId === cat.id).map((i: any) => ({
         id: i.id,
         name: i.name,
         description: i.description,
         price: Number(i.price),
         imageUrl: i.imageUrl,
         isVeg: i.isVeg
     }))
  })).filter((g: any) => g.items.length > 0); // Don't show empty categories

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center relative overflow-hidden">
         <div className="absolute top-0 left-0 w-1.5 h-full bg-[var(--customer-brand)]"></div>
         <div className="pl-2">
            <h1 className="text-xl font-bold text-gray-900">Welcome to {tenant.name}</h1>
            <p className="text-sm text-gray-500">You are browsing the digital menu.</p>
         </div>
         <div className="text-center rounded-lg bg-gray-50 px-4 py-2 border border-gray-100">
            <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Table</span>
            <span className="block text-2xl font-black text-[var(--customer-brand)]">{table.tableNumber}</span>
         </div>
      </div>

      <CustomerMenuClient 
         groupedMenu={groupedMenu} 
         tableNumber={table.tableNumber.toString()} 
         slug={tenant.slug} 
      />
    </div>
  );
}
