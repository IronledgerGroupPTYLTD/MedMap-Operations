import { useQuery } from "@tanstack/react-query";
import { useSupabaseAuth } from "./supabase-auth";
import { getSupabaseClient } from "./supabase";
import {
  useCurrentEmployee,
  useCurrentOrganisation,
} from "./supabase-identity";

export type DoctorAcquisitionRow = {
  id: string;
  doctor_id: string;
  department_id: string | null;
  owner_employee_id: string | null;
  acquisition_channel: string | null;
  source_detail: string | null;
  status: string;
  contacted_at: string | null;
  enrolled_at: string | null;
  converted_at: string | null;
  lost_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type DoctorProfile = {
  id: string;
  first_name: string;
  last_name: string;
  practice_name: string | null;
  specialty: string | null;
  city: string | null;
  province: string | null;
  acquisition_source: string | null;
  acquisition_status: string;
  onboarding_date: string | null;
  probation_start_date: string | null;
  probation_end_date: string | null;
  first_1000_campaign: boolean;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type AcquisitionEmployee = {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  department_id: string | null;
  job_title: string | null;
  employee_status: string;
};

export type AcquisitionDepartment = {
  id: string;
  code: string;
  name: string;
  active: boolean;
  department_group: string;
};

export type DoctorAcquisitionRecord = DoctorAcquisitionRow & {
  doctor: DoctorProfile | null;
  owner: AcquisitionEmployee | null;
  department: AcquisitionDepartment | null;
};

export type DoctorAcquisitionDashboardData = {
  acquisitions: DoctorAcquisitionRecord[];
  doctors: DoctorProfile[];
  employees: AcquisitionEmployee[];
  departments: AcquisitionDepartment[];
};

type QueryState = {
  data: DoctorAcquisitionDashboardData | undefined;
  isPending: boolean;
  isError: boolean;
  error: Error | null;
};

const columns = {
  doctorAcquisition:
    "id, doctor_id, department_id, owner_employee_id, acquisition_channel, source_detail, status, contacted_at, enrolled_at, converted_at, lost_at, notes, created_at, updated_at",
  doctors:
    "id, first_name, last_name, practice_name, specialty, city, province, acquisition_source, acquisition_status, onboarding_date, probation_start_date, probation_end_date, first_1000_campaign, active, created_at, updated_at",
  employees:
    "id, first_name, last_name, email, department_id, job_title, employee_status",
  departments: "id, code, name, active, department_group",
} as const;

function parseDoctorAcquisition(
  row: DoctorAcquisitionRow,
): DoctorAcquisitionRow {
  return row;
}

function parseDoctor(row: DoctorProfile): DoctorProfile {
  return row;
}

function parseEmployee(row: AcquisitionEmployee): AcquisitionEmployee {
  return row;
}

function parseDepartment(row: AcquisitionDepartment): AcquisitionDepartment {
  return row;
}

async function fetchDoctorAcquisitionDashboard(
  organizationId: string,
): Promise<DoctorAcquisitionDashboardData> {
  const client = getSupabaseClient();
  const [
    acquisitionResponse,
    doctorsResponse,
    employeesResponse,
    departmentsResponse,
  ] = await Promise.all([
    client
      .from("doctor_acquisition")
      .select(columns.doctorAcquisition)
      .order("created_at", { ascending: false }),
    client
      .from("doctors")
      .select(columns.doctors)
      .eq("organization_id", organizationId),
    client
      .from("employees")
      .select(columns.employees)
      .eq("organization_id", organizationId)
      .eq("employee_status", "active"),
    client
      .from("departments")
      .select(columns.departments)
      .eq("organization_id", organizationId),
  ]);

  if (acquisitionResponse.error) throw acquisitionResponse.error;
  if (doctorsResponse.error) throw doctorsResponse.error;
  if (employeesResponse.error) throw employeesResponse.error;
  if (departmentsResponse.error) throw departmentsResponse.error;

  const acquisitions = (acquisitionResponse.data ?? []).map((row) =>
    parseDoctorAcquisition(row as unknown as DoctorAcquisitionRow),
  );
  const doctors = (doctorsResponse.data ?? []).map((row) =>
    parseDoctor(row as unknown as DoctorProfile),
  );
  const employees = (employeesResponse.data ?? []).map((row) =>
    parseEmployee(row as unknown as AcquisitionEmployee),
  );
  const departments = (departmentsResponse.data ?? []).map((row) =>
    parseDepartment(row as unknown as AcquisitionDepartment),
  );
  const doctorById = new Map(doctors.map((doctor) => [doctor.id, doctor]));
  const employeeById = new Map(
    employees.map((employee) => [employee.id, employee]),
  );
  const departmentById = new Map(
    departments.map((department) => [department.id, department]),
  );

  return {
    acquisitions: acquisitions.map((acquisition) => ({
      ...acquisition,
      doctor: doctorById.get(acquisition.doctor_id) ?? null,
      owner: acquisition.owner_employee_id
        ? (employeeById.get(acquisition.owner_employee_id) ?? null)
        : null,
      department: acquisition.department_id
        ? (departmentById.get(acquisition.department_id) ?? null)
        : null,
    })),
    doctors,
    employees,
    departments,
  };
}

export function useDoctorAcquisitionDashboard(): QueryState {
  const { user, loading: authLoading } = useSupabaseAuth();
  const employeeState = useCurrentEmployee();
  const organizationState = useCurrentOrganisation();
  const organizationId = organizationState.organizationId;
  const enabled = Boolean(
    user &&
    !authLoading &&
    employeeState.status === "active" &&
    !organizationState.isLoading &&
    organizationId,
  );
  const query = useQuery({
    queryKey: [
      "doctor-acquisition-dashboard",
      user?.id ?? null,
      organizationId,
      employeeState.employee?.id ?? null,
    ],
    enabled,
    queryFn: () => fetchDoctorAcquisitionDashboard(organizationId!),
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
          ? new Error("The doctor acquisition data could not be loaded.")
          : null,
  };
}

export type AcquisitionBreakdown = {
  label: string;
  count: number;
};

export type AcquisitionOwnerWorkload = {
  id: string | null;
  name: string;
  jobTitle: string | null;
  count: number;
  statuses: AcquisitionBreakdown[];
};

export type DoctorAcquisitionMetrics = {
  recordCount: number;
  uniqueDoctorCount: number;
  contactedCount: number;
  enrolledCount: number;
  convertedCount: number;
  lostCount: number;
  eligibleRecordCount: number;
  conversionRate: number | null;
  statuses: AcquisitionBreakdown[];
  channels: AcquisitionBreakdown[];
  sourceDetails: AcquisitionBreakdown[];
  ownerWorkload: AcquisitionOwnerWorkload[];
  first1000DoctorCount: number;
  nonFirst1000DoctorCount: number;
};

function displayValue(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed || "Unknown / Unspecified";
}

function countBy(values: string[]): AcquisitionBreakdown[] {
  const counts = new Map<string, number>();
  values.forEach((value) => counts.set(value, (counts.get(value) ?? 0) + 1));
  return [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort(
      (left, right) =>
        right.count - left.count || left.label.localeCompare(right.label),
    );
}

function statusCounts(records: DoctorAcquisitionRecord[]) {
  return countBy(records.map((record) => displayValue(record.status)));
}

export function buildDoctorAcquisitionMetrics(
  data: DoctorAcquisitionDashboardData | undefined,
): DoctorAcquisitionMetrics {
  const records = data?.acquisitions ?? [];
  const doctorIds = new Set(records.map((record) => record.doctor_id));
  const campaignDoctorIds = new Set(
    records
      .filter((record) => record.doctor?.first_1000_campaign)
      .map((record) => record.doctor_id),
  );
  const ownerGroups = new Map<string, DoctorAcquisitionRecord[]>();
  records.forEach((record) => {
    const key = record.owner_employee_id ?? "__unassigned__";
    const group = ownerGroups.get(key) ?? [];
    group.push(record);
    ownerGroups.set(key, group);
  });

  const ownerWorkload = [...ownerGroups.entries()]
    .map(([id, ownerRecords]) => {
      const owner = ownerRecords[0]?.owner;
      return {
        id: id === "__unassigned__" ? null : id,
        name: owner
          ? `${owner.first_name} ${owner.last_name}`.trim()
          : id === "__unassigned__"
            ? "Unassigned"
            : "Owner not available",
        jobTitle: owner?.job_title ?? null,
        count: ownerRecords.length,
        statuses: statusCounts(ownerRecords),
      };
    })
    .sort(
      (left, right) =>
        right.count - left.count || left.name.localeCompare(right.name),
    );

  const eligibleRecordCount = records.length;
  return {
    recordCount: records.length,
    uniqueDoctorCount: doctorIds.size,
    contactedCount: records.filter((record) => record.contacted_at !== null)
      .length,
    enrolledCount: records.filter((record) => record.enrolled_at !== null)
      .length,
    convertedCount: records.filter((record) => record.converted_at !== null)
      .length,
    lostCount: records.filter((record) => record.lost_at !== null).length,
    eligibleRecordCount,
    conversionRate:
      eligibleRecordCount === 0
        ? null
        : (records.filter((record) => record.converted_at !== null).length /
            eligibleRecordCount) *
          100,
    statuses: statusCounts(records),
    channels: countBy(
      records.map((record) => displayValue(record.acquisition_channel)),
    ),
    sourceDetails: countBy(
      records.map((record) => displayValue(record.source_detail)),
    ),
    ownerWorkload,
    first1000DoctorCount: campaignDoctorIds.size,
    nonFirst1000DoctorCount: Math.max(
      doctorIds.size - campaignDoctorIds.size,
      0,
    ),
  };
}

export function displayDoctorName(doctor: DoctorProfile | null) {
  if (!doctor) return "Doctor details unavailable";
  return `${doctor.first_name} ${doctor.last_name}`.trim();
}

export function displayEmployeeName(employee: AcquisitionEmployee | null) {
  if (!employee) return "Owner not available";
  return `${employee.first_name} ${employee.last_name}`.trim();
}

export function sortRecentAcquisitions(records: DoctorAcquisitionRecord[]) {
  return [...records].sort((left, right) =>
    right.created_at.localeCompare(left.created_at),
  );
}
