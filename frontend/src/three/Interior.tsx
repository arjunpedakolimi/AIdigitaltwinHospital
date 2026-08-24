import { Html } from "@react-three/drei";
import * as THREE from "three";
import { Department, InteriorZone } from "../data/hospital";

function Bed({ intensive = false }: { intensive?: boolean }) {
  return (
    <group name="clinical_bed">
      <mesh position={[0, 0.48, 0]} castShadow><boxGeometry args={[1.85, 0.18, 0.78]} /><meshPhysicalMaterial color="#e8edef" roughness={0.38} clearcoat={0.25} /></mesh>
      <mesh position={[0, 0.62, -0.12]} castShadow><boxGeometry args={[1.55, 0.16, 0.68]} /><meshStandardMaterial color="#b8d7dd" roughness={0.74} /></mesh>
      <mesh position={[-0.72, 0.82, -0.12]} rotation={[0, 0, -0.28]}><boxGeometry args={[0.38, 0.15, 0.66]} /><meshStandardMaterial color="#f1f5f5" roughness={0.8} /></mesh>
      {[-0.72, 0.72].flatMap((x) => [-0.3, 0.3].map((z) => (
        <mesh key={`${x}-${z}`} position={[x, 0.18, z]}><cylinderGeometry args={[0.08, 0.08, 0.12, 10]} /><meshStandardMaterial color="#26323b" metalness={0.45} /></mesh>
      )))}
      {intensive && (
        <>
          <mesh position={[0.65, 1.25, -0.65]} castShadow><boxGeometry args={[0.62, 0.45, 0.12]} /><meshStandardMaterial color="#152a36" emissive="#22c9ff" emissiveIntensity={0.8} /></mesh>
          <mesh position={[0.65, 0.8, -0.65]}><cylinderGeometry args={[0.035, 0.035, 0.65, 8]} /><meshStandardMaterial color="#75838b" metalness={0.85} /></mesh>
          <mesh position={[-0.8, 0.75, -0.68]} castShadow><boxGeometry args={[0.38, 0.8, 0.4]} /><meshPhysicalMaterial color="#d7e0e2" roughness={0.42} /></mesh>
        </>
      )}
    </group>
  );
}

function ClinicalEquipment({ deptId }: { deptId: string }) {
  if (deptId === "radiology") {
    return (
      <group>
        <mesh position={[0, 1.05, -0.15]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.85, 0.35, 24, 48]} /><meshPhysicalMaterial color="#e4e9ea" roughness={0.25} clearcoat={0.45} /></mesh>
        <mesh position={[0, 0.55, 0.25]}><boxGeometry args={[2.4, 0.18, 0.6]} /><meshPhysicalMaterial color="#d9e2e4" roughness={0.3} /></mesh>
        <mesh position={[1.2, 1.25, -0.8]}><boxGeometry args={[0.8, 0.55, 0.12]} /><meshStandardMaterial color="#102838" emissive="#249fff" emissiveIntensity={0.9} /></mesh>
      </group>
    );
  }
  if (deptId === "ot") {
    return (
      <group>
        <mesh position={[0, 0.75, 0]} castShadow><boxGeometry args={[2.2, 0.16, 0.62]} /><meshPhysicalMaterial color="#cadbdd" roughness={0.28} metalness={0.2} /></mesh>
        <mesh position={[0, 1.85, 0]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.7, 0.7, 0.12, 32]} /><meshStandardMaterial color="#f5f7f6" emissive="#e2fbff" emissiveIntensity={1.4} /></mesh>
        <mesh position={[0, 2.45, 0]}><cylinderGeometry args={[0.05, 0.05, 1.1, 12]} /><meshStandardMaterial color="#849298" metalness={0.85} /></mesh>
        <mesh position={[1.35, 1.15, -0.6]}><boxGeometry args={[0.72, 0.52, 0.12]} /><meshStandardMaterial color="#122c3b" emissive="#1cd8c1" emissiveIntensity={0.8} /></mesh>
      </group>
    );
  }
  return <Bed intensive />;
}

function LabBench() {
  return (
    <group>
      <mesh position={[0, 0.65, 0]} castShadow><boxGeometry args={[2.6, 0.12, 0.85]} /><meshPhysicalMaterial color="#d8e0df" roughness={0.28} metalness={0.2} /></mesh>
      {[-0.95, 0, 0.95].map((x) => <mesh key={x} position={[x, 0.34, 0]}><boxGeometry args={[0.1, 0.62, 0.7]} /><meshStandardMaterial color="#69767c" metalness={0.65} roughness={0.35} /></mesh>)}
      <mesh position={[-0.75, 1.05, 0]}><boxGeometry args={[0.75, 0.72, 0.62]} /><meshPhysicalMaterial color="#eff3f2" roughness={0.3} /></mesh>
      <mesh position={[-0.75, 1.18, 0.32]}><boxGeometry args={[0.4, 0.22, 0.03]} /><meshStandardMaterial color="#122d3d" emissive="#25bfff" emissiveIntensity={1} /></mesh>
      {[0.25, 0.55, 0.85].map((x) => <mesh key={x} position={[x, 0.83, 0]}><cylinderGeometry args={[0.07, 0.05, 0.38, 12]} /><meshPhysicalMaterial color="#79d7e7" transmission={0.25} roughness={0.1} /></mesh>)}
    </group>
  );
}

function OfficeFurniture({ ai = false }: { ai?: boolean }) {
  return (
    <group>
      <mesh position={[0, 0.72, 0]} castShadow><boxGeometry args={[2.4, 0.1, 0.82]} /><meshPhysicalMaterial color="#56636b" roughness={0.35} metalness={0.3} /></mesh>
      {[-0.9, 0.9].map((x) => <mesh key={x} position={[x, 0.38, 0]}><boxGeometry args={[0.08, 0.7, 0.65]} /><meshStandardMaterial color="#3d474e" metalness={0.65} roughness={0.3} /></mesh>)}
      {[-0.62, 0, 0.62].map((x) => (
        <mesh key={x} position={[x, 1.23, -0.12]}><boxGeometry args={[0.5, 0.52, 0.06]} /><meshStandardMaterial color="#102432" emissive={ai ? "#1dbbff" : "#55758a"} emissiveIntensity={ai ? 1.5 : 0.35} /></mesh>
      ))}
      <mesh position={[0, 0.5, 0.92]}><boxGeometry args={[0.58, 0.65, 0.58]} /><meshStandardMaterial color="#25323b" roughness={0.55} /></mesh>
    </group>
  );
}

function StorageFixtures() {
  return (
    <group>
      {[-1.05, 0, 1.05].map((x) => (
        <group key={x} position={[x, 0, 0]}>
          {[0.3, 0.8, 1.3, 1.8].map((y) => <mesh key={y} position={[0, y, 0]}><boxGeometry args={[0.82, 0.06, 1.1]} /><meshStandardMaterial color="#859199" metalness={0.72} roughness={0.3} /></mesh>)}
          {[-0.38, 0.38].map((side) => <mesh key={side} position={[side, 1.05, 0]}><boxGeometry args={[0.06, 2.1, 1.1]} /><meshStandardMaterial color="#64727a" metalness={0.72} roughness={0.32} /></mesh>)}
        </group>
      ))}
    </group>
  );
}

function UtilityEquipment({ deptId }: { deptId: string }) {
  return (
    <group>
      {[-0.95, 0.95].map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <mesh position={[0, 0.9, 0]} castShadow><cylinderGeometry args={[0.5, 0.5, 1.8, 24]} /><meshPhysicalMaterial color={deptId === "power" ? "#67737a" : "#d6e0e2"} metalness={0.55} roughness={0.35} /></mesh>
          <mesh position={[0, 1.82, 0]}><sphereGeometry args={[0.49, 20, 10]} /><meshStandardMaterial color={deptId === "power" ? "#67737a" : "#d6e0e2"} metalness={0.55} roughness={0.35} /></mesh>
          <mesh position={[0, 1.05, 0.5]}><boxGeometry args={[0.34, 0.42, 0.08]} /><meshStandardMaterial color="#102b38" emissive="#27d8a3" emissiveIntensity={0.8} /></mesh>
        </group>
      ))}
    </group>
  );
}

function RoomAsset({ room, deptId }: { room: InteriorZone; deptId: string }) {
  switch (room.type) {
    case "beds": return <group><Bed intensive={deptId.includes("icu") || deptId === "emergency"} /><group position={[0, 0, 1.2]}><Bed intensive={deptId.includes("icu")} /></group></group>;
    case "clinical": return <ClinicalEquipment deptId={deptId} />;
    case "lab": return <LabBench />;
    case "office": return <OfficeFurniture />;
    case "storage": return <StorageFixtures />;
    case "ai": return <OfficeFurniture ai />;
    case "utility": return <UtilityEquipment deptId={deptId} />;
    default: return <OfficeFurniture />;
  }
}

export function DepartmentInterior({ dept, selectedRoom, onSelectRoom }: { dept: Department; selectedRoom: string | null; onSelectRoom: (room: string) => void }) {
  const rooms = dept.interior ?? [];
  const columns = rooms.length > 4 ? 3 : 2;
  const rows = Math.max(1, Math.ceil(rooms.length / columns));
  const roomW = 5.4;
  const roomD = 4.6;
  const fullW = columns * roomW;
  const fullD = rows * roomD;
  return (
    <group name={`interior_${dept.id}`} position={[0, 0, 0]} userData={{ departmentId: dept.id, view: "interior" }}>
      <mesh position={[0, -0.12, 0]} receiveShadow>
        <boxGeometry args={[fullW + 1, 0.22, fullD + 1]} />
        <meshPhysicalMaterial color="#d9dfde" roughness={0.42} clearcoat={0.14} />
      </mesh>
      <mesh position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[fullW, fullD]} />
        <meshStandardMaterial color="#a9b9b7" roughness={0.66} />
      </mesh>

      {rooms.map((room, index) => {
        const col = index % columns;
        const row = Math.floor(index / columns);
        const x = -fullW / 2 + roomW / 2 + col * roomW;
        const z = -fullD / 2 + roomD / 2 + row * roomD;
        const active = selectedRoom === room.name;
        return (
          <group
            key={room.name}
            name={`room_${room.name.toLowerCase().replace(/[^a-z0-9]+/g, "_")}`}
            position={[x, 0, z]}
            userData={{ room: room.name, type: room.type }}
            onClick={(event) => { event.stopPropagation(); onSelectRoom(room.name); }}
            onPointerOver={() => { document.body.style.cursor = "pointer"; }}
            onPointerOut={() => { document.body.style.cursor = "auto"; }}
          >
            <mesh position={[0, 0.025, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[roomW - 0.15, roomD - 0.15]} />
              <meshStandardMaterial color={active ? dept.color : index % 2 ? "#c7d1d0" : "#d5dcda"} emissive={active ? dept.color : "#000000"} emissiveIntensity={active ? 0.18 : 0} roughness={0.68} />
            </mesh>
            <mesh position={[0, 1.45, -roomD / 2]} castShadow><boxGeometry args={[roomW, 2.9, 0.1]} /><meshPhysicalMaterial color="#ecf1f0" roughness={0.48} /></mesh>
            <mesh position={[-roomW / 2, 1.45, 0]} castShadow><boxGeometry args={[0.1, 2.9, roomD]} /><meshPhysicalMaterial color="#ecf1f0" roughness={0.48} /></mesh>
            <group position={[0, 0, 0.2]}><RoomAsset room={room} deptId={dept.id} /></group>
            <mesh position={[0, 2.65, -roomD / 2 + 0.08]}>
              <boxGeometry args={[2.5, 0.12, 0.04]} />
              <meshStandardMaterial color={dept.color} emissive={dept.color} emissiveIntensity={1.5} />
            </mesh>
            <Html position={[0, 2.25, -roomD / 2 + 0.14]} center transform distanceFactor={6}>
              <div className="pointer-events-none whitespace-nowrap border border-cyan-300/30 bg-slate-950/90 px-2 py-1 text-[8px] font-semibold tracking-wide text-cyan-50">
                {room.name}
              </div>
            </Html>
          </group>
        );
      })}

      {/* Perimeter glazing and luminous ceiling rails complete the cutaway. */}
      <mesh position={[fullW / 2, 1.5, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[fullD, 3]} />
        <meshPhysicalMaterial color="#7fc4dc" transparent opacity={0.25} transmission={0.42} roughness={0.08} side={THREE.DoubleSide} />
      </mesh>
      {Array.from({ length: columns }).map((_, i) => (
        <mesh key={i} position={[-fullW / 2 + roomW / 2 + i * roomW, 2.9, 0]}>
          <boxGeometry args={[roomW * 0.72, 0.06, 0.12]} />
          <meshStandardMaterial color="#ffffff" emissive="#d7f7ff" emissiveIntensity={1.8} />
        </mesh>
      ))}
    </group>
  );
}