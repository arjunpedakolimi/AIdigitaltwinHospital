import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { Department, STATUS_COLORS, Status } from "../data/hospital";

import { DepartmentInterior } from "./Interior";
import { Person } from "./Environment";

interface BuildingProps {
  dept: Department;
  selected: boolean;
  hovered: boolean;
  liveStatus?: Status;
  focused?: boolean;
  showLabels?: boolean;
  selectedRoom: string | null;
  onSelectRoom: (room: string | null) => void;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
}

function SolarPanels({ width, depth }: { width: number; depth: number }) {
  const rows = Math.max(1, Math.floor(depth / 2.8));
  const cols = Math.max(1, Math.floor(width / 2.3));
  return (
    <group name="solar_panels">
      {Array.from({ length: rows }).map((_, r) =>
        Array.from({ length: cols }).map((_, c) => {
          const px = -width / 2 + 1.25 + c * 2.3;
          const pz = -depth / 2 + 1.4 + r * 2.8;
          return (
            <group key={`${r}-${c}`} position={[px, 0.05, pz]} rotation={[-0.22, 0, 0]}>
              <mesh position={[0, 0.15, -0.42]} castShadow>
                <cylinderGeometry args={[0.02, 0.02, 0.35, 6]} />
                <meshStandardMaterial color="#475569" metalness={0.7} />
              </mesh>
              <mesh castShadow receiveShadow>
                <boxGeometry args={[1.9, 0.03, 1.3]} />
                <meshPhysicalMaterial color="#0f2136" metalness={0.92} roughness={0.18} clearcoat={1.0} clearcoatRoughness={0.1} />
              </mesh>
              <mesh position={[0, 0.02, 0]}>
                <boxGeometry args={[1.86, 0.005, 1.26]} />
                <meshBasicMaterial color="#38bdf8" wireframe />
              </mesh>
            </group>
          );
        })
      )}
    </group>
  );
}

function RooftopHvac({ position }: { position: [number, number, number] }) {
  const fan = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (fan.current) fan.current.rotation.z = state.clock.elapsedTime * 12;
  });
  return (
    <group position={position} name="hvac_unit">
      <mesh castShadow receiveShadow>
        <boxGeometry args={[2.1, 0.95, 1.5]} />
        <meshPhysicalMaterial color="#94a3b8" metalness={0.75} roughness={0.28} />
      </mesh>
      <mesh position={[0, 0.49, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.55, 0.55, 0.05, 18]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} />
      </mesh>
      <mesh ref={fan} position={[0, 0.52, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <boxGeometry args={[0.9, 0.03, 0.1]} />
        <meshStandardMaterial color="#475569" metalness={0.9} />
      </mesh>
      <mesh position={[0.7, -0.15, 0.82]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.07, 0.07, 0.45, 8]} />
        <meshStandardMaterial color="#64748b" metalness={0.9} />
      </mesh>
      <mesh position={[0.92, -0.38, 0.82]} castShadow>
        <cylinderGeometry args={[0.07, 0.07, 0.45, 8]} />
        <meshStandardMaterial color="#64748b" metalness={0.9} />
      </mesh>
    </group>
  );
}

function useFacadeTexture(floors: number) {
  return useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d")!;
    const gradient = ctx.createLinearGradient(0, 0, 512, 512);
    gradient.addColorStop(0, "#0b2437");
    gradient.addColorStop(0.38, "#32617a");
    gradient.addColorStop(0.52, "#9bc9dc");
    gradient.addColorStop(0.64, "#183c54");
    gradient.addColorStop(1, "#071a2a");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 512);
    ctx.strokeStyle = "rgba(190,225,239,.32)";
    ctx.lineWidth = 4;
    const rows = Math.max(2, floors);
    for (let y = 1; y < rows; y++) {
      ctx.beginPath();
      ctx.moveTo(0, (y / rows) * 512);
      ctx.lineTo(512, (y / rows) * 512);
      ctx.stroke();
    }
    for (let x = 1; x < 8; x++) {
      ctx.beginPath();
      ctx.moveTo((x / 8) * 512, 0);
      ctx.lineTo((x / 8) * 512, 512);
      ctx.stroke();
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;
    return texture;
  }, [floors]);
}

function ParkingDeck({ dept, statusColor }: { dept: Department; statusColor: string }) {
  const [w, , d] = dept.size;
  const rows = Math.max(6, Math.floor(w / 2.2));
  const carColors = ["#d9e0e7", "#263745", "#315b87", "#8a2f3c", "#596573", "#b89d6a"];
  return (
    <group name={`${dept.id}_parking_mesh`}>
      <mesh position={[0, 0.18, 0]} receiveShadow>
        <boxGeometry args={[w, 0.3, d]} />
        <meshStandardMaterial color="#202932" roughness={0.86} metalness={0.06} />
      </mesh>
      {Array.from({ length: rows + 1 }).map((_, i) => (
        <mesh key={`line-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[-w / 2 + i * (w / rows), 0.35, 0]}>
          <planeGeometry args={[0.07, d - 0.8]} />
          <meshStandardMaterial color="#d5dae0" roughness={0.7} />
        </mesh>
      ))}
      {Array.from({ length: Math.min(14, rows * 2) }).map((_, i) => {
        const col = i % Math.min(7, rows);
        const row = Math.floor(i / Math.min(7, rows));
        return (
          <group key={`vehicle-${i}`} position={[-w / 2 + 1.25 + col * (w / Math.min(7, rows)), 0.52, row ? d / 4 : -d / 4]}>
            <mesh castShadow>
              <boxGeometry args={[1.05, 0.48, 1.9]} />
              <meshPhysicalMaterial color={carColors[i % carColors.length]} metalness={0.65} roughness={0.23} clearcoat={0.7} />
            </mesh>
            <mesh position={[0, 0.3, -0.1]}>
              <boxGeometry args={[0.78, 0.27, 0.8]} />
              <meshPhysicalMaterial color="#111d28" metalness={0.7} roughness={0.12} />
            </mesh>
          </group>
        );
      })}
      <mesh position={[0, 0.4, d / 2 - 0.25]}>
        <boxGeometry args={[w * 0.3, 0.07, 0.12]} />
        <meshStandardMaterial color={statusColor} emissive={statusColor} emissiveIntensity={2} />
      </mesh>
    </group>
  );
}

function Helipad({ dept, statusColor }: { dept: Department; statusColor: string }) {
  const [w] = dept.size;
  return (
    <group name="helipad_mesh">
      <mesh position={[0, 0.2, 0]} castShadow>
        <cylinderGeometry args={[w / 2, w / 2, 0.38, 64]} />
        <meshStandardMaterial color="#26313b" roughness={0.78} metalness={0.18} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.42, 0]}>
        <ringGeometry args={[w / 2 - 0.45, w / 2 - 0.16, 64]} />
        <meshStandardMaterial color={statusColor} emissive={statusColor} emissiveIntensity={1.8} />
      </mesh>
      {[-0.78, 0.78].map((x) => (
        <mesh key={x} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.44, 0]}>
          <planeGeometry args={[0.35, 2.7]} />
          <meshStandardMaterial color="#f5cc4b" emissive="#f5cc4b" emissiveIntensity={0.7} />
        </mesh>
      ))}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.44, 0]}>
        <planeGeometry args={[1.35, 0.35]} />
        <meshStandardMaterial color="#f5cc4b" emissive="#f5cc4b" emissiveIntensity={0.7} />
      </mesh>
    </group>
  );
}

function BoomBarrier({ x, color, rot }: { x: number; color: string; rot?: number }) {
  const armRef = useRef<THREE.Group>(null);
  useFrame((s) => {
    // gently animate the barrier arm
    if (armRef.current) armRef.current.rotation.x = -0.12 + Math.sin(s.clock.elapsedTime * 0.5) * 0.06;
  });
  return (
    <group position={[x, 0, 0]}>
      {/* post */}
      <mesh castShadow position={[0, 0.8, 0]}><boxGeometry args={[0.22, 1.6, 0.22]} /><meshStandardMaterial color="#2a343e" metalness={0.7} roughness={0.3} /></mesh>
      {/* control box */}
      <mesh castShadow position={[0, 1.55, 0.18]}><boxGeometry args={[0.28, 0.28, 0.12]} /><meshStandardMaterial color="#1e2d3a" /></mesh>
      <mesh position={[0, 1.55, 0.26]}><planeGeometry args={[0.16, 0.1]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={2.5} /></mesh>
      {/* boom arm */}
      <group ref={armRef} position={[0, 1.62, 0]}>
        <mesh castShadow position={[1.9, 0.05, 0]} rotation={[0, 0, rot ?? 0]}>
          <boxGeometry args={[3.8, 0.12, 0.1]} />
          <meshStandardMaterial color="#f5c542" emissive="#b8960a" emissiveIntensity={0.2} />
        </mesh>
        {/* red/white stripes on arm */}
        {[0.4, 1.2, 2.0, 2.8].map((px, i) => (
          <mesh key={i} castShadow position={[px + 0.15, 0.05, 0]}>
            <boxGeometry args={[0.25, 0.12, 0.11]} />
            <meshStandardMaterial color={i % 2 === 0 ? "#dc2626" : "#ffffff"} />
          </mesh>
        ))}
        {/* light at tip */}
        <mesh position={[3.85, 0.05, 0]}><sphereGeometry args={[0.08, 8, 8]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={3} /></mesh>
      </group>
    </group>
  );
}

function AnprCamera({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh castShadow position={[0, 2.6, 0]}><cylinderGeometry args={[0.03, 0.05, 5.2, 8]} /><meshStandardMaterial color="#4b545a" metalness={0.8} /></mesh>
      <mesh castShadow position={[0, 5.2, 0.14]} rotation={[0.4, 0, 0]}><boxGeometry args={[0.18, 0.14, 0.22]} /><meshStandardMaterial color="#0f172a" /></mesh>
      <mesh position={[0, 5.2, 0.25]} rotation={[0.4, 0, 0]}><circleGeometry args={[0.05, 10]} /><meshStandardMaterial color="#e11d48" emissive="#e11d48" emissiveIntensity={2} /></mesh>
    </group>
  );
}

/** Security guard who steps out of the booth to check each arriving vehicle. */
function PatrollingGuard() {
  const ref = useRef<THREE.Group>(null);
  const armRef = useRef<THREE.Group>(null);
  useFrame((s) => {
    const t = s.clock.elapsedTime;
    // 12s cycle: idle at booth -> walk to IN lane -> inspect -> walk back
    const cycle = (t % 12) / 12;
    let x = 6.4;
    let z = 1.2;
    let facing = Math.PI;
    let checking = false;
    if (cycle < 0.18) {
      // standing at booth
      x = 6.4; z = 1.2;
    } else if (cycle < 0.34) {
      const p = (cycle - 0.18) / 0.16;
      x = THREE.MathUtils.lerp(6.4, -4.5, p);
      z = THREE.MathUtils.lerp(1.2, 2.4, p);
      facing = -Math.PI / 2;
    } else if (cycle < 0.62) {
      // inspecting the vehicle at the IN lane
      x = -4.5; z = 2.4; facing = 0; checking = true;
    } else if (cycle < 0.8) {
      const p = (cycle - 0.62) / 0.18;
      x = THREE.MathUtils.lerp(-4.5, 6.4, p);
      z = THREE.MathUtils.lerp(2.4, 1.2, p);
      facing = Math.PI / 2;
    }
    if (ref.current) {
      ref.current.position.set(x, 0, z);
      ref.current.rotation.y = facing;
      // walking bob
      const moving = (cycle >= 0.18 && cycle < 0.34) || (cycle >= 0.62 && cycle < 0.8);
      ref.current.position.y = moving ? Math.abs(Math.sin(t * 9)) * 0.05 : 0;
    }
    // raise the clipboard arm while checking
    if (armRef.current) {
      armRef.current.rotation.x = checking ? -1.1 + Math.sin(t * 2) * 0.12 : -0.2;
    }
  });
  return (
    <group ref={ref} name="security_guard_checking">
      {/* body */}
      <mesh castShadow position={[0, 1.02, 0]}><capsuleGeometry args={[0.2, 0.46, 6, 12]} /><meshStandardMaterial color="#1f2d3d" roughness={0.75} /></mesh>
      {/* hi-vis vest */}
      <mesh position={[0, 1.05, 0]}><capsuleGeometry args={[0.215, 0.3, 6, 12]} /><meshStandardMaterial color="#facc15" emissive="#eab308" emissiveIntensity={0.35} roughness={0.6} /></mesh>
      {/* head */}
      <mesh castShadow position={[0, 1.48, 0]}><sphereGeometry args={[0.15, 14, 12]} /><meshStandardMaterial color="#c9976f" roughness={0.82} /></mesh>
      {/* peaked cap */}
      <mesh castShadow position={[0, 1.58, 0]}><cylinderGeometry args={[0.16, 0.16, 0.09, 12]} /><meshStandardMaterial color="#15304d" /></mesh>
      <mesh position={[0, 1.55, 0.15]}><boxGeometry args={[0.26, 0.03, 0.14]} /><meshStandardMaterial color="#15304d" /></mesh>
      {/* legs */}
      <mesh castShadow position={[-0.09, 0.36, 0]}><capsuleGeometry args={[0.07, 0.44, 4, 8]} /><meshStandardMaterial color="#111c28" /></mesh>
      <mesh castShadow position={[0.09, 0.36, 0]}><capsuleGeometry args={[0.07, 0.44, 4, 8]} /><meshStandardMaterial color="#111c28" /></mesh>
      {/* clipboard arm */}
      <group ref={armRef} position={[0.2, 1.14, 0]}>
        <mesh castShadow position={[0, -0.18, 0.06]} rotation={[0.3, 0, 0]}><capsuleGeometry args={[0.055, 0.3, 4, 8]} /><meshStandardMaterial color="#1f2d3d" /></mesh>
        <mesh castShadow position={[0, -0.34, 0.2]}><boxGeometry args={[0.17, 0.22, 0.02]} /><meshStandardMaterial color="#e8e4d8" /></mesh>
      </group>
      {/* torch glow */}
      <pointLight position={[0, 1.1, 0.3]} color="#ffe9a8" intensity={1.4} distance={3} decay={2} />
    </group>
  );
}

function SecurityGate({ dept, statusColor }: { dept: Department; statusColor: string }) {
  const [w] = dept.size;                 // 18 units wide — matches the entrance road
  const lanes = [
    { x: -4.5, label: "IN", color: "#22d3ee" },
    { x: 4.5, label: "OUT", color: "#f43f5e" },
  ];

  return (
    <group name="security_gate_complex">
      {/* === GATE HOUSE BASE — narrow wall either side of the two lanes === */}
      {[-1, 1].map((side) => (
        <group key={side} position={[side * 7.6, 0, 0]}>
          <mesh castShadow receiveShadow position={[0, 0.6, 0]}>
            <boxGeometry args={[2.8, 1.2, 1.4]} />
            <meshPhysicalMaterial color="#d8dfe3" roughness={0.55} metalness={0.08} clearcoat={0.25} />
          </mesh>
          <mesh position={[0, 1.26, 0]}>
            <boxGeometry args={[2.8, 0.14, 1.4]} />
            <meshStandardMaterial color={statusColor} emissive={statusColor} emissiveIntensity={1.4} />
          </mesh>
        </group>
      ))}

      {/* === CENTRE DIVIDER ISLAND between IN and OUT lanes === */}
      <mesh castShadow receiveShadow position={[0, 0.22, 0]}>
        <boxGeometry args={[1.6, 0.44, 5]} />
        <meshStandardMaterial color="#c8cfd3" roughness={0.7} />
      </mesh>
      {/* island bollards */}
      {[-1.7, 0, 1.7].map((z) => (
        <mesh key={z} castShadow position={[0, 0.72, z]}>
          <cylinderGeometry args={[0.09, 0.09, 0.62, 10]} />
          <meshStandardMaterial color="#f97316" emissive="#ea580c" emissiveIntensity={0.4} />
        </mesh>
      ))}

      {/* === ENTRANCE ARCH spanning both lanes === */}
      <group name="hospital_entrance_arch">
        {[-1, 1].map((side) => (
          <mesh key={side} castShadow position={[side * 8.4, 3.1, 0]}>
            <boxGeometry args={[1.1, 6.2, 1.1]} />
            <meshPhysicalMaterial color="#1e3a5f" metalness={0.25} roughness={0.32} clearcoat={0.6} />
          </mesh>
        ))}
        {/* overhead beam */}
        <mesh castShadow position={[0, 6.4, 0]}>
          <boxGeometry args={[18, 0.75, 0.8]} />
          <meshPhysicalMaterial color="#1e3a5f" metalness={0.3} roughness={0.3} clearcoat={0.55} />
        </mesh>
        {/* glowing name panel */}
        <mesh position={[0, 6.4, 0.44]}>
          <boxGeometry args={[15, 0.62, 0.06]} />
          <meshStandardMaterial color="#0a192f" emissive="#22d3ee" emissiveIntensity={0.4} />
        </mesh>
        <Html position={[0, 6.4, 0.52]} center transform distanceFactor={9}>
          <div className="pointer-events-none select-none whitespace-nowrap font-mono text-[12px] font-black tracking-[0.3em] text-cyan-100" style={{ textShadow: "0 0 14px #22d3ee" }}>
            MEDITWIN HOSPITAL
          </div>
        </Html>
        {/* red cross emblem on top */}
        <group position={[0, 7.25, 0.2]}>
          <mesh><boxGeometry args={[0.72, 0.22, 0.08]} /><meshStandardMaterial color="#dc2626" emissive="#dc2626" emissiveIntensity={0.9} /></mesh>
          <mesh><boxGeometry args={[0.22, 0.72, 0.08]} /><meshStandardMaterial color="#dc2626" emissive="#dc2626" emissiveIntensity={0.9} /></mesh>
        </group>
      </group>

      {/* === GUARD BOOTH — right side, glass fronted === */}
      <group position={[7.6, 0, 2.2]} name="guard_booth">
        <mesh castShadow position={[0, 1.45, 0]}>
          <boxGeometry args={[2.4, 2.9, 2.4]} />
          <meshPhysicalMaterial color="#e8edf0" metalness={0.12} roughness={0.42} clearcoat={0.35} />
        </mesh>
        {/* glass on the lane-facing sides */}
        <mesh position={[-1.22, 1.65, 0]}>
          <boxGeometry args={[0.05, 1.2, 1.8]} />
          <meshPhysicalMaterial color="#7dd3fc" metalness={0.55} roughness={0.08} transmission={0.45} transparent opacity={0.8} />
        </mesh>
        <mesh position={[0, 1.65, -1.22]}>
          <boxGeometry args={[1.8, 1.2, 0.05]} />
          <meshPhysicalMaterial color="#7dd3fc" metalness={0.55} roughness={0.08} transmission={0.45} transparent opacity={0.8} />
        </mesh>
        {/* roof + light */}
        <mesh castShadow position={[0, 2.98, 0]}>
          <boxGeometry args={[2.7, 0.2, 2.7]} />
          <meshStandardMaterial color="#334155" metalness={0.5} roughness={0.4} />
        </mesh>
        <mesh position={[0, 2.25, 0]}><sphereGeometry args={[0.13, 8, 8]} /><meshStandardMaterial color="#fffde0" emissive="#fffde0" emissiveIntensity={2} /></mesh>
        <pointLight position={[0, 2.25, 0]} color="#fffde0" intensity={4} distance={5} decay={2} />
        {/* monitor inside the booth */}
        <mesh position={[0.5, 1.6, 0.6]} rotation={[0, -0.5, 0]}>
          <boxGeometry args={[0.5, 0.34, 0.04]} />
          <meshStandardMaterial color="#0b1a24" emissive="#22d3ee" emissiveIntensity={0.9} />
        </mesh>
        {/* second guard seated inside */}
        <Person position={[0.35, 0, -0.2]} color="#1f2d3d" scale={0.68} />
      </group>

      {/* === WALKING GUARD who inspects vehicles === */}
      <PatrollingGuard />

      {/* === BOOM BARRIERS — one per lane === */}
      {lanes.map((lane) => (
        <BoomBarrier key={lane.x} x={lane.x} color={lane.color} />
      ))}

      {/* === ANPR CAMERAS above each lane === */}
      {lanes.map((lane) => <AnprCamera key={`cam-${lane.x}`} x={lane.x} z={-2.2} />)}

      {/* === LANE DIRECTION LABELS === */}
      {lanes.map((lane) => (
        <group key={`mark-${lane.x}`}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[lane.x, 0.05, 3.4]}>
            <planeGeometry args={[3.4, 0.16]} />
            <meshStandardMaterial color={lane.color} emissive={lane.color} emissiveIntensity={0.8} />
          </mesh>
          <Html position={[lane.x, 2.4, 3.2]} center transform distanceFactor={11}>
            <div className="pointer-events-none select-none rounded bg-[#0a192f]/92 px-2.5 py-1 font-mono text-[9px] font-bold tracking-[0.2em]" style={{ color: lane.color, border: `1px solid ${lane.color}66` }}>
              {lane.label}
            </div>
          </Html>
        </group>
      ))}

      {/* === PEDESTRIAN GATE — left side, separate from vehicle lanes === */}
      <group position={[-7.6, 0, 2.2]}>
        <mesh castShadow receiveShadow position={[0, 0.16, 0]}>
          <boxGeometry args={[2.6, 0.32, 3]} />
          <meshStandardMaterial color="#c8bfa0" roughness={0.82} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.33, 0]}>
          <planeGeometry args={[2.6, 3]} />
          <meshStandardMaterial color="#b3962e" roughness={0.88} />
        </mesh>
        {/* turnstile posts */}
        {[-0.9, 0.9].map((x) => (
          <mesh key={x} castShadow position={[x, 0.85, 0]}>
            <cylinderGeometry args={[0.09, 0.09, 1.3, 10]} />
            <meshStandardMaterial color="#7a8a96" metalness={0.85} />
          </mesh>
        ))}
        <Html position={[0, 1.9, 0]} center transform distanceFactor={11}>
          <div className="pointer-events-none select-none rounded bg-[#0a192f]/92 px-2 py-0.5 font-mono text-[8px] font-bold tracking-[0.18em] text-emerald-200" style={{ border: "1px solid #34d39966" }}>
            PEDESTRIAN
          </div>
        </Html>
      </group>

      {/* === SHORT PERIMETER FENCE WINGS ===
          One segment per side finishes at x +/-13. The parking bays begin at
          x +/-13, so the gate and parking meet cleanly without overlapping. */}
      {[-1, 1].map((side) =>
        [0].map((seg) => (
          <group key={`${side}-${seg}`} position={[side * (w / 2 + 2 + seg * 4.2), 0, 0]}>
            <mesh castShadow receiveShadow position={[0, 0.8, 0]}>
              <boxGeometry args={[4, 1.6, 0.22]} />
              <meshStandardMaterial color="#c0c9ce" roughness={0.7} />
            </mesh>
            {[-1.4, 0, 1.4].map((fx) => (
              <mesh key={fx} castShadow position={[fx, 1.85, 0]}>
                <cylinderGeometry args={[0.05, 0.05, 2.1, 8]} />
                <meshStandardMaterial color="#4b545a" metalness={0.82} />
              </mesh>
            ))}
            <mesh position={[0, 2.85, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.038, 0.038, 4.2, 8]} />
              <meshStandardMaterial color="#64748b" metalness={0.85} />
            </mesh>
          </group>
        ))
      )}

      {/* === FLAGPOLES flanking the arch === */}
      {[-12, 12].map((x, i) => (
        <group key={i} position={[x, 0, -1.5]}>
          <mesh castShadow position={[0, 4.5, 0]}>
            <cylinderGeometry args={[0.05, 0.07, 9, 10]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.88} roughness={0.2} />
          </mesh>
          <mesh castShadow position={[0.85, 8.4, 0]}>
            <planeGeometry args={[1.7, 0.95]} />
            <meshStandardMaterial color={i === 0 ? "#1e3a5f" : "#dc2626"} side={THREE.DoubleSide} roughness={0.85} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function BuildingVolume({ dept, statusColor, glass, opacityMultiplier = 1.0 }: { dept: Department; statusColor: string; glass: THREE.Texture; opacityMultiplier?: number }) {
  const [w, h, d] = dept.size;
  const floors = dept.floors ?? Math.max(1, Math.round(h / 2.2));
  const service = dept.kind === "service";
  const mullions = Math.max(4, Math.floor(w / 1.65));
  const sideMullions = Math.max(3, Math.floor(d / 1.9));
  const upperH = h * 0.72;
  const podiumH = Math.max(1.25, h * 0.28);
  const showInterior = opacityMultiplier < 0.2;

  // ── Architecturally unique per-department identity (Level 1: First Impression) ──
  const arch = (() => {
    switch (dept.id) {
      case "emergency": return { wall: "#fff1f2", glassTint: "#ff8a8a", signBg: "#dc2626", canopy: "emergency", rooftop: "hvac" as const };
      case "icu": return { wall: "#f0f9ff", glassTint: "#7dd3fc", signBg: "#0284c7", canopy: "clinical", rooftop: "helipad" as const, hasHelipad: true };
      case "icuB": return { wall: "#f0f9ff", glassTint: "#7dd3fc", signBg: "#0369a1", canopy: "clinical", rooftop: "hvac" as const };
      case "wardA": return { wall: "#f8fafc", glassTint: "#bae6fd", signBg: "#0e7490", canopy: "hotel", rooftop: "solar" as const, balconies: true };
      case "wardB": return { wall: "#f8fafc", glassTint: "#c4b5fd", signBg: "#6d28d9", canopy: "hotel", rooftop: "solar" as const, balconies: true };
      case "ot": return { wall: "#fefce8", glassTint: "#ddd6fe", signBg: "#7c3aed", canopy: "sterile", rooftop: "ot" as const };
      case "lab": return { wall: "#f0fdf4", glassTint: "#6ee7b7", signBg: "#059669", canopy: "lab", rooftop: "lab" as const };
      case "radiology": return { wall: "#faf5ff", glassTint: "#c4b5fd", signBg: "#6b21a8", canopy: "shielded", rooftop: "shielded" as const };
      case "pharmacy": return { wall: "#f0fdf4", glassTint: "#86efac", signBg: "#15803d", canopy: "pharmacy", rooftop: "hvac" as const };
      case "blood": return { wall: "#fef2f2", glassTint: "#fca5a5", signBg: "#b91c1c", canopy: "clinical", rooftop: "cold" as const };
      case "admin": return { wall: "#f1f5f9", glassTint: "#93c5fd", signBg: "#1e3a5f", canopy: "premium", rooftop: "atrium" as const };
      case "oxygen": return { wall: "#e0f2fe", glassTint: "#7dd3fc", signBg: "#0284c7", canopy: "industrial", rooftop: "tanks" as const };
      case "power": return { wall: "#fef3c7", glassTint: "#fde68a", signBg: "#b45309", canopy: "industrial", rooftop: "generators" as const };
      case "cssd": return { wall: "#ecfeff", glassTint: "#67e8f9", signBg: "#0891b2", canopy: "sterile", rooftop: "sterile" as const };
      case "storage": return { wall: "#f5f3ff", glassTint: "#c4b5fd", signBg: "#6d28d9", canopy: "logistics", rooftop: "logistics" as const };
      default: return { wall: service ? "#aeb8be" : "#eef2f3", glassTint: "#76b8d4", signBg: "#142e42", canopy: "standard" as const, rooftop: "default" as const };
    }
  })();

  return (
    <group name={`${dept.id}_architectural_shell`} visible={opacityMultiplier > 0.05}>
      <mesh position={[0, 0.14, 0]} receiveShadow castShadow>
        <boxGeometry args={[w + 0.9, 0.28, d + 0.9]} />
        <meshPhysicalMaterial color="#c9d0d3" roughness={0.62} clearcoat={0.2} transparent={showInterior} opacity={showInterior ? opacityMultiplier * 0.4 : 1} />
      </mesh>
      <mesh position={[0, podiumH / 2 + 0.28, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, podiumH, d]} />
        <meshPhysicalMaterial color={arch.wall} roughness={0.38} metalness={0.08} clearcoat={0.18} transparent={showInterior} opacity={showInterior ? opacityMultiplier : 1} />
      </mesh>
      <mesh position={[service ? 0 : -w * 0.04, podiumH + upperH / 2 + 0.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[service ? w * 0.92 : w * 0.9, upperH, service ? d * 0.9 : d * 0.86]} />
        <meshPhysicalMaterial color={arch.wall} roughness={0.3} metalness={0.08} clearcoat={0.25} transparent={showInterior} opacity={showInterior ? opacityMultiplier : 1} />
      </mesh>

      {/* Front and rear low-iron curtain walls — tinted per department */}
      {[1, -1].map((sign) => (
        <group key={sign} position={[0, podiumH + upperH / 2 + 0.2, sign * (d * 0.435)]} rotation={[0, sign < 0 ? Math.PI : 0, 0]}>
          <mesh>
            <planeGeometry args={[w * 0.72, upperH * 0.8]} />
            <meshPhysicalMaterial map={glass} color={arch.glassTint} metalness={0.55} roughness={0.1} clearcoat={1} clearcoatRoughness={0.08} reflectivity={1} transparent opacity={showInterior ? opacityMultiplier * 0.35 : 1} />
          </mesh>
          {Array.from({ length: mullions + 1 }).map((_, i) => (
            <mesh key={i} position={[-w * 0.36 + i * ((w * 0.72) / mullions), 0, 0.018]}>
              <boxGeometry args={[0.055, upperH * 0.82, 0.055]} />
              <meshStandardMaterial color="#52616b" metalness={0.86} roughness={0.19} transparent opacity={showInterior ? opacityMultiplier * 0.5 : 1} />
            </mesh>
          ))}
          {/* Ward balconies — alternating inset */}
          {arch.balconies && Array.from({ length: floors }).map((_, i) => (
            <group key={`balc-${i}`} position={[0, -upperH * 0.34 + i * (upperH * 0.62 / Math.max(1, floors - 1)), 0.28]}>
              <mesh><boxGeometry args={[w * 0.62, 0.04, 0.55]} /><meshStandardMaterial color="#e2e8f0" roughness={0.55} transparent opacity={showInterior ? opacityMultiplier * 0.6 : 1} /></mesh>
              <mesh position={[0, 0.12, 0.22]}><boxGeometry args={[w * 0.62, 0.06, 0.02]} /><meshStandardMaterial color="#94a3b8" metalness={0.7} /></mesh>
            </group>
          ))}
          {!arch.balconies && Array.from({ length: floors }).map((_, i) => (
            <mesh key={`slab-${i}`} position={[0, -upperH * 0.4 + i * ((upperH * 0.8) / Math.max(1, floors - 1)), 0.025]}>
              <boxGeometry args={[w * 0.73, 0.07, 0.07]} />
              <meshStandardMaterial color="#71808a" metalness={0.75} roughness={0.22} transparent opacity={showInterior ? opacityMultiplier * 0.5 : 1} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Side glazing */}
      {[1, -1].map((sign) => (
        <group key={`side-${sign}`} position={[sign * w * 0.452, podiumH + upperH / 2 + 0.2, 0]} rotation={[0, sign > 0 ? Math.PI / 2 : -Math.PI / 2, 0]}>
          <mesh>
            <planeGeometry args={[d * 0.62, upperH * 0.7]} />
            <meshPhysicalMaterial map={glass} color={arch.glassTint} metalness={0.58} roughness={0.11} clearcoat={0.9} transparent opacity={showInterior ? opacityMultiplier * 0.35 : 1} />
          </mesh>
          {Array.from({ length: sideMullions + 1 }).map((_, i) => (
            <mesh key={i} position={[-d * 0.31 + i * ((d * 0.62) / sideMullions), 0, 0.02]}>
              <boxGeometry args={[0.05, upperH * 0.72, 0.05]} />
              <meshStandardMaterial color="#4a5964" metalness={0.88} roughness={0.2} transparent opacity={showInterior ? opacityMultiplier * 0.5 : 1} />
            </mesh>
          ))}
        </group>
      ))}

      {/* --- Entrance per building type --- */}
      {arch.canopy === "emergency" && !showInterior && (
        <group position={[0, 0, d / 2 + 0.04]}>
          {/* oversized red emergency canopy */}
          <mesh position={[0, 2.25, 1.35]} castShadow><boxGeometry args={[w * 0.72, 0.22, 2.9]} /><meshStandardMaterial color="#dc2626" roughness={0.5} /></mesh>
          <mesh position={[0, 1.15, 0.08]}><boxGeometry args={[w * 0.52, 2.0, 0.08]} /><meshPhysicalMaterial color="#7f1d1d" metalness={0.35} roughness={0.2} transparent opacity={0.5} /></mesh>
          <mesh position={[0, 1.15, 0.14]}><boxGeometry args={[w * 0.42, 1.65, 0.02]} /><meshPhysicalMaterial color="#fef2f2" transmission={0.55} roughness={0.08} /></mesh>
          {[-1, 1].map((s) => (
            <mesh key={s} position={[s * w * 0.28, 1.05, 2.55]} castShadow><cylinderGeometry args={[0.07, 0.07, 2.15, 12]} /><meshStandardMaterial color="#991b1b" metalness={0.7} /></mesh>
          ))}
          {/* red cross sign */}
          <mesh position={[0, 2.55, 0.35]}><boxGeometry args={[w * 0.45, 0.32, 0.06]} /><meshStandardMaterial color="#b91c1c" emissive="#ef4444" emissiveIntensity={0.9} /></mesh>
          <Html position={[0, 2.55, 0.39]} center transform distanceFactor={7}><div className="pointer-events-none flex items-center gap-1 font-mono text-[9px] font-black tracking-[0.18em] text-white">✚ EMERGENCY</div></Html>
        </group>
      )}
      {arch.canopy === "pharmacy" && !showInterior && (
        <group position={[0, 0, d / 2 + 0.04]}>
          <mesh position={[0, 1.05, 0.06]}><boxGeometry args={[w * 0.62, 1.85, 0.06]} /><meshPhysicalMaterial color="#dcfce7" transmission={0.35} roughness={0.08} /></mesh>
          <mesh position={[0, 2.1, 0.85]} castShadow><boxGeometry args={[w * 0.68, 0.14, 1.6]} /><meshStandardMaterial color="#16a34a" /></mesh>
          <mesh position={[0, 1.35, 0.12]}><boxGeometry args={[0.95, 0.92, 0.02]} /><meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.6} /></mesh>
          <Html position={[0, 1.35, 0.14]} center transform distanceFactor={7}><div className="pointer-events-none text-[14px] font-black text-white">✚</div></Html>
        </group>
      )}
      {arch.canopy !== "emergency" && arch.canopy !== "pharmacy" && (
        <group position={[0, 0, d / 2 + 0.04]} visible={!showInterior}>
          <mesh position={[0, 1.05, 0]}>
            <boxGeometry args={[Math.min(3.6, w * 0.34), 1.75, 0.08]} />
            <meshPhysicalMaterial color="#285c72" metalness={0.45} roughness={0.09} transmission={0.18} transparent opacity={0.92} />
          </mesh>
          <mesh position={[0, 2.05, 1.05]} castShadow>
            <boxGeometry args={[Math.min(5.6, w * 0.55), 0.16, 2.25]} />
            <meshPhysicalMaterial color={arch.canopy === "premium" ? "#e2e8f0" : "#d8e0e3"} metalness={0.58} roughness={0.2} clearcoat={0.6} />
          </mesh>
          {[-1, 1].map((s) => (
            <mesh key={s} position={[s * Math.min(2.15, w * 0.2), 1, 1.95]} castShadow>
              <cylinderGeometry args={[0.06, 0.06, 2, 12]} />
              <meshStandardMaterial color="#84939b" metalness={0.95} roughness={0.16} />
            </mesh>
          ))}
        </group>
      )}

      {/* Status beacon */}
      <mesh position={[0, h + 0.5, 0]} visible={!showInterior}>
        <boxGeometry args={[w * 0.4, 0.1, 0.28]} />
        <meshStandardMaterial color={statusColor} emissive={statusColor} emissiveIntensity={2.2} />
      </mesh>
      <mesh position={[0, h + 0.31, 0]} castShadow visible={!showInterior}>
        <boxGeometry args={[w * 0.94, 0.3, d * 0.9]} />
        <meshPhysicalMaterial color="#596872" metalness={0.48} roughness={0.4} />
      </mesh>

      {/* --- Rooftop per building type --- */}
      {!showInterior && (
        <group position={[0, h + 0.46, 0]}>
          {(arch.rooftop === "solar" || dept.id === "admin") && <SolarPanels width={w * 0.8} depth={d * 0.8} />}
          {(arch.rooftop === "hvac" || arch.rooftop === "lab" || dept.id === "pharmacy" || dept.id === "cssd") && (
            <>
              <RooftopHvac position={[-w * 0.2, 0.4, -d * 0.15]} />
              <RooftopHvac position={[w * 0.2, 0.4, d * 0.15]} />
            </>
          )}
          {arch.rooftop === "helipad" && (
            <group>
              <mesh position={[0, 0.42, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[w * 0.24, 32]} />
                <meshStandardMaterial color="#1f2937" roughness={0.85} />
              </mesh>
              <mesh position={[0, 0.44, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[w * 0.24 - 0.18, w * 0.24, 32]} />
                <meshStandardMaterial color="#facc15" emissive="#eab308" emissiveIntensity={0.9} />
              </mesh>
              <mesh position={[0, 0.45, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[w * 0.18, 0.06]} />
                <meshStandardMaterial color="#ffffff" />
              </mesh>
              <mesh position={[0, 0.45, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[0.06, w * 0.18]} />
                <meshStandardMaterial color="#ffffff" />
              </mesh>
              {/* perimeter lights */}
              {Array.from({ length: 8 }).map((_, i) => {
                const ang = (i / 8) * Math.PI * 2;
                return <mesh key={i} position={[Math.cos(ang) * w * 0.24, 0.46, Math.sin(ang) * w * 0.24]}><sphereGeometry args={[0.06, 8, 8]} /><meshStandardMaterial color="#facc15" emissive="#fbbf24" emissiveIntensity={2.5} /></mesh>;
              })}
            </group>
          )}
          {arch.rooftop === "lab" && (
            <group>
              {[-w * 0.28, w * 0.28].map((x) => (
                <mesh key={x} position={[x, 0.9, 0]} castShadow><cylinderGeometry args={[0.12, 0.14, 1.4, 12]} /><meshStandardMaterial color="#9ca3af" metalness={0.6} roughness={0.45} /></mesh>
              ))}
              <RooftopHvac position={[0, 0.4, 0]} />
            </group>
          )}
          {arch.rooftop === "shielded" && (
            <group>
              <mesh position={[0, 0.38, 0]}><boxGeometry args={[w * 0.5, 0.55, w * 0.3]} /><meshStandardMaterial color="#a78bfa" metalness={0.35} roughness={0.5} /></mesh>
              <mesh position={[0, 0.72, 0]}><sphereGeometry args={[0.38, 16, 12]} /><meshStandardMaterial color="#ddd6fe" roughness={0.4} /></mesh>
            </group>
          )}
          {arch.rooftop === "ot" && (
            <group>
              <mesh position={[0, 0.42, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[w * 0.22, 32]} /><meshStandardMaterial color="#1f2937" /></mesh>
              <mesh position={[0, 0.44, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[w * 0.22 - 0.14, w * 0.22, 32]} /><meshStandardMaterial color="#facc15" emissive="#eab308" emissiveIntensity={1} /></mesh>
            </group>
          )}
        </group>
      )}

      {[-0.22, 0.22].map((offset) => (
        <mesh key={offset} position={[w * offset, h + 0.72, -d * 0.12]} castShadow visible={!showInterior}>
          <boxGeometry args={[Math.min(1.7, w * 0.18), 0.58, Math.min(1.4, d * 0.2)]} />
          <meshStandardMaterial color="#7f8b91" metalness={0.55} roughness={0.48} />
        </mesh>
      ))}

      {/* Facade sign band — department color */}
      <mesh position={[0, Math.min(h - 0.2, podiumH + 0.25), d / 2 + 0.075]} visible={!showInterior}>
        <boxGeometry args={[Math.min(w * 0.54, 7), 0.42, 0.08]} />
        <meshStandardMaterial color={arch.signBg} metalness={0.58} roughness={0.2} />
      </mesh>
      <Html position={[0, Math.min(h - 0.2, podiumH + 0.25), d / 2 + 0.13]} center transform distanceFactor={8} occlude visible={!showInterior}>
        <div className="pointer-events-none whitespace-nowrap px-2 font-sans text-[9px] font-semibold tracking-[0.22em] text-white" style={{ textShadow: "0 1px 3px rgba(0,0,0,0.6)" }}>
          {dept.short}
        </div>
      </Html>

      {/* IoT sensor nodes — department tint */}
      {[[-w / 2, 1.3, d / 2], [w / 2, h * 0.72, d / 2], [-w / 2, h * 0.65, -d / 2]].map((p, i) => (
        <mesh key={`sensor-${i}`} position={p as [number, number, number]} visible={!showInterior}>
          <sphereGeometry args={[0.09, 10, 10]} />
          <meshStandardMaterial color="#bff7ff" emissive={arch.glassTint} emissiveIntensity={2.2} />
        </mesh>
      ))}

      {dept.id === "command" && <CommandBeacon height={h} />}
      {dept.id === "emergency" && !showInterior && (
        <mesh position={[0, 2.65, d / 2 + 0.1]}>
          <boxGeometry args={[w * 0.72, 0.48, 0.12]} />
          <meshStandardMaterial color="#bb2336" emissive="#ff304f" emissiveIntensity={1.3} />
        </mesh>
      )}
    </group>
  );
}

function CommandBeacon({ height }: { height: number }) {
  const rings = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (rings.current) rings.current.rotation.y = state.clock.elapsedTime * 0.32;
  });
  return (
    <group ref={rings} name="command_beacon" position={[0, height + 1.6, 0]}>
      <mesh>
        <sphereGeometry args={[0.7, 24, 24]} />
        <meshPhysicalMaterial color="#8be7ff" emissive="#23bfff" emissiveIntensity={3} transmission={0.25} roughness={0.05} />
      </mesh>
      <mesh rotation={[Math.PI / 2.8, 0, 0]}>
        <torusGeometry args={[1.5, 0.035, 8, 64]} />
        <meshStandardMaterial color="#72e9ff" emissive="#22ccff" emissiveIntensity={3} />
      </mesh>
      <mesh rotation={[-Math.PI / 3.4, Math.PI / 2, 0]}>
        <torusGeometry args={[2, 0.025, 8, 64]} />
        <meshStandardMaterial color="#587cff" emissive="#587cff" emissiveIntensity={2.5} />
      </mesh>
    </group>
  );
}

export function Building({ dept, selected, hovered, liveStatus, focused, showLabels, selectedRoom, onSelectRoom, onSelect, onHover }: BuildingProps) {
  const groupRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const status = liveStatus ?? dept.status;
  const statusColor = STATUS_COLORS[status];
  const [w, h, d] = dept.size;
  const [x, y, z] = dept.position;
  const glass = useFacadeTexture(dept.floors ?? 2);
  const flat = dept.kind === "parking" || dept.kind === "helipad";

  useFrame((state, delta) => {
    if (groupRef.current) {
      const lift = selected ? 0.8 : focused ? 0.45 : hovered ? 0.22 : 0;
      groupRef.current.position.y = THREE.MathUtils.damp(groupRef.current.position.y, y + lift, 5, delta);
    }
    if (glowRef.current) {
      const material = glowRef.current.material as THREE.MeshBasicMaterial;
      const rate = status === "critical" ? 7 : status === "busy" ? 3.5 : 1.8;
      const base = status === "critical" ? 0.34 : status === "busy" ? 0.23 : 0.12;
      material.opacity = base + Math.sin(state.clock.elapsedTime * rate) * 0.08;
    }
  });

  const opacityMultiplier = selected ? 0.05 : 1.0;

  // Scale rooms to fit building envelope footprint.
  const rooms = dept.interior ?? [];
  const columns = rooms.length > 4 ? 3 : 2;
  const rows = Math.max(1, Math.ceil(rooms.length / columns));
  const roomScale = Math.min(w / (columns * 5.4), d / (rows * 4.6)) * 0.95;

  // Procedurally generated IoT telemetry values.
  const charSum = dept.id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const iotBeds = String((charSum % 6) + 1);
  const iotAmb = dept.id === "emergency" ? "3" : "0";
  const iotHr = String(72 + (charSum % 14));
  const iotO2 = String(94 + (charSum % 6));
  const iotTemp = String((36.5 + (charSum % 8) / 10).toFixed(1));

  return (
    <group
      ref={groupRef}
      name={`department_${dept.id}`}
      position={[x, y, z]}
      userData={{ departmentId: dept.id, exportName: dept.name }}
      onClick={(event) => { event.stopPropagation(); onSelect(dept.id); }}
      onPointerOver={(event) => { event.stopPropagation(); onHover(dept.id); document.body.style.cursor = "pointer"; }}
      onPointerOut={() => { onHover(null); document.body.style.cursor = "auto"; }}
    >
      <mesh ref={glowRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.025, 0]}>
        <planeGeometry args={[w + 2.4, d + 2.4]} />
        <meshBasicMaterial color={statusColor} transparent opacity={0.14} depthWrite={false} />
      </mesh>

      {dept.kind === "parking" ? <ParkingDeck dept={dept} statusColor={statusColor} />
        : dept.kind === "helipad" ? <Helipad dept={dept} statusColor={statusColor} />
        : dept.kind === "gate" ? <SecurityGate dept={dept} statusColor={statusColor} />
        : <BuildingVolume dept={dept} statusColor={statusColor} glass={glass} opacityMultiplier={opacityMultiplier} />}

      {selected && !flat && dept.interior && (
        <group scale={[roomScale, 1.0, roomScale]} position={[0, 0.12, 0]}>
          <DepartmentInterior dept={dept} selectedRoom={selectedRoom} onSelectRoom={onSelectRoom} />
        </group>
      )}

      {(selected || hovered || focused) && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.045, 0]}>
          <ringGeometry args={[Math.max(w, d) * 0.58, Math.max(w, d) * 0.58 + 0.22, 64]} />
          <meshBasicMaterial color={focused ? statusColor : "#6ce9ff"} transparent opacity={0.9} depthWrite={false} />
        </mesh>
      )}

      {(hovered || selected || focused || showLabels) && (
        <Html position={[0, h + (dept.id === "command" ? 4.4 : 1.5), 0]} center distanceFactor={32} zIndexRange={[10, 0]}>
          <div className={`pointer-events-none min-w-32 select-none border-l-2 bg-[#07111df0] px-3 py-2 shadow-2xl backdrop-blur-xl ${showLabels && !hovered && !selected && !focused ? "scale-90 opacity-70" : ""}`} style={{ borderColor: statusColor }}>
            <div className="flex items-center justify-between gap-4">
              <span className="text-[10px] font-semibold tracking-wide text-white">{dept.name}</span>
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: statusColor, boxShadow: `0 0 8px ${statusColor}` }} />
            </div>
            {(selected || focused) && (
              <div className="mt-1 flex gap-3 font-mono text-[8px] text-cyan-200/80">
                <span>{dept.metrics[0]?.value}</span><span>{dept.metrics[1]?.value}</span><span>SYNC 18ms</span>
              </div>
            )}
            <div className="mt-1.5 flex gap-1.5 justify-center flex-wrap">
              <span className="flex items-center gap-1 rounded bg-white/5 px-1 py-0.5 text-[8px] text-rose-300">❤️ {iotHr}</span>
              <span className="flex items-center gap-1 rounded bg-white/5 px-1 py-0.5 text-[8px] text-cyan-300">🫁 {iotO2}%</span>
              <span className="flex items-center gap-1 rounded bg-white/5 px-1 py-0.5 text-[8px] text-amber-300">🌡 {iotTemp}°C</span>
              {!flat && (
                <>
                  <span className="flex items-center gap-1 rounded bg-white/5 px-1 py-0.5 text-[8px] text-emerald-300">🛏 {iotBeds}</span>
                  {dept.id === "emergency" && <span className="flex items-center gap-1 rounded bg-white/5 px-1 py-0.5 text-[8px] text-red-300">🚑 {iotAmb}</span>}
                </>
              )}
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}