import { useCallback, useEffect, useRef, useState } from "react";

/* ── Command interface: the Copilot can trigger anything ── */
export interface CopilotActions {
  // Navigation
  flyToDepartment: (id: string) => void;
  returnToOverview: () => void;
  setCamera: (mode: "orbit" | "cinematic" | "interior" | "drone" | "walk" | "third") => void;
  // Simulations
  runEmergency: () => void;
  runPatientJourney: () => void;
  runIcuDemo: () => void;
  runResourceAllocation: () => void;
  runMassCasualty: () => void;
  runEquipmentFailure: () => void;
  // Fleet
  toggleFleet: () => void;
  // Environment
  setNight: () => void;
  setDay: () => void;
  setRain: () => void;
  setClear: () => void;
  toggleLabels: () => void;
  toggleNetwork: () => void;
  // Queries — return data for spoken responses
  getIcuStatus: () => string;
  getEmergencyStatus: () => string;
  getVentilatorCount: () => string;
  getOxygenLevel: () => string;
  getBloodAvailability: () => string;
  getOverallStatus: () => string;
}

interface ChatEntry { role: "user" | "ai"; text: string; }

/* ── Natural language command parser ── */
function parseCommand(
  transcript: string,
  actions: CopilotActions
): { spoken: string; executed: boolean } {
  const t = transcript.toLowerCase().trim();

  /* ── Greeting ── */
  if (t.match(/hello|hi |hey|meditwin|copilot/) && t.length < 20) {
    return { spoken: "Hello. I am MediTwin AI Copilot. I can navigate the hospital, run simulations, track ambulances, or explain any department. Just ask.", executed: true };
  }

  /* ── Run Emergency Simulation ── */
  if (t.match(/run.*emergency|start.*emergency|emergency.*simulation|trigger.*emergency/)) {
    actions.runEmergency();
    return { spoken: "Starting emergency simulation. A road accident has been detected. Ambulances are being dispatched. The emergency department will turn yellow as casualties arrive. IBM Granite will predict ICU overload and Agentic AI will respond.", executed: true };
  }

  /* ── Patient Journey ── */
  if (t.match(/patient.*journey|follow.*patient|patient.*story|track.*patient/)) {
    actions.runPatientJourney();
    return { spoken: "Starting the interactive patient journey. We will follow one trauma patient from ambulance arrival through triage, CT scan, ICU admission, AI prediction, treatment, and recovery.", executed: true };
  }

  /* ── ICU Demo ── */
  if (t.match(/icu.*demo|open.*icu|icu.?04|bed.*icu|inspect.*icu|show.*icu.*bed/)) {
    actions.runIcuDemo();
    return { spoken: "Opening ICU Block A. The roof will become transparent. Click any bed to inspect the patient. Bed ICU-04 has a live AI Digital Twin with ECG, vitals, and Granite risk prediction.", executed: true };
  }

  /* ── AI Resource Allocation ── */
  if (t.match(/resource.*allocation|ai.*operations|resource.*ai|allocat/)) {
    actions.runResourceAllocation();
    return { spoken: "Starting AI resource allocation simulation. Twenty patients are arriving. IBM Granite predicts ICU overload. Watch the AI autonomously open ICU Block B, deploy doctors, and redirect ambulances.", executed: true };
  }

  /* ── Mass Casualty ── */
  if (t.match(/mass.*casualty|bus.*accident|major.*incident/)) {
    actions.runMassCasualty();
    return { spoken: "Declaring a mass casualty incident. Thirty-five patients from a bus accident are inbound. AI will prioritise critical patients, assign operation theatres, and redirect ambulances.", executed: true };
  }

  /* ── Equipment Failure ── */
  if (t.match(/equipment.*failure|ventilator.*fail|fault|breakdown/)) {
    actions.runEquipmentFailure();
    return { spoken: "Starting equipment failure simulation. Ventilator VENT-A4 has developed a fault in ICU Bed 04. IBM Granite will detect the problem, find a backup, and dispatch the biomedical team.", executed: true };
  }

  /* ── Track Ambulance / Fleet ── */
  if (t.match(/track.*ambulance|ambulance.*fleet|show.*fleet|fleet.*status|dispatch.*ambulance/)) {
    actions.toggleFleet();
    return { spoken: "Opening the live ambulance fleet operations center. Six ambulances are being tracked with real-time GPS. AMB-04 is en route to an accident with an ETA of three minutes. AI route optimization is active.", executed: true };
  }

  /* ── Show ICU / ICU Status ── */
  if (t.match(/show.*icu|icu.*status|go.*icu|zoom.*icu/) && !t.includes("demo")) {
    actions.flyToDepartment("icu");
    const status = actions.getIcuStatus();
    return { spoken: `Flying to ICU Block A. ${status}`, executed: true };
  }

  /* ── Explain ICU ── */
  if (t.match(/explain.*icu|why.*icu.*critical|icu.*critical|what.*icu/)) {
    actions.flyToDepartment("icu");
    const status = actions.getIcuStatus();
    return { spoken: `Here is the ICU explanation. ${status} Based on current admission rates, IBM Granite forecasts that ICU demand will exceed capacity. My recommendation is to activate ICU Block B and deploy additional ventilators.`, executed: true };
  }

  /* ── Emergency Department ── */
  if (t.match(/emergency.*dept|show.*emergency|go.*emergency|er |e\.r\.|trauma/)) {
    actions.flyToDepartment("emergency");
    const status = actions.getEmergencyStatus();
    return { spoken: `Flying to the Emergency Department. ${status}`, executed: true };
  }

  /* ── Pharmacy ── */
  if (t.match(/pharmacy|medicine|drug/)) {
    actions.flyToDepartment("pharmacy");
    return { spoken: "Opening the Central Pharmacy. Current stock level is 94 percent. Cold storage is at 4.1 degrees. There are 312 prescriptions dispensed today.", executed: true };
  }

  /* ── Laboratory ── */
  if (t.match(/lab|laboratory|test|sample|pathology|blood.*test/)) {
    actions.flyToDepartment("lab");
    return { spoken: "Opening the Clinical Laboratory. There are 128 tests queued with an average turnaround of 34 minutes. All 12 analyzers are online.", executed: true };
  }

  /* ── Radiology ── */
  if (t.match(/radiology|ct scan|mri|x-ray|xray|imaging/)) {
    actions.flyToDepartment("radiology");
    return { spoken: "Opening Radiology and Imaging. 186 scans completed today. MRI queue is 7 patients. All 9 systems are online with AI-assisted reporting.", executed: true };
  }

  /* ── Operation Theatre ── */
  if (t.match(/operation|surgery|surgical|theatre|ot /)) {
    actions.flyToDepartment("ot");
    return { spoken: "Opening the Operation Theatre Complex. 4 of 6 theatres are active with 17 cases today. Two theatres are on standby for emergency surgery.", executed: true };
  }

  /* ── Blood Bank ── */
  if (t.match(/blood.*bank|blood.*avail|blood.*unit|blood/)) {
    actions.flyToDepartment("blood");
    const blood = actions.getBloodAvailability();
    return { spoken: `Opening the Blood Bank. ${blood}`, executed: true };
  }

  /* ── Oxygen Plant ── */
  if (t.match(/oxygen|o2|gas.*plant/)) {
    actions.flyToDepartment("oxygen");
    const oxygen = actions.getOxygenLevel();
    return { spoken: `Opening the Oxygen Plant. ${oxygen}`, executed: true };
  }

  /* ── Ventilator count ── */
  if (t.match(/how many.*vent|ventilator.*count|vent.*count|ventilator/)) {
    const vents = actions.getVentilatorCount();
    return { spoken: `Here are the ventilator details. ${vents}`, executed: true };
  }

  /* ── Ward ── */
  if (t.match(/ward/)) {
    const wardId = t.includes("b") || t.includes("surgical") ? "wardB" : "wardA";
    actions.flyToDepartment(wardId);
    return { spoken: `Flying to ${wardId === "wardA" ? "Ward A, General Medicine" : "Ward B, Surgical Recovery"}. ${wardId === "wardA" ? "32 patients with 8 beds available." : "29 patients with 6 beds available."}`, executed: true };
  }

  /* ── Administration ── */
  if (t.match(/admin|staff|allocation|doctor.*duty/)) {
    actions.flyToDepartment("admin");
    return { spoken: "Opening Administration. 184 staff are on site with 68 doctors and 128 nurses on duty. Compliance is at 100 percent.", executed: true };
  }

  /* ── Hospital Status / Overview ── */
  if (t.match(/hospital.*status|overall.*status|status.*report|overview|summary|back.*hospital|return|home/)) {
    actions.returnToOverview();
    const status = actions.getOverallStatus();
    return { spoken: `Returning to hospital overview. ${status}`, executed: true };
  }

  /* ── Night mode ── */
  if (t.match(/night|dark mode|evening/)) {
    actions.setNight();
    return { spoken: "Switching to night mode. Exterior lights are on. Emergency signs and helipad lights are glowing.", executed: true };
  }

  /* ── Day mode ── */
  if (t.match(/day|daytime|morning|light/)) {
    actions.setDay();
    return { spoken: "Switching to daylight mode.", executed: true };
  }

  /* ── Rain ── */
  if (t.match(/rain|weather|storm/)) {
    actions.setRain();
    return { spoken: "Activating rain weather simulation.", executed: true };
  }

  /* ── Clear weather ── */
  if (t.match(/clear|stop.*rain|sunny|sunshine/)) {
    actions.setClear();
    return { spoken: "Clearing the weather.", executed: true };
  }

  /* ── Labels ── */
  if (t.match(/label|show.*name|building.*name/)) {
    actions.toggleLabels();
    return { spoken: "Toggling department labels.", executed: true };
  }

  /* ── Network ── */
  if (t.match(/network|connection|data.*line|iot/)) {
    actions.toggleNetwork();
    return { spoken: "Toggling the AI digital twin network connections.", executed: true };
  }

  /* ── What should we do / Recommendation ── */
  if (t.match(/what.*should.*we|recommend|suggestion|advice|next.*step/)) {
    return { spoken: "Based on IBM Granite analysis, I recommend the following. First, activate ICU Block B for 12 additional surge beds. Second, deploy 3 doctors from Ward B to ICU. Third, allocate 5 ventilators from biomedical storage. Fourth, redirect 2 ambulances to the partner hospital. Shall I execute this plan?", executed: true };
  }

  /* ── Help ── */
  if (t.match(/help|what can you|commands|options/)) {
    return { spoken: "I can do many things. Try saying: Show ICU status. Run emergency simulation. Track ambulance fleet. Open ICU demo. Show pharmacy. Night mode. Explain ICU. Or ask: Why is ICU critical? What should we do? How many ventilators are available?", executed: true };
  }

  /* ── Drone view ── */
  if (t.match(/drone|fly.*over|aerial|bird/)) {
    actions.setCamera("drone");
    return { spoken: "Switching to drone flyover view. Use WASD to move, Q and E to turn, R and F to change altitude.", executed: true };
  }

  /* ── Walk mode ── */
  if (t.match(/walk|first person|inside|enter/)) {
    actions.setCamera("walk");
    return { spoken: "Switching to first-person walkthrough mode. Use WASD to walk through the hospital campus.", executed: true };
  }

  /* ── Fallback ── */
  return { spoken: `I didn't understand "${transcript}". Try: Show ICU. Run emergency simulation. Track ambulance. Or ask: Why is ICU critical?`, executed: false };
}

/* ── Text-to-Speech ── */
function speak(text: string) {
  try {
    const synth = window.speechSynthesis;
    if (!synth) return;
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    utterance.volume = 0.9;
    // Try to pick a natural-sounding voice
    const voices = synth.getVoices();
    const preferred = voices.find((v) => v.name.includes("Google") && v.lang.startsWith("en")) || voices.find((v) => v.lang.startsWith("en"));
    if (preferred) utterance.voice = preferred;
    synth.speak(utterance);
  } catch { /* no-op */ }
}

export function AiCopilot({ actions }: { actions: CopilotActions }) {
  const [listening, setListening] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [chat, setChat] = useState<ChatEntry[]>([
    { role: "ai", text: "Hello, I am MediTwin AI Copilot. Tap the microphone and try: \"Show ICU status\" or \"Run emergency simulation\"." },
  ]);
  const [textInput, setTextInput] = useState("");
  const [expanded, setExpanded] = useState(false);
  const recogRef = useRef<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  // Load voices
  useEffect(() => {
    window.speechSynthesis?.getVoices();
  }, []);

  const executeCommand = useCallback((transcript: string) => {
    setProcessing(true);
    setChat((prev) => [...prev, { role: "user", text: transcript }]);

    // Small delay for "thinking" effect
    window.setTimeout(() => {
      const result = parseCommand(transcript, actions);
      setChat((prev) => [...prev, { role: "ai", text: result.spoken }]);
      setProcessing(false);
      setSpeaking(true);
      speak(result.spoken);
      window.setTimeout(() => setSpeaking(false), Math.max(2000, result.spoken.length * 60));
    }, 400);
  }, [actions]);

  const startListening = useCallback(() => {
    const SR: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      setChat((prev) => [...prev, { role: "ai", text: "Voice recognition is not supported in this browser. You can still type commands below." }]);
      return;
    }
    // Cancel any ongoing speech
    window.speechSynthesis?.cancel();
    setSpeaking(false);

    const rec = new SR();
    rec.lang = "en-US";
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.continuous = false;
    recogRef.current = rec;
    setListening(true);

    rec.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setListening(false);
      executeCommand(transcript);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => { setListening(false); };
    rec.start();
  }, [executeCommand]);

  const handleTextInput = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && textInput.trim()) {
      executeCommand(textInput.trim());
      setTextInput("");
    }
  }, [textInput, executeCommand]);

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  }, []);

  return (
    <div className="pointer-events-auto absolute right-4 top-4 z-30 w-[15rem]">
      {/* Header */}
      <div className={`flex items-center justify-between border bg-[#070d1a]/95 p-2.5 shadow-2xl backdrop-blur-xl ${listening ? "border-rose-400/50" : speaking ? "border-cyan-400/50" : "border-cyan-400/25"}`}>
        <div className="flex items-center gap-2">
          <div className={`grid h-6 w-6 place-items-center rounded-full text-[10px] ${listening ? "animate-pulse bg-rose-500" : speaking ? "animate-pulse bg-cyan-500" : "bg-gradient-to-br from-cyan-500 to-violet-600"}`}>
            {listening ? "🔴" : speaking ? "🔊" : "🤖"}
          </div>
          <span className="font-mono text-[9px] tracking-[0.16em] text-cyan-300">
            {listening ? "LISTENING…" : processing ? "PROCESSING…" : speaking ? "SPEAKING…" : "AI COPILOT"}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {speaking && (
            <button onClick={stopSpeaking} className="rounded border border-white/15 bg-white/5 px-1.5 py-0.5 text-[8px] text-slate-300 hover:bg-white/10">⏹ Stop</button>
          )}
          <button onClick={() => setExpanded(!expanded)} className="text-xs text-slate-500 hover:text-white">{expanded ? "▼" : "▲"}</button>
        </div>
      </div>

      {expanded && (
        <>
          {/* Chat history */}
          <div className="max-h-40 space-y-1.5 overflow-y-auto border-x border-white/10 bg-[#050a14]/95 p-2.5 backdrop-blur-xl">
            {chat.slice(-8).map((entry, i) => (
              <div key={i} className={`flex ${entry.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] border px-2.5 py-1.5 text-[10px] leading-snug ${
                  entry.role === "user"
                    ? "border-violet-400/30 bg-violet-500/10 text-violet-100"
                    : "border-cyan-400/25 bg-cyan-500/[0.06] text-cyan-100"
                }`}>
                  {entry.role === "ai" && <span className="mb-0.5 block font-mono text-[7px] font-bold tracking-widest text-cyan-400">🤖 MEDITWIN AI</span>}
                  {entry.text}
                </div>
              </div>
            ))}
            {processing && (
              <div className="flex justify-start">
                <div className="border border-cyan-400/25 bg-cyan-500/[0.06] px-2.5 py-1.5">
                  <div className="flex gap-1">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-400" style={{ animationDelay: "0ms" }} />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-400" style={{ animationDelay: "150ms" }} />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-400" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Mic button */}
          <div className="border-x border-b border-white/10 bg-[#070d1a]/95 p-2.5 backdrop-blur-xl">
            <button
              onClick={startListening}
              disabled={listening || processing}
              className={`w-full py-2.5 text-[11px] font-bold tracking-wider transition ${
                listening
                  ? "animate-pulse bg-rose-600 text-white"
                  : processing
                  ? "cursor-wait bg-white/10 text-slate-500"
                  : "bg-gradient-to-r from-cyan-500 to-violet-600 text-white shadow-lg shadow-cyan-500/20 hover:brightness-110"
              }`}
            >
              {listening ? "🔴 LISTENING — SPEAK NOW" : processing ? "PROCESSING…" : "🎙 TAP TO SPEAK"}
            </button>

            {/* Text input fallback */}
            <div className="mt-2 flex items-center gap-1.5">
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyDown={handleTextInput}
                placeholder="Or type a command…"
                className="flex-1 border border-white/10 bg-white/5 px-2 py-1.5 text-[10px] text-white placeholder:text-slate-500 focus:border-cyan-400/40 focus:outline-none"
              />
              <button
                onClick={() => { if (textInput.trim()) { executeCommand(textInput.trim()); setTextInput(""); } }}
                className="border border-cyan-400/30 bg-cyan-500/15 px-2 py-1.5 text-[9px] font-bold text-cyan-200 hover:bg-cyan-500/25"
              >
                ➤
              </button>
            </div>

            {/* Quick commands */}
            <div className="mt-2 flex flex-wrap gap-1">
              {[
                { label: "ICU", cmd: "Show ICU status" },
                { label: "Emergency", cmd: "Run emergency simulation" },
                { label: "Fleet", cmd: "Track ambulance fleet" },
                { label: "ICU-04", cmd: "Open ICU demo" },
                { label: "Night", cmd: "Night mode" },
                { label: "Help", cmd: "Help" },
              ].map((q) => (
                <button
                  key={q.label}
                  onClick={() => executeCommand(q.cmd)}
                  className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[8px] font-bold text-slate-300 transition hover:bg-cyan-500/15 hover:text-cyan-200"
                >
                  {q.label}
                </button>
              ))}
            </div>

            {/* Voice level indicator */}
            <div className="mt-2 flex items-center justify-between">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-0.5 rounded-full transition-all ${listening ? "bg-cyan-400" : "bg-slate-700"}`}
                    style={{ height: listening ? `${4 + Math.abs(Math.sin(Date.now() / 100 + i)) * 12}px` : "4px" }}
                  />
                ))}
              </div>
              <span className="font-mono text-[7px] text-slate-500">
                {typeof window !== "undefined" && window.speechSynthesis ? "TTS ✓" : "TTS ✗"} · {typeof window !== "undefined" && ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition) ? "STT ✓" : "STT ✗"}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
