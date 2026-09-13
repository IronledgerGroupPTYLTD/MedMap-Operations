import { FormEvent, useMemo, useState } from "react";
import {
  Check,
  ChevronRight,
  CircleUserRound,
  Eye,
  KeyRound,
  Mail,
  Plus,
  Save,
  ShieldCheck,
  Ticket,
  UserPlus,
  X,
} from "lucide-react";
import { AppShell } from "@/components/medmap/AppShell";
import { Employee, ticketTypeOptions, useMedMap, viewPermissionOptions } from "@/lib/medmap-store";
import { cn } from "@/lib/utils";

const emptyEmployee: Omit<Employee, "id"> = {
  name: "",
  email: "",
  position: "",
  department: "Operations",
  manager: "Kuhlula Madumo",
  executive: "Ofentse Mashau",
  role: "Employee",
  employmentStatus: "Active",
  viewPermissions: ["Company overview", "Operations & tickets"],
  ticketTypes: ["General operations"],
};

function Chip({ children, tone = "slate" }: { children: React.ReactNode; tone?: "slate" | "mint" | "lavender" }) {
  return <span className={cn("rounded-full px-2 py-1 text-[9px] font-bold", tone === "mint" ? "bg-[#e8f8f2] text-[#168465]" : tone === "lavender" ? "bg-[#f1edff] text-[#755bc0]" : "bg-slate-100 text-slate-500")}>{children}</span>;
}

export default function People() {
  const { employees, addEmployee, updateEmployee } = useMedMap();
  const [selectedId, setSelectedId] = useState(employees[0]?.id ?? "");
  const [draft, setDraft] = useState<Employee | null>(employees[0] ?? null);
  const [adding, setAdding] = useState(false);
  const [saved, setSaved] = useState(false);

  const selected = useMemo(() => employees.find((employee) => employee.id === selectedId) ?? employees[0], [employees, selectedId]);
  const editEmployee = (employee: Employee) => { setAdding(false); setDraft({ ...employee, viewPermissions: [...employee.viewPermissions], ticketTypes: [...employee.ticketTypes] }); setSelectedId(employee.id); setSaved(false); };
  const update = <K extends keyof Employee>(key: K, value: Employee[K]) => setDraft((current) => current ? { ...current, [key]: value } : current);
  const toggle = (key: "viewPermissions" | "ticketTypes", value: string) => setDraft((current) => current ? { ...current, [key]: current[key].includes(value as never) ? current[key].filter((item) => item !== value) : [...current[key], value as never] } : current);
  const startAdd = () => { setAdding(true); setDraft({ ...emptyEmployee, id: "new" }); setSaved(false); };
  const save = (event: FormEvent) => { event.preventDefault(); if (!draft || !draft.name.trim() || !draft.email.trim()) return; if (adding) { const newId = `EMP-${String(employees.length + 1).padStart(3, "0")}`; const { id: _id, ...employee } = draft; addEmployee(employee); setSelectedId(newId); setDraft({ ...draft, id: newId }); setAdding(false); } else { updateEmployee(draft.id, draft); } setSaved(true); };

  return <AppShell><div className="mx-auto max-w-[1440px] px-5 pb-12 pt-8 sm:px-8 xl:px-10"><div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><div className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.17em] text-[#755bc0]"><CircleUserRound size={13} /> People & goals</div><h1 className="font-display text-[32px] font-bold tracking-[-0.06em] text-[#152239] sm:text-[39px]">People, access, accountability.</h1><p className="mt-2 max-w-[700px] text-[13px] leading-6 text-slate-500">Add employees, define the records they can see, and decide which ticket types they are allowed to log. These controls are editable now and ready for backend persistence later.</p></div><button onClick={startAdd} className="inline-flex items-center gap-2 self-start rounded-xl bg-[#182842] px-3.5 py-2.5 text-[11px] font-bold text-white shadow-[0_5px_12px_rgba(20,35,58,.15)] hover:bg-[#233958] md:self-auto"><UserPlus size={15} /> Add employee</button></div>

    <div className="mt-7 grid gap-5 xl:grid-cols-[minmax(280px,.7fr)_minmax(0,1.3fr)]"><section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_5px_20px_rgba(21,36,58,0.035)]"><div className="flex items-center justify-between px-1"><div><p className="text-[12px] font-bold text-slate-700">Team directory</p><p className="mt-1 text-[10px] text-slate-400">{employees.length} employee records</p></div><span className="grid size-8 place-items-center rounded-lg bg-[#f1edff] text-[#755bc0]"><KeyRound size={15} /></span></div><div className="mt-4 space-y-1.5">{employees.map((employee) => <button key={employee.id} onClick={() => editEmployee(employee)} className={cn("flex w-full items-center gap-3 rounded-xl p-3 text-left transition", selected?.id === employee.id && !adding ? "bg-[#f1edff]" : "hover:bg-slate-50")}><span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#e7e0ff] text-[10px] font-bold text-[#755bc0]">{employee.name.split(" ").map((part) => part[0]).join("").slice(0, 2)}</span><span className="min-w-0 flex-1"><span className="block truncate text-[11px] font-bold text-slate-700">{employee.name}</span><span className="mt-1 block truncate text-[10px] text-slate-400">{employee.position}</span></span><ChevronRight size={14} className="shrink-0 text-slate-300" /></button>)}</div><div className="mt-5 rounded-xl bg-[#f7f9fb] p-3 text-[10px] leading-5 text-slate-500"><span className="font-bold text-slate-700">Least privilege:</span> access is assigned by role, then refined per employee.</div></section>

    {draft && <form onSubmit={save} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_5px_20px_rgba(21,36,58,0.035)] sm:p-6"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start"><div><div className="flex items-center gap-2"><span className="grid size-8 place-items-center rounded-lg bg-[#f1edff] text-[#755bc0]"><CircleUserRound size={16} /></span><h2 className="font-display text-[16px] font-bold tracking-[-0.03em] text-[#152239]">{adding ? "Add employee" : `Edit ${selected?.name ?? "employee"}`}</h2></div><p className="mt-2 text-[11px] text-slate-400">Every employee has a role, reporting line, visibility scope and ticket permissions.</p></div>{saved && <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e8f8f2] px-2.5 py-1.5 text-[10px] font-bold text-[#168465]"><Check size={13} /> Saved locally</span>}</div><div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"><label className="text-[10px] font-bold text-slate-500">Full name<input required value={draft.name} onChange={(e) => update("name", e.target.value)} className="form-input" placeholder="e.g. Naledi Molefe" /></label><label className="text-[10px] font-bold text-slate-500">Work email<input required type="email" value={draft.email} onChange={(e) => update("email", e.target.value)} className="form-input" placeholder="name@medmap.co.za" /></label><label className="text-[10px] font-bold text-slate-500">Position<input value={draft.position} onChange={(e) => update("position", e.target.value)} className="form-input" placeholder="e.g. Customer Operations Lead" /></label><label className="text-[10px] font-bold text-slate-500">Department<input value={draft.department} onChange={(e) => update("department", e.target.value)} className="form-input" /></label><label className="text-[10px] font-bold text-slate-500">Manager<input value={draft.manager} onChange={(e) => update("manager", e.target.value)} className="form-input" /></label><label className="text-[10px] font-bold text-slate-500">Role<select value={draft.role} onChange={(e) => update("role", e.target.value as Employee["role"])} className="form-input"><option>CEO</option><option>COO</option><option>CTO</option><option>Department head</option><option>Manager</option><option>Employee</option></select></label></div><div className="mt-6 grid gap-5 lg:grid-cols-2"><fieldset><legend className="flex items-center gap-2 text-[11px] font-bold text-slate-700"><Eye size={14} className="text-[#1b9975]" /> Can view</legend><div className="mt-3 grid gap-2 sm:grid-cols-2">{viewPermissionOptions.map((permission) => <label key={permission} className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-100 p-2.5 text-[10px] text-slate-600 hover:bg-slate-50"><input type="checkbox" checked={draft.viewPermissions.includes(permission)} onChange={() => toggle("viewPermissions", permission)} className="accent-[#1b9975]" />{permission}</label>)}</div></fieldset><fieldset><legend className="flex items-center gap-2 text-[11px] font-bold text-slate-700"><Ticket size={14} className="text-[#755bc0]" /> Can log ticket types</legend><div className="mt-3 grid gap-2 sm:grid-cols-2">{ticketTypeOptions.map((type) => <label key={type} className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-100 p-2.5 text-[10px] text-slate-600 hover:bg-slate-50"><input type="checkbox" checked={draft.ticketTypes.includes(type)} onChange={() => toggle("ticketTypes", type)} className="accent-[#755bc0]" />{type}</label>)}</div></fieldset></div><div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4"><p className="text-[10px] text-slate-400">Changes are stored in this browser until the backend is connected.</p><button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-[#182842] px-4 py-2.5 text-[11px] font-bold text-white hover:bg-[#233958]"><Save size={14} /> Save employee</button></div></form>}
    </div>

    <div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl border border-slate-200/80 bg-white p-4"><p className="text-[10px] text-slate-400">Active employees</p><p className="mt-2 font-display text-[25px] font-bold tracking-[-0.06em] text-[#152239]">{employees.filter((employee) => employee.employmentStatus === "Active").length}</p><p className="mt-1 text-[10px] font-semibold text-[#168465]">With current access</p></div><div className="rounded-2xl border border-slate-200/80 bg-white p-4"><p className="text-[10px] text-slate-400">Ticket permission sets</p><p className="mt-2 font-display text-[25px] font-bold tracking-[-0.06em] text-[#152239]">{new Set(employees.map((employee) => employee.ticketTypes.join("|"))).size}</p><p className="mt-1 text-[10px] font-semibold text-[#755bc0]">Role-specific, editable</p></div><div className="rounded-2xl border border-slate-200/80 bg-white p-4"><p className="text-[10px] text-slate-400">Sensitive scopes</p><p className="mt-2 font-display text-[25px] font-bold tracking-[-0.06em] text-[#152239]">{employees.filter((employee) => employee.viewPermissions.includes("Financial health")).length}</p><p className="mt-1 text-[10px] font-semibold text-[#b3781f]">Can view finance</p></div></div></div></AppShell>;
}
