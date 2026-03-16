'use client';

import { useEffect, useRef } from 'react';
import { useCart } from '@/components/customer/CartContext';
import { Plus, Minus, Image as ImageIcon } from 'lucide-react';
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
  const initialized = useRef(false);

  useEffect(() => {
    // Lock cart to physical table securely natively avoiding cross table ghost submissions if tabs crossed.
    if (!initialized.current) {
       if (storedTableStr && storedTableStr !== tableNumber) {
          toast('You changed tables. Creating a new ticket.', { icon: '🔄' });
          setTableNumber(tableNumber);
          // In a real app we might want to automatically clearCart here, but let's let context just override table.
       } else if (!storedTableStr) {
          setTableNumber(tableNumber);
       }
       // Also optionally lock slug if needed.
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
      toast.success(`Added ${item.name} to cart`);
    } else {
      // Find the specific cart item ID logically associated since we aggregate by menuItemId visually
      const cartItem = cartItems.find(i => i.menuItemId === item.id);
      if (cartItem) {
        updateQuantity(cartItem.id, 1);
      }
    }
  };

  const handleRemove = (item: MenuItem) => {
    const cartItem = cartItems.find(i => i.menuItemId === item.id);
    if (cartItem) {
      updateQuantity(cartItem.id, -1);
    }
  };

  return (
    <div className="space-y-10">
       {groupedMenu.map((category) => (
          <div key={category.id} className="scroll-mt-20">
             <h2 className="text-xl font-bold text-gray-900 mb-4 sticky top-14 bg-gray-50/95 backdrop-blur-sm p-2 -mx-2 z-10 border-b border-gray-200">
               {category.name}
             </h2>
             
             <div className="space-y-4">
                {category.items.map(item => {
                   const quantity = getItemQuantity(item.id);
                   const isVegColor = item.isVeg ? 'text-green-600 border-green-600' : 'text-red-600 border-red-600';
                   const isVegBg = item.isVeg ? 'bg-green-600' : 'bg-red-600';

                   return (
                     <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 flex gap-4 transition-transform hover:-translate-y-0.5">
                        
                        <div className="flex-1">
                           <div className="flex items-center space-x-2 mb-1">
                              <div className={`h-3 w-3 rounded-sm border-[1px] flex items-center justify-center p-[2px] ${isVegColor}`}>
                                 <div className={`h-full w-full rounded-full ${isVegBg}`}></div>
                              </div>
                              <h3 className="font-bold text-gray-900 leading-tight">{item.name}</h3>
                           </div>
                           <p className="font-semibold text-gray-800 text-sm mb-2">₹{item.price.toFixed(2)}</p>
                           {item.description && (
                             <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{item.description}</p>
                           )}
                        </div>

                        <div className="w-24 flex flex-col items-center justify-between flex-shrink-0 relative">
                           <div className="w-full aspect-square bg-gray-50 rounded-lg overflow-hidden border border-gray-100 shadow-inner flex items-center justify-center mb-2">
                             {item.imageUrl ? (
                               <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                             ) : (
                               <ImageIcon size={24} className="text-gray-300" />
                             )}
                           </div>
                           
                           {quantity > 0 ? (
                             <div className="flex items-center justify-between w-full bg-[var(--customer-brand)] text-white rounded-md h-8 text-sm shadow-sm absolute -bottom-2 border-2 border-white">
                                <button onClick={() => handleRemove(item)} className="h-full w-1/3 flex items-center justify-center hover:bg-black/20 rounded-l-md transition-colors"><Minus size={14}/></button>
                                <span className="font-bold">{quantity}</span>
                                <button onClick={() => handleAdd(item)} className="h-full w-1/3 flex items-center justify-center hover:bg-black/20 rounded-r-md transition-colors"><Plus size={14}/></button>
                             </div>
                           ) : (
                             <button 
                               onClick={() => handleAdd(item)} 
                               className="w-full absolute -bottom-2 bg-white text-[var(--customer-brand)] font-bold text-sm h-8 rounded-md shadow-sm border border-gray-200 hover:border-[var(--customer-brand)] transition-colors uppercase tracking-wider text-[10px]"
                             >
                               ADD
                             </button>
                           )}
                        </div>
                     </div>
                   );
                })}
             </div>
          </div>
       ))}
    </div>
  );
}
