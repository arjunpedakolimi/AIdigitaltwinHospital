import { useCallback, useEffect, useRef, useState } from "react";
import { Status } from "../data/hospital";
import {
  JOURNEY, JOURNEY_DURATION, JourneyStep, VitalProfile,
  RISK_BY_STEP, RECOVERY_ETA, RiskPrediction, RiskLevel,
  RECOMMENDATIONS,
} from "../data/patientJourney";

export interface JourneyLog {
  id: number;
  source: "System" | "Granite" | "Agentic" | "Clinician";
  text: string;
  level: "info" | "warn" | "crit" | "ok";
  t: string;
}

export interface LiveRecommendation {
  priority: number;
  action: string;
  detail: string;
  state: "pending" | "executing" | "done";
}

export interface PatientJourneyState {
  running: boolean;
  finished: boolean;
  elapsed: number;
  progress: number;
  stepIndex: number;             // -1 before start
  step: JourneyStep | null;
  vitals: VitalProfile;
  ecgAmplitude: number;
  risk: RiskLevel;
  risks: RiskPrediction[];
  recoveryEta: string;
  recommendations: LiveRecommendation[];
  statuses: Record<string, Status>;
  logs: JourneyLog[];
  cues: string[];
  etaSeconds: number;
  start: () => void;
  reset: () => void;
}

const BASE_VITALS: VitalProfile = JOURNEY[0].vitals;

const jitter = (base: number, amount: number, decimals = 0) => {
  const v = base + (Math.random() - 0.5) * amount * 2;
  return decimals ? Number(v.toFixed(decimals)) : Math.round(v);
};

export function usePatientJourney(): PatientJourneyState {
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [stepIndex, setStepIndex] = useState(-1);
  const [vitals, setVitals] = useState<VitalProfile>(BASE_VITALS);
  const [statuses, setStatuses] = useState<Record<string, Status>>({});
  const [logs, setLogs] = useState<JourneyLog[]>([]);
  const [cues, setCues] = useState<string[]>([]);

  const raf = useRef<number | null>(null);
  const startTime = useRef(0);
  const applied = useRef(-1);
  const logId = useRef(0);
  const lastVitalTick = useRef(0);

  const reset = useCallback(() => {
    if (raf.current) cancelAnimationFrame(raf.current);
    raf.current = null;
    applied.current = -1;
    lastVitalTick.current = 0;
    setRunning(false);
    setFinished(false);
    setElapsed(0);
    setStepIndex(-1);
    setVitals(BASE_VITALS);
    setStatuses({});
    setLogs([]);
    setCues([]);
  }, []);

  const applyStep = useCallback((step: JourneyStep, index: number) => {
    setStepIndex(index);
    setVitals(step.vitals);
    setCues(step.cues ?? []);
    if (step.deptStatuses) setStatuses((prev) => ({ ...prev, ...step.deptStatuses }));
    setLogs((prev) => [
      ...prev,
      {
        id: logId.current++,
        source: step.log.source,
        text: step.log.text,
        level: step.log.level,
        t: new Date().toLocaleTimeString([], { hour12: false }),
      },
    ]);
  }, []);

  const tick = useCallback(() => {
    const now = performance.now();
    const e = (now - startTime.current) / 1000;
    setElapsed(e);

    for (let i = applied.current + 1; i < JOURNEY.length; i++) {
      if (e >= JOURNEY[i].at) {
        applyStep(JOURNEY[i], i);
        applied.current = i;
      } else break;
    }

    // live vitals jitter every 1.4s so the monitor feels real
    if (e - lastVitalTick.current > 1.4 && applied.current >= 0) {
      lastVitalTick.current = e;
      const base = JOURNEY[applied.current].vitals;
      setVitals({
        hr: jitter(base.hr, 4),
        sbp: jitter(base.sbp, 4),
        dbp: jitter(base.dbp, 3),
        spo2: Math.min(100, jitter(base.spo2, 1.4)),
        rr: jitter(base.rr, 1.6),
        temp: jitter(base.temp, 0.18, 1),
        o2: base.o2,
        vent: base.vent,
        news: base.news,
      });
    }

    if (e >= JOURNEY_DURATION) {
      setRunning(false);
      setFinished(true);
      return;
    }
    raf.current = requestAnimationFrame(tick);
  }, [applyStep]);

  const start = useCallback(() => {
    reset();
    requestAnimationFrame(() => {
      startTime.current = performance.now();
      lastVitalTick.current = 0;
      setRunning(true);
      setFinished(false);
      raf.current = requestAnimationFrame(tick);
    });
  }, [reset, tick]);

  useEffect(() => () => { if (raf.current) cancelAnimationFrame(raf.current); }, []);

  const step = stepIndex >= 0 ? JOURNEY[stepIndex] : null;
  const stepId = step?.id ?? 1;
  const risk = step?.risk ?? "critical";
  const risks = RISK_BY_STEP[stepId] ?? RISK_BY_STEP[1];
  const recoveryEta = RECOVERY_ETA[stepId] ?? "Unknown";

  // ECG amplitude scales with acuity so the waveform visibly calms during recovery
  const ecgAmplitude =
    risk === "critical" ? 1 : risk === "high" ? 0.82 : risk === "observation" ? 0.66 : 0.55;

  const recommendations: LiveRecommendation[] = RECOMMENDATIONS.map((r) => {
    if (stepId < 7) return { ...r, state: "pending" as const };
    if (stepId >= r.doneAt) return { ...r, state: "done" as const };
    if (stepId >= 7) return { ...r, state: "executing" as const };
    return { ...r, state: "pending" as const };
  });

  // ambulance ETA countdown during step 1
  const etaSeconds = stepIndex === 0 ? Math.max(0, Math.round(42 - elapsed * 4.6)) : 0;

  return {
    running, finished, elapsed,
    progress: Math.min(1, elapsed / JOURNEY_DURATION),
    stepIndex, step, vitals, ecgAmplitude, risk, risks, recoveryEta,
    recommendations, statuses, logs, cues, etaSeconds,
    start, reset,
  };
}
