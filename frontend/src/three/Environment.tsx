import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { departments } from "../data/hospital";

// ---------- Ground ----------
export function Ground() {
  // simple canvas textures for more PBR realism without external assets
  const asphaltTexture = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 256; c.height = 256;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#1e2a33";
    ctx.fillRect(0,0,256,256);
    for(let i=0;i<900;i++){
      const x=Math.random()*256, y=Math.random()*256;
      const v = 20+Math.random()*18;
      ctx.fillStyle=`rgba(${v},${v+2},${v+6},0.22)`;
      ctx.fillRect(x,y,1.4,1.4);
    }
    // fine grain
    for(let i=0;i<1800;i++){
      ctx.fillStyle=`rgba(255,255,255,${Math.random()*0.04})`;
      ctx.fillRect(Math.random()*256, Math.random()*256, 0.8,0.8);
    }
    const t = new THREE.CanvasTexture(c);
    t.wrapS=t.wrapT=THREE.RepeatWrapping;
    t.repeat.set(6,6);
    t.colorSpace=THREE.SRGBColorSpace;
    return t;
  },[]);
  const brickTexture = useMemo(()=>{
    const c=document.createElement("canvas");
    c.width=256; c.height=256;
    const ctx=c.getContext("2d")!;
    ctx.fillStyle="#b89a7b";
    ctx.fillRect(0,0,256,256);
    ctx.strokeStyle="#9d8468";
    ctx.lineWidth=2;
    const bh=32, bw=64;
    for(let y=0;y<256;y+=bh){
      for(let x=0;x<256;x+=bw){
        const off = (y/bh)%2===0?0:bw/2;
        ctx.strokeRect(x+off, y, bw-2, bh-2);
        // random brick variation
        if(Math.random()>0.7){
          ctx.fillStyle=`rgba(0,0,0,0.06)`;
          ctx.fillRect(x+off+2,y+2,bw-6,bh-6);
        }
      }
    }
    const t=new THREE.CanvasTexture(c);
    t.wrapS=t.wrapT=THREE.RepeatWrapping;
    t.repeat.set(8,8);
    t.colorSpace=THREE.SRGBColorSpace;
    return t;
  },[]);

  return (
    <group name="campus_landscape">
      {/* distant surroundings - forested outer ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.14, 0]} receiveShadow>
        <planeGeometry args={[260, 240]} />
        <meshStandardMaterial color="#101a14" roughness={1} />
      </mesh>
      {/* main grass campus */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.06, 0]} receiveShadow>
        <planeGeometry args={[200, 190]} />
        <meshStandardMaterial color="#355a44" roughness={0.98} metalness={0.02} />
      </mesh>
      {/* subtle grass variation patches */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.04, 0]} receiveShadow>
        <planeGeometry args={[150, 130]} />
        <meshStandardMaterial color="#3c6b4d" roughness={1} transparent opacity={0.35} />
      </mesh>

      {/* Two landscaped pedestrian strips flank the entrance road. The former
          full-width plaza crossed the road and merged into the parking slabs. */}
      {[-9.5, 9.5].map((x) => (
        <mesh key={x} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.02, 47.5]} receiveShadow>
          <planeGeometry args={[6, 13]} />
          <meshStandardMaterial map={brickTexture} roughness={0.78} metalness={0.03} />
        </mesh>
      ))}

      {/* healing garden — west lawn, outside the perimeter avenue */}
      <group name="healing_garden" position={[-63, 0, 20]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <circleGeometry args={[8.2, 64]} />
          <meshStandardMaterial color="#4a724f" roughness={0.95} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
          <ringGeometry args={[4.9, 5.9, 64]} />
          <meshStandardMaterial color="#c2b69a" roughness={0.8} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.07, 0]}>
          <circleGeometry args={[3.8, 64]} />
          <meshPhysicalMaterial color="#2d7f8d" roughness={0.14} metalness={0.08} transmission={0.08} />
        </mesh>
        {/* benches around pond */}
        {Array.from({ length: 10 }).map((_, i) => {
          const a = (i / 10) * Math.PI * 2;
          return (
            <group key={i} position={[Math.cos(a) * 6.9, 0.12, Math.sin(a) * 6.9]} rotation={[0,a,0]}>
              <mesh castShadow position={[0,0.28,0]}>
                <boxGeometry args={[1.5, 0.08, 0.42]} />
                <meshStandardMaterial color="#5a4632" roughness={0.78} />
              </mesh>
              <mesh position={[0,0.14,0]}>
                <boxGeometry args={[1.45, 0.14, 0.38]} />
                <meshStandardMaterial color="#3d2f1f" roughness={0.9} />
              </mesh>
            </group>
          );
        })}
        {/* low hedges */}
        {Array.from({ length: 8 }).map((_, i) => {
          const a = (i / 8) * Math.PI * 2 + 0.2;
          return (
            <mesh key={`hedge-${i}`} position={[Math.cos(a) * 7.6, 0.28, Math.sin(a) * 7.6]} castShadow>
              <boxGeometry args={[1.8, 0.55, 0.65]} />
              <meshStandardMaterial color={i%2? "#3e6b3a":"#5a7a4a"} roughness={1} />
            </mesh>
          );
        })}
      </group>

      {/* secondary pocket garden — east lawn, outside the perimeter avenue */}
      <group name="pocket_garden_east" position={[63, 0, 20]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0,0.015,0]}>
          <planeGeometry args={[10,7]} />
          <meshStandardMaterial color="#3f6b4a" roughness={1} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0,0.022,0]}>
          <planeGeometry args={[6,3]} />
          <meshStandardMaterial color="#c8bfa0" roughness={0.9} />
        </mesh>
      </group>

      {/* service yard hardstand at oxygen and power plants */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-43, 0.015, -20]} receiveShadow>
        <planeGeometry args={[10,11]} />
        <meshStandardMaterial color="#9aa3a8" roughness={0.92} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[43, 0.015, -34]} receiveShadow>
        <planeGeometry args={[11,11]} />
        <meshStandardMaterial color="#9aa3a8" roughness={0.92} />
      </mesh>

      {/* exposed asphalt texture holder for roads to reuse */}
      <mesh visible={false}>
        <planeGeometry args={[1,1]} />
        <meshStandardMaterial map={asphaltTexture} />
      </mesh>
    </group>
  );
}

// helper road piece
function Road({ size, position, rotation = 0, color="#1c252f" }: { size: [number, number]; position: [number, number, number]; rotation?: number; color?:string }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, rotation]} position={position} receiveShadow>
      <planeGeometry args={size} />
      <meshStandardMaterial color={color} roughness={0.92} metalness={0.06} />
    </mesh>
  );
}
function Sidewalk({ size, position, rotation=0 }: {size:[number,number]; position:[number,number,number]; rotation?:number}){
  return (
    <mesh rotation={[-Math.PI / 2, 0, rotation]} position={position} receiveShadow>
      <planeGeometry args={size} />
      <meshStandardMaterial color="#c9cfd2" roughness={0.82} metalness={0.02} />
    </mesh>
  );
}
function Curb({ size, position, rotation=0 }: {size:[number,number]; position:[number,number,number]; rotation?:number}){
  return (
    <mesh position={position} rotation={[0,rotation,0]} castShadow receiveShadow>
      <boxGeometry args={[size[0], 0.14, size[1]]} />
      <meshStandardMaterial color="#aeb4b8" roughness={0.85} />
    </mesh>
  );
}

export function Roads() {
  // we filter departments that need driveways (exclude parking lots and helipad)
  const driveways = departments.filter(d=> d.kind !== "parking" && d.kind !== "helipad" && d.id !== "security").map(dept=>{
    const w = dept.size[0];
    const dpth = dept.size[2];
    const [x, , z] = dept.position;
    const entranceZ = z + dpth/2;
    const dw = Math.min(Math.max(w*0.42, 3.2), 5.2);
    // find nearest horizontal arterial to connect realistically
    const arterialZs = [36, 31, 12, -10, -28, -44];
    let nearest = arterialZs[0];
    let bestDist = Math.abs(entranceZ - nearest);
    for(const rz of arterialZs){
      const dist = Math.abs(entranceZ - rz);
      if(dist < bestDist){ bestDist = dist; nearest = rz; }
    }
    const rawDelta = nearest - entranceZ;
    const sign = Math.sign(rawDelta) || 1;
    // length from forecourt edge to road edge (road half width ~4)
    let len = Math.abs(rawDelta) - 0.95 - 4.0;
    // clamp for aesthetics - short connections for close buildings, longer for isolated
    len = Math.max(1.4, Math.min(len, 7));
    // for far isolated labs/oxygen keep a bit longer but still realistic
    if((dept.id==="lab"||dept.id==="oxygen"||dept.id==="power"||dept.id==="blood"||dept.id==="admin"||dept.id==="storage") && len < 3) len = 3;
    const drivewayCenterZ = entranceZ + sign * (0.78 + len/2);
    const forecourtZ = entranceZ + sign * 0.55;
    return { id: dept.id, x, z: drivewayCenterZ, size:[dw, len] as [number,number], forecourtZ, forecourtW: Math.min(w*0.78, 6.5), color: dept.color };
  });

  return (
    <group name="internal_roads" position={[0, 0.025, 0]}>
      {/* === MAIN ASPHALT CARRIAGEWAYS (clean rectangular grid) === */}
      {/* Vertical avenues (central axis is a pedestrian mall, so no car road at x=0) */}
      <Road size={[8, 92]} position={[-31, 0, -3]} />  {/* west avenue */}
      <Road size={[8, 92]} position={[31, 0, -3]} />   {/* east avenue */}
      <Road size={[7, 96]} position={[-52, 0, -2]} />  {/* west perimeter */}
      <Road size={[7, 96]} position={[52, 0, -2]} />   {/* east perimeter */}

      {/* Horizontal cross-streets between building rows */}
      <Road size={[118, 8]} position={[0, 0, 36]} />   {/* south ring - gate + parking frontage */}
      <Road size={[118, 7.5]} position={[0, 0, 12]} /> {/* row 0 / row 1 divider */}
      <Road size={[118, 7.5]} position={[0, 0, -10]} />{/* row 1 / row 2 divider */}
      <Road size={[118, 7]} position={[0, 0, -28]} />  {/* row 2 / row 3 divider */}
      <Road size={[118, 7]} position={[0, 0, -44]} />  {/* north perimeter */}

      {/* Main entrance approach - runs from outside the campus, through the
          security gate (z=52), past the parking feeder, and into the south ring. */}
      <Road size={[12, 32]} position={[0, 0, 48]} />
      {/* Parking feeder road - east/west link serving both parking lots */}
      <Road size={[76, 6]} position={[0, 0, 41]} />
      {/* Short, marked parking entries connect feeder road to each lot. */}
      <Road size={[5, 2.5]} position={[-20, 0, 44.2]} color="#252f3a" />
      <Road size={[5, 2.5]} position={[20, 0, 44.2]} color="#252f3a" />
      {[-20, 20].map((x) => (
        <group key={`parking-entry-${x}`}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[x - 2.15, 0.0315, 44.2]}>
            <planeGeometry args={[0.1, 2.4]} />
            <meshStandardMaterial color="#f8fafc" />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[x + 2.15, 0.0315, 44.2]}>
            <planeGeometry args={[0.1, 2.4]} />
            <meshStandardMaterial color="#f8fafc" />
          </mesh>
        </group>
      ))}
      {/* Central pedestrian mall spine (brick, not a car road) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, -4]} receiveShadow>
        <planeGeometry args={[9, 78]} />
        <meshStandardMaterial color="#b9a98c" roughness={0.9} />
      </mesh>
      {/* Reception drop-off loop (in front of reception, off south ring) */}
      <Road size={[13, 6]} position={[0, 0, 31]} color="#252f3a" />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.026, 31]}>
        <ringGeometry args={[3.6, 4.6, 32]} />
        <meshStandardMaterial color="#c9cfd2" roughness={0.8} />
      </mesh>
      {/* Emergency ambulance bay - red-tinted apron in front of Emergency, off south ring */}
      <Road size={[11, 8]} position={[-18, 0, 31]} color="#2a1b1f" />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-18, 0.027, 31]}>
        <planeGeometry args={[9.5, 6.5]} />
        <meshStandardMaterial color="#7a2f38" roughness={0.9} transparent opacity={0.22} />
      </mesh>

      {/* === SIDEWALKS flanking the avenues and cross-streets === */}
      {[-31, 31].map((x) => (
        <group key={`av-${x}`}>
          <Sidewalk size={[1.3, 92]} position={[x - 4.6, 0.031, -3]} />
          <Sidewalk size={[1.3, 92]} position={[x + 4.6, 0.031, -3]} />
        </group>
      ))}
      {[36, 12, -10, -28, -44].map((z, i) => (
        <group key={`cs-${z}`}>
          <Sidewalk size={[118, 1.2]} position={[0, 0.031, z + (i === 0 ? 4.6 : 4.4)]} />
          <Sidewalk size={[118, 1.2]} position={[0, 0.031, z - (i === 0 ? 4.6 : 4.4)]} />
        </group>
      ))}
      {/* Central mall walkway edges */}
      <Sidewalk size={[1.4, 78]} position={[-5.0, 0.031, -4]} />
      <Sidewalk size={[1.4, 78]} position={[5.0, 0.031, -4]} />

      {/* Curbs - raised edges on avenues */}
      <Curb size={[0.18, 92]} position={[-35.5, 0.075, -3]} />
      <Curb size={[0.18, 92]} position={[-26.5, 0.075, -3]} />
      <Curb size={[0.18, 92]} position={[35.5, 0.075, -3]} />
      <Curb size={[0.18, 92]} position={[26.5, 0.075, -3]} />

      {/* === BUILDING FORECOURTS (buff concrete pads in front of each entrance) === */}
      {driveways.map(d=> {
        return (
          <group key={`forecourt-${d.id}`}>
            {/* forecourt plaza */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[d.x, 0.031, d.forecourtZ]} receiveShadow>
              <planeGeometry args={[d.forecourtW, 1.55]} />
              <meshStandardMaterial color="#d6dcd8" roughness={0.72} metalness={0.04} />
            </mesh>
            {/* driveway asphalt spur to road */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[d.x, 0.028, d.z]} receiveShadow>
              <planeGeometry args={d.size} />
              <meshStandardMaterial color="#242e38" roughness={0.92} />
            </mesh>
            {/* driveway edge curbs */}
            <mesh position={[d.x - d.size[0]/2 - 0.06, 0.075, d.z]} rotation={[0,0,0]}>
              <boxGeometry args={[0.12, 0.12, d.size[1]]} />
              <meshStandardMaterial color="#b0b6b9" />
            </mesh>
            <mesh position={[d.x + d.size[0]/2 + 0.06, 0.075, d.z]} rotation={[0,0,0]}>
              <boxGeometry args={[0.12, 0.12, d.size[1]]} />
              <meshStandardMaterial color="#b0b6b9" />
            </mesh>
            {/* bollards at forecourt edge */}
            {[-1, 1].map(s=>(
              <mesh key={s} position={[d.x + s* (d.forecourtW/2 -0.35), 0.32, d.forecourtZ +0.35]} castShadow>
                <cylinderGeometry args={[0.08,0.08,0.64,10]} />
                <meshStandardMaterial color="#2a333b" metalness={0.55} roughness={0.42} />
              </mesh>
            ))}
            {/* tactile paving strip */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[d.x, 0.032, d.forecourtZ+0.52]}>
              <planeGeometry args={[d.forecourtW*0.62, 0.32]} />
              <meshStandardMaterial color="#c9a86a" roughness={0.88} />
            </mesh>
          </group>
        );
      })}

      {/* === ROAD MARKINGS === */}
      {/* Avenue dashed centre lines (x = ±31) */}
      {[-31, 31].map((x) => (
        <group key={`av-dash-${x}`}>
          {Array.from({ length: 20 }).map((_, i) => (
            <mesh key={i} rotation={[-Math.PI / 2, 0, Math.PI / 2]} position={[x, 0.031, -46 + i * 4.6]}>
              <planeGeometry args={[1.5, 0.13]} />
              <meshStandardMaterial color="#e7c84a" emissive="#5a4e1b" emissiveIntensity={0.2} />
            </mesh>
          ))}
        </group>
      ))}
      {/* Cross-street dashed centre lines */}
      {[36, 12, -10, -28, -44].map((z) => (
        <group key={`cs-dash-${z}`}>
          {Array.from({ length: 26 }).map((_, i) => (
            <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[-58 + i * 4.5, 0.031, z]}>
              <planeGeometry args={[1.7, 0.12]} />
              <meshStandardMaterial color="#e7c84a" emissive="#5a4e1b" emissiveIntensity={0.2} />
            </mesh>
          ))}
        </group>
      ))}
      {/* Solid white edge lines on cross-streets */}
      {[{z:36,off:3.8},{z:12,off:3.55},{z:-10,off:3.55},{z:-28,off:3.3},{z:-44,off:3.3}].map((r) => (
        <group key={`edge-${r.z}`}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.0315, r.z + r.off]}><planeGeometry args={[116, 0.14]} /><meshStandardMaterial color="#e9ecef" /></mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.0315, r.z - r.off]}><planeGeometry args={[116, 0.14]} /><meshStandardMaterial color="#e9ecef" /></mesh>
        </group>
      ))}
      {/* Solid white edge lines on avenues */}
      {[-31, 31, -52, 52].map((x) => (
        <group key={`vedge-${x}`}>
          <mesh rotation={[-Math.PI / 2, 0, Math.PI / 2]} position={[x + 3.7, 0.0315, -3]}><planeGeometry args={[92, 0.13]} /><meshStandardMaterial color="#e9ecef" /></mesh>
          <mesh rotation={[-Math.PI / 2, 0, Math.PI / 2]} position={[x - 3.7, 0.0315, -3]}><planeGeometry args={[92, 0.13]} /><meshStandardMaterial color="#e9ecef" /></mesh>
        </group>
      ))}

      {/* Zebra crossings at avenue × cross-street intersections */}
      {[
        [-31, 36], [31, 36], [-31, 12], [31, 12], [-31, -10], [31, -10], [-31, -28], [31, -28],
        [0, 36], [0, 42],
      ].map(([x, z], idx) => (
        <group key={`zebra-${idx}`} position={[x, 0.033, z]}>
          {Array.from({ length: 7 }).map((_, i) => (
            <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[-2.1 + i * 0.7, 0, 0]}>
              <planeGeometry args={[0.32, 3.2]} />
              <meshStandardMaterial color="#f1f3f2" roughness={0.8} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Entrance lane divider — IN (west) / OUT (east) through the gate */}
      {Array.from({ length: 7 }).map((_, i) => (
        <mesh key={`ent-div-${i}`} rotation={[-Math.PI / 2, 0, Math.PI / 2]} position={[0, 0.031, 34 + i * 4.4]}>
          <planeGeometry args={[2, 0.14]} />
          <meshStandardMaterial color="#e7c84a" emissive="#5a4e1b" emissiveIntensity={0.25} />
        </mesh>
      ))}
      {/* Stop line just before the boom barriers */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-4.5, 0.032, 56]}>
        <planeGeometry args={[5, 0.3]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      {/* Stop lines approaching the south ring */}
      {[[-31, 32.4], [31, 32.4], [0, 38.4]].map(([x, z], i) => (
        <mesh key={`stop-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.032, z]}>
          <planeGeometry args={[3.6, 0.28]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      ))}

      {/* Ambulance bay hatching in front of Emergency (x=-18, z=31) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-18, 0.0335, 28.5]}>
        <planeGeometry args={[9, 0.5]} />
        <meshStandardMaterial color="#c0392b" />
      </mesh>
      {Array.from({ length: 5 }).map((_, i) => (
        <mesh key={`hatch-${i}`} rotation={[-Math.PI / 2, 0, Math.PI / 5]} position={[-21 + i * 1.5, 0.0325, 31]}>
          <planeGeometry args={[0.14, 5.5]} />
          <meshStandardMaterial color="#ffffff" transparent opacity={0.55} />
        </mesh>
      ))}

      {/* Traffic signs near the gate */}
      {[
        { pos: [4.5, 0, 40] as [number, number, number], type: "stop" },
        { pos: [-4.5, 0, 40] as [number, number, number], type: "speed30" },
        { pos: [-27, 0, 33] as [number, number, number], type: "h" },
        { pos: [27, 0, 33] as [number, number, number], type: "arrow" },
      ].map((s, i) => (
        <group key={`sign-${i}`} position={s.pos}>
          <mesh position={[0, 0.95, 0]} castShadow><cylinderGeometry args={[0.04, 0.04, 1.9, 8]} /><meshStandardMaterial color="#4a545e" metalness={0.7} roughness={0.35} /></mesh>
          <mesh position={[0, 1.85, 0]} castShadow><boxGeometry args={[0.9, 0.62, 0.06]} /><meshStandardMaterial color={s.type === "stop" ? "#c0392b" : s.type === "h" ? "#2a7ad0" : "#f1f3f2"} roughness={0.6} /></mesh>
          {s.type === "stop" && <mesh position={[0, 1.85, 0.04]}><planeGeometry args={[0.62, 0.22]} /><meshStandardMaterial color="#ffffff" /></mesh>}
        </group>
      ))}

      {/* Manhole covers along roads */}
      {[[-31, 0], [31, 0], [-31, -18], [31, -18], [0, 34], [-18, 30]].map(([x, z], i) => (
        <mesh key={`mh-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[x as number, 0.034, z as number]}>
          <circleGeometry args={[0.42, 16]} />
          <meshStandardMaterial color="#2b343c" roughness={0.85} metalness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

function Tree({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.85, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.2, 1.7, 10]} />
        <meshStandardMaterial color="#59422e" roughness={1} />
      </mesh>
      <mesh position={[0, 2.1, 0]} castShadow>
        <sphereGeometry args={[0.95, 12, 10]} />
        <meshStandardMaterial color="#244e35" roughness={0.98} />
      </mesh>
      <mesh position={[0.55, 2.35, 0.16]} castShadow>
        <sphereGeometry args={[0.68, 12, 10]} />
        <meshStandardMaterial color="#326843" roughness={0.98} />
      </mesh>
      <mesh position={[-0.48, 2.38, -0.2]} castShadow>
        <sphereGeometry args={[0.62, 12, 10]} />
        <meshStandardMaterial color="#2c5c3d" roughness={0.98} />
      </mesh>
     </group>
  );
}

function PalmTree({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale} name="palm_tree">
      {/* curving trunk */}
      <mesh position={[0.06, 1.6, 0]} castShadow rotation={[0, 0, 0.08]}>
        <cylinderGeometry args={[0.12, 0.18, 3.2, 8]} />
        <meshStandardMaterial color="#7a5a3a" roughness={0.92} />
      </mesh>
      {/* ring details */}
      {Array.from({length: 5}).map((_,i)=>(
        <mesh key={i} position={[0.06 + i*0.02, 0.4 + i*0.55, 0]} castShadow>
          <cylinderGeometry args={[0.135, 0.145, 0.08, 10]} />
          <meshStandardMaterial color="#5a402a" roughness={0.95} />
        </mesh>
      ))}
      {/* fronds */}
      {Array.from({length: 7}).map((_,i)=>{
        const ang = (i/7) * Math.PI * 2;
        return (
          <group key={i} position={[0.18, 3.1, 0]} rotation={[0.25, ang, 0]}>
            <mesh position={[0,0,0.7]} castShadow rotation={[0.4, 0, 0]}>
              <boxGeometry args={[0.18, 0.015, 1.4]} />
              <meshStandardMaterial color="#3d8a3d" roughness={0.85} flatShading />
            </mesh>
            <mesh position={[0,0,1.0]} castShadow rotation={[0.7, 0, 0]}>
              <boxGeometry args={[0.13, 0.012, 0.7]} />
              <meshStandardMaterial color="#2c6e2c" roughness={0.85} flatShading />
            </mesh>
          </group>
        );
      })}
      {/* coconuts */}
      <mesh position={[0.16, 2.8, 0.1]} castShadow>
        <sphereGeometry args={[0.1, 10, 10]} />
        <meshStandardMaterial color="#5a3a1a" roughness={0.9} />
      </mesh>
      <mesh position={[0.2, 2.6, -0.05]} castShadow>
        <sphereGeometry args={[0.1, 10, 10]} />
        <meshStandardMaterial color="#5a3a1a" roughness={0.9} />
      </mesh>
    </group>
  );
}

function PineTree({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale} name="pine_tree">
      <mesh position={[0, 0.9, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.18, 1.8, 8]} />
        <meshStandardMaterial color="#3a2818" roughness={0.95} />
      </mesh>
      {[0.0, 0.45, 0.95, 1.5].map((y, i)=>(
        <mesh key={i} position={[0, 1.4 + y, 0]} castShadow>
          <coneGeometry args={[1.1 - i * 0.18, 1.0, 12]} />
          <meshStandardMaterial color={i % 2 === 0 ? "#1f4a28" : "#1c3f24"} roughness={0.92} />
        </mesh>
      ))}
    </group>
  );
}

function Shrub({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale} name="shrub">
      <mesh position={[0, 0.35, 0]} castShadow>
        <sphereGeometry args={[0.5, 12, 10]} />
        <meshStandardMaterial color="#3a7a3a" roughness={0.95} />
      </mesh>
      <mesh position={[0.3, 0.42, 0.2]} castShadow>
        <sphereGeometry args={[0.32, 10, 8]} />
        <meshStandardMaterial color="#4d964d" roughness={0.95} />
      </mesh>
      <mesh position={[-0.28, 0.4, -0.18]} castShadow>
        <sphereGeometry args={[0.34, 10, 8]} />
        <meshStandardMaterial color="#2e6a2e" roughness={0.95} />
      </mesh>
      {/* small flowers */}
      {[[0.2, 0.7, 0.1], [-0.15, 0.85, 0.05], [0.1, 0.95, -0.1]].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]}>
          <sphereGeometry args={[0.05, 6, 6]} />
          <meshStandardMaterial color={i % 2 === 0 ? "#fbbf24" : "#f87171"} emissive={i % 2 === 0 ? "#fbbf24" : "#f87171"} emissiveIntensity={0.4} />
        </mesh>
      ))}
    </group>
  );
}

function FlowerBed({ position, size = 3 }: { position: [number, number, number]; size?: number }) {
  return (
    <group position={position} name="flower_bed">
      {/* soil */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]} receiveShadow>
        <planeGeometry args={[size, size * 0.4]} />
        <meshStandardMaterial color="#3a2418" roughness={0.95} />
      </mesh>
      {/* stone border */}
      {[-size / 2, size / 2].map((x, i) => (
        <mesh key={i} position={[x, 0.1, 0]} castShadow>
          <boxGeometry args={[0.18, 0.2, size * 0.4]} />
          <meshStandardMaterial color="#6b5b50" roughness={0.9} />
        </mesh>
      ))}
      {[-size * 0.2, size * 0.2].map((z, i) => (
        <mesh key={i} position={[0, 0.1, z]} castShadow>
          <boxGeometry args={[size, 0.2, 0.18]} />
          <meshStandardMaterial color="#6b5b50" roughness={0.9} />
        </mesh>
      ))}
      {/* colorful tulips */}
      {Array.from({length: 14}).map((_, i) => {
        const x = (i % 7 - 3) * 0.32;
        const z = (i < 7 ? -0.15 : 0.15) + ((i * 13) % 5) * 0.05;
        const c = ["#ef4444", "#f59e0b", "#3b82f6", "#a855f7", "#ec4899", "#10b981", "#f97316"][i % 7];
        return (
          <group key={i} position={[x, 0, z]}>
            <mesh position={[0, 0.18, 0]} castShadow>
              <cylinderGeometry args={[0.012, 0.012, 0.32, 6]} />
              <meshStandardMaterial color="#3a7a3a" />
            </mesh>
            <mesh position={[0, 0.36, 0]} castShadow>
              <sphereGeometry args={[0.06, 8, 8]} scale={[0.8, 1, 0.8]} />
              <meshStandardMaterial color={c} roughness={0.6} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

function Hedge({ position, length, rotation = 0 }: { position: [number, number, number]; length: number; rotation?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]} name="hedge">
      <mesh position={[0, 0.45, 0]} castShadow>
        <boxGeometry args={[length, 0.9, 0.42]} />
        <meshStandardMaterial color="#2a6a2a" roughness={0.95} />
      </mesh>
      <mesh position={[0, 0.95, 0]} castShadow>
        <boxGeometry args={[length, 0.16, 0.36]} />
        <meshStandardMaterial color="#3a8a3a" roughness={0.92} />
      </mesh>
      {/* small leaf clusters */}
      {Array.from({length: Math.floor(length / 0.6) + 1}).map((_, i) => (
        <mesh key={i} position={[-length/2 + i * 0.6, 1.05, 0]} castShadow>
          <sphereGeometry args={[0.15, 6, 6]} />
          <meshStandardMaterial color="#4ba04b" roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

export function Trees() {
  /**
   * Tree placement is aligned to the campus grid so nothing sits on a road
   * or inside a building footprint.
   *
   * Roads      : cross-streets z = 36, 12, -10, -28, -44 | avenues x = ±31, ±52
   * Mall       : x = -4.5 … 4.5
   * Building   : columns x = -43, -18, 0, 18, 43 | rows z = 23, 1, -19, -35
   */
  const treePlacements = useMemo(() => {
    const list: { pos: [number, number, number]; type: "broad" | "palm" | "pine"; scale: number }[] = [];

    // 1. Inner avenue trees flanking the central mall (x = ±9.8 lawn strip)
    const mallRowZ = [27, 23, 19, 5, 1, -3, -16, -19, -22, -33, -35, -38];
    [-9.8, 9.8].forEach((x) => {
      mallRowZ.forEach((z, i) => {
        list.push({ pos: [x, 0, z], type: i % 4 === 1 ? "palm" : "broad", scale: 0.82 + (i % 3) * 0.08 });
      });
    });

    // 2. Outer street trees between the avenues and the perimeter blocks (x = ±36)
    const outerRowZ = [30, 23, 16, 4, -4, -16, -22, -33, -38];
    [-36, 36].forEach((x) => {
      outerRowZ.forEach((z, i) => {
        list.push({ pos: [x, 0, z], type: i % 3 === 0 ? "pine" : "broad", scale: 0.78 + (i % 3) * 0.07 });
      });
    });

    // 3. Entrance palms stay outside the approach road, feeder road and parking.
    ([[-10, 59], [10, 59], [-39, 45], [39, 45], [-39, 52], [39, 52], [-39, 59], [39, 59]] as const).forEach(([x, z], i) => {
      list.push({ pos: [x, 0, z], type: "palm", scale: 1 + (i % 3) * 0.08 });
    });

    // 4. Feature palms beside the AI Command Center on the mall lawn
    ([[-6.8, 3], [6.8, 3], [-6.8, -1], [6.8, -1]] as const).forEach(([x, z]) => {
      list.push({ pos: [x, 0, z], type: "palm", scale: 0.95 });
    });

    // 5. Corner lawn clusters between service blocks and the south ring
    ([[-46, 31], [-41, 31], [41, 31], [46, 31], [-43, -4.5], [43, -4.5], [-43, -15], [43, -27]] as const).forEach(([x, z], i) => {
      list.push({ pos: [x, 0, z], type: i % 2 === 0 ? "broad" : "pine", scale: 0.88 + (i % 3) * 0.09 });
    });

    // 6. Dense perimeter forest ring well outside the outer roads
    for (let i = 0; i < 46; i += 1) {
      const angle = (i / 46) * Math.PI * 2;
      const radius = 64 + ((i * 7) % 11);
      list.push({
        pos: [Math.cos(angle) * radius, 0, Math.sin(angle) * radius - 6],
        type: i % 3 === 0 ? "pine" : i % 3 === 1 ? "broad" : "palm",
        scale: 0.95 + ((i * 5) % 4) * 0.12,
      });
    }

    // 7. Second, tighter forest band for depth
    for (let i = 0; i < 34; i += 1) {
      const angle = (i / 34) * Math.PI * 2 + 0.4;
      const radius = 78 + ((i * 5) % 9);
      list.push({
        pos: [Math.cos(angle) * radius, 0, Math.sin(angle) * radius - 6],
        type: i % 2 === 0 ? "pine" : "broad",
        scale: 1.05 + ((i * 3) % 4) * 0.14,
      });
    }

    return list;
  }, []);

  // Shrubs sit on building forecourt lawns, never on the carriageway.
  const shrubs = useMemo(() => ([
    [-6, 29], [6, 29], [-24, 30], [-12, 30], [12, 30], [24, 30],
    [-6.5, 7], [6.5, 7], [-24, 7.5], [-12, 7.5], [12, 7.5], [24, 7.5],
    [-26, 23], [26, 23], [-26, 1], [26, 1], [-26, -19], [26, -19],
    [-10, -40], [10, -40], [-38, 23], [38, 23], [-38, -35], [38, -12],
  ] as const).map(([x, z], i) => ({ pos: [x, 0, z] as [number, number, number], scale: 0.68 + (i % 4) * 0.11 })), []);

  return (
    <group name="campus_greenery">
      {treePlacements.map((t, i) => {
        if (t.type === "palm") return <PalmTree key={i} position={t.pos} scale={t.scale} />;
        if (t.type === "pine") return <PineTree key={i} position={t.pos} scale={t.scale} />;
        return <Tree key={i} position={t.pos} scale={t.scale} />;
      })}
      {shrubs.map((s, i) => <Shrub key={`shrub-${i}`} position={s.pos} scale={s.scale} />)}

      {/* Hedges framing the mall lawn beside the AI Command Center */}
      <Hedge position={[-7.4, 0, 1]} length={9} rotation={Math.PI / 2} />
      <Hedge position={[7.4, 0, 1]} length={9} rotation={Math.PI / 2} />
      {/* Hedges along the Emergency and Ward A forecourts */}
      <Hedge position={[-16, 0, 30]} length={8} />
      <Hedge position={[16, 0, 30]} length={8} />

      {/* Flower beds stay in the pedestrian strips, never on a vehicle lane. */}
      <FlowerBed position={[-9.5, 0, 47.5]} size={2.8} />
      <FlowerBed position={[9.5, 0, 47.5]} size={2.8} />
      <FlowerBed position={[-9, 0, 30]} size={3} />
      <FlowerBed position={[9, 0, 30]} size={3} />
      <FlowerBed position={[-39, 0, 46]} size={3.4} />
      <FlowerBed position={[39, 0, 46]} size={3.4} />
    </group>
  );
}

function StreetLight({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, 1.8, 0]} castShadow>
        <cylinderGeometry args={[0.045, 0.08, 3.6, 10]} />
        <meshStandardMaterial color="#4b545a" metalness={0.82} roughness={0.24} />
      </mesh>
      <mesh position={[0.42, 3.55, 0]} castShadow>
        <boxGeometry args={[0.85, 0.1, 0.22]} />
        <meshStandardMaterial color="#434d53" metalness={0.8} roughness={0.22} />
      </mesh>
      <mesh position={[0.78, 3.48, 0]}>
        <boxGeometry args={[0.28, 0.08, 0.18]} />
        <meshStandardMaterial color="#fff5d1" emissive="#fff0ba" emissiveIntensity={2.4} />
      </mesh>
    </group>
  );
}

export function StreetLights() {
  const points = useMemo<[number, number, number][]>(() => [
    // central mall edges
    [-6.4,0,30],[-6.4,0,18],[-6.4,0,-6],[-6.4,0,-24],[-6.4,0,-40],
    [6.4,0,30],[6.4,0,18],[6.4,0,-6],[6.4,0,-24],[6.4,0,-40],
    // west avenue (x=-31) both sides
    [-35.7,0,24],[-35.7,0,4],[-35.7,0,-18],[-35.7,0,-38],
    [-26.3,0,24],[-26.3,0,4],[-26.3,0,-18],[-26.3,0,-38],
    // east avenue (x=31) both sides
    [35.7,0,24],[35.7,0,4],[35.7,0,-18],[35.7,0,-38],
    [26.3,0,24],[26.3,0,4],[26.3,0,-18],[26.3,0,-38],
    // south ring
    [-44,0,32],[-14,0,32],[14,0,32],[44,0,32],
    // north cross-street
    [-14,0,-40.5],[14,0,-40.5],
  ], []);
  return <group name="street_lighting">{points.map((p, i) => <StreetLight key={i} position={p} rotation={i % 2 ? Math.PI : 0} />)}</group>;
}

function Wheel({ position }: { position: [number, number, number] }) {
  return (
    <mesh position={position} rotation={[0, 0, Math.PI / 2]} castShadow>
      <cylinderGeometry args={[0.24, 0.24, 0.16, 20]} />
      <meshStandardMaterial color="#12181d" roughness={0.74} metalness={0.2} />
    </mesh>
  );
}

export function Ambulance({ position, rotation = 0, emergency = false }: { position: [number, number, number]; rotation?: number; emergency?: boolean }) {
  const red = useRef<THREE.Mesh>(null);
  const blue = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    const flash = Math.sin(state.clock.elapsedTime * 14) > 0;
    if (red.current) (red.current.material as THREE.MeshStandardMaterial).emissiveIntensity = emergency && flash ? 5 : 0.4;
    if (blue.current) (blue.current.material as THREE.MeshStandardMaterial).emissiveIntensity = emergency && !flash ? 5 : 0.4;
  });
  return (
    <group name="ambulance" position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, 0.72, -0.18]} castShadow>
        <boxGeometry args={[1.45, 1.25, 2.7]} />
        <meshPhysicalMaterial color="#f4f6f5" roughness={0.28} metalness={0.2} clearcoat={0.7} />
      </mesh>
      <mesh position={[0, 0.58, 1.45]} castShadow>
        <boxGeometry args={[1.4, 0.9, 0.95]} />
        <meshPhysicalMaterial color="#e9eeee" roughness={0.27} clearcoat={0.6} />
      </mesh>
      <mesh position={[0, 0.84, 1.94]}>
        <boxGeometry args={[1.1, 0.42, 0.035]} />
        <meshPhysicalMaterial color="#132b3b" metalness={0.55} roughness={0.08} />
      </mesh>
      <mesh position={[0.731, 0.65, -0.1]}>
        <boxGeometry args={[0.025, 0.26, 2.2]} />
        <meshStandardMaterial color="#ca263b" emissive="#78101e" emissiveIntensity={0.3} />
      </mesh>
      <mesh ref={red} position={[-0.27, 1.42, 0.68]}>
        <boxGeometry args={[0.35, 0.1, 0.22]} />
        <meshStandardMaterial color="#ff314e" emissive="#ff1c40" />
      </mesh>
      <mesh ref={blue} position={[0.27, 1.42, 0.68]}>
        <boxGeometry args={[0.35, 0.1, 0.22]} />
        <meshStandardMaterial color="#2686ff" emissive="#1475ff" />
      </mesh>
      <Wheel position={[-0.74, 0.27, 1.12]} /><Wheel position={[0.74, 0.27, 1.12]} />
      <Wheel position={[-0.74, 0.27, -1.08]} /><Wheel position={[0.74, 0.27, -1.08]} />
    </group>
  );
}

export function HospitalBus({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  return (
    <group name="hospital_bus" position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, 0.9, 0]} castShadow>
        <boxGeometry args={[1.9, 1.65, 5.2]} />
        <meshPhysicalMaterial color="#e7eef0" roughness={0.27} metalness={0.16} clearcoat={0.65} />
      </mesh>
      <mesh position={[0, 1.15, 2.62]}>
        <boxGeometry args={[1.55, 0.65, 0.04]} />
        <meshPhysicalMaterial color="#173a4f" metalness={0.62} roughness={0.08} />
      </mesh>
      {[-0.96, 0.96].map((x) => <Wheel key={x} position={[x, 0.34, -1.55]} />)}
      {[-0.96, 0.96].map((x) => <Wheel key={`f${x}`} position={[x, 0.34, 1.55]} />)}
      <mesh position={[0.96, 0.8, 0]}>
        <boxGeometry args={[0.025, 0.28, 4.5]} />
        <meshStandardMaterial color="#1677a6" emissive="#0e4664" emissiveIntensity={0.25} />
      </mesh>
    </group>
  );
}

export function Person({ position, color = "#e5e7eb", scale = 1 }: { position: [number, number, number]; color?: string; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 1.52, 0]} castShadow><sphereGeometry args={[0.16, 14, 12]} /><meshStandardMaterial color="#b88466" roughness={0.82} /></mesh>
      <mesh position={[0, 1.05, 0]} castShadow><capsuleGeometry args={[0.22, 0.5, 6, 12]} /><meshStandardMaterial color={color} roughness={0.72} /></mesh>
      <mesh position={[-0.12, 0.38, 0]} castShadow><capsuleGeometry args={[0.075, 0.48, 4, 8]} /><meshStandardMaterial color="#27323c" roughness={0.78} /></mesh>
      <mesh position={[0.12, 0.38, 0]} castShadow><capsuleGeometry args={[0.075, 0.48, 4, 8]} /><meshStandardMaterial color="#27323c" roughness={0.78} /></mesh>
    </group>
  );
}

export function CampusLife() {
  return (
    <group name="campus_people_and_transport">
      {/* buses parked at the south drop-off / parking frontage */}
      <HospitalBus position={[-32, 0, 41]} rotation={Math.PI / 2} />
      <HospitalBus position={[44, 0, 41]} rotation={Math.PI / 2} />
      {/* visitors on the central mall + plaza */}
      <Person position={[-3.2, 0, 33]} color="#f0f3f4" /><Person position={[2.8, 0, 33.6]} color="#70b7df" />
      <Person position={[-1.5, 0, 15]} color="#f0f3f4" /><Person position={[1.5, 0, 8]} color="#b7c4cf" />
      <Person position={[-10.5, 0, 30]} color="#e8f2f3" /><Person position={[11, 0, 30]} color="#dbeafe" />
      <group name="wheelchair" position={[-4.2, 0, 30]}>
        <mesh position={[0, 0.45, 0]} rotation={[0, 0, Math.PI / 2]}><torusGeometry args={[0.36, 0.05, 8, 24]} /><meshStandardMaterial color="#25303a" metalness={0.6} roughness={0.3} /></mesh>
        <mesh position={[0.26, 0.38, 0]}><boxGeometry args={[0.45, 0.08, 0.48]} /><meshStandardMaterial color="#385d78" roughness={0.6} /></mesh>
      </group>
    </group>
  );
}

export function AnimatedTraffic() {
  // Vehicles constrained to the road lane centers - matching the new road grid.
  // Cross-streets: z = 36, 12, -10, -28, -44 (width ~8 = each lane at z±2)
  // Avenues: x = ±31 (width ~8 = each lane at x±2)
  const refA = useRef<THREE.Group>(null);
  const refB = useRef<THREE.Group>(null);
  const refC = useRef<THREE.Group>(null);
  const refD = useRef<THREE.Group>(null);
  const refE = useRef<THREE.Group>(null);
  const refF = useRef<THREE.Group>(null);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    // Car A - cross-street z=12, right lane, moving east
    if (refA.current) {
      const p = (t * 0.06) % 1;
      refA.current.position.set(THREE.MathUtils.lerp(-56, 56, p), 0, 12 + 2);
      refA.current.rotation.y = Math.PI / 2;
    }
    // Car B - cross-street z=12, left lane, moving west
    if (refB.current) {
      const p = (t * 0.055 + 0.35) % 1;
      refB.current.position.set(THREE.MathUtils.lerp(56, -56, p), 0, 12 - 2);
      refB.current.rotation.y = -Math.PI / 2;
    }
    // Car C - east avenue x=31, right lane, moving south
    if (refC.current) {
      const p = (t * 0.05 + 0.6) % 1;
      refC.current.position.set(31 + 2, 0, THREE.MathUtils.lerp(-46, 46, p));
      refC.current.rotation.y = Math.PI;
    }
    // Car D - west avenue x=-31, left lane, moving north
    if (refD.current) {
      const p = (t * 0.052 + 0.2) % 1;
      refD.current.position.set(-31 - 2, 0, THREE.MathUtils.lerp(46, -46, p));
      refD.current.rotation.y = 0;
    }
    // Car E - south ring z=36, right lane, moving east
    if (refE.current) {
      const p = (t * 0.048 + 0.1) % 1;
      refE.current.position.set(THREE.MathUtils.lerp(-56, 56, p), 0, 36 + 2);
      refE.current.rotation.y = Math.PI / 2;
    }
    // Car F - cross-street z=-10, left lane, moving west
    if (refF.current) {
      const p = (t * 0.05 + 0.7) % 1;
      refF.current.position.set(THREE.MathUtils.lerp(56, -56, p), 0, -10 - 2);
      refF.current.rotation.y = -Math.PI / 2;
    }
  });
  return (
    <group name="animated_traffic">
      <group ref={refA}>
        <mesh castShadow position={[0,0.42,0]}><boxGeometry args={[1.9,0.9,3.6]} /><meshPhysicalMaterial color="#e2e8f0" metalness={0.55} roughness={0.35} /></mesh>
        <mesh position={[0,0.92,0.2]}><boxGeometry args={[1.1,0.5,0.7]} /><meshStandardMaterial color="#0f172a" roughness={0.3} /></mesh>
        <mesh position={[-0.92,0.18,0.9]} rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[0.28,0.28,0.14,14]} /><meshStandardMaterial color="#0f172a" /></mesh>
        <mesh position={[0.92,0.18,0.9]} rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[0.28,0.28,0.14,14]} /><meshStandardMaterial color="#0f172a" /></mesh>
        <mesh position={[-0.92,0.18,-0.9]} rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[0.28,0.28,0.14,14]} /><meshStandardMaterial color="#0f172a" /></mesh>
        <mesh position={[0.92,0.18,-0.9]} rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[0.28,0.28,0.14,14]} /><meshStandardMaterial color="#0f172a" /></mesh>
      </group>
      <group ref={refB}>
        <mesh castShadow position={[0,0.38,0]}><boxGeometry args={[1.5,0.75,2.9]} /><meshPhysicalMaterial color="#334155" metalness={0.6} roughness={0.3} /></mesh>
        <mesh position={[0,0.78,0.3]}><boxGeometry args={[0.9,0.4,0.6]} /><meshStandardMaterial color="#1e293b" /></mesh>
      </group>
      <group ref={refC}>
        <mesh castShadow position={[0,0.32,0]}><boxGeometry args={[1.3,0.65,2.4]} /><meshPhysicalMaterial color="#f8fafc" metalness={0.4} roughness={0.4} /></mesh>
        <mesh position={[0,0.66,0.4]}><boxGeometry args={[0.8,0.35,0.45]} /><meshStandardMaterial color="#1e293b" /></mesh>
        {[[-0.6,0.18,0.9],[0.6,0.18,0.9],[-0.6,0.18,-0.9],[0.6,0.18,-0.9]].map((p,i)=>(
          <mesh key={i} position={p as [number,number,number]} rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[0.22,0.22,0.12,12]} /><meshStandardMaterial color="#0f172a" /></mesh>
        ))}
      </group>
      <group ref={refD}>
        <mesh castShadow position={[0,0.4,0]}><boxGeometry args={[1.7,0.82,3.2]} /><meshPhysicalMaterial color="#7f1d1d" metalness={0.55} roughness={0.35} /></mesh>
        <mesh position={[0,0.86,0.2]}><boxGeometry args={[1.05,0.44,0.65]} /><meshStandardMaterial color="#0f172a" /></mesh>
        {[[-0.78,0.22,1.1],[0.78,0.22,1.1],[-0.78,0.22,-1.1],[0.78,0.22,-1.1]].map((p,i)=>(
          <mesh key={i} position={p as [number,number,number]} rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[0.26,0.26,0.14,14]} /><meshStandardMaterial color="#0f172a" /></mesh>
        ))}
      </group>
      <group ref={refE}>
        <mesh castShadow position={[0,0.38,0]}><boxGeometry args={[1.5,0.75,2.9]} /><meshPhysicalMaterial color="#1e40af" metalness={0.6} roughness={0.3} clearcoat={0.55} /></mesh>
        <mesh position={[0,0.82,0.25]}><boxGeometry args={[0.98,0.42,0.58]} /><meshStandardMaterial color="#0f172a" /></mesh>
        {[[-0.7,0.22,0.95],[0.7,0.22,0.95],[-0.7,0.22,-0.95],[0.7,0.22,-0.95]].map((p,i)=>(
          <mesh key={i} position={p as [number,number,number]} rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[0.24,0.24,0.12,12]} /><meshStandardMaterial color="#0f172a" /></mesh>
        ))}
      </group>
      <group ref={refF}>
        <mesh castShadow position={[0,0.4,0]}><boxGeometry args={[1.6,0.78,3.0]} /><meshPhysicalMaterial color="#166534" metalness={0.55} roughness={0.35} /></mesh>
        <mesh position={[0,0.84,0.2]}><boxGeometry args={[1.0,0.42,0.6]} /><meshStandardMaterial color="#0f172a" /></mesh>
        {[[-0.75,0.22,1.0],[0.75,0.22,1.0],[-0.75,0.22,-1.0],[0.75,0.22,-1.0]].map((p,i)=>(
          <mesh key={i} position={p as [number,number,number]} rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[0.24,0.24,0.12,12]} /><meshStandardMaterial color="#0f172a" /></mesh>
        ))}
      </group>
    </group>
  );
}

export function WalkingPeople() {
  // People walk along the ACTUAL concrete sidewalks (see Roads()).
  // Available sidewalks: horizontal at z ∈ {37.1,27.9,12.7,3.7,-4.8,-12.2,-19.9,-27.1}, vertical at x ∈ {-34.2,-24.8,-5.3,5.3,24.8,34.2}
  const paths = useMemo(() => [
    { axis: "v" as const, coord: -5.0, from: -40, to: 33, color: "#e2e8f0", top: "#f43f5e" }, // central mall west edge
    { axis: "v" as const, coord: 5.0, from: -40, to: 33, color: "#e2e8f0", top: "#eab308" }, // central mall east edge
    { axis: "h" as const, coord: 16.4, from: -26, to: 26, color: "#f1f5f9", top: "#38bdf8" }, // cross-street z=12 north sidewalk
    { axis: "h" as const, coord: -5.6, from: -26, to: 26, color: "#f1f5f9", top: "#22c55e" }, // cross-street z=-10 north sidewalk
    { axis: "v" as const, coord: -35.7, from: -24, to: 24, color: "#f8fafc", top: "#0ea5e9" }, // west avenue sidewalk
    { axis: "v" as const, coord: 35.7, from: -24, to: 24, color: "#f8fafc", top: "#a78bfa" }, // east avenue sidewalk
  ], []);
  const walkers = useMemo(() => Array.from({length: 8}, (_, i) => ({
    pathIdx: i % paths.length,
    offset: (i * 0.13) % 1,
    speed: 0.05 + (i % 3) * 0.02,
    direction: i % 2 === 0 ? 1 : -1,
  })), [paths.length]);
  const refs = useRef<THREE.Group[]>([]);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    refs.current.forEach((g, i) => {
      if (!g) return;
      const w = walkers[i];
      const path = paths[w.pathIdx];
      const p = ((t * w.speed + w.offset) * w.direction + 1) % 1;
      const along = THREE.MathUtils.lerp(path.from, path.to, p);
      if (path.axis === "h") {
        g.position.set(along, 0, path.coord);
        g.rotation.y = w.direction > 0 ? Math.PI / 2 : -Math.PI / 2;
      } else {
        g.position.set(path.coord, 0, along);
        g.rotation.y = w.direction > 0 ? 0 : Math.PI;
      }
      // leg swing animation
      g.children.forEach((c) => {
        if (c.userData.isLeg) {
          c.rotation.x = Math.sin(t * 6 + i) * 0.45 * c.userData.side;
        }
      });
    });
  });
  return (
    <group name="walking_people">
      {walkers.map((w, i) => (
        <group key={i} ref={(n) => { if (n) refs.current[i] = n; }}>
          <mesh position={[0, 1.52, 0]} castShadow><sphereGeometry args={[0.13, 10, 8]} /><meshStandardMaterial color={i % 3 === 0 ? "#e8c4a8" : i % 3 === 1 ? "#c9a88a" : "#b8a080"} roughness={0.8} /></mesh>
          <mesh position={[0, 1.06, 0]} castShadow><capsuleGeometry args={[0.18, 0.42, 6, 10]} /><meshStandardMaterial color={paths[w.pathIdx].top} roughness={0.75} /></mesh>
          <group position={[-0.09, 0.38, 0]} userData={{ isLeg: true, side: 1 }}><mesh castShadow><capsuleGeometry args={[0.065, 0.38, 4, 8]} /><meshStandardMaterial color="#1e293b" /></mesh></group>
          <group position={[0.09, 0.38, 0]} userData={{ isLeg: true, side: -1 }}><mesh castShadow><capsuleGeometry args={[0.065, 0.38, 4, 8]} /><meshStandardMaterial color="#1e293b" /></mesh></group>
        </group>
      ))}
    </group>
  );
}

/**
 * Emergency response ambulance that drives from the campus gate through the roads
 * into the Emergency ambulance bay. Follows real road grid with proper turning.
 */
export function EmergencyResponseAmbulance({ active, delay = 0, laneOffset = 0 }: { active: boolean; delay?: number; laneOffset?: number }) {
  const group = useRef<THREE.Group>(null);
  const red = useRef<THREE.Mesh>(null);
  const blue = useRef<THREE.Mesh>(null);
  // Path: approach road → security gate IN lane (x=-4.5, z=52) → parking feeder
  // → south ring (z=36) → west → Emergency ambulance bay at (-18, 31)
  const path = useMemo(() => new THREE.CatmullRomCurve3([
    new THREE.Vector3(-4.5, 0, 66),  // outside approach road
    new THREE.Vector3(-4.5, 0, 57),  // stop line before barrier
    new THREE.Vector3(-4.5, 0, 52),  // passing through the gate IN lane
    new THREE.Vector3(-4.5, 0, 44),  // inside campus
    new THREE.Vector3(-4, 0, 38),    // merging onto south ring
    new THREE.Vector3(-10, 0, 36),   // west along south ring
    new THREE.Vector3(-18, 0, 35),   // aligned with Emergency bay
    new THREE.Vector3(-18, 0, 31),   // arrived at Emergency ambulance bay
  ], false, "catmullrom", 0.4), []);
  const progress = useRef(0);
  const activeTime = useRef(0);
  useFrame((state, delta) => {
    if (!group.current) return;
    activeTime.current = active ? activeTime.current + delta : 0;
    const target = active && activeTime.current >= delay ? 1 : 0;
    progress.current = THREE.MathUtils.damp(progress.current, target, active ? 0.6 : 2, delta);
    group.current.visible = progress.current > 0.02;
    if (progress.current < 0.001) return;
    const p = THREE.MathUtils.clamp(progress.current, 0.001, 0.999);
    const pos = path.getPoint(p);
    const tan = path.getTangent(p);
    // Keep each response vehicle separated while preserving the road centerline.
    const normal = new THREE.Vector3(-tan.z, 0, tan.x).normalize().multiplyScalar(laneOffset);
    group.current.position.copy(pos).add(normal);
    group.current.rotation.y = Math.atan2(tan.x, tan.z);
    // flashing sirens
    const flash = Math.sin(state.clock.elapsedTime * 14) > 0;
    if (red.current) (red.current.material as THREE.MeshStandardMaterial).emissiveIntensity = target > 0 && flash ? 5 : 0.3;
    if (blue.current) (blue.current.material as THREE.MeshStandardMaterial).emissiveIntensity = target > 0 && !flash ? 5 : 0.3;
  });
  return (
    <group ref={group} name="emergency_response_ambulance">
      <mesh position={[0, 0.72, -0.18]} castShadow>
        <boxGeometry args={[1.45, 1.25, 2.7]} />
        <meshPhysicalMaterial color="#f4f6f5" roughness={0.28} metalness={0.2} clearcoat={0.7} />
      </mesh>
      <mesh position={[0, 0.58, 1.45]} castShadow>
        <boxGeometry args={[1.4, 0.9, 0.95]} />
        <meshPhysicalMaterial color="#e9eeee" roughness={0.27} clearcoat={0.6} />
      </mesh>
      <mesh position={[0, 0.84, 1.94]}>
        <boxGeometry args={[1.1, 0.42, 0.035]} />
        <meshPhysicalMaterial color="#132b3b" metalness={0.55} roughness={0.08} />
      </mesh>
      <mesh position={[0.731, 0.65, -0.1]}>
        <boxGeometry args={[0.025, 0.26, 2.2]} />
        <meshStandardMaterial color="#ca263b" emissive="#78101e" emissiveIntensity={0.4} />
      </mesh>
      <mesh ref={red} position={[-0.27, 1.42, 0.68]}>
        <boxGeometry args={[0.35, 0.1, 0.22]} />
        <meshStandardMaterial color="#ff314e" emissive="#ff1c40" />
      </mesh>
      <mesh ref={blue} position={[0.27, 1.42, 0.68]}>
        <boxGeometry args={[0.35, 0.1, 0.22]} />
        <meshStandardMaterial color="#2686ff" emissive="#1475ff" />
      </mesh>
      {[[-0.74, 0.27, 1.12], [0.74, 0.27, 1.12], [-0.74, 0.27, -1.08], [0.74, 0.27, -1.08]].map((p, i) => (
        <mesh key={i} position={p as [number, number, number]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.22, 0.22, 0.16, 12]} />
          <meshStandardMaterial color="#12181d" roughness={0.74} metalness={0.2} />
        </mesh>
      ))}
      {active && <pointLight position={[0, 2, 0]} color="#ff3355" intensity={22} distance={12} />}
    </group>
  );
}

export function NetworkLines({ targets, active = true }: { targets: { pos: [number, number, number]; color: string }[]; active?: boolean }) {
  const packets = useRef<THREE.Mesh[]>([]);
  const curves = useMemo(() => targets.map((target) => {
    const start = new THREE.Vector3(0, 7.4, -1);
    const end = new THREE.Vector3(target.pos[0], Math.max(1, target.pos[1] + 1), target.pos[2]);
    const mid = start.clone().add(end).multiplyScalar(0.5);
    mid.y += 3 + start.distanceTo(end) * 0.09;
    return new THREE.QuadraticBezierCurve3(start, mid, end);
  }), [targets]);
  const tubes = useMemo(() => curves.map((curve) => new THREE.TubeGeometry(curve, 36, 0.035, 5, false)), [curves]);

  useFrame((state) => {
    packets.current.forEach((packet, i) => {
      if (!packet) return;
      packet.position.copy(curves[i].getPoint((state.clock.elapsedTime * 0.28 + i * 0.071) % 1));
    });
  });

  return (
    <group name="digital_twin_network" visible={active}>
      {tubes.map((geometry, i) => (
        <mesh key={`line-${i}`} geometry={geometry}>
          <meshBasicMaterial color={targets[i].color} transparent opacity={0.42} depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
      ))}
      {targets.map((target, i) => (
        <mesh key={`packet-${i}`} ref={(node) => { if (node) packets.current[i] = node; }}>
          <sphereGeometry args={[0.12, 10, 10]} />
          <meshStandardMaterial color="#ffffff" emissive={target.color} emissiveIntensity={5} />
        </mesh>
      ))}
    </group>
  );
}
