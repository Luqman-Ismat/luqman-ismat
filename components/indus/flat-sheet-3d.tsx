"use client";
import { useEffect, useMemo, useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import * as THREE from "three";
import { GarmentFlat, type FlatMode } from "./garment-flat";
import { flats } from "@/lib/indus/flats";
import type { Colourway } from "@/lib/indus/collection";

/* Rasterise front and back flats side by side onto a paper sheet with a
   title strip, for use as a texture in the WebGL scene. */
async function sheetTexture(slug: string, colourway: Colourway, mode: FlatMode, label: string) {
  const [, , vw, vh] = flats[slug].viewBox;
  const W = 2400, pad = 80, strip = 120;
  const flatW = (W - pad * 3) / 2;
  const flatH = (flatW * vh) / vw;
  const H = Math.round(flatH + pad * 2 + strip);
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#fbfaf6";
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = "#151515";
  ctx.lineWidth = 3;
  ctx.strokeRect(24, 24, W - 48, H - 48);
  for (const [i, view] of (["front", "back"] as const).entries()) {
    const svg = renderToStaticMarkup(<GarmentFlat slug={slug} view={view} colourway={colourway} mode={mode} />)
      .replace("<svg", `<svg width="${Math.round(flatW)}" height="${Math.round(flatH)}"`);
    const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
    try {
      const img = new Image();
      img.src = url;
      await img.decode();
      ctx.drawImage(img, pad + i * (flatW + pad), pad, flatW, flatH);
    } finally {
      URL.revokeObjectURL(url);
    }
  }
  ctx.fillStyle = "#151515";
  ctx.fillRect(24, H - strip - 24, W - 48, 3);
  ctx.font = "500 40px ui-monospace, monospace";
  ctx.fillText(label, pad, H - strip / 2 - 14);
  ctx.textAlign = "right";
  ctx.fillText("FRONT · BACK   REV A   NTS", W - pad, H - strip / 2 - 14);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return { tex, aspect: W / H };
}

export function FlatSheet3D({ slug, colourway, mode = "technical", label, width = 4 }: { slug: string; colourway: Colourway; mode?: FlatMode; label: string; width?: number }) {
  const [sheet, setSheet] = useState<{ tex: THREE.Texture; aspect: number } | null>(null);
  useEffect(() => {
    let live = true;
    sheetTexture(slug, colourway, mode, label).then((s) => {
      if (live) setSheet(s);
      else s.tex.dispose();
    });
    return () => { live = false; };
  }, [slug, colourway, mode, label]);
  useEffect(() => () => sheet?.tex.dispose(), [sheet]);
  const geo = useMemo(() => new THREE.PlaneGeometry(1, 1), []);
  if (!sheet) return null;
  const h = width / sheet.aspect;
  return (
    <group>
      <mesh geometry={geo} scale={[width, h, 1]} position={[0.06, -0.06, -0.02]}>
        <meshBasicMaterial color="#000" transparent opacity={0.12} />
      </mesh>
      <mesh geometry={geo} scale={[width, h, 1]}>
        <meshBasicMaterial map={sheet.tex} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}
