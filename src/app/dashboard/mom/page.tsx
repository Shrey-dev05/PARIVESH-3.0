"use client";

import { useStore } from "@/store/useStore";
import { useState } from "react";
import { Meeting } from "@/types";
import { FileDown, Edit3, Lock, CheckCircle2 } from "lucide-react";

export default function MomDashboard() {
  const meetings = useStore(state => state.meetings);
  const applications = useStore(state => state.applications);
  const updateMeeting = useStore(state => state.updateMeeting);

  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [editorContent, setEditorContent] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);

  const pendingMeetings = meetings.filter(m => !m.isLocked);
  const lockedMeetings = meetings.filter(m => m.isLocked);

  const handleSelectMeeting = (mtg: Meeting) => {
    setSelectedMeeting(mtg);
    setEditorContent(mtg.finalMomContent || mtg.gistContent);
  };

  const handlePublish = () => {
    if (!selectedMeeting) return;
    setIsPublishing(true);
    
    // Simulate generation delay
    setTimeout(() => {
      updateMeeting(selectedMeeting.id, editorContent, true);
      setIsPublishing(false);
      setSelectedMeeting(null);
    }, 1500);
  };

  // Helper to get app details
  const getAppDetails = (appId: string) => applications.find(a => a.id === appId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-140px)]">
      {/* Sidebar Queue */}
      <div className="lg:col-span-1 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col h-full overflow-hidden">
        <div className="p-4 bg-brand-blue text-white font-bold">MoM Secretariat Queue</div>
        
        <div className="flex-grow overflow-y-auto p-3 space-y-4">
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase mb-2">Pending Gists ({pendingMeetings.length})</h3>
            {pendingMeetings.length === 0 && <p className="text-sm text-slate-400 italic">No meetings pending.</p>}
            <div className="space-y-2">
              {pendingMeetings.map(m => {
                const app = getAppDetails(m.applicationId);
                return (
                  <div 
                    key={m.id} 
                    onClick={() => handleSelectMeeting(m)}
                    className={`p-3 rounded-lg border text-sm cursor-pointer transition-colors ${selectedMeeting?.id === m.id ? 'bg-blue-50 border-brand-blue' : 'bg-white border-slate-200 hover:border-brand-blue'}`}
                  >
                    <div className="font-bold text-slate-800">{app?.projectDetails.projectName}</div>
                    <div className="text-xs text-slate-500 mt-1 flex justify-between">
                       <span>{m.id}</span>
                       <span className="text-brand-saffron font-bold text-[10px] uppercase">Awaiting Edit</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div>
             <h3 className="text-xs font-bold text-slate-500 uppercase mt-4 mb-2">Finalized MoMs ({lockedMeetings.length})</h3>
             <div className="space-y-2">
              {lockedMeetings.map(m => {
                const app = getAppDetails(m.applicationId);
                return (
                  <div 
                    key={m.id} 
                    onClick={() => handleSelectMeeting(m)}
                    className={`p-3 rounded-lg border text-sm cursor-pointer bg-slate-50 transition-colors ${selectedMeeting?.id === m.id ? 'border-brand-blue' : 'border-slate-200'}`}
                  >
                    <div className="font-bold text-slate-700">{app?.projectDetails.projectName}</div>
                    <div className="text-xs text-green-600 mt-1 flex items-center font-bold">
                       <CheckCircle2 className="w-3 h-3 mr-1" /> Published
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Editor Main Area */}
      <div className="lg:col-span-3 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col h-full overflow-hidden animate-in slide-in-from-right-4">
         {!selectedMeeting ? (
           <div className="flex-grow flex flex-col items-center justify-center text-slate-400 p-8 text-center">
             <Edit3 className="w-16 h-16 mb-4 opacity-20" />
             <h2 className="text-xl font-bold text-slate-600">Minutes of Meeting Editor</h2>
             <p className="max-w-md mt-2">Select a pending Auto-Gist from the queue to refine the meeting minutes, or view a published MoM.</p>
           </div>
         ) : (
           <>
              <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                 <div>
                    <h2 className="font-bold text-lg text-brand-blue">
                       {getAppDetails(selectedMeeting.applicationId)?.projectDetails.projectName || 'Unknown Project'}
                    </h2>
                    <p className="text-xs font-mono text-slate-500">Ref: {selectedMeeting.id} | App: {selectedMeeting.applicationId}</p>
                 </div>
                 {selectedMeeting.isLocked ? (
                   <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full flex items-center border border-green-200">
                     <Lock className="w-3 h-3 mr-1" /> Locked (Read-Only)
                   </span>
                 ) : (
                   <span className="bg-brand-saffron/10 text-brand-saffron text-xs font-bold px-3 py-1 rounded-full border border-brand-saffron/20">
                     Draft Mode
                   </span>
                 )}
              </div>

              <div className="flex-grow p-4 overflow-y-auto bg-slate-100/50">
                 <textarea
                   value={editorContent}
                   onChange={e => setEditorContent(e.target.value)}
                   disabled={selectedMeeting.isLocked}
                   className="w-full h-full min-h-[400px] p-6 border border-slate-300 rounded-lg shadow-inner focus:outline-none focus:ring-2 focus:ring-brand-blue disabled:bg-slate-50 disabled:text-slate-700 resize-none font-serif leading-relaxed"
                 />
              </div>

              <div className="p-4 border-t border-slate-200 bg-white flex justify-between items-center">
                 {selectedMeeting.isLocked ? (
                   <>
                     <p className="text-sm font-semibold text-slate-500 flex items-center">
                       <CheckCircle2 className="w-4 h-4 mr-2 text-brand-green" /> 
                       This MoM has been published and cannot be altered.
                     </p>
                     <div className="flex space-x-3">
                        <button className="flex items-center space-x-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold border border-slate-300 transition-colors">
                          <FileDown className="w-4 h-4" /> <span>Export PDF</span>
                        </button>
                        <button className="flex items-center space-x-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded font-semibold border border-blue-200 transition-colors">
                          <FileDown className="w-4 h-4" /> <span>Export DOCX</span>
                        </button>
                     </div>
                   </>
                 ) : (
                   <>
                     <p className="text-sm text-slate-500">Refine the auto-generated gist based on actual discussions.</p>
                     <button
                       onClick={handlePublish}
                       disabled={isPublishing}
                       className="bg-brand-green hover:bg-green-700 text-white font-bold py-2.5 px-6 rounded shadow-sm flex items-center transition-colors focus:ring-4 focus:ring-green-100"
                     >
                       {isPublishing ? 'Generatng Documents...' : (
                         <>Publish & Lock MoM <Lock className="ml-2 w-4 h-4" /></>
                       )}
                     </button>
                   </>
                 )}
              </div>
           </>
         )}
      </div>
    </div>
  );
}
