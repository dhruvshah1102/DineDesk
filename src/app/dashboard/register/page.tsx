'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Coffee } from 'lucide-react';

export default function OwnerRegister() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    numTables: 4,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success('Registration successful. Welcome to MenuFlow!');
        router.push('/dashboard');
        router.refresh();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Registration failed');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="hidden lg:flex lg:w-5/12 bg-brand flex-col justify-center items-center text-white p-12 relative overflow-hidden">
        <div className="z-10 relative space-y-6">
          <Coffee size={64} className="mb-4 text-white" />
          <h1 className="text-4xl font-bold tracking-tight">Join MenuFlow</h1>
          <p className="text-xl text-brand-100 max-w-md">
            Set up your digital menu, manage live orders, and unlock seamless ordering for your customers in minutes.
          </p>
        </div>
      </div>
      
      <div className="w-full lg:w-7/12 flex items-center justify-center p-8">
        <div className="w-full max-w-2xl bg-white rounded-lg shadow-xl p-8 lg:p-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Create your Cafe Profile</h2>
          
          <form onSubmit={handleRegister} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Cafe Name</label>
                 <input
                   type="text"
                   name="name"
                   value={formData.name}
                   onChange={handleChange}
                   className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                   required
                 />
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                 <input
                   type="email"
                   name="email"
                   value={formData.email}
                   onChange={handleChange}
                   className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                   required
                 />
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                 <input
                   type="password"
                   name="password"
                   value={formData.password}
                   onChange={handleChange}
                   className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                   required
                 />
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                 <input
                   type="password"
                   name="confirmPassword"
                   value={formData.confirmPassword}
                   onChange={handleChange}
                   className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                   required
                 />
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                 <input
                   type="text"
                   name="phone"
                   value={formData.phone}
                   onChange={handleChange}
                   className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                 />
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Number of Tables</label>
                 <input
                   type="number"
                   min="1"
                   max="100"
                   name="numTables"
                   value={formData.numTables}
                   onChange={handleChange}
                   className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                   required
                 />
               </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand transition-colors disabled:opacity-50 mt-4"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-brand hover:text-brand-dark hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
