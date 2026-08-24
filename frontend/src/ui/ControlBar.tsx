import { CameraMode } from "../three/CameraRig";

const MODES: { id: CameraMode; label: string; hint: string }[] = [
  { id: "orbit", label: "Orbit", hint: "360 degree campus orbit" },
  { id: "walk", label: "Walk", hint: "First-person walkthrough" },
  { id: "third", label: "Third", hint: "Third-person exploration" },
  { id: "drone", label: "Drone", hint: "Free flyover camera" },
  { id: "interior", label: "Interior", hint: "Selected department cutaway" },
];

export function CameraControlBar({
  mode, selectedDepartment, showLabels, showNetwork, exporting,
  dayMode, rain,
  onMode, onToggleLabels, onToggleNetwork, onToggleDayMode, onToggleRain, onExport,
}: {
  mode: CameraMode;
  selectedDepartment: string | null;
  showLabels: boolean;
  showNetwork: boolean;
  exporting: boolean;
  dayMode: boolean;
  rain: boolean;
  onMode: (mode: CameraMode) => void;
  onToggleLabels: () => void;
  onToggleNetwork: () => void;
  onToggleDayMode: () => void;
  onToggleRain: () => void;
  onExport: () => void;
}) {
  return (
    <div className="absolute left-1/2 top-3 z-20 flex -translate-x-1/2 items-center gap-1 border border-white/10 bg-[#07111de8] p-1 shadow-2xl backdrop-blur-xl">
      <div className="mr-1 hidden border-r border-white/10 px-2 font-mono text-[8px] tracking-[0.2em] text-cyan-300 xl:block">VIEW</div>
      {MODES.map((item) => {
        const disabled = item.id === "interior" && !selectedDepartment;
        return (
          <button
            key={item.id}
            title={disabled ? "Select a department first" : item.hint}
            disabled={disabled}
            onClick={() => onMode(item.id)}
            className={`px-2.5 py-1.5 text-[10px] font-semibold transition ${mode === item.id ? "bg-cyan-400 text-slate-950" : disabled ? "cursor-not-allowed text-slate-700" : "text-slate-300 hover:bg-white/10 hover:text-white"}`}
          >
            {item.label}
          </button>
        );
      })}
      <div className="mx-1 h-5 w-px bg-white/10" />
      <button onClick={onToggleLabels} className={`px-2 py-1.5 text-[10px] font-semibold transition ${showLabels ? "bg-blue-500/25 text-blue-200" : "text-slate-400 hover:bg-white/10"}`}>
        Labels
      </button>
      <button onClick={onToggleNetwork} className={`px-2 py-1.5 text-[10px] font-semibold transition ${showNetwork ? "bg-blue-500/25 text-blue-200" : "text-slate-400 hover:bg-white/10"}`}>
        Network
      </button>
      <div className="mx-1 h-5 w-px bg-white/10" />
      <button onClick={onToggleDayMode} className={`px-2 py-1.5 text-[10px] font-semibold transition ${!dayMode ? "bg-amber-500/20 text-amber-200" : "text-slate-400 hover:bg-white/10"}`}>
        {dayMode ? "🌙 Night" : "☀️ Day"}
      </button>
      <button onClick={onToggleRain} className={`px-2 py-1.5 text-[10px] font-semibold transition ${rain ? "bg-blue-500/25 text-blue-200" : "text-slate-400 hover:bg-white/10"}`}>
        {rain ? "⛅ Clear" : "🌧️ Rain"}
      </button>
      <button onClick={onExport} disabled={exporting} className="ml-1 border-l border-white/10 px-3 py-1.5 text-[10px] font-semibold text-emerald-300 transition hover:bg-emerald-400/10 disabled:text-slate-600">
        {exporting ? "Preparing..." : "Export GLB"}
      </button>
    </div>
  );
}