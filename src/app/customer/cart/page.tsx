import { prisma } from '@/lib/prisma';
import { notEmpty } from '@/lib/utils';
import { notFound } from 'next/navigation';
import CartClient from './CartClient';

export default async function CustomerCartPage({ searchParams }: { searchParams: { slug?: string } }) {
  const { headers } = await import('next/headers');
  const slugHeader = headers().get('x-cafe-slug');
  const slug = slugHeader || searchParams.slug;

  if (!slug) return notFound();

  const tenant = await prisma.tenant.findUnique({
    where: { slug: slug as string, isActive: true },
    select: { name: true, slug: true }
  });

  if (!tenant) return notFound();

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
         <div className="absolute top-0 left-0 w-1.5 h-full bg-[var(--customer-brand)]"></div>
         <h1 className="text-xl font-bold text-gray-900 ml-2">Review your order</h1>
      </div>

      <CartClient slug={tenant.slug} />
    </div>
  );
}
