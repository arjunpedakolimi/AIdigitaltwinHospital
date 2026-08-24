import { useRef, useState } from "react";
import { IcuDemoState } from "../hooks/useIcuDemo";
import { PatientJourneyState } from "../hooks/usePatientJourney";

// --------- Voice Assistant ---------
export function VoiceAssistant({ onCommand }: { onCommand: (cmd: string) => void }) {
  const [listening, setListening] = useState(false);
  const [last, setLast] = useState<string>("");
  const recogRef = useRef<any>(null);

  const start = () => {
    const SR: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { setLast("Voice not supported in this browser"); return; }
    const rec = new SR();
    rec.lang = "en-US";
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    recogRef.current = rec;
    setListening(true);
    rec.onresult = (e: any) => {
      const t = e.results[0][0].transcript.toLowerCase();
      setLast(`"${t}"`);
      if (t.includes("icu")) onCommand("icu");
      else if (t.includes("emergency")) onCommand("emergency");
      else if (t.includes("pharmacy")) onCommand("pharmacy");
      else if (t.includes("lab")) onCommand("lab");
      else if (t.includes("night")) onCommand("night");
      else if (t.includes("day")) onCommand("day");
      else onCommand(t);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    rec.start();
  };

  return (
    <div className="border border-white/10 bg-[#06101c]/95 p-3 backdrop-blur-xl shadow-xl">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[9px] tracking-[0.18em] text-violet-300">VOICE COMMAND</span>
        <span className={`h-2 w-2 rounded-full ${listening ? "bg-rose-400 animate-pulse" : "bg-slate-600"}`} />
      </div>
      <button onClick={start} className={`mt-2 w-full py-1.5 text-[10px] font-bold tracking-wide ${listening ? "bg-rose-500 text-white animate-pulse" : "bg-violet-500/20 text-violet-200 border border-violet-400/30 hover:bg-violet-500/30"}`}>
        {listening ? "LISTENING…  SAY:  Show ICU status" : "🎙  TAP & SPEAK"}
      </button>
      <div className="mt-2 font-mono text-[9px] text-slate-400 min-h-[14px]">{last && <>Heard: <span className="text-white">{last}</span></>}</div>
      <div className="mt-1 text-[8px] leading-snug text-slate-500">Try: "Show ICU status" · "Show Emergency" · "Night mode"</div>
    </div>
  );
}

// --------- Emergency Mode Button ---------
export function EmergencyModeButton({ active, onToggle }: { active: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle} className={`w-full py-2.5 text-[11px] font-black tracking-[0.18em] border shadow-lg transition ${active ? "bg-rose-600 border-rose-400 text-white animate-pulse shadow-rose-500/30" : "bg-rose-500/15 border-rose-400/40 text-rose-200 hover:bg-rose-500/25"}`}>
      {active ? "● EMERGENCY MODE ACTIVE" : "🚨  EMERGENCY MODE"}
    </button>
  );
}

// --------- Before / After AI Comparison ---------
export function BeforeAfterPanel({ compact }: { compact?: boolean }) {
  const Row = ({ label, before, after, unit }: { label: string; before: number; after: number; unit?: string }) => {
    const improved = after < before || label.includes("Survival");
    const beforeW = label.includes("Survival") ? before : Math.min(100, before);
    const afterW = label.includes("Survival") ? after : Math.min(100, after);
    return (
      <div className="space-y-1">
        <div className="flex justify-between font-mono text-[8px]"><span className="text-slate-400">{label}</span><span className="text-slate-500">{compact ? "" : "Before → After"}</span></div>
        <div className="grid grid-cols-2 gap-2">
          <div className="h-1.5 bg-rose-500/20 overflow-hidden"><div className="h-full bg-rose-400" style={{ width: `${beforeW}%` }} /></div>
          <div className="h-1.5 bg-emerald-500/20 overflow-hidden"><div className="h-full bg-emerald-400" style={{ width: `${afterW}%` }} /></div>
        </div>
        <div className="grid grid-cols-2 gap-2 font-mono text-[9px] font-bold">
          <span className="text-rose-300">{before}{unit}</span><span className="text-emerald-300">{after}{unit} {improved ? "✓" : ""}</span>
        </div>
      </div>
    );
  };
  return (
    <div className="border border-white/10 bg-[#06101c]/90 p-3 backdrop-blur-xl">
      <div className="font-mono text-[9px] tracking-[0.18em] text-cyan-300">BEFORE / AFTER AI</div>
      <div className="mt-3 space-y-3">
        <Row label="Mortality Risk" before={42} after={9} unit="%" />
        <Row label="NEWS Score" before={13} after={3} unit="" />
        <Row label="Survival" before={58} after={91} unit="%" />
        <Row label="ICU Occupancy" before={96} after={72} unit="%" />
      </div>
      <div className="mt-2 text-[8px] text-slate-500">Granite 95% conf · RAG grounded · Agentic 1:1 nursing + ICU-B</div>
    </div>
  );
}

// --------- Time Scrubber ---------
export function TimeScrubber({ progress, onSeek, label }: { progress: number; onSeek: (v: number) => void; label: string }) {
  return (
    <div className="border border-white/10 bg-black/60 p-2 backdrop-blur">
      <div className="flex justify-between font-mono text-[8px]"><span className="text-slate-400">{label}</span><span className="text-cyan-300">{Math.round(progress * 100)}%</span></div>
      <input type="range" min={0} max={100} value={Math.round(progress * 100)} onChange={e => onSeek(Number(e.target.value) / 100)} className="w-full accent-cyan-400 h-1" />
      <div className="flex justify-between font-mono text-[7px] text-slate-500"><span>Start</span><span>Discharge</span></div>
    </div>
  );
}

// --------- Live Mini Chart (SVG sparkline) ---------
export function Sparkline({ data, color, label, unit }: { data: number[]; color: string; label: string; unit?: string }) {
  if (data.length < 2) return null;
  const w = 120, h = 28, pad = 2;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * (w - pad * 2) + pad},${h - pad - ((v - min) / range) * (h - pad * 2)}`).join(" ");
  const last = data[data.length - 1];
  return (
    <div className="border border-white/8 bg-white/[0.03] p-2">
      <div className="flex justify-between font-mono text-[7px]"><span className="text-slate-500">{label}</span><span style={{ color }}>{last}{unit}</span></div>
      <svg width={w} height={h} className="mt-1 w-full">
        <polyline fill="none" stroke={color} strokeWidth={1.6} strokeLinejoin="round" strokeLinecap="round" points={pts} style={{ filter: `drop-shadow(0 0 4px ${color})` }} />
        <circle cx={(w - pad)} cy={h - pad - ((last - min) / range) * (h - pad * 2)} r={2.2} fill={color} />
      </svg>
    </div>
  );
}

// --------- Ambulance GPS Mini Map ---------
export function AmbulanceGPS({ phase, journeyPhase }: { phase: string; journeyPhase?: number }) {
  const active = phase.includes("accident") || phase.includes("emergency") || journeyPhase === 1;
  return (
    <div className="border border-white/10 bg-[#06101c]/90 p-2 backdrop-blur">
      <div className="flex justify-between font-mono text-[8px]"><span className="tracking-[0.16em] text-cyan-300">AMBULANCE GPS</span><span className={active ? "text-emerald-300" : "text-slate-500"}>{active ? "● LIVE" : "○ STANDBY"}</span></div>
      <div className="relative mt-2 h-20 overflow-hidden rounded border border-white/10 bg-[#0a1a2a]">
        {/* road */}
        <div className="absolute left-2 right-2 top-1/2 h-0.5 -translate-y-1/2 bg-slate-600" />
        <div className="absolute left-2 right-2 top-1/2 h-px -translate-y-1/2 bg-yellow-400/40" style={{ backgroundImage: "repeating-linear-gradient(90deg, #facc15 0 6px, transparent 6px 12px)" }} />
        {/* hospital icon */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[14px]">🏥</div>
        {/* moving ambulance */}
        <div className={`absolute top-1/2 -translate-y-1/2 text-[13px] transition-all duration-[3000ms] ease-linear ${active ? "left-[68%]" : "left-[6%]"}`}>🚑</div>
        {/* ETA */}
        {active && <div className="absolute left-1/2 top-1 -translate-x-1/2 rounded bg-black/70 px-1.5 py-0.5 font-mono text-[7px] text-cyan-200">ETA 00:42 · AMB-04</div>}
      </div>
      <div className="mt-1 grid grid-cols-2 gap-1 font-mono text-[7px]">
        <span className="text-slate-500">Gate → ER Bay</span><span className="text-right text-cyan-300">2.4 km · 4.2 min</span>
      </div>
    </div>
  );
}

// --------- Resource Allocation Animated ---------
export function ResourceAllocation({ demo }: { demo?: IcuDemoState | PatientJourneyState | null }) {
  // derive stage: if demo present use it, else static
  const frac = demo ? (demo as any).progress ?? 0.6 : 0.6;
  const items = [
    { label: "Doctors", icon: "🩺", before: 8, after: 14, total: 18 },
    { label: "Nurses", icon: "🧑‍⚕️", before: 12, after: 18, total: 22 },
    { label: "ICU Beds", icon: "🛏️", before: 11, after: 9, total: 12, invert: true },
    { label: "Ventilators", icon: "🌬️", before: 9, after: 7, total: 12, invert: true },
    { label: "Blood Units", icon: "🩸", before: 2, after: 6, total: 8 },
    { label: "Medicine", icon: "💊", before: 82, after: 96, total: 100, pct: true },
  ];
  return (
    <div className="border border-white/10 bg-[#06101c]/90 p-3 backdrop-blur-xl">
      <div className="font-mono text-[9px] tracking-[0.18em] text-cyan-300">RESOURCE ALLOCATION</div>
      <div className="mt-2 space-y-2">
        {items.map(it => {
          const cur = it.pct ? (frac > 0.7 ? it.after : it.before) : Math.round(it.before + (it.after - it.before) * Math.min(1, frac * 1.2));
          const pct = it.pct ? cur : (cur / it.total) * 100;
          const col = it.invert ? (pct > 85 ? "#ff4d5e" : pct > 65 ? "#f4c849" : "#20d991") : (pct < 40 ? "#ff4d5e" : "#20d991");
          return (
            <div key={it.label}>
              <div className="flex justify-between font-mono text-[8px]"><span className="text-slate-400">{it.icon} {it.label}</span><span style={{ color: col }}>{it.pct ? `${cur}%` : `${cur}/${it.total}`}</span></div>
              <div className="mt-0.5 h-1.5 bg-white/10 overflow-hidden"><div className="h-full transition-all duration-700" style={{ width: `${pct}%`, background: col, boxShadow: `0 0 6px ${col}` }} /></div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// --------- AI Confidence & Explanation Panel ---------
export function AIExplanation({ operability, survival }: { operability?: any; survival?: number }) {
  return (
    <div className="border border-violet-400/25 bg-violet-950/30 p-3 backdrop-blur">
      <div className="font-mono text-[9px] tracking-[0.18em] text-violet-300">AI CONFIDENCE & EXPLANATION</div>
      <div className="mt-2 grid grid-cols-3 gap-1.5">
        <div className="border border-violet-400/20 bg-black/30 p-2 text-center"><div className="font-mono text-[16px] font-black text-violet-300">95%</div><div className="font-mono text-[7px] text-slate-400">GRANITE CONF</div></div>
        <div className="border border-cyan-400/20 bg-black/30 p-2 text-center"><div className="font-mono text-[16px] font-black text-cyan-300">5</div><div className="font-mono text-[7px] text-slate-400">RAG SOURCES</div></div>
        <div className="border border-emerald-400/20 bg-black/30 p-2 text-center"><div className="font-mono text-[16px] font-black text-emerald-300">{survival ?? 83}%</div><div className="font-mono text-[7px] text-slate-400">SURVIVAL</div></div>
      </div>
      <div className="mt-2 space-y-1 text-[9px] leading-snug text-slate-300">
        <p><span className="text-violet-300 font-bold">Why cardiac arrest 92%?</span> SpO₂ 84→86, MAP 52, HR 142, lactate 3.1, bilateral consolidation on CT, CRP 248 — all high-risk phenotype.</p>
        <p><span className="text-cyan-300 font-bold">RAG grounded:</span> SOP-ICU-17 + ARDSnet + WHO sepsis bundle cited.</p>
        <p><span className="text-emerald-300 font-bold">Operability:</span> {operability?.verdict === "recommended" ? "Proceed — low risk." : operability?.verdict === "conditional" ? "Conditional — stabilize first." : "Defer — survival benefit too low."} Success {operability?.successRate ?? 71}% · Risk {operability?.riskScore ?? 34}%</p>
      </div>
    </div>
  );
}

// --------- Technical Architecture Diagram ---------
export function ArchitectureDiagram() {
  const steps = [
    "IoT Sensors", "FastAPI Backend", "MongoDB", "IBM Granite AI", "RAG Knowledge Base", "Agentic AI", "React Dashboard", "React Three Fiber", "3D Digital Twin",
  ];
  return (
    <div className="border border-white/10 bg-black/40 p-3 backdrop-blur">
      <div className="font-mono text-[9px] tracking-[0.18em] text-slate-300">TECHNICAL ARCHITECTURE</div>
      <div className="mt-2 flex flex-wrap items-center gap-1">
        {steps.map((s, i) => (
          <span key={s} className="flex items-center gap-1">
            <span className="rounded border border-cyan-400/30 bg-cyan-500/10 px-1.5 py-1 font-mono text-[7px] text-cyan-200">{s}</span>
            {i < steps.length - 1 && <span className="text-cyan-400/60">→</span>}
          </span>
        ))}
      </div>
      <div className="mt-2 h-px bg-gradient-to-r from-cyan-500/50 via-violet-500/40 to-emerald-500/50" />
    </div>
  );
}

// --------- Live Patient Heatmap Overlay Toggle ---------
export function HeatmapOverlay({ enabled }: { enabled: boolean }) {
  if (!enabled) return null;
  return (
    <div className="pointer-events-none absolute inset-0">
      {/* ICU heat */}
      <div className="absolute left-[42%] top-[36%] h-16 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full bg-rose-500/25 blur-[18px]" />
      <div className="absolute left-[66%] top-[38%] h-10 w-16 rounded-full bg-amber-500/20 blur-[12px]" />
      <div className="absolute left-[22%] top-[52%] h-12 w-20 rounded-full bg-emerald-500/15 blur-[14px]" />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 text-[8px] font-mono tracking-widest text-white/70 bg-black/50 px-2 py-1 backdrop-blur">● LIVE PATIENT MOVEMENT HEATMAP</div>
    </div>
  );
}
