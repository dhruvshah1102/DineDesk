'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Image as ImageIcon, 
  ChevronRight, 
  Layers, 
  Search,
  Check,
  X,
  PlusCircle,
  Zap,
  Leaf,
  Beef
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  sortOrder: number;
}

interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  isAvailable: boolean;
  isVeg: boolean;
  sortOrder: number;
}

export default function MenuManagerClient({ initialCategories, initialItems }: { initialCategories: Category[], initialItems: MenuItem[] }) {
  const [categories, setCategories] = useState(initialCategories);
  const [items, setItems] = useState(initialItems);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(initialCategories.length > 0 ? initialCategories[0].id : null);
  
  const [loading, setLoading] = useState(false);
  const [showCatModal, setShowCatModal] = useState(false);
  const [catName, setCatName] = useState('');

  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  
  // Item Form
  const [iName, setIName] = useState('');
  const [iDesc, setIDesc] = useState('');
  const [iPrice, setIPrice] = useState('');
  const [iIsVeg, setIIsVeg] = useState(true);
  const [iIsAvail, setIIsAvail] = useState(true);
  const [iFile, setIFile] = useState<File | null>(null);
  const [iCatId, setICatId] = useState('');

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: catName, sortOrder: categories.length }),
      });
      if (!res.ok) throw new Error();
      const newCat = await res.json();
      setCategories([...categories, newCat]);
      setCatName('');
      setShowCatModal(false);
      if (!selectedCategoryId) setSelectedCategoryId(newCat.id);
      toast.success('Category added', {
        style: { borderRadius: '12px', background: '#0F172A', color: '#fff' }
      });
    } catch {
      toast.error('Failed to add category');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Delete category and all its items?')) return;
    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setCategories(categories.filter(c => c.id !== id));
      setItems(items.filter(i => i.categoryId !== id));
      if (selectedCategoryId === id) setSelectedCategoryId(null);
      toast.success('Category deleted');
    } catch {
      toast.error('Failed to delete category');
    }
  };

  const openItemModal = (item?: MenuItem) => {
    if (item) {
      setEditingItem(item);
      setIName(item.name);
      setIDesc(item.description || '');
      setIPrice(item.price.toString());
      setIIsVeg(item.isVeg);
      setIIsAvail(item.isAvailable);
      setIFile(null);
      setICatId(item.categoryId);
    } else {
      setEditingItem(null);
      setIName('');
      setIDesc('');
      setIPrice('');
      setIIsVeg(true);
      setIIsAvail(true);
      setIFile(null);
      setICatId(selectedCategoryId || (categories[0]?.id || ''));
    }
    setShowItemModal(true);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', iName);
      formData.append('description', iDesc);
      formData.append('price', iPrice);
      formData.append('categoryId', iCatId);
      formData.append('isVeg', iIsVeg.toString());
      formData.append('isAvailable', iIsAvail.toString());
      if (iFile) formData.append('image', iFile);

      const url = editingItem ? `/api/menu-items/${editingItem.id}` : '/api/menu-items';
      const method = editingItem ? 'PUT' : 'POST';

      if (editingItem && editingItem.imageUrl && !iFile) {
        formData.append('existingImageUrl', editingItem.imageUrl);
      }

      const res = await fetch(url, { method, body: formData });
      if (!res.ok) throw new Error();
      
      window.location.reload(); 
    } catch {
      toast.error('Failed to save item');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm('Delete this item?')) return;
    try {
      const res = await fetch(`/api/menu-items/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setItems(items.filter(i => i.id !== id));
      toast.success('Item removed permanently');
    } catch {
      toast.error('Failed to delete item');
    }
  };

  const toggleItemAvailability = async (id: string, current: boolean) => {
    const updated = !current;
    setItems(items.map(i => i.id === id ? { ...i, isAvailable: updated } : i));
    try {
      await fetch(`/api/menu-items/${id}/toggle`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAvailable: updated })
      });
      toast.success(updated ? 'Item is now available' : 'Item marked as sold out', {
        duration: 1500,
        position: 'bottom-center'
      });
    } catch {
      toast.error('Failed to toggle status');
      setItems(items.map(i => i.id === id ? { ...i, isAvailable: current } : i));
    }
  };

  const selectedItems = items.filter(i => i.categoryId === selectedCategoryId);

  return (
    <div className="flex h-full gap-8">
      {/* Categories Sidebar */}
      <div className="w-80 flex flex-col h-full space-y-6">
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex flex-col h-full flex-1 overflow-hidden">
          <div className="flex justify-between items-center mb-6 px-1">
            <div className="flex items-center space-x-2">
               <Layers size={18} className="text-slate-400" />
               <h2 className="font-black text-slate-900 tracking-tight">Categories</h2>
            </div>
            <button 
              onClick={() => setShowCatModal(true)} 
              className="text-brand hover:scale-110 transition-transform bg-brand/10 p-2 rounded-xl"
            >
              <Plus size={18} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-2 scrollbar-hide">
            {categories.length === 0 ? (
              <div className="text-center py-12">
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No categories</p>
              </div>
            ) : (
              categories.map(cat => (
                <button 
                  key={cat.id} 
                  onClick={() => setSelectedCategoryId(cat.id)}
                  className={`w-full group flex justify-between items-center p-4 rounded-2xl transition-all duration-300 border ${
                    selectedCategoryId === cat.id 
                      ? 'bg-brand text-white border-brand shadow-lg shadow-brand/20' 
                      : 'bg-slate-50 border-slate-50 text-slate-600 hover:bg-slate-100 hover:border-slate-200'
                  }`}
                >
                  <span className="font-bold text-sm tracking-wide truncate pr-4">{cat.name}</span>
                  <div className="flex items-center space-x-2">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                      selectedCategoryId === cat.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-500'
                    }`}>
                      {items.filter(i => i.categoryId === cat.id).length}
                    </span>
                    <Trash2 
                      size={14} 
                      onClick={(e) => { e.stopPropagation(); handleDeleteCategory(cat.id); }} 
                      className={`opacity-0 group-hover:opacity-100 transition-opacity hover:text-rose-500 ${
                        selectedCategoryId === cat.id ? 'text-white/50 hover:text-white' : ''
                      }`} 
                    />
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Items Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">
              {categories.find(c => c.id === selectedCategoryId)?.name || 'Select Category'}
            </h2>
            <p className="text-slate-500 text-sm font-medium mt-1">
               {selectedItems.length} Professional menu selections
            </p>
          </div>
          {selectedCategoryId && (
            <button 
              onClick={() => openItemModal()} 
              className="bg-brand text-white px-6 py-3.5 rounded-2xl text-sm font-black shadow-lg shadow-brand/20 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center space-x-3"
            >
              <PlusCircle size={18} />
              <span>ADD NEW ITEM</span>
            </button>
          )}
        </div>
        
        <div className="flex-1 overflow-y-auto pr-4 pb-12 scrollbar-hide">
          {!selectedCategoryId ? (
            <div className="h-full flex items-center justify-center bg-white rounded-[40px] border border-slate-100 shadow-sm">
               <div className="text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                     <Layers className="text-slate-300" size={24} />
                  </div>
                  <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Select a category to manage items</p>
               </div>
            </div>
          ) : selectedItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center bg-white rounded-[40px] border border-slate-100 shadow-sm">
               <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                  <PlusCircle size={32} className="text-slate-300" />
               </div>
               <h3 className="text-xl font-black text-slate-900">Queue empty</h3>
               <p className="text-slate-500 mt-2 text-center max-w-xs font-medium">
                 Start building your digital menu by adding items to this category.
               </p>
               <button onClick={() => openItemModal()} className="mt-8 text-brand font-black text-sm uppercase tracking-widest bg-brand/5 px-6 py-3 rounded-xl border border-brand/10 hover:bg-brand/10 transition-colors">
                  Initial Launch
               </button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {selectedItems.map(item => (
                <div 
                  key={item.id} 
                  className={`group relative bg-white rounded-[32px] p-6 border transition-all duration-300 hover:shadow-2xl hover:border-brand/20 ${!item.isAvailable ? 'border-slate-100 opacity-75' : 'border-slate-100 shadow-sm'}`}
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="relative">
                      <div className="h-20 w-20 rounded-[20px] overflow-hidden bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-500 shadow-lg shadow-black/5">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                        ) : (
                          <ImageIcon size={28} className="text-slate-200" />
                        )}
                      </div>
                      <div className={`absolute -top-1.5 -right-1.5 w-6 h-6 rounded-lg border-2 border-white shadow-sm flex items-center justify-center ${item.isVeg ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                         {item.isVeg ? <Leaf size={12} className="text-white" /> : <Beef size={12} className="text-white" />}
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end">
                       <span className="text-xl font-black text-slate-900 tracking-tighter italic">₹{Number(item.price).toFixed(0)}</span>
                       <div className={`mt-2 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter ${item.isAvailable ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                         {item.isAvailable ? 'Available' : 'Sold Out'}
                       </div>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="font-black text-slate-900 text-lg leading-tight uppercase group-hover:text-brand transition-colors line-clamp-1">{item.name}</h3>
                    <p className="text-xs text-slate-400 font-medium mt-1 line-clamp-2 h-8">{item.description || 'No description provided for this premium selection.'}</p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                     <button 
                        onClick={() => toggleItemAvailability(item.id, item.isAvailable)}
                        className={`flex-1 py-3 px-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                          item.isAvailable ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-emerald-500 text-white hover:bg-emerald-600'
                        }`}
                      >
                        {item.isAvailable ? 'Mark Sold Out' : 'Mark Available'}
                     </button>
                     
                     <div className="flex space-x-1">
                        <button 
                          onClick={() => openItemModal(item)} 
                          className="p-3 text-slate-400 hover:text-brand hover:bg-brand/5 rounded-2xl transition-all border border-transparent hover:border-brand/10"
                        >
                          <Edit2 size={16}/>
                        </button>
                        <button 
                          onClick={() => handleDeleteItem(item.id)} 
                          className="p-3 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all border border-transparent hover:border-rose-500/10"
                        >
                          <Trash2 size={16}/>
                        </button>
                     </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modern Modal Overlay */}
      {(showCatModal || showItemModal) && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] animate-in fade-in duration-300 p-4">
          
          {/* Category Modal */}
          {showCatModal && (
            <div className="bg-white rounded-[40px] p-10 w-full max-w-md shadow-2xl animate-in zoom-in-95 overflow-hidden relative border border-slate-100">
               <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
              
              <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-8">Add New <span className="text-brand italic">Category</span></h3>
              <form onSubmit={handleAddCategory} className="space-y-6 relative z-10">
                <div>
                   <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Category Name</label>
                   <input 
                    type="text" 
                    autoFocus 
                    value={catName} 
                    onChange={e => setCatName(e.target.value)} 
                    placeholder="e.g. SPECIALTY COFFEE" 
                    className="w-full bg-slate-50 border border-slate-100 rounded-[20px] px-6 py-4 font-bold text-slate-900 focus:bg-white focus:border-brand focus:ring-4 focus:ring-brand/10 focus:outline-none transition-all" 
                    required 
                  />
                </div>
                
                <div className="flex gap-4 pt-4">
                  <button 
                    type="button" 
                    onClick={() => setShowCatModal(false)} 
                    className="flex-1 px-6 py-4 text-sm font-black text-slate-500 uppercase tracking-widest hover:bg-slate-50 rounded-2xl transition-all"
                  >
                    Discard
                  </button>
                  <button 
                    type="submit" 
                    disabled={loading} 
                    className="flex-1 px-6 py-4 text-sm bg-brand text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-brand/20 disabled:opacity-50 hover:-translate-y-0.5 transition-all"
                  >
                    Launch
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Item Modal */}
          {showItemModal && (
            <div className="bg-white rounded-[48px] p-10 w-full max-w-xl shadow-2xl animate-in zoom-in-95 border border-slate-100 relative overflow-hidden flex flex-col max-h-[90vh]">
              <div className="absolute top-0 right-0 w-48 h-48 bg-brand/5 rounded-full blur-3xl -mr-24 -mt-24 pointer-events-none"></div>
              
              <div className="flex justify-between items-start mb-8 relative z-10">
                 <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">{editingItem ? 'EDIT' : 'CREATE'} <span className="text-brand italic">SELECTION</span></h3>
                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">Configure your menu item properties</p>
                 </div>
                 <button onClick={() => setShowItemModal(false)} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
                    <X size={24} className="text-slate-400" />
                 </button>
              </div>

              <form onSubmit={handleSaveItem} className="space-y-6 overflow-y-auto pr-2 scrollbar-hide relative z-10">
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Internal Name</label>
                    <input type="text" value={iName} onChange={e => setIName(e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-[20px] px-6 py-4 font-bold text-slate-900 focus:bg-white focus:border-brand focus:ring-4 focus:ring-brand/10 focus:outline-none transition-all" required />
                  </div>

                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Premium Category</label>
                    <select value={iCatId} onChange={e => setICatId(e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-[20px] px-6 py-4 font-bold text-slate-900 focus:bg-white focus:border-brand focus:ring-4 focus:ring-brand/10 focus:outline-none transition-all appearance-none" required>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>

                  <div className="col-span-2 md:col-span-1 flex gap-4">
                     <div className="flex-1">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Price (₹)</label>
                        <input type="number" step="0.01" value={iPrice} onChange={e => setIPrice(e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-[20px] px-6 py-4 font-bold text-slate-900 focus:bg-white focus:border-brand focus:ring-4 focus:ring-brand/10 focus:outline-none transition-all text-center" required />
                     </div>
                     <div className="flex-1">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Dietary</label>
                        <button 
                          type="button"
                          onClick={() => setIIsVeg(!iIsVeg)}
                          className={`w-full rounded-[20px] px-2 py-4 font-black text-[10px] uppercase tracking-tighter flex items-center justify-center space-x-2 border transition-all ${
                            iIsVeg ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                          }`}
                        >
                           {iIsVeg ? <Leaf size={14} /> : <Beef size={14} />}
                           <span>{iIsVeg ? 'VEGETARIAN' : 'NON-VEG'}</span>
                        </button>
                     </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Guest Description</label>
                  <textarea value={iDesc} onChange={e => setIDesc(e.target.value)} rows={3} placeholder="Craft a compelling story for this item..." className="w-full bg-slate-50 border border-slate-100 rounded-[32px] px-8 py-6 font-medium text-slate-600 focus:bg-white focus:border-brand focus:ring-4 focus:ring-brand/10 focus:outline-none transition-all resize-none" />
                </div>

                <div className="p-8 bg-slate-50 rounded-[40px] border border-dashed border-slate-200 group">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 text-center">Visual Asset</label>
                  <div className="flex flex-col items-center">
                    <input type="file" id="menu-img" accept="image/*" onChange={e => e.target.files && setIFile(e.target.files[0])} className="hidden" />
                    <label htmlFor="menu-img" className="w-full h-32 flex flex-col items-center justify-center cursor-pointer hover:bg-white rounded-[32px] border border-transparent hover:border-slate-200 transition-all text-slate-400 hover:text-brand">
                       {iFile ? (
                         <div className="flex items-center space-x-3 text-emerald-600 font-bold">
                            <Check size={20} />
                            <span>{iFile.name}</span>
                         </div>
                       ) : editingItem?.imageUrl ? (
                         <div className="flex flex-col items-center space-y-2">
                           <ImageIcon size={32} />
                           <span className="text-xs font-bold uppercase tracking-widest">Change Visual</span>
                         </div>
                       ) : (
                         <div className="flex flex-col items-center space-y-2">
                           <PlusCircle size={32} />
                           <span className="text-xs font-bold uppercase tracking-widest">Upload Item Image</span>
                         </div>
                       )}
                    </label>
                  </div>
                </div>

                <div className="flex items-center p-6 bg-slate-50 rounded-[24px] border border-slate-100">
                  <button 
                    type="button"
                    onClick={() => setIIsAvail(!iIsAvail)}
                    className="flex items-center space-x-4 w-full"
                  >
                    <div className={`w-12 h-6 rounded-full relative transition-all duration-300 ${iIsAvail ? 'bg-brand shadow-lg shadow-brand/20' : 'bg-slate-300'}`}>
                       <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${iIsAvail ? 'left-7' : 'left-1'}`}></div>
                    </div>
                    <div className="flex flex-col items-start translate-y-0.5">
                       <span className="text-xs font-black text-slate-900 uppercase tracking-widest leading-none">Market Availability</span>
                       <span className="text-[10px] text-slate-400 font-bold mt-1 uppercase leading-none">{iIsAvail ? 'In Stock — Ready for orders' : 'Sold Out — Hidden from guests'}</span>
                    </div>
                  </button>
                </div>

                <div className="flex gap-4 pt-10 sticky bottom-0 bg-white">
                  <button type="submit" disabled={loading} className="w-full px-8 py-5 bg-slate-900 text-white rounded-[24px] font-black uppercase tracking-widest shadow-xl shadow-slate-900/10 hover:-translate-y-1 active:translate-y-0 transition-all flex items-center justify-center space-x-3">
                    <Zap size={18} fill="currentColor" />
                    <span>Deploy Changes</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
