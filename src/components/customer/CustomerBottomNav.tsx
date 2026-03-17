'use client';

import { ShoppingBag, UtensilsCrossed, Search, CreditCard } from 'lucide-react';
import { useCart } from './CartContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function CustomerBottomNav({ slug }: { slug: string | null }) {
  const { itemCount, subtotal, tableNumber } = useCart();
  const pathname = usePathname();

  const navItems = [
    { 
       label: 'Menu', 
       icon: UtensilsCrossed, 
       href: `/table/${tableNumber || '1'}${slug ? `?cafe=${slug}` : ''}`,
       active: pathname?.includes('/table/')
    },
    { 
       label: 'Search', 
       icon: Search, 
       href: '#', // For now, maybe just keep existing search button or trigger it
       active: false
    },
    { 
       label: 'Cart', 
       icon: ShoppingBag, 
       href: `/cart${slug ? `?cafe=${slug}` : ''}`,
       active: pathname?.includes('/cart'),
       badge: itemCount > 0 ? itemCount : null
    },
    { 
       label: 'My Bill', 
       icon: CreditCard, 
       href: `/bill${slug ? `?cafe=${slug}` : ''}`,
       active: pathname?.includes('/bill')
    }
  ];

  // Hide on payment page as it's a focus-mode page
  if (pathname?.includes('/payment/')) {
    return null;
  }

  return (
    <div className="fixed bottom-6 inset-x-4 z-[100] md:hidden">
       <div className="bg-slate-900/95 backdrop-blur-xl rounded-[32px] border border-white/10 shadow-2xl shadow-black/40 px-3 py-2 flex items-center justify-between">
          {navItems.map((item, idx) => {
             const Icon = item.icon;
             return (
                <Link 
                  key={idx} 
                  href={item.href}
                  className={`relative flex flex-col items-center justify-center flex-1 h-14 rounded-2xl transition-all duration-300 ${
                    item.active 
                    ? 'text-brand scale-110' 
                    : 'text-slate-400 hover:text-white'
                  }`}
                >
                   <div className="relative">
                      <Icon size={22} strokeWidth={item.active ? 3 : 2} />
                      {item.badge && (
                        <div className="absolute -top-1.5 -right-1.5 bg-brand text-white text-[8px] font-black h-4 w-4 rounded-full flex items-center justify-center shadow-lg animate-in zoom-in border-2 border-slate-900">
                           {item.badge}
                        </div>
                      )}
                   </div>
                   <span className="text-[8px] font-black uppercase tracking-widest mt-1.5 opacity-80">{item.label}</span>
                   
                   {item.active && (
                     <div className="absolute -bottom-1 w-1 h-1 rounded-full bg-brand shadow-[0_0_8px_var(--customer-brand)]"></div>
                   )}
                </Link>
             );
          })}
       </div>
    </div>
  );
}
