"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import Link from "next/link";
import { LogOut, UserCircle } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentUser = useStore(state => state.currentUser);
  const logout = useStore(state => state.logout);
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (!currentUser) {
      router.push("/auth/login");
    }
  }, [currentUser, router]);

  if (!isClient || !currentUser) return <div className="flex-grow flex items-center justify-center">Loading secure environment...</div>;

  return (
    <div className="flex flex-col flex-grow bg-slate-50">
      {/* Role Banner */}
      <div className="bg-brand-saffron text-white py-2 px-8 flex justify-between items-center text-sm font-semibold shadow-inner">
        <div className="flex items-center space-x-2">
           <UserCircle className="w-5 h-5" />
           <span>Welcome, {currentUser.name}</span>
           {currentUser.organization && <span className="opacity-80">| {currentUser.organization}</span>}
        </div>
        <div className="flex items-center space-x-4">
           <span className="bg-white/20 px-2 py-1 rounded text-xs tracking-wider">ROLE: {currentUser.role}</span>
           <button 
             onClick={() => { logout(); router.push('/auth/login'); }}
             className="flex items-center space-x-1 hover:text-red-100 transition-colors"
           >
             <LogOut className="w-4 h-4" />
             <span>Secure Logout</span>
           </button>
        </div>
      </div>
      
      {/* Dashboard Content Container */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-grow">
         {children}
      </div>
    </div>
  );
}
