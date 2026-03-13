import Link from "next/link";
import { Leaf, Trees, Map, ShieldCheck, FileText, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-brand-blue to-brand-light-blue text-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6">
            Welcome to PARIVESH 3.0
          </h1>
          <p className="text-lg md:text-xl max-w-3xl mb-10 text-blue-100">
            The Next-Gen Role Based Workflow System for Environmental Clearances. Transparent, efficient, and streamlined from filing to publishing Minutes of the Meeting.
          </p>
          
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/auth/register" className="bg-brand-saffron hover:bg-orange-500 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-transform hover:scale-105 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5" />
              Register as Project Proponent
            </Link>
            <Link href="/track" className="bg-white text-brand-blue font-bold py-3 px-8 rounded-full shadow-lg hover:bg-slate-50 transition-colors flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Track Your Proposal
            </Link>
          </div>
        </div>
      </section>

      {/* Clearances Grid */}
      <section id="clearances" className="py-16 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">Clearance Categories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <ClearanceCard 
              icon={<Leaf className="w-12 h-12 text-green-600" />} 
              title="Environmental Clearance" 
              desc="Approval for projects under EIA Notification, 2006." 
              link="/clearance/environmental"
            />
            <ClearanceCard 
              icon={<Trees className="w-12 h-12 text-emerald-700" />} 
              title="Forest Clearance" 
              desc="Diversion of forest land for non-forest purposes." 
              link="/clearance/forest"
            />
            <ClearanceCard 
              icon={<ShieldCheck className="w-12 h-12 text-yellow-600" />} 
              title="Wild Life Clearance" 
              desc="Projects involving National Parks and Sanctuaries." 
              link="/clearance/wildlife"
            />
            <ClearanceCard 
              icon={<Map className="w-12 h-12 text-blue-500" />} 
              title="CRZ Clearance" 
              desc="Activities located in the Coastal Regulation Zone." 
              link="/clearance/crz"
            />
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-brand-green/10 rounded-2xl p-8 md:p-12 border border-brand-green/20">
            <h2 className="text-2xl font-bold text-brand-green mb-4">Know Your Approval (KYA)</h2>
            <p className="text-slate-700 mb-6 max-w-2xl">
              Use our decision support tool to tentatively identify the green clearances required for your project based on the spatial location and other details.
            </p>
            <Link href="/kya" className="inline-flex items-center text-brand-green font-semibold hover:underline">
              Start KYA Assessment <ArrowRight className="ml-2 w-4 h-4"/>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function ClearanceCard({ icon, title, desc, link }: { icon: React.ReactNode, title: string, desc: string, link: string }) {
  return (
    <Link href={link} className="block group">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 h-full transition-all group-hover:shadow-md group-hover:border-brand-light-blue group-hover:-translate-y-1">
        <div className="mb-4 bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center group-hover:bg-blue-50 transition-colors">
          {icon}
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-brand-blue">{title}</h3>
        <p className="text-slate-600 text-sm">{desc}</p>
      </div>
    </Link>
  );
}
