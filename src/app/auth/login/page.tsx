"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import { ShieldCheck, Mail, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const login = useStore(state => state.login);
  const users = useStore(state => state.users);
  
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  if (!isMounted) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(email);
    if (success) {
      router.push("/dashboard");
    } else {
      setError("User not found. Try one of the test emails.");
    }
  };

  return (
    <div className="flex flex-col flex-grow items-center justify-center bg-slate-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 w-full max-w-md">
        <div className="flex justify-center mb-6">
          <div className="h-16 w-16 bg-brand-green rounded-full flex items-center justify-center border-4 border-brand-saffron shadow-sm">
            <ShieldCheck className="text-white w-8 h-8" />
          </div>
        </div>
        <h1 className="text-3xl font-extrabold text-center text-brand-blue mb-2">Secure Login</h1>
        <p className="text-center text-slate-500 mb-8 font-medium">PARIVESH 3.0 Unified Workflow Portal</p>
        
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mb-4 border border-red-100">{error}</div>}
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-all"
                placeholder="Enter your registered email"
                required
              />
            </div>
          </div>
          
          <button 
            type="submit" 
            className="w-full bg-brand-blue text-white font-bold py-3 rounded-lg hover:bg-brand-light-blue transition-colors flex justify-center items-center shadow-md"
          >
            Authenticate <ArrowRight className="ml-2 h-5 w-5" />
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-200">
          <p className="text-sm text-slate-500 font-semibold mb-3">Hackathon Testing Credentials:</p>
          <ul className="text-xs space-y-2 text-slate-600">
            {users.map(u => (
              <li key={u.id} className="flex justify-between items-center bg-slate-50 p-2 rounded border border-slate-100 cursor-pointer hover:bg-blue-50 transition-colors" onClick={() => setEmail(u.email)}>
                <span className="font-semibold text-brand-blue">{u.email}</span>
                <span className="bg-brand-saffron/10 text-brand-saffron px-2 py-0.5 rounded font-bold text-[10px] break-keep">{u.role}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
