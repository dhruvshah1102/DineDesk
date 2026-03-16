'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ClipboardList, UtensilsCrossed, LayoutGrid, BarChart3, Settings, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    // In a real app, hit an API to clear the cookie. 
    // Here we can simply erase it via document.cookie or API
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  const navItems = [
    { href: '/dashboard', label: 'Overview', icon: Home },
    { href: '/dashboard/orders', label: 'Live Orders', icon: ClipboardList },
    { href: '/dashboard/menu', label: 'Menu Manager', icon: UtensilsCrossed },
    { href: '/dashboard/tables', label: 'Tables & QR', icon: LayoutGrid },
    { href: '/dashboard/reports', label: 'Reports', icon: BarChart3 },
    { href: '/dashboard/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col min-h-screen hidden md:flex">
      <div className="p-6">
        <h1 className="text-2xl font-bold tracking-tight text-brand">MenuFlow</h1>
        <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider">Cafe Dashboard</p>
      </div>
      <nav className="flex-1 px-4 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-md transition-colors ${
                isActive ? 'bg-brand text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Icon size={20} />
              <span className="font-medium text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-gray-800">
        <button 
          onClick={handleLogout}
          className="flex w-full items-center space-x-3 px-3 py-2 text-gray-400 hover:text-white rounded-md hover:bg-gray-800 transition-colors"
        >
          <LogOut size={20} />
          <span className="font-medium text-sm">Sign Out</span>
        </button>
      </div>
    </div>
  );
}
