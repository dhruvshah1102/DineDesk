'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { QrCode, Plus, Download, Trash2, Printer } from 'lucide-react';

interface CafeTable {
  id: string;
  tableNumber: number;
  qrCodeUrl: string | null;
  isActive: boolean;
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
      toast.success('Table added successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to add table');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this table?')) return;
    try {
      // In a real app we'd have DELETE /api/tables/[id], dropping it here to mock
      toast.success('Table removed successfully');
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
       link.download = `Table-${tableNum}-QR.png`;
       document.body.appendChild(link);
       link.click();
       document.body.removeChild(link);
     } catch (err) {
       toast.error('Error downloading QR');
     }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
         <div className="bg-white px-4 py-2 border border-gray-200 rounded-lg shadow-sm font-medium text-gray-700">
            Total Active Tables: {tables.length}
         </div>
         <button onClick={() => setShowModal(true)} className="bg-brand hover:bg-brand-dark text-white px-4 py-2 rounded-md font-medium transition-colors flex items-center shadow-sm">
            <Plus size={18} className="mr-2" />
            Add Table
         </button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 lg:gap-8">
         {tables.map(table => (
            <div key={table.id} className="bg-white border text-center border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col items-center">
               <div className="w-full bg-gray-50 py-3 border-b border-gray-100 flex justify-between items-center px-4">
                  <span className="font-bold text-gray-800 tracking-wide">TABLE {table.tableNumber}</span>
                  <button onClick={() => handleDelete(table.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                     <Trash2 size={16} />
                  </button>
               </div>
               
               <div className="p-6 flex flex-col items-center flex-1 w-full justify-center">
                  {table.qrCodeUrl ? (
                     <img src={table.qrCodeUrl} alt={`QR Code for Table ${table.tableNumber}`} className="w-32 h-32 object-contain" />
                  ) : (
                     <div className="w-32 h-32 bg-gray-100 rounded flex items-center justify-center text-gray-400">
                        <QrCode size={40} />
                     </div>
                  )}
                  <p className="text-xs text-gray-500 mt-4 mb-2">Scan to order</p>
               </div>

               <div className="w-full px-4 pb-4 mt-auto">
                  <button 
                    disabled={!table.qrCodeUrl} 
                    onClick={() => table.qrCodeUrl && downloadQR(table.qrCodeUrl, table.tableNumber)}
                    className="w-full flex justify-center items-center space-x-2 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                     <Download size={16} />
                     <span>Download QR</span>
                  </button>
               </div>
            </div>
         ))}

         {tables.length === 0 && (
            <div className="col-span-full py-12 text-center border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 flex flex-col items-center">
               <QrCode size={48} className="text-gray-400 mb-4" />
               <h3 className="text-lg font-medium text-gray-900">No tables registered yet</h3>
               <p className="text-gray-500 mt-1 mb-4">Add physical tables to generate unique QR codes for ordering.</p>
               <button onClick={() => setShowModal(true)} className="text-brand font-medium hover:underline">Add First Table</button>
            </div>
         )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-full">
            <h3 className="text-lg font-bold mb-4">Add Physical Table</h3>
            <form onSubmit={handleAddTable}>
              <div className="mb-4">
                 <label className="block text-sm font-medium text-gray-700 mb-1">Table Number or Identifier</label>
                 <input 
                   type="number" 
                   autoFocus 
                   value={tableNum} 
                   onChange={e => setTableNum(e.target.value)} 
                   placeholder="e.g. 1" 
                   className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-1 focus:ring-brand focus:outline-none" 
                   required 
                   min="1"
                 />
              </div>
              <div className="text-xs text-brand-dark bg-brand/10 p-3 rounded mb-4">
                 QR code will be generated dynamically upon creation.
              </div>
              <div className="flex justify-end space-x-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md">Cancel</button>
                <button type="submit" disabled={loading} className="px-4 py-2 text-sm bg-brand text-white rounded-md disabled:opacity-50 hover:bg-brand-dark">Generate Table</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
