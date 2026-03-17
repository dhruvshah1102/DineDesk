'use client';

import { ShoppingBag, ChevronLeft } from 'lucide-react';
import { useCart } from './CartContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function CustomerHeader({ slug, cafeName }: { slug: string | null, cafeName: string }) {
  const { itemCount, subtotal } = useCart();
  const pathname = usePathname();
  const isHome = pathname === '/' || pathname?.includes('/table/');

  return (
    <header className="sticky top-0 z-[100] bg-slate-950/95 backdrop-blur-xl text-white shadow-2xl shadow-black/20 border-b border-white/5">
       <div className="max-w-2xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3 truncate">
            {!isHome && (
              <button onClick={() => window.history.back()} className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors">
                <ChevronLeft size={20} />
              </button>
            )}
            <Link href={`/`} className="group flex flex-col">
               <span className="font-black text-lg tracking-tighter leading-none group-active:scale-95 transition-transform truncate max-w-[180px]">
                 {cafeName.toUpperCase()}
               </span>
               <span className="text-[10px] font-black opacity-60 tracking-[0.2em] mt-0.5 uppercase">Digital Menu</span>
            </Link>
          </div>

          <Link 
            href={`/cart${slug ? `?cafe=${slug}` : ''}`} 
            className="group flex items-center space-x-3 bg-white/20 px-4 py-2 rounded-2xl hover:bg-white transition-all hover:text-[var(--customer-brand)] relative active:scale-95 shadow-sm border border-white/10"
          >
             <div className="relative">
                <ShoppingBag size={20} className="group-hover:scale-110 transition-transform" />
                {itemCount > 0 && (
                   <div className="absolute -top-1.5 -right-1.5 bg-white text-[var(--customer-brand)] text-[9px] font-black h-4 w-4 rounded-full flex items-center justify-center shadow-lg animate-in zoom-in group-hover:bg-[var(--customer-brand)] group-hover:text-white transition-colors">
                     {itemCount}
                   </div>
                )}
             </div>
             <div className="flex flex-col items-start leading-tight">
                <span className="text-[9px] font-black opacity-70 uppercase tracking-tighter">My Cart</span>
                <span className="text-sm font-black">₹{subtotal.toFixed(0)}</span>
             </div>
          </Link>
       </div>
    </header>
  );
}
