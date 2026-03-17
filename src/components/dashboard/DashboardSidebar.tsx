'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  BarChart3, 
  ClipboardList, 
  Home, 
  LayoutGrid, 
  LogOut, 
  Settings, 
  UtensilsCrossed 
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  // Do not render sidebar on auth pages
  if (pathname === '/login' || pathname === '/register' || pathname?.startsWith('/admin/login')) {
    return null;
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  const navItems = [
    { href: '/dashboard', label: 'Overview', icon: Home },
    { href: '/dashboard/orders', label: 'Live Orders', icon: ClipboardList, badge: 'Live' },
    { href: '/dashboard/menu', label: 'Menu Manager', icon: UtensilsCrossed },
    { href: '/dashboard/tables', label: 'Tables & QR', icon: LayoutGrid },
    { href: '/dashboard/reports', label: 'Reports', icon: BarChart3 },
    { href: '/dashboard/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-72 bg-[#0F172A] text-slate-400 min-h-screen hidden md:flex flex-col border-r border-slate-800/50">
      <div className="p-8">
        <Link href="/" className="flex items-center space-x-2 w-max">
          <span className="text-2xl font-black tracking-tight text-white italic">
            Dine<span className="text-brand">Desk</span>
          </span>
        </Link>
        <div className="mt-4 flex items-center space-x-2 px-1">
          <div className="relative">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <div className="absolute inset-0 w-2 h-2 rounded-full bg-emerald-500 animate-ping opacity-75"></div>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">System Online</span>
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'bg-brand text-white shadow-lg shadow-brand/20' 
                  : 'hover:bg-slate-800/50 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon size={20} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-white transition-colors'} />
                <span className="font-semibold text-sm tracking-wide">{item.label}</span>
              </div>
              {item.badge && !isActive && (
                <span className="bg-brand/10 text-brand text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-6 mt-auto border-t border-slate-800/50">
        <div className="bg-slate-800/30 rounded-2xl p-4 mb-4 border border-slate-800/50">
           <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-brand/20 flex items-center justify-center text-brand font-bold border border-brand/10 text-sm">
                BH
              </div>
              <div>
                <p className="text-xs font-bold text-white leading-none">The Brew House</p>
                <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-tighter">Pro Plan</p>
              </div>
           </div>
        </div>
        
        <button 
          onClick={handleLogout}
          className="flex w-full items-center justify-center space-x-2 px-4 py-3 text-slate-500 hover:text-rose-400 rounded-xl hover:bg-rose-500/5 transition-all duration-200 border border-transparent hover:border-rose-500/10"
        >
          <LogOut size={18} />
          <span className="font-bold text-sm">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
