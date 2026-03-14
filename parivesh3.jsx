import { useState, useEffect, useRef } from "react";

// ─── MOCK DATA ─────────────────────────────────────────────────────────────
const USERS = [
  { id: 1, name: "Admin Kumar", email: "admin@parivesh.gov.in", password: "admin123", role: "admin", avatar: "AK" },
  { id: 2, name: "Rajesh Sharma", email: "pp@parivesh.gov.in", password: "pp123", role: "pp", avatar: "RS" },
  { id: 3, name: "Dr. Priya Nair", email: "scrutiny@parivesh.gov.in", password: "scr123", role: "scrutiny", avatar: "PN" },
  { id: 4, name: "Amit Verma", email: "mom@parivesh.gov.in", password: "mom123", role: "mom", avatar: "AV" },
];

const SECTORS = ["Mining", "Infrastructure", "Thermal Power", "River Valley & Hydroelectric", "Nuclear Power", "Industrial Projects", "Tourism", "Coastal Regulation"];
const CATEGORIES = [
  { id: "A", label: "Category A", desc: "Projects of national significance requiring central clearance", color: "#dc2626" },
  { id: "B1", label: "Category B1", desc: "Projects requiring state-level appraisal", color: "#d97706" },
  { id: "B2", label: "Category B2", desc: "Minor projects with general conditions", color: "#16a34a" },
];

const STATUS_FLOW = ["Draft", "Submitted", "Under Scrutiny", "EDS", "Referred", "MoM Generated", "Finalized"];
const STATUS_COLORS = {
  "Draft": "#94a3b8", "Submitted": "#3b82f6", "Under Scrutiny": "#f59e0b",
  "EDS": "#ef4444", "Referred": "#8b5cf6", "MoM Generated": "#06b6d4", "Finalized": "#10b981"
};

let APPS = [
  {
    id: "APP-2024-001", proponentId: 2, proponentName: "Rajesh Sharma", projectName: "NH-48 Expressway Extension",
    sector: "Infrastructure", category: "A", location: { lat: 28.6139, lng: 77.2090 }, district: "Delhi",
    state: "Delhi", area: "450 ha", cost: "₹2,800 Cr", status: "Under Scrutiny",
    submittedDate: "2024-01-15", lastUpdated: "2024-02-01",
    documents: [
      { name: "Project Report", type: "pdf", uploaded: true },
      { name: "Environmental Impact Assessment", type: "pdf", uploaded: true },
      { name: "Land Acquisition Map", type: "pdf", uploaded: true },
    ],
    eds: [], gist: null, mom: null, paymentVerified: true,
    scrutinyNotes: "Awaiting verification of EIA chapter 5.",
    timeline: [
      { status: "Draft", date: "2024-01-10", by: "Rajesh Sharma" },
      { status: "Submitted", date: "2024-01-15", by: "Rajesh Sharma" },
      { status: "Under Scrutiny", date: "2024-02-01", by: "Dr. Priya Nair" },
    ]
  },
  {
    id: "APP-2024-002", proponentId: 2, proponentName: "Rajesh Sharma", projectName: "Rajasthan Solar Farm Phase II",
    sector: "Industrial Projects", category: "B1", location: { lat: 26.9124, lng: 75.7873 }, district: "Jaipur",
    state: "Rajasthan", area: "1200 ha", cost: "₹4,200 Cr", status: "Referred",
    submittedDate: "2024-01-05", lastUpdated: "2024-02-10",
    documents: [
      { name: "Project Report", type: "pdf", uploaded: true },
      { name: "Environmental Impact Assessment", type: "pdf", uploaded: true },
    ],
    eds: [], gist: "Generated Gist for Rajasthan Solar Farm...", mom: null, paymentVerified: true,
    scrutinyNotes: "All documents verified. Referred to Expert Appraisal Committee.",
    timeline: [
      { status: "Draft", date: "2024-01-01", by: "Rajesh Sharma" },
      { status: "Submitted", date: "2024-01-05", by: "Rajesh Sharma" },
      { status: "Under Scrutiny", date: "2024-01-12", by: "Dr. Priya Nair" },
      { status: "Referred", date: "2024-02-10", by: "Dr. Priya Nair" },
    ]
  },
  {
    id: "APP-2024-003", proponentId: 2, proponentName: "Rajesh Sharma", projectName: "Goa Coastal Resort Complex",
    sector: "Tourism", category: "B2", location: { lat: 15.2993, lng: 74.1240 }, district: "Panaji",
    state: "Goa", area: "25 ha", cost: "₹380 Cr", status: "Draft",
    submittedDate: null, lastUpdated: "2024-02-14",
    documents: [{ name: "Project Report", type: "pdf", uploaded: false }],
    eds: [], gist: null, mom: null, paymentVerified: false,
    scrutinyNotes: "", timeline: [{ status: "Draft", date: "2024-02-14", by: "Rajesh Sharma" }]
  },
  {
    id: "APP-2024-004", proponentId: 2, proponentName: "Rajesh Sharma", projectName: "Jharkhand Coal Mining Block",
    sector: "Mining", category: "A", location: { lat: 23.6102, lng: 85.2799 }, district: "Ranchi",
    state: "Jharkhand", area: "890 ha", cost: "₹1,100 Cr", status: "MoM Generated",
    submittedDate: "2023-11-20", lastUpdated: "2024-02-12",
    documents: [
      { name: "Project Report", type: "pdf", uploaded: true },
      { name: "Environmental Impact Assessment", type: "pdf", uploaded: true },
      { name: "Mining Plan", type: "pdf", uploaded: true },
    ],
    eds: ["Please submit updated Rehabilitation & Resettlement Plan", "Noise pollution mitigation report required"],
    gist: `MEETING GIST - APP-2024-004\n\nProject: Jharkhand Coal Mining Block\nProponent: Rajesh Sharma\nCategory: A | Sector: Mining\nLocation: Ranchi, Jharkhand\nArea: 890 ha | Cost: ₹1,100 Cr\n\nEIA Summary:\nThe project involves development of coal mining operations in Jharkhand. Comprehensive EIA has been conducted covering air quality, water resources, biodiversity, and socio-economic impacts.\n\nKey Observations:\n1. Forest diversion required: 120 ha\n2. Affected villages: 3\n3. R&R Plan submitted and verified\n4. Baseline data adequate\n\nRecommendation: Referred to Expert Appraisal Committee for consideration.`,
    mom: null, paymentVerified: true,
    scrutinyNotes: "All EDS resolved. Application referred.",
    timeline: [
      { status: "Draft", date: "2023-11-15", by: "Rajesh Sharma" },
      { status: "Submitted", date: "2023-11-20", by: "Rajesh Sharma" },
      { status: "Under Scrutiny", date: "2023-11-28", by: "Dr. Priya Nair" },
      { status: "EDS", date: "2023-12-10", by: "Dr. Priya Nair" },
      { status: "Referred", date: "2024-01-15", by: "Dr. Priya Nair" },
      { status: "MoM Generated", date: "2024-02-12", by: "Amit Verma" },
    ]
  },
];

let nextAppId = 5;

// ─── CSS STYLES ──────────────────────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'IBM Plex Sans', sans-serif;
    background: #f0f4f8;
    color: #1e293b;
  }

  :root {
    --navy: #0a2463;
    --blue: #1565c0;
    --blue-light: #1976d2;
    --blue-pale: #e3f2fd;
    --accent: #00838f;
    --accent-light: #e0f7fa;
    --gold: #f9a825;
    --white: #ffffff;
    --gray-50: #f8fafc;
    --gray-100: #f1f5f9;
    --gray-200: #e2e8f0;
    --gray-300: #cbd5e1;
    --gray-500: #64748b;
    --gray-700: #334155;
    --gray-900: #0f172a;
    --success: #16a34a;
    --warning: #d97706;
    --danger: #dc2626;
    --radius: 8px;
    --shadow: 0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06);
    --shadow-md: 0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.06);
    --shadow-lg: 0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05);
  }

  .app-root { display: flex; flex-direction: column; min-height: 100vh; }

  /* TOPBAR */
  .topbar {
    background: linear-gradient(135deg, var(--navy) 0%, var(--blue) 100%);
    padding: 0 24px;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    position: sticky; top: 0; z-index: 100;
  }
  .topbar-brand { display: flex; align-items: center; gap: 12px; }
  .topbar-emblem {
    width: 42px; height: 42px; background: var(--gold);
    border-radius: 50%; display: flex; align-items: center; justify-content: center;
    font-weight: 700; font-size: 16px; color: var(--navy);
  }
  .topbar-title { color: white; }
  .topbar-title h1 { font-size: 18px; font-weight: 700; letter-spacing: 0.5px; }
  .topbar-title p { font-size: 11px; opacity: 0.7; letter-spacing: 0.3px; }
  .topbar-right { display: flex; align-items: center; gap: 12px; }
  .topbar-user { display: flex; align-items: center; gap: 8px; color: white; cursor: pointer; }
  .avatar { width: 34px; height: 34px; border-radius: 50%; background: rgba(255,255,255,0.2);
    display: flex; align-items: center; justify-content: center; font-size: 12px;
    font-weight: 600; color: white; border: 2px solid rgba(255,255,255,0.4); }
  .user-name { font-size: 13px; font-weight: 500; }
  .role-badge { font-size: 10px; padding: 2px 8px; border-radius: 20px; font-weight: 600;
    letter-spacing: 0.5px; text-transform: uppercase; }
  .role-badge.admin { background: #ffd700; color: #1a1a1a; }
  .role-badge.pp { background: #4ade80; color: #14532d; }
  .role-badge.scrutiny { background: #fb923c; color: #431407; }
  .role-badge.mom { background: #a78bfa; color: #2e1065; }
  .btn-logout { background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.3);
    color: white; padding: 6px 14px; border-radius: 6px; cursor: pointer; font-size: 13px;
    transition: all 0.2s; font-family: inherit; }
  .btn-logout:hover { background: rgba(255,255,255,0.25); }

  /* LAYOUT */
  .main-layout { display: flex; flex: 1; }
  .sidebar {
    width: 240px; background: var(--white); border-right: 1px solid var(--gray-200);
    display: flex; flex-direction: column; padding: 16px 0; position: sticky;
    top: 64px; height: calc(100vh - 64px); overflow-y: auto;
  }
  .sidebar-section { padding: 8px 16px; margin-bottom: 4px; }
  .sidebar-label { font-size: 10px; font-weight: 700; letter-spacing: 1px;
    text-transform: uppercase; color: var(--gray-500); margin-bottom: 8px; }
  .nav-item {
    display: flex; align-items: center; gap: 10px; padding: 9px 16px;
    cursor: pointer; border-radius: 6px; margin: 1px 8px;
    transition: all 0.15s; font-size: 13.5px; color: var(--gray-700);
  }
  .nav-item:hover { background: var(--blue-pale); color: var(--blue); }
  .nav-item.active { background: var(--blue); color: white; font-weight: 500; }
  .nav-item .nav-icon { font-size: 16px; width: 20px; text-align: center; }
  .nav-badge { margin-left: auto; background: var(--danger); color: white;
    font-size: 10px; font-weight: 700; padding: 1px 6px; border-radius: 10px; }

  /* CONTENT */
  .content { flex: 1; padding: 24px; overflow-y: auto; }

  /* CARDS */
  .card {
    background: white; border-radius: var(--radius); box-shadow: var(--shadow);
    border: 1px solid var(--gray-200);
  }
  .card-header {
    padding: 16px 20px; border-bottom: 1px solid var(--gray-200);
    display: flex; align-items: center; justify-content: space-between;
  }
  .card-title { font-size: 15px; font-weight: 600; color: var(--gray-900); }
  .card-body { padding: 20px; }

  /* STATS */
  .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
  .stat-card {
    background: white; border-radius: var(--radius); padding: 20px;
    border: 1px solid var(--gray-200); box-shadow: var(--shadow);
    display: flex; align-items: center; gap: 16px;
  }
  .stat-icon { width: 48px; height: 48px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center; font-size: 22px; }
  .stat-info h3 { font-size: 26px; font-weight: 700; color: var(--gray-900); }
  .stat-info p { font-size: 12px; color: var(--gray-500); margin-top: 2px; }

  /* BUTTONS */
  .btn {
    padding: 8px 16px; border-radius: 6px; font-size: 13px; font-weight: 500;
    cursor: pointer; border: none; transition: all 0.15s; font-family: inherit;
    display: inline-flex; align-items: center; gap: 6px;
  }
  .btn-primary { background: var(--blue); color: white; }
  .btn-primary:hover { background: var(--navy); }
  .btn-success { background: var(--success); color: white; }
  .btn-success:hover { background: #15803d; }
  .btn-warning { background: var(--warning); color: white; }
  .btn-warning:hover { background: #b45309; }
  .btn-danger { background: var(--danger); color: white; }
  .btn-danger:hover { background: #b91c1c; }
  .btn-outline { background: transparent; color: var(--blue); border: 1px solid var(--blue); }
  .btn-outline:hover { background: var(--blue-pale); }
  .btn-ghost { background: var(--gray-100); color: var(--gray-700); border: 1px solid var(--gray-200); }
  .btn-ghost:hover { background: var(--gray-200); }
  .btn-sm { padding: 5px 10px; font-size: 12px; }
  .btn-lg { padding: 11px 24px; font-size: 14px; }

  /* TABLES */
  .table-wrap { overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; font-size: 13.5px; }
  th { padding: 10px 14px; text-align: left; font-size: 11px; font-weight: 700;
    letter-spacing: 0.5px; text-transform: uppercase; color: var(--gray-500);
    background: var(--gray-50); border-bottom: 1px solid var(--gray-200); }
  td { padding: 12px 14px; border-bottom: 1px solid var(--gray-100); vertical-align: middle; }
  tr:hover td { background: var(--gray-50); }
  tr:last-child td { border-bottom: none; }

  /* STATUS BADGES */
  .status-badge {
    display: inline-flex; align-items: center; gap: 4px; padding: 3px 10px;
    border-radius: 20px; font-size: 11px; font-weight: 600; white-space: nowrap;
  }
  .status-dot { width: 6px; height: 6px; border-radius: 50%; }

  /* FORMS */
  .form-group { margin-bottom: 16px; }
  .form-label { display: block; font-size: 13px; font-weight: 500; color: var(--gray-700); margin-bottom: 6px; }
  .form-input {
    width: 100%; padding: 9px 12px; border: 1px solid var(--gray-300); border-radius: 6px;
    font-size: 13.5px; font-family: inherit; color: var(--gray-900); background: white;
    transition: border-color 0.15s;
  }
  .form-input:focus { outline: none; border-color: var(--blue); box-shadow: 0 0 0 3px rgba(21,101,192,0.1); }
  .form-input::placeholder { color: var(--gray-300); }
  .form-select { appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%2364748b' d='M6 8L0 0h12z'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; padding-right: 32px; }
  .form-hint { font-size: 11px; color: var(--gray-500); margin-top: 4px; }
  .form-error { font-size: 11px; color: var(--danger); margin-top: 4px; }
  .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .form-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }

  /* TIMELINE */
  .timeline { display: flex; align-items: flex-start; gap: 0; padding: 16px 0; overflow-x: auto; }
  .timeline-step { display: flex; flex-direction: column; align-items: center; flex: 1; min-width: 100px; }
  .timeline-circle {
    width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center;
    justify-content: center; font-size: 14px; font-weight: 700; border: 3px solid;
    position: relative; z-index: 1;
  }
  .timeline-circle.done { background: var(--blue); border-color: var(--blue); color: white; }
  .timeline-circle.active { background: var(--gold); border-color: var(--gold); color: var(--navy); animation: pulse 2s infinite; }
  .timeline-circle.pending { background: white; border-color: var(--gray-300); color: var(--gray-300); }
  .timeline-label { font-size: 10.5px; font-weight: 600; margin-top: 8px; color: var(--gray-700); text-align: center; }
  .timeline-connector {
    flex: 1; height: 3px; margin-top: 18px; min-width: 30px;
  }
  .timeline-connector.done { background: var(--blue); }
  .timeline-connector.pending { background: var(--gray-200); }

  @keyframes pulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(249,168,37,0.4); }
    50% { box-shadow: 0 0 0 8px rgba(249,168,37,0); }
  }

  /* LOGIN */
  .login-page {
    min-height: 100vh; background: linear-gradient(135deg, var(--navy) 0%, #0d47a1 50%, var(--accent) 100%);
    display: flex; align-items: center; justify-content: center;
  }
  .login-container { background: white; border-radius: 16px; padding: 48px; width: 420px; box-shadow: 0 25px 50px rgba(0,0,0,0.3); }
  .login-header { text-align: center; margin-bottom: 32px; }
  .login-emblem { width: 72px; height: 72px; background: var(--navy); border-radius: 50%;
    margin: 0 auto 16px; display: flex; align-items: center; justify-content: center; }
  .login-emblem span { font-size: 28px; font-weight: 900; color: var(--gold); }
  .login-header h2 { font-size: 22px; font-weight: 700; color: var(--navy); }
  .login-header p { font-size: 13px; color: var(--gray-500); margin-top: 4px; }
  .login-demo { background: var(--blue-pale); border: 1px solid var(--gray-200); border-radius: 8px; padding: 12px 16px; margin-bottom: 20px; }
  .login-demo h4 { font-size: 12px; font-weight: 600; color: var(--blue); margin-bottom: 8px; }
  .demo-credential { display: flex; justify-content: space-between; font-size: 11.5px; color: var(--gray-700); margin: 3px 0; font-family: 'IBM Plex Mono', monospace; }

  /* MAP */
  .map-container { height: 400px; background: #e8f4f8; border-radius: var(--radius);
    position: relative; overflow: hidden; border: 1px solid var(--gray-200); }
  .map-bg { width: 100%; height: 100%; object-fit: cover; }
  .map-overlay { position: absolute; inset: 0; background: rgba(0,50,100,0.08); }
  .map-marker {
    position: absolute; cursor: pointer; transform: translate(-50%, -100%);
    display: flex; flex-direction: column; align-items: center;
  }
  .map-pin { width: 28px; height: 28px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg);
    display: flex; align-items: center; justify-content: center; border: 2px solid white;
    box-shadow: 0 2px 6px rgba(0,0,0,0.3); }
  .map-pin-inner { transform: rotate(45deg); font-size: 12px; }
  .map-tooltip {
    background: white; border-radius: 8px; padding: 10px 14px; box-shadow: var(--shadow-md);
    font-size: 12px; white-space: nowrap; margin-bottom: 4px; border: 1px solid var(--gray-200);
    min-width: 160px;
  }
  .map-tooltip h4 { font-weight: 600; color: var(--navy); font-size: 12px; margin-bottom: 4px; }
  .map-tooltip p { color: var(--gray-500); font-size: 11px; }

  /* CHATBOT */
  .chatbot-toggle {
    position: fixed; bottom: 24px; right: 24px; width: 56px; height: 56px;
    border-radius: 50%; background: var(--blue); color: white; border: none;
    cursor: pointer; font-size: 24px; box-shadow: var(--shadow-lg);
    display: flex; align-items: center; justify-content: center;
    transition: all 0.2s; z-index: 1000;
  }
  .chatbot-toggle:hover { background: var(--navy); transform: scale(1.1); }
  .chatbot-window {
    position: fixed; bottom: 90px; right: 24px; width: 340px; height: 480px;
    background: white; border-radius: 16px; box-shadow: 0 20px 40px rgba(0,0,0,0.2);
    display: flex; flex-direction: column; z-index: 1000; overflow: hidden;
    border: 1px solid var(--gray-200);
  }
  .chatbot-header { background: linear-gradient(135deg, var(--navy), var(--blue));
    padding: 16px; color: white; display: flex; align-items: center; gap: 10px; }
  .chatbot-avatar { width: 36px; height: 36px; border-radius: 50%; background: var(--gold);
    display: flex; align-items: center; justify-content: center; font-size: 18px; }
  .chatbot-header-info h4 { font-size: 14px; font-weight: 600; }
  .chatbot-header-info p { font-size: 11px; opacity: 0.7; }
  .chatbot-messages { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 12px; }
  .chat-msg { max-width: 85%; padding: 10px 14px; border-radius: 12px; font-size: 13px; line-height: 1.5; }
  .chat-msg.bot { background: var(--blue-pale); color: var(--gray-900); border-radius: 4px 12px 12px 12px; }
  .chat-msg.user { background: var(--blue); color: white; margin-left: auto; border-radius: 12px 4px 12px 12px; }
  .chatbot-input { display: flex; gap: 8px; padding: 12px 16px; border-top: 1px solid var(--gray-200); }
  .chatbot-input input { flex: 1; padding: 8px 12px; border: 1px solid var(--gray-300); border-radius: 20px;
    font-size: 13px; font-family: inherit; }
  .chatbot-input input:focus { outline: none; border-color: var(--blue); }
  .chatbot-send { width: 36px; height: 36px; border-radius: 50%; background: var(--blue);
    color: white; border: none; cursor: pointer; font-size: 16px; }

  /* MISC */
  .page-header { margin-bottom: 24px; }
  .page-header h2 { font-size: 22px; font-weight: 700; color: var(--gray-900); }
  .page-header p { font-size: 13.5px; color: var(--gray-500); margin-top: 4px; }
  .breadcrumb { display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--gray-500); margin-bottom: 12px; }
  .breadcrumb a { color: var(--blue); cursor: pointer; }
  .breadcrumb a:hover { text-decoration: underline; }
  .divider { height: 1px; background: var(--gray-200); margin: 20px 0; }
  .flex { display: flex; }
  .flex-between { display: flex; align-items: center; justify-content: space-between; }
  .gap-2 { gap: 8px; }
  .gap-3 { gap: 12px; }
  .mb-4 { margin-bottom: 16px; }
  .mb-6 { margin-bottom: 24px; }
  .text-sm { font-size: 13px; }
  .text-xs { font-size: 11px; }
  .text-gray { color: var(--gray-500); }
  .text-blue { color: var(--blue); }
  .font-semibold { font-weight: 600; }
  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
  .upload-zone {
    border: 2px dashed var(--gray-300); border-radius: 8px; padding: 24px;
    text-align: center; cursor: pointer; transition: all 0.15s; background: var(--gray-50);
  }
  .upload-zone:hover { border-color: var(--blue); background: var(--blue-pale); }
  .upload-zone p { font-size: 13px; color: var(--gray-500); }
  .upload-zone .upload-icon { font-size: 32px; margin-bottom: 8px; }
  .tag { display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 20px;
    font-size: 11px; font-weight: 600; }
  .tag-a { background: #fee2e2; color: #991b1b; }
  .tag-b1 { background: #fef3c7; color: #92400e; }
  .tag-b2 { background: #dcfce7; color: #166534; }
  .alert { padding: 12px 16px; border-radius: 8px; font-size: 13px; display: flex; align-items: flex-start; gap: 10px; }
  .alert-info { background: var(--blue-pale); color: #1e40af; border: 1px solid #bfdbfe; }
  .alert-warning { background: #fffbeb; color: #92400e; border: 1px solid #fde68a; }
  .alert-success { background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; }
  .alert-danger { background: #fef2f2; color: #991b1b; border: 1px solid #fecaca; }
  .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 200; }
  .modal { background: white; border-radius: 12px; width: 580px; max-height: 80vh; overflow-y: auto; box-shadow: 0 25px 50px rgba(0,0,0,0.25); }
  .modal-header { padding: 20px 24px; border-bottom: 1px solid var(--gray-200); display: flex; justify-content: space-between; align-items: center; }
  .modal-body { padding: 24px; }
  .modal-footer { padding: 16px 24px; border-top: 1px solid var(--gray-200); display: flex; justify-content: flex-end; gap: 8px; }
  .progress-steps { display: flex; align-items: center; gap: 0; margin-bottom: 32px; }
  .progress-step { display: flex; align-items: center; gap: 8px; flex: 1; }
  .progress-step-num { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; flex-shrink: 0; }
  .progress-step-num.active { background: var(--blue); color: white; }
  .progress-step-num.done { background: var(--success); color: white; }
  .progress-step-num.pending { background: var(--gray-200); color: var(--gray-500); }
  .progress-step-label { font-size: 12px; font-weight: 500; white-space: nowrap; }
  .progress-step-line { flex: 1; height: 2px; background: var(--gray-200); margin: 0 8px; }
  .progress-step-line.done { background: var(--success); }
  .gist-preview { background: var(--gray-50); border: 1px solid var(--gray-200); border-radius: 8px; padding: 20px; font-family: 'IBM Plex Mono', monospace; font-size: 12px; line-height: 1.8; white-space: pre-wrap; max-height: 300px; overflow-y: auto; }
  .doc-item { display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; border: 1px solid var(--gray-200); border-radius: 6px; margin-bottom: 8px; }
  .doc-item-info { display: flex; align-items: center; gap: 10px; }
  .doc-icon { width: 32px; height: 32px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 16px; }
  .payment-card { border: 2px solid var(--gray-200); border-radius: 12px; padding: 20px; cursor: pointer; transition: all 0.15s; text-align: center; }
  .payment-card:hover { border-color: var(--blue); }
  .payment-card.selected { border-color: var(--blue); background: var(--blue-pale); }
  .qr-code { width: 140px; height: 140px; background: white; border: 2px solid var(--gray-200); border-radius: 8px; margin: 12px auto; display: flex; align-items: center; justify-content: center; font-size: 48px; }
  .info-row { display: flex; margin-bottom: 10px; }
  .info-label { width: 160px; font-size: 13px; font-weight: 500; color: var(--gray-500); flex-shrink: 0; }
  .info-value { font-size: 13px; color: var(--gray-900); }
`;

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const statusBadge = (status) => {
  const color = STATUS_COLORS[status] || "#94a3b8";
  return (
    <span className="status-badge" style={{ background: color + "20", color: color }}>
      <span className="status-dot" style={{ background: color }} />
      {status}
    </span>
  );
};

const catTag = (cat) => <span className={`tag tag-${cat.toLowerCase()}`}>{cat}</span>;

const WorkflowTimeline = ({ currentStatus }) => {
  const currentIdx = STATUS_FLOW.indexOf(currentStatus);
  return (
    <div className="timeline">
      {STATUS_FLOW.map((s, i) => {
        const done = i < currentIdx;
        const active = i === currentIdx;
        return (
          <React.Fragment key={s}>
            <div className="timeline-step">
              <div className={`timeline-circle ${done ? "done" : active ? "active" : "pending"}`}>
                {done ? "✓" : i + 1}
              </div>
              <div className="timeline-label" style={{ color: done ? "var(--blue)" : active ? "var(--navy)" : undefined }}>{s}</div>
            </div>
            {i < STATUS_FLOW.length - 1 && (
              <div className={`timeline-connector ${done ? "done" : "pending"}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// ─── CHATBOT ─────────────────────────────────────────────────────────────────
const CHATBOT_RESPONSES = {
  "documents": "For Category A projects, you need:\n1. Project Report\n2. Environmental Impact Assessment (EIA)\n3. Land Acquisition Documents\n4. Public Hearing Records\n5. NOC from State Pollution Control Board",
  "category": "Categories:\n• Category A: Projects of national importance (Central clearance)\n• Category B1: Medium scale (State appraisal)\n• Category B2: Minor projects (General conditions apply)",
  "steps": "Application Steps:\n1. Register as PP/RQP\n2. Fill multi-step form\n3. Select Category & Sector\n4. Upload documents\n5. Make payment\n6. Submit for scrutiny",
  "payment": "Payment can be made via:\n• UPI (BHIM, GPay, PhonePe)\n• QR Code scan\nFees vary by project category and cost.",
  "eds": "EDS = Essential Document Sought. The scrutiny team may raise EDS if any document is missing or needs correction. You must respond within 30 days.",
  "default": "I can help you with:\n• Required documents list\n• Application steps\n• Payment process\n• Category selection\n• EDS queries\n\nType any keyword to get started!",
};

const Chatbot = () => {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([{ role: "bot", text: "Hello! I'm PARIVESH Assistant 🌿\nHow can I help you today?" }]);
  const [input, setInput] = useState("");
  const msgRef = useRef(null);

  useEffect(() => { if (msgRef.current) msgRef.current.scrollTop = msgRef.current.scrollHeight; }, [msgs]);

  const send = () => {
    if (!input.trim()) return;
    const userMsg = input.trim().toLowerCase();
    const newMsgs = [...msgs, { role: "user", text: input }];
    const key = Object.keys(CHATBOT_RESPONSES).find(k => userMsg.includes(k));
    const reply = CHATBOT_RESPONSES[key] || CHATBOT_RESPONSES.default;
    setMsgs([...newMsgs, { role: "bot", text: reply }]);
    setInput("");
  };

  return (
    <>
      <button className="chatbot-toggle" onClick={() => setOpen(!open)}>
        {open ? "✕" : "💬"}
      </button>
      {open && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <div className="chatbot-avatar">🌿</div>
            <div className="chatbot-header-info">
              <h4>PARIVESH Assistant</h4>
              <p>Online • Environmental Clearance Help</p>
            </div>
          </div>
          <div className="chatbot-messages" ref={msgRef}>
            {msgs.map((m, i) => (
              <div key={i} className={`chat-msg ${m.role}`} style={{ whiteSpace: "pre-wrap" }}>{m.text}</div>
            ))}
          </div>
          <div className="chatbot-input">
            <input value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && send()}
              placeholder="Ask about documents, steps..." />
            <button className="chatbot-send" onClick={send}>➤</button>
          </div>
        </div>
      )}
    </>
  );
};

// ─── MAP COMPONENT ────────────────────────────────────────────────────────────
const MapDashboard = ({ apps }) => {
  const [hovered, setHovered] = useState(null);
  // Simulated India map with SVG
  const mapApps = apps.filter(a => a.location);
  // Convert lat/lng to relative positions on a simplified India map
  // India rough bounds: lat 8-37, lng 68-97
  const toPos = (lat, lng) => ({
    top: `${((37 - lat) / 29) * 82 + 5}%`,
    left: `${((lng - 68) / 29) * 82 + 5}%`,
  });

  return (
    <div className="map-container">
      <svg viewBox="0 0 800 600" style={{ width: "100%", height: "100%", position: "absolute" }}>
        <defs>
          <linearGradient id="mapGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: "#dbeafe", stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: "#bfdbfe", stopOpacity: 1 }} />
          </linearGradient>
        </defs>
        <rect width="800" height="600" fill="#e0f2fe" />
        {/* Simplified India shape */}
        <path d="M 200 80 L 620 80 L 650 150 L 680 200 L 700 280 L 660 350 L 620 400 L 580 450 L 500 520 L 450 560 L 400 530 L 380 490 L 340 460 L 300 420 L 260 380 L 220 330 L 190 270 L 170 200 L 180 140 Z"
          fill="url(#mapGrad)" stroke="#93c5fd" strokeWidth="2" opacity="0.8" />
        <text x="380" y="300" textAnchor="middle" fill="#1e40af" fontSize="28" opacity="0.15" fontWeight="700">INDIA</text>
        {/* Grid lines */}
        {[...Array(6)].map((_, i) => <line key={i} x1={130 + i * 100} y1="60" x2={130 + i * 100} y2="580" stroke="#bfdbfe" strokeWidth="0.5" opacity="0.5" />)}
        {[...Array(6)].map((_, i) => <line key={i} x1="120" y1={80 + i * 90} x2="720" y2={80 + i * 90} stroke="#bfdbfe" strokeWidth="0.5" opacity="0.5" />)}
      </svg>
      {mapApps.map(app => {
        const pos = toPos(app.location.lat, app.location.lng);
        const color = STATUS_COLORS[app.status];
        return (
          <div key={app.id} className="map-marker" style={{ top: pos.top, left: pos.left }}
            onMouseEnter={() => setHovered(app.id)} onMouseLeave={() => setHovered(null)}>
            {hovered === app.id && (
              <div className="map-tooltip">
                <h4>{app.projectName}</h4>
                <p>{app.sector} • {catTag(app.category)}</p>
                <p style={{ marginTop: 4 }}>{statusBadge(app.status)}</p>
              </div>
            )}
            <div className="map-pin" style={{ background: color }}>
              <span className="map-pin-inner">📍</span>
            </div>
          </div>
        );
      })}
      <div style={{ position: "absolute", bottom: 12, left: 12, background: "white",
        border: "1px solid #e2e8f0", borderRadius: 8, padding: "8px 12px", fontSize: 11 }}>
        <strong style={{ display: "block", marginBottom: 6 }}>Project Locations</strong>
        {Object.entries(STATUS_COLORS).slice(0,4).map(([s, c]) => (
          <div key={s} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: c, display: "inline-block" }} />
            <span>{s}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── ADMIN DASHBOARD ─────────────────────────────────────────────────────────
const AdminDashboard = ({ apps, users, setActiveView, activeView }) => {
  const [userList, setUserList] = useState(users);
  const [editUser, setEditUser] = useState(null);
  const [newRole, setNewRole] = useState("");

  const stats = [
    { label: "Total Applications", value: apps.length, icon: "📋", color: "#3b82f6", bg: "#eff6ff" },
    { label: "Under Scrutiny", value: apps.filter(a => a.status === "Under Scrutiny").length, icon: "🔍", color: "#f59e0b", bg: "#fffbeb" },
    { label: "Finalized", value: apps.filter(a => a.status === "Finalized").length, icon: "✅", color: "#10b981", bg: "#f0fdf4" },
    { label: "Total Users", value: userList.length, icon: "👥", color: "#8b5cf6", bg: "#f5f3ff" },
  ];

  const views = { overview: "Overview", users: "User Management", categories: "Categories & Sectors", map: "Project Map" };

  return (
    <div style={{ display: "flex", flex: 1 }}>
      <div className="sidebar">
        <div className="sidebar-section">
          <div className="sidebar-label">Admin Panel</div>
          {Object.entries(views).map(([k, v]) => (
            <div key={k} className={`nav-item ${activeView === k ? "active" : ""}`} onClick={() => setActiveView(k)}>
              <span className="nav-icon">{k === "overview" ? "🏠" : k === "users" ? "👥" : k === "categories" ? "⚙️" : "🗺️"}</span>
              {v}
            </div>
          ))}
        </div>
        <div className="sidebar-section">
          <div className="sidebar-label">Quick Stats</div>
          {STATUS_FLOW.map(s => (
            <div key={s} style={{ display: "flex", justifyContent: "space-between", padding: "4px 16px", fontSize: 12, color: "var(--gray-700)" }}>
              <span>{s}</span>
              <span style={{ fontWeight: 600, color: STATUS_COLORS[s] }}>{apps.filter(a => a.status === s).length}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="content">
        {activeView === "overview" && (
          <>
            <div className="page-header">
              <h2>Admin Dashboard</h2>
              <p>System overview and management controls</p>
            </div>
            <div className="stats-grid">
              {stats.map(s => (
                <div key={s.label} className="stat-card">
                  <div className="stat-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
                  <div className="stat-info"><h3>{s.value}</h3><p>{s.label}</p></div>
                </div>
              ))}
            </div>
            <div className="grid-2" style={{ gap: 16 }}>
              <div className="card">
                <div className="card-header"><span className="card-title">Recent Applications</span></div>
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>ID</th><th>Project</th><th>Category</th><th>Status</th></tr></thead>
                    <tbody>
                      {apps.slice(0, 5).map(a => (
                        <tr key={a.id}>
                          <td><span style={{ fontFamily: "monospace", fontSize: 12 }}>{a.id}</span></td>
                          <td style={{ maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.projectName}</td>
                          <td>{catTag(a.category)}</td>
                          <td>{statusBadge(a.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="card">
                <div className="card-header"><span className="card-title">Status Distribution</span></div>
                <div className="card-body">
                  {STATUS_FLOW.map(s => {
                    const count = apps.filter(a => a.status === s).length;
                    const pct = apps.length ? (count / apps.length * 100).toFixed(0) : 0;
                    return (
                      <div key={s} style={{ marginBottom: 12 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                          <span style={{ fontWeight: 500 }}>{s}</span>
                          <span style={{ color: "var(--gray-500)" }}>{count} ({pct}%)</span>
                        </div>
                        <div style={{ height: 6, background: "var(--gray-200)", borderRadius: 3 }}>
                          <div style={{ height: 6, borderRadius: 3, background: STATUS_COLORS[s], width: `${pct}%`, transition: "width 0.3s" }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        )}

        {activeView === "users" && (
          <>
            <div className="page-header flex-between">
              <div><h2>User Management</h2><p>Assign roles and manage portal access</p></div>
            </div>
            <div className="card">
              <div className="card-header"><span className="card-title">Registered Users</span></div>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Actions</th></tr></thead>
                  <tbody>
                    {userList.map(u => (
                      <tr key={u.id}>
                        <td style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div className="avatar" style={{ background: "var(--blue)", fontSize: 11 }}>{u.avatar}</div>
                          {u.name}
                        </td>
                        <td style={{ color: "var(--gray-500)" }}>{u.email}</td>
                        <td><span className={`role-badge ${u.role}`}>{u.role}</span></td>
                        <td>
                          <button className="btn btn-ghost btn-sm" onClick={() => { setEditUser(u); setNewRole(u.role); }}>
                            ✏️ Edit Role
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            {editUser && (
              <div className="modal-overlay" onClick={() => setEditUser(null)}>
                <div className="modal" onClick={e => e.stopPropagation()}>
                  <div className="modal-header">
                    <h3 style={{ fontSize: 16, fontWeight: 600 }}>Edit Role: {editUser.name}</h3>
                    <button className="btn btn-ghost btn-sm" onClick={() => setEditUser(null)}>✕</button>
                  </div>
                  <div className="modal-body">
                    <div className="form-group">
                      <label className="form-label">Assign Role</label>
                      <select className="form-input form-select" value={newRole} onChange={e => setNewRole(e.target.value)}>
                        {["admin", "pp", "scrutiny", "mom"].map(r => <option key={r} value={r}>{r.toUpperCase()}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button className="btn btn-ghost" onClick={() => setEditUser(null)}>Cancel</button>
                    <button className="btn btn-primary" onClick={() => {
                      setUserList(userList.map(u => u.id === editUser.id ? { ...u, role: newRole } : u));
                      setEditUser(null);
                    }}>Save Changes</button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {activeView === "categories" && (
          <>
            <div className="page-header"><h2>Categories & Sectors</h2><p>Configure application parameters</p></div>
            <div className="grid-2" style={{ gap: 16 }}>
              <div className="card">
                <div className="card-header"><span className="card-title">Project Categories</span></div>
                <div className="card-body">
                  {CATEGORIES.map(c => (
                    <div key={c.id} style={{ border: "1px solid var(--gray-200)", borderRadius: 8, padding: 16, marginBottom: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                        <span style={{ width: 10, height: 10, borderRadius: "50%", background: c.color, display: "inline-block" }} />
                        <strong style={{ fontSize: 14 }}>{c.label}</strong>
                      </div>
                      <p style={{ fontSize: 12, color: "var(--gray-500)" }}>{c.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card">
                <div className="card-header"><span className="card-title">Industry Sectors</span></div>
                <div className="card-body">
                  {SECTORS.map(s => (
                    <div key={s} style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
                      padding: "10px 0", borderBottom: "1px solid var(--gray-100)" }}>
                      <span style={{ fontSize: 13 }}>⚡ {s}</span>
                      <span className="tag" style={{ background: "var(--blue-pale)", color: "var(--blue)" }}>Active</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {activeView === "map" && (
          <>
            <div className="page-header"><h2>Project Locations Map</h2><p>Geographic distribution of all applications</p></div>
            <div className="card">
              <div className="card-body"><MapDashboard apps={apps} /></div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ─── PP DASHBOARD ─────────────────────────────────────────────────────────────
const PPDashboard = ({ apps, user, setApps, activeView, setActiveView }) => {
  const myApps = apps.filter(a => a.proponentId === user.id);
  const [formStep, setFormStep] = useState(0);
  const [selectedApp, setSelectedApp] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [paymentDone, setPaymentDone] = useState(false);
  const [formData, setFormData] = useState({
    projectName: "", sector: "", category: "", district: "", state: "",
    area: "", cost: "", description: "",
  });

  const FORM_STEPS = ["Project Info", "Category & Sector", "Documents", "Payment", "Review"];

  const createDraft = () => {
    const newApp = {
      id: `APP-2024-00${nextAppId++}`,
      proponentId: user.id, proponentName: user.name,
      projectName: formData.projectName || "Untitled Project",
      sector: formData.sector || "Mining", category: formData.category || "B1",
      location: { lat: 20 + Math.random() * 10, lng: 75 + Math.random() * 10 },
      district: formData.district || "Sample District", state: formData.state || "Maharashtra",
      area: formData.area || "100 ha", cost: formData.cost || "₹500 Cr",
      status: "Draft", submittedDate: null, lastUpdated: new Date().toISOString().split("T")[0],
      documents: [
        { name: "Project Report", type: "pdf", uploaded: false },
        { name: "Environmental Impact Assessment", type: "pdf", uploaded: false },
      ],
      eds: [], gist: null, mom: null, paymentVerified: false, scrutinyNotes: "",
      timeline: [{ status: "Draft", date: new Date().toISOString().split("T")[0], by: user.name }]
    };
    setApps([...apps, newApp]);
    setActiveView("applications");
    setFormStep(0);
    setFormData({ projectName: "", sector: "", category: "", district: "", state: "", area: "", cost: "", description: "" });
  };

  const submitApp = (app) => {
    setApps(apps.map(a => a.id === app.id ? {
      ...a, status: "Submitted", submittedDate: new Date().toISOString().split("T")[0],
      timeline: [...a.timeline, { status: "Submitted", date: new Date().toISOString().split("T")[0], by: user.name }]
    } : a));
    setSelectedApp(null);
    setActiveView("applications");
  };

  const navItems = [
    { k: "dashboard", icon: "🏠", label: "Dashboard" },
    { k: "applications", icon: "📋", label: "My Applications", badge: myApps.filter(a => a.status === "EDS").length || null },
    { k: "new-application", icon: "➕", label: "New Application" },
    { k: "profile", icon: "👤", label: "Profile" },
  ];

  return (
    <div style={{ display: "flex", flex: 1 }}>
      <div className="sidebar">
        <div className="sidebar-section">
          <div className="sidebar-label">Proponent Portal</div>
          {navItems.map(n => (
            <div key={n.k} className={`nav-item ${activeView === n.k ? "active" : ""}`} onClick={() => setActiveView(n.k)}>
              <span className="nav-icon">{n.icon}</span>
              {n.label}
              {n.badge && <span className="nav-badge">{n.badge}</span>}
            </div>
          ))}
        </div>
      </div>
      <div className="content">
        {activeView === "dashboard" && (
          <>
            <div className="page-header">
              <h2>Welcome, {user.name}</h2>
              <p>Project Proponent / Recognized Qualified Professional</p>
            </div>
            <div className="stats-grid">
              {[
                { label: "Total Applications", value: myApps.length, icon: "📋", color: "#3b82f6", bg: "#eff6ff" },
                { label: "Drafts", value: myApps.filter(a => a.status === "Draft").length, icon: "✏️", color: "#94a3b8", bg: "#f8fafc" },
                { label: "Under Review", value: myApps.filter(a => ["Submitted", "Under Scrutiny"].includes(a.status)).length, icon: "🔍", color: "#f59e0b", bg: "#fffbeb" },
                { label: "EDS Pending", value: myApps.filter(a => a.status === "EDS").length, icon: "⚠️", color: "#dc2626", bg: "#fef2f2" },
              ].map(s => (
                <div key={s.label} className="stat-card">
                  <div className="stat-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
                  <div className="stat-info"><h3>{s.value}</h3><p>{s.label}</p></div>
                </div>
              ))}
            </div>
            {myApps.filter(a => a.status === "EDS").length > 0 && (
              <div className="alert alert-warning mb-4">
                ⚠️ You have {myApps.filter(a => a.status === "EDS").length} application(s) with Essential Documents Sought. Please respond promptly.
              </div>
            )}
            <div className="card">
              <div className="card-header">
                <span className="card-title">Recent Applications</span>
                <button className="btn btn-primary btn-sm" onClick={() => setActiveView("new-application")}>+ New Application</button>
              </div>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Application ID</th><th>Project Name</th><th>Category</th><th>Status</th><th>Last Updated</th></tr></thead>
                  <tbody>
                    {myApps.map(a => (
                      <tr key={a.id} style={{ cursor: "pointer" }} onClick={() => { setSelectedApp(a); setActiveView("view-app"); }}>
                        <td><span style={{ fontFamily: "monospace", fontSize: 12, color: "var(--blue)" }}>{a.id}</span></td>
                        <td style={{ fontWeight: 500 }}>{a.projectName}</td>
                        <td>{catTag(a.category)}</td>
                        <td>{statusBadge(a.status)}</td>
                        <td style={{ color: "var(--gray-500)" }}>{a.lastUpdated}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {activeView === "applications" && (
          <>
            <div className="page-header flex-between">
              <div><h2>My Applications</h2><p>Track all your environmental clearance applications</p></div>
              <button className="btn btn-primary" onClick={() => setActiveView("new-application")}>+ New Application</button>
            </div>
            {myApps.map(a => (
              <div key={a.id} className="card mb-4" style={{ cursor: "pointer" }} onClick={() => { setSelectedApp(a); setActiveView("view-app"); }}>
                <div className="card-body">
                  <div className="flex-between mb-4">
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                        <span style={{ fontFamily: "monospace", fontSize: 12, color: "var(--blue)" }}>{a.id}</span>
                        {catTag(a.category)}
                        <span style={{ fontSize: 12, color: "var(--gray-500)" }}>{a.sector}</span>
                      </div>
                      <h3 style={{ fontSize: 16, fontWeight: 600 }}>{a.projectName}</h3>
                      <p style={{ fontSize: 12, color: "var(--gray-500)" }}>{a.district}, {a.state} • {a.area}</p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      {statusBadge(a.status)}
                      <p style={{ fontSize: 11, color: "var(--gray-500)", marginTop: 6 }}>Updated: {a.lastUpdated}</p>
                    </div>
                  </div>
                  <WorkflowTimeline currentStatus={a.status} />
                  {a.status === "EDS" && a.eds.length > 0 && (
                    <div className="alert alert-danger" style={{ marginTop: 12 }}>
                      ⚠️ EDS Raised: {a.eds[0]}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {myApps.length === 0 && (
              <div style={{ textAlign: "center", padding: "60px 0", color: "var(--gray-500)" }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
                <p>No applications yet. Start a new one!</p>
                <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setActiveView("new-application")}>+ Create Application</button>
              </div>
            )}
          </>
        )}

        {activeView === "new-application" && (
          <>
            <div className="page-header">
              <div className="breadcrumb"><a onClick={() => setActiveView("dashboard")}>Dashboard</a> / New Application</div>
              <h2>New Environmental Clearance Application</h2>
            </div>
            <div className="progress-steps mb-6">
              {FORM_STEPS.map((step, i) => (
                <React.Fragment key={step}>
                  <div className="progress-step">
                    <div className={`progress-step-num ${i < formStep ? "done" : i === formStep ? "active" : "pending"}`}>
                      {i < formStep ? "✓" : i + 1}
                    </div>
                    <span className="progress-step-label" style={{ color: i === formStep ? "var(--blue)" : undefined }}>{step}</span>
                  </div>
                  {i < FORM_STEPS.length - 1 && <div className={`progress-step-line ${i < formStep ? "done" : ""}`} />}
                </React.Fragment>
              ))}
            </div>

            <div className="card">
              <div className="card-body">
                {formStep === 0 && (
                  <>
                    <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Project Information</h3>
                    <div className="form-grid">
                      <div className="form-group">
                        <label className="form-label">Project Name *</label>
                        <input className="form-input" placeholder="Enter project name" value={formData.projectName}
                          onChange={e => setFormData({ ...formData, projectName: e.target.value })} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Project Cost</label>
                        <input className="form-input" placeholder="e.g., ₹500 Cr" value={formData.cost}
                          onChange={e => setFormData({ ...formData, cost: e.target.value })} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">District</label>
                        <input className="form-input" placeholder="District name" value={formData.district}
                          onChange={e => setFormData({ ...formData, district: e.target.value })} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">State</label>
                        <input className="form-input" placeholder="State name" value={formData.state}
                          onChange={e => setFormData({ ...formData, state: e.target.value })} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Area (in hectares)</label>
                        <input className="form-input" placeholder="e.g., 500 ha" value={formData.area}
                          onChange={e => setFormData({ ...formData, area: e.target.value })} />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Project Description</label>
                      <textarea className="form-input" rows={4} placeholder="Brief description of the project..."
                        value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                    </div>
                  </>
                )}
                {formStep === 1 && (
                  <>
                    <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Category & Sector Selection</h3>
                    <div className="form-group">
                      <label className="form-label">Project Category *</label>
                      <div className="grid-3" style={{ gap: 12, marginTop: 8 }}>
                        {CATEGORIES.map(c => (
                          <div key={c.id} onClick={() => setFormData({ ...formData, category: c.id })}
                            style={{ border: `2px solid ${formData.category === c.id ? c.color : "var(--gray-200)"}`,
                              borderRadius: 8, padding: 16, cursor: "pointer",
                              background: formData.category === c.id ? c.color + "10" : "white" }}>
                            <div style={{ fontSize: 18, marginBottom: 8, color: c.color }}>●</div>
                            <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{c.label}</h4>
                            <p style={{ fontSize: 11, color: "var(--gray-500)" }}>{c.desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Industry Sector *</label>
                      <select className="form-input form-select" value={formData.sector}
                        onChange={e => setFormData({ ...formData, sector: e.target.value })}>
                        <option value="">Select sector...</option>
                        {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </>
                )}
                {formStep === 2 && (
                  <>
                    <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Document Upload</h3>
                    {[
                      { name: "Project Report", required: true },
                      { name: "Environmental Impact Assessment (EIA)", required: true },
                      { name: "Land Use Map", required: true },
                      { name: "Public Hearing Records", required: false },
                      { name: "NOC from State PCB", required: false },
                    ].map(doc => (
                      <div key={doc.name} className="doc-item">
                        <div className="doc-item-info">
                          <div className="doc-icon" style={{ background: "var(--blue-pale)" }}>📄</div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 500 }}>{doc.name}</div>
                            <div style={{ fontSize: 11, color: "var(--gray-500)" }}>{doc.required ? "Required" : "Optional"} • PDF, max 10MB</div>
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <button className="btn btn-outline btn-sm">⬆ Upload</button>
                        </div>
                      </div>
                    ))}
                    <div className="upload-zone" style={{ marginTop: 16 }}>
                      <div className="upload-icon">📁</div>
                      <p>Drag & drop additional files here</p>
                      <p style={{ fontSize: 11, marginTop: 4 }}>Supported: PDF, DOCX, JPG, PNG</p>
                    </div>
                  </>
                )}
                {formStep === 3 && (
                  <>
                    <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Payment</h3>
                    <div className="alert alert-info mb-4">
                      ℹ️ Application fee for {formData.category || "B1"} project: <strong>₹15,000</strong>
                    </div>
                    <div className="grid-2" style={{ gap: 16, marginBottom: 20 }}>
                      <div className={`payment-card ${paymentMethod === "upi" ? "selected" : ""}`} onClick={() => setPaymentMethod("upi")}>
                        <div style={{ fontSize: 32, marginBottom: 8 }}>📱</div>
                        <h4 style={{ fontSize: 14, fontWeight: 600 }}>UPI Payment</h4>
                        <p style={{ fontSize: 12, color: "var(--gray-500)" }}>BHIM, GPay, PhonePe</p>
                      </div>
                      <div className={`payment-card ${paymentMethod === "qr" ? "selected" : ""}`} onClick={() => setPaymentMethod("qr")}>
                        <div style={{ fontSize: 32, marginBottom: 8 }}>◼◼</div>
                        <h4 style={{ fontSize: 14, fontWeight: 600 }}>QR Code</h4>
                        <p style={{ fontSize: 12, color: "var(--gray-500)" }}>Scan to pay</p>
                      </div>
                    </div>
                    {paymentMethod === "qr" && (
                      <div style={{ textAlign: "center" }}>
                        <div className="qr-code">◼◼◼<br/>◼◼◼<br/>◼◼◼</div>
                        <p style={{ fontSize: 12, color: "var(--gray-500)" }}>Scan QR code with any UPI app</p>
                        <p style={{ fontFamily: "monospace", fontSize: 13, color: "var(--blue)", marginTop: 4 }}>parivesh@gov.in</p>
                      </div>
                    )}
                    {paymentMethod === "upi" && (
                      <div className="form-group">
                        <label className="form-label">UPI ID</label>
                        <input className="form-input" placeholder="yourname@bank" />
                        <div className="form-hint">Enter your UPI ID to proceed with payment</div>
                      </div>
                    )}
                    {!paymentDone && paymentMethod && (
                      <button className="btn btn-success btn-lg" style={{ width: "100%", marginTop: 16 }}
                        onClick={() => setPaymentDone(true)}>
                        💳 Simulate Payment (₹15,000)
                      </button>
                    )}
                    {paymentDone && (
                      <div className="alert alert-success">
                        ✅ Payment Successful! Transaction ID: TXN{Date.now().toString().slice(-8)}
                      </div>
                    )}
                  </>
                )}
                {formStep === 4 && (
                  <>
                    <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Review & Submit</h3>
                    <div className="alert alert-info mb-4">ℹ️ Please review all details before final submission.</div>
                    {[
                      ["Project Name", formData.projectName || "—"],
                      ["Category", formData.category || "—"],
                      ["Sector", formData.sector || "—"],
                      ["District", formData.district || "—"],
                      ["State", formData.state || "—"],
                      ["Area", formData.area || "—"],
                      ["Cost", formData.cost || "—"],
                      ["Payment", paymentDone ? "✅ Verified" : "❌ Not completed"],
                    ].map(([label, value]) => (
                      <div key={label} className="info-row">
                        <span className="info-label">{label}</span>
                        <span className="info-value">{value}</span>
                      </div>
                    ))}
                  </>
                )}

                <div className="divider" />
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <button className="btn btn-ghost" onClick={() => formStep > 0 ? setFormStep(formStep - 1) : setActiveView("dashboard")}>
                    ← {formStep > 0 ? "Back" : "Cancel"}
                  </button>
                  {formStep < FORM_STEPS.length - 1 ? (
                    <button className="btn btn-primary" onClick={() => setFormStep(formStep + 1)}>
                      Next →
                    </button>
                  ) : (
                    <button className="btn btn-success btn-lg" onClick={createDraft}>
                      💾 Save as Draft
                    </button>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {activeView === "view-app" && selectedApp && (
          <>
            <div className="page-header">
              <div className="breadcrumb">
                <a onClick={() => setActiveView("applications")}>My Applications</a> / {selectedApp.id}
              </div>
              <div className="flex-between">
                <div>
                  <h2>{selectedApp.projectName}</h2>
                  <p>{selectedApp.id} • {selectedApp.district}, {selectedApp.state}</p>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  {statusBadge(selectedApp.status)}
                  {selectedApp.status === "Draft" && (
                    <button className="btn btn-primary" onClick={() => submitApp(selectedApp)}>Submit Application</button>
                  )}
                </div>
              </div>
            </div>

            <div className="card mb-4">
              <div className="card-header"><span className="card-title">Workflow Progress</span></div>
              <div className="card-body"><WorkflowTimeline currentStatus={selectedApp.status} /></div>
            </div>

            {selectedApp.status === "EDS" && (
              <div className="alert alert-danger mb-4">
                ⚠️ <strong>Essential Documents Sought:</strong>
                <ul style={{ marginTop: 8, paddingLeft: 16 }}>
                  {selectedApp.eds.map((e, i) => <li key={i}>{e}</li>)}
                </ul>
              </div>
            )}

            <div className="grid-2" style={{ gap: 16 }}>
              <div className="card">
                <div className="card-header"><span className="card-title">Project Details</span></div>
                <div className="card-body">
                  {[
                    ["Category", catTag(selectedApp.category)],
                    ["Sector", selectedApp.sector],
                    ["Location", `${selectedApp.district}, ${selectedApp.state}`],
                    ["Area", selectedApp.area],
                    ["Cost", selectedApp.cost],
                    ["Submitted", selectedApp.submittedDate || "Not submitted"],
                  ].map(([label, value]) => (
                    <div key={label} className="info-row">
                      <span className="info-label">{label}</span>
                      <span className="info-value">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card">
                <div className="card-header"><span className="card-title">Documents</span></div>
                <div className="card-body">
                  {selectedApp.documents.map(d => (
                    <div key={d.name} className="doc-item">
                      <div className="doc-item-info">
                        <div className="doc-icon" style={{ background: d.uploaded ? "#f0fdf4" : "#fef2f2" }}>
                          {d.uploaded ? "✅" : "📄"}
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 500 }}>{d.name}</div>
                          <div style={{ fontSize: 11, color: d.uploaded ? "var(--success)" : "var(--danger)" }}>
                            {d.uploaded ? "Uploaded" : "Pending"}
                          </div>
                        </div>
                      </div>
                      {d.uploaded && <button className="btn btn-ghost btn-sm">⬇ Download</button>}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="card" style={{ marginTop: 16 }}>
              <div className="card-header"><span className="card-title">Activity Timeline</span></div>
              <div className="card-body">
                {selectedApp.timeline.map((t, i) => (
                  <div key={i} style={{ display: "flex", gap: 14, marginBottom: 16, paddingLeft: 4 }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: STATUS_COLORS[t.status] || "var(--gray-300)", flexShrink: 0, marginTop: 4 }} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{t.status}</div>
                      <div style={{ fontSize: 12, color: "var(--gray-500)" }}>{t.date} by {t.by}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeView === "profile" && (
          <>
            <div className="page-header"><h2>Profile</h2><p>Manage your account information</p></div>
            <div className="card">
              <div className="card-body">
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
                  <div className="avatar" style={{ width: 64, height: 64, fontSize: 22, background: "var(--blue)" }}>{user.avatar}</div>
                  <div>
                    <h3 style={{ fontSize: 18, fontWeight: 600 }}>{user.name}</h3>
                    <p style={{ color: "var(--gray-500)" }}>{user.email}</p>
                    <span className={`role-badge ${user.role}`}>{user.role}</span>
                  </div>
                </div>
                <div className="form-grid">
                  {[["Full Name", user.name], ["Email", user.email], ["Phone", "+91 98765 43210"], ["Organization", "ABC Infrastructure Pvt. Ltd."]].map(([label, val]) => (
                    <div key={label} className="form-group">
                      <label className="form-label">{label}</label>
                      <input className="form-input" defaultValue={val} />
                    </div>
                  ))}
                </div>
                <button className="btn btn-primary">Save Changes</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ─── SCRUTINY DASHBOARD ───────────────────────────────────────────────────────
const ScrutinyDashboard = ({ apps, setApps, user, activeView, setActiveView }) => {
  const [selectedApp, setSelectedApp] = useState(null);
  const [edsText, setEdsText] = useState("");
  const [note, setNote] = useState("");

  const workApps = apps.filter(a => ["Submitted", "Under Scrutiny", "EDS"].includes(a.status));

  const takeApp = (app) => {
    setApps(apps.map(a => a.id === app.id ? {
      ...a, status: "Under Scrutiny",
      timeline: [...a.timeline, { status: "Under Scrutiny", date: new Date().toISOString().split("T")[0], by: user.name }]
    } : a));
    setSelectedApp({ ...app, status: "Under Scrutiny" });
  };

  const raiseEds = (app) => {
    if (!edsText.trim()) return;
    setApps(apps.map(a => a.id === app.id ? {
      ...a, status: "EDS", eds: [...a.eds, edsText],
      timeline: [...a.timeline, { status: "EDS", date: new Date().toISOString().split("T")[0], by: user.name }]
    } : a));
    setEdsText(""); setSelectedApp(null); setActiveView("applications");
  };

  const referApp = (app) => {
    const gist = `MEETING GIST\n${"─".repeat(50)}\nApplication ID: ${app.id}\nProject Name: ${app.projectName}\nProponent: ${app.proponentName}\nCategory: ${app.category} | Sector: ${app.sector}\nLocation: ${app.district}, ${app.state}\nArea: ${app.area} | Cost: ${app.cost}\n\nSCRUTINY SUMMARY\n${"─".repeat(50)}\n${note || "All documents verified. Application meets requirements for referral to Expert Appraisal Committee."}\n\nDOCUMENTS VERIFIED\n${"─".repeat(50)}\n${app.documents.filter(d => d.uploaded).map(d => "✓ " + d.name).join("\n")}\n\nRECOMMENDATION\n${"─".repeat(50)}\nReferred to Expert Appraisal Committee for consideration in the next meeting.\n\nDate: ${new Date().toLocaleDateString("en-IN")}\nScrutiny Officer: ${user.name}`;

    setApps(apps.map(a => a.id === app.id ? {
      ...a, status: "Referred", gist,
      timeline: [...a.timeline, { status: "Referred", date: new Date().toISOString().split("T")[0], by: user.name }]
    } : a));
    setSelectedApp(null); setActiveView("applications");
  };

  return (
    <div style={{ display: "flex", flex: 1 }}>
      <div className="sidebar">
        <div className="sidebar-section">
          <div className="sidebar-label">Scrutiny Team</div>
          {[
            { k: "applications", icon: "📋", label: "Applications Queue", badge: workApps.filter(a => a.status === "Submitted").length || null },
            { k: "eds", icon: "⚠️", label: "EDS Tracker" },
            { k: "referred", icon: "➡️", label: "Referred Cases" },
          ].map(n => (
            <div key={n.k} className={`nav-item ${activeView === n.k ? "active" : ""}`} onClick={() => setActiveView(n.k)}>
              <span className="nav-icon">{n.icon}</span> {n.label}
              {n.badge ? <span className="nav-badge">{n.badge}</span> : null}
            </div>
          ))}
        </div>
      </div>
      <div className="content">
        {activeView === "applications" && !selectedApp && (
          <>
            <div className="page-header">
              <h2>Applications Queue</h2>
              <p>Review and process submitted applications</p>
            </div>
            {workApps.length === 0 && (
              <div style={{ textAlign: "center", padding: "60px 0", color: "var(--gray-500)" }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
                <p>No applications pending review</p>
              </div>
            )}
            {workApps.map(a => (
              <div key={a.id} className="card mb-4">
                <div className="card-body">
                  <div className="flex-between mb-4">
                    <div>
                      <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                        <span style={{ fontFamily: "monospace", fontSize: 12, color: "var(--blue)" }}>{a.id}</span>
                        {catTag(a.category)}
                        {statusBadge(a.status)}
                      </div>
                      <h3 style={{ fontSize: 16, fontWeight: 600 }}>{a.projectName}</h3>
                      <p style={{ fontSize: 12, color: "var(--gray-500)" }}>{a.sector} • {a.district}, {a.state}</p>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: a.paymentVerified ? "var(--success)" : "var(--danger)" }}>
                        {a.paymentVerified ? "✅" : "❌"} Payment {a.paymentVerified ? "Verified" : "Pending"}
                      </div>
                      <button className="btn btn-primary btn-sm" onClick={() => { setSelectedApp(a); if (a.status === "Submitted") takeApp(a); }}>
                        {a.status === "Submitted" ? "Start Review" : "Continue Review"}
                      </button>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 12 }}>
                    {a.documents.map(d => (
                      <span key={d.name} style={{ fontSize: 11, padding: "3px 8px", borderRadius: 4,
                        background: d.uploaded ? "#f0fdf4" : "#fef2f2", color: d.uploaded ? "var(--success)" : "var(--danger)" }}>
                        {d.uploaded ? "✓" : "✗"} {d.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </>
        )}

        {activeView === "applications" && selectedApp && (
          <>
            <div className="page-header">
              <div className="breadcrumb"><a onClick={() => setSelectedApp(null)}>Queue</a> / {selectedApp.id}</div>
              <div className="flex-between">
                <div>
                  <h2>{selectedApp.projectName}</h2>
                  <p>{selectedApp.id} • Scrutiny Review</p>
                </div>
                {statusBadge(selectedApp.status)}
              </div>
            </div>

            <div className="card mb-4">
              <div className="card-header"><span className="card-title">Document Verification</span></div>
              <div className="card-body">
                {selectedApp.documents.map(d => (
                  <div key={d.name} className="doc-item">
                    <div className="doc-item-info">
                      <div className="doc-icon" style={{ background: d.uploaded ? "#f0fdf4" : "#fef2f2" }}>
                        {d.uploaded ? "✅" : "❌"}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500 }}>{d.name}</div>
                        <div style={{ fontSize: 11, color: d.uploaded ? "var(--success)" : "var(--danger)" }}>
                          {d.uploaded ? "Document Uploaded" : "Missing"}
                        </div>
                      </div>
                    </div>
                    {d.uploaded && <div style={{ display: "flex", gap: 6 }}>
                      <button className="btn btn-ghost btn-sm">⬇ View</button>
                      <button className="btn btn-success btn-sm">✓ Verify</button>
                    </div>}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid-2" style={{ gap: 16 }}>
              <div className="card">
                <div className="card-header"><span className="card-title">Raise EDS</span></div>
                <div className="card-body">
                  <div className="form-group">
                    <label className="form-label">EDS Description</label>
                    <textarea className="form-input" rows={4} placeholder="Describe the missing or insufficient document..."
                      value={edsText} onChange={e => setEdsText(e.target.value)} />
                  </div>
                  <button className="btn btn-warning" onClick={() => raiseEds(selectedApp)}>⚠️ Raise EDS</button>
                </div>
              </div>
              <div className="card">
                <div className="card-header"><span className="card-title">Scrutiny Notes & Refer</span></div>
                <div className="card-body">
                  <div className="form-group">
                    <label className="form-label">Scrutiny Notes</label>
                    <textarea className="form-input" rows={4} placeholder="Add scrutiny summary and observations..."
                      value={note} onChange={e => setNote(e.target.value)} />
                  </div>
                  <button className="btn btn-success" onClick={() => referApp(selectedApp)}>
                    ✅ Approve & Refer to Meeting
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {activeView === "eds" && (
          <>
            <div className="page-header"><h2>EDS Tracker</h2><p>Track applications with Essential Documents Sought</p></div>
            {apps.filter(a => a.status === "EDS").map(a => (
              <div key={a.id} className="card mb-4">
                <div className="card-body">
                  <div className="flex-between mb-4">
                    <div>
                      <div style={{ display: "flex", gap: 8, marginBottom: 4 }}>
                        <span style={{ fontFamily: "monospace", fontSize: 12 }}>{a.id}</span>
                        {catTag(a.category)}
                        {statusBadge(a.status)}
                      </div>
                      <h3 style={{ fontSize: 15, fontWeight: 600 }}>{a.projectName}</h3>
                    </div>
                  </div>
                  {a.eds.map((e, i) => (
                    <div key={i} className="alert alert-danger" style={{ marginBottom: 8 }}>⚠️ {e}</div>
                  ))}
                </div>
              </div>
            ))}
            {apps.filter(a => a.status === "EDS").length === 0 && (
              <div style={{ textAlign: "center", padding: 60, color: "var(--gray-500)" }}>No EDS raised currently.</div>
            )}
          </>
        )}

        {activeView === "referred" && (
          <>
            <div className="page-header"><h2>Referred Cases</h2><p>Applications referred to Expert Appraisal Committee</p></div>
            <div className="table-wrap card">
              <table>
                <thead><tr><th>ID</th><th>Project</th><th>Category</th><th>Sector</th><th>Status</th><th>Gist</th></tr></thead>
                <tbody>
                  {apps.filter(a => ["Referred", "MoM Generated", "Finalized"].includes(a.status)).map(a => (
                    <tr key={a.id}>
                      <td><span style={{ fontFamily: "monospace", fontSize: 12 }}>{a.id}</span></td>
                      <td style={{ fontWeight: 500 }}>{a.projectName}</td>
                      <td>{catTag(a.category)}</td>
                      <td>{a.sector}</td>
                      <td>{statusBadge(a.status)}</td>
                      <td>{a.gist ? <span style={{ color: "var(--success)", fontSize: 12 }}>✅ Generated</span> : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ─── MOM DASHBOARD ────────────────────────────────────────────────────────────
const MomDashboard = ({ apps, setApps, user, activeView, setActiveView }) => {
  const [selectedApp, setSelectedApp] = useState(null);
  const [gistEdit, setGistEdit] = useState("");
  const [momText, setMomText] = useState("");
  const [locked, setLocked] = useState(false);

  const referredApps = apps.filter(a => ["Referred", "MoM Generated", "Finalized"].includes(a.status));

  const generateMoM = (app) => {
    const mom = `MINUTES OF MEETING\n${"═".repeat(60)}\n\nMeeting: Expert Appraisal Committee (EAC)\nDate: ${new Date().toLocaleDateString("en-IN")}\nVenue: Ministry of Environment, Forest and Climate Change, New Delhi\n\n${"─".repeat(60)}\nAGENDA ITEM: Environmental Clearance Application\n${"─".repeat(60)}\n\nApplication ID: ${app.id}\nProject: ${app.projectName}\nProponent: ${app.proponentName}\nCategory: ${app.category} | Sector: ${app.sector}\nLocation: ${app.district}, ${app.state}\n\nPROCEEDINGS:\n\nThe Committee reviewed the Environmental Impact Assessment report and the project details as presented by the Project Proponent. The gist prepared by the scrutiny team was taken on record.\n\nOBSERVATIONS OF THE COMMITTEE:\n1. The EIA study is comprehensive and covers all required aspects.\n2. The proposed environmental management plan is adequate.\n3. The public hearing has been conducted as per EIA Notification, 2006.\n\nDECISION:\nThe Expert Appraisal Committee recommended grant of Environmental Clearance subject to the following conditions:\n\nSPECIFIC CONDITIONS:\n[EC Conditions to be detailed here]\n\nGENERAL CONDITIONS:\n1. All conditions of this letter shall be binding on the project proponent.\n2. A copy of this letter shall be marked to the concerned State Pollution Control Board.\n\nThe meeting concluded with a vote of thanks to the Chair.\n\n${"─".repeat(60)}\nSecretary, EAC\nMinistry of Environment, Forest and Climate Change\nDate: ${new Date().toLocaleDateString("en-IN")}`;

    setApps(apps.map(a => a.id === app.id ? {
      ...a, status: "MoM Generated", mom,
      timeline: [...a.timeline, { status: "MoM Generated", date: new Date().toISOString().split("T")[0], by: user.name }]
    } : a));
    setMomText(mom);
    setSelectedApp({ ...app, status: "MoM Generated", mom });
  };

  const finalizeApp = (app) => {
    setApps(apps.map(a => a.id === app.id ? {
      ...a, status: "Finalized",
      timeline: [...a.timeline, { status: "Finalized", date: new Date().toISOString().split("T")[0], by: user.name }]
    } : a));
    setLocked(true);
    setSelectedApp({ ...app, status: "Finalized" });
  };

  return (
    <div style={{ display: "flex", flex: 1 }}>
      <div className="sidebar">
        <div className="sidebar-section">
          <div className="sidebar-label">MoM Secretariat</div>
          {[
            { k: "referred", icon: "📥", label: "Referred Applications", badge: apps.filter(a => a.status === "Referred").length || null },
            { k: "mom-editor", icon: "✍️", label: "MoM Editor" },
            { k: "finalized", icon: "🔒", label: "Finalized Cases" },
          ].map(n => (
            <div key={n.k} className={`nav-item ${activeView === n.k ? "active" : ""}`} onClick={() => setActiveView(n.k)}>
              <span className="nav-icon">{n.icon}</span> {n.label}
              {n.badge ? <span className="nav-badge">{n.badge}</span> : null}
            </div>
          ))}
        </div>
      </div>
      <div className="content">
        {activeView === "referred" && (
          <>
            <div className="page-header">
              <h2>Referred Applications</h2>
              <p>Applications ready for Minutes of Meeting preparation</p>
            </div>
            {referredApps.map(a => (
              <div key={a.id} className="card mb-4">
                <div className="card-body">
                  <div className="flex-between">
                    <div>
                      <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                        <span style={{ fontFamily: "monospace", fontSize: 12, color: "var(--blue)" }}>{a.id}</span>
                        {catTag(a.category)}
                        {statusBadge(a.status)}
                      </div>
                      <h3 style={{ fontSize: 15, fontWeight: 600 }}>{a.projectName}</h3>
                      <p style={{ fontSize: 12, color: "var(--gray-500)" }}>{a.sector} • {a.district}, {a.state} • {a.area}</p>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <button className="btn btn-outline btn-sm" onClick={() => { setSelectedApp(a); setGistEdit(a.gist || ""); setMomText(a.mom || ""); setLocked(a.status === "Finalized"); setActiveView("mom-editor"); }}>
                        {a.status === "Referred" ? "✍️ Create MoM" : "📄 View MoM"}
                      </button>
                    </div>
                  </div>
                  {a.gist && (
                    <details style={{ marginTop: 12 }}>
                      <summary style={{ fontSize: 13, color: "var(--blue)", cursor: "pointer" }}>View Generated Gist</summary>
                      <div className="gist-preview" style={{ marginTop: 8 }}>{a.gist}</div>
                    </details>
                  )}
                </div>
              </div>
            ))}
          </>
        )}

        {activeView === "mom-editor" && selectedApp && (
          <>
            <div className="page-header">
              <div className="breadcrumb"><a onClick={() => setActiveView("referred")}>Referred</a> / MoM Editor</div>
              <div className="flex-between">
                <div>
                  <h2>MoM Editor: {selectedApp.id}</h2>
                  <p>{selectedApp.projectName}</p>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  {locked && <div className="alert alert-warning" style={{ padding: "6px 12px" }}>🔒 Finalized & Locked</div>}
                  {statusBadge(selectedApp.status)}
                </div>
              </div>
            </div>

            {selectedApp.gist && (
              <div className="card mb-4">
                <div className="card-header">
                  <span className="card-title">Generated Gist</span>
                  {!locked && <span style={{ fontSize: 12, color: "var(--gray-500)" }}>Editable before MoM creation</span>}
                </div>
                <div className="card-body">
                  <textarea className="form-input" rows={8} value={gistEdit}
                    onChange={e => setGistEdit(e.target.value)} disabled={locked}
                    style={{ fontFamily: "monospace", fontSize: 12 }} />
                  {!locked && <button className="btn btn-ghost btn-sm" style={{ marginTop: 8 }}>💾 Save Gist</button>}
                </div>
              </div>
            )}

            {selectedApp.status === "Referred" && !locked && (
              <div style={{ textAlign: "center", padding: "24px 0" }}>
                <button className="btn btn-primary btn-lg" onClick={() => generateMoM(selectedApp)}>
                  📄 Generate Minutes of Meeting
                </button>
              </div>
            )}

            {(selectedApp.status === "MoM Generated" || selectedApp.status === "Finalized") && (
              <div className="card">
                <div className="card-header">
                  <span className="card-title">Minutes of Meeting</span>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn btn-ghost btn-sm">⬇ Export DOCX</button>
                    <button className="btn btn-ghost btn-sm">⬇ Export PDF</button>
                    {!locked && <button className="btn btn-danger btn-sm" onClick={() => finalizeApp(selectedApp)}>🔒 Finalize & Lock</button>}
                  </div>
                </div>
                <div className="card-body">
                  <textarea className="form-input" rows={20} value={momText}
                    onChange={e => setMomText(e.target.value)} disabled={locked}
                    style={{ fontFamily: "monospace", fontSize: 12, lineHeight: 1.7 }} />
                </div>
              </div>
            )}
          </>
        )}

        {activeView === "finalized" && (
          <>
            <div className="page-header"><h2>Finalized Cases</h2><p>Completed and locked minutes of meeting</p></div>
            <div className="card">
              <div className="table-wrap">
                <table>
                  <thead><tr><th>ID</th><th>Project</th><th>Category</th><th>Status</th><th>Actions</th></tr></thead>
                  <tbody>
                    {apps.filter(a => a.status === "Finalized").map(a => (
                      <tr key={a.id}>
                        <td><span style={{ fontFamily: "monospace", fontSize: 12 }}>{a.id}</span></td>
                        <td style={{ fontWeight: 500 }}>{a.projectName}</td>
                        <td>{catTag(a.category)}</td>
                        <td>{statusBadge(a.status)}</td>
                        <td><div style={{ display: "flex", gap: 6 }}>
                          <button className="btn btn-ghost btn-sm">⬇ DOCX</button>
                          <button className="btn btn-ghost btn-sm">⬇ PDF</button>
                        </div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {apps.filter(a => a.status === "Finalized").length === 0 && (
                  <div style={{ textAlign: "center", padding: 40, color: "var(--gray-500)" }}>No finalized cases yet.</div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ─── LOGIN ────────────────────────────────────────────────────────────────────
const Login = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    const user = USERS.find(u => u.email === email && u.password === password);
    if (user) onLogin(user);
    else setError("Invalid credentials. Check demo credentials below.");
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <div className="login-emblem"><span>P3</span></div>
          <h2>PARIVESH 3.0</h2>
          <p>Environmental Clearance Workflow Portal</p>
          <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>Ministry of Environment, Forest and Climate Change</p>
        </div>
        <div className="login-demo">
          <h4>🔑 Demo Credentials</h4>
          {[
            ["Admin", "admin@parivesh.gov.in", "admin123"],
            ["Proponent", "pp@parivesh.gov.in", "pp123"],
            ["Scrutiny", "scrutiny@parivesh.gov.in", "scr123"],
            ["MoM Team", "mom@parivesh.gov.in", "mom123"],
          ].map(([role, email, pass]) => (
            <div key={role} className="demo-credential" style={{ cursor: "pointer" }} onClick={() => { setEmail(email); setPassword(pass); }}>
              <span style={{ color: "var(--blue)", fontWeight: 600 }}>{role}</span>
              <span>{email} / {pass}</span>
            </div>
          ))}
        </div>
        <div className="form-group">
          <label className="form-label">Email Address</label>
          <input className="form-input" type="email" placeholder="Enter your email" value={email}
            onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} />
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <input className="form-input" type="password" placeholder="Enter password" value={password}
            onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} />
          {error && <div className="form-error">{error}</div>}
        </div>
        <button className="btn btn-primary btn-lg" style={{ width: "100%" }} onClick={handleLogin}>
          🔐 Sign In to Portal
        </button>
        <p style={{ textAlign: "center", fontSize: 11, color: "#94a3b8", marginTop: 16 }}>
          Secured by NIC • Government of India
        </p>
      </div>
    </div>
  );
};

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [apps, setApps] = useState(APPS);
  const [activeView, setActiveView] = useState("dashboard");

  const handleLogin = (u) => {
    setUser(u);
    setActiveView(u.role === "admin" ? "overview" : u.role === "pp" ? "dashboard" : u.role === "scrutiny" ? "applications" : "referred");
  };

  if (!user) return (
    <>
      <style>{STYLES}</style>
      <Login onLogin={handleLogin} />
    </>
  );

  const ROLE_LABELS = { admin: "System Admin", pp: "Project Proponent", scrutiny: "Scrutiny Officer", mom: "MoM Secretariat" };

  return (
    <>
      <style>{STYLES}</style>
      <div className="app-root">
        <div className="topbar">
          <div className="topbar-brand">
            <div className="topbar-emblem">P3</div>
            <div className="topbar-title">
              <h1>PARIVESH 3.0</h1>
              <p>Environmental Clearance Workflow Portal — MoEFCC</p>
            </div>
          </div>
          <div className="topbar-right">
            <div className="topbar-user">
              <div className="avatar">{user.avatar}</div>
              <div>
                <div className="user-name">{user.name}</div>
                <span className={`role-badge ${user.role}`}>{ROLE_LABELS[user.role]}</span>
              </div>
            </div>
            <button className="btn-logout" onClick={() => { setUser(null); setActiveView("dashboard"); }}>Sign Out</button>
          </div>
        </div>

        <div className="main-layout">
          {user.role === "admin" && <AdminDashboard apps={apps} users={USERS} setActiveView={setActiveView} activeView={activeView} />}
          {user.role === "pp" && <PPDashboard apps={apps} user={user} setApps={setApps} activeView={activeView} setActiveView={setActiveView} />}
          {user.role === "scrutiny" && <ScrutinyDashboard apps={apps} setApps={setApps} user={user} activeView={activeView} setActiveView={setActiveView} />}
          {user.role === "mom" && <MomDashboard apps={apps} setApps={setApps} user={user} activeView={activeView} setActiveView={setActiveView} />}
        </div>

        <Chatbot />
      </div>
    </>
  );
}
