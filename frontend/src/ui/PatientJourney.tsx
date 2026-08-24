import { useEffect, useRef } from "react";
import { PatientJourneyState } from "../hooks/usePatientJourney";
import {
  JOURNEY, JOURNEY_DURATION, MEDICATION_SCHEDULE, PATIENT, RISK_META,
} from "../data/patientJourney";

/* ------------------------- Animated ECG waveform ------------------------- */
export function EcgMonitor({ hr, amplitude, color }: { hr: number; amplitude: number; color: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const raf = useRef<number | null>(null);
  const dataRef = useRef<number[]>([]);
  const phase = useRef(0);
  const params = useRef({ hr, amplitude, color });
  params.current = { hr, amplitude, color };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const W = (canvas.width = canvas.clientWidth * 2);
    const H = (canvas.height = canvas.clientHeight * 2);
    if (dataRef.current.length === 0) dataRef.current = new Array(Math.floor(W / 2)).fill(0);

    // PQRST synthesis
    const beat = (t: number, amp: number) => {
      const p = (x: number, c: number, w: number) => Math.exp(-Math.pow((x - c) / w, 2));
      return (
        (0.12 * p(t, 0.16, 0.028) -      // P
          0.13 * p(t, 0.30, 0.011) +      // Q
          1.0 * p(t, 0.33, 0.010) -       // R
          0.26 * p(t, 0.365, 0.013) +     // S
          0.26 * p(t, 0.56, 0.045)) *     // T
        amp
      );
    };

    const render = () => {
      const { hr: rate, amplitude: amp, color: col } = params.current;
      const cycle = 60 / Math.max(40, rate); // seconds per beat
      phase.current += 1 / 60 / cycle;
      if (phase.current > 1) phase.current -= 1;

      dataRef.current.push(beat(phase.current, amp));
      dataRef.current.shift();

      ctx.clearRect(0, 0, W, H);
      // grid
      ctx.strokeStyle = "rgba(56,189,248,0.09)";
      ctx.lineWidth = 1;
      for (let x = 0; x < W; x += 24) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
      for (let y = 0; y < H; y += 24) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

      // trace
      ctx.beginPath();
      ctx.strokeStyle = col;
      ctx.lineWidth = 3;
      ctx.shadowBlur = 12;
      ctx.shadowColor = col;
      const mid = H * 0.58;
      dataRef.current.forEach((v, i) => {
        const x = (i / dataRef.current.length) * W;
        const y = mid - v * H * 0.42;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.shadowBlur = 0;

      // leading dot
      const last = dataRef.current[dataRef.current.length - 1];
      ctx.beginPath();
      ctx.fillStyle = "#ffffff";
      ctx.arc(W - 3, mid - last * H * 0.42, 4, 0, Math.PI * 2);
      ctx.fill();

      raf.current = requestAnimationFrame(render);
    };
    raf.current = requestAnimationFrame(render);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, []);

  return <canvas ref={canvasRef} className="h-16 w-full" />;
}

/* ---------------------------- Vital tile ---------------------------- */
function Vital({ label, value, unit, color, warn }: { label: string; value: string | number; unit?: string; color?: string; warn?: boolean }) {
  return (
    <div className={`border p-2 ${warn ? "border-rose-500/40 bg-rose-500/[0.07]" : "border-white/8 bg-white/[0.03]"}`}>
      <div className="font-mono text-[8px] uppercase tracking-[0.16em] text-slate-500">{label}</div>
      <div className="mt-0.5 flex items-baseline gap-1">
        <span className="font-mono text-base font-bold leading-none" style={{ color: color ?? "#e2e8f0" }}>{value}</span>
        {unit && <span className="font-mono text-[8px] text-slate-500">{unit}</span>}
      </div>
    </div>
  );
}

/* --------------------- Right-hand patient twin panel --------------------- */
export function PatientPanel({ j }: { j: PatientJourneyState }) {
  const meta = RISK_META[j.risk];
  const v = j.vitals;
  const stepId = j.step?.id ?? 1;

  return (
    <aside className="flex w-[21rem] shrink-0 flex-col overflow-y-auto border-l border-white/5 bg-[#060d16]/95 backdrop-blur-xl">
      {/* patient identity */}
      <div className="relative overflow-hidden border-b border-white/5 p-4">
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-25 blur-3xl" style={{ background: meta.color }} />
        <div className="relative">
          <div className="flex items-start justify-between">
            <div>
              <div className="font-mono text-[8px] tracking-[0.22em] text-cyan-400">PATIENT DIGITAL TWIN</div>
              <h2 className="mt-1 text-sm font-bold text-white">{PATIENT.name}</h2>
              <div className="font-mono text-[10px] text-slate-400">{PATIENT.id}</div>
            </div>
            <span className="flex items-center gap-1.5 border px-2 py-1 font-mono text-[9px] font-bold"
              style={{ borderColor: `${meta.color}66`, background: `${meta.color}1a`, color: meta.color }}>
              {meta.dot} {meta.label}
            </span>
          </div>
          <div className="mt-3 grid grid-cols-4 gap-1.5 font-mono text-[9px]">
            {[["AGE", `${PATIENT.age}`], ["SEX", PATIENT.sex], ["BLOOD", PATIENT.bloodGroup], ["NEWS", String(v.news)]].map(([k, val]) => (
              <div key={k} className="border border-white/8 bg-white/[0.03] px-1.5 py-1">
                <div className="text-[7px] text-slate-500">{k}</div>
                <div className="text-slate-200">{val}</div>
              </div>
            ))}
          </div>
          <div className="mt-2 border-l-2 border-cyan-400/40 bg-white/[0.02] px-2 py-1.5 text-[10px] leading-snug text-slate-400">
            {PATIENT.admitted}
            <div className="mt-0.5 text-rose-300/80">Allergy: {PATIENT.allergies}</div>
          </div>
        </div>
      </div>

      {/* ECG + vitals */}
      <div className="border-b border-white/5 p-4">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="font-mono text-[9px] tracking-[0.18em] text-slate-400">ECG · LEAD II</span>
          <span className="flex items-center gap-1.5 font-mono text-[9px]" style={{ color: meta.color }}>
            <span className="h-1.5 w-1.5 animate-pulse rounded-full" style={{ background: meta.color }} />
            {v.hr} BPM
          </span>
        </div>
        <div className="border border-white/8 bg-black/50">
          <EcgMonitor hr={v.hr} amplitude={j.ecgAmplitude} color={meta.color} />
        </div>
        <div className="mt-2 grid grid-cols-3 gap-1.5">
          <Vital label="Heart Rate" value={v.hr} unit="bpm" color={meta.color} warn={v.hr > 120} />
          <Vital label="Blood Press" value={`${v.sbp}/${v.dbp}`} unit="mmHg" warn={v.sbp < 95} />
          <Vital label="SpO₂" value={v.spo2} unit="%" color={v.spo2 < 92 ? "#ff8a3d" : "#20d991"} warn={v.spo2 < 92} />
          <Vital label="Resp Rate" value={v.rr} unit="/min" warn={v.rr > 24} />
          <Vital label="Temp" value={v.temp} unit="°C" warn={v.temp > 37.5} />
          <Vital label="O₂ Flow" value={v.o2} unit="L/m" />
        </div>
        <div className="mt-1.5 grid grid-cols-2 gap-1.5">
          <Vital label="Ventilator" value={v.vent} />
          <Vital label="NEWS2 Score" value={v.news} color={v.news >= 7 ? "#ff4d5e" : v.news >= 5 ? "#f4c849" : "#20d991"} warn={v.news >= 7} />
        </div>
      </div>

      {/* Granite risk predictions */}
      <div className="border-b border-white/5 p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="font-mono text-[9px] tracking-[0.18em] text-blue-300">IBM GRANITE · RISK FORECAST</span>
          <span className="font-mono text-[8px] text-slate-500">{j.risks[0]?.confidence}% conf</span>
        </div>
        <div className="space-y-1.5">
          {j.risks.map((r) => {
            const c = r.value >= 60 ? "#ff4d5e" : r.value >= 35 ? "#ff8a3d" : r.value >= 18 ? "#f4c849" : "#20d991";
            return (
              <div key={r.name}>
                <div className="flex items-center justify-between font-mono text-[9px]">
                  <span className="text-slate-400">{r.name}</span>
                  <span style={{ color: c }}>{r.value}%</span>
                </div>
                <div className="mt-0.5 h-1 overflow-hidden bg-white/8">
                  <div className="h-full transition-all duration-[900ms]" style={{ width: `${r.value}%`, background: c, boxShadow: `0 0 6px ${c}` }} />
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-2.5 flex items-center justify-between border border-white/8 bg-white/[0.03] px-2 py-1.5">
          <span className="font-mono text-[9px] text-slate-400">Expected recovery</span>
          <span className="font-mono text-[10px] font-bold text-cyan-300">{j.recoveryEta}</span>
        </div>
      </div>

      {/* Agentic recommendations */}
      {stepId >= 7 && (
        <div className="border-b border-white/5 p-4">
          <div className="mb-2 font-mono text-[9px] tracking-[0.18em] text-fuchsia-300">AGENTIC AI · PRIORITY ACTIONS</div>
          <div className="space-y-1">
            {j.recommendations.map((r) => {
              const done = r.state === "done";
              const exec = r.state === "executing";
              return (
                <div key={r.priority} className={`flex items-start gap-2 border px-2 py-1.5 transition ${done ? "border-emerald-400/25 bg-emerald-400/[0.06]" : exec ? "border-amber-400/25 bg-amber-400/[0.06]" : "border-white/8 bg-white/[0.02]"}`}>
                  <span className={`mt-px grid h-4 w-4 shrink-0 place-items-center font-mono text-[8px] font-bold ${done ? "bg-emerald-400 text-slate-900" : exec ? "bg-amber-400 text-slate-900" : "bg-white/10 text-slate-400"}`}>
                    {done ? "✓" : r.priority}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] font-semibold text-white">{r.action}</div>
                    <div className="truncate text-[9px] text-slate-500">{r.detail}</div>
                  </div>
                  {exec && <span className="mt-1 h-1.5 w-1.5 shrink-0 animate-ping rounded-full bg-amber-400" />}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* medication schedule */}
      <div className="p-4">
        <div className="mb-2 font-mono text-[9px] tracking-[0.18em] text-slate-400">MEDICATION SCHEDULE</div>
        <div className="divide-y divide-white/[0.05]">
          {MEDICATION_SCHEDULE.map((m, i) => {
            const given = stepId >= 4 + i;
            return (
              <div key={m.drug} className="flex items-center gap-2 py-1.5">
                <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${given ? "bg-emerald-400" : "bg-slate-600"}`} />
                <span className="w-9 font-mono text-[9px] text-slate-500">{m.time}</span>
                <span className="min-w-0 flex-1 truncate text-[10px] text-slate-200">{m.drug}</span>
                <span className="font-mono text-[9px] text-cyan-300/80">{m.dose}</span>
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
}

/* ------------------------ Bottom journey stepper ------------------------ */
export function JourneyStepper({ j }: { j: PatientJourneyState }) {
  const active = j.stepIndex;
  return (
    <div className="pointer-events-none absolute bottom-4 left-1/2 z-20 w-[46rem] max-w-[calc(100%-2rem)] -translate-x-1/2">
      <div className="border border-white/10 bg-[#060d16]/92 px-4 py-3 shadow-2xl backdrop-blur-xl">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[9px] tracking-[0.2em] text-cyan-400">PATIENT JOURNEY</span>
            <span className="text-[11px] font-semibold text-white">
              {j.step ? `${j.step.id}. ${j.step.title}` : "Standing by"}
            </span>
          </div>
          <span className="font-mono text-[9px] text-slate-400">
            {j.step?.location} · {Math.round(j.progress * 100)}%
          </span>
        </div>

        {/* rail */}
        <div className="relative mb-2 h-1 bg-white/8">
          <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-400 to-emerald-400 transition-[width] duration-300"
            style={{ width: `${j.progress * 100}%` }} />
          {JOURNEY.map((s, i) => (
            <span key={s.id}
              className="absolute top-1/2 h-2.5 w-2.5 -translate-y-1/2 -translate-x-1/2 rotate-45 border border-slate-950"
              style={{ left: `${(s.at / JOURNEY_DURATION) * 100}%`, background: i <= active ? "#38bdf8" : "#2b3948" }} />
          ))}
        </div>

        {/* step chips */}
        <div className="flex gap-1 overflow-hidden">
          {JOURNEY.map((s, i) => (
            <div key={s.id}
              className={`flex-1 border-t-2 px-1 pt-1 text-center transition ${
                i === active ? "border-cyan-400" : i < active ? "border-emerald-400/60" : "border-white/10"
              }`}>
              <div className={`truncate font-mono text-[7px] tracking-wide ${i === active ? "text-cyan-200" : i < active ? "text-emerald-300/70" : "text-slate-600"}`}>
                {s.id}. {s.title.split(" ")[0].toUpperCase()}
              </div>
            </div>
          ))}
        </div>

        {/* current step detail bullets */}
        {j.step && (
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-0.5 border-t border-white/5 pt-2">
            {j.step.bullets.slice(0, 3).map((b) => (
              <span key={b} className="flex items-center gap-1.5 text-[9px] text-slate-400">
                <span className="h-1 w-1 rounded-full bg-cyan-400/70" />{b}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------ Step banner + ETA badge ------------------------ */
export function JourneyBanner({ j }: { j: PatientJourneyState }) {
  if (!j.step) return null;
  const meta = RISK_META[j.risk];
  return (
    <div className="pointer-events-none absolute left-1/2 top-4 z-20 flex -translate-x-1/2 flex-col items-center gap-2">
      <div key={j.step.id}
        className="animate-[fadeIn_0.45s_ease] border px-5 py-2 text-center shadow-2xl backdrop-blur-xl"
        style={{ borderColor: `${meta.color}66`, background: "#060d16e8", boxShadow: `0 0 34px ${meta.color}33` }}>
        <div className="font-mono text-[9px] tracking-[0.22em]" style={{ color: meta.color }}>{j.step.banner}</div>
        <div className="mt-0.5 text-[11px] text-slate-300">{j.step.subtitle}</div>
      </div>
      {j.stepIndex === 0 && (
        <div className="flex items-center gap-2 border border-rose-400/40 bg-rose-500/15 px-3 py-1 font-mono text-[10px] text-rose-200 backdrop-blur">
          <span className="h-1.5 w-1.5 animate-ping rounded-full bg-rose-400" />
          AMB-04 GPS LIVE · ETA {String(Math.floor(j.etaSeconds / 60)).padStart(2, "0")}:{String(j.etaSeconds % 60).padStart(2, "0")}
        </div>
      )}
    </div>
  );
}

/* --------------------------- Discharge summary --------------------------- */
export function DischargeCard({ show, onReplay, onExit }: { show: boolean; onReplay: () => void; onExit: () => void }) {
  if (!show) return null;
  return (
    <div className="absolute inset-0 z-30 grid place-items-center bg-slate-950/50 backdrop-blur-[3px]">
      <div className="animate-[fadeIn_0.6s_ease] w-[27rem] border border-emerald-400/40 bg-[#060d16]/95 p-8 text-center shadow-2xl shadow-emerald-500/20">
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center border border-emerald-300/40 bg-emerald-400/10 font-mono text-lg font-black text-emerald-300">✓</div>
        <h2 className="text-lg font-bold text-white">Patient Journey Complete</h2>
        <p className="mt-1 font-mono text-[10px] tracking-[0.16em] text-emerald-300">{PATIENT.id} · 10 / 10 STEPS</p>

        <div className="mt-5 space-y-2 text-left">
          {[
            "Patient Successfully Discharged",
            "ICU Bed Available",
            "Hospital Resources Optimized",
          ].map((t) => (
            <div key={t} className="flex items-center gap-2.5 border border-emerald-400/20 bg-emerald-400/[0.06] px-3 py-2">
              <span className="grid h-4 w-4 place-items-center bg-emerald-400 font-mono text-[9px] font-bold text-slate-900">✔</span>
              <span className="text-[11px] font-semibold text-emerald-100">{t}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 font-mono text-[9px]">
          {[["LOS", "9 days"], ["NEWS2", "13 → 0"], ["OUTCOME", "Recovered"]].map(([k, v]) => (
            <div key={k} className="border border-white/8 bg-white/[0.03] px-2 py-1.5">
              <div className="text-[7px] text-slate-500">{k}</div>
              <div className="text-slate-200">{v}</div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[10px] leading-relaxed text-slate-500">
          Digital Twin archived the complete lifecycle: arrival, triage, imaging, ICU allocation,
          telemetry, Granite prediction, Agentic care plan, treatment and recovery.
        </p>

        <div className="mt-5 flex gap-2">
          <button onClick={onReplay} className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 py-2 text-[11px] font-semibold text-white transition hover:brightness-110">
            Replay journey
          </button>
          <button onClick={onExit} className="flex-1 border border-white/15 bg-white/5 py-2 text-[11px] font-semibold text-slate-300 transition hover:bg-white/10">
            Back to campus
          </button>
        </div>
      </div>
    </div>
  );
}

/* --------------------------- Clinical event feed --------------------------- */
const SRC = {
  Granite:   { chip: "bg-blue-500/20 text-blue-300 border-blue-400/40", label: "IBM GRANITE" },
  Agentic:   { chip: "bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-400/40", label: "AGENTIC AI" },
  Clinician: { chip: "bg-emerald-500/20 text-emerald-300 border-emerald-400/40", label: "CLINICIAN" },
  System:    { chip: "bg-slate-500/20 text-slate-300 border-slate-400/40", label: "SYSTEM" },
};
const LVL: Record<string, string> = { info: "#38bdf8", warn: "#f4c849", crit: "#ff4d5e", ok: "#20d991" };

export function ClinicalFeed({ j }: { j: PatientJourneyState }) {
  return (
    <div className="pointer-events-none absolute left-4 top-16 z-20 w-[20rem]">
      <div className="border border-cyan-500/20 bg-[#060d16]/92 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-white/8 bg-white/[0.03] px-3 py-1.5">
          <span className="flex items-center gap-2 font-mono text-[9px] tracking-[0.2em] text-cyan-300">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400" /> CLINICAL EVENT FEED
          </span>
          <span className="font-mono text-[8px] text-slate-500">{j.logs.length} EVT</span>
        </div>
        <div className="max-h-56 space-y-1.5 overflow-y-auto p-2">
          {j.logs.slice(-6).map((l) => {
            const s = SRC[l.source];
            return (
              <div key={l.id} className="animate-[fadeIn_0.3s_ease] border-l-2 bg-white/[0.03] py-1.5 pl-2 pr-2" style={{ borderColor: LVL[l.level] }}>
                <div className="flex items-center gap-1.5">
                  <span className={`border px-1 py-px font-mono text-[7px] font-bold ${s.chip}`}>{s.label}</span>
                  <span className="font-mono text-[8px] text-slate-600">{l.t}</span>
                </div>
                <p className="mt-0.5 text-[10px] leading-snug text-slate-300">{l.text}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
