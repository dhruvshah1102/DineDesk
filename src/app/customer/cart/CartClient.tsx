'use client';

import { useState } from 'react';
import { useCart } from '@/components/customer/CartContext';
import { useRouter } from 'next/navigation';
import { Plus, Minus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CartClient({ slug }: { slug: string }) {
  const { items, updateQuantity, removeItem, clearCart, subtotal, tableNumber } = useCart();
  const [customerName, setCustomerName] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const taxAmount = subtotal * 0.05;
  const totalAmount = subtotal + taxAmount;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tableNumber) {
      toast.error('Table number missing. Please scan the QR code on your table again.');
      return;
    }

    if (items.length === 0) return;

    setLoading(true);

    try {
      // Find internal table ID securely from the backend or send number and let backend resolve it.
      // Wait, our API requires tableId exactly: `const { slug, tableId, items, customerName, notes } = await req.json();`
      // Wait, since customer context only has tableNumber, we should let API resolve tableId by number OR we can hit a public API to fetch tableId.
      // Let's modify the payload to send tableNumber and slug, since the backend can look up the table easily.
      // Actually /api/orders POST currently reads: `const table = await prisma.cafeTable.findUnique({ where: { id: tableId } });`
      
      // We will hit a quick pre-flight or modify the handler data. Let's hit the existing order endpoint passing tableNumber as tableId, wait no, it's typed to string UUID.
      const res = await fetch('/api/public/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          tableNumber: parseInt(tableNumber, 10),
          items,
          customerName,
          notes
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to place order');
      }

      const { orderId } = await res.json();
      
      clearCart();
      
      // Advance to payment
      router.push(`/payment/${orderId}${slug ? `?cafe=${slug}` : ''}`);
      
    } catch (err: any) {
      toast.error(err.message || 'Checkout failed');
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center flex flex-col items-center justify-center min-h-[40vh]">
         {/* Simple empty state */}
         <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100 text-gray-400">
            <Trash2 size={32} />
         </div>
         <h2 className="text-xl font-bold text-gray-900">Your cart is empty</h2>
         <p className="text-gray-500 mt-2 mb-6">Looks like you haven't added anything to your cart yet.</p>
         <button onClick={() => router.push(`/table/${tableNumber || 1}${slug ? `?cafe=${slug}` : ''}`)} className="bg-[var(--customer-brand)] text-white px-6 py-2 rounded-md font-medium">Browse Menu</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleCheckout} className="space-y-6">
       <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-100">
          {items.map(item => (
            <div key={item.id} className="p-4 flex items-center justify-between">
               <div className="flex-1 pr-4">
                  <div className="flex items-center space-x-2">
                     <div className={`h-3 w-3 rounded-sm border-[1px] flex items-center justify-center p-[2px] ${item.isVeg ? 'text-green-600 border-green-600' : 'text-red-600 border-red-600'}`}>
                        <div className={`h-full w-full rounded-full ${item.isVeg ? 'bg-green-600' : 'bg-red-600'}`}></div>
                     </div>
                     <h3 className="font-bold text-gray-900 text-sm line-clamp-1">{item.name}</h3>
                  </div>
                  <p className="text-gray-500 text-xs mt-1">₹{item.price.toFixed(2)}</p>
               </div>
               
               <div className="flex items-center space-x-4">
                  <div className="flex items-center border border-gray-200 rounded-md">
                     <button type="button" onClick={() => updateQuantity(item.id, -1)} className="px-2 py-1 text-gray-600 hover:bg-gray-50"><Minus size={14} /></button>
                     <span className="px-2 text-sm font-medium w-6 text-center">{item.quantity}</span>
                     <button type="button" onClick={() => updateQuantity(item.id, 1)} className="px-2 py-1 text-gray-600 hover:bg-gray-50"><Plus size={14} /></button>
                  </div>
                  <p className="font-bold text-gray-900 text-sm w-16 text-right">₹{(item.price * item.quantity).toFixed(2)}</p>
               </div>
            </div>
          ))}
       </div>

       <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
            <input 
              type="text" 
              value={customerName} 
              onChange={e => setCustomerName(e.target.value)} 
              required 
              placeholder="e.g. John Doe"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-[var(--customer-brand)] focus:border-[var(--customer-brand)] outline-none" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cooking Instructions / Notes (Optional)</label>
            <textarea 
              value={notes} 
              onChange={e => setNotes(e.target.value)} 
              placeholder="e.g. Make it extra spicy..."
              rows={2}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-[var(--customer-brand)] focus:border-[var(--customer-brand)] outline-none" 
            />
          </div>
       </div>

       <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
             <span>Subtotal</span>
             <span>₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
             <span>GST (5%)</span>
             <span>₹{taxAmount.toFixed(2)}</span>
          </div>
          <div className="border-t border-gray-100 pt-2 mt-2 flex justify-between font-bold text-lg text-gray-900">
             <span>Total</span>
             <span>₹{totalAmount.toFixed(2)}</span>
          </div>
       </div>

       <button 
         type="submit" 
         disabled={loading}
         className="w-full bg-[var(--customer-brand)] text-white font-bold text-lg py-3.5 rounded-xl shadow-sm hover:opacity-90 transition-opacity disabled:opacity-50"
       >
         {loading ? 'Processing...' : 'Proceed to Payment'}
       </button>
    </form>
  );
}
