import Link from "next/link";
import { ShieldCheck, Store, User, ArrowRight, ExternalLink } from "lucide-react";
import Image from "next/image";

export default function Home() {
  const portals = [
    {
      title: "Customer Experience",
      description: "Digital menu, ordering, and real-time order tracking for cafe guests.",
      icon: User,
      href: "/table/1?cafe=brew-house",
      color: "bg-brand text-white",
      hover: "hover:border-brand",
      tag: "Live Demo"
    },
    {
      title: "Owner Dashboard",
      description: "Manage orders, menus, payments, and view real-time business analytics.",
      icon: Store,
      href: "/login?cafe=app",
      color: "bg-blue-600 text-white",
      hover: "hover:border-blue-600",
      tag: "Portal"
    },
    {
      title: "Super Admin",
      description: "Platform management, tenant onboarding, and global system settings.",
      icon: ShieldCheck,
      href: "/admin", // Cleaner direct route
      color: "bg-slate-900 text-white",
      hover: "hover:border-slate-900",
      tag: "Secure"
    }
  ];

  return (
    <div className="min-h-screen bg-[#fafafa] selection:bg-brand/20">
      {/* Background patterns */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-3xl"></div>
      </div>

      <main className="relative z-10 max-w-6xl mx-auto px-6 py-20 lg:py-32 flex flex-col items-center">
        {/* Header */}
        <div className="text-center mb-16 space-y-4 max-w-2xl">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-brand/10 border border-brand/20 text-brand text-xs font-bold uppercase tracking-wider mb-2">
            Local Development Portal
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-gray-900 tracking-tight">
            Dine<span className="text-brand">Desk</span>
          </h1>
          <p className="text-lg text-gray-600 mt-6 leading-relaxed">
            Welcome to the local development environment. Choose a portal to explore the multi-tenant SaaS capabilities.
          </p>
        </div>

        {/* Portal Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full mt-8">
          {portals.map((portal, idx) => (
            <Link 
              key={idx} 
              href={portal.href}
              className={`group flex flex-col p-8 bg-white border border-gray-100 rounded-3xl shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${portal.hover}`}
            >
              <div className="flex justify-between items-start mb-6">
                <div className={`p-4 rounded-2xl ${portal.color} shadow-lg shadow-current/10`}>
                  <portal.icon size={28} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 bg-gray-50 px-2 py-1 rounded-md">
                  {portal.tag}
                </span>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-brand transition-colors">
                {portal.title}
              </h3>
              
              <p className="text-gray-500 leading-relaxed text-sm mb-8 flex-1">
                {portal.description}
              </p>
              
              <div className="flex items-center text-sm font-bold text-gray-900 group-hover:gap-2 transition-all">
                <span>Enter Portal</span>
                <ArrowRight size={16} className="ml-2 opacity-0 group-hover:opacity-100 transition-all" />
              </div>
            </Link>
          ))}
        </div>

        {/* Footer Info */}
        <div className="mt-24 p-8 bg-white/50 backdrop-blur-sm border border-gray-100 rounded-3xl max-w-3xl w-full">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center md:text-left">
              <h4 className="font-bold text-gray-900">Need specific table testing?</h4>
              <p className="text-sm text-gray-500">You can manually change the table number in the URL.</p>
            </div>
            <div className="flex gap-4">
              <code className="px-3 py-1.5 bg-gray-100 rounded-lg text-xs font-mono text-gray-600">
                /table/[id]?cafe=[slug]
              </code>
            </div>
          </div>
        </div>

        <div className="mt-12 text-gray-400 text-xs flex items-center gap-2">
           <span>Developed by Lucide Tech</span>
           <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
           <span>v1.0.0</span>
        </div>
      </main>
    </div>
  );
}
