import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { departments } from "../data/hospital";
import { Phase } from "../data/scenario";
import { ICU04_POSITION } from "../data/icuDemo";

export type CameraMode = "orbit" | "walk" | "third" | "drone" | "interior" | "cinematic";

const START: Record<CameraMode, THREE.Vector3> = {
  orbit: new THREE.Vector3(52, 43, 57),
  walk: new THREE.Vector3(0, 1.75, 34),
  third: new THREE.Vector3(0, 1.75, 34),
  drone: new THREE.Vector3(38, 25, 45),
  interior: new THREE.Vector3(13, 9, 15),
  cinematic: new THREE.Vector3(52, 43, 57),
};

export function CameraRig({
  mode, focus, phase, selectedDepartment, icuDemoActive = false, icuDemoStage = 1, icuBedSelected = false,
}: {
  mode: CameraMode;
  focus: string;
  phase: Phase;
  selectedDepartment: string | null;
  icuDemoActive?: boolean;
  icuDemoStage?: number;
  icuBedSelected?: boolean;
}) {
  const controls = useRef<any>(null);
  const avatar = useRef<THREE.Group>(null);
  const keys = useRef(new Set<string>());
  const player = useRef(new THREE.Vector3(0, 0, 34));
  const yaw = useRef(0);
  const transition = useRef(1);

  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      keys.current.add(event.code);
      if (["KeyW", "KeyA", "KeyS", "KeyD", "KeyR", "KeyF", "ArrowLeft", "ArrowRight"].includes(event.code)) event.preventDefault();
    };
    const up = (event: KeyboardEvent) => keys.current.delete(event.code);
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, []);

  useEffect(() => {
    transition.current = 0;
    const start = START[mode];
    if (mode === "walk" || mode === "third") {
      player.current.set(0, 0, 34);
      yaw.current = 0;
    } else if (mode === "drone") {
      player.current.copy(start);
      yaw.current = Math.PI;
    }
  }, [mode, selectedDepartment]);

  useFrame((state, delta) => {
    const camera = state.camera;
    transition.current = Math.min(1, transition.current + delta * 0.8);

    // Dedicated presentation path through the transparent 12-bed ICU.
    if (icuDemoActive) {
      const target = new THREE.Vector3(0, 1.25, 0);
      const desired = new THREE.Vector3(14, 7.5, 15);
      if (!icuBedSelected || icuDemoStage === 1) {
        const t = state.clock.elapsedTime * 0.12;
        desired.set(12 * Math.cos(t) + 2, 6.8, 11 * Math.sin(t) + 11);
        target.set(0, 1.2, 0);
      } else if (icuDemoStage >= 10) {
        desired.set(15, 8.5, 16);
        target.set(0, 1.3, 0);
      } else {
        target.set(ICU04_POSITION[0], 1.15, ICU04_POSITION[2]);
        const tension = icuDemoStage >= 4 && icuDemoStage <= 7 ? 0.35 : 0.14;
        const angle = state.clock.elapsedTime * tension;
        desired.set(target.x + 5.8 + Math.sin(angle) * 1.2, 3.25 + Math.cos(angle * 0.5) * 0.35, target.z + 6.1 + Math.cos(angle) * 1.1);
      }
      camera.position.lerp(desired, 1 - Math.exp(-delta * 1.35));
      camera.lookAt(target);
      return;
    }

    if (mode === "cinematic") {
      const target = new THREE.Vector3(0, 2, 0);
      const desired = new THREE.Vector3();
      if (focus === "overview") {
        const angle = state.clock.elapsedTime * 0.045;
        const overviewHeight = phase === "normal" ? 43 : 39;
        desired.set(Math.cos(angle) * 58, overviewHeight + Math.sin(angle * 0.7) * 4, Math.sin(angle) * 58);
      } else {
        const dept = departments.find((item) => item.id === focus);
        if (dept) {
          target.set(dept.position[0], Math.max(2, dept.size[1] * 0.45), dept.position[2]);
          const angle = state.clock.elapsedTime * 0.12;
          desired.set(target.x + Math.cos(angle) * 19, target.y + 15, target.z + Math.sin(angle) * 19);
        } else desired.copy(START.cinematic);
      }
      camera.position.lerp(desired, 1 - Math.exp(-delta * 1.25));
      camera.lookAt(target);
      return;
    }

    if (mode === "orbit" || mode === "interior") {
      if (!controls.current) return;
      // when a building is selected in orbit mode, smoothly inspect it (roof-fade interior)
      if (mode === "orbit" && selectedDepartment) {
        const dept = departments.find((d) => d.id === selectedDepartment);
        if (dept) {
          const t = dept.position;
          const targetPos = new THREE.Vector3(t[0], 1.2, t[2]);
          const camDesired = new THREE.Vector3(t[0] + 14, 11 + dept.size[1] * 0.35, t[2] + 14);
          controls.current.target.lerp(targetPos, 1 - Math.exp(-delta * 1.8));
          camera.position.lerp(camDesired, 1 - Math.exp(-delta * 1.4));
          controls.current.update();
          return;
        }
      }
      const target = mode === "interior" ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(0, 2, 0);
      if (transition.current < 0.98) {
        const desired = START[mode];
        camera.position.lerp(desired, 1 - Math.exp(-delta * 3));
        controls.current.target.lerp(target, 1 - Math.exp(-delta * 4));
      }
      controls.current.update();
      return;
    }

    const rotateSpeed = 1.25;
    if (keys.current.has("ArrowLeft") || keys.current.has("KeyQ")) yaw.current += delta * rotateSpeed;
    if (keys.current.has("ArrowRight") || keys.current.has("KeyE")) yaw.current -= delta * rotateSpeed;
    const forward = new THREE.Vector3(Math.sin(yaw.current), 0, -Math.cos(yaw.current));
    const right = new THREE.Vector3(forward.z, 0, -forward.x);
    const velocity = new THREE.Vector3();
    if (keys.current.has("KeyW")) velocity.add(forward);
    if (keys.current.has("KeyS")) velocity.sub(forward);
    if (keys.current.has("KeyD")) velocity.add(right);
    if (keys.current.has("KeyA")) velocity.sub(right);
    if (mode === "drone") {
      if (keys.current.has("KeyR")) velocity.y += 1;
      if (keys.current.has("KeyF")) velocity.y -= 1;
    }
    if (velocity.lengthSq() > 0) velocity.normalize();
    const speed = mode === "drone" ? 14 : 6;
    player.current.addScaledVector(velocity, delta * speed);
    player.current.x = THREE.MathUtils.clamp(player.current.x, -66, 66);
    player.current.z = THREE.MathUtils.clamp(player.current.z, -58, 58);

    if (mode === "drone") {
      player.current.y = THREE.MathUtils.clamp(player.current.y, 5, 48);
      camera.position.lerp(player.current, 1 - Math.exp(-delta * 6));
      camera.lookAt(player.current.clone().add(forward.multiplyScalar(14)));
    } else if (mode === "walk") {
      const eye = player.current.clone().setY(1.75);
      camera.position.lerp(eye, 1 - Math.exp(-delta * 10));
      camera.lookAt(eye.clone().add(forward.multiplyScalar(8)));
    } else {
      const avatarPosition = player.current.clone().setY(0);
      if (avatar.current) {
        avatar.current.position.copy(avatarPosition);
        avatar.current.rotation.y = yaw.current;
      }
      const target = avatarPosition.clone().setY(1.15);
      const behind = target.clone().addScaledVector(forward, -5.2).add(new THREE.Vector3(0, 3.4, 0));
      camera.position.lerp(behind, 1 - Math.exp(-delta * 5));
      camera.lookAt(target.clone().addScaledVector(forward, 2.2));
    }
  });

  return (
    <>
      <OrbitControls
        ref={controls}
        enabled={!icuDemoActive && (mode === "orbit" || mode === "interior")}
        enableDamping
        dampingFactor={0.075}
        minDistance={mode === "interior" ? 6 : 15}
        maxDistance={mode === "interior" ? 32 : 105}
        maxPolarAngle={mode === "interior" ? Math.PI / 2.02 : Math.PI / 2.08}
        target={mode === "interior" ? [0, 1, 0] : [0, 2, 0]}
      />
      {mode === "third" && (
        <group ref={avatar}>
          <mesh position={[0, 1.55, 0]} castShadow><sphereGeometry args={[0.18, 14, 12]} /><meshStandardMaterial color="#9f725c" /></mesh>
          <mesh position={[0, 0.9, 0]} castShadow><capsuleGeometry args={[0.25, 0.72, 6, 12]} /><meshStandardMaterial color="#e7edef" roughness={0.72} /></mesh>
          <mesh position={[-0.14, 0.26, 0]} castShadow><capsuleGeometry args={[0.08, 0.45, 4, 8]} /><meshStandardMaterial color="#1c2b36" /></mesh>
          <mesh position={[0.14, 0.26, 0]} castShadow><capsuleGeometry args={[0.08, 0.45, 4, 8]} /><meshStandardMaterial color="#1c2b36" /></mesh>
        </group>
      )}
      {(mode === "walk" || mode === "third" || mode === "drone") && (
        <Html fullscreen zIndexRange={[2, 0]}>
          <div className="pointer-events-none absolute bottom-20 left-1/2 -translate-x-1/2 border border-white/10 bg-slate-950/75 px-3 py-1.5 font-mono text-[9px] tracking-wide text-slate-300 backdrop-blur">
            WASD MOVE&nbsp;&nbsp; Q/E OR ARROWS TURN {mode === "drone" ? "  R/F ALTITUDE" : ""}
          </div>
        </Html>
      )}
    </>
  );
}