"use client";
/* eslint-disable react-hooks/immutability -- camera is driven from the render loop */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { animate } from "animejs";
import { journey } from "@/lib/journey";
import type { StationId } from "@/lib/chapters";
import { stationComponents, usePalette, type Ctl } from "@/components/journey/stations";

type Part = { id: string; n: string; title: string };
const framing: Record<StationId, { z: number; y: number }> = {
  core: { z: 8, y: 0 }, schedule: { z: 8.6, y: -0.1 }, network: { z: 10.2, y: -0.1 }, exchanger: { z: 6.6, y: 0.4 },
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

type Anchors = Map<string, THREE.Object3D>;
type Tags = Map<string, HTMLAnchorElement>;
const tmp = new THREE.Vector3();
const widths = new WeakMap<HTMLElement, number>();

function World({ station, anchors, tags }: { station: StationId; anchors: Anchors; tags: Tags }) {
  const p = usePalette();
  const e = useRef({ v: 0.35 });
  const { camera, size } = useThree();
  useEffect(() => {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) { e.current.v = 1; return; }
    const a = animate(e.current, { v: 1, duration: 1500, ease: "outExpo" });
    return () => { a.pause(); };
  }, []);
  const ctl: Ctl = useMemo(() => ({ fade: () => 1, explode: () => e.current.v }), []);
  const Station = stationComponents[station];
  // a label is an empty anchor in the scene; the DOM tag follows it on screen
  const label = useCallback((id: string) => (
    <group ref={(o) => { if (o) anchors.set(id, o); else anchors.delete(id); }} />
  ), [anchors]);
  // after the station has moved this frame, project each anchor to the screen
  useFrame(() => {
    for (const [id, el] of tags) {
      const o = anchors.get(id);
      if (!o) { el.style.visibility = "hidden"; continue; }
      o.getWorldPosition(tmp).project(camera);
      const w = (widths.get(el) ?? widths.set(el, el.offsetWidth).get(el)!) / 2 + 8;
      const x = Math.min(size.width - w, Math.max(w, (tmp.x + 1) / 2 * size.width));
      const y = Math.max(44, (1 - tmp.y) / 2 * size.height);
      el.style.visibility = tmp.z > 1 ? "hidden" : "";
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -150%)`;
    }
  });
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
  // plain DOM tags positioned from the scene each frame (no per-label React roots)
  const anchors = useMemo<Anchors>(() => new Map(), []);
  const tags = useMemo<Tags>(() => new Map(), []);
  return (
    <>
      <Canvas className="explode-canvas" frameloop={active ? "always" : "never"} dpr={[1, 1.6]} camera={{ fov: 40, position: [0, 0.3, framing[station].z * 0.8], near: 0.1, far: 60 }} gl={{ antialias: true, alpha: true }}>
        <World station={station} anchors={anchors} tags={tags} />
      </Canvas>
      <div className={labels ? "part-tags is-on" : "part-tags"}>
        {parts.map((part) => (
          <a
            key={part.id}
            ref={(el) => { if (el) tags.set(part.id, el); else tags.delete(part.id); }}
            href={`#${part.id}`}
            className="part-tag"
            style={{ visibility: "hidden" }}
          >
            <b>{part.n}</b>{part.title}
          </a>
        ))}
      </div>
    </>
  );
}
