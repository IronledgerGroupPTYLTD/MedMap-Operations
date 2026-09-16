import { FormEvent, useState } from "react";
import {
  Check,
  ChevronRight,
  CircleUserRound,
  Eye,
  KeyRound,
  Mail,
  Pencil,
  Plus,
  Save,
  ShieldCheck,
  Ticket,
  Trash2,
  UserPlus,
  X,
} from "lucide-react";
import { AppShell } from "@/components/medmap/AppShell";
import { Employee, EmployeeDeliverable, ticketTypeOptions, useMedMap, viewPermissionOptions } from "@/lib/medmap-store";
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
  deliverables: [],
};

function Chip({ children, tone = "slate" }: { children: React.ReactNode; tone?: "slate" | "mint" | "lavender" }) {
  return <span className={cn("rounded-full px-2 py-1 text-[9px] font-bold", tone === "mint" ? "bg-[#e8f8f2] text-[#168465]" : tone === "lavender" ? "bg-[#f1edff] text-[#755bc0]" : "bg-slate-100 text-slate-500")}>{children}</span>;
}

export default function People() {
  const { employees, addEmployee, updateEmployee, deleteEmployee } = useMedMap();
  const [selectedId, setSelectedId] = useState(employees[0]?.id ?? "");
  const [draft, setDraft] = useState<Employee | null>(employees[0] ?? null);
  const [adding, setAdding] = useState(false);
  const [saved, setSaved] = useState(false);

  const selected = employees.find((employee) => employee.id === selectedId) ?? employees[0];
  const editEmployee = (employee: Employee) => { setAdding(false); setDraft({ ...employee, viewPermissions: [...employee.viewPermissions], ticketTypes: [...employee.ticketTypes], deliverables: [...(employee.deliverables ?? [])] }); setSelectedId(employee.id); setSaved(false); };
  const update = <K extends keyof Employee>(key: K, value: Employee[K]) => setDraft((current) => current ? { ...current, [key]: value } : current);
  const toggle = (key: "viewPermissions" | "ticketTypes", value: string) => setDraft((current) => current ? { ...current, [key]: current[key].includes(value as never) ? current[key].filter((item) => item !== value) : [...current[key], value as never] } : current);
  const startAdd = () => { setAdding(true); setDraft({ ...emptyEmployee, id: "new", deliverables: [] }); setSelectedId("new"); setSaved(false); };
  const save = (event: FormEvent) => { event.preventDefault(); if (!draft || !draft.name.trim() || !draft.email.trim()) return; if (adding) { const { id: _id, ...employee } = draft; const newId = addEmployee(employee); setSelectedId(newId); setDraft({ ...draft, id: newId }); setAdding(false); } else updateEmployee(draft.id, draft); setSaved(true); };
  const remove = (employee: Employee) => {
    if (!window.confirm(`Remove ${employee.name} from the employee directory?`)) return;
    deleteEmployee(employee.id);
    const next = employees.find((item) => item.id !== employee.id);
    if (next) editEmployee(next);
    else { setSelectedId(""); setDraft(null); setAdding(false); }
  };
  const updateDeliverable = (id: string, patch: Partial<EmployeeDeliverable>) => update("deliverables", (draft?.deliverables ?? []).map((item) => item.id === id ? { ...item, ...patch } : item));
  const addDeliverable = () => update("deliverables", [...(draft?.deliverables ?? []), { id: `DEL-${Date.now()}`, title: "", cadence: "Weekly", dueDate: new Date().toISOString().slice(0, 10), status: "Not started", notes: "" }]);
  const deleteDeliverable = (id: string) => update("deliverables", (draft?.deliverables ?? []).filter((item) => item.id !== id));

  return <AppShell><div className="mx-auto max-w-[1440px] px-5 pb-12 pt-8 sm:px-8 xl:px-10"><div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><div className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.17em] text-[#755bc0]"><CircleUserRound size={13} /> People & goals</div><h1 className="font-display text-[32px] font-bold tracking-[-0.06em] text-[#152239] sm:text-[39px]">People, access, accountability.</h1><p className="mt-2 max-w-[700px] text-[13px] leading-6 text-slate-500">Add employees, define the records they can see, and give each person a clear set of deliverables and ticket permissions.</p></div><button onClick={startAdd} className="inline-flex items-center gap-2 self-start rounded-xl bg-[#182842] px-3.5 py-2.5 text-[11px] font-bold text-white shadow-[0_5px_12px_rgba(20,35,58,.15)] hover:bg-[#233958] md:self-auto"><UserPlus size={15} /> Add employee</button></div>

    <div className="mt-7 grid gap-5 xl:grid-cols-[minmax(280px,.7fr)_minmax(0,1.3fr)]"><section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_5px_20px_rgba(21,36,58,0.035)]"><div className="flex items-center justify-between px-1"><div><p className="text-[12px] font-bold text-slate-700">Team directory</p><p className="mt-1 text-[10px] text-slate-400">{employees.length} employee records</p></div><span className="grid size-8 place-items-center rounded-lg bg-[#f1edff] text-[#755bc0]"><KeyRound size={15} /></span></div><div className="mt-4 space-y-1.5">{employees.map((employee) => <div key={employee.id} className={cn("flex items-center gap-2 rounded-xl p-2 transition", selected?.id === employee.id && !adding ? "bg-[#f1edff]" : "hover:bg-slate-50")}><button onClick={() => editEmployee(employee)} className="flex min-w-0 flex-1 items-center gap-3 p-1 text-left"><span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#e7e0ff] text-[10px] font-bold text-[#755bc0]">{employee.name.split(" ").map((part) => part[0]).join("").slice(0, 2)}</span><span className="min-w-0 flex-1"><span className="block truncate text-[11px] font-bold text-slate-700">{employee.name}</span><span className="mt-1 block truncate text-[10px] text-slate-400">{employee.position}</span></span><ChevronRight size={14} className="shrink-0 text-slate-300" /></button><button type="button" onClick={() => remove(employee)} className="rounded-lg p-2 text-slate-400 hover:bg-[#fff0ee] hover:text-[#bd504d]" aria-label={`Remove ${employee.name}`}><Trash2 size={14} /></button></div>)}</div><div className="mt-5 rounded-xl bg-[#f7f9fb] p-3 text-[10px] leading-5 text-slate-500"><span className="font-bold text-slate-700">Least privilege:</span> access is assigned by record scope, role and ticket type. Remove leavers from this directory when their access should end.</div></section>

    {draft && <form onSubmit={save} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_5px_20px_rgba(21,36,58,0.035)] sm:p-6"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start"><div><div className="flex items-center gap-2"><span className="grid size-8 place-items-center rounded-lg bg-[#f1edff] text-[#755bc0]"><CircleUserRound size={16} /></span><h2 className="font-display text-[16px] font-bold tracking-[-0.03em] text-[#152239]">{adding ? "Add employee" : `Edit ${selected?.name ?? "employee"}`}</h2></div><p className="mt-2 text-[11px] text-slate-400">Every employee has a role, reporting line, visibility scope, ticket permissions and deliverables.</p></div><div className="flex items-center gap-2">{saved && <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e8f8f2] px-2.5 py-1.5 text-[10px] font-bold text-[#168465]"><Check size={13} /> Saved locally</span>}{!adding && <button type="button" onClick={() => remove(draft)} className="inline-flex items-center gap-1.5 rounded-lg border border-[#f0cdca] px-2.5 py-1.5 text-[10px] font-bold text-[#bd504d] hover:bg-[#fff8f7]"><Trash2 size={13} /> Remove employee</button>}</div></div><div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"><label className="text-[10px] font-bold text-slate-500">Full name<input required value={draft.name} onChange={(e) => update("name", e.target.value)} className="form-input" placeholder="e.g. Naledi Molefe" /></label><label className="text-[10px] font-bold text-slate-500">Work email<input required type="email" value={draft.email} onChange={(e) => update("email", e.target.value)} className="form-input" placeholder="name@medmap.co.za" /></label><label className="text-[10px] font-bold text-slate-500">Position<input value={draft.position} onChange={(e) => update("position", e.target.value)} className="form-input" /></label><label className="text-[10px] font-bold text-slate-500">Department<input value={draft.department} onChange={(e) => update("department", e.target.value)} className="form-input" /></label><label className="text-[10px] font-bold text-slate-500">Role<select value={draft.role} onChange={(e) => update("role", e.target.value as Employee["role"])} className="form-input"><option>CEO</option><option>COO</option><option>CTO</option><option>Department head</option><option>Manager</option><option>Employee</option></select></label><label className="text-[10px] font-bold text-slate-500">Employment status<select value={draft.employmentStatus} onChange={(e) => update("employmentStatus", e.target.value as Employee["employmentStatus"])} className="form-input"><option>Active</option><option>On leave</option><option>Inactive</option></select></label><label className="text-[10px] font-bold text-slate-500">Manager<input value={draft.manager} onChange={(e) => update("manager", e.target.value)} className="form-input" /></label><label className="text-[10px] font-bold text-slate-500">Executive sponsor<input value={draft.executive} onChange={(e) => update("executive", e.target.value)} className="form-input" /></label></div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2"><PermissionGroup icon={Eye} title="View permissions" hint="Which system areas can this person see?" options={viewPermissionOptions} selected={draft.viewPermissions} onToggle={(value) => toggle("viewPermissions", value)} /><PermissionGroup icon={Ticket} title="Ticket permissions" hint="Which work types can this person log?" options={ticketTypeOptions} selected={draft.ticketTypes} onToggle={(value) => toggle("ticketTypes", value)} /></div>

      <div className="mt-6 rounded-2xl border border-[#ddd6f5] bg-[#fbfaff] p-4"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div><div className="flex items-center gap-2"><span className="grid size-8 place-items-center rounded-lg bg-[#eee8ff] text-[#755bc0]"><TargetIcon /></span><div><h3 className="text-[12px] font-bold text-slate-700">Deliverables & goals</h3><p className="mt-1 text-[10px] text-slate-400">{draft.name || "This employee"}’s owned outputs.</p></div></div></div><button type="button" onClick={addDeliverable} className="inline-flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-2 text-[10px] font-bold text-[#755bc0] shadow-sm hover:bg-[#f1edff]"><Plus size={13} /> Add deliverable</button></div><div className="mt-4 space-y-3">{(draft.deliverables ?? []).map((deliverable) => <DeliverableEditor key={deliverable.id} deliverable={deliverable} onUpdate={(patch) => updateDeliverable(deliverable.id, patch)} onDelete={() => deleteDeliverable(deliverable.id)} />)}{!(draft.deliverables ?? []).length && <p className="rounded-xl bg-white p-4 text-[11px] text-slate-400">No deliverables assigned yet. Add the outputs this person is accountable for.</p>}</div></div>

      <div className="mt-6 flex justify-end"><button className="inline-flex items-center gap-2 rounded-xl bg-[#168465] px-4 py-2.5 text-[11px] font-bold text-white hover:bg-[#126b53]"><Save size={14} /> Save employee record</button></div></form>}
    </div>

    <div className="mt-5 grid gap-3 sm:grid-cols-3"><Summary label="Active employees" value={String(employees.filter((employee) => employee.employmentStatus === "Active").length)} detail="With current access" /><Summary label="Ticket permission sets" value={String(new Set(employees.map((employee) => employee.ticketTypes.join("|"))).size)} detail="Role-specific, editable" /><Summary label="Deliverables tracked" value={String(employees.reduce((total, employee) => total + (employee.deliverables?.length ?? 0), 0))} detail="Owned outputs" /></div></div></AppShell>;
}

function PermissionGroup({ icon: Icon, title, hint, options, selected, onToggle }: { icon: React.ElementType; title: string; hint: string; options: readonly string[]; selected: string[]; onToggle: (value: string) => void }) {
  return <div className="rounded-2xl border border-slate-200 bg-[#fbfcfd] p-4"><div className="flex items-center gap-2"><span className="grid size-8 place-items-center rounded-lg bg-white text-[#4a87c9] shadow-sm"><Icon size={15} /></span><div><p className="text-[12px] font-bold text-slate-700">{title}</p><p className="mt-1 text-[10px] text-slate-400">{hint}</p></div></div><div className="mt-4 flex flex-wrap gap-1.5">{options.map((option) => <button type="button" key={option} onClick={() => onToggle(option)} className={cn("rounded-lg border px-2.5 py-2 text-left text-[10px] font-bold transition", selected.includes(option) ? "border-[#bfe9da] bg-[#e8f8f2] text-[#168465]" : "border-slate-200 bg-white text-slate-400 hover:border-slate-300")}>{selected.includes(option) && <Check size={11} className="mr-1 inline" />}{option}</button>)}</div></div>;
}

function DeliverableEditor({ deliverable, onUpdate, onDelete }: { deliverable: EmployeeDeliverable; onUpdate: (patch: Partial<EmployeeDeliverable>) => void; onDelete: () => void }) {
  return <div className="grid gap-2 rounded-xl border border-[#e2ddf7] bg-white p-3 sm:grid-cols-[minmax(0,1.4fr)_115px_135px_130px_auto] sm:items-end"><label className="text-[10px] font-bold text-slate-500">Deliverable<input value={deliverable.title} onChange={(e) => onUpdate({ title: e.target.value })} className="form-input" placeholder="What must be delivered?" /></label><label className="text-[10px] font-bold text-slate-500">Cadence<select value={deliverable.cadence} onChange={(e) => onUpdate({ cadence: e.target.value as EmployeeDeliverable["cadence"] })} className="form-input"><option>Weekly</option><option>Monthly</option><option>One-off</option></select></label><label className="text-[10px] font-bold text-slate-500">Due date<input type="date" value={deliverable.dueDate} onChange={(e) => onUpdate({ dueDate: e.target.value })} className="form-input" /></label><label className="text-[10px] font-bold text-slate-500">Status<select value={deliverable.status} onChange={(e) => onUpdate({ status: e.target.value as EmployeeDeliverable["status"] })} className="form-input"><option>Not started</option><option>In progress</option><option>Done</option><option>Blocked</option></select></label><button type="button" onClick={onDelete} className="rounded-lg p-2 text-slate-400 hover:bg-[#fff0ee] hover:text-[#bd504d]" aria-label={`Delete ${deliverable.title || "deliverable"}`}><Trash2 size={14} /></button><label className="text-[10px] font-bold text-slate-500 sm:col-span-5">Notes<input value={deliverable.notes} onChange={(e) => onUpdate({ notes: e.target.value })} className="form-input" placeholder="Evidence or follow-up detail" /></label></div>;
}

function TargetIcon() {
  return <span className="block size-3 rounded-full border-2 border-current" />;
}

function Summary({ label, value, detail }: { label: string; value: string; detail: string }) {
  return <div className="rounded-2xl border border-slate-200/80 bg-white p-4"><p className="text-[10px] text-slate-400">{label}</p><p className="mt-2 font-display text-[25px] font-bold tracking-[-0.06em] text-[#152239]">{value}</p><p className="mt-1 text-[10px] font-semibold text-[#168465]">{detail}</p></div>;
}
