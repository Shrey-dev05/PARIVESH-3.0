"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import { Application, ApplicationStatus, Category, User } from "@/types";
import {
  PlusCircle, FileText, CheckCircle, Clock, AlertTriangle,
  LayoutDashboard, ListOrdered, User as UserIcon, MessageCircle, X, Send,
  ChevronRight, Check, Info, Map, Upload, Download, ArrowRight
} from "lucide-react";

// ─── CONSTANTS ───────────────────────────────────────────────────────────────

const STATUS_FLOW: ApplicationStatus[] = ["Draft", "Submitted", "Under Scrutiny", "EDS", "Referred", "MoM Generated", "Finalized"];

const STATUS_STYLES: Record<ApplicationStatus, { bg: string; text: string; dot: string }> = {
  "Draft":          { bg: "bg-slate-100", text: "text-slate-600",  dot: "bg-slate-400" },
  "Submitted":      { bg: "bg-blue-50",   text: "text-blue-700",   dot: "bg-blue-500" },
  "Under Scrutiny": { bg: "bg-purple-50", text: "text-purple-700", dot: "bg-purple-500" },
  "EDS":            { bg: "bg-red-50",    text: "text-red-700",    dot: "bg-red-500" },
  "Referred":       { bg: "bg-orange-50", text: "text-orange-700", dot: "bg-orange-500" },
  "MoM Generated":  { bg: "bg-cyan-50",   text: "text-cyan-700",   dot: "bg-cyan-500" },
  "Finalized":      { bg: "bg-green-50",  text: "text-green-700",  dot: "bg-green-500" },
};

const SECTORS = ["Mining", "Infrastructure", "Thermal Power", "River Valley & Hydroelectric", "Nuclear Power", "Industrial Estate", "Tourism"];
const CATEGORIES: { id: Category; label: string; desc: string; color: string }[] = [
  { id: "A",  label: "Category A",  desc: "Projects of national significance – Central clearance", color: "#dc2626" },
  { id: "B1", label: "Category B1", desc: "Medium scale – State level appraisal (SEAC/SEIAA)",    color: "#d97706" },
  { id: "B2", label: "Category B2", desc: "Minor projects with general environmental conditions",  color: "#16a34a" },
];

const CAT_TAG: Record<Category, string> = {
  A:  "bg-red-100 text-red-800",
  B1: "bg-amber-100 text-amber-800",
  B2: "bg-green-100 text-green-800",
};

// ─── SHARED COMPONENTS ────────────────────────────────────────────────────────

const StatusBadge = ({ status }: { status: ApplicationStatus }) => {
  const s = STATUS_STYLES[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
};

const CatBadge = ({ cat }: { cat: Category }) => (
  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${CAT_TAG[cat]}`}>{cat}</span>
);

const WorkflowTimeline = ({ current }: { current: ApplicationStatus }) => {
  const idx = STATUS_FLOW.indexOf(current);
  return (
    <div className="flex items-start overflow-x-auto py-3 gap-0">
      {STATUS_FLOW.map((s, i) => {
        const done = i < idx, active = i === idx;
        return (
          <div key={s} className="flex items-start">
            <div className="flex flex-col items-center min-w-[72px]">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 text-white
                ${done ? "bg-brand-blue border-brand-blue" : active ? "bg-brand-saffron border-brand-saffron" : "bg-white border-slate-300 text-slate-400"}`}>
                {done ? <Check className="w-4 h-4" /> : <span className={active ? "text-white" : "text-slate-400"}>{i + 1}</span>}
              </div>
              <span className={`mt-1.5 text-[9px] font-semibold text-center leading-tight ${done ? "text-brand-blue" : active ? "text-brand-saffron" : "text-slate-400"}`}>
                {s}
              </span>
            </div>
            {i < STATUS_FLOW.length - 1 && (
              <div className={`h-0.5 w-8 mt-4 flex-shrink-0 ${done ? "bg-brand-blue" : "bg-slate-200"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
};

// ─── CHATBOT ─────────────────────────────────────────────────────────────────

const BOT_REPLIES: Record<string, string> = {
  documents: "For Category A projects, you need:\n1. Project Report\n2. Environmental Impact Assessment (EIA)\n3. Land Acquisition Documents\n4. Public Hearing Records\n5. NOC from State Pollution Control Board",
  category:  "Categories:\n• Category A: National importance (Central clearance)\n• Category B1: Medium scale (State appraisal)\n• Category B2: Minor projects (General conditions)",
  steps:     "Application Steps:\n1. Fill project info\n2. Select Category & Sector\n3. Upload documents\n4. Make payment\n5. Submit for scrutiny",
  payment:   "Payment:\n• Process the mock fee after saving a Draft\n• Click 'Complete Payment →' on the dashboard card",
  eds:       "EDS = Essential Document Sought.\nScrutiny may raise EDS if documents are missing. Respond within 30 days.",
  status:    "Status Flow:\nDraft → Submitted → Under Scrutiny → EDS → Referred → MoM Generated → Finalized",
  default:   "I can help with:\n• Required documents\n• Application steps\n• Payment process\n• Category selection\n• EDS queries\n• Status info\n\nType a keyword like 'documents', 'steps', 'category', etc.",
};

const Chatbot = () => {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([{ role: "bot", text: "Hello! I'm PARIVESH Assistant 🌿\nHow can I help with your EC application today?" }]);
  const [input, setInput] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => { if (ref.current) ref.current.scrollTop = ref.current.scrollHeight; }, [msgs]);

  const send = () => {
    if (!input.trim()) return;
    const q = input.toLowerCase();
    const key = Object.keys(BOT_REPLIES).find(k => q.includes(k));
    setMsgs(m => [...m, { role: "user", text: input }, { role: "bot", text: BOT_REPLIES[key || "default"] }]);
    setInput("");
  };

  return (
    <>
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-brand-blue text-white shadow-xl flex items-center justify-center z-50 hover:bg-brand-light-blue transition-all hover:scale-110"
      >
        {open ? <X className="w-5 h-5" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 w-80 h-[440px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col z-50 overflow-hidden">
          <div className="bg-gradient-to-r from-brand-blue to-brand-light-blue px-4 py-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-brand-saffron flex items-center justify-center text-lg">🌿</div>
            <div>
              <div className="text-sm font-bold text-white">PARIVESH Assistant</div>
              <div className="text-[10px] text-white/70">Online • EC Help</div>
            </div>
          </div>
          <div ref={ref} className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
            {msgs.map((m, i) => (
              <div key={i} className={`max-w-[85%] px-3 py-2 rounded-xl text-xs whitespace-pre-wrap leading-relaxed
                ${m.role === "bot" ? "bg-blue-50 text-slate-800 rounded-tl-sm" : "bg-brand-blue text-white ml-auto rounded-tr-sm"}`}>
                {m.text}
              </div>
            ))}
          </div>
          <div className="flex gap-2 p-3 border-t border-slate-200">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && send()}
              placeholder="Ask about documents, steps..."
              className="flex-1 text-xs px-3 py-2 border border-slate-200 rounded-full focus:outline-none focus:border-brand-blue"
            />
            <button onClick={send} className="w-8 h-8 rounded-full bg-brand-blue flex items-center justify-center text-white">
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

// ─── VIEW: DASHBOARD ──────────────────────────────────────────────────────────

const DashboardView = ({ apps, currentUser, setView, setDetailApp }: {
  apps: Application[];
  currentUser: User;
  setView: (v: string) => void;
  setDetailApp: (a: Application) => void;
}) => {
  const edsCount = apps.filter(a => a.status === "EDS").length;
  const stats = [
    { label: "Total Applications", value: apps.length,   icon: "📋", bg: "bg-blue-50",   text: "text-blue-600" },
    { label: "Drafts",             value: apps.filter(a => a.status === "Draft").length,   icon: "✏️", bg: "bg-slate-100", text: "text-slate-600" },
    { label: "Under Review",       value: apps.filter(a => ["Submitted","Under Scrutiny"].includes(a.status)).length, icon: "🔍", bg: "bg-amber-50",  text: "text-amber-600" },
    { label: "EDS Pending",        value: edsCount,       icon: "⚠️", bg: "bg-red-50",    text: "text-red-600" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-blue">Welcome, {currentUser.name}</h1>
          <p className="text-slate-500 text-sm mt-1">Project Proponent Portal — Environmental Clearance System</p>
        </div>
        <button onClick={() => setView("new")} className="bg-brand-green hover:bg-green-700 text-white px-5 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 shadow-sm transition-colors">
          <PlusCircle className="w-4 h-4" /> New Application
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center gap-3">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl ${s.bg}`}>{s.icon}</div>
            <div>
              <div className={`text-2xl font-bold ${s.text}`}>{s.value}</div>
              <div className="text-xs text-slate-500">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* EDS Alert */}
      {edsCount > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-sm text-red-700">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span>You have <strong>{edsCount}</strong> application(s) with Essential Documents Sought (EDS). Please respond within 30 days.</span>
        </div>
      )}

      {/* Recent Apps Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="font-bold text-slate-800">Recent Applications</h2>
          <button onClick={() => setView("list")} className="text-xs font-semibold text-brand-blue hover:underline">View All →</button>
        </div>
        <div className="overflow-x-auto">
          {apps.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <FileText className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p>No applications yet. Click "New Application" to get started.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-5 py-3 text-left">Application ID</th>
                  <th className="px-5 py-3 text-left">Project Name</th>
                  <th className="px-5 py-3 text-left">Category</th>
                  <th className="px-5 py-3 text-left">Sector</th>
                  <th className="px-5 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {apps.slice().reverse().map(app => (
                  <tr key={app.id} onClick={() => { setDetailApp(app); setView("detail"); }}
                    className="border-b border-slate-100 last:border-0 hover:bg-blue-50/50 cursor-pointer transition-colors">
                    <td className="px-5 py-3.5 font-mono text-xs font-bold text-brand-blue">{app.id}</td>
                    <td className="px-5 py-3.5 font-semibold text-slate-800">{app.projectDetails.projectName || "Untitled"}</td>
                    <td className="px-5 py-3.5"><CatBadge cat={app.category} /></td>
                    <td className="px-5 py-3.5 text-slate-500">{app.sector}</td>
                    <td className="px-5 py-3.5"><StatusBadge status={app.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── VIEW: APPLICATION LIST ───────────────────────────────────────────────────

const AppListView = ({ apps, setView, setDetailApp, payFee }: {
  apps: Application[];
  setView: (v: string) => void;
  setDetailApp: (a: Application) => void;
  payFee: (id: string, ref: string) => void;
}) => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-brand-blue">My Applications</h1>
        <p className="text-slate-500 text-sm">Track all your environmental clearance proposals</p>
      </div>
      <button onClick={() => setView("new")} className="bg-brand-green hover:bg-green-700 text-white px-5 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 shadow-sm transition-colors">
        <PlusCircle className="w-4 h-4" /> New Application
      </button>
    </div>

    {apps.length === 0 ? (
      <div className="bg-white border-2 border-dashed border-slate-200 rounded-xl p-16 text-center">
        <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h3 className="font-bold text-slate-600 mb-2">No Applications Found</h3>
        <p className="text-slate-400 text-sm mb-5">You haven't filed any applications yet.</p>
        <button onClick={() => setView("new")} className="bg-brand-blue text-white px-5 py-2 rounded-lg text-sm font-semibold">Get Started</button>
      </div>
    ) : (
      <div className="space-y-4">
        {apps.slice().reverse().map(app => (
          <div key={app.id} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-brand-blue bg-blue-50 px-2 py-1 rounded">{app.id}</span>
                  <CatBadge cat={app.category} />
                  <span className="text-xs text-slate-400">{app.sector}</span>
                </div>
                <StatusBadge status={app.status} />
              </div>
              <h3 className="font-bold text-slate-800 text-base mb-1">{app.projectDetails.projectName || "Untitled Project"}</h3>
              <p className="text-xs text-slate-500 mb-4">{app.projectDetails.location || "—"} • Area: {app.projectDetails.area || "—"} ha • Cost: ₹{app.projectDetails.cost || "—"} Cr</p>

              <WorkflowTimeline current={app.status} />

              {app.status === "EDS" && app.edsComments && (
                <div className="mt-3 bg-red-50 border border-red-100 rounded-lg px-4 py-2.5 text-xs text-red-700 flex items-start gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                  <span><strong>EDS Note:</strong> {app.edsComments}</span>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400">Fee: <strong className={app.feeStatus === "Paid" ? "text-green-600" : "text-red-500"}>{app.feeStatus}</strong></span>
                <div className="flex gap-2">
                  {app.feeStatus === "Pending" && (
                    <button onClick={() => payFee(app.id, `PAY-${Date.now()}`)}
                      className="text-xs text-brand-saffron border border-brand-saffron hover:bg-amber-50 px-3 py-1.5 rounded-lg font-semibold transition-colors">
                      💳 Complete Payment
                    </button>
                  )}
                  {app.status === "Finalized" && (
                    <Link href={`/dashboard/mom/${app.id}`} className="text-xs text-brand-green border border-brand-green hover:bg-green-50 px-3 py-1.5 rounded-lg font-semibold transition-colors">
                      View MoM
                    </Link>
                  )}
                  <button onClick={() => { setDetailApp(app); setView("detail"); }}
                    className="text-xs text-brand-blue border border-brand-blue hover:bg-blue-50 px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1">
                    View Details <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

// ─── VIEW: APPLICATION DETAIL ─────────────────────────────────────────────────

const AppDetailView = ({ app, setView, payFee }: {
  app: Application;
  setView: (v: string) => void;
  payFee: (id: string, ref: string) => void;
}) => {
  const details = [
    ["Category",    <CatBadge key="cat" cat={app.category} />],
    ["Sector",      app.sector],
    ["Project Name",app.projectDetails.projectName || "—"],
    ["Location",    app.projectDetails.location    || "—"],
    ["Area",        `${app.projectDetails.area || "—"} ha`],
    ["Cost",        `₹${app.projectDetails.cost || "—"} Cr`],
    ["Fee Status",  <span key="fee" className={app.feeStatus === "Paid" ? "text-green-600 font-bold" : "text-red-500 font-bold"}>{app.feeStatus === "Paid" ? "✅ Paid" : "❌ Pending"}</span>],
  ];

  return (
    <div className="space-y-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-xs text-slate-500">
        <button onClick={() => setView("list")} className="text-brand-blue hover:underline font-semibold">My Applications</button>
        <span>/</span>
        <span className="font-mono text-brand-blue">{app.id}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">{app.projectDetails.projectName || "Untitled"}</h1>
          <p className="text-sm text-slate-500 mt-0.5">{app.id} • {app.projectDetails.location || "—"}</p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={app.status} />
          {app.feeStatus === "Pending" && (
            <button onClick={() => payFee(app.id, `PAY-${Date.now()}`)}
              className="bg-brand-saffron text-white text-xs px-4 py-2 rounded-lg font-bold">
              💳 Pay Fee
            </button>
          )}
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
        <h2 className="font-bold text-slate-700 text-sm mb-3">Workflow Progress</h2>
        <WorkflowTimeline current={app.status} />
      </div>

      {/* EDS Alert */}
      {app.status === "EDS" && app.edsComments && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5">
          <h3 className="font-bold text-red-700 flex items-center gap-2 mb-2"><AlertTriangle className="w-4 h-4" /> Essential Documents Sought</h3>
          <p className="text-sm text-red-600">{app.edsComments}</p>
        </div>
      )}
      {app.status === "Finalized" && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex justify-between items-center">
          <div className="flex items-center gap-2 text-green-700 font-semibold text-sm">
            <CheckCircle className="w-4 h-4" /> Environmental Clearance Granted — MoM Finalized
          </div>
          <Link href={`/dashboard/mom/${app.id}`} className="bg-green-600 text-white text-xs px-4 py-2 rounded-lg font-bold hover:bg-green-700">
            View Official MoM
          </Link>
        </div>
      )}

      {/* Detail Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
          <h2 className="font-bold text-slate-700 text-sm mb-4 border-b pb-3">Project Details</h2>
          <div className="space-y-3">
            {details.map(([lbl, val]) => (
              <div key={String(lbl)} className="flex">
                <span className="w-36 text-xs font-semibold text-slate-500 flex-shrink-0 pt-0.5">{lbl}</span>
                <span className="text-sm text-slate-800">{val as React.ReactNode}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
          <h2 className="font-bold text-slate-700 text-sm mb-4 border-b pb-3">Submitted Documents (Mock)</h2>
          {["Pre-Feasibility Report", "Form-1 / Form-1A", "Proof of Ownership"].map(doc => (
            <div key={doc} className="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-brand-blue" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-700">{doc}</p>
                  <p className="text-[10px] text-slate-500">PDF • Mock file</p>
                </div>
              </div>
              <button className="text-[10px] text-brand-blue border border-blue-200 px-2 py-1 rounded hover:bg-blue-50">
                <Download className="w-3 h-3 inline mr-0.5" /> Download
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={() => setView("list")} className="text-sm border border-slate-300 px-5 py-2 rounded-lg font-semibold hover:bg-slate-50 text-slate-600">
          ← Back
        </button>
      </div>
    </div>
  );
};

// ─── VIEW: NEW APPLICATION ────────────────────────────────────────────────────

const FORM_STEPS = ["Project Info", "Category & Sector", "Documents", "Payment", "Review"];

const NewApplicationView = ({ setView, currentUser, createApplication, payFee }: {
  setView: (v: string) => void;
  currentUser: User;
  createApplication: (app: Omit<Application, 'id' | 'status' | 'feeStatus'>) => void;
  payFee: (id: string, ref: string) => void;
}) => {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ projectName: "", sector: "Mining", category: "A" as Category, location: "", area: "", cost: "", description: "" });
  const [payMethod, setPayMethod] = useState<string | null>(null);
  const [paid, setPaid] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);

  const save = () => {
    const id = `APP-${Date.now()}`;
    setSavedId(id);
    createApplication({
      ppId: currentUser.id,
      category: form.category,
      sector: form.sector,
      projectDetails: {
        projectName: form.projectName || "Untitled Project",
        location: form.location,
        companyName: currentUser.organization || currentUser.name,
        area: form.area,
        cost: form.cost,
        description: form.description,
      }
    });
    if (paid) {
      // A short delay isn't reliable without the ID, it gets auto-generated in the store. 
      // We'll just navigate; user can pay from the list.
    }
    setView("list");
  };

  const input = (key: keyof typeof form, ph: string, label: string, type = "text") => (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-slate-700">{label}</label>
      <input type={type} placeholder={ph} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })}
        className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue" />
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-1 text-xs text-slate-500 mb-1">
          <button onClick={() => setView("dashboard")} className="text-brand-blue hover:underline font-semibold">Dashboard</button>
          <span>/</span><span>New Application</span>
        </div>
        <h1 className="text-2xl font-bold text-brand-blue">New EC Application</h1>
        <p className="text-slate-500 text-sm">Environmental Clearance proposal under EIA Notification 2006</p>
      </div>

      {/* Step Indicators */}
      <div className="flex items-center gap-0">
        {FORM_STEPS.map((s, i) => (
          <div key={s} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2
                ${i < step ? "bg-brand-green border-brand-green text-white" : i === step ? "bg-brand-blue border-brand-blue text-white" : "bg-white border-slate-300 text-slate-400"}`}>
                {i < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
              </div>
              <span className={`mt-1 text-[10px] font-semibold whitespace-nowrap ${i === step ? "text-brand-blue" : i < step ? "text-brand-green" : "text-slate-400"}`}>{s}</span>
            </div>
            {i < FORM_STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-2 mb-4 ${i < step ? "bg-brand-green" : "bg-slate-200"}`} />}
          </div>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
        {/* Step 0: Project Info */}
        {step === 0 && (
          <div className="space-y-5">
            <h3 className="font-bold text-slate-800 border-b pb-2">1. Project Information</h3>
            <div className="grid grid-cols-2 gap-4">
              {input("projectName", "e.g. NH-48 Expansion", "Project Name *")}
              {input("location", "Village, District, State", "Location Address *")}
              {input("area", "e.g. 500", "Proposed Area (Hectares)", "number")}
              {input("cost", "e.g. 1200", "Estimated Cost (₹ Crores)", "number")}
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">Brief Description</label>
              <textarea rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Brief summary of the proposal..."
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue" />
            </div>
          </div>
        )}

        {/* Step 1: Category & Sector */}
        {step === 1 && (
          <div className="space-y-5">
            <h3 className="font-bold text-slate-800 border-b pb-2">2. Category & Sector</h3>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-3">Project Category *</label>
              <div className="grid grid-cols-3 gap-3">
                {CATEGORIES.map(c => (
                  <button key={c.id} onClick={() => setForm({ ...form, category: c.id })} type="button"
                    className={`p-4 rounded-xl border-2 text-left transition-all ${form.category === c.id ? "border-current shadow-md" : "border-slate-200 hover:border-slate-300"}`}
                    style={{ borderColor: form.category === c.id ? c.color : undefined, background: form.category === c.id ? c.color + "10" : undefined }}>
                    <div style={{ color: c.color }} className="font-bold text-sm">{c.label}</div>
                    <div className="text-xs text-slate-500 mt-1 leading-snug">{c.desc}</div>
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">Industry Sector *</label>
              <select value={form.sector} onChange={e => setForm({ ...form, sector: e.target.value })}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue bg-white">
                {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        )}

        {/* Step 2: Documents */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="font-bold text-slate-800 border-b pb-2">3. Document Upload (Mock)</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700 flex gap-2">
              <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
              This is a simulation. Click "Upload" on each required document.
            </div>
            {[["Pre-Feasibility Report (PFR)", true], ["Form-1 / Form-1A", true], ["Land Use / KML File", true], ["Public Hearing Records", false], ["NOC from State PCB", false]].map(([name, req]) => (
              <div key={String(name)} className="flex items-center justify-between p-3.5 border border-slate-200 rounded-xl bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-brand-blue" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700">{String(name)}</p>
                    <p className="text-xs text-slate-400">{req ? "Required" : "Optional"} • PDF, max 10MB</p>
                  </div>
                </div>
                <button className="text-xs border border-brand-blue text-brand-blue px-3 py-1.5 rounded-lg font-semibold hover:bg-blue-50 flex items-center gap-1">
                  <Upload className="w-3 h-3" /> Upload
                </button>
              </div>
            ))}
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-brand-blue hover:bg-blue-50/50 transition-all cursor-pointer">
              <Upload className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-500">Drag & drop additional files here</p>
              <p className="text-xs text-slate-400 mt-1">PDF, DOCX, JPG, PNG supported</p>
            </div>
          </div>
        )}

        {/* Step 3: Payment */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="font-bold text-slate-800 border-b pb-2">4. Application Fee Payment</h3>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-700 flex gap-2">
              <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
              Application fee for Category <strong>{form.category}</strong> project: <strong>₹15,000</strong>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[["upi", "📱", "UPI Payment", "BHIM, GPay, PhonePe"], ["qr", "◼", "QR Code", "Scan to pay instantly"]].map(([id, icon, label, sub]) => (
                <button key={String(id)} type="button" onClick={() => setPayMethod(String(id))}
                  className={`p-5 rounded-xl border-2 text-center transition-all ${payMethod === id ? "border-brand-blue bg-blue-50" : "border-slate-200 hover:border-slate-300"}`}>
                  <div className="text-3xl mb-2">{icon}</div>
                  <div className="font-bold text-sm text-slate-700">{String(label)}</div>
                  <div className="text-xs text-slate-400 mt-1">{String(sub)}</div>
                </button>
              ))}
            </div>
            {payMethod === "upi" && (
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">UPI ID</label>
                <input placeholder="yourname@bank" className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue" />
              </div>
            )}
            {payMethod === "qr" && (
              <div className="text-center py-2">
                <div className="w-32 h-32 bg-slate-100 border-2 border-slate-200 rounded-xl mx-auto flex items-center justify-center text-4xl">◼</div>
                <p className="text-xs text-slate-500 mt-2">Scan with any UPI app</p>
                <p className="text-xs font-mono text-brand-blue mt-1">parivesh@gov.in</p>
              </div>
            )}
            {!paid && payMethod && (
              <button onClick={() => setPaid(true)} className="w-full bg-brand-green hover:bg-green-700 text-white py-3 rounded-xl font-bold text-sm transition-colors">
                💳 Simulate Payment (₹15,000)
              </button>
            )}
            {paid && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-700 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <span>Payment Successful! TXN ID: TXN{Date.now().toString().slice(-8)}</span>
              </div>
            )}
          </div>
        )}

        {/* Step 4: Review */}
        {step === 4 && (
          <div className="space-y-4">
            <h3 className="font-bold text-slate-800 border-b pb-2">5. Review & Submit as Draft</h3>
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs text-blue-700 flex gap-2">
              <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
              Review all details below. The application will be saved as a <strong>Draft</strong>. You can complete the payment and submit later.
            </div>
            {[
              ["Project Name", form.projectName || "—"],
              ["Category",     form.category],
              ["Sector",       form.sector],
              ["Location",     form.location || "—"],
              ["Area",         form.area ? `${form.area} ha` : "—"],
              ["Cost",         form.cost ? `₹${form.cost} Cr` : "—"],
              ["Payment",      paid ? "✅ Paid (mock)" : "❌ Not paid yet"],
            ].map(([lbl, val]) => (
              <div key={String(lbl)} className="flex items-start py-1.5 border-b border-slate-100 last:border-0">
                <span className="w-36 text-xs font-bold text-slate-500">{lbl}</span>
                <span className="text-sm text-slate-800">{val}</span>
              </div>
            ))}
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-6 pt-5 border-t border-slate-100">
          <button type="button" onClick={() => step > 0 ? setStep(step - 1) : setView("dashboard")}
            className="text-sm border border-slate-300 px-5 py-2 rounded-lg font-semibold hover:bg-slate-50 text-slate-600">
            ← {step > 0 ? "Back" : "Cancel"}
          </button>
          {step < FORM_STEPS.length - 1
            ? <button type="button" onClick={() => setStep(step + 1)}
                className="bg-brand-blue text-white px-6 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 hover:bg-brand-light-blue">
                Next <ArrowRight className="w-4 h-4" />
              </button>
            : <button type="button" onClick={save}
                className="bg-brand-green text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-green-700 flex items-center gap-2">
                <Check className="w-4 h-4" /> Save as Draft
              </button>
          }
        </div>
      </div>
    </div>
  );
};

// ─── VIEW: PROFILE ────────────────────────────────────────────────────────────

const ProfileView = ({ currentUser }: { currentUser: User }) => (
  <div className="max-w-2xl mx-auto space-y-5">
    <div>
      <h1 className="text-2xl font-bold text-brand-blue">My Profile</h1>
      <p className="text-slate-500 text-sm">Manage your account information</p>
    </div>
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
      <div className="flex items-center gap-4 mb-6 pb-5 border-b border-slate-100">
        <div className="w-16 h-16 rounded-full bg-brand-blue text-white flex items-center justify-center text-2xl font-bold">
          {currentUser.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
        </div>
        <div>
          <h2 className="font-bold text-slate-800 text-lg">{currentUser.name}</h2>
          <p className="text-sm text-slate-500">{currentUser.email}</p>
          <span className="inline-block mt-1 text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full uppercase tracking-wide">Project Proponent</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-5">
        {[["Full Name", currentUser.name], ["Email Address", currentUser.email], ["Phone Number", "+91 98765 43210"], ["Organization", currentUser.organization || "—"]].map(([lbl, val]) => (
          <div key={String(lbl)} className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">{lbl}</label>
            <input defaultValue={String(val)} className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue" />
          </div>
        ))}
      </div>
      <div className="mt-5 flex gap-3">
        <button className="bg-brand-blue text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-brand-light-blue">Save Changes</button>
        <button className="border border-slate-300 text-slate-600 px-5 py-2 rounded-lg text-sm font-semibold hover:bg-slate-50">Cancel</button>
      </div>
    </div>
  </div>
);

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function PPDashboard() {
  const currentUser = useStore(state => state.currentUser);
  const applications = useStore(state => state.applications);
  const createApplication = useStore(state => state.createApplication);
  const payFee = useStore(state => state.payFee);

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  const [view, setView] = useState("dashboard");
  const [detailApp, setDetailApp] = useState<Application | null>(null);

  if (!isMounted || !currentUser) return null;

  const myApps = applications.filter(a => a.ppId === currentUser.id);

  const navItems = [
    { key: "dashboard", label: "Dashboard",        icon: <LayoutDashboard className="w-4 h-4" /> },
    { key: "list",      label: "My Applications",  icon: <ListOrdered className="w-4 h-4" />, badge: myApps.filter(a => a.status === "EDS").length || null },
    { key: "new",       label: "New Application",  icon: <PlusCircle className="w-4 h-4" /> },
    { key: "profile",   label: "Profile",          icon: <UserIcon className="w-4 h-4" /> },
  ];

  return (
    <div className="flex gap-6 items-start">
      {/* Sidebar */}
      <aside className="w-52 flex-shrink-0 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden sticky top-4">
        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Proponent Portal</p>
        </div>
        <nav className="p-2">
          {navItems.map(n => (
            <button key={n.key} onClick={() => setView(n.key)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium mb-0.5 transition-colors text-left
                ${view === n.key || (view === "detail" && n.key === "list")
                  ? "bg-brand-blue text-white"
                  : "text-slate-600 hover:bg-slate-100"}`}>
              {n.icon}
              <span className="flex-1">{n.label}</span>
              {n.badge ? (
                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{n.badge}</span>
              ) : null}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        {view === "dashboard" && <DashboardView apps={myApps} currentUser={currentUser} setView={setView} setDetailApp={setDetailApp} />}
        {view === "list"      && <AppListView apps={myApps} setView={setView} setDetailApp={setDetailApp} payFee={payFee} />}
        {view === "detail" && detailApp && <AppDetailView app={myApps.find(a => a.id === detailApp.id) || detailApp} setView={setView} payFee={payFee} />}
        {view === "new"       && <NewApplicationView setView={setView} currentUser={currentUser} createApplication={createApplication} payFee={payFee} />}
        {view === "profile"   && <ProfileView currentUser={currentUser} />}
      </main>

      <Chatbot />
    </div>
  );
}
