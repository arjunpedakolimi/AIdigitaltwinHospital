export type Status = "normal" | "busy" | "critical";
export type FacilityKind = "building" | "parking" | "helipad" | "gate" | "service";

export interface Metric { label: string; value: string; sub?: string }
export interface InteriorZone {
  name: string;
  desc: string;
  type?: "beds" | "clinical" | "lab" | "office" | "storage" | "ai" | "utility";
}
export interface Department {
  id: string;
  name: string;
  short: string;
  category: string;
  status: Status;
  position: [number, number, number];
  size: [number, number, number];
  color: string;
  icon: string;
  floors?: number;
  kind?: FacilityKind;
  metrics: Metric[];
  interior?: InteriorZone[];
  summary: string;
}

export const STATUS_COLORS: Record<Status, string> = {
  normal: "#20d991", busy: "#f4c849", critical: "#ff5266",
};
export const STATUS_LABEL: Record<Status, string> = {
  normal: "Normal", busy: "Busy", critical: "Critical",
};

const metrics = (patients: string, beds: string, doctors: string, nurses: string): Metric[] => [
  { label: "Patients", value: patients, sub: "live census" },
  { label: "Beds Available", value: beds },
  { label: "Doctors", value: doctors, sub: "on duty" },
  { label: "Nurses", value: nurses, sub: "on duty" },
];

export const departments: Department[] = [
  {
    id: "command", name: "AI Command Center", short: "AI CORE", category: "Digital Operations",
    status: "normal", position: [0, 0, 1], size: [11, 6, 9], color: "#24b7ff", icon: "AI", floors: 2,
    summary: "Secure command floor synchronizing clinical operations, predictive AI and the campus digital twin.",
    metrics: [
      { label: "IoT Streams", value: "2,418/s", sub: "768 sensors" }, { label: "Granite Confidence", value: "98.4%" },
      { label: "Twin Latency", value: "18 ms" }, { label: "Platform Uptime", value: "99.99%" },
    ],
    interior: [
      { name: "Holographic Operations Wall", desc: "Campus heat maps and clinical telemetry", type: "ai" },
      { name: "IBM Granite AI Console", desc: "Demand prediction and risk forecasting", type: "ai" },
      { name: "RAG Knowledge Assistant", desc: "Grounded SOP and policy retrieval", type: "ai" },
      { name: "Agentic Workflow Bay", desc: "Autonomous resource orchestration", type: "ai" },
      { name: "Digital Twin Synchronization", desc: "Real-time spatial and asset state", type: "ai" },
    ],
  },
  {
    id: "reception", name: "Main Entrance & Reception", short: "RECEPTION", category: "Patient Services",
    status: "normal", position: [0, 0, 23], size: [16, 5, 9], color: "#68d4ff", icon: "EN", floors: 2,
    summary: "Double-height arrival hall with automatic doors, digital check-in and concierge wayfinding.",
    metrics: [{ label: "Visitors", value: "742", sub: "today" }, { label: "Check-ins", value: "58/hr" }, { label: "Kiosks", value: "8/8" }, { label: "Waiting Time", value: "4 min" }],
    interior: [
      { name: "Reception Hall", desc: "Double-height daylight lobby", type: "office" },
      { name: "Registration Counter", desc: "Assisted and self-service check-in", type: "office" },
      { name: "Waiting Lounge", desc: "Accessible seating and queue displays", type: "office" },
      { name: "Security Screening", desc: "Visitor credentialing and access control", type: "office" },
    ],
  },
  {
    id: "emergency", name: "Emergency Department", short: "EMERGENCY", category: "Critical Care",
    status: "normal", position: [-18, 0, 23], size: [15, 5.5, 11], color: "#ef5368", icon: "ER", floors: 2,
    summary: "Level-one emergency department with dedicated ambulance access and rapid trauma pathways.",
    metrics: [{ label: "Active Cases", value: "11" }, { label: "Waiting Time", value: "7 min" }, { label: "Treatment Bays", value: "9/16" }, { label: "Emergency Level", value: "NORMAL" }],
    interior: [
      { name: "Reception", desc: "Emergency registration and navigation", type: "office" },
      { name: "Triage", desc: "AI-assisted acuity assessment", type: "clinical" },
      { name: "Waiting Area", desc: "Zoned adult and pediatric seating", type: "office" },
      { name: "Observation", desc: "Short-stay monitored beds", type: "beds" },
      { name: "Resuscitation", desc: "Four high-acuity trauma bays", type: "clinical" },
      { name: "Treatment Rooms", desc: "Twelve enclosed clinical rooms", type: "clinical" },
      { name: "Ambulance Entry", desc: "Direct covered transfer corridor", type: "clinical" },
    ],
  },
  {
    id: "icu", name: "ICU Block A", short: "ICU-A", category: "Critical Care",
    status: "normal", position: [-18, 0, 1], size: [14, 8.5, 10], color: "#ff9d42", icon: "ICU", floors: 4,
    summary: "High-acuity intensive care with negative-pressure isolation and continuous bedside telemetry — rooftop helipad.",
    metrics: [{ label: "ICU Occupancy", value: "14/20", sub: "70%" }, { label: "Ventilators", value: "9 active" }, { label: "Doctors", value: "8" }, { label: "Oxygen", value: "4.2 bar" }],
    interior: [
      { name: "ICU Beds", desc: "Twenty glass-front monitored rooms", type: "beds" },
      { name: "Ventilator Zone", desc: "Bedside respiratory support", type: "clinical" },
      { name: "Patient Monitoring", desc: "Continuous multi-parameter telemetry", type: "clinical" },
      { name: "Nurse Station", desc: "Central line-of-sight care hub", type: "office" },
      { name: "Isolation Room", desc: "Negative-pressure infection control", type: "clinical" },
      { name: "Medicine Cabinets", desc: "Automated secure dispensing", type: "storage" },
    ],
  },
  {
    id: "icuB", name: "ICU Block B", short: "ICU-B", category: "Critical Care",
    status: "normal", position: [-18, 0, -35], size: [11, 5.5, 8], color: "#ffb056", icon: "IB", floors: 2,
    summary: "Standby surge ICU with twelve rapid-activation beds and independent medical gas supply.",
    metrics: [{ label: "Beds Ready", value: "12" }, { label: "Ventilators", value: "12" }, { label: "Activation", value: "STANDBY" }, { label: "Readiness", value: "100%" }],
    interior: [
      { name: "Surge ICU Beds", desc: "Twelve rapid-deploy critical beds", type: "beds" },
      { name: "Mobile Nurse Station", desc: "Portable monitoring command", type: "office" },
      { name: "Ventilator Reserve", desc: "Pre-checked respiratory equipment", type: "clinical" },
      { name: "Clean Utility", desc: "Sterile supplies and medication", type: "storage" },
    ],
  },
  {
    id: "wardA", name: "Ward A - General Medicine", short: "WARD A", category: "Inpatient",
    status: "normal", position: [18, 0, 23], size: [14, 10, 10], color: "#4db8ff", icon: "WA", floors: 5,
    summary: "Daylit inpatient tower with private rooms, family terraces and decentralized nursing — flanks Main Hospital east.", metrics: metrics("32", "8/40", "6", "12"),
    interior: [
      { name: "Patient Rooms", desc: "Private and two-bed rooms with balconies", type: "beds" }, { name: "Visitor Lounges", desc: "Family seating with garden views", type: "office" },
      { name: "Nurse Station", desc: "Decentralized care pods", type: "office" }, { name: "Medication Room", desc: "Secure ward pharmacy", type: "storage" },
    ],
  },
  {
    id: "wardB", name: "Ward B - Surgical", short: "WARD B", category: "Inpatient",
    status: "normal", position: [18, 0, 1], size: [14, 10, 10], color: "#718bff", icon: "WB", floors: 5,
    summary: "Surgical recovery and step-down tower linked directly to operation theatres and ICU — eastern wing.", metrics: metrics("29", "6/35", "7", "11"),
    interior: [
      { name: "Surgical Beds", desc: "Thirty-five monitored recovery beds", type: "beds" }, { name: "Step-down Unit", desc: "Intermediate acuity monitoring", type: "clinical" },
      { name: "Nurse Station", desc: "Central clinical work area", type: "office" }, { name: "Visitor Chairs", desc: "Family seating at every room", type: "office" },
    ],
  },
  {
    id: "ot", name: "Operation Theatre Complex", short: "SURGERY", category: "Surgical",
    status: "normal", position: [0, 0, -19], size: [16, 7, 10], color: "#a789ff", icon: "OT", floors: 3,
    summary: "Hybrid operating suite with laminar flow, robotic surgery and direct sterile logistics — linked to ICU and Wards.",
    metrics: [{ label: "Theatres Active", value: "4/6" }, { label: "Cases Today", value: "17" }, { label: "Recovery Beds", value: "8/12" }, { label: "Sterile Status", value: "VALID" }],
    interior: [
      { name: "Operating Rooms", desc: "Six integrated hybrid theatres", type: "clinical" }, { name: "Recovery Room", desc: "Twelve PACU monitored beds", type: "beds" },
      { name: "Sterilization Room", desc: "Immediate-use sterile processing", type: "lab" }, { name: "Equipment Room", desc: "Robotics, imaging and anesthesia", type: "storage" },
    ],
  },
  {
    id: "lab", name: "Clinical Laboratory", short: "LAB", category: "Diagnostics",
    status: "normal", position: [-18, 0, -19], size: [12, 5, 9], color: "#35d3bd", icon: "LB", floors: 2,
    summary: "Automated diagnostic laboratory with pneumatic sample intake and controlled clean zones.",
    metrics: [{ label: "Tests Queued", value: "128" }, { label: "Turnaround", value: "34 min" }, { label: "Analyzers", value: "12/12" }, { label: "Samples", value: "1,042" }],
    interior: [
      { name: "Blood Testing", desc: "Automated hematology line", type: "lab" }, { name: "Microbiology", desc: "Containment and culture suites", type: "lab" },
      { name: "Pathology", desc: "Histology and cytology benches", type: "lab" }, { name: "Sample Collection", desc: "Phlebotomy and intake", type: "clinical" },
      { name: "Equipment Room", desc: "PCR and chemistry analyzers", type: "lab" },
    ],
  },
  {
    id: "radiology", name: "Radiology & Imaging", short: "RADIOLOGY", category: "Diagnostics",
    status: "normal", position: [0, 0, -35], size: [13, 5, 7], color: "#41c7ff", icon: "RX", floors: 2,
    summary: "Shielded diagnostic imaging center with MRI, CT, X-ray and AI-assisted reporting.",
    metrics: [{ label: "Scans Today", value: "186" }, { label: "MRI Queue", value: "7" }, { label: "Systems Online", value: "9/9" }, { label: "Report Time", value: "28 min" }],
    interior: [
      { name: "MRI Suite", desc: "3T imaging with controlled access", type: "clinical" }, { name: "CT Suite", desc: "Dual-source trauma imaging", type: "clinical" },
      { name: "X-Ray Rooms", desc: "Digital radiography rooms", type: "clinical" }, { name: "Reporting Hub", desc: "AI-assisted diagnostic workstations", type: "office" },
    ],
  },
  {
    id: "pharmacy", name: "Central Pharmacy", short: "PHARMACY", category: "Clinical Support",
    status: "normal", position: [18, 0, -19], size: [12, 5.5, 9], color: "#39d89a", icon: "PH", floors: 2,
    summary: "Robotic medication fulfillment with secure dispensing — adjacent to Administration and Labs.",
    metrics: [{ label: "Prescriptions", value: "312" }, { label: "Stock", value: "94%" }, { label: "Cold Storage", value: "4.1 C" }, { label: "Dispense Time", value: "6 min" }],
    interior: [
      { name: "Medicine Storage", desc: "Automated high-density shelving", type: "storage" }, { name: "Dispensing Counter", desc: "Patient and ward dispatch", type: "office" },
      { name: "Cold Storage", desc: "Vaccines and biologics", type: "storage" }, { name: "Robotic Fulfillment", desc: "Barcode-verified picking line", type: "lab" },
    ],
  },
  {
    id: "blood", name: "Blood Bank", short: "BLOOD BANK", category: "Clinical Support",
    status: "normal", position: [-43, 0, 2], size: [8, 4.5, 7], color: "#ff6479", icon: "BB", floors: 2,
    summary: "Controlled blood component processing, compatibility testing and emergency inventory.",
    metrics: [{ label: "Units Ready", value: "428" }, { label: "O Negative", value: "38" }, { label: "Crossmatches", value: "24" }, { label: "Cold Chain", value: "VALID" }],
    interior: [
      { name: "Component Storage", desc: "Monitored blood refrigeration", type: "storage" }, { name: "Compatibility Lab", desc: "Crossmatch and screening", type: "lab" },
      { name: "Issue Counter", desc: "Emergency clinical dispatch", type: "office" },
    ],
  },
  {
    id: "admin", name: "Administration", short: "ADMIN", category: "Enterprise Services",
    status: "normal", position: [43, 0, 2], size: [12, 6.5, 9], color: "#8aa1bd", icon: "AD", floors: 3,
    summary: "Executive, medical administration and enterprise operations in a flexible office block.",
    metrics: [{ label: "Staff On Site", value: "184" }, { label: "Open Actions", value: "12" }, { label: "Compliance", value: "100%" }, { label: "Control Rooms", value: "2 online" }],
    interior: [
      { name: "Conference Room", desc: "Clinical leadership briefing suite", type: "office" }, { name: "Doctor Cabins", desc: "Consulting and administration", type: "office" },
      { name: "Operations Control", desc: "Bed and staffing coordination", type: "ai" }, { name: "Executive Offices", desc: "Hospital leadership floor", type: "office" },
    ],
  },
  {
    id: "cssd", name: "Central Sterile Services", short: "CSSD", category: "Clinical Support",
    status: "normal", position: [18, 0, -35], size: [11, 4.5, 8], color: "#66d9e8", icon: "CS", floors: 1,
    summary: "One-way sterile processing facility connected to surgery by dedicated clean logistics.",
    metrics: [{ label: "Sets Ready", value: "214" }, { label: "Cycles Active", value: "5" }, { label: "Sterility", value: "VALID" }, { label: "Turnaround", value: "42 min" }],
    interior: [
      { name: "Decontamination", desc: "Separated dirty receiving zone", type: "utility" }, { name: "Assembly", desc: "Instrument inspection and packing", type: "lab" },
      { name: "Sterilization", desc: "Steam and low-temperature systems", type: "utility" }, { name: "Sterile Store", desc: "Positive-pressure clean inventory", type: "storage" },
    ],
  },
  {
    id: "storage", name: "Medical Equipment Storage", short: "BIOMED", category: "Facilities",
    status: "normal", position: [43, 0, -18], size: [10, 4.5, 8], color: "#be83ff", icon: "ME", floors: 1,
    summary: "Tracked medical-device warehouse with biomed inspection and rapid clinical dispatch.",
    metrics: [{ label: "Assets", value: "3,410" }, { label: "In Use", value: "2,180" }, { label: "Ready", value: "1,208" }, { label: "Maintenance", value: "22" }],
    interior: [
      { name: "Device Bay", desc: "Pumps, monitors and ventilators", type: "storage" }, { name: "Consumables", desc: "Tracked clinical supplies", type: "storage" },
      { name: "Biomed Workshop", desc: "Calibration and repair benches", type: "lab" },
    ],
  },
  {
    id: "oxygen", name: "Medical Oxygen Plant", short: "OXYGEN", category: "Critical Utilities",
    status: "normal", position: [-43, 0, -20], size: [8, 5.5, 8], color: "#5ba6ff", icon: "O2", kind: "service",
    summary: "Redundant PSA generation, bulk reserve and medical gas distribution manifold.",
    metrics: [{ label: "Line Pressure", value: "4.2 bar" }, { label: "Reserve", value: "87%" }, { label: "Flow", value: "1,200 L/m" }, { label: "Alarms", value: "0" }],
    interior: [
      { name: "PSA Generation", desc: "Dual oxygen concentrator trains", type: "utility" }, { name: "Bulk Tanks", desc: "Cryogenic emergency reserve", type: "utility" },
      { name: "Distribution Manifold", desc: "Monitored campus supply", type: "utility" },
    ],
  },
  {
    id: "power", name: "Power Backup Plant", short: "POWER", category: "Critical Utilities",
    status: "normal", position: [43, 0, -34], size: [9, 5.5, 8], color: "#f6cb55", icon: "PW", kind: "service",
    summary: "N+1 generators, UPS battery rooms and automatic transfer for critical clinical loads.",
    metrics: [{ label: "Grid Load", value: "2.8 MW" }, { label: "UPS", value: "100%" }, { label: "Fuel", value: "72 hr" }, { label: "Generators", value: "3 ready" }],
    interior: [
      { name: "Generator Hall", desc: "Three synchronized backup generators", type: "utility" }, { name: "UPS Battery Room", desc: "Critical no-break power", type: "utility" },
      { name: "Switchgear", desc: "Automatic transfer and protection", type: "utility" },
    ],
  },
  {
    id: "visitorParking", name: "Visitor Parking", short: "VISITOR P", category: "Mobility",
    status: "normal", position: [-20, 0, 49], size: [14, 0.35, 9], color: "#65748a", icon: "VP", kind: "parking",
    summary: "Visitor parking with accessible bays, EV charging and digital guidance.",
    metrics: [{ label: "Spaces Free", value: "42/220" }, { label: "EV Bays", value: "6/8" }, { label: "Occupancy", value: "81%" }, { label: "Security", value: "ONLINE" }],
    interior: [{ name: "Visitor Zone", desc: "Public and accessible parking", type: "utility" }],
  },
  {
    id: "doctorParking", name: "Doctor & Staff Parking", short: "STAFF P", category: "Mobility",
    status: "normal", position: [20, 0, 49], size: [14, 0.35, 9], color: "#65748a", icon: "DP", kind: "parking",
    summary: "Badge-access staff parking with protected night-shift route.",
    metrics: [{ label: "Spaces Free", value: "28/180" }, { label: "EV Bays", value: "12/16" }, { label: "Occupancy", value: "84%" }, { label: "Access", value: "SECURE" }],
    interior: [{ name: "Staff Zone", desc: "Secure clinical staff parking", type: "utility" }],
  },
  {
    id: "loading", name: "Clinical Loading Bay", short: "LOADING", category: "Logistics",
    status: "normal", position: [43, 0, 24], size: [12, 3.8, 7], color: "#8997a9", icon: "LD", kind: "service",
    summary: "Separated clean and general deliveries with autonomous inventory scanning.",
    metrics: [{ label: "Bays Free", value: "3/4" }, { label: "Deliveries", value: "18" }, { label: "Cold Chain", value: "VALID" }, { label: "Queue", value: "1 truck" }],
    interior: [
      { name: "Receiving Docks", desc: "Four weather-protected loading bays", type: "utility" }, { name: "Inspection", desc: "Barcode and quality verification", type: "storage" },
    ],
  },
  {
    id: "ambulanceGarage", name: "Ambulance Garage", short: "AMB GARAGE", category: "Emergency Mobility",
    status: "normal", position: [-44, 0, 24], size: [11, 4, 8], color: "#f43f5e", icon: "AG", floors: 1,
    summary: "Covered ambulance fleet garage with rapid dispatch bays and decontamination wash — 6-bay glass-fronted.",
    metrics: [{ label: "Bays", value: "6/6 ready" }, { label: "Fleet GPS", value: "Live" }, { label: "Avg Dispatch", value: "42 sec" }, { label: "Decon", value: "Bay 2 active" }],
    interior: [
      { name: "Dispatch Bays", desc: "Six covered ambulance bays with charging", type: "utility" },
      { name: "Decontamination", desc: "Vehicle wash and sterilization", type: "utility" },
      { name: "Crew Ready Room", desc: "Paramedic staging and equipment check", type: "office" },
    ],
  },
  {
    id: "security", name: "Security Gate", short: "GATE 01", category: "Campus Security",
    status: "normal", position: [0, 0, 52], size: [18, 4.5, 6], color: "#54c5ff", icon: "SG", kind: "gate",
    summary: "Smart campus entry with ANPR, visitor verification and emergency vehicle priority.",
    metrics: [{ label: "Vehicles", value: "438" }, { label: "Cameras", value: "12/12" }, { label: "Alerts", value: "0" }, { label: "Gate Time", value: "18 sec" }],
    interior: [{ name: "Security Control", desc: "ANPR and access monitoring", type: "ai" }],
  },
  {
    id: "helipad", name: "Rooftop Helipad", short: "HELIPAD", category: "Emergency Mobility",
    status: "normal", position: [-18, 9.3, 1], size: [9, 0.35, 9], color: "#f5d35f", icon: "HP", kind: "helipad",
    summary: "Rooftop helipad on ICU Block A — illuminated H-pad with direct lift to Emergency and OT.",
    metrics: [{ label: "Deck", value: "CLEAR" }, { label: "Wind", value: "8 kt" }, { label: "Landings", value: "3" }, { label: "Trauma Lift", value: "READY" }],
    interior: [{ name: "Trauma Lift", desc: "Direct express route to ER and surgery", type: "utility" }],
  },
];

export interface GlobalMetric { label: string; value: string; delta?: string; status: Status; icon: string }
export const globalMetrics: GlobalMetric[] = [
  { label: "Patients", value: "1,284", delta: "live census", status: "normal", icon: "PT" },
  { label: "ICU Occupancy", value: "70%", delta: "14/20", status: "normal", icon: "IC" },
  { label: "Available Beds", value: "34", delta: "campus wide", status: "normal", icon: "BD" },
  { label: "Clinical Staff", value: "246", delta: "on duty", status: "normal", icon: "MD" },
  { label: "Equipment", value: "98.7%", delta: "online", status: "normal", icon: "EQ" },
  { label: "Ambulances", value: "6 ready", delta: "GPS live", status: "normal", icon: "AM" },
  { label: "Waiting Time", value: "7 min", delta: "ER median", status: "normal", icon: "WT" },
  { label: "Emergency Level", value: "NORMAL", delta: "campus", status: "normal", icon: "EL" },
];