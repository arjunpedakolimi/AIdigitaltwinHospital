import { useMemo, useRef } from "react";
import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Phase } from "../data/scenario";
import { Ambulance, Person } from "./Environment";

const ACTIVE_RESPONSE: Phase[] = ["emergency", "patients", "icuCritical", "aiPredict", "rag", "aiRecommend", "deploy"];
const ACTIVE_PATIENTS: Phase[] = ["patients", "icuCritical", "aiPredict", "rag", "aiRecommend"];

function PoliceCar({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  const lights = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!lights.current) return;
    lights.current.children.forEach((node, i) => {
      const material = (node as THREE.Mesh).material as THREE.MeshStandardMaterial;
      material.emissiveIntensity = (Math.sin(state.clock.elapsedTime * 15) > 0) === (i === 0) ? 5 : 0.2;
    });
  });
  return (
    <group position={position} rotation={[0, rotation, 0]} name="police_response_vehicle">
      <mesh position={[0, 0.45, 0]} castShadow><boxGeometry args={[1.55, 0.58, 3.1]} /><meshPhysicalMaterial color="#18283a" metalness={0.6} roughness={0.22} clearcoat={0.75} /></mesh>
      <mesh position={[0, 0.82, -0.1]} castShadow><boxGeometry args={[1.25, 0.58, 1.45]} /><meshPhysicalMaterial color="#d9e1e5" metalness={0.55} roughness={0.2} /></mesh>
      <group ref={lights} position={[0, 1.14, 0]}>
        <mesh position={[-0.22, 0, 0]}><boxGeometry args={[0.4, 0.1, 0.18]} /><meshStandardMaterial color="#ef314e" emissive="#ef314e" /></mesh>
        <mesh position={[0.22, 0, 0]}><boxGeometry args={[0.4, 0.1, 0.18]} /><meshStandardMaterial color="#2384ff" emissive="#2384ff" /></mesh>
      </group>
    </group>
  );
}

function AccidentScene({ visible }: { visible: boolean }) {
  return (
    <group visible={visible} position={[0, 0, 50]} name="road_accident_scene">
      <group position={[-2.3, 0, 0]} rotation={[0, 0.35, 0]}>
        <mesh position={[0, 0.45, 0]} castShadow><boxGeometry args={[1.55, 0.72, 3.1]} /><meshPhysicalMaterial color="#653b3c" metalness={0.55} roughness={0.34} clearcoat={0.4} /></mesh>
        <mesh position={[0, 0.85, -0.15]}><boxGeometry args={[1.2, 0.45, 1.35]} /><meshStandardMaterial color="#202b32" metalness={0.6} roughness={0.16} /></mesh>
      </group>
      <group position={[1.5, 0, -0.4]} rotation={[0, -0.62, 0]}>
        <mesh position={[0, 0.45, 0]} castShadow><boxGeometry args={[1.5, 0.68, 2.9]} /><meshPhysicalMaterial color="#a2a8aa" metalness={0.6} roughness={0.3} /></mesh>
        <mesh position={[0, 0.82, 0]}><boxGeometry args={[1.15, 0.42, 1.2]} /><meshStandardMaterial color="#182631" metalness={0.6} roughness={0.15} /></mesh>
      </group>
      <PoliceCar position={[-5.4, 0, 2.7]} rotation={0.35} />
      {Array.from({ length: 7 }).map((_, i) => (
        <mesh key={i} position={[-4.2 + i * 1.3, 0.28, 3.5 + Math.sin(i) * 0.4]}>
          <coneGeometry args={[0.18, 0.55, 16]} />
          <meshStandardMaterial color="#ef7d32" roughness={0.72} />
        </mesh>
      ))}
      <pointLight position={[-5.4, 2, 2.7]} color="#3c8fff" intensity={18} distance={10} />
    </group>
  );
}

function StretcherTeam({ active, offset }: { active: boolean; offset: number }) {
  const group = useRef<THREE.Group>(null);
  const curve = useMemo(() => new THREE.CatmullRomCurve3([
    new THREE.Vector3(-14.5, 0, 18 + offset),
    new THREE.Vector3(-16, 0, 17 + offset * 0.5),
    new THREE.Vector3(-19.5, 0, 19),
  ]), [offset]);
  useFrame((state) => {
    if (!group.current) return;
    group.current.visible = active;
    if (!active) return;
    const p = (state.clock.elapsedTime * 0.11 + offset * 0.08) % 1;
    group.current.position.copy(curve.getPoint(p));
    const tangent = curve.getTangent(p);
    group.current.rotation.y = Math.atan2(tangent.x, tangent.z);
  });
  return (
    <group ref={group} name="patient_stretcher_team">
      <mesh position={[0, 0.72, 0]} castShadow><boxGeometry args={[0.72, 0.12, 2.05]} /><meshPhysicalMaterial color="#dce5e5" metalness={0.35} roughness={0.35} /></mesh>
      <mesh position={[0, 0.9, 0]}><capsuleGeometry args={[0.18, 1.05, 5, 10]} /><meshStandardMaterial color="#7bafc7" roughness={0.72} /></mesh>
      {[-0.34, 0.34].flatMap((x) => [-0.75, 0.75].map((z) => <mesh key={`${x}-${z}`} position={[x, 0.28, z]} rotation={[0, 0, Math.PI / 2]}><torusGeometry args={[0.14, 0.035, 8, 16]} /><meshStandardMaterial color="#29333b" metalness={0.55} /></mesh>))}
      <Person position={[-0.62, 0, 0.75]} color="#e8f2f3" scale={0.82} />
      <Person position={[0.62, 0, -0.75]} color="#4d9fc3" scale={0.82} />
    </group>
  );
}

function DeployedStaff({ active }: { active: boolean }) {
  const people = useMemo(() => Array.from({ length: 8 }, (_, i) => ({ offset: i / 8, lane: (i % 3 - 1) * 0.45 })), []);
  const refs = useRef<THREE.Group[]>([]);
  const curve = useMemo(() => new THREE.CatmullRomCurve3([
    new THREE.Vector3(-7, 0, -2), new THREE.Vector3(-15, 0, -6), new THREE.Vector3(-25, 0, -10), new THREE.Vector3(-31, 0, -12),
  ]), []);
  useFrame((state) => {
    refs.current.forEach((group, i) => {
      group.visible = active;
      if (!active) return;
      const p = Math.min(1, ((state.clock.elapsedTime * 0.18 + people[i].offset) % 1.35));
      const point = curve.getPoint(Math.min(1, p));
      group.position.set(point.x + people[i].lane, 0, point.z + people[i].lane * 0.4);
    });
  });
  return (
    <group name="deployed_clinical_staff">
      {people.map((_, i) => <group key={i} ref={(node) => { if (node) refs.current[i] = node; }}><Person position={[0, 0, 0]} color={i % 3 === 0 ? "#4ba8d1" : "#edf4f4"} scale={0.84} /></group>)}
    </group>
  );
}

function EmergencyClinicalTeams({ active }: { active: boolean }) {
  const refs = useRef<THREE.Group[]>([]);
  const responders = useMemo(() => Array.from({ length: 7 }, (_, index) => ({
    delay: index * 0.11,
    lane: (index % 3 - 1) * 0.42,
    color: index % 3 === 0 ? "#f5f8f8" : "#2997c8",
  })), []);
  const curve = useMemo(() => new THREE.CatmullRomCurve3([
    new THREE.Vector3(-7, 0, 12.7),
    new THREE.Vector3(-11, 0, 12.7),
    new THREE.Vector3(-15, 0, 14),
    new THREE.Vector3(-18.2, 0, 17.5),
  ]), []);
  useFrame((state) => {
    refs.current.forEach((group, index) => {
      if (!group) return;
      group.visible = active;
      if (!active) return;
      const configuration = responders[index];
      const p = Math.min(0.995, (state.clock.elapsedTime * 0.22 + configuration.delay) % 1.15);
      const point = curve.getPoint(Math.min(1, p));
      const tangent = curve.getTangent(Math.min(0.999, p));
      group.position.set(point.x + configuration.lane, Math.abs(Math.sin(state.clock.elapsedTime * 7 + index)) * 0.04, point.z);
      group.rotation.y = Math.atan2(tangent.x, tangent.z);
    });
  });
  return (
    <group name="emergency_clinical_response">
      {responders.map((responder, index) => (
        <group key={index} ref={(node) => { if (node) refs.current[index] = node; }}>
          <Person position={[0, 0, 0]} color={responder.color} scale={0.86 + index % 2 * 0.04} />
          {index === 0 && <mesh position={[0.32, 0.85, 0]}><boxGeometry args={[0.28, 0.42, 0.04]} /><meshStandardMaterial color="#142735" /></mesh>}
        </group>
      ))}
    </group>
  );
}

function OccupancyMeter({ phase }: { phase: Phase }) {
  const occupancy = phase === "icuCritical" || phase === "aiPredict" || phase === "rag" || phase === "aiRecommend" ? 96 : phase === "deploy" ? 86 : phase === "recovery" ? 78 : 70;
  const color = occupancy > 90 ? "#ff5266" : occupancy > 80 ? "#f4c849" : "#20d991";
  return (
    <Html position={[-20, 10.5, 0]} center distanceFactor={28} zIndexRange={[8, 0]}>
      <div className="pointer-events-none w-36 border border-white/10 bg-[#06101bed] p-2 shadow-2xl backdrop-blur-lg">
        <div className="flex items-center justify-between font-mono text-[8px] text-slate-300"><span>ICU-A OCCUPANCY</span><span style={{ color }}>{occupancy}%</span></div>
        <div className="mt-1 h-1 overflow-hidden bg-white/10"><div className="h-full transition-all duration-1000" style={{ width: `${occupancy}%`, background: color, boxShadow: `0 0 8px ${color}` }} /></div>
        <div className="mt-1 flex justify-between font-mono text-[7px] text-slate-500"><span>VENT 11/12</span><span>O2 4.2 BAR</span></div>
      </div>
    </Html>
  );
}

export function SimulationActors({ phase }: { phase: Phase }) {
  const accidentVisible = phase !== "normal" && phase !== "idle" && phase !== "stabilized";
  const responseActive = ACTIVE_RESPONSE.includes(phase);
  const patientActive = ACTIVE_PATIENTS.includes(phase);
  const deployActive = phase === "deploy" || phase === "recovery";
  return (
    <group name="emergency_simulation_actors">
      <AccidentScene visible={accidentVisible} />
      <Ambulance position={[-15, 0, 14]} rotation={Math.PI / 2} emergency={responseActive} />
      <StretcherTeam active={patientActive} offset={0} />
      <StretcherTeam active={patientActive} offset={2.2} />
      <EmergencyClinicalTeams active={responseActive} />
      <DeployedStaff active={deployActive} />
      <OccupancyMeter phase={phase} />
    </group>
  );
}