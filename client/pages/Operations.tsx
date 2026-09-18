import { useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowDownRight,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Layers3,
  LifeBuoy,
  Link2,
  Ticket,
  Trash2,
  Users,
} from "lucide-react";
import { AppShell } from "@/components/medmap/AppShell";
import { isResolvedStatus } from "@/lib/executive-dashboard";
import { useCurrentEmployee } from "@/lib/supabase-identity";
import {
  buildDepartmentWorkload,
  buildEmployeeWorkload,
  buildKpiWorkload,
  buildOperationsSummary,
  displayEmployeeName,
  isTicketOverdue,
  useOperationsDashboard,
  useOperationsTicketActions,
  type OperationsDeadline,
  type OperationsEmployee,
  type OperationsEmployeeWorkload,
  type OperationsKpiWorkload,
  type OperationsTask,
} from "@/lib/operations-dashboard";
import { cn } from "@/lib/utils";

type Tone = "mint" | "red" | "amber" | "navy";

type MetricProps = {
  label: string;
  value: string;
  detail: string;
  tone: Tone;
  icon: React.ElementType;
};

function formatLiveDate(value: string | null) {
  if (!value) return "Date not provided";
  const date = new Date(value.includes("T") ? value : `${value}T12:00:00`);
  return Number.isNaN(date.valueOf())
    ? value
    : new Intl.DateTimeFormat("en-ZA", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(date);
}

function priorityClass(priority: string) {
  const value = priority.trim().toLowerCase();
  if (["critical", "urgent"].includes(value)) {
    return "bg-[#ffe5e3] text-[#bd504d]";
  }
  if (["high"].includes(value)) return "bg-[#fff2d9] text-[#9a6419]";
  if (["normal", "medium"].includes(value)) {
    return "bg-[#eaf3ff] text-[#4a87c9]";
  }
  return "bg-slate-100 text-slate-500";
}

function statusClass(status: string) {
  const value = status.trim().toLowerCase();
  if (isResolvedStatus(status)) return "bg-[#e8f8f2] text-[#168465]";
  if (["critical", "blocked", "failed", "overdue"].includes(value)) {
    return "bg-[#ffe5e3] text-[#bd504d]";
  }
  if (["pending", "at risk", "warning"].includes(value)) {
    return "bg-[#fff2d9] text-[#9a6419]";
  }
  if (["assigned", "in progress", "started"].includes(value)) {
    return "bg-[#f1edff] text-[#755bc0]";
  }
  return "bg-slate-100 text-slate-500";
}

function Metric({ label, value, detail, tone, icon: Icon }: MetricProps) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_5px_20px_rgba(21,36,58,0.035)]">
      <div className="flex items-start justify-between">
        <span
          className={cn(
            "grid size-9 place-items-center rounded-xl",
            tone === "mint" && "bg-[#e8f8f2] text-[#1b9975]",
            tone === "red" && "bg-[#ffe9e6] text-[#bf5b56]",
            tone === "amber" && "bg-[#fff2d9] text-[#b3781f]",
            tone === "navy" && "bg-[#eaf0f8] text-[#2f527a]",
          )}
        >
          <Icon size={17} />
        </span>
        <span
          className={cn(
            "size-1.5 rounded-full",
            tone === "mint"
              ? "bg-[#36ac87]"
              : tone === "red"
                ? "bg-[#da6560]"
                : tone === "amber"
                  ? "bg-[#e0a03a]"
                  : "bg-[#4a87c9]",
          )}
        />
      </div>
      <p className="mt-4 text-[11px] font-medium text-slate-500">{label}</p>
      <p
        className={cn(
          "mt-1 font-display text-[26px] font-bold tracking-[-0.06em]",
          tone === "red" ? "text-[#c1514d]" : "text-[#152239]",
        )}
      >
        {value}
      </p>
      <p className="mt-1 text-[10px] text-slate-400">{detail}</p>
    </div>
  );
}

function StateMessage({
  children,
  tone = "empty",
}: {
  children: React.ReactNode;
  tone?: "empty" | "error";
}) {
  return (
    <p
      className={cn(
        "rounded-xl p-3 text-[11px] leading-5",
        tone === "error"
          ? "border border-[#f0cdca] bg-[#fff8f7] text-[#a34f4b]"
          : "bg-[#f7f9fb] text-slate-400",
      )}
    >
      {children}
    </p>
  );
}

function WorkState({
  pending,
  error,
  empty,
  children,
}: {
  pending: boolean;
  error: boolean;
  empty: boolean;
  children: React.ReactNode;
}) {
  if (pending)
    return <StateMessage>Loading live operational data...</StateMessage>;
  if (error)
    return (
      <StateMessage tone="error">
        This operational section could not be loaded. Try again after the
        connection is available.
      </StateMessage>
    );
  if (empty) return <StateMessage>{children}</StateMessage>;
  return null;
}

function WorkBreakdown({
  summary,
}: {
  summary: ReturnType<typeof buildOperationsSummary>;
}) {
  return (
    <div className="mt-5 grid gap-3 md:grid-cols-3">
      <div className="rounded-xl bg-[#f7f9fb] p-3.5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[10px] font-medium text-slate-400">Tasks</p>
          <CheckCircle2 size={15} className="text-[#168465]" />
        </div>
        <p className="mt-2 font-display text-[22px] font-bold text-[#152239]">
          {summary.activeTaskCount}
        </p>
        <p className="mt-1 text-[10px] text-slate-400">
          {summary.completedTaskCount} completed · {summary.dueSoonTaskCount}{" "}
          due soon · {summary.overdueTaskCount} overdue
        </p>
      </div>
      <div className="rounded-xl bg-[#f7f9fb] p-3.5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[10px] font-medium text-slate-400">Tickets</p>
          <Ticket size={15} className="text-[#d4784f]" />
        </div>
        <p className="mt-2 font-display text-[22px] font-bold text-[#152239]">
          {summary.openTicketCount}
        </p>
        <p className="mt-1 text-[10px] text-slate-400">
          {summary.resolvedTicketCount} resolved · {summary.dueSoonTicketCount}{" "}
          due soon · {summary.overdueTicketCount} overdue
        </p>
      </div>
      <div className="rounded-xl bg-[#f7f9fb] p-3.5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[10px] font-medium text-slate-400">Deadlines</p>
          <CalendarClock size={15} className="text-[#b3781f]" />
        </div>
        <p className="mt-2 font-display text-[22px] font-bold text-[#152239]">
          {summary.activeDeadlineCount}
        </p>
        <p className="mt-1 text-[10px] text-slate-400">
          {summary.dueSoonDeadlineCount} due soon ·{" "}
          {summary.overdueDeadlineCount} overdue
        </p>
      </div>
    </div>
  );
}

function DepartmentWorkload({
  rows,
}: {
  rows: ReturnType<typeof buildDepartmentWorkload>;
}) {
  return (
    <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_5px_20px_rgba(21,36,58,0.035)] sm:p-6">
      <div className="flex items-center gap-2">
        <span className="grid size-8 place-items-center rounded-lg bg-[#eaf3ff] text-[#4a87c9]">
          <Layers3 size={16} />
        </span>
        <h2 className="font-display text-[16px] font-bold text-[#152239]">
          Department workload
        </h2>
      </div>
      <p className="mt-2 text-[11px] text-slate-400">
        Active tasks, open tickets and near-term deadlines by live department.
      </p>
      {rows.length ? (
        <div className="mt-4 space-y-2">
          {rows.slice(0, 6).map((row) => (
            <div
              key={row.id}
              className="rounded-xl border border-slate-100 bg-[#f8fafc] p-3"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-[11px] font-bold text-slate-700">
                  {row.name}
                </p>
                {row.overdueWork ? (
                  <span className="rounded-full bg-[#ffe5e3] px-2 py-1 text-[10px] font-bold text-[#bd504d]">
                    {row.overdueWork} overdue
                  </span>
                ) : null}
              </div>
              <p className="mt-1 text-[10px] text-slate-400">
                {row.activeTasks} active tasks · {row.openTickets} open tickets
                · {row.upcomingDeadlines} due soon
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-4">
          <StateMessage>
            No active department workload is available.
          </StateMessage>
        </div>
      )}
    </article>
  );
}

function EmployeeWorkload({ rows }: { rows: OperationsEmployeeWorkload[] }) {
  return (
    <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_5px_20px_rgba(21,36,58,0.035)] sm:p-6">
      <div className="flex items-center gap-2">
        <span className="grid size-8 place-items-center rounded-lg bg-[#e8f8f2] text-[#1b9975]">
          <Users size={16} />
        </span>
        <h2 className="font-display text-[16px] font-bold text-[#152239]">
          Employee workload
        </h2>
      </div>
      <p className="mt-2 text-[11px] text-slate-400">
        Live active employees with assigned operational work.
      </p>
      {rows.length ? (
        <div className="mt-4 space-y-2">
          {rows.slice(0, 6).map((row) => (
            <div
              key={row.id}
              className="rounded-xl border border-slate-100 bg-[#f8fafc] p-3"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-[11px] font-bold text-slate-700">
                    {row.name}
                  </p>
                  <p className="mt-1 truncate text-[10px] text-slate-400">
                    {row.jobTitle || row.departmentName || "Active employee"}
                  </p>
                </div>
                {row.overdueWork ? (
                  <span className="rounded-full bg-[#ffe5e3] px-2 py-1 text-[10px] font-bold text-[#bd504d]">
                    {row.overdueWork} overdue
                  </span>
                ) : null}
              </div>
              <p className="mt-1 text-[10px] text-slate-400">
                {row.activeTasks} tasks · {row.openTickets} tickets ·{" "}
                {row.ownedDeadlines} deadlines
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-4">
          <StateMessage>No active employee workload is available.</StateMessage>
        </div>
      )}
    </article>
  );
}

function KpiWorkload({ rows }: { rows: OperationsKpiWorkload[] }) {
  return (
    <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_5px_20px_rgba(21,36,58,0.035)] sm:p-6">
      <div className="flex items-center gap-2">
        <span className="grid size-8 place-items-center rounded-lg bg-[#fff2d9] text-[#b3781f]">
          <Link2 size={16} />
        </span>
        <h2 className="font-display text-[16px] font-bold text-[#152239]">
          KPI-linked work
        </h2>
      </div>
      <p className="mt-2 text-[11px] text-slate-400">
        Operational tasks and tickets linked to live KPI relationships.
      </p>
      {rows.length ? (
        <div className="mt-4 grid gap-2 md:grid-cols-2">
          {rows.slice(0, 6).map((row) => (
            <div key={row.id} className="rounded-xl bg-[#f7f9fb] p-3">
              <div className="flex items-start justify-between gap-3">
                <p className="text-[11px] font-bold text-slate-700">
                  {row.name}
                </p>
                {row.status ? (
                  <span
                    className={cn(
                      "rounded-full px-2 py-1 text-[10px] font-bold",
                      statusClass(row.status),
                    )}
                  >
                    {row.status}
                  </span>
                ) : null}
              </div>
              <p className="mt-2 text-[10px] text-slate-400">
                {row.activeTasks} active tasks · {row.openTickets} open tickets
                {row.periodName ? ` · ${row.periodName}` : ""}
              </p>
              {row.target !== null || row.actual !== null ? (
                <p className="mt-1 text-[10px] text-slate-500">
                  Target {row.target ?? "—"} · Actual {row.actual ?? "—"}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-4">
          <StateMessage>
            No KPI-linked operational work is available.
          </StateMessage>
        </div>
      )}
    </article>
  );
}

function AlertList({
  alerts,
}: {
  alerts: NonNullable<
    ReturnType<typeof useOperationsDashboard>["data"]
  >["alerts"];
}) {
  return (
    <article className="rounded-2xl border border-[#c9d7ec] bg-[#f7faff] p-5 shadow-[0_5px_20px_rgba(21,36,58,0.035)] sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-lg bg-[#fff2d9] text-[#b3781f]">
            <AlertCircle size={16} />
          </span>
          <h2 className="font-display text-[16px] font-bold text-[#152239]">
            Operational alerts
          </h2>
        </div>
        <span className="rounded-full bg-[#fff2d9] px-2.5 py-1 text-[10px] font-bold text-[#9a6419]">
          {alerts.length}
        </span>
      </div>
      <p className="mt-2 text-[11px] text-slate-500">
        Active company alerts returned through the authenticated data path.
      </p>
      {alerts.length ? (
        <div className="mt-4 grid gap-2 md:grid-cols-2">
          {alerts.slice(0, 4).map((alert) => (
            <div
              key={alert.id}
              className="rounded-xl border border-slate-100 bg-white p-3"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-[11px] font-bold text-slate-700">
                  {alert.title || "Company alert"}
                </p>
                <span
                  className={cn(
                    "rounded-full px-2 py-1 text-[10px] font-bold",
                    statusClass(alert.severity || alert.status),
                  )}
                >
                  {alert.severity || alert.status || "Alert"}
                </span>
              </div>
              <p className="mt-1 text-[10px] leading-5 text-slate-400">
                {alert.message || "No alert detail provided."}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-4">
          <StateMessage>
            No active operational alerts are available.
          </StateMessage>
        </div>
      )}
    </article>
  );
}

function TaskList({
  tasks,
  employees,
}: {
  tasks: OperationsTask[];
  employees: OperationsEmployee[];
}) {
  return (
    <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_5px_20px_rgba(21,36,58,0.035)] sm:p-6">
      <div className="flex items-center gap-2">
        <span className="grid size-8 place-items-center rounded-lg bg-[#eaf3ff] text-[#4a87c9]">
          <CheckCircle2 size={16} />
        </span>
        <h2 className="font-display text-[16px] font-bold text-[#152239]">
          Active tasks
        </h2>
      </div>
      <p className="mt-2 text-[11px] text-slate-400">
        Live task records with current owners, progress and due dates.
      </p>
      {tasks.length ? (
        <div className="mt-4 space-y-2">
          {tasks.slice(0, 5).map((task) => (
            <div
              key={task.id}
              className="rounded-xl border border-slate-100 bg-[#f8fafc] p-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-[11px] font-bold text-slate-700">
                    {task.title || "Untitled task"}
                  </p>
                  <p className="mt-1 text-[10px] text-slate-400">
                    {displayEmployeeName(employees, task.assigned_to)}
                    {task.due_date
                      ? ` · due ${formatLiveDate(task.due_date)}`
                      : ""}
                  </p>
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2 py-1 text-[10px] font-bold",
                    statusClass(task.status),
                  )}
                >
                  {task.status || "Status not provided"}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between gap-3 text-[10px] text-slate-400">
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 font-bold",
                    priorityClass(task.priority),
                  )}
                >
                  {task.priority || "Priority not provided"}
                </span>
                {task.progress_percentage !== null
                  ? `${task.progress_percentage}% complete`
                  : "Progress not provided"}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-4">
          <StateMessage>
            No active operational tasks are available.
          </StateMessage>
        </div>
      )}
    </article>
  );
}

function DeadlineList({
  deadlines,
  employees,
}: {
  deadlines: OperationsDeadline[];
  employees: OperationsEmployee[];
}) {
  return (
    <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_5px_20px_rgba(21,36,58,0.035)] sm:p-6">
      <div className="flex items-center gap-2">
        <span className="grid size-8 place-items-center rounded-lg bg-[#fff2d9] text-[#b3781f]">
          <CalendarClock size={16} />
        </span>
        <h2 className="font-display text-[16px] font-bold text-[#152239]">
          Upcoming deadlines
        </h2>
      </div>
      <p className="mt-2 text-[11px] text-slate-400">
        Live deadlines sorted by their backend due time.
      </p>
      {deadlines.length ? (
        <div className="mt-4 space-y-2">
          {deadlines.slice(0, 5).map((deadline) => (
            <div
              key={deadline.id}
              className="rounded-xl border border-slate-100 bg-[#f8fafc] p-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-[11px] font-bold text-slate-700">
                    {deadline.title || "Untitled deadline"}
                  </p>
                  <p className="mt-1 text-[10px] text-slate-400">
                    {displayEmployeeName(employees, deadline.owner_employee_id)}{" "}
                    · {formatLiveDate(deadline.due_at)}
                  </p>
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2 py-1 text-[10px] font-bold",
                    statusClass(deadline.status),
                  )}
                >
                  {deadline.status || "Status not provided"}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between gap-3 text-[10px] text-slate-400">
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 font-bold",
                    priorityClass(deadline.priority),
                  )}
                >
                  {deadline.priority || "Priority not provided"}
                </span>
                {deadline.linked_task_id || deadline.linked_ticket_id ? (
                  <span>Linked operational record</span>
                ) : (
                  <span>No linked record</span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-4">
          <StateMessage>No upcoming deadlines are available.</StateMessage>
        </div>
      )}
    </article>
  );
}

type TicketDraft = {
  title: string;
  category: string;
  priority: string;
  reportedBy: string;
  assignedTo: string;
  departmentId: string;
  dueDate: string;
  description: string;
};

export default function Operations() {
  const dashboard = useOperationsDashboard();
  const employeeState = useCurrentEmployee();
  const ticketActions = useOperationsTicketActions();
  const [showAdd, setShowAdd] = useState(false);
  const [filter, setFilter] = useState("All");
  const [draft, setDraft] = useState<TicketDraft>({
    title: "",
    category: "",
    priority: "",
    reportedBy: "",
    assignedTo: "",
    departmentId: "",
    dueDate: "",
    description: "",
  });
  const data = dashboard.data;
  const summary = buildOperationsSummary(data);
  const departmentWorkload = buildDepartmentWorkload(data);
  const employeeWorkload = buildEmployeeWorkload(data);
  const kpiWorkload = buildKpiWorkload(data);
  const ticketStatuses = useMemo(() => {
    const statuses = new Set(
      data?.tickets.map((ticket) => ticket.status) ?? [],
    );
    return [
      "All",
      ...[
        "Open",
        "Assigned",
        "In progress",
        "Pending",
        "Completed",
        "Closed",
      ].filter((status) => statuses.has(status)),
      ...[...statuses].filter(
        (status) =>
          ![
            "Open",
            "Assigned",
            "In progress",
            "Pending",
            "Completed",
            "Closed",
          ].includes(status),
      ),
    ];
  }, [data?.tickets]);
  const filteredTickets = (data?.tickets ?? []).filter(
    (ticket) => filter === "All" || ticket.status === filter,
  );
  const activeEmployees = (data?.employees ?? []).filter(
    (employee) => employee.employee_status.trim().toLowerCase() === "active",
  );
  const updateDraft = (key: keyof TicketDraft, value: string) =>
    setDraft((current) => ({ ...current, [key]: value }));
  const submitTicket = async (event: React.FormEvent) => {
    event.preventDefault();
    if (
      !draft.title.trim() ||
      !draft.category.trim() ||
      !draft.priority.trim() ||
      !draft.description.trim()
    )
      return;
    try {
      await ticketActions.createTicket.mutateAsync({
        title: draft.title.trim(),
        category: draft.category.trim(),
        priority: draft.priority.trim(),
        reportedBy: draft.reportedBy || employeeState.employee?.id || null,
        assignedTo: draft.assignedTo || null,
        departmentId: draft.departmentId || null,
        dueDate: draft.dueDate || null,
        description: draft.description.trim(),
      });
      setDraft({
        title: "",
        category: "",
        priority: "",
        reportedBy: "",
        assignedTo: "",
        departmentId: "",
        dueDate: "",
        description: "",
      });
      setShowAdd(false);
    } catch {
      return;
    }
  };
  const activeTasks = (data?.tasks ?? [])
    .filter((task) => !isResolvedStatus(task.status) && !task.completed_at)
    .sort((left, right) =>
      (left.due_date ?? "9999").localeCompare(right.due_date ?? "9999"),
    );
  const upcomingDeadlines = (data?.deadlines ?? [])
    .filter((deadline) => !isResolvedStatus(deadline.status))
    .sort((left, right) => left.due_at.localeCompare(right.due_at));

  return (
    <AppShell>
      <div className="mx-auto max-w-[1440px] px-5 pb-12 pt-8 sm:px-8 xl:px-10">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <div className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.17em] text-[#d4784f]">
              <LifeBuoy size={13} /> Operations & accountability
            </div>
            <h1 className="font-display text-[32px] font-bold tracking-[-0.06em] text-[#152239] sm:text-[39px]">
              Make every piece of work accountable.
            </h1>
            <p className="mt-2 max-w-[700px] text-[13px] leading-6 text-slate-500">
              Live operational work from the authenticated organisation, with
              tasks, tickets, deadlines and ownership kept separate and
              traceable.
            </p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="inline-flex items-center gap-2 self-start rounded-xl bg-[#182842] px-3.5 py-2.5 text-[11px] font-bold text-white shadow-[0_5px_12px_rgba(20,35,58,.15)] hover:bg-[#233958] md:self-auto"
          >
            <Ticket size={15} /> Log a ticket
          </button>
        </div>

        {showAdd && (
          <form
            onSubmit={submitTicket}
            className="mt-5 rounded-2xl border border-[#bfe9da] bg-[#f2fcf8] p-5 sm:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="grid size-8 place-items-center rounded-lg bg-white text-[#168465]">
                    <Ticket size={16} />
                  </span>
                  <h2 className="font-display text-[16px] font-bold text-[#152239]">
                    Log company ticket
                  </h2>
                </div>
                <p className="mt-2 text-[11px] text-slate-500">
                  Create a live ticket using the verified operational fields.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAdd(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-white"
                aria-label="Close ticket form"
              >
                Close
              </button>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <label className="text-[10px] font-bold text-slate-500 sm:col-span-2">
                Title
                <input
                  required
                  value={draft.title}
                  onChange={(event) => updateDraft("title", event.target.value)}
                  className="form-input"
                  placeholder="What needs to happen?"
                />
              </label>
              <label className="text-[10px] font-bold text-slate-500">
                Category
                <input
                  required
                  value={draft.category}
                  onChange={(event) =>
                    updateDraft("category", event.target.value)
                  }
                  className="form-input"
                  placeholder="Operational category"
                />
              </label>
              <label className="text-[10px] font-bold text-slate-500">
                Priority
                <input
                  required
                  value={draft.priority}
                  onChange={(event) =>
                    updateDraft("priority", event.target.value)
                  }
                  className="form-input"
                  placeholder="Backend priority"
                />
              </label>
              <label className="text-[10px] font-bold text-slate-500">
                Reported by
                <select
                  value={draft.reportedBy}
                  onChange={(event) =>
                    updateDraft("reportedBy", event.target.value)
                  }
                  className="form-input"
                >
                  <option value="">Current employee</option>
                  {activeEmployees.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {`${employee.first_name} ${employee.last_name}`.trim()}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-[10px] font-bold text-slate-500">
                Assignee
                <select
                  value={draft.assignedTo}
                  onChange={(event) =>
                    updateDraft("assignedTo", event.target.value)
                  }
                  className="form-input"
                >
                  <option value="">Unassigned</option>
                  {activeEmployees.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {`${employee.first_name} ${employee.last_name}`.trim()}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-[10px] font-bold text-slate-500">
                Department
                <select
                  value={draft.departmentId}
                  onChange={(event) =>
                    updateDraft("departmentId", event.target.value)
                  }
                  className="form-input"
                >
                  <option value="">No department</option>
                  {(data?.departments ?? [])
                    .filter((department) => department.active)
                    .map((department) => (
                      <option key={department.id} value={department.id}>
                        {department.name}
                      </option>
                    ))}
                </select>
              </label>
              <label className="text-[10px] font-bold text-slate-500">
                Due date
                <input
                  type="date"
                  value={draft.dueDate}
                  onChange={(event) =>
                    updateDraft("dueDate", event.target.value)
                  }
                  className="form-input"
                />
              </label>
              <label className="text-[10px] font-bold text-slate-500 sm:col-span-2 lg:col-span-4">
                Description
                <textarea
                  required
                  value={draft.description}
                  onChange={(event) =>
                    updateDraft("description", event.target.value)
                  }
                  className="form-input min-h-20 resize-y"
                  placeholder="Describe the operational work."
                />
              </label>
            </div>
            {ticketActions.createTicket.isError && (
              <div className="mt-4">
                <StateMessage tone="error">
                  The ticket could not be created. Check the connection and try
                  again.
                </StateMessage>
              </div>
            )}
            <div className="mt-4 flex justify-end">
              <button
                disabled={ticketActions.createTicket.isPending}
                className="rounded-xl bg-[#168465] px-4 py-2.5 text-[11px] font-bold text-white hover:bg-[#126b53] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {ticketActions.createTicket.isPending
                  ? "Creating..."
                  : "Create ticket"}
              </button>
            </div>
          </form>
        )}

        <WorkState
          pending={dashboard.isPending}
          error={dashboard.isError}
          empty={!data}
        >
          No live operational data is available.
        </WorkState>

        {data && !dashboard.isError && (
          <>
            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              <Metric
                label="Open work"
                value={String(
                  summary.activeTaskCount +
                    summary.openTicketCount +
                    summary.activeDeadlineCount,
                )}
                detail={`${summary.overdueTaskCount + summary.overdueTicketCount + summary.overdueDeadlineCount} overdue`}
                tone={
                  summary.overdueTaskCount +
                  summary.overdueTicketCount +
                  summary.overdueDeadlineCount
                    ? "red"
                    : "mint"
                }
                icon={Ticket}
              />
              <Metric
                label="Assigned"
                value={String(summary.assignedWorkCount)}
                detail="Live task, ticket and deadline owners"
                tone="navy"
                icon={Users}
              />
              <Metric
                label="KPI-linked work"
                value={String(summary.kpiLinkedWorkCount)}
                detail="Tasks and tickets with KPI references"
                tone="amber"
                icon={Link2}
              />
            </div>

            <section className="mt-5 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_5px_20px_rgba(21,36,58,0.035)] sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="grid size-8 place-items-center rounded-lg bg-[#fff1e9] text-[#d4784f]">
                      <Clock3 size={16} />
                    </span>
                    <h2 className="font-display text-[16px] font-bold text-[#152239]">
                      Operational status
                    </h2>
                  </div>
                  <p className="mt-2 text-[11px] text-slate-400">
                    Counts are derived from live task, ticket and deadline
                    records.
                  </p>
                </div>
                <span className="rounded-full bg-[#e8f8f2] px-2.5 py-1 text-[10px] font-bold text-[#168465]">
                  {summary.alertCount} active alerts
                </span>
              </div>
              <WorkBreakdown summary={summary} />
            </section>

            <div className="mt-5 grid gap-5 xl:grid-cols-2">
              <DepartmentWorkload rows={departmentWorkload} />
              <EmployeeWorkload rows={employeeWorkload} />
            </div>

            <div className="mt-5 grid gap-5 xl:grid-cols-2">
              <TaskList tasks={activeTasks} employees={data.employees} />
              <DeadlineList
                deadlines={upcomingDeadlines}
                employees={data.employees}
              />
            </div>

            <div className="mt-5">
              <KpiWorkload rows={kpiWorkload} />
            </div>

            <div className="mt-5">
              <AlertList alerts={data.alerts} />
            </div>

            <section className="mt-5 rounded-2xl border border-slate-200/80 bg-white shadow-[0_5px_20px_rgba(21,36,58,0.035)]">
              <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="grid size-8 place-items-center rounded-lg bg-[#fff1e9] text-[#d4784f]">
                      <Ticket size={16} />
                    </span>
                    <h2 className="font-display text-[16px] font-bold text-[#152239]">
                      Central ticket engine
                    </h2>
                  </div>
                  <p className="mt-2 text-[11px] text-slate-400">
                    Live ticket records with backend status, ownership and due
                    dates.
                  </p>
                </div>
                <div className="flex flex-wrap gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1">
                  {ticketStatuses.map((status) => (
                    <button
                      type="button"
                      key={status}
                      onClick={() => setFilter(status)}
                      className={cn(
                        "rounded-md px-2.5 py-1.5 text-[10px] font-bold",
                        filter === status
                          ? "bg-white text-[#168465] shadow-sm"
                          : "text-slate-400",
                      )}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-left">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] uppercase tracking-[0.12em] text-slate-400">
                      <th className="px-5 py-3 font-bold sm:px-6">Ticket</th>
                      <th className="px-3 py-3 font-bold">Requester</th>
                      <th className="px-3 py-3 font-bold">Owner</th>
                      <th className="px-3 py-3 font-bold">Status</th>
                      <th className="px-3 py-3 font-bold">Due</th>
                      <th className="px-3 py-3 font-bold">Priority</th>
                      <th className="px-3 py-3 font-bold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTickets.map((ticket) => (
                      <tr
                        key={ticket.id}
                        className="border-b border-slate-50 text-[11px] last:border-0"
                      >
                        <td className="px-5 py-4 sm:px-6">
                          <p className="font-bold text-slate-700">
                            {ticket.title || "Untitled ticket"}
                          </p>
                          <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-400">
                            <span>
                              {ticket.ticket_number !== null
                                ? `#${ticket.ticket_number}`
                                : "Ticket reference not provided"}
                            </span>
                            {ticket.category ? (
                              <span>· {ticket.category}</span>
                            ) : null}
                          </div>
                        </td>
                        <td className="px-3 py-4 text-slate-500">
                          {displayEmployeeName(
                            data.employees,
                            ticket.reported_by,
                          )}
                        </td>
                        <td className="px-3 py-4 text-slate-500">
                          {displayEmployeeName(
                            data.employees,
                            ticket.assigned_to,
                          )}
                        </td>
                        <td className="px-3 py-4">
                          <select
                            value={ticket.status}
                            onChange={(event) =>
                              ticketActions.updateTicket.mutate({
                                id: ticket.id,
                                status: event.target.value,
                              })
                            }
                            className={cn(
                              "rounded-full border-0 px-2 py-1 text-[10px] font-bold outline-none",
                              statusClass(ticket.status),
                            )}
                          >
                            {ticketStatuses
                              .filter((status) => status !== "All")
                              .map((status) => (
                                <option key={status} value={status}>
                                  {status}
                                </option>
                              ))}
                          </select>
                        </td>
                        <td className="px-3 py-4 text-slate-500">
                          <span className="inline-flex items-center gap-1">
                            <Clock3 size={12} />
                            {formatLiveDate(ticket.due_date)}
                            {isTicketOverdue(ticket) ? (
                              <ArrowDownRight
                                size={12}
                                className="text-[#bd504d]"
                              />
                            ) : null}
                          </span>
                        </td>
                        <td className="px-3 py-4">
                          <span
                            className={cn(
                              "rounded-full px-2 py-1 text-[10px] font-bold",
                              priorityClass(ticket.priority),
                            )}
                          >
                            {ticket.priority || "Priority not provided"}
                          </span>
                        </td>
                        <td className="px-3 py-4">
                          <button
                            type="button"
                            onClick={() =>
                              ticketActions.deleteTicket.mutate(ticket.id)
                            }
                            disabled={ticketActions.deleteTicket.isPending}
                            className="rounded-lg p-2 text-slate-400 hover:bg-[#fff0ee] hover:text-[#bd504d] disabled:cursor-not-allowed disabled:opacity-50"
                            aria-label={`Delete ${ticket.title}`}
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {(ticketActions.updateTicket.isError ||
                ticketActions.deleteTicket.isError) && (
                <div className="p-5">
                  <StateMessage tone="error">
                    The ticket change could not be saved. Check the connection
                    and try again.
                  </StateMessage>
                </div>
              )}
              {!filteredTickets.length && (
                <p className="p-8 text-center text-[11px] text-slate-400">
                  No live tickets match this filter.
                </p>
              )}
            </section>
          </>
        )}

        <footer className="mt-8 flex flex-col justify-between gap-2 border-t border-slate-200/70 pt-5 text-[10px] text-slate-400 sm:flex-row">
          <span>
            MedMap Operating System · Supabase-backed operations centre
          </span>
          <span>Live work → Ownership → Status → Action</span>
        </footer>
      </div>
    </AppShell>
  );
}
