import Link from "next/link";
import { UserCircle, ShieldCheck } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white shadow-sm">
      {/* Top Govt Bar */}
      <div className="bg-brand-green w-full px-4 py-1 flex justify-between items-center text-white text-xs">
        <div className="flex items-center space-x-2">
          <span className="font-medium tracking-wide">भारत सरकार | Government of India</span>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex space-x-1">
            <button className="h-5 w-5 bg-white/20 rounded text-center leading-none">A-</button>
            <button className="h-5 w-5 bg-white/20 rounded text-center leading-none">A</button>
            <button className="h-5 w-5 bg-white/20 rounded text-center leading-none">A+</button>
          </div>
          <span className="font-bold">English ▼</span>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center space-x-3">
            {/* Logo placeholder */}
            <div className="h-12 w-12 rounded-full bg-brand-green flex flex-col items-center justify-center text-[10px] text-white font-bold border-2 border-brand-saffron leading-tight">
              <span>CPC</span>
              <span>GREEN</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-brand-blue leading-none">PARIVESH 3.0</span>
              <span className="text-xs font-semibold text-brand-green mt-1">पर्यावरण, वन और जलवायु परिवर्तन मंत्रालय</span>
              <span className="text-xs text-slate-600">Ministry of Environment, Forest and Climate Change</span>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <Link href="/auth/login" className="flex items-center space-x-2 text-brand-blue hover:text-brand-light-blue transition-colors">
              <UserCircle className="h-6 w-6" />
              <span className="font-semibold text-sm">Login</span>
            </Link>
            <Link href="/auth/register" className="flex items-center space-x-2 bg-brand-blue text-white px-4 py-2 rounded-md hover:bg-brand-light-blue transition-colors shadow-sm">
              <ShieldCheck className="h-4 w-4" />
              <span className="font-semibold text-sm">Register</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Primary Navigation */}
      <nav className="bg-brand-blue text-white w-full shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ul className="flex space-x-8 text-sm font-medium py-3">
            <li><Link href="/" className="hover:text-brand-saffron transition-colors">Home</Link></li>
            <li><Link href="#clearances" className="hover:text-brand-saffron transition-colors">Clearance</Link></li>
            <li><Link href="/dashboard" className="hover:text-brand-saffron transition-colors">User Dashboard</Link></li>
            <li><Link href="/internal" className="hover:text-brand-saffron transition-colors">Internal Services</Link></li>
          </ul>
        </div>
      </nav>
    </header>
  );
}
