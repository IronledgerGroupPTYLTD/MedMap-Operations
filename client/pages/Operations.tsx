import { FormEvent, useMemo, useState } from "react";
import {
  CheckCircle2,
  CirclePlus,
  Clock3,
  LifeBuoy,
  LockKeyhole,
  Plus,
  Ticket,
  Trash2,
  X,
} from "lucide-react";
import { AppShell } from "@/components/medmap/AppShell";
import { Ticket as TicketRecord, useMedMap } from "@/lib/medmap-store";
import { cn } from "@/lib/utils";

const priorityStyles = {
  Low: "bg-slate-100 text-slate-500",
  Normal: "bg-[#eaf3ff] text-[#4a87c9]",
  High: "bg-[#fff2d9] text-[#9a6419]",
  Critical: "bg-[#ffe5e3] text-[#bd504d]",
};
const statusStyles = {
  Open: "bg-slate-100 text-slate-500",
  Assigned: "bg-[#eaf3ff] text-[#4a87c9]",
  "In progress": "bg-[#f1edff] text-[#755bc0]",
  Pending: "bg-[#fff2d9] text-[#9a6419]",
  Completed: "bg-[#e8f8f2] text-[#168465]",
  Closed: "bg-[#e8f8f2] text-[#168465]",
};

type Draft = {
  title: string;
  type: TicketRecord["type"];
  priority: TicketRecord["priority"];
  requesterId: string;
  assigneeId: string;
  dueDate: string;
  description: string;
  amount: string;
  owedTo: string;
};

const today = () => new Date().toISOString().slice(0, 10);

export default function Operations() {
  const { tickets, employees, addTicket, updateTicket, deleteTicket, addTransaction } = useMedMap();
  const [showAdd, setShowAdd] = useState(false);
  const [filter, setFilter] = useState<"All" | TicketRecord["status"]>("All");
  const [draft, setDraft] = useState<Draft>({
    title: "",
    type: "General operations",
    priority: "Normal",
    requesterId: employees[0]?.id ?? "",
    assigneeId: employees[1]?.id ?? "",
    dueDate: today(),
    description: "",
    amount: "",
    owedTo: employees[0]?.name ?? "",
  });

  const requester = employees.find((employee) => employee.id === draft.requesterId) ?? employees[0];
  const allowedTypes = requester?.ticketTypes ?? [];
  const eligibleAssignees = employees.filter((employee) => employee.ticketTypes.includes(draft.type));
  const filteredTickets = tickets.filter((ticket) => filter === "All" || ticket.status === filter);
  const openCount = tickets.filter((ticket) => !["Completed", "Closed"].includes(ticket.status)).length;
  const overdueCount = tickets.filter((ticket) => ticket.dueDate < today() && !["Completed", "Closed"].includes(ticket.status)).length;
  const contributors = useMemo(() => employees.map((employee) => employee.name), [employees]);

  const updateDraft = (key: keyof Draft, value: string) => setDraft((current) => ({ ...current, [key]: value }));
  const changeRequester = (id: string) => {
    const nextRequester = employees.find((employee) => employee.id === id);
    const nextType = nextRequester?.ticketTypes[0] ?? "General operations";
    const nextAssignee = employees.find((employee) => employee.ticketTypes.includes(nextType));
    setDraft((current) => ({ ...current, requesterId: id, type: nextType, assigneeId: nextAssignee?.id ?? "" }));
  };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const amount = Number(draft.amount);
    const reimbursement = draft.type === "Expense reimbursement";
    if (!requester || !requester.ticketTypes.includes(draft.type) || !draft.title.trim() || !draft.description.trim() || (reimbursement && (!amount || amount <= 0 || !draft.owedTo))) return;
    addTicket({
      title: draft.title,
      type: draft.type,
      priority: draft.priority,
      status: "Open",
      requester: requester.name,
      assigneeId: draft.assigneeId,
      createdAt: today(),
      dueDate: draft.dueDate,
      description: draft.description,
      ...(reimbursement ? { amount, owedTo: draft.owedTo } : {}),
    });
    if (reimbursement) {
      addTransaction({
        date: today(),
        description: draft.title,
        kind: "funding",
        category: "Employee reimbursement",
        amount,
        status: "Payable",
        owner: requester.name,
        owedTo: draft.owedTo,
        source: "Operations reimbursement ticket",
        notes: draft.description,
      });
    }
    setDraft((current) => ({ ...current, title: "", description: "", amount: "" }));
    setShowAdd(false);
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-[1440px] px-5 pb-12 pt-8 sm:px-8 xl:px-10">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div><div className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.17em] text-[#d4784f]"><LifeBuoy size={13} /> Operations & accountability</div><h1 className="font-display text-[32px] font-bold tracking-[-0.06em] text-[#152239] sm:text-[39px]">Make every piece of work accountable.</h1><p className="mt-2 max-w-[700px] text-[13px] leading-6 text-slate-500">Log company-wide tickets, respect each employee’s ticket permissions, assign an owner and keep the full work record editable.</p></div>
          <button onClick={() => setShowAdd(true)} className="inline-flex items-center gap-2 self-start rounded-xl bg-[#182842] px-3.5 py-2.5 text-[11px] font-bold text-white shadow-[0_5px_12px_rgba(20,35,58,.15)] hover:bg-[#233958] md:self-auto"><Plus size={15} /> Log a ticket</button>
        </div>

        <div className="mt-7 grid gap-3 sm:grid-cols-3">
          <Metric label="Open work" value={String(openCount)} detail={`${overdueCount} overdue`} icon={Ticket} />
          <Metric label="Assigned" value={String(tickets.filter((ticket) => ticket.assigneeId).length)} detail="With a clear owner" icon={CheckCircle2} />
          <Metric label="Permission sets" value={String(new Set(employees.map((employee) => employee.ticketTypes.join("|"))).size)} detail="Based on employee access" icon={LockKeyhole} />
        </div>

        {showAdd && <form onSubmit={submit} className="mt-5 rounded-2xl border border-[#bfe9da] bg-[#f2fcf8] p-5 sm:p-6"><div className="flex items-start justify-between"><div><div className="flex items-center gap-2"><span className="grid size-8 place-items-center rounded-lg bg-white text-[#168465]"><CirclePlus size={16} /></span><h2 className="font-display text-[16px] font-bold text-[#152239]">Log company ticket</h2></div><p className="mt-2 text-[11px] text-slate-500">Reimbursement tickets create a payable contributor record automatically.</p></div><button type="button" onClick={() => setShowAdd(false)} className="rounded-lg p-1.5 text-slate-400 hover:bg-white" aria-label="Close ticket form"><X size={16} /></button></div><div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><label className="text-[10px] font-bold text-slate-500 sm:col-span-2">Title<input required value={draft.title} onChange={(e) => updateDraft("title", e.target.value)} className="form-input" placeholder="What needs to happen?" /></label><label className="text-[10px] font-bold text-slate-500">Logged by<select value={draft.requesterId} onChange={(e) => changeRequester(e.target.value)} className="form-input">{employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.name}</option>)}</select></label><label className="text-[10px] font-bold text-slate-500">Ticket type<select value={draft.type} onChange={(e) => { const type = e.target.value as TicketRecord["type"]; const assignee = employees.find((employee) => employee.ticketTypes.includes(type)); setDraft((current) => ({ ...current, type, assigneeId: assignee?.id ?? "" })); }} className="form-input">{allowedTypes.map((type) => <option key={type} value={type}>{type}</option>)}</select></label><label className="text-[10px] font-bold text-slate-500">Priority<select value={draft.priority} onChange={(e) => updateDraft("priority", e.target.value)} className="form-input"><option>Low</option><option>Normal</option><option>High</option><option>Critical</option></select></label><label className="text-[10px] font-bold text-slate-500">Assignee<select value={draft.assigneeId} onChange={(e) => updateDraft("assigneeId", e.target.value)} className="form-input">{eligibleAssignees.map((employee) => <option key={employee.id} value={employee.id}>{employee.name}</option>)}</select></label><label className="text-[10px] font-bold text-slate-500">Due date<input type="date" value={draft.dueDate} onChange={(e) => updateDraft("dueDate", e.target.value)} className="form-input" /></label>{draft.type === "Expense reimbursement" && <><label className="text-[10px] font-bold text-slate-500">Amount owed<input required type="number" min="0.01" step="0.01" value={draft.amount} onChange={(e) => updateDraft("amount", e.target.value)} className="form-input" placeholder="0.00" /></label><label className="text-[10px] font-bold text-slate-500">Owed to<select required value={draft.owedTo} onChange={(e) => updateDraft("owedTo", e.target.value)} className="form-input">{contributors.map((name) => <option key={name} value={name}>{name}</option>)}</select></label></>}<label className="text-[10px] font-bold text-slate-500 sm:col-span-2 lg:col-span-4">Description<textarea required value={draft.description} onChange={(e) => updateDraft("description", e.target.value)} className="form-input min-h-20 resize-y" placeholder="Describe the work or expense." /></label></div><div className="mt-4 flex justify-end"><button className="rounded-xl bg-[#168465] px-4 py-2.5 text-[11px] font-bold text-white hover:bg-[#126b53]">Create ticket</button></div></form>}

        <section className="mt-5 rounded-2xl border border-slate-200/80 bg-white shadow-[0_5px_20px_rgba(21,36,58,0.035)]"><div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"><div><div className="flex items-center gap-2"><span className="grid size-8 place-items-center rounded-lg bg-[#fff1e9] text-[#d4784f]"><Ticket size={16} /></span><h2 className="font-display text-[16px] font-bold text-[#152239]">Central ticket engine</h2></div><p className="mt-2 text-[11px] text-slate-400">Open → Assigned → In progress → Pending → Completed → Closed</p></div><div className="flex flex-wrap gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1"><button type="button" onClick={() => setFilter("All")} className={cn("rounded-md px-2.5 py-1.5 text-[10px] font-bold", filter === "All" ? "bg-white text-slate-700 shadow-sm" : "text-slate-400")}>All</button>{["Open", "Assigned", "In progress", "Pending", "Completed"].map((status) => <button type="button" key={status} onClick={() => setFilter(status as TicketRecord["status"])} className={cn("rounded-md px-2.5 py-1.5 text-[10px] font-bold", filter === status ? "bg-white text-[#168465] shadow-sm" : "text-slate-400")}>{status}</button>)}</div></div><div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left"><thead><tr className="border-b border-slate-100 text-[10px] uppercase tracking-[0.12em] text-slate-400"><th className="px-5 py-3 font-bold sm:px-6">Ticket</th><th className="px-3 py-3 font-bold">Requester</th><th className="px-3 py-3 font-bold">Owner</th><th className="px-3 py-3 font-bold">Status</th><th className="px-3 py-3 font-bold">Due</th><th className="px-3 py-3 font-bold">Action</th></tr></thead><tbody>{filteredTickets.map((ticket) => <tr key={ticket.id} className="border-b border-slate-50 text-[11px] last:border-0"><td className="px-5 py-4 sm:px-6"><p className="font-bold text-slate-700">{ticket.title}</p><div className="mt-1 flex items-center gap-2 text-[10px] text-slate-400"><span>{ticket.type}</span>{ticket.amount ? <span>· R{ticket.amount.toLocaleString("en-ZA", { minimumFractionDigits: 2 })} owed to {ticket.owedTo}</span> : null}<span className={cn("rounded-full px-2 py-0.5 font-bold", priorityStyles[ticket.priority])}>{ticket.priority}</span></div></td><td className="px-3 py-4 text-slate-500">{ticket.requester}</td><td className="px-3 py-4 text-slate-500">{employees.find((employee) => employee.id === ticket.assigneeId)?.name ?? "Unassigned"}</td><td className="px-3 py-4"><select value={ticket.status} onChange={(e) => updateTicket(ticket.id, { status: e.target.value as TicketRecord["status"] })} className={cn("rounded-full border-0 px-2 py-1 text-[10px] font-bold outline-none", statusStyles[ticket.status])}>{["Open", "Assigned", "In progress", "Pending", "Completed", "Closed"].map((status) => <option key={status}>{status}</option>)}</select></td><td className="px-3 py-4 text-slate-500"><span className="inline-flex items-center gap-1"><Clock3 size={12} />{ticket.dueDate}</span></td><td className="px-3 py-4"><button type="button" onClick={() => deleteTicket(ticket.id)} className="rounded-lg p-2 text-slate-400 hover:bg-[#fff0ee] hover:text-[#bd504d]" aria-label={`Delete ${ticket.title}`}><Trash2 size={14} /></button></td></tr>)}</tbody></table></div>{filteredTickets.length === 0 && <p className="p-8 text-center text-[11px] text-slate-400">No tickets match this filter.</p>}</section>
      </div>
    </AppShell>
  );
}

function Metric({ label, value, detail, icon: Icon }: { label: string; value: string; detail: string; icon: React.ElementType }) {
  return <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_5px_20px_rgba(21,36,58,0.035)]"><div className="flex items-center justify-between"><p className="text-[10px] text-slate-400">{label}</p><Icon size={16} className="text-[#d4784f]" /></div><p className="mt-2 font-display text-[26px] font-bold tracking-[-0.06em] text-[#152239]">{value}</p><p className="mt-1 text-[10px] font-semibold text-[#168465]">{detail}</p></div>;
}
