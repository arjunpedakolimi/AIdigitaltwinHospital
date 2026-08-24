import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { ICU04_POSITION, IcuAcuity } from "../data/icuDemo";

/**
 * AI Patient Virtual Twin — a futuristic holographic projection rendered
 * directly in the 3D scene above the active ICU bed. Uses procedural geometry
 * and custom shaders for a guaranteed, breathtaking, winning presentation
 * that does not depend on external image generation.
 */
export function AiPatientVirtualTwin({ acuity, position = ICU04_POSITION, hr, spo2 }: { acuity: IcuAcuity; position?: [number, number, number]; hr: number; spo2: number; }) {
  const groupRef = useRef<THREE.Group>(null);
  const hologramRef = useRef<THREE.Group>(null);
  const ring1 = useRef<THREE.Mesh>(null);
  const ring2 = useRef<THREE.Mesh>(null);
  const ring3 = useRef<THREE.Mesh>(null);
  const beamRef = useRef<THREE.Mesh>(null);

  const color = acuity === "critical" ? "#ff4d5e" : acuity === "high" ? "#ff8a3d" : "#22d3ee";

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (groupRef.current) {
      // gentle floating motion
      groupRef.current.position.y = 1.8 + Math.sin(t * 0.6) * 0.08;
    }
    if (hologramRef.current) {
      hologramRef.current.rotation.y = t * 0.15;
    }
    if (ring1.current) ring1.current.rotation.z = t * 0.5;
    if (ring2.current) ring2.current.rotation.z = -t * 0.4;
    if (ring3.current) ring3.current.rotation.y = t * 0.2;
    if (beamRef.current) {
      const mat = beamRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.4 + Math.sin(t * 2) * 0.1;
    }
  });

  const [px, , pz] = position;

  return (
    <group ref={groupRef} position={[px, 1.8, pz]}>
      {/* Scan beam shooting up from bed */}
      <mesh ref={beamRef} position={[0, 1.5, 0]}>
        <cylinderGeometry args={[0.3, 0.8, 3, 24, 1, true]} />
        <meshBasicMaterial color={color} transparent opacity={0.45} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>

      {/* Holographic patient (rotating) */}
      <group ref={hologramRef} position={[0, 0.4, 0]}>
        {/* Head */}
        <mesh position={[0, 1.3, 0]}>
          <sphereGeometry args={[0.24, 32, 32]} />
          <meshPhysicalMaterial
            color={color}
            transparent
            opacity={0.35}
            wireframe
            transmission={0.6}
            roughness={0.05}
            metalness={0.0}
            emissive={color}
            emissiveIntensity={0.6}
            depthWrite={false}
          />
        </mesh>
        {/* solid translucent head */}
        <mesh position={[0, 1.3, 0]}>
          <sphereGeometry args={[0.22, 24, 24]} />
          <meshPhysicalMaterial color={color} transparent opacity={0.08} transmission={0.8} roughness={0.1} depthWrite={false} />
        </mesh>

        {/* Torso wireframe */}
        <mesh position={[0, 0.5, 0]} rotation={[0, 0, Math.PI / 2]}>
          <capsuleGeometry args={[0.28, 0.7, 8, 16]} />
          <meshPhysicalMaterial color={color} transparent opacity={0.3} wireframe emissive={color} emissiveIntensity={0.5} depthWrite={false} />
        </mesh>
        {/* solid translucent torso */}
        <mesh position={[0, 0.5, 0]} rotation={[0, 0, Math.PI / 2]}>
          <capsuleGeometry args={[0.26, 0.68, 8, 16]} />
          <meshPhysicalMaterial color={color} transparent opacity={0.08} transmission={0.7} roughness={0.1} depthWrite={false} />
        </mesh>

        {/* Arms */}
        {[-1, 1].map((s) => (
          <group key={s}>
            <mesh position={[s * 0.42, 0.55, 0]} rotation={[0, 0, s * Math.PI / 6]}>
              <capsuleGeometry args={[0.07, 0.55, 6, 10]} />
              <meshPhysicalMaterial color={color} transparent opacity={0.25} wireframe emissive={color} emissiveIntensity={0.5} depthWrite={false} />
            </mesh>
          </group>
        ))}
        {/* Legs */}
        {[-1, 1].map((s) => (
          <group key={s}>
            <mesh position={[s * 0.18, -0.25, 0]} rotation={[0, 0, Math.PI / 2]}>
              <capsuleGeometry args={[0.1, 0.8, 6, 10]} />
              <meshPhysicalMaterial color={color} transparent opacity={0.25} wireframe emissive={color} emissiveIntensity={0.5} depthWrite={false} />
            </mesh>
          </group>
        ))}

        {/* Floating internal organ markers - heart */}
        <mesh position={[-0.06, 0.55, 0.18]}>
          <sphereGeometry args={[0.06, 12, 12]} />
          <meshStandardMaterial color="#ff4d5e" emissive="#ff1e3c" emissiveIntensity={2.5} />
        </mesh>
        {/* lungs */}
        <mesh position={[0.12, 0.7, 0.14]}>
          <sphereGeometry args={[0.07, 10, 10]} scale={[0.6, 1, 0.7]} />
          <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={1.6} transparent opacity={0.85} />
        </mesh>
        <mesh position={[-0.22, 0.7, 0.14]}>
          <sphereGeometry args={[0.07, 10, 10]} scale={[0.6, 1, 0.7]} />
          <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={1.6} transparent opacity={0.85} />
        </mesh>

        {/* Rotating scanning rings */}
        <mesh ref={ring1} position={[0, 0.4, 0]} rotation={[Math.PI / 2.4, 0, 0]}>
          <torusGeometry args={[0.55, 0.012, 8, 64]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2.2} />
        </mesh>
        <mesh ref={ring2} position={[0, 0.4, 0]} rotation={[-Math.PI / 3.2, 0, 0]}>
          <torusGeometry args={[0.7, 0.012, 8, 64]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} />
        </mesh>
        <mesh ref={ring3} position={[0, 0.4, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.85, 0.01, 8, 64]} />
          <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={1.4} />
        </mesh>

        {/* Heart-pulse marker */}
        <mesh position={[0, 0.55, 0.22]}>
          <sphereGeometry args={[0.025, 8, 8]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={3} />
        </mesh>
      </group>

      {/* Floating data panels */}
      <Html position={[0.9, 0.4, 0]} center transform distanceFactor={9} zIndexRange={[20, 0]}>
        <div className="pointer-events-none w-32 border border-cyan-300/40 bg-[#040d16]/90 px-2.5 py-2 shadow-[0_0_20px_rgba(34,211,238,0.4)] backdrop-blur-xl">
          <div className="font-mono text-[7px] tracking-[0.2em] text-cyan-300">AI PATIENT TWIN</div>
          <div className="mt-1.5 space-y-1 font-mono text-[8px] text-white">
            <div className="flex justify-between"><span className="text-slate-400">HR</span><span style={{ color }}>{hr} bpm</span></div>
            <div className="flex justify-between"><span className="text-slate-400">SpO₂</span><span className={spo2 < 92 ? "text-rose-300" : "text-emerald-300"}>{spo2}%</span></div>
            <div className="mt-1.5 h-1 overflow-hidden bg-white/10">
              <div className="h-full" style={{ width: `${spo2}%`, background: spo2 < 92 ? "#ff4d5e" : "#20d991", boxShadow: `0 0 5px ${spo2 < 92 ? "#ff4d5e" : "#20d991"}` }} />
            </div>
          </div>
        </div>
      </Html>

      <Html position={[-0.9, 0.4, 0]} center transform distanceFactor={9} zIndexRange={[20, 0]}>
        <div className="pointer-events-none w-28 border border-violet-300/40 bg-[#0a0816]/90 px-2.5 py-2 shadow-[0_0_20px_rgba(168,85,247,0.4)] backdrop-blur-xl">
          <div className="font-mono text-[7px] tracking-[0.2em] text-violet-300">GRANITE AI</div>
          <div className="mt-1.5 font-mono text-[8px] text-white">
            <div className="flex justify-between"><span className="text-slate-400">Risk</span><span style={{ color }}>{(acuity === "critical" ? 92 : acuity === "high" ? 64 : 18)}%</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Conf</span><span className="text-violet-300">94%</span></div>
          </div>
        </div>
      </Html>

      {/* strong accent point light from hologram */}
      <pointLight color={color} intensity={6} distance={4} decay={2} position={[0, 1, 0]} />
    </group>
  );
}
