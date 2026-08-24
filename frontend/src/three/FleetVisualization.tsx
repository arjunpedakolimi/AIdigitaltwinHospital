import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { AmbulanceUnit } from "../hooks/useFleet";

/* ── Convert fleet [x, z] to 3D world coordinates ── */
function fleetToWorld(pos: [number, number]): [number, number, number] {
  return [pos[0] * 1.5, 0.5, 36 + (pos[1] - 36) * 1.5];
}

/* ── Animated ambulance in 3D (pure meshes — no dynamic geometry) ── */
function Ambulance3D({ unit, follow }: { unit: AmbulanceUnit; follow: boolean }) {
  const group = useRef<THREE.Group>(null);
  const [x, y, z] = useMemo(() => fleetToWorld(unit.position), [unit.position[0], unit.position[1]]);

  useFrame(() => {
    if (group.current) group.current.position.set(x, y, z);
  });

  const isActive = unit.status === "critical" || unit.status === "en_route" || unit.status === "onboard";

  return (
    <group ref={group} name={`ambulance-${unit.id}`}>
      <mesh position={[0, 0.72, 0]} castShadow>
        <boxGeometry args={[1.4, 1.2, 2.6]} />
        <meshStandardMaterial color="#f4f6f5" roughness={0.4} metalness={0.2} />
      </mesh>
      <mesh position={[0, 0.58, 1.4]} castShadow>
        <boxGeometry args={[1.35, 0.85, 0.9]} />
        <meshStandardMaterial color="#e9eeee" roughness={0.4} />
      </mesh>
      {/* Red cross */}
      <mesh position={[0.72, 0.65, 0]}>
        <boxGeometry args={[0.02, 0.35, 0.1]} />
        <meshStandardMaterial color="#e11d48" emissive="#e11d48" emissiveIntensity={0.8} />
      </mesh>
      <mesh position={[0.72, 0.65, 0]}>
        <boxGeometry args={[0.02, 0.1, 0.35]} />
        <meshStandardMaterial color="#e11d48" emissive="#e11d48" emissiveIntensity={0.8} />
      </mesh>
      {/* Siren lights */}
      <mesh position={[-0.27, 1.42, 0.68]}>
        <boxGeometry args={[0.32, 0.1, 0.2]} />
        <meshStandardMaterial color={isActive ? "#ff314e" : "#475569"} emissive={isActive ? "#ff1c40" : "#000"} emissiveIntensity={isActive ? 3 : 0} />
      </mesh>
      <mesh position={[0.27, 1.42, 0.68]}>
        <boxGeometry args={[0.32, 0.1, 0.2]} />
        <meshStandardMaterial color={isActive ? "#2686ff" : "#475569"} emissive={isActive ? "#1475ff" : "#000"} emissiveIntensity={isActive ? 3 : 0} />
      </mesh>
      {/* Wheels */}
      {[[-0.7, 0.25, 1.05], [0.7, 0.25, 1.05], [-0.7, 0.25, -1.05], [0.7, 0.25, -1.05]].map((w, i) => (
        <mesh key={i} position={w as [number, number, number]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.22, 0.22, 0.16, 12]} />
          <meshStandardMaterial color="#1e293b" roughness={0.8} />
        </mesh>
      ))}
      {/* Status ring on the ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[0.95, 1.15, 24]} />
        <meshBasicMaterial
          color={unit.status === "critical" ? "#ff4d5e" : unit.status === "en_route" ? "#38bdf8" : unit.status === "onboard" ? "#f5c542" : unit.status === "returning" ? "#a78bfa" : "#20d991"}
          transparent
          opacity={follow ? 0.85 : 0.4}
          depthWrite={false}
        />
      </mesh>
      {/* Follow beacon */}
      {follow && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
          <ringGeometry args={[1.2, 1.5, 24]} />
          <meshBasicMaterial color="#22d3ee" transparent opacity={0.5} depthWrite={false} />
        </mesh>
      )}
      {/* Label */}
      <Html position={[0, 2.3, 0]} center distanceFactor={16}>
        <div className={`pointer-events-none whitespace-nowrap border px-2 py-1 font-mono text-[8px] font-bold shadow-lg backdrop-blur ${unit.status === "critical" ? "border-rose-400/50 bg-rose-500/25 text-rose-100" : unit.status === "en_route" ? "border-cyan-400/50 bg-cyan-500/20 text-cyan-100" : unit.status === "onboard" ? "border-amber-400/50 bg-amber-500/20 text-amber-100" : "border-white/10 bg-black/50 text-slate-200"}`}>
          {unit.label} {unit.speed > 0 && <span className="ml-1">{unit.speed} km/h</span>} {unit.etaMinutes > 0 && <span className="ml-1 text-amber-200">ETA {unit.etaMinutes}s</span>}
          {follow && <span className="ml-1 animate-pulse text-cyan-200">● FOLLOW</span>}
        </div>
      </Html>
    </group>
  );
}

/* ── Route line from ambulance to hospital (straight, cheap, stable) ── */
function RouteLine({ unit, optimized }: { unit: AmbulanceUnit; optimized: boolean }) {
  const [x, , z] = fleetToWorld(unit.position);
  // Round so geometry is only recreated when the unit actually moves a step.
  const rx = Math.round(x * 4) / 4;
  const rz = Math.round(z * 4) / 4;

  const pts = useMemo<[number, number, number][]>(() => {
    const sx = rx;
    const sz = rz;
    const midX = (sx + 0) / 2 + (optimized ? -1.5 : 2);
    const midZ = (sz + 36) / 2 + (optimized ? -2 : 3);
    return [
      [sx, 0.6, sz] as [number, number, number],
      [midX, 0.6, midZ] as [number, number, number],
      [0, 0.6, 36] as [number, number, number],
    ];
  }, [rx, rz, optimized]);

  if (unit.status !== "en_route" && unit.status !== "critical" && unit.status !== "onboard") return null;

  const color = optimized ? "#38bdf8" : unit.status === "critical" ? "#ff4d5e" : "#a78bfa";

  return (
    <group>
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[new Float32Array(pts.flat()), 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial color={color} transparent opacity={0.55} />
      </line>
      {/* Midpoint pulse */}
      <mesh position={[pts[1][0], pts[1][1], pts[1][2]]}>
        <sphereGeometry args={[0.16, 8, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} />
      </mesh>
    </group>
  );
}

/* ── Traffic Layer ── */
function TrafficLayer() {
  const zones = useMemo(() => [
    { pos: [6, 42], color: "#f5c542", label: "Moderate" },
    { pos: [-4, 48], color: "#20d991", label: "Free" },
    { pos: [3, 50], color: "#f5c542", label: "Moderate" },
  ], []);
  return (
    <group>
      {zones.map((t, i) => (
        <Html key={i} position={[t.pos[0] * 1.5, 2.5, 36 + (t.pos[1] - 36) * 1.5]} center distanceFactor={16}>
          <div className="pointer-events-none whitespace-nowrap border border-white/10 bg-black/60 px-2 py-1 font-mono text-[7px] text-slate-300 backdrop-blur">
            <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full" style={{ background: t.color }} />
            {t.label}
          </div>
        </Html>
      ))}
    </group>
  );
}

/* ── Main Fleet Visualization Component ── */
export function FleetVisualization({ units, followUnitId }: { units: AmbulanceUnit[]; followUnitId: string | null }) {
  return (
    <group name="fleet_visualization">
      {units.map((u) => (
        <group key={u.id}>
          <Ambulance3D unit={u} follow={followUnitId === u.id} />
          <RouteLine unit={u} optimized={u.routeOptimized} />
        </group>
      ))}
      <TrafficLayer />
    </group>
  );
}
