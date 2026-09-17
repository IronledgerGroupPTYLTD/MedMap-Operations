import { createContext, useContext, useMemo, useState } from "react";
import { workbookTransactions } from "./workbook-transactions";

export const ticketTypeOptions = [
  "Customer case",
  "Doctor onboarding",
  "Sales & acquisition",
  "Finance approval",
  "Technology incident",
  "Security assessment",
  "People & performance",
  "General operations",
  "Expense reimbursement",
] as const;

export type TicketType = (typeof ticketTypeOptions)[number];
export type TransactionKind = "revenue" | "expense" | "funding";
export type TransactionStatus = "Paid" | "Payable" | "Committed";

export type Transaction = {
  id: string;
  date: string;
  timestamp?: string;
  description: string;
  kind: TransactionKind;
  category: string;
  amount: number;
  status: TransactionStatus;
  owner: string;
  owedTo?: string;
  source?: string;
  notes: string;
};

export type EmployeeDeliverable = {
  id: string;
  title: string;
  cadence: "Weekly" | "Monthly" | "One-off";
  dueDate: string;
  status: "Not started" | "In progress" | "Done" | "Blocked";
  notes: string;
};

export type OrganizationUnit = {
  id: string;
  name: string;
  kind: "Executive" | "Department" | "Team";
  parentId?: string;
  leader: string;
  description: string;
};

export type KPIStatus = "Not set" | "Healthy" | "Attention" | "Critical";
export type KPIPeriod = "Daily" | "Weekly" | "Monthly" | "Quarterly" | "Annual";
export type KPI = {
  id: string;
  name: string;
  department: string;
  owner: string;
  description: string;
  target: number;
  actual: number;
  unit: string;
  period: KPIPeriod;
  startDate: string;
  endDate: string;
  calculationMethod: string;
  thresholds: { green: number; yellow: number; red: number };
  status: KPIStatus;
  notes: string;
  history: { periodStart: string; periodEnd: string; actual: number; target: number; status: KPIStatus; recordedAt: string }[];
};

export type Employee = {
  id: string;
  name: string;
  email: string;
  position: string;
  department: string;
  team: string;
  manager: string;
  executive: string;
  reportingLine: string;
  startDate: string;
  role: "CEO" | "COO" | "CTO" | "Department head" | "Manager" | "Employee";
  employmentStatus: "Active" | "On leave" | "Inactive";
  viewPermissions: string[];
  ticketTypes: TicketType[];
  deliverables: EmployeeDeliverable[];
};

export type Ticket = {
  id: string;
  title: string;
  type: TicketType;
  priority: "Low" | "Normal" | "High" | "Critical";
  status: "Open" | "Assigned" | "In progress" | "Pending" | "Completed" | "Closed";
  requester: string;
  assigneeId: string;
  createdAt: string;
  dueDate: string;
  description: string;
  amount?: number;
  owedTo?: string;
};

export type Meeting = {
  id: string;
  title: string;
  date: string;
  time: string;
  status: "Planned" | "Held" | "Cancelled";
  attendees: string;
  notes: string;
  decisions: string;
  createdAt: string;
  source: "manual" | "medmap.co.za";
};

export type MeetingDeadline = {
  id: string;
  meetingId: string;
  title: string;
  dueDate: string;
  owner: string;
  status: "Open" | "In progress" | "Blocked" | "Done";
  followUp: string;
};

export type TargetPeriod = "Weekly" | "Monthly";
export type DepartmentTarget = {
  id: string;
  department: string;
  metric: string;
  period: TargetPeriod;
  actual: number;
  target: number;
  unit: "count" | "milestone";
  owner: string;
  status: "Not set" | "On track" | "At risk" | "Outstanding";
  notes: string;
};

export type TechnologyWorkItem = {
  id: string;
  title: string;
  status: "Outstanding" | "In progress" | "Done";
  owner: string;
  followUp: string;
};

export const viewPermissionOptions = [
  "Company overview",
  "Financial health",
  "People & performance",
  "Operations & tickets",
  "Patient records",
  "Doctor operations",
  "Technology & security",
  "Risk & governance",
] as const;

const seededTransactions: Transaction[] = workbookTransactions;

const seededEmployees: Employee[] = [
  { id: "EMP-001", name: "Ofentse Mashau", email: "ofentse@medmap.co.za", position: "Founder & CEO", department: "Executive", team: "Executive leadership", manager: "—", executive: "Ofentse Mashau", reportingLine: "CEO", startDate: "", role: "CEO", employmentStatus: "Active", viewPermissions: [...viewPermissionOptions], ticketTypes: [...ticketTypeOptions], deliverables: [] },
  { id: "EMP-002", name: "Kuhlula Madumo", email: "kuhlula@medmap.co.za", position: "Chief Operating Officer", department: "Operations", team: "Executive leadership", manager: "Ofentse Mashau", executive: "Ofentse Mashau", reportingLine: "CEO → COO → Operations teams", startDate: "", role: "COO", employmentStatus: "Active", viewPermissions: ["Company overview", "Operations & tickets", "People & performance", "Doctor operations", "Risk & governance"], ticketTypes: ["Customer case", "Doctor onboarding", "Sales & acquisition", "General operations", "People & performance", "Expense reimbursement"], deliverables: [
    { id: "DEL-COO-001", title: "Set weekly and monthly patient targets", cadence: "Monthly", dueDate: "2026-09-12", status: "Not started", notes: "Agree the first measurable patient target with the CEO and Operations team." },
    { id: "DEL-COO-002", title: "Own doctor and ambassador acquisition operating plan", cadence: "Weekly", dueDate: "2026-09-08", status: "In progress", notes: "Turn the zero baseline into a named pipeline, owner and weekly review." },
    { id: "DEL-COO-003", title: "Close partner onboarding pack", cadence: "One-off", dueDate: "2026-09-08", status: "In progress", notes: "Verify practice details and move the partner record to live." },
    { id: "DEL-COO-004", title: "Run the weekly accountability meeting", cadence: "Weekly", dueDate: "2026-09-11", status: "Not started", notes: "Record decisions, owners and deadlines in Meetings & deadlines." },
  ] },
  { id: "EMP-003", name: "Selaelo Princess Langa", email: "selaelo@medmap.co.za", position: "Chief Technology Officer", department: "Technology", team: "Executive leadership", manager: "Ofentse Mashau", executive: "Ofentse Mashau", reportingLine: "CEO → CTO → Product / Engineering / Technology & Security", startDate: "", role: "CTO", employmentStatus: "Active", viewPermissions: ["Company overview", "Operations & tickets", "Technology & security", "Risk & governance"], ticketTypes: ["Technology incident", "Security assessment", "General operations", "Expense reimbursement"], deliverables: [] },
  { id: "EMP-004", name: "Thabo Ndlovu", email: "thabo@medmap.co.za", position: "Doctor Acquisition Lead", department: "Operations", team: "Doctor Acquisition", manager: "Kuhlula Madumo", executive: "Ofentse Mashau", reportingLine: "CEO → COO → Doctor Acquisition", startDate: "", role: "Employee", employmentStatus: "Active", viewPermissions: ["Company overview", "Operations & tickets", "Doctor operations"], ticketTypes: ["Doctor onboarding", "Sales & acquisition", "General operations"], deliverables: [] },
];

const seededTickets: Ticket[] = [
  { id: "TKT-1042", title: "Complete partner onboarding pack", type: "Doctor onboarding", priority: "High", status: "In progress", requester: "Kuhlula Madumo", assigneeId: "EMP-004", createdAt: "2026-09-04", dueDate: "2026-09-08", description: "Verify practice details and move the partner record to live." },
  { id: "TKT-1041", title: "Review failed payment webhook", type: "Technology incident", priority: "Critical", status: "Assigned", requester: "Ofentse Mashau", assigneeId: "EMP-003", createdAt: "2026-09-04", dueDate: "2026-09-05", description: "Investigate the payment event mismatch and attach release evidence." },
  { id: "TKT-1040", title: "Approve September commission run", type: "Finance approval", priority: "Normal", status: "Pending", requester: "Kuhlula Madumo", assigneeId: "EMP-001", createdAt: "2026-09-03", dueDate: "2026-09-06", description: "Confirm attributed activity before the payable run is released." },
];

const seededOrganizationUnits: OrganizationUnit[] = [
  { id: "ORG-EXEC", name: "Executive", kind: "Executive", leader: "Ofentse Mashau", description: "Company-wide leadership and executive oversight." },
  { id: "ORG-OPS", name: "Operations", kind: "Department", parentId: "ORG-EXEC", leader: "Kuhlula Madumo", description: "Execution, customer operations and operating cadence." },
  { id: "ORG-DOCTOR", name: "Doctor Acquisition", kind: "Team", parentId: "ORG-OPS", leader: "Thabo Ndlovu", description: "Doctor enrolment and acquisition pipeline." },
  { id: "ORG-AMBASSADOR", name: "Ambassador Programme", kind: "Team", parentId: "ORG-OPS", leader: "Kuhlula Madumo", description: "Ambassador cohorts, referrals and performance." },
  { id: "ORG-SALES", name: "Sales", kind: "Team", parentId: "ORG-OPS", leader: "Kuhlula Madumo", description: "Conversion of enrolled doctors and patients." },
  { id: "ORG-CUSTOMER", name: "Customer Operations", kind: "Team", parentId: "ORG-OPS", leader: "Kuhlula Madumo", description: "Customer cases, service levels and resolution." },
  { id: "ORG-TECH", name: "Technology", kind: "Department", parentId: "ORG-EXEC", leader: "Selaelo Princess Langa", description: "Product, engineering, infrastructure and security." },
  { id: "ORG-PRODUCT", name: "Product", kind: "Team", parentId: "ORG-TECH", leader: "Selaelo Princess Langa", description: "Roadmap, feedback and product decisions." },
  { id: "ORG-ENGINEERING", name: "Engineering", kind: "Team", parentId: "ORG-TECH", leader: "Selaelo Princess Langa", description: "Development, bugs, technical debt and releases." },
  { id: "ORG-SECURITY", name: "Technology & Security", kind: "Team", parentId: "ORG-TECH", leader: "Selaelo Princess Langa", description: "Infrastructure, security testing and remediation." },
];
const seededKPIs: KPI[] = [
  { id: "KPI-DOCTORS", name: "Active doctors", department: "Commercial", owner: "Thabo Ndlovu", description: "Doctors with an active MedMap relationship.", target: 0, actual: 0, unit: "doctors", period: "Monthly", startDate: "2026-09-01", endDate: "2026-09-30", calculationMethod: "Awaiting live MedMap doctor data", thresholds: { green: 100, yellow: 80, red: 0 }, status: "Not set", notes: "Set an explicit target before using this KPI in an executive review.", history: [] },
  { id: "KPI-AMBASSADORS", name: "Active ambassadors", department: "Commercial", owner: "Kuhlula Madumo", description: "Ambassadors currently active in a cohort.", target: 0, actual: 0, unit: "ambassadors", period: "Monthly", startDate: "2026-09-01", endDate: "2026-09-30", calculationMethod: "Awaiting live MedMap ambassador data", thresholds: { green: 100, yellow: 80, red: 0 }, status: "Not set", notes: "Set an explicit target before using this KPI in an executive review.", history: [] },
  { id: "KPI-PATIENTS", name: "Active patients", department: "Operations", owner: "Kuhlula Madumo", description: "Patients with current booking or login activity.", target: 0, actual: 0, unit: "patients", period: "Monthly", startDate: "2026-09-01", endDate: "2026-09-30", calculationMethod: "Awaiting live MedMap patient data", thresholds: { green: 100, yellow: 80, red: 0 }, status: "Not set", notes: "Set an explicit target before using this KPI in an executive review.", history: [] },
];
const seededMeetings: Meeting[] = [];
const seededMeetingDeadlines: MeetingDeadline[] = [];
const seededDepartmentTargets: DepartmentTarget[] = [
  { id: "TGT-001", department: "Commercial", metric: "Active doctors", period: "Weekly", actual: 0, target: 0, unit: "count", owner: "Thabo Ndlovu", status: "Not set", notes: "Set the first weekly doctor acquisition target in the team meeting." },
  { id: "TGT-002", department: "Commercial", metric: "Active doctors", period: "Monthly", actual: 0, target: 0, unit: "count", owner: "Thabo Ndlovu", status: "Not set", notes: "Set the first monthly doctor acquisition target in the team meeting." },
  { id: "TGT-003", department: "Commercial", metric: "Active ambassadors", period: "Weekly", actual: 0, target: 0, unit: "count", owner: "Kuhlula Madumo", status: "Not set", notes: "Set the first weekly ambassador target in the team meeting." },
  { id: "TGT-004", department: "Commercial", metric: "Active ambassadors", period: "Monthly", actual: 0, target: 0, unit: "count", owner: "Kuhlula Madumo", status: "Not set", notes: "Set the first monthly ambassador target in the team meeting." },
  { id: "TGT-005", department: "Operations", metric: "Active patients", period: "Weekly", actual: 0, target: 0, unit: "count", owner: "Kuhlula Madumo", status: "Not set", notes: "Set the first weekly patient growth target in the team meeting." },
  { id: "TGT-006", department: "Operations", metric: "Active patients", period: "Monthly", actual: 0, target: 0, unit: "count", owner: "Kuhlula Madumo", status: "Not set", notes: "Set the first monthly patient growth target in the team meeting." },
];
const seededTechnologyWorkItems: TechnologyWorkItem[] = [
  { id: "TECH-001", title: "Bookings not working", status: "Outstanding", owner: "Selaelo Langa", followUp: "Restore and verify the end-to-end booking flow." },
  { id: "TECH-002", title: "Payments workflow outstanding", status: "Outstanding", owner: "Selaelo Langa", followUp: "Complete the payment workflow and test successful and failed payment paths." },
  { id: "TECH-003", title: "Migrate platform to AWS", status: "Outstanding", owner: "Selaelo Langa", followUp: "Define the migration plan, dependencies, cutover and rollback steps." },
  { id: "TECH-004", title: "Build the MedMap app", status: "Outstanding", owner: "Selaelo Langa", followUp: "Turn the product scope into an owned delivery plan with milestones." },
];
const seededCOOWorkItems: TechnologyWorkItem[] = [
  { id: "COO-001", title: "Set weekly and monthly patient targets", status: "Outstanding", owner: "Kuhlula Madumo", followUp: "Agree the first measurable patient target with the CEO and Operations team." },
  { id: "COO-002", title: "Own doctor and ambassador acquisition plan", status: "In progress", owner: "Kuhlula Madumo", followUp: "Turn the zero baseline into a named pipeline, owner and weekly review." },
  { id: "COO-003", title: "Close partner onboarding pack", status: "In progress", owner: "Kuhlula Madumo", followUp: "Verify practice details and move the partner record to live." },
  { id: "COO-004", title: "Run the weekly accountability meeting", status: "Outstanding", owner: "Kuhlula Madumo", followUp: "Record decisions, owners and deadlines in Meetings & deadlines." },
];

type MedMapState = {
  transactions: Transaction[];
  employees: Employee[];
  organizationUnits: OrganizationUnit[];
  kpis: KPI[];
  tickets: Ticket[];
  meetings: Meeting[];
  meetingDeadlines: MeetingDeadline[];
  departmentTargets: DepartmentTarget[];
  technologyWorkItems: TechnologyWorkItem[];
  cooWorkItems: TechnologyWorkItem[];
};

type MedMapContextValue = MedMapState & {
  addTransaction: (transaction: Omit<Transaction, "id">) => void;
  updateTransaction: (id: string, patch: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  addEmployee: (employee: Omit<Employee, "id">) => string;
  updateEmployee: (id: string, patch: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;
  addKPI: (kpi: Omit<KPI, "id" | "status" | "history">) => void;
  updateKPI: (id: string, patch: Partial<KPI>) => void;
  deleteKPI: (id: string) => void;
  recordKPIHistory: (id: string) => void;
  addTicket: (ticket: Omit<Ticket, "id">) => void;
  updateTicket: (id: string, patch: Partial<Ticket>) => void;
  deleteTicket: (id: string) => void;
  addMeeting: (meeting: Omit<Meeting, "id">) => void;
  updateMeeting: (id: string, patch: Partial<Meeting>) => void;
  deleteMeeting: (id: string) => void;
  addMeetingDeadline: (deadline: Omit<MeetingDeadline, "id">) => void;
  updateMeetingDeadline: (id: string, patch: Partial<MeetingDeadline>) => void;
  deleteMeetingDeadline: (id: string) => void;
  addDepartmentTarget: (target: Omit<DepartmentTarget, "id">) => void;
  updateDepartmentTarget: (id: string, patch: Partial<DepartmentTarget>) => void;
  deleteDepartmentTarget: (id: string) => void;
  updateTechnologyWorkItem: (id: string, patch: Partial<TechnologyWorkItem>) => void;
  updateCOOWorkItem: (id: string, patch: Partial<TechnologyWorkItem>) => void;
  resetDemoData: () => void;
};

const initialState: MedMapState = { transactions: seededTransactions, employees: seededEmployees, organizationUnits: seededOrganizationUnits, kpis: seededKPIs, tickets: seededTickets, meetings: seededMeetings, meetingDeadlines: seededMeetingDeadlines, departmentTargets: seededDepartmentTargets, technologyWorkItems: seededTechnologyWorkItems, cooWorkItems: seededCOOWorkItems };
const storageKey = "medmap-operating-system-v2-real-ledger";

function loadState(): MedMapState {
  if (typeof window === "undefined") return initialState;
  try {
    const stored = window.localStorage.getItem(storageKey);
    if (!stored) return initialState;
    const parsed = JSON.parse(stored) as Partial<MedMapState>;
    return {
      ...initialState,
      ...parsed,
      employees: (parsed.employees ?? initialState.employees).map((employee) => ({
        ...employee,
        name: employee.id === "EMP-003" ? "Selaelo Princess Langa" : employee.name,
        team: employee.team ?? employee.department,
        reportingLine: employee.reportingLine ?? `${employee.manager} → ${employee.name}`,
        startDate: employee.startDate ?? "",
        deliverables: employee.deliverables ?? initialState.employees.find((seed) => seed.id === employee.id)?.deliverables ?? [],
      })),
      organizationUnits: parsed.organizationUnits ?? initialState.organizationUnits,
      kpis: parsed.kpis ?? initialState.kpis,
      technologyWorkItems: (parsed.technologyWorkItems ?? initialState.technologyWorkItems).map((item) => ({ ...item, owner: item.owner === "Selaelo Langa" ? "Selaelo Princess Langa" : item.owner })),
      cooWorkItems: parsed.cooWorkItems ?? initialState.cooWorkItems,
    };
  } catch {
    return initialState;
  }
}

export function evaluateKPIStatus(actual: number, target: number, thresholds: KPI["thresholds"]): KPIStatus {
  if (target <= 0) return "Not set";
  const achievement = (actual / target) * 100;
  if (achievement >= thresholds.green) return "Healthy";
  if (achievement >= thresholds.yellow) return "Attention";
  return "Critical";
}

const MedMapContext = createContext<MedMapContextValue | null>(null);

export function MedMapProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<MedMapState>(loadState);

  const updateState = (updater: (current: MedMapState) => MedMapState) => {
    setState((current) => {
      const next = updater(current);
      window.localStorage.setItem(storageKey, JSON.stringify(next));
      return next;
    });
  };

  const value = useMemo<MedMapContextValue>(() => ({
    ...state,
    addTransaction: (transaction) => updateState((current) => ({ ...current, transactions: [{ ...transaction, id: `TX-${Date.now()}` }, ...current.transactions] })),
    updateTransaction: (id, patch) => updateState((current) => ({ ...current, transactions: current.transactions.map((item) => item.id === id ? { ...item, ...patch } : item) })),
    deleteTransaction: (id) => updateState((current) => ({ ...current, transactions: current.transactions.filter((item) => item.id !== id) })),
    addEmployee: (employee) => { const id = `EMP-${Date.now()}`; updateState((current) => ({ ...current, employees: [...current.employees, { ...employee, id }] })); return id; },
    updateEmployee: (id, patch) => updateState((current) => ({ ...current, employees: current.employees.map((item) => item.id === id ? { ...item, ...patch } : item) })),
    deleteEmployee: (id) => updateState((current) => ({ ...current, employees: current.employees.filter((item) => item.id !== id) })),
    addKPI: (kpi) => updateState((current) => ({ ...current, kpis: [{ ...kpi, id: `KPI-${Date.now()}`, status: evaluateKPIStatus(kpi.actual, kpi.target, kpi.thresholds), history: [] }, ...current.kpis] })),
    updateKPI: (id, patch) => updateState((current) => ({ ...current, kpis: current.kpis.map((item) => { if (item.id !== id) return item; const next = { ...item, ...patch }; return { ...next, status: evaluateKPIStatus(next.actual, next.target, next.thresholds) }; }) })),
    deleteKPI: (id) => updateState((current) => ({ ...current, kpis: current.kpis.filter((item) => item.id !== id) })),
    recordKPIHistory: (id) => updateState((current) => ({ ...current, kpis: current.kpis.map((item) => item.id === id ? { ...item, history: [...item.history, { periodStart: item.startDate, periodEnd: item.endDate, actual: item.actual, target: item.target, status: item.status, recordedAt: new Date().toISOString() }] } : item) })),
    addTicket: (ticket) => updateState((current) => ({ ...current, tickets: [{ ...ticket, id: `TKT-${1043 + current.tickets.length}` }, ...current.tickets] })),
    updateTicket: (id, patch) => updateState((current) => ({ ...current, tickets: current.tickets.map((item) => item.id === id ? { ...item, ...patch } : item) })),
    deleteTicket: (id) => updateState((current) => ({ ...current, tickets: current.tickets.filter((item) => item.id !== id) })),
    addMeeting: (meeting) => updateState((current) => ({ ...current, meetings: [{ ...meeting, id: `MTG-${Date.now()}` }, ...current.meetings] })),
    updateMeeting: (id, patch) => updateState((current) => ({ ...current, meetings: current.meetings.map((item) => item.id === id ? { ...item, ...patch } : item) })),
    deleteMeeting: (id) => updateState((current) => ({ ...current, meetings: current.meetings.filter((item) => item.id !== id), meetingDeadlines: current.meetingDeadlines.filter((item) => item.meetingId !== id) })),
    addMeetingDeadline: (deadline) => updateState((current) => ({ ...current, meetingDeadlines: [{ ...deadline, id: `DL-${Date.now()}` }, ...current.meetingDeadlines] })),
    updateMeetingDeadline: (id, patch) => updateState((current) => ({ ...current, meetingDeadlines: current.meetingDeadlines.map((item) => item.id === id ? { ...item, ...patch } : item) })),
    deleteMeetingDeadline: (id) => updateState((current) => ({ ...current, meetingDeadlines: current.meetingDeadlines.filter((item) => item.id !== id) })),
    addDepartmentTarget: (target) => updateState((current) => ({ ...current, departmentTargets: [{ ...target, id: `TGT-${Date.now()}` }, ...current.departmentTargets] })),
    updateDepartmentTarget: (id, patch) => updateState((current) => ({ ...current, departmentTargets: current.departmentTargets.map((item) => item.id === id ? { ...item, ...patch } : item) })),
    deleteDepartmentTarget: (id) => updateState((current) => ({ ...current, departmentTargets: current.departmentTargets.filter((item) => item.id !== id) })),
    updateTechnologyWorkItem: (id, patch) => updateState((current) => ({ ...current, technologyWorkItems: current.technologyWorkItems.map((item) => item.id === id ? { ...item, ...patch } : item) })),
    updateCOOWorkItem: (id, patch) => updateState((current) => ({ ...current, cooWorkItems: current.cooWorkItems.map((item) => item.id === id ? { ...item, ...patch } : item) })),
    resetDemoData: () => { window.localStorage.removeItem(storageKey); setState(initialState); },
  }), [state]);

  return <MedMapContext.Provider value={value}>{children}</MedMapContext.Provider>;
}

export function useMedMap() {
  const context = useContext(MedMapContext);
  if (!context) throw new Error("useMedMap must be used within MedMapProvider");
  return context;
}

export function formatZAR(amount: number) {
  return `R${Math.abs(amount).toLocaleString("en-ZA", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function formatZARWithSign(amount: number) {
  return `${amount < 0 ? "-" : ""}${formatZAR(amount)}`;
}

export function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-ZA", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(`${date}T12:00:00`));
}
