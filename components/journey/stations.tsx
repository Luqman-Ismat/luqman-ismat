"use client";
/* eslint-disable react-hooks/immutability --
   three.js objects (materials, geometries, instance matrices) are mutated
   imperatively inside the render loop via useFrame. That is react-three-fiber's
   intended model; these React Compiler rules target React state and props. */
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { journey } from "@/lib/journey";
import type { StationId } from "@/lib/chapters";
import { FlatCard3D } from "@/components/ten21/flat-card-3d";
import {
  coreGeometry, gyroRing, scheduleBars, scheduleFrame, boxEdges, WEEK, ROW,
  integrationLayout, curvesGeometry, databaseGeometry, exchangerParts, tubesGeometry, tubeOffsets, EX,
  globeGeometry, latLon, HOUSTON, portalGeometry, plateGeometry, PLATE, type PlateKind,
} from "./geometry";

const damp = THREE.MathUtils.damp;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const ease = (v: number) => 1 - Math.pow(1 - clamp01(v), 3);
const hash = (n: number) => { const x = Math.sin(n * 12.9898) * 43758.5453; return x - Math.floor(x); };
type V3 = [number, number, number];

/* ---------- theme ---------- */
export type Palette = { ink: THREE.Color; signal: THREE.Color; paper: THREE.Color; card: THREE.Color; cold: THREE.Color; dark: boolean };
export function readPalette(): Palette {
  const css = getComputedStyle(document.documentElement);
  const hsl = (v: string) => new THREE.Color().setStyle(`hsl(${css.getPropertyValue(v).trim().split(/\s+/).join(", ")})`, THREE.SRGBColorSpace);
  return { ink: hsl("--foreground"), signal: hsl("--signal"), paper: hsl("--background"), card: hsl("--card"), cold: new THREE.Color("#3d7bd9"), dark: document.documentElement.classList.contains("dark") };
}
export function usePalette() {
  const [p, setP] = useState<Palette>(() => readPalette());
  useEffect(() => {
    const mo = new MutationObserver(() => setP(readPalette()));
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => mo.disconnect();
  }, []);
  return p;
}
export function useLineMaterial(color: THREE.Color, opacity = 1) {
  const m = useMemo(() => new THREE.LineBasicMaterial({ transparent: true, depthWrite: false }), []);
  useEffect(() => { m.color.copy(color); }, [m, color]);
  useEffect(() => () => m.dispose(), [m]);
  m.userData.base = opacity;
  return m;
}
const applyFade = (mats: THREE.Material[], f: number) => { for (const m of mats) m.opacity = (m.userData.base ?? 1) * f; };

/* What drives a station: visibility and how far it is exploded (0..1). */
export type Ctl = { fade: () => number; explode: () => number };
export type StationProps = { p: Palette; ctl: Ctl; label?: (part: string) => ReactNode };

/* Where each part ends up when exploded. Labels and chapter sections key off these ids. */
export const stationParts: Record<StationId, { id: string; at: V3; kind?: PlateKind }[]> = {
  core: [],
  schedule: [
    { id: "schedule", at: [-1.5, 0.35, 0.4] },
    { id: "capacity", at: [1.25, 1.45, -0.5], kind: "heatmap" },
    { id: "import", at: [2.05, 0.05, 0.2], kind: "import" },
    { id: "forecast", at: [1.35, -1.4, -0.3], kind: "forecast" },
    { id: "risk", at: [-1.2, -1.75, 0.5], kind: "risk" },
  ],
  network: [
    { id: "mapping", at: [-1.4, 0.2, 0.3] },
    { id: "cost", at: [1.3, 1.45, -0.4], kind: "bars" },
    { id: "productivity", at: [2.1, 0.0, 0.2], kind: "line" },
    { id: "quality", at: [1.3, -1.45, -0.3], kind: "scatter" },
    { id: "access", at: [-1.3, -1.8, 0.5], kind: "shield" },
  ],
  exchanger: [
    { id: "inspection", at: [0, 1.55, 0] },
    { id: "calculators", at: [0, -0.05, 0.6] },
  ],
  garment: [
    { id: "pashk-coat", at: [-3.0, 0, -0.5] },
    { id: "jig-kameez", at: [-1.0, 0, 0] },
    { id: "chin-shalwar", at: [1.0, 0, 0] },
    { id: "sadri", at: [3.0, 0, -0.5] },
  ],
  globe: [],
  portal: [],
};

/* A line-art panel that slides out of the station as it explodes. */
function Plate({ kind, at, ctl, p, delay, label, id }: { kind: PlateKind; at: V3; ctl: Ctl; p: Palette; delay: number; label?: (part: string) => ReactNode; id: string }) {
  const geo = useMemo(() => plateGeometry(kind), [kind]);
  const ink = useLineMaterial(p.ink, 0.85);
  const back = useMemo(() => new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false }), []);
  useEffect(() => { back.color.copy(p.card); }, [back, p.card]);
  useEffect(() => () => { geo.dispose(); back.dispose(); }, [geo, back]);
  const g = useRef<THREE.Group>(null);
  useFrame((state) => {
    const e = ease((ctl.explode() - delay) / (1 - delay));
    const grp = g.current!;
    grp.visible = e > 0.01;
    if (!grp.visible) return;
    grp.position.set(at[0] * e, at[1] * e, at[2] * e);
    grp.scale.setScalar(0.25 + 0.75 * e);
    grp.rotation.y = -at[0] * 0.08 + Math.sin(state.clock.elapsedTime * 0.6 + at[0]) * 0.03;
    const f = ctl.fade() * e;
    ink.opacity = 0.85 * f;
    back.opacity = 0.92 * f;
  });
  return (
    <group ref={g}>
      <mesh position={[0, 0, -0.01]}><planeGeometry args={[PLATE.w, PLATE.h]} /><primitive object={back} attach="material" /></mesh>
      <lineSegments geometry={geo} material={ink} />
      {label && <group position={[-PLATE.w / 2, PLATE.h / 2 + 0.16, 0]}>{label(id)}</group>}
    </group>
  );
}
function Plates({ station, ctl, p, label }: { station: StationId } & StationProps) {
  return (
    <>
      {stationParts[station].filter((x) => x.kind).map((x, i) => (
        <Plate key={x.id} id={x.id} kind={x.kind!} at={x.at} ctl={ctl} p={p} delay={0.08 + i * 0.07} label={label} />
      ))}
    </>
  );
}
/* Moves the station's main object toward its exploded anchor. */
function useMainMove(station: StationId, ctl: Ctl) {
  const ref = useRef<THREE.Group>(null);
  const main = stationParts[station].find((x) => !x.kind);
  useFrame(() => {
    if (!ref.current || !main) return;
    const e = ease(ctl.explode());
    ref.current.position.set(main.at[0] * e, main.at[1] * e, main.at[2] * e);
    ref.current.scale.setScalar(1 - 0.22 * e);
  });
  return { ref, main };
}

/* ---------- core ---------- */
export function CoreStation({ p, ctl }: StationProps) {
  const core = useMemo(() => coreGeometry(), []);
  const rings = useMemo(() => [gyroRing(1.7), gyroRing(2.15), gyroRing(2.6)], []);
  const ink = useLineMaterial(p.ink, 0.9), faint = useLineMaterial(p.ink, 0.35), sig = useLineMaterial(p.signal, 1);
  const r0 = useRef<THREE.LineSegments>(null), r1 = useRef<THREE.LineSegments>(null), r2 = useRef<THREE.LineSegments>(null);
  const c = useRef<THREE.LineSegments>(null), tilt = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    const t = performance.now() / 1000, e = ease(ctl.explode());
    applyFade([ink, faint, sig], ctl.fade());
    tilt.current!.rotation.x = damp(tilt.current!.rotation.x, journey.pointer.y * 0.25, 3, dt);
    tilt.current!.rotation.y = damp(tilt.current!.rotation.y, journey.pointer.x * 0.4, 3, dt);
    c.current!.rotation.y += dt * 0.25;
    c.current!.rotation.x = Math.sin(t * 0.3) * 0.3;
    r0.current!.rotation.x = t * 0.35; r0.current!.scale.setScalar(1 + e * 0.2);
    r1.current!.rotation.y = t * 0.28; r1.current!.scale.setScalar(1 + e * 0.45);
    r2.current!.rotation.x = Math.PI / 2 + Math.sin(t * 0.2) * 0.5; r2.current!.rotation.z = t * 0.18; r2.current!.scale.setScalar(1 + e * 0.7);
  });
  return (
    <group ref={tilt}>
      <lineSegments ref={c} geometry={core} material={ink} />
      <lineSegments ref={r0} geometry={rings[0]} material={sig} />
      <lineSegments ref={r1} geometry={rings[1]} material={faint} />
      <lineSegments ref={r2} geometry={rings[2]} material={faint} />
    </group>
  );
}

/* ---------- 01 schedule: a living Gantt; today sweeps across, the critical path lights up ---------- */
export function ScheduleStation({ p, ctl, label }: StationProps) {
  const frame = useMemo(() => scheduleFrame(), []);
  const edges = useMemo(() => scheduleBars.map((b) => boxEdges(b.len * WEEK, ROW * 0.56, 0.22)), []);
  const box = useMemo(() => new THREE.BoxGeometry(1, ROW * 0.56, 0.22), []);
  const grid = useLineMaterial(p.ink, 0.22), ink = useLineMaterial(p.ink, 0.85), today = useLineMaterial(p.signal, 1);
  const fills = useMemo(() => scheduleBars.map(() => new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false })), []);
  const todayGeo = useMemo(() => new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0.35, 0.2), new THREE.Vector3(0, -scheduleBars.length * ROW - 0.15, 0.2)]), []);
  const fillRefs = useRef<(THREE.Mesh | null)[]>([]);
  const todayRef = useRef<THREE.LineSegments>(null), spin = useRef<THREE.Group>(null);
  const { ref } = useMainMove("schedule", ctl);
  useEffect(() => () => fills.forEach((f) => f.dispose()), [fills]);
  const width = 15 * WEEK;
  useFrame(() => {
    const t = performance.now() / 1000, f = ctl.fade();
    applyFade([grid, ink, today], f);
    const weekNow = (t * 1.4) % 18;
    todayRef.current!.position.x = Math.min(weekNow, 15) * WEEK;
    const done = weekNow > 15.2;
    scheduleBars.forEach((b, i) => {
      const mesh = fillRefs.current[i];
      if (!mesh) return;
      const fill = Math.max(THREE.MathUtils.clamp((weekNow - b.start) / b.len, 0, 1), 0.001);
      mesh.scale.x = fill * b.len * WEEK;
      mesh.position.x = b.start * WEEK + (fill * b.len * WEEK) / 2;
      fills[i].color.copy(b.critical && done ? p.signal : p.ink);
      fills[i].opacity = (b.critical && done ? 0.85 : 0.28) * f;
    });
    spin.current!.rotation.y = -0.42 + journey.pointer.x * 0.12;
  });
  return (
    <>
      <group ref={ref}>
        <group ref={spin} rotation={[0.18, -0.42, 0.02]}>
          <group position={[-width / 2, (scheduleBars.length * ROW) / 2, 0]}>
            <lineSegments geometry={frame} material={grid} />
            {scheduleBars.map((b, i) => (
              <group key={i}>
                <lineSegments geometry={edges[i]} material={ink} position={[b.start * WEEK + (b.len * WEEK) / 2, -b.row * ROW - ROW / 2, 0]} />
                <mesh ref={(m) => { fillRefs.current[i] = m; }} geometry={box} material={fills[i]} position={[b.start * WEEK, -b.row * ROW - ROW / 2, 0]} />
              </group>
            ))}
            <lineSegments ref={todayRef} geometry={todayGeo} material={today} />
          </group>
          {label && <group position={[-width / 2, (scheduleBars.length * ROW) / 2 + 0.35, 0]}>{label("schedule")}</group>}
        </group>
      </group>
      <Plates station="schedule" p={p} ctl={ctl} label={label} />
    </>
  );
}

/* ---------- 02 network: records pulse along routes into the database ---------- */
export function NetworkStation({ p, ctl, label }: StationProps) {
  const { nodes, db, curves } = useMemo(() => integrationLayout(), []);
  const routes = useMemo(() => curvesGeometry(curves), [curves]);
  const dbGeo = useMemo(() => databaseGeometry(), []);
  const node = useMemo(() => new THREE.EdgesGeometry(new THREE.OctahedronGeometry(0.13)), []);
  const faint = useLineMaterial(p.ink, 0.25), ink = useLineMaterial(p.ink, 0.9), dbMat = useLineMaterial(p.ink, 0.9);
  const PULSES = 44;
  const pulseMat = useMemo(() => new THREE.MeshBasicMaterial({ transparent: true }), []);
  useEffect(() => { pulseMat.color.copy(p.signal); pulseMat.userData.base = 1; }, [pulseMat, p.signal]);
  const pulses = useRef<THREE.InstancedMesh>(null), spin = useRef<THREE.Group>(null);
  const seeds = useMemo(() => Array.from({ length: PULSES }, (_, i) => ({ curve: i % curves.length, t: (i * 0.137) % 1 })), [curves.length]);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const { ref } = useMainMove("network", ctl);
  useFrame((_, dt) => {
    const t = performance.now() / 1000;
    applyFade([faint, ink, dbMat, pulseMat], ctl.fade());
    const beat = 0.5 + 0.5 * Math.sin(t * 0.8);
    seeds.forEach((s, i) => {
      s.t = (s.t + dt * (0.18 + beat * 0.35) * (0.7 + (i % 5) * 0.12)) % 1;
      dummy.position.copy(curves[s.curve].getPointAt(s.t));
      dummy.scale.setScalar(0.6 + Math.sin(s.t * Math.PI) * 0.6);
      dummy.updateMatrix();
      pulses.current!.setMatrixAt(i, dummy.matrix);
    });
    pulses.current!.instanceMatrix.needsUpdate = true;
    dbMat.color.copy(p.ink).lerp(p.signal, beat * 0.6);
    spin.current!.rotation.y = Math.sin(t * 0.15) * 0.35 + journey.pointer.x * 0.2;
  });
  return (
    <>
      <group ref={ref}>
        <group ref={spin} scale={0.82}>
          <lineSegments geometry={routes} material={faint} />
          {nodes.map((n, i) => <lineSegments key={i} geometry={node} material={ink} position={n} />)}
          <lineSegments geometry={dbGeo} material={dbMat} position={db} />
          <instancedMesh ref={pulses} args={[undefined, undefined, PULSES]} material={pulseMat}>
            <sphereGeometry args={[0.045, 10, 10]} />
          </instancedMesh>
          {label && <group position={[-2.6, 1.7, 0]}>{label("mapping")}</group>}
        </group>
      </group>
      <Plates station="network" p={p} ctl={ctl} label={label} />
    </>
  );
}

/* ---------- 03 exchanger: counter-current flow; explodes into its sub-assemblies ---------- */
export function ExchangerStation({ p, ctl, label }: StationProps) {
  const parts = useMemo(() => exchangerParts(), []);
  const tubes = useMemo(() => tubesGeometry(), []);
  const ink = useLineMaterial(p.ink, 0.85), faint = useLineMaterial(p.ink, 0.22), sig = useLineMaterial(p.signal, 0.9);
  const N = 900;
  const flow = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(new Float32Array(N * 3), 3));
    g.setAttribute("color", new THREE.Float32BufferAttribute(new Float32Array(N * 3), 3));
    return g;
  }, []);
  const seeds = useMemo(() => Array.from({ length: N }, (_, i) => ({ tube: i < N * 0.6, k: i % tubeOffsets.length, t: hash(i), a: hash(i + 7919) * Math.PI * 2, r: 0.15 + hash(i + 104729) * 0.4 })), []);
  const pointsMat = useMemo(() => new THREE.PointsMaterial({ size: 0.045, vertexColors: true, transparent: true, depthWrite: false }), []);
  pointsMat.userData.base = 1;
  const g = useRef<THREE.Group>(null), shell = useRef<THREE.Group>(null), headL = useRef<THREE.Group>(null), headR = useRef<THREE.Group>(null), sad = useRef<THREE.Group>(null), sheetL = useRef<THREE.Group>(null), sheetR = useRef<THREE.Group>(null);
  const c = useMemo(() => new THREE.Color(), []);
  useFrame((_, dt) => {
    const t = performance.now() / 1000, e = ease(ctl.explode());
    applyFade([ink, faint, sig, pointsMat], ctl.fade());
    shell.current!.position.y = 1.2 * e;
    headL.current!.position.x = -1.0 * e; headR.current!.position.x = 1.0 * e;
    sheetL.current!.position.x = -0.45 * e; sheetR.current!.position.x = 0.45 * e;
    sad.current!.position.y = -0.6 * e;
    const pos = flow.attributes.position.array as Float32Array, col = flow.attributes.color.array as Float32Array;
    const L = EX.length, speed = 0.12 + 0.1 * Math.sin(t * 0.5);
    seeds.forEach((s, i) => {
      s.t = (s.t + dt * speed * (s.tube ? 1 : 0.6)) % 1;
      let x, y, z;
      if (s.tube) {
        const [ty, tz] = tubeOffsets[s.k];
        x = -L / 2 + s.t * L; y = ty; z = tz;
        c.copy(p.signal).lerp(p.cold, s.t);
      } else {
        x = L / 2 - s.t * L;
        y = Math.cos(s.a) * s.r * 0.9 + Math.sin(s.t * Math.PI * 6) * 0.18 + 1.2 * e; z = Math.sin(s.a + s.t * 4) * s.r;
        c.copy(p.cold).lerp(p.signal, s.t * 0.85);
      }
      pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = z;
      col[i * 3] = c.r * 0.8; col[i * 3 + 1] = c.g * 0.8; col[i * 3 + 2] = c.b * 0.8;
    });
    flow.attributes.position.needsUpdate = true;
    flow.attributes.color.needsUpdate = true;
    g.current!.rotation.y = -0.55 + journey.spin + Math.sin(t * 0.2) * 0.1 + journey.pointer.x * 0.15;
    g.current!.rotation.x = 0.22 + journey.pointer.y * 0.08 - e * 0.1;
  });
  return (
    <group ref={g} scale={0.8}>
      <group ref={shell}>
        <lineSegments geometry={parts.shell} material={ink} />
        <lineSegments geometry={parts.nozzles} material={ink} />
        {label && <group position={[-EX.length / 2, EX.shellR + 0.35, 0]}>{label("inspection")}</group>}
      </group>
      <group ref={headL}><lineSegments geometry={parts.heads} material={ink} /></group>
      <group ref={headR} scale={[-1, 1, 1]}><lineSegments geometry={parts.heads} material={faint} /></group>
      <group ref={sheetL}><lineSegments geometry={parts.sheets} material={sig} /></group>
      <group ref={sheetR} scale={[-1, 1, 1]}><lineSegments geometry={parts.sheets} material={sig} /></group>
      <lineSegments geometry={tubes} material={faint} />
      <lineSegments geometry={parts.baffles} material={ink} />
      <group ref={sad}><lineSegments geometry={parts.saddles} material={ink} /></group>
      <points geometry={flow} material={pointsMat} />
      {label && <group position={[-EX.length / 2, -EX.shellR - 0.25, 0.6]}>{label("calculators")}</group>}
    </group>
  );
}

/* ---------- 04 TEN21: the collection's flats fan out of one drawing ---------- */
export function GarmentStation({ p, ctl, label }: StationProps) {
  const parts = stationParts.garment;
  const refs = useRef<(THREE.Group | null)[]>([]);
  const g = useRef<THREE.Group>(null);
  const opacity = useRef({ v: 1 });
  useFrame(() => {
    const t = performance.now() / 1000, e = ease(ctl.explode());
    opacity.current.v = ctl.fade();
    parts.forEach((part, i) => {
      const r = refs.current[i];
      if (!r) return;
      const stack = (i - 1.5) * 0.04;
      r.position.set(part.at[0] * e + stack, Math.sin(t * 0.8 + i) * 0.04, part.at[2] * e - i * 0.02 * (1 - e));
      r.rotation.y = -part.at[0] * 0.09 * e;
      r.visible = e > 0.02 || i === 0;
    });
    g.current!.rotation.y = -0.2 * (1 - e) + journey.pointer.x * 0.12;
    g.current!.rotation.x = journey.pointer.y * 0.05;
  });
  return (
    <group ref={g}>
      {parts.map((part, i) => (
        <group key={part.id} ref={(r) => { refs.current[i] = r; }}>
          <FlatCard3D slug={part.id} p={p} fade={opacity} height={i === 0 ? 3.3 : 3.0} />
          {label && <group position={[-0.9, 1.85, 0.02]}>{label(part.id)}</group>}
        </group>
      ))}
    </group>
  );
}

/* ---------- 05 globe ---------- */
export function GlobeStation({ p, ctl }: StationProps) {
  const globe = useMemo(() => globeGeometry(1.7), []);
  const pin = useMemo(() => latLon(HOUSTON.lat, HOUSTON.lon, 1.7), []);
  const pinGeo = useMemo(() => new THREE.BufferGeometry().setFromPoints([pin, pin.clone().multiplyScalar(1.35)]), [pin]);
  const halo = useMemo(() => gyroRing(0.16), []);
  const faint = useLineMaterial(p.ink, 0.35), sig = useLineMaterial(p.signal, 1), pulse = useLineMaterial(p.signal, 1);
  const g = useRef<THREE.Group>(null), haloRef = useRef<THREE.LineSegments>(null);
  const face = Math.atan2(pin.x, pin.z);
  useFrame(() => {
    const t = performance.now() / 1000, f = ctl.fade();
    applyFade([faint, sig], f);
    g.current!.rotation.y = -face + 0.35 + Math.sin(t * 0.25) * 0.4 + journey.pointer.x * 0.2;
    g.current!.scale.setScalar(1 + ease(ctl.explode()) * 0.15);
    haloRef.current!.scale.setScalar(1 + (t % 1.6) * 0.9);
    pulse.opacity = f * (1 - (t % 1.6) / 1.7);
  });
  return (
    <group ref={g} rotation={[0.35, 0, 0]}>
      <lineSegments geometry={globe} material={faint} />
      <lineSegments geometry={pinGeo} material={sig} />
      <lineSegments ref={haloRef} geometry={halo} material={pulse} position={pin.clone().multiplyScalar(1.01)} onUpdate={(self) => self.lookAt(0, 0, 0)} />
    </group>
  );
}

/* ---------- 06 portal ---------- */
export function PortalStation({ p, ctl }: StationProps) {
  const portal = useMemo(() => portalGeometry(), []);
  const core = useMemo(() => new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(0.42, 1)), []);
  const ink = useLineMaterial(p.ink, 0.7), sig = useLineMaterial(p.signal, 1);
  const g = useRef<THREE.Group>(null), c = useRef<THREE.LineSegments>(null);
  useFrame((_, dt) => {
    applyFade([ink, sig], ctl.fade());
    g.current!.rotation.z += dt * 0.12;
    g.current!.scale.set(1, 1, 1 + ease(ctl.explode()) * 4);
    c.current!.rotation.y += dt * 0.6;
    c.current!.rotation.x += dt * 0.3;
  });
  return (
    <group scale={0.62}>
      <group ref={g} rotation={[0, -0.3, 0]}><lineSegments geometry={portal} material={ink} /></group>
      <lineSegments ref={c} geometry={core} material={sig} />
    </group>
  );
}

export const stationComponents: Record<StationId, (props: StationProps) => ReactNode> = {
  core: CoreStation,
  schedule: ScheduleStation,
  network: NetworkStation,
  exchanger: ExchangerStation,
  garment: GarmentStation,
  globe: GlobeStation,
  portal: PortalStation,
};
