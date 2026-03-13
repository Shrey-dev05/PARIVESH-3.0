"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import { Category } from "@/types";
import { Check, ChevronRight, FileText, Map, Info, Upload } from "lucide-react";

export default function NewApplicationForm() {
  const router = useRouter();
  const createApplication = useStore(state => state.createApplication);
  const currentUser = useStore(state => state.currentUser);

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    projectName: "",
    category: "A" as Category,
    sector: "Mining",
    location: "",
    area: "",
    cost: "",
    description: ""
  });

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  const handleNext = () => setStep(prev => prev + 1);
  const handlePrev = () => setStep(prev => prev - 1);

  if (!isMounted) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    createApplication({
      ppId: currentUser.id,
      category: formData.category,
      sector: formData.sector,
      projectDetails: {
        projectName: formData.projectName,
        location: formData.location,
        companyName: currentUser.organization || currentUser.name,
        area: formData.area,
        cost: formData.cost,
        description: formData.description
      }
    });

    // Optionally redirect straight to payment or back to dashboard
    router.push("/dashboard");
  };

  const StepIndicator = () => (
    <div className="flex items-center justify-between mb-8 relative">
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 -z-10 rounded"></div>
      <div className={`absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-brand-green -z-10 rounded transition-all duration-300`} style={{ width: `${(step - 1) * 33.33}%` }}></div>
      
      {[
        { num: 1, label: 'General', icon: <Info className="w-4 h-4" /> },
        { num: 2, label: 'Location', icon: <Map className="w-4 h-4" /> },
        { num: 3, label: 'Parameters', icon: <FileText className="w-4 h-4" /> },
        { num: 4, label: 'Documents', icon: <Upload className="w-4 h-4" /> }
      ].map(s => (
        <div key={s.num} className="flex flex-col items-center">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center border-[3px] ${step >= s.num ? 'bg-brand-green border-brand-green text-white shadow-md' : 'bg-white border-slate-300 text-slate-400'}`}>
            {step > s.num ? <Check className="w-5 h-5" /> : s.icon}
          </div>
          <span className={`mt-2 text-xs font-bold ${step >= s.num ? 'text-brand-green' : 'text-slate-500'}`}>{s.label}</span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="bg-slate-50 px-8 py-6 border-b border-slate-200">
        <h2 className="text-2xl font-bold text-brand-blue">File New Application</h2>
        <p className="text-slate-500">Complete all required steps to submit your proposal for environmental clearance.</p>
      </div>

      <div className="p-8">
        <StepIndicator />

        <form onSubmit={step === 4 ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }}>
          {/* Step 1: General Info */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <h3 className="text-lg font-bold text-slate-800 border-b pb-2">1. General Information</h3>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Project Name <span className="text-red-500">*</span></label>
                <input 
                  type="text" required
                  value={formData.projectName}
                  onChange={e => setFormData({...formData, projectName: e.target.value})}
                  className="w-full px-4 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-blue"
                  placeholder="e.g. Expansion of Thermal Power Plant"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Category <span className="text-red-500">*</span></label>
                  <select 
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value as Category})}
                    className="w-full px-4 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-blue bg-white"
                  >
                    <option value="A">Category A (Central Gov)</option>
                    <option value="B1">Category B1 (State Gov - SEIAA)</option>
                    <option value="B2">Category B2 (State Gov - SEIAA)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Sector <span className="text-red-500">*</span></label>
                  <select 
                    value={formData.sector}
                    onChange={e => setFormData({...formData, sector: e.target.value})}
                    className="w-full px-4 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-blue bg-white"
                  >
                    <option value="Mining">Mining</option>
                    <option value="Infrastructure">Infrastructure</option>
                    <option value="Thermal Power">Thermal Power</option>
                    <option value="Industrial Estate">Industrial Estate</option>
                  </select>
                </div>
              </div>

              <div>
                 <label className="block text-sm font-semibold text-slate-700 mb-1">Brief Description</label>
                 <textarea 
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    className="w-full px-4 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-blue h-24"
                    placeholder="Provide a short summary of the proposal..."
                 />
              </div>
            </div>
          )}

          {/* Step 2: Location */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <h3 className="text-lg font-bold text-slate-800 border-b pb-2">2. Spatial Location</h3>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Full Location Address <span className="text-red-500">*</span></label>
                <textarea 
                  required
                  value={formData.location}
                  onChange={e => setFormData({...formData, location: e.target.value})}
                  className="w-full px-4 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-blue h-24"
                  placeholder="Village, Tehsil, District, State..."
                />
              </div>

              <div className="bg-blue-50 p-4 rounded-md border border-blue-100 flex items-start space-x-3">
                 <Map className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                 <div>
                    <h4 className="font-semibold text-blue-800 text-sm">Upload KML/SHP File</h4>
                    <p className="text-xs text-blue-600 mt-1">For verification on PARIVESH GIS DSS module, upload boundary coordinates.</p>
                    <input type="file" className="mt-3 text-sm" accept=".kml,.shp,.zip" />
                 </div>
              </div>
            </div>
          )}

          {/* Step 3: Parameters */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <h3 className="text-lg font-bold text-slate-800 border-b pb-2">3. Technical Parameters</h3>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Proposed Area (Hectares) <span className="text-red-500">*</span></label>
                  <input 
                    type="number" required min="0" step="0.01"
                    value={formData.area}
                    onChange={e => setFormData({...formData, area: e.target.value})}
                    className="w-full px-4 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-blue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Estimated Cost (Rs. Crores) <span className="text-red-500">*</span></label>
                  <input 
                    type="number" required min="0" step="0.01"
                    value={formData.cost}
                    onChange={e => setFormData({...formData, cost: e.target.value})}
                    className="w-full px-4 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-blue"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Documents & Finalize */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <h3 className="text-lg font-bold text-slate-800 border-b pb-2">4. Document Uploads (Mock)</h3>
              
              <div className="space-y-3">
                 <div className="flex border border-slate-200 rounded p-3 justify-between items-center bg-slate-50">
                    <span className="text-sm font-semibold text-slate-700">1. Pre-Feasibility Report (PFR) <span className="text-red-500">*</span></span>
                    <input type="file" className="text-sm w-64" />
                 </div>
                 <div className="flex border border-slate-200 rounded p-3 justify-between items-center bg-slate-50">
                    <span className="text-sm font-semibold text-slate-700">2. Form-1 / Form-1A <span className="text-red-500">*</span></span>
                    <input type="file" className="text-sm w-64" />
                 </div>
                 <div className="flex border border-slate-200 rounded p-3 justify-between items-center bg-slate-50">
                    <span className="text-sm font-semibold text-slate-700">3. Proof of Ownership</span>
                    <input type="file" className="text-sm w-64" />
                 </div>
              </div>

              <div className="bg-yellow-50 p-4 border border-yellow-200 rounded text-sm text-yellow-800 font-medium">
                 Acknowledgement: By submitting this application, I declare that the project data provided is accurate and adheres to the EIA Notification 2006.
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-8 pt-6 border-t border-slate-200 flex justify-between">
            <button 
              type="button" 
              onClick={handlePrev} 
              disabled={step === 1}
              className={`px-6 py-2 rounded font-semibold ${step === 1 ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'}`}
            >
              Back
            </button>
            
            <button 
              type="submit"
              className="px-6 py-2 rounded font-bold bg-brand-blue text-white hover:bg-brand-light-blue flex items-center transition-colors"
            >
              {step === 4 ? (
                 <>Submit Application <Check className="ml-2 w-4 h-4" /></>
              ) : (
                 <>Save & Continue <ChevronRight className="ml-2 w-4 h-4" /></>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
