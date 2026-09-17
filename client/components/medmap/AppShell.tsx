import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Activity,
  BarChart3,
  Bell,
  Boxes,
  BriefcaseBusiness,
  CalendarDays,
  ChevronDown,
  FileText,
  Gauge,
  LayoutDashboard,
  LifeBuoy,
  Menu,
  Network,
  Search,
  Settings2,
  ShieldCheck,
  Stethoscope,
  Users,
  X,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMedMap } from "@/lib/medmap-store";
import { SupabaseConnectionDiagnostic } from "@/components/medmap/SupabaseConnectionDiagnostic";

const navItems = [
  { label: "Command centre", section: "overview", icon: LayoutDashboard },
  { label: "Organisation", section: "organization", icon: Network, path: "/organization" },
  { label: "Company KPIs", section: "kpis", icon: BarChart3, path: "/kpis" },
  { label: "Operations", section: "operations", icon: Activity, path: "/operations" },
  { label: "Doctor Acquisition", section: "doctor-acquisition", icon: Stethoscope, path: "/doctor-acquisition" },
  { label: "Ambassador Programme", section: "ambassadors", icon: Users, path: "/ambassadors" },
  { label: "Sales", section: "sales", icon: BriefcaseBusiness, path: "/sales" },
  { label: "Customer Operations", section: "customer-operations", icon: LifeBuoy, path: "/customer-operations" },
  { label: "People & goals", section: "people", icon: Users, path: "/people" },
  { label: "Meetings & deadlines", section: "meetings", icon: CalendarDays, path: "/meetings" },
  { label: "Financial health", section: "finance", icon: Gauge, path: "/finance" },
  { label: "Technology", section: "technology", icon: Zap, path: "/technology" },
  { label: "Risk & governance", section: "governance", icon: ShieldCheck, path: "/risk" },
  { label: "Reports", section: "reports", icon: FileText, path: "/reports" },
  { label: "Administration", section: "admin", icon: Settings2, path: "/admin" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { technologyWorkItems } = useMedMap();
  const outstandingTechnology = technologyWorkItems.filter((item) => item.status !== "Done");
  const pageTitle = location.pathname === "/finance" ? "Financial health" : location.pathname === "/people" ? "People & goals" : location.pathname === "/operations" ? "Operations" : location.pathname === "/meetings" ? "Meetings & deadlines" : location.pathname === "/kpis" ? "Company KPIs" : location.pathname === "/organization" ? "Organisation" : location.pathname === "/doctor-acquisition" ? "Doctor Acquisition" : location.pathname === "/ambassadors" ? "Ambassador Programme" : location.pathname === "/sales" ? "Sales" : location.pathname === "/customer-operations" ? "Customer Operations" : location.pathname === "/technology" ? "Technology" : location.pathname === "/risk" ? "Risk & governance" : location.pathname === "/reports" ? "Reports" : location.pathname === "/admin" ? "Administration" : "Command centre";

  const jumpToSection = (section: string) => {
    setMobileOpen(false);
    if (location.pathname !== "/") {
      navigate(`/#${section}`);
      return;
    }
    document.getElementById(section)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-[#f6f8fb] text-slate-900">
      {mobileOpen && (
        <button
          aria-label="Close navigation"
          className="fixed inset-0 z-30 bg-slate-950/30 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-[264px] -translate-x-full flex-col overflow-y-auto bg-[#101a2c] px-4 py-5 text-white transition-transform lg:translate-x-0",
          mobileOpen && "translate-x-0",
        )}
      >
        <div className="flex items-center justify-between px-2">
          <Link to="/" className="flex items-center gap-3" onClick={() => setMobileOpen(false)}>
            <span className="grid size-10 place-items-center rounded-[13px] bg-[#84e0c3] text-[#102339] shadow-[0_0_0_5px_rgba(132,224,195,0.1)]">
              <Stethoscope size={21} strokeWidth={2.4} />
            </span>
            <span>
              <span className="block font-display text-[18px] font-bold tracking-[-0.04em]">MedMap</span>
              <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">Operating system</span>
            </span>
          </Link>
          <button className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white lg:hidden" onClick={() => setMobileOpen(false)} aria-label="Close navigation">
            <X size={18} />
          </button>
        </div>

        <div className="mt-9 px-2 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Workspace</div>
        <nav className="mt-3 space-y-1">
          {navItems.map(({ label, section, icon: Icon, path }, index) => {
            const active = path ? location.pathname === path : index === 0 && location.pathname === "/";
            const content = <><Icon size={17} strokeWidth={1.8} className={cn("text-slate-500 transition group-hover:text-[#84e0c3]", active && "text-[#84e0c3]")} /><span>{label}</span>{section === "overview" && <span className="ml-auto size-1.5 rounded-full bg-[#84e0c3]" />}</>;
            return path ? <Link key={section} to={path} onClick={() => setMobileOpen(false)} className={cn("group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] font-medium text-slate-400 transition hover:bg-white/[0.07] hover:text-white", active && "bg-white/[0.09] text-white shadow-[inset_3px_0_0_#84e0c3]")}>{content}</Link> : <button key={section} onClick={() => jumpToSection(section)} className={cn("group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] font-medium text-slate-400 transition hover:bg-white/[0.07] hover:text-white", active && "bg-white/[0.09] text-white shadow-[inset_3px_0_0_#84e0c3]")}>{content}</button>;
          })}
        </nav>

        <div className="mt-8 px-2 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Control room</div>
        <nav className="mt-3 space-y-1">
          <button onClick={() => jumpToSection("governance")} className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] font-medium text-slate-400 transition hover:bg-white/[0.07] hover:text-white">
            <Bell size={17} strokeWidth={1.8} className="text-slate-500 group-hover:text-[#f5be68]" />
            <span>Alert centre</span>
            <span className="ml-auto grid size-5 place-items-center rounded-full bg-[#f5be68] text-[10px] font-bold text-[#182238]">{outstandingTechnology.length}</span>
          </button>
          <button onClick={() => jumpToSection("governance")} className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] font-medium text-slate-400 transition hover:bg-white/[0.07] hover:text-white">
            <FileText size={17} strokeWidth={1.8} className="text-slate-500 group-hover:text-[#84e0c3]" />
            <span>Decision log</span>
          </button>
          <Link to="/operations" onClick={() => setMobileOpen(false)} className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] font-medium text-slate-400 transition hover:bg-white/[0.07] hover:text-white">
            <LifeBuoy size={17} strokeWidth={1.8} className="text-slate-500 group-hover:text-[#84e0c3]" />
            <span>Support cases</span>
          </Link>
        </nav>

        <div className="mt-auto pt-8">
          <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-3.5">
            <div className="flex items-center gap-2 text-[11px] font-semibold text-[#f5be68]"><span className="size-1.5 rounded-full bg-[#f5be68]" />Attention required</div>
            <p className="mt-2 text-[11px] leading-5 text-slate-400">{outstandingTechnology.length} technology blockers are currently outstanding.</p>
          </div>
          <div className="mt-4 flex items-center justify-between px-2 text-[11px] text-slate-500">
            <span>v1.0 · Internal</span>
            <Settings2 size={14} />
          </div>
        </div>
      </aside>

      <div className="lg:pl-[264px]">
        <header className="sticky top-0 z-20 flex h-[72px] items-center justify-between border-b border-slate-200/80 bg-[#f6f8fb]/90 px-5 backdrop-blur-xl sm:px-8">
          <div className="flex items-center gap-3">
            <button className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 shadow-sm lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open navigation">
              <Menu size={18} />
            </button>
            <div className="hidden items-center gap-2 text-[12px] text-slate-400 sm:flex"><span className="font-semibold text-slate-700">MedMap</span><span>/</span><span>{pageTitle}</span></div>
            <div className="flex items-center gap-2 text-[12px] text-slate-500 sm:hidden"><Boxes size={15} className="text-[#1f9d80]" /> {pageTitle}</div>
          </div>
          <div className="flex items-center gap-2.5">
            <label className="relative hidden md:block">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search anything" className="h-9 w-48 rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-[12px] outline-none transition placeholder:text-slate-400 focus:border-[#84cbb8] focus:ring-4 focus:ring-[#84e0c3]/15" />
            </label>
            <button className="relative rounded-xl border border-slate-200 bg-white p-2.5 text-slate-500 shadow-sm transition hover:border-slate-300 hover:text-slate-800" aria-label="Notifications"><Bell size={17} /><span className="absolute right-2 top-2 size-1.5 rounded-full bg-[#ea8c61] ring-2 ring-white" /></button>
            <button className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white py-1.5 pl-1.5 pr-2.5 shadow-sm transition hover:border-slate-300">
              <span className="grid size-7 place-items-center rounded-lg bg-[#d7f4ea] text-[11px] font-bold text-[#13795e]">OM</span>
              <span className="hidden text-left sm:block"><span className="block text-[11px] font-bold text-slate-700">Ofentse</span><span className="block text-[10px] text-slate-400">CEO</span></span>
              <ChevronDown size={14} className="text-slate-400" />
            </button>
          </div>
        </header>
        <main>{children}{location.pathname === "/admin" && <SupabaseConnectionDiagnostic />}</main>
      </div>
    </div>
  );
}
