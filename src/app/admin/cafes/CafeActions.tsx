'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export function CafeActions({ cafeId, initialStatus }: { cafeId: string, initialStatus: boolean }) {
  const [isActive, setIsActive] = useState(initialStatus);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const toggleStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/cafes/${cafeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      });

      if (res.ok) {
        setIsActive(!isActive);
        toast.success(`Cafe ${!isActive ? 'reactivated' : 'suspended'}`);
        router.refresh();
      } else {
        toast.error('Failed to update status');
      }
    } catch (e) {
      toast.error('Error updating cafe status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={toggleStatus} 
      disabled={loading}
      className={`text-sm ${isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'} disabled:opacity-50`}
    >
      {loading ? 'Updating...' : (isActive ? 'Suspend' : 'Reactivate')}
    </button>
  );
}
