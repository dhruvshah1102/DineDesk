'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, Image as ImageIcon } from 'lucide-react';

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
      toast.success('Category added');
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
      
      const savedItem = editingItem ? await res.json() : await res.json(); // Usually we want the full object back
      
      // Reload everything to ensure sync (in real app, use SWR or update state directly)
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
      toast.success('Item deleted');
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
    } catch {
      toast.error('Failed to toggle');
      setItems(items.map(i => i.id === id ? { ...i, isAvailable: current } : i));
    }
  };

  const selectedItems = items.filter(i => i.categoryId === selectedCategoryId);

  return (
    <div className="flex h-full">
      {/* Categories Sidebar */}
      <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="font-semibold text-gray-800">Categories</h2>
          <button onClick={() => setShowCatModal(true)} className="text-brand hover:text-brand-dark p-1">
            <Plus size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {categories.length === 0 ? (
            <p className="text-sm text-gray-500 text-center p-4">No categories added.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {categories.map(cat => (
                <li key={cat.id} className={`group flex justify-between items-center p-3 cursor-pointer hover:bg-gray-100 ${selectedCategoryId === cat.id ? 'bg-white border-l-4 border-l-brand relative shadow-sm z-10' : 'border-l-4 border-l-transparent'}`} onClick={() => setSelectedCategoryId(cat.id)}>
                  <span className="font-medium text-gray-800 truncate pr-2">{cat.name}</span>
                  <button onClick={(e) => { e.stopPropagation(); handleDeleteCategory(cat.id); }} className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 size={16} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Items Area */}
      <div className="flex-1 flex flex-col bg-white">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="font-semibold text-xl text-gray-800">
            {categories.find(c => c.id === selectedCategoryId)?.name || 'Select a Category'}
          </h2>
          {selectedCategoryId && (
            <button onClick={() => openItemModal()} className="bg-brand hover:bg-brand-dark text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center">
              <Plus size={16} className="mr-2" />
              Add Item
            </button>
          )}
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          {!selectedCategoryId ? (
            <div className="h-full flex items-center justify-center text-gray-500">Please select or create a category first.</div>
          ) : selectedItems.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-500 flex-col space-y-2">
               <p>No items in this category.</p>
               <button onClick={() => openItemModal()} className="text-brand font-medium">Add your first item</button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {selectedItems.map(item => (
                <div key={item.id} className={`border rounded-lg p-4 flex flex-col hover:shadow-md transition-shadow ${!item.isAvailable ? 'opacity-60 bg-gray-50' : 'bg-white'}`}>
                  <div className="flex justify-between items-start mb-3">
                     <div className="flex space-x-3">
                        <div className="h-16 w-16 bg-gray-100 rounded-md overflow-hidden flex items-center justify-center flex-shrink-0 border border-gray-200">
                           {item.imageUrl ? (
                             <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                           ) : (
                             <ImageIcon size={24} className="text-gray-400" />
                           )}
                        </div>
                        <div>
                           <div className="flex items-center space-x-2">
                             <div className={`h-2.5 w-2.5 rounded-full border ${item.isVeg ? 'border-green-600 bg-green-500' : 'border-red-600 bg-red-500'}`}></div>
                             <h3 className="font-semibold text-gray-900 group-hover:text-brand transition-colors line-clamp-1">{item.name}</h3>
                           </div>
                           <p className="text-sm font-bold text-gray-700 mt-1">₹{item.price.toFixed(2)}</p>
                        </div>
                     </div>
                  </div>
                  
                  {item.description && (
                    <p className="text-xs text-gray-500 line-clamp-2 mb-4 flex-1">{item.description}</p>
                  )}
                  
                  <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between">
                     <label className="flex items-center cursor-pointer">
                        <div className="relative">
                          <input type="checkbox" className="sr-only" checked={item.isAvailable} onChange={() => toggleItemAvailability(item.id, item.isAvailable)} />
                          <div className={`block w-10 h-6 rounded-full transition-colors ${item.isAvailable ? 'bg-brand' : 'bg-gray-300'}`}></div>
                          <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${item.isAvailable ? 'transform translate-x-4' : ''}`}></div>
                        </div>
                        <div className="ml-3 text-xs font-medium text-gray-700">
                          {item.isAvailable ? 'In Stock' : 'Sold Out'}
                        </div>
                     </label>

                     <div className="flex space-x-2">
                        <button onClick={() => openItemModal(item)} className="p-1.5 text-gray-500 hover:text-brand hover:bg-brand/10 rounded-md transition-colors"><Edit2 size={16}/></button>
                        <button onClick={() => handleDeleteItem(item.id)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"><Trash2 size={16}/></button>
                     </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Category Modal */}
      {showCatModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-full">
            <h3 className="text-lg font-bold mb-4">Add Category</h3>
            <form onSubmit={handleAddCategory}>
              <input type="text" autoFocus value={catName} onChange={e => setCatName(e.target.value)} placeholder="e.g. Coffee, Burgers" className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4 focus:ring-1 focus:ring-brand focus:outline-none" required />
              <div className="flex justify-end space-x-3">
                <button type="button" onClick={() => setShowCatModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md">Cancel</button>
                <button type="submit" disabled={loading} className="px-4 py-2 text-sm bg-brand text-white rounded-md disabled:opacity-50 hover:bg-brand-dark">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Item Modal */}
      {showItemModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-[500px] max-w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">{editingItem ? 'Edit Item' : 'Add New Item'}</h3>
            <form onSubmit={handleSaveItem} className="space-y-4">
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                <input type="text" value={iName} onChange={e => setIName(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-1 focus:ring-brand focus:outline-none" required />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select value={iCatId} onChange={e => setICatId(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-1 focus:ring-brand focus:outline-none" required>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                  <input type="number" step="0.01" value={iPrice} onChange={e => setIPrice(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-1 focus:ring-brand focus:outline-none" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dietary</label>
                  <select value={iIsVeg ? 'veg' : 'non-veg'} onChange={e => setIIsVeg(e.target.value === 'veg')} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-1 focus:ring-brand focus:outline-none">
                    <option value="veg">Vegetarian</option>
                    <option value="non-veg">Non-Vegetarian</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                <textarea value={iDesc} onChange={e => setIDesc(e.target.value)} rows={3} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-1 focus:ring-brand focus:outline-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image (Optional, {editingItem?.imageUrl ? 'replaces existing' : 'auto uploads'})</label>
                <input type="file" accept="image/*" onChange={e => e.target.files && setIFile(e.target.files[0])} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-brand/10 file:text-brand hover:file:bg-brand/20" />
              </div>

              <div className="flex items-center pt-2">
                <input type="checkbox" id="avail" checked={iIsAvail} onChange={e => setIIsAvail(e.target.checked)} className="h-4 w-4 text-brand rounded border-gray-300 focus:ring-brand" />
                <label htmlFor="avail" className="ml-2 block text-sm text-gray-900">Available in stock</label>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setShowItemModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md">Cancel</button>
                <button type="submit" disabled={loading} className="px-4 py-2 text-sm bg-brand text-white rounded-md disabled:opacity-50 hover:bg-brand-dark">Save Item</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
