"use client";

import { useStore } from "@/store/useStore";
import { useRouter } from "next/navigation";
import { useState } from "react";
import React from 'react';
import { QrCode, CreditCard, Building, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function PaymentPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = React.use(params);
  
  const applications = useStore(state => state.applications);
  const payFee = useStore(state => state.payFee);
  
  const app = applications.find(a => a.id === id);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!app) return <div>Application not found.</div>;

  const handleMockPayment = () => {
    setIsProcessing(true);
    // Simulate API delay
    setTimeout(() => {
      const mockRef = `TXN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      payFee(app.id, mockRef);
      setIsProcessing(false);
      setIsSuccess(true);
      
      // Redirect after success
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    }, 1500);
  };

  if (isSuccess) {
    return (
      <div className="max-w-2xl mx-auto bg-white p-12 rounded-xl border border-slate-200 text-center shadow-sm">
         <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
         </div>
         <h2 className="text-3xl font-bold text-slate-800 mb-2">Payment Successful!</h2>
         <p className="text-slate-500 mb-6">Your application is now marked as 'Submitted' and routed for Scrutiny.</p>
         <p className="text-sm font-mono bg-slate-100 p-2 rounded inline-block">Ref: {app.paymentReferenceId || 'TXN-WAITING'}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
       {/* Invoice Details */}
       <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center space-x-3 border-b pb-4 mb-6">
             <ShieldCheck className="w-8 h-8 text-brand-blue" />
             <div>
                <h2 className="text-xl font-bold text-brand-blue">Application Fee</h2>
                <p className="text-xs text-slate-500">Non-Refundable Processing Fee</p>
             </div>
          </div>

          <div className="space-y-4 text-sm">
             <div className="flex justify-between">
                <span className="text-slate-500">Proposal No:</span>
                <span className="font-bold font-mono">{app.id}</span>
             </div>
             <div className="flex justify-between">
                <span className="text-slate-500">Project Name:</span>
                <span className="font-bold text-right max-w-[200px] truncate">{app.projectDetails.projectName}</span>
             </div>
             <div className="flex justify-between">
                <span className="text-slate-500">Category:</span>
                <span className="font-bold">{app.category}</span>
             </div>
             <div className="flex justify-between pt-4 border-t border-dashed">
                <span className="text-lg font-bold text-slate-800">Total Amount Payable:</span>
                <span className="text-xl font-bold text-brand-green">₹ 15,000.00</span>
             </div>
          </div>
       </div>

       {/* Payment Gateway Mock */}
       <div className="bg-slate-50 p-8 rounded-xl border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Select Payment Method (Mock)</h3>
          
          <div className="space-y-3 mb-8">
             <button onClick={handleMockPayment} disabled={isProcessing} className="w-full flex items-center justify-between p-4 bg-white border border-brand-light-blue rounded-lg shadow-sm hover:border-brand-blue hover:shadow focus:outline-none focus:ring-2 focus:ring-brand-blue transition-all">
                <div className="flex items-center space-x-3">
                   <QrCode className="w-6 h-6 text-brand-blue" />
                   <span className="font-bold text-slate-700">UPI / QR Code</span>
                </div>
                <span className="text-xs font-bold bg-brand-saffron text-white px-2 py-0.5 rounded">Fastest</span>
             </button>

             <button disabled className="w-full flex items-center justify-between p-4 bg-white opacity-50 cursor-not-allowed border border-slate-200 rounded-lg">
                <div className="flex items-center space-x-3">
                   <CreditCard className="w-6 h-6 text-slate-500" />
                   <span className="font-bold text-slate-500">Credit / Debit Card</span>
                </div>
             </button>

             <button disabled className="w-full flex items-center justify-between p-4 bg-white opacity-50 cursor-not-allowed border border-slate-200 rounded-lg">
                <div className="flex items-center space-x-3">
                   <Building className="w-6 h-6 text-slate-500" />
                   <span className="font-bold text-slate-500">Net Banking</span>
                </div>
             </button>
          </div>

          <div className="text-center text-xs text-slate-500">
             <p>{isProcessing ? "Processing via Mock Gateway..." : "Click UPI to simulate successful payment and application submission."}</p>
          </div>
       </div>
    </div>
  );
}
