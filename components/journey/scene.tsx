"use client";
/* eslint-disable react-hooks/immutability -- camera and fog are mutated in the render loop */
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { journey } from "@/lib/journey";
import { chapters } from "@/lib/chapters";
import { stationComponents, usePalette, useLineMaterial, type Ctl } from "./stations";
import { gridGeometry } from "./geometry";

export const SPACING = 16;
const damp = THREE.MathUtils.damp;
const fadeFor = (i: number) => THREE.MathUtils.clamp(1.3 - Math.abs(journey.position - i) * 1.15, 0, 1);

/* Places a station on the path and hides it when far away. */
function Placed({ index, offset, children }: { index: number; offset: THREE.Vector3; children: React.ReactNode }) {
  const g = useRef<THREE.Group>(null);
  useFrame(() => {
    const f = fadeFor(index);
    if (!g.current) return;
    g.current.visible = f > 0.001 || journey.explode[index] > 0;
    g.current.scale.setScalar(0.86 + f * 0.14);
  });
  return <group ref={g} position={[offset.x, offset.y, -index * SPACING + offset.z]}>{children}</group>;
}

function Rig({ offset, reduced, mobile }: { offset: THREE.Vector3; reduced: boolean; mobile: boolean }) {
  const { camera } = useThree();
  const look = useRef(new THREE.Vector3());
  const target = useMemo(() => new THREE.Vector3(), []);
  useFrame((_, dt) => {
    const pos = journey.focus >= 0 ? journey.focus : journey.position;
    const z = -pos * SPACING;
    const focus = journey.focus >= 0 ? 1 : 0;
    const ex = journey.focus >= 0 ? journey.explode[journey.focus] : 0;
    target.set(
      offset.x * (0.22 + 0.78 * ex) + journey.pointer.x * 0.35,
      (mobile ? 0 : offset.y * 0.5) + 0.35 - journey.pointer.y * 0.2,
      z + (mobile ? 9.4 : 7.6) + focus * ex * 1.6,
    );
    const lam = reduced ? 1000 : 4.5;
    camera.position.x = damp(camera.position.x, target.x, lam, dt);
    camera.position.y = damp(camera.position.y, target.y, lam, dt);
    camera.position.z = damp(camera.position.z, target.z, lam, dt);
    look.current.set(offset.x * (0.62 + 0.38 * ex), mobile ? offset.y * 0.05 : offset.y * 0.75, z);
    camera.lookAt(look.current);
  });
  return null;
}

function World({ reduced }: { reduced: boolean }) {
  const p = usePalette();
  const { size, scene } = useThree();
  const mobile = size.width < 760;
  const offset = useMemo(() => (mobile ? new THREE.Vector3(-0.2, 2.3, -1) : new THREE.Vector3(2.7, 0, 0)), [mobile]);
  const grid = useMemo(() => gridGeometry(chapters.length * SPACING + 10, 60, 1.2), []);
  const gridMat = useLineMaterial(p.ink, 0.1);
  useEffect(() => {
    gridMat.opacity = 0.1;
    scene.fog = new THREE.Fog(p.paper, 7, 26);
    scene.background = null;
  }, [scene, p.paper, gridMat]);
  const ctls: Ctl[] = useMemo(() => chapters.map((_, i) => ({ fade: () => Math.max(fadeFor(i), journey.focus === i ? 1 : 0), explode: () => journey.explode[i] })), []);
  return (
    <>
      <Rig offset={offset} reduced={reduced} mobile={mobile} />
      <lineSegments geometry={grid} material={gridMat} position={[0, -2.6, 0]} />
      {chapters.map((c, i) => {
        const Station = stationComponents[c.station];
        return (
          <Placed key={c.id} index={i} offset={offset}>
            <Station p={p} ctl={ctls[i]} />
          </Placed>
        );
      })}
    </>
  );
}

export default function JourneyScene() {
  const reduced = typeof window !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;
  return (
    <Canvas className="journey-canvas" dpr={[1, 1.6]} camera={{ fov: 42, position: [0, 0.4, 7.6], near: 0.1, far: 60 }} gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}>
      <World reduced={reduced} />
    </Canvas>
  );
}
