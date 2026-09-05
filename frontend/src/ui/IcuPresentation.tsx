import { IcuDemoState } from "../hooks/useIcuDemo";
import { ICU_AGENT_ACTIONS, ICU_DEMO_DURATION, ICU_DEMO_STAGES, ICU_RAG_SOURCES, OPERABLE_META } from "../data/icuDemo";
import { RISK_META } from "../data/patientJourney";
import { EcgMonitor } from "./PatientJourney";

const LEVEL_COLOR: Record<string, string> = { info: "#38bdf8", warn: "#f4c849", crit: "#ff4d5e", ok: "#20d991" };
const SOURCE_STYLE = {
  System: "border-slate-400/35 bg-slate-500/15 text-slate-200",
  Granite: "border-blue-400/40 bg-blue-500/15 text-blue-200",
  RAG: "border-cyan-400/40 bg-cyan-500/15 text-cyan-100",
  Agentic: "border-fuchsia-400/40 bg-fuchsia-500/15 text-fuchsia-200",
  Clinician: "border-emerald-400/40 bg-emerald-500/15 text-emerald-100",
};

function Vital({ label, value, unit, accent, alert }: { label: string; value: string | number; unit?: string; accent?: string; alert?: boolean }) {
  return (
    <div className={`border p-2 ${alert ? "border-rose-400/35 bg-rose-400/[0.06]" : "border-white/8 bg-white/[0.025]"}`}>
      <div className="font-mono text-[7px] uppercase tracking-[0.16em] text-slate-500">{label}</div>
      <div className="mt-0.5 flex items-baseline gap-1"><span className="font-mono text-[15px] font-bold leading-none" style={{ color: accent ?? "#e5eef2" }}>{value}</span>{unit && <span className="font-mono text-[8px] text-slate-500">{unit}</span>}</div>
    </div>
  );
}

export function IcuDemoPanel({ demo }: { demo: IcuDemoState }) {
  const stage = demo.stage;
  const meta = RISK_META[demo.risk];
  const v = demo.vitals;
  const selected = !demo.awaitingBedSelection;
  const ICU04_PATIENT = demo.patient;
  const showGranite = stage.id >= 5;
  const showRag = stage.id >= 6;
  const showAgentic = stage.id >= 7;

  return (
    <aside className="flex w-[22rem] shrink-0 flex-col overflow-y-auto border-l border-white/5 bg-[#060d16]/95 backdrop-blur-xl">
      <div className="relative overflow-hidden border-b border-white/5 p-4">
        <div className="absolute -right-8 -top-9 h-32 w-32 rounded-full blur-3xl" style={{ background: meta.color, opacity: 0.18 }} />
        <div className="relative">
          <div className="flex items-center justify-between">
            <div className="font-mono text-[8px] tracking-[0.2em] text-cyan-300">ICU-A / PRODUCTION DEMO</div>
            <span className="flex items-center gap-1.5 border px-2 py-1 font-mono text-[8px] font-bold" style={{ borderColor: `${meta.color}66`, color: meta.color, background: `${meta.color}12` }}>
              <span className="h-1.5 w-1.5 animate-pulse rounded-full" style={{ background: meta.color }} /> {meta.label}
            </span>
          </div>
          {selected ? (
            <>
              <h2 className="mt-2 text-sm font-bold text-white">{ICU04_PATIENT.name}</h2>
              <div className="font-mono text-[10px] text-slate-400">{ICU04_PATIENT.id} · {ICU04_PATIENT.bed}</div>
              <p className="mt-2 border-l-2 border-cyan-400/40 bg-white/[0.025] px-2 py-1.5 text-[10px] leading-snug text-slate-300">{ICU04_PATIENT.diagnosis}</p>
              <div className="mt-1.5 text-[9px] text-slate-400"><span className="text-slate-500">Assigned:</span> {ICU04_PATIENT.doctor} · {ICU04_PATIENT.nurse}</div>
            </>
          ) : (
            <>
              <h2 className="mt-2 text-sm font-bold text-white">Normal ICU Operation</h2>
              <p className="mt-1 text-[10px] leading-relaxed text-slate-400">12-bed critical care unit. Eleven beds are monitored and stable; ICU-12 remains emergency-ready.</p>
              <div className="mt-3 border border-cyan-400/25 bg-cyan-400/[0.06] px-3 py-2 text-center font-mono text-[9px] tracking-[0.14em] text-cyan-100">SELECT ICU-04 IN THE 3D SCENE</div>
              <div className="mt-4 border border-white/5 bg-black/20 p-2">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-mono text-[8px] tracking-[0.18em] text-slate-400">ARCHITECTURAL CONCEPT · AI GENERATED</span>
                  <span className="font-mono text-[7px] text-cyan-400/60">OPENAI · 8K</span>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  <div className="group relative overflow-hidden border border-white/10 bg-black/40">
                    <img src="/images/icu-ward-overview.jpg" alt="ICU Ward Overview - Clean consistent layout with 12 beds" className="h-32 w-full object-cover transition duration-700 group-hover:scale-[1.02]" />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-2 py-1.5">
                      <div className="font-mono text-[7px] tracking-widest text-cyan-200">WARD OVERVIEW · 12-BED CONSISTENT LAYOUT</div>
                      <div className="text-[8px] font-medium text-white">Two rows · Central corridor · Glass partitions</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="group relative overflow-hidden border border-white/10 bg-black/40">
                      <img src="/images/icu-bed-station.jpg" alt="ICU Bed Station Detail" className="h-24 w-full object-cover transition duration-700 group-hover:scale-[1.02]" />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-1.5 py-1">
                        <div className="font-mono text-[6px] tracking-widest text-cyan-200">BED STATION</div>
                        <div className="text-[7px] font-medium text-white">Headwall · Monitor · Ventilator</div>
                      </div>
                    </div>
                    <div className="group relative overflow-hidden border border-white/10 bg-black/40">
                      <img src="/images/icu-architecture-plan.jpg" alt="ICU Architectural Floor Plan" className="h-24 w-full object-cover transition duration-700 group-hover:scale-[1.02]" />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-1.5 py-1">
                        <div className="font-mono text-[6px] tracking-widest text-cyan-200">FLOOR PLAN</div>
                        <div className="text-[7px] font-medium text-white">Clean layout · Zoned workflow</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-2 border-t border-white/5 pt-2 font-mono text-[7px] text-slate-500">
                  <span className="h-1 w-1 rounded-full bg-emerald-400" /> PBR materials · Ray traced · Consistent design system
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {selected && (
        <>
          <div className="border-b border-white/5 p-4">
            <div className="mb-2 grid grid-cols-3 gap-1.5 font-mono text-[8px]">
              {[["AGE", ICU04_PATIENT.age], ["BLOOD", ICU04_PATIENT.bloodGroup], ["ADMIT", "08:42"], ["DOCTOR", "DR CHEN"], ["NURSE", "ASHA RN"], ["ALLERGY", ICU04_PATIENT.allergies]].map(([k, value]) => (
                <div key={String(k)} className="border border-white/8 bg-white/[0.025] px-1.5 py-1"><div className="text-[6px] text-slate-500">{k}</div><div className="truncate text-slate-200">{value}</div></div>
              ))}
            </div>
            <div className="space-y-1.5 text-[9px] leading-snug">
              <div className="border-l-2 border-blue-400/50 bg-blue-500/[0.04] px-2 py-1.5"><span className="font-mono text-blue-300">CT SCAN</span><p className="mt-0.5 text-slate-400">{ICU04_PATIENT.ct}</p></div>
              <div className="border-l-2 border-cyan-400/50 bg-cyan-500/[0.04] px-2 py-1.5"><span className="font-mono text-cyan-300">LAB RESULTS</span><p className="mt-0.5 text-slate-400">{ICU04_PATIENT.labs}</p></div>
              <div className="border-l-2 border-white/20 bg-white/[0.025] px-2 py-1.5"><span className="font-mono text-slate-300">MEDICAL HISTORY</span><p className="mt-0.5 text-slate-400">{ICU04_PATIENT.history}</p></div>
            </div>
          </div>

          <div className="border-b border-white/5 p-4">
            <div className="mb-1.5 flex items-center justify-between"><span className="font-mono text-[9px] tracking-[0.16em] text-slate-400">LIVE TELEMETRY · ICU-04</span><span className="font-mono text-[8px]" style={{ color: meta.color }}>NEWS {v.news}</span></div>

{demo.mlRisk && (
  <div className="mt-3 border border-rose-400/30 bg-rose-500/[0.06] p-3">
    <div className="flex items-center justify-between">
      <span className="font-mono text-[9px] tracking-[0.18em] text-cyan-300">
        ML PATIENT RISK
      </span>

      <span className="font-mono text-[8px] text-emerald-300">
        LIVE MODEL
      </span>
    </div>

    <div className="mt-2 flex items-end justify-between">
      <div>
        <div className="font-mono text-[22px] font-black text-rose-300">
          {demo.mlRisk.risk_level}
        </div>

        <div className="font-mono text-[8px] text-slate-400">
          AI-estimated patient deterioration risk
        </div>
      </div>

      <div className="text-right">
        <div className="font-mono text-[22px] font-black text-white">
          {demo.mlRisk.risk_probability.toFixed(1)}%
        </div>

        <div className="font-mono text-[8px] text-slate-500">
          MODEL PROBABILITY
        </div>
  {demo.mlRisk.risk_level === "HIGH" && (
  <div className="mt-3 border border-rose-500/50 bg-rose-500/[0.10] p-2">
    <div className="font-mono text-[9px] font-bold tracking-[0.14em] text-rose-300">
      🚨 CRITICAL ML ALERT
    </div>

    <div className="mt-1 font-mono text-[10px] font-bold text-white">
      HIGH RISK — {demo.mlRisk.risk_probability.toFixed(1)}%
    </div>

   <div className="mt-1 text-[9px] leading-relaxed text-rose-200">
  Immediate clinical review required for {demo.selectedBed}.
</div>

<div className="mt-2 border-t border-rose-400/20 pt-2 font-mono text-[8px] text-slate-300">
  Trigger:
  <span className="ml-1 text-rose-200">
    HR {v.hr} | BP {v.sbp}/{v.dbp} | SpO₂ {v.spo2}% | RR {v.rr}/min
  </span>
</div>   

  </div>
)}
      </div>
    </div>

    <div className="mt-3 border border-cyan-400/20 bg-cyan-400/[0.04] p-2">
      <div className="font-mono text-[8px] tracking-[0.14em] text-cyan-300">
        MISTRAL AI EXPLANATION
      </div>

      <p className="mt-1 whitespace-pre-line text-[9px] leading-relaxed text-slate-300">
        {demo.mlRisk.explanation}
      </p>
    </div>
  </div>
)}

<div className="border border-white/8 bg-black/50">
  <EcgMonitor
    hr={v.hr}
    amplitude={
      demo.risk === "critical"
        ? 1.1
        : demo.risk === "high"
          ? 0.84
          : 0.62
    }
    color={meta.color}
  />
</div>
            <div className="border border-white/8 bg-black/50"><EcgMonitor hr={v.hr} amplitude={demo.risk === "critical" ? 1.1 : demo.risk === "high" ? 0.84 : 0.62} color={meta.color} /></div>
            <div className="mt-2 grid grid-cols-3 gap-1.5">
              <Vital label="Heart Rate" value={v.hr} unit="bpm" accent={meta.color} alert={v.hr > 120} />
              <Vital label="BP" value={`${v.sbp}/${v.dbp}`} unit="mmHg" alert={v.sbp < 95} />
              <Vital label="SpO₂" value={v.spo2} unit="%" accent={v.spo2 < 92 ? "#ff8a3d" : "#20d991"} alert={v.spo2 < 92} />
              <Vital label="Resp Rate" value={v.rr} unit="/min" alert={v.rr > 24} />
              <Vital label="Temperature" value={v.temp} unit="°C" alert={v.temp > 38} />
              <Vital label="Oxygen" value={v.o2} unit="L/min" />
            </div>
            <div className="mt-1.5 grid grid-cols-2 gap-1.5"><Vital label="Ventilator Status" value={v.vent} /><Vital label="Medication" value="IV antibiotic" /></div>
            <div className="mt-1 border border-white/8 bg-white/[0.02] px-2 py-1.5 font-mono text-[8px] text-slate-400">CURRENT: <span className="text-cyan-200">{ICU04_PATIENT.medication}</span></div>
          </div>

          {/* live survival / mortality readout */}
          <div className="border-b border-white/5 p-4">
            <div className="mb-2 font-mono text-[9px] tracking-[0.18em] text-cyan-300">GRANITE SURVIVAL MODEL</div>
            <div className="grid grid-cols-2 gap-2">
              <div className="border border-emerald-400/25 bg-emerald-400/[0.06] p-2 text-center">
                <div className="font-mono text-lg font-black text-emerald-300">{ICU04_PATIENT.survival}%</div>
                <div className="font-mono text-[7px] tracking-widest text-emerald-200/70">SURVIVAL</div>
              </div>
              <div className="border border-rose-400/25 bg-rose-400/[0.06] p-2 text-center">
                <div className="font-mono text-lg font-black text-rose-300">{ICU04_PATIENT.mortality}%</div>
                <div className="font-mono text-[7px] tracking-widest text-rose-200/70">MORTALITY</div>
              </div>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-rose-500/25">
              <div className="h-full bg-emerald-400 transition-all duration-700" style={{ width: `${ICU04_PATIENT.survival}%` }} />
            </div>
            {stage.id >= 7 && (
              <div className="mt-2 flex items-center justify-between border px-2 py-1.5" style={{ borderColor: `${OPERABLE_META[ICU04_PATIENT.operability.verdict].color}55` }}>
                <span className="font-mono text-[8px] text-slate-400">CAN WE OPERATE?</span>
                <span className="font-mono text-[9px] font-bold" style={{ color: OPERABLE_META[ICU04_PATIENT.operability.verdict].color }}>
                  {ICU04_PATIENT.operability.verdict === "recommended" ? "YES" : ICU04_PATIENT.operability.verdict === "conditional" ? "CONDITIONAL" : "NOT ADVISED"} · {ICU04_PATIENT.operability.successRate}%
                </span>
              </div>
            )}
          </div>

          {showGranite && (
            <div className="border-b border-white/5 p-4">
              <div className="mb-2 flex items-center justify-between"><span className="font-mono text-[9px] tracking-[0.18em] text-blue-300">IBM GRANITE / CLINICAL PREDICTION</span><span className="font-mono text-[8px] text-slate-500">95% CONF</span></div>
              <div className="space-y-1.5">
                {demo.risks.map((item) => {
                  const c = item.value >= 80 ? "#ff4d5e" : item.value >= 55 ? "#ff8a3d" : item.value >= 25 ? "#f4c849" : "#20d991";
                  return <div key={item.name}><div className="flex justify-between font-mono text-[9px]"><span className="text-slate-400">{item.name}</span><span style={{ color: c }}>{item.value}%</span></div><div className="mt-0.5 h-1 bg-white/8"><div className="h-full transition-all duration-700" style={{ width: `${item.value}%`, background: c, boxShadow: `0 0 6px ${c}` }} /></div></div>;
                })}
              </div>
              {stage.id === 5 && <div className="mt-2 border border-rose-400/25 bg-rose-500/[0.06] px-2 py-1.5 font-mono text-[9px] text-rose-200">Expected deterioration: WITHIN 12 MIN · reasoning: SpO₂ decline + tachycardia + CT/lab phenotype</div>}
            </div>
          )}

          {showRag && (
            <div className="border-b border-white/5 p-4">
              <div className="mb-2 font-mono text-[9px] tracking-[0.18em] text-cyan-300">RAG CLINICAL KNOWLEDGE / GROUNDED</div>
              <div className="space-y-1">
                {ICU_RAG_SOURCES.map(([title, detail, state]) => <div key={title} className="border border-cyan-400/15 bg-cyan-500/[0.035] px-2 py-1.5"><div className="flex justify-between text-[10px] font-semibold text-slate-100"><span>{title}</span><span className="font-mono text-[8px] text-cyan-300">{state}</span></div><div className="mt-0.5 text-[9px] leading-snug text-slate-500">{detail}</div></div>)}
              </div>
            </div>
          )}

          {showAgentic && (
            <div className="border-b border-white/5 p-4">
              <div className="mb-2 font-mono text-[9px] tracking-[0.18em] text-fuchsia-300">AGENTIC AI / PRIORITY PLAN</div> 
{demo.mlRisk?.risk_level === "HIGH" && (
  <div className="mb-2 border border-rose-400/30 bg-rose-500/[0.06] p-2">
    <div className="font-mono text-[8px] tracking-[0.14em] text-rose-300">
      ⚡ ML HIGH-RISK SIGNAL
    </div>

    <div className="mt-1 font-mono text-[10px] font-bold text-white">
      {demo.mlRisk.risk_probability.toFixed(1)}% DETERIORATION PROBABILITY
    </div>

    <div className="mt-1 text-[8px] leading-relaxed text-rose-200">
      Agentic response workflow activated.
    </div>
  </div>
)}
              <div className="space-y-1">
                {ICU_AGENT_ACTIONS.map(([action, detail, doneAt], index) => {
                  const done = stage.id >= doneAt;
                  const executing = stage.id === 7 && index < 5;
                  return <div key={action} className={`flex items-start gap-2 border px-2 py-1.5 ${done ? "border-emerald-400/20 bg-emerald-400/[0.05]" : executing ? "border-amber-400/25 bg-amber-400/[0.05]" : "border-white/8 bg-white/[0.02]"}`}><span className={`grid h-4 w-4 place-items-center font-mono text-[8px] ${done ? "bg-emerald-400 text-slate-950" : executing ? "bg-amber-400 text-slate-950" : "bg-white/10 text-slate-400"}`}>{done ? "✓" : index + 1}</span><div className="min-w-0"><div className="text-[10px] font-semibold text-white">{action}</div><div className="text-[8px] text-slate-500">{detail}</div></div></div>;
                })}
              </div>
            </div>
          )}
        </>
      )}
    </aside>
  );
}

export function IcuDemoTimeline({ demo }: { demo: IcuDemoState }) {
  const activeIndex = demo.awaitingBedSelection ? 0 : demo.stageIndex;
  return (
    <div className="pointer-events-none absolute bottom-4 left-1/2 z-20 w-[49rem] max-w-[calc(100%-2rem)] -translate-x-1/2">
      <div className="border border-white/10 bg-[#06101bed] px-4 py-3 shadow-2xl backdrop-blur-xl">
        <div className="mb-2 flex items-center justify-between"><div><span className="font-mono text-[9px] tracking-[0.22em] text-cyan-300">ICU DIGITAL TWIN / ICU-04</span><span className="ml-3 text-[11px] font-semibold text-white">{demo.stage.title}</span></div><span className="font-mono text-[9px] text-slate-400">{demo.awaitingBedSelection ? "AWAITING BED SELECTION" : `${Math.round(demo.progress * 100)}%`}</span></div>
        <div className="relative h-1 bg-white/8"><div className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-emerald-400 transition-[width] duration-500" style={{ width: `${demo.awaitingBedSelection ? 3 : demo.progress * 100}%` }} />{ICU_DEMO_STAGES.map((s, i) => <span key={s.id} className="absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rotate-45 border border-slate-950" style={{ left: `${(s.at / ICU_DEMO_DURATION) * 100}%`, background: i <= activeIndex ? "#38bdf8" : "#293747" }} />)}</div>
        <div className="mt-2 flex gap-1 overflow-hidden">{ICU_DEMO_STAGES.map((s, i) => <div key={s.id} className={`flex-1 border-t-2 px-0.5 pt-1 text-center ${i === activeIndex ? "border-cyan-400" : i < activeIndex ? "border-emerald-400/60" : "border-white/10"}`}><div className={`truncate font-mono text-[7px] ${i === activeIndex ? "text-cyan-100" : i < activeIndex ? "text-emerald-300/70" : "text-slate-600"}`}>{s.id}. {s.title.split(" ")[0].toUpperCase()}</div></div>)}</div>
        <div className="mt-2 border-t border-white/5 pt-2 text-[9px] text-slate-400">{demo.stage.detail}</div>
      </div>
    </div>
  );
}

export function IcuDemoFeed({ demo }: { demo: IcuDemoState }) {
  return (
    <div className="pointer-events-none absolute left-4 top-16 z-20 w-[19rem]">
      <div className="border border-cyan-400/20 bg-[#06101bed] shadow-2xl backdrop-blur-xl"><div className="flex justify-between border-b border-white/8 px-3 py-1.5"><span className="font-mono text-[9px] tracking-[0.18em] text-cyan-300">ICU EVENT STREAM</span><span className="font-mono text-[8px] text-slate-500">{demo.logs.length} EVT</span></div><div className="max-h-48 space-y-1.5 overflow-y-auto p-2">{demo.logs.slice(-5).map((log) => <div key={log.id} className="border-l-2 bg-white/[0.025] py-1.5 pl-2" style={{ borderColor: LEVEL_COLOR[log.level] }}><div className="flex gap-1.5"><span className={`border px-1 py-px font-mono text-[7px] ${SOURCE_STYLE[log.source]}`}>{log.source.toUpperCase()}</span><span className="font-mono text-[8px] text-slate-600">{log.t}</span></div><p className="mt-0.5 text-[10px] leading-snug text-slate-300">{log.text}</p></div>)}</div></div>
    </div>
  );
}

export function IcuDemoFinal({ show, demo, onReplay, onExit }: { show: boolean; demo: IcuDemoState; onReplay: () => void; onExit: () => void }) {
  if (!show) return null;
  const p = demo.patient;
  const op = p.operability;
  const opMeta = OPERABLE_META[op.verdict];

  // small circular gauge
  const Gauge = ({ value, color, label, sub }: { value: number; color: string; label: string; sub: string }) => {
    const r = 34;
    const circ = 2 * Math.PI * r;
    return (
      <div className="flex flex-col items-center">
        <div className="relative h-24 w-24">
          <svg className="h-24 w-24 -rotate-90" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r={r} fill="none" stroke="#1e293b" strokeWidth="7" />
            <circle cx="40" cy="40" r={r} fill="none" stroke={color} strokeWidth="7" strokeLinecap="round"
              strokeDasharray={circ} strokeDashoffset={circ - (value / 100) * circ}
              style={{ transition: "stroke-dashoffset 1s ease" }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-mono text-xl font-black" style={{ color }}>{value}%</span>
          </div>
        </div>
        <div className="mt-1 font-mono text-[9px] font-bold tracking-wide" style={{ color }}>{label}</div>
        <div className="text-[8px] text-slate-500">{sub}</div>
      </div>
    );
  };

  return (
    <div className="absolute inset-0 z-30 grid place-items-center overflow-y-auto bg-slate-950/55 py-6 backdrop-blur-[2px]">
      <div className="w-[min(94%,36rem)] animate-[fadeIn_0.6s_ease] border border-cyan-400/30 bg-[#06101bf7] p-6 shadow-2xl shadow-cyan-500/10">
        {/* header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div>
            <div className="font-mono text-[9px] tracking-[0.2em] text-cyan-300">AI OUTCOME REPORT · {p.bed}</div>
            <h2 className="mt-0.5 text-lg font-bold text-white">{p.name}</h2>
            <div className="font-mono text-[9px] text-slate-400">{p.id} · {p.age}{p.sex} · {p.bloodGroup}</div>
          </div>
          <div className="grid h-12 w-12 place-items-center border border-cyan-300/40 bg-cyan-400/10 font-mono text-lg text-cyan-300">AI</div>
        </div>

        {/* survival vs mortality gauges */}
        <div className="mt-4 grid grid-cols-2 gap-4">
          <Gauge value={p.survival} color="#20d991" label="SURVIVAL" sub="probability of recovery" />
          <Gauge value={p.mortality} color="#ff4d5e" label="MORTALITY" sub="predicted risk of death" />
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-rose-500/30">
          <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500" style={{ width: `${p.survival}%` }} />
        </div>
        <div className="mt-1 flex justify-between font-mono text-[8px] text-slate-500"><span>Granite survival model · 95% conf</span><span>updated live from twin</span></div>

{/* ML patient risk + Mistral explanation */}
{demo.mlRisk && (

  <div className="mt-3 border border-rose-400/30 bg-rose-500/[0.06] p-3">

    <div className="flex items-center justify-between">
      <span className="font-mono text-[9px] tracking-[0.18em] text-cyan-300">
        ML PATIENT RISK
      </span>

      <span className="font-mono text-[8px] text-emerald-300">
        LIVE MODEL
      </span>
    </div>

    <div className="mt-2 flex items-end justify-between">
      <div>
        <div className="font-mono text-[22px] font-black text-rose-300">
          {demo.mlRisk.risk_level}
        </div>

        <div className="font-mono text-[8px] text-slate-400">
          AI-estimated patient deterioration risk
        </div>
      </div>

      <div className="text-right">
        <div className="font-mono text-[22px] font-black text-white">
          {demo.mlRisk.risk_probability}%
        </div>

        <div className="font-mono text-[8px] text-slate-500">
          MODEL PROBABILITY
        </div>
      </div>
    </div>

    <div className="mt-3 grid grid-cols-2 gap-1.5">

      <div className="border border-white/10 bg-black/20 p-2">
        <div className="font-mono text-[7px] text-slate-500">
          HEART RATE
        </div>
        <div className="font-mono text-[12px] font-bold text-white">
          {v.hr} BPM
        </div>
      </div>

      <div className="border border-white/10 bg-black/20 p-2">
        <div className="font-mono text-[7px] text-slate-500">
          SpO₂
        </div>
        <div className="font-mono text-[12px] font-bold text-white">
          {v.spo2}%
        </div>
      </div>

      <div className="border border-white/10 bg-black/20 p-2">
        <div className="font-mono text-[7px] text-slate-500">
          SYSTOLIC BP
        </div>
        <div className="font-mono text-[12px] font-bold text-white">
          {v.sbp}
        </div>
      </div>

      <div className="border border-white/10 bg-black/20 p-2">
        <div className="font-mono text-[7px] text-slate-500">
          RESPIRATORY RATE
        </div>
        <div className="font-mono text-[12px] font-bold text-white">
          {v.rr}/min
        </div>
      </div>

    </div>

    <div className="mt-3 border border-cyan-400/20 bg-cyan-400/[0.04] p-2">

      <div className="font-mono text-[8px] tracking-[0.14em] text-cyan-300">
        MISTRAL AI EXPLANATION
      </div>

      <p className="mt-1 text-[9px] leading-relaxed text-slate-300">
        {demo.mlRisk.explanation}
      </p>

      <div className="mt-2 border border-rose-400/20 bg-rose-500/[0.04] p-2">

        <div className="font-mono text-[8px] tracking-[0.12em] text-rose-300">
          RECOMMENDED RESPONSE
        </div>

        <div className="mt-1 text-[9px] leading-snug text-slate-300">
          High-risk patients should receive immediate clinician review
          and appropriate critical-care resource preparation.
        </div>

      </div>

    </div>

  </div>

)} 
       
 {/* operability verdict */}
        <div className="mt-4 border p-3" style={{ borderColor: `${opMeta.color}55`, background: `${opMeta.color}0e` }}>
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] tracking-[0.14em]" style={{ color: opMeta.color }}>OPERABILITY DECISION</span>
            <span className="flex items-center gap-1.5 rounded px-2 py-0.5 font-mono text-[10px] font-black" style={{ background: `${opMeta.color}22`, color: opMeta.color }}>
              <span className="grid h-4 w-4 place-items-center rounded-full text-[9px] text-slate-950" style={{ background: opMeta.color }}>{opMeta.icon}</span>
              {opMeta.label}
            </span>
          </div> 
          <div className="mt-2 grid grid-cols-2 gap-2">
            <div className="border border-white/10 bg-white/[0.03] p-2">
              <div className="font-mono text-[7px] text-slate-500">CAN WE OPERATE?</div>
              <div className="text-[12px] font-bold" style={{ color: opMeta.color }}>{op.verdict === "recommended" ? "YES" : op.verdict === "conditional" ? "YES · CONDITIONAL" : "NO"}</div>
            </div>
            <div className="border border-white/10 bg-white/[0.03] p-2">
              <div className="font-mono text-[7px] text-slate-500">PROCEDURE</div>
              <div className="text-[10px] font-semibold text-white leading-tight">{op.procedure}</div>
            </div>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <div className="flex items-center justify-between border border-white/10 bg-white/[0.03] px-2 py-1.5">
              <span className="font-mono text-[8px] text-slate-400">Surgical success</span>
              <span className="font-mono text-[11px] font-bold text-emerald-300">{op.successRate}%</span>
            </div>
            <div className="flex items-center justify-between border border-white/10 bg-white/[0.03] px-2 py-1.5">
              <span className="font-mono text-[8px] text-slate-400">Peri-op risk</span>
              <span className="font-mono text-[11px] font-bold text-rose-300">{op.riskScore}%</span>
            </div>
          </div>
          <p className="mt-2 text-[9px] leading-relaxed text-slate-400">{op.reasoning}</p>
          <div className="mt-2 grid grid-cols-2 gap-1.5">
            {op.factors.map((f) => (
              <div key={f.label} className="flex items-center gap-1.5 border border-white/8 bg-black/20 px-1.5 py-1">
                <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${f.good ? "bg-emerald-400" : "bg-rose-400"}`} />
                <div className="min-w-0">
                  <div className="font-mono text-[7px] text-slate-500">{f.label}</div>
                  <div className="truncate text-[9px] text-slate-200">{f.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* system confirmations */}
        <div className="mt-3 grid grid-cols-2 gap-1.5">
          {["Granite Recommendations Applied", "Digital Twin Synchronized", "Journey Completed", `${p.bed} Bed Available`].map((text) => (
            <div key={text} className="flex items-center gap-1.5 border border-emerald-400/20 bg-emerald-400/[0.05] px-2 py-1.5 text-[9px] text-emerald-100"><span className="text-emerald-300">✔</span>{text}</div>
          ))}
        </div>

        <div className="mt-4 flex gap-2">
          <button onClick={onReplay} className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 py-2 text-[11px] font-semibold text-white transition hover:brightness-110">Inspect another patient</button>
          <button onClick={onExit} className="flex-1 border border-white/15 bg-white/5 py-2 text-[11px] font-semibold text-slate-300 transition hover:bg-white/10">Back to campus</button>
        </div>
      </div>
    </div>
  );
}
