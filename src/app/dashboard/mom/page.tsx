"use client";

import React, { useState, useEffect } from "react";
import { useStore } from "@/store/useStore";
import { Application, ApplicationStatus, Meeting } from "@/types";

// ─── DATA ────────────────────────────────────────────────────────────────────
const STATUS_FLOW = ["Draft", "Submitted", "Under Scrutiny", "EDS", "Referred", "MoM Generated", "Finalized"];
const STATUS_COLORS: Record<string, string> = {
  "Draft": "#94a3b8", "Submitted": "#3b82f6", "Under Scrutiny": "#f59e0b",
  "EDS": "#ef4444", "Referred": "#8b5cf6", "MoM Generated": "#06b6d4", "Finalized": "#10b981"
};

const USER = { name: "Amit Verma", email: "mom@parivesh.gov.in", role: "mom", avatar: "AV" };

const EAC_MEMBERS = [
  { name: "Dr. R.K. Singh", designation: "Chairman, EAC", present: true },
  { name: "Prof. A. Sharma", designation: "Member (Ecology)", present: true },
  { name: "Dr. M. Pillai", designation: "Member (Hydrology)", present: true },
  { name: "Dr. S. Gupta", designation: "Member (Air Quality)", present: false },
  { name: "Mr. T. Nair", designation: "Member (Social Impact)", present: true },
  { name: "Dr. P. Reddy", designation: "Member (Mining)", present: true },
];

// ─── STYLES ──────────────────────────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');
  
  :root {
    --navy: #0a2463; --blue: #1565c0; --blue-pale: #e3f2fd;
    --teal: #00838f; --teal-pale: #e0f7fa;
    --gold: #f9a825; --white: #ffffff;
    --gray-50: #f8fafc; --gray-100: #f1f5f9; --gray-200: #e2e8f0;
    --gray-300: #cbd5e1; --gray-500: #64748b; --gray-700: #334155; --gray-900: #0f172a;
    --success: #16a34a; --warning: #d97706; --danger: #dc2626; --purple: #7c3aed;
    --radius: 8px;
    --shadow: 0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06);
    --shadow-md: 0 4px 6px rgba(0,0,0,0.07);
    --shadow-lg: 0 10px 15px rgba(0,0,0,0.1);
  }

  .mom-dashboard-root * { box-sizing: border-box; margin: 0; padding: 0; }
  .mom-dashboard-root { font-family: 'IBM Plex Sans', sans-serif; background: #f0f4f8; color: #1e293b; display: flex; flex-direction: column; min-height: 100vh; width: 100%; position: relative; z-index: 1; }

  /* TOPBAR */
  .topbar { background: linear-gradient(135deg, #1a0533 0%, #3b0764 50%, var(--purple) 100%); padding: 0 24px; height: 64px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 2px 8px rgba(0,0,0,0.25); position: sticky; top: 0; z-index: 100; }
  .brand { display: flex; align-items: center; gap: 12px; }
  .emblem { width: 42px; height: 42px; background: var(--gold); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 16px; color: #1a0533; }
  .brand-text h1 { font-size: 18px; font-weight: 700; color: white; }
  .brand-text p { font-size: 11px; color: rgba(255,255,255,0.6); }
  .topbar-right { display: flex; align-items: center; gap: 10px; }
  .avatar { width: 36px; height: 36px; border-radius: 50%; background: rgba(255,255,255,0.2); border: 2px solid rgba(255,255,255,0.4); display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; color: white; }
  .user-name { font-size: 13px; font-weight: 500; color: white; }
  .role-pill { font-size: 10px; padding: 2px 8px; border-radius: 20px; font-weight: 600; background: #ddd6fe; color: #2e1065; text-transform: uppercase; letter-spacing: 0.5px; }

  /* LAYOUT */
  .layout { display: flex; flex: 1; }
  .sidebar { width: 252px; background: white; border-right: 1px solid var(--gray-200); padding: 16px 0; position: sticky; top: 64px; height: calc(100vh - 64px); overflow-y: auto; display: flex; flex-direction: column; }
  .sidebar-label { font-size: 10px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: var(--gray-500); padding: 8px 24px 6px; }
  .nav-item { display: flex; align-items: center; gap: 10px; padding: 9px 16px; margin: 1px 8px; border-radius: 6px; cursor: pointer; font-size: 13.5px; color: var(--gray-700); transition: all 0.15s; }
  .nav-item:hover { background: #f5f3ff; color: var(--purple); }
  .nav-item.active { background: var(--purple); color: white; font-weight: 500; }
  .nav-icon { font-size: 16px; width: 20px; text-align: center; }
  .nav-badge { margin-left: auto; background: var(--danger); color: white; font-size: 10px; font-weight: 700; padding: 1px 6px; border-radius: 10px; }
  .nav-badge-teal { margin-left: auto; background: var(--teal); color: white; font-size: 10px; font-weight: 700; padding: 1px 6px; border-radius: 10px; }
  .sidebar-bottom { margin-top: auto; padding: 12px 20px; border-top: 1px solid var(--gray-100); }

  .content { flex: 1; padding: 24px; overflow-y: auto; }
  .page-header { margin-bottom: 24px; }
  .page-header h2 { font-size: 22px; font-weight: 700; color: var(--gray-900); }
  .page-header p { font-size: 13.5px; color: var(--gray-500); margin-top: 4px; }
  .flex-between { display: flex; align-items: center; justify-content: space-between; }
  .mb-4 { margin-bottom: 16px; }
  .mb-6 { margin-bottom: 24px; }
  .gap-2 { gap: 8px; }
  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
  .grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }

  /* CARDS */
  .card { background: white; border-radius: var(--radius); box-shadow: var(--shadow); border: 1px solid var(--gray-200); }
  .card-header { padding: 16px 20px; border-bottom: 1px solid var(--gray-200); display: flex; align-items: center; justify-content: space-between; }
  .card-title { font-size: 15px; font-weight: 600; color: var(--gray-900); }
  .card-body { padding: 20px; }

  /* STATS */
  .stat-card { background: white; border-radius: var(--radius); padding: 20px; border: 1px solid var(--gray-200); box-shadow: var(--shadow); display: flex; align-items: center; gap: 16px; }
  .stat-icon { width: 48px; height: 48px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 22px; flex-shrink: 0; }
  .stat-value { font-size: 28px; font-weight: 700; color: var(--gray-900); line-height: 1; }
  .stat-label { font-size: 12px; color: var(--gray-500); margin-top: 4px; }

  /* BUTTONS */
  .btn { padding: 8px 16px; border-radius: 6px; font-size: 13px; font-weight: 500; cursor: pointer; border: none; font-family: inherit; display: inline-flex; align-items: center; gap: 6px; transition: all 0.15s; white-space: nowrap; }
  .btn-primary { background: var(--purple); color: white; }
  .btn-primary:hover { background: #6d28d9; }
  .btn-blue { background: var(--blue); color: white; }
  .btn-blue:hover { background: var(--navy); }
  .btn-success { background: var(--success); color: white; }
  .btn-success:hover { background: #15803d; }
  .btn-teal { background: var(--teal); color: white; }
  .btn-teal:hover { background: #006064; }
  .btn-danger { background: var(--danger); color: white; }
  .btn-danger:hover { background: #b91c1c; }
  .btn-warning { background: var(--warning); color: white; }
  .btn-ghost { background: var(--gray-100); color: var(--gray-700); border: 1px solid var(--gray-200); }
  .btn-ghost:hover { background: var(--gray-200); }
  .btn-outline { background: transparent; color: var(--purple); border: 1px solid var(--purple); }
  .btn-outline:hover { background: #f5f3ff; }
  .btn-sm { padding: 5px 10px; font-size: 12px; }
  .btn-xs { padding: 3px 8px; font-size: 11px; }
  .btn-lg { padding: 11px 24px; font-size: 14px; }
  .btn:disabled { opacity: 0.45; cursor: not-allowed; }

  /* TABLE */
  .table-wrap { overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; font-size: 13.5px; }
  th { padding: 10px 14px; text-align: left; font-size: 11px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; color: var(--gray-500); background: var(--gray-50); border-bottom: 1px solid var(--gray-200); }
  td { padding: 12px 14px; border-bottom: 1px solid var(--gray-100); vertical-align: middle; }
  tr:last-child td { border-bottom: none; }
  tr.clickable { cursor: pointer; }
  tr.clickable:hover td { background: var(--gray-50); }

  /* BADGES */
  .badge { display: inline-flex; align-items: center; gap: 4px; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; white-space: nowrap; }
  .dot { width: 6px; height: 6px; border-radius: 50%; }
  .tag { display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
  .tag-a { background: #fee2e2; color: #991b1b; }
  .tag-b1 { background: #fef3c7; color: #92400e; }
  .tag-b2 { background: #dcfce7; color: #166534; }
  .priority-high { background: #fef2f2; color: #991b1b; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; }
  .priority-medium { background: #fffbeb; color: #92400e; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; }
  .priority-low { background: #f0fdf4; color: #166534; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; }

  /* FORMS */
  .form-group { margin-bottom: 16px; }
  .form-label { display: block; font-size: 13px; font-weight: 500; color: var(--gray-700); margin-bottom: 6px; }
  .form-input { width: 100%; padding: 9px 12px; border: 1px solid var(--gray-300); border-radius: 6px; font-size: 13.5px; font-family: inherit; color: var(--gray-900); background: white; transition: border-color 0.15s; }
  .form-input:focus { outline: none; border-color: var(--purple); box-shadow: 0 0 0 3px rgba(124,58,237,0.1); }
  .form-input:disabled { background: var(--gray-50); color: var(--gray-500); cursor: not-allowed; }
  .form-input::placeholder { color: var(--gray-300); }

  /* ALERTS */
  .alert { padding: 12px 16px; border-radius: 8px; font-size: 13px; display: flex; align-items: flex-start; gap: 10px; }
  .alert-info { background: var(--blue-pale); color: #1e40af; border: 1px solid #bfdbfe; }
  .alert-warning { background: #fffbeb; color: #92400e; border: 1px solid #fde68a; }
  .alert-success { background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; }
  .alert-danger { background: #fef2f2; color: #991b1b; border: 1px solid #fecaca; }
  .alert-purple { background: #f5f3ff; color: #4c1d95; border: 1px solid #ddd6fe; }
  .alert-teal { background: var(--teal-pale); color: #004d40; border: 1px solid #80cbc4; }

  /* MISC */
  .breadcrumb { display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--gray-500); margin-bottom: 10px; }
  .breadcrumb a { color: var(--purple); cursor: pointer; }
  .breadcrumb a:hover { text-decoration: underline; }
  .divider { height: 1px; background: var(--gray-200); margin: 16px 0; }
  .mono { font-family: 'IBM Plex Mono', monospace; font-size: 12px; color: var(--purple); }
  .info-row { display: flex; margin-bottom: 10px; }
  .info-label { width: 160px; font-size: 13px; font-weight: 500; color: var(--gray-500); flex-shrink: 0; }
  .info-value { font-size: 13px; color: var(--gray-900); }
  .search-bar { display: flex; align-items: center; gap: 8px; background: var(--gray-50); border: 1px solid var(--gray-200); border-radius: 8px; padding: 8px 14px; }
  .search-bar input { border: none; background: transparent; font-size: 13px; font-family: inherit; color: var(--gray-900); outline: none; min-width: 180px; }
  .search-bar input::placeholder { color: var(--gray-300); }

  /* WORKFLOW TIMELINE */
  .wf-timeline { display: flex; align-items: flex-start; padding: 16px 0; overflow-x: auto; }
  .wf-step { display: flex; flex-direction: column; align-items: center; flex: 1; min-width: 88px; }
  .wf-circle { width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; border: 3px solid; }
  .wf-circle.done { background: var(--purple); border-color: var(--purple); color: white; }
  .wf-circle.active { background: var(--gold); border-color: var(--gold); color: #1a0533; animation: pulse 2s infinite; }
  .wf-circle.pending { background: white; border-color: var(--gray-300); color: var(--gray-300); }
  .wf-label { font-size: 10px; font-weight: 600; margin-top: 7px; text-align: center; }
  .wf-connector { flex: 1; height: 3px; margin-top: 17px; min-width: 20px; }
  .wf-connector.done { background: var(--purple); }
  .wf-connector.pending { background: var(--gray-200); }
  @keyframes pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(249,168,37,0.4); } 50% { box-shadow: 0 0 0 8px rgba(249,168,37,0); } }

  /* MOM EDITOR */
  .mom-editor { width: 100%; min-height: 480px; padding: 20px; border: 1.5px solid var(--gray-300); border-radius: 8px; font-family: 'IBM Plex Mono', monospace; font-size: 12.5px; line-height: 2; color: var(--gray-900); background: #fdfcff; resize: vertical; transition: border-color 0.15s; }
  .mom-editor:focus { outline: none; border-color: var(--purple); box-shadow: 0 0 0 3px rgba(124,58,237,0.1); }
  .mom-editor:disabled { background: var(--gray-50); cursor: not-allowed; color: var(--gray-700); }
  .gist-box { background: var(--gray-50); border: 1px solid var(--gray-200); border-radius: 8px; padding: 20px; font-family: 'IBM Plex Mono', monospace; font-size: 12px; line-height: 1.9; white-space: pre-wrap; max-height: 320px; overflow-y: auto; }

  /* LOCKED BANNER */
  .locked-banner { background: linear-gradient(135deg, #1a0533, #3b0764); color: white; border-radius: 10px; padding: 20px 24px; display: flex; align-items: center; gap: 16px; margin-bottom: 20px; }
  .locked-icon { width: 48px; height: 48px; border-radius: 50%; background: rgba(255,255,255,0.15); display: flex; align-items: center; justify-content: center; font-size: 22px; flex-shrink: 0; }
  .locked-text h3 { font-size: 16px; font-weight: 700; }
  .locked-text p { font-size: 12px; opacity: 0.75; margin-top: 4px; }

  /* EC CONDITIONS */
  .ec-item { display: flex; align-items: flex-start; gap: 10px; padding: 10px 14px; border: 1px solid var(--gray-200); border-radius: 7px; margin-bottom: 8px; }
  .ec-num { width: 22px; height: 22px; border-radius: 50%; background: var(--purple); color: white; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; flex-shrink: 0; margin-top: 1px; }

  /* ACTIVITY */
  .act-item { display: flex; gap: 12px; padding: 10px 0; position: relative; }
  .act-item:not(:last-child)::after { content: ''; position: absolute; left: 15px; top: 36px; bottom: 0; width: 2px; background: var(--gray-200); }
  .act-dot { width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; flex-shrink: 0; z-index: 1; }
  .act-content { flex: 1; padding-top: 4px; }
  .act-title { font-size: 13px; font-weight: 600; }
  .act-meta { font-size: 11px; color: var(--gray-500); margin-top: 2px; }

  /* MODAL */
  .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.55); display: flex; align-items: center; justify-content: center; z-index: 1000; }
  .modal { background: white; border-radius: 12px; width: 560px; max-height: 88vh; overflow-y: auto; box-shadow: 0 25px 50px rgba(0,0,0,0.3); }
  .modal-lg { width: 720px; }
  .modal-header { padding: 20px 24px; border-bottom: 1px solid var(--gray-200); display: flex; justify-content: space-between; align-items: center; }
  .modal-body { padding: 24px; }
  .modal-footer { padding: 16px 24px; border-top: 1px solid var(--gray-200); display: flex; justify-content: flex-end; gap: 8px; }

  /* TAB */
  .tab-row { display: flex; border-bottom: 2px solid var(--gray-200); margin-bottom: 20px; }
  .tab { padding: 10px 18px; font-size: 13px; font-weight: 500; cursor: pointer; color: var(--gray-500); border-bottom: 2px solid transparent; margin-bottom: -2px; transition: all 0.15s; }
  .tab:hover { color: var(--purple); }
  .tab.active { color: var(--purple); border-bottom-color: var(--purple); }

  /* PRINT PREVIEW */
  .print-preview { background: white; border: 1px solid var(--gray-300); border-radius: 8px; padding: 40px; font-family: 'IBM Plex Mono', monospace; font-size: 12.5px; line-height: 2; white-space: pre-wrap; box-shadow: inset 0 1px 3px rgba(0,0,0,0.05); }
`;

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const Badge = ({ status }: { status: string }) => {
  const color = STATUS_COLORS[status] || "#94a3b8";
  return <span className="badge" style={{ background: color + "20", color }}><span className="dot" style={{ background: color }} />{status}</span>;
};
const CatTag = ({ cat }: { cat: string }) => <span className={`tag tag-${cat.toLowerCase()}`}>{cat}</span>;
const PriorityTag = ({ p }: { p: string }) => <span className={`priority-${p.toLowerCase()}`}>{p}</span>;

const WorkflowTimeline = ({ currentStatus }: { currentStatus: string }) => {
  const idx = STATUS_FLOW.indexOf(currentStatus);
  return (
    <div className="wf-timeline">
      {STATUS_FLOW.map((s, i) => {
        const done = i < idx, active = i === idx;
        return (
          <React.Fragment key={s}>
            <div className="wf-step">
              <div className={`wf-circle ${done ? "done" : active ? "active" : "pending"}`}>{done ? "✓" : i + 1}</div>
              <div className="wf-label" style={{ color: done ? "var(--purple)" : active ? "#1a0533" : "var(--gray-400)" }}>{s}</div>
            </div>
            {i < STATUS_FLOW.length - 1 && <div className={`wf-connector ${done ? "done" : "pending"}`} />}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// ─── COMPONENTS ──────────────────────────────────────────────────────────────
const Dashboard = ({ apps, setView, setSelected }: any) => {
  const referred = apps.filter((a: any) => a.status === "Referred").length;
  const momGenerated = apps.filter((a: any) => a.status === "MoM Generated").length;
  const finalized = apps.filter((a: any) => a.status === "Finalized").length;
  const total = apps.filter((a: any) => ["Referred", "MoM Generated", "Finalized"].includes(a.status)).length;

  const stats = [
    { label: "Pending MoM", value: referred, icon: "📥", color: "#8b5cf6", bg: "#f5f3ff" },
    { label: "MoM Generated", value: momGenerated, icon: "📄", color: "#06b6d4", bg: "#ecfeff" },
    { label: "Finalized", value: finalized, icon: "🔒", color: "#10b981", bg: "#f0fdf4" },
    { label: "Total Cases", value: total, icon: "📋", color: "#3b82f6", bg: "#eff6ff" },
  ];

  const pendingApps = apps.filter((a: any) => a.status === "Referred");
  const inProgressApps = apps.filter((a: any) => a.status === "MoM Generated");

  return (
    <>
      <div className="page-header">
        <h2>MoM Secretariat Dashboard</h2>
        <p>Welcome, {USER.name} — Minutes of Meeting Secretariat, MoEFCC</p>
      </div>
      <div className="grid-4 mb-6">
        {stats.map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
            <div><div className="stat-value">{s.value}</div><div className="stat-label">{s.label}</div></div>
          </div>
        ))}
      </div>
      <div className="grid-2 mb-6">
        <div className="card">
          <div className="card-header"><span className="card-title">Pending MoM Preparation</span></div>
          <div className="table-wrap"><table>
            <thead><tr><th>ID</th><th>Project</th><th>Priority</th></tr></thead>
            <tbody>{pendingApps.map((a: any) => (
              <tr key={a.id} className="clickable" onClick={() => { setSelected(a); setView("editor"); }}>
                <td><span className="mono">{a.id}</span></td>
                <td>{a.projectDetails?.projectName || "—"}</td>
                <td>{a.priority || "Medium"}</td>
              </tr>
            ))}</tbody>
          </table></div>
        </div>
        <div className="card">
          <div className="card-header"><span className="card-title">In Progress (Draft)</span></div>
          <div className="table-wrap"><table>
            <thead><tr><th>ID</th><th>Status</th></tr></thead>
            <tbody>{inProgressApps.map((a: any) => (
              <tr key={a.id} className="clickable" onClick={() => { setSelected(a); setView("editor"); }}>
                <td><span className="mono">{a.id}</span></td>
                <td><Badge status={a.status} /></td>
              </tr>
            ))}</tbody>
          </table></div>
        </div>
      </div>
    </>
  );
};

// ─── MAIN ROOT ────────────────────────────────────────────────────────────────
export default function MomDashboard() {
  const { currentUser, applications, meetings, updateApplicationStatus, updateMeeting }: any = useStore();
  const [view, setView] = useState("dashboard");
  const [selected, setSelected] = useState<Application | null>(null);

  if (!currentUser) return null;

  const myApps = applications.filter((a: any) => ["Referred", "MoM Generated", "Finalized"].includes(a.status));

  return (
    <div className="mom-dashboard-root">
      <style>{STYLES}</style>
      <div className="topbar">
        <div className="brand">
          <div className="emblem">P3</div>
          <div className="brand-text">
            <h1>PARIVESH 3.0</h1>
            <p>Environmental Clearance Workflow Portal — MoEFCC</p>
          </div>
        </div>
        <div className="topbar-right">
          <div className="avatar">{USER.avatar}</div>
          <div>
            <div className="user-name">{USER.name}</div>
            <span className="role-pill">MoM Secretariat</span>
          </div>
        </div>
      </div>

      <div className="layout">
        <div className="sidebar">
          <div className="sidebar-label">Overview</div>
          <div className={`nav-item ${view === "dashboard" ? "active" : ""}`} onClick={() => setView("dashboard")}>
            <span className="nav-icon">🏠</span> Dashboard
          </div>
          <div className="sidebar-label">Workflow</div>
          <div className={`nav-item ${view === "referred" ? "active" : ""}`} onClick={() => setView("referred")}>
            <span className="nav-icon">📥</span> Referred
          </div>
          <div className={`nav-item ${view === "finalized" ? "active" : ""}`} onClick={() => setView("finalized")}>
            <span className="nav-icon">🔒</span> Finalized
          </div>
        </div>

        <div className="content">
          {view === "dashboard" && <Dashboard apps={myApps} setView={setView} setSelected={setSelected} />}
          {view === "referred" && (
            <div className="page-header">
              <h2>Referred Applications</h2>
              <div className="table-wrap mt-6">
                <table className="card overflow-hidden">
                  <thead><tr><th>ID</th><th>Project</th><th>Status</th><th>Action</th></tr></thead>
                  <tbody>{myApps.filter((a:any)=>a.status!=="Finalized").map((a: any) => (
                    <tr key={a.id}>
                      <td className="mono">{a.id}</td>
                      <td>{a.projectDetails?.projectName || "—"}</td>
                      <td><Badge status={a.status} /></td>
                      <td><button className="btn btn-outline btn-xs" onClick={() => { setSelected(a); setView("editor"); }}>Manage</button></td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            </div>
          )}
          {view === "editor" && selected && (
              <div className="page-header">
                  <h2>MoM Editor — {selected.id}</h2>
                  <div className="card p-6 mt-6">
                      <WorkflowTimeline currentStatus={selected.status} />
                      <div className="divider" />
                      <div className="alert alert-info">Dashboard editor restricted to demo view. Use Scrutiny Gist for reference.</div>
                      <textarea className="mom-editor mt-4" placeholder="Minutes of Meeting Content..." />
                  </div>
              </div>
          )}
          {view === "finalized" && (
            <div className="page-header">
              <h2>Finalized Cases</h2>
              <div className="table-wrap mt-6">
                <table className="card overflow-hidden">
                  <thead><tr><th>ID</th><th>Project</th><th>Finalized Date</th></tr></thead>
                  <tbody>{myApps.filter((a: any) => a.status === "Finalized").map((a: any) => (
                    <tr key={a.id}>
                      <td className="mono">{a.id}</td>
                      <td>{a.projectDetails?.projectName || "—"}</td>
                      <td>{new Date().toLocaleDateString()}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
