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
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-5 duration-700">
      <div className="bg-slate-900 px-8 py-10 rounded-[48px] shadow-2xl shadow-slate-900/10 relative overflow-hidden group">
         {/* Decorative Gradients */}
         <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--customer-brand)] opacity-20 rounded-full blur-3xl -mr-32 -mt-32 transition-transform duration-1000 group-hover:scale-110"></div>
         <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500 opacity-10 rounded-full blur-3xl -ml-16 -mb-16"></div>
         
         <div className="relative z-10 flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center border border-white/10 backdrop-blur-sm self-center">
               <span className="text-3xl font-black text-[var(--customer-brand)] italic">T{table.tableNumber}</span>
            </div>
            <div className="space-y-1">
               <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase">{tenant.name}</h1>
               <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Digital Concierge Active</p>
            </div>
            
            <div className="flex items-center space-x-2 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20 mt-2">
               <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
               <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Order Securely from this unit</span>
            </div>
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
