import { useState } from "react";

export function AiInsights({ onClose }: { onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<"risk" | "actions" | "reasoning">("risk");

  return (
    <div className="pointer-events-auto absolute right-4 top-4 z-30 w-[22rem] border border-violet-400/30 bg-[#0a0d1a]/95 shadow-2xl backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 bg-gradient-to-r from-violet-600/20 to-purple-600/20 p-3">
        <div className="flex items-center gap-2">
          <div className="text-lg">🧠</div>
          <div>
            <div className="text-[11px] font-bold text-violet-200">AI INSIGHTS</div>
            <div className="text-[9px] text-slate-400">Clinical Decision Support</div>
          </div>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white">
          ✕
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10">
        <button
          onClick={() => setActiveTab("risk")}
          className={`flex-1 py-2 text-[9px] font-bold transition ${
            activeTab === "risk"
              ? "bg-violet-500/20 text-violet-200 border-b-2 border-violet-400"
              : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
          }`}
        >
          RISK
        </button>
        <button
          onClick={() => setActiveTab("actions")}
          className={`flex-1 py-2 text-[9px] font-bold transition ${
            activeTab === "actions"
              ? "bg-violet-500/20 text-violet-200 border-b-2 border-violet-400"
              : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
          }`}
        >
          ACTIONS
        </button>
        <button
          onClick={() => setActiveTab("reasoning")}
          className={`flex-1 py-2 text-[9px] font-bold transition ${
            activeTab === "reasoning"
              ? "bg-violet-500/20 text-violet-200 border-b-2 border-violet-400"
              : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
          }`}
        >
          REASONING
        </button>
      </div>

      {/* Content */}
      <div className="p-3 max-h-[calc(100vh-12rem)] overflow-y-auto">
        {activeTab === "risk" && (
          <div className="space-y-3">
            {/* Patient Risk */}
            <div className="rounded-lg border border-rose-500/30 bg-gradient-to-br from-rose-500/10 to-red-500/10 p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-rose-200">PATIENT RISK</span>
                <span className="text-[11px] font-bold text-rose-200">95%</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-rose-500 to-red-500 transition-all duration-500"
                  style={{ width: "95%" }}
                />
              </div>
              <div className="mt-2 text-[9px] text-slate-300">
                Critical condition requiring immediate intervention
              </div>
            </div>

            {/* Vital Changes */}
            <div className="rounded-lg border border-white/10 bg-white/5 p-3">
              <div className="text-[10px] font-bold text-slate-300 mb-2">VITAL SIGN CHANGES</div>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-rose-400 mt-0.5">●</span>
                  <div className="flex-1">
                    <div className="text-[9px] text-slate-200">
                      HR increased from <span className="text-emerald-300">82</span> → <span className="text-rose-300">126 bpm</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-rose-400 mt-0.5">●</span>
                  <div className="flex-1">
                    <div className="text-[9px] text-slate-200">
                      SpO₂ dropped to <span className="text-rose-300">88%</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-amber-400 mt-0.5">●</span>
                  <div className="flex-1">
                    <div className="text-[9px] text-slate-200">
                      Lactate elevated to <span className="text-amber-300">4.2 mmol/L</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-rose-400 mt-0.5">●</span>
                  <div className="flex-1">
                    <div className="text-[9px] text-slate-200">
                      CT scan indicates <span className="text-rose-300">internal bleeding</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Vital Signs Trend */}
            <div className="rounded-lg border border-white/10 bg-white/5 p-3">
              <div className="text-[10px] font-bold text-slate-300 mb-2">TREND ANALYSIS</div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[9px]">
                  <span className="text-slate-400">MAP</span>
                  <span className="text-rose-300 font-bold">52 mmHg ↓</span>
                </div>
                <div className="flex items-center justify-between text-[9px]">
                  <span className="text-slate-400">Lactate</span>
                  <span className="text-rose-300 font-bold">4.2 mmol/L ↑</span>
                </div>
                <div className="flex items-center justify-between text-[9px]">
                  <span className="text-slate-400">Hemoglobin</span>
                  <span className="text-rose-300 font-bold">7.2 g/dL ↓</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "actions" && (
          <div className="space-y-2">
            <div className="rounded-lg border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-green-500/10 p-3">
              <div className="text-[10px] font-bold text-emerald-200 mb-2">RECOMMENDED ACTIONS</div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input type="checkbox" className="w-3.5 h-3.5 rounded" />
                  <span className="text-[9px] text-slate-200 flex-1">Reserve ICU Bed</span>
                  <span className="text-[8px] text-emerald-300">HIGH</span>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" className="w-3.5 h-3.5 rounded" />
                  <span className="text-[9px] text-slate-200 flex-1">Notify Trauma Team</span>
                  <span className="text-[8px] text-emerald-300">HIGH</span>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" className="w-3.5 h-3.5 rounded" />
                  <span className="text-[9px] text-slate-200 flex-1">Prepare Blood Units</span>
                  <span className="text-[8px] text-emerald-300">HIGH</span>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" className="w-3.5 h-3.5 rounded" />
                  <span className="text-[9px] text-slate-200 flex-1">Start Ventilator</span>
                  <span className="text-[8px] text-emerald-300">HIGH</span>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" className="w-3.5 h-3.5 rounded" />
                  <span className="text-[9px] text-slate-200 flex-1">Begin Massive Transfusion Protocol</span>
                  <span className="text-[8px] text-amber-300">MEDIUM</span>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-yellow-500/10 p-3">
              <div className="text-[10px] font-bold text-amber-200 mb-2">RESOURCE ALLOCATION</div>
              <div className="space-y-2 text-[9px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">ICU Beds Available</span>
                  <span className="text-amber-300 font-bold">2/20</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Ventilators Available</span>
                  <span className="text-amber-300 font-bold">3/20</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Blood Units O-</span>
                  <span className="text-amber-300 font-bold">4 units</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Trauma Team</span>
                  <span className="text-emerald-300 font-bold">On Call</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "reasoning" && (
          <div className="space-y-3">
            <div className="rounded-lg border border-white/10 bg-white/5 p-3">
              <div className="text-[10px] font-bold text-slate-300 mb-2">AI REASONING</div>
              <div className="space-y-2 text-[9px] text-slate-300 leading-relaxed">
                <p>
                  Based on the patient's vital signs and diagnostic results, the AI has identified a <span className="text-rose-300 font-semibold">high-risk trauma patient</span> requiring immediate intervention.
                </p>
                <p>
                  <span className="text-cyan-300 font-semibold">Key indicators:</span>
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Tachycardia (HR 126 bpm) indicates hemodynamic instability</li>
                  <li>Hypoxemia (SpO₂ 88%) suggests respiratory compromise</li>
                  <li>Elevated lactate (4.2 mmol/L) indicates tissue hypoperfusion</li>
                  <li>CT scan findings confirm internal bleeding</li>
                </ul>
                <p>
                  <span className="text-cyan-300 font-semibold">Clinical protocol:</span>
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Massive transfusion protocol activation</li>
                  <li>Immediate surgical consultation</li>
                  <li>ICU bed reservation for post-operative care</li>
                </ul>
                <p>
                  <span className="text-emerald-300 font-semibold">Recommended actions:</span> Reserve ICU bed, notify trauma team, prepare blood units, start ventilator support, and initiate massive transfusion protocol.
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 p-3">
              <div className="text-[10px] font-bold text-cyan-200 mb-2">PREDICTIVE OUTCOME</div>
              <div className="text-[9px] text-slate-300 leading-relaxed">
                With immediate intervention following the recommended protocol, the patient has a <span className="text-emerald-300 font-bold">78% probability of survival</span> with favorable neurological outcome. Delay beyond 30 minutes reduces survival probability to 45%.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-white/10 bg-gradient-to-r from-violet-600/10 to-purple-600/10 p-2">
        <div className="flex items-center justify-between text-[8px] text-slate-400">
          <span>Powered by IBM Granite</span>
          <span className="text-violet-300">Clinical Decision Support</span>
        </div>
      </div>
    </div>
  );
}
