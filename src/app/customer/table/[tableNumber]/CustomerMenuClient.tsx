'use client';

import { useEffect, useRef, useState } from 'react';
import { useCart } from '@/components/customer/CartContext';
import { Plus, Minus, Search, Leaf, Flame, Sparkles, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  isVeg: boolean;
}

interface CategoryGroup {
  id: string;
  name: string;
  items: MenuItem[];
}

export default function CustomerMenuClient({ 
  groupedMenu, 
  tableNumber, 
  slug 
}: { 
  groupedMenu: CategoryGroup[], 
  tableNumber: string, 
  slug: string 
}) {
  const { items: cartItems, addItem, updateQuantity, setTableNumber, tableNumber: storedTableStr } = useCart();
  const [activeCategory, setActiveCategory] = useState(groupedMenu[0]?.id || '');
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
       if (storedTableStr && storedTableStr !== tableNumber) {
          toast('Locked to Table ' + tableNumber, { icon: '📍' });
          setTableNumber(tableNumber);
       } else if (!storedTableStr) {
          setTableNumber(tableNumber);
       }
       initialized.current = true;
    }
  }, [tableNumber, setTableNumber, storedTableStr]);

  const getItemQuantity = (menuItemId: string) => {
    return cartItems.filter(i => i.menuItemId === menuItemId).reduce((sum, i) => sum + i.quantity, 0);
  };

  const handleAdd = (item: MenuItem) => {
    const existingQ = getItemQuantity(item.id);
    if (existingQ === 0) {
      addItem({ menuItemId: item.id, name: item.name, price: item.price, quantity: 1, isVeg: item.isVeg });
      toast.success(`${item.name} added`, {
        style: { borderRadius: '12px', background: '#0F172A', color: '#fff', fontSize: '12px', fontWeight: 'bold' },
        icon: <Sparkles size={16} className="text-yellow-400" />
      });
    } else {
      const cartItem = cartItems.find(i => i.menuItemId === item.id);
      if (cartItem) updateQuantity(cartItem.id, 1);
    }
  };

  const handleRemove = (item: MenuItem) => {
    const cartItem = cartItems.find(i => i.menuItemId === item.id);
    if (cartItem) updateQuantity(cartItem.id, -1);
  };

  const scrollToCategory = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
       const offset = 140; // Adjust for sticky header + category bar
       const bodyRect = document.body.getBoundingClientRect().top;
       const elementRect = el.getBoundingClientRect().top;
       const elementPosition = elementRect - bodyRect;
       const offsetPosition = elementPosition - offset;

       window.scrollTo({
         top: offsetPosition,
         behavior: 'smooth'
       });
       setActiveCategory(id);
    }
  };

  return (
    <div className="pb-20">
       {/* Category Navigation Bar */}
       <div className="sticky top-16 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 -mx-4 px-4 overflow-x-auto no-scrollbar py-3">
          <div className="flex space-x-2">
             {groupedMenu.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => scrollToCategory(cat.id)}
                  className={`px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                    activeCategory === cat.id 
                    ? 'bg-[var(--customer-brand)] text-white shadow-lg shadow-[var(--customer-brand)]/20 scale-105' 
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                   {cat.name}
                </button>
             ))}
          </div>
       </div>

       {/* Menu Sections */}
       <div className="mt-8 space-y-12">
          {groupedMenu.map((category) => (
             <div key={category.id} id={category.id} className="scroll-mt-32">
                <div className="flex items-center space-x-3 mb-6">
                   <div className="w-1 h-6 bg-[var(--customer-brand)] rounded-full"></div>
                   <h2 className="text-xl font-black text-slate-900 tracking-tight italic uppercase">{category.name}</h2>
                   <div className="flex-1 border-b border-slate-100"></div>
                </div>
                
                <div className="grid gap-6">
                   {category.items.map(item => {
                      const quantity = getItemQuantity(item.id);
                      return (
                        <div key={item.id} className="group bg-white rounded-[32px] border border-slate-100 p-5 shadow-sm hover:shadow-xl transition-all duration-300 flex items-start gap-4">
                           
                           <div className="flex-1 space-y-2">
                              <div className="flex items-center space-x-2">
                                 <div className={`p-1 rounded-md border ${item.isVeg ? 'border-emerald-200 bg-emerald-50' : 'border-rose-200 bg-rose-50'}`}>
                                    <div className={`w-2 h-2 rounded-full ${item.isVeg ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                                 </div>
                                 <h3 className="font-black text-slate-900 leading-tight tracking-tight text-lg italic">{item.name}</h3>
                              </div>
                              
                              <p className="text-sm font-black text-brand tracking-widest leading-none">₹{item.price.toFixed(0)}</p>
                              
                              {item.description && (
                                <p className="text-xs text-slate-400 font-medium leading-relaxed line-clamp-2">{item.description}</p>
                              )}

                              <div className="flex items-center space-x-3 pt-2">
                                 {item.isVeg ? (
                                    <div className="flex items-center space-x-1 text-[10px] font-black uppercase text-emerald-600 tracking-widest">
                                       <Leaf size={10} />
                                       <span>Plant Based</span>
                                    </div>
                                 ) : (
                                    <div className="flex items-center space-x-1 text-[10px] font-black uppercase text-rose-600 tracking-widest">
                                       <Flame size={10} />
                                       <span>Protein Rich</span>
                                    </div>
                                 )}
                              </div>
                           </div>

                           <div className="w-28 flex-shrink-0 relative mt-1">
                              <div className="w-full aspect-square rounded-3xl overflow-hidden bg-slate-50 border border-slate-100 shadow-inner group-hover:scale-105 transition-transform duration-300">
                                 {item.imageUrl ? (
                                   <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                 ) : (
                                   <div className="w-full h-full flex items-center justify-center text-slate-200">
                                      <Sparkles size={24} />
                                   </div>
                                 )}
                              </div>
                              
                              {/* Add / Quantity Button */}
                              <div className="absolute -bottom-3 inset-x-2">
                                 {quantity > 0 ? (
                                   <div className="flex items-center justify-between bg-slate-900 text-white rounded-2xl h-10 px-1 shadow-xl shadow-slate-900/20 border-2 border-white">
                                      <button 
                                        onClick={() => handleRemove(item)} 
                                        className="h-8 w-8 flex items-center justify-center hover:bg-white/10 rounded-xl transition-colors"
                                      >
                                         <Minus size={14}/>
                                      </button>
                                      <span className="font-black text-sm">{quantity}</span>
                                      <button 
                                        onClick={() => handleAdd(item)} 
                                        className="h-8 w-8 flex items-center justify-center hover:bg-white/10 rounded-xl transition-colors"
                                      >
                                         <Plus size={14}/>
                                      </button>
                                   </div>
                                 ) : (
                                   <button 
                                     onClick={() => handleAdd(item)} 
                                     className="w-full bg-white text-slate-900 border border-slate-200 rounded-2xl h-10 font-black text-[10px] uppercase tracking-[0.2em] shadow-lg hover:border-[var(--customer-brand)] hover:text-[var(--customer-brand)] transition-all active:scale-95 flex items-center justify-center space-x-1"
                                   >
                                      <span>ADD</span>
                                      <Plus size={12} strokeWidth={3} />
                                   </button>
                                 )}
                              </div>
                           </div>
                        </div>
                      );
                   })}
                </div>
             </div>
          ))}
       </div>
    </div>
  );
}
