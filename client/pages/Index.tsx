import { Link } from "react-router-dom";
import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarDays,
  ChevronRight,
  CircleAlert,
  Clock3,
  FileWarning,
  Layers3,
  Plus,
  Sparkles,
  Target,
  UserRound,
  UsersRound,
  WalletCards,
  Wrench,
} from "lucide-react";
import { AppShell } from "@/components/medmap/AppShell";
import { cn } from "@/lib/utils";
import { useCurrentOrganisation } from "@/lib/supabase-identity";
import {
  buildFinanceSummary,
  buildKpiRows,
  formatExpensePaidTypes,
  formatMoneyBuckets,
  isOverdueDate,
  isOverdueTimestamp,
  isResolvedStatus,
  normaliseStatus,
  statusToDisplay,
  useExecutiveAlerts,
  useExecutiveSummary,
  type Task,
  type Ticket,
} from "@/lib/executive-dashboard";

type Status = "healthy" | "attention" | "critical";
type WorkRecord = Task | Ticket;

type Metric = {
  label: string;
  value: string;
  change: string;
  helper: string;
  status: Status;
  icon: React.ElementType;
};

function StatusPill({ status, label }: { status: Status; label?: string }) {
  const content =
    label ??
    (status === "healthy"
      ? "Healthy"
      : status === "attention"
        ? "Needs action"
        : "Critical");
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold",
        status === "healthy" && "bg-[#e4f8f0] text-[#15805f]",
        status === "attention" && "bg-[#fff2d9] text-[#9a6419]",
        status === "critical" && "bg-[#ffe5e3] text-[#bd504d]",
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          status === "healthy" && "bg-[#25a879]",
          status === "attention" && "bg-[#e0a03a]",
          status === "critical" && "bg-[#da6560]",
        )}
      />
      {content}
    </span>
  );
}

function MetricCard({ metric }: { metric: Metric }) {
  const Icon = metric.icon;
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_5px_20px_rgba(21,36,58,0.035)]">
      <div className="flex items-start justify-between">
        <span
          className={cn(
            "grid size-9 place-items-center rounded-xl",
            metric.status === "healthy"
              ? "bg-[#e8f8f2] text-[#1b9975]"
              : metric.status === "critical"
                ? "bg-[#ffe9e6] text-[#bf5b56]"
                : "bg-[#fff3dd] text-[#b87720]",
          )}
        >
          <Icon size={17} />
        </span>
        <span
          className={cn(
            "size-1.5 rounded-full",
            metric.status === "healthy"
              ? "bg-[#36ac87]"
              : metric.status === "critical"
                ? "bg-[#da6560]"
                : "bg-[#e0a03a]",
          )}
        />
      </div>
      <p className="mt-4 text-[12px] font-medium text-slate-500">
        {metric.label}
      </p>
      <div className="mt-1 flex items-end justify-between gap-2">
        <p className="font-display text-[27px] font-bold tracking-[-0.05em] text-[#152239]">
          {metric.value}
        </p>
        <span
          className={cn(
            "mb-1 flex items-center gap-0.5 text-right text-[10px] font-bold",
            metric.status === "healthy"
              ? "text-[#209b76]"
              : metric.status === "critical"
                ? "text-[#bd504d]"
                : "text-[#b3781f]",
          )}
        >
          {metric.status === "healthy" ? (
            <ArrowUpRight size={13} />
          ) : (
            <ArrowDownRight size={13} />
          )}
          {metric.change}
        </span>
      </div>
      <p className="mt-1 text-[10px] text-slate-400">{metric.helper}</p>
    </div>
  );
}

function StethoscopeIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M6 3v5a6 6 0 0 0 12 0V3" />
      <path d="M3 3h6M15 3h6" />
      <path d="M18 14a3 3 0 1 0 3 3v-1" />
      <path d="M18 17v3a2 2 0 0 1-2 2h-3" />
    </svg>
  );
}

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

function ErrorState({
  message = "This section could not be loaded.",
}: {
  message?: string;
}) {
  return (
    <p className="rounded-xl border border-[#f0cdca] bg-[#fff8f7] p-3 text-[11px] leading-5 text-[#a34f4b]">
      {message} Try again after the connection is available.
    </p>
  );
}

function LoadingState() {
  return (
    <p className="rounded-xl bg-[#f7f9fb] p-3 text-[11px] text-slate-400">
      Loading live data...
    </p>
  );
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-xl bg-[#f7f9fb] p-3 text-[11px] text-slate-400">
      {children}
    </p>
  );
}

function RecordState({
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
  if (pending) return <LoadingState />;
  if (error) return <ErrorState />;
  if (empty) return <EmptyState>No live records are available.</EmptyState>;
  return <>{children}</>;
}

function ActiveCount({
  records,
  label,
}: {
  records: BackendRecord[];
  label: string;
}) {
  const result = countActiveRecords(records);
  if (!result.supported)
    return {
      value: "Awaiting live data",
      change: "status not provided",
      status: "attention" as Status,
      helper: `${label} · active status not available`,
    };
  return {
    value: String(result.value),
    change: result.value ? "active records" : "none recorded",
    status: result.value ? ("healthy" as Status) : ("attention" as Status),
    helper: `${label} · live backend records`,
  };
}

function WorkSummary({
  records,
  label,
}: {
  records: BackendRecord[];
  label: string;
}) {
  const withStatus = records.map((record) => ({
    record,
    status: recordStatus(record),
  }));
  const hasUnsupportedStatus = records.some((item) => !item.status);
  const open = withStatus.filter(
    ({ status }) => isOpenStatus(status) === true,
  ).length;
  const inProgress = withStatus.filter(({ status }) =>
    ["in progress", "assigned", "started"].includes(
      normaliseStatus(status) ?? "",
    ),
  ).length;
  const completed = withStatus.filter(({ status }) =>
    isResolvedStatus(status),
  ).length;
  const overdue = records.filter((record) => isOverdue(record)).length;
  return {
    label,
    supported: !hasUnsupportedStatus,
    open,
    inProgress,
    completed,
    overdue,
  };
}

export default function Index() {
  const organisationState = useCurrentOrganisation();
  const { people, operations, kpis, finance, coverage } = useExecutiveSummary();
  const alerts = useExecutiveAlerts();
  const organisationName =
    readRecordString(organisationState.organization ?? {}, [
      "name",
      "legal_name",
      "organization_name",
    ]) ?? "Authenticated organisation";

  const employeeRows = rowsFor(people.data, "employees");
  const departmentRows = rowsFor(people.data, "departments");
  const activeDoctors = ActiveCount({
    records: rowsFor(coverage.data, "doctor_acquisition"),
    label: "Doctor acquisition",
  });
  const activeAmbassadors = ActiveCount({
    records: rowsFor(coverage.data, "ambassadors"),
    label: "Ambassador programme",
  });
  const financeSummary = buildFinanceSummary(finance.data);
  const kpiRows = buildKpiRows(kpis.data);
  const kpiResults = kpiRows.filter((row) => row.actual !== null);
  const deadlineRows = rowsFor(operations.data, "deadlines")
    .filter((record) => !isResolvedStatus(recordStatus(record)))
    .sort((a, b) => (recordDate(a) ?? "").localeCompare(recordDate(b) ?? ""));
  const taskRows = rowsFor(operations.data, "tasks");
  const ticketRows = rowsFor(operations.data, "tickets");
  const workRows = [...taskRows, ...ticketRows];
  const workSummary = WorkSummary({
    records: workRows,
    label: "Tasks and tickets",
  });
  const alertRows = rowsFor(alerts.data, "company_alerts").filter(
    (record) => !isResolvedStatus(recordStatus(record)),
  );
  const coverageCards = [
    ["Operations", taskRows.length + ticketRows.length + deadlineRows.length],
    ["Doctor Acquisition", rowsFor(coverage.data, "doctor_acquisition").length],
    ["Ambassadors", rowsFor(coverage.data, "ambassadors").length],
    ["Sales", rowsFor(coverage.data, "sales_leads").length],
    ["Customer Operations", rowsFor(coverage.data, "customer_cases").length],
    ["Product", 0],
    ["Engineering", rowsFor(coverage.data, "engineering_projects").length],
    [
      "Technology / Security",
      rowsFor(coverage.data, "security_findings").length +
        rowsFor(coverage.data, "security_incidents").length +
        rowsFor(coverage.data, "security_remediations").length,
    ],
    ["Finance", financeSummary.revenueRecords + financeSummary.expenseRecords],
    ["Governance / Risk", rowsFor(coverage.data, "risks").length],
  ] as const;

  const openWorkValue = workSummary.supported
    ? String(workSummary.open)
    : "Awaiting live data";
  const metrics: Metric[] = [
    {
      label: "Recorded revenue",
      value: financeSummary.revenueRecords
        ? formatZAR(financeSummary.revenue ?? 0)
        : "Awaiting live data",
      change: financeSummary.revenueRecords ? "recorded" : "no records",
      helper: financeSummary.periodLabel
        ? `Finance · ${financeSummary.periodLabel}`
        : "Finance · current backend records",
      status: financeSummary.revenueRecords ? "healthy" : "attention",
      icon: WalletCards,
    },
    {
      label: "Active doctors",
      value: activeDoctors.value,
      change: activeDoctors.change,
      helper: activeDoctors.helper,
      status: activeDoctors.status,
      icon: StethoscopeIcon,
    },
    {
      label: "Active ambassadors",
      value: activeAmbassadors.value,
      change: activeAmbassadors.change,
      helper: activeAmbassadors.helper,
      status: activeAmbassadors.status,
      icon: UserRound,
    },
    {
      label: "Active patients",
      value: "Awaiting live data",
      change: "source not connected",
      helper: "No patient table is part of the verified Phase 3A source list",
      status: "attention",
      icon: UsersRound,
    },
    {
      label: "Open work",
      value: openWorkValue,
      change: workSummary.supported
        ? `${workSummary.overdue} overdue`
        : "status not provided",
      helper: "Tasks and tickets · live backend records",
      status:
        workSummary.supported && workSummary.overdue
          ? "critical"
          : workSummary.supported
            ? "attention"
            : "attention",
      icon: Layers3,
    },
  ];

  return (
    <AppShell>
      <div className="mx-auto max-w-[1440px] px-5 pb-12 pt-8 sm:px-8 xl:px-10">
        <section id="overview" className="scroll-mt-24">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <div className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.17em] text-[#1b9975]">
                <Sparkles size={13} /> Executive command centre
              </div>
              <h1 className="font-display text-[32px] font-bold tracking-[-0.06em] text-[#152239] sm:text-[39px]">
                Live operating visibility for {organisationName}.
              </h1>
              <p className="mt-2 max-w-[760px] text-[13px] leading-6 text-slate-500">
                This view reads the authenticated organisation’s records through
                Supabase RLS. Empty or unsupported backend areas remain explicit
                instead of being replaced with demo performance.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden text-[11px] text-slate-400 sm:block">
                Live Supabase view · RLS enforced
              </span>
              <Link
                to="/meetings"
                className="inline-flex items-center gap-2 rounded-xl bg-[#182842] px-3.5 py-2.5 text-[11px] font-bold text-white shadow-[0_5px_12px_rgba(20,35,58,.15)] transition hover:bg-[#233958]"
              >
                <Plus size={15} /> Open operating cadence
              </Link>
            </div>
          </div>
          <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {metrics.map((metric) => (
              <MetricCard key={metric.label} metric={metric} />
            ))}
          </div>
        </section>

        <section className="mt-5 rounded-2xl border border-[#c9d7ec] bg-[#f7faff] p-5 shadow-[0_5px_20px_rgba(21,36,58,0.035)] sm:p-6">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
            <div>
              <div className="flex items-center gap-2">
                <span className="grid size-8 place-items-center rounded-lg bg-[#eaf3ff] text-[#4a87c9]">
                  <Target size={16} />
                </span>
                <h2 className="font-display text-[16px] font-bold text-[#152239]">
                  Organisation and people status
                </h2>
              </div>
              <p className="mt-2 text-[11px] text-slate-500">
                Verified organisation-scoped records available to the
                authenticated command centre.
              </p>
            </div>
            <StatusPill
              status={
                people.isError
                  ? "critical"
                  : people.isPending
                    ? "attention"
                    : "healthy"
              }
              label={
                people.isError
                  ? "Data unavailable"
                  : people.isPending
                    ? "Loading"
                    : "RLS connected"
              }
            />
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <div className="rounded-xl bg-white p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                Organisation context
              </p>
              <p className="mt-2 font-display text-[22px] font-bold text-[#152239]">
                {organisationName}
              </p>
              <p className="mt-2 text-[11px] leading-5 text-slate-500">
                Resolved through the authenticated employee relationship.
              </p>
            </div>
            <div className="rounded-xl bg-white p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                Active employees
              </p>
              <p className="mt-2 font-display text-[25px] font-bold text-[#152239]">
                {people.isPending
                  ? "Loading..."
                  : people.isError
                    ? "Unavailable"
                    : String(
                        employeeRows.filter(
                          (employee) =>
                            normaliseStatus(
                              readRecordString(employee, [
                                "employee_status",
                                "status",
                                "state",
                              ]),
                            ) === "active",
                        ).length,
                      )}
              </p>
              <p className="mt-2 text-[11px] leading-5 text-slate-500">
                Derived from employee status values returned by the backend.
              </p>
            </div>
            <div className="rounded-xl bg-white p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                Departments
              </p>
              <p className="mt-2 font-display text-[25px] font-bold text-[#152239]">
                {people.isPending
                  ? "Loading..."
                  : people.isError
                    ? "Unavailable"
                    : departmentRows.length
                      ? String(departmentRows.length)
                      : "Awaiting live data"}
              </p>
              <p className="mt-2 text-[11px] leading-5 text-slate-500">
                Department records visible through the current organisation
                scope.
              </p>
            </div>
          </div>
        </section>

        <section
          id="governance"
          className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,.85fr)]"
        >
          <article
            id="technology"
            className="scroll-mt-24 rounded-2xl border border-[#f0cdca] bg-[#fff8f7] p-5 shadow-[0_5px_20px_rgba(21,36,58,0.035)] sm:p-6"
          >
            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
              <div>
                <div className="flex items-center gap-2">
                  <span className="grid size-8 place-items-center rounded-lg bg-[#ffe5e3] text-[#bd504d]">
                    <Wrench size={16} />
                  </span>
                  <h2 className="font-display text-[16px] font-bold text-[#152239]">
                    Technology and security coverage
                  </h2>
                </div>
                <p className="mt-2 text-[11px] text-slate-500">
                  Only engineering and security records returned by the backend
                  are shown.
                </p>
              </div>
              <Link
                to="/technology"
                className="inline-flex items-center gap-1 text-[11px] font-bold text-[#bd504d]"
              >
                Open technology module <ChevronRight size={14} />
              </Link>
            </div>
            <div className="mt-4 grid gap-2 md:grid-cols-2">
              <RecordState
                pending={coverage.isPending}
                error={coverage.isError}
                empty={
                  !coverage.isPending &&
                  !coverage.isError &&
                  coverageCards
                    .filter(
                      ([label]) =>
                        label === "Engineering" ||
                        label === "Technology / Security",
                    )
                    .every(([, count]) => count === 0)
                }
              >
                {coverageCards
                  .filter(
                    ([label]) =>
                      label === "Engineering" ||
                      label === "Technology / Security",
                  )
                  .map(([label, count]) => (
                    <div key={label} className="rounded-xl bg-white p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[11px] font-bold text-slate-700">
                            {label}
                          </p>
                          <p className="mt-1 text-[10px] leading-5 text-slate-400">
                            {count
                              ? `${count} live record${count === 1 ? "" : "s"} visible`
                              : "Awaiting live data"}
                          </p>
                        </div>
                        <StatusPill
                          status={count ? "attention" : "attention"}
                          label={count ? "Live records" : "Awaiting data"}
                        />
                      </div>
                    </div>
                  ))}
              </RecordState>
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_5px_20px_rgba(21,36,58,0.035)] sm:p-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="grid size-8 place-items-center rounded-lg bg-[#fff2d9] text-[#b3781f]">
                    <CircleAlert size={16} />
                  </span>
                  <h2 className="font-display text-[16px] font-bold text-[#152239]">
                    Live alert centre
                  </h2>
                </div>
                <p className="mt-2 text-[11px] text-slate-400">
                  Company alerts returned through the authenticated data path.
                </p>
              </div>
              <span className="rounded-full bg-[#fff2d9] px-2.5 py-1 text-[10px] font-bold text-[#9a6419]">
                {alerts.isPending
                  ? "..."
                  : alerts.isError
                    ? "!"
                    : alertRows.length}
              </span>
            </div>
            <div className="mt-4 space-y-2">
              <RecordState
                pending={alerts.isPending}
                error={alerts.isError}
                empty={
                  !alerts.isPending && !alerts.isError && !alertRows.length
                }
              >
                {alertRows.slice(0, 4).map((alert, index) => (
                  <div
                    key={recordId(alert) ?? `alert-${index}`}
                    className="rounded-xl border border-slate-100 bg-[#f8fafc] p-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-[11px] font-bold text-slate-700">
                        {recordTitle(alert, "Company alert")}
                      </p>
                      <StatusPill
                        status={
                          statusToDisplay(recordStatus(alert)) ?? "attention"
                        }
                        label={recordStatus(alert) ?? "Alert"}
                      />
                    </div>
                    <p className="mt-1 text-[10px] leading-5 text-slate-400">
                      {readRecordString(alert, [
                        "message",
                        "description",
                        "details",
                      ]) ?? "No alert detail provided."}
                    </p>
                  </div>
                ))}
              </RecordState>
            </div>
          </article>
        </section>

        <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_5px_20px_rgba(21,36,58,0.035)] sm:p-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="grid size-8 place-items-center rounded-lg bg-[#fff2d9] text-[#b3781f]">
                    <FileWarning size={16} />
                  </span>
                  <h2 className="font-display text-[16px] font-bold text-[#152239]">
                    Deadlines and work queue
                  </h2>
                </div>
                <p className="mt-2 text-[11px] text-slate-400">
                  Live deadlines, tasks and tickets. Nothing is substituted from
                  the local demo store.
                </p>
              </div>
              <span className="rounded-full bg-[#fff2d9] px-2.5 py-1 text-[10px] font-bold text-[#9a6419]">
                {operations.isPending
                  ? "..."
                  : operations.isError
                    ? "!"
                    : workSummary.supported
                      ? `${workSummary.open} open`
                      : "Status unavailable"}
              </span>
            </div>
            <RecordState
              pending={operations.isPending}
              error={operations.isError}
              empty={
                !operations.isPending &&
                !operations.isError &&
                !deadlineRows.length &&
                !workRows.length
              }
            >
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-[#f7f9fb] p-3.5">
                  <p className="text-[10px] font-medium text-slate-400">
                    Tasks and tickets
                  </p>
                  <p className="mt-2 font-display text-[22px] font-bold text-[#152239]">
                    {workSummary.supported
                      ? workSummary.open
                      : "Awaiting live data"}
                  </p>
                  <p className="mt-1 text-[10px] text-slate-400">
                    {workSummary.supported
                      ? `${workSummary.inProgress} in progress · ${workSummary.completed} completed · ${workSummary.overdue} overdue`
                      : "Status fields are not available on all returned records."}
                  </p>
                </div>
                <div className="rounded-xl bg-[#f7f9fb] p-3.5">
                  <p className="text-[10px] font-medium text-slate-400">
                    Upcoming deadlines
                  </p>
                  <p className="mt-2 font-display text-[22px] font-bold text-[#152239]">
                    {deadlineRows.length}
                  </p>
                  <p className="mt-1 text-[10px] text-slate-400">
                    {deadlineRows.length
                      ? "Open deadline records"
                      : "No upcoming deadlines"}
                  </p>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                {deadlineRows.slice(0, 4).map((deadline, index) => (
                  <div
                    key={recordId(deadline) ?? `deadline-${index}`}
                    className="flex items-center gap-3 rounded-xl border border-slate-100 p-3"
                  >
                    <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[#eef4fb] text-[#5488be]">
                      <CalendarDays size={15} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[11px] font-bold text-slate-700">
                        {recordTitle(deadline, "Deadline")}
                      </p>
                      <p className="mt-1 text-[10px] text-slate-400">
                        {formatLiveDate(recordDate(deadline))}
                        {recordOwner(deadline)
                          ? ` · ${recordOwner(deadline)}`
                          : ""}
                      </p>
                    </div>
                    <span className="text-[10px] font-semibold text-slate-500">
                      {recordStatus(deadline) ?? "Status not provided"}
                    </span>
                  </div>
                ))}
              </div>
            </RecordState>
          </article>

          <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_5px_20px_rgba(21,36,58,0.035)] sm:p-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="grid size-8 place-items-center rounded-lg bg-[#eaf3ff] text-[#4a87c9]">
                    <Clock3 size={16} />
                  </span>
                  <h2 className="font-display text-[16px] font-bold text-[#152239]">
                    KPI summary
                  </h2>
                </div>
                <p className="mt-2 text-[11px] text-slate-400">
                  Targets, actuals and statuses only where the KPI relationships
                  provide them.
                </p>
              </div>
              <Link
                to="/kpis"
                className="inline-flex items-center gap-1 text-[11px] font-bold text-[#4a87c9]"
              >
                Open KPIs <ChevronRight size={14} />
              </Link>
            </div>
            <RecordState
              pending={kpis.isPending}
              error={kpis.isError}
              empty={!kpis.isPending && !kpis.isError && !kpiRows.length}
            >
              {kpiResults.length ? (
                <div className="mt-4 space-y-2">
                  {kpiRows.slice(0, 5).map((kpi) => {
                    const displayStatus = statusToDisplay(kpi.status);
                    const variance =
                      kpi.actual !== null && kpi.target !== null
                        ? kpi.actual - kpi.target
                        : null;
                    return (
                      <div
                        key={kpi.id}
                        className="rounded-xl border border-slate-100 p-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-[11px] font-bold text-slate-700">
                              {kpi.name}
                            </p>
                            <p className="mt-1 text-[10px] text-slate-400">
                              {kpi.period ?? "Period not provided"}
                              {kpi.owner ? ` · ${kpi.owner}` : ""}
                            </p>
                          </div>
                          {displayStatus ? (
                            <StatusPill
                              status={displayStatus}
                              label={kpi.status ?? undefined}
                            />
                          ) : (
                            <span className="text-[10px] text-slate-400">
                              Status not provided
                            </span>
                          )}
                        </div>
                        <div className="mt-3 grid grid-cols-3 gap-2 text-[10px]">
                          <span className="rounded-lg bg-[#f7f9fb] p-2 text-slate-500">
                            Target
                            <strong className="mt-1 block text-[12px] text-slate-700">
                              {kpi.target ?? "—"}
                            </strong>
                          </span>
                          <span className="rounded-lg bg-[#f7f9fb] p-2 text-slate-500">
                            Actual
                            <strong className="mt-1 block text-[12px] text-slate-700">
                              {kpi.actual ?? "—"}
                            </strong>
                          </span>
                          <span className="rounded-lg bg-[#f7f9fb] p-2 text-slate-500">
                            Variance
                            <strong className="mt-1 block text-[12px] text-slate-700">
                              {variance ?? "—"}
                            </strong>
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <EmptyState>No KPI results for this period.</EmptyState>
              )}
            </RecordState>
          </article>
        </section>

        <section className="mt-5 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_5px_20px_rgba(21,36,58,0.035)] sm:p-6">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <div className="flex items-center gap-2">
                <span className="grid size-8 place-items-center rounded-lg bg-[#e8f8f2] text-[#1b9975]">
                  <WalletCards size={16} />
                </span>
                <h2 className="font-display text-[16px] font-bold text-[#152239]">
                  Financial reality
                </h2>
              </div>
              <p className="mt-2 text-[11px] text-slate-400">
                Only revenue and expense records returned by the current backend
                period are shown.
              </p>
            </div>
            <Link
              to="/finance"
              className="inline-flex items-center gap-1 text-[11px] font-bold text-[#1c9574]"
            >
              Open financial ledger <ChevronRight size={14} />
            </Link>
          </div>
          <RecordState
            pending={finance.isPending}
            error={finance.isError}
            empty={
              !finance.isPending &&
              !finance.isError &&
              !financeSummary.revenueRecords &&
              !financeSummary.expenseRecords
            }
          >
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <FinanceValue
                label="Recorded revenue"
                value={
                  financeSummary.revenueRecords
                    ? formatZAR(financeSummary.revenue ?? 0)
                    : "Awaiting live data"
                }
              />
              <FinanceValue
                label="Company expenses"
                value={
                  financeSummary.expenseRecords
                    ? formatZAR(financeSummary.expenses ?? 0)
                    : "Awaiting live data"
                }
                tone="negative"
              />
              <FinanceValue
                label="Operating position"
                value={
                  financeSummary.revenueRecords &&
                  financeSummary.expenseRecords &&
                  financeSummary.netPosition !== null
                    ? formatZARWithSign(financeSummary.netPosition)
                    : "Awaiting live data"
                }
                tone="negative"
              />
            </div>
          </RecordState>
        </section>

        <section className="mt-5 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_5px_20px_rgba(21,36,58,0.035)] sm:p-6">
          <div className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-lg bg-[#eef4fb] text-[#5488be]">
              <Layers3 size={16} />
            </span>
            <h2 className="font-display text-[16px] font-bold text-[#152239]">
              Cross-department coverage
            </h2>
          </div>
          <p className="mt-2 text-[11px] text-slate-400">
            A concise view of verified backend records by operating area. It is
            not a replacement for each module’s workflow.
          </p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
            {coverageCards.map(([label, count]) => (
              <div key={label} className="rounded-xl bg-[#f7f9fb] p-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">
                  {label}
                </p>
                <p className="mt-2 font-display text-[20px] font-bold text-[#152239]">
                  {coverage.isPending ||
                  (label === "Operations" && operations.isPending)
                    ? "..."
                    : coverage.isError ||
                        (label === "Operations" && operations.isError)
                      ? "Unavailable"
                      : count
                        ? count
                        : "Awaiting live data"}
                </p>
                <p className="mt-1 text-[10px] text-slate-400">
                  {count ? "Live records visible" : "No verified records"}
                </p>
              </div>
            ))}
          </div>
        </section>

        <footer className="mt-8 flex flex-col justify-between gap-2 border-t border-slate-200/70 pt-5 text-[10px] text-slate-400 sm:flex-row">
          <span>MedMap Operating System · Supabase-backed command centre</span>
          <span>Live data → Evidence → Status → Action</span>
        </footer>
      </div>
    </AppShell>
  );
}

function FinanceValue({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "negative";
}) {
  return (
    <div className="rounded-xl bg-[#f7f9fb] p-3.5">
      <p className="text-[10px] font-medium text-slate-400">{label}</p>
      <p
        className={cn(
          "mt-2 font-display text-[22px] font-bold",
          tone === "negative" ? "text-[#c1514d]" : "text-[#152239]",
        )}
      >
        {value}
      </p>
    </div>
  );
}
