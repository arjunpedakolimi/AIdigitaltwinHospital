import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment as HdriEnvironment, Sky } from "@react-three/drei";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import { departments, Status } from "../data/hospital";
import { Phase } from "../data/scenario";
import { Building } from "./Building";
import { CameraMode, CameraRig } from "./CameraRig";
import { RiskLevel, VitalProfile } from "../data/patientJourney";
import { PatientAvatar } from "./PatientAvatar";
import { DepartmentInterior } from "./Interior";
import { IcuDemoRoom } from "./IcuDemoRoom";
import { SimulationActors } from "./SimulationActors";
import { AnimatedTraffic, CampusLife, EmergencyResponseAmbulance, Ground, HospitalBus, NetworkLines, Roads, StreetLights, Trees, WalkingPeople } from "./Environment";
import { FleetVisualization } from "./FleetVisualization";
import { AmbulanceUnit } from "../hooks/useFleet";

function Helicopter({ position }: { position: [number, number, number] }) {
  const rotor = useRef<THREE.Group>(null);
  const tailRotor = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (rotor.current) rotor.current.rotation.y = state.clock.elapsedTime * 18;
    if (tailRotor.current) tailRotor.current.rotation.x = state.clock.elapsedTime * 15;
    if (body.current) body.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.7) * 0.08;
  });
  return (
    <group ref={body} position={position} name="air_ambulance">
      <mesh castShadow rotation={[0, 0, Math.PI / 2]}><capsuleGeometry args={[0.52, 1.7, 12, 24]} /><meshPhysicalMaterial color="#e7ecee" roughness={0.22} metalness={0.35} clearcoat={0.8} /></mesh>
      <mesh position={[0, 0.12, -1.45]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.09, 0.045, 2.1, 10]} /><meshStandardMaterial color="#c63c4d" metalness={0.42} /></mesh>
      <mesh position={[0, 0.18, 0.65]} rotation={[0, 0, Math.PI / 2]}><capsuleGeometry args={[0.36, 0.55, 10, 18]} /><meshPhysicalMaterial color="#18384a" metalness={0.62} roughness={0.08} /></mesh>
      <mesh position={[0.52, -0.12, 0]}><boxGeometry args={[0.03, 0.32, 1.35]} /><meshStandardMaterial color="#c52239" emissive="#741120" emissiveIntensity={0.3} /></mesh>
      <group ref={rotor} name="air_ambulance_main_rotor" position={[0, 0.72, 0]}>
        <mesh><boxGeometry args={[4.5, 0.035, 0.12]} /><meshStandardMaterial color="#202930" metalness={0.72} /></mesh>
        <mesh rotation={[0, Math.PI / 2, 0]}><boxGeometry args={[4.5, 0.035, 0.12]} /><meshStandardMaterial color="#202930" metalness={0.72} /></mesh>
      </group>
      <group ref={tailRotor} position={[0, 0.16, -2.35]}>
        <mesh><boxGeometry args={[0.06, 1.1, 0.1]} /><meshStandardMaterial color="#222b31" /></mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}><boxGeometry args={[0.06, 1.1, 0.1]} /><meshStandardMaterial color="#222b31" /></mesh>
      </group>
      {[-0.58, 0.58].map((x) => <mesh key={x} position={[x, -0.62, 0]}><boxGeometry args={[0.07, 0.07, 2.6]} /><meshStandardMaterial color="#3c474e" metalness={0.82} roughness={0.2} /></mesh>)}
    </group>
  );
}

interface SceneProps {
  selected: string | null;
  selectedRoom: string | null;
  hovered: string | null;
  setSelected: (id: string | null) => void;
  setSelectedRoom: (room: string | null) => void;
  setHovered: (id: string | null) => void;
  liveStatuses: Record<string, Status>;
  focus: string;
  phase: Phase;
  running: boolean;
  cameraMode: CameraMode;
  showLabels: boolean;
  showNetwork: boolean;
  onSceneReady?: (root: THREE.Group) => void;
  dayMode?: boolean;
  rain?: boolean;
  journeyActive?: boolean;
  journeyStepIndex?: number;
  journeyStepId?: number;
  journeyRisk?: RiskLevel;
  journeyHr?: number;
  journeySpo2?: number;
  journeyCues?: string[];
  icuDemoActive?: boolean;
  icuDemoStage?: number;
  icuDemoAcuity?: "stable" | "observation" | "high" | "critical" | "ready";
  icuDemoVitals?: VitalProfile;
  icuDemoAwaitingSelection?: boolean;
  icuDemoCues?: string[];
  icuDemoSelectedBed?: string;
  icuDemoPatients?: import("../data/icuDemo").IcuPatient[];
  onSelectIcu04?: (bed: string) => void;
  fleetActive?: boolean;
  fleetUnits?: AmbulanceUnit[];
  fleetFollowId?: string | null;
}

function RainParticles() {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 1500;
  
  const [positions, speeds] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 115;
      pos[i * 3 + 1] = Math.random() * 45;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 115;
      spd[i] = 16 + Math.random() * 18;
    }
    return [pos, spd];
  }, []);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    const geo = pointsRef.current.geometry;
    const attr = geo.attributes.position;
    for (let i = 0; i < count; i++) {
      let y = attr.getY(i);
      y -= speeds[i] * delta;
      if (y < 0) {
        y = 45;
        attr.setX(i, (Math.random() - 0.5) * 115);
        attr.setZ(i, (Math.random() - 0.5) * 115);
      }
      attr.setY(i, y);
    }
    attr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#a5f3fc"
        size={0.15}
        transparent
        opacity={0.65}
        sizeAttenuation
      />
    </points>
  );
}

function SceneContent(props: SceneProps) {
  const {
    selected, selectedRoom, hovered, setSelected, setSelectedRoom, setHovered,
    liveStatuses, focus, phase, running, cameraMode, showLabels, showNetwork, onSceneReady,
    dayMode = true, rain = false,
    journeyActive = false, journeyStepIndex = -1, journeyStepId = 1,
    journeyRisk = "critical", journeyHr = 120, journeySpo2 = 90, journeyCues = [],
    icuDemoActive = false, icuDemoStage = 1, icuDemoAcuity = "stable",
    icuDemoVitals, icuDemoAwaitingSelection = false, icuDemoCues = [], onSelectIcu04,
    icuDemoSelectedBed, icuDemoPatients,
    fleetActive = false, fleetUnits = [], fleetFollowId = null,
  } = props;

  // Fleet follow camera
  const followCamTarget = useRef(new THREE.Vector3());
  const followCamPos = useRef(new THREE.Vector3());
  useFrame((state) => {
    if (fleetActive && fleetFollowId) {
      const unit = fleetUnits.find((u) => u.id === fleetFollowId);
      if (unit) {
        const [wx, , wz] = [unit.position[0] * 1.5, 0, 36 + (unit.position[1] - 36) * 1.5];
        followCamTarget.current.set(wx, 1, wz);
        followCamPos.current.set(wx + 8, 10, wz + 12);
        state.camera.position.lerp(followCamPos.current, 0.05);
        // The OrbitControls target is handled by CameraRig's internal logic
      }
    }
  });
  const exportRoot = useRef<THREE.Group>(null);
  const interiorDept = departments.find((department) => department.id === selected) ?? departments[0];
  const interiorMode = cameraMode === "interior" || icuDemoActive;
  const demoVitals = icuDemoVitals ?? { hr: 84, sbp: 122, dbp: 76, spo2: 98, rr: 16, temp: 36.8, o2: 2, vent: "Room air", news: 1 };

  useEffect(() => {
    if (exportRoot.current && onSceneReady) onSceneReady(exportRoot.current);
  }, [onSceneReady]);

  const networkTargets = useMemo(() => departments
    .filter((department) => department.id !== "command")
    .map((department) => ({
      pos: department.position,
      color: liveStatuses[department.id] === "critical" ? "#ff5266" : liveStatuses[department.id] === "busy" ? "#f4c849" : "#20d991",
    })), [liveStatuses]);
  const responseActive = ["emergency", "patients", "icuCritical", "aiPredict", "rag", "aiRecommend", "deploy"].includes(phase);

  const bgColor = interiorMode ? "#07101a" : dayMode ? "#9eb3bd" : "#03070c";
  const fogColor = dayMode ? "#9eb3bd" : "#03070c";

  return (
    <>
      <color attach="background" args={[bgColor]} />
      {!interiorMode && <fog attach="fog" args={[fogColor, 85, 175]} />}
      {!interiorMode && dayMode && <Sky distance={450000} sunPosition={[55, 45, 25]} inclination={0.49} azimuth={0.2} rayleigh={1.15} turbidity={6.5} mieCoefficient={0.005} mieDirectionalG={0.78} />}

      <ambientLight intensity={interiorMode ? 0.9 : dayMode ? 0.42 : 0.08} color={dayMode ? "#ffffff" : "#0b1a2d"} />
      <hemisphereLight args={["#eaf7ff", interiorMode ? "#354553" : "#244331", interiorMode ? 1.1 : dayMode ? 0.72 : 0.15]} />
      <directionalLight
        position={[42, 58, 30]} intensity={dayMode ? 2.8 : 0.22} color={dayMode ? "#fff5e7" : "#4a6ca7"} castShadow
        shadow-mapSize-width={2048} shadow-mapSize-height={2048}
        shadow-camera-far={180} shadow-camera-left={-68} shadow-camera-right={68} shadow-camera-top={64} shadow-camera-bottom={-64}
        shadow-bias={-0.00015}
      />
      <directionalLight position={[-35, 24, -20]} intensity={dayMode ? 0.42 : 0.05} color="#8bc7ff" />
      {interiorMode && <rectAreaLight position={[0, 8, 0]} rotation={[-Math.PI / 2, 0, 0]} width={20} height={16} intensity={5} color="#e8faff" />}

      <Suspense fallback={null}><HdriEnvironment preset="city" environmentIntensity={dayMode ? 0.8 : 0.08} /></Suspense>

      <group ref={exportRoot} name="meditwin_smart_hospital_export_root">
        <group name="hospital_campus" visible={!interiorMode}>
          <Ground />
          <Roads />
          <Trees />
          <StreetLights />
          <CampusLife />
          <AnimatedTraffic />
          <WalkingPeople />
          {/* Three staggered ambulances follow the actual gate → boulevard → ER route. */}
          <EmergencyResponseAmbulance active={responseActive} delay={0} laneOffset={0} />
          <EmergencyResponseAmbulance active={responseActive} delay={2.4} laneOffset={-0.72} />
          <EmergencyResponseAmbulance active={responseActive} delay={4.8} laneOffset={0.72} />
          {rain && <RainParticles />}
          <HospitalBus position={[-39, 0, -37]} rotation={Math.PI / 2} />
          <NetworkLines targets={networkTargets} active={showNetwork} />
          <SimulationActors phase={phase} />
          <PatientAvatar
            stepIndex={journeyStepIndex}
            stepId={journeyStepId}
            risk={journeyRisk}
            hr={journeyHr}
            spo2={journeySpo2}
            active={journeyActive && journeyStepIndex >= 0}
            cues={journeyCues}
          />
          <Helicopter position={[6, 10.2, -17]} />
          {fleetActive && <FleetVisualization units={fleetUnits} followUnitId={fleetFollowId} />}
          {departments.map((department) => (
            <Building
              key={department.id}
              dept={department}
              selected={selected === department.id}
              hovered={hovered === department.id}
              liveStatus={liveStatuses[department.id] ?? department.status}
              focused={running && focus === department.id}
              showLabels={showLabels}
              selectedRoom={selectedRoom}
              onSelectRoom={setSelectedRoom}
              onSelect={setSelected}
              onHover={setHovered}
            />
          ))}
          <ContactShadows position={[0, 0.04, 0]} opacity={0.42} scale={120} blur={2.5} far={28} color="#1a2324" />
        </group>

        <group name={`active_interior_${interiorDept.id}`} visible={interiorMode && !icuDemoActive}>
          <DepartmentInterior dept={interiorDept} selectedRoom={selectedRoom} onSelectRoom={setSelectedRoom} />
          <ContactShadows position={[0, 0.02, 0]} opacity={0.5} scale={32} blur={1.8} far={12} color="#000000" />
        </group>
        <group name="icu04_interactive_demo" visible={icuDemoActive}>
          <IcuDemoRoom
            stageId={icuDemoStage}
            acuity={icuDemoAcuity}
            vitals={demoVitals}
            active={icuDemoActive}
            awaitingSelection={icuDemoAwaitingSelection}
            cues={icuDemoCues}
            onSelectIcu04={(bed) => onSelectIcu04?.(bed)}
            selectedBed={icuDemoSelectedBed}
            patients={icuDemoPatients}
          />
          <ContactShadows position={[0, 0.02, 0]} opacity={0.54} scale={36} blur={1.8} far={14} color="#000000" />
        </group>
      </group>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.18, 0]} onClick={() => { setSelected(null); setSelectedRoom(null); }}>
        <planeGeometry args={[300, 300]} /><meshBasicMaterial visible={false} />
      </mesh>

      <CameraRig
        mode={cameraMode}
        focus={focus}
        phase={phase}
        selectedDepartment={selected}
        icuDemoActive={icuDemoActive}
        icuDemoStage={icuDemoStage}
        icuBedSelected={!icuDemoAwaitingSelection}
      />

      <EffectComposer multisampling={4} enabled>
        <Bloom intensity={0.48} luminanceThreshold={0.72} luminanceSmoothing={0.32} mipmapBlur />
        <Vignette eskil={false} offset={0.12} darkness={interiorMode ? 0.58 : 0.28} />
      </EffectComposer>
    </>
  );
}

export function HospitalScene(props: SceneProps) {
  return (
    <Canvas
      shadows={{ type: THREE.PCFSoftShadowMap }}
      dpr={[1, 1.75]}
      camera={{ position: [52, 43, 57], fov: 38, near: 0.08, far: 300 }}
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.03, outputColorSpace: THREE.SRGBColorSpace, powerPreference: "high-performance" }}
    >
      <SceneContent {...props} />
    </Canvas>
  );
}