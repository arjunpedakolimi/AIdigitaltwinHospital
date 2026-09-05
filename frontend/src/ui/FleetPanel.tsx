import { useState } from "react";
import { useFleet, AmbulanceUnit } from "../hooks/useFleet";

const STATUS_ICONS: Record<string, string> = {
  available: "🟢",
  en_route: "🔵",
  onboard: "🟠",
  critical: "🔴",
  returning: "🟣",
  maintenance: "⚪",
};

function MiniFleetMap({ units, selectedId }: { units: AmbulanceUnit[]; selectedId: string | null }) {
  const active = units.filter((unit) => unit.status === "en_route" || unit.status === "onboard" || unit.status === "critical" || unit.status === "returning");
  const safe = (value: number) => Math.max(6, Math.min(94, value));
  const markerPos = (unit: AmbulanceUnit) => {
    // Map fleet coordinates into a stable visual city grid, independent of WebGL.
    const left = safe(50 + unit.position[0] * 4.2);
    const top = safe(72 - (unit.position[1] - 36) * 2.9);
    return { left: `${left}%`, top: `${top}%` };
  };
  return (
    <div className="border border-cyan-400/20 bg-[#071a2b] p-2">
      <div className="mb-1 flex items-center justify-between font-mono text-[8px] tracking-widest text-cyan-300">
        <span>LIVE CITY GPS MAP</span><span className="text-emerald-300">● GPS 1s</span>
      </div>
      <div className="relative h-40 overflow-hidden border border-white/10 bg-[#0a2031]">
        {/* City road grid */}
        <div className="absolute inset-x-0 top-[26%] h-1 bg-slate-500/70" />
        <div className="absolute inset-x-0 top-[56%] h-1 bg-slate-500/70" />
        <div className="absolute bottom-0 top-0 left-[34%] w-1 bg-slate-500/70" />
        <div className="absolute bottom-0 top-0 left-[65%] w-1 bg-slate-500/70" />
        {/* Traffic segments */}
        <div className="absolute left-[10%] top-[24%] h-1 w-[28%] bg-emerald-400/80" />
        <div className="absolute left-[38%] top-[54%] h-1 w-[32%] bg-amber-400/80" />
        <div className="absolute left-[64%] top-[25%] h-1 w-[22%] bg-rose-400/80" />
        {/* Accident sites */}
        <div className="absolute left-[18%] top-[12%] grid h-7 w-7 place-items-center rounded-full border border-rose-300/60 bg-rose-500/20 text-[13px] shadow-[0_0_14px_rgba(244,63,94,.65)]">✕</div>
        <span className="absolute left-[27%] top-[12%] font-mono text-[7px] text-rose-200">ACCIDENT A</span>
        <div className="absolute left-[70%] top-[45%] grid h-6 w-6 place-items-center rounded-full border border-amber-300/60 bg-amber-500/20 text-[11px]">!</div>
        <span className="absolute left-[76%] top-[45%] font-mono text-[7px] text-amber-100">INCIDENT B</span>
        {/* Hospital */}
        <div className="absolute bottom-[9%] left-1/2 -translate-x-1/2 text-center">
          <div className="text-[19px] drop-shadow-[0_0_8px_rgba(34,211,238,.85)]">🏥</div>
          <div className="font-mono text-[7px] font-bold tracking-widest text-cyan-100">MEDITWIN HOSPITAL</div>
        </div>
        {/* Route lines as CSS */}
        {active.map((unit, index) => {
          const pos = markerPos(unit);
          const selected = selectedId === unit.id;
          const routeColor = unit.id === "AMB-04" ? "#38bdf8" : unit.id === "AMB-03" ? "#22d3ee" : "#a78bfa";
          return (
            <div key={`route-${unit.id}`} className="absolute origin-left" style={{ left: pos.left, top: pos.top, width: "44%", height: "1px", background: routeColor, opacity: selected ? 0.95 : 0.45, transform: `rotate(${index % 2 ? 25 : -25}deg)`, boxShadow: `0 0 5px ${routeColor}` }} />
          );
        })}
        {/* Ambulance markers */}
        {units.map((unit) => {
          const pos = markerPos(unit);
          const selected = selectedId === unit.id;
          return (
            <div key={unit.id} className={`absolute -translate-x-1/2 -translate-y-1/2 ${selected ? "z-20 scale-125" : "z-10"}`} style={pos}>
              <div className={`grid h-7 w-7 place-items-center rounded-full border bg-[#06101d]/90 text-[13px] shadow-xl ${selected ? "border-cyan-300 shadow-cyan-400/50" : "border-white/25"}`}>
                🚑
              </div>
              {selected && <div className="absolute left-1/2 top-7 -translate-x-1/2 whitespace-nowrap bg-black/75 px-1 py-0.5 font-mono text-[6px] text-cyan-100">{unit.label}</div>}
            </div>
          );
        })}
        {/* Legend */}
        <div className="absolute bottom-1 left-1 flex gap-2 rounded bg-black/50 px-1.5 py-1 font-mono text-[6px] text-slate-300">
          <span><i className="mr-1 inline-block h-1 w-1 rounded-full bg-emerald-400" />Free</span>
          <span><i className="mr-1 inline-block h-1 w-1 rounded-full bg-amber-400" />Moderate</span>
          <span><i className="mr-1 inline-block h-1 w-1 rounded-full bg-rose-400" />Heavy</span>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   SMART HOSPITAL ASSIGNMENT
   Hospital selection engine — scores nearby hospitals by
   patient suitability, not just distance.
   ────────────────────────────────────────────────────────────── */
interface NearbyHospital {
  id: string;
  name: string;
  distanceKm: number;
  etaMin: number;
  icuBeds: number;
  ventilators: number;
  emergencyLoad: number; // 0-100 (higher = busier)
  doctors: number;
}

interface HospitalScore {
  hospital: NearbyHospital;
  score: number;
  weights: Record<string, number>;
  reason: string;
}

const BASE_WEIGHTS = {
  patientSuitability: 0.35,
  eta: 0.25,
  icuAvailability: 0.2,
  equipment: 0.1,
  emergencyCapacity: 0.1,
};

function computeScores(severity: "stable" | "moderate" | "critical"): HospitalScore[] {
  // Nearby hospitals with live capacity
  const hospitals: NearbyHospital[] = [
    { id: "H-A", name: "St. Mary's General", distanceKm: 3.2, etaMin: 7, icuBeds: 0, ventilators: 0, emergencyLoad: 92, doctors: 4 },
    { id: "H-B", name: "MediTwin Central", distanceKm: 0, etaMin: 0, icuBeds: 3, ventilators: 2, emergencyLoad: 55, doctors: 12 },
    { id: "H-A2", name: "Northgate General", distanceKm: 4.0, etaMin: 8, icuBeds: 1, ventilators: 1, emergencyLoad: 70, doctors: 8 },
    { id: "H-B2", name: "St. Mary's East", distanceKm: 5.1, etaMin: 9, icuBeds: 3, ventilators: 2, emergencyLoad: 40, doctors: 10 },
  ];

  const w = { ...BASE_WEIGHTS };
  // For critical patients, ICU/equipment should outweigh being close.
  if (severity === "critical") {
    w.icuAvailability += 0.08;
    w.equipment += 0.04;
    w.eta -= 0.12;
  } else if (severity === "moderate") {
    w.icuAvailability += 0.03;
    w.eta -= 0.03;
  }
  // Re-normalize
  const totalW = Object.values(w).reduce((a, b) => a + b, 0);
  const n = {} as Record<string, number>;
  for (const k of Object.keys(w) as (keyof typeof w)[]) n[k] = w[k] / totalW;

  return hospitals.map((hospital) => {
    const icuScore = hospital.icuBeds >= 3 ? 100 : hospital.icuBeds >= 1 ? 60 : 0;
    const equipmentScore = hospital.ventilators >= 2 ? 100 : hospital.ventilators >= 1 ? 60 : 0;
    const etaScore = Math.max(0, 100 - (hospital.etaMin > 0 ? hospital.etaMin * 8 : 0));
    const emergencyScore = Math.max(0, 100 - hospital.emergencyLoad);
    const suitability = ((icuScore + equipmentScore) / 2) * (severity === "critical" ? 1 : 0.8);

    const score = Math.round(
      suitability * n.patientSuitability +
      etaScore * n.eta +
      icuScore * n.icuAvailability +
      equipmentScore * n.equipment +
      emergencyScore * n.emergencyCapacity
    );

    let reason: string;
    if (hospital.icuBeds === 0 && hospital.ventilators === 0) {
      reason = "No ICU bed or ventilator — cannot safely manage this patient.";
    } else if (hospital.icuBeds >= 2 && hospital.emergencyLoad < 60) {
      reason = "Available ICU and equipment with manageable emergency load.";
    } else {
      reason = "Partial capacity — only suitable for stable to moderate patients.";
    }
    return { hospital, score, weights: n, reason };
  });
}

export function SmartHospitalAssignment({ onClose }: { onClose: () => void }) {
  const [selectedUnit, setSelectedUnit] = useState<"AMB-04" | "AMB-03">("AMB-04");
  const [approved, setApproved] = useState(false);
  const severity = selectedUnit === "AMB-04" ? "critical" : "moderate";
  const scores = computeScores(severity);
  const best = scores.reduce((a, b) => (b.score > a.score ? b : a), scores[0]);
  const isCritical = severity === "critical";

  return (
    <div className="pointer-events-auto absolute right-4 top-4 z-40 flex w-[24rem] flex-col gap-2 border border-cyan-400/30 bg-[#07101d]/95 shadow-2xl backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center justify-between bg-gradient-to-r from-cyan-600/20 to-blue-600/20 p-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">🏥</span>
          <div>
            <div className="text-[11px] font-bold text-cyan-200">SMART HOSPITAL ASSIGNMENT</div>
            <div className="text-[8px] text-slate-400">Suitability scoring · not just nearest</div>
          </div>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
      </div>

      {/* Ambulance selector */}
      <div className="px-3">
        <div className="mb-1 font-mono text-[8px] tracking-widest text-slate-500">PATIENT CASE</div>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={() => { setSelectedUnit("AMB-04"); setApproved(false); }}
            className={`border px-2 py-2 text-left ${selectedUnit === "AMB-04" ? "border-rose-400 bg-rose-500/10" : "border-white/10 bg-white/5 hover:bg-white/10"}`}
          >
            <div className="font-mono text-[10px] font-bold text-rose-200">🔴 Critical</div>
            <div className="text-[8px] text-slate-400">Needs ICU + ventilator</div>
          </button>
          <button
            onClick={() => { setSelectedUnit("AMB-03"); setApproved(false); }}
            className={`border px-2 py-2 text-left ${selectedUnit === "AMB-03" ? "border-amber-400 bg-amber-500/10" : "border-white/10 bg-white/5 hover:bg-white/10"}`}
          >
            <div className="font-mono text-[10px] font-bold text-amber-200">🟠 Moderate</div>
            <div className="text-[8px] text-slate-400">Needs ICU bed</div>
          </button>
        </div>
      </div>

      {/* Hospital ranking */}
      <div className="px-3">
        <div className="mb-1.5 font-mono text-[8px] tracking-widest text-slate-500">NEARBY HOSPITALS</div>
        <div className="space-y-1.5">
          {scores.map(({ hospital, score, reason }) => {
            const isBest = hospital.id === best.hospital.id;
            const isNoIcu = hospital.icuBeds === 0 && hospital.ventilators === 0;
            return (
              <div key={hospital.id} className={`border p-2 ${isBest ? "border-emerald-400/60 bg-emerald-500/10" : isNoIcu ? "border-rose-500/30 bg-rose-500/[0.05]" : "border-white/10 bg-white/[0.03]"}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-sm">🏥</span>
                    <div className="min-w-0">
                      <div className="truncate text-[10px] font-bold text-white">{hospital.name}</div>
                      <div className="font-mono text-[7px] text-slate-500">{hospital.distanceKm} km · ETA {hospital.etaMin} min</div>
                    </div>
                    {isBest && <span className="ml-1 shrink-0 rounded bg-emerald-400 px-1 py-px text-[7px] font-black text-slate-950">BEST ⭐</span>}
                    {isNoIcu && <span className="shrink-0 rounded bg-rose-500/20 px-1 py-px text-[7px] font-bold text-rose-200">UNAVAILABLE</span>}
                  </div>
                  <span className={`shrink-0 font-mono text-[13px] font-black ${isBest ? "text-emerald-300" : isNoIcu ? "text-rose-300" : "text-amber-200"}`}>{score}</span>
                </div>

                {/* capacity row */}
                <div className="mt-1.5 grid grid-cols-3 gap-1">
                  <div className="border border-white/8 bg-black/30 px-1 py-0.5 text-center">
                    <div className="text-[6px] text-slate-500">ICU</div>
                    <div className={`font-mono text-[9px] font-bold ${hospital.icuBeds >= 2 ? "text-emerald-300" : hospital.icuBeds >= 1 ? "text-amber-200" : "text-rose-300"}`}>{hospital.icuBeds}</div>
                  </div>
                  <div className="border border-white/8 bg-black/30 px-1 py-0.5 text-center">
                    <div className="text-[6px] text-slate-500">VENT</div>
                    <div className={`font-mono text-[9px] font-bold ${hospital.ventilators >= 2 ? "text-emerald-300" : hospital.ventilators >= 1 ? "text-amber-200" : "text-rose-300"}`}>{hospital.ventilators}</div>
                  </div>
                  <div className="border border-white/8 bg-black/30 px-1 py-0.5 text-center">
                    <div className="text-[6px] text-slate-500">Drs</div>
                    <div className="font-mono text-[9px] font-bold text-cyan-200">{hospital.doctors}</div>
                  </div>
                </div>
                <div className="mt-1 text-[8px] leading-snug text-slate-400">{reason}</div>
                <div className="mt-1 h-1 overflow-hidden bg-white/10">
                  <div className={`h-full ${isBest ? "bg-emerald-400" : isNoIcu ? "bg-rose-400" : "bg-amber-400"}`} style={{ width: `${score}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Weights */}
      <div className="px-3">
        <div className="mb-1 font-mono text-[8px] tracking-widest text-slate-500">Suitability Weights {isCritical ? "(critical mode)" : "(moderate mode)"}</div>
        <div className="grid grid-cols-5 gap-1">
          {[
            ["ICU", best.weights.icuAvailability],
            ["ETA", best.weights.eta],
            ["EQUIP", best.weights.equipment],
            ["EMERG", best.weights.emergencyCapacity],
            ["SUIT", best.weights.patientSuitability],
          ].map(([label, weight]) => (
            <div key={label as string} className="rounded border border-white/8 bg-black/30 px-1 py-1 text-center">
              <div className="text-[6px] text-slate-500">{label}</div>
              <div className="font-mono text-[9px] font-bold text-cyan-200">{Math.round(Number(weight) * 100)}%</div>
            </div>
          ))}
        </div>
        <div className="mt-1 flex items-center justify-between text-[7px] text-slate-500">
          <span>Higher ICU/equipment weight for critical patients</span>
          <span className="text-cyan-400/70">{isCritical ? "ICU ↑ · ETA ↓" : "balanced"}</span>
        </div>
      </div>

      {/* Recommendation + approval */}
      <div className="px-3 pb-3">
        <div className="rounded border-2 border-emerald-400/60 bg-gradient-to-br from-emerald-500/15 to-cyan-500/10 p-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] font-bold tracking-widest text-emerald-200">🤖 AI RECOMMENDATION</span>
            <span className="rounded bg-emerald-400 px-1.5 py-0.5 font-mono text-[8px] font-black text-slate-950">SCORE {best.score}</span>
          </div>
          <div className="mt-1.5 text-[11px] font-bold text-white">{best.hospital.name}</div>

          {/* Why this hospital */}
          <div className="mt-2 rounded border border-cyan-400/25 bg-cyan-500/[0.07] p-2">
            <div className="font-mono text-[8px] font-bold tracking-widest text-cyan-200">🧠 WHY THIS HOSPITAL?</div>
            <p className="mt-1 text-[9px] leading-snug text-slate-300">
              {best.hospital.name} is recommended because it has the required ICU bed and ventilator capacity {best.hospital.etaMin > 0 ? `and can receive the patient within ${best.hospital.etaMin} minutes` : "on site"}.
              {best.hospital.icuBeds >= 3 && " It is the only option with adequate critical-care capacity."}
            </p>
          </div>

          {/* Approve / Override */}
          <div className="mt-2 flex items-center justify-between gap-2">
            <span className="font-mono text-[8px] text-slate-400">
              {approved ? "✓ APPROVED · PRE-ALERT SENT" : "AWAITING DISPATCHER APPROVAL"}
            </span>
            <button
              onClick={() => setApproved(!approved)}
              className={`px-2.5 py-1 text-[9px] font-bold ${approved ? "border border-white/15 bg-white/10 text-slate-200" : "bg-emerald-400 text-slate-950 hover:bg-emerald-300"}`}
            >
              {approved ? "UNDO" : "✓ APPROVE"}
            </button>
          </div>
          {approved && (
            <div className="mt-2 space-y-1 text-[8px] text-emerald-200">
              <div className="flex items-center gap-1.5"><span>✓</span> ICU bed reserved</div>
              <div className="flex items-center gap-1.5"><span>✓</span> Trauma team notified</div>
              <div className="flex items-center gap-1.5"><span>✓</span> ETA + patient status transmitted</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function FleetDashboard({ fleet, onFollow }: { fleet: ReturnType<typeof useFleet>; onFollow?: (id: string | null) => void }) {
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [followMode, setFollowMode] = useState(false);
  const [showAssignment, setShowAssignment] = useState(false);
  const selectedUnit = fleet.ambulances.find((unit) => unit.id === selectedUnitId) ?? null;

  const handleSelect = (unit: AmbulanceUnit | null) => {
    setSelectedUnitId(unit?.id ?? null);
    setFollowMode(!!unit);
    onFollow?.(unit?.id ?? null);
  };

  // Defensive: never crash if fleet state is somehow empty.
  const units = fleet.ambulances && fleet.ambulances.length ? fleet.ambulances : [];

  if (!fleet.active) return null;

  return (
    <>
      {showAssignment && <SmartHospitalAssignment onClose={() => setShowAssignment(false)} />}
      <div className="pointer-events-auto absolute left-4 top-4 z-30 w-[20rem] space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between border border-cyan-400/30 bg-[#050d17]/95 p-2.5 shadow-2xl backdrop-blur-xl">
        <span className="font-mono text-[9px] tracking-[0.22em] text-cyan-300">🚑 LIVE AMBULANCE FLEET</span>
        <button onClick={fleet.exit} className="text-xs text-slate-500 hover:text-white">✕</button>
      </div>

      {/* Fleet stats */}
      <div className="grid grid-cols-2 gap-1.5 border border-white/10 bg-[#050d17]/95 p-2 shadow-xl backdrop-blur-xl">
        {[
          { label: "Available", value: fleet.stats.available, color: "#20d991" },
          { label: "On Mission", value: fleet.stats.onMission, color: "#38bdf8" },
          { label: "Returning", value: fleet.stats.returning, color: "#a78bfa" },
          { label: "Maintenance", value: fleet.stats.maintenance, color: "#94a3b8" },
        ].map((s) => (
          <div key={s.label} className="border border-white/8 bg-white/[0.03] px-2 py-1.5 text-center">
            <div className="font-mono text-[14px] font-black tabular-nums" style={{ color: s.color }}>{s.value}</div>
            <div className="text-[7px] text-slate-400">{s.label}</div>
          </div>
        ))}
        <div className="col-span-2 border border-white/8 bg-white/[0.03] px-2 py-1.5">
          <div className="flex justify-between">
            <span className="text-[9px] text-slate-400">Avg ETA</span>
            <span className="font-mono text-[12px] font-bold text-cyan-200">{fleet.stats.avgEta}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[9px] text-slate-400">Response Time</span>
            <span className="font-mono text-[12px] font-bold text-emerald-200">{fleet.stats.responseTime}</span>
          </div>
        </div>
      </div>

      <MiniFleetMap units={units} selectedId={selectedUnitId} />

      {/* Smart Hospital Assignment launch */}
      <button
        onClick={() => setShowAssignment((v) => !v)}
        className={`w-full border px-3 py-2 text-left transition ${showAssignment ? "border-cyan-400 bg-cyan-500/15" : "border-violet-400/30 bg-violet-500/10 hover:bg-violet-500/20"}`}
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-violet-100">🏥 Smart Hospital Assignment</span>
          <span className="font-mono text-[9px] text-violet-300">{showAssignment ? "▲" : "▶"}</span>
        </div>
        <div className="mt-0.5 text-[8px] text-slate-400">AI hospital suitability scoring · recommender</div>
      </button>

{/* Ambulance list */}
<div className="max-h-64 space-y-1.5 overflow-y-auto border border-white/10 bg-[#050d17]/95 p-1.5 shadow-xl backdrop-blur-xl">
  {units.map((a) => {
    const sel = selectedUnit?.id === a.id;

    const statusLabel =
      a.status === "on_mission"
        ? "EN ROUTE"
        : a.status === "returning"
        ? "RETURNING"
        : a.status === "maintenance"
        ? "MAINTENANCE"
        : "READY";

    const statusClass =
      a.status === "on_mission"
        ? "border-cyan-400/30 bg-cyan-400/10 text-cyan-200"
        : a.status === "returning"
        ? "border-violet-400/30 bg-violet-400/10 text-violet-200"
        : a.status === "maintenance"
        ? "border-slate-400/30 bg-slate-400/10 text-slate-300"
        : "border-emerald-400/30 bg-emerald-400/10 text-emerald-200";

    return (
      <button
        key={a.id}
        onClick={() => handleSelect(sel ? null : a)}
        className={`w-full border p-2.5 text-left transition ${
          sel
            ? "border-cyan-400/50 bg-cyan-400/[0.10] shadow-lg"
            : "border-white/8 bg-white/[0.025] hover:border-cyan-400/20 hover:bg-white/[0.05]"
        }`}
      >
        {/* Top row */}
        <div className="flex items-center gap-2">
          <span className="text-lg">
            {STATUS_ICONS[a.status]}
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] font-black text-white">
                {a.label}
              </span>

              <span
                className={`border px-1.5 py-0.5 font-mono text-[7px] font-bold tracking-wider ${statusClass}`}
              >
                {statusLabel}
              </span>
            </div>

            <div className="mt-0.5 flex items-center gap-2 font-mono text-[7px] text-slate-500">
              <span>GPS ● LIVE</span>
              <span>
                POS {a.position[0].toFixed(0)}, {a.position[1].toFixed(0)}
              </span>
            </div>
          </div>

          {/* ETA */}
          {a.etaMinutes > 0 ? (
            <div className="text-right">
              <div className="font-mono text-[7px] text-slate-500">
                ETA
              </div>
              <div className="font-mono text-[13px] font-black text-amber-300">
                {a.etaMinutes}s
              </div>
            </div>
          ) : (
            <div className="text-right">
              <div className="font-mono text-[7px] text-slate-500">
                STATUS
              </div>
              <div className="font-mono text-[9px] font-bold text-emerald-300">
                READY
              </div>
            </div>
          )}
        </div>

        {/* Telemetry row */}
        <div className="mt-2 grid grid-cols-3 gap-1">
          <div className="border border-white/8 bg-black/20 px-1.5 py-1">
            <div className="text-[6px] text-slate-500">
              SPEED
            </div>
            <div className="font-mono text-[9px] text-cyan-200">
              {a.speed > 0 ? `${a.speed} km/h` : "—"}
            </div>
          </div>

          <div className="border border-white/8 bg-black/20 px-1.5 py-1">
            <div className="text-[6px] text-slate-500">
              FUEL
            </div>
            <div className="font-mono text-[9px] text-emerald-200">
              {a.fuel}%
            </div>
          </div>

          <div className="border border-white/8 bg-black/20 px-1.5 py-1">
            <div className="text-[6px] text-slate-500">
              ROUTE
            </div>
            <div className="font-mono text-[9px] text-violet-200">
              {a.routeOptimized ? "AI OPT" : "STANDARD"}
            </div>
          </div>
        </div>

        {/* Patient / mission row */}
        {a.patientSeverity && (
          <div className="mt-1.5 flex items-center justify-between border border-white/8 bg-black/20 px-2 py-1">
            <span className="font-mono text-[7px] text-slate-500">
              PATIENT SEVERITY
            </span>

            <span
              className={`font-mono text-[8px] font-bold ${
                a.patientSeverity === "critical"
                  ? "text-rose-300"
                  : a.patientSeverity === "moderate"
                  ? "text-amber-300"
                  : "text-emerald-300"
              }`}
            >
              {a.patientSeverity.toUpperCase()}
            </span>
          </div>
        )}
      </button>
    );
  })}
</div>
      {/* Selected unit detail */}
      {selectedUnit && (
        <div className="border border-cyan-400/30 bg-[#050d17]/95 p-3 shadow-xl backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] font-bold text-cyan-200">{selectedUnit.label}</span>
            {followMode && <span className="animate-pulse font-mono text-[7px] text-cyan-300">DRONE FOLLOWING</span>}
          </div>
          <div className="mt-2 grid grid-cols-2 gap-1.5">
            <div className="border border-white/8 bg-white/[0.03] px-1.5 py-1">
              <div className="text-[7px] text-slate-500">Driver</div>
              <div className="font-mono text-[10px] text-slate-200">{selectedUnit.driver}</div>
            </div>
            <div className="border border-white/8 bg-white/[0.03] px-1.5 py-1">
              <div className="text-[7px] text-slate-500">Paramedic</div>
              <div className="font-mono text-[10px] text-slate-200">{selectedUnit.paramedic}</div>
            </div>
            <div className="border border-white/8 bg-white/[0.03] px-1.5 py-1">
              <div className="text-[7px] text-slate-500">Fuel</div>
              <div className="font-mono text-[10px] text-slate-200">{selectedUnit.fuel}%</div>
            </div>
            <div className="border border-white/8 bg-white/[0.03] px-1.5 py-1">
              <div className="text-[7px] text-slate-500">Speed</div>
              <div className="font-mono text-[10px] text-slate-200">{selectedUnit.speed} km/h</div>
            </div>
            {selectedUnit.patients > 0 && (
              <div className="col-span-2 border border-white/8 bg-white/[0.03] px-1.5 py-1">
                <div className="text-[7px] text-slate-500">Current Patient</div>
                <div className="font-mono text-[10px] text-slate-200">{selectedUnit.patients} — <span className={selectedUnit.patientSeverity === "critical" ? "text-rose-300" : selectedUnit.patientSeverity === "moderate" ? "text-amber-300" : "text-emerald-300"}>{selectedUnit.patientSeverity?.toUpperCase()}</span></div>
              </div>
            )}
          </div>
          {selectedUnit.etaMinutes > 0 && (
            <div className="mt-2 border border-cyan-400/20 bg-cyan-500/[0.06] px-2 py-1.5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[8px] tracking-widest text-cyan-300">ETA PREDICTION</span>
                <span className="font-mono text-[14px] font-black text-cyan-200">{selectedUnit.etaMinutes}s</span>
              </div>
              <div className="mt-1 grid grid-cols-3 gap-1 text-center">
                <div className="border border-white/8 bg-white/[0.03] px-1 py-1">
                  <div className="text-[6px] text-slate-500">TRAFFIC</div>
                  <div className="font-mono text-[9px] text-amber-200">Medium</div>
                </div>
                <div className="border border-white/8 bg-white/[0.03] px-1 py-1">
                  <div className="text-[6px] text-slate-500">ROUTE</div>
                  <div className="font-mono text-[9px] text-emerald-200">{selectedUnit.routeOptimized ? "AI Optimal" : "Standard"}</div>
                </div>
                <div className="border border-white/8 bg-white/[0.03] px-1 py-1">
                  <div className="text-[6px] text-slate-500">CONFIDENCE</div>
                  <div className="font-mono text-[9px] text-cyan-200">98%</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Dispatch Timeline */}
      {fleet.dispatchTimeline.length > 0 && (
        <div className="border border-white/10 bg-[#050d17]/95 p-3 shadow-xl backdrop-blur-xl">
          <div className="mb-2 font-mono text-[8px] tracking-widest text-cyan-300">SMART DISPATCH TIMELINE</div>
          <div className="space-y-1.5">
            {fleet.dispatchTimeline.map((e, i) => (
              <div key={i} className="flex items-center gap-2 border-l-2 border-cyan-400/40 bg-white/[0.025] px-2 py-1.5 pl-3">
                <span className="text-base">{e.icon}</span>
                <div>
                  <div className="font-mono text-[8px] text-cyan-300">{e.time}</div>
                  <div className="text-[10px] text-white">{e.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Arrival Queue */}
      {fleet.arrivalQueue.length > 0 && (
        <div className="border border-white/10 bg-[#050d17]/95 p-3 shadow-xl backdrop-blur-xl">
          <div className="mb-2 font-mono text-[8px] tracking-widest text-cyan-300">INCOMING AMBULANCES</div>
          <div className="space-y-1.5">
            {fleet.arrivalQueue.map((a, i) => (
              <div key={i} className="border border-white/8 bg-white/[0.03] px-2.5 py-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] font-bold text-white">{a.id}</span>
                  <span className="font-mono text-[9px] text-cyan-200">ETA {a.eta}</span>
                </div>
                <div className="mt-0.5 font-mono text-[8px]">
                  Patient: <span className={a.severity === "Critical" ? "text-rose-300" : a.severity === "Moderate" ? "text-amber-300" : "text-emerald-300"}>{a.severity}</span>
                </div>
                  {i < fleet.arrivalQueue.length - 1 && <div className="mt-1 text-center text-xs text-slate-600">↓</div>}
              </div>
            ))}
          </div>
        </div>
      )}
      </div>
    </>
  );
}
