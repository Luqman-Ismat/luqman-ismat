"use client";
/* eslint-disable react-hooks/immutability -- camera is driven from the render loop */
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { animate } from "animejs";
import { journey } from "@/lib/journey";
import type { StationId } from "@/lib/chapters";
import { stationComponents, usePalette, type Ctl } from "@/components/journey/stations";
import { scrollToTarget } from "@/lib/scroll";

type Part = { id: string; n: string; title: string };
const framing: Record<StationId, { z: number; y: number }> = {
  core: { z: 8, y: 0 }, schedule: { z: 8.6, y: -0.1 }, network: { z: 8.6, y: -0.1 }, exchanger: { z: 6.6, y: 0.4 },
  garment: { z: 13.5, y: 0 }, globe: { z: 7, y: 0 }, portal: { z: 7, y: 0 },
};

function Rig({ station }: { station: StationId }) {
  const { camera, size } = useThree();
  const f = framing[station];
  useFrame((_, dt) => {
    const narrow = size.width < 760 ? 1.55 : 1;
    const tx = journey.pointer.x * 0.5, ty = f.y + 0.25 - journey.pointer.y * 0.3, tz = f.z * narrow;
    camera.position.x = THREE.MathUtils.damp(camera.position.x, tx, 3, dt);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, ty, 3, dt);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, tz, 3, dt);
    camera.lookAt(0, f.y, 0);
  });
  return null;
}

function World({ station, parts, labels }: { station: StationId; parts: Part[]; labels: boolean }) {
  const p = usePalette();
  const e = useRef({ v: 0.35 });
  useEffect(() => {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) { e.current.v = 1; return; }
    const a = animate(e.current, { v: 1, duration: 1500, ease: "outExpo" });
    return () => { a.pause(); };
  }, []);
  const ctl: Ctl = useMemo(() => ({ fade: () => 1, explode: () => e.current.v }), []);
  const Station = stationComponents[station];
  const label = (id: string) => {
    const part = parts.find((x) => x.id === id);
    if (!part) return null;
    return (
      <Html zIndexRange={[20, 0]} className={labels ? "part-tag-wrap is-on" : "part-tag-wrap"}>
        <a href={`#${id}`} className="part-tag" onClick={(ev) => { ev.preventDefault(); const el = document.getElementById(id); if (el) scrollToTarget(el); }}>
          <b>{part.n}</b>{part.title}
        </a>
      </Html>
    );
  };
  return (
    <>
      <Rig station={station} />
      <Station p={p} ctl={ctl} label={label} />
    </>
  );
}

/* The chapter's station, exploded into the components listed on the page.
   Every label is a link to that component. */
export default function ExplodeStage({ station, parts, active = true }: { station: StationId; parts: Part[]; active?: boolean }) {
  const [labels, setLabels] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setLabels(true), 700);
    const move = (ev: PointerEvent) => {
      journey.pointer.x = (ev.clientX / innerWidth) * 2 - 1;
      journey.pointer.y = (ev.clientY / innerHeight) * 2 - 1;
    };
    addEventListener("pointermove", move, { passive: true });
    return () => { clearTimeout(t); removeEventListener("pointermove", move); journey.pointer.x = 0; journey.pointer.y = 0; };
  }, []);
  return (
    <Canvas className="explode-canvas" frameloop={active ? "always" : "never"} dpr={[1, 1.6]} camera={{ fov: 40, position: [0, 0.3, framing[station].z * 0.8], near: 0.1, far: 60 }} gl={{ antialias: true, alpha: true }}>
      <World station={station} parts={parts} labels={labels} />
    </Canvas>
  );
}
