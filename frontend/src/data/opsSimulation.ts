import { Status } from "./hospital";

export type OpsScenarioId = "resource" | "masscasualty" | "equipment";
export type OpsActorSource = "System" | "Granite" | "RAG" | "Agentic" | "Clinician" | "Biomed";

/** A single AI-executed operational decision that animates in the task queue. */
export interface OpsAction {
  id: string;
  label: string;
  detail: string;
  icon: string;
  /** step index at which this action begins executing */
  startAt: number;
  /** step index at which this action is complete */
  doneAt: number;
}

/** Live resource counters that visibly change as the AI acts. */
export interface OpsResources {
  icuBeds: { used: number; total: number };
  ventilators: { used: number; total: number };
  doctors: { deployed: number; total: number };
  nurses: { deployed: number; total: number };
  ambulances: { active: number; total: number };
  otRooms: { used: number; total: number };
  erLoad: number;   // percentage
  waitTime: number; // minutes
}

export interface OpsStep {
  id: number;
  at: number;              // seconds from start
  title: string;
  subtitle: string;
  detail: string;
  focus: string;           // department id or "overview"
  banner: { text: string; tone: "info" | "warn" | "crit" | "ok" };
  log: { source: OpsActorSource; text: string; level: "info" | "warn" | "crit" | "ok" };
  statuses?: Record<string, Status>;
  resources: OpsResources;
  /** 3D animation cues */
  cues?: string[];
  /** Granite reasoning shown in the explain panel */
  reasoning?: { headline: string; confidence: number; factors: { label: string; value: string; flag: boolean }[] };
}

export interface OpsScenario {
  id: OpsScenarioId;
  name: string;
  tagline: string;
  icon: string;
  accent: string;
  duration: number;
  actions: OpsAction[];
  steps: OpsStep[];
  outcome: {
    headline: string;
    lines: string[];
    before: { label: string; value: string }[];
    after: { label: string; value: string }[];
  };
}

const res = (
  icuUsed: number, ventUsed: number, docs: number, nurses: number,
  amb: number, ot: number, erLoad: number, wait: number,
  icuTotal = 20, ventTotal = 12
): OpsResources => ({
  icuBeds: { used: icuUsed, total: icuTotal },
  ventilators: { used: ventUsed, total: ventTotal },
  doctors: { deployed: docs, total: 68 },
  nurses: { deployed: nurses, total: 128 },
  ambulances: { active: amb, total: 6 },
  otRooms: { used: ot, total: 6 },
  erLoad,
  waitTime: wait,
});

/* ══════════════════ 1. AI RESOURCE ALLOCATION ══════════════════ */
const RESOURCE_ALLOCATION: OpsScenario = {
  id: "resource",
  name: "AI Resource Allocation",
  tagline: "20 patients arrive · Granite predicts ICU overload · Agentic AI reallocates capacity",
  icon: "⚡",
  accent: "#22d3ee",
  duration: 62,
  actions: [
    { id: "icub", label: "Open ICU Block B", detail: "+12 surge beds activated", icon: "🏥", startAt: 4, doneAt: 5 },
    { id: "docs", label: "Deploy 3 Doctors", detail: "Reassigned from Ward B → ICU", icon: "🩺", startAt: 4, doneAt: 6 },
    { id: "vents", label: "Allocate 5 Ventilators", detail: "Biomed store → ICU-B", icon: "🌬️", startAt: 5, doneAt: 6 },
    { id: "amb", label: "Redirect 2 Ambulances", detail: "Rerouted to partner hospital", icon: "🚑", startAt: 5, doneAt: 7 },
    { id: "nurses", label: "Escalate Nurse Ratio", detail: "1:2 → 1:1 in critical bays", icon: "🧑‍⚕️", startAt: 6, doneAt: 7 },
    { id: "ot", label: "Reserve 2 Theatres", detail: "OT-5 and OT-6 on standby", icon: "🔪", startAt: 6, doneAt: 7 },
  ],
  steps: [
    {
      id: 0, at: 0, title: "Normal Operations", subtitle: "Campus stable · all departments green",
      detail: "ICU at 70% occupancy. Emergency running at normal load with a 7 minute median wait.",
      focus: "overview",
      banner: { text: "CAMPUS STATUS  /  ALL SYSTEMS NORMAL", tone: "ok" },
      log: { source: "System", text: "Baseline nominal. 768 IoT sensors streaming. No capacity alerts.", level: "ok" },
      statuses: {},
      resources: res(14, 9, 42, 78, 6, 4, 38, 7),
      cues: ["normal"],
    },
    {
      id: 1, at: 6, title: "Emergency Triggered", subtitle: "Multi-vehicle incident on the ring road",
      detail: "City emergency feed reports a serious incident. 20 casualties are being routed to this hospital.",
      focus: "security",
      banner: { text: "PRIORITY ALERT  /  MASS INCIDENT DECLARED", tone: "crit" },
      log: { source: "System", text: "Incident ingested: 20 casualties inbound. Estimated first arrival 6 minutes.", level: "crit" },
      statuses: { emergency: "busy", security: "busy" },
      resources: res(14, 9, 42, 78, 6, 4, 52, 11),
      cues: ["alert", "ambulance_inbound"],
    },
    {
      id: 2, at: 14, title: "20 Patients Arrive", subtitle: "Emergency intake surge in progress",
      detail: "Ambulances unload continuously. Triage assigns acuity. Emergency load climbs past safe threshold.",
      focus: "emergency",
      banner: { text: "20 PATIENTS RECEIVED  /  EMERGENCY SURGE", tone: "crit" },
      log: { source: "System", text: "20 patients registered. 6 critical, 8 urgent, 6 stable. ER load 94%.", level: "crit" },
      statuses: { emergency: "critical", reception: "busy", radiology: "busy", blood: "busy" },
      resources: res(17, 11, 48, 92, 6, 5, 94, 26),
      cues: ["patients_arriving", "staff_response"],
    },
    {
      id: 3, at: 22, title: "IBM Granite Predicts ICU Overload", subtitle: "Capacity breach forecast in 18 minutes",
      detail: "Granite projects ICU demand will exceed supply by 6 beds and 5 ventilators within 18 minutes.",
      focus: "command",
      banner: { text: "IBM GRANITE  /  ICU OVERLOAD PREDICTED", tone: "crit" },
      log: { source: "Granite", text: "PREDICTION: ICU shortfall of 6 beds, 5 ventilators, 3 clinicians in 18 min. Confidence 94.6%.", level: "crit" },
      statuses: { icu: "critical", command: "busy" },
      resources: res(19, 12, 48, 92, 6, 5, 96, 31),
      cues: ["granite_alert"],
      reasoning: {
        headline: "ICU Overload Risk 94%",
        confidence: 94.6,
        factors: [
          { label: "ICU Occupancy", value: "19/20 (95%)", flag: true },
          { label: "Ventilators", value: "12/12 in use", flag: true },
          { label: "Critical inbound", value: "6 patients", flag: true },
          { label: "Mean admission rate", value: "3.2 / 10 min", flag: true },
          { label: "Discharge capacity", value: "1 / 30 min", flag: true },
        ],
      },
    },
    {
      id: 4, at: 30, title: "Agentic AI Decision", subtitle: "Constrained plan generated and approved",
      detail: "Agentic AI evaluates 214 allocation permutations against SOP constraints and selects the optimal plan.",
      focus: "command",
      banner: { text: "AGENTIC AI  /  ALLOCATION PLAN APPROVED", tone: "warn" },
      log: { source: "Agentic", text: "PLAN: Open ICU-B, deploy 3 doctors, allocate 5 ventilators, redirect 2 ambulances, 1:1 nursing, reserve 2 theatres.", level: "warn" },
      statuses: { icu: "critical", command: "busy", storage: "busy", icuB: "busy" },
      resources: res(19, 12, 48, 92, 6, 5, 96, 31),
      cues: ["agentic_plan"],
    },
    {
      id: 5, at: 38, title: "Executing: Capacity & Equipment", subtitle: "ICU Block B online · ventilators moving",
      detail: "ICU Block B is activated adding 12 beds. Biomed dispatches 5 ventilators from central storage to ICU-B.",
      focus: "icuB",
      banner: { text: "EXECUTING  /  ICU-B ONLINE · +12 BEDS", tone: "info" },
      log: { source: "Agentic", text: "ICU-B activated: 12 beds live. 5 ventilators dispatched from Biomed. Gas manifold pressurised.", level: "info" },
      statuses: { icuB: "busy", storage: "busy", oxygen: "busy" },
      resources: res(21, 14, 54, 104, 6, 6, 88, 24, 32, 17),
      cues: ["deploy_equipment", "icub_online"],
    },
    {
      id: 6, at: 46, title: "Executing: Staff & Transport", subtitle: "Doctors deployed · ambulances redirected",
      detail: "3 doctors move from Ward B to ICU. Nurse ratio escalates to 1:1. Two inbound ambulances are rerouted.",
      focus: "icu",
      banner: { text: "EXECUTING  /  STAFF DEPLOYED · 2 AMBULANCES REDIRECTED", tone: "info" },
      log: { source: "Agentic", text: "3 doctors reassigned to ICU. Nursing escalated to 1:1. AMB-05 and AMB-06 redirected to St. Mary partner site.", level: "info" },
      statuses: { icu: "busy", icuB: "busy", wardB: "busy", ot: "busy" },
      resources: res(23, 16, 61, 118, 4, 6, 71, 17, 32, 17),
      cues: ["deploy_staff", "redirect_ambulance"],
    },
    {
      id: 7, at: 54, title: "Hospital Returns to Stable", subtitle: "Capacity restored · all departments green",
      detail: "Surge capacity absorbed the demand. ICU occupancy is back within safe limits and waiting times have dropped.",
      focus: "overview",
      banner: { text: "✓ HOSPITAL STABLE  /  AI ALLOCATION SUCCESSFUL", tone: "ok" },
      log: { source: "Granite", text: "Stabilised. ICU 72% occupancy, no unmet demand, ER wait 9 min. Zero patients diverted from care.", level: "ok" },
      statuses: {
        emergency: "normal", icu: "normal", icuB: "normal", command: "normal", reception: "normal",
        radiology: "normal", blood: "normal", storage: "normal", oxygen: "normal", wardB: "normal",
        ot: "normal", security: "normal",
      },
      resources: res(23, 16, 61, 118, 6, 4, 34, 9, 32, 17),
      cues: ["stabilized"],
    },
  ],
  outcome: {
    headline: "Hospital Returned to Stable",
    lines: [
      "ICU Block B opened — 12 additional beds",
      "3 doctors and 26 nurses reallocated",
      "5 ventilators moved from Biomed to ICU-B",
      "2 ambulances redirected to partner hospital",
      "Zero patients turned away",
    ],
    before: [
      { label: "ICU Occupancy", value: "95%" },
      { label: "Ventilators", value: "12/12 used" },
      { label: "ER Load", value: "96%" },
      { label: "Wait Time", value: "31 min" },
      { label: "Unmet Demand", value: "6 beds" },
    ],
    after: [
      { label: "ICU Occupancy", value: "72%" },
      { label: "Ventilators", value: "16/17 used" },
      { label: "ER Load", value: "34%" },
      { label: "Wait Time", value: "9 min" },
      { label: "Unmet Demand", value: "0 beds" },
    ],
  },
};

/* ══════════════════ 2. MASS CASUALTY ══════════════════ */
const MASS_CASUALTY: OpsScenario = {
  id: "masscasualty",
  name: "Mass Casualty Response",
  tagline: "Bus accident · 35 patients · AI triage prioritisation and theatre assignment",
  icon: "🚌",
  accent: "#f43f5e",
  duration: 62,
  actions: [
    { id: "triage", label: "AI Triage Prioritisation", detail: "35 patients scored by acuity", icon: "🎯", startAt: 3, doneAt: 4 },
    { id: "ot", label: "Assign 4 Operation Theatres", detail: "OT-1,2,3,5 to critical cases", icon: "🔪", startAt: 4, doneAt: 5 },
    { id: "icu", label: "Allocate 9 ICU Beds", detail: "ICU-A 4 · ICU-B 5", icon: "🛏️", startAt: 4, doneAt: 6 },
    { id: "amb", label: "Redirect 4 Ambulances", detail: "Stable cases to 2 partner sites", icon: "🚑", startAt: 5, doneAt: 6 },
    { id: "blood", label: "Release 18 Blood Units", detail: "O-negative emergency protocol", icon: "🩸", startAt: 5, doneAt: 6 },
    { id: "staff", label: "Recall Off-duty Staff", detail: "14 clinicians paged", icon: "📟", startAt: 5, doneAt: 7 },
  ],
  steps: [
    {
      id: 0, at: 0, title: "Normal Operations", subtitle: "Campus stable · routine load",
      detail: "All departments green. Emergency handling routine presentations.",
      focus: "overview",
      banner: { text: "CAMPUS STATUS  /  ALL SYSTEMS NORMAL", tone: "ok" },
      log: { source: "System", text: "Baseline nominal. Emergency at 38% capacity.", level: "ok" },
      resources: res(14, 9, 42, 78, 6, 4, 38, 7),
      cues: ["normal"],
    },
    {
      id: 1, at: 6, title: "Bus Accident Reported", subtitle: "Major incident declared by city dispatch",
      detail: "A passenger bus collision has produced 35 casualties. Regional major incident protocol is activated.",
      focus: "security",
      banner: { text: "MAJOR INCIDENT  /  BUS ACCIDENT · 35 CASUALTIES", tone: "crit" },
      log: { source: "System", text: "MAJOR INCIDENT declared. 35 casualties inbound across 9 ambulances. First wave in 4 minutes.", level: "crit" },
      statuses: { emergency: "busy", security: "busy", ot: "busy" },
      resources: res(14, 9, 46, 84, 6, 4, 58, 14),
      cues: ["alert", "ambulance_inbound"],
    },
    {
      id: 2, at: 14, title: "35 Patients Arrive", subtitle: "Emergency capacity reaches 95%",
      detail: "Continuous ambulance arrivals. Corridors converted to overflow triage. Emergency is at 95% capacity.",
      focus: "emergency",
      banner: { text: "35 PATIENTS RECEIVED  /  ER CAPACITY 95%", tone: "crit" },
      log: { source: "System", text: "35 patients received. Emergency at 95% capacity. Overflow triage opened in corridor A.", level: "crit" },
      statuses: { emergency: "critical", reception: "critical", radiology: "critical", blood: "busy", lab: "busy" },
      resources: res(18, 11, 52, 98, 6, 5, 95, 42),
      cues: ["patients_arriving", "staff_response"],
    },
    {
      id: 3, at: 22, title: "AI Prioritises Critical Patients", subtitle: "Granite triage scoring across 35 cases",
      detail: "Granite scores every patient on injury severity, vitals and deterioration risk, producing a ranked treatment order.",
      focus: "command",
      banner: { text: "IBM GRANITE  /  TRIAGE PRIORITISATION COMPLETE", tone: "crit" },
      log: { source: "Granite", text: "Triage complete: 7 immediate (red), 11 urgent (yellow), 17 delayed (green). 4 need immediate surgery.", level: "crit" },
      statuses: { emergency: "critical", command: "busy", ot: "critical" },
      resources: res(18, 11, 52, 98, 6, 5, 95, 42),
      cues: ["granite_alert"],
      reasoning: {
        headline: "4 Patients Need Immediate Surgery",
        confidence: 93.8,
        factors: [
          { label: "Red (immediate)", value: "7 patients", flag: true },
          { label: "Yellow (urgent)", value: "11 patients", flag: true },
          { label: "Green (delayed)", value: "17 patients", flag: false },
          { label: "Surgical demand", value: "4 theatres", flag: true },
          { label: "Blood requirement", value: "18 units O-", flag: true },
        ],
      },
    },
    {
      id: 4, at: 30, title: "Agentic AI Allocation Plan", subtitle: "Theatres, beds and transport assigned",
      detail: "Agentic AI assigns operation theatres to the four immediate cases and reserves ICU beds for post-operative recovery.",
      focus: "command",
      banner: { text: "AGENTIC AI  /  SURGICAL & ICU PLAN ISSUED", tone: "warn" },
      log: { source: "Agentic", text: "PLAN: 4 theatres assigned, 9 ICU beds allocated, 18 blood units released, 4 ambulances redirected, 14 staff recalled.", level: "warn" },
      statuses: { ot: "critical", icu: "critical", icuB: "busy", blood: "critical", command: "busy" },
      resources: res(18, 11, 52, 98, 6, 6, 95, 42),
      cues: ["agentic_plan"],
    },
    {
      id: 5, at: 38, title: "Theatres & ICU Beds Assigned", subtitle: "Surgery underway · ICU-B receiving",
      detail: "Four theatres begin emergency surgery. ICU Block B opens and receives post-operative and high-acuity patients.",
      focus: "ot",
      banner: { text: "EXECUTING  /  4 THEATRES ACTIVE · ICU-B OPEN", tone: "info" },
      log: { source: "Clinician", text: "OT-1,2,3,5 in progress. ICU-B receiving. 18 units O-negative delivered to theatres.", level: "info" },
      statuses: { ot: "critical", icuB: "busy", blood: "busy", storage: "busy" },
      resources: res(24, 15, 61, 116, 6, 6, 74, 28, 32, 17),
      cues: ["deploy_equipment", "icub_online", "surgery_active"],
    },
    {
      id: 6, at: 46, title: "Ambulances Redirected", subtitle: "Load balanced across the regional network",
      detail: "Four ambulances carrying stable patients are rerouted to two partner hospitals, reducing pressure on Emergency.",
      focus: "emergency",
      banner: { text: "EXECUTING  /  4 AMBULANCES REDIRECTED", tone: "info" },
      log: { source: "Agentic", text: "4 ambulances rerouted to St. Mary and Northgate. Emergency load falling. 14 recalled staff on site.", level: "info" },
      statuses: { emergency: "busy", ot: "busy", icu: "busy" },
      resources: res(26, 16, 66, 124, 3, 5, 52, 18, 32, 17),
      cues: ["redirect_ambulance", "deploy_staff"],
    },
    {
      id: 7, at: 54, title: "Hospital Stabilized", subtitle: "All 35 patients treated or safely transferred",
      detail: "Every casualty has received definitive care or been safely transferred. Capacity has returned to operational levels.",
      focus: "overview",
      banner: { text: "✓ HOSPITAL STABILIZED  /  35 PATIENTS MANAGED", tone: "ok" },
      log: { source: "Granite", text: "Incident closed. 35 patients managed, 0 mortality, mean door-to-theatre 22 min against 45 min target.", level: "ok" },
      statuses: {
        emergency: "normal", icu: "normal", icuB: "normal", ot: "normal", blood: "normal",
        radiology: "normal", lab: "normal", reception: "normal", command: "normal",
        storage: "normal", security: "normal",
      },
      resources: res(24, 14, 61, 118, 6, 3, 36, 10, 32, 17),
      cues: ["stabilized"],
    },
  ],
  outcome: {
    headline: "Mass Casualty Incident Managed",
    lines: [
      "35 patients triaged and prioritised by AI",
      "4 operation theatres assigned to immediate cases",
      "9 ICU beds allocated across two blocks",
      "18 units of O-negative blood released",
      "4 ambulances redirected · 0 mortality",
    ],
    before: [
      { label: "ER Capacity", value: "95%" },
      { label: "Wait Time", value: "42 min" },
      { label: "Theatres Free", value: "0/6" },
      { label: "Door-to-theatre", value: "58 min" },
      { label: "Patients Waiting", value: "35" },
    ],
    after: [
      { label: "ER Capacity", value: "36%" },
      { label: "Wait Time", value: "10 min" },
      { label: "Theatres Free", value: "3/6" },
      { label: "Door-to-theatre", value: "22 min" },
      { label: "Patients Waiting", value: "0" },
    ],
  },
};

/* ══════════════════ 3. EQUIPMENT FAILURE ══════════════════ */
const EQUIPMENT_FAILURE: OpsScenario = {
  id: "equipment",
  name: "Equipment Failure Response",
  tagline: "Ventilator fault in ICU-04 · Granite detects · Agentic AI sources backup",
  icon: "🔧",
  accent: "#f59e0b",
  duration: 56,
  actions: [
    { id: "detect", label: "Isolate Faulty Unit", detail: "VENT-A4 flagged and locked out", icon: "🚫", startAt: 3, doneAt: 4 },
    { id: "bridge", label: "Bridge to Manual Ventilation", detail: "Bag-valve support started", icon: "🫁", startAt: 3, doneAt: 4 },
    { id: "find", label: "Locate Backup Ventilator", detail: "Biomed store unit VENT-B7", icon: "🔍", startAt: 4, doneAt: 5 },
    { id: "biomed", label: "Notify Biomedical Team", detail: "Engineer dispatched · ETA 3 min", icon: "📟", startAt: 4, doneAt: 5 },
    { id: "swap", label: "Replace Equipment", detail: "VENT-B7 installed and calibrated", icon: "🔧", startAt: 5, doneAt: 6 },
    { id: "verify", label: "Verify & Log", detail: "Fault logged · maintenance scheduled", icon: "✅", startAt: 6, doneAt: 7 },
  ],
  steps: [
    {
      id: 0, at: 0, title: "Normal ICU Operation", subtitle: "All equipment reporting healthy",
      detail: "ICU running normally. All 12 ventilators reporting healthy telemetry.",
      focus: "overview",
      banner: { text: "CAMPUS STATUS  /  ALL EQUIPMENT HEALTHY", tone: "ok" },
      log: { source: "System", text: "3,410 tracked assets. 12/12 ventilators nominal. No maintenance alerts.", level: "ok" },
      resources: res(14, 9, 42, 78, 6, 4, 38, 7),
      cues: ["normal"],
    },
    {
      id: 1, at: 6, title: "Ventilator Failure", subtitle: "VENT-A4 pressure fault in ICU Bed 04",
      detail: "Ventilator VENT-A4 reports a sustained pressure delivery fault while supporting a critical patient.",
      focus: "icu",
      banner: { text: "EQUIPMENT ALARM  /  VENTILATOR VENT-A4 FAULT", tone: "crit" },
      log: { source: "System", text: "VENT-A4 fault: peak pressure deviation 34%, FiO₂ delivery unstable. Patient ICU-04 affected.", level: "crit" },
      statuses: { icu: "critical", storage: "busy" },
      resources: res(14, 8, 42, 78, 6, 4, 38, 7),
      cues: ["alert", "equipment_fault"],
    },
    {
      id: 2, at: 13, title: "Patient Risk Increases", subtitle: "SpO₂ falling · respiratory support compromised",
      detail: "The patient's oxygen saturation drops as effective ventilation degrades. Bedside alarms escalate.",
      focus: "icu",
      banner: { text: "PATIENT RISK RISING  /  SpO₂ 86% AND FALLING", tone: "crit" },
      log: { source: "Clinician", text: "ICU-04 SpO₂ 86% and falling. Manual bag-valve ventilation started as an immediate bridge.", level: "crit" },
      statuses: { icu: "critical", oxygen: "busy", storage: "busy" },
      resources: res(14, 8, 46, 84, 6, 4, 42, 9),
      cues: ["patient_risk", "staff_response"],
    },
    {
      id: 3, at: 20, title: "IBM Granite Detects the Problem", subtitle: "Root cause identified from device telemetry",
      detail: "Granite correlates device telemetry with patient vitals and identifies a failing pressure valve as the root cause.",
      focus: "command",
      banner: { text: "IBM GRANITE  /  ROOT CAUSE IDENTIFIED", tone: "crit" },
      log: { source: "Granite", text: "ROOT CAUSE: VENT-A4 expiratory valve degradation. Predicted total failure in 6 min. Confidence 96.2%.", level: "crit" },
      statuses: { icu: "critical", command: "busy" },
      resources: res(14, 8, 46, 84, 6, 4, 42, 9),
      cues: ["granite_alert"],
      reasoning: {
        headline: "Expiratory Valve Failure 96%",
        confidence: 96.2,
        factors: [
          { label: "Peak pressure", value: "+34% deviation", flag: true },
          { label: "Tidal volume", value: "−22% delivered", flag: true },
          { label: "Valve cycle count", value: "812k (past service)", flag: true },
          { label: "Patient SpO₂", value: "86% falling", flag: true },
          { label: "Time to failure", value: "≈ 6 minutes", flag: true },
        ],
      },
    },
    {
      id: 4, at: 28, title: "Agentic AI Finds Backup Ventilator", subtitle: "Nearest compatible unit located and reserved",
      detail: "Agentic AI searches the tracked asset inventory, reserves the nearest compatible unit and dispatches biomed.",
      focus: "storage",
      banner: { text: "AGENTIC AI  /  BACKUP VENT-B7 RESERVED", tone: "warn" },
      log: { source: "Agentic", text: "VENT-B7 located in Biomed bay 3 — compatible, calibrated, 42m away. Reserved and dispatched.", level: "warn" },
      statuses: { storage: "critical", icu: "critical", command: "busy" },
      resources: res(14, 8, 46, 84, 6, 4, 42, 9),
      cues: ["agentic_plan", "deploy_equipment"],
    },
    {
      id: 5, at: 36, title: "Biomedical Team Notified", subtitle: "Engineer en route with replacement unit",
      detail: "The biomedical engineering team is paged and moves the replacement ventilator to ICU Bed 04.",
      focus: "storage",
      banner: { text: "EXECUTING  /  BIOMED DISPATCHED · ETA 3 MIN", tone: "info" },
      log: { source: "Biomed", text: "Engineer acknowledged. VENT-B7 in transit to ICU-04. Faulty unit VENT-A4 locked out of service.", level: "info" },
      statuses: { storage: "busy", icu: "critical" },
      resources: res(14, 8, 48, 88, 6, 4, 40, 8),
      cues: ["deploy_equipment", "biomed_moving"],
    },
    {
      id: 6, at: 44, title: "Equipment Replaced", subtitle: "VENT-B7 installed and calibrated",
      detail: "The replacement ventilator is installed, calibrated and verified. Ventilation is restored to protocol settings.",
      focus: "icu",
      banner: { text: "EXECUTING  /  VENTILATOR REPLACED & VERIFIED", tone: "info" },
      log: { source: "Biomed", text: "VENT-B7 installed. Self-test passed. Lung-protective settings restored. Patient re-established on machine.", level: "info" },
      statuses: { icu: "busy", storage: "normal" },
      resources: res(14, 9, 48, 88, 6, 4, 38, 8),
      cues: ["equipment_replaced", "treatment_active"],
    },
    {
      id: 7, at: 50, title: "Patient Stable", subtitle: "Vitals recovered · fault logged for maintenance",
      detail: "Oxygen saturation returns to 97%. The fault is logged and preventive maintenance is scheduled fleet-wide.",
      focus: "overview",
      banner: { text: "✓ PATIENT STABLE  /  EQUIPMENT FAULT RESOLVED", tone: "ok" },
      log: { source: "Granite", text: "Patient stable at SpO₂ 97%. Total interruption 4 min 12 s. Fleet-wide valve inspection scheduled.", level: "ok" },
      statuses: {
        icu: "normal", storage: "normal", command: "normal", oxygen: "normal", emergency: "normal",
      },
      resources: res(14, 9, 42, 78, 6, 4, 36, 7),
      cues: ["stabilized"],
    },
  ],
  outcome: {
    headline: "Equipment Fault Resolved",
    lines: [
      "Failing ventilator detected before total failure",
      "Manual ventilation bridged the gap in 40 seconds",
      "Backup unit located and installed in 4 min 12 s",
      "Biomedical team auto-dispatched by AI",
      "Fleet-wide preventive inspection scheduled",
    ],
    before: [
      { label: "Patient SpO₂", value: "86%" },
      { label: "Ventilator", value: "FAULT" },
      { label: "Risk Level", value: "CRITICAL" },
      { label: "Detection", value: "Manual" },
      { label: "Vents Online", value: "11/12" },
    ],
    after: [
      { label: "Patient SpO₂", value: "97%" },
      { label: "Ventilator", value: "OPERATIONAL" },
      { label: "Risk Level", value: "STABLE" },
      { label: "Detection", value: "AI predictive" },
      { label: "Vents Online", value: "12/12" },
    ],
  },
};

export const OPS_SCENARIOS: Record<OpsScenarioId, OpsScenario> = {
  resource: RESOURCE_ALLOCATION,
  masscasualty: MASS_CASUALTY,
  equipment: EQUIPMENT_FAILURE,
};

export const OPS_SCENARIO_LIST = [RESOURCE_ALLOCATION, MASS_CASUALTY, EQUIPMENT_FAILURE];
