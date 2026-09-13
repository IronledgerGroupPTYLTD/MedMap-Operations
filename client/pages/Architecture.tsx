import { Link } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  Boxes,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  Database,
  GitBranch,
  KeyRound,
  LockKeyhole,
  Network,
  Settings2,
  ShieldCheck,
  Workflow,
  XCircle,
} from "lucide-react";
import { AppShell, architectureLayers } from "@/components/medmap/AppShell";
import { cn } from "@/lib/utils";

const entities = [
  { name: "Organisation", items: "Company · Departments · Teams · Employees", color: "#84e0c3", icon: Boxes },
  { name: "Master data", items: "Patients · Doctors · Practices · Ambassadors", color: "#b8a4f3", icon: Network },
  { name: "Transactions", items: "Bookings · Payments · Subscriptions · Revenue", color: "#f5be68", icon: BarChart3 },
  { name: "Workflows", items: "Tickets · Cases · Approvals · Escalations", color: "#f29b76", icon: Workflow },
  { name: "Intelligence", items: "KPIs · Goals · Measurements · Status", color: "#77b4f4", icon: Database },
  { name: "Governance", items: "Risks · Alerts · Decisions · Audit logs", color: "#d7a4e9", icon: ShieldCheck },
];

const phases = [
  ["01", "Foundation", "Auth, roles, reporting lines, company structure"],
  ["02", "Master data", "Patients, doctors, practices, ambassadors, employees"],
  ["03", "Commerce", "Bookings, payments, subscriptions, revenue attribution"],
  ["04", "Operations", "Tickets, cases, approvals, escalations, workflows"],
  ["05", "Performance", "Goals, KPI engine, measurements, roll-ups"],
  ["06", "Executive layer", "CEO, COO, CTO views, alerts and decisions"],
];

const principles = [
  { title: "Single source of truth", detail: "One authoritative record can power multiple domain views without copying the data." },
  { title: "Historical accuracy", detail: "Prices, targets, thresholds and ownership are effective-dated and never overwrite history." },
  { title: "Accountability by default", detail: "Every important action has an owner, deadline, status, evidence and audit trail." },
  { title: "Configurable, not hard-coded", detail: "Management settings change through configuration, not a new deployment." },
];

export default function Architecture() {
  return <AppShell>
    <div className="mx-auto max-w-[1440px] px-5 pb-12 pt-8 sm:px-8 xl:px-10">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div><div className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.17em] text-[#1b9975]"><Network size={13} /> Data-first foundation</div><h1 className="font-display text-[32px] font-bold tracking-[-0.06em] text-[#152239] sm:text-[39px]">The operating system starts here.</h1><p className="mt-2 max-w-[700px] text-[13px] leading-6 text-slate-500">A relational architecture that connects company structure, transactions, accountability, performance and executive intelligence before the dashboard layer.</p></div>
        <Link to="/" className="inline-flex items-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-[11px] font-bold text-slate-600 shadow-sm transition hover:border-[#a4dbc9] hover:text-[#168465] md:self-auto"><ArrowRight size={14} className="rotate-180" /> Back to command centre</Link>
      </div>

      <section className="mt-7 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_5px_20px_rgba(21,36,58,0.035)] sm:p-7"><div className="flex flex-wrap items-center justify-between gap-4"><div><div className="flex items-center gap-2"><span className="grid size-8 place-items-center rounded-lg bg-[#e8f8f2] text-[#1b9975]"><GitBranch size={16} /></span><h2 className="font-display text-[17px] font-bold tracking-[-0.03em] text-[#152239]">The connected data spine</h2></div><p className="mt-2 text-[11px] text-slate-400">Every dashboard view should be a projection of this model.</p></div><span className="inline-flex items-center gap-1.5 rounded-full bg-[#e8f8f2] px-2.5 py-1.5 text-[10px] font-bold text-[#168465]"><CheckCircle2 size={13} /> Architecture defined</span></div><div className="mt-8 overflow-x-auto pb-2"><div className="flex min-w-[880px] items-center justify-between gap-2">{architectureLayers.map((layer, index) => { const Icon = layer.icon; return <div key={layer.label} className="flex items-center gap-2"><div className="flex w-[120px] flex-col items-center gap-2 text-center"><span className="grid size-12 place-items-center rounded-2xl border" style={{ color: layer.color, borderColor: `${layer.color}55`, backgroundColor: `${layer.color}13` }}><Icon size={21} /></span><span className="text-[11px] font-bold text-slate-600">{layer.label}</span></div>{index < architectureLayers.length - 1 && <ArrowRight size={17} className="text-slate-300" />}</div>; })}</div></div><div className="mt-6 rounded-xl bg-[#101a2c] px-4 py-3.5 text-center font-mono text-[11px] font-semibold tracking-[0.01em] text-slate-300 sm:text-[12px]">DATA <span className="mx-2 text-[#84e0c3]">→</span> PROCESSES <span className="mx-2 text-[#84e0c3]">→</span> ACTIVITY <span className="mx-2 text-[#84e0c3]">→</span> KPI ENGINE <span className="mx-2 text-[#84e0c3]">→</span> STATUS <span className="mx-2 text-[#84e0c3]">→</span> EXECUTIVE ROLL-UP</div></section>

      <section className="mt-5 grid gap-5 lg:grid-cols-[1.05fr_.95fr]"><article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_5px_20px_rgba(21,36,58,0.035)] sm:p-6"><div className="flex items-center gap-2"><span className="grid size-8 place-items-center rounded-lg bg-[#eaf3ff] text-[#4a87c9]"><Database size={16} /></span><h2 className="font-display text-[16px] font-bold tracking-[-0.03em] text-[#152239]">Core entity map</h2></div><p className="mt-2 text-[11px] text-slate-400">Authoritative records, joined rather than duplicated.</p><div className="mt-5 grid gap-2 sm:grid-cols-2">{entities.map((entity) => { const Icon = entity.icon; return <div key={entity.name} className="group flex items-center gap-3 rounded-xl border border-slate-100 bg-[#fafbfc] p-3 transition hover:border-slate-200 hover:bg-white"><span className="grid size-9 place-items-center rounded-xl" style={{ color: entity.color, backgroundColor: `${entity.color}18` }}><Icon size={16} /></span><div className="min-w-0"><p className="text-[11px] font-bold text-slate-700">{entity.name}</p><p className="mt-1 truncate text-[10px] text-slate-400">{entity.items}</p></div><ChevronRight size={14} className="ml-auto text-slate-300 transition group-hover:text-slate-500" /></div>; })}</div></article>

        <article className="rounded-2xl border border-slate-200/80 bg-[#182842] p-5 text-white shadow-[0_8px_24px_rgba(21,36,58,0.09)] sm:p-6"><div className="flex items-center gap-2"><span className="grid size-8 place-items-center rounded-lg bg-white/10 text-[#84e0c3]"><LockKeyhole size={16} /></span><h2 className="font-display text-[16px] font-bold tracking-[-0.03em]">Access architecture</h2></div><p className="mt-2 text-[11px] text-slate-400">Least privilege is part of the data model, not an afterthought.</p><div className="mt-5 space-y-2.5">{[["CEO", "Company-wide visibility & authority", "Full"], ["COO", "Operations, growth & customer ops", "Scoped"], ["CTO", "Product, engineering & security", "Scoped"], ["Manager", "Their teams and assigned work", "Scoped"], ["Employee", "Own work and authorised records", "Limited"]].map(([role, detail, level]) => <div key={role} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.045] px-3 py-2.5"><span className="grid size-7 place-items-center rounded-lg bg-white/10 text-[10px] font-bold text-[#84e0c3]">{role.slice(0, 2)}</span><div className="min-w-0 flex-1"><p className="text-[11px] font-bold">{role}</p><p className="truncate text-[10px] text-slate-400">{detail}</p></div><span className="text-[9px] font-bold uppercase tracking-wide text-slate-500">{level}</span></div>)}</div><div className="mt-5 flex items-start gap-2 rounded-xl border border-[#84e0c3]/20 bg-[#84e0c3]/10 p-3 text-[10px] leading-5 text-slate-300"><ShieldCheck size={14} className="mt-0.5 shrink-0 text-[#84e0c3]" /> Sensitive patient, personnel, financial and security data is always permission-controlled.</div></article></section>

      <section className="mt-5 grid gap-5 lg:grid-cols-[.9fr_1.1fr]"><article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_5px_20px_rgba(21,36,58,0.035)] sm:p-6"><div className="flex items-center gap-2"><span className="grid size-8 place-items-center rounded-lg bg-[#fff2d9] text-[#b3781f]"><Settings2 size={16} /></span><h2 className="font-display text-[16px] font-bold tracking-[-0.03em] text-[#152239]">Non-negotiables</h2></div><div className="mt-4 divide-y divide-slate-100">{principles.map((principle) => <div key={principle.title} className="flex gap-3 py-3.5 first:pt-1"><CheckCircle2 size={16} className="mt-0.5 shrink-0 text-[#26a985]" /><div><p className="text-[11px] font-bold text-slate-700">{principle.title}</p><p className="mt-1 text-[10px] leading-5 text-slate-400">{principle.detail}</p></div></div>)}</div></article>

        <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_5px_20px_rgba(21,36,58,0.035)] sm:p-6"><div className="flex items-center gap-2"><span className="grid size-8 place-items-center rounded-lg bg-[#eee8ff] text-[#755bc0]"><Workflow size={16} /></span><h2 className="font-display text-[16px] font-bold tracking-[-0.03em]">Implementation path</h2></div><p className="mt-2 text-[11px] text-slate-400">Build bottom-up, then expose the executive layer.</p><div className="mt-5 grid gap-2 sm:grid-cols-2">{phases.map(([number, title, detail], index) => <div key={number} className="relative flex gap-3 rounded-xl border border-slate-100 bg-[#fafbfc] p-3"><span className="font-mono text-[11px] font-bold text-[#755bc0]">{number}</span><div><p className="text-[11px] font-bold text-slate-700">{title}</p><p className="mt-1 text-[10px] leading-5 text-slate-400">{detail}</p></div>{index < 5 && <CircleDot size={10} className="absolute -right-1.5 -top-1.5 fill-white text-[#b8a4f3]" />}</div>)}</div></article></section>

      <section className="mt-5 rounded-2xl border border-[#cdeee2] bg-[#effbf6] p-5 sm:p-6"><div className="flex flex-col justify-between gap-4 md:flex-row md:items-center"><div><div className="flex items-center gap-2 text-[#168465]"><GitBranch size={16} /><h2 className="font-display text-[16px] font-bold tracking-[-0.03em]">A metric should always be traceable.</h2></div><p className="mt-2 max-w-[700px] text-[11px] leading-5 text-slate-500">CEO → area → KPI → department → team → employee → source record. This is the contract every future dashboard, alert and decision will follow.</p></div><div className="flex shrink-0 items-center gap-2 rounded-xl bg-white px-3.5 py-2.5 text-[10px] font-bold text-[#168465] shadow-sm"><KeyRound size={14} /> Audit-ready by design</div></div></section>

      <footer className="mt-8 flex flex-col justify-between gap-2 border-t border-slate-200/70 pt-5 text-[10px] text-slate-400 sm:flex-row"><span>MedMap Operating System · Architecture foundation</span><span>Source of truth before screen of truth</span></footer>
    </div>
  </AppShell>;
}
