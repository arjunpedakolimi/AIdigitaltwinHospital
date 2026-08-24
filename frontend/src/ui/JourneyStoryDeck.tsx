import { useState } from "react";
import { PatientJourneyState } from "../hooks/usePatientJourney";
import { PATIENT, MEDICATION_SCHEDULE, RISK_META } from "../data/patientJourney";
import { EcgMonitor } from "./PatientJourney";

/**
 * Full-story deck that visualizes the 15-step patient journey used by judges.
 * Combines Explainable AI (why), RAG panel, Agentic task queue with animation,
 * and Before/After comparison — the exact hackathon flow requested.
 */

const STORY_STEPS = [
  { id: 1,  key: "accident",     label: "🚑 Road Accident",           desc: "GPS detects multi-vehicle accident 3.2 km south" },
  { id: 2,  key: "dispatch",     label: "📡 GPS Dispatch",             desc: "Ambulance AMB-04 auto-dispatched · ETA 42 sec" },
  { id: 3,  key: "arrival",      label: "🏥 Ambulance Arrives",        desc: "Emergency bay ready · trauma team paged" },
  { id: 4,  key: "registration", label: "📋 Patient Registration",     desc: `Unique ID: ${PATIENT.id} · Digital Twin created` },
  { id: 5,  key: "triage",       label: "⚡ Triage",                    desc: "Severity Level 1 · resuscitation priority" },
  { id: 6,  key: "ctscan",       label: "🔬 CT Scan & Diagnostics",    desc: "Trauma CT · labs · reports bound to twin" },
  { id: 7,  key: "icubed",       label: "🛏 ICU Bed Assigned",          desc: "ICU-A Bed 07 auto-allocated by AI" },
  { id: 8,  key: "monitoring",   label: "❤️ Live Vital Monitoring",     desc: "9 parameters streaming at 1 Hz" },
  { id: 9,  key: "granite",      label: "🧠 IBM Granite Prediction",   desc: "Deterioration risk 92% within 12 min" },
  { id: 10, key: "rag",          label: "📚 RAG Retrieves Protocol",   desc: "SOP-ICU-17 + WHO sepsis bundle grounded" },
  { id: 11, key: "agentic",      label: "🤖 Agentic AI Recommends",    desc: "8 prioritized actions generated" },
  { id: 12, key: "approve",      label: "✅ Doctors Approve",            desc: "Intensivist reviews and approves plan" },
  { id: 13, key: "treatment",    label: "💉 Treatment Applied",         desc: "Ventilator on · transfusion · 1:1 nursing" },
  { id: 14, key: "recovery",     label: "📈 Recovery",                  desc: "Vitals normalizing · weaning · NEWS 13→4" },
  { id: 15, key: "discharge",    label: "🏠 Discharge",                 desc: "Bed released · resources optimized" },
];

// Map journey step id (1-10) from usePatientJourney to story step id (1-15)
const STORY_MAP: Record<number, number> = {
  1: 3,   // arrival
  2: 4,   // registration/triage
  3: 6,   // ct scan
  4: 7,   // icu bed
  5: 8,   // live monitoring
  6: 9,   // granite
  7: 11,  // agentic (skip RAG explicit step - shown in panel)
  8: 13,  // treatment
  9: 14,  // recovery
  10: 15, // discharge
};

export function JourneyStoryDeck({ j }: { j: PatientJourneyState }) {
  const [expanded, setExpanded] = useState<"story" | "explain" | "rag" | "queue" | "compare" | null>("story");
  const meta = RISK_META[j.risk];
  const activeStoryId = STORY_MAP[j.step?.id ?? 1] ?? 3;

  // Explainable AI reasoning based on journey stage
  const explain = {
    prediction: j.step?.id && j.step.id >= 6 ? "Sepsis + Respiratory Failure" : "Baseline monitoring",
    riskPct: j.step?.id && j.step.id >= 6 ? 92 : j.step?.id === 5 ? 61 : 44,
    reasons: [
      { label: "Temperature", value: `${j.vitals.temp}°C`, flag: j.vitals.temp > 37.8 },
      { label: "Heart Rate", value: `${j.vitals.hr} bpm`, flag: j.vitals.hr > 120 },
      { label: "SpO₂", value: `${j.vitals.spo2}%`, flag: j.vitals.spo2 < 92 },
      { label: "NEWS Score", value: String(j.vitals.news), flag: j.vitals.news >= 7 },
    ],
    confidence: 94,
  };

  const ragSources = [
    { name: "Hospital ICU Protocol", ref: "SOP-ICU-17", status: "MATCHED", active: j.step?.id === 6 || j.step?.id === 7 },
    { name: "WHO Clinical Guideline", ref: "Sepsis Bundle 2024", status: "GROUNDED", active: j.step?.id === 6 },
    { name: "Emergency SOP", ref: "ER-042", status: "MATCHED", active: (j.step?.id ?? 0) >= 2 },
    { name: "Ventilator Protocol", ref: "ARDSnet 2025", status: "CITED", active: (j.step?.id ?? 0) >= 7 },
    { name: "Blood Transfusion Guideline", ref: "TX-BB-11", status: "MATCHED", active: j.step?.id === 8 },
  ];

  const tasks = [
    { label: "Open ICU Block B", doneAt: 7 },
    { label: "Deploy 2 Doctors", doneAt: 7 },
    { label: "Allocate 3 Ventilators", doneAt: 8 },
    { label: "Prepare 2 Blood Units", doneAt: 8 },
    { label: "Escalate 1:1 Nursing", doneAt: 8 },
    { label: "Order Emergency CT", doneAt: 9 },
    { label: "Notify Family", doneAt: 10 },
    { label: "Update Dashboard", doneAt: 10 },
  ];

  const before = { icu: 98, wait: 55, docs: "Overloaded", er: "Critical", mortality: 42, survival: 58 };
  const after = { icu: 76, wait: 18, docs: "Balanced", er: "Stable", mortality: 9, survival: 91 };

  const Section = ({ id, title, icon, tint, children }: { id: any; title: string; icon: string; tint: string; children: React.ReactNode }) => {
    const isOpen = expanded === id;
    return (
      <div className={`border transition ${isOpen ? "border-white/15" : "border-white/8"} bg-[#060d16]/95 backdrop-blur`}>
        <button onClick={() => setExpanded(isOpen ? null : id)} className="flex w-full items-center justify-between px-3 py-2 hover:bg-white/[0.03]">
          <div className="flex items-center gap-2">
            <span className="grid h-5 w-5 place-items-center text-[10px]" style={{ background: `${tint}22`, color: tint }}>{icon}</span>
            <span className="text-[10px] font-bold tracking-widest text-white">{title}</span>
          </div>
          <span className="font-mono text-[10px] text-slate-500">{isOpen ? "−" : "+"}</span>
        </button>
        {isOpen && <div className="border-t border-white/8 px-3 py-2.5">{children}</div>}
      </div>
    );
  };

  return (
    <div className="pointer-events-auto absolute left-4 top-16 z-20 w-[22rem] max-h-[calc(100vh-140px)] overflow-y-auto space-y-2">
      {/* patient header */}
      <div className="border border-cyan-400/25 bg-[#060d16]/95 p-3 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-mono text-[8px] tracking-[0.2em] text-cyan-300">INTERACTIVE PATIENT JOURNEY</div>
            <h2 className="mt-0.5 text-sm font-bold text-white">{PATIENT.name}</h2>
            <div className="font-mono text-[9px] text-slate-400">{PATIENT.id} · {PATIENT.age}{PATIENT.sex} · {PATIENT.bloodGroup}</div>
          </div>
          <span className="border px-2 py-1 font-mono text-[9px] font-bold" style={{ borderColor: `${meta.color}55`, color: meta.color, background: `${meta.color}12` }}>
            {meta.label}
          </span>
        </div>
        <div className="mt-2 border border-white/10 bg-black/40">
          <EcgMonitor hr={j.vitals.hr} amplitude={j.ecgAmplitude} color={meta.color} />
        </div>
        <div className="mt-1.5 grid grid-cols-4 gap-1 font-mono text-[9px]">
          <div className="border border-white/8 bg-white/[0.03] px-1.5 py-1"><div className="text-[6px] text-slate-500">HR</div><div style={{ color: meta.color }}>{j.vitals.hr}</div></div>
          <div className="border border-white/8 bg-white/[0.03] px-1.5 py-1"><div className="text-[6px] text-slate-500">BP</div><div className="text-white">{j.vitals.sbp}/{j.vitals.dbp}</div></div>
          <div className="border border-white/8 bg-white/[0.03] px-1.5 py-1"><div className="text-[6px] text-slate-500">SpO₂</div><div className={j.vitals.spo2 < 92 ? "text-orange-300" : "text-emerald-300"}>{j.vitals.spo2}%</div></div>
          <div className="border border-white/8 bg-white/[0.03] px-1.5 py-1"><div className="text-[6px] text-slate-500">NEWS</div><div className={j.vitals.news >= 7 ? "text-rose-300" : "text-emerald-300"}>{j.vitals.news}</div></div>
        </div>
      </div>

      {/* Story flowchart */}
      <Section id="story" title="STORY FLOW" icon="▸" tint="#22d3ee">
        <div className="space-y-1">
          {STORY_STEPS.map((s) => {
            const done = s.id < activeStoryId;
            const active = s.id === activeStoryId;
            return (
              <div key={s.id} className={`flex items-start gap-2 border px-2 py-1.5 transition ${active ? "border-cyan-400/50 bg-cyan-400/[0.08]" : done ? "border-emerald-400/20 bg-emerald-400/[0.04]" : "border-white/8 bg-white/[0.02]"}`}>
                <span className={`mt-0.5 grid h-4 w-4 shrink-0 place-items-center font-mono text-[8px] font-bold ${done ? "bg-emerald-400 text-slate-900" : active ? "bg-cyan-400 text-slate-900 animate-pulse" : "bg-white/10 text-slate-400"}`}>{done ? "✓" : s.id}</span>
                <div className="min-w-0 flex-1">
                  <div className={`truncate text-[10px] font-semibold ${active ? "text-white" : "text-slate-300"}`}>{s.label}</div>
                  {active && <div className="mt-0.5 text-[8px] leading-snug text-slate-400">{s.desc}</div>}
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      {/* Explainable AI */}
      <Section id="explain" title="EXPLAIN THE AI · IBM GRANITE" icon="🧠" tint="#a78bfa">
        <div className="flex items-baseline justify-between">
          <span className="text-[10px] font-semibold text-white">{explain.prediction}</span>
          <span className="font-mono text-[14px] font-black text-rose-300">{explain.riskPct}%</span>
        </div>
        <div className="mt-1.5 mb-2 text-[8px] font-mono uppercase tracking-widest text-slate-500">Reasons</div>
        <div className="space-y-1">
          {explain.reasons.map((r) => (
            <div key={r.label} className={`flex justify-between border px-2 py-1 font-mono text-[9px] ${r.flag ? "border-rose-400/25 bg-rose-400/[0.06] text-rose-200" : "border-white/8 bg-white/[0.02] text-slate-300"}`}>
              <span>• {r.label}</span>
              <span className="font-bold">{r.value}</span>
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-between border-t border-white/8 pt-1.5 font-mono text-[9px]">
          <span className="text-slate-500">Confidence</span>
          <span className="font-bold text-violet-300">{explain.confidence}%</span>
        </div>
      </Section>

      {/* RAG Panel */}
      <Section id="rag" title="RAG · RETRIEVED KNOWLEDGE" icon="📚" tint="#22d3ee">
        <div className="space-y-1">
          {ragSources.map((s) => (
            <div key={s.ref} className={`flex items-center justify-between border px-2 py-1.5 ${s.active ? "border-cyan-400/30 bg-cyan-400/[0.08] shadow-[0_0_8px_rgba(34,211,238,0.15)]" : "border-white/8 bg-white/[0.02]"}`}>
              <div className="min-w-0">
                <div className="truncate text-[10px] font-semibold text-white">{s.name}</div>
                <div className="font-mono text-[8px] text-slate-500">{s.ref}</div>
              </div>
              <span className={`shrink-0 rounded px-1.5 py-0.5 font-mono text-[7px] font-bold ${s.active ? "bg-cyan-400 text-slate-900" : "bg-white/10 text-slate-400"}`}>{s.status}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* Agentic AI Task Queue */}
      <Section id="queue" title="AGENTIC AI · TASK QUEUE" icon="🤖" tint="#f0abfc">
        <div className="space-y-1">
          {tasks.map((t, i) => {
            const done = (j.step?.id ?? 0) >= t.doneAt;
            const executing = (j.step?.id ?? 0) === t.doneAt - 1;
            return (
              <div key={t.label} className={`flex items-center gap-2 border px-2 py-1 transition ${done ? "border-emerald-400/25 bg-emerald-400/[0.06]" : executing ? "border-amber-400/25 bg-amber-400/[0.06]" : "border-white/8 bg-white/[0.02]"}`}>
                <span className={`grid h-4 w-4 shrink-0 place-items-center font-mono text-[8px] font-bold ${done ? "bg-emerald-400 text-slate-900" : executing ? "bg-amber-400 text-slate-900 animate-pulse" : "bg-white/10 text-slate-500"}`}>{done ? "✓" : i + 1}</span>
                <span className={`flex-1 text-[10px] ${done ? "text-emerald-200 line-through" : executing ? "text-amber-200" : "text-slate-300"}`}>{t.label}</span>
                {executing && <span className="animate-pulse text-[8px] font-mono text-amber-300">EXECUTING</span>}
              </div>
            );
          })}
        </div>
      </Section>

      {/* Before vs After */}
      <Section id="compare" title="BEFORE vs AFTER AI" icon="⚖️" tint="#20d991">
        <div className="grid grid-cols-2 gap-2">
          <div className="border border-rose-400/25 bg-rose-500/[0.08] p-2">
            <div className="mb-1 font-mono text-[8px] font-bold tracking-widest text-rose-300">WITHOUT AI</div>
            <div className="space-y-1 font-mono text-[9px]">
              <div className="flex justify-between"><span className="text-slate-400">ICU</span><span className="text-rose-200 font-bold">{before.icu}%</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Wait</span><span className="text-rose-200 font-bold">{before.wait} min</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Doctors</span><span className="text-rose-200 font-bold">{before.docs}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">ER</span><span className="text-rose-200 font-bold">{before.er}</span></div>
              <div className="flex justify-between border-t border-white/8 pt-1"><span className="text-slate-400">Mortality</span><span className="text-rose-300 font-bold">{before.mortality}%</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Survival</span><span className="text-rose-300 font-bold">{before.survival}%</span></div>
            </div>
          </div>
          <div className="border border-emerald-400/25 bg-emerald-500/[0.08] p-2">
            <div className="mb-1 font-mono text-[8px] font-bold tracking-widest text-emerald-300">WITH AI ✓</div>
            <div className="space-y-1 font-mono text-[9px]">
              <div className="flex justify-between"><span className="text-slate-400">ICU</span><span className="text-emerald-200 font-bold">{after.icu}%</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Wait</span><span className="text-emerald-200 font-bold">{after.wait} min</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Doctors</span><span className="text-emerald-200 font-bold">{after.docs}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">ER</span><span className="text-emerald-200 font-bold">{after.er}</span></div>
              <div className="flex justify-between border-t border-white/8 pt-1"><span className="text-slate-400">Mortality</span><span className="text-emerald-300 font-bold">{after.mortality}%</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Survival</span><span className="text-emerald-300 font-bold">{after.survival}%</span></div>
            </div>
          </div>
        </div>
        <div className="mt-2 border border-cyan-400/20 bg-cyan-500/[0.06] p-1.5 text-center font-mono text-[8px] tracking-wide text-cyan-200">
          -22% ICU · -37 min · +33% Survival
        </div>
      </Section>

      {/* Medication schedule mini */}
      <Section id="story" title="MEDICATION SCHEDULE" icon="💊" tint="#38bdf8">
        <div className="space-y-0.5">
          {MEDICATION_SCHEDULE.slice(0, 4).map((m, i) => {
            const given = (j.step?.id ?? 0) >= 4 + i;
            return (
              <div key={m.drug} className="flex items-center gap-2 py-0.5 font-mono text-[9px]">
                <span className={`h-1.5 w-1.5 rounded-full ${given ? "bg-emerald-400" : "bg-slate-600"}`} />
                <span className="w-7 text-slate-500">{m.time}</span>
                <span className="flex-1 truncate text-slate-200">{m.drug}</span>
                <span className="text-cyan-300">{m.dose}</span>
              </div>
            );
          })}
        </div>
      </Section>
    </div>
  );
}
