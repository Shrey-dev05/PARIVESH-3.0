"use client";

import { useStore } from "@/store/useStore";
import { MasterTemplate, Category } from "@/types";
import { useState } from "react";
import { Settings, Save, PlusCircle, FileText } from "lucide-react";

export default function AdminDashboard() {
  const templates = useStore(state => state.templates);
  // In a real app we'd have actions to update templates in the store. 
  // For this mock we just show the capability.
  
  const [activeTab, setActiveTab] = useState<'templates'|'roles'>('templates');
  const [selectedTemplate, setSelectedTemplate] = useState<MasterTemplate | null>(templates[0] || null);
  const [editContent, setEditContent] = useState(selectedTemplate?.templateContent || "");

  const handleSelect = (t: MasterTemplate) => {
    setSelectedTemplate(t);
    setEditContent(t.templateContent);
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm min-h-[600px] flex flex-col overflow-hidden">
      <div className="bg-slate-800 text-white p-4 flex justify-between items-center">
        <h2 className="text-xl font-bold flex items-center"><Settings className="w-5 h-5 mr-2" /> System Administration</h2>
        
        <div className="flex bg-slate-700 rounded-md p-1">
           <button onClick={() => setActiveTab('templates')} className={`px-4 py-1.5 text-sm rounded font-medium transition-colors ${activeTab === 'templates' ? 'bg-slate-900 shadow-sm text-white' : 'text-slate-300 hover:text-white'}`}>
             Master Templates
           </button>
           <button onClick={() => setActiveTab('roles')} className={`px-4 py-1.5 text-sm rounded font-medium transition-colors ${activeTab === 'roles' ? 'bg-slate-900 shadow-sm text-white' : 'text-slate-300 hover:text-white'}`}>
             Role Management
           </button>
        </div>
      </div>

      <div className="flex-grow flex">
         {activeTab === 'templates' && (
           <>
              <div className="w-1/3 border-r border-slate-200 bg-slate-50 p-4 overflow-y-auto">
                 <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-slate-700">Auto-Gist Templates</h3>
                    <button className="text-brand-blue hover:text-brand-light-blue p-1 rounded-full"><PlusCircle className="w-5 h-5"/></button>
                 </div>
                 <div className="space-y-2">
                   {templates.map(t => (
                     <div 
                       key={t.id} 
                       onClick={() => handleSelect(t)}
                       className={`p-3 border rounded cursor-pointer transition-colors ${selectedTemplate?.id === t.id ? 'bg-blue-50 border-brand-blue' : 'bg-white border-slate-200 hover:border-brand-blue/50'}`}
                     >
                       <div className="font-bold text-slate-800 flex justify-between">
                         {t.sectorType} 
                         <span className="bg-brand-saffron/10 text-brand-saffron px-2 py-[1px] rounded text-[10px] uppercase">Cat {t.category}</span>
                       </div>
                       <div className="text-xs text-slate-500 font-mono mt-1">{t.id}</div>
                     </div>
                   ))}
                 </div>
              </div>
              <div className="w-2/3 p-6 flex flex-col bg-slate-100/30">
                 {selectedTemplate && (
                   <>
                     <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-lg text-brand-blue">Edit Template: {selectedTemplate.id}</h3>
                        <button className="bg-brand-blue hover:bg-brand-light-blue text-white px-4 py-2 rounded font-semibold text-sm flex items-center transition-colors">
                           <Save className="w-4 h-4 mr-2"/> Save Changes
                        </button>
                     </div>
                     <div className="bg-blue-50 border border-blue-100 p-3 rounded mb-4 text-xs font-mono text-blue-800 flex items-center">
                        <FileText className="w-4 h-4 mr-2" />
                        Variables: {"{{projectName}}, {{location}}, {{companyName}}, {{area}}, {{cost}}"}
                     </div>
                     <textarea 
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="flex-grow w-full p-4 font-mono text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-brand-blue resize-none shadow-inner"
                     />
                   </>
                 )}
              </div>
           </>
         )}

         {activeTab === 'roles' && (
            <div className="p-8 w-full flex flex-col items-center justify-center text-slate-500 bg-slate-50">
               <Settings className="w-16 h-16 mb-4 opacity-20" />
               <h3 className="text-xl font-bold text-slate-700">Role Provider (Mock)</h3>
               <p className="max-w-md text-center mt-2">In production, this module handles Active Directory syncing and programmatic provisioning for Scrutiny and MoM Secretariat team members.</p>
            </div>
         )}
      </div>
    </div>
  );
}
