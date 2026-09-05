import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { IcuAcuity, ICU_DEMO_DURATION, ICU_DEMO_STAGES, ICU_RISKS, IcuDemoStage, ICU_PATIENTS, IcuPatient } from "../data/icuDemo";
import { RiskLevel, RiskPrediction, VitalProfile } from "../data/patientJourney";

export interface IcuDemoLog {
  id: number;
  source: "System" | "Granite" | "RAG" | "Agentic" | "Clinician";
  text: string;
  level: "info" | "warn" | "crit" | "ok";
  t: string;
}

export interface IcuDemoState {
  active: boolean;
  awaitingBedSelection: boolean;
  running: boolean;
  finished: boolean;
  elapsed: number;
  progress: number;
  stageIndex: number;
  stage: IcuDemoStage;
  vitals: VitalProfile;
  risk: RiskLevel;
  bedAcuity: IcuAcuity;
  risks: RiskPrediction[];
  logs: IcuDemoLog[];
  cues: string[];
  patient: IcuPatient;
  selectedBed: string;  
    mlRisk: {
    risk_level: "LOW" | "MODERATE" | "HIGH";
    risk_probability: number;
    explanation: string;
  } | null;
  start: () => void;
  selectBed: (bed?: string) => void;
  exit: () => void;
}

const jitter = (base: number, amount: number, decimals = 0) => {
  const value = base + (Math.random() - 0.5) * amount * 2;
  return decimals ? Number(value.toFixed(decimals)) : Math.round(value);
};

export function useIcuDemo(): IcuDemoState {
  const [active, setActive] = useState(false);
  const [awaitingBedSelection, setAwaitingBedSelection] = useState(false);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [stageIndex, setStageIndex] = useState(0);
  const [vitals, setVitals] = useState<VitalProfile>(ICU_DEMO_STAGES[0].vitals);
  const [logs, setLogs] = useState<IcuDemoLog[]>([]);
  const [cues, setCues] = useState<string[]>(ICU_DEMO_STAGES[0].cues);
  const [selectedBed, setSelectedBed] = useState<string>("ICU-04");
const [mlRisk, setMlRisk] = useState<{
  risk_level: "LOW" | "MODERATE" | "HIGH";
  risk_probability: number;
  explanation: string;
} | null>(null);

  const raf = useRef<number | null>(null);
  const startTime = useRef(0);
  const applied = useRef(0);
  const lastVitalTick = useRef(0);
  const lastRiskTick = useRef(0);
const lastMlAlertLevel = useRef<"LOW" | "MODERATE" | "HIGH" | null>(null);
  const logId = useRef(0);
const mlAlertShown = useRef(false);
const predictRisk = useCallback(async (v: VitalProfile, patient: IcuPatient) => {
 try {
    const response = await fetch(
      "http://127.0.0.1:8000/api/ai/patient-analysis",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          age: patient.age,
          heart_rate: v.hr,
          systolic_bp: v.sbp,
          spo2: v.spo2,
          respiratory_rate: v.rr,
          temperature: v.temp,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Risk API failed: ${response.status}`);
    }

    const data = await response.json();

    setMlRisk({
      risk_level: data.risk.risk_level,
      risk_probability: data.risk.risk_probability,
      explanation: data.explanation,
    });
if (data.risk.risk_level === "HIGH" && !mlAlertShown.current) {
  mlAlertShown.current = true;

  setLogs((previous) => [
    ...previous,
    {
      id: logId.current++,
      source: "System",
      text: `CRITICAL: ML patient risk HIGH (${data.risk.risk_probability.toFixed(1)}%). Immediate clinical review required for ${patient.bed}.`,
      level: "crit",
      t: new Date().toLocaleTimeString([], { hour12: false }),
    },
  ]);
}
if (
  data.risk.risk_level === "HIGH" &&
  lastMlAlertLevel.current !== "HIGH"
) {
  setLogs((previous) => [
    ...previous,
    {
      id: logId.current++,
      source: "Clinician",
      text: `CRITICAL: ML patient risk HIGH (${data.risk.risk_probability}%). Immediate clinical review required for ${patient.name ?? patient.bed}.`,
      level: "crit",
      t: new Date().toLocaleTimeString([], { hour12: false }),
    },
  ]);

  lastMlAlertLevel.current = "HIGH";
} else if (data.risk.risk_level !== "HIGH") {
  lastMlAlertLevel.current = data.risk.risk_level;
}

  } catch (error) {
    console.warn("ML patient-analysis prediction unavailable:", error);
  }
}, []);

  const stage = ICU_DEMO_STAGES[stageIndex];

  const exit = useCallback(() => {
    if (raf.current) cancelAnimationFrame(raf.current);
    raf.current = null;
    applied.current = 0;
    lastVitalTick.current = 0;
lastMlAlertLevel.current = null;
    setActive(false);
    setAwaitingBedSelection(false);
    setRunning(false);
    setFinished(false);
    setElapsed(0);
    setStageIndex(0);
    setVitals(ICU_DEMO_STAGES[0].vitals);
    setLogs([]);
    setCues(ICU_DEMO_STAGES[0].cues);
    setSelectedBed("ICU-04");
  }, []);

  const start = useCallback(() => {
    if (raf.current) cancelAnimationFrame(raf.current);
    raf.current = null;
    applied.current = 0;
    lastVitalTick.current = 0;
    lastRiskTick.current = 0;
    setActive(true);
    setAwaitingBedSelection(true);
    setRunning(false);
    setFinished(false);
    setElapsed(0);
    setStageIndex(0);
    setVitals(ICU_DEMO_STAGES[0].vitals);
    setCues(ICU_DEMO_STAGES[0].cues);
    setLogs([{ id: logId.current++, source: "System", text: ICU_DEMO_STAGES[0].log.text, level: "ok", t: new Date().toLocaleTimeString([], { hour12: false }) }]);
  }, []);

  const applyStage = useCallback((next: IcuDemoStage, index: number) => {
    setStageIndex(index);
    setVitals(next.vitals);
    setCues(next.cues);
    setLogs((previous) => [
      ...previous,
      { id: logId.current++, source: next.log.source, text: next.log.text, level: next.log.level, t: new Date().toLocaleTimeString([], { hour12: false }) },
    ]);
  }, []);

  const tick = useCallback(() => {
    const now = performance.now();
    const seconds = (now - startTime.current) / 1000;
    setElapsed(seconds);

    for (let index = applied.current + 1; index < ICU_DEMO_STAGES.length; index++) {
      if (seconds >= ICU_DEMO_STAGES[index].at) {
        applyStage(ICU_DEMO_STAGES[index], index);
        applied.current = index;
      } else break;
    }

if (seconds - lastVitalTick.current > 1.2) {
  lastVitalTick.current = seconds;

  const base = ICU_DEMO_STAGES[applied.current].vitals;

  const nextVitals: VitalProfile = {
    hr: jitter(base.hr, applied.current === 3 ? 9 : 3),
    sbp: jitter(base.sbp, applied.current === 3 ? 7 : 3),
    dbp: jitter(base.dbp, applied.current === 3 ? 5 : 2),
    spo2: Math.min(
      100,
      jitter(base.spo2, applied.current === 3 ? 2.3 : 1.1)
    ),
    rr: jitter(base.rr, applied.current === 3 ? 3.1 : 1.2),
    temp: jitter(base.temp, 0.14, 1),
    o2: base.o2,
    vent: base.vent,
    news: base.news,
  };

  setVitals(nextVitals);

  // Ask the ML model for an updated prediction every 4 seconds.
  if (seconds - lastRiskTick.current > 4) {
    lastRiskTick.current = seconds;

    const currentPatient =
      ICU_PATIENTS.find((p) => p.bed === selectedBed) ?? ICU_PATIENTS[1];

    predictRisk(nextVitals, currentPatient);
  }
}
    if (seconds >= ICU_DEMO_DURATION) {
      setRunning(false);
      setFinished(true);
      return;
    }
    raf.current = requestAnimationFrame(tick);
}, [applyStage, predictRisk, selectedBed]);

  const selectBed = useCallback((bed?: string) => {
    if (!active || !awaitingBedSelection) return;
    const chosen = bed ?? "ICU-04";
    setSelectedBed(chosen);
    setAwaitingBedSelection(false);
    setRunning(true);
    setStageIndex(1);
    setVitals(ICU_DEMO_STAGES[1].vitals);
    setCues(ICU_DEMO_STAGES[1].cues);
    applied.current = 1;
    startTime.current = performance.now();
    lastVitalTick.current = 0;
    lastRiskTick.current = 0;
   const selectedPatient =
  ICU_PATIENTS.find((p) => p.bed === chosen) ?? ICU_PATIENTS[1];

const patientName = selectedPatient.name;
predictRisk(ICU_DEMO_STAGES[1].vitals, selectedPatient);
    setLogs((previous) => [
      ...previous,
      { id: logId.current++, source: "System", text: `${chosen} · ${patientName} selected. Patient twin, clinical record and device telemetry synchronized.`, level: "info", t: new Date().toLocaleTimeString([], { hour12: false }) },
    ]);
    raf.current = requestAnimationFrame(tick);
 }, [active, awaitingBedSelection, tick, predictRisk]);

  useEffect(() => () => { if (raf.current) cancelAnimationFrame(raf.current); }, []);

  const bedAcuity = useMemo<IcuAcuity>(() => {
    if (awaitingBedSelection || stageIndex <= 1) return "stable";
    if (stageIndex === 2) return "observation";
    if (stageIndex === 3) {
      // Single emergency scene progresses green -> yellow -> orange -> red over 9 seconds.
      if (elapsed < 20) return "observation";
      if (elapsed < 23) return "high";
      return "critical";
    }
    if (stageIndex >= 4 && stageIndex <= 6) return "critical";
    if (stageIndex === 7) return "high";
    if (stageIndex === 8) return "observation";
    if (stageIndex === 9) return "ready";
    return "stable";
  }, [awaitingBedSelection, elapsed, stageIndex]);

  return {
    active,
    awaitingBedSelection,
    running,
    finished,
    elapsed,
    progress: Math.min(1, elapsed / ICU_DEMO_DURATION),
    stageIndex,
    stage,
    vitals,
    risk: stage.risk,
    mlRisk,
    bedAcuity,
    risks: ICU_RISKS[stage.id],
    logs,
    cues,
    patient: ICU_PATIENTS.find((p) => p.bed === selectedBed) ?? ICU_PATIENTS[1],
    selectedBed,
    start,
    selectBed,
    exit,
  };
}
