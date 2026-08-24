import { departments, Status } from "./hospital";

export type Phase =
  | "idle" | "normal" | "accident" | "emergency" | "patients" | "icuCritical"
  | "aiPredict" | "rag" | "aiRecommend" | "deploy" | "recovery" | "stabilized";

export type AiSource = "Granite" | "RAG" | "Agentic" | "System";
export interface ScenarioStep {
  phase: Phase;
  at: number;
  title: string;
  desc: string;
  statuses?: Record<string, Status>;
  focus?: string;
  ai?: { source: AiSource; text: string; level?: "info" | "warn" | "ok" | "crit" };
  banner?: { text: string; tone: "info" | "warn" | "crit" | "ok" };
}

const allGreen = Object.fromEntries(departments.map((d) => [d.id, "normal"])) as Record<string, Status>;

export const SCENARIO: ScenarioStep[] = [
  {
    phase: "normal", at: 0, title: "Hospital Normal", focus: "overview",
    desc: "The entire campus is green while the drone camera establishes the live digital twin.",
    statuses: allGreen,
    ai: { source: "System", text: "Digital twin synchronized. 768 IoT sensors and 2,418 streams are nominal.", level: "ok" },
    banner: { text: "CAMPUS STATUS  /  ALL SYSTEMS NORMAL", tone: "ok" },
  },
  {
    phase: "accident", at: 6, title: "Road Accident", focus: "security",
    desc: "A multi-vehicle collision is detected. Police and emergency response are dispatched.",
    ai: { source: "System", text: "External event: multi-vehicle collision, 3.2 km south. Eight casualties estimated.", level: "crit" },
    banner: { text: "PRIORITY ALERT  /  ROAD ACCIDENT DETECTED", tone: "crit" },
  },
  {
    phase: "emergency", at: 11, title: "Emergency Surge", focus: "emergency",
    desc: "Ambulances arrive. Emergency moves to yellow and surge triage opens.",
    statuses: { emergency: "busy", reception: "busy" },
    ai: { source: "System", text: "Three ambulances inbound. Trauma bays 1-4 reserved and rapid triage activated.", level: "warn" },
    banner: { text: "EMERGENCY DEPARTMENT  /  BUSY", tone: "warn" },
  },
  {
    phase: "patients", at: 17, title: "Patients Arrive", focus: "emergency",
    desc: "Stretchers enter resuscitation while doctors and nurses move to trauma positions.",
    statuses: { emergency: "critical", blood: "busy", radiology: "busy" },
    ai: { source: "System", text: "Eight patients received. Three critical, two urgent and three stable. CT priority enabled.", level: "crit" },
    banner: { text: "MASS CASUALTY INTAKE  /  8 PATIENTS", tone: "crit" },
  },
  {
    phase: "icuCritical", at: 23, title: "ICU Capacity Critical", focus: "icu",
    desc: "ICU beds fill, ventilator demand rises and warning alarms are triggered.",
    statuses: { icu: "critical", oxygen: "busy", ot: "busy" },
    ai: { source: "System", text: "ICU-A occupancy 96%. Two trauma admissions pending. Ventilator reserve below target.", level: "crit" },
    banner: { text: "ICU-A  /  96% OCCUPIED  /  CRITICAL", tone: "crit" },
  },
  {
    phase: "aiPredict", at: 29, title: "IBM Granite Prediction", focus: "command",
    desc: "Granite predicts shortages in beds, doctors and ventilators before capacity fails.",
    ai: { source: "Granite", text: "Forecast: shortage of 4 ICU beds, 3 clinicians and 2 ventilators in 18 minutes. Confidence 94.2%.", level: "crit" },
    banner: { text: "IBM GRANITE  /  CAPACITY BREACH PREDICTED", tone: "crit" },
  },
  {
    phase: "rag", at: 35, title: "RAG Retrieves Emergency SOP", focus: "command",
    desc: "The grounded knowledge assistant retrieves the validated mass-casualty and overflow protocol.",
    ai: { source: "RAG", text: "Retrieved SOP-ER-042: activate ICU-B, cohort stable patients and increase medical oxygen reserve.", level: "info" },
    banner: { text: "RAG KNOWLEDGE ASSISTANT  /  SOP-ER-042 VERIFIED", tone: "info" },
  },
  {
    phase: "aiRecommend", at: 41, title: "Agentic AI Decision", focus: "command",
    desc: "The agent creates a constrained deployment plan from live capacity and the retrieved SOP.",
    ai: { source: "Agentic", text: "Plan approved: open ICU-B; deploy 6 doctors and 10 nurses; transfer 5 stable patients; raise O2 flow 18%.", level: "warn" },
    banner: { text: "AGENTIC AI  /  RESOURCE PLAN APPROVED", tone: "warn" },
  },
  {
    phase: "deploy", at: 47, title: "Autonomous Deployment", focus: "icuB",
    desc: "ICU-B activates while staff, ambulances, oxygen and equipment are automatically reallocated.",
    statuses: { icuB: "busy", wardB: "busy", storage: "busy", oxygen: "busy" },
    ai: { source: "Agentic", text: "Executing: ICU-B online, 12 beds available, clinical teams routed and ambulance allocation updated.", level: "info" },
    banner: { text: "EXECUTING PLAN  /  ICU-B ONLINE", tone: "info" },
  },
  {
    phase: "recovery", at: 54, title: "Digital Twin Rebalanced", focus: "overview",
    desc: "Occupancy and waiting time fall as resources move through the live digital twin.",
    statuses: { icu: "busy", emergency: "busy", blood: "normal", radiology: "normal", ot: "normal", storage: "normal", oxygen: "normal" },
    ai: { source: "Granite", text: "Updated forecast: ICU occupancy 78% and falling. ER wait reduced by 11 minutes. No unmet demand.", level: "ok" },
    banner: { text: "RECOVERY TREND  /  LOAD BALANCED", tone: "ok" },
  },
  {
    phase: "stabilized", at: 61, title: "Hospital Stabilized", focus: "overview",
    desc: "The entire campus returns to green with safe patients and optimized resources.",
    statuses: allGreen,
    ai: { source: "System", text: "Hospital stabilized. AI recommendations successfully applied. Real-time digital twin active.", level: "ok" },
    banner: { text: "HOSPITAL STABILIZED  /  DIGITAL TWIN ACTIVE", tone: "ok" },
  },
];

export const SCENARIO_DURATION = 66;