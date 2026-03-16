import Link from 'next/link';
import { Home, Coffee, BarChart3, LogOut } from 'lucide-react';

export default function AdminSidebar() {
  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col min-h-screen">
      <div className="p-6">
        <h1 className="text-2xl font-bold tracking-tight text-brand-light">MenuFlow Admin</h1>
      </div>
      <nav className="flex-1 px-4 space-y-2">
        <Link href="/admin/dashboard" className="flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-gray-800 transition-colors">
          <Home size={20} />
          <span>Dashboard</span>
        </Link>
        <Link href="/admin/cafes" className="flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-gray-800 transition-colors">
          <Coffee size={20} />
          <span>All Cafes</span>
        </Link>
        <Link href="/admin/analytics" className="flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-gray-800 transition-colors">
          <BarChart3 size={20} />
          <span>Analytics</span>
        </Link>
      </nav>
      <div className="p-4 border-t border-gray-800">
        <button className="flex w-full items-center space-x-3 px-3 py-2 text-gray-400 hover:text-white rounded-md hover:bg-gray-800 transition-colors">
          <LogOut size={20} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}
