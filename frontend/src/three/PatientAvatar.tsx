import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { JOURNEY_WAYPOINTS, RISK_META, RiskLevel } from "../data/patientJourney";
import { Ambulance, Person } from "./Environment";

/** Ambulance driving from the main gate into the ER bay during step 1. */
function JourneyAmbulance({ active, progress }: { active: boolean; progress: number }) {
  const group = useRef<THREE.Group>(null);
  const path = useMemo(() => new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 52),
    new THREE.Vector3(0, 0, 38),
    new THREE.Vector3(-2, 0, 30),
    new THREE.Vector3(-12, 0, 25),
    new THREE.Vector3(-19, 0, 22),
    new THREE.Vector3(-19, 0, 16),
  ]), []);
  const local = useRef(0);

  useFrame((_, delta) => {
    if (!group.current) return;
    const target = active ? Math.min(1, progress) : 0;
    local.current = THREE.MathUtils.damp(local.current, target, 2.2, delta);
    group.current.visible = active || local.current > 0.02;
    const p = THREE.MathUtils.clamp(local.current, 0.001, 0.999);
    const pos = path.getPoint(p);
    const tan = path.getTangent(p);
    group.current.position.copy(pos);
    group.current.rotation.y = Math.atan2(tan.x, tan.z);
  });

  return (
    <group ref={group} name="journey_ambulance">
      <Ambulance position={[0, 0, 0]} rotation={0} emergency={active} />
      {active && <pointLight position={[0, 2, 0]} color="#ff3355" intensity={22} distance={12} />}
    </group>
  );
}

/** Care team that appears beside the patient during treatment steps. */
function CareTeam({ position, active, treating }: { position: [number, number, number]; active: boolean; treating: boolean }) {
  const g = useRef<THREE.Group>(null);
  useFrame((s) => {
    if (!g.current) return;
    g.current.visible = active;
    if (!active) return;
    const t = s.clock.elapsedTime;
    g.current.children.forEach((c, i) => {
      // gentle bobbing + slight orbit around the bed while treating
      const a = t * (treating ? 0.5 : 0.18) + (i * Math.PI * 2) / 3;
      c.position.x = Math.cos(a) * 1.5;
      c.position.z = Math.sin(a) * 1.5;
      c.position.y = Math.abs(Math.sin(t * 4 + i)) * 0.05;
      c.rotation.y = -a + Math.PI / 2;
    });
  });
  return (
    <group ref={g} position={position} name="care_team">
      <group><Person position={[0, 0, 0]} color="#e8f4f6" scale={0.9} /></group>
      <group><Person position={[0, 0, 0]} color="#4ba8d1" scale={0.88} /></group>
      <group><Person position={[0, 0, 0]} color="#f0f4f4" scale={0.86} /></group>
    </group>
  );
}

/** Stretcher / bed carrying the patient, with a live holographic vitals tag. */
export function PatientAvatar({
  stepIndex, stepId, risk, hr, spo2, active, cues,
}: {
  stepIndex: number;
  stepId: number;
  risk: RiskLevel;
  hr: number;
  spo2: number;
  active: boolean;
  cues: string[];
}) {
  const group = useRef<THREE.Group>(null);
  const halo = useRef<THREE.Mesh>(null);
  const beacon = useRef<THREE.Mesh>(null);
  const target = useRef(new THREE.Vector3(0, 0, 34));
  const color = RISK_META[risk].color;

  const inBed = stepId >= 4 && stepId <= 9;
  const treating = cues.includes("treatment_active") || cues.includes("doctor_visit");
  const discharged = stepId === 10;

  useFrame((state, delta) => {
    if (!group.current) return;
    group.current.visible = active;
    if (!active) return;

    const wp = JOURNEY_WAYPOINTS[stepId] ?? JOURNEY_WAYPOINTS[1];
    target.current.set(wp[0], 0, wp[2]);
    group.current.position.lerp(target.current, 1 - Math.exp(-delta * 1.4));

    const t = state.clock.elapsedTime;
    if (halo.current) {
      const m = halo.current.material as THREE.MeshBasicMaterial;
      const rate = risk === "critical" ? 5 : risk === "high" ? 3 : 1.6;
      m.opacity = 0.3 + Math.sin(t * rate) * 0.16;
      halo.current.scale.setScalar(1 + Math.sin(t * rate) * 0.09);
    }
    if (beacon.current) {
      const m = beacon.current.material as THREE.MeshStandardMaterial;
      m.emissiveIntensity = 2.4 + Math.sin(t * (hr / 22)) * 1.6; // pulses with heart rate
    }
  });

  return (
    <group name="patient_journey_actor">
      <JourneyAmbulance active={stepIndex === 0} progress={stepIndex === 0 ? 1 : 0} />

      <group ref={group} position={[0, 0, 34]}>
        {/* ground halo showing acuity */}
        <mesh ref={halo} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.06, 0]}>
          <ringGeometry args={[1.5, 2.3, 48]} />
          <meshBasicMaterial color={color} transparent opacity={0.35} depthWrite={false} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
          <circleGeometry args={[1.5, 40]} />
          <meshBasicMaterial color={color} transparent opacity={0.12} depthWrite={false} />
        </mesh>

        {/* stretcher / ICU bed frame */}
        <group name="patient_bed">
          <mesh position={[0, 0.72, 0]} castShadow>
            <boxGeometry args={[0.86, 0.1, 2.1]} />
            <meshPhysicalMaterial color="#dfe7e8" metalness={0.4} roughness={0.32} />
          </mesh>
          {/* mattress + patient */}
          <mesh position={[0, 0.82, 0]}>
            <boxGeometry args={[0.74, 0.12, 1.96]} />
            <meshStandardMaterial color="#cfe3e8" roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.95, -0.15]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <capsuleGeometry args={[0.2, 0.95, 6, 12]} />
            <meshStandardMaterial color={discharged ? "#a7d8b4" : "#8fb6c9"} roughness={0.72} />
          </mesh>
          <mesh position={[0, 1.0, 0.86]} castShadow>
            <sphereGeometry args={[0.17, 14, 12]} />
            <meshStandardMaterial color="#c69a7c" roughness={0.85} />
          </mesh>
          {/* wheels */}
          {[-0.34, 0.34].flatMap((x) => [-0.82, 0.82].map((z) => (
            <mesh key={`${x}-${z}`} position={[x, 0.2, z]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.13, 0.13, 0.06, 12]} />
              <meshStandardMaterial color="#28323a" metalness={0.5} roughness={0.5} />
            </mesh>
          )))}
          {/* IV pole + bag */}
          <mesh position={[0.5, 1.35, -0.8]} castShadow>
            <cylinderGeometry args={[0.028, 0.028, 1.5, 8]} />
            <meshStandardMaterial color="#9aa7ad" metalness={0.85} roughness={0.24} />
          </mesh>
          <mesh position={[0.5, 1.95, -0.8]}>
            <boxGeometry args={[0.16, 0.3, 0.08]} />
            <meshPhysicalMaterial color="#bfe6ef" transmission={0.55} roughness={0.15} thickness={0.4} />
          </mesh>
          {/* bedside monitor with heartbeat beacon */}
          <mesh position={[-0.62, 1.28, -0.7]} castShadow>
            <boxGeometry args={[0.42, 0.32, 0.09]} />
            <meshStandardMaterial color="#101f2b" />
          </mesh>
          <mesh ref={beacon} position={[-0.62, 1.28, -0.64]}>
            <planeGeometry args={[0.34, 0.24]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={3} />
          </mesh>
          {/* ventilator unit appears once connected */}
          {inBed && stepId >= 8 && (
            <group position={[0.75, 0.6, 0.25]}>
              <mesh castShadow><boxGeometry args={[0.34, 0.72, 0.34]} /><meshPhysicalMaterial color="#e2e9ea" roughness={0.4} /></mesh>
              <mesh position={[0, 0.24, 0.18]}><planeGeometry args={[0.22, 0.16]} /><meshStandardMaterial color="#0d2432" emissive="#22c9ff" emissiveIntensity={1.4} /></mesh>
            </group>
          )}
        </group>

        {/* porter pushing the stretcher while in transit */}
        {!inBed && !discharged && (
          <>
            <Person position={[0, 0, -1.5]} color="#4ba8d1" scale={0.9} />
            <Person position={[0.75, 0, 0.9]} color="#eef4f5" scale={0.88} />
          </>
        )}

        {/* holographic live vitals tag above the patient */}
        <Html position={[0, 3.1, 0]} center distanceFactor={26} zIndexRange={[12, 0]}>
          <div className="pointer-events-none w-40 border-l-2 bg-[#050c14f2] px-2.5 py-2 shadow-2xl backdrop-blur-xl" style={{ borderColor: color }}>
            <div className="flex items-center justify-between">
              <span className="font-mono text-[8px] tracking-[0.16em] text-cyan-300">PT-2026-04871</span>
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
            </div>
            <div className="mt-1 flex items-center justify-between font-mono text-[10px]">
              <span style={{ color }}>♥ {hr}</span>
              <span className="text-cyan-200">SpO₂ {spo2}%</span>
            </div>
            <div className="mt-1 font-mono text-[7px] uppercase tracking-[0.14em]" style={{ color }}>
              {RISK_META[risk].label}
            </div>
          </div>
        </Html>
      </group>

      {/* clinical team gathers at bedside from ICU admission onward */}
      <CareTeam
        position={[JOURNEY_WAYPOINTS[stepId]?.[0] ?? -20, 0, JOURNEY_WAYPOINTS[stepId]?.[2] ?? 0]}
        active={active && inBed}
        treating={treating}
      />
    </group>
  );
}
