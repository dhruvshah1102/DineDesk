'use client';

import { ShoppingBag } from 'lucide-react';
import { useCart } from './CartContext';
import Link from 'next/link';

export default function CustomerHeader({ slug, cafeName }: { slug: string | null, cafeName: string }) {
  const { itemCount, subtotal } = useCart();

  return (
    <header className="sticky top-0 z-50 bg-[var(--customer-brand)] text-white shadow-md">
       <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href={`/`} className="font-bold text-lg tracking-tight truncate max-w-[200px]">
             {cafeName}
          </Link>

          <Link href={`/cart${slug ? `?cafe=${slug}` : ''}`} className="flex items-center space-x-2 bg-black/20 px-3 py-1.5 rounded-full hover:bg-black/30 transition-colors relative">
             <ShoppingBag size={18} />
             <span className="text-sm font-medium">₹{subtotal.toFixed(2)}</span>
             {itemCount > 0 && (
                <div className="absolute -top-1 -right-1 bg-white text-[var(--customer-brand)] text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                  {itemCount}
                </div>
             )}
          </Link>
       </div>
    </header>
  );
}
