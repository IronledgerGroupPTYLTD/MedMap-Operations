import {
  Activity,
  BarChart3,
  CalendarDays,
  MapPin,
  Stethoscope,
  Target,
  Users,
} from "lucide-react";
import { AppShell } from "@/components/medmap/AppShell";
import {
  buildDoctorAcquisitionMetrics,
  displayDoctorName,
  displayEmployeeName,
  sortRecentAcquisitions,
  useDoctorAcquisitionDashboard,
  type AcquisitionBreakdown,
  type DoctorAcquisitionRecord,
} from "@/lib/doctor-acquisition-dashboard";
import { cn } from "@/lib/utils";

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

function statusClass(status: string) {
  const value = status.trim().toLowerCase();
  if (
    ["converted", "enrolled", "active", "complete", "completed"].includes(value)
  ) {
    return "bg-[#e8f8f2] text-[#168465]";
  }
  if (["lost", "inactive", "closed", "cancelled", "canceled"].includes(value)) {
    return "bg-[#ffe5e3] text-[#bd504d]";
  }
  if (["contacted", "in progress", "assigned"].includes(value)) {
    return "bg-[#f1edff] text-[#755bc0]";
  }
  return "bg-[#fff2d9] text-[#9a6419]";
}

function formatPercent(value: number | null) {
  return value === null ? "—" : `${value.toFixed(1)}%`;
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

function BreakdownList({ rows }: { rows: AcquisitionBreakdown[] }) {
  if (!rows.length)
    return <StateMessage>No live values are available.</StateMessage>;
  return (
    <div className="space-y-2">
      {rows.slice(0, 8).map((row) => (
        <div
          key={row.label}
          className="flex items-center justify-between gap-3 rounded-xl bg-[#f7f9fb] px-3 py-2.5"
        >
          <span className="truncate text-[11px] font-medium text-slate-600">
            {row.label}
          </span>
          <span className="shrink-0 font-display text-[17px] font-bold text-[#152239]">
            {row.count}
          </span>
        </div>
      ))}
    </div>
  );
}

function Metric({
  label,
  value,
  detail,
  tone,
  icon: Icon,
}: {
  label: string;
  value: string;
  detail: string;
  tone: "mint" | "blue" | "amber" | "red";
  icon: typeof Activity;
}) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_5px_20px_rgba(21,36,58,0.035)]">
      <span
        className={cn(
          "grid size-9 place-items-center rounded-xl",
          tone === "mint" && "bg-[#e8f8f2] text-[#1b9975]",
          tone === "blue" && "bg-[#eaf3ff] text-[#4a87c9]",
          tone === "amber" && "bg-[#fff2d9] text-[#b3781f]",
          tone === "red" && "bg-[#ffe9e6] text-[#bf5b56]",
        )}
      >
        <Icon size={17} />
      </span>
      <p className="mt-4 text-[11px] font-medium text-slate-500">{label}</p>
      <p className="mt-1 font-display text-[26px] font-bold tracking-[-0.06em] text-[#152239]">
        {value}
      </p>
      <p className="mt-1 text-[10px] text-slate-400">{detail}</p>
    </div>
  );
}

function ActivityRow({ record }: { record: DoctorAcquisitionRecord }) {
  const doctor = record.doctor;
  return (
    <div className="grid gap-2 rounded-xl border border-slate-100 bg-[#f8fafc] p-3 sm:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)_auto] sm:items-center">
      <div className="min-w-0">
        <p className="truncate text-[11px] font-bold text-slate-700">
          {displayDoctorName(doctor)}
        </p>
        <p className="mt-1 truncate text-[10px] text-slate-400">
          {doctor?.practice_name ||
            doctor?.specialty ||
            "Doctor profile details unavailable"}
        </p>
      </div>
      <div className="min-w-0 text-[10px] text-slate-400">
        <p className="truncate">
          {record.acquisition_channel?.trim() || "Unknown / Unspecified"}
        </p>
        <p className="mt-1 truncate">{displayEmployeeName(record.owner)}</p>
      </div>
      <div className="flex items-center justify-between gap-3 sm:block sm:text-right">
        <span
          className={cn(
            "inline-flex rounded-full px-2 py-1 text-[10px] font-bold",
            statusClass(record.status),
          )}
        >
          {record.status}
        </span>
        <p className="mt-1 text-[10px] text-slate-400">
          {formatLiveDate(record.created_at)}
        </p>
      </div>
    </div>
  );
}

function GeographyList({ records }: { records: DoctorAcquisitionRecord[] }) {
  const values = new Map<string, number>();
  records.forEach((record) => {
    const location =
      record.doctor?.province?.trim() || record.doctor?.city?.trim();
    if (location) values.set(location, (values.get(location) ?? 0) + 1);
  });
  const rows = [...values.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort(
      (left, right) =>
        right.count - left.count || left.label.localeCompare(right.label),
    );
  return <BreakdownList rows={rows} />;
}

export default function DoctorAcquisition() {
  const dashboard = useDoctorAcquisitionDashboard();
  const data = dashboard.data;
  const metrics = buildDoctorAcquisitionMetrics(data);
  const recentRecords = sortRecentAcquisitions(data?.acquisitions ?? []);

  return (
    <AppShell>
      <div className="mx-auto max-w-[1440px] px-5 pb-12 pt-8 sm:px-8 xl:px-10">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <div className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.17em] text-[#b3781f]">
              <Stethoscope size={13} /> Operations · Doctor Acquisition
            </div>
            <h1 className="max-w-[900px] font-display text-[32px] font-bold tracking-[-0.06em] text-[#152239] sm:text-[39px]">
              Doctor acquisition, with a source for every enrolment.
            </h1>
            <p className="mt-2 max-w-[760px] text-[13px] leading-6 text-slate-500">
              Live acquisition records with doctor context, channels, ownership
              and conversion milestones from the authenticated organisation.
            </p>
          </div>
        </div>

        {dashboard.isPending && (
          <div className="mt-5">
            <StateMessage>Loading live doctor acquisition data...</StateMessage>
          </div>
        )}
        {dashboard.isError && (
          <div className="mt-5">
            <StateMessage tone="error">
              Doctor acquisition data could not be loaded. Try again after the
              connection is available.
            </StateMessage>
          </div>
        )}

        {data && !dashboard.isError && (
          <>
            {!metrics.recordCount && (
              <div className="mt-5">
                <StateMessage>No doctor acquisition records yet.</StateMessage>
              </div>
            )}

            <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <Metric
                label="Acquisition pipeline"
                value={String(metrics.recordCount)}
                detail={`${metrics.uniqueDoctorCount} unique doctors represented`}
                tone="blue"
                icon={Stethoscope}
              />
              <Metric
                label="Contacted records"
                value={String(metrics.contactedCount)}
                detail={`${metrics.enrolledCount} enrolled records`}
                tone="mint"
                icon={Activity}
              />
              <Metric
                label="Converted records"
                value={String(metrics.convertedCount)}
                detail={`${metrics.lostCount} lost records`}
                tone="amber"
                icon={Target}
              />
              <Metric
                label="Conversion rate"
                value={formatPercent(metrics.conversionRate)}
                detail={`${metrics.convertedCount} converted / ${metrics.eligibleRecordCount} eligible records`}
                tone="red"
                icon={BarChart3}
              />
            </div>

            <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
              <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_5px_20px_rgba(21,36,58,0.035)] sm:p-6">
                <div className="flex items-center gap-2">
                  <span className="grid size-8 place-items-center rounded-lg bg-[#eaf3ff] text-[#4a87c9]">
                    <BarChart3 size={16} />
                  </span>
                  <h2 className="font-display text-[16px] font-bold text-[#152239]">
                    Pipeline status
                  </h2>
                </div>
                <p className="mt-2 text-[11px] text-slate-400">
                  Actual `doctor_acquisition.status` values returned by the
                  organisation.
                </p>
                <div className="mt-4">
                  <BreakdownList rows={metrics.statuses} />
                </div>
              </section>
              <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_5px_20px_rgba(21,36,58,0.035)] sm:p-6">
                <div className="flex items-center gap-2">
                  <span className="grid size-8 place-items-center rounded-lg bg-[#fff2d9] text-[#b3781f]">
                    <Target size={16} />
                  </span>
                  <h2 className="font-display text-[16px] font-bold text-[#152239]">
                    Acquisition channels
                  </h2>
                </div>
                <p className="mt-2 text-[11px] text-slate-400">
                  Grouped from the actual acquisition channel field.
                </p>
                <div className="mt-4">
                  <BreakdownList rows={metrics.channels} />
                </div>
              </section>
            </div>

            <div className="mt-5 grid gap-5 lg:grid-cols-3">
              <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_5px_20px_rgba(21,36,58,0.035)] sm:p-6">
                <div className="flex items-center gap-2">
                  <span className="grid size-8 place-items-center rounded-lg bg-[#e8f8f2] text-[#1b9975]">
                    <Users size={16} />
                  </span>
                  <h2 className="font-display text-[16px] font-bold text-[#152239]">
                    Owner workload
                  </h2>
                </div>
                <p className="mt-2 text-[11px] text-slate-400">
                  Acquisition records grouped by assigned owner.
                </p>
                <div className="mt-4 space-y-2">
                  {metrics.ownerWorkload.length ? (
                    metrics.ownerWorkload.slice(0, 6).map((owner) => (
                      <div
                        key={owner.id ?? "unassigned"}
                        className="rounded-xl bg-[#f7f9fb] p-3"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-[11px] font-bold text-slate-700">
                              {owner.name}
                            </p>
                            <p className="mt-1 truncate text-[10px] text-slate-400">
                              {owner.jobTitle || "Acquisition owner"}
                            </p>
                          </div>
                          <span className="font-display text-[19px] font-bold text-[#152239]">
                            {owner.count}
                          </span>
                        </div>
                        <p className="mt-2 text-[10px] text-slate-400">
                          {owner.statuses
                            .map((status) => `${status.label}: ${status.count}`)
                            .join(" · ")}
                        </p>
                      </div>
                    ))
                  ) : (
                    <StateMessage>No owner workload is available.</StateMessage>
                  )}
                </div>
              </section>
              <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_5px_20px_rgba(21,36,58,0.035)] sm:p-6">
                <div className="flex items-center gap-2">
                  <span className="grid size-8 place-items-center rounded-lg bg-[#f1edff] text-[#755bc0]">
                    <MapPin size={16} />
                  </span>
                  <h2 className="font-display text-[16px] font-bold text-[#152239]">
                    Practice context
                  </h2>
                </div>
                <p className="mt-2 text-[11px] text-slate-400">
                  Recorded city or province from related doctor profiles.
                </p>
                <div className="mt-4">
                  <GeographyList records={data.acquisitions} />
                </div>
              </section>
              <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_5px_20px_rgba(21,36,58,0.035)] sm:p-6">
                <div className="flex items-center gap-2">
                  <span className="grid size-8 place-items-center rounded-lg bg-[#fff2d9] text-[#b3781f]">
                    <CalendarDays size={16} />
                  </span>
                  <h2 className="font-display text-[16px] font-bold text-[#152239]">
                    First-1000 campaign
                  </h2>
                </div>
                <p className="mt-2 text-[11px] text-slate-400">
                  Descriptive campaign flags from related doctor profiles.
                </p>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between rounded-xl bg-[#f7f9fb] px-3 py-3">
                    <span className="text-[11px] text-slate-500">
                      Marked campaign doctors
                    </span>
                    <strong className="font-display text-[21px] text-[#152239]">
                      {metrics.first1000DoctorCount}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-[#f7f9fb] px-3 py-3">
                    <span className="text-[11px] text-slate-500">
                      Not marked
                    </span>
                    <strong className="font-display text-[21px] text-[#152239]">
                      {metrics.nonFirst1000DoctorCount}
                    </strong>
                  </div>
                </div>
              </section>
            </div>

            <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
              <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_5px_20px_rgba(21,36,58,0.035)] sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="grid size-8 place-items-center rounded-lg bg-[#eaf3ff] text-[#4a87c9]">
                        <Stethoscope size={16} />
                      </span>
                      <h2 className="font-display text-[16px] font-bold text-[#152239]">
                        Recent acquisition activity
                      </h2>
                    </div>
                    <p className="mt-2 text-[11px] text-slate-400">
                      Latest records sorted by their actual created timestamp.
                    </p>
                  </div>
                  <span className="rounded-full bg-[#eaf3ff] px-2.5 py-1 text-[10px] font-bold text-[#4a87c9]">
                    {metrics.recordCount}
                  </span>
                </div>
                <div className="mt-4 space-y-2">
                  {recentRecords.length ? (
                    recentRecords
                      .slice(0, 8)
                      .map((record) => (
                        <ActivityRow key={record.id} record={record} />
                      ))
                  ) : (
                    <StateMessage>
                      No doctor acquisition records yet.
                    </StateMessage>
                  )}
                </div>
              </section>
              <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_5px_20px_rgba(21,36,58,0.035)] sm:p-6">
                <div className="flex items-center gap-2">
                  <span className="grid size-8 place-items-center rounded-lg bg-[#f1edff] text-[#755bc0]">
                    <Target size={16} />
                  </span>
                  <h2 className="font-display text-[16px] font-bold text-[#152239]">
                    Source detail
                  </h2>
                </div>
                <p className="mt-2 text-[11px] text-slate-400">
                  Recorded source detail values, including unspecified records.
                </p>
                <div className="mt-4">
                  <BreakdownList rows={metrics.sourceDetails} />
                </div>
              </section>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
