"use client";

import { useStore } from "@/store/useStore";
import { ApplicationStatus, Application } from "@/types";
import { useState, useEffect } from "react";
import { CheckCircle, AlertTriangle, Search, FileText, ArrowRight } from "lucide-react";

export default function ScrutinyDashboard() {
  const applications = useStore(state => state.applications);
  const updateStatus = useStore(state => state.updateApplicationStatus);
  const generateGist = useStore(state => state.generateGist);
  
  // Scrutiny team only sees Submitted apps (pending review) or those they've already checked
  const scrutinyApps = applications.filter(app => 
    app.status === 'Submitted' || app.status === 'EDS' || app.status === 'Under Scrutiny' || app.status === 'Referred'
  ).reverse();

  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [edsNote, setEdsNote] = useState("");
  const [activeTab, setActiveTab] = useState<'pending' | 'processed'>('pending');

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  const pendingApps = scrutinyApps.filter(app => app.status === 'Submitted' || app.status === 'Under Scrutiny');
  const processedApps = scrutinyApps.filter(app => app.status === 'EDS' || app.status === 'Referred');

  if (!isMounted) return null;

  const handleReviewClick = (app: Application) => {
    setSelectedApp(app);
    if (app.status === 'Submitted') {
      updateStatus(app.id, 'Under Scrutiny');
    }
  };

  const handleFlagEDS = () => {
    if (!selectedApp || !edsNote) return;
    updateStatus(selectedApp.id, 'EDS', edsNote);
    setSelectedApp(null);
    setEdsNote("");
  };

  const handleApproveAndRefer = () => {
    if (!selectedApp) return;
    // 1. Move status to Referred & 2. Auto-generate the Gist from templates
    generateGist(selectedApp.id);
    setSelectedApp(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className={`${selectedApp ? 'lg:col-span-1 border-r' : 'lg:col-span-3'} bg-white rounded-xl shadow-sm border border-slate-200 min-h-[600px] flex flex-col`}>
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 rounded-t-xl">
           <h2 className="font-bold text-slate-800 text-lg">Scrutiny Queue</h2>
           <div className="flex bg-slate-200 rounded-md p-1">
             <button onClick={() => setActiveTab('pending')} className={`px-3 py-1 text-sm rounded transition-colors ${activeTab === 'pending' ? 'bg-white shadow-sm font-bold text-brand-blue' : 'text-slate-600'}`}>
               Pending ({pendingApps.length})
             </button>
             <button onClick={() => setActiveTab('processed')} className={`px-3 py-1 text-sm rounded transition-colors ${activeTab === 'processed' ? 'bg-white shadow-sm font-bold text-brand-blue' : 'text-slate-600'}`}>
               Processed ({processedApps.length})
             </button>
           </div>
        </div>

        <div className="p-4 overflow-y-auto flex-grow space-y-3">
           {(activeTab === 'pending' ? pendingApps : processedApps).length === 0 ? (
             <p className="text-center text-slate-500 py-10">No applications in this queue.</p>
           ) : (
             (activeTab === 'pending' ? pendingApps : processedApps).map(app => (
               <div 
                 key={app.id} 
                 onClick={() => handleReviewClick(app)}
                 className={`p-4 rounded-lg border cursor-pointer hover:border-brand-blue transition-colors ${selectedApp?.id === app.id ? 'border-brand-blue bg-blue-50' : 'border-slate-200 bg-white'}`}
               >
                 <div className="flex justify-between items-start mb-2">
                   <span className="font-mono text-xs font-bold text-brand-blue bg-blue-100 px-2 py-0.5 rounded">{app.id}</span>
                   <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${app.status === 'Submitted' ? 'bg-blue-100 text-blue-700' : app.status === 'EDS' ? 'bg-red-100 text-red-700' : app.status === 'Referred' ? 'bg-orange-100 text-orange-700' : 'bg-purple-100 text-purple-700'}`}>
                     {app.status}
                   </span>
                 </div>
                 <h3 className="font-bold text-slate-800 text-sm truncate">{app.projectDetails.projectName}</h3>
                 <p className="text-xs text-slate-500 mt-1">{app.projectDetails.companyName} | Cat: {app.category}</p>
               </div>
             ))
           )}
        </div>
      </div>

      {selectedApp && (
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col h-full animate-in slide-in-from-right-8">
           <div className="flex justify-between items-center mb-6 pb-4 border-b">
              <div>
                 <h2 className="text-2xl font-bold text-slate-800">{selectedApp.projectDetails.projectName}</h2>
                 <p className="text-sm font-mono text-brand-blue mt-1">{selectedApp.id}</p>
              </div>
              <span className="bg-brand-saffron/10 text-brand-saffron px-3 py-1 rounded font-bold border border-brand-saffron/20 text-sm">
                Cat {selectedApp.category} - {selectedApp.sector}
              </span>
           </div>

           <div className="grid grid-cols-2 gap-4 mb-6">
             <div className="bg-slate-50 p-4 rounded border border-slate-100">
               <p className="text-xs text-slate-500 font-bold uppercase mb-1">Company</p>
               <p className="text-sm font-semibold">{selectedApp.projectDetails.companyName}</p>
             </div>
             <div className="bg-slate-50 p-4 rounded border border-slate-100">
               <p className="text-xs text-slate-500 font-bold uppercase mb-1">Location</p>
               <p className="text-sm font-semibold truncate" title={selectedApp.projectDetails.location}>{selectedApp.projectDetails.location}</p>
             </div>
             <div className="bg-slate-50 p-4 rounded border border-slate-100">
               <p className="text-xs text-slate-500 font-bold uppercase mb-1">Area / Investment</p>
               <p className="text-sm font-semibold">{selectedApp.projectDetails.area} Ha / Rs. {selectedApp.projectDetails.cost} Cr</p>
             </div>
             <div className="bg-slate-50 p-4 rounded border border-slate-100 flex items-center justify-between">
               <div>
                  <p className="text-xs text-slate-500 font-bold uppercase mb-1">Fee Status</p>
                  <p className="text-sm font-bold text-brand-green">PAID</p>
               </div>
               <FileText className="w-6 h-6 text-slate-400" />
             </div>
           </div>

           {selectedApp.status === 'Under Scrutiny' || selectedApp.status === 'Submitted' ? (
             <div className="mt-auto space-y-6 pt-6 border-t">
               <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                  <h3 className="text-sm font-bold text-red-800 flex items-center mb-2"><AlertTriangle className="w-4 h-4 mr-2"/> Flag as EDS (Essential Details Sought)</h3>
                  <textarea 
                    value={edsNote}
                    onChange={(e) => setEdsNote(e.target.value)}
                    placeholder="Describe the missing documents or discrepancies..."
                    className="w-full text-sm p-3 rounded border border-red-200 focus:outline-none focus:border-red-400 mb-3"
                  />
                  <button 
                    disabled={!edsNote} 
                    onClick={handleFlagEDS}
                    className="bg-red-600 hover:bg-red-700 text-white text-sm font-bold py-2 px-4 rounded disabled:opacity-50 transition-colors"
                  >
                    Return to Applicant (EDS)
                  </button>
               </div>

               <div className="bg-brand-green/10 p-4 rounded-lg border border-brand-green/20 flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-bold text-green-800 flex items-center mb-1"><CheckCircle className="w-4 h-4 mr-2"/> Documents Verified</h3>
                    <p className="text-xs text-green-700">Approve this application and refer it to the EAC/SEAC. This will auto-generate the Draft Gist for the meeting.</p>
                  </div>
                  <button 
                    onClick={handleApproveAndRefer}
                    className="bg-brand-green hover:bg-green-700 text-white text-sm font-bold py-3 px-6 rounded shadow-sm flex items-center transition-colors flex-shrink-0 ml-4"
                  >
                    Refer to Meeting <ArrowRight className="w-4 h-4 ml-2"/>
                  </button>
               </div>
             </div>
           ) : (
             <div className="mt-auto pt-6 border-t text-center">
                <div className="inline-block bg-slate-100 text-slate-600 px-6 py-3 rounded-full font-bold border border-slate-200">
                  Application Processed ({selectedApp.status})
                </div>
             </div>
           )}
        </div>
      )}
    </div>
  );
}
