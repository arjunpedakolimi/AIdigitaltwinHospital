import { departments, STATUS_COLORS, Status } from "../data/hospital";

/**
 * Rich per-department popup that opens when any building is clicked.
 * Shows the specific data judges expect:
 *  - Emergency: live patients + waiting time
 *  - ICU: beds, monitors, ventilators
 *  - Laboratory: pending tests
 *  - Pharmacy: medicine stock
 *  - Operation Theatre: surgery schedule
 *  - Radiology: CT/MRI queue
 *  - Blood Bank: blood units
 *  - Oxygen Plant: oxygen level
 *  - Administration: staff allocation
 */

interface DeptSpecific {
  hero: string;
  tint: string;
  rows: { label: string; value: string | number; accent?: string; bar?: number }[];
  list?: { title: string; items: { label: string; value: string; status?: "ok" | "warn" | "crit" }[] };
}

function getSpecific(deptId: string, statuses: Record<string, Status>): DeptSpecific {
  const status = statuses[deptId] ?? "normal";
  const critical = status === "critical";
  switch (deptId) {
    case "emergency":
      return {
        hero: "🚑 EMERGENCY DEPARTMENT",
        tint: "#ef5368",
        rows: [
          { label: "Active Patients", value: critical ? 23 : 11, accent: "#ef5368" },
          { label: "Waiting Time", value: critical ? "18 min" : "7 min", accent: critical ? "#ef5368" : "#20d991", bar: critical ? 90 : 35 },
          { label: "Treatment Bays", value: critical ? "15/16" : "9/16", bar: critical ? 94 : 56 },
          { label: "Trauma Bay Status", value: critical ? "3 ACTIVE" : "READY" },
          { label: "Ambulances Inbound", value: critical ? 3 : 0, accent: critical ? "#ef5368" : "#94a3b8" },
        ],
        list: {
          title: "LIVE PATIENT QUEUE",
          items: [
            { label: "P-4021 Chest pain", value: "Bay 3", status: "crit" },
            { label: "P-4022 Trauma", value: "Resus 1", status: "crit" },
            { label: "P-4023 Fracture", value: "Bay 7", status: "warn" },
            { label: "P-4024 Fever", value: "Triage", status: "ok" },
            { label: "P-4025 Abdominal", value: "Waiting", status: "warn" },
          ],
        },
      };
    case "icu":
    case "icuB":
      return {
        hero: deptId === "icu" ? "🏥 ICU BLOCK A" : "🏥 ICU BLOCK B",
        tint: "#ff9d42",
        rows: [
          { label: "Occupancy", value: critical ? "19/20" : "14/20", accent: critical ? "#ef5368" : "#f4c849", bar: critical ? 95 : 70 },
          { label: "Ventilators Active", value: critical ? "11/12" : "9/12", bar: critical ? 92 : 75 },
          { label: "Nurse Ratio", value: critical ? "1:1" : "1:2" },
          { label: "Oxygen Pressure", value: "4.2 bar", accent: "#20d991" },
          { label: "Isolation Rooms", value: "2/3 free" },
        ],
        list: {
          title: "BED STATUS",
          items: [
            { label: "ICU-04 Elena Garcia", value: critical ? "CRITICAL" : "STABLE", status: critical ? "crit" : "ok" },
            { label: "ICU-07 David Okonkwo", value: "CRITICAL", status: "crit" },
            { label: "ICU-02 Marcus Reid", value: "OBSERVATION", status: "warn" },
            { label: "ICU-10 Sofia Lindqvist", value: "OBSERVATION", status: "warn" },
            { label: "ICU-12 Emergency Bed", value: "READY", status: "ok" },
          ],
        },
      };
    case "lab":
      return {
        hero: "🔬 CLINICAL LABORATORY",
        tint: "#35d3bd",
        rows: [
          { label: "Tests Queued", value: 128, bar: 64 },
          { label: "Avg Turnaround", value: "34 min", accent: "#f4c849" },
          { label: "Analyzers Online", value: "12/12", accent: "#20d991" },
          { label: "Samples Today", value: "1,042" },
          { label: "Urgent (STAT)", value: 7, accent: "#ef5368" },
        ],
        list: {
          title: "PENDING TESTS",
          items: [
            { label: "P-4022 ABG + Lactate", value: "STAT · 4 min", status: "crit" },
            { label: "P-4022 Crossmatch", value: "STAT · 6 min", status: "crit" },
            { label: "P-4021 Troponin", value: "12 min", status: "warn" },
            { label: "P-4028 Basic Panel", value: "22 min", status: "ok" },
            { label: "P-4031 Coagulation", value: "18 min", status: "ok" },
          ],
        },
      };
    case "pharmacy":
      return {
        hero: "💊 CENTRAL PHARMACY",
        tint: "#39d89a",
        rows: [
          { label: "Prescriptions Today", value: 312 },
          { label: "Stock Level", value: "94%", accent: "#20d991", bar: 94 },
          { label: "Cold Storage", value: "4.1°C", accent: "#20d991" },
          { label: "Dispense Time", value: "6 min avg" },
          { label: "Low Stock Alerts", value: 3, accent: "#f4c849" },
        ],
        list: {
          title: "MEDICINE STOCK",
          items: [
            { label: "Noradrenaline", value: "48 amps", status: "ok" },
            { label: "Piperacillin/Taz", value: "22 vials", status: "warn" },
            { label: "Tranexamic Acid", value: "156 amps", status: "ok" },
            { label: "Fentanyl 50mcg", value: "8 amps", status: "crit" },
            { label: "Ceftriaxone 2g", value: "94 vials", status: "ok" },
          ],
        },
      };
    case "ot":
      return {
        hero: "🔪 OPERATION THEATRE",
        tint: "#a789ff",
        rows: [
          { label: "Theatres Active", value: "4/6", bar: 66 },
          { label: "Cases Today", value: 17 },
          { label: "Recovery Beds", value: "8/12", bar: 66 },
          { label: "Sterile Status", value: "VALID", accent: "#20d991" },
          { label: "Emergency OT", value: "OT-3 STANDBY", accent: "#f4c849" },
        ],
        list: {
          title: "SURGERY SCHEDULE",
          items: [
            { label: "OT-1 Appendectomy", value: "10:30 → 12:00", status: "ok" },
            { label: "OT-2 Cholecystectomy", value: "11:15 → 13:30", status: "ok" },
            { label: "OT-3 EMERGENCY Trauma", value: "STANDBY", status: "warn" },
            { label: "OT-4 Hernia repair", value: "14:00 → 15:30", status: "ok" },
            { label: "OT-5 Hip replacement", value: "15:00 → 18:00", status: "ok" },
          ],
        },
      };
    case "radiology":
      return {
        hero: "📷 RADIOLOGY & IMAGING",
        tint: "#41c7ff",
        rows: [
          { label: "Scans Today", value: 186 },
          { label: "MRI Queue", value: 7, accent: "#f4c849", bar: 70 },
          { label: "CT Queue", value: critical ? 4 : 2, accent: critical ? "#ef5368" : "#20d991" },
          { label: "Systems Online", value: "9/9", accent: "#20d991" },
          { label: "Report Time", value: "28 min avg" },
        ],
        list: {
          title: "CT / MRI QUEUE",
          items: [
            { label: "P-4022 Trauma CT thorax", value: "STAT · IN", status: "crit" },
            { label: "P-4041 Brain MRI", value: "8 min", status: "warn" },
            { label: "P-4019 Abdominal CT", value: "12 min", status: "ok" },
            { label: "P-4033 Spine MRI", value: "24 min", status: "ok" },
            { label: "P-4055 Chest X-ray", value: "5 min", status: "ok" },
          ],
        },
      };
    case "blood":
      return {
        hero: "🩸 BLOOD BANK",
        tint: "#ff6479",
        rows: [
          { label: "Units Ready", value: 428 },
          { label: "O Negative", value: 38, accent: "#20d991" },
          { label: "Crossmatches Active", value: 24, accent: "#f4c849" },
          { label: "Cold Chain", value: "VALID", accent: "#20d991" },
          { label: "Emergency Reserve", value: "READY", accent: "#20d991" },
        ],
        list: {
          title: "BLOOD UNITS",
          items: [
            { label: "O Negative", value: "38 units", status: "ok" },
            { label: "O Positive", value: "112 units", status: "ok" },
            { label: "A Positive", value: "94 units", status: "ok" },
            { label: "AB Negative", value: "6 units", status: "warn" },
            { label: "Platelets", value: "18 units", status: "ok" },
          ],
        },
      };
    case "oxygen":
      return {
        hero: "🫁 MEDICAL OXYGEN PLANT",
        tint: "#5ba6ff",
        rows: [
          { label: "Line Pressure", value: "4.2 bar", accent: "#20d991", bar: 84 },
          { label: "Reserve Tank", value: "87%", accent: "#20d991", bar: 87 },
          { label: "Flow Rate", value: "1,200 L/min" },
          { label: "Manifold Alarms", value: 0, accent: "#20d991" },
          { label: "PSA Generators", value: "2/2 running" },
        ],
        list: {
          title: "OXYGEN DISTRIBUTION",
          items: [
            { label: "ICU-A Manifold", value: "4.2 bar · OK", status: "ok" },
            { label: "ICU-B Manifold", value: "4.2 bar · OK", status: "ok" },
            { label: "Emergency", value: "4.2 bar · OK", status: "ok" },
            { label: "OT Complex", value: "4.2 bar · OK", status: "ok" },
            { label: "Wards A/B", value: "4.0 bar · OK", status: "ok" },
          ],
        },
      };
    case "admin":
      return {
        hero: "🏢 ADMINISTRATION",
        tint: "#8aa1bd",
        rows: [
          { label: "Staff On Site", value: 184 },
          { label: "Doctors on Duty", value: 68 },
          { label: "Nurses on Duty", value: 128 },
          { label: "Compliance", value: "100%", accent: "#20d991" },
          { label: "Open Actions", value: 12, accent: "#f4c849" },
        ],
        list: {
          title: "STAFF ALLOCATION",
          items: [
            { label: "Emergency Dept", value: "18 doctors · 34 nurses", status: "ok" },
            { label: "ICU Blocks", value: "12 doctors · 24 nurses", status: "ok" },
            { label: "Wards A/B", value: "16 doctors · 42 nurses", status: "ok" },
            { label: "OT Complex", value: "14 doctors · 18 nurses", status: "ok" },
            { label: "Diagnostics", value: "8 doctors · 10 nurses", status: "ok" },
          ],
        },
      };
    case "cssd":
      return {
        hero: "🧼 CENTRAL STERILE",
        tint: "#66d9e8",
        rows: [
          { label: "Sets Ready", value: 214 },
          { label: "Cycles Active", value: 5, bar: 62 },
          { label: "Sterility", value: "VALID", accent: "#20d991" },
          { label: "Turnaround", value: "42 min avg" },
        ],
      };
    case "storage":
      return {
        hero: "📦 BIOMED STORAGE",
        tint: "#be83ff",
        rows: [
          { label: "Tracked Assets", value: "3,410" },
          { label: "In Use", value: "2,180", bar: 64 },
          { label: "Ready to Deploy", value: "1,208" },
          { label: "Maintenance Due", value: 22, accent: "#f4c849" },
        ],
      };
    case "power":
      return {
        hero: "⚡ POWER BACKUP",
        tint: "#f6cb55",
        rows: [
          { label: "Grid Load", value: "2.8 MW" },
          { label: "UPS Battery", value: "100%", accent: "#20d991", bar: 100 },
          { label: "Fuel Reserve", value: "72 hr" },
          { label: "Generators", value: "3 ready", accent: "#20d991" },
        ],
      };
    case "ambulanceGarage":
      return {
        hero: "🚑 AMBULANCE GARAGE",
        tint: "#f43f5e",
        rows: [
          { label: "Bays Ready", value: "6/6", accent: "#20d991" },
          { label: "Fleet GPS", value: "LIVE", accent: "#20d991" },
          { label: "Avg Dispatch", value: "42 sec" },
          { label: "Decon Active", value: "Bay 2" },
        ],
        list: {
          title: "FLEET STATUS",
          items: [
            { label: "AMB-01", value: "READY · Bay 1", status: "ok" },
            { label: "AMB-02", value: "Decon · Bay 2", status: "warn" },
            { label: "AMB-03", value: "READY · Bay 3", status: "ok" },
            { label: "AMB-04", value: "DISPATCHED", status: "crit" },
            { label: "AMB-05", value: "READY · Bay 5", status: "ok" },
            { label: "AMB-06", value: "READY · Bay 6", status: "ok" },
          ],
        },
      };
    default:
      const dept = departments.find((d) => d.id === deptId);
      return {
        hero: `🏥 ${dept?.name.toUpperCase() ?? "DEPARTMENT"}`,
        tint: dept?.color ?? "#38bdf8",
        rows: (dept?.metrics ?? []).slice(0, 5).map((m) => ({ label: m.label, value: m.value })),
      };
  }
}

export function DepartmentPopup({ deptId, statuses, onClose, onDrillIn }: { deptId: string; statuses: Record<string, Status>; onClose: () => void; onDrillIn?: (id: string) => void }) {
  const dept = departments.find((d) => d.id === deptId);
  if (!dept) return null;
  const status = statuses[deptId] ?? dept.status;
  const spec = getSpecific(deptId, statuses);
  const canDrillIn = deptId === "icu" || deptId === "icuB";

  return (
    <div className="pointer-events-auto absolute right-4 top-16 z-30 w-[22rem] max-h-[calc(100vh-140px)] overflow-y-auto border-2 shadow-2xl backdrop-blur-xl" style={{ borderColor: `${spec.tint}66`, background: "#060d16f2" }}>
      {/* header */}
      <div className="relative overflow-hidden border-b border-white/8 p-3" style={{ background: `linear-gradient(135deg, ${spec.tint}22, transparent)` }}>
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <div className="font-mono text-[8px] tracking-[0.2em]" style={{ color: spec.tint }}>{dept.category.toUpperCase()}</div>
            <h2 className="mt-0.5 truncate text-sm font-bold text-white">{spec.hero}</h2>
            <div className="mt-0.5 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: STATUS_COLORS[status], boxShadow: `0 0 6px ${STATUS_COLORS[status]}` }} />
              <span className="font-mono text-[9px] uppercase tracking-widest" style={{ color: STATUS_COLORS[status] }}>{status}</span>
            </div>
          </div>
          <button onClick={onClose} className="shrink-0 grid h-6 w-6 place-items-center border border-white/15 bg-black/30 text-slate-400 hover:bg-white/10 hover:text-white">✕</button>
        </div>
        <p className="mt-2 text-[10px] leading-snug text-slate-400">{dept.summary}</p>
      </div>

      {/* live metrics */}
      <div className="p-3">
        <div className="mb-2 font-mono text-[8px] tracking-widest text-slate-400">LIVE METRICS</div>
        <div className="space-y-1.5">
          {spec.rows.map((r) => (
            <div key={r.label}>
              <div className="flex items-center justify-between font-mono text-[10px]">
                <span className="text-slate-400">{r.label}</span>
                <span className="font-bold" style={{ color: r.accent ?? "#e2e8f0" }}>{r.value}</span>
              </div>
              {r.bar !== undefined && (
                <div className="mt-0.5 h-1 overflow-hidden bg-white/8">
                  <div className="h-full transition-all duration-700" style={{ width: `${r.bar}%`, background: r.accent ?? spec.tint, boxShadow: `0 0 6px ${r.accent ?? spec.tint}` }} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* department-specific list */}
      {spec.list && (
        <div className="border-t border-white/8 p-3">
          <div className="mb-2 font-mono text-[8px] tracking-widest" style={{ color: spec.tint }}>{spec.list.title}</div>
          <div className="space-y-1">
            {spec.list.items.map((item) => {
              const c = item.status === "crit" ? "#ef5368" : item.status === "warn" ? "#f4c849" : "#20d991";
              return (
                <div key={item.label} className="flex items-center justify-between border-l-2 bg-white/[0.02] px-2 py-1.5" style={{ borderColor: c }}>
                  <span className="truncate text-[10px] text-slate-200">{item.label}</span>
                  <span className="font-mono text-[9px] font-bold" style={{ color: c }}>{item.value}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* IoT badge row */}
      <div className="border-t border-white/8 p-3">
        <div className="mb-2 font-mono text-[8px] tracking-widest text-slate-400">IoT LIVE FEED</div>
        <div className="flex flex-wrap gap-1.5">
          <span className="rounded bg-emerald-500/15 px-2 py-1 font-mono text-[9px] text-emerald-300 border border-emerald-400/25">● STREAMING</span>
          <span className="rounded bg-cyan-500/15 px-2 py-1 font-mono text-[9px] text-cyan-300 border border-cyan-400/25">SYNC 18ms</span>
          <span className="rounded bg-violet-500/15 px-2 py-1 font-mono text-[9px] text-violet-300 border border-violet-400/25">Granite AI</span>
        </div>
      </div>

      {/* actions */}
      <div className="flex gap-1.5 border-t border-white/10 p-2">
        {canDrillIn && (
          <button onClick={() => onDrillIn?.(deptId)} className="flex-1 border border-cyan-400/50 bg-cyan-500/15 py-1.5 text-[10px] font-bold text-cyan-200 hover:bg-cyan-500/25">
            ⤢ ENTER ICU (12 BEDS)
          </button>
        )}
        <button onClick={onClose} className="flex-1 border border-white/15 bg-white/5 py-1.5 text-[10px] font-semibold text-slate-300 hover:bg-white/10">
          CLOSE
        </button>
      </div>
    </div>
  );
}
