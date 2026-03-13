"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/store/useStore";
import { PlusCircle, FileText, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { ApplicationStatus, Application } from "@/types";

export default function PPDashboard() {
  const currentUser = useStore(state => state.currentUser);
  const applications = useStore(state => state.applications);
  
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Filter for only this PP's applications
  const myApplications = applications.filter(app => app.ppId === currentUser?.id);

  if (!isMounted) {
    return null;
  }

  const getStatusColor = (status: ApplicationStatus) => {
    switch (status) {
      case 'Draft': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'Submitted': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Under Scrutiny': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'EDS': return 'bg-red-50 text-red-700 border-red-200';
      case 'Referred': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'MoM Generated': return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'Finalized': return 'bg-green-50 text-green-700 border-green-200';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusIcon = (status: ApplicationStatus) => {
    switch(status) {
      case 'Finalized': return <CheckCircle className="w-4 h-4 mr-1" />;
      case 'EDS': return <AlertTriangle className="w-4 h-4 mr-1" />;
      case 'Draft': return <FileText className="w-4 h-4 mr-1" />;
      default: return <Clock className="w-4 h-4 mr-1" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-brand-blue">My Proposals</h1>
          <p className="text-slate-500 text-sm">Track and manage your environmental clearance applications</p>
        </div>
        <Link href="/dashboard/pp/new" className="bg-brand-green hover:bg-green-700 text-white px-6 py-2.5 rounded-md font-semibold flex items-center shadow-sm transition-colors">
          <PlusCircle className="mr-2 w-5 h-5" />
          File New Application
        </Link>
      </div>

      {myApplications.length === 0 ? (
        <div className="bg-white border text-center border-slate-200 border-dashed rounded-xl p-12 flex flex-col items-center">
          <div className="bg-slate-100 p-4 rounded-full mb-4">
            <FileText className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-700 mb-2">No Applications Found</h3>
          <p className="text-slate-500 max-w-sm">You haven't filed any applications yet. Click the button above to start your first proposal.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {myApplications.map((app) => (
            <div key={app.id} className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center space-x-3 gap-2">
                  <span className="font-mono text-sm font-bold text-brand-blue bg-blue-50 px-2 py-1 rounded">{app.id}</span>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full border flex items-center uppercase tracking-wide ${getStatusColor(app.status)}`}>
                    {getStatusIcon(app.status)} {app.status}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-800">{app.projectDetails.projectName || 'Untitled Project'}</h3>
                <div className="text-sm text-slate-500 flex items-center space-x-4">
                  <span>Category: <strong className="text-slate-700">{app.category}</strong></span>
                  <span>Sector: <strong className="text-slate-700">{app.sector}</strong></span>
                </div>
              </div>
              
              <div className="mt-4 md:mt-0 flex flex-col items-end space-y-2">
                 {app.status === 'Draft' && (
                    <Link href={`/dashboard/pp/payment/${app.id}`} className="text-sm font-semibold text-brand-saffron hover:underline">
                      Complete Payment →
                    </Link>
                 )}
                 {app.status === 'EDS' && (
                    <div className="text-sm text-red-600 bg-red-50 px-3 py-1 rounded border border-red-100">
                      <strong>Scrutiny Note:</strong> {app.edsComments}
                    </div>
                 )}
                 {app.status === 'Finalized' && (
                    <Link href={`/dashboard/pp/mom/${app.id}`} className="text-sm font-semibold text-brand-green hover:underline">
                      View Official MoM
                    </Link>
                 )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
