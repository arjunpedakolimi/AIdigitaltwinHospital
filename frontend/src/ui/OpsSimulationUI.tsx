import { OpsSimulationState } from "../hooks/useOpsSimulation";
import { OPS_SCENARIO_LIST, OpsScenarioId } from "../data/opsSimulation";

const LEVEL: Record<string, string> = { info: "#38bdf8", warn: "#f4c849", crit: "#ff4d5e", ok: "#20d991" };
const SRC: Record<string, { chip: string; label: string }> = {
  System:    { chip: "border-slate-400/40 bg-slate-500/15 text-slate-200", label: "SYSTEM" },
  Granite:   { chip: "border-blue-400/45 bg-blue-500/15 text-blue-200", label: "IBM GRANITE" },
  RAG:       { chip: "border-cyan-400/45 bg-cyan-500/15 text-cyan-100", label: "RAG" },
  Agentic:   { chip: "border-fuchsia-400/45 bg-fuchsia-500/15 text-fuchsia-200", label: "AGENTIC AI" },
  Clinician: { chip: "border-emerald-400/45 bg-emerald-500/15 text-emerald-100", label: "CLINICIAN" },
  Biomed:    { chip: "border-amber-400/45 bg-amber-500/15 text-amber-100", label: "BIOMED" },
};

/* ─────────────── Launcher ─────────────── */
export function OpsLauncher({ onLaunch, onClose }: { onLaunch: (id: OpsScenarioId) => void; onClose: () => void }) {
  return (
    <div className="absolute inset-0 z-30 grid place-items-center bg-[#020a14]/80 p-6 backdrop-blur-sm">
      <div className="w-[min(96%,54rem)] border border-cyan-400/30 bg-[#050d17]/96 p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <div className="font-mono text-[10px] tracking-[0.24em] text-cyan-300">OPERATIONAL AI SIMULATIONS</div>
            <h2 className="mt-1 text-lg font-bold text-white">AI Making Operational Decisions</h2>
            <p className="mt-1 text-[11px] text-slate-400">
              These simulations show the AI reallocating real hospital resources — not just displaying information.
            </p>
          </div>
          <button onClick={onClose} className="grid h-7 w-7 place-items-center border border-white/15 bg-black/30 text-slate-400 hover:bg-white/10 hover:text-white">✕</button>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
          {OPS_SCENARIO_LIST.map((sc) => (
            <button
              key={sc.id}
              onClick={() => onLaunch(sc.id)}
              className="group border-2 bg-white/[0.03] p-4 text-left transition hover:scale-[1.02] hover:bg-white/[0.06]"
              style={{ borderColor: `${sc.accent}44` }}
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl">{sc.icon}</span>
                <span className="font-mono text-[8px] tracking-widest" style={{ color: sc.accent }}>{sc.duration}s</span>
              </div>
              <div className="mt-2 text-[13px] font-bold text-white">{sc.name}</div>
              <p className="mt-1 text-[10px] leading-snug text-slate-400">{sc.tagline}</p>
              <div className="mt-3 space-y-1">
                {sc.actions.slice(0, 3).map((a) => (
                  <div key={a.id} className="flex items-center gap-1.5 font-mono text-[8px] text-slate-500">
                    <span>{a.icon}</span><span className="truncate">{a.label}</span>
                  </div>
                ))}
                <div className="font-mono text-[8px]" style={{ color: sc.accent }}>+{sc.actions.length - 3} more AI actions</div>
              </div>
              <div className="mt-3 border-t border-white/8 pt-2 text-center font-mono text-[9px] font-bold tracking-widest" style={{ color: sc.accent }}>
                ▶ RUN SIMULATION
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────── Resource meters (left) ─────────────── */
function Meter({ label, used, total, unit, invert }: { label: string; used: number; total: number; unit?: string; invert?: boolean }) {
  const pct = total > 0 ? (used / total) * 100 : 0;
  const color = invert
    ? (pct > 90 ? "#ff4d5e" : pct > 75 ? "#f4c849" : "#20d991")
    : (pct < 35 ? "#ff4d5e" : pct < 60 ? "#f4c849" : "#20d991");
  return (
    <div>
      <div className="flex items-center justify-between font-mono text-[9px]">
        <span className="text-slate-400">{label}</span>
        <span style={{ color }} className="font-bold tabular-nums">{used}{unit ?? ""}<span className="text-slate-600">/{total}</span></span>
      </div>
      <div className="mt-0.5 h-1.5 overflow-hidden bg-white/8">
        <div className="h-full transition-all duration-500" style={{ width: `${Math.min(100, pct)}%`, background: color, boxShadow: `0 0 6px ${color}` }} />
      </div>
    </div>
  );
}

export function OpsResourcePanel({ sim }: { sim: OpsSimulationState }) {
  const r = sim.resources;
  const erColor = r.erLoad > 85 ? "#ff4d5e" : r.erLoad > 60 ? "#f4c849" : "#20d991";
  const waitColor = r.waitTime > 25 ? "#ff4d5e" : r.waitTime > 14 ? "#f4c849" : "#20d991";
  return (
    <div className="pointer-events-auto absolute left-4 top-16 z-20 w-[19rem] space-y-2">
      {/* header */}
      <div className="border p-3 backdrop-blur-xl" style={{ borderColor: `${sim.scenario.accent}55`, background: "#050d17f2" }}>
        <div className="flex items-center gap-2">
          <span className="text-lg">{sim.scenario.icon}</span>
          <div className="min-w-0">
            <div className="font-mono text-[8px] tracking-[0.2em]" style={{ color: sim.scenario.accent }}>OPERATIONAL SIMULATION</div>
            <div className="truncate text-[12px] font-bold text-white">{sim.scenario.name}</div>
          </div>
        </div>
      </div>

      {/* live resources */}
      <div className="border border-white/10 bg-[#050d17]/95 p-3 backdrop-blur-xl">
        <div className="mb-2 flex items-center justify-between">
          <span className="font-mono text-[9px] tracking-[0.18em] text-cyan-300">LIVE RESOURCES</span>
          <span className="flex items-center gap-1 font-mono text-[8px] text-emerald-300">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />STREAMING
          </span>
        </div>
        <div className="space-y-2">
          <Meter label="ICU Beds" used={r.icuBeds.used} total={r.icuBeds.total} invert />
          <Meter label="Ventilators" used={r.ventilators.used} total={r.ventilators.total} invert />
          <Meter label="Doctors Deployed" used={r.doctors.deployed} total={r.doctors.total} />
          <Meter label="Nurses Deployed" used={r.nurses.deployed} total={r.nurses.total} />
          <Meter label="Ambulances Active" used={r.ambulances.active} total={r.ambulances.total} />
          <Meter label="Theatres In Use" used={r.otRooms.used} total={r.otRooms.total} invert />
        </div>
        <div className="mt-2.5 grid grid-cols-2 gap-2 border-t border-white/8 pt-2.5">
          <div className="border border-white/8 bg-white/[0.03] p-2 text-center">
            <div className="font-mono text-[7px] text-slate-500">ER LOAD</div>
            <div className="font-mono text-[16px] font-black tabular-nums" style={{ color: erColor }}>{r.erLoad}%</div>
          </div>
          <div className="border border-white/8 bg-white/[0.03] p-2 text-center">
            <div className="font-mono text-[7px] text-slate-500">WAIT TIME</div>
            <div className="font-mono text-[16px] font-black tabular-nums" style={{ color: waitColor }}>{r.waitTime}m</div>
          </div>
        </div>
      </div>

      {/* Granite reasoning */}
      {sim.step.reasoning && (
        <div className="animate-[fadeIn_0.4s_ease] border border-blue-400/30 bg-blue-950/30 p-3 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[9px] tracking-[0.18em] text-blue-300">IBM GRANITE · WHY</span>
            <span className="font-mono text-[9px] font-bold text-blue-200">{sim.step.reasoning.confidence}%</span>
          </div>
          <div className="mt-1.5 text-[11px] font-bold text-white">{sim.step.reasoning.headline}</div>
          <div className="mt-2 space-y-1">
            {sim.step.reasoning.factors.map((f) => (
              <div key={f.label} className={`flex items-center justify-between border px-2 py-1 font-mono text-[9px] ${f.flag ? "border-rose-400/25 bg-rose-400/[0.07] text-rose-200" : "border-white/8 bg-white/[0.02] text-slate-300"}`}>
                <span>• {f.label}</span><span className="font-bold">{f.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* event feed */}
      <div className="border border-white/10 bg-[#050d17]/95 backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-white/8 px-3 py-1.5">
          <span className="font-mono text-[9px] tracking-[0.18em] text-cyan-300">DECISION LOG</span>
          <span className="font-mono text-[8px] text-slate-500">{sim.logs.length} EVT</span>
        </div>
        <div className="max-h-40 space-y-1.5 overflow-y-auto p-2">
          {sim.logs.slice(-4).map((l) => {
            const s = SRC[l.source];
            return (
              <div key={l.id} className="animate-[fadeIn_0.3s_ease] border-l-2 bg-white/[0.025] py-1.5 pl-2 pr-1.5" style={{ borderColor: LEVEL[l.level] }}>
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

/* ─────────────── AI action queue (right) ─────────────── */
export function OpsActionQueue({ sim }: { sim: OpsSimulationState }) {
  const doneCount = sim.actions.filter((a) => a.state === "done").length;
  return (
    <div className="pointer-events-auto absolute right-4 top-16 z-20 w-[19rem]">
      <div className="border border-fuchsia-400/30 bg-[#0a0816]/95 backdrop-blur-xl shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/8 px-3 py-2">
          <span className="font-mono text-[9px] tracking-[0.18em] text-fuchsia-300">AGENTIC AI · ACTIONS</span>
          <span className="font-mono text-[9px] font-bold text-fuchsia-200">{doneCount}/{sim.actions.length}</span>
        </div>
        <div className="space-y-1 p-2">
          {sim.actions.map((a, i) => {
            const done = a.state === "done";
            const exec = a.state === "executing";
            return (
              <div key={a.id} className={`flex items-start gap-2 border px-2 py-1.5 transition-all duration-500 ${done ? "border-emerald-400/25 bg-emerald-400/[0.07]" : exec ? "border-amber-400/35 bg-amber-400/[0.09]" : "border-white/8 bg-white/[0.02]"}`}>
                <span className={`mt-px grid h-5 w-5 shrink-0 place-items-center text-[10px] font-bold ${done ? "bg-emerald-400 text-slate-950" : exec ? "animate-pulse bg-amber-400 text-slate-950" : "bg-white/10 text-slate-500"}`}>
                  {done ? "✓" : exec ? a.icon : i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className={`text-[10px] font-semibold ${done ? "text-emerald-200" : exec ? "text-amber-100" : "text-slate-300"}`}>{a.label}</div>
                  <div className="truncate text-[8px] text-slate-500">{a.detail}</div>
                </div>
                {exec && <span className="mt-1 shrink-0 animate-pulse font-mono text-[7px] font-bold text-amber-300">RUN</span>}
              </div>
            );
          })}
        </div>
        {/* progress */}
        <div className="border-t border-white/8 px-3 py-2">
          <div className="h-1.5 overflow-hidden bg-white/10">
            <div className="h-full bg-gradient-to-r from-fuchsia-400 to-emerald-400 transition-all duration-500" style={{ width: `${(doneCount / sim.actions.length) * 100}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────── Stage banner + timeline (bottom) ─────────────── */
export function OpsTimeline({ sim }: { sim: OpsSimulationState }) {
  const tone = sim.step.banner.tone;
  const color = tone === "crit" ? "#ff4d5e" : tone === "warn" ? "#f4c849" : tone === "ok" ? "#20d991" : "#38bdf8";
  return (
    <>
      {/* banner */}
      <div className="pointer-events-none absolute left-1/2 top-3 z-20 w-[min(94%,32rem)] -translate-x-1/2">
        <div className="animate-[fadeIn_0.4s_ease] border bg-black/80 px-4 py-2.5 text-center shadow-2xl backdrop-blur-xl" style={{ borderColor: `${color}66`, boxShadow: `0 0 30px ${color}22` }}>
          <div className="font-mono text-[9px] font-bold tracking-[0.2em]" style={{ color }}>{sim.step.banner.text}</div>
          <div className="mt-0.5 text-[12px] font-bold text-white">{sim.step.title}</div>
          <div className="mt-0.5 text-[10px] leading-snug text-white/65">{sim.step.detail}</div>
        </div>
      </div>

      {/* timeline rail */}
      <div className="pointer-events-none absolute bottom-4 left-1/2 z-20 w-[min(94%,44rem)] -translate-x-1/2">
        <div className="border border-white/10 bg-[#050d17]/95 px-4 py-2.5 shadow-2xl backdrop-blur-xl">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-mono text-[9px] tracking-[0.2em]" style={{ color: sim.scenario.accent }}>{sim.scenario.name.toUpperCase()}</span>
            <span className="font-mono text-[9px] text-slate-400">{Math.round(sim.progress * 100)}%</span>
          </div>
          <div className="relative h-1 bg-white/8">
            <div className="absolute inset-y-0 left-0 transition-[width] duration-300" style={{ width: `${sim.progress * 100}%`, background: `linear-gradient(90deg, ${sim.scenario.accent}, #20d991)` }} />
            {sim.scenario.steps.map((s, i) => (
              <span key={s.id} className="absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rotate-45 border border-slate-950"
                style={{ left: `${(s.at / sim.scenario.duration) * 100}%`, background: i <= sim.stepIndex ? sim.scenario.accent : "#293747" }} />
            ))}
          </div>
          <div className="mt-2 flex gap-1">
            {sim.scenario.steps.map((s, i) => (
              <div key={s.id} className={`flex-1 border-t-2 px-0.5 pt-1 text-center ${i === sim.stepIndex ? "border-cyan-400" : i < sim.stepIndex ? "border-emerald-400/60" : "border-white/10"}`}>
                <div className={`truncate font-mono text-[7px] ${i === sim.stepIndex ? "text-cyan-100" : i < sim.stepIndex ? "text-emerald-300/70" : "text-slate-600"}`}>
                  {s.title.split(" ").slice(0, 2).join(" ").toUpperCase()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

/* ─────────────── Outcome card ─────────────── */
export function OpsOutcome({ sim, onReplay, onExit }: { sim: OpsSimulationState; onReplay: () => void; onExit: () => void }) {
  if (!sim.finished) return null;
  const o = sim.scenario.outcome;
  return (
    <div className="absolute inset-0 z-30 grid place-items-center overflow-y-auto bg-slate-950/60 py-6 backdrop-blur-[2px]">
      <div className="w-[min(94%,38rem)] animate-[fadeIn_0.6s_ease] border border-emerald-400/40 bg-[#050d17]/97 p-6 shadow-2xl shadow-emerald-500/20">
        <div className="flex items-center gap-3 border-b border-white/10 pb-3">
          <div className="grid h-12 w-12 place-items-center border border-emerald-300/40 bg-emerald-400/10 text-xl text-emerald-300">✓</div>
          <div>
            <div className="font-mono text-[9px] tracking-[0.2em] text-emerald-300">SIMULATION COMPLETE</div>
            <h2 className="text-lg font-bold text-white">{o.headline}</h2>
            <div className="font-mono text-[9px] text-slate-400">{sim.scenario.icon} {sim.scenario.name}</div>
          </div>
        </div>

        {/* AI actions taken */}
        <div className="mt-4">
          <div className="mb-2 font-mono text-[9px] tracking-[0.18em] text-fuchsia-300">AI DECISIONS EXECUTED</div>
          <div className="space-y-1.5">
            {o.lines.map((l) => (
              <div key={l} className="flex items-center gap-2 border border-emerald-400/20 bg-emerald-400/[0.06] px-3 py-1.5 text-[11px] text-emerald-100">
                <span className="text-emerald-300">✔</span>{l}
              </div>
            ))}
          </div>
        </div>

        {/* before / after */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="border border-rose-400/25 bg-rose-500/[0.08] p-3">
            <div className="mb-2 font-mono text-[8px] font-bold tracking-widest text-rose-300">BEFORE AI</div>
            <div className="space-y-1.5">
              {o.before.map((b) => (
                <div key={b.label} className="flex justify-between font-mono text-[10px]">
                  <span className="text-slate-400">{b.label}</span><span className="font-bold text-rose-200">{b.value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="border border-emerald-400/25 bg-emerald-500/[0.08] p-3">
            <div className="mb-2 font-mono text-[8px] font-bold tracking-widest text-emerald-300">AFTER AI ✓</div>
            <div className="space-y-1.5">
              {o.after.map((a) => (
                <div key={a.label} className="flex justify-between font-mono text-[10px]">
                  <span className="text-slate-400">{a.label}</span><span className="font-bold text-emerald-200">{a.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 border border-cyan-400/25 bg-cyan-500/[0.07] p-2.5 text-center">
          <div className="font-mono text-[9px] tracking-[0.16em] text-cyan-200">
            AI MADE {sim.actions.length} OPERATIONAL DECISIONS AUTONOMOUSLY
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <button onClick={onReplay} className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 py-2 text-[11px] font-bold text-white transition hover:brightness-110">Run another simulation</button>
          <button onClick={onExit} className="flex-1 border border-white/15 bg-white/5 py-2 text-[11px] font-semibold text-slate-300 transition hover:bg-white/10">Back to campus</button>
        </div>
      </div>
    </div>
  );
}
