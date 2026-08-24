import { AiLog } from "../hooks/useScenario";
import { SCENARIO, SCENARIO_DURATION, ScenarioStep } from "../data/scenario";

const TONE: Record<string, { bg: string; border: string; text: string }> = {
  info: { bg: "bg-cyan-500/15", border: "border-cyan-400/40", text: "text-cyan-100" },
  warn: { bg: "bg-amber-500/15", border: "border-amber-400/40", text: "text-amber-100" },
  crit: { bg: "bg-rose-500/20", border: "border-rose-400/50", text: "text-rose-100" },
  ok: { bg: "bg-emerald-500/15", border: "border-emerald-400/40", text: "text-emerald-100" },
};

const SRC_STYLE: Record<string, { chip: string; label: string; icon: string }> = {
  Granite: { chip: "bg-blue-500/20 text-blue-300 border-blue-400/40", label: "IBM Granite", icon: "G" },
  RAG: { chip: "bg-cyan-500/20 text-cyan-200 border-cyan-400/40", label: "RAG Assistant", icon: "R" },
  Agentic: { chip: "bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-400/40", label: "Agentic AI", icon: "A" },
  System: { chip: "bg-slate-500/20 text-slate-300 border-slate-400/40", label: "System", icon: "S" },
};

const LEVEL_DOT: Record<string, string> = {
  info: "#38bdf8",
  warn: "#f5c542",
  crit: "#ff4d5e",
  ok: "#22d38a",
};

/* Cinematic banner top-center */
export function ScenarioBanner({
  banner,
}: {
  banner: { text: string; tone: "info" | "warn" | "crit" | "ok" } | null;
}) {
  if (!banner) return null;
  const t = TONE[banner.tone];
  return (
    <div className="pointer-events-none absolute left-1/2 top-4 z-20 -translate-x-1/2">
      <div
        key={banner.text}
        className={`animate-[fadeIn_0.4s_ease] rounded-full border px-5 py-2 text-sm font-bold shadow-2xl backdrop-blur-xl ${t.bg} ${t.border} ${t.text}`}
        style={{ boxShadow: `0 0 30px ${LEVEL_DOT[banner.tone]}44` }}
      >
        {banner.text}
      </div>
    </div>
  );
}

/* AI console (bottom-left) with live logs */
export function AiConsole({ logs, phase }: { logs: AiLog[]; phase: string }) {
  return (
    <div className="pointer-events-none absolute bottom-16 left-4 z-20 w-[22rem] max-w-[calc(100%-2rem)]">
      <div className="overflow-hidden rounded-xl border border-cyan-500/25 bg-slate-950/85 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.03] px-3 py-2">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400" />
            </span>
            <span className="text-[11px] font-bold uppercase tracking-widest text-cyan-300">
              AI Command Feed
            </span>
          </div>
          <span className="rounded-full bg-white/5 px-2 py-0.5 text-[9px] uppercase tracking-widest text-slate-400">
            {phase}
          </span>
        </div>
        <div className="max-h-44 space-y-1.5 overflow-y-auto p-2.5">
          {logs.length === 0 && (
            <p className="px-1 py-3 text-center text-[11px] text-slate-500">
              Awaiting telemetry…
            </p>
          )}
          {logs.slice(-6).map((l) => {
            const s = SRC_STYLE[l.source];
            return (
              <div
                key={l.id}
                className="flex animate-[fadeIn_0.3s_ease] items-start gap-2 rounded-lg bg-white/[0.03] p-2"
              >
                <span
                  className="mt-1 h-2 w-2 shrink-0 rounded-full"
                  style={{ background: LEVEL_DOT[l.level], boxShadow: `0 0 6px ${LEVEL_DOT[l.level]}` }}
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className={`rounded border px-1.5 py-px text-[9px] font-bold ${s.chip}`}>
                      {s.icon} {s.label}
                    </span>
                    <span className="font-mono text-[9px] text-slate-500">{l.t}</span>
                  </div>
                  <p className="mt-0.5 text-[11px] leading-snug text-slate-200">{l.text}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* Timeline progress rail (bottom-center) */
export function ScenarioTimeline({
  progress,
  activeStep,
}: {
  progress: number;
  activeStep: ScenarioStep | null;
}) {
  return (
    <div className="pointer-events-none absolute bottom-4 left-1/2 z-20 w-[30rem] max-w-[calc(100%-2rem)] -translate-x-1/2">
      <div className="rounded-xl border border-white/10 bg-slate-950/80 px-4 py-2.5 backdrop-blur-xl">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-[11px] font-semibold text-white">
            {activeStep ? activeStep.title : "Scenario Ready"}
          </span>
          <span className="font-mono text-[10px] text-cyan-400">
            {Math.round(progress * 100)}%
          </span>
        </div>
        <div className="relative h-1.5 overflow-hidden rounded-full bg-white/10">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-[width] duration-200"
            style={{ width: `${progress * 100}%` }}
          />
          {SCENARIO.map((s) => (
            <span
              key={s.phase}
              className="absolute top-1/2 h-2 w-2 -translate-y-1/2 rounded-full border border-slate-900"
              style={{
                left: `${(s.at / SCENARIO_DURATION) * 100}%`,
                background: progress * SCENARIO_DURATION >= s.at ? "#38bdf8" : "#334155",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function AiDecisionPanel({ phase }: { phase: string }) {
  if (!["aiPredict", "rag", "aiRecommend", "deploy", "recovery"].includes(phase)) return null;
  const content = phase === "aiPredict" ? {
    kicker: "IBM GRANITE / PREDICTION",
    title: "Capacity breach in 18 min",
    rows: [["ICU beds", "-4"], ["Doctors", "-3"], ["Ventilators", "-2"]],
    footer: "94.2% confidence",
    color: "#ff5266",
  } : phase === "rag" ? {
    kicker: "RAG / GROUNDED RETRIEVAL",
    title: "SOP-ER-042 verified",
    rows: [["Source", "Policy store"], ["Revision", "2026.04"], ["Evidence", "5 passages"]],
    footer: "Mass-casualty overflow protocol",
    color: "#35d3ef",
  } : phase === "aiRecommend" ? {
    kicker: "AGENTIC AI / DECISION",
    title: "Resource plan approved",
    rows: [["ICU-B", "+12 beds"], ["Staff", "+16"], ["Oxygen", "+18%"]],
    footer: "Human constraints validated",
    color: "#c582ff",
  } : phase === "deploy" ? {
    kicker: "ORCHESTRATION / EXECUTING",
    title: "Six workflows in progress",
    rows: [["ICU-B", "Online"], ["Staff route", "82%"], ["Assets", "Dispatched"]],
    footer: "Twin latency 18 ms",
    color: "#2abfff",
  } : {
    kicker: "DIGITAL TWIN / OUTCOME",
    title: "Demand is rebalanced",
    rows: [["ICU", "78%"], ["ER wait", "-11 min"], ["Unmet demand", "0"]],
    footer: "Recovery trend confirmed",
    color: "#20d991",
  };
  return (
    <div className="pointer-events-none absolute right-[20.5rem] top-4 z-20 w-64 border border-white/10 bg-[#07111dec] p-4 shadow-2xl backdrop-blur-xl">
      <div className="font-mono text-[8px] tracking-[0.2em]" style={{ color: content.color }}>{content.kicker}</div>
      <div className="mt-1 text-sm font-semibold text-white">{content.title}</div>
      <div className="mt-3 space-y-1.5">
        {content.rows.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between border-b border-white/[0.06] pb-1.5 text-[10px]">
            <span className="text-slate-400">{label}</span><span className="font-mono text-slate-100">{value}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-2 text-[9px] text-slate-400">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full" style={{ background: content.color, boxShadow: `0 0 8px ${content.color}` }} />
        {content.footer}
      </div>
    </div>
  );
}

export function AiProcessingRail({ phase }: { phase: string }) {
  const stages = [
    ["Telemetry", "Receiving vitals"],
    ["Analyze", "Clinical pattern analysis"],
    ["Granite", "Risk prediction"],
    ["RAG", "Protocol retrieval"],
    ["Agentic", "Action planning"],
    ["Execute", "Resource deployment"],
    ["Recover", "Outcome monitoring"],
  ];
  const current = phase === "accident" ? 0
    : phase === "emergency" || phase === "patients" ? 1
    : phase === "icuCritical" || phase === "aiPredict" ? 2
    : phase === "rag" ? 3
    : phase === "aiRecommend" ? 4
    : phase === "deploy" ? 5
    : phase === "recovery" || phase === "stabilized" ? 6 : 0;
  return (
    <div className="pointer-events-none absolute left-1/2 top-3 z-20 w-[28rem] max-w-[42%] -translate-x-1/2 border border-white/10 bg-[#050d17e8] px-3 py-2 shadow-2xl backdrop-blur-xl">
      <div className="mb-2 flex items-center justify-between"><span className="font-mono text-[8px] tracking-[0.2em] text-cyan-300">AI CLINICAL PIPELINE</span><span className="font-mono text-[8px] text-slate-500">LIVE · 18 ms</span></div>
      <div className="flex items-start gap-1">
        {stages.map(([label, detail], index) => {
          const done = index < current;
          const active = index === current;
          return <div key={label} className="min-w-0 flex-1 text-center"><div className={`mx-auto grid h-5 w-5 place-items-center rounded-full border font-mono text-[7px] ${done ? "border-emerald-300 bg-emerald-400 text-slate-950" : active ? "animate-pulse border-cyan-200 bg-cyan-400 text-slate-950 shadow-[0_0_12px_#22d3ee]" : "border-white/15 bg-white/5 text-slate-500"}`}>{done ? "✓" : index + 1}</div><div className={`mt-1 truncate font-mono text-[7px] ${active ? "text-cyan-200" : done ? "text-emerald-300" : "text-slate-600"}`}>{label}</div>{active && <div className="mt-0.5 line-clamp-2 text-[7px] leading-tight text-slate-400">{detail}</div>}</div>;
        })}
      </div>
    </div>
  );
}

/* Big finale card */
export function StabilizedCard({ show, onReplay }: { show: boolean; onReplay: () => void }) {
  if (!show) return null;
  return (
    <div className="absolute inset-0 z-30 grid place-items-center bg-slate-950/40 backdrop-blur-[2px]">
      <div className="animate-[fadeIn_0.6s_ease] rounded-2xl border border-emerald-400/40 bg-slate-950/90 px-10 py-8 text-center shadow-2xl shadow-emerald-500/20">
        <div className="mx-auto mb-4 grid h-16 w-16 place-items-center border border-emerald-300/40 bg-emerald-400/10 font-mono text-lg font-black text-emerald-300 shadow-lg shadow-emerald-500/20">
          OK
        </div>
        <h2 className="text-xl font-bold text-white">Hospital Stabilized</h2>
        <p className="mt-2 max-w-sm text-sm text-emerald-200">
          AI Recommendations Successfully Applied
        </p>
        <p className="mx-auto mt-3 max-w-md text-xs leading-relaxed text-slate-400">
          IBM Granite predicted the shortage. RAG retrieved the verified SOP. Agentic AI opened
          ICU Block B and deployed clinical resources. Real-time Digital Twin Active.
        </p>
        <button
          onClick={onReplay}
          className="pointer-events-auto mt-5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-cyan-500/30 transition hover:brightness-110"
        >
          Replay simulation
        </button>
      </div>
    </div>
  );
}

/* Control button (play / reset) */
export function ScenarioControls({
  running,
  finished,
  onStart,
  onReset,
}: {
  running: boolean;
  finished: boolean;
  onStart: () => void;
  onReset: () => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onStart}
        disabled={running}
        className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold shadow-lg transition ${
          running
            ? "cursor-not-allowed bg-white/10 text-slate-500"
            : "bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-rose-500/30 hover:brightness-110"
        }`}
      >
        {running ? "SIMULATION RUNNING" : finished ? "RUN AGAIN" : "RUN EMERGENCY SIMULATION"}
      </button>
      {(running || finished) && (
        <button
          onClick={onReset}
          className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:bg-white/10"
        >
          Reset
        </button>
      )}
    </div>
  );
}
