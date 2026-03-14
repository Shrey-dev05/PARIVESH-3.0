"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/store/useStore";
import { Application, ApplicationStatus, Meeting } from "@/types";
import {
  LayoutDashboard, Inbox, Search, AlertTriangle, CheckCircle,
  ClipboardList, ChevronRight, X, FileText
} from "lucide-react";

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const STATUS_FLOW: ApplicationStatus[] = ["Draft", "Submitted", "Under Scrutiny", "EDS", "Referred", "MoM Generated", "Finalized"];
const STATUS_COLORS: Record<string, string> = {
  "Draft": "#94a3b8", "Submitted": "#3b82f6", "Under Scrutiny": "#f59e0b",
  "EDS": "#ef4444", "Referred": "#8b5cf6", "MoM Generated": "#06b6d4", "Finalized": "#10b981"
};
const STATUS_BG: Record<string, string> = {
  "Draft": "#f1f5f9", "Submitted": "#eff6ff", "Under Scrutiny": "#fffbeb",
  "EDS": "#fef2f2", "Referred": "#f5f3ff", "MoM Generated": "#ecfeff", "Finalized": "#f0fdf4"
};

// ─── SHARED COMPONENTS ────────────────────────────────────────────────────────
const StatusBadge = ({ status }: { status: string }) => {
  const color = STATUS_COLORS[status] || "#94a3b8";
  const bg    = STATUS_BG[status]    || "#f8fafc";
  return (
    <span style={{ background: bg, color }} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide">
      <span style={{ background: color }} className="w-1.5 h-1.5 rounded-full" />{status}
    </span>
  );
};

const CatBadge = ({ cat }: { cat: string }) => {
  const m: Record<string, string> = { A: "bg-red-100 text-red-800", B1: "bg-amber-100 text-amber-800", B2: "bg-green-100 text-green-800" };
  return <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${m[cat] || "bg-slate-100 text-slate-600"}`}>{cat}</span>;
};

const WorkflowTimeline = ({ current }: { current: ApplicationStatus }) => {
  const idx = STATUS_FLOW.indexOf(current);
  return (
    <div className="flex items-start overflow-x-auto py-3">
      {STATUS_FLOW.map((s, i) => {
        const done = i < idx, active = i === idx;
        return (
          <div key={s} className="flex items-start">
            <div className="flex flex-col items-center min-w-[72px]">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 text-white
                ${done ? "bg-brand-blue border-brand-blue" : active ? "bg-brand-saffron border-brand-saffron" : "bg-white border-slate-300"}`}>
                {done ? "✓" : <span className={active ? "text-white" : "text-slate-400"}>{i + 1}</span>}
              </div>
              <span className={`mt-1.5 text-[9px] font-semibold text-center leading-tight ${done ? "text-brand-blue" : active ? "text-brand-saffron" : "text-slate-400"}`}>{s}</span>
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

const StatCard = ({ label, value, icon, color, bg }: { label: string; value: number; icon: string; color: string; bg: string }) => (
  <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center gap-3">
    <div style={{ background: bg, color }} className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0">{icon}</div>
    <div>
      <div style={{ color }} className="text-2xl font-bold leading-none">{value}</div>
      <div className="text-xs text-slate-500 mt-0.5">{label}</div>
    </div>
  </div>
);

// ─── VIEW: DASHBOARD ──────────────────────────────────────────────────────────
const DashboardView = ({ apps, setView, setSelected, currentUser }: {
  apps: Application[]; setView: (v: string) => void; setSelected: (a: Application) => void;
  currentUser: { name: string };
}) => {
  const queue = apps.filter(a => ["Submitted", "Under Scrutiny", "EDS"].includes(a.status));
  const stats = [
    { label: "In Queue",       value: queue.length,                                          icon: "📥", color: "#3b82f6", bg: "#eff6ff" },
    { label: "Under Scrutiny", value: apps.filter(a => a.status === "Under Scrutiny").length, icon: "🔍", color: "#f59e0b", bg: "#fffbeb" },
    { label: "EDS Raised",     value: apps.filter(a => a.status === "EDS").length,            icon: "⚠️", color: "#ef4444", bg: "#fef2f2" },
    { label: "Referred",       value: apps.filter(a => a.status === "Referred").length,       icon: "✅", color: "#10b981", bg: "#f0fdf4" },
  ];
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-brand-blue">Scrutiny Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Welcome, {currentUser.name} — Scrutiny Officer, MoEFCC</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(s => <StatCard key={s.label} {...s} />)}
      </div>
      {apps.filter(a => a.status === "EDS").length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-sm text-red-700">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span><strong>{apps.filter(a => a.status === "EDS").length} application(s)</strong> have open EDS — proponents notified, 30-day response window.</span>
        </div>
      )}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Pending review */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
            <span className="font-bold text-sm text-slate-700">Pending Review</span>
            <button onClick={() => setView("queue")} className="text-xs font-semibold text-brand-blue hover:underline">View Queue →</button>
          </div>
          {queue.length === 0 ? (
            <div className="py-10 text-center text-slate-400 text-sm">✅ No pending applications</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold uppercase text-slate-400">
                  <th className="px-4 py-2.5 text-left">ID</th><th className="px-4 py-2.5 text-left">Project</th>
                  <th className="px-4 py-2.5 text-left">Cat</th><th className="px-4 py-2.5 text-left">Status</th>
                </tr></thead>
                <tbody>
                  {queue.slice(0, 5).map(a => (
                    <tr key={a.id} onClick={() => { setSelected(a); setView("review"); }}
                      className="border-b border-slate-50 last:border-0 hover:bg-blue-50/40 cursor-pointer">
                      <td className="px-4 py-2.5 font-mono text-[11px] font-bold text-brand-blue">{a.id}</td>
                      <td className="px-4 py-2.5 font-semibold text-slate-700 max-w-[120px] truncate">{a.projectDetails.projectName || "—"}</td>
                      <td className="px-4 py-2.5"><CatBadge cat={a.category} /></td>
                      <td className="px-4 py-2.5"><StatusBadge status={a.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        {/* Status breakdown */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
          <h2 className="font-bold text-sm text-slate-700 mb-4">Status Breakdown</h2>
          {STATUS_FLOW.slice(1).map(s => {
            const count = apps.filter(a => a.status === s).length;
            const pct   = apps.length ? Math.round(count / apps.length * 100) : 0;
            return (
              <div key={s} className="mb-3">
                <div className="flex justify-between text-xs mb-1"><span className="font-medium text-slate-700">{s}</span><span className="text-slate-400">{count}</span></div>
                <div className="h-1.5 bg-slate-100 rounded-full"><div style={{ width: `${pct}%`, background: STATUS_COLORS[s] }} className="h-1.5 rounded-full transition-all" /></div>
              </div>
            );
          })}
        </div>
      </div>
      {/* Full table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 font-bold text-sm text-slate-700">All Assigned Applications</div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-400">
              <th className="px-5 py-3 text-left">App ID</th><th className="px-5 py-3 text-left">Project</th>
              <th className="px-5 py-3 text-left">Cat</th><th className="px-5 py-3 text-left">Sector</th>
              <th className="px-5 py-3 text-left">Status</th><th className="px-5 py-3 text-left">Fee</th>
            </tr></thead>
            <tbody>
              {apps.map(a => (
                <tr key={a.id} onClick={() => { setSelected(a); setView("review"); }}
                  className="border-b border-slate-100 last:border-0 hover:bg-blue-50/40 cursor-pointer">
                  <td className="px-5 py-3 font-mono text-[11px] font-bold text-brand-blue">{a.id}</td>
                  <td className="px-5 py-3 font-semibold text-slate-800">{a.projectDetails.projectName || "—"}</td>
                  <td className="px-5 py-3"><CatBadge cat={a.category} /></td>
                  <td className="px-5 py-3 text-slate-500 text-xs">{a.sector}</td>
                  <td className="px-5 py-3"><StatusBadge status={a.status} /></td>
                  <td className="px-5 py-3">{a.feeStatus === "Paid" ? "✅" : "❌"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ─── VIEW: QUEUE ──────────────────────────────────────────────────────────────
const QueueView = ({ apps, setView, setSelected, updateStatus }: {
  apps: Application[]; setView: (v: string) => void; setSelected: (a: Application) => void;
  updateStatus: (id: string, status: ApplicationStatus, eds?: string) => void;
}) => {
  const [search, setSearch] = useState("");
  const queue = apps.filter(a => ["Submitted", "Under Scrutiny", "EDS"].includes(a.status))
    .filter(a => (a.projectDetails.projectName + a.id).toLowerCase().includes(search.toLowerCase()));

  const startReview = (a: Application) => {
    if (a.status === "Submitted") updateStatus(a.id, "Under Scrutiny");
    setSelected(a);
    setView("review");
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-brand-blue">Applications Queue</h1><p className="text-sm text-slate-500">Review and process submitted applications</p></div>
        <div className="flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-2 text-slate-400 w-56">
          <Search className="w-3.5 h-3.5" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="flex-1 outline-none text-sm text-slate-700 bg-transparent" />
        </div>
      </div>
      {queue.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-xl p-16 text-center">
          <div className="text-4xl mb-3">✅</div>
          <p className="text-slate-500">No pending applications in queue.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {queue.map(a => (
            <div key={a.id} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-brand-blue bg-blue-50 px-2 py-1 rounded">{a.id}</span>
                    <CatBadge cat={a.category} />
                    <StatusBadge status={a.status} />
                    <span className="text-xs text-slate-400">{a.sector}</span>
                  </div>
                  <button onClick={() => startReview(a)}
                    className="bg-brand-blue text-white text-xs px-4 py-2 rounded-lg font-semibold hover:bg-brand-light-blue flex items-center gap-1.5 flex-shrink-0">
                    {a.status === "Submitted" ? "▶ Start Review" : "→ Continue"} <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
                <h3 className="font-bold text-slate-800">{a.projectDetails.projectName || "Untitled"}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{a.projectDetails.location || "—"} • {a.projectDetails.area ? `${a.projectDetails.area} ha` : ""} • {a.projectDetails.cost ? `₹${a.projectDetails.cost} Cr` : ""}</p>
                <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                  <span>Fee: <strong className={a.feeStatus === "Paid" ? "text-green-600" : "text-red-500"}>{a.feeStatus}</strong></span>
                  {a.edsComments && (
                    <div className="flex items-center gap-1 text-red-500 font-semibold"><AlertTriangle className="w-3.5 h-3.5" /> EDS raised</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── VIEW: REVIEW WORKSPACE ───────────────────────────────────────────────────
const ReviewView = ({ app, apps, setView, updateStatus, generateGist }: {
  app: Application; apps: Application[]; setView: (v: string) => void;
  updateStatus: (id: string, status: ApplicationStatus, eds?: string) => void;
  generateGist: (id: string) => void;
}) => {
  const liveApp = apps.find(a => a.id === app.id) || app;
  const [tab,      setTab]      = useState<"docs" | "eds" | "notes" | "timeline">("docs");
  const [edsText,  setEdsText]  = useState("");
  const [notes,    setNotes]    = useState(liveApp.projectDetails.description || "");
  const [edsModal, setEdsModal] = useState(false);
  const [referModal, setReferModal] = useState(false);
  const [docChecks, setDocChecks] = useState<Record<string, boolean>>({});

  const MOCK_DOCS = ["Pre-Feasibility Report", "Form-1 / Form-1A", "Land Use Map", "Public Hearing Records", "NOC from State PCB"];
  const uploadedDocs = MOCK_DOCS.slice(0, 3);
  const checkedCount = Object.values(docChecks).filter(Boolean).length;
  const canRefer = checkedCount >= uploadedDocs.length && liveApp.status === "Under Scrutiny" && !liveApp.edsComments;

  const raiseEds = () => {
    if (!edsText.trim()) return;
    updateStatus(liveApp.id, "EDS", edsText);
    setEdsText("");
    setEdsModal(false);
  };

  const referApp = () => {
    generateGist(liveApp.id);
    setReferModal(false);
    setView("referred");
  };

  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-xs text-slate-500">
        <button onClick={() => setView("queue")} className="text-brand-blue hover:underline font-semibold">Queue</button>
        <span>/</span><span className="font-mono text-brand-blue">{liveApp.id}</span>
      </div>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">{liveApp.projectDetails.projectName || "Untitled"}</h1>
          <p className="text-sm text-slate-500 mt-0.5">{liveApp.id} • {liveApp.projectDetails.location || "—"}</p>
        </div>
        <StatusBadge status={liveApp.status} />
      </div>
      {/* Workflow */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
        <h2 className="font-bold text-sm text-slate-700 mb-2">Workflow Progress</h2>
        <WorkflowTimeline current={liveApp.status} />
      </div>
      {/* Info strip */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 grid grid-cols-2 md:grid-cols-5 gap-4">
        {[["Category", <CatBadge key="c" cat={liveApp.category} />], ["Sector", liveApp.sector],
          ["Area", liveApp.projectDetails.area ? `${liveApp.projectDetails.area} ha` : "—"],
          ["Cost", liveApp.projectDetails.cost ? `₹${liveApp.projectDetails.cost} Cr` : "—"],
          ["Payment", liveApp.feeStatus === "Paid" ? "✅ Verified" : "❌ Pending"]
        ].map(([l, v]) => (
          <div key={String(l)}>
            <div className="text-[10px] font-bold uppercase text-slate-400 mb-1">{l}</div>
            <div className="text-sm font-semibold text-slate-700">{v as React.ReactNode}</div>
          </div>
        ))}
      </div>
      {/* Tab workspace */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="flex border-b border-slate-200">
          {([["docs","📄 Documents"], ["eds","⚠️ EDS"], ["notes","📝 Notes & Gist"], ["timeline","🕐 Timeline"]] as const).map(([k, lbl]) => (
            <button key={k} onClick={() => setTab(k)}
              className={`px-5 py-3 text-sm font-medium transition-colors border-b-2 -mb-px
                ${tab === k ? "border-brand-blue text-brand-blue" : "border-transparent text-slate-500 hover:text-slate-700"}`}>
              {lbl}{k === "eds" && liveApp.edsComments ? " (1)" : ""}
            </button>
          ))}
        </div>
        <div className="p-5">
          {/* DOCUMENTS */}
          {tab === "docs" && (
            <div className="space-y-3">
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs text-blue-700 flex gap-2">
                <FileText className="w-4 h-4 flex-shrink-0 mt-0.5" />
                Verify all uploaded documents by checking each box. All must be verified before referring to EAC.
              </div>
              <div className="flex justify-between items-center text-xs text-slate-500 mb-2">
                <span>{checkedCount} of {uploadedDocs.length} uploaded documents verified</span>
                <div className="w-24 h-1.5 bg-slate-100 rounded-full">
                  <div style={{ width: `${uploadedDocs.length ? checkedCount / uploadedDocs.length * 100 : 0}%`, background: "#16a34a" }} className="h-1.5 rounded-full transition-all" />
                </div>
              </div>
              {MOCK_DOCS.map((doc, i) => {
                const uploaded = i < 3;
                const checked  = docChecks[doc] || false;
                return (
                  <div key={doc} className={`flex items-center justify-between p-3.5 border rounded-xl ${checked ? "border-green-200 bg-green-50" : "border-slate-200"}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg ${checked ? "bg-green-100" : uploaded ? "bg-amber-50" : "bg-red-50"}`}>
                        {checked ? "✅" : uploaded ? "📄" : "❌"}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-700">{doc}</div>
                        <div className="text-[10px] text-slate-400">{uploaded ? "Uploaded • Mock PDF" : "Not uploaded"}</div>
                      </div>
                    </div>
                    {uploaded ? (
                      <button onClick={() => setDocChecks(d => ({ ...d, [doc]: !d[doc] }))}
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center text-[10px] font-bold flex-shrink-0 transition-all
                          ${checked ? "bg-brand-green border-brand-green text-white" : "border-slate-300 hover:border-brand-green"}`}>
                        {checked ? "✓" : ""}
                      </button>
                    ) : (
                      <span className="text-[10px] font-bold text-red-500">Missing</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          {/* EDS */}
          {tab === "eds" && (
            <div className="space-y-3">
              {!liveApp.edsComments ? (
                <div className="text-center py-8">
                  <div className="text-3xl mb-2">✅</div>
                  <p className="text-slate-500 text-sm">No EDS raised for this application.</p>
                </div>
              ) : (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</div>
                    <div>
                      <div className="text-sm font-bold text-red-700">EDS #1</div>
                      <div className="text-sm text-red-600 mt-1">{liveApp.edsComments}</div>
                    </div>
                  </div>
                </div>
              )}
              {liveApp.status !== "Referred" && (
                <button onClick={() => setEdsModal(true)} className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> Raise New EDS
                </button>
              )}
            </div>
          )}
          {/* NOTES */}
          {tab === "notes" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">Scrutiny Notes</label>
                <textarea rows={5} value={notes} onChange={e => setNotes(e.target.value)}
                  placeholder="Add scrutiny observations and findings..."
                  className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brand-blue resize-y" />
                <p className="text-[10px] text-slate-400 mt-1">These notes will be included in the meeting gist.</p>
              </div>
              {liveApp.status === "Referred" ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-700 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" /> Meeting gist has been generated and application referred to EAC.
                </div>
              ) : (
                <button onClick={() => generateGist(liveApp.id)} className="bg-brand-blue text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-brand-light-blue">
                  📄 Generate Meeting Gist
                </button>
              )}
            </div>
          )}
          {/* TIMELINE */}
          {tab === "timeline" && (
            <div className="space-y-1">
              {((): Array<{ status: ApplicationStatus; note: string }> => {
                const items: Array<{ status: ApplicationStatus; note: string }> = [
                  { status: "Draft", note: "Application created" },
                  { status: "Submitted", note: "Submitted by proponent" },
                ];
                if (liveApp.status !== "Draft" && liveApp.status !== "Submitted") {
                  items.push({ status: liveApp.status, note: "Current status" });
                }
                return items;
              })().map((t, i) => {
                const icons: Record<string, string> = { Draft: "✏️", Submitted: "📤", "Under Scrutiny": "🔍", EDS: "⚠️", Referred: "✅", "MoM Generated": "📄", Finalized: "🔒" };
                return (
                  <div key={i} className="flex gap-3 py-2.5 border-b border-slate-50 last:border-0">
                    <div style={{ background: (STATUS_COLORS[t.status] || "#94a3b8") + "20" }} className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0">{icons[t.status] || "•"}</div>
                    <div className="pt-0.5">
                      <div className="text-sm font-semibold text-slate-800">{t.status}</div>
                      <div className="text-xs text-slate-400">{t.note}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      {/* Action bar */}
      {liveApp.status !== "Referred" && liveApp.status !== "MoM Generated" && liveApp.status !== "Finalized" && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            {canRefer ? "✅ All documents verified — ready to refer to EAC." : `⚠️ ${uploadedDocs.length - checkedCount} document(s) pending verification.`}
          </div>
          <div className="flex gap-2">
            <button onClick={() => setEdsModal(true)} className="border border-amber-300 bg-amber-50 text-amber-700 px-4 py-2 rounded-lg text-xs font-semibold hover:bg-amber-100 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" /> Raise EDS
            </button>
            <button onClick={() => canRefer && setReferModal(true)}
              className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all
                ${canRefer ? "bg-brand-green text-white hover:bg-green-700" : "bg-slate-100 text-slate-400 cursor-not-allowed"}`}>
              <CheckCircle className="w-3.5 h-3.5" /> Refer to EAC
            </button>
          </div>
        </div>
      )}
      {liveApp.status === "Referred" && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-700 flex items-center gap-2">
          <CheckCircle className="w-4 h-4" /> Application has been referred to the Expert Appraisal Committee.
        </div>
      )}

      {/* EDS Modal */}
      {edsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-800">Raise EDS — {liveApp.id}</h3>
              <button onClick={() => setEdsModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="p-6 space-y-3">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700">
                ⚠️ The proponent will be notified and must respond within 30 days.
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">EDS Description *</label>
                <textarea rows={5} value={edsText} onChange={e => setEdsText(e.target.value)}
                  placeholder="Describe the missing/insufficient document clearly..."
                  className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brand-blue resize-none" />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-2">
              <button onClick={() => setEdsModal(false)} className="border border-slate-200 text-slate-600 px-4 py-2 rounded-lg text-sm font-semibold">Cancel</button>
              <button onClick={raiseEds} className="bg-amber-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-amber-600">Raise EDS</button>
            </div>
          </div>
        </div>
      )}
      {/* Refer Modal */}
      {referModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-800">Confirm Referral</h3>
              <button onClick={() => setReferModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs text-blue-700">
                ℹ️ This will refer <strong>{liveApp.projectDetails.projectName}</strong> to the Expert Appraisal Committee (EAC) and auto-generate the Draft Gist.
              </div>
              {[["Project", liveApp.projectDetails.projectName || "—"],["Category", liveApp.category],
                ["Sector", liveApp.sector],["Docs Verified", `${checkedCount}/${uploadedDocs.length}`]
              ].map(([l, v]) => (
                <div key={String(l)} className="flex text-sm border-b border-slate-50 pb-2 last:border-0">
                  <span className="w-32 text-xs font-semibold text-slate-500">{l}</span>
                  <span className="text-slate-800">{v}</span>
                </div>
              ))}
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-2">
              <button onClick={() => setReferModal(false)} className="border border-slate-200 text-slate-600 px-4 py-2 rounded-lg text-sm font-semibold">Cancel</button>
              <button onClick={referApp} className="bg-brand-green text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-700">✅ Confirm Referral</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── VIEW: EDS TRACKER ────────────────────────────────────────────────────────
const EdsTrackerView = ({ apps, setView, setSelected }: { apps: Application[]; setView: (v: string) => void; setSelected: (a: Application) => void }) => {
  const edsApps = apps.filter(a => a.status === "EDS");
  return (
    <div className="space-y-5">
      <div><h1 className="text-2xl font-bold text-brand-blue">EDS Tracker</h1><p className="text-sm text-slate-500">Monitor all Essential Documents Sought</p></div>
      {edsApps.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-xl p-16 text-center">
          <div className="text-4xl mb-3">✅</div>
          <p className="text-slate-500">No EDS raised currently.</p>
        </div>
      ) : edsApps.map(a => (
        <div key={a.id} className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-brand-blue bg-blue-50 px-2 py-1 rounded">{a.id}</span>
              <CatBadge cat={a.category} /><StatusBadge status={a.status} />
            </div>
            <button onClick={() => { setSelected(a); setView("review"); }}
              className="text-xs border border-brand-blue text-brand-blue px-3 py-1.5 rounded-lg hover:bg-blue-50 font-semibold">→ Open Review</button>
          </div>
          <h3 className="font-bold text-slate-800">{a.projectDetails.projectName || "—"}</h3>
          <p className="text-xs text-slate-500 mt-0.5 mb-3">{a.sector}</p>
          {a.edsComments && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-xl p-3.5">
              <div className="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">1</div>
              <div>
                <div className="text-xs font-bold text-red-700">EDS #1</div>
                <div className="text-sm text-red-600 mt-0.5">{a.edsComments}</div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// ─── VIEW: REFERRED ───────────────────────────────────────────────────────────
const ReferredView = ({ apps, meetings, setView, setSelected }: {
  apps: Application[]; meetings: Meeting[];
  setView: (v: string) => void; setSelected: (a: Application) => void;
}) => {
  const referred = apps.filter(a => ["Referred", "MoM Generated", "Finalized"].includes(a.status));
  return (
    <div className="space-y-5">
      <div><h1 className="text-2xl font-bold text-brand-blue">Referred Cases</h1><p className="text-sm text-slate-500">Applications referred to the Expert Appraisal Committee</p></div>
      {referred.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-xl p-16 text-center">
          <div className="text-4xl mb-3">📭</div><p className="text-slate-500">No referred cases yet.</p>
        </div>
      ) : (
        <>
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-400">
                  <th className="px-5 py-3 text-left">App ID</th><th className="px-5 py-3 text-left">Project</th>
                  <th className="px-5 py-3 text-left">Cat</th><th className="px-5 py-3 text-left">Sector</th>
                  <th className="px-5 py-3 text-left">Status</th><th className="px-5 py-3 text-left">Gist</th>
                </tr></thead>
                <tbody>
                  {referred.map(a => {
                    const hasMeeting = meetings.find(m => m.applicationId === a.id);
                    return (
                      <tr key={a.id} onClick={() => { setSelected(a); setView("review"); }}
                        className="border-b border-slate-100 last:border-0 hover:bg-blue-50/40 cursor-pointer">
                        <td className="px-5 py-3 font-mono text-[11px] font-bold text-brand-blue">{a.id}</td>
                        <td className="px-5 py-3 font-semibold text-slate-800">{a.projectDetails.projectName || "—"}</td>
                        <td className="px-5 py-3"><CatBadge cat={a.category} /></td>
                        <td className="px-5 py-3 text-slate-500 text-xs">{a.sector}</td>
                        <td className="px-5 py-3"><StatusBadge status={a.status} /></td>
                        <td className="px-5 py-3 text-xs">{hasMeeting ? <span className="text-green-600 font-bold">✅ Ready</span> : <span className="text-slate-400">—</span>}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          {meetings.filter(m => referred.find(a => a.id === m.applicationId)).map(m => (
            <div key={m.id} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
                <span className="font-bold text-sm text-slate-700">Meeting Gist — {m.applicationId}</span>
                <button className="text-xs border border-slate-200 text-slate-600 px-3 py-1.5 rounded-lg hover:bg-slate-50">⬇ Export</button>
              </div>
              <div className="p-5">
                <pre className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-mono leading-relaxed whitespace-pre-wrap text-slate-700 max-h-72 overflow-y-auto">{m.gistContent}</pre>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
};

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function ScrutinyDashboard() {
  const currentUser   = useStore(s => s.currentUser);
  const applications  = useStore(s => s.applications);
  const meetings      = useStore(s => s.meetings);
  const updateStatus  = useStore(s => s.updateApplicationStatus);
  const generateGist  = useStore(s => s.generateGist);

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  const [view,     setView]     = useState("dashboard");
  const [selected, setSelected] = useState<Application | null>(null);

  if (!isMounted || !currentUser) return null;

  // Scrutiny sees all non-Draft apps
  const myApps = applications.filter(a => a.status !== "Draft");

  const nav = [
    { section: "Overview",      items: [{ k: "dashboard", icon: <LayoutDashboard className="w-4 h-4" />, label: "Dashboard" }] },
    { section: "Scrutiny Work", items: [
      { k: "queue",    icon: <Inbox className="w-4 h-4" />,       label: "Applications Queue",
        badge: myApps.filter(a => ["Submitted","Under Scrutiny"].includes(a.status)).length },
      { k: "review",   icon: <Search className="w-4 h-4" />,      label: "Current Review",    hidden: !selected },
      { k: "eds",      icon: <AlertTriangle className="w-4 h-4" />,label: "EDS Tracker",
        badgeWarn: myApps.filter(a => a.status === "EDS").length },
      { k: "referred", icon: <ClipboardList className="w-4 h-4" />, label: "Referred Cases" },
    ]},
  ];

  return (
    <div className="flex gap-6 items-start">
      {/* Sidebar */}
      <aside className="w-52 flex-shrink-0 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden sticky top-4">
        <div className="px-4 py-3 bg-amber-700 flex items-center gap-2">
          <Search className="w-4 h-4 text-amber-200" />
          <p className="text-[10px] font-bold uppercase tracking-widest text-amber-100">Scrutiny Portal</p>
        </div>
        <nav className="p-2">
          {nav.map(section => (
            <div key={section.section} className="mb-1">
              <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 px-3 py-2">{section.section}</p>
              {section.items.filter(n => !n.hidden).map(n => (
                <button key={n.k} onClick={() => setView(n.k)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium mb-0.5 transition-colors text-left
                    ${view === n.k || (view === "review" && n.k === "review") ? "bg-brand-blue text-white" : "text-slate-600 hover:bg-slate-100"}`}>
                  {n.icon}<span className="flex-1">{n.label}</span>
                  {n.badge ? <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{n.badge}</span> : null}
                  {n.badgeWarn ? <span className="bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{n.badgeWarn}</span> : null}
                </button>
              ))}
            </div>
          ))}
        </nav>
        {/* Live Queue Widget */}
        <div className="border-t border-slate-100 p-3">
          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-2">Live Queue</p>
          {(["Submitted","Under Scrutiny","EDS"] as ApplicationStatus[]).map(s => (
            <div key={s} className="flex justify-between text-[10px] py-0.5">
              <span className="text-slate-600 truncate">{s}</span>
              <span style={{ color: STATUS_COLORS[s] }} className="font-bold flex-shrink-0 ml-1">{myApps.filter(a => a.status === s).length}</span>
            </div>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        {view === "dashboard" && <DashboardView apps={myApps} setView={setView} setSelected={setSelected} currentUser={currentUser} />}
        {view === "queue"     && <QueueView apps={myApps} setView={setView} setSelected={setSelected} updateStatus={updateStatus} />}
        {view === "review" && selected
          ? <ReviewView app={selected} apps={myApps} setView={setView} updateStatus={updateStatus} generateGist={generateGist} />
          : view === "review" && (
            <div className="bg-white border-2 border-dashed border-slate-200 rounded-xl p-16 text-center">
              <div className="text-4xl mb-3">🔍</div>
              <p className="text-slate-500 mb-4">Select an application from the queue to review.</p>
              <button onClick={() => setView("queue")} className="bg-brand-blue text-white px-5 py-2 rounded-lg text-sm font-semibold">Go to Queue</button>
            </div>
          )}
        {view === "eds"      && <EdsTrackerView apps={myApps} setView={setView} setSelected={setSelected} />}
        {view === "referred" && <ReferredView apps={myApps} meetings={meetings} setView={setView} setSelected={setSelected} />}
      </main>
    </div>
  );
}
