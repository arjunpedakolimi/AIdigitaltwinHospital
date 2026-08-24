import { RiskLevel, RiskPrediction, VitalProfile } from "./patientJourney";

export type IcuAcuity = "stable" | "observation" | "high" | "critical" | "ready";

export interface IcuDemoStage {
  id: number;
  at: number;
  title: string;
  subtitle: string;
  detail: string;
  risk: RiskLevel;
  vitals: VitalProfile;
  activity: string;
  cues: string[];
  log: {
    source: "System" | "Granite" | "RAG" | "Agentic" | "Clinician";
    text: string;
    level: "info" | "warn" | "crit" | "ok";
  };
}

export const ICU04_POSITION: [number, number, number] = [1.2, 0, -3.2];

export const ICU04_PATIENT = {
  name: "Elena Garcia",
  id: "PT-ICU-2604",
  age: 58,
  sex: "F",
  diagnosis: "Severe community-acquired pneumonia with acute hypoxemic respiratory failure",
  bed: "ICU-04",
  doctor: "Dr. Maya Chen · Intensivist",
  nurse: "Aisha Patel, RN · 1:1 assigned",
  medication: "Piperacillin/Tazobactam · 4.5 g IV q6h",
  allergies: "NKDA",
  bloodGroup: "A+",
  admitted: "2026-06-14 08:42",
  ct: "CT chest: bilateral multilobar consolidation. No pulmonary embolism. Small right pleural effusion.",
  labs: "WBC 18.4 ×10⁹/L · Lactate 3.1 mmol/L · CRP 248 mg/L · ABG pO₂ 62 mmHg.",
  history: "Type 2 diabetes · hypertension · no prior ICU admission.",
};

const risk = (cardiac: number, respiratory: number, sepsis: number, recovery: number, confidence: number): RiskPrediction[] => [
  { name: "Cardiac Arrest Risk", value: cardiac, confidence },
  { name: "Respiratory Failure", value: respiratory, confidence: confidence - 1 },
  { name: "Sepsis Risk", value: sepsis, confidence: confidence - 3 },
  { name: "ICU Deterioration", value: Math.max(cardiac, respiratory, sepsis), confidence },
  { name: "Recovery Probability", value: recovery, confidence: confidence - 2 },
];

export const ICU_RISKS: Record<number, RiskPrediction[]> = {
  1: risk(8, 14, 12, 91, 88),
  2: risk(8, 14, 12, 91, 88),
  3: risk(12, 22, 18, 86, 90),
  4: risk(92, 87, 74, 42, 95),
  5: risk(92, 87, 74, 42, 95),
  6: risk(92, 87, 74, 42, 95),
  7: risk(88, 82, 70, 48, 95),
  8: risk(48, 51, 37, 69, 94),
  9: risk(13, 18, 12, 89, 96),
  10: risk(3, 4, 3, 97, 97),
};

export const ICU_AGENT_ACTIONS = [
  ["Increase Oxygen", "FiO₂ 40% → 70% · high-flow bridge", 8],
  ["Prepare Ventilator", "Lung protective assist-control parameters", 8],
  ["Call Cardiologist", "Arrhythmia review · ETA 4 min", 8],
  ["Deploy Additional Nurse", "Activate ICU 1:1 escalation roster", 8],
  ["Allocate Blood Units", "Type & screen · 2 units crossmatched", 8],
  ["Schedule Emergency CT", "Repeat CT chest once stabilized", 9],
  ["Prepare ICU Block B", "One surge bed available as contingency", 8],
  ["Notify Emergency Team", "Rapid response team on standby", 7],
] as const;

export const ICU_RAG_SOURCES = [
  ["Hospital Emergency SOP", "SOP-ICU-17 · Acute hypoxemic deterioration", "Matched"],
  ["ICU Protocol", "Ventilation escalation and prone-position pathway", "Matched"],
  ["WHO Clinical Guidelines", "Sepsis and oxygen therapy guidance", "Grounded"],
  ["Internal Treatment Workflow", "Rapid response · blood bank · cardiology", "Matched"],
  ["Medical References", "ARDSnet ventilation bundle · 2025 review", "Cited"],
] as const;

export const ICU_DEMO_STAGES: IcuDemoStage[] = [
  {
    id: 1, at: 0,
    title: "Normal ICU Operation", subtitle: "12-bed critical care unit · continuous activity",
    detail: "Routine rounds continue. Eleven beds stream stable telemetry while one emergency-ready bed remains available.",
    risk: "stable", activity: "Routine monitoring · rounds in progress", cues: ["rounds", "normal"],
    log: { source: "System", text: "ICU-A nominal. 11 monitored beds active, ICU-12 emergency bed ready.", level: "ok" },
    vitals: { hr: 84, sbp: 122, dbp: 76, spo2: 98, rr: 16, temp: 36.8, o2: 2, vent: "Room air", news: 1 },
  },
  {
    id: 2, at: 0,
    title: "ICU-04 Selected", subtitle: "Digital Twin patient inspection opened",
    detail: "Presenter selected Bed ICU-04. Ceiling glass transitions transparent and the clinical twin becomes the active context.",
    risk: "stable", activity: "Patient twin linked · all records synchronized", cues: ["selected", "rounds"],
    log: { source: "System", text: "ICU-04 selected. Patient twin, clinical record and device telemetry synchronized.", level: "info" },
    vitals: { hr: 88, sbp: 118, dbp: 74, spo2: 97, rr: 17, temp: 37.0, o2: 3, vent: "High-flow nasal", news: 3 },
  },
  {
    id: 3, at: 8,
    title: "Live Vitals", subtitle: "Continuous bedside telemetry · ECG and device feeds",
    detail: "ICU-04 streams heart rate, ECG, blood pressure, SpO₂, respiratory rate, temperature, oxygen flow, ventilator and medication timer.",
    risk: "observation", activity: "9 clinical data streams · 1 Hz telemetry", cues: ["monitoring", "rounds"],
    log: { source: "System", text: "ICU-04 telemetry active: ECG, ABP, SpO₂, ventilator, infusion and NEWS2 feeds at 1 Hz.", level: "info" },
    vitals: { hr: 96, sbp: 110, dbp: 68, spo2: 94, rr: 21, temp: 37.3, o2: 6, vent: "High-flow 50 L", news: 5 },
  },
  {
    id: 4, at: 17,
    title: "Emergency Event", subtitle: "Rapid respiratory and hemodynamic deterioration",
    detail: "ICU-04 moves Green → Yellow → Orange → Red as alarms escalate. Nearby nurses are automatically notified.",
    risk: "critical", activity: "Alarm escalation · rapid response triggered", cues: ["alarm", "nurse_react", "deterioration"],
    log: { source: "System", text: "ICU-04 alert: SpO₂ falling, MAP declining, irregular respiration. Rapid response requested.", level: "crit" },
    vitals: { hr: 138, sbp: 82, dbp: 48, spo2: 86, rr: 32, temp: 38.7, o2: 15, vent: "High-flow max", news: 13 },
  },
  {
    id: 5, at: 28,
    title: "IBM Granite AI", subtitle: "Deterioration forecast and clinical reasoning",
    detail: "Granite analyzes patient history, current telemetry, CT findings and laboratory results to predict acute risk.",
    risk: "critical", activity: "Granite inference · confidence 95%", cues: ["granite", "alarm"],
    log: { source: "Granite", text: "High confidence deterioration: cardiac arrest 92%, respiratory failure 87%, sepsis 74%. Window: 12 min.", level: "crit" },
    vitals: { hr: 142, sbp: 78, dbp: 46, spo2: 84, rr: 34, temp: 38.9, o2: 15, vent: "High-flow max", news: 14 },
  },
  {
    id: 6, at: 39,
    title: "RAG Clinical Knowledge", subtitle: "Grounded evidence retrieval from hospital knowledge base",
    detail: "The RAG assistant retrieves ICU protocol, hospital SOP, WHO guidance and internal workflow evidence used by the plan.",
    risk: "critical", activity: "5 evidence sources grounded · SOP-ICU-17", cues: ["rag", "alarm"],
    log: { source: "RAG", text: "Retrieved SOP-ICU-17 and ARDS escalation pathway. Evidence aligns with immediate ventilatory support.", level: "info" },
    vitals: { hr: 140, sbp: 80, dbp: 47, spo2: 85, rr: 33, temp: 38.8, o2: 15, vent: "High-flow max", news: 14 },
  },
  {
    id: 7, at: 49,
    title: "Agentic AI Decision", subtitle: "Priority action plan validated against clinical constraints",
    detail: "Agentic AI sequences oxygen escalation, ventilator preparation, additional nurse, blood, cardiology and ICU-B contingency.",
    risk: "critical", activity: "8 ordered actions · human approval requested", cues: ["agentic", "nurse_react"],
    log: { source: "Agentic", text: "Priority plan created: O₂, ventilator, cardiology, extra nurse, blood, CT, ICU-B, ER notification.", level: "warn" },
    vitals: { hr: 136, sbp: 84, dbp: 50, spo2: 87, rr: 31, temp: 38.6, o2: 15, vent: "Pre-oxygenating", news: 13 },
  },
  {
    id: 8, at: 60,
    title: "Treatment", subtitle: "Clinicians execute approved AI recommendations",
    detail: "Doctor arrives. Nurse administers medication. Ventilator, IV medication, transfusion and oxygen interventions update in real time.",
    risk: "high", activity: "Ventilator on · transfusion active · 1:1 nursing", cues: ["treatment", "doctor", "ventilator", "transfusion"],
    log: { source: "Clinician", text: "Recommendations approved. Ventilation established, antibiotics administered, blood product and vasopressor infusion active.", level: "info" },
    vitals: { hr: 112, sbp: 100, dbp: 62, spo2: 93, rr: 23, temp: 38.1, o2: 10, vent: "AC/VC · FiO₂ 60%", news: 8 },
  },
  {
    id: 9, at: 73,
    title: "Recovery", subtitle: "Stable trajectory confirmed · alarms resolve",
    detail: "Heart rate normalizes, blood pressure improves, SpO₂ exceeds 97% and the monitored risk transitions red → orange → yellow → green.",
    risk: "observation", activity: "Recovery trend · ventilator weaning", cues: ["recovery", "rounds"],
    log: { source: "Granite", text: "Response to treatment confirmed. Deterioration probability now 18%. Observation trajectory stable.", level: "ok" },
    vitals: { hr: 90, sbp: 116, dbp: 74, spo2: 98, rr: 17, temp: 37.3, o2: 4, vent: "PSV weaning", news: 3 },
  },
  {
    id: 10, at: 86,
    title: "Discharge", subtitle: "Bed released · twin archived · resources optimized",
    detail: "Doctor approves discharge from ICU. Patient transfers out, Bed ICU-04 becomes available and resources are reallocated automatically.",
    risk: "stable", activity: "ICU-04 available · synchronization complete", cues: ["discharge", "rounds"],
    log: { source: "System", text: "ICU-04 discharged. Bed available. Clinical resources optimized and patient twin archived.", level: "ok" },
    vitals: { hr: 76, sbp: 124, dbp: 79, spo2: 99, rr: 14, temp: 36.8, o2: 0, vent: "Off", news: 0 },
  },
];

export const ICU_DEMO_DURATION = 99;

// ---- Selectable patient roster ----------------------------------------
export type OperableVerdict = "recommended" | "conditional" | "not-advised";

export interface IcuPatient {
  bed: string;
  name: string;
  id: string;
  age: number;
  sex: string;
  bloodGroup: string;
  diagnosis: string;
  doctor: string;
  nurse: string;
  medication: string;
  allergies: string;
  admitted: string;
  ct: string;
  labs: string;
  history: string;
  hero: string;             // photoreal bed image
  baselineAcuity: IcuAcuity;
  // outcome analytics (percentages)
  survival: number;         // probability of survival %
  mortality: number;        // probability of death %
  operability: {
    verdict: OperableVerdict;
    successRate: number;     // predicted surgical success %
    riskScore: number;       // peri-operative risk %
    procedure: string;
    reasoning: string;
    factors: { label: string; value: string; good: boolean }[];
  };
}

export const ICU_PATIENTS: IcuPatient[] = [
  {
    bed: "ICU-02", name: "Marcus Reid", id: "PT-ICU-2602", age: 41, sex: "M", bloodGroup: "O+",
    diagnosis: "Polytrauma · splenic laceration grade III · stable hemodynamics",
    doctor: "Dr. Omar Sayed · Trauma Surgeon", nurse: "Lena Fischer, RN · 1:2",
    medication: "Tranexamic acid · Cefazolin 2 g IV", allergies: "NKDA", admitted: "2026-06-14 06:10",
    ct: "CT abdomen: grade III splenic laceration, contained hematoma, no active extravasation.",
    labs: "Hb 11.2 g/dL · Lactate 1.8 mmol/L · INR 1.1 · Platelets 210.",
    history: "Fit · marathon runner · no comorbidities.",
    hero: "/images/icu-bed-hero.jpg", baselineAcuity: "observation",
    survival: 94, mortality: 6,
    operability: {
      verdict: "recommended", successRate: 92, riskScore: 11, procedure: "Laparoscopic splenic repair / splenectomy",
      reasoning: "Young, physiologically robust patient with contained injury and normal coagulation. Surgery carries high success and low peri-operative risk.",
      factors: [
        { label: "Coagulation", value: "INR 1.1 · normal", good: true },
        { label: "Hemodynamics", value: "Stable · MAP 82", good: true },
        { label: "Comorbidities", value: "None", good: true },
        { label: "Lactate", value: "1.8 (normal)", good: true },
      ],
    },
  },
  {
    bed: "ICU-04", name: "Elena Garcia", id: "PT-ICU-2604", age: 58, sex: "F", bloodGroup: "A+",
    diagnosis: "Severe community-acquired pneumonia · acute hypoxemic respiratory failure",
    doctor: "Dr. Maya Chen · Intensivist", nurse: "Aisha Patel, RN · 1:1",
    medication: "Piperacillin/Tazobactam · 4.5 g IV q6h", allergies: "NKDA", admitted: "2026-06-14 08:42",
    ct: "CT chest: bilateral multilobar consolidation. Small right pleural effusion. No PE.",
    labs: "WBC 18.4 ×10⁹/L · Lactate 3.1 mmol/L · CRP 248 · ABG pO₂ 62 mmHg.",
    history: "Type 2 diabetes · hypertension · no prior ICU admission.",
    hero: "/images/icu-bed-hero.jpg", baselineAcuity: "high",
    survival: 83, mortality: 17,
    operability: {
      verdict: "conditional", successRate: 71, riskScore: 34, procedure: "Thoracoscopic drainage / decortication",
      reasoning: "Respiratory reserve is limited and sepsis markers are elevated. Surgery is feasible only after 24–48 h of stabilization, oxygenation recovery and lactate clearance.",
      factors: [
        { label: "Oxygenation", value: "pO₂ 62 · borderline", good: false },
        { label: "Sepsis markers", value: "CRP 248 · high", good: false },
        { label: "Cardiac status", value: "Stable", good: true },
        { label: "Age / comorbid", value: "58 · DM+HTN", good: false },
      ],
    },
  },
  {
    bed: "ICU-07", name: "David Okonkwo", id: "PT-ICU-2607", age: 67, sex: "M", bloodGroup: "B+",
    diagnosis: "Acute anterior STEMI · cardiogenic shock · post-PCI",
    doctor: "Dr. Priya Nair · Cardiologist", nurse: "Tom Alvarez, RN · 1:1",
    medication: "Noradrenaline · Dobutamine · Dual antiplatelet", allergies: "Aspirin (mild)", admitted: "2026-06-14 04:55",
    ct: "Echo: EF 28% · anterior wall akinesia. No mechanical complication.",
    labs: "Troponin 42 ng/mL · Lactate 4.6 · Creatinine 1.9 · BNP 1840.",
    history: "Prior MI · CKD stage 3 · smoker 40 pack-years.",
    hero: "/images/icu-bed-hero.jpg", baselineAcuity: "critical",
    survival: 58, mortality: 42,
    operability: {
      verdict: "not-advised", successRate: 39, riskScore: 78, procedure: "Emergency CABG",
      reasoning: "Severe LV dysfunction (EF 28%), rising lactate and renal impairment place peri-operative mortality risk very high. AI advises medical stabilization and mechanical support before any surgical decision.",
      factors: [
        { label: "Ejection fraction", value: "28% · severe", good: false },
        { label: "Lactate", value: "4.6 · rising", good: false },
        { label: "Renal function", value: "Cr 1.9 · CKD-3", good: false },
        { label: "Shock state", value: "Cardiogenic", good: false },
      ],
    },
  },
  {
    bed: "ICU-10", name: "Sofia Lindqvist", id: "PT-ICU-2610", age: 34, sex: "F", bloodGroup: "AB+",
    diagnosis: "Diabetic ketoacidosis · resolving · post-correction monitoring",
    doctor: "Dr. Ravi Kumar · Endocrinology", nurse: "Grace Lee, RN · 1:2",
    medication: "Insulin infusion · fluid resuscitation · K+ replacement", allergies: "NKDA", admitted: "2026-06-14 09:20",
    ct: "No acute imaging indicated. CXR clear.",
    labs: "pH 7.31 (improving) · Glucose 214 · K+ 3.9 · Ketones falling.",
    history: "Type 1 diabetes · well-controlled · no complications.",
    hero: "/images/icu-bed-hero.jpg", baselineAcuity: "observation",
    survival: 97, mortality: 3,
    operability: {
      verdict: "recommended", successRate: 95, riskScore: 8, procedure: "Elective procedures cleared once euglycemic",
      reasoning: "Metabolic crisis is resolving and the patient is young with excellent physiological reserve. Any required surgery is low risk once acid-base and glucose normalize.",
      factors: [
        { label: "Acid-base", value: "pH 7.31 · recovering", good: true },
        { label: "Age / reserve", value: "34 · excellent", good: true },
        { label: "Comorbidities", value: "Well-controlled T1DM", good: true },
        { label: "Electrolytes", value: "Corrected", good: true },
      ],
    },
  },
  {
    bed: "ICU-01", name: "Aisha Khan", id: "PT-ICU-2601", age: 29, sex: "F", bloodGroup: "O-",
    diagnosis: "Severe asthma exacerbation · type 2 respiratory failure · NIV support",
    doctor: "Dr. Samuel Lee · Pulmonology", nurse: "Nadia Hussain, RN · 1:2",
    medication: "Nebulized salbutamol · Hydrocortisone 100 mg IV · MgSO₄", allergies: "Sulfa", admitted: "2026-06-14 07:15",
    ct: "CXR: hyperinflation, no consolidation. ABG pCO₂ 58.",
    labs: "pH 7.29 · pCO₂ 58 · pO₂ 68 · Eosinophils 0.9.",
    history: "Asthma since childhood · well controlled · non-smoker.",
    hero: "/images/icu-bed-hero.jpg", baselineAcuity: "observation",
    survival: 96, mortality: 4,
    operability: { verdict: "recommended", successRate: 93, riskScore: 12, procedure: "No surgery indicated · medical management", reasoning: "Young asthmatic with reversible airway obstruction and excellent reserve. No surgical indication; medical therapy has high success.", factors: [{label:"Airway reversibility",value:"High",good:true},{label:"Reserve",value:"Young · no comorbid",good:true},{label:"pCO₂",value:"58 · moderate",good:false},{label:"Allergy",value:"Sulfa · minor",good:true}] },
  },
  {
    bed: "ICU-03", name: "Kenji Tanaka", id: "PT-ICU-2603", age: 62, sex: "M", bloodGroup: "A-",
    diagnosis: "COPD exacerbation · community pneumonia · cor pulmonale",
    doctor: "Dr. Hélène Dubois · Pulmonology", nurse: "Jonas Weber, RN · 1:2",
    medication: "Ceftriaxone · Azithromycin · Tiotropium NEB", allergies: "NKDA", admitted: "2026-06-14 05:40",
    ct: "CT: emphysematous changes · right lower lobe infiltrate · RV dilation.",
    labs: "pH 7.34 · pCO₂ 52 · BNP 420 · CRP 112.",
    history: "COPD Gold 3 · smoker 30 pack-y · hypertension.",
    hero: "/images/icu-bed-hero.jpg", baselineAcuity: "high",
    survival: 78, mortality: 22, operability: { verdict: "conditional", successRate: 64, riskScore: 42, procedure: "Bronchoscopy with lavage (conditional)", reasoning: "Elevated pulmonary pressure and hypercapnia increase anaesthetic risk. Procedure possible only after bronchodilation and NIV optimization.", factors: [{label:"Pulmonary pressure",value:"Elevated",good:false},{label:"Hypercapnia",value:"pCO₂ 52",good:false},{label:"Cardiac",value:"RV strain",good:false},{label:"Infection",value:"Resolving",good:true}] },
  },
  {
    bed: "ICU-05", name: "Fatima Al-Zahra", id: "PT-ICU-2605", age: 45, sex: "F", bloodGroup: "AB-",
    diagnosis: "Septic shock · post-laparotomy peritonitis · ARDS early",
    doctor: "Dr. Victor Hugo · General Surgery", nurse: "Clara Mendez, RN · 1:1",
    medication: "Meropenem · Noradrenaline 0.18 mcg/kg · Vasopressin", allergies: "Penicillin rash", admitted: "2026-06-14 02:30",
    ct: "CT: residual pelvic collection 3.2 cm · bilateral infiltrates.",
    labs: "Lactate 3.8 · Procalcitonin 8.4 · Creatinine 1.4 · Platelets 98.",
    history: "Perforated appendix · laparotomy 48h ago · BMI 31.",
    hero: "/images/icu-bed-hero.jpg", baselineAcuity: "critical",
    survival: 62, mortality: 38, operability: { verdict: "not-advised", successRate: 41, riskScore: 71, procedure: "Re-laparotomy for washout", reasoning: "Active septic shock with thrombocytopenia and early ARDS. Immediate re-operation carries very high mortality; AI recommends source control via percutaneous drain and stabilization first.", factors: [{label:"Platelets",value:"98 · low",good:false},{label:"Shock",value:"On vasopressors",good:false},{label:"ARDS",value:"Early · P/F 180",good:false},{label:"Collection",value:"3.2 cm drainable",good:true}] },
  },
  {
    bed: "ICU-06", name: "Robert Hughes", id: "PT-ICU-2606", age: 71, sex: "M", bloodGroup: "B-",
    diagnosis: "Ischaemic stroke · left MCA · post-thrombolysis",
    doctor: "Dr. Anya Petrova · Neurology", nurse: "David Kim, RN · 1:1",
    medication: "Alteplase · Aspirin · Atorvastatin · Levetiracetam", allergies: "NKDA", admitted: "2026-06-14 03:10",
    ct: "CT: left MCA infarct 32 mL · no haemorrhagic transformation.",
    labs: "INR 1.0 · NIHSS 14 · Glucose 168.",
    history: "Atrial fibrillation · warfarin held · hypertension.",
    hero: "/images/icu-bed-hero.jpg", baselineAcuity: "high",
    survival: 71, mortality: 29, operability: { verdict: "not-advised", successRate: 34, riskScore: 82, procedure: "Decompressive hemicraniectomy", reasoning: "Large infarct with mass effect risk, but recent thrombolysis contraindicates early craniectomy. AI advises ICP monitoring and delayed reassessment.", factors: [{label:"Infarct volume",value:"32 mL · large",good:false},{label:"Thrombolysis",value:"<24h · bleeding risk",good:false},{label:"Age",value:"71 · comorbid",good:false},{label:"Neurology",value:"Stable · no herniation",good:true}] },
  },
  {
    bed: "ICU-08", name: "James Miller", id: "PT-ICU-2608", age: 52, sex: "M", bloodGroup: "O-",
    diagnosis: "Acute pancreatitis · necrotizing · ICU monitoring",
    doctor: "Dr. Fatma El-Sayed · Gastroenterology", nurse: "Hiro Sato, RN · 1:2",
    medication: "Aggressive IV fluids · Fentanyl PCA · Imipenem", allergies: "NKDA", admitted: "2026-06-14 08:05",
    ct: "CT: pancreatic necrosis 35% · peripancreatic fluid · no gas.",
    labs: "Amylase 1420 · Lipase 2100 · Calcium 7.8 · BUN 28.",
    history: "Alcohol use · gallstones · no prior pancreatitis.",
    hero: "/images/icu-bed-hero.jpg", baselineAcuity: "high",
    survival: 74, mortality: 26, operability: { verdict: "conditional", successRate: 58, riskScore: 48, procedure: "Minimally invasive necrosectomy (delayed)", reasoning: "Necrosis without infection can be managed conservatively. Surgery is conditional on infected necrosis or clinical deterioration after 2–4 weeks.", factors: [{label:"Necrosis",value:"35% · sterile",good:true},{label:"Calcium",value:"7.8 · low",good:false},{label:"Inflammation",value:"High but stable",good:false},{label:"Timing",value:"Too early for surgery",good:true}] },
  },
  {
    bed: "ICU-09", name: "Priya Sharma", id: "PT-ICU-2609", age: 39, sex: "F", bloodGroup: "A-",
    diagnosis: "Postpartum hemorrhage · uterine atony · massive transfusion protocol",
    doctor: "Dr. Linda Park · Obstetrics", nurse: "Sofia Reyes, RN · 1:1",
    medication: "Oxytocin infusion · Tranexamic acid · RBC 4 units", allergies: "NKDA", admitted: "2026-06-14 04:10",
    ct: "Pelvic US: uterus contracted · small retained clot 1.8 cm.",
    labs: "Hb 7.4 → 9.1 · Fibrinogen 180 · Platelets 145 · Lactate 2.4.",
    history: "G2P1 · healthy pregnancy · no prior bleeding.",
    hero: "/images/icu-bed-hero.jpg", baselineAcuity: "observation",
    survival: 98, mortality: 2, operability: { verdict: "recommended", successRate: 96, riskScore: 9, procedure: "Uterine curettage if needed", reasoning: "Hemorrhage is controlled and coagulation is recovering. Any additional procedure is very low risk with excellent maternal reserve.", factors: [{label:"Hemoglobin",value:"Recovering 9.1",good:true},{label:"Coagulation",value:"Improving",good:true},{label:"Uterine tone",value:"Contracted",good:true},{label:"Maternal reserve",value:"Young · healthy",good:true}] },
  },
  {
    bed: "ICU-11", name: "Chen Wei", id: "PT-ICU-2611", age: 47, sex: "M", bloodGroup: "B+",
    diagnosis: "Traumatic brain injury · moderate · SDH 6 mm · observation",
    doctor: "Dr. Karl Weber · Neurosurgery", nurse: "Emma Okafor, RN · 1:1",
    medication: "Levetiracetam · Mannitol PRN · Nimodipine", allergies: "Iodine contrast", admitted: "2026-06-14 06:55",
    ct: "CT head: right frontoparietal SDH 6 mm · midline shift 2 mm.",
    labs: "GCS 13 (E4V4M5) · Sodium 141 · Glucose 132.",
    history: "Fall from height · helmeted · no anticoagulants.",
    hero: "/images/icu-bed-hero.jpg", baselineAcuity: "high",
    survival: 81, mortality: 19, operability: { verdict: "conditional", successRate: 76, riskScore: 31, procedure: "Burr-hole evacuation (if expansion)", reasoning: "SDH is small with minimal shift and stable GCS. Surgery is reserved for radiological progression or neurological decline; current plan is close neuro-observation.", factors: [{label:"SDH thickness",value:"6 mm · small",good:true},{label:"Midline shift",value:"2 mm · minimal",good:true},{label:"GCS",value:"13 · stable",good:true},{label:"Expansion risk",value:"Moderate",good:false}] },
  },
  {
    bed: "ICU-12", name: "Olivia Brown", id: "PT-ICU-2612", age: 22, sex: "F", bloodGroup: "O-",
    diagnosis: "Overdose · mixed ingestion · observation · extubation ready",
    doctor: "Dr. Nina Patel · Toxicology", nurse: "Alex Rivera, RN · 1:2",
    medication: "N-acetylcysteine · Activated charcoal · Supportive", allergies: "NKDA", admitted: "2026-06-14 10:10",
    ct: "No imaging indicated. ECG normal QTc.",
    labs: "Paracetamol 42 · pH 7.32 · Lactate 1.6 · Tox screen pending.",
    history: "Previous self-harm · depression · no medical comorbid.",
    hero: "/images/icu-bed-hero.jpg", baselineAcuity: "stable",
    survival: 99, mortality: 1, operability: { verdict: "recommended", successRate: 98, riskScore: 4, procedure: "No surgical indication", reasoning: "Toxic ingestion is managed medically. No surgical procedure is indicated or needed; supportive care has near-perfect outcome.", factors: [{label:"Ingestion",value:"Managed · charcoal",good:true},{label:"Organ function",value:"Preserved",good:true},{label:"ECG",value:"Normal QTc",good:true},{label:"Psych support",value:"Consulted",good:true}] },
  },
];

export const OPERABLE_META: Record<OperableVerdict, { label: string; color: string; icon: string }> = {
  recommended: { label: "SURGERY RECOMMENDED", color: "#20d991", icon: "✓" },
  conditional: { label: "SURGERY CONDITIONAL", color: "#f4c849", icon: "!" },
  "not-advised": { label: "SURGERY NOT ADVISED", color: "#ff4d5e", icon: "✕" },
};