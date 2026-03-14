"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/store/useStore";
import { Application, ApplicationStatus, User } from "@/types";
import {
  LayoutDashboard, Users, FileText, Map, ClipboardList, Settings2, ShieldCheck,
  Search, PlusCircle, X, Check, ToggleLeft, ToggleRight, ChevronRight, Download
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
const SECTORS = ["Mining","Infrastructure","Thermal Power","River Valley & Hydroelectric","Nuclear Power","Industrial Estate","Tourism","Coastal Regulation"];
const AUDIT_LOG = [
  { id: 1, action: "Application Submitted",  user: "Ramesh Singh",    role: "PP",       target: "APP-*",    date: "2024-02-01 10:23", type: "submit" },
  { id: 2, action: "Scrutiny Started",        user: "Scrutiny Officer",role: "SCRUTINY", target: "APP-*",    date: "2024-02-05 09:45", type: "review" },
  { id: 3, action: "Application Referred",    user: "Scrutiny Officer",role: "SCRUTINY", target: "APP-*",    date: "2024-02-10 14:30", type: "refer" },
  { id: 4, action: "MoM Generated",           user: "MoM Secretary",   role: "MOM",      target: "APP-*",    date: "2024-02-12 11:15", type: "mom" },
  { id: 5, action: "User Role Updated",       user: "System Controller",role:"ADMIN",    target: "All users", date: "2024-02-13 16:00", type: "admin" },
  { id: 6, action: "Application Finalized",   user: "MoM Secretary",   role: "MOM",      target: "APP-*",    date: "2024-02-14 15:20", type: "finalize" },
];

// ─── SHARED ───────────────────────────────────────────────────────────────────
const StatusBadge = ({ status }: { status: string }) => {
  const color = STATUS_COLORS[status] || "#94a3b8";
  const bg = STATUS_BG[status] || "#f8fafc";
  return (
    <span style={{ background: bg, color }} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide">
      <span style={{ background: color }} className="w-1.5 h-1.5 rounded-full inline-block" />{status}
    </span>
  );
};
const RoleBadge = ({ role }: { role: string }) => {
  const map: Record<string, string> = { ADMIN: "bg-yellow-100 text-yellow-800", PP: "bg-green-100 text-green-800", SCRUTINY: "bg-orange-100 text-orange-800", MOM: "bg-purple-100 text-purple-800" };
  return <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${map[role] || "bg-slate-100 text-slate-600"}`}>{role}</span>;
};
const CatBadge = ({ cat }: { cat: string }) => {
  const map: Record<string, string> = { A: "bg-red-100 text-red-800", B1: "bg-amber-100 text-amber-800", B2: "bg-green-100 text-green-800" };
  return <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${map[cat] || "bg-slate-100 text-slate-600"}`}>{cat}</span>;
};
const Toggle = ({ on, onToggle }: { on: boolean; onToggle: () => void }) => (
  <button onClick={onToggle} className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${on ? "bg-brand-green" : "bg-slate-300"}`}>
    <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${on ? "translate-x-5" : ""}`} />
  </button>
);
const StatCard = ({ label, value, icon, color, bg, sub }: { label: string; value: number | string; icon: string; color: string; bg: string; sub?: string }) => (
  <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center gap-3">
    <div style={{ background: bg, color }} className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0">{icon}</div>
    <div>
      <div style={{ color }} className="text-2xl font-bold leading-none">{value}</div>
      <div className="text-xs text-slate-500 mt-0.5">{label}</div>
      {sub && <div style={{ color }} className="text-[10px] mt-0.5">{sub}</div>}
    </div>
  </div>
);

// ─── OVERVIEW ────────────────────────────────────────────────────────────────
const OverviewView = ({ apps, users }: { apps: Application[]; users: User[] }) => {
  const stats = [
    { label: "Total Applications",  value: apps.length,                                                          icon: "📋", color: "#3b82f6", bg: "#eff6ff", sub: "All proposals" },
    { label: "Under Scrutiny",       value: apps.filter(a => a.status === "Under Scrutiny").length,               icon: "🔍", color: "#f59e0b", bg: "#fffbeb", sub: "Active reviews" },
    { label: "Finalized",            value: apps.filter(a => a.status === "Finalized").length,                    icon: "✅", color: "#10b981", bg: "#f0fdf4", sub: "EC Granted" },
    { label: "Registered Users",     value: users.length,                                                         icon: "👥", color: "#8b5cf6", bg: "#f5f3ff", sub: `${users.filter(u => u.role === "PP").length} proponents` },
  ];
  return (
    <div className="space-y-5">
      <div><h1 className="text-2xl font-bold text-brand-blue">Admin Dashboard</h1><p className="text-sm text-slate-500 mt-1">System overview — PARIVESH 3.0</p></div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{stats.map(s => <StatCard key={s.label} {...s} />)}</div>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 font-bold text-sm text-slate-700">Application Status Distribution</div>
          <div className="p-5 space-y-3">
            {STATUS_FLOW.map(s => {
              const count = apps.filter(a => a.status === s).length;
              const pct = apps.length ? Math.round(count / apps.length * 100) : 0;
              return (
                <div key={s}>
                  <div className="flex justify-between text-xs mb-1"><span className="font-medium text-slate-700">{s}</span><span className="text-slate-400">{count} ({pct}%)</span></div>
                  <div className="h-1.5 bg-slate-100 rounded-full"><div style={{ width: `${pct}%`, background: STATUS_COLORS[s] }} className="h-1.5 rounded-full transition-all" /></div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 font-bold text-sm text-slate-700">Recent Activity</div>
          <div className="p-4 space-y-1">
            {AUDIT_LOG.slice(0, 5).map(log => {
              const icons: Record<string, string> = { submit: "📤", review: "🔍", refer: "➡️", mom: "📄", admin: "⚙️", finalize: "🔒" };
              const bgs: Record<string, string>  = { submit: "#eff6ff", review: "#fffbeb", refer: "#f5f3ff", mom: "#ecfeff", admin: "#fef2f2", finalize: "#f0fdf4" };
              return (
                <div key={log.id} className="flex gap-3 py-2 border-b border-slate-50 last:border-0">
                  <div style={{ background: bgs[log.type] }} className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0">{icons[log.type]}</div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-slate-800 truncate">{log.action}</div>
                    <div className="text-[10px] text-slate-400">{log.user} • {log.date}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 font-bold text-sm text-slate-700">Sector Breakdown</div>
        <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-2">
          {SECTORS.map(s => {
            const count = apps.filter(a => a.sector === s).length;
            return (
              <div key={s} className={`p-3 rounded-lg border text-sm ${count ? "border-blue-100 bg-blue-50" : "border-slate-100 bg-slate-50"}`}>
                <div className="font-semibold text-slate-700 truncate text-xs">{s}</div>
                <div className={`font-bold mt-0.5 ${count ? "text-brand-blue" : "text-slate-400"}`}>{count} app{count !== 1 ? "s" : ""}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ─── USER MANAGEMENT ─────────────────────────────────────────────────────────
const UserManagementView = ({ users }: { users: User[] }) => {
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [editUser, setEditUser] = useState<User | null>(null);
  const [localUsers, setLocalUsers] = useState(users);
  const [addModal, setAddModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "", role: "PP" });

  const filtered = localUsers.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole   = filterRole === "all" || u.role === filterRole;
    return matchSearch && matchRole;
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-brand-blue">User Management</h1><p className="text-sm text-slate-500">Manage portal access and roles</p></div>
        <button onClick={() => setAddModal(true)} className="bg-brand-green text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-green-700">
          <PlusCircle className="w-4 h-4" /> Add User
        </button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[["Total", localUsers.length, "👥", "#8b5cf6", "#f5f3ff"],
          ["Proponents", localUsers.filter(u => u.role === "PP").length, "🏗️", "#3b82f6", "#eff6ff"],
          ["Scrutiny", localUsers.filter(u => u.role === "SCRUTINY").length, "🔍", "#f59e0b", "#fffbeb"],
          ["MoM", localUsers.filter(u => u.role === "MOM").length, "📄", "#8b5cf6", "#f5f3ff"],
        ].map(([l, v, i, c, b]) => <StatCard key={String(l)} label={String(l)} value={String(v)} icon={String(i)} color={String(c)} bg={String(b)} />)}
      </div>
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-3">
          <div className="flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-500 flex-1 max-w-xs">
            <Search className="w-3.5 h-3.5" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..." className="flex-1 outline-none bg-transparent text-slate-700 text-xs" />
          </div>
          <select value={filterRole} onChange={e => setFilterRole(e.target.value)} className="border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 bg-white outline-none">
            <option value="all">All Roles</option>
            {["ADMIN","PP","SCRUTINY","MOM"].map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <th className="px-5 py-3 text-left">User</th><th className="px-5 py-3 text-left">Email</th>
              <th className="px-5 py-3 text-left">Role</th><th className="px-5 py-3 text-left">Actions</th>
            </tr></thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-brand-blue text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {u.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                      </div>
                      <span className="font-semibold text-slate-800">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-slate-500 text-xs">{u.email}</td>
                  <td className="px-5 py-3"><RoleBadge role={u.role} /></td>
                  <td className="px-5 py-3">
                    <button onClick={() => setEditUser(u)} className="text-xs border border-slate-200 text-brand-blue px-3 py-1 rounded-lg hover:bg-blue-50 font-semibold">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-800">Edit User</h3>
              <button onClick={() => setEditUser(null)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-brand-blue text-white flex items-center justify-center font-bold">
                  {editUser.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                </div>
                <div><div className="font-semibold text-slate-800">{editUser.name}</div><div className="text-xs text-slate-500">{editUser.email}</div></div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Assign Role</label>
                <select defaultValue={editUser.role} className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm bg-white outline-none focus:border-brand-blue">
                  {["ADMIN","PP","SCRUTINY","MOM"].map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-2">
              <button onClick={() => setEditUser(null)} className="border border-slate-200 text-slate-600 px-4 py-2 rounded-lg text-sm font-semibold">Cancel</button>
              <button onClick={() => setEditUser(null)} className="bg-brand-blue text-white px-4 py-2 rounded-lg text-sm font-semibold">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {addModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-800">Add New User</h3>
              <button onClick={() => setAddModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="p-6 space-y-4">
              {([["Full Name","name","text"],["Email","email","email"]] as const).map(([l, k, t]) => (
                <div key={k}>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">{l}</label>
                  <input type={t} value={(newUser as Record<string,string>)[k as string]} onChange={e => setNewUser({ ...newUser, [k]: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand-blue" />
                </div>
              ))}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Role</label>
                <select value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm bg-white outline-none focus:border-brand-blue">
                  {["ADMIN","PP","SCRUTINY","MOM"].map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-2">
              <button onClick={() => setAddModal(false)} className="border border-slate-200 text-slate-600 px-4 py-2 rounded-lg text-sm font-semibold">Cancel</button>
              <button onClick={() => { setLocalUsers([...localUsers, { id: `U-NEW-${Date.now()}`, name: newUser.name, email: newUser.email, role: newUser.role as User["role"] }]); setAddModal(false); }}
                className="bg-brand-blue text-white px-4 py-2 rounded-lg text-sm font-semibold">Add User</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── ALL APPLICATIONS ─────────────────────────────────────────────────────────
const AllApplicationsView = ({ apps, updateStatus }: { apps: Application[]; updateStatus: (id: string, status: ApplicationStatus) => void }) => {
  const [search, setSearch]       = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCat, setFilterCat]   = useState("all");
  const [selected, setSelected]   = useState<Application | null>(null);

  const filtered = apps.filter(a => {
    const ms = (a.projectDetails.projectName + a.id).toLowerCase().includes(search.toLowerCase());
    const mst = filterStatus === "all" || a.status === filterStatus;
    const mc  = filterCat   === "all" || a.category === filterCat;
    return ms && mst && mc;
  });

  if (selected) {
    const app = apps.find(a => a.id === selected.id) || selected;
    return (
      <div className="space-y-5">
        <div className="flex items-center gap-1 text-xs text-slate-500">
          <button onClick={() => setSelected(null)} className="text-brand-blue hover:underline font-semibold">All Applications</button>
          <span>/</span><span className="font-mono text-brand-blue">{app.id}</span>
        </div>
        <div className="flex items-start justify-between">
          <div><h1 className="text-xl font-bold text-slate-800">{app.projectDetails.projectName || "Untitled"}</h1>
          <p className="text-sm text-slate-500">{app.id}</p></div>
          <div className="flex gap-2"><StatusBadge status={app.status} />
            <button onClick={() => setSelected(null)} className="border border-slate-200 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-slate-50">← Back</button>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h2 className="font-bold text-sm text-slate-700 border-b pb-3 mb-4">Project Details</h2>
            {[["App ID", <span key="id" className="font-mono text-xs text-brand-blue">{app.id}</span>],
              ["Category", <CatBadge key="c" cat={app.category} />],
              ["Sector", app.sector], ["Location", app.projectDetails.location || "—"],
              ["Area", `${app.projectDetails.area || "—"} ha`], ["Cost", `₹${app.projectDetails.cost || "—"} Cr`],
              ["Fee Status", <span key="f" className={app.feeStatus === "Paid" ? "text-green-600 font-bold" : "text-red-500 font-bold"}>{app.feeStatus === "Paid" ? "✅ Paid" : "❌ Pending"}</span>],
            ].map(([lbl, val]) => (
              <div key={String(lbl)} className="flex py-1.5 border-b border-slate-50 last:border-0 text-sm">
                <span className="w-28 text-xs font-semibold text-slate-500 flex-shrink-0 pt-0.5">{lbl}</span>
                <span className="text-slate-800">{val as React.ReactNode}</span>
              </div>
            ))}
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h2 className="font-bold text-sm text-slate-700 border-b pb-3 mb-4">Admin Override</h2>
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs text-blue-700 mb-4">Admin can override application status.</div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Override Status</label>
            <select defaultValue={app.status} onChange={e => updateStatus(app.id, e.target.value as ApplicationStatus)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm bg-white outline-none focus:border-brand-blue mb-4">
              {STATUS_FLOW.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Assign Scrutiny Officer</label>
            <select className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm bg-white outline-none focus:border-brand-blue">
              <option>Select officer...</option><option>Scrutiny Officer</option>
            </select>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div><h1 className="text-2xl font-bold text-brand-blue">All Applications</h1><p className="text-sm text-slate-500">Monitor and manage all EC proposals</p></div>
      <div className="flex gap-3 flex-wrap items-center">
        <div className="flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-2 text-slate-500 w-64">
          <Search className="w-3.5 h-3.5" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or ID..." className="flex-1 outline-none bg-transparent text-sm text-slate-700" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white outline-none text-slate-700">
          <option value="all">All Statuses</option>{STATUS_FLOW.map(s => <option key={s}>{s}</option>)}
        </select>
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)} className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white outline-none text-slate-700">
          <option value="all">All Categories</option>{["A","B1","B2"].map(c => <option key={c}>Category {c}</option>)}
        </select>
        <span className="text-xs text-slate-400 ml-auto">{filtered.length} result{filtered.length !== 1 ? "s" : ""}</span>
      </div>
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <th className="px-5 py-3 text-left">App ID</th><th className="px-5 py-3 text-left">Project</th>
              <th className="px-5 py-3 text-left">Cat</th><th className="px-5 py-3 text-left">Sector</th>
              <th className="px-5 py-3 text-left">Status</th><th className="px-5 py-3 text-left">Fee</th>
            </tr></thead>
            <tbody>
              {filtered.map(a => (
                <tr key={a.id} onClick={() => setSelected(a)} className="border-b border-slate-100 last:border-0 hover:bg-blue-50/40 cursor-pointer">
                  <td className="px-5 py-3.5 font-mono text-xs font-bold text-brand-blue">{a.id}</td>
                  <td className="px-5 py-3.5 font-semibold text-slate-800 max-w-[180px] truncate">{a.projectDetails.projectName || "Untitled"}</td>
                  <td className="px-5 py-3.5"><CatBadge cat={a.category} /></td>
                  <td className="px-5 py-3.5 text-slate-500 text-xs">{a.sector}</td>
                  <td className="px-5 py-3.5"><StatusBadge status={a.status} /></td>
                  <td className="px-5 py-3.5 text-sm">{a.feeStatus === "Paid" ? "✅" : "❌"}</td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={6} className="text-center text-slate-400 py-12">No applications match your filters.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ─── MAP VIEW ────────────────────────────────────────────────────────────────
const MapView = ({ apps }: { apps: Application[] }) => {
  const [hovered, setHovered] = useState<string | null>(null);
  const COORDS: Record<string, [number, number]> = {};
  apps.forEach((a, i) => { COORDS[a.id] = [25 + i * 3.5, 72 + i * 5]; });
  const toPos = (lat: number, lng: number) => ({ top: `${((37 - lat) / 20) * 75 + 10}%`, left: `${((lng - 68) / 28) * 80 + 5}%` });
  return (
    <div className="space-y-5">
      <div><h1 className="text-2xl font-bold text-brand-blue">Project Locations</h1><p className="text-sm text-slate-500">Geographic distribution of all proposals</p></div>
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="relative h-80 bg-gradient-to-br from-blue-50 to-cyan-50 overflow-hidden">
          <svg viewBox="0 0 800 500" className="w-full h-full absolute inset-0 opacity-30">
            <path d="M200 60 L620 60 L660 150 L690 250 L650 370 L580 430 L450 480 L380 460 L300 400 L220 320 L185 220 Z" fill="#bfdbfe" stroke="#93c5fd" strokeWidth="2" />
            <text x="390" y="260" textAnchor="middle" fill="#1e40af" fontSize="28" opacity="0.15" fontWeight="700">INDIA</text>
          </svg>
          {apps.map(a => {
            const pos = toPos(...(COORDS[a.id] || [28, 77]));
            return (
              <div key={a.id} style={{ position: "absolute", ...pos, transform: "translate(-50%,-100%)" }}
                onMouseEnter={() => setHovered(a.id)} onMouseLeave={() => setHovered(null)}>
                {hovered === a.id && (
                  <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white rounded-xl shadow-xl p-3 border border-slate-200 min-w-[160px] z-10 text-xs">
                    <div className="font-bold text-brand-blue mb-1 leading-tight">{a.projectDetails.projectName || a.id}</div>
                    <div className="text-slate-500">{a.sector}</div>
                    <div className="mt-1.5"><StatusBadge status={a.status} /></div>
                  </div>
                )}
                <div style={{ background: STATUS_COLORS[a.status], width: 24, height: 24, borderRadius: "50% 50% 50% 0", transform: "rotate(-45deg)", border: "2px solid white", boxShadow: "0 2px 6px rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ transform: "rotate(45deg)", fontSize: 10 }}>•</span>
                </div>
              </div>
            );
          })}
          <div className="absolute bottom-3 left-3 bg-white rounded-xl border border-slate-200 p-3 text-xs shadow-sm">
            <div className="font-bold text-slate-700 mb-2 text-[10px] uppercase tracking-wide">Legend</div>
            {Object.entries(STATUS_COLORS).map(([s, c]) => (
              <div key={s} className="flex items-center gap-1.5 mb-1"><span style={{ background: c }} className="w-2 h-2 rounded-full inline-block" /><span className="text-slate-600">{s}</span></div>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-slate-50 border-y border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <th className="px-5 py-3 text-left">App ID</th><th className="px-5 py-3 text-left">Project</th>
              <th className="px-5 py-3 text-left">Sector</th><th className="px-5 py-3 text-left">Category</th><th className="px-5 py-3 text-left">Status</th>
            </tr></thead>
            <tbody>
              {apps.map(a => (
                <tr key={a.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-5 py-3 font-mono text-xs font-bold text-brand-blue">{a.id}</td>
                  <td className="px-5 py-3 font-semibold text-slate-800">{a.projectDetails.projectName || "—"}</td>
                  <td className="px-5 py-3 text-slate-500 text-xs">{a.sector}</td>
                  <td className="px-5 py-3"><CatBadge cat={a.category} /></td>
                  <td className="px-5 py-3"><StatusBadge status={a.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ─── AUDIT LOG ────────────────────────────────────────────────────────────────
const AuditLogView = () => {
  const [search, setSearch] = useState("");
  const icons: Record<string, string>  = { submit: "📤", review: "🔍", refer: "➡️", mom: "📄", admin: "⚙️", finalize: "🔒" };
  const bgs: Record<string, string>    = { submit: "#eff6ff", review: "#fffbeb", refer: "#f5f3ff", mom: "#ecfeff", admin: "#fef2f2", finalize: "#f0fdf4" };
  const filtered = AUDIT_LOG.filter(l => (l.action + l.user + l.target).toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-brand-blue">Audit Log</h1><p className="text-sm text-slate-500">Complete activity trail</p></div>
        <button className="border border-slate-200 text-slate-600 px-4 py-2 rounded-lg text-xs font-semibold hover:bg-slate-50 flex items-center gap-2"><Download className="w-3.5 h-3.5" /> Export CSV</button>
      </div>
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-3">
          <div className="flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-1.5 flex-1 max-w-xs">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="flex-1 text-xs outline-none text-slate-700" />
          </div>
          <span className="text-xs text-slate-400">{filtered.length} entries</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <th className="px-5 py-3 text-left">Action</th><th className="px-5 py-3 text-left">Performed By</th>
              <th className="px-5 py-3 text-left">Role</th><th className="px-5 py-3 text-left">Target</th><th className="px-5 py-3 text-left">Date & Time</th>
            </tr></thead>
            <tbody>
              {filtered.map(log => (
                <tr key={log.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div style={{ background: bgs[log.type] }} className="w-7 h-7 rounded-lg flex items-center justify-center text-xs flex-shrink-0">{icons[log.type]}</div>
                      <span className="font-semibold text-slate-700">{log.action}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-slate-700">{log.user}</td>
                  <td className="px-5 py-3"><RoleBadge role={log.role} /></td>
                  <td className="px-5 py-3 font-mono text-xs text-brand-blue">{log.target}</td>
                  <td className="px-5 py-3 text-slate-500 text-xs">{log.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ─── SETTINGS ────────────────────────────────────────────────────────────────
const SettingsView = () => {
  const templates = useStore(s => s.templates);
  const [settings, setSettings] = useState({ emailNotifs: true, smsAlerts: false, autoAssign: true, maintenanceMode: false, edsDays: "30", maxFileSize: "10" });
  const tog = (k: keyof typeof settings) => setSettings(s => ({ ...s, [k]: !s[k] }));
  return (
    <div className="space-y-5">
      <div><h1 className="text-2xl font-bold text-brand-blue">System Settings</h1><p className="text-sm text-slate-500">Configure portal-wide preferences</p></div>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
          <h2 className="font-bold text-sm text-slate-700 border-b pb-3 mb-4">Notifications</h2>
          {([["emailNotifs","Email Notifications","Send alerts on status changes"],
            ["smsAlerts","SMS Alerts","Critical EDS/deadline alerts"],
            ["autoAssign","Auto-assign Scrutiny","Automatically assign new applications"]] as const).map(([k, l, d]) => (
            <div key={k} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
              <div><div className="text-sm font-semibold text-slate-700">{l}</div><div className="text-xs text-slate-400">{d}</div></div>
              <Toggle on={settings[k] as boolean} onToggle={() => tog(k)} />
            </div>
          ))}
        </div>
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
          <h2 className="font-bold text-sm text-slate-700 border-b pb-3 mb-4">Application Rules</h2>
          {([["EDS Response Window (days)", "edsDays"],["Max File Size (MB)", "maxFileSize"]] as const).map(([l, k]) => (
            <div key={k} className="mb-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">{l}</label>
              <input type="number" value={settings[k] as string} onChange={e => setSettings(s => ({ ...s, [k]: e.target.value }))}
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand-blue" />
            </div>
          ))}
        </div>
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
          <h2 className="font-bold text-sm text-slate-700 border-b pb-3 mb-4">MoM Gist Templates</h2>
          {templates.map(t => (
            <div key={t.id} className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0">
              <div><div className="text-sm font-semibold text-slate-700">{t.sectorType}</div>
                <div className="text-[10px] font-mono text-brand-blue">{t.id}</div></div>
              <span className="bg-brand-saffron/10 text-brand-saffron text-[10px] font-bold px-2 py-0.5 rounded-full">Cat {t.category}</span>
            </div>
          ))}
        </div>
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
          <h2 className="font-bold text-sm text-slate-700 border-b pb-3 mb-4">Maintenance</h2>
          <div className="flex items-center justify-between mb-4">
            <div><div className="text-sm font-semibold text-slate-700">Maintenance Mode</div><div className="text-xs text-slate-400">Disable for non-admin users</div></div>
            <Toggle on={settings.maintenanceMode} onToggle={() => tog("maintenanceMode")} />
          </div>
          {settings.maintenanceMode && <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700">⚠️ Only admins can access the portal now.</div>}
          <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-2">
            {["🗄️ Backup DB","📊 Export Reports","🔄 Clear Cache","📜 View Logs"].map(b => (
              <button key={b} className="border border-slate-200 bg-slate-50 text-slate-600 text-xs py-2 px-3 rounded-lg hover:bg-slate-100 font-medium">{b}</button>
            ))}
          </div>
        </div>
      </div>
      <div className="flex justify-end">
        <button className="bg-brand-blue text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-brand-light-blue">💾 Save All Settings</button>
      </div>
    </div>
  );
};

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const allApplications = useStore(s => s.applications);
  const allUsers        = useStore(s => s.users);
  const updateStatus    = useStore(s => s.updateApplicationStatus);

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);
  const [view, setView] = useState("overview");

  if (!isMounted) return null;

  const nav = [
    { section: "Main",       items: [{ k: "overview", icon: <LayoutDashboard className="w-4 h-4" />, label: "Overview" }, { k: "applications", icon: <FileText className="w-4 h-4" />, label: "All Applications" }, { k: "map", icon: <Map className="w-4 h-4" />, label: "Project Map" }] },
    { section: "Management", items: [{ k: "users", icon: <Users className="w-4 h-4" />, label: "User Management" }, { k: "audit", icon: <ClipboardList className="w-4 h-4" />, label: "Audit Log" }] },
    { section: "System",     items: [{ k: "settings", icon: <Settings2 className="w-4 h-4" />, label: "System Settings" }] },
  ];

  return (
    <div className="flex gap-6 items-start">
      {/* Sidebar */}
      <aside className="w-52 flex-shrink-0 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden sticky top-4">
        <div className="px-4 py-3 bg-slate-800 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-yellow-400" />
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Admin Control</p>
        </div>
        <nav className="p-2">
          {nav.map(section => (
            <div key={section.section} className="mb-1">
              <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 px-3 py-2">{section.section}</p>
              {section.items.map(n => (
                <button key={n.k} onClick={() => setView(n.k)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium mb-0.5 transition-colors text-left
                    ${view === n.k ? "bg-brand-blue text-white" : "text-slate-600 hover:bg-slate-100"}`}>
                  {n.icon}<span>{n.label}</span>
                </button>
              ))}
            </div>
          ))}
        </nav>
        {/* Live Status Widget */}
        <div className="border-t border-slate-100 p-3 mt-1">
          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-2">Live Status</p>
          {STATUS_FLOW.map(s => (
            <div key={s} className="flex justify-between text-[10px] py-0.5">
              <span className="text-slate-600 truncate">{s}</span>
              <span style={{ color: STATUS_COLORS[s] }} className="font-bold flex-shrink-0 ml-1">{allApplications.filter(a => a.status === s).length}</span>
            </div>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        {view === "overview"      && <OverviewView apps={allApplications} users={allUsers} />}
        {view === "applications"  && <AllApplicationsView apps={allApplications} updateStatus={updateStatus} />}
        {view === "map"           && <MapView apps={allApplications} />}
        {view === "users"         && <UserManagementView users={allUsers} />}
        {view === "audit"         && <AuditLogView />}
        {view === "settings"      && <SettingsView />}
      </main>
    </div>
  );
}
