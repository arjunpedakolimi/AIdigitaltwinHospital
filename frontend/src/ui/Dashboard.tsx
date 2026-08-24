import type { HospitalData } from "../hooks/useHospitalData";
import { useEffect, useState } from "react";
import {
  departments,
  STATUS_COLORS,
  STATUS_LABEL,
  Status,
} from "../data/hospital";
import { CameraMode } from "../three/CameraRig";

function StatusDot({ status, size = 8 }: { status: Status; size?: number }) {
  return (
    <span
      className="inline-block rounded-full"
      style={{
        width: size,
        height: size,
        background: STATUS_COLORS[status],
        boxShadow: `0 0 ${size}px ${STATUS_COLORS[status]}`,
      }}
    />
  );
}

/* ---------- Top command bar ---------- */
export function TopBar() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <header className="flex items-center justify-between border-b border-cyan-500/20 bg-slate-950/70 px-5 py-3 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <div className="grid h-9 w-9 place-items-center border border-cyan-300/40 bg-cyan-400/10 shadow-lg shadow-cyan-500/20">
          <span className="font-mono text-xs font-black text-cyan-300">M+</span>
        </div>
        <div>
          <h1 className="text-sm font-semibold tracking-[0.08em] text-white">
            MEDITWIN <span className="font-normal text-cyan-400">/ COMMAND</span>
          </h1>
          <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400">
            Enterprise Hospital Digital Twin
          </p>
        </div>
      </div>
      <div className="hidden items-center gap-6 md:flex">
        <div className="flex items-center gap-2 text-xs text-emerald-400">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          LIVE TELEMETRY
        </div>
        <div className="text-right">
          <div className="font-mono text-sm text-white">
            {time.toLocaleTimeString([], { hour12: false })}
          </div>
          <div className="text-[10px] text-slate-400">
            {time.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })}
          </div>
        </div>
      </div>
    </header>
  );
}

/* ---------- Global KPI strip ---------- */
export function GlobalMetrics({
  data,
  phase,
  journeyStepId,
}: {
  data?: HospitalData | null;
  phase?: string;
  journeyStepId?: number;
}) {
  const buildLiveMetrics = (): GlobalMetric[] => {
if (!data) {
    return [
      {
        label: "Patients",
        value: "Loading...",
        delta: "Connecting to MongoDB",
        status: "normal",
        icon: "PT",
      },
      {
        label: "ICU Occupancy",
        value: "Loading...",
        delta: "Connecting to MongoDB",
        status: "normal",
        icon: "IC",
      },
      {
        label: "Available Beds",
        value: "Loading...",
        delta: "Connecting to MongoDB",
        status: "normal",
        icon: "BD",
      },
      {
        label: "Clinical Staff",
        value: "Loading...",
        delta: "Connecting to MongoDB",
        status: "normal",
        icon: "MD",
      },
      {
        label: "Equipment",
        value: "Loading...",
        delta: "Connecting to MongoDB",
        status: "normal",
        icon: "EQ",
      },
      {
        label: "Ambulances",
        value: "Loading...",
        delta: "Connecting to MongoDB",
        status: "normal",
        icon: "AM",
      },
      {
        label: "Waiting Time",
        value: "Loading...",
        delta: "Connecting to MongoDB",
        status: "normal",
        icon: "WT",
      },
      {
        label: "Emergency Level",
        value: "Loading...",
        delta: "Connecting to MongoDB",
        status: "normal",
        icon: "EL",
      },
    ];
  }
    const kpis = data.kpis ?? [];
    const emergencyEvents = data.emergencyEvents ?? [];
    const ambulances = data.ambulances ?? [];

    const latestKpi = [...kpis].sort((a, b) => {
      const aTime = new Date(a?.timestamp ?? 0).getTime();
      const bTime = new Date(b?.timestamp ?? 0).getTime();
      return bTime - aTime;
    })[0];

if (!latestKpi) {
  return [
    {
      label: "Patients",
      value: "No KPI data",
      delta: "MongoDB",
      status: "normal",
      icon: "PT",
    },
    {
      label: "ICU Occupancy",
      value: "No KPI data",
      delta: "MongoDB",
      status: "normal",
      icon: "IC",
    },
    {
      label: "Available Beds",
      value: "No KPI data",
      delta: "MongoDB",
      status: "normal",
      icon: "BD",
    },
    {
      label: "Clinical Staff",
      value: "No KPI data",
      delta: "MongoDB",
      status: "normal",
      icon: "MD",
    },
    {
      label: "Equipment",
      value: "No KPI data",
      delta: "MongoDB",
      status: "normal",
      icon: "EQ",
    },
    {
      label: "Ambulances",
      value: "No KPI data",
      delta: "MongoDB",
      status: "normal",
      icon: "AM",
    },
    {
      label: "Waiting Time",
      value: "No KPI data",
      delta: "MongoDB",
      status: "normal",
      icon: "WT",
    },
    {
      label: "Emergency Level",
      value: "No KPI data",
      delta: "MongoDB",
      status: "normal",
      icon: "EL",
    },
  ];
}
    const patientCount = Number(
      latestKpi.total_patients ?? 0
    );

    const occupiedBeds = Number(
      latestKpi.occupied_beds ?? 0
    );

    const totalBeds = Number(
      latestKpi.total_beds ?? 0
    );

    const availableBeds = Number(
      latestKpi.available_beds ?? 0
    );

    const bedOccupancy = Number(
      latestKpi.bed_occupancy_percent ?? 0
    );

    const doctors = Number(
      latestKpi.total_doctors ?? 0
    );

    const nurses = Number(
      latestKpi.total_nurses ?? 0
    );

    const clinicalStaff = doctors + nurses;

    const equipmentOperational = Number(
      latestKpi.active_equipment ?? 0
    );

    const equipmentTotal = Number(
      latestKpi.total_equipment ?? 0
    );

    const equipmentPercent = Number(
      latestKpi.equipment_utilization_percent ?? 0
    );

    const availableAmbulances = ambulances.filter(
      (a) =>
        String(a?.status ?? "").toLowerCase() ===
        "available"
    ).length;

    const totalAmbulances = ambulances.length;

    const waitingTime = Number(
      latestKpi.average_wait_time_minutes ?? 0
    );

    const criticalEvents = emergencyEvents.filter(
      (e) =>
        String(e?.priority ?? "").toLowerCase() ===
        "critical"
    ).length;

    const highEvents = emergencyEvents.filter(
      (e) =>
        String(e?.priority ?? "").toLowerCase() ===
        "high"
    ).length;

    let emergencyLevel = "NORMAL";
    let emergencyStatus: Status = "normal";

    if (criticalEvents > 0) {
      emergencyLevel = "CRITICAL";
      emergencyStatus = "critical";
    } else if (highEvents > 0) {
      emergencyLevel = "ELEVATED";
      emergencyStatus = "busy";
    }

    return [
      {
        label: "Patients",
        value: patientCount.toLocaleString(),
        delta: "MongoDB KPI",
        status: "normal",
        icon: "PT",
      },
      {
        label: "ICU Occupancy",
        value: `${bedOccupancy}%`,
        delta: `${occupiedBeds}/${totalBeds}`,
        status:
          bedOccupancy >= 85
            ? "critical"
            : bedOccupancy >= 70
              ? "busy"
              : "normal",
        icon: "IC",
      },
      {
        label: "Available Beds",
        value: String(availableBeds),
        delta: `${occupiedBeds}/${totalBeds} occupied`,
        status:
          availableBeds < 10
            ? "critical"
            : availableBeds < 25
              ? "busy"
              : "normal",
        icon: "BD",
      },
      {
        label: "Clinical Staff",
        value: clinicalStaff.toLocaleString(),
        delta: `${doctors} doctors · ${nurses} nurses`,
        status: "normal",
        icon: "MD",
      },
      {
        label: "Equipment",
        value: `${equipmentPercent}%`,
        delta: `${equipmentOperational}/${equipmentTotal} operational`,
        status:
          equipmentPercent < 80
            ? "critical"
            : equipmentPercent < 95
              ? "busy"
              : "normal",
        icon: "EQ",
      },
      {
        label: "Ambulances",
        value: `${availableAmbulances} ready`,
        delta: `${totalAmbulances} total`,
        status:
          availableAmbulances === 0
            ? "critical"
            : availableAmbulances < 3
              ? "busy"
              : "normal",
        icon: "AM",
      },
      {
        label: "Waiting Time",
        value: `${waitingTime} min`,
        delta: "MongoDB KPI",
        status:
          waitingTime >= 30
            ? "critical"
            : waitingTime >= 15
              ? "busy"
              : "normal",
        icon: "WT",
      },
      {
        label: "Emergency Level",
        value: emergencyLevel,
        delta: `${criticalEvents} critical · ${highEvents} high`,
        status: emergencyStatus,
        icon: "EL",
      },
    ];
  };
  const metrics = buildLiveMetrics();

  return (

    <div className="grid grid-cols-2 gap-2 border-b border-white/5 bg-slate-950/50 p-3 sm:grid-cols-4 xl:grid-cols-8">
      {metrics.map((m) => (
        <div
          key={m.label}
          className="group relative overflow-hidden rounded-lg border border-white/5 bg-white/[0.03] p-2.5 transition hover:border-cyan-400/30"
        >
          <div
            className="absolute inset-x-0 top-0 h-0.5"
            style={{
              background: STATUS_COLORS[m.status],
            }}
          />

          <div className="flex items-center justify-between">
            <span className="text-base">{m.icon}</span>
            <StatusDot status={m.status} size={7} />
          </div>

          <div className="mt-1 text-lg font-bold leading-none text-white">
            {m.value}
          </div>

          <div className="mt-0.5 flex items-center gap-1 text-[10px] text-slate-400">
            <span className="truncate">
              {m.label}
            </span>
          </div>

          {m.delta && (
            <div className="text-[10px] font-medium text-cyan-400/80">
              {m.delta}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ---------- Department list (left) ---------- */
export function DepartmentList({
  selected,
  onSelect,
  onHover,
  liveStatuses = {},
  focus,
}: {
  selected: string | null;
  onSelect: (id: string | null) => void;
  onHover: (id: string | null) => void;
  liveStatuses?: Record<string, Status>;
  focus?: string;
}) {
  const stat = (id: string, fallback: Status) => liveStatuses[id] ?? fallback;
  const counts = departments.reduce(
    (acc, d) => {
      acc[stat(d.id, d.status)]++;
      return acc;
    },
    { normal: 0, busy: 0, critical: 0 } as Record<Status, number>
  );

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-white/5 bg-slate-950/60 backdrop-blur-xl">
      <div className="border-b border-white/5 p-3">
        <h2 className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
          Departments
        </h2>
        <div className="mt-2 flex gap-2 text-[10px]">
          {(["normal", "busy", "critical"] as Status[]).map((s) => (
            <span
              key={s}
              className="flex items-center gap-1 rounded-full bg-white/5 px-2 py-0.5 text-slate-300"
            >
              <StatusDot status={s} size={6} /> {counts[s]}
            </span>
          ))}
        </div>
      </div>
      <div className="flex-1 space-y-1 overflow-y-auto p-2">
        {departments.map((d) => {
          const active = selected === d.id;
          const isFocus = focus === d.id;
          const s = stat(d.id, d.status);
          return (
            <button
              key={d.id}
              onClick={() => onSelect(active ? null : d.id)}
              onMouseEnter={() => onHover(d.id)}
              onMouseLeave={() => onHover(null)}
              className={`flex w-full items-center gap-2.5 rounded-lg border px-2.5 py-2 text-left transition ${
                active
                  ? "border-cyan-400/50 bg-cyan-500/10"
                  : isFocus
                  ? "border-cyan-400/30 bg-cyan-500/[0.06]"
                  : "border-transparent bg-white/[0.02] hover:bg-white/[0.05]"
              }`}
            >
              <span className="text-lg">{d.icon}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs font-semibold text-white">{d.name}</span>
                <span className="block text-[10px] text-slate-400">{d.category}</span>
              </span>
              <StatusDot status={s} />
            </button>
          );
        })}
      </div>
      <div className="border-t border-white/5 p-3 text-[10px] leading-relaxed text-slate-500">
        <span className="text-cyan-400">●</span> Click any block in the 3D scene or list to inspect
        real-time data.
      </div>
    </aside>
  );
}

/* ---------- Detail panel (right) ---------- */
export function DetailPanel({
  selectedId,
  liveStatuses = {},
  cameraMode,
  selectedRoom,
  onToggleInterior,
}: {
  selectedId: string | null;
  liveStatuses?: Record<string, Status>;
  cameraMode: CameraMode;
  selectedRoom: string | null;
  onToggleInterior: () => void;
}) {
  const dept = departments.find((d) => d.id === selectedId);

  if (!dept) {
    return (
      <aside className="hidden w-80 shrink-0 flex-col border-l border-white/5 bg-slate-950/60 p-5 backdrop-blur-xl lg:flex">
        <div className="flex h-full flex-col items-center justify-center text-center">
          <div className="mb-3 grid h-14 w-14 animate-pulse place-items-center border border-cyan-300/30 bg-cyan-500/10 font-mono text-sm font-bold text-cyan-300">
            AI
          </div>
          <h3 className="text-sm font-semibold text-white">AI Digital Twin Ready</h3>
          <p className="mt-2 max-w-[16rem] text-xs leading-relaxed text-slate-400">
            Select a department to view live occupancy, staffing, equipment status and interior
            layout intelligence.
          </p>
          <div className="mt-6 grid w-full grid-cols-3 gap-2">
            {(["normal", "busy", "critical"] as Status[]).map((s) => (
              <div
                key={s}
                className="rounded-lg border border-white/5 bg-white/[0.03] p-2 text-center"
              >
                <StatusDot status={s} />
                <div className="mt-1 text-[10px] text-slate-400">{STATUS_LABEL[s]}</div>
              </div>
            ))}
          </div>
        </div>
      </aside>
    );
  }

  const status = liveStatuses[dept.id] ?? dept.status;
  const seed = dept.id.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const twinTelemetry = [
    ["Patient count", String((seed % 34) + (status === "critical" ? 28 : status === "busy" ? 18 : 8))],
    ["Occupancy", status === "critical" ? "96%" : status === "busy" ? "84%" : `${62 + (seed % 15)}%`],
    ["Doctors / Nurses", `${4 + (seed % 8)} / ${9 + (seed % 14)}`],
    ["Equipment", status === "critical" ? "92% in use" : "98.7% online"],
    ["Ventilators", dept.id.includes("icu") ? (status === "critical" ? "11 / 12" : "9 / 12") : `${seed % 4} allocated`],
    ["Medical oxygen", status === "critical" ? "4.0 bar" : "4.2 bar"],
    ["Power usage", `${180 + (seed % 420)} kW`],
    ["Ambulance link", dept.id === "emergency" ? "3 inbound" : "GPS synchronized"],
  ];

  return (
    <aside className="flex w-80 shrink-0 flex-col overflow-y-auto border-l border-white/5 bg-slate-950/70 backdrop-blur-xl">
      {/* header */}
      <div className="relative overflow-hidden border-b border-white/5 p-5">
        <div
          className="absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-20 blur-2xl"
          style={{ background: dept.color }}
        />
        <div className="relative">
          <div className="mb-2 flex items-center justify-between">
            <span className="grid h-10 min-w-10 place-items-center border border-white/10 bg-white/5 px-2 font-mono text-xs font-bold text-cyan-200">{dept.icon}</span>
            <span
              className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold"
              style={{
                background: `${STATUS_COLORS[status]}22`,
                color: STATUS_COLORS[status],
              }}
            >
              <StatusDot status={status} /> {STATUS_LABEL[status]}
            </span>
          </div>
          <h2 className="text-lg font-bold text-white">{dept.name}</h2>
          <p className="text-[11px] uppercase tracking-widest text-cyan-400">{dept.category}</p>
          <p className="mt-2 text-xs leading-relaxed text-slate-400">{dept.summary}</p>
          <button
            onClick={onToggleInterior}
            className="mt-4 w-full border border-cyan-400/35 bg-cyan-400/10 px-3 py-2 text-[11px] font-semibold tracking-wide text-cyan-200 transition hover:bg-cyan-400/20"
          >
            {cameraMode === "interior" ? "Return to campus" : "Explore department interior"}
          </button>
        </div>
      </div>

      {/* live metrics */}
      <div className="p-4">
        <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
          Live Metrics
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {dept.metrics.map((m) => (
            <div key={m.label} className="rounded-lg border border-white/5 bg-white/[0.03] p-3">
              <div className="text-base font-bold text-white">{m.value}</div>
              <div className="text-[10px] text-slate-400">{m.label}</div>
              {m.sub && <div className="mt-0.5 text-[10px] text-cyan-400/80">{m.sub}</div>}
            </div>
          ))}
        </div>
      </div>

      <div className="border-y border-white/5 px-4 py-4">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">Twin Telemetry</h3>
          <span className="flex items-center gap-1.5 font-mono text-[8px] text-emerald-300">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" /> STREAMING
          </span>
        </div>
        <div className="divide-y divide-white/[0.05]">
          {twinTelemetry.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between py-1.5 text-[10px]">
              <span className="text-slate-500">{label}</span><span className="font-mono text-slate-200">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* interior layout */}
      {dept.interior && (
        <div className="px-4 pb-6">
          <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
            Interior Layout
          </h3>
          <div className="space-y-2">
            {dept.interior.map((z, i) => (
              <button
                onClick={() => cameraMode !== "interior" && onToggleInterior()}
                key={z.name}
                className={`flex w-full items-start gap-3 border p-2.5 text-left transition ${selectedRoom === z.name ? "border-cyan-400/40 bg-cyan-400/10" : "border-white/5 bg-white/[0.02] hover:border-white/15"}`}
              >
                <span
                  className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md text-[11px] font-bold text-slate-900"
                  style={{ background: dept.color }}
                >
                  {i + 1}
                </span>
                <div>
                  <div className="text-xs font-semibold text-white">{z.name}</div>
                  <div className="text-[10px] leading-snug text-slate-400">{z.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
