"use client";
/* eslint-disable react-hooks/immutability, react-hooks/refs --
   three.js objects (materials, geometries, instance matrices) are mutated
   imperatively inside the render loop via useFrame. That is react-three-fiber's
   intended model; these React Compiler rules target React state and props. */
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { journey } from "@/lib/journey";
import { GarmentMesh } from "@/components/indus/garment-3d";
import { colourwayById } from "@/lib/indus/collection";
import {
  gridGeometry, coreGeometry, gyroRing, scheduleBars, scheduleFrame, boxEdges, WEEK, ROW,
  integrationLayout, curvesGeometry, databaseGeometry, exchangerGeometry, tubesGeometry, tubeOffsets, EX,
  globeGeometry, latLon, HOUSTON, portalGeometry,
} from "./geometry";

export const SPACING = 16;
const STATIONS = 7;
const damp = THREE.MathUtils.damp;
/* Deterministic 0..1 noise so particle seeds are stable between renders. */
const hash = (n: number) => { const x = Math.sin(n * 12.9898) * 43758.5453; return x - Math.floor(x); };

/* ---------- theme ---------- */
type Palette = { ink: THREE.Color; signal: THREE.Color; paper: THREE.Color; cold: THREE.Color };
function readPalette(): Palette {
  const css = getComputedStyle(document.documentElement);
  const hsl = (v: string) => new THREE.Color().setStyle(`hsl(${css.getPropertyValue(v).trim().split(/\s+/).join(", ")})`, THREE.SRGBColorSpace);
  return { ink: hsl("--foreground"), signal: hsl("--signal"), paper: hsl("--background"), cold: new THREE.Color("#3d7bd9") };
}
function usePalette() {
  const [p, setP] = useState<Palette>(() => readPalette());
  useEffect(() => {
    const mo = new MutationObserver(() => setP(readPalette()));
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => mo.disconnect();
  }, []);
  return p;
}

/* Fade for station i given the continuous journey position. */
const fadeFor = (i: number) => THREE.MathUtils.clamp(1.3 - Math.abs(journey.position - i) * 1.15, 0, 1);

function useLineMaterial(color: THREE.Color, opacity = 1) {
  const m = useMemo(() => new THREE.LineBasicMaterial({ transparent: true, depthWrite: false }), []);
  useEffect(() => { m.color.copy(color); }, [m, color]);
  useEffect(() => () => m.dispose(), [m]);
  m.userData.base = opacity;
  return m;
}

/* A station group: positioned on the path, faded and hidden by distance. */
function Station({ index, offset, children, materials, onFrame }: { index: number; offset: THREE.Vector3; children: ReactNode; materials: THREE.Material[]; onFrame?: (fade: number, dt: number, t: number) => void }) {
  const g = useRef<THREE.Group>(null);
  useFrame((state, dt) => {
    const fade = fadeFor(index);
    if (!g.current) return;
    g.current.visible = fade > 0.001;
    if (!g.current.visible) return;
    for (const m of materials) m.opacity = (m.userData.base ?? 1) * fade;
    const s = 0.86 + fade * 0.14;
    g.current.scale.setScalar(s);
    onFrame?.(fade, dt, state.clock.elapsedTime);
  });
  return (
    <group ref={g} position={[offset.x, offset.y, -index * SPACING + offset.z]}>
      {children}
    </group>
  );
}

/* ---------- 00 intro: gyroscope core ---------- */
function Core({ p, offset }: { p: Palette; offset: THREE.Vector3 }) {
  const core = useMemo(() => coreGeometry(), []);
  const rings = useMemo(() => [gyroRing(1.7), gyroRing(2.15), gyroRing(2.6)], []);
  const ink = useLineMaterial(p.ink, 0.9), faint = useLineMaterial(p.ink, 0.35), sig = useLineMaterial(p.signal, 1);
  const refs = [useRef<THREE.LineSegments>(null), useRef<THREE.LineSegments>(null), useRef<THREE.LineSegments>(null)];
  const coreRef = useRef<THREE.LineSegments>(null);
  const tilt = useRef<THREE.Group>(null);
  return (
    <Station index={0} offset={offset} materials={[ink, faint, sig]} onFrame={(_, dt, t) => {
      tilt.current!.rotation.x = damp(tilt.current!.rotation.x, journey.pointer.y * 0.25, 3, dt);
      tilt.current!.rotation.y = damp(tilt.current!.rotation.y, journey.pointer.x * 0.4, 3, dt);
      coreRef.current!.rotation.y += dt * 0.25;
      coreRef.current!.rotation.x = Math.sin(t * 0.3) * 0.3;
      refs[0].current!.rotation.x = t * 0.35;
      refs[1].current!.rotation.y = t * 0.28;
      refs[2].current!.rotation.x = Math.PI / 2 + Math.sin(t * 0.2) * 0.5;
      refs[2].current!.rotation.z = t * 0.18;
    }}>
      <group ref={tilt}>
        <lineSegments ref={coreRef} geometry={core} material={ink} />
        <lineSegments ref={refs[0]} geometry={rings[0]} material={sig} />
        <lineSegments ref={refs[1]} geometry={rings[1]} material={faint} />
        <lineSegments ref={refs[2]} geometry={rings[2]} material={faint} />
      </group>
    </Station>
  );
}

/* ---------- 01 project controls: 3D schedule ---------- */
function Schedule({ p, offset }: { p: Palette; offset: THREE.Vector3 }) {
  const frame = useMemo(() => scheduleFrame(), []);
  const edges = useMemo(() => scheduleBars.map((b) => boxEdges(b.len * WEEK, ROW * 0.56, 0.22)), []);
  const box = useMemo(() => new THREE.BoxGeometry(1, ROW * 0.56, 0.22), []);
  const grid = useLineMaterial(p.ink, 0.22), ink = useLineMaterial(p.ink, 0.85);
  const fills = useMemo(() => scheduleBars.map(() => new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false })), []);
  const today = useLineMaterial(p.signal, 1);
  const todayGeo = useMemo(() => new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0.35, 0.2), new THREE.Vector3(0, -scheduleBars.length * ROW - 0.15, 0.2)]), []);
  const fillRefs = useRef<(THREE.Mesh | null)[]>([]);
  const todayRef = useRef<THREE.LineSegments>(null);
  const grow = useRef(0);
  useEffect(() => () => fills.forEach((f) => f.dispose()), [fills]);
  const width = 15 * WEEK;
  return (
    <Station index={1} offset={offset} materials={[grid, ink, today, ...fills]} onFrame={(fade, dt) => {
      grow.current = damp(grow.current, fade > 0.5 ? 1 : 0, 3, dt);
      const hold = journey.hold.controls ?? 0;
      const weekNow = hold * 15;
      todayRef.current!.position.x = weekNow * WEEK;
      todayRef.current!.visible = hold > 0.01;
      scheduleBars.forEach((b, i) => {
        const mesh = fillRefs.current[i];
        if (!mesh) return;
        const done = THREE.MathUtils.clamp((weekNow - b.start) / b.len, 0, 1);
        const shown = Math.max(0.02, Math.min(grow.current * 1.2 - i * 0.08, 1)) ;
        const fill = Math.max(done, 0.001) * shown;
        mesh.scale.x = fill * b.len * WEEK;
        mesh.position.x = b.start * WEEK + (fill * b.len * WEEK) / 2;
        const mat = fills[i];
        mat.color.copy(b.critical && hold > 0.98 ? p.signal : p.ink);
        mat.userData.base = b.critical && hold > 0.98 ? 0.85 : 0.28;
      });
    }}>
      <group scale={0.88} position={[0.35, 0, 0]}>
      <group rotation={[0.18, -0.42, 0.02]} position={[-width / 2, (scheduleBars.length * ROW) / 2, 0]}>
        <lineSegments geometry={frame} material={grid} />
        {scheduleBars.map((b, i) => (
          <group key={i}>
            <lineSegments geometry={edges[i]} material={ink} position={[b.start * WEEK + (b.len * WEEK) / 2, -b.row * ROW - ROW / 2, 0]} />
            <mesh ref={(m) => { fillRefs.current[i] = m; }} geometry={box} material={fills[i]} position={[b.start * WEEK, -b.row * ROW - ROW / 2, 0]} />
          </group>
        ))}
        <lineSegments ref={todayRef} geometry={todayGeo} material={today} />
      </group>
      </group>
    </Station>
  );
}

/* ---------- 02 integrations: records flowing into a database ---------- */
function Network({ p, offset }: { p: Palette; offset: THREE.Vector3 }) {
  const { nodes, db, curves } = useMemo(() => integrationLayout(), []);
  const routes = useMemo(() => curvesGeometry(curves), [curves]);
  const dbGeo = useMemo(() => databaseGeometry(), []);
  const node = useMemo(() => new THREE.EdgesGeometry(new THREE.OctahedronGeometry(0.13)), []);
  const faint = useLineMaterial(p.ink, 0.25), ink = useLineMaterial(p.ink, 0.9), dbMat = useLineMaterial(p.ink, 0.9);
  const PULSES = 44;
  const pulseMat = useMemo(() => new THREE.MeshBasicMaterial({ transparent: true }), []);
  useEffect(() => { pulseMat.color.copy(p.signal); }, [pulseMat, p.signal]);
  const pulses = useRef<THREE.InstancedMesh>(null);
  const seeds = useMemo(() => Array.from({ length: PULSES }, (_, i) => ({ curve: i % curves.length, t: (i * 0.137) % 1 })), [curves.length]);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const spin = useRef<THREE.Group>(null);
  return (
    <Station index={2} offset={offset} materials={[faint, ink, dbMat, pulseMat]} onFrame={(_, dt, t) => {
      const hold = journey.hold.integrations ?? 0;
      const speed = 0.08 + hold * 0.9;
      seeds.forEach((s, i) => {
        s.t = (s.t + dt * speed * (0.7 + (i % 5) * 0.12)) % 1;
        dummy.position.copy(curves[s.curve].getPointAt(s.t));
        dummy.scale.setScalar(0.6 + Math.sin(s.t * Math.PI) * 0.6);
        dummy.updateMatrix();
        pulses.current!.setMatrixAt(i, dummy.matrix);
      });
      pulses.current!.instanceMatrix.needsUpdate = true;
      dbMat.color.copy(p.ink).lerp(p.signal, hold);
      spin.current!.rotation.y = Math.sin(t * 0.15) * 0.35 + journey.pointer.x * 0.2;
    }}>
      <group ref={spin} scale={0.78} position={[1.15, 0, 0]}>
        <lineSegments geometry={routes} material={faint} />
        {nodes.map((n, i) => <lineSegments key={i} geometry={node} material={ink} position={n} />)}
        <lineSegments geometry={dbGeo} material={dbMat} position={db} />
        <instancedMesh ref={pulses} args={[undefined, undefined, PULSES]} material={pulseMat}>
          <sphereGeometry args={[0.045, 10, 10]} />
        </instancedMesh>
      </group>
    </Station>
  );
}

/* ---------- 03 engineering: shell-and-tube exchanger, counter-current ---------- */
function Exchanger({ p, offset }: { p: Palette; offset: THREE.Vector3 }) {
  const shell = useMemo(() => exchangerGeometry(), []);
  const tubes = useMemo(() => tubesGeometry(), []);
  const ink = useLineMaterial(p.ink, 0.85), faint = useLineMaterial(p.ink, 0.22);
  const N = 900;
  const flow = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(new Float32Array(N * 3), 3));
    g.setAttribute("color", new THREE.Float32BufferAttribute(new Float32Array(N * 3), 3));
    return g;
  }, []);
  const seeds = useMemo(() => Array.from({ length: N }, (_, i) => ({ tube: i < N * 0.6, k: i % tubeOffsets.length, t: hash(i), a: hash(i + 7919) * Math.PI * 2, r: 0.15 + hash(i + 104729) * 0.4 })), []);
  const pointsMat = useMemo(() => new THREE.PointsMaterial({ size: 0.045, vertexColors: true, transparent: true, depthWrite: false }), []);
  const g = useRef<THREE.Group>(null);
  const c = useMemo(() => new THREE.Color(), []);
  return (
    <Station index={3} offset={offset} materials={[ink, faint, pointsMat]} onFrame={(_, dt, t) => {
      const hold = journey.hold.engineering ?? 0;
      const speed = 0.04 + hold * 0.55;
      const pos = flow.attributes.position.array as Float32Array;
      const col = flow.attributes.color.array as Float32Array;
      const L = EX.length;
      seeds.forEach((s, i) => {
        s.t = (s.t + dt * speed * (s.tube ? 1 : 0.6)) % 1;
        let x, y, z;
        if (s.tube) {
          const [ty, tz] = tubeOffsets[s.k];
          x = -L / 2 + s.t * L; y = ty; z = tz;
          c.copy(p.signal).lerp(p.cold, s.t); // tube side cools left to right
        } else {
          // shell side snakes between baffles, right to left, warming
          x = L / 2 - s.t * L;
          const wave = Math.sin(s.t * Math.PI * 6);
          y = Math.cos(s.a) * s.r * 0.9 + wave * 0.18; z = Math.sin(s.a + s.t * 4) * s.r;
          c.copy(p.cold).lerp(p.signal, s.t * 0.85);
        }
        pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = z;
        const vis = 0.25 + hold * 0.75;
        col[i * 3] = c.r * vis; col[i * 3 + 1] = c.g * vis; col[i * 3 + 2] = c.b * vis;
      });
      flow.attributes.position.needsUpdate = true;
      flow.attributes.color.needsUpdate = true;
      g.current!.rotation.y = -0.55 + journey.spin + Math.sin(t * 0.2) * 0.1 + journey.pointer.x * 0.15;
      g.current!.rotation.x = 0.22 + journey.pointer.y * 0.08;
    }}>
      <group ref={g} scale={0.74} position={[0.9, 0.1, 0]}>
        <lineSegments geometry={shell} material={ink} />
        <lineSegments geometry={tubes} material={faint} />
        <points geometry={flow} material={pointsMat} />
      </group>
    </Station>
  );
}

/* ---------- 04 Indus Blue: the Pashk Coat ---------- */
function Garment({ offset, colourway, mobile }: { offset: THREE.Vector3; colourway: string; mobile: boolean }) {
  const g = useRef<THREE.Group>(null);
  const ring = useMemo(() => gyroRing(1.25), []);
  const p = usePalette();
  const sig = useLineMaterial(p.signal, 0.9);
  const cw = useMemo(() => colourwayById(colourway), [colourway]);
  return (
    <Station index={4} offset={offset} materials={[sig]} onFrame={(_, dt, t) => {
      g.current!.rotation.y = Math.sin(t * 0.35) * 0.55 + journey.pointer.x * 0.5;
    }}>
      <group ref={g} scale={mobile ? 1.5 : 2.3} position={[0, mobile ? -0.2 : 0.25, 0]}>
        <GarmentMesh slug="pashk-coat" colourway={cw} />
      </group>
      <lineSegments geometry={ring} material={sig} rotation={[Math.PI / 2, 0, 0]} position={[0, mobile ? -1.45 : -1.85, 0]} scale={mobile ? 0.75 : 1} />
    </Station>
  );
}

/* ---------- 05 about: globe with Houston ---------- */
function Globe({ p, offset }: { p: Palette; offset: THREE.Vector3 }) {
  const globe = useMemo(() => globeGeometry(1.7), []);
  const pin = useMemo(() => latLon(HOUSTON.lat, HOUSTON.lon, 1.7), []);
  const pinGeo = useMemo(() => new THREE.BufferGeometry().setFromPoints([pin, pin.clone().multiplyScalar(1.35)]), [pin]);
  const halo = useMemo(() => gyroRing(0.16), []);
  const faint = useLineMaterial(p.ink, 0.35), sig = useLineMaterial(p.signal, 1), pulse = useLineMaterial(p.signal, 1);
  const g = useRef<THREE.Group>(null), haloRef = useRef<THREE.LineSegments>(null);
  const face = Math.atan2(pin.x, pin.z);
  return (
    <Station index={5} offset={offset} materials={[faint, sig, pulse]} onFrame={(_, dt, t) => {
      g.current!.rotation.y = -face + 0.35 + Math.sin(t * 0.25) * 0.4 + journey.pointer.x * 0.2;
      const s = 1 + (t % 1.6) * 0.9;
      haloRef.current!.scale.setScalar(s);
      pulse.opacity *= 1 - (t % 1.6) / 1.7;
    }}>
      <group ref={g} rotation={[0.35, 0, 0]}>
        <lineSegments geometry={globe} material={faint} />
        <lineSegments geometry={pinGeo} material={sig} />
        <lineSegments ref={haloRef} geometry={halo} material={pulse} position={pin.clone().multiplyScalar(1.01)} onUpdate={(self) => self.lookAt(0, 0, 0)} />
      </group>
    </Station>
  );
}

/* ---------- 06 contact: portal ---------- */
function Portal({ p, offset }: { p: Palette; offset: THREE.Vector3 }) {
  const portal = useMemo(() => portalGeometry(), []);
  const core = useMemo(() => new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(0.42, 1)), []);
  const ink = useLineMaterial(p.ink, 0.7), sig = useLineMaterial(p.signal, 1);
  const g = useRef<THREE.Group>(null), c = useRef<THREE.LineSegments>(null);
  return (
    <Station index={6} offset={offset} materials={[ink, sig]} onFrame={(_, dt) => {
      g.current!.rotation.z += dt * 0.12;
      c.current!.rotation.y += dt * 0.6;
      c.current!.rotation.x += dt * 0.3;
    }}>
      <group scale={0.62} position={[0.7, 0, 0]}>
        <group ref={g} rotation={[0, -0.3, 0]}>
          <lineSegments geometry={portal} material={ink} />
        </group>
        <lineSegments ref={c} geometry={core} material={sig} />
      </group>
    </Station>
  );
}

/* ---------- camera and world ---------- */
function Rig({ offset, reduced, mobile }: { offset: THREE.Vector3; reduced: boolean; mobile: boolean }) {
  const { camera } = useThree();
  const look = useRef(new THREE.Vector3());
  const target = useMemo(() => new THREE.Vector3(), []);
  useFrame((_, dt) => {
    const pos = journey.position;
    const z = -pos * SPACING;
    const portalPull = THREE.MathUtils.clamp(pos - 5.4, 0, 1) * 1.2;
    target.set(offset.x * 0.22 + journey.pointer.x * 0.35, (mobile ? 0 : offset.y * 0.5) + 0.35 - journey.pointer.y * 0.2, z + (mobile ? 9.4 : 7.6) - portalPull);
    const lam = reduced ? 1000 : 4.5;
    camera.position.x = damp(camera.position.x, target.x, lam, dt);
    camera.position.y = damp(camera.position.y, target.y, lam, dt);
    camera.position.z = damp(camera.position.z, target.z, lam, dt);
    // on phones, frame the object in the top half so the copy can sit below
    look.current.set(offset.x * 0.62, mobile ? offset.y * 0.05 : offset.y * 0.75, z);
    camera.lookAt(look.current);
  });
  return null;
}

function World({ colourway, reduced }: { colourway: string; reduced: boolean }) {
  const p = usePalette();
  const { size, scene } = useThree();
  const mobile = size.width < 760;
  const offset = useMemo(() => (mobile ? new THREE.Vector3(-0.4, 2.3, -1) : new THREE.Vector3(2.5, 0, 0)), [mobile]);
  const grid = useMemo(() => gridGeometry(STATIONS * SPACING + 10, 60, 1.2), []);
  const gridMat = useLineMaterial(p.ink, 0.1);
  useEffect(() => {
    gridMat.opacity = 0.1;
    scene.fog = new THREE.Fog(p.paper, 7, 24);
    scene.background = null;
  }, [scene, p.paper, gridMat]);
  return (
    <>
      <Rig offset={offset} reduced={reduced} mobile={mobile} />
      <lineSegments geometry={grid} material={gridMat} position={[0, -2.6, 0]} />
      <hemisphereLight args={["#fffaf0", "#3a3530", 1.0]} />
      <directionalLight position={[3, 4, 3]} intensity={2.0} />
      <directionalLight position={[-3, 1, -2]} intensity={0.7} color="#c9d4ff" />
      <Core p={p} offset={offset} />
      <Schedule p={p} offset={offset} />
      <Network p={p} offset={offset} />
      <Exchanger p={p} offset={offset} />
      <Garment offset={offset} colourway={colourway} mobile={mobile} />
      <Globe p={p} offset={offset} />
      <Portal p={p} offset={offset} />
    </>
  );
}

export default function JourneyScene({ colourway }: { colourway: string }) {
  const reduced = typeof window !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;
  return (
    <Canvas className="journey-canvas" dpr={[1, 1.6]} camera={{ fov: 42, position: [0, 0.4, 7.6], near: 0.1, far: 60 }} gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}>
      <World colourway={colourway} reduced={reduced} />
    </Canvas>
  );
}
