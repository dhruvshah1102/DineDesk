'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { 
  Settings2, 
  Store, 
  Palette, 
  Mail, 
  Phone, 
  MapPin, 
  Check, 
  Zap,
  Layout,
  Globe
} from 'lucide-react';

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
      toast.success('Configuration synchronized', {
        style: { borderRadius: '12px', background: '#0F172A', color: '#fff' }
      });
    } catch {
      toast.error('Failed to sync settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
         <div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-10">
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-10 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight italic">
              Identity & <span className="text-brand">Branding</span>
            </h2>
            <p className="text-sm text-slate-400 font-medium mt-1 uppercase tracking-wider">Configure your cafe's global public profile</p>
          </div>
          <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 text-brand">
             <Store size={24} />
          </div>
        </div>
        
        <div className="p-10">
          <form onSubmit={handleSubmit} className="space-y-12">
             <section className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-2">
                      <label className="flex items-center space-x-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                         <Layout size={12} />
                         <span>Legal Cafe Entity</span>
                      </label>
                      <input 
                        type="text" 
                        name="name" 
                        value={formData.name} 
                        onChange={handleChange} 
                        placeholder="e.g. THE BREW HOUSE"
                        className="w-full bg-slate-50 border border-slate-100 rounded-[20px] px-6 py-4 font-black text-slate-900 focus:bg-white focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all outline-none" 
                        required 
                      />
                   </div>
                   
                   <div className="space-y-2">
                      <label className="flex items-center space-x-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                         <Mail size={12} />
                         <span>Primary Contact Root</span>
                      </label>
                      <input 
                        type="email" 
                        name="email" 
                        value={formData.email} 
                        disabled 
                        className="w-full bg-slate-100/50 border border-slate-100 text-slate-400 rounded-[20px] px-6 py-4 font-bold cursor-not-allowed italic" 
                      />
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-2">
                      <label className="flex items-center space-x-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                         <Phone size={12} />
                         <span>Support Line</span>
                      </label>
                      <input 
                        type="text" 
                        name="phone" 
                        value={formData.phone} 
                        onChange={handleChange} 
                        placeholder="+91 0000 0000"
                        className="w-full bg-slate-50 border border-slate-100 rounded-[20px] px-6 py-4 font-black text-slate-900 focus:bg-white focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all outline-none" 
                      />
                   </div>

                   <div className="space-y-2">
                      <label className="flex items-center space-x-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                         <Palette size={12} />
                         <span>BRAND PRIMARY COLOR</span>
                      </label>
                      <div className="flex gap-4">
                         <div className="relative">
                            <input 
                              type="color" 
                              name="themeColor" 
                              value={formData.themeColor} 
                              onChange={handleChange} 
                              className="h-14 w-14 border-0 p-0 rounded-[18px] cursor-pointer bg-transparent overflow-hidden" 
                            />
                            <div className="absolute inset-0 rounded-[18px] border-4 border-white pointer-events-none"></div>
                         </div>
                         <input 
                           type="text" 
                           name="themeColor" 
                           value={formData.themeColor} 
                           onChange={handleChange} 
                           className="flex-1 bg-slate-50 border border-slate-100 rounded-[20px] px-6 py-4 font-mono font-bold text-brand focus:bg-white focus:border-brand transition-all outline-none uppercase" 
                         />
                      </div>
                   </div>
                </div>

                <div className="space-y-2">
                   <label className="flex items-center space-x-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                      <MapPin size={12} />
                      <span>PHYSICAL HUB LOCATION</span>
                   </label>
                   <input 
                     type="text" 
                     name="address" 
                     value={formData.address} 
                     onChange={handleChange} 
                     placeholder="Street, City, Building, Floor"
                     className="w-full bg-slate-50 border border-slate-100 rounded-[20px] px-6 py-4 font-black text-slate-900 focus:bg-white focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all outline-none" 
                   />
                </div>
             </section>

             <div className="pt-10 border-t border-slate-50 flex items-center justify-between">
                <div className="flex items-center space-x-2 text-emerald-500 font-bold text-[10px] uppercase tracking-widest">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                   <span>All assets synced</span>
                </div>
                <button 
                  type="submit" 
                  disabled={saving} 
                  className="bg-slate-900 text-white px-10 py-4 rounded-[20px] font-black uppercase tracking-widest shadow-xl shadow-slate-900/10 hover:-translate-y-1 active:translate-y-0 transition-all disabled:opacity-50 flex items-center space-x-3"
                >
                   {saving ? (
                     <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>SYNCING...</span>
                     </>
                   ) : (
                     <>
                        <Zap size={18} fill="currentColor" />
                        <span>DEPLOY UPDATES</span>
                     </>
                   )}
                </button>
             </div>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <div className="bg-slate-900 rounded-[40px] p-8 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand opacity-10 rounded-full blur-3xl -mr-16 -mt-16"></div>
            <div className="relative z-10">
               <div className="w-10 h-10 rounded-[14px] bg-white/10 flex items-center justify-center mb-6">
                  <Globe className="text-brand" size={20} />
               </div>
               <h3 className="text-xl font-black italic tracking-tight mb-2">Public Portal</h3>
               <p className="text-slate-400 text-xs font-medium mb-6 leading-relaxed">View your cafe as your customers see it on their mobile devices.</p>
               <button className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-white group-hover:text-brand transition-colors">
                  <span>Explore View</span>
                  <ChevronRight size={14} />
               </button>
            </div>
         </div>

         <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm group">
            <div className="w-10 h-10 rounded-[14px] bg-indigo-50 flex items-center justify-center mb-6">
               <Settings2 className="text-indigo-600" size={20} />
            </div>
            <h3 className="text-xl font-black italic tracking-tight text-slate-900 mb-2">Advanced Modules</h3>
            <p className="text-slate-400 text-xs font-medium mb-6 leading-relaxed">Taxation, staff management and hardware integration settings.</p>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-300">
               Module Locked
            </div>
         </div>
      </div>
    </div>
  );
}
