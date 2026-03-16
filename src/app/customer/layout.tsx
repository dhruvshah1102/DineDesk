import { ReactNode } from 'react';
import { CartProvider } from '@/components/customer/CartContext';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import CustomerHeader from '@/components/customer/CustomerHeader';

export default async function CustomerLayout({ children }: { children: ReactNode }) {
  const headerList = headers();
  const slug = headerList.get('x-cafe-slug');

  let brandColor = '#0A3161';
  let name = 'MenuFlow';

  if (slug) {
     const tenant = await prisma.tenant.findUnique({ where: { slug }, select: { primaryColor: true, name: true }});
     if (tenant && tenant.primaryColor) brandColor = tenant.primaryColor;
     if (tenant) name = tenant.name;
  }

  // Inject computed CSS variable inline safely inside a standard React flow.
  return (
    <CartProvider>
      <div 
         className="min-h-screen bg-gray-50 flex flex-col font-sans"
         style={{ '--customer-brand': brandColor } as React.CSSProperties}
      >
        <CustomerHeader slug={slug} cafeName={name} />
        <main className="flex-1 pb-24 md:pb-8 max-w-2xl w-full mx-auto p-4">
          {children}
        </main>
      </div>
    </CartProvider>
  );
}
