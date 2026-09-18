import { useQuery } from "@tanstack/react-query";
import { useCurrentOrganisation } from "./supabase-identity";
import { useSupabaseAuth } from "./supabase-auth";
import { getSupabaseClient } from "./supabase";

export type BackendRecord = Record<string, unknown>;

export const executiveTables = {
  employees: "employees",
  departments: "departments",
  companyAlerts: "company_alerts",
  deadlines: "deadlines",
  tasks: "tasks",
  tickets: "tickets",
  kpis: "kpis",
  kpiPeriods: "kpi_periods",
  kpiTargets: "kpi_targets",
  kpiResults: "kpi_results",
  revenue: "revenue",
  expenses: "expenses",
  financialPeriods: "financial_periods",
  doctorAcquisition: "doctor_acquisition",
  ambassadors: "ambassadors",
  salesLeads: "sales_leads",
  customerCases: "customer_cases",
  engineeringProjects: "engineering_projects",
  securityFindings: "security_findings",
  securityIncidents: "security_incidents",
  securityRemediations: "security_remediations",
  risks: "risks",
} as const;

type ExecutiveTable = (typeof executiveTables)[keyof typeof executiveTables];
export type ExecutiveGroupData = Partial<
  Record<ExecutiveTable, BackendRecord[]>
>;

type ExecutiveQueryState = {
  data?: ExecutiveGroupData;
  isPending: boolean;
  isError: boolean;
  error: Error | null;
};

async function fetchTables(
  tables: readonly ExecutiveTable[],
): Promise<ExecutiveGroupData> {
  const client = getSupabaseClient();
  const entries = await Promise.all(
    tables.map(async (table) => {
      const { data, error } = await client.from(table).select("*");
      if (error) throw error;
      return [table, (data ?? []) as BackendRecord[]] as const;
    }),
  );

  return Object.fromEntries(entries) as ExecutiveGroupData;
}

function useExecutiveGroup(
  scope: string,
  tables: readonly ExecutiveTable[],
): ExecutiveQueryState {
  const { user, loading: authLoading } = useSupabaseAuth();
  const organisationState = useCurrentOrganisation();
  const enabled = Boolean(
    user &&
    !authLoading &&
    !organisationState.isLoading &&
    organisationState.organizationId,
  );

  const query = useQuery({
    queryKey: [
      "executive-dashboard",
      scope,
      user?.id ?? null,
      organisationState.organizationId,
    ],
    enabled,
    queryFn: () => fetchTables(tables),
    staleTime: 30_000,
  });

  return {
    data: query.data,
    isPending: query.isPending,
    isError: query.isError,
    error:
      query.error instanceof Error
        ? query.error
        : query.error
          ? new Error("The dashboard data could not be loaded.")
          : null,
  };
}

export function useExecutiveAlerts() {
  return useExecutiveGroup("alerts", [executiveTables.companyAlerts]);
}

export function useExecutiveSummary() {
  const people = useExecutiveGroup("people", [
    executiveTables.employees,
    executiveTables.departments,
  ]);
  const operations = useExecutiveGroup("operations", [
    executiveTables.deadlines,
    executiveTables.tasks,
    executiveTables.tickets,
  ]);
  const kpis = useExecutiveGroup("kpis", [
    executiveTables.kpis,
    executiveTables.kpiPeriods,
    executiveTables.kpiTargets,
    executiveTables.kpiResults,
  ]);
  const finance = useExecutiveGroup("finance", [
    executiveTables.revenue,
    executiveTables.expenses,
    executiveTables.financialPeriods,
  ]);
  const coverage = useExecutiveGroup("coverage", [
    executiveTables.doctorAcquisition,
    executiveTables.ambassadors,
    executiveTables.salesLeads,
    executiveTables.customerCases,
    executiveTables.engineeringProjects,
    executiveTables.securityFindings,
    executiveTables.securityIncidents,
    executiveTables.securityRemediations,
    executiveTables.risks,
  ]);

  return { people, operations, kpis, finance, coverage };
}

export function rowsFor(
  data: ExecutiveGroupData | undefined,
  table: ExecutiveTable,
) {
  return data?.[table] ?? [];
}

function firstValue(record: BackendRecord, keys: readonly string[]) {
  for (const key of keys) {
    const value = record[key];
    if (value !== null && value !== undefined && value !== "") return value;
  }
  return null;
}

export function readRecordString(
  record: BackendRecord,
  keys: readonly string[],
) {
  const value = firstValue(record, keys);
  if (typeof value === "string" || typeof value === "number")
    return String(value);
  return null;
}

export function readRecordNumber(
  record: BackendRecord,
  keys: readonly string[],
) {
  const value = firstValue(record, keys);
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value.replace(/[,\sR]/g, ""));
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

export function readRecordBoolean(
  record: BackendRecord,
  keys: readonly string[],
) {
  const value = firstValue(record, keys);
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    if (["true", "yes", "current", "active"].includes(value.toLowerCase()))
      return true;
    if (["false", "no", "past", "inactive"].includes(value.toLowerCase()))
      return false;
  }
  return null;
}

export function recordId(record: BackendRecord) {
  return readRecordString(record, ["id", "uuid", "record_id"]);
}

export function recordStatus(record: BackendRecord) {
  return readRecordString(record, [
    "status",
    "state",
    "lifecycle_status",
    "result_status",
  ]);
}

export function recordDate(record: BackendRecord) {
  return readRecordString(record, [
    "due_date",
    "deadline_date",
    "date",
    "scheduled_for",
    "period_end",
    "created_at",
  ]);
}

export function recordTitle(record: BackendRecord, fallback: string) {
  return (
    readRecordString(record, [
      "title",
      "name",
      "subject",
      "metric",
      "description",
      "message",
    ]) ?? fallback
  );
}

export function recordOwner(record: BackendRecord) {
  return readRecordString(record, [
    "owner_name",
    "owner",
    "assignee_name",
    "assignee",
    "assigned_to",
    "responsible_person",
  ]);
}

export function normaliseStatus(status: string | null) {
  return status?.trim().toLowerCase().replace(/[_-]+/g, " ") ?? null;
}

export function isResolvedStatus(status: string | null) {
  return [
    "completed",
    "complete",
    "closed",
    "done",
    "resolved",
    "remediated",
    "cancelled",
    "canceled",
  ].includes(normaliseStatus(status) ?? "");
}

export function isOpenStatus(status: string | null) {
  return status ? !isResolvedStatus(status) : null;
}

export function isOverdue(record: BackendRecord, today = new Date()) {
  const dueDate = recordDate(record);
  if (!dueDate) return false;
  const parsed = new Date(dueDate);
  return (
    !Number.isNaN(parsed.valueOf()) &&
    parsed < today &&
    !isResolvedStatus(recordStatus(record))
  );
}

export function countActiveRecords(
  records: BackendRecord[],
  statusKeys: readonly string[] = ["status", "state", "lifecycle_status"],
) {
  if (!records.length) return { value: 0, supported: true };
  const statusRecords = records
    .map((record) => readRecordString(record, statusKeys))
    .filter((status): status is string => Boolean(status));
  if (!statusRecords.length) return { value: null, supported: false };
  const activeStatuses = new Set([
    "active",
    "current",
    "live",
    "enabled",
    "operational",
  ]);
  return {
    value: statusRecords.filter((status) =>
      activeStatuses.has(normaliseStatus(status) ?? ""),
    ).length,
    supported: true,
  };
}

function relatedRecord(records: BackendRecord[], id: string | null) {
  if (!id) return null;
  return (
    records.find(
      (record) =>
        readRecordString(record, ["kpi_id", "metric_id", "parent_id"]) === id,
    ) ?? null
  );
}

function periodRecord(
  records: BackendRecord[],
  record: BackendRecord,
  id: string | null,
) {
  const periodId = readRecordString(record, [
    "period_id",
    "kpi_period_id",
    "financial_period_id",
  ]);
  if (!periodId) return null;
  return records.find((period) => recordId(period) === periodId) ?? null;
}

export type ExecutiveKpiRow = {
  id: string;
  name: string;
  target: number | null;
  actual: number | null;
  status: string | null;
  period: string | null;
  owner: string | null;
};

export function buildKpiRows(
  data: ExecutiveGroupData | undefined,
): ExecutiveKpiRow[] {
  const kpis = rowsFor(data, executiveTables.kpis);
  const targets = rowsFor(data, executiveTables.kpiTargets);
  const results = rowsFor(data, executiveTables.kpiResults);
  const periods = rowsFor(data, executiveTables.kpiPeriods);

  return kpis.map((record, index) => {
    const id = recordId(record) ?? `kpi-${index}`;
    const targetRecord = relatedRecord(targets, id);
    const resultRecord = relatedRecord(results, id);
    const period =
      periodRecord(periods, record, id) ??
      periodRecord(periods, targetRecord ?? {}, id) ??
      periodRecord(periods, resultRecord ?? {}, id);
    return {
      id,
      name: recordTitle(record, "KPI record"),
      target:
        readRecordNumber(record, ["target", "target_value", "target_amount"]) ??
        readRecordNumber(targetRecord ?? {}, [
          "target",
          "target_value",
          "target_amount",
        ]),
      actual:
        readRecordNumber(record, [
          "actual",
          "actual_value",
          "result",
          "value",
        ]) ??
        readRecordNumber(resultRecord ?? {}, [
          "actual",
          "actual_value",
          "result",
          "value",
        ]),
      status:
        readRecordString(resultRecord ?? {}, [
          "status",
          "state",
          "result_status",
        ]) ?? readRecordString(record, ["status", "state", "result_status"]),
      period:
        readRecordString(period ?? {}, [
          "name",
          "label",
          "period_name",
          "period_type",
        ]) ?? readRecordString(record, ["period", "period_name"]),
      owner:
        readRecordString(record, ["owner_name", "owner", "employee_name"]) ??
        readRecordString(resultRecord ?? {}, [
          "owner_name",
          "owner",
          "employee_name",
        ]),
    };
  });
}

export function currentPeriodId(periods: BackendRecord[]) {
  const current = periods.find(
    (period) =>
      readRecordBoolean(period, ["is_current", "current", "active"]) === true ||
      ["current", "active", "open"].includes(
        normaliseStatus(recordStatus(period)) ?? "",
      ),
  );
  return current ? recordId(current) : null;
}

function periodFilteredRows(rows: BackendRecord[], periods: BackendRecord[]) {
  const id = currentPeriodId(periods);
  if (!id) return rows;
  const linkedRows = rows.filter(
    (row) =>
      readRecordString(row, ["financial_period_id", "period_id"]) !== null,
  );
  return linkedRows.length
    ? linkedRows.filter(
        (row) =>
          readRecordString(row, ["financial_period_id", "period_id"]) === id,
      )
    : rows;
}

function sumKnownAmounts(rows: BackendRecord[]) {
  const values = rows.map((row) =>
    readRecordNumber(row, [
      "amount",
      "amount_zar",
      "total_amount",
      "net_amount",
      "value",
    ]),
  );
  if (rows.length && values.every((value) => value === null)) return null;
  return values.reduce<number>((total, value) => total + (value ?? 0), 0);
}

export type ExecutiveFinanceSummary = {
  revenue: number | null;
  expenses: number | null;
  netPosition: number | null;
  periodLabel: string | null;
  revenueRecords: number;
  expenseRecords: number;
};

export function buildFinanceSummary(
  data: ExecutiveGroupData | undefined,
): ExecutiveFinanceSummary {
  const periods = rowsFor(data, executiveTables.financialPeriods);
  const revenueRows = periodFilteredRows(
    rowsFor(data, executiveTables.revenue),
    periods,
  );
  const expenseRows = periodFilteredRows(
    rowsFor(data, executiveTables.expenses),
    periods,
  );
  const period = periods.find(
    (item) => recordId(item) === currentPeriodId(periods),
  );
  const revenue = sumKnownAmounts(revenueRows);
  const expenses = sumKnownAmounts(expenseRows);
  return {
    revenue,
    expenses,
    netPosition:
      revenue !== null && expenses !== null ? revenue - expenses : null,
    periodLabel: readRecordString(period ?? {}, [
      "name",
      "label",
      "period_name",
      "period_type",
    ]),
    revenueRecords: revenueRows.length,
    expenseRecords: expenseRows.length,
  };
}

export function statusToDisplay(status: string | null) {
  const normalised = normaliseStatus(status);
  if (!normalised) return null;
  if (["healthy", "good", "on track", "ok", "green"].includes(normalised))
    return "healthy" as const;
  if (["critical", "blocked", "red", "failed", "overdue"].includes(normalised))
    return "critical" as const;
  if (
    [
      "attention",
      "at risk",
      "warning",
      "yellow",
      "in progress",
      "open",
      "pending",
    ].includes(normalised)
  )
    return "attention" as const;
  return null;
}
