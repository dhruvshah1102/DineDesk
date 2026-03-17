import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';
import BillClient from './BillClient';
import { redirect } from 'next/navigation';

export default async function BillPage() {
  const headerList = headers();
  const slug = headerList.get('x-cafe-slug');
  const tableRaw = headerList.get('x-cafe-table'); // Note: x-cafe-table should be provided by middleware or URL. Wait, middleware currently only adds slug.

  if (!slug) redirect('/');

  // Middleware currently only handles x-cafe-slug.
  // In the customer layout, I determine slug from header.
  // For bill, I need to know which table. I'll read from sub-params or cookies if needed.
  // Actually, since I have tableNumber in local storage, I'll pass that in the client or fetch it in the client.
  // For SSR, I'll check if I can get some initial orders for 'the latest table the user was at' via any browser-side hints like a cookie.
  
  // For now, I'll return an empty list and let BillClient fetch it via useEffect or just use SSR if I can pass table Number.
  // Let's check for a 'menuflow_table' cookie. Since I don't have one, I'll fetch in BillClient.

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <BillClient initialOrders={[]} />
    </div>
  );
}
