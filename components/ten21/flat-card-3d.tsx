"use client";
/* eslint-disable react-hooks/immutability -- material opacity is driven from the render loop */
import { useEffect, useMemo, useState, type RefObject } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { GarmentFlat } from "./garment-flat";
import { flats } from "@/lib/ten21/flats";
import { pieceBySlug, colourwayById } from "@/lib/ten21/collection";
import type { Palette } from "@/components/journey/stations";

/* One garment's technical flat on a drafting card, drawn in the site's
   current ink and paper so it matches the wireframe world in both themes. */
async function cardTexture(slug: string, ink: string, paper: string, signal: string) {
  const [, , vw, vh] = flats[slug].viewBox;
  const W = 1100, pad = 60, strip = 90;
  const fw = W - pad * 2, fh = (fw * vh) / vw;
  const H = Math.round(fh + pad * 2 + strip);
  const canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = paper; ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = ink; ctx.globalAlpha = 0.08; ctx.lineWidth = 1;
  for (let x = 0; x < W; x += 30) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  for (let y = 0; y < H; y += 30) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  ctx.globalAlpha = 1; ctx.lineWidth = 3; ctx.strokeRect(14, 14, W - 28, H - 28);
  const markup = renderToStaticMarkup(<GarmentFlat slug={slug} view="front" mode="technical" colourway={colourwayById("shir")} ink={ink} paper={paper} />)
    .replace("<svg", `<svg width="${Math.round(fw)}" height="${Math.round(fh)}"`);
  const url = URL.createObjectURL(new Blob([markup], { type: "image/svg+xml" }));
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    ctx.drawImage(img, pad, pad, fw, fh);
  } finally {
    URL.revokeObjectURL(url);
  }
  const piece = pieceBySlug(slug)!;
  ctx.fillStyle = ink; ctx.fillRect(14, H - strip - 14, W - 28, 2);
  ctx.font = "500 30px ui-monospace, monospace";
  ctx.fillStyle = signal; ctx.fillText(piece.code, pad, H - strip / 2 - 6);
  ctx.fillStyle = ink; ctx.fillText(piece.name.toUpperCase(), pad + 170, H - strip / 2 - 6);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return { tex, aspect: W / H };
}

export function FlatCard3D({ slug, p, fade, height = 3 }: { slug: string; p: Palette; fade: RefObject<{ v: number }>; height?: number }) {
  const [card, setCard] = useState<{ tex: THREE.Texture; aspect: number } | null>(null);
  const hex = (c: THREE.Color) => `#${c.getHexString(THREE.SRGBColorSpace)}`;
  const ink = hex(p.ink), paper = hex(p.card), signal = hex(p.signal);
  useEffect(() => {
    let live = true;
    cardTexture(slug, ink, paper, signal).then((c) => { if (live) setCard(c); else c.tex.dispose(); });
    return () => { live = false; };
  }, [slug, ink, paper, signal]);
  useEffect(() => () => card?.tex.dispose(), [card]);
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ transparent: true, toneMapped: false, side: THREE.DoubleSide }), []);
  const shadow = useMemo(() => new THREE.MeshBasicMaterial({ color: "#000", transparent: true }), []);
  useEffect(() => { mat.map = card?.tex ?? null; mat.needsUpdate = true; }, [mat, card]);
  useFrame(() => {
    const f = fade.current?.v ?? 1;
    mat.opacity = f;
    shadow.opacity = 0.14 * f;
  });
  if (!card) return null;
  const w = height * card.aspect;
  return (
    <group>
      <mesh scale={[w, height, 1]} position={[0.05, -0.05, -0.02]} material={shadow}><planeGeometry /></mesh>
      <mesh scale={[w, height, 1]} material={mat}><planeGeometry /></mesh>
    </group>
  );
}
