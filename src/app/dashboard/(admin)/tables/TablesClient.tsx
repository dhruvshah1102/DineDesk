'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { 
  QrCode, 
  Plus, 
  Download, 
  Trash2, 
  Printer, 
  Table as TableIcon,
  ChevronRight,
  ExternalLink,
  Activity,
  PlusCircle,
  X
} from 'lucide-react';

interface CafeTable {
  id: string;
  tableNumber: number;
  qrCodeUrl: string | null;
  isActive: boolean;
  isOccupied: boolean;
}

export default function TablesClient({ initialTables }: { initialTables: CafeTable[] }) {
  const [tables, setTables] = useState(initialTables);
  const [showModal, setShowModal] = useState(false);
  const [tableNum, setTableNum] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddTable = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/tables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableNumber: tableNum }),
      });
      if (!res.ok) {
         const data = await res.json();
         throw new Error(data.error);
      }
      const newTable = await res.json();
      setTables([...tables, newTable].sort((a,b) => a.tableNumber - b.tableNumber));
      setTableNum('');
      setShowModal(false);
      toast.success('Table sequence expanded', {
        style: { borderRadius: '12px', background: '#0F172A', color: '#fff' }
      });
    } catch (err: any) {
      toast.error(err.message || 'Failed to add table');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to decommission this table?')) return;
    try {
      toast.success('Table decommissioned');
      setTables(tables.filter(t => t.id !== id));
    } catch {
      toast.error('Failed to remove table');
    }
  };

  const downloadQR = async (url: string, tableNum: number) => {
     try {
       const response = await fetch(url);
       const blob = await response.blob();
       const blobUrl = window.URL.createObjectURL(blob);
       const link = document.createElement('a');
       link.href = blobUrl;
       link.download = `DineDesk-Table-${tableNum}-QR.png`;
       document.body.appendChild(link);
       link.click();
       document.body.removeChild(link);
       toast.success('Asset downloaded successfully');
     } catch (err) {
       toast.error('Error downloading QR asset');
     }
  };

  return (
    <div className="space-y-10 max-w-[1600px] mx-auto">
      {/* Executive Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
           <div className="flex items-center space-x-2 text-brand font-bold text-xs uppercase tracking-[0.2em] mb-2">
              <TableIcon size={14} />
              <span>Spatial Management</span>
           </div>
           <h1 className="text-4xl font-black tracking-tight text-slate-900 italic">
             Tables & <span className="text-brand">QR Codes</span>
           </h1>
           <p className="text-slate-500 mt-2 font-medium">Manage physical table layouts and generate digital ordering touchpoints.</p>
        </div>
        
        <div className="flex items-center space-x-4">
           <div className="bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-3">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Fleet</span>
              <span className="text-xl font-black text-slate-900">{tables.length}</span>
           </div>
           <button 
             onClick={() => setShowModal(true)} 
             className="bg-brand text-white px-6 py-3.5 rounded-2xl text-sm font-black shadow-lg shadow-brand/20 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center space-x-3"
           >
              <PlusCircle size={18} />
              <span>ADD NEW TABLE</span>
           </button>
        </div>
      </div>

      {/* Tables Grid */}
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
         {tables.map(table => (
            <div 
              key={table.id} 
              className="group bg-white rounded-[40px] border border-slate-100 p-8 shadow-sm hover:shadow-2xl hover:border-brand/20 transition-all duration-500 flex flex-col items-center relative overflow-hidden"
            >
               {/* Background Glow */}
               <div className="absolute top-0 right-0 w-24 h-24 bg-brand/5 rounded-full blur-2xl -mr-12 -mt-12 group-hover:bg-brand/10 transition-colors"></div>
               
               <div className="w-full flex justify-between items-center mb-8 relative z-10">
                  <div className="flex items-center space-x-3">
                     <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100">
                        <TableIcon size={18} className="text-slate-900" />
                     </div>
                     <span className="font-black text-slate-900 tracking-tighter text-lg italic uppercase">T-{table.tableNumber}</span>
                  </div>
                  <button 
                    onClick={() => handleDelete(table.id)} 
                    className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all"
                  >
                     <Trash2 size={16} />
                  </button>
               </div>
               
               <div className="relative mb-8 group-hover:scale-105 transition-transform duration-500 bg-white p-4 rounded-[32px] shadow-xl shadow-black/5 border border-slate-50">
                  {table.qrCodeUrl ? (
                     <img 
                       src={table.qrCodeUrl} 
                       alt={`QR Code for Table ${table.tableNumber}`} 
                       className="w-40 h-40 object-contain" 
                     />
                  ) : (
                     <div className="w-40 h-40 bg-slate-50 rounded-[24px] flex items-center justify-center text-slate-200">
                        <QrCode size={48} />
                     </div>
                  )}
               </div>

               <div className="text-center mb-8">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">Order Channel</p>
                  <div className="flex flex-col items-center">
                    <p className="text-sm font-bold text-slate-900 mb-2">Digital Touchpoint Active</p>
                    {table.isOccupied ? (
                      <div className="flex items-center space-x-2 bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
                        <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Occupied</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Available</span>
                      </div>
                    )}
                  </div>
               </div>

               <div className="w-full grid grid-cols-2 gap-3 mt-auto">
                  <button 
                    disabled={!table.qrCodeUrl} 
                    onClick={() => table.qrCodeUrl && downloadQR(table.qrCodeUrl, table.tableNumber)}
                    className="flex justify-center items-center space-x-2 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-white hover:border-brand/30 hover:text-brand transition-all disabled:opacity-50"
                  >
                     <Download size={14} />
                     <span>Save Asset</span>
                  </button>
                  <button 
                    className="flex justify-center items-center space-x-2 py-3.5 bg-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-slate-800 shadow-lg shadow-slate-900/10 hover:-translate-y-0.5 transition-all"
                    onClick={() => window.print()}
                  >
                     <Printer size={14} />
                     <span>Print Label</span>
                  </button>
               </div>
            </div>
         ))}

         {tables.length === 0 && (
            <div className="col-span-full py-24 text-center bg-white border border-slate-100 rounded-[48px] shadow-sm flex flex-col items-center">
               <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                  <QrCode size={32} className="text-slate-300" />
               </div>
               <h3 className="text-2xl font-black text-slate-900 italic">No spatial assets found</h3>
               <p className="text-slate-500 mt-2 mb-8 max-w-xs font-medium">Add physical tables to generate unique digital ordering touchpoints for your venue.</p>
               <button 
                onClick={() => setShowModal(true)} 
                className="bg-brand text-white px-8 py-4 rounded-2xl text-sm font-black shadow-lg shadow-brand/20 hover:-translate-y-0.5 transition-all flex items-center space-x-3"
              >
                  <PlusCircle size={18} />
                  <span>INITIALIZE TABLES</span>
               </button>
            </div>
         )}
      </div>

      {/* Premium Table Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] animate-in fade-in duration-300 p-4">
          <div className="bg-white rounded-[40px] p-10 w-full max-w-md shadow-2xl animate-in zoom-in-95 border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
            
            <div className="flex justify-between items-start mb-8 relative z-10">
               <h3 className="text-2xl font-black text-slate-900 tracking-tight italic">Initialize <span className="text-brand">New Table</span></h3>
               <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
                  <X size={20} className="text-slate-400" />
               </button>
            </div>

            <form onSubmit={handleAddTable} className="space-y-6 relative z-10">
              <div>
                 <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Table Sequence Number</label>
                 <input 
                   type="number" 
                   autoFocus 
                   value={tableNum} 
                   onChange={e => setTableNum(e.target.value)} 
                   placeholder="e.g. 15" 
                   className="w-full bg-slate-50 border border-slate-100 rounded-[20px] px-6 py-4 font-black text-slate-900 text-xl focus:bg-white focus:border-brand focus:ring-4 focus:ring-brand/10 focus:outline-none transition-all" 
                   required 
                   min="1"
                 />
              </div>
              <div className="flex items-center space-x-3 bg-emerald-50 p-5 rounded-[24px] border border-emerald-100">
                 <div className="p-2 bg-emerald-500 rounded-lg text-white">
                   <Activity size={16} />
                 </div>
                 <p className="text-[10px] font-bold text-emerald-800 leading-normal uppercase tracking-tight">
                    Dynamic QR protocol will be automatically provisioned for this spatial unit upon deployment.
                 </p>
              </div>
              
              <div className="flex gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  className="flex-1 px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest hover:bg-slate-50 rounded-2xl transition-all"
                >
                  Discard
                </button>
                <button 
                  type="submit" 
                  disabled={loading} 
                  className="flex-2 px-8 py-4 text-xs bg-brand text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-brand/20 disabled:opacity-50 hover:-translate-y-0.5 transition-all"
                >
                  Generate Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
