import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  ChevronRight,
  CircleAlert,
  Clock3,
  FileWarning,
  Layers3,
  Plus,
  Sparkles,
  Target,
  TrendingUp,
  UserRound,
  UsersRound,
  WalletCards,
  Wrench,
} from "lucide-react";
import { AppShell } from "@/components/medmap/AppShell";
import { cn } from "@/lib/utils";
import { formatDate, formatZAR, formatZARWithSign, useMedMap } from "@/lib/medmap-store";

type Status = "healthy" | "attention" | "critical";

type Metric = {
  label: string;
  value: string;
  change: string;
  helper: string;
  status: Status;
  icon: React.ElementType;
};

function StatusPill({ status, label }: { status: Status; label?: string }) {
  const content = label ?? (status === "healthy" ? "Healthy" : status === "attention" ? "Needs action" : "Critical");
  return <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold", status === "healthy" && "bg-[#e4f8f0] text-[#15805f]", status === "attention" && "bg-[#fff2d9] text-[#9a6419]", status === "critical" && "bg-[#ffe5e3] text-[#bd504d]")}><span className={cn("size-1.5 rounded-full", status === "healthy" && "bg-[#25a879]", status === "attention" && "bg-[#e0a03a]", status === "critical" && "bg-[#da6560]")} />{content}</span>;
}

function MetricCard({ metric }: { metric: Metric }) {
  const Icon = metric.icon;
  return <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_5px_20px_rgba(21,36,58,0.035)]"><div className="flex items-start justify-between"><span className={cn("grid size-9 place-items-center rounded-xl", metric.status === "healthy" ? "bg-[#e8f8f2] text-[#1b9975]" : metric.status === "critical" ? "bg-[#ffe9e6] text-[#bf5b56]" : "bg-[#fff3dd] text-[#b87720]")}><Icon size={17} /></span><span className={cn("size-1.5 rounded-full", metric.status === "healthy" ? "bg-[#36ac87]" : metric.status === "critical" ? "bg-[#da6560]" : "bg-[#e0a03a]")} /></div><p className="mt-4 text-[12px] font-medium text-slate-500">{metric.label}</p><div className="mt-1 flex items-end justify-between gap-2"><p className="font-display text-[27px] font-bold tracking-[-0.05em] text-[#152239]">{metric.value}</p><span className={cn("mb-1 flex items-center gap-0.5 text-right text-[10px] font-bold", metric.status === "healthy" ? "text-[#209b76]" : metric.status === "critical" ? "text-[#bd504d]" : "text-[#b3781f]")}>{metric.status === "healthy" ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}{metric.change}</span></div><p className="mt-1 text-[10px] text-slate-400">{metric.helper}</p></div>;
}

function StethoscopeIcon(props: React.ComponentProps<"svg">) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M6 3v5a6 6 0 0 0 12 0V3" /><path d="M3 3h6M15 3h6" /><path d="M18 14a3 3 0 1 0 3 3v-1" /><path d="M18 17v3a2 2 0 0 1-2 2h-3" /></svg>;
}

export default function Index() {
  const { transactions, tickets, meetings, meetingDeadlines, departmentTargets, technologyWorkItems } = useMedMap();
  const [completedActions, setCompletedActions] = useState<string[]>([]);
  const financials = transactions.reduce((result, transaction) => {
    if (transaction.kind === "revenue") result.revenue += transaction.amount;
    if (transaction.kind === "expense") result.expenses += transaction.amount;
    return result;
  }, { revenue: 0, expenses: 0 });
  const netPosition = financials.revenue - financials.expenses;
  const openTickets = tickets.filter((ticket) => !["Completed", "Closed"].includes(ticket.status));
  const overdueTickets = openTickets.filter((ticket) => ticket.dueDate < new Date().toISOString().slice(0, 10));
  const openDeadlines = meetingDeadlines.filter((deadline) => deadline.status !== "Done").sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const outstandingTechnology = technologyWorkItems.filter((item) => item.status !== "Done");
  const unconfiguredTargets = departmentTargets.filter((target) => target.target === 0);
  const monthlyTarget = (metric: string) => departmentTargets.find((target) => target.metric === metric && target.period === "Monthly");
  const targetStatus = (metric: string): Status => {
    const target = monthlyTarget(metric);
    return !target || target.target === 0 ? "attention" : target.status === "Outstanding" ? "critical" : target.status === "On track" ? "healthy" : "attention";
  };
  const metrics: Metric[] = [
    { label: "Recorded revenue", value: formatZAR(financials.revenue), change: financials.revenue ? "recorded" : "not recorded", helper: "from the finance ledger", status: financials.revenue ? "healthy" : "attention", icon: WalletCards },
    { label: "Active doctors", value: String(monthlyTarget("Active doctors")?.actual ?? 0), change: monthlyTarget("Active doctors")?.target ? `${monthlyTarget("Active doctors")?.target} target` : "target not set", helper: "Commercial · monthly baseline", status: targetStatus("Active doctors"), icon: StethoscopeIcon },
    { label: "Active ambassadors", value: String(monthlyTarget("Active ambassadors")?.actual ?? 0), change: monthlyTarget("Active ambassadors")?.target ? `${monthlyTarget("Active ambassadors")?.target} target` : "target not set", helper: "Commercial · monthly baseline", status: targetStatus("Active ambassadors"), icon: UserRound },
    { label: "Active patients", value: String(monthlyTarget("Active patients")?.actual ?? 0), change: monthlyTarget("Active patients")?.target ? `${monthlyTarget("Active patients")?.target} target` : "target not set", helper: "Operations · monthly baseline", status: targetStatus("Active patients"), icon: UsersRound },
    { label: "Open work", value: String(openTickets.length), change: `${overdueTickets.length} overdue`, helper: "Operations tickets", status: overdueTickets.length ? "critical" : "attention", icon: Layers3 },
  ];
  const actions = [
    { title: "Set the first weekly and monthly department targets", type: "Target setting", owner: "CEO + functional leads", priority: "High" },
    ...outstandingTechnology.map((item) => ({ title: item.title, type: "Technology blocker", owner: item.owner, priority: "High" })),
  ];

  return <AppShell><div className="mx-auto max-w-[1440px] px-5 pb-12 pt-8 sm:px-8 xl:px-10">
    <section id="overview" className="scroll-mt-24"><div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><div className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.17em] text-[#1b9975]"><Sparkles size={13} /> Current operating stage</div><h1 className="font-display text-[32px] font-bold tracking-[-0.06em] text-[#152239] sm:text-[39px]">Build the first repeatable operating engine.</h1><p className="mt-2 max-w-[760px] text-[13px] leading-6 text-slate-500">MedMap is at the starting line: doctor, ambassador and patient baselines are all zero, targets still need to be set, and technology blockers must be cleared before growth can be measured.</p></div><div className="flex items-center gap-3"><span className="hidden text-[11px] text-slate-400 sm:block">Manual operating view · ready for database sync</span><Link to="/meetings" className="inline-flex items-center gap-2 rounded-xl bg-[#182842] px-3.5 py-2.5 text-[11px] font-bold text-white shadow-[0_5px_12px_rgba(20,35,58,.15)] transition hover:bg-[#233958]"><Plus size={15} /> Set team targets</Link></div></div><div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">{metrics.map((metric) => <MetricCard key={metric.label} metric={metric} />)}</div></section>

    <section className="mt-5 rounded-2xl border border-[#c9d7ec] bg-[#f7faff] p-5 shadow-[0_5px_20px_rgba(21,36,58,0.035)] sm:p-6"><div className="flex flex-col justify-between gap-3 md:flex-row md:items-start"><div><div className="flex items-center gap-2"><span className="grid size-8 place-items-center rounded-lg bg-[#eaf3ff] text-[#4a87c9]"><Target size={16} /></span><h2 className="font-display text-[16px] font-bold text-[#152239]">What the team needs to leave the next meeting with</h2></div><p className="mt-2 text-[11px] text-slate-500">The command centre is intentionally showing the work still to be defined, not invented performance.</p></div><StatusPill status="attention" label={`${unconfiguredTargets.length} targets need setting`} /></div><div className="mt-5 grid gap-3 md:grid-cols-3"><div className="rounded-xl bg-white p-4"><p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Commercial baseline</p><p className="mt-2 font-display text-[25px] font-bold text-[#152239]">0 doctors · 0 ambassadors</p><p className="mt-2 text-[11px] leading-5 text-slate-500">Set weekly and monthly acquisition targets with the Commercial team.</p></div><div className="rounded-xl bg-white p-4"><p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Operations baseline</p><p className="mt-2 font-display text-[25px] font-bold text-[#152239]">0 patients</p><p className="mt-2 text-[11px] leading-5 text-slate-500">Define the first patient growth target and the owner accountable for it.</p></div><div className="rounded-xl bg-white p-4"><p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Technology gate</p><p className="mt-2 font-display text-[25px] font-bold text-[#bd504d]">{outstandingTechnology.length} blockers</p><p className="mt-2 text-[11px] leading-5 text-slate-500">Bookings, payments, AWS migration and app delivery must move from outstanding to done.</p></div></div></section>

    <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,.85fr)]"><article id="technology" className="scroll-mt-24 rounded-2xl border border-[#f0cdca] bg-[#fff8f7] p-5 shadow-[0_5px_20px_rgba(21,36,58,0.035)] sm:p-6"><div className="flex flex-col justify-between gap-3 md:flex-row md:items-center"><div><div className="flex items-center gap-2"><span className="grid size-8 place-items-center rounded-lg bg-[#ffe5e3] text-[#bd504d]"><Wrench size={16} /></span><h2 className="font-display text-[16px] font-bold text-[#152239]">Technology blockers</h2></div><p className="mt-2 text-[11px] text-slate-500">The CTO’s current delivery queue, shown directly on the command centre.</p></div><Link to="/meetings" className="inline-flex items-center gap-1 text-[11px] font-bold text-[#bd504d]">Manage technology targets <ChevronRight size={14} /></Link></div><div className="mt-4 grid gap-2 md:grid-cols-2">{outstandingTechnology.map((item) => <div key={item.id} className="rounded-xl bg-white p-3"><div className="flex items-start justify-between gap-3"><div><p className="text-[11px] font-bold text-slate-700">{item.title}</p><p className="mt-1 text-[10px] leading-5 text-slate-400">{item.followUp}</p></div><StatusPill status={item.status === "Outstanding" ? "critical" : "attention"} label={item.status} /></div><p className="mt-3 text-[10px] font-semibold text-slate-500">Owner: {item.owner}</p></div>)}</div>{!outstandingTechnology.length && <p className="mt-4 rounded-xl bg-white p-4 text-[11px] text-slate-500">No outstanding technology blockers.</p>}</article><article id="operations" className="scroll-mt-24 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_5px_20px_rgba(21,36,58,0.035)] sm:p-6"><div className="flex items-start justify-between"><div><div className="flex items-center gap-2"><span className="grid size-8 place-items-center rounded-lg bg-[#fff1e9] text-[#d4784f]"><TrendingUp size={16} /></span><h2 className="font-display text-[16px] font-bold text-[#152239]">Operating signal</h2></div><p className="mt-2 text-[11px] text-slate-400">Live work from the operating system.</p></div><Link to="/operations" className="text-[11px] font-bold text-[#d4784f]">Open work <ChevronRight size={14} /></Link></div><div className="mt-5 grid grid-cols-2 gap-2"><div className="rounded-xl bg-[#f7f9fb] p-3"><p className="text-[10px] text-slate-400">Open tickets</p><p className="mt-2 font-display text-[24px] font-bold text-[#152239]">{openTickets.length}</p><p className="mt-1 text-[10px] font-semibold text-[#bd504d]">{overdueTickets.length} overdue</p></div><div className="rounded-xl bg-[#f7f9fb] p-3"><p className="text-[10px] text-slate-400">Meeting records</p><p className="mt-2 font-display text-[24px] font-bold text-[#152239]">{meetings.length}</p><p className="mt-1 text-[10px] font-semibold text-[#755bc0]">{openDeadlines.length} open deadlines</p></div></div><div className="mt-4 rounded-xl border border-dashed border-slate-200 p-3 text-[11px] leading-5 text-slate-500">No operating metric is treated as healthy until a target, owner and evidence trail exist.</div></article></section>

    <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"><article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_5px_20px_rgba(21,36,58,0.035)] sm:p-6"><div className="flex items-start justify-between"><div><div className="flex items-center gap-2"><span className="grid size-8 place-items-center rounded-lg bg-[#fff2d9] text-[#b3781f]"><FileWarning size={16} /></span><h2 className="font-display text-[16px] font-bold text-[#152239]">Immediate owner queue</h2></div><p className="mt-2 text-[11px] text-slate-400">Actions that make the current stage measurable.</p></div><span className="rounded-full bg-[#fff2d9] px-2.5 py-1 text-[10px] font-bold text-[#9a6419]">{actions.length - completedActions.length} open</span></div><div className="mt-4 divide-y divide-slate-100">{actions.map((action) => { const done = completedActions.includes(action.title); return <div key={action.title} className={cn("flex items-center gap-3 py-3.5 first:pt-2", done && "opacity-50")}><button onClick={() => setCompletedActions((current) => done ? current.filter((item) => item !== action.title) : [...current, action.title])} className={cn("grid size-5 shrink-0 place-items-center rounded-md border transition", done ? "border-[#36ac87] bg-[#36ac87] text-white" : "border-slate-300 bg-white text-transparent hover:border-[#36ac87]")} aria-label={done ? `Reopen ${action.title}` : `Complete ${action.title}`}><Check size={12} /></button><div className="min-w-0 flex-1"><p className="text-[11px] font-bold text-slate-700">{action.title}</p><p className="mt-1 text-[10px] text-slate-400">{action.type} · Owner: {action.owner}</p></div><span className="rounded-full bg-[#ffe5e3] px-2 py-1 text-[9px] font-bold text-[#bd504d]">{action.priority}</span></div>; })}</div></article><article className="rounded-2xl border border-[#ddd6f5] bg-[#fbfaff] p-5 shadow-[0_5px_20px_rgba(21,36,58,0.035)] sm:p-6"><div className="flex flex-col justify-between gap-3 md:flex-row md:items-center"><div><div className="flex items-center gap-2"><span className="grid size-8 place-items-center rounded-lg bg-[#eee8ff] text-[#755bc0]"><CalendarDays size={16} /></span><h2 className="font-display text-[16px] font-bold text-[#152239]">Meeting deadlines</h2></div><p className="mt-2 text-[11px] text-slate-400">Commitments from typed meeting records.</p></div><Link to="/meetings" className="inline-flex items-center gap-1 text-[11px] font-bold text-[#755bc0]">Open meetings <ChevronRight size={14} /></Link></div><div className="mt-4 space-y-2">{openDeadlines.slice(0, 4).map((deadline) => <div key={deadline.id} className="flex items-center gap-3 rounded-xl bg-white p-3"><span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[#fff2d9] text-[#b3781f]"><Clock3 size={14} /></span><div className="min-w-0 flex-1"><p className="text-[11px] font-bold text-slate-700">{deadline.title}</p><p className="mt-1 text-[10px] text-slate-400">{formatDate(deadline.dueDate)} · {deadline.owner}</p></div><span className="rounded-full bg-[#f1edff] px-2 py-1 text-[9px] font-bold text-[#755bc0]">{deadline.status}</span></div>)}{!openDeadlines.length && <p className="rounded-xl bg-white p-4 text-[11px] text-slate-400">No meeting deadlines yet. Record the next meeting and assign its follow-ups.</p>}</div></article></section>

    <section id="finance" className="scroll-mt-24 mt-5 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_5px_20px_rgba(21,36,58,0.035)] sm:p-6"><div className="flex flex-col justify-between gap-4 md:flex-row md:items-center"><div><div className="flex items-center gap-2"><span className="grid size-8 place-items-center rounded-lg bg-[#e8f8f2] text-[#1b9975]"><WalletCards size={16} /></span><h2 className="font-display text-[16px] font-bold text-[#152239]">Financial reality</h2></div><p className="mt-2 text-[11px] text-slate-400">Only records entered in the ledger are shown here.</p></div><Link to="/finance" className="inline-flex items-center gap-1 text-[11px] font-bold text-[#1c9574]">Open financial ledger <ChevronRight size={14} /></Link></div><div className="mt-5 grid gap-3 sm:grid-cols-3"><FinanceValue label="Recorded revenue" value={formatZAR(financials.revenue)} /><FinanceValue label="Company expenses" value={formatZAR(financials.expenses)} tone="negative" /><FinanceValue label="Operating position" value={formatZARWithSign(netPosition)} tone="negative" /></div></section>

    <footer className="mt-8 flex flex-col justify-between gap-2 border-t border-slate-200/70 pt-5 text-[10px] text-slate-400 sm:flex-row"><span>MedMap Operating System · Current-stage command centre</span><span>Target → Owner → Evidence → Status → Action</span></footer>
  </div></AppShell>;
}

function FinanceValue({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "negative" }) {
  return <div className="rounded-xl bg-[#f7f9fb] p-3.5"><p className="text-[10px] font-medium text-slate-400">{label}</p><p className={cn("mt-2 font-display text-[22px] font-bold", tone === "negative" ? "text-[#c1514d]" : "text-[#152239]")}>{value}</p></div>;
}
