import { createContext, useContext, useMemo, useState } from "react";

export const ticketTypeOptions = [
  "Customer case",
  "Doctor onboarding",
  "Sales & acquisition",
  "Finance approval",
  "Technology incident",
  "Security assessment",
  "People & performance",
  "General operations",
] as const;

export type TicketType = (typeof ticketTypeOptions)[number];
export type TransactionKind = "revenue" | "expense";
export type TransactionStatus = "Paid" | "Payable" | "Committed";

export type Transaction = {
  id: string;
  date: string;
  description: string;
  kind: TransactionKind;
  category: string;
  amount: number;
  status: TransactionStatus;
  owner: string;
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

const seededTransactions: Transaction[] = [
  { id: "TX-260801", date: "2026-08-01", description: "Patient booking revenue", kind: "revenue", category: "Patient bookings", amount: 12000, status: "Paid", owner: "Kuhlula Madumo", notes: "Completed bookings cleared for August." },
  { id: "TX-260805", date: "2026-08-05", description: "Premium patient subscriptions", kind: "revenue", category: "Premium subscriptions", amount: 3900, status: "Paid", owner: "Kuhlula Madumo", notes: "Quarterly Premium subscriptions." },
  { id: "TX-260812", date: "2026-08-12", description: "Doctor Member subscriptions", kind: "revenue", category: "Doctor Member", amount: 9900, status: "Paid", owner: "Kuhlula Madumo", notes: "Member tier monthly recurring revenue." },
  { id: "TX-260820", date: "2026-08-20", description: "Doctor Partner subscriptions", kind: "revenue", category: "Doctor Partner", amount: 14970, status: "Paid", owner: "Kuhlula Madumo", notes: "Partner tier monthly recurring revenue." },
  { id: "TX-260901", date: "2026-09-01", description: "Patient booking revenue", kind: "revenue", category: "Patient bookings", amount: 9800, status: "Paid", owner: "Kuhlula Madumo", notes: "September completed bookings to date." },
  { id: "TX-260903", date: "2026-09-03", description: "Premium patient subscriptions", kind: "revenue", category: "Premium subscriptions", amount: 1950, status: "Paid", owner: "Kuhlula Madumo", notes: "September new and renewed Premium accounts." },
  { id: "TX-260803", date: "2026-08-03", description: "Product and technology services", kind: "expense", category: "Technology", amount: 12500, status: "Paid", owner: "Selaelo Langa", notes: "Hosting, software and engineering tooling." },
  { id: "TX-260809", date: "2026-08-09", description: "Growth campaign spend", kind: "expense", category: "Marketing", amount: 9800, status: "Paid", owner: "Kuhlula Madumo", notes: "Doctor and patient acquisition activity." },
  { id: "TX-260816", date: "2026-08-16", description: "Legal and compliance setup", kind: "expense", category: "Legal & compliance", amount: 4200, status: "Paid", owner: "Ofentse Mashau", notes: "Corporate and compliance support." },
  { id: "TX-260831", date: "2026-08-31", description: "August salaries payable", kind: "expense", category: "Salaries payable", amount: 42000, status: "Payable", owner: "Ofentse Mashau", notes: "Payroll accrual; payable at month end." },
  { id: "TX-260831B", date: "2026-08-31", description: "Ambassador commissions paid", kind: "expense", category: "Commissions", amount: 8400, status: "Paid", owner: "Kuhlula Madumo", notes: "Approved commissions on attributed activity." },
  { id: "TX-260902", date: "2026-09-02", description: "Hosting and infrastructure", kind: "expense", category: "Infrastructure", amount: 5400, status: "Paid", owner: "Selaelo Langa", notes: "Cloud, monitoring and infrastructure services." },
  { id: "TX-260904", date: "2026-09-04", description: "Customer operations support", kind: "expense", category: "Customer operations", amount: 6100, status: "Committed", owner: "Kuhlula Madumo", notes: "Partner support and service operations." },
  { id: "TX-260930", date: "2026-09-30", description: "September salaries payable", kind: "expense", category: "Salaries payable", amount: 42000, status: "Payable", owner: "Ofentse Mashau", notes: "Forecast payroll obligation for September." },
  { id: "TX-260930B", date: "2026-09-30", description: "September commissions payable", kind: "expense", category: "Commissions", amount: 6200, status: "Payable", owner: "Kuhlula Madumo", notes: "Accrued commission estimate for September." },
];

const seededEmployees: Employee[] = [
  { id: "EMP-001", name: "Ofentse Mashau", email: "ofentse@medmap.co.za", position: "Founder & CEO", department: "Executive", manager: "—", executive: "Ofentse Mashau", role: "CEO", employmentStatus: "Active", viewPermissions: [...viewPermissionOptions], ticketTypes: [...ticketTypeOptions] },
  { id: "EMP-002", name: "Kuhlula Madumo", email: "kuhlula@medmap.co.za", position: "Chief Operating Officer", department: "Operations", manager: "Ofentse Mashau", executive: "Ofentse Mashau", role: "COO", employmentStatus: "Active", viewPermissions: ["Company overview", "Operations & tickets", "People & performance", "Doctor operations", "Risk & governance"], ticketTypes: ["Customer case", "Doctor onboarding", "Sales & acquisition", "General operations", "People & performance"] },
  { id: "EMP-003", name: "Selaelo Langa", email: "selaelo@medmap.co.za", position: "Chief Technology Officer", department: "Technology", manager: "Ofentse Mashau", executive: "Ofentse Mashau", role: "CTO", employmentStatus: "Active", viewPermissions: ["Company overview", "Operations & tickets", "Technology & security", "Risk & governance"], ticketTypes: ["Technology incident", "Security assessment", "General operations"] },
  { id: "EMP-004", name: "Thabo Ndlovu", email: "thabo@medmap.co.za", position: "Doctor Acquisition Lead", department: "Operations", manager: "Kuhlula Madumo", executive: "Ofentse Mashau", role: "Employee", employmentStatus: "Active", viewPermissions: ["Company overview", "Operations & tickets", "Doctor operations"], ticketTypes: ["Doctor onboarding", "Sales & acquisition", "General operations"] },
];

const seededTickets: Ticket[] = [
  { id: "TKT-1042", title: "Complete partner onboarding pack", type: "Doctor onboarding", priority: "High", status: "In progress", requester: "Kuhlula Madumo", assigneeId: "EMP-004", createdAt: "2026-09-04", dueDate: "2026-09-08", description: "Verify practice details and move the partner record to live." },
  { id: "TKT-1041", title: "Review failed payment webhook", type: "Technology incident", priority: "Critical", status: "Assigned", requester: "Ofentse Mashau", assigneeId: "EMP-003", createdAt: "2026-09-04", dueDate: "2026-09-05", description: "Investigate the payment event mismatch and attach release evidence." },
  { id: "TKT-1040", title: "Approve September commission run", type: "Finance approval", priority: "Normal", status: "Pending", requester: "Kuhlula Madumo", assigneeId: "EMP-001", createdAt: "2026-09-03", dueDate: "2026-09-06", description: "Confirm attributed activity before the payable run is released." },
];

type MedMapState = {
  transactions: Transaction[];
  employees: Employee[];
  tickets: Ticket[];
};

type MedMapContextValue = MedMapState & {
  addTransaction: (transaction: Omit<Transaction, "id">) => void;
  updateTransaction: (id: string, patch: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  addEmployee: (employee: Omit<Employee, "id">) => void;
  updateEmployee: (id: string, patch: Partial<Employee>) => void;
  addTicket: (ticket: Omit<Ticket, "id">) => void;
  updateTicket: (id: string, patch: Partial<Ticket>) => void;
  resetDemoData: () => void;
};

const initialState: MedMapState = { transactions: seededTransactions, employees: seededEmployees, tickets: seededTickets };
const storageKey = "medmap-operating-system-v1";

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
