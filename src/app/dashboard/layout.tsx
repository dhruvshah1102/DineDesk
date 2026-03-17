import { ReactNode } from 'react';

export default function RootDashboardLayout({ children }: { children: ReactNode }) {
  // This layout wraps both auth and admin pages.
  // We keep it clean so both groups can have their own specialized frames.
  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900">
      {children}
    </div>
  );
}
