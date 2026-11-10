/* The embedded apps were built with their own palettes. On this site they
   inherit one accent and greys, with a single red for anything behind or
   failing. Applied to the built bundles after scoping: every saturated hex
   colour is mapped by hue. */
import { readFile, writeFile } from "node:fs/promises";

const hsl = (hex) => {
  const n = parseInt(hex, 16);
  const r = ((n >> 16) & 255) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h * 60, s, l];
};
const byHue = (h) => {
  if (h < 25 || h >= 330) return "#d2524f";
  if (h < 70) return "#b9ad8e";
  if (h < 200) return "var(--accent)";
  if (h < 260) return "#d8d7d2";
  return "#8e8d88";
};
const mapHex = (m, hex) => {
  const full = hex.length === 3 ? hex.split("").map((c) => c + c).join("") : hex;
  const [h, s, l] = hsl(full);
  if (s < 0.22 || l < 0.12 || l > 0.93) return m;
  return byHue(h);
};
const mapRgba = (_, r, g, b, a) => {
  const [h, s, l] = hsl(((+r << 16) | (+g << 8) | +b).toString(16).padStart(6, "0"));
  if (s < 0.22 || l < 0.12 || l > 0.93) return _;
  const to = byHue(h);
  return to.startsWith("var") ? `color-mix(in oklab, ${to} ${Math.round(a * 100)}%, transparent)` : `color-mix(in oklab, ${to} ${Math.round(a * 100)}%, transparent)`;
};

for (const f of ["public/examples/project/app.js", "public/examples/project/scoped.css", "public/examples/inspection/app.js", "public/examples/inspection/scoped.css"]) {
  let s = await readFile(f, "utf8");
  s = s.replace(/#([0-9a-f]{6})\b/gi, mapHex).replace(/#([0-9a-f]{3})\b(?![0-9a-f])/gi, mapHex);
  s = s.replace(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\s*\)/g, (m, r, g, b, a = "1") => mapRgba(m, r, g, b, a));
  await writeFile(f, s);
  console.log("themed", f);
}
