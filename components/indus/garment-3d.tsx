"use client";
import { Suspense, useEffect, useMemo, useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, ContactShadows } from "@react-three/drei";
import { GarmentFlat } from "./garment-flat";
import { shapes, type Pt } from "@/lib/indus/shapes";
import type { Colourway } from "@/lib/indus/collection";

/* Rasterise a rendered flat to a canvas texture. The SVG covers the
   shape's viewBox exactly, so UVs map straight from millimetres. */
async function flatTexture(slug: string, view: "front" | "back", colourway: Colourway, px = 2048) {
  const [, , vw, vh] = shapes[slug].viewBox;
  const svg = renderToStaticMarkup(<GarmentFlat slug={slug} view={view} colourway={colourway} />)
    .replace("<svg", `<svg width="${px}" height="${Math.round((px * vh) / vw)}"`);
  const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
  try {
    const img = new Image();
    img.decoding = "async";
    img.src = url;
    await img.decode();
    const canvas = document.createElement("canvas");
    canvas.width = px;
    canvas.height = Math.round((px * vh) / vw);
    canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    return tex;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function inside(p: Pt, poly: Pt[]) {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if (yi > p[1] !== yj > p[1] && p[0] < ((xj - xi) * (p[1] - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
}
function edgeDistance(p: Pt, poly: Pt[]) {
  let best = Infinity;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [ax, ay] = poly[j], [bx, by] = poly[i];
    const dx = bx - ax, dy = by - ay;
    const t = Math.max(0, Math.min(1, ((p[0] - ax) * dx + (p[1] - ay) * dy) / (dx * dx + dy * dy || 1)));
    best = Math.min(best, Math.hypot(p[0] - ax - t * dx, p[1] - ay - t * dy));
  }
  return best;
}

/* Inflated surface: depth rises with distance from the silhouette edge, so
   sleeves stay slim and the body carries volume, like cloth over a form. */
export function garmentGeometry(slug: string, side: 1 | -1, res = 220) {
  const shape = shapes[slug];
  const poly = shape.front.outline;
  const [vx, vy, vw, vh] = shape.viewBox;
  const cols = res, rows = Math.round((res * vh) / vw);
  const depth = slug === "chin-shalwar" ? 120 : slug === "sadri" ? 70 : 95;
  const pos: number[] = [], uv: number[] = [], index: number[] = [];
  const isIn: boolean[] = [];
  // keep cells near the outline too; the texture's alpha cuts the true edge
  const reach = (vw / cols) * 2;
  for (let r = 0; r <= rows; r++) {
    for (let c = 0; c <= cols; c++) {
      const x = vx + (c / cols) * vw, y = vy + (r / rows) * vh;
      const inn = inside([x, y], poly);
      const edge = edgeDistance([x, y], poly);
      const d = inn ? edge : 0;
      const ripple = inn ? Math.sin(x * 0.02 + y * 0.004) * Math.min(d, 40) * 0.08 : 0;
      const z = inn ? depth * (1 - Math.exp(-d / 90)) + ripple : 0;
      pos.push(x * side, -y, z * side);
      uv.push(side === 1 ? c / cols : 1 - c / cols, 1 - r / rows);
      isIn.push(inn || edge < reach);
    }
  }
  const w = cols + 1;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const a = r * w + c, b = a + 1, d = a + w, e = d + 1;
      if (!(isIn[a] || isIn[b] || isIn[d] || isIn[e])) continue;
      if (side === 1) index.push(a, d, b, b, d, e);
      else index.push(a, b, d, b, e, d);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(index);
  g.computeVertexNormals();
  return g;
}

export function useGarmentTextures(slug: string, colourway: Colourway) {
  const [tex, setTex] = useState<{ front: THREE.Texture; back: THREE.Texture } | null>(null);
  useEffect(() => {
    let live = true;
    Promise.all([flatTexture(slug, "front", colourway), flatTexture(slug, "back", colourway)]).then(([front, back]) => {
      if (live) setTex({ front, back });
      else {
        front.dispose();
        back.dispose();
      }
    });
    return () => {
      live = false;
    };
  }, [slug, colourway]);
  useEffect(() => () => {
    tex?.front.dispose();
    tex?.back.dispose();
  }, [tex]);
  return tex;
}

export function GarmentMesh({ slug, colourway, opacity = 1 }: { slug: string; colourway: Colourway; opacity?: number }) {
  const tex = useGarmentTextures(slug, colourway);
  const front = useMemo(() => garmentGeometry(slug, 1), [slug]);
  const back = useMemo(() => garmentGeometry(slug, -1), [slug]);
  useEffect(() => () => {
    front.dispose();
    back.dispose();
  }, [front, back]);
  if (!tex) return null;
  const [vx, vy, vw, vh] = shapes[slug].viewBox;
  const material = (map: THREE.Texture, behind = false) => (
    <meshPhysicalMaterial
      map={map}
      polygonOffset={behind}
      polygonOffsetFactor={behind ? 2 : 0}
      polygonOffsetUnits={behind ? 2 : 0}
      alphaTest={0.5}
      transparent={opacity < 1}
      opacity={opacity}
      roughness={0.92}
      sheen={1}
      sheenRoughness={0.75}
      sheenColor={colourway.ground}
      side={THREE.FrontSide}
    />
  );
  return (
    <group scale={1 / 1000} position={[-(vx + vw / 2) / 1000, (vy + vh / 2) / 1000, 0]}>
      <mesh geometry={front} castShadow>{material(tex.front)}</mesh>
      <mesh geometry={back} castShadow>{material(tex.back, true)}</mesh>
    </group>
  );
}

export function Garment3D({ slug, colourway }: { slug: string; colourway: Colourway }) {
  const reduced = typeof window !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const height = shapes[slug].viewBox[3] / 1000;
  const floor = -(height / 2 - 0.06);
  // fit the full garment: distance for a 36° vertical field of view plus margin
  const distance = (height / 2 / Math.tan((18 * Math.PI) / 180)) * 1.22;
  return (
    <div className="garment-3d">
      <Canvas camera={{ position: [distance * 0.26, 0.05, distance], fov: 36 }} dpr={[1, 2]} gl={{ antialias: true, preserveDrawingBuffer: true }}>
        <hemisphereLight args={["#fffaf0", "#3a3530", 0.9]} />
        <directionalLight position={[2, 3, 2.5]} intensity={2.2} />
        <directionalLight position={[-2.5, 1, -2]} intensity={0.9} color="#c9d4ff" />
        <Suspense fallback={null}>
          <GarmentMesh slug={slug} colourway={colourway} />
        </Suspense>
        <ContactShadows position={[0, floor, 0]} opacity={0.35} scale={3} blur={2.4} far={1.2} />
        <OrbitControls enablePan={false} minDistance={distance * 0.5} maxDistance={distance * 1.5} autoRotate={!reduced} autoRotateSpeed={0.8} minPolarAngle={Math.PI * 0.3} maxPolarAngle={Math.PI * 0.62} />
      </Canvas>
      <p className="garment-3d-hint">Drag to turn · scroll to zoom</p>
    </div>
  );
}
