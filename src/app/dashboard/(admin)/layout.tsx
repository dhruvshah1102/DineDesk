import { ReactNode } from 'react';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar - Fixed on desktop */}
      <DashboardSidebar />
      
      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        <div className="flex-1 p-4 md:p-8 lg:p-10">
          {children}
        </div>
      </main>
    </div>
  );
}
