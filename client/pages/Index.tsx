import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowDownRight,
  ArrowUpRight,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  ChevronRight,
  CircleAlert,
  CircleCheck,
  Clock3,
  ExternalLink,
  FileWarning,
  Layers3,
  MoreHorizontal,
  Plus,
  ShieldAlert,
  Sparkles,
  Target,
  TrendingUp,
  UserRound,
  UsersRound,
  WalletCards,
  X,
  Zap,
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

const metricData: Metric[] = [
  { label: "Actual revenue", value: "R72,000", change: "+12.8%", helper: "vs previous period", status: "healthy", icon: WalletCards },
  { label: "Active doctors", value: "0", change: "manual", helper: "editable baseline", status: "healthy", icon: StethoscopeIcon },
  { label: "Active ambassadors", value: "0", change: "manual", helper: "editable baseline", status: "healthy", icon: UserRound },
  { label: "Active patients", value: "0", change: "manual", helper: "editable baseline", status: "healthy", icon: UsersRound },
  { label: "Open work", value: "0", change: "0 overdue", helper: "across all teams", status: "attention", icon: Layers3 },
];

function StethoscopeIcon(props: React.ComponentProps<"svg">) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M6 3v5a6 6 0 0 0 12 0V3" /><path d="M3 3h6M15 3h6" /><path d="M18 14a3 3 0 1 0 3 3v-1" /><path d="M18 17v3a2 2 0 0 1-2 2h-3" /></svg>;
}

const chartSets = {
  "30d": [33, 45, 39, 56, 48, 61, 58, 73, 70, 79, 72, 87],
  "90d": [27, 39, 36, 50, 47, 56, 52, 64, 63, 71, 68, 80],
  ytd: [18, 28, 26, 37, 34, 42, 47, 55, 53, 64, 69, 79],
};

const activity = [
  { initials: "KM", name: "Kuhlula Madumo", action: "closed an onboarding blocker", time: "12 min ago", tone: "mint" },
  { initials: "SL", name: "Selaelo Langa", action: "resolved payment incident #INC-24", time: "38 min ago", tone: "lavender" },
  { initials: "OM", name: "Ofentse Mashau", action: "approved Partner pricing review", time: "1 hr ago", tone: "peach" },
  { initials: "TN", name: "Thabo Ndlovu", action: "completed 6 doctor activations", time: "2 hrs ago", tone: "blue" },
];

const risks = [
  { title: "Doctor retention below target", detail: "Retention is 86% against the 95% green threshold.", owner: "COO · Kuhlula", status: "attention" as Status, icon: UserRound },
  { title: "3 cases are past configured SLA", detail: "Customer Operations needs an owner before Friday.", owner: "Operations", status: "attention" as Status, icon: Clock3 },
  { title: "Security assessment due in 5 days", detail: "Evidence pack is 72% complete. No CEO action required.", owner: "CTO · Selaelo", status: "healthy" as Status, icon: ShieldAlert },
];

const actions = [
  { title: "Approve Q4 technology budget", type: "Approval", due: "Today", owner: "Selaelo Langa", priority: "High" },
  { title: "Review Partner service economics", type: "Decision", due: "18 Sep", owner: "Kuhlula Madumo", priority: "Normal" },
  { title: "Confirm retention recovery plan", type: "Strategic action", due: "20 Sep", owner: "Kuhlula Madumo", priority: "High" },
];

function StatusPill({ status, label }: { status: Status; label?: string }) {
  const content = label ?? (status === "healthy" ? "Healthy" : status === "attention" ? "Attention" : "Critical");
  return <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold", status === "healthy" && "bg-[#e4f8f0] text-[#15805f]", status === "attention" && "bg-[#fff2d9] text-[#9a6419]", status === "critical" && "bg-[#ffe5e3] text-[#bd504d]")}><span className={cn("size-1.5 rounded-full", status === "healthy" && "bg-[#25a879]", status === "attention" && "bg-[#e0a03a]", status === "critical" && "bg-[#da6560]")} />{content}</span>;
}

function MetricCard({ metric }: { metric: Metric }) {
  const Icon = metric.icon;
  return <button className="group rounded-2xl border border-slate-200/80 bg-white p-4 text-left shadow-[0_5px_20px_rgba(21,36,58,0.035)] transition hover:-translate-y-0.5 hover:border-[#a4dbc9] hover:shadow-[0_10px_28px_rgba(21,36,58,0.08)]">
    <div className="flex items-start justify-between"><span className={cn("grid size-9 place-items-center rounded-xl", metric.status === "healthy" ? "bg-[#e8f8f2] text-[#1b9975]" : "bg-[#fff3dd] text-[#b87720]")}><Icon size={17} /></span><MoreHorizontal size={16} className="text-slate-300 transition group-hover:text-slate-500" /></div>
    <p className="mt-4 text-[12px] font-medium text-slate-500">{metric.label}</p>
    <div className="mt-1 flex items-end justify-between gap-2"><p className="font-display text-[27px] font-bold tracking-[-0.05em] text-[#152239]">{metric.value}</p><span className={cn("mb-1 flex items-center gap-0.5 text-[11px] font-bold", metric.status === "healthy" ? "text-[#209b76]" : "text-[#b3781f]")}>{metric.status === "healthy" ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}{metric.change}</span></div>
    <p className="mt-1 text-[10px] text-slate-400">{metric.helper}</p>
  </button>;
}

function RevenueChart({ period }: { period: keyof typeof chartSets }) {
  const data = chartSets[period];
  const points = data.map((value, index) => `${index * 52 + 20},${188 - value * 1.65}`).join(" ");
  const areaPoints = `20,188 ${points} 592,188`;
  return <div className="mt-5 h-[220px] w-full">
    <svg viewBox="0 0 612 210" className="h-full w-full overflow-visible" role="img" aria-label="Revenue trend chart">
      {[30, 80, 130, 180].map((y) => <line key={y} x1="20" y1={y} x2="592" y2={y} stroke="#eef1f5" strokeWidth="1" />)}
      <polygon points={areaPoints} fill="url(#revenueFill)" />
      <polyline points={points} fill="none" stroke="#26a985" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      {data.map((value, index) => <circle key={index} cx={index * 52 + 20} cy={188 - value * 1.65} r={index === data.length - 1 ? 5 : 3} fill="#fff" stroke="#26a985" strokeWidth="2.5" />)}
      <defs><linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#84e0c3" stopOpacity=".28" /><stop offset="1" stopColor="#84e0c3" stopOpacity="0" /></linearGradient></defs>
    </svg>
    <div className="-mt-1 flex justify-between px-1 text-[10px] font-medium text-slate-400"><span>01 Aug</span><span>08 Aug</span><span>15 Aug</span><span>22 Aug</span><span>29 Aug</span></div>
  </div>;
}

export default function Index() {
  const { transactions, tickets, meetings, meetingDeadlines, accountabilityMetrics } = useMedMap();
  const [period, setPeriod] = useState<keyof typeof chartSets>("30d");
  const [completedActions, setCompletedActions] = useState<string[]>([]);
  const [showAllRisks, setShowAllRisks] = useState(false);
  const financials = useMemo(() => transactions.reduce((result, transaction) => {
    if (transaction.kind === "revenue") result.revenue += transaction.amount;
    else result.expenses += transaction.amount;
    return result;
  }, { revenue: 0, expenses: 0 }), [transactions]);
  const netPosition = financials.revenue - financials.expenses;
  const revenueAchievement = Math.round((financials.revenue / 80000) * 100);
  const openTickets = tickets.filter((ticket) => !["Completed", "Closed"].includes(ticket.status));
  const overdueTickets = openTickets.filter((ticket) => ticket.dueDate < new Date().toISOString().slice(0, 10));
  const liveMetricData = metricData.map((metric) => {
    if (metric.label === "Actual revenue") return { ...metric, value: formatZAR(financials.revenue), change: `${revenueAchievement}%`, helper: "of R80,000 target", status: revenueAchievement >= 96 ? "healthy" as Status : "critical" as Status };
    if (metric.label === "Active doctors") return { ...metric, value: accountabilityMetrics.doctors.toLocaleString("en-ZA"), change: "manual", helper: `updated ${formatDate(accountabilityMetrics.updatedAt)}` };
    if (metric.label === "Active ambassadors") return { ...metric, value: accountabilityMetrics.ambassadors.toLocaleString("en-ZA"), change: "manual", helper: `updated ${formatDate(accountabilityMetrics.updatedAt)}` };
    if (metric.label === "Active patients") return { ...metric, value: accountabilityMetrics.patients.toLocaleString("en-ZA"), change: "manual", helper: `updated ${formatDate(accountabilityMetrics.updatedAt)}` };
    return { ...metric, value: String(openTickets.length), change: `${overdueTickets.length} overdue`, helper: "across all teams" };
  });
  const upcomingDeadlines = meetingDeadlines.filter((deadline) => deadline.status !== "Done").sort((a, b) => a.dueDate.localeCompare(b.dueDate)).slice(0, 4);
  const meetingTitle = (meetingId: string) => meetings.find((meeting) => meeting.id === meetingId)?.title ?? "Meeting follow-up";

  const visibleRisks = useMemo(() => showAllRisks ? risks : risks.slice(0, 2), [showAllRisks]);

  return <AppShell>
    <div className="mx-auto max-w-[1440px] px-5 pb-12 pt-8 sm:px-8 xl:px-10">
      <section id="overview" className="scroll-mt-24">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <div className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.17em] text-[#1b9975]"><Sparkles size={13} /> Executive command centre</div>
            <h1 className="font-display text-[32px] font-bold tracking-[-0.06em] text-[#152239] sm:text-[39px]">Good morning, Ofentse.</h1>
            <p className="mt-2 max-w-[640px] text-[13px] leading-6 text-slate-500">Here is the signal that matters across MedMap today. Revenue is below the current cost base, so the operating position needs an owner.</p>
          </div>
          <div className="flex items-center gap-3"><span className="hidden text-[11px] text-slate-400 sm:block">Last synced 4 min ago</span><button onClick={() => document.getElementById("governance")?.scrollIntoView({ behavior: "smooth" })} className="inline-flex items-center gap-2 rounded-xl bg-[#182842] px-3.5 py-2.5 text-[11px] font-bold text-white shadow-[0_5px_12px_rgba(20,35,58,.15)] transition hover:bg-[#233958]"><Plus size={15} /> Log a decision</button></div>
        </div>

        <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">{liveMetricData.map((metric) => <MetricCard key={metric.label} metric={metric} />)}</div>

        <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(300px,.85fr)]">
          <article id="commercial" className="scroll-mt-24 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_5px_20px_rgba(21,36,58,0.035)] sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4"><div><div className="flex items-center gap-2"><span className="grid size-8 place-items-center rounded-lg bg-[#e8f8f2] text-[#1b9975]"><TrendingUp size={16} /></span><h2 className="font-display text-[16px] font-bold tracking-[-0.03em] text-[#152239]">Revenue performance</h2></div><p className="mt-2 text-[11px] text-slate-400">Actual revenue across connected transaction records</p></div><div className="flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">{([['30d', '30 days'], ['90d', '90 days'], ['ytd', 'YTD']] as const).map(([value, label]) => <button key={value} onClick={() => setPeriod(value)} className={cn("rounded-md px-2.5 py-1.5 text-[10px] font-bold transition", period === value ? "bg-white text-[#17283f] shadow-sm" : "text-slate-400 hover:text-slate-600")}>{label}</button>)}</div></div>
            <div className="mt-6 flex items-end gap-4"><span className="font-display text-[31px] font-bold tracking-[-0.06em] text-[#152239]">{formatZAR(financials.revenue)}</span><span className="mb-1 flex items-center gap-1 text-[11px] font-bold text-[#bd504d]"><ArrowDownRight size={13} /> {revenueAchievement}% of target</span></div>
            <RevenueChart period={period} />
          </article>

          <article className="rounded-2xl border border-slate-200/80 bg-[#182842] p-5 text-white shadow-[0_8px_24px_rgba(21,36,58,0.09)] sm:p-6"><div className="flex items-center justify-between"><div className="flex items-center gap-2"><span className="grid size-8 place-items-center rounded-lg bg-white/10 text-[#84e0c3]"><Target size={16} /></span><h2 className="font-display text-[16px] font-bold tracking-[-0.03em]">Revenue health</h2></div><StatusPill status={revenueAchievement >= 96 ? "healthy" : "critical"} label={revenueAchievement >= 96 ? "On track" : "Below target"} /></div><p className="mt-6 text-[11px] text-slate-400">Actual vs configured target</p><div className="mt-2 flex items-end justify-between"><span className="font-display text-[30px] font-bold tracking-[-0.06em]">{revenueAchievement}%</span><span className="text-[11px] font-medium text-slate-400">R80,000 target</span></div><div className="mt-4 h-2 rounded-full bg-white/10"><div className="h-2 rounded-full bg-[#e07a72]" style={{ width: `${Math.min(revenueAchievement, 100)}%` }} /></div><div className="mt-5 grid grid-cols-2 gap-3 border-t border-white/10 pt-4"><div><p className="text-[10px] text-slate-400">Capacity</p><p className="mt-1 text-[17px] font-bold">R100k</p><p className="mt-1 text-[10px] text-[#84e0c3]">72% utilised</p></div><div><p className="text-[10px] text-slate-400">Variance</p><p className="mt-1 text-[17px] font-bold">{formatZARWithSign(financials.revenue - 80000)}</p><p className="mt-1 text-[10px] text-[#f5be68]">Needs recovery plan</p></div></div><Link to="/finance" className="mt-6 inline-flex items-center gap-1 text-[11px] font-bold text-[#84e0c3] hover:text-white">Open finance ledger <ChevronRight size={14} /></Link></article>
        </div>
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.18fr)_minmax(0,.82fr)]">
        <article id="operations" className="scroll-mt-24 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_5px_20px_rgba(21,36,58,0.035)] sm:p-6"><div className="flex items-start justify-between"><div><div className="flex items-center gap-2"><span className="grid size-8 place-items-center rounded-lg bg-[#fff1e9] text-[#d4784f]"><BriefcaseBusiness size={16} /></span><h2 className="font-display text-[16px] font-bold tracking-[-0.03em] text-[#152239]">Operating signal</h2></div><p className="mt-2 text-[11px] text-slate-400">Work and accountability across the company</p></div><button className="rounded-lg p-1 text-slate-300 hover:bg-slate-50 hover:text-slate-600"><MoreHorizontal size={18} /></button></div><div className="mt-5 grid grid-cols-3 gap-2"><div className="rounded-xl bg-[#f7f9fb] p-3"><p className="text-[10px] text-slate-400">Open tickets</p><p className="mt-2 font-display text-[22px] font-bold tracking-[-0.05em] text-[#152239]">{openTickets.length}</p><p className="mt-1 text-[10px] font-semibold text-[#209b76]">{overdueTickets.length} overdue</p></div><div className="rounded-xl bg-[#f7f9fb] p-3"><p className="text-[10px] text-slate-400">Cases resolved</p><p className="mt-2 font-display text-[22px] font-bold tracking-[-0.05em] text-[#152239]">94%</p><p className="mt-1 text-[10px] font-semibold text-[#209b76]">↑ 4.2% this week</p></div><div className="rounded-xl bg-[#f7f9fb] p-3"><p className="text-[10px] text-slate-400">On time</p><p className="mt-2 font-display text-[22px] font-bold tracking-[-0.05em] text-[#152239]">87%</p><p className="mt-1 text-[10px] font-semibold text-[#b47720]">Watch threshold</p></div></div><div className="mt-5 divide-y divide-slate-100">{activity.map((item) => <div key={item.name} className="flex items-center gap-3 py-3 first:pt-1"><span className={cn("grid size-8 shrink-0 place-items-center rounded-full text-[10px] font-bold", item.tone === "mint" && "bg-[#d9f5eb] text-[#198466]", item.tone === "lavender" && "bg-[#eee8ff] text-[#755bc0]", item.tone === "peach" && "bg-[#ffeadf] text-[#b76b46]", item.tone === "blue" && "bg-[#e3efff] text-[#4378b4]")}>{item.initials}</span><p className="min-w-0 flex-1 truncate text-[11px] text-slate-500"><span className="font-bold text-slate-700">{item.name}</span> {item.action}</p><span className="shrink-0 text-[10px] text-slate-400">{item.time}</span></div>)}</div></article>

        <article id="technology" className="scroll-mt-24 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_5px_20px_rgba(21,36,58,0.035)] sm:p-6"><div className="flex items-start justify-between"><div><div className="flex items-center gap-2"><span className="grid size-8 place-items-center rounded-lg bg-[#eaf3ff] text-[#4a87c9]"><Zap size={16} /></span><h2 className="font-display text-[16px] font-bold tracking-[-0.03em] text-[#152239]">Technology health</h2></div><p className="mt-2 text-[11px] text-slate-400">Systems, incidents and release reliability</p></div><StatusPill status="healthy" label="99.98%" /></div><div className="mt-6 space-y-4">{[["Core platform", 99.98, "Healthy"], ["Booking & payments", 99.94, "Healthy"], ["Partner services", 98.8, "Watch"], ["Security posture", 100, "Healthy"]].map(([label, value, status]) => <div key={label as string}><div className="flex items-center justify-between text-[11px]"><span className="font-semibold text-slate-600">{label as string}</span><span className={cn("font-bold", status === "Watch" ? "text-[#b47720]" : "text-[#209b76]")}>{status as string}<span className="ml-2 font-normal text-slate-400">{value as number}%</span></span></div><div className="mt-2 h-1.5 rounded-full bg-slate-100"><div className={cn("h-1.5 rounded-full", status === "Watch" ? "bg-[#f5be68]" : "bg-[#59c9a5]")} style={{ width: `${value as number}%` }} /></div></div>)}</div><div className="mt-6 flex items-center justify-between rounded-xl bg-[#f7f9fb] p-3"><div className="flex items-center gap-2"><span className="grid size-7 place-items-center rounded-lg bg-white text-[#4a87c9]"><CircleCheck size={15} /></span><span className="text-[11px] font-semibold text-slate-600">1 release in progress</span></div><span className="text-[10px] font-bold text-[#4a87c9]">View roadmap →</span></div></article>
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <article id="governance" className="scroll-mt-24 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_5px_20px_rgba(21,36,58,0.035)] sm:p-6"><div className="flex items-start justify-between"><div><div className="flex items-center gap-2"><span className="grid size-8 place-items-center rounded-lg bg-[#fff2d9] text-[#b3781f]"><CircleAlert size={16} /></span><h2 className="font-display text-[16px] font-bold tracking-[-0.03em] text-[#152239]">Exceptions needing owners</h2></div><p className="mt-2 text-[11px] text-slate-400">Red is reserved for real issues, not dashboard decoration</p></div><button onClick={() => setShowAllRisks(!showAllRisks)} className="text-[11px] font-bold text-[#1c9574] hover:text-[#14735b]">{showAllRisks ? "Show less" : "View all"}</button></div><div className="mt-4 divide-y divide-slate-100">{visibleRisks.map((risk) => { const Icon = risk.icon; return <div key={risk.title} className="flex gap-3 py-4 first:pt-2"><span className={cn("mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg", risk.status === "healthy" ? "bg-[#e8f8f2] text-[#1b9975]" : "bg-[#fff2d9] text-[#b3781f]")}><Icon size={15} /></span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="text-[12px] font-bold text-slate-700">{risk.title}</p><StatusPill status={risk.status} /></div><p className="mt-1 text-[11px] leading-5 text-slate-400">{risk.detail}</p><p className="mt-2 text-[10px] font-semibold text-slate-500">Owner: <span className="text-slate-700">{risk.owner}</span></p></div><ChevronRight size={15} className="mt-1 shrink-0 text-slate-300" /></div>; })}</div></article>

        <article id="people" className="scroll-mt-24 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_5px_20px_rgba(21,36,58,0.035)] sm:p-6"><div className="flex items-start justify-between"><div><div className="flex items-center gap-2"><span className="grid size-8 place-items-center rounded-lg bg-[#eee8ff] text-[#755bc0]"><FileWarning size={16} /></span><h2 className="font-display text-[16px] font-bold tracking-[-0.03em] text-[#152239]">CEO action queue</h2></div><p className="mt-2 text-[11px] text-slate-400">Decisions and approvals with a clear next action</p></div><span className="rounded-full bg-[#f1edff] px-2.5 py-1 text-[10px] font-bold text-[#755bc0]">{actions.length - completedActions.length} open</span></div><div className="mt-4 divide-y divide-slate-100">{actions.map((action) => { const done = completedActions.includes(action.title); return <div key={action.title} className={cn("flex items-center gap-3 py-3.5 first:pt-2", done && "opacity-50")}><button onClick={() => setCompletedActions((current) => done ? current.filter((item) => item !== action.title) : [...current, action.title])} className={cn("grid size-5 shrink-0 place-items-center rounded-md border transition", done ? "border-[#36ac87] bg-[#36ac87] text-white" : "border-slate-300 bg-white text-transparent hover:border-[#36ac87]")} aria-label={done ? `Reopen ${action.title}` : `Complete ${action.title}`}><Check size={12} /></button><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className={cn("truncate text-[11px] font-bold text-slate-700", done && "line-through")}>{action.title}</p><span className={cn("rounded px-1.5 py-0.5 text-[9px] font-bold", action.priority === "High" ? "bg-[#fff0e9] text-[#bf6d4b]" : "bg-slate-100 text-slate-500")}>{action.priority}</span></div><p className="mt-1 text-[10px] text-slate-400">{action.type} · {action.owner}</p></div><span className="shrink-0 text-[10px] font-semibold text-slate-500">{action.due}</span></div>; })}</div><button onClick={() => document.getElementById("people")?.scrollIntoView({ behavior: "smooth" })} className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-[#1c9574] hover:text-[#14735b]">Open decision log <ExternalLink size={13} /></button></article>
      </section>

      <section className="mt-5 rounded-2xl border border-[#ddd6f5] bg-[#fbfaff] p-5 shadow-[0_5px_20px_rgba(21,36,58,0.035)] sm:p-6"><div className="flex flex-col justify-between gap-4 md:flex-row md:items-center"><div><div className="flex items-center gap-2"><span className="grid size-8 place-items-center rounded-lg bg-[#eee8ff] text-[#755bc0]"><CalendarDays size={16} /></span><h2 className="font-display text-[16px] font-bold tracking-[-0.03em] text-[#152239]">Meeting deadlines</h2></div><p className="mt-2 text-[11px] text-slate-400">Upcoming commitments with an owner, drawn from typed meeting records.</p></div><Link to="/meetings" className="inline-flex items-center gap-1 text-[11px] font-bold text-[#755bc0]">Manage meetings <ChevronRight size={14} /></Link></div><div className="mt-4 grid gap-2 md:grid-cols-2">{upcomingDeadlines.map((deadline) => <div key={deadline.id} className="flex items-center gap-3 rounded-xl bg-white p-3"><span className={cn("grid size-8 shrink-0 place-items-center rounded-lg", deadline.status === "Blocked" ? "bg-[#ffe5e3] text-[#bd504d]" : "bg-[#fff2d9] text-[#b3781f]")}><Clock3 size={14} /></span><div className="min-w-0 flex-1"><p className="text-[11px] font-bold text-slate-700">{deadline.title}</p><p className="mt-1 text-[10px] text-slate-400">{formatDate(deadline.dueDate)} · {deadline.owner} · {meetingTitle(deadline.meetingId)}</p></div><span className="rounded-full bg-[#f1edff] px-2 py-1 text-[9px] font-bold text-[#755bc0]">{deadline.status}</span></div>)}{!upcomingDeadlines.length && <div className="rounded-xl bg-white p-4 text-[11px] text-slate-400">No open meeting deadlines. <Link to="/meetings" className="font-bold text-[#755bc0]">Record a meeting</Link> to start the accountability queue.</div>}</div></section>

      <section id="finance" className="scroll-mt-24 mt-5 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_5px_20px_rgba(21,36,58,0.035)] sm:p-6"><div className="flex flex-col justify-between gap-4 md:flex-row md:items-center"><div><div className="flex items-center gap-2"><span className="grid size-8 place-items-center rounded-lg bg-[#e8f8f2] text-[#1b9975]"><WalletCards size={16} /></span><h2 className="font-display text-[16px] font-bold tracking-[-0.03em] text-[#152239]">Financial health at a glance</h2></div><p className="mt-2 text-[11px] text-slate-400">Revenue, cash, commitments and operating position remain separate by design.</p></div><Link to="/finance" className="inline-flex items-center gap-1 text-[11px] font-bold text-[#1c9574]">View financial ledger <ChevronRight size={14} /></Link></div><div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[["Operating position", formatZARWithSign(netPosition), "loss from current ledger", "attention"], ["Cash position", "R49,050", "8.4 mo runway", "healthy"], ["Monthly burn", formatZAR(financials.expenses), "gross cost base", "attention"], ["Committed", "R12,600", "not yet paid", "attention"]].map(([label, value, change, status]) => <div key={label} className="rounded-xl bg-[#f7f9fb] p-3.5"><div className="flex items-center justify-between"><p className="text-[10px] font-medium text-slate-400">{label}</p><span className={cn("size-1.5 rounded-full", status === "healthy" ? "bg-[#36ac87]" : "bg-[#e0a03a]")} /></div><p className="mt-2 font-display text-[20px] font-bold tracking-[-0.05em] text-[#152239]">{value}</p><p className={cn("mt-1 text-[10px] font-semibold", status === "healthy" ? "text-[#209b76]" : "text-[#b47720]")}>{change}</p></div>)}</div></section>

      <footer className="mt-8 flex flex-col justify-between gap-2 border-t border-slate-200/70 pt-5 text-[10px] text-slate-400 sm:flex-row"><span>MedMap Operating System · Single source of truth</span><span>Data → Process → KPI → Status → Action</span></footer>
    </div>
  </AppShell>;
}
