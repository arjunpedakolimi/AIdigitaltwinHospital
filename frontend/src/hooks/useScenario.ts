import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Status } from "../data/hospital";
import { AiSource, SCENARIO, SCENARIO_DURATION, ScenarioStep, Phase } from "../data/scenario";

export interface AiLog {
  id: number;
  source: AiSource;
  text: string;
  level: "info" | "warn" | "ok" | "crit";
  t: string;
}

export interface ScenarioState {
  running: boolean;
  finished: boolean;
  elapsed: number;
  progress: number; // 0..1
  phase: Phase;
  statuses: Record<string, Status>;
  focus: string;
  activeStep: ScenarioStep | null;
  logs: AiLog[];
  banner: { text: string; tone: "info" | "warn" | "crit" | "ok" } | null;
  start: () => void;
  reset: () => void;
}

const DEFAULT_STATUS = SCENARIO[0].statuses as Record<string, Status>;

export function useScenario(): ScenarioState {
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [statuses, setStatuses] = useState<Record<string, Status>>({ ...DEFAULT_STATUS });
  const [focus, setFocus] = useState<string>("overview");
  const [phase, setPhase] = useState<Phase>("normal");
  const [logs, setLogs] = useState<AiLog[]>([]);
  const [banner, setBanner] = useState<ScenarioState["banner"]>(null);
  const [activeIdx, setActiveIdx] = useState<number>(-1);

  const raf = useRef<number | null>(null);
  const startTime = useRef<number>(0);
  const appliedIdx = useRef<number>(-1);
  const logId = useRef(0);

  const reset = useCallback(() => {
    if (raf.current) cancelAnimationFrame(raf.current);
    raf.current = null;
    setRunning(false);
    setFinished(false);
    setElapsed(0);
    setStatuses({ ...DEFAULT_STATUS });
    setFocus("overview");
    setPhase("normal");
    setLogs([]);
    setBanner(null);
    setActiveIdx(-1);
    appliedIdx.current = -1;
  }, []);

  const applyStep = useCallback((step: ScenarioStep, idx: number) => {
    setPhase(step.phase);
    setActiveIdx(idx);
    if (step.focus) setFocus(step.focus);
    if (step.statuses) {
      setStatuses((prev) => ({ ...prev, ...step.statuses }));
    }
    if (step.banner) setBanner(step.banner);
    if (step.ai) {
      const now = new Date();
      setLogs((prev) => [
        ...prev,
        {
          id: logId.current++,
          source: step.ai!.source,
          text: step.ai!.text,
          level: step.ai!.level ?? "info",
          t: now.toLocaleTimeString([], { hour12: false }),
        },
      ]);
    }
  }, []);

  const tick = useCallback(() => {
    const now = performance.now();
    const e = (now - startTime.current) / 1000;
    setElapsed(e);

    // apply any steps whose time has passed
    for (let i = appliedIdx.current + 1; i < SCENARIO.length; i++) {
      if (e >= SCENARIO[i].at) {
        applyStep(SCENARIO[i], i);
        appliedIdx.current = i;
      } else break;
    }

    if (e >= SCENARIO_DURATION) {
      setRunning(false);
      setFinished(true);
      return;
    }
    raf.current = requestAnimationFrame(tick);
  }, [applyStep]);

  const start = useCallback(() => {
    reset();
    // slight delay so reset state flushes
    requestAnimationFrame(() => {
      startTime.current = performance.now();
      setRunning(true);
      setFinished(false);
      raf.current = requestAnimationFrame(tick);
    });
  }, [reset, tick]);

  useEffect(() => {
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, []);

  const progress = useMemo(() => Math.min(1, elapsed / SCENARIO_DURATION), [elapsed]);
  const activeStep = activeIdx >= 0 ? SCENARIO[activeIdx] : null;

  return {
    running,
    finished,
    elapsed,
    progress,
    phase,
    statuses,
    focus,
    activeStep,
    logs,
    banner,
    start,
    reset,
  };
}
