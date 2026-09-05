import { Suspense, useCallback, useEffect, useState } from "react";
import * as THREE from "three";

import { HospitalScene } from "./three/HospitalScene";
import { CameraMode } from "./three/CameraRig";
import { Status } from "./data/hospital";

import {
  TopBar,
  GlobalMetrics,
  DepartmentList,
  DetailPanel,
} from "./ui/Dashboard";

import {
  ScenarioBanner,
  AiConsole,
  AiDecisionPanel,
  AiProcessingRail,
  ScenarioTimeline,
  StabilizedCard,
} from "./ui/ScenarioOverlay";

import { useScenario } from "./hooks/useScenario";
import { usePatientJourney } from "./hooks/usePatientJourney";
import { useIcuDemo } from "./hooks/useIcuDemo";

import {
  PatientPanel,
  JourneyStepper,
  JourneyBanner,
  DischargeCard,
} from "./ui/PatientJourney";

import {
  IcuDemoFeed,
  IcuDemoFinal,
  IcuDemoPanel,
  IcuDemoTimeline,
} from "./ui/IcuPresentation";

import { RealisticIcuViewer } from "./ui/RealisticIcuViewer";
import { AiInsights } from "./ui/AiInsights";
import { JourneyStoryDeck } from "./ui/JourneyStoryDeck";
import { DepartmentPopup } from "./ui/DepartmentPopup";

import { useOpsSimulation } from "./hooks/useOpsSimulation";

import {
  OpsLauncher,
  OpsResourcePanel,
  OpsActionQueue,
  OpsTimeline,
  OpsOutcome,
} from "./ui/OpsSimulationUI";

import { FleetDashboard } from "./ui/FleetPanel";
import { useFleet } from "./hooks/useFleet";
import { OpsScenarioId } from "./data/opsSimulation";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { AiCopilot, CopilotActions } from "./ui/AiCopilot";

import {
  EmergencyModeButton,
  BeforeAfterPanel,
  TimeScrubber,
  AmbulanceGPS,
  ResourceAllocation,
  AIExplanation,
  ArchitectureDiagram,
  HeatmapOverlay,
  Sparkline,
} from "./ui/WowFeatures";

/*
 * NEW:
 * Live hospital API connection.
 *
 * This does NOT replace the existing hospital.ts data yet.
 * It only loads the real backend data so we can verify
 * the frontend ↔ FastAPI ↔ MongoDB connection safely.
 */
import { useHospitalData } from "./hooks/useHospitalData";

function SceneLoader() {
  return (
    <div className="absolute inset-0 grid place-items-center bg-slate-950">
      <div className="text-center">
        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-cyan-500/30 border-t-cyan-400" />
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-cyan-400">
          Initializing spatial twin
        </p>
      </div>
    </div>
  );
}

export default function App() {
  /*
   * LIVE BACKEND DATA
   *
   * The hook connects to:
   * React → FastAPI → MongoDB
   *
   * We are intentionally not replacing the existing UI data yet.
   */
  const {
    data: hospitalData,
    loading: hospitalLoading,
    error: hospitalError,
  } = useHospitalData();

  const [selected, setSelectedState] = useState<string | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [cameraMode, setCameraMode] = useState<CameraMode>("orbit");
  const [showLabels, setShowLabels] = useState(false);
  const [showNetwork, setShowNetwork] = useState(true);
  const [sceneRoot, setSceneRoot] = useState<THREE.Group | null>(null);
  const [dayMode, setDayMode] = useState(true);
  const [rain, setRain] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);
  const [icuRealistic, setIcuRealistic] = useState(false);
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [heatmap, setHeatmap] = useState(false);
  const [showArchitecture, setShowArchitecture] = useState(false);
  const [presentationMode, setPresentationMode] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [hrHistory, setHrHistory] = useState<number[]>([
    84,
    86,
    88,
    92,
    96,
    102,
    110,
    118,
    124,
  ]);
  const [opsLauncherOpen, setOpsLauncherOpen] = useState(false);
  const [simDrawerOpen, setSimDrawerOpen] = useState(false);

  const scenario = useScenario();
  const journey = usePatientJourney();
  const icuDemo = useIcuDemo();
  const ops = useOpsSimulation();

  const journeyOn = journey.running || journey.finished;
  const icuDemoOn = icuDemo.active;
  const opsOn = ops.active;
  const fleet = useFleet();

  /*
   * Verify the live backend connection.
   *
   * This does not modify the dashboard.
   * It simply prints the real MongoDB record counts
   * to the browser console.
   */
  useEffect(() => {
    if (hospitalLoading) {
      console.log("SMART HOSPITAL API: connecting...");
      return;
    }

    if (hospitalError) {
      console.error("SMART HOSPITAL API ERROR:", hospitalError);
      return;
    }

    if (!hospitalData) {
      return;
    }

    console.log("SMART HOSPITAL API CONNECTED");

    console.log("Patients:", hospitalData.patients.length);
    console.log("Doctors:", hospitalData.doctors.length);
    console.log("Nurses:", hospitalData.nurses.length);
    console.log("Departments:", hospitalData.departments.length);
    console.log("Beds:", hospitalData.beds.length);
    console.log("Rooms:", hospitalData.rooms.length);
    console.log("Equipment:", hospitalData.equipment.length);
    console.log("Ambulances:", hospitalData.ambulances.length);
    console.log("Vitals:", hospitalData.vitals.length);
    console.log("Predictions:", hospitalData.predictions.length);
    console.log("KPIs:", hospitalData.kpis.length);
    console.log("Alerts:", hospitalData.alerts.length);
    console.log(
      "Emergency Events:",
      hospitalData.emergencyEvents.length
    );
    console.log("Lab Results:", hospitalData.labResults.length);
    console.log(
      "Medical History:",
      hospitalData.medicalHistory.length
    );
    console.log("Medications:", hospitalData.medications.length);
    console.log("Surgeries:", hospitalData.surgeries.length);
    console.log(
      "Billing / Insurance:",
      hospitalData.billingInsurance.length
    );
  }, [hospitalData, hospitalLoading, hospitalError]);

  // Journey department states override the campus scenario states.
  const demoStatuses: Record<string, Status> = icuDemoOn
    ? {
        icu:
          icuDemo.bedAcuity === "critical"
            ? "critical"
            : icuDemo.bedAcuity === "high" ||
                icuDemo.bedAcuity === "observation"
              ? "busy"
              : "normal",
      }
    : {};

  const mergedStatuses = opsOn
    ? { ...scenario.statuses, ...ops.statuses }
    : journeyOn
      ? { ...scenario.statuses, ...journey.statuses }
      : { ...scenario.statuses, ...demoStatuses };

  const activeFocus = opsOn
    ? ops.focus
    : journeyOn
      ? (journey.step?.focus ?? "overview")
      : scenario.focus;

  const setSelected = useCallback((id: string | null) => {
    setSelectedState(id);
    setSelectedRoom(null);
  }, []);

  const startScenario = useCallback(() => {
    setSimDrawerOpen(false);
    journey.reset();
    setCameraMode("cinematic");
    setSelectedState(null);
    setSelectedRoom(null);
    setShowLabels(true);
    scenario.start();
  }, [scenario.start, journey.reset]);

  const exitScenario = useCallback(() => {
    scenario.reset();
    setCameraMode("orbit");
    setShowLabels(false);
    setSimDrawerOpen(false);
  }, [scenario.reset]);

  const startJourney = useCallback(() => {
    setSimDrawerOpen(false);
    icuDemo.exit();
    scenario.reset();
    setCameraMode("cinematic");
    setSelectedState(null);
    setSelectedRoom(null);
    setShowLabels(false);
    journey.start();
  }, [journey.start, scenario.reset, icuDemo.exit]);

  const exitJourney = useCallback(() => {
    journey.reset();
    setCameraMode("orbit");
  }, [journey.reset]);

  const startIcuDemo = useCallback(() => {
    setSimDrawerOpen(false);
    scenario.reset();
    journey.reset();
    setIcuRealistic(false);
    setCameraMode("interior");
    setSelectedState(null);
    setSelectedRoom(null);
    setShowLabels(false);
    icuDemo.start();
  }, [scenario.reset, journey.reset, icuDemo.start]);

  const exitIcuDemo = useCallback(() => {
    icuDemo.exit();
    setCameraMode("orbit");
  }, [icuDemo.exit]);

  const launchOps = useCallback(
    (id: OpsScenarioId) => {
      setSimDrawerOpen(false);
      setOpsLauncherOpen(false);
      scenario.reset();
      journey.reset();
      icuDemo.exit();
      setSelectedState(null);
      setSelectedRoom(null);
      setShowLabels(true);
      setCameraMode("cinematic");
      ops.start(id);
    },
    [scenario.reset, journey.reset, icuDemo.exit, ops.start]
  );

  const exitOps = useCallback(() => {
    ops.exit();
    setShowLabels(false);
    setCameraMode("orbit");
  }, [ops.exit]);

  // AI Copilot actions
  const copilotActions: CopilotActions = {
    flyToDepartment: (id: string) => {
      setSelectedState(id);
      setCameraMode("orbit");
      setSimDrawerOpen(false);
    },

    returnToOverview: () => {
      setSelectedState(null);
      setCameraMode("orbit");
      scenario.reset();
      journey.reset();
      icuDemo.exit();
      ops.exit();
    },

    setCamera: (mode) => setCameraMode(mode),

    runEmergency: () => startScenario(),

    runPatientJourney: () => startJourney(),

    runIcuDemo: () => startIcuDemo(),

    runResourceAllocation: () => launchOps("resource"),

    runMassCasualty: () => launchOps("masscasualty"),

    runEquipmentFailure: () => launchOps("equipment"),

    toggleFleet: () => {
      setSimDrawerOpen(false);
      fleet.toggle();
    },

    setNight: () => {
      setDayMode(false);
      setRain(false);
    },

    setDay: () => {
      setDayMode(true);
      setRain(false);
    },

    setRain: () => setRain(true),

    setClear: () => setRain(false),

    toggleLabels: () => setShowLabels((v) => !v),

    toggleNetwork: () => setShowNetwork((v) => !v),

    getIcuStatus: () => {
      const s = mergedStatuses.icu ?? "normal";

      if (s === "critical") {
        return "ICU occupancy is at 96 percent. Only one bed remains available. Eleven of twelve ventilators are in use. The block is flagged critical.";
      }

      if (s === "busy") {
        return "ICU occupancy is at 85 percent with three beds available. Nine ventilators are active.";
      }

      return "ICU occupancy is at 70 percent with six beds available. Nine ventilators are active. All patients are stable.";
    },

    getEmergencyStatus: () => {
      const s = mergedStatuses.emergency ?? "normal";

      if (s === "critical") {
        return "Emergency is at critical capacity with 23 active cases and an 18-minute wait time.";
      }

      if (s === "busy") {
        return "Emergency has 11 active cases with a 7-minute wait. Nine of sixteen treatment bays are occupied.";
      }

      return "Emergency is operating normally with 11 cases and a 7-minute median wait.";
    },

    getVentilatorCount: () =>
      "There are 12 ventilators in ICU Block A. 9 are currently in use. 3 are available. ICU Block B has 12 additional ventilators on standby.",

    getOxygenLevel: () =>
      "Oxygen line pressure is 4.2 bar. Reserve tank is at 87 percent. Flow rate is 1200 litres per minute. No alarms.",

    getBloodAvailability: () =>
      "428 units ready. 38 units of O-negative in stock. 24 crossmatches in progress. Cold chain is valid.",

    getOverallStatus: () => {
      const crit = Object.values(mergedStatuses).filter(
        (s) => s === "critical"
      ).length;

      const busy = Object.values(mergedStatuses).filter(
        (s) => s === "busy"
      ).length;

      if (crit > 0) {
        return `${crit} department${
          crit > 1 ? "s are" : " is"
        } in critical status. ${busy} department${
          busy !== 1 ? "s are" : " is"
        } busy. The hospital is under surge pressure.`;
      }

      if (busy > 0) {
        return `${busy} department${
          busy !== 1 ? "s are" : " is"
        } operating at busy capacity. All other departments are normal.`;
      }

      return "All departments are operating normally. The campus is stable with 1284 patients under care.";
    },
  };

  const toggleEmergency = useCallback(() => {
    setEmergencyMode((v) => {
      const next = !v;

      if (next) {
        setRain(true);
        setDayMode(false);
        setHeatmap(true);
      } else {
        setRain(false);
        setDayMode(true);
        setHeatmap(false);
      }

      return next;
    });
  }, []);

  // Live HR history for sparklines
  useEffect(() => {
    const id = setInterval(() => {
      setHrHistory((prev) => {
        const last = prev[prev.length - 1];
        const next = Math.max(
          62,
          Math.min(148, last + (Math.random() - 0.5) * 7)
        );

        return [...prev.slice(-15), Math.round(next)];
      });
    }, 1100);

    return () => clearInterval(id);
  }, []);

  const toggleInterior = useCallback(() => {
    if (!selected) return;

    setCameraMode((mode) =>
      mode === "interior" ? "orbit" : "interior"
    );

    setSelectedRoom(null);
  }, [selected]);

  const exportGlb = useCallback(async () => {
    if (!sceneRoot || exporting) return;

    setExporting(true);
    setExportNotice("Preparing optimized GLB scene...");

    try {
      const { GLTFExporter } = await import(
        "three/examples/jsm/exporters/GLTFExporter.js"
      );

      const exporter = new GLTFExporter();

      const q0 = new THREE.Quaternion().setFromAxisAngle(
        new THREE.Vector3(0, 1, 0),
        0
      );

      const q1 = new THREE.Quaternion().setFromAxisAngle(
        new THREE.Vector3(0, 1, 0),
        Math.PI
      );

      const q2 = new THREE.Quaternion().setFromAxisAngle(
        new THREE.Vector3(0, 1, 0),
        Math.PI * 2
      );

      const rotorTrack = new THREE.QuaternionKeyframeTrack(
        "air_ambulance_main_rotor.quaternion",
        [0, 0.5, 1],
        [
          ...q0.toArray(),
          ...q1.toArray(),
          ...q2.toArray(),
        ]
      );

      const beaconTrack = new THREE.QuaternionKeyframeTrack(
        "command_beacon.quaternion",
        [0, 2, 4],
        [
          ...q0.toArray(),
          ...q1.toArray(),
          ...q2.toArray(),
        ]
      );

      const animationClips =
        cameraMode === "interior"
          ? []
          : [
              new THREE.AnimationClip("Air Ambulance Rotor", 1, [
                rotorTrack,
              ]),
              new THREE.AnimationClip("AI Command Beacon", 4, [
                beaconTrack,
              ]),
            ];

      exporter.parse(
        sceneRoot,
        (result) => {
          const blob =
            result instanceof ArrayBuffer
              ? new Blob([result], {
                  type: "model/gltf-binary",
                })
              : new Blob([JSON.stringify(result)], {
                  type: "application/json",
                });

          const url = URL.createObjectURL(blob);

          const anchor = document.createElement("a");
          anchor.href = url;
          anchor.download = `meditwin-${
            cameraMode === "interior" && selected
              ? selected
              : "campus"
          }.glb`;

          anchor.click();

          URL.revokeObjectURL(url);

          setExporting(false);
          setExportNotice("GLB export complete");

          window.setTimeout(
            () => setExportNotice(null),
            2600
          );
        },
        (error) => {
          console.error("GLB export failed", error);
          setExporting(false);
          setExportNotice("GLB export failed");
        },
        {
          binary: true,
          onlyVisible: true,
          trs: false,
          maxTextureSize: 2048,
          animations: animationClips,
        }
      );
    } catch (error) {
      console.error("Unable to load GLTFExporter", error);
      setExporting(false);
      setExportNotice("GLB exporter unavailable");
    }
  }, [sceneRoot, exporting, cameraMode, selected]);

  const modeHint = icuDemoOn
    ? icuDemo.awaitingBedSelection
      ? "Choose a patient bed to inspect the live Digital Twin"
      : `${icuDemo.selectedBed} · ${icuDemo.patient.name} · live twin`
    : cameraMode === "orbit"
      ? "Drag orbit / Scroll zoom / Right-drag pan"
      : cameraMode === "drone"
        ? "WASD move / Q-E turn / R-F altitude"
        : cameraMode === "walk" || cameraMode === "third"
          ? "WASD move / Q-E turn"
          : cameraMode === "interior"
            ? "Select a room / Drag orbit / Scroll zoom"
            : "Cinematic incident camera active";

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#050a12] text-slate-100">
      <TopBar />

<GlobalMetrics
  data={hospitalData}
  phase={
    scenario.running || scenario.finished
      ? scenario.phase
      : undefined
  }
  journeyStepId={
    journeyOn
      ? journey.step?.id
      : icuDemoOn
        ? icuDemo.stage.id
        : undefined
  }
/>
      <div className="flex min-h-0 flex-1">
        <DepartmentList
          selected={selected}
          onSelect={setSelected}
          onHover={setHovered}
          liveStatuses={mergedStatuses}
          focus={
            scenario.running || journey.running
              ? activeFocus
              : undefined
          }
        />

        <main className="relative min-w-0 flex-1 overflow-hidden">
          {/* Top-center status pill during quiet campus mode */}
          {!scenario.running &&
            !scenario.finished &&
            !journeyOn &&
            !icuDemoOn &&
            !opsOn &&
            !fleet.active && (
              <div className="pointer-events-none absolute inset-x-0 top-3 z-20 flex justify-center">
                <div className="border border-cyan-300/30 bg-[#030a13]/85 px-4 py-1.5 text-center shadow-xl backdrop-blur-xl">
                  <div className="font-mono text-[8px] tracking-[0.22em] text-cyan-300">
                    MEDITWIN / LIVE DIGITAL TWIN
                  </div>

                  <div className="text-[11px] font-semibold text-white">
                    Interactive Hospital Campus · AI Clinical Operations
                  </div>
                </div>
              </div>
            )}

          {emergencyMode && (
            <div className="pointer-events-none absolute inset-0 z-10 border-[3px] border-rose-500/70 shadow-[inset_0_0_60px_rgba(244,63,94,0.35)] animate-pulse" />
          )}

          <HeatmapOverlay enabled={heatmap} />

          {/* Photorealistic ICU interior */}
          {icuDemoOn && icuRealistic ? (
            <RealisticIcuViewer
              demo={icuDemo}
              onSelectBed={(bed) => icuDemo.selectBed(bed)}
            />
          ) : (
            <ErrorBoundary label="The 3D campus">
              <Suspense fallback={<SceneLoader />}>
                <HospitalScene
                  selected={selected}
                  selectedRoom={selectedRoom}
                  hovered={hovered}
                  setSelected={setSelected}
                  setSelectedRoom={setSelectedRoom}
                  setHovered={setHovered}
                  liveStatuses={mergedStatuses}
                  focus={activeFocus}
                  phase={scenario.phase}
                  running={scenario.running || journey.running}
                  cameraMode={cameraMode}
                  showLabels={showLabels}
                  showNetwork={showNetwork}
                  onSceneReady={setSceneRoot}
                  dayMode={dayMode}
                  rain={rain}
                  journeyActive={journeyOn}
                  journeyStepIndex={journey.stepIndex}
                  journeyStepId={journey.step?.id ?? 1}
                  journeyRisk={journey.risk}
                  journeyHr={journey.vitals.hr}
                  journeySpo2={journey.vitals.spo2}
                  journeyCues={journey.cues}
                  icuDemoActive={icuDemoOn && !icuRealistic}
                  icuDemoStage={icuDemo.stage.id}
                  icuDemoAcuity={icuDemo.bedAcuity}
                  icuDemoVitals={icuDemo.vitals}
                  icuDemoAwaitingSelection={
                    icuDemo.awaitingBedSelection
                  }
                  icuDemoCues={icuDemo.cues}
                  icuDemoSelectedBed={icuDemo.selectedBed}
                  icuDemoPatients={undefined}
                  onSelectIcu04={(bed: string) =>
                    icuDemo.selectBed(bed)
                  }
                  fleetActive={false}
                  fleetUnits={[]}
                  fleetFollowId={null}
                />
              </Suspense>
            </ErrorBoundary>
          )}

          {/* Campus emergency scenario overlays */}
          {!journeyOn && !icuDemoOn && (
            <ScenarioBanner
              banner={
                scenario.running || scenario.finished
                  ? scenario.banner
                  : null
              }
            />
          )}

          {!journeyOn &&
            !icuDemoOn &&
            (scenario.running || scenario.finished) && (
              <AiConsole
                logs={scenario.logs}
                phase={scenario.phase}
              />
            )}

          {!journeyOn &&
            !icuDemoOn &&
            (scenario.running || scenario.finished) && (
              <AiDecisionPanel phase={scenario.phase} />
            )}

          {!journeyOn &&
            !icuDemoOn &&
            scenario.running && (
              <AiProcessingRail phase={scenario.phase} />
            )}

          {!journeyOn &&
            !icuDemoOn &&
            (scenario.running || scenario.finished) && (
              <ScenarioTimeline
                progress={scenario.progress}
                activeStep={scenario.activeStep}
              />
            )}

          {!journeyOn && !icuDemoOn && (
            <StabilizedCard
              show={scenario.finished}
              onReplay={startScenario}
            />
          )}

          {/* Patient journey overlays */}
          {journeyOn && <JourneyStoryDeck j={journey} />}
          {journeyOn && <JourneyBanner j={journey} />}
          {journeyOn && <JourneyStepper j={journey} />}

          <DischargeCard
            show={journey.finished}
            onReplay={startJourney}
            onExit={exitJourney}
          />

          {/* ICU presentation overlays */}
          {icuDemoOn &&  (
            <IcuDemoFeed demo={icuDemo} />
          )}

          {icuDemoOn && (
            <IcuDemoTimeline demo={icuDemo} />
          )}

          {icuDemoOn && icuRealistic && (
            <div className="pointer-events-none absolute left-1/2 top-[38%] z-20 -translate-x-1/2">
              <div className="border bg-black/60 px-3 py-1.5 backdrop-blur text-center">
                <div className="font-mono text-[9px] tracking-[0.18em] text-cyan-300">
                  LIVE 3D BED TWINS STILL STREAMING BELOW
                </div>

                <div className="text-[10px] text-white/70">
                  Toggle to 3D to orbit the 12 physical beds
                </div>
              </div>
            </div>
          )}

          <IcuDemoFinal
            show={icuDemo.finished}
            demo={icuDemo}
            onReplay={startIcuDemo}
            onExit={exitIcuDemo}
          />

          {opsOn && (
            <div className="absolute left-4 top-4 z-30">
              <button
                onClick={exitOps}
                className="border border-white/15 bg-slate-950/85 px-3 py-1.5 text-xs font-semibold text-slate-200 shadow-xl backdrop-blur transition hover:bg-white/10"
              >
                Exit simulation
              </button>
            </div>
          )}

          {/* Simulations drawer */}
          {!scenario.running &&
            !scenario.finished &&
            !journeyOn &&
            !icuDemoOn &&
            !opsOn &&
            !fleet.active && (
              <div className="absolute left-4 top-4 z-30">
                <button
                  onClick={() =>
                    setSimDrawerOpen((open) => !open)
                  }
                  className="border border-cyan-300/50 bg-[#06101c]/90 px-4 py-2 text-xs font-black tracking-[0.18em] text-cyan-100 shadow-xl backdrop-blur-xl transition hover:bg-cyan-400/15"
                >
                  SIMULATIONS{" "}
                  {simDrawerOpen ? "▲" : "▼"}
                </button>

                {simDrawerOpen && (
                  <div className="mt-2 w-[26rem] max-w-[calc(100vw-2rem)] border border-cyan-400/30 bg-[#050d17]/95 p-3 shadow-2xl backdrop-blur-xl">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="font-mono text-[9px] tracking-[0.22em] text-cyan-300">
                        CHOOSE A DEMO
                      </span>

                      <button
                        onClick={() =>
                          setSimDrawerOpen(false)
                        }
                        className="text-xs text-slate-500 hover:text-white"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={startScenario}
                        className="border border-rose-300/50 bg-rose-500/15 px-3 py-2 text-left transition hover:bg-rose-500/25"
                      >
                        <div className="text-[11px] font-bold text-rose-100">
                          🚨 Run Emergency Simulation
                        </div>

                        <div className="mt-0.5 text-[9px] text-slate-400">
                          Ambulance → ER → ICU overload → AI response
                        </div>
                      </button>

                      <button
                        onClick={startJourney}
                        className="border border-cyan-300/50 bg-cyan-500/15 px-3 py-2 text-left transition hover:bg-cyan-500/25"
                      >
                        <div className="text-[11px] font-bold text-cyan-100">
                          👤 Patient Journey
                        </div>

                        <div className="mt-0.5 text-[9px] text-slate-400">
                          One patient from arrival to discharge
                        </div>
                      </button>

                      <button
                        onClick={startIcuDemo}
                        className="border border-violet-300/50 bg-violet-500/15 px-3 py-2 text-left transition hover:bg-violet-500/25"
                      >
                        <div className="text-[11px] font-bold text-violet-100">
                          🏥 ICU Demo
                        </div>

                        <div className="mt-0.5 text-[9px] text-slate-400">
                          12-bed ICU, click a bed, AI bedside twin
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          setSimDrawerOpen(false);
                          setOpsLauncherOpen(true);
                        }}
                        className="border border-amber-300/50 bg-amber-500/15 px-3 py-2 text-left transition hover:bg-amber-500/25"
                      >
                        <div className="text-[11px] font-bold text-amber-100">
                          ⚡ AI Operations
                        </div>

                        <div className="mt-0.5 text-[9px] text-slate-400">
                          Resource AI · Mass casualty · Equipment failure
                        </div>
                      </button>
                    </div>

                    <div className="mt-3 border-t border-white/10 pt-3">
                      <div className="mb-2 font-mono text-[8px] tracking-widest text-slate-500">
                        LIVE OPERATIONS
                      </div>

                      <button
                        onClick={() => {
                          setSimDrawerOpen(false);
                          fleet.toggle();
                        }}
                        className="w-full border border-cyan-300/50 bg-cyan-500/15 px-3 py-2 text-left transition hover:bg-cyan-500/25"
                      >
                        <div className="text-[11px] font-bold text-cyan-100">
                          🚑 Ambulance Fleet
                        </div>

                        <div className="mt-0.5 text-[9px] text-slate-400">
                          Live GPS tracking, ETA, AI route optimization
                        </div>
                      </button>
                    </div>

                    <div className="mt-3 border-t border-white/10 pt-3">
                      <div className="mb-2 font-mono text-[8px] tracking-widest text-slate-500">
                        VIEW / ENVIRONMENT
                      </div>

                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          onClick={() =>
                            setShowLabels((v) => !v)
                          }
                          className={`border px-2 py-1.5 text-[9px] font-bold ${
                            showLabels
                              ? "border-cyan-400 bg-cyan-400/20 text-cyan-100"
                              : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                          }`}
                        >
                          Labels
                        </button>

                        <button
                          onClick={() =>
                            setShowNetwork((v) => !v)
                          }
                          className={`border px-2 py-1.5 text-[9px] font-bold ${
                            showNetwork
                              ? "border-violet-400 bg-violet-400/20 text-violet-100"
                              : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                          }`}
                        >
                          Network
                        </button>

                        <button
                          onClick={() =>
                            setDayMode((v) => !v)
                          }
                          className="border border-white/10 bg-white/5 px-2 py-1.5 text-[9px] font-bold text-slate-300 hover:bg-white/10"
                        >
                          {dayMode ? "Night" : "Day"}
                        </button>

                        <button
                          onClick={() => setRain((v) => !v)}
                          className={`border px-2 py-1.5 text-[9px] font-bold ${
                            rain
                              ? "border-blue-400 bg-blue-400/20 text-blue-100"
                              : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                          }`}
                        >
                          {rain ? "Clear" : "Rain"}
                        </button>
                      </div>

                      <button
                        onClick={exportGlb}
                        disabled={exporting}
                        className="mt-2 w-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-1.5 text-[9px] font-bold text-emerald-200 hover:bg-emerald-400/20 disabled:opacity-50"
                      >
                        {exporting
                          ? "Exporting..."
                          : "Export GLB"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

          {(scenario.running || scenario.finished) &&
            !journeyOn &&
            !icuDemoOn &&
            !opsOn && (
              <div className="absolute left-4 top-4 z-40 flex items-center gap-2 rounded border border-white/10 bg-[#050d17]/90 p-1.5 shadow-xl backdrop-blur-xl">
                <button
                  onClick={startScenario}
                  className="border border-cyan-400/30 bg-cyan-400/10 px-3 py-1.5 text-[10px] font-bold text-cyan-100 hover:bg-cyan-400/20"
                >
                  Reset Emergency
                </button>

                <button
                  onClick={exitScenario}
                  className="border border-white/15 bg-white/5 px-3 py-1.5 text-[10px] font-bold text-slate-200 hover:bg-white/10"
                >
                  Exit
                </button>
              </div>
            )}

          {icuDemoOn && (
            <div className="absolute left-4 top-4 z-30 flex flex-col gap-2">
              <div className="flex items-center gap-1 rounded-full border border-white/15 bg-black/65 p-1 shadow-lg backdrop-blur-md">
                <button
                  onClick={() => setIcuRealistic(true)}
                  className={`rounded-full px-3 py-1 text-[10px] font-bold tracking-wide transition ${
                    icuRealistic
                      ? "bg-cyan-400 text-slate-900"
                      : "text-slate-300 hover:text-white"
                  }`}
                >
                  PHOTOREALISTIC
                </button>

                <button
                  onClick={() => setIcuRealistic(false)}
                  className={`rounded-full px-3 py-1 text-[10px] font-bold tracking-wide transition ${
                    !icuRealistic
                      ? "bg-cyan-400 text-slate-900"
                      : "text-slate-300 hover:text-white"
                  }`}
                >
                  3D BEDS
                </button>
              </div>

              <button
                onClick={exitIcuDemo}
                className="self-start border border-white/15 bg-slate-950/80 px-3 py-1.5 text-xs font-semibold text-slate-200 shadow-lg backdrop-blur transition hover:bg-white/10"
              >
                Exit ICU demo
              </button>
            </div>
          )}

          {journeyOn && (
            <div className="absolute left-4 top-4 z-30">
              <button
                onClick={exitJourney}
                className="border border-white/15 bg-slate-950/80 px-3 py-1.5 text-xs font-semibold text-slate-200 shadow-xl backdrop-blur transition hover:bg-white/10"
              >
                Exit journey
              </button>
            </div>
          )}

          <div className="pointer-events-none absolute bottom-4 right-4 z-10 flex flex-col items-end gap-2">
            {!scenario.running && !icuDemoOn && (
              <div className="flex items-center gap-3 border border-white/10 bg-slate-950/75 px-3 py-2 font-mono text-[9px] text-slate-300 backdrop-blur">
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#20d991] shadow-[0_0_7px_#20d991]" />
                  NORMAL
                </span>

                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#f4c849] shadow-[0_0_7px_#f4c849]" />
                  BUSY
                </span>

                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#ff5266] shadow-[0_0_7px_#ff5266]" />
                  CRITICAL
                </span>
              </div>
            )}

            <div className="border border-white/10 bg-slate-950/75 px-3 py-1.5 font-mono text-[9px] text-slate-400 backdrop-blur">
              {modeHint}
            </div>
          </div>

          {/* AI Copilot */}
          {!fleet.active && (
            <AiCopilot actions={copilotActions} />
          )}

          {/* AI Insights */}
          {showInsights && (
            <AiInsights
              onClose={() => setShowInsights(false)}
            />
          )}

          {/* WOW dock */}
          {!simDrawerOpen &&
            !fleet.active &&
            !journeyOn &&
            !icuDemoOn &&
            !scenario.running &&
            !scenario.finished && (
              <div className="absolute bottom-4 left-4 z-10 grid w-[48%] grid-cols-3 gap-2">
                <div className="space-y-2">
                  <EmergencyModeButton
                    active={emergencyMode}
                    onToggle={toggleEmergency}
                  />

                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() =>
                        setHeatmap((v) => !v)
                      }
                      className={`border py-1.5 text-[8px] font-bold ${
                        heatmap
                          ? "border-amber-400 bg-amber-500/20 text-amber-200"
                          : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                      }`}
                    >
                      {heatmap ? "● HEATMAP" : "HEATMAP"}
                    </button>

                    <button
                      onClick={() =>
                        setShowArchitecture((v) => !v)
                      }
                      className={`border py-1.5 text-[8px] font-bold ${
                        showArchitecture
                          ? "border-cyan-400 bg-cyan-500/20 text-cyan-200"
                          : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                      }`}
                    >
                      ARCHITECTURE
                    </button>

                    <button
                      onClick={() =>
                        setShowInsights((v) => !v)
                      }
                      className={`col-span-2 border py-1.5 text-[8px] font-bold ${
                        showInsights
                          ? "border-violet-400 bg-violet-500/20 text-violet-200"
                          : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                      }`}
                    >
                      🧠{" "}
                      {showInsights ? "HIDE" : ""} AI INSIGHTS
                    </button>
                  </div>

                  <button
                    onClick={() =>
                      setPresentationMode((v) => !v)
                    }
                    className={`w-full py-1.5 text-[8px] font-bold ${
                      presentationMode
                        ? "animate-pulse bg-violet-500 text-white"
                        : "border border-white/10 bg-white/10 text-slate-300 hover:bg-white/15"
                    }`}
                  >
                    {presentationMode
                      ? "EXIT STORY"
                      : "▶ STORY MODE"}
                  </button>
                </div>

                <AmbulanceGPS
                  phase={scenario.phase}
                  journeyPhase={journey.step?.id}
                />

                <div className="border border-white/10 bg-[#06101c]/90 p-2 backdrop-blur">
                  <Sparkline
                    data={hrHistory}
                    color="#22d3ee"
                    label="LIVE HR"
                    unit=" bpm"
                  />

                  <div className="mt-1">
                    <Sparkline
                      data={hrHistory.map(
                        (v) => 96 - (v - 84) * 0.35
                      )}
                      color="#f43f5e"
                      label="SpO₂"
                      unit="%"
                    />
                  </div>
                </div>
              </div>
            )}

          {/* Journey scrubber */}
          {journeyOn && (
            <div className="absolute bottom-[74px] left-1/2 z-10 w-[34rem] max-w-[52%] -translate-x-1/2">
              <TimeScrubber
                progress={journey.progress}
                onSeek={() => {}}
                label="PATIENT JOURNEY REPLAY"
              />
            </div>
          )}

          {icuDemoOn &&
            !icuDemo.awaitingBedSelection && (
              <div className="absolute bottom-[74px] left-1/2 z-10 flex w-[42rem] max-w-[62%] -translate-x-1/2 gap-2">
                <div className="flex-1">
                  <TimeScrubber
                    progress={icuDemo.progress}
                    onSeek={() => {}}
                    label="ICU-04 TIMELINE"
                  />
                </div>

                <div className="w-40">
                  <BeforeAfterPanel compact />
                </div>
              </div>
            )}

          {icuDemoOn &&
            !icuDemo.awaitingBedSelection && (
              <div className="absolute right-4 top-[52%] z-10 w-64 -translate-y-1/2">
                <ResourceAllocation demo={icuDemo} />

                <div className="mt-2">
                  <AIExplanation
                    operability={icuDemo.patient.operability}
                    survival={icuDemo.patient.survival}
                  />
                </div>
              </div>
            )}

          {/* Architecture modal */}
          {showArchitecture && (
            <div
              className="absolute inset-0 z-20 grid place-items-center bg-black/40 p-6 backdrop-blur-[1px]"
              onClick={() =>
                setShowArchitecture(false)
              }
            >
              <div
                className="w-[min(92%,48rem)] border border-cyan-400/30 bg-[#040d16]/95 p-5 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between">
                  <span className="font-mono text-[10px] tracking-[0.2em] text-cyan-300">
                    TECHNICAL ARCHITECTURE · LEVEL 12
                  </span>

                  <button
                    onClick={() =>
                      setShowArchitecture(false)
                    }
                    className="text-slate-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                <div className="mt-3">
                  <ArchitectureDiagram />
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2 text-[9px] leading-snug text-slate-400">
                  <div className="border border-white/10 bg-white/[0.02] p-2">
                    <span className="font-bold text-white">
                      IoT → FastAPI
                    </span>
                    <br />
                    768 sensors @1Hz → REST + WebSocket
                  </div>

                  <div className="border border-white/10 bg-white/[0.02] p-2">
                    <span className="font-bold text-white">
                      Granite + RAG
                    </span>
                    <br />
                    IBM Granite inference · SOP grounding
                  </div>

                  <div className="border border-white/10 bg-white/[0.02] p-2">
                    <span className="font-bold text-white">
                      Agentic → Twin
                    </span>
                    <br />
                    Autonomous allocation → R3F 3D sync 18ms
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Operational AI simulations */}
          {opsLauncherOpen && !opsOn && (
            <OpsLauncher
              onLaunch={launchOps}
              onClose={() =>
                setOpsLauncherOpen(false)
              }
            />
          )}

          {opsOn && <OpsResourcePanel sim={ops} />}
          {opsOn && <OpsActionQueue sim={ops} />}
          {opsOn && <OpsTimeline sim={ops} />}

          {opsOn && (
            <OpsOutcome
              sim={ops}
              onReplay={() => {
                ops.exit();
                setOpsLauncherOpen(true);
              }}
              onExit={exitOps}
            />
          )}

          {/* Fleet dashboard */}
          <ErrorBoundary label="The Emergency Operations Center">
            <FleetDashboard fleet={fleet} />
          </ErrorBoundary>

          {/* Department popup */}
          {selected &&
            !fleet.active &&
            !journeyOn &&
            !icuDemoOn &&
            !scenario.running && (
              <DepartmentPopup
                deptId={selected}
                statuses={mergedStatuses}
                onClose={() =>
                  setSelectedState(null)
                }
                onDrillIn={(id) => {
                  if (id === "icu" || id === "icuB") {
                    startIcuDemo();
                  }
                }}
              />
            )}

          {/* Presentation story */}
          {presentationMode &&
            !journeyOn &&
            !icuDemoOn && (
              <div className="absolute inset-0 z-20 grid place-items-center bg-[#020a14]/88 p-6 backdrop-blur-[2px]">
                <div className="w-[min(92%,34rem)] border border-violet-400/30 bg-[#0a1020]/95 p-6 text-center shadow-2xl">
                  <div className="font-mono text-[10px] tracking-[0.2em] text-violet-300">
                    PRESENTATION STORY · LEVEL 11
                  </div>

                  <h3 className="mt-2 text-lg font-bold text-white">
                    Imagine a road accident occurs near the hospital.
                  </h3>

                  <div className="mt-3 space-y-1.5 text-left text-[11px] leading-relaxed text-slate-300">
                    <p>
                      <span className="text-cyan-300">
                        1 →
                      </span>{" "}
                      Ambulance dispatched · GPS live · sirens on
                    </p>

                    <p>
                      <span className="text-cyan-300">
                        2 →
                      </span>{" "}
                      Patient admitted · triage · ID generated
                    </p>

                    <p>
                      <span className="text-cyan-300">
                        3 →
                      </span>{" "}
                      CT & Labs → Radiology & Blood Bank
                    </p>

                    <p>
                      <span className="text-cyan-300">
                        4 →
                      </span>{" "}
                      Granite predicts deterioration (95% conf)
                    </p>

                    <p>
                      <span className="text-cyan-300">
                        5 →
                      </span>{" "}
                      RAG retrieves SOP-ICU-17 + WHO bundle
                    </p>

                    <p>
                      <span className="text-cyan-300">
                        6 →
                      </span>{" "}
                      Agentic AI assigns 1:1 nurse, ventilator, blood, ICU-B
                    </p>

                    <p>
                      <span className="text-cyan-300">
                        7 →
                      </span>{" "}
                      Doctors follow · vitals recover · bed released
                    </p>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        setPresentationMode(false);
                        startJourney();
                      }}
                      className="bg-gradient-to-r from-violet-500 to-cyan-500 py-2 text-[11px] font-bold text-white"
                    >
                      ▶ PLAY FULL STORY (102 s)
                    </button>

                    <button
                      onClick={() => {
                        setPresentationMode(false);
                        startIcuDemo();
                      }}
                      className="border border-violet-400/40 bg-violet-500/15 py-2 text-[11px] font-bold text-violet-200"
                    >
                      ▶ PLAY ICU-04 STORY
                    </button>
                  </div>

                  <button
                    onClick={() =>
                      setPresentationMode(false)
                    }
                    className="mt-3 text-[10px] text-slate-500 hover:text-slate-300"
                  >
                    Close story
                  </button>
                </div>
              </div>
            )}

          {exportNotice && (
            <div className="pointer-events-none absolute bottom-16 left-1/2 z-30 -translate-x-1/2 border border-emerald-400/30 bg-slate-950/90 px-4 py-2 font-mono text-[10px] text-emerald-300 shadow-2xl backdrop-blur">
              {exportNotice}
            </div>
          )}
        </main>

        {icuDemoOn ? (
          <IcuDemoPanel demo={icuDemo} />
        ) : journeyOn ? (
          <PatientPanel j={journey} />
        ) : (
          <DetailPanel
            selectedId={selected}
            liveStatuses={mergedStatuses}
            cameraMode={cameraMode}
            selectedRoom={selectedRoom}
            onToggleInterior={toggleInterior}
          />
        )}
      </div>
    </div>
  );
}
