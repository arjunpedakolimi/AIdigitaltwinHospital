import { useState } from "react";
import { IcuDemoState } from "../hooks/useIcuDemo";
import { RISK_META } from "../data/patientJourney";
import { ICU_PATIENTS, IcuAcuity } from "../data/icuDemo";

const ACUITY_COLOR: Record<IcuAcuity, string> = {
  stable: "#20d991", observation: "#f4c849", high: "#ff8a3d", critical: "#ff4d5e", ready: "#38bdf8",
};

// patient image keyed by acuity — uses the generated photorealistic patient shots
const ACUITY_PATIENT_IMG: Record<IcuAcuity, string> = {
  critical:    "/images/icu-patient-critical.jpg",
  high:        "/images/icu-patient-ventilator.jpg",
  observation: "/images/icu-patient-stable.jpg",
  stable:      "/images/icu-patient-stable.jpg",
  ready:       "/images/icu-bed-hero.jpg",
};

// The acuity image for the selected live patient changes during the journey
function patientImage(acuity: IcuAcuity): string {
  return ACUITY_PATIENT_IMG[acuity] ?? "/images/icu-patient-stable.jpg";
}

// position each bed card on a 6x2 grid overlaying the photorealistic background
// Top row = ICU-01 to ICU-06, Bottom row = ICU-07 to ICU-12
const BED_POSITIONS: Record<string, { top: string; left: string }> = {
  "ICU-01": { top: "18%", left: "5%" },
  "ICU-02": { top: "18%", left: "20%" },
  "ICU-03": { top: "18%", left: "35%" },
  "ICU-04": { top: "18%", left: "50%" },
  "ICU-05": { top: "18%", left: "65%" },
  "ICU-06": { top: "18%", left: "80%" },
  "ICU-07": { top: "56%", left: "5%" },
  "ICU-08": { top: "56%", left: "20%" },
  "ICU-09": { top: "56%", left: "35%" },
  "ICU-10": { top: "56%", left: "50%" },
  "ICU-11": { top: "56%", left: "65%" },
  "ICU-12": { top: "56%", left: "80%" },
};

// simulated live vitals for background beds
function bgVitals(bed: string) {
  const s = bed.charCodeAt(4);
  return { hr: 68 + (s * 3) % 24, spo2: 95 + (s % 4), rr: 14 + (s % 6) };
}

export function RealisticIcuViewer({ demo, onSelectBed }: { demo: IcuDemoState; onSelectBed?: (bed: string) => void }) {
  const [hoveredBed, setHoveredBed] = useState<string | null>(null);
  const meta = RISK_META[demo.risk];
  const isAlarm = demo.bedAcuity === "critical" || demo.bedAcuity === "high";
  const canSelect = demo.awaitingBedSelection;
  const patient = demo.patient;
  const selectedBed = demo.selectedBed;

  // hero background: ICU overview when selecting, patient close-up during run
  const bgImage = canSelect
    ? "/images/icu-hero-photoreal.jpg"
    : patientImage(demo.bedAcuity);

  return (
    <div className="absolute inset-0 z-10 flex flex-col bg-[#020a14]">
      {/* === FULL SCREEN PHOTOREALISTIC ICU === */}
      <div className="relative flex-1 overflow-hidden bg-black">
        {/* background hero */}
        <img
          src={bgImage}
          alt="ICU Photorealistic Interior"
          className="h-full w-full object-cover transition-all duration-1000"
          style={{ filter: isAlarm ? "saturate(1.08) contrast(1.03) brightness(0.95)" : canSelect ? "brightness(0.55)" : "brightness(0.8)" }}
        />
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/75 to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/80 via-black/35 to-transparent pointer-events-none" />
        {isAlarm && <div className="absolute inset-0 pointer-events-none border-[3px] animate-pulse" style={{ borderColor: meta.color, boxShadow: `inset 0 0 90px ${meta.color}25` }} />}

        {/* === BED SELECTION MODE: 12 clickable patient cards overlaying the ICU === */}
        {canSelect && (
          <>
            <div className="absolute left-1/2 top-3 -translate-x-1/2 z-20 pointer-events-none">
              <div className="border border-cyan-400/40 bg-black/80 px-5 py-2 text-center backdrop-blur-xl shadow-2xl">
                <div className="font-mono text-[10px] tracking-[0.24em] text-cyan-300">SELECT ANY PATIENT · 12 ICU BEDS</div>
                <div className="mt-0.5 text-[11px] text-white/80">Click a patient to begin their live Digital Twin journey</div>
              </div>
            </div>

            {/* 12 patient bed cards positioned on the ICU layout */}
            {ICU_PATIENTS.map((p) => {
              const pos = BED_POSITIONS[p.bed];
              if (!pos) return null;
              const c = ACUITY_COLOR[p.baselineAcuity];
              const isHovered = hoveredBed === p.bed;
              const v = bgVitals(p.bed);
              return (
                <button
                  key={p.bed}
                  onClick={() => onSelectBed?.(p.bed)}
                  onMouseEnter={() => setHoveredBed(p.bed)}
                  onMouseLeave={() => setHoveredBed(null)}
                  className="absolute z-10 transition-all duration-200"
                  style={{
                    top: pos.top,
                    left: pos.left,
                    width: "14.5%",
                    transform: isHovered ? "scale(1.08)" : "scale(1)",
                  }}
                >
                  <div className={`overflow-hidden border-2 bg-black/85 backdrop-blur-md shadow-2xl transition ${isHovered ? "border-cyan-400 shadow-cyan-500/30" : "border-white/20"}`}>
                    {/* patient photo */}
                    <div className="relative h-16 overflow-hidden">
                      <img src={patientImage(p.baselineAcuity)} alt={p.name} className="h-full w-full object-cover object-top" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                      {/* bed label */}
                      <div className="absolute left-1 top-1 flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: c, boxShadow: `0 0 6px ${c}` }} />
                        <span className="font-mono text-[8px] font-black tracking-[0.12em] text-white">{p.bed}</span>
                      </div>
                      {/* acuity badge */}
                      <div className="absolute right-1 top-1 rounded px-1 py-0.5 font-mono text-[6px] font-bold" style={{ background: `${c}33`, color: c }}>
                        {p.baselineAcuity.toUpperCase()}
                      </div>
                      {/* patient name */}
                      <div className="absolute inset-x-0 bottom-0 px-1.5 pb-1">
                        <div className="truncate text-[9px] font-bold text-white">{p.name}</div>
                      </div>
                    </div>
                    {/* vitals bar */}
                    <div className="flex items-center justify-between px-1.5 py-1 font-mono text-[7px]">
                      <span style={{ color: c }}>♥ {v.hr}</span>
                      <span className="text-cyan-300">O₂ {v.spo2}%</span>
                      <span className="text-slate-400">RR {v.rr}</span>
                    </div>
                    {/* survival bar */}
                    <div className="px-1.5 pb-1.5">
                      <div className="h-1 overflow-hidden rounded-full bg-rose-500/30">
                        <div className="h-full bg-emerald-400" style={{ width: `${p.survival}%` }} />
                      </div>
                      <div className="mt-0.5 flex justify-between font-mono text-[6px]">
                        <span className="text-emerald-300">{p.survival}% alive</span>
                        <span className="text-rose-300">{p.mortality}%</span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}

            {/* central nurse station label */}
            <div className="absolute left-1/2 top-[44%] -translate-x-1/2 -translate-y-1/2 pointer-events-none z-5">
              <div className="border border-cyan-300/25 bg-black/60 px-3 py-1.5 text-center backdrop-blur">
                <div className="font-mono text-[8px] tracking-[0.2em] text-cyan-200">NURSE STATION</div>
                <div className="text-[9px] text-white/60">Central monitoring · 12 live feeds</div>
              </div>
            </div>
          </>
        )}

        {/* === RUNNING DEMO: selected patient displayed over photorealistic background === */}
        {!canSelect && (
          <>
            {/* large selected patient overlay */}
            <div className="absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10 w-[min(92%,26rem)]">
              <div className="relative overflow-hidden border-2 bg-black/80 shadow-2xl backdrop-blur-xl" style={{ borderColor: `${meta.color}88` }}>
                {/* patient photo */}
                <div className="relative h-36 overflow-hidden">
                  <img src={patientImage(demo.bedAcuity)} alt={patient.name} className="h-full w-full object-cover transition-all duration-1000" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  {isAlarm && <div className="absolute inset-0 animate-pulse" style={{ boxShadow: `inset 0 0 40px ${meta.color}35` }} />}
                  {/* patient identity overlay */}
                  <div className="absolute inset-x-0 bottom-0 p-3">
                    <div className="flex items-end justify-between">
                      <div>
                        <div className="font-mono text-[8px] tracking-[0.18em] text-cyan-300">{patient.bed} · LIVE DIGITAL TWIN</div>
                        <div className="text-[15px] font-bold text-white">{patient.name}</div>
                        <div className="font-mono text-[8px] text-slate-300">{patient.id} · {patient.age}{patient.sex} · {patient.bloodGroup}</div>
                      </div>
                      <div className="flex items-center gap-1.5 border px-2 py-1 font-mono text-[9px] font-bold" style={{ borderColor: `${meta.color}88`, background: `${meta.color}22`, color: meta.color }}>
                        <span className="h-2 w-2 animate-pulse rounded-full" style={{ background: meta.color }} />
                        {demo.bedAcuity.toUpperCase()}
                      </div>
                    </div>
                  </div>
                </div>
                {/* live vitals strip */}
                <div className="grid grid-cols-5 gap-px bg-white/5">
                  {[
                    { label: "HR", value: demo.vitals.hr, unit: "bpm", color: meta.color, warn: demo.vitals.hr > 120 },
                    { label: "BP", value: `${demo.vitals.sbp}/${demo.vitals.dbp}`, unit: "", color: "#e2e8f0", warn: demo.vitals.sbp < 95 },
                    { label: "SpO₂", value: `${demo.vitals.spo2}%`, unit: "", color: demo.vitals.spo2 < 92 ? "#ff8a3d" : "#20d991", warn: demo.vitals.spo2 < 92 },
                    { label: "RR", value: demo.vitals.rr, unit: "/m", color: "#e2e8f0", warn: demo.vitals.rr > 24 },
                    { label: "NEWS", value: demo.vitals.news, unit: "", color: demo.vitals.news >= 7 ? "#ff4d5e" : "#20d991", warn: demo.vitals.news >= 7 },
                  ].map((v) => (
                    <div key={v.label} className={`p-2 text-center ${v.warn ? "bg-rose-500/10" : "bg-black/40"}`}>
                      <div className="font-mono text-[7px] text-slate-500">{v.label}</div>
                      <div className="font-mono text-[13px] font-bold" style={{ color: v.color }}>{v.value}</div>
                    </div>
                  ))}
                </div>
                {/* survival bar */}
                <div className="px-3 py-2 bg-black/50">
                  <div className="flex items-center justify-between font-mono text-[8px] mb-1">
                    <span className="text-emerald-300">SURVIVAL {patient.survival}%</span>
                    <span className="text-rose-300">MORTALITY {patient.mortality}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-rose-500/30">
                    <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-700" style={{ width: `${patient.survival}%` }} />
                  </div>
                  <div className="mt-1 text-center font-mono text-[7px] text-slate-400">{patient.diagnosis}</div>
                </div>
              </div>
            </div>

            {/* mini bed roster strip at bottom showing all 12 beds */}
            <div className="absolute bottom-14 left-1/2 -translate-x-1/2 z-10 flex gap-1 rounded bg-black/70 p-1 backdrop-blur border border-white/10">
              {ICU_PATIENTS.map((p) => {
                const c = ACUITY_COLOR[p.bed === selectedBed ? demo.bedAcuity : p.baselineAcuity];
                const isCurrent = p.bed === selectedBed;
                return (
                  <div key={p.bed} className={`relative h-8 w-10 overflow-hidden border ${isCurrent ? "border-cyan-400" : "border-white/15"} pointer-events-none`}>
                    <img src={patientImage(p.bed === selectedBed ? demo.bedAcuity : p.baselineAcuity)} alt={p.name} className="h-full w-full object-cover object-top" />
                    <div className="absolute inset-0 bg-black/40" />
                    <div className="absolute inset-x-0 bottom-0 bg-black/60 px-0.5 text-center font-mono text-[5px] text-white">{p.bed.replace("ICU-","")}</div>
                    <span className="absolute right-0.5 top-0.5 h-1.5 w-1.5 rounded-full" style={{ background: c, boxShadow: `0 0 4px ${c}` }} />
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* label */}
        <div className="absolute left-4 top-4 flex items-center gap-2 z-20">
          <span className="rounded bg-black/65 px-2 py-1 font-mono text-[9px] tracking-[0.18em] text-cyan-300 backdrop-blur border border-white/10">PHOTOREALISTIC ICU · 12 PATIENTS</span>
        </div>

        {/* stage banner */}
        {!canSelect && (
          <div className="absolute left-1/2 top-3 -translate-x-1/2 pointer-events-none w-[min(92%,28rem)] z-20">
            <div className="border bg-black/75 px-4 py-2 text-center backdrop-blur-xl shadow-2xl" style={{ borderColor: `${meta.color}55` }}>
              <div className="font-mono text-[9px] tracking-[0.2em]" style={{ color: meta.color }}>{demo.stage.title.toUpperCase()} · {demo.bedAcuity.toUpperCase()}</div>
              <div className="mt-0.5 text-[11px] text-white/90">{demo.stage.subtitle}</div>
            </div>
          </div>
        )}
      </div>

      {/* bottom spec strip */}
      <div className="border-t border-white/10 bg-[#060d16] px-4 py-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4 font-mono text-[8px] tracking-[0.12em] text-slate-400">
            <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> 12 PATIENTS LIVE</span>
            <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-cyan-400" /> RAY TRACED</span>
            <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-violet-400" /> AI GENERATED</span>
            <span className="hidden md:flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-amber-400" /> 8K PHOTOREALISTIC</span>
          </div>
          <div className="font-mono text-[8px] tracking-widest text-slate-500">
            {canSelect ? "CLICK ANY BED TO BEGIN" : `${patient.bed} · ${patient.name} · SURVIVAL ${patient.survival}%`}
          </div>
        </div>
      </div>
    </div>
  );
}
