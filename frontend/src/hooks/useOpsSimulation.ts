import { useCallback, useEffect, useRef, useState } from "react";
import { Status } from "../data/hospital";
import {
  OPS_SCENARIOS, OpsScenario, OpsScenarioId, OpsStep, OpsResources, OpsActorSource,
} from "../data/opsSimulation";

export interface OpsLog {
  id: number;
  source: OpsActorSource;
  text: string;
  level: "info" | "warn" | "crit" | "ok";
  t: string;
}

export interface LiveOpsAction {
  id: string;
  label: string;
  detail: string;
  icon: string;
  state: "pending" | "executing" | "done";
}

export interface OpsSimulationState {
  active: boolean;
  running: boolean;
  finished: boolean;
  scenario: OpsScenario;
  scenarioId: OpsScenarioId;
  elapsed: number;
  progress: number;
  stepIndex: number;
  step: OpsStep;
  resources: OpsResources;
  statuses: Record<string, Status>;
  logs: OpsLog[];
  actions: LiveOpsAction[];
  focus: string;
  cues: string[];
  start: (id: OpsScenarioId) => void;
  exit: () => void;
}

/** Smoothly interpolate resource numbers so counters visibly animate. */
function lerpResources(from: OpsResources, to: OpsResources, t: number): OpsResources {
  const n = (a: number, b: number) => Math.round(a + (b - a) * t);
  return {
    icuBeds: { used: n(from.icuBeds.used, to.icuBeds.used), total: n(from.icuBeds.total, to.icuBeds.total) },
    ventilators: { used: n(from.ventilators.used, to.ventilators.used), total: n(from.ventilators.total, to.ventilators.total) },
    doctors: { deployed: n(from.doctors.deployed, to.doctors.deployed), total: to.doctors.total },
    nurses: { deployed: n(from.nurses.deployed, to.nurses.deployed), total: to.nurses.total },
    ambulances: { active: n(from.ambulances.active, to.ambulances.active), total: to.ambulances.total },
    otRooms: { used: n(from.otRooms.used, to.otRooms.used), total: to.otRooms.total },
    erLoad: n(from.erLoad, to.erLoad),
    waitTime: n(from.waitTime, to.waitTime),
  };
}

export function useOpsSimulation(): OpsSimulationState {
  const [active, setActive] = useState(false);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const [scenarioId, setScenarioId] = useState<OpsScenarioId>("resource");
  const [elapsed, setElapsed] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [statuses, setStatuses] = useState<Record<string, Status>>({});
  const [logs, setLogs] = useState<OpsLog[]>([]);
  const [resources, setResources] = useState<OpsResources>(OPS_SCENARIOS.resource.steps[0].resources);

  const raf = useRef<number | null>(null);
  const startTime = useRef(0);
  const applied = useRef(0);
  const logId = useRef(0);
  const scenarioRef = useRef<OpsScenario>(OPS_SCENARIOS.resource);

  const scenario = OPS_SCENARIOS[scenarioId];
  const step = scenario.steps[Math.min(stepIndex, scenario.steps.length - 1)];

  const exit = useCallback(() => {
    if (raf.current) cancelAnimationFrame(raf.current);
    raf.current = null;
    applied.current = 0;
    setActive(false);
    setRunning(false);
    setFinished(false);
    setElapsed(0);
    setStepIndex(0);
    setStatuses({});
    setLogs([]);
  }, []);

  const tick = useCallback(() => {
    const sc = scenarioRef.current;
    const seconds = (performance.now() - startTime.current) / 1000;
    setElapsed(seconds);

    // advance discrete steps
    for (let i = applied.current + 1; i < sc.steps.length; i += 1) {
      if (seconds >= sc.steps[i].at) {
        const next = sc.steps[i];
        applied.current = i;
        setStepIndex(i);
        if (next.statuses) setStatuses((prev) => ({ ...prev, ...next.statuses }));
        setLogs((prev) => [
          ...prev,
          {
            id: logId.current++,
            source: next.log.source,
            text: next.log.text,
            level: next.log.level,
            t: new Date().toLocaleTimeString([], { hour12: false }),
          },
        ]);
      } else break;
    }

    // smoothly animate resource counters between the current and next step
    const cur = sc.steps[applied.current];
    const nxt = sc.steps[Math.min(applied.current + 1, sc.steps.length - 1)];
    const span = Math.max(0.001, nxt.at - cur.at);
    const t = Math.max(0, Math.min(1, (seconds - cur.at) / span));
    setResources(lerpResources(cur.resources, nxt.resources, t));

    if (seconds >= sc.duration) {
      setRunning(false);
      setFinished(true);
      return;
    }
    raf.current = requestAnimationFrame(tick);
  }, []);

  const start = useCallback((id: OpsScenarioId) => {
    if (raf.current) cancelAnimationFrame(raf.current);
    const sc = OPS_SCENARIOS[id];
    scenarioRef.current = sc;
    applied.current = 0;
    setScenarioId(id);
    setActive(true);
    setRunning(true);
    setFinished(false);
    setElapsed(0);
    setStepIndex(0);
    setResources(sc.steps[0].resources);
    setStatuses(sc.steps[0].statuses ?? {});
    setLogs([{
      id: logId.current++,
      source: sc.steps[0].log.source,
      text: sc.steps[0].log.text,
      level: sc.steps[0].log.level,
      t: new Date().toLocaleTimeString([], { hour12: false }),
    }]);
    startTime.current = performance.now();
    raf.current = requestAnimationFrame(tick);
  }, [tick]);

  useEffect(() => () => { if (raf.current) cancelAnimationFrame(raf.current); }, []);

  const actions: LiveOpsAction[] = scenario.actions.map((a) => ({
    id: a.id,
    label: a.label,
    detail: a.detail,
    icon: a.icon,
    state: stepIndex >= a.doneAt ? "done" : stepIndex >= a.startAt ? "executing" : "pending",
  }));

  return {
    active,
    running,
    finished,
    scenario,
    scenarioId,
    elapsed,
    progress: Math.min(1, elapsed / scenario.duration),
    stepIndex,
    step,
    resources,
    statuses,
    logs,
    actions,
    focus: step.focus,
    cues: step.cues ?? [],
    start,
    exit,
  };
}
