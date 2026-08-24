import { useRef, useMemo, Suspense } from "react";
import { Html, useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { IcuAcuity, ICU04_POSITION, ICU_PATIENTS, IcuPatient } from "../data/icuDemo";
import { RISK_META, VitalProfile } from "../data/patientJourney";
import { Person } from "./Environment";
import { AiPatientVirtualTwin } from "./AiPatientVirtualTwin";

const PATIENT_SKIN: Record<string, string> = {
  "ICU-01": "#e8c4a8", "ICU-02": "#c79a7a", "ICU-03": "#d9b08a", "ICU-04": "#e2c2a6",
  "ICU-05": "#c49a6e", "ICU-06": "#b89a78", "ICU-07": "#6b4a33", "ICU-08": "#d0a88a",
  "ICU-09": "#d4a88a", "ICU-10": "#f0d0b8", "ICU-11": "#d8b08a", "ICU-12": "#f2d5b8",
};

function ArchitecturalDisplays() {
  const [wardTex, bedTex, planTex] = useTexture([
    "/images/icu-ward-overview.jpg",
    "/images/icu-bed-station.jpg",
    "/images/icu-architecture-plan.jpg",
  ]);
  // Ensure correct color space
  [wardTex, bedTex, planTex].forEach((t) => {
    t.colorSpace = THREE.SRGBColorSpace;
    t.minFilter = THREE.LinearFilter;
  });
  return (
    <group name="architectural_concept_displays">
      {/* Large ward overview on left wall */}
      <group position={[-11.75, 2.1, -2.5]} rotation={[0, Math.PI / 2, 0]}>
        <mesh castShadow>
          <boxGeometry args={[4.2, 2.4, 0.04]} />
          <meshStandardMaterial color="#0f172a" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0, 0.03]}>
          <planeGeometry args={[4.0, 2.25]} />
          <meshBasicMaterial map={wardTex} />
        </mesh>
        <Html position={[0, -1.45, 0.03]} center transform distanceFactor={8}>
          <div className="pointer-events-none whitespace-nowrap bg-black/70 px-2 py-1 font-mono text-[6px] tracking-widest text-cyan-200 backdrop-blur">
            AI GENERATED · WARD OVERVIEW · CONSISTENT 12-BED LAYOUT
          </div>
        </Html>
      </group>
      {/* Bed station detail on left wall lower */}
      <group position={[-11.75, 2.1, 2.2]} rotation={[0, Math.PI / 2, 0]}>
        <mesh castShadow>
          <boxGeometry args={[2.6, 1.8, 0.04]} />
          <meshStandardMaterial color="#0f172a" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0, 0.03]}>
          <planeGeometry args={[2.45, 1.65]} />
          <meshBasicMaterial map={bedTex} />
        </mesh>
        <Html position={[0, -1.05, 0.03]} center transform distanceFactor={8}>
          <div className="pointer-events-none whitespace-nowrap bg-black/70 px-1.5 py-1 font-mono text-[6px] tracking-widest text-cyan-200 backdrop-blur">
            BED STATION · HEADWALL DETAIL
          </div>
        </Html>
      </group>
      {/* Floor plan on back wall right side */}
      <group position={[7.2, 2.2, -8.02]}>
        <mesh castShadow>
          <boxGeometry args={[3.4, 2.2, 0.04]} />
          <meshStandardMaterial color="#0f172a" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0, 0.03]}>
          <planeGeometry args={[3.25, 2.05]} />
          <meshBasicMaterial map={planTex} />
        </mesh>
        <Html position={[0, -1.25, 0.03]} center transform distanceFactor={8}>
          <div className="pointer-events-none whitespace-nowrap bg-black/70 px-2 py-1 font-mono text-[6px] tracking-widest text-cyan-200 backdrop-blur">
            FLOOR PLAN · CLEAN ZONED WORKFLOW
          </div>
        </Html>
      </group>
    </group>
  );
}

const ACUITY_COLOR: Record<IcuAcuity, string> = {
  stable: "#20d991",
  observation: "#f4c849",
  high: "#ff8a3d",
  critical: "#ff4d5e",
  ready: "#38bdf8",
};

const BEDS = [
  { id: "ICU-01", position: [-7.6, 0, -3.9] as [number, number, number] },
  { id: "ICU-02", position: [-4.7, 0, -3.9] as [number, number, number] },
  { id: "ICU-03", position: [-1.8, 0, -3.9] as [number, number, number] },
  { id: "ICU-04", position: ICU04_POSITION },
  { id: "ICU-05", position: [4.2, 0, -3.9] as [number, number, number] },
  { id: "ICU-06", position: [7.2, 0, -3.9] as [number, number, number] },
  { id: "ICU-07", position: [-7.6, 0, 3.9] as [number, number, number] },
  { id: "ICU-08", position: [-4.7, 0, 3.9] as [number, number, number] },
  { id: "ICU-09", position: [-1.8, 0, 3.9] as [number, number, number] },
  { id: "ICU-10", position: [1.2, 0, 3.9] as [number, number, number] },
  { id: "ICU-11", position: [4.2, 0, 3.9] as [number, number, number] },
  { id: "ICU-12", position: [7.2, 0, 3.9] as [number, number, number] },
];

function useProceduralTextures() {
  return useMemo(() => {
    const floorCanvas = document.createElement("canvas");
    floorCanvas.width = 256; floorCanvas.height = 256;
    const fctx = floorCanvas.getContext("2d")!;
    fctx.fillStyle = "#dbe2df";
    fctx.fillRect(0,0,256,256);
    for(let i=0;i<3000;i++){
      const x=Math.random()*256, y=Math.random()*256;
      fctx.fillStyle = `rgba(${190+Math.random()*20|0},${195+Math.random()*15|0},${200+Math.random()*10|0},0.35)`;
      fctx.fillRect(x,y,1,1);
    }
    fctx.strokeStyle="rgba(180,190,185,0.08)";
    for(let i=0;i<12;i++){ fctx.beginPath(); fctx.moveTo(0, i*22+Math.random()*10); fctx.lineTo(256, i*22+20); fctx.stroke(); }
    const floorTex = new THREE.CanvasTexture(floorCanvas);
    floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping;
    floorTex.repeat.set(10, 6);
    floorTex.colorSpace = THREE.SRGBColorSpace;
    floorTex.anisotropy = 4;
    return { floorTex };
  }, []);
}

function Headwall({ color }: { color: string }) {
 return (
  <group position={[0, 1.35, -1.18]}>
    <mesh castShadow position={[0,0.15,0]}>
      <boxGeometry args={[1.85, 1.55, 0.14]} />
      <meshStandardMaterial color="#e8eef0" roughness={0.45} metalness={0.08} />
    </mesh>
    <mesh position={[0,0.85,0.08]}>
      <boxGeometry args={[1.88, 0.04, 0.02]} />
      <meshStandardMaterial color="#8a9aa6" metalness={0.85} roughness={0.18} />
    </mesh>
    <mesh position={[0,-0.55,0.08]}>
      <boxGeometry args={[1.88, 0.04, 0.02]} />
      <meshStandardMaterial color="#8a9aa6" metalness={0.85} roughness={0.18} />
    </mesh>
    {[
      { label:"O₂", col:"#22c55e", x:-0.62 },
      { label:"AIR", col:"#eab308", x:-0.32 },
      { label:"VAC", col:"#f8fafc", x:-0.02 },
      { label:"N₂O", col:"#38bdf8", x:0.28 },
    ].map(o=>(
      <group key={o.label} position={[o.x, 0.02, 0.09]}>
        <mesh castShadow><cylinderGeometry args={[0.09,0.09,0.06,16]} /><meshStandardMaterial color={o.col} roughness={0.5} /></mesh>
        <mesh position={[0,0,0.04]}><cylinderGeometry args={[0.045,0.045,0.03,16]} /><meshStandardMaterial color="#0f172a" metalness={0.9} /></mesh>
        <Html position={[0,-0.18,0]} center transform distanceFactor={7}><div className="pointer-events-none font-mono text-[5px] font-bold" style={{color:o.col}}>{o.label}</div></Html>
      </group>
    ))}
    <mesh position={[0.62, 0.12, 0.09]} castShadow><boxGeometry args={[0.22,0.32,0.08]} /><meshStandardMaterial color="#1e293b" roughness={0.6} /></mesh>
    <mesh position={[0.62, 0.32,0.14]}><cylinderGeometry args={[0.06,0.06,0.08,12]} /><meshStandardMaterial color="#cbd5e1" metalness={0.8} /></mesh>
    <mesh position={[-0.72, -0.18,0.08]}><boxGeometry args={[0.18,0.12,0.02]} /><meshStandardMaterial color="#dc2626" emissive="#7f1d1d" emissiveIntensity={0.3} /></mesh>
    <mesh position={[0.72, -0.18,0.08]}><boxGeometry args={[0.32,0.12,0.02]} /><meshStandardMaterial color="#e2e8f0" roughness={0.7} /></mesh>
    <mesh position={[0,0.62,0.09]}>
      <boxGeometry args={[1.6, 0.08, 0.02]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.2} transparent opacity={0.95}/>
    </mesh>
  </group>
 );
}

function PrivacyCurtain({ active }: { active: boolean }) {
  return (
    <group>
      <mesh position={[0,3.1,0]}>
        <boxGeometry args={[2.9,0.04,2.6]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.15} />
      </mesh>
      {[
        { pos:[0,1.55,1.25] as [number,number,number], rot:0, w:2.8 },
        { pos:[-1.38,1.55,0] as [number,number,number], rot:Math.PI/2, w:2.5 },
        { pos:[1.38,1.55,0] as [number,number,number], rot:Math.PI/2, w:2.5 },
      ].map((c,i)=>(
        <mesh key={i} position={c.pos} rotation={[0,c.rot,0]}>
          <planeGeometry args={[c.w, 2.85]} />
          <meshStandardMaterial color={active ? "#e0f2fe" : "#f1f5f9"} transparent opacity={active ? 0.42 : 0.22} side={THREE.DoubleSide} roughness={0.95} />
        </mesh>
      ))}
      {Array.from({length:8}).map((_,i)=>(
        <mesh key={i} position={[-1.2+i*0.34,3.08,1.25]} castShadow>
          <cylinderGeometry args={[0.018,0.018,0.06,8]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

function RealisticBed({ empty, breathingPhase, patient, acuity = "stable" }: { empty: boolean; breathingPhase: number; hr: number; patient?: IcuPatient; acuity?: IcuAcuity }) {
  const chestRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const sweatRef = useRef<THREE.Mesh>(null);
  const skin = patient ? PATIENT_SKIN[patient.bed] ?? "#d9a88a" : "#d9a88a";
  const isFemale = patient?.sex === "F";
  const age = patient?.age ?? 40;
  const isCrit = acuity === "critical";
  const isHigh = acuity === "high";
  const distressed = isCrit || isHigh;
  // skin pales under critical perfusion
  const activeSkin = isCrit ? "#c4a892" : skin;
  const bodyScale = isFemale ? 0.92 : 1.0;

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (chestRef.current) {
      // breathing: labored = larger amplitude + irregular rhythm
      const amp = isCrit ? 0.035 : isHigh ? 0.025 : 0.015;
      const irregularity = isCrit ? Math.sin(t * 7.3) * 0.012 : 0;
      const breath = Math.sin(breathingPhase) * amp + irregularity;
      chestRef.current.scale.y = 1 + breath;
      chestRef.current.position.y = breath * 0.5;
      // labored accessory muscle use — slight lateral expansion
      if (distressed) chestRef.current.scale.x = 1 + Math.abs(Math.sin(breathingPhase)) * 0.012;
    }
    if (headRef.current && !empty) {
      // restless head turning in distress
      if (isCrit) {
        headRef.current.rotation.z = Math.sin(t * 0.8) * 0.08;
        headRef.current.rotation.x = Math.sin(t * 1.2) * 0.04;
        headRef.current.position.y = 0.99 + Math.sin(t * 2.5) * 0.008;
      } else if (isHigh) {
        headRef.current.rotation.z = Math.sin(t * 0.4) * 0.04;
      } else {
        headRef.current.rotation.z = 0;
        headRef.current.rotation.x = 0;
      }
    }
    if (leftArmRef.current && !empty) {
      // restless limb movement — arm twitching in distress
      if (isCrit) {
        leftArmRef.current.rotation.z = Math.PI / 2 + Math.sin(t * 1.6) * 0.06;
        leftArmRef.current.position.z = 0.22 + Math.sin(t * 2.2) * 0.02;
      } else if (isHigh) {
        leftArmRef.current.rotation.z = Math.PI / 2 + Math.sin(t * 0.7) * 0.02;
      }
    }
    if (rightArmRef.current && !empty) {
      if (isCrit) {
        rightArmRef.current.rotation.z = -Math.PI / 2 + Math.sin(t * 1.1 + 1) * 0.05;
        rightArmRef.current.position.y = 0.90 + Math.sin(t * 3) * 0.006;
      }
    }
    // sweat sheen pulsing on critical patients
    if (sweatRef.current) {
      const mat = sweatRef.current.material as THREE.MeshStandardMaterial;
      mat.opacity = distressed ? 0.22 + Math.sin(t * 3) * 0.08 : 0;
    }
  });
  return (
    <group>
      {/* bed undercarriage */}
      <mesh position={[0,0.28,0]} castShadow receiveShadow>
        <boxGeometry args={[1.0,0.14,2.22]} />
        <meshStandardMaterial color="#2a3338" roughness={0.65} metalness={0.25} />
      </mesh>
      {[-0.46,0.46].flatMap(x=> [-0.98,0.98].map(z=> (
        <group key={`${x}-${z}`} position={[x,0.11,z]}>
          <mesh rotation={[0,0,Math.PI/2]} castShadow><cylinderGeometry args={[0.11,0.11,0.06,14]} /><meshStandardMaterial color="#1a2328" /></mesh>
          <mesh position={[0,0.06,0]}><boxGeometry args={[0.08,0.04,0.14]} /><meshStandardMaterial color="#dc2626" /></mesh>
        </group>
      )))}
      <mesh position={[0,0.46,0]} castShadow><cylinderGeometry args={[0.08,0.08,0.32,12]} /><meshStandardMaterial color="#64748b" metalness={0.8} /></mesh>
      <mesh position={[0,0.62,0]} castShadow receiveShadow><boxGeometry args={[1.08,0.08,2.08]} /><meshStandardMaterial color="#334155" roughness={0.7} /></mesh>
      {/* mattress */}
      <mesh position={[0,0.71,0]} castShadow><boxGeometry args={[1.02,0.13,2.02]} /><meshStandardMaterial color={empty?"#dbeafe":"#cfe3e0"} roughness={0.85} /></mesh>
      <mesh position={[0,0.79,0]}><boxGeometry args={[0.98,0.04,1.98]} /><meshStandardMaterial color="#e0f2fe" roughness={0.9} /></mesh>
      {/* pillow */}
      {!empty && <mesh position={[0,0.89,-0.68]} castShadow><boxGeometry args={[0.58,0.09,0.42]} /><meshStandardMaterial color={distressed?"#e8e0d8":"#f8fafc"} roughness={0.95} /></mesh>}
      {/* head / foot boards */}
      <mesh position={[0,0.68,-1.08]} castShadow><boxGeometry args={[1.12,0.42,0.08]} /><meshPhysicalMaterial color="#e2e8f0" roughness={0.35} clearcoat={0.4} /></mesh>
      <mesh position={[0,0.66,1.08]} castShadow><boxGeometry args={[1.12,0.38,0.08]} /><meshPhysicalMaterial color="#e2e8f0" roughness={0.35} clearcoat={0.4} /></mesh>
      {/* side rails */}
      {[-0.52,0.52].map(x=>(
        <group key={x} position={[x,0.82,0]}>
          <mesh castShadow><boxGeometry args={[0.04,0.28,1.62]} /><meshStandardMaterial color="#cbd5e1" metalness={0.3} roughness={0.4} /></mesh>
          <mesh><boxGeometry args={[0.05,0.04,1.1]} /><meshStandardMaterial color="#94a3b8" /></mesh>
          <mesh position={[0,0.08,0.55]}><boxGeometry args={[0.02,0.18,0.02]} /><meshStandardMaterial color="#64748b" /></mesh>
          <mesh position={[0,0.08,-0.55]}><boxGeometry args={[0.02,0.18,0.02]} /><meshStandardMaterial color="#64748b" /></mesh>
        </group>
      ))}

      {/* === PATIENT BODY === */}
      {!empty && (
        <group scale={[bodyScale, 1, 1]}>
          {/* blanket - rumpled in distress, neat when stable */}
          <mesh position={[0,0.88,0.15]} rotation={[distressed?0.05:0.02,0,distressed?0.03:0]} castShadow>
            <boxGeometry args={[0.92,0.07,1.55]} />
            <meshStandardMaterial color={distressed?"#e8e2db":"#f8fafc"} roughness={0.96} />
          </mesh>
          {distressed && <>
            <mesh position={[0.12,0.91,-0.08]} rotation={[0.08,0.05,0.06]}><boxGeometry args={[0.35,0.02,0.5]} /><meshStandardMaterial color="#ddd6cc" roughness={0.98} transparent opacity={0.85} /></mesh>
            <mesh position={[-0.15,0.90,0.35]} rotation={[-0.04,0.03,-0.05]}><boxGeometry args={[0.42,0.015,0.38]} /><meshStandardMaterial color="#e2ddd5" roughness={0.98} transparent opacity={0.8} /></mesh>
          </>}
          {!distressed && <mesh position={[0.08,0.91,0.02]} rotation={[0.04,0,0.02]}><boxGeometry args={[0.88,0.015,1.45]} /><meshStandardMaterial color="#e6eef5" roughness={0.98} transparent opacity={0.9} /></mesh>}

          {/* torso with breathing + labored movement */}
          <group ref={chestRef} position={[0,0.92,0.05]}>
            <mesh castShadow rotation={[0,0,Math.PI/2]}><capsuleGeometry args={[0.23,0.72,8,14]} /><meshStandardMaterial color={activeSkin} roughness={0.75} /></mesh>
            {/* hospital gown */}
            <mesh position={[0,0.06,0.62]}><boxGeometry args={[0.42,0.06,0.18]} /><meshStandardMaterial color="#dbeafe" roughness={0.9} /></mesh>
            {/* sweat sheen overlay on torso */}
            <mesh ref={sweatRef} position={[0,0.01,0.15]} rotation={[0,0,Math.PI/2]}><capsuleGeometry args={[0.24,0.74,8,14]} /><meshStandardMaterial color="#ffffff" transparent opacity={0} metalness={0.9} roughness={0.05} /></mesh>
            {/* ECG electrode pads on chest */}
            {[[0.12,0.14,0.42],[- 0.10,0.14,0.38],[0.02,0.12,-0.08]].map(([ex,ey,ez],i)=>(
              <mesh key={i} position={[ex,ey,ez]}><cylinderGeometry args={[0.025,0.025,0.008,10]} /><meshStandardMaterial color="#e2e8f0" metalness={0.3} /></mesh>
            ))}
          </group>

          {/* head — restless in distress, peaceful when stable */}
          <group ref={headRef} position={[0,0.99,0.78]}>
            <mesh castShadow><sphereGeometry args={[0.17,18,14]} /><meshStandardMaterial color={activeSkin} roughness={isCrit?0.65:0.78} metalness={distressed?0.06:0.02} /></mesh>
            {/* sweat beads on forehead */}
            {distressed && <>
              <mesh position={[0.04,0.12,0.11]}><sphereGeometry args={[0.012,6,6]} /><meshStandardMaterial color="#cdd5dc" metalness={0.95} roughness={0.05} transparent opacity={0.7} /></mesh>
              <mesh position={[-0.06,0.11,0.1]}><sphereGeometry args={[0.01,6,6]} /><meshStandardMaterial color="#c8d0d8" metalness={0.95} roughness={0.05} transparent opacity={0.6} /></mesh>
              <mesh position={[0.02,0.13,0.08]}><sphereGeometry args={[0.009,6,6]} /><meshStandardMaterial color="#d0d8e0" metalness={0.95} roughness={0.05} transparent opacity={0.5} /></mesh>
            </>}
            {/* hair */}
            {isFemale ? (
              <mesh position={[0,0.08,-0.04]}><sphereGeometry args={[0.175,16,12,0,Math.PI*2,0,Math.PI*0.58]} /><meshStandardMaterial color={age>55?"#a8a29e":"#3f2a1d"} roughness={0.95} /></mesh>
            ) : (
              <mesh position={[0,0.07,-0.02]}><sphereGeometry args={[0.168,16,12,0,Math.PI*2,0,Math.PI*0.5]} /><meshStandardMaterial color={age>60?"#9ca3af":age>45?"#4b3a2a":"#2d1f14"} roughness={0.92} /></mesh>
            )}
            {/* eyes — grimacing when critical, closed when stable */}
            {isCrit ? (<>
              <mesh position={[0.05,0.02,0.14]}><sphereGeometry args={[0.018,8,6]} /><meshStandardMaterial color="#1e293b" /></mesh>
              <mesh position={[-0.05,0.02,0.14]}><sphereGeometry args={[0.018,8,6]} /><meshStandardMaterial color="#1e293b" /></mesh>
              {/* furrowed brow */}
              <mesh position={[0,0.08,0.14]}><boxGeometry args={[0.08,0.008,0.005]} /><meshStandardMaterial color={activeSkin} /></mesh>
            </>) : (<>
              <mesh position={[0.05,0.02,0.14]}><sphereGeometry args={[0.016,8,6]} /><meshStandardMaterial color="#1e293b" /></mesh>
              <mesh position={[-0.05,0.02,0.14]}><sphereGeometry args={[0.016,8,6]} /><meshStandardMaterial color="#1e293b" /></mesh>
            </>)}
            {/* endotracheal tube for ventilated critical patients */}
            {isCrit && (
              <group>
                <mesh position={[0,-0.04,0.16]}><cylinderGeometry args={[0.025,0.025,0.14,10]} /><meshStandardMaterial color="#e8e0d0" transparent opacity={0.9} /></mesh>
                <mesh position={[0,-0.06,0.22]} rotation={[0.6,0,0]}><cylinderGeometry args={[0.022,0.022,0.25,8]} /><meshStandardMaterial color="#d5e0e5" transparent opacity={0.85} /></mesh>
                {/* tape securing ET tube */}
                <mesh position={[0,-0.02,0.16]}><boxGeometry args={[0.12,0.015,0.04]} /><meshStandardMaterial color="#f5e6d0" roughness={0.95} /></mesh>
              </group>
            )}
            {/* nasal cannula for non-critical */}
            {!isCrit && <>
              <mesh position={[0,0,0.12]}><torusGeometry args={[0.075,0.012,8,16,Math.PI]} /><meshStandardMaterial color="#e0f2fe" transparent opacity={0.88} /></mesh>
              <mesh position={[0.075,-0.01,0.16]}><cylinderGeometry args={[0.006,0.006,0.12,6]} /><meshStandardMaterial color="#bae6fd" /></mesh>
              <mesh position={[-0.075,-0.01,0.16]}><cylinderGeometry args={[0.006,0.006,0.12,6]} /><meshStandardMaterial color="#bae6fd" /></mesh>
            </>}
          </group>

          {/* ECG lead wires from chest to monitor */}
          <mesh position={[0.18,0.96,0.28]} rotation={[0.3,0,0.6]}><cylinderGeometry args={[0.008,0.008,0.55,6]} /><meshStandardMaterial color="#22c55e" emissive="#16a34a" emissiveIntensity={0.15} /></mesh>
          <mesh position={[-0.14,0.96,0.22]} rotation={[-0.2,0,-0.5]}><cylinderGeometry args={[0.008,0.008,0.48,6]} /><meshStandardMaterial color="#ef4444" emissive="#dc2626" emissiveIntensity={0.15} /></mesh>
          <mesh position={[0.08,0.96,-0.15]} rotation={[0.1,0,0.2]}><cylinderGeometry args={[0.008,0.008,0.52,6]} /><meshStandardMaterial color="#eab308" emissive="#ca8a04" emissiveIntensity={0.12} /></mesh>

          {/* LEFT arm — IV cannula side — restless in distress */}
          <group ref={leftArmRef} position={[0.38,0.90,0.22]} rotation={[0,0,Math.PI/2]}>
            <mesh><capsuleGeometry args={[0.055,0.32,6,10]} /><meshStandardMaterial color={activeSkin} roughness={0.75} /></mesh>
            <mesh position={[0,0,0.2]}><sphereGeometry args={[0.055,10,8]} /><meshStandardMaterial color={activeSkin} /></mesh>
            {/* IV cannula with tape and line */}
            <mesh position={[0.02,0.04,0.05]}><boxGeometry args={[0.04,0.015,0.025]} /><meshStandardMaterial color="#f5e6d0" roughness={0.95} /></mesh>
            <mesh position={[0.02,0.05,0.05]}><cylinderGeometry args={[0.004,0.004,0.18,6]} /><meshStandardMaterial color="#7dd3fc" /></mesh>
            {/* SpO2 finger probe */}
            <mesh position={[0,0,-0.18]}><boxGeometry args={[0.06,0.04,0.05]} /><meshStandardMaterial color="#1e293b" /></mesh>
            <mesh position={[0,-0.005,-0.18]}><boxGeometry args={[0.05,0.01,0.04]} /><meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={1.5} /></mesh>
          </group>

          {/* RIGHT arm resting at side — twitches in critical */}
          <group ref={rightArmRef} position={[-0.38,0.90,0.22]} rotation={[0,0,-Math.PI/2]}>
            <mesh><capsuleGeometry args={[0.052,0.28,6,10]} /><meshStandardMaterial color={activeSkin} roughness={0.75} /></mesh>
            <mesh position={[0,0,0.16]}><sphereGeometry args={[0.052,10,8]} /><meshStandardMaterial color={activeSkin} /></mesh>
            {/* BP cuff on upper arm */}
            <mesh position={[0,0,-0.06]}><cylinderGeometry args={[0.065,0.065,0.1,14]} /><meshStandardMaterial color="#1e3a5f" roughness={0.8} /></mesh>
            {/* arterial line on wrist for critical */}
            {distressed && <mesh position={[0,0.04,0.14]}><boxGeometry args={[0.04,0.012,0.03]} /><meshStandardMaterial color="#f5e6d0" /></mesh>}
          </group>

          {/* legs under blanket - slight form */}
          <mesh position={[-0.16,0.86,-0.35]} rotation={[0,0,-0.05]}><capsuleGeometry args={[0.075,0.65,6,10]} /><meshStandardMaterial color="#dfe8ee" roughness={0.95} transparent opacity={0.6} /></mesh>
          <mesh position={[0.16,0.86,-0.35]} rotation={[0,0,0.05]}><capsuleGeometry args={[0.075,0.65,6,10]} /><meshStandardMaterial color="#dfe8ee" roughness={0.95} transparent opacity={0.6} /></mesh>

          {/* urine catheter bag visible on bed side for critical */}
          {distressed && (
            <group position={[-0.58,0.38,-0.35]}>
              <mesh><boxGeometry args={[0.14,0.22,0.06]} /><meshPhysicalMaterial color="#f5e8a0" transmission={0.4} roughness={0.12} thickness={0.3} /></mesh>
              <mesh position={[0,0.12,0]}><cylinderGeometry args={[0.006,0.006,0.35,6]} /><meshStandardMaterial color="#e8e0c0" /></mesh>
            </group>
          )}

          {/* ventilator circuit connection for critical */}
          {isCrit && (
            <group position={[0.15,1.08,0.92]}>
              <mesh rotation={[0.8,0,0]}><torusGeometry args={[0.08,0.018,8,16,Math.PI*1.3]} /><meshStandardMaterial color="#e2e8f0" roughness={0.8} /></mesh>
              <mesh position={[0,-0.08,0.08]}><cylinderGeometry args={[0.018,0.018,0.3,8]} /><meshStandardMaterial color="#d8e0e6" /></mesh>
            </group>
          )}
        </group>
      )}
      {/* chart holder */}
      <mesh position={[0.58,0.72,1.08]} rotation={[0.2,0,0]} castShadow><boxGeometry args={[0.22,0.02,0.32]} /><meshStandardMaterial color="#475569" /></mesh>
    </group>
  );
}

function AdvancedMonitor({ color, urgent, hr, spo2 }: { color: string; urgent: boolean; hr: number; spo2: number }) {
  const tex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 256; c.height = 160;
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    (t as any)._canvas = c;
    return t;
  }, []);
  const phaseRef = useRef(0);
  const ecgData = useRef<number[]>(Array(64).fill(0));
  const plethData = useRef<number[]>(Array(64).fill(0));
  useFrame((_, dt) => {
    const canvas = (tex as any)._canvas as HTMLCanvasElement;
    const ctx = canvas.getContext("2d")!;
    phaseRef.current += dt * (hr / 60);
    const beat = (p:number)=>{
      const g=(x:number,c:number,w:number)=>Math.exp(-Math.pow((x-c)/w,2));
      return (0.16*g(p,0.18,0.03) -0.14*g(p,0.31,0.015)+1*g(p,0.34,0.012)-0.28*g(p,0.375,0.014)+0.30*g(p,0.58,0.05));
    };
    const p = phaseRef.current % 1;
    ecgData.current.push(beat(p));
    ecgData.current.shift();
    const pleth = 0.55 + 0.35*Math.sin(p*Math.PI*2) + 0.12*Math.sin(p*Math.PI*4+0.6);
    plethData.current.push(pleth);
    plethData.current.shift();
    ctx.fillStyle = "#020d14";
    ctx.fillRect(0,0,256,160);
    ctx.strokeStyle = "rgba(56,189,248,0.08)";
    ctx.lineWidth = 1;
    for(let x=0;x<256;x+=16){ ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,160); ctx.stroke(); }
    for(let y=0;y<160;y+=16){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(256,y); ctx.stroke(); }
    ctx.beginPath();
    ctx.strokeStyle = urgent ? "#ff6b6b" : "#4ade80";
    ctx.lineWidth = 2.2;
    ctx.shadowBlur = urgent ? 8 : 0;
    ctx.shadowColor = ctx.strokeStyle;
    ecgData.current.forEach((v,i)=>{
      const x = (i/64)*256;
      const y = 46 - v*38;
      i===0? ctx.moveTo(x,y): ctx.lineTo(x,y);
    });
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 1.7;
    plethData.current.forEach((v,i)=>{
      const x=(i/64)*256;
      const y= 108 - v*28;
      i===0? ctx.moveTo(x,y): ctx.lineTo(x,y);
    });
    ctx.stroke();
    ctx.fillStyle = urgent ? "#ff6b6b" : "#4ade80";
    ctx.font="bold 16px monospace";
    ctx.fillText(String(Math.round(hr)), 8, 22);
    ctx.fillStyle="#38bdf8";
    ctx.fillText(String(spo2), 8, 88);
    ctx.fillStyle="rgba(255,255,255,0.55)";
    ctx.font="7px monospace";
    ctx.fillText("HR bpm", 42, 22);
    ctx.fillText("SpO₂ %", 42, 88);
    ctx.fillText("ECG II  x1  25mm/s", 150, 14);
    ctx.fillText("PLETH", 150, 82);
    // Alarm overlay — flashing red banner when the patient deteriorates
    if (urgent) {
      const flashOn = Math.sin(performance.now() / 180) > 0;
      ctx.fillStyle = flashOn ? "rgba(255,30,50,0.85)" : "rgba(255,30,50,0.25)";
      ctx.fillRect(0, 130, 256, 30);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 13px monospace";
      ctx.fillText("⚠ ALARM", 8, 151);
      ctx.font = "8px monospace";
      ctx.fillText(flashOn ? "HR HIGH · SPO2 LOW" : "", 96, 150);
    }
    tex.needsUpdate = true;
  });
  return (
    <group name="bedside_monitor_advanced">
      <mesh position={[0,0.05,-0.18]} castShadow><cylinderGeometry args={[0.025,0.025,0.48,10]} /><meshStandardMaterial color="#9aa8b0" metalness={0.85} /></mesh>
      <mesh position={[0,0.28, -0.08]} castShadow><sphereGeometry args={[0.05,12,10]} /><meshStandardMaterial color="#64748b" metalness={0.9} /></mesh>
      <mesh position={[0,0.42,0]} castShadow>
        <boxGeometry args={[0.86,0.62,0.11]} />
        <meshPhysicalMaterial color="#0f1a22" roughness={0.3} metalness={0.45} />
      </mesh>
      <mesh position={[0,0.42,0.06]}>
        <planeGeometry args={[0.76,0.48]} />
        <meshBasicMaterial map={tex} />
      </mesh>
      <mesh position={[0.38,0.14,0.07]}><boxGeometry args={[0.08,0.04,0.01]} /><meshStandardMaterial color="#334155" /></mesh>
      <mesh position={[0,0.74,0.06]}>
        <boxGeometry args={[0.86,0.04,0.02]} />
        <meshStandardMaterial color={urgent? "#ff4d5e": color} emissive={urgent? "#ff1e3c": color} emissiveIntensity={urgent? 3.5: 0.6} />
      </mesh>
    </group>
  );
}

function InfusionTower({ active }: { active: boolean }) {
  const dripRef = useRef<THREE.Group>(null);
  useFrame((s)=>{
    if(!dripRef.current) return;
    dripRef.current.children.forEach((c,i)=>{
      const mesh = c as THREE.Mesh;
      if(mesh.name==="drip"){
        const p = (s.clock.elapsedTime*0.7 + i*0.33)%1;
        mesh.position.y = 1.22 - p*0.68;
        (mesh as any).visible = active && p<0.82;
      }
    });
  });
  return (
    <group name="infusion_tower">
      <mesh position={[0,0.92,0]} castShadow><cylinderGeometry args={[0.022,0.022,1.95,8]} /><meshStandardMaterial color="#9aa8b0" metalness={0.9} /></mesh>
      <mesh position={[0,1.88,0]}><boxGeometry args={[0.52,0.03,0.03]} /><meshStandardMaterial color="#8a9aa6" metalness={0.85} /></mesh>
      {[-0.16,0.16].map(x=>(
        <group key={x} position={[x,1.58,0]}>
          <mesh castShadow><boxGeometry args={[0.15,0.32,0.06]} /><meshPhysicalMaterial color="#dbeafe" transmission={0.6} roughness={0.15} thickness={0.3} /></mesh>
          <mesh position={[0,-0.22,0]}><cylinderGeometry args={[0.01,0.01,0.22,6]} /><meshStandardMaterial color="#bae6fd" /></mesh>
        </group>
      ))}
      <group position={[0,0.68,0.06]}>
        {[0.28,0, -0.28].map((y,i)=>(
          <group key={i} position={[0,y,0]}>
            <mesh castShadow><boxGeometry args={[0.36,0.22,0.26]} /><meshPhysicalMaterial color="#f8fafc" roughness={0.35} /></mesh>
            <mesh position={[0,0.02,0.135]}><planeGeometry args={[0.24,0.12]} /><meshStandardMaterial color="#0b1a24" emissive={active? (i===0?"#22c55e": i===1?"#38bdf8":"#f59e0b"): "#334155"} emissiveIntensity={active?1.4:0.2} /></mesh>
            <mesh position={[0.12,-0.06,0.135]}><circleGeometry args={[0.02,12]} /><meshStandardMaterial color={active?"#22c55e":"#475569"} emissive={active?"#22c55e":"#000"} emissiveIntensity={active?2:0} /></mesh>
          </group>
        ))}
      </group>
      <group ref={dripRef}>
        {[-0.16,0.16].map((x,i)=>(
          <mesh key={i} name="drip" position={[x,1.22,0]}><sphereGeometry args={[0.028,8,8]} /><meshStandardMaterial color="#7dd3fc" emissive="#38bdf8" emissiveIntensity={1.2} /></mesh>
        ))}
      </group>
      <mesh position={[0,0.06,0]}><cylinderGeometry args={[0.28,0.28,0.04,16]} /><meshStandardMaterial color="#475569" metalness={0.6} /></mesh>
    </group>
  );
}

function VentilatorAdvanced({ active, acuity }: { active: boolean; acuity: IcuAcuity }) {
  const screenRef = useRef<THREE.Mesh>(null);
  useFrame((s)=>{
    if(!screenRef.current) return;
    const m = screenRef.current.material as THREE.MeshStandardMaterial;
    m.emissiveIntensity = active ? 1.8 + Math.sin(s.clock.elapsedTime*3)*0.5 : 0.35;
  });
  const alarm = acuity==="critical" || acuity==="high";
  return (
    <group name="ventilator_advanced">
      <mesh position={[0,0.14,0]} castShadow><boxGeometry args={[0.52,0.08,0.52]} /><meshStandardMaterial color="#334155" /></mesh>
      {[-0.22,0.22].flatMap(x=> [-0.22,0.22].map(z=> (
        <mesh key={`${x}-${z}`} position={[x,0.05,z]} rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[0.06,0.06,0.04,10]} /><meshStandardMaterial color="#0f172a" /></mesh>
      )))}
      <mesh position={[0,0.55,0]} castShadow><cylinderGeometry args={[0.04,0.04,0.82,10]} /><meshStandardMaterial color="#94a3b8" metalness={0.85} /></mesh>
      <mesh position={[0,0.98,0]} castShadow><boxGeometry args={[0.52,0.52,0.42]} /><meshPhysicalMaterial color="#f1f5f9" roughness={0.3} /></mesh>
      <mesh position={[0,0.84,0]}><boxGeometry args={[0.48,0.02,0.38]} /><meshStandardMaterial color="#cbd5e1" /></mesh>
      <mesh ref={screenRef} position={[0,1.02,0.22]}><planeGeometry args={[0.38,0.26]} /><meshStandardMaterial color="#0c1f2e" emissive={alarm?"#ff4d5e":"#22d3ee"} emissiveIntensity={1.4} /></mesh>
      <mesh position={[0,1.02,0.225]}><planeGeometry args={[0.32,0.02]} /><meshBasicMaterial color="#7dd3fc" transparent opacity={0.9} /></mesh>
      <mesh position={[-0.16,0.76,0.22]}><cylinderGeometry args={[0.045,0.045,0.03,16]} /><meshStandardMaterial color="#1e293b" metalness={0.7} /></mesh>
      <mesh position={[0.16,0.76,0.22]}><cylinderGeometry args={[0.045,0.045,0.03,16]} /><meshStandardMaterial color="#1e293b" metalness={0.7} /></mesh>
      <mesh position={[-0.22,0.98,0.32]} rotation={[0.6,0,0.4]}><torusGeometry args={[0.09,0.02,8,16, Math.PI*1.3]} /><meshStandardMaterial color="#e2e8f0" roughness={0.8} /></mesh>
      <mesh position={[0.22,0.98,0.32]} rotation={[0.6,0,-0.4]}><torusGeometry args={[0.09,0.02,8,16, Math.PI*1.3]} /><meshStandardMaterial color="#e2e8f0" roughness={0.8} /></mesh>
      <mesh position={[0,-0.1,0.18]}><boxGeometry args={[0.22,0.18,0.18]} /><meshStandardMaterial color="#e2e8f0" /></mesh>
    </group>
  );
}

function BedsideTable({ hasChart }: { hasChart?: boolean }) {
  return (
    <group>
      <mesh position={[0,0.42,0]} castShadow><boxGeometry args={[0.44,0.04,0.38]} /><meshStandardMaterial color="#cbd5e1" roughness={0.6} /></mesh>
      <mesh position={[0,0.24,0]}><boxGeometry args={[0.4,0.32,0.34]} /><meshStandardMaterial color="#e2e8f0" roughness={0.7} /></mesh>
      {[-0.16,0.16].map(x=> <mesh key={x} position={[x,0.06,0]} rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[0.04,0.04,0.02,10]} /><meshStandardMaterial color="#1e293b" /></mesh>)}
      {hasChart && <mesh position={[0,0.48,0]}><boxGeometry args={[0.22,0.02,0.28]} /><meshStandardMaterial color="#ffffff" roughness={0.9} /></mesh>}
      <mesh position={[0.12,0.48,0.08]}><cylinderGeometry args={[0.04,0.04,0.08,10]} /><meshStandardMaterial color="#fbbf24" /></mesh>
    </group>
  );
}

function IcuBed({
  id, position, acuity, selected, empty, hr, spo2, treatmentActive, patient, onSelect,
}: {
  id: string;
  position: [number, number, number];
  acuity: IcuAcuity;
  selected: boolean;
  empty: boolean;
  hr: number;
  spo2: number;
  treatmentActive: boolean;
  patient?: IcuPatient;
  onSelect?: () => void;
}) {
  const color = ACUITY_COLOR[acuity];
  const halo = useRef<THREE.Mesh>(null);
  const alarm = acuity === "critical" || acuity === "high";
  const breathPhase = useRef(Math.random()*Math.PI*2);
  useFrame((state, delta) => {
    breathPhase.current += delta * (acuity==="critical" ? 0.95 : acuity==="high" ? 0.75 : 0.42);
    if (!halo.current) return;
    const m = halo.current.material as THREE.MeshBasicMaterial;
    const t = state.clock.elapsedTime;
    const pulse = alarm ? 7 : 1.8;
    m.opacity = selected ? 0.38 + Math.sin(t*pulse)*0.14 : 0.11;
    halo.current.scale.setScalar(1 + Math.sin(t*pulse*0.7)*0.06);
  });
  return (
    <group
      position={position}
      name={`icu_bed_${id.toLowerCase().replace("-", "_")}`}
      onClick={(event) => { event.stopPropagation(); onSelect?.(); }}
      onPointerOver={() => { if (onSelect) document.body.style.cursor = "pointer"; }}
      onPointerOut={() => { document.body.style.cursor = "auto"; }}
    >
      <mesh ref={halo} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <ringGeometry args={[1.22, 1.52, 40]} />
        <meshBasicMaterial color={color} transparent opacity={0.22} depthWrite={false} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0,0.028,0]}>
        <circleGeometry args={[1.22, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.07} depthWrite={false} />
      </mesh>
      <PrivacyCurtain active={selected} />
      <Headwall color={color} />
      <group position={[0,0,0]}>
        <RealisticBed empty={empty} breathingPhase={breathPhase.current} hr={hr} patient={patient} acuity={acuity} />
      </group>
      <group position={[-0.92, 1.02, -0.62]}>
        <AdvancedMonitor color={color} urgent={alarm && selected} hr={hr} spo2={spo2} />
      </group>
      <group position={[0.98, 0, -0.72]}>
        <InfusionTower active={!empty} />
      </group>
      <group position={[1.08, 0, 0.58]}>
        <VentilatorAdvanced active={treatmentActive || (!empty && acuity!=="ready")} acuity={acuity} />
      </group>
      <group position={[-1.05, 0, 0.85]}>
        <BedsideTable hasChart={!empty} />
      </group>
      <group position={[-0.55, 0, 1.25]}>
        <mesh castShadow position={[0,0.42,0]}><boxGeometry args={[0.42,0.08,0.42]} /><meshStandardMaterial color="#94a3b8" roughness={0.7} /></mesh>
        <mesh position={[0,0.22,0]}><boxGeometry args={[0.4,0.32,0.4]} /><meshStandardMaterial color="#cbd5e1" /></mesh>
        <mesh position={[0,0.52,-0.16]}><boxGeometry args={[0.4,0.32,0.04]} /><meshStandardMaterial color="#94a3b8" /></mesh>
      </group>
      <group position={[-0.82, 0.32, -1.08]}>
        <mesh><boxGeometry args={[0.18,0.26,0.12]} /><meshStandardMaterial color="#fee2e2" /></mesh>
        <mesh position={[0,0.08,0.07]}><boxGeometry args={[0.12,0.08,0.02]} /><meshStandardMaterial color="#dc2626" /></mesh>
      </group>
      <mesh position={[0.92,1.05,-1.12]}><boxGeometry args={[0.14,0.28,0.06]} /><meshStandardMaterial color="#e0f2fe" emissive="#38bdf8" emissiveIntensity={0.15} /></mesh>
      <group position={[0,1.42,-1.22]}>
        <mesh><boxGeometry args={[1.15,0.18,0.02]} /><meshStandardMaterial color="#0f172a" /></mesh>
        <Html position={[0,0,0.02]} center transform distanceFactor={8}><div className="pointer-events-none font-mono text-[7px] font-bold tracking-[0.12em] text-white" style={{textShadow:"0 1px 4px rgba(0,0,0,0.6)"}}>{id}</div></Html>
      </group>
      <mesh position={[0,1.52,-1.18]}>
        <boxGeometry args={[1.15,0.06,0.02]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={selected?2.8:0.9} />
      </mesh>
      {selected && <pointLight position={[0,1.9,0]} color={color} intensity={alarm?18:6} distance={4.2} decay={2} />}
      {id==="ICU-04" && !selected && (
        <Html position={[0,2.25,0]} center distanceFactor={15} zIndexRange={[14,0]}>
          <div className="pointer-events-none animate-pulse border border-cyan-300 bg-cyan-500/10 px-3 py-1.5 font-mono text-[8px] font-bold tracking-widest text-cyan-100 shadow-lg backdrop-blur">▶ CLICK ICU-04</div>
        </Html>
      )}
      {id==="ICU-04" && selected && (
        <Html position={[0,2.55,0]} center distanceFactor={13} zIndexRange={[16,0]}>
          <div className="pointer-events-none w-44 border-l-2 bg-[#040d16f2] px-3 py-2 shadow-2xl backdrop-blur-xl" style={{borderColor: color}}>
            <div className="flex justify-between font-mono text-[9px] font-bold"><span className="text-white">ICU-04</span><span style={{color}}>{acuity.toUpperCase()}</span></div>
            <div className="mt-1 flex justify-between font-mono text-[8px]"><span className="text-emerald-300">HR {hr}</span><span className="text-cyan-300">SpO₂ {spo2}%</span><span className="text-slate-400">LIVE</span></div>
            {alarm && <div className="mt-1 animate-pulse text-center font-mono text-[7px] font-bold text-rose-300">● ALARM</div>}
          </div>
        </Html>
      )}
      {empty && (
        <group name="emergency_ready_beacon">
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
            <ringGeometry args={[1.4, 1.7, 40]} />
            <meshBasicMaterial color="#38bdf8" transparent opacity={0.5} depthWrite={false} />
          </mesh>
          <Html position={[0,1.78,0]} center distanceFactor={16}>
            <div className="pointer-events-none animate-pulse border border-cyan-400/50 bg-cyan-500/15 px-2 py-1 font-mono text-[7px] font-bold tracking-widest text-cyan-100 shadow-[0_0_14px_rgba(56,189,248,0.5)]">
              ● EMERGENCY READY
            </div>
          </Html>
        </group>
      )}
    </group>
  );
}

function RoutineRounds({ active, urgency }: { active: boolean; urgency: boolean }) {
  const staff = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!staff.current) return;
    staff.current.visible = active;
    const t = state.clock.elapsedTime;
    staff.current.children.forEach((child, index) => {
      const speed = urgency ? 0.62 : 0.2;
      const phase = t * speed + index * 1.55;
      const x = Math.sin(phase) * 7.4;
      const z = -0.05 + Math.cos(phase*0.55 + index)*1.05;
      child.position.set(x, 0, z);
      child.rotation.y = Math.cos(phase)*0.35;
      if(urgency && (child as any).userData.isNurse){
        child.lookAt(1.2, 0.9, -3.2);
      }
    });
  });
  return (
    <group ref={staff} name="icu_routine_rounds">
      <group userData={{isNurse:false}}><Person position={[0,0,0]} color="#eef4f5" scale={0.92} /></group>
      <group userData={{isNurse:true}}><Person position={[0,0,0]} color="#0ea5e9" scale={0.9} /></group>
      <group userData={{isNurse:false}}><Person position={[0,0,0]} color="#f8fafc" scale={0.88} /></group>
      <group userData={{isNurse:true}}><Person position={[0,0,0]} color="#38bdf8" scale={0.86} /></group>
    </group>
  );
}

/**
 * Rapid clinical response — when ICU-04 deteriorates:
 *  - nurses run from the station toward the bed (stages 4–7)
 *  - a doctor enters from the corridor during treatment (stage 8)
 *  - the team eases away during recovery (stage 9)
 *  - everything returns to normal at discharge (stage 10)
 */
function ClinicalResponse({ stageId, acuity }: { stageId: number; acuity: IcuAcuity }) {
  const nurseA = useRef<THREE.Group>(null);
  const nurseB = useRef<THREE.Group>(null);
  const doctor = useRef<THREE.Group>(null);

  const alert = acuity === "critical" || acuity === "high";
  const treating = stageId === 8;
  const recovering = stageId === 9;
  const done = stageId === 10;

  // Path for nurses: nurse station (0,0,0.9) → beside ICU-04 (1.2,0,-2.6)
  // Doctor path: corridor entrance (4.5,0,0) → ICU-04 (1.9,0,-2.4)
  useFrame((state) => {
    const t = state.clock.elapsedTime;

    // NURSES — sprint in on alert, hover during treatment, walk out on recovery
    if (nurseA.current) {
      const visible = alert || treating || recovering;
      nurseA.current.visible = visible;
      if (visible) {
        let prog: number;
        if (alert) prog = Math.min(1, ((t - 0.3) * 0.4)); // sprint in
        else if (treating) prog = 1;
        else prog = 1 - Math.min(1, (t - 0.5) * 0.25); // leave
        if (done) prog = 0;
        const cx = THREE.MathUtils.lerp(0.2, 1.25, THREE.MathUtils.smoothstep(prog, 0, 1));
        const cz = THREE.MathUtils.lerp(1.1, -2.7, THREE.MathUtils.smoothstep(prog, 0, 1));
        nurseA.current.position.set(cx, 0, cz);
        nurseA.current.rotation.y = Math.atan2(1.25 - 0.2, -2.7 - 1.1) + Math.PI / 2;
        // arm movement (adjusting IV) while treating
        if (treating) {
          (nurseA.current.children[1] as THREE.Group).rotation.x = Math.sin(t * 3) * 0.4;
        }
      }
    }
    if (nurseB.current) {
      const visible = alert || treating || recovering;
      nurseB.current.visible = visible;
      if (visible) {
        let prog: number;
        if (alert) prog = Math.min(1, ((t - 0.6) * 0.4));
        else if (treating) prog = 1;
        else prog = 1 - Math.min(1, (t - 0.8) * 0.25);
        if (done) prog = 0;
        const cx = THREE.MathUtils.lerp(-0.3, 0.9, THREE.MathUtils.smoothstep(prog, 0, 1));
        const cz = THREE.MathUtils.lerp(1.3, -3.1, THREE.MathUtils.smoothstep(prog, 0, 1));
        nurseB.current.position.set(cx, 0, cz);
        nurseB.current.rotation.y = Math.atan2(0.9 + 0.3, -3.1 - 1.3) + Math.PI / 2;
      }
    }

    // DOCTOR — walks in briskly during treatment
    if (doctor.current) {
      const visible = treating || recovering;
      doctor.current.visible = visible;
      if (visible) {
        let prog: number;
        if (treating) prog = Math.min(1, ((t - 0.2) * 0.5));
        else prog = 1 - Math.min(1, (t - 0.4) * 0.3);
        if (done) prog = 0;
        const cx = THREE.MathUtils.lerp(5.0, 2.0, THREE.MathUtils.smoothstep(prog, 0, 1));
        const cz = THREE.MathUtils.lerp(1.5, -2.5, THREE.MathUtils.smoothstep(prog, 0, 1));
        doctor.current.position.set(cx, 0, cz);
        doctor.current.rotation.y = Math.atan2(2.0 - 5.0, -2.5 - 1.5) + Math.PI / 2;
      }
    }
  });

  return (
    <group name="clinical_response_team">
      <group ref={nurseA}>
        <Person position={[0, 0, 0]} color="#0ea5e9" scale={0.88} />
        <group name="iv_arm" position={[0.22, 1.1, 0]} rotation={[0, 0, 0.6]}>
          <mesh position={[0, -0.2, 0]} rotation={[0, 0, 0]}>
            <capsuleGeometry args={[0.05, 0.34, 4, 8]} />
            <meshStandardMaterial color="#e8f4f6" roughness={0.8} />
          </mesh>
          <mesh position={[0.02, -0.38, 0.05]} rotation={[0.4, 0, 0]}>
            <capsuleGeometry args={[0.035, 0.12, 4, 8]} />
            <meshStandardMaterial color="#e8f4f6" roughness={0.8} />
          </mesh>
        </group>
      </group>
      <group ref={nurseB}>
        <Person position={[0, 0, 0]} color="#38bdf8" scale={0.85} />
      </group>
      <group ref={doctor}>
        <Person position={[0, 0, 0]} color="#f0f4f4" scale={0.9} />
        <mesh position={[0, 1.05, 0]}><boxGeometry args={[0.3, 0.5, 0.04]} /><meshStandardMaterial color="#f8fafc" /></mesh>
      </group>
    </group>
  );
}

/**
 * Emergency alert lighting — the whole ICU tints red when the selected
 * patient becomes critical, then gradually returns to cool white as
 * the patient stabilizes.
 */
function AlertLighting({ acuity }: { acuity: IcuAcuity }) {
  const alarmLight = useRef<THREE.PointLight>(null);
  const glow = useRef<THREE.Mesh>(null);
  const alert = acuity === "critical" || acuity === "high";

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (alarmLight.current) {
      if (alert) {
        alarmLight.current.intensity = 4 + Math.sin(t * 9) * 2.2;
        alarmLight.current.color.set("#ff1e30");
      } else {
        alarmLight.current.intensity = 0.25;
        alarmLight.current.color.set("#e6fbff");
      }
    }
    if (glow.current) {
      const mat = glow.current.material as THREE.MeshBasicMaterial;
      mat.opacity = alert ? 0.16 + Math.sin(t * 8) * 0.08 : 0;
    }
  });

  return (
    <group name="alert_lighting">
      <pointLight ref={alarmLight} position={[1.2, 3.2, -3.2]} distance={16} decay={2} />
      {/* Red glow plane over the ICU-04 bay */}
      <mesh ref={glow} rotation={[-Math.PI / 2, 0, 0]} position={[1.2, 0.06, -3.2]}>
        <planeGeometry args={[4, 4]} />
        <meshBasicMaterial color="#ff1e30" transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}

export function IcuDemoRoom({
  stageId, acuity, vitals, active, awaitingSelection, cues, onSelectIcu04, selectedBed, patients,
}: {
  stageId: number;
  acuity: IcuAcuity;
  vitals: VitalProfile;
  active: boolean;
  awaitingSelection: boolean;
  cues: string[];
  onSelectIcu04: (bed: string) => void;
  selectedBed?: string;
  patients?: IcuPatient[];
}) {
  const selected = !awaitingSelection;
  const treatment = cues.includes("treatment") || cues.includes("ventilator") || cues.includes("transfusion");
  const risk = stageId===10?"stable": acuity==="critical"?"critical": acuity==="high"?"high": acuity==="observation"?"observation":"stable";
  const ceilingOpacity = selected ? 0.03 : 0.14;
  const roomLabel = `ICU-A  ·  12-BED CRITICAL CARE  ·  ${RISK_META[risk].label}`;
  const { floorTex } = useProceduralTextures();
  return (
    <group name="interactive_icu_demo_room" visible={active}>
      <mesh position={[0,-0.14,0]} receiveShadow>
        <boxGeometry args={[24,0.26,16.5]} />
        <meshStandardMaterial color="#d6ddd8" roughness={0.72} />
      </mesh>
      <mesh position={[0,0.015,0]} rotation={[-Math.PI/2,0,0]} receiveShadow>
        <planeGeometry args={[23.4,15.8]} />
        <meshStandardMaterial map={floorTex} roughness={0.42} metalness={0.04} />
      </mesh>
      <mesh position={[0,0.06,7.95]}><boxGeometry args={[23.4,0.12,0.04]} /><meshStandardMaterial color="#9aa8a8" /></mesh>
      <mesh position={[0,0.06,-7.95]}><boxGeometry args={[23.4,0.12,0.04]} /><meshStandardMaterial color="#9aa8a8" /></mesh>
      <mesh position={[11.65,0.06,0]}><boxGeometry args={[0.04,0.12,15.8]} /><meshStandardMaterial color="#9aa8a8" /></mesh>
      <mesh position={[-11.65,0.06,0]}><boxGeometry args={[0.04,0.12,15.8]} /><meshStandardMaterial color="#9aa8a8" /></mesh>
      <mesh position={[0,0.022,0]} rotation={[-Math.PI/2,0,0]}>
        <planeGeometry args={[2.6,15.8]} />
        <meshStandardMaterial color="#e8eeea" roughness={0.55} transparent opacity={0.55} />
      </mesh>
      <mesh position={[-1.3,0.023,0]} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[0.04,15.8]} /><meshStandardMaterial color="#facc15" transparent opacity={0.6} /></mesh>
      <mesh position={[1.3,0.023,0]} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[0.04,15.8]} /><meshStandardMaterial color="#facc15" transparent opacity={0.6} /></mesh>
      <mesh position={[0,4.85,0]}>
        <boxGeometry args={[23.8,0.08,16.2]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.9} />
      </mesh>
      {Array.from({length:7}).map((_,i)=>(
        <mesh key={`cgx-${i}`} position={[-10.5+i*3.5,4.80,0]}><boxGeometry args={[0.03,0.04,16.2]} /><meshStandardMaterial color="#cbd5e1" /></mesh>
      ))}
      {Array.from({length:6}).map((_,i)=>(
        <mesh key={`cgz-${i}`} position={[0,4.80,-7.2+i*2.88]}><boxGeometry args={[23.8,0.04,0.03]} /><meshStandardMaterial color="#cbd5e1" /></mesh>
      ))}
      {[
        [-7.5,-3.6],[ -3.5,-3.6],[ 0.5,-3.6],[ 4.5,-3.6],[ 8.5,-3.6],
        [-7.5, 0.2],[ -3.5, 0.2],[ 4.5, 0.2],[ 8.5, 0.2],
        [-7.5, 3.8],[ -3.5, 3.8],[ 0.5, 3.8],[ 4.5, 3.8],[ 8.5, 3.8],
      ].map(([x,z],i)=>(
        <group key={i} position={[x as number,4.76,z as number]}>
          <mesh><boxGeometry args={[1.15,0.04,0.58]} /><meshStandardMaterial color="#ffffff" emissive="#e0f8ff" emissiveIntensity={2.2} /></mesh>
          <mesh position={[0,-0.02,0]}><boxGeometry args={[1.08,0.01,0.52]} /><meshStandardMaterial color="#f8fafc" transparent opacity={0.92} /></mesh>
        </group>
      ))}
      {[-5.5, 0.5, 6.5].map(x=>(
        <mesh key={x} position={[x,4.79,0]}><boxGeometry args={[0.65,0.04,0.65]} /><meshStandardMaterial color="#e2e8f0" metalness={0.2} roughness={0.5} /></mesh>
      ))}
      <pointLight position={[0,4.2,0]} intensity={6} distance={22} color="#e6fbff" decay={2} />
      <mesh position={[0,4.48,0]}>
        <boxGeometry args={[23.6,0.02,16]} />
        <meshPhysicalMaterial color="#cfe8f0" transparent opacity={ceilingOpacity} transmission={0.35} roughness={0.12} />
      </mesh>
      <mesh position={[0,2.35,-8.12]} castShadow><boxGeometry args={[23.8,4.7,0.14]} /><meshStandardMaterial color="#f1f5f9" roughness={0.75} /></mesh>
      <mesh position={[-11.85,2.35,0]} castShadow><boxGeometry args={[0.14,4.7,16]} /><meshStandardMaterial color="#f1f5f9" roughness={0.75} /></mesh>
      <Suspense fallback={null}>
        <ArchitecturalDisplays />
      </Suspense>
      <mesh position={[11.85,2.35,0]}>
        <boxGeometry args={[0.08,4.7,16]} />
        <meshPhysicalMaterial color="#7fb9d1" transparent opacity={0.18} transmission={0.45} roughness={0.08} />
      </mesh>
      <mesh position={[11.9,2.35,0]} rotation={[0,Math.PI/2,0]}><planeGeometry args={[16,4.7]} /><meshStandardMaterial color="#0f172a" transparent opacity={0.04} /></mesh>
      <mesh position={[0,0.95,0]}><boxGeometry args={[0.12,1.9,15.6]} /><meshStandardMaterial color="#e2e8f0" roughness={0.6} /></mesh>
      <mesh position={[0,2.35,0]}><boxGeometry args={[0.06,1.9,15.6]} /><meshPhysicalMaterial color="#b9d0d8" transparent opacity={0.22} transmission={0.4} /></mesh>
      <group position={[0,0,0]} name="icu_nurse_station">
        <mesh position={[-0.9,0.62,0]} castShadow><boxGeometry args={[1.6,0.1,0.9]} /><meshStandardMaterial color="#475569" roughness={0.45} /></mesh>
        <mesh position={[0.85,0.62,0]} castShadow><boxGeometry args={[1.55,0.1,0.9]} /><meshStandardMaterial color="#475569" roughness={0.45} /></mesh>
        <mesh position={[0,0.62,-0.45]} castShadow><boxGeometry args={[3.2,0.1,0.45]} /><meshStandardMaterial color="#475569" roughness={0.45} /></mesh>
        <mesh position={[-0.9,0.32,0.45]}><boxGeometry args={[1.6,0.64,0.05]} /><meshStandardMaterial color="#334155" /></mesh>
        <mesh position={[0.85,0.32,0.45]}><boxGeometry args={[1.55,0.64,0.05]} /><meshStandardMaterial color="#334155" /></mesh>
        <mesh position={[0,0.32,-0.68]}><boxGeometry args={[3.2,0.64,0.05]} /><meshStandardMaterial color="#1e293b" /></mesh>
        {[-1.1, -0.2, 0.95].map(x=> (
          <group key={x} position={[x,0.92,0.05]}>
            <mesh castShadow><boxGeometry args={[0.48,0.34,0.04]} /><meshStandardMaterial color="#0f172a" /></mesh>
            <mesh position={[0,0,0.024]}><planeGeometry args={[0.42,0.27]} /><meshStandardMaterial color="#0b2a33" emissive="#0ea5e9" emissiveIntensity={0.65} /></mesh>
            <mesh position={[0,-0.22,0]}><cylinderGeometry args={[0.02,0.02,0.18,8]} /><meshStandardMaterial color="#64748b" metalness={0.9} /></mesh>
          </group>
        ))}
        <Person position={[-0.75,0,0.92]} color="#0ea5e9" scale={0.84} />
        <Person position={[0.65,0,0.92]} color="#38bdf8" scale={0.82} />
      </group>
      {(acuity==="critical" || acuity==="high") && (
        <group position={[2.35,0,-2.05]} name="crash_cart">
          <mesh castShadow position={[0,0.48,0]}><boxGeometry args={[0.62,0.82,0.42]} /><meshStandardMaterial color="#dc2626" roughness={0.55} /></mesh>
          {[
            {y:0.78, col:"#fef2f2"}, {y:0.56, col:"#fee2e2"}, {y:0.34, col:"#fecaca"}, {y:0.12, col:"#fecaca"},
          ].map((d,i)=>(
            <mesh key={i} position={[0,d.y,0.215]}><boxGeometry args={[0.58,0.14,0.02]} /><meshStandardMaterial color={d.col} /></mesh>
          ))}
          <mesh position={[0,0.92,0]}><boxGeometry args={[0.52,0.04,0.36]} /><meshStandardMaterial color="#1e293b" /></mesh>
          <mesh position={[0,1.02,0.12]}><boxGeometry args={[0.18,0.22,0.04]} /><meshStandardMaterial color="#0f172a" emissive="#ef4444" emissiveIntensity={0.8} /></mesh>
          {[-0.26,0.26].map(x=> <mesh key={x} position={[x,0.06,0.18]} rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[0.06,0.06,0.04,12]} /><meshStandardMaterial color="#0f172a" /></mesh>)}
          <mesh position={[0,0.06,-0.18]} rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[0.06,0.06,0.04,12]} /><meshStandardMaterial color="#0f172a" /></mesh>
        </group>
      )}
      <group position={[-3.8,0,0.15]}>
        <mesh castShadow position={[0,0.52,0]}><boxGeometry args={[0.58,0.72,0.38]} /><meshStandardMaterial color="#e2e8f0" /></mesh>
        <mesh position={[0,0.88,0]}><boxGeometry args={[0.6,0.02,0.4]} /><meshStandardMaterial color="#94a3b8" /></mesh>
      </group>
      {BEDS.map((bed,i)=>{
        const patient = (patients ?? ICU_PATIENTS).find(p=>p.bed===bed.id);
        const isSelectedBed = (selectedBed ?? "ICU-04") === bed.id;
        const isDischargeReady = isSelectedBed && stageId===10;
        // every bed occupied except the discharged selected bed; baseline acuity from roster
        const baseline = (patient?.baselineAcuity ?? "stable") as IcuAcuity;
        const bedAcuity: IcuAcuity = isSelectedBed ? acuity : isDischargeReady ? "ready" : baseline;
        const isEmpty = isDischargeReady;
        return (
          <IcuBed
            key={bed.id}
            id={bed.id}
            position={bed.position}
            acuity={bedAcuity}
            selected={isSelectedBed && selected}
            empty={isEmpty}
            hr={isSelectedBed? vitals.hr : 71 + (i*4)%16}
            spo2={isSelectedBed? vitals.spo2 : 97 + (i%2)}
            treatmentActive={isSelectedBed && treatment}
            patient={patient}
            onSelect={() => onSelectIcu04(bed.id)}
          />
        );
      })}
      <RoutineRounds active={true} urgency={acuity==="critical" || cues.includes("nurse_react")} />
      {/* Emergency response: red alert lighting + nurses/doctor rushing to ICU-04 */}
      <AlertLighting acuity={acuity} />
      <ClinicalResponse stageId={stageId} acuity={acuity} />
      <AiPatientVirtualTwin acuity={acuity} position={selected ? ICU04_POSITION : [7, 0, -3.7]} hr={Math.round(vitals.hr)} spo2={Math.round(vitals.spo2)} />
      <group position={[0,2.65,-8.0]}>
        <mesh><boxGeometry args={[8.2,1.35,0.1]} /><meshPhysicalMaterial color="#0b1e28" metalness={0.45} roughness={0.2} /></mesh>
        <mesh position={[0,0,0.06]}><planeGeometry args={[7.8,1.05]} /><meshStandardMaterial color="#071a24" emissive="#0e7490" emissiveIntensity={0.35} /></mesh>
        <Html position={[0,0,0.08]} center transform distanceFactor={9}>
          <div className="pointer-events-none grid w-64 grid-cols-4 gap-1.5 font-mono text-[7px] leading-none text-cyan-100">
            {[
              ["ICU OCCUPANCY","11/12","#facc15"],
              ["VENTILATORS","8 ACTIVE","#38bdf8"],
              ["NURSE RATIO","1:2","#a5f3fc"],
              ["O₂ PRESS","4.2 bar","#22d3ee"],
              ["ALERT","—","#94a3b8"],
              ["CODE","STANDBY","#f87171"],
              ["HAND HYGIENE","94%","#4ade80"],
              ["SYNC","18 ms","#22d3ee"],
            ].map(([k,v,c])=>(
              <div key={k} className="border border-white/10 bg-black/35 px-1.5 py-1">
                <div className="text-[6px] tracking-wide text-white/55">{k}</div>
                <div className="mt-0.5 font-bold" style={{color:c as string}}>{v}</div>
              </div>
            ))}
          </div>
        </Html>
      </group>
      <Html position={[0,5.35,0]} center distanceFactor={18} zIndexRange={[10,0]}>
        <div className="pointer-events-none border border-cyan-300/30 bg-[#06111cf0] px-4 py-1.5 font-mono text-[9px] tracking-[0.22em] text-cyan-100 shadow-xl">{roomLabel}</div>
      </Html>
      {(acuity === "critical" || acuity === "high") && (
        <Html position={[0, 3.4, 0]} center distanceFactor={20} zIndexRange={[12, 0]}>
          <div className="pointer-events-none animate-pulse border border-rose-400/60 bg-rose-600/25 px-4 py-1.5 font-mono text-[11px] font-black tracking-[0.3em] text-rose-100 shadow-[0_0_22px_rgba(244,63,94,0.6)]">
            🚨 ALARM MODE · RAPID RESPONSE
          </div>
        </Html>
      )}
      {awaitingSelection && (
        <Html position={[ICU04_POSITION[0],3.85,ICU04_POSITION[2]]} center distanceFactor={15} zIndexRange={[18,0]}>
          <div className="pointer-events-none animate-pulse rounded-sm border-2 border-cyan-400 bg-cyan-500/15 px-4 py-2 text-center font-mono text-[10px] font-bold tracking-[0.16em] text-white shadow-[0_0_22px_rgba(34,211,238,0.45)] backdrop-blur">▸ CLICK BED ICU-04 TO BEGIN</div>
        </Html>
      )}
    </group>
  );
}
