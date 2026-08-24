import { Status } from "./hospital";

export type RiskLevel = "critical" | "high" | "observation" | "stable";

export const RISK_META: Record<RiskLevel, { label: string; color: string; dot: string }> = {
  critical:    { label: "CRITICAL",    color: "#ff4d5e", dot: "🔴" },
  high:        { label: "HIGH RISK",   color: "#ff8a3d", dot: "🟠" },
  observation: { label: "OBSERVATION", color: "#f4c849", dot: "🟡" },
  stable:      { label: "STABLE",      color: "#20d991", dot: "🟢" },
};

export interface VitalProfile {
  hr: number;        // heart rate bpm
  sbp: number;       // systolic
  dbp: number;       // diastolic
  spo2: number;      // %
  rr: number;        // respiratory rate
  temp: number;      // celsius
  o2: number;        // oxygen flow L/min
  vent: string;      // ventilator status
  news: number;      // NEWS2 score
}

export interface RiskPrediction {
  name: string;
  value: number;      // 0-100 risk %
  confidence: number; // 0-100
}

export interface Recommendation {
  priority: number;
  action: string;
  detail: string;
  /** step id at which this action is marked completed */
  doneAt: number;
}

export interface MedicationItem {
  time: string;
  drug: string;
  dose: string;
  route: string;
}

export interface JourneyStep {
  id: number;
  at: number;               // seconds
  key: string;
  title: string;
  subtitle: string;
  focus: string;            // department id or "overview"
  location: string;
  bullets: string[];
  risk: RiskLevel;
  banner: string;
  log: {
    source: "System" | "Granite" | "Agentic" | "Clinician";
    text: string;
    level: "info" | "warn" | "crit" | "ok";
  };
  vitals: VitalProfile;
  deptStatuses?: Record<string, Status>;
  /** clinical animation cues fired in the 3D scene */
  cues?: string[];
}

export const PATIENT = {
  id: "PT-2026-04871",
  name: "Trauma Patient 01",
  age: 47,
  sex: "M",
  bloodGroup: "O-",
  mrn: "MRN-889-2041",
  admitted: "Multi-vehicle RTA · Blunt thoracic trauma",
  allergies: "Penicillin",
};

export const MEDICATION_SCHEDULE: MedicationItem[] = [
  { time: "T+00", drug: "Normal Saline",   dose: "500 mL",   route: "IV bolus" },
  { time: "T+05", drug: "Tranexamic Acid", dose: "1 g",      route: "IV" },
  { time: "T+12", drug: "Fentanyl",        dose: "50 mcg",   route: "IV" },
  { time: "T+20", drug: "Packed RBC",      dose: "2 units",  route: "Transfusion" },
  { time: "T+35", drug: "Noradrenaline",   dose: "0.1 mcg/kg", route: "Infusion" },
  { time: "T+50", drug: "Ceftriaxone",     dose: "2 g",      route: "IV" },
];

export const RECOMMENDATIONS: Recommendation[] = [
  { priority: 1, action: "Start Ventilator",           detail: "SIMV mode · FiO₂ 60% · PEEP 8",        doneAt: 8 },
  { priority: 2, action: "Increase Oxygen",            detail: "Raise flow 12 → 15 L/min",             doneAt: 8 },
  { priority: 3, action: "Allocate ICU Bed",           detail: "ICU-A Bed 07 · negative pressure",     doneAt: 4 },
  { priority: 4, action: "Request Blood Units",        detail: "2 units O-negative from Blood Bank",   doneAt: 8 },
  { priority: 5, action: "Call Cardiologist",          detail: "On-call Dr. Rao · ETA 6 min",          doneAt: 8 },
  { priority: 6, action: "Deploy Additional Nurses",   detail: "+2 ICU nurses · ratio 1:1",            doneAt: 8 },
  { priority: 7, action: "Order CT Scan",              detail: "Repeat thorax CT at T+40",             doneAt: 9 },
  { priority: 8, action: "Move Stable Patient",        detail: "Bed 12 → Ward B step-down",            doneAt: 9 },
  { priority: 9, action: "Prepare Emergency Surgery",  detail: "OT-3 on standby · thoracotomy kit",    doneAt: 9 },
  { priority: 10, action: "Transfer Patient",          detail: "ICU → Ward B on stabilization",        doneAt: 10 },
];

const risks = (
  cardiac: number, sepsis: number, resp: number, stroke: number,
  mortality: number, deterioration: number, confidence: number
): RiskPrediction[] => [
  { name: "Cardiac Arrest",     value: cardiac,       confidence },
  { name: "Sepsis",             value: sepsis,        confidence: confidence - 3 },
  { name: "Respiratory Failure",value: resp,          confidence: confidence - 1 },
  { name: "Stroke",             value: stroke,        confidence: confidence - 6 },
  { name: "Mortality (48h)",    value: mortality,     confidence: confidence - 2 },
  { name: "ICU Deterioration",  value: deterioration, confidence },
];

/** Granite risk predictions keyed by step id. */
export const RISK_BY_STEP: Record<number, RiskPrediction[]> = {
  1: risks(31, 12, 44, 9, 22, 38, 86),
  2: risks(38, 16, 51, 11, 27, 46, 89),
  3: risks(42, 19, 55, 13, 31, 52, 91),
  4: risks(47, 22, 61, 14, 35, 58, 92),
  5: risks(52, 26, 66, 16, 39, 63, 93),
  6: risks(68, 34, 79, 21, 48, 81, 94),
  7: risks(64, 32, 74, 19, 45, 76, 94),
  8: risks(41, 24, 48, 14, 29, 44, 93),
  9: risks(18, 11, 21, 7, 12, 17, 95),
  10: risks(6, 4, 7, 3, 4, 5, 96),
};

/** Expected recovery time forecast per step. */
export const RECOVERY_ETA: Record<number, string> = {
  1: "Unknown", 2: "Assessing", 3: "14 – 20 days", 4: "12 – 18 days",
  5: "12 – 16 days", 6: "18 – 26 days", 7: "16 – 22 days",
  8: "9 – 13 days", 9: "5 – 7 days", 10: "Discharged · 4 wk follow-up",
};

export const JOURNEY: JourneyStep[] = [
  {
    id: 1, at: 0, key: "arrival",
    title: "Ambulance Arrives",
    subtitle: "Emergency entrance · GPS tracked approach",
    focus: "security", location: "Main Gate → Ambulance Bay",
    risk: "critical",
    banner: "STEP 1 / 10  ·  AMBULANCE INBOUND",
    bullets: [
      "Ambulance AMB-04 entering emergency entrance",
      "GPS location streaming every 2 seconds",
      "Emergency trauma team paged and mobilizing",
      "Trauma patient unloaded onto stretcher",
      "Live ETA displayed to ER command",
    ],
    log: { source: "System", text: "AMB-04 inbound · ETA 00:42 · trauma bay 1 reserved · team paged.", level: "crit" },
    vitals: { hr: 128, sbp: 88, dbp: 54, spo2: 88, rr: 28, temp: 36.2, o2: 10, vent: "Bag-valve", news: 11 },
    deptStatuses: { emergency: "busy", security: "busy" },
    cues: ["ambulance_inbound"],
  },
  {
    id: 2, at: 9, key: "admission",
    title: "Emergency Admission",
    subtitle: "Registration · triage · digital twin creation",
    focus: "emergency", location: "Emergency Department · Triage",
    risk: "critical",
    banner: "STEP 2 / 10  ·  EMERGENCY ADMISSION",
    bullets: [
      `Patient registered · ID ${PATIENT.id}`,
      "Initial triage completed by trauma nurse",
      "Severity Level 1 (Resuscitation) assigned",
      "Baseline vital signs recorded",
      "AI generated a patient Digital Twin instance",
    ],
    log: { source: "System", text: `Patient ${PATIENT.id} registered · severity L1 · patient digital twin instantiated.`, level: "crit" },
    vitals: { hr: 132, sbp: 86, dbp: 52, spo2: 87, rr: 30, temp: 36.0, o2: 12, vent: "Bag-valve", news: 12 },
    deptStatuses: { emergency: "critical", reception: "busy" },
    cues: ["stretcher_to_er", "twin_created"],
  },
  {
    id: 3, at: 19, key: "diagnostics",
    title: "CT Scan & Diagnostics",
    subtitle: "Radiology imaging and laboratory investigation",
    focus: "radiology", location: "Radiology · CT Suite",
    risk: "critical",
    banner: "STEP 3 / 10  ·  DIAGNOSTIC IMAGING",
    bullets: [
      "Patient transferred to Radiology under monitoring",
      "Trauma CT thorax + abdomen performed",
      "Portable X-ray and FAST ultrasound completed",
      "Lab panel: CBC, ABG, coagulation, crossmatch",
      "Reports and DICOM images bound to Digital Twin",
    ],
    log: { source: "Clinician", text: "CT thorax: bilateral pulmonary contusion, small haemothorax. Hb 8.2 g/dL.", level: "warn" },
    vitals: { hr: 126, sbp: 90, dbp: 56, spo2: 89, rr: 27, temp: 36.4, o2: 12, vent: "Bag-valve", news: 11 },
    deptStatuses: { emergency: "critical", radiology: "busy", lab: "busy", blood: "busy" },
    cues: ["transfer_radiology", "imaging_active"],
  },
  {
    id: 4, at: 29, key: "icuBed",
    title: "ICU Bed Assignment",
    subtitle: "Granite predicts ICU need · bed auto-allocated",
    focus: "icu", location: "ICU Block A · Bed 07",
    risk: "critical",
    banner: "STEP 4 / 10  ·  ICU BED ALLOCATED",
    bullets: [
      "IBM Granite predicts ICU requirement (92% confidence)",
      "AI checked live bed availability across ICU-A / ICU-B",
      "Best-fit bed auto-allocated: ICU-A Bed 07",
      "Patient transferred to intensive care",
      "ICU occupancy updated in real time",
    ],
    log: { source: "Granite", text: "ICU admission required · optimal placement ICU-A Bed 07 (isolation capable, vent ready).", level: "crit" },
    vitals: { hr: 130, sbp: 88, dbp: 54, spo2: 88, rr: 29, temp: 36.3, o2: 14, vent: "Transport vent", news: 12 },
    deptStatuses: { icu: "critical", emergency: "busy", radiology: "normal" },
    cues: ["transfer_icu", "bed_allocated"],
  },
  {
    id: 5, at: 39, key: "monitoring",
    title: "Live Patient Monitoring",
    subtitle: "Continuous multi-parameter bedside telemetry",
    focus: "icu", location: "ICU Block A · Bed 07",
    risk: "high",
    banner: "STEP 5 / 10  ·  LIVE TELEMETRY STREAMING",
    bullets: [
      "ECG, SpO₂, NIBP, capnography and temperature online",
      "Ventilator synchronized in SIMV mode",
      "NEWS2 score auto-calculated every minute",
      "Medication schedule bound to infusion pumps",
      "All values streaming to the Digital Twin",
    ],
    log: { source: "System", text: "Bed 07 telemetry online · 9 parameters streaming at 1 Hz · NEWS2 auto-scoring active.", level: "info" },
    vitals: { hr: 124, sbp: 92, dbp: 58, spo2: 90, rr: 26, temp: 36.6, o2: 14, vent: "SIMV · FiO₂ 55%", news: 10 },
    deptStatuses: { icu: "critical" },
    cues: ["monitoring_active"],
  },
  {
    id: 6, at: 49, key: "granite",
    title: "IBM Granite Risk Prediction",
    subtitle: "Continuous deterioration forecasting",
    focus: "command", location: "AI Command Center",
    risk: "critical",
    banner: "STEP 6 / 10  ·  GRANITE DETERIORATION ALERT",
    bullets: [
      "Granite detects rising respiratory failure trajectory",
      "Cardiac arrest risk elevated to 68%",
      "ICU deterioration probability 81% within 90 min",
      "Mortality risk (48h) forecast at 48%",
      "Expected recovery time extended to 18–26 days",
    ],
    log: { source: "Granite", text: "DETERIORATION PREDICTED: respiratory failure 79%, cardiac arrest 68%, window 90 min. Confidence 94%.", level: "crit" },
    vitals: { hr: 134, sbp: 84, dbp: 50, spo2: 86, rr: 31, temp: 37.4, o2: 15, vent: "SIMV · FiO₂ 65%", news: 13 },
    deptStatuses: { icu: "critical", command: "busy" },
    cues: ["granite_alert"],
  },
  {
    id: 7, at: 59, key: "agentic",
    title: "Agentic AI Recommendation",
    subtitle: "Autonomous care plan in priority order",
    focus: "command", location: "AI Command Center · Agent Bay",
    risk: "critical",
    banner: "STEP 7 / 10  ·  AGENTIC CARE PLAN ISSUED",
    bullets: [
      "10 prioritized clinical actions generated",
      "Ventilator escalation ranked priority 1",
      "Blood units and cardiology consult requested",
      "Nurse staffing increased to 1:1 ratio",
      "OT-3 placed on standby for emergency surgery",
    ],
    log: { source: "Agentic", text: "CARE PLAN: ventilate → O₂ 15 L → 2 units O- → cardiology → 1:1 nursing → OT standby.", level: "warn" },
    vitals: { hr: 131, sbp: 86, dbp: 52, spo2: 87, rr: 30, temp: 37.3, o2: 15, vent: "SIMV · FiO₂ 65%", news: 12 },
    deptStatuses: { icu: "critical", command: "busy", ot: "busy", blood: "busy", storage: "busy" },
    cues: ["agentic_plan"],
  },
  {
    id: 8, at: 69, key: "treatment",
    title: "Treatment Applied",
    subtitle: "Clinician approved · interventions executing",
    focus: "icu", location: "ICU Block A · Bed 07",
    risk: "high",
    banner: "STEP 8 / 10  ·  TREATMENT IN PROGRESS",
    bullets: [
      "Intensivist reviewed and approved the AI plan",
      "Ventilator connected · lung-protective settings",
      "IV fluids and vasopressor infusion running",
      "2 units O-negative transfused successfully",
      "Oxygen increased · vitals responding positively",
    ],
    log: { source: "Clinician", text: "Plan approved. Ventilation established, transfusion complete, MAP recovering to 72 mmHg.", level: "info" },
    vitals: { hr: 118, sbp: 98, dbp: 62, spo2: 92, rr: 23, temp: 37.1, o2: 12, vent: "PSV · FiO₂ 45%", news: 8 },
    deptStatuses: { icu: "busy", blood: "normal", ot: "normal", command: "normal" },
    cues: ["treatment_active", "doctor_visit", "ventilator_on"],
  },
  {
    id: 9, at: 81, key: "recovery",
    title: "Recovery",
    subtitle: "Condition stabilizing · weaning support",
    focus: "icu", location: "ICU Block A → Ward B step-down",
    risk: "observation",
    banner: "STEP 9 / 10  ·  PATIENT RECOVERING",
    bullets: [
      "Ventilator weaning successful · spontaneous breathing",
      "Vasopressors discontinued · haemodynamically stable",
      "NEWS2 improved from 13 → 4",
      "Risk level downgraded to Observation",
      "Expected discharge within 5–7 days",
    ],
    log: { source: "Granite", text: "Recovery trajectory confirmed · deterioration risk 17% · step-down eligible in 12 h.", level: "ok" },
    vitals: { hr: 96, sbp: 112, dbp: 72, spo2: 96, rr: 18, temp: 36.8, o2: 4, vent: "Weaned · nasal", news: 4 },
    deptStatuses: { icu: "busy", wardB: "busy" },
    cues: ["recovery_active"],
  },
  {
    id: 10, at: 93, key: "discharge",
    title: "Discharge",
    subtitle: "Journey archived · resources reallocated",
    focus: "reception", location: "Ward B → Main Reception",
    risk: "stable",
    banner: "STEP 10 / 10  ·  PATIENT DISCHARGED",
    bullets: [
      "Patient discharged successfully in stable condition",
      "ICU-A Bed 07 released and terminally cleaned",
      "Hospital occupancy decreased automatically",
      "Nursing, ventilator and oxygen resources reallocated",
      "Digital Twin archived the full patient journey",
    ],
    log: { source: "System", text: "Discharge complete · bed released · resources reallocated · journey archived to twin registry.", level: "ok" },
    vitals: { hr: 78, sbp: 122, dbp: 78, spo2: 98, rr: 15, temp: 36.7, o2: 0, vent: "Off", news: 0 },
    deptStatuses: {
      icu: "normal", emergency: "normal", wardB: "normal", radiology: "normal",
      lab: "normal", blood: "normal", command: "normal", reception: "normal",
      security: "normal", ot: "normal", storage: "normal",
    },
    cues: ["discharge"],
  },
];

export const JOURNEY_DURATION = 102;

/** Waypoints used by the 3D patient marker for each step. */
export const JOURNEY_WAYPOINTS: Record<number, [number, number, number]> = {
  1: [0, 0, 34],
  2: [-19, 0, 17],
  3: [0, 0, -26],
  4: [-20, 0, 3],
  5: [-20, 0, 1],
  6: [-20, 0, 1],
  7: [-20, 0, 1],
  8: [-20, 0, 1],
  9: [12, 0, -8],
  10: [0, 0, 22],
};
