import { useCallback, useEffect, useRef, useState } from "react";

/* ── Fleet state types ── */
export type AmbulanceStatus = "available" | "en_route" | "onboard" | "critical" | "returning" | "maintenance";

export interface AmbulanceUnit {
  id: string;
  label: string;
  status: AmbulanceStatus;
  position: [number, number];
  speed: number;
  fuel: number;
  driver: string;
  paramedic: string;
  patients: number;
  etaMinutes: number;
  patientSeverity?: "stable" | "moderate" | "critical";
  routeOptimized: boolean;
}

export interface DispatchEvent { time: string; label: string; icon: string }

export interface FleetState {
  active: boolean;
  ambulances: AmbulanceUnit[];
  dispatchTimeline: DispatchEvent[];
  arrivalQueue: { id: string; eta: string; severity: string }[];
  stats: { available: number; onMission: number; returning: number; maintenance: number; avgEta: string; responseTime: string };
  toggle: () => void;
  exit: () => void;
}

const DEFAULT_FLEET: AmbulanceUnit[] = [
  { id: "AMB-01", label: "AMB-01", status: "available", position: [-4, 38], speed: 0, fuel: 96, driver: "Ahmed K.", paramedic: "Fatima M.", patients: 0, etaMinutes: 0, routeOptimized: false },
  { id: "AMB-02", label: "AMB-02", status: "available", position: [4, 40], speed: 0, fuel: 88, driver: "Ravi S.", paramedic: "Lena W.", patients: 0, etaMinutes: 0, routeOptimized: false },
  { id: "AMB-03", label: "AMB-03", status: "available", position: [0, 44], speed: 0, fuel: 82, driver: "John D.", paramedic: "Sarah L.", patients: 0, etaMinutes: 0, routeOptimized: false },
  { id: "AMB-04", label: "AMB-04", status: "available", position: [-6, 42], speed: 0, fuel: 91, driver: "Mike T.", paramedic: "Emma R.", patients: 0, etaMinutes: 0, routeOptimized: false },
  { id: "AMB-05", label: "AMB-05", status: "available", position: [6, 38], speed: 0, fuel: 77, driver: "Chen W.", paramedic: "Olivia P.", patients: 0, etaMinutes: 0, routeOptimized: false },
  { id: "AMB-06", label: "AMB-06", status: "maintenance", position: [-12, 36], speed: 0, fuel: 45, driver: "—", paramedic: "—", patients: 0, etaMinutes: 0, routeOptimized: false },
];

const HOSPITAL_POS: [number, number] = [0, 36];

function lerpPos(from: [number, number], to: [number, number], t: number): [number, number] {
  return [from[0] + (to[0] - from[0]) * t, from[1] + (to[1] - from[1]) * t];
}

function cloneFleet(): AmbulanceUnit[] {
  return DEFAULT_FLEET.map((a) => ({ ...a, position: [...a.position] as [number, number] }));
}

type FleetPhase = "accident" | "dispatch" | "en_route" | "pickup" | "transport" | "arrival" | "ready";
const PHASES: FleetPhase[] = ["accident", "dispatch", "en_route", "pickup", "transport", "arrival", "ready"];
const PHASE_LEN: Record<FleetPhase, number> = { accident: 4, dispatch: 4, en_route: 5, pickup: 3, transport: 5, arrival: 3, ready: 3 };
const TOTAL = PHASES.reduce((s, p) => s + PHASE_LEN[p], 0);

function buildFleet(sec: number): { units: AmbulanceUnit[]; phase: FleetPhase; timeline: DispatchEvent[]; queue: { id: string; eta: string; severity: string }[] } {
  // Clamp time so we never overshoot at the end.
  const tSec = Math.max(0, Math.min(TOTAL - 0.01, sec));

  // Determine phase from elapsed time.
  let phase: FleetPhase = "accident";
  let acc = 0;
  for (const p of PHASES) {
    acc += PHASE_LEN[p];
    if (tSec < acc) { phase = p; break; }
  }

  const outboundT = Math.max(0, Math.min(1, (tSec - 4) / 9));
  const inboundT = Math.max(0, Math.min(1, (tSec - 16) / 5));

  const units = cloneFleet().map((a) => {
    if (a.id === "AMB-04") {
      switch (phase) {
        case "accident":
          a.status = "available"; a.position = HOSPITAL_POS; a.speed = 0; a.etaMinutes = 0;
          break;
        case "dispatch":
        case "en_route":
          a.status = "en_route";
          a.position = lerpPos(HOSPITAL_POS, [-8, 50], outboundT);
          a.speed = 42;
          a.etaMinutes = Math.max(0, Math.round((1 - outboundT) * 180));
          if (phase === "dispatch") a.routeOptimized = true;
          break;
        case "pickup":
          a.status = "onboard"; a.position = [-8, 50]; a.speed = 0; a.patients = 2; a.patientSeverity = "critical"; a.etaMinutes = 5;
          break;
        case "transport":
          a.status = "critical";
          a.position = lerpPos([-8, 50], HOSPITAL_POS, inboundT);
          a.speed = 55;
          a.etaMinutes = Math.max(0, Math.round((1 - inboundT) * 300));
          break;
        case "arrival":
          a.status = "returning"; a.position = HOSPITAL_POS; a.speed = 0; a.patients = 2; a.etaMinutes = 0;
          break;
        case "ready":
          a.status = "available"; a.position = HOSPITAL_POS; a.speed = 0; a.patients = 0; a.patientSeverity = undefined; a.etaMinutes = 0; a.routeOptimized = false;
          break;
      }
    } else if (a.id === "AMB-03") {
      if (phase === "en_route" || phase === "pickup" || phase === "transport" || phase === "arrival") {
        a.status = "en_route"; a.position = [4, 42]; a.speed = 35; a.patients = 1; a.patientSeverity = "moderate";
      } else {
        a.status = "available"; a.position = [0, 44]; a.speed = 0; a.patients = 0; a.patientSeverity = undefined;
      }
    } else if (a.id === "AMB-02") {
      if (phase === "en_route" || phase === "pickup" || phase === "transport" || phase === "arrival") {
        a.status = "en_route"; a.position = [-3, 44]; a.speed = 30; a.patients = 1; a.patientSeverity = "stable";
      } else {
        a.status = "available"; a.position = [4, 40]; a.speed = 0; a.patients = 0; a.patientSeverity = undefined;
      }
    }
    return a;
  });

  const timeline: DispatchEvent[] = [];
  if (tSec >= 0) timeline.push({ time: "18:31", label: "Accident Reported", icon: "🚨" });
  if (tSec >= 4) timeline.push({ time: "18:32", label: "IBM Granite Analysis", icon: "🧠" });
  if (tSec >= 6) timeline.push({ time: "18:32", label: "Nearest Ambulance Selected (AMB-04)", icon: "🚑" });
  if (tSec >= 8) timeline.push({ time: "18:33", label: "AI Route Optimized", icon: "🗺️" });
  if (tSec >= 13) timeline.push({ time: "18:36", label: "Patient Picked Up", icon: "🏥" });
  if (tSec >= 18) timeline.push({ time: "18:39", label: "Arrived at Hospital", icon: "✅" });

  const queue: { id: string; eta: string; severity: string }[] = [];
  if (phase === "transport" || phase === "arrival") {
    queue.push({ id: "AMB-04", eta: phase === "arrival" ? "ARRIVED" : "2 min", severity: "Critical" });
    queue.push({ id: "AMB-03", eta: "5 min", severity: "Moderate" });
    queue.push({ id: "AMB-02", eta: "8 min", severity: "Stable" });
  }

  return { units, phase, timeline, queue };
}

export function useFleet(): FleetState {
  const [active, setActive] = useState(false);
  const [ambulances, setAmbulances] = useState<AmbulanceUnit[]>(cloneFleet);
  const [dispatchTimeline, setDispatchTimeline] = useState<DispatchEvent[]>([]);
  const [arrivalQueue, setArrivalQueue] = useState<{ id: string; eta: string; severity: string }[]>([]);
  const [phase, setPhase] = useState<FleetPhase>("accident");

  const raf = useRef<number | null>(null);
  const startTime = useRef(0);
  const lastEmit = useRef(0);

  const toggle = useCallback(() => {
    setActive(true);
    setAmbulances(cloneFleet());
    setDispatchTimeline([]);
    setArrivalQueue([]);
    setPhase("accident");
    startTime.current = performance.now();
    lastEmit.current = 0;
  }, []);

  const exit = useCallback(() => {
    setActive(false);
    setAmbulances(cloneFleet());
    setDispatchTimeline([]);
    setArrivalQueue([]);
    setPhase("accident");
  }, []);

  useEffect(() => {
    if (!active) return;
    // Throttle: update React state ~8x/sec so the heavy 3D scene and the
    // dashboard never get flooded with 60 renders per second.
    const tick = () => {
      const now = performance.now();
      const sec = (now - startTime.current) / 1000;
      if (now - lastEmit.current >= 120) {
        lastEmit.current = now;
        const { units, phase: nextPhase, timeline, queue } = buildFleet(sec);
        setAmbulances(units);
        setPhase(nextPhase);
        setDispatchTimeline(timeline);
        setArrivalQueue(queue);
      }
      if (sec < TOTAL) {
        raf.current = requestAnimationFrame(tick);
      } else {
        const { units, phase: finalPhase, timeline, queue } = buildFleet(TOTAL);
        setAmbulances(units);
        setPhase(finalPhase);
        setDispatchTimeline(timeline);
        setArrivalQueue(queue);
      }
    };
    raf.current = requestAnimationFrame(tick);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [active]);

  const stats = {
    available: ambulances.filter((a) => a.status === "available").length,
    onMission: ambulances.filter((a) => a.status === "en_route" || a.status === "onboard" || a.status === "critical").length,
    returning: ambulances.filter((a) => a.status === "returning").length,
    maintenance: ambulances.filter((a) => a.status === "maintenance").length,
    avgEta: phase === "transport" || phase === "arrival" ? "4 min" : "—",
    responseTime: phase === "arrival" || phase === "ready" ? "5.2 min" : "—",
  };

  return { active, ambulances, dispatchTimeline, arrivalQueue, stats, toggle, exit };
}
