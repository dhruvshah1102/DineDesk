'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export default function SettingsClient() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    themeColor: '#0A3161'
  });

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
         if(!data.error) {
            setFormData({
               name: data.name || '',
               email: data.email || '',
               phone: data.phone || '',
               address: data.address || '',
               themeColor: data.themeColor || '#0A3161'
            });
         }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error();
      toast.success('Settings updated successfully');
    } catch {
      toast.error('Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-gray-500">Loading settings...</div>;
  }

  return (
    <div className="max-w-2xl bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">General Brand Settings</h2>
        <p className="text-sm text-gray-500 mt-1">Update your cafe's public profile and visual branding.</p>
      </div>
      
      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cafe Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-1 focus:ring-brand focus:outline-none" required />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Registered Email (Read Only)</label>
                <input type="email" name="email" value={formData.email} disabled className="w-full border border-gray-200 bg-gray-50 text-gray-500 rounded-md px-3 py-2 cursor-not-allowed" />
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-1 focus:ring-brand focus:outline-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Brand Theme Color (Hex)</label>
                <div className="flex space-x-3">
                   <input type="color" name="themeColor" value={formData.themeColor} onChange={handleChange} className="h-10 w-10 border-0 p-0 rounded cursor-pointer" />
                   <input type="text" name="themeColor" value={formData.themeColor} onChange={handleChange} className="flex-1 w-full border border-gray-300 rounded-md px-3 py-2 font-mono text-sm focus:ring-1 focus:ring-brand focus:outline-none" />
               </div>
              </div>
           </div>

           <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Full Physical Address</label>
             <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-1 focus:ring-brand focus:outline-none" />
           </div>

           <div className="pt-4 border-t border-gray-100 flex justify-end">
              <button type="submit" disabled={saving} className="bg-brand text-white px-6 py-2 rounded-md font-medium hover:bg-brand-dark transition-colors disabled:opacity-50">
                 {saving ? 'Saving...' : 'Save Changes'}
              </button>
           </div>
        </form>
      </div>
    </div>
  );
}
