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

export type Employee = {
  id: string;
  name: string;
  email: string;
  position: string;
  department: string;
  manager: string;
  executive: string;
  role: "CEO" | "COO" | "CTO" | "Department head" | "Manager" | "Employee";
  employmentStatus: "Active" | "On leave" | "Inactive";
  viewPermissions: string[];
  ticketTypes: TicketType[];
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

export type AccountabilityMetrics = {
  doctors: number;
  ambassadors: number;
  patients: number;
  updatedAt: string;
  source: "manual" | "medmap.co.za";
  syncStatus: "Manual baseline" | "Ready to sync" | "Synced";
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
  { id: "EMP-001", name: "Ofentse Mashau", email: "ofentse@medmap.co.za", position: "Founder & CEO", department: "Executive", manager: "—", executive: "Ofentse Mashau", role: "CEO", employmentStatus: "Active", viewPermissions: [...viewPermissionOptions], ticketTypes: [...ticketTypeOptions] },
  { id: "EMP-002", name: "Kuhlula Madumo", email: "kuhlula@medmap.co.za", position: "Chief Operating Officer", department: "Operations", manager: "Ofentse Mashau", executive: "Ofentse Mashau", role: "COO", employmentStatus: "Active", viewPermissions: ["Company overview", "Operations & tickets", "People & performance", "Doctor operations", "Risk & governance"], ticketTypes: ["Customer case", "Doctor onboarding", "Sales & acquisition", "General operations", "People & performance", "Expense reimbursement"] },
  { id: "EMP-003", name: "Selaelo Langa", email: "selaelo@medmap.co.za", position: "Chief Technology Officer", department: "Technology", manager: "Ofentse Mashau", executive: "Ofentse Mashau", role: "CTO", employmentStatus: "Active", viewPermissions: ["Company overview", "Operations & tickets", "Technology & security", "Risk & governance"], ticketTypes: ["Technology incident", "Security assessment", "General operations", "Expense reimbursement"] },
  { id: "EMP-004", name: "Thabo Ndlovu", email: "thabo@medmap.co.za", position: "Doctor Acquisition Lead", department: "Operations", manager: "Kuhlula Madumo", executive: "Ofentse Mashau", role: "Employee", employmentStatus: "Active", viewPermissions: ["Company overview", "Operations & tickets", "Doctor operations"], ticketTypes: ["Doctor onboarding", "Sales & acquisition", "General operations"] },
];

const seededTickets: Ticket[] = [
  { id: "TKT-1042", title: "Complete partner onboarding pack", type: "Doctor onboarding", priority: "High", status: "In progress", requester: "Kuhlula Madumo", assigneeId: "EMP-004", createdAt: "2026-09-04", dueDate: "2026-09-08", description: "Verify practice details and move the partner record to live." },
  { id: "TKT-1041", title: "Review failed payment webhook", type: "Technology incident", priority: "Critical", status: "Assigned", requester: "Ofentse Mashau", assigneeId: "EMP-003", createdAt: "2026-09-04", dueDate: "2026-09-05", description: "Investigate the payment event mismatch and attach release evidence." },
  { id: "TKT-1040", title: "Approve September commission run", type: "Finance approval", priority: "Normal", status: "Pending", requester: "Kuhlula Madumo", assigneeId: "EMP-001", createdAt: "2026-09-03", dueDate: "2026-09-06", description: "Confirm attributed activity before the payable run is released." },
];

const seededMeetings: Meeting[] = [];
const seededMeetingDeadlines: MeetingDeadline[] = [];
const seededAccountabilityMetrics: AccountabilityMetrics = {
  doctors: 286,
  ambassadors: 42,
  patients: 4821,
  updatedAt: "2026-09-05",
  source: "manual",
  syncStatus: "Manual baseline",
};

type MedMapState = {
  transactions: Transaction[];
  employees: Employee[];
  tickets: Ticket[];
  meetings: Meeting[];
  meetingDeadlines: MeetingDeadline[];
  accountabilityMetrics: AccountabilityMetrics;
};

type MedMapContextValue = MedMapState & {
  addTransaction: (transaction: Omit<Transaction, "id">) => void;
  updateTransaction: (id: string, patch: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  addEmployee: (employee: Omit<Employee, "id">) => void;
  updateEmployee: (id: string, patch: Partial<Employee>) => void;
  addTicket: (ticket: Omit<Ticket, "id">) => void;
  updateTicket: (id: string, patch: Partial<Ticket>) => void;
  deleteTicket: (id: string) => void;
  addMeeting: (meeting: Omit<Meeting, "id">) => void;
  updateMeeting: (id: string, patch: Partial<Meeting>) => void;
  deleteMeeting: (id: string) => void;
  addMeetingDeadline: (deadline: Omit<MeetingDeadline, "id">) => void;
  updateMeetingDeadline: (id: string, patch: Partial<MeetingDeadline>) => void;
  deleteMeetingDeadline: (id: string) => void;
  updateAccountabilityMetrics: (patch: Partial<AccountabilityMetrics>) => void;
  resetDemoData: () => void;
};

const initialState: MedMapState = { transactions: seededTransactions, employees: seededEmployees, tickets: seededTickets, meetings: seededMeetings, meetingDeadlines: seededMeetingDeadlines, accountabilityMetrics: seededAccountabilityMetrics };
const storageKey = "medmap-operating-system-v2-real-ledger";

function loadState(): MedMapState {
  if (typeof window === "undefined") return initialState;
  try {
    const stored = window.localStorage.getItem(storageKey);
    return stored ? { ...initialState, ...JSON.parse(stored) } : initialState;
  } catch {
    return initialState;
  }
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
    addEmployee: (employee) => updateState((current) => ({ ...current, employees: [...current.employees, { ...employee, id: `EMP-${String(current.employees.length + 1).padStart(3, "0")}` }] })),
    updateEmployee: (id, patch) => updateState((current) => ({ ...current, employees: current.employees.map((item) => item.id === id ? { ...item, ...patch } : item) })),
    addTicket: (ticket) => updateState((current) => ({ ...current, tickets: [{ ...ticket, id: `TKT-${1043 + current.tickets.length}` }, ...current.tickets] })),
    updateTicket: (id, patch) => updateState((current) => ({ ...current, tickets: current.tickets.map((item) => item.id === id ? { ...item, ...patch } : item) })),
    deleteTicket: (id) => updateState((current) => ({ ...current, tickets: current.tickets.filter((item) => item.id !== id) })),
    addMeeting: (meeting) => updateState((current) => ({ ...current, meetings: [{ ...meeting, id: `MTG-${Date.now()}` }, ...current.meetings] })),
    updateMeeting: (id, patch) => updateState((current) => ({ ...current, meetings: current.meetings.map((item) => item.id === id ? { ...item, ...patch } : item) })),
    deleteMeeting: (id) => updateState((current) => ({ ...current, meetings: current.meetings.filter((item) => item.id !== id), meetingDeadlines: current.meetingDeadlines.filter((item) => item.meetingId !== id) })),
    addMeetingDeadline: (deadline) => updateState((current) => ({ ...current, meetingDeadlines: [{ ...deadline, id: `DL-${Date.now()}` }, ...current.meetingDeadlines] })),
    updateMeetingDeadline: (id, patch) => updateState((current) => ({ ...current, meetingDeadlines: current.meetingDeadlines.map((item) => item.id === id ? { ...item, ...patch } : item) })),
    deleteMeetingDeadline: (id) => updateState((current) => ({ ...current, meetingDeadlines: current.meetingDeadlines.filter((item) => item.id !== id) })),
    updateAccountabilityMetrics: (patch) => updateState((current) => ({ ...current, accountabilityMetrics: { ...current.accountabilityMetrics, ...patch, updatedAt: new Date().toISOString().slice(0, 10), source: "manual", syncStatus: "Ready to sync" } })),
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
