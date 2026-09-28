"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import mesh from "@/public/cad/field-01/pull-mesh.json";
export function HardwareViewer() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const rotation = useRef({ x: -0.55, y: 0.65, zoom: 1 });
  const dragging = useRef<{ x: number; y: number } | null>(null);
  const redraw = useRef<() => void>(() => {});
  const [ready, setReady] = useState(false);
  const [view, setView] = useState("Isometric");
  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    const ctx = el.getContext("2d");
    if (!ctx) return;
    let frame = 0;
    const draw = () => {
      frame = 0;
      const width = el.clientWidth,
        height = el.clientHeight;
      if (!width || !height) return;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      el.width = width * ratio;
      el.height = height * ratio;
      ctx.scale(ratio, ratio);
      ctx.clearRect(0, 0, width, height);
      const { x: ax, y: ay, zoom } = rotation.current;
      const vertices = mesh.vertices.map(([x, y, z]) => {
        const Y = y * Math.cos(ax) - z * Math.sin(ax),
          Z = y * Math.sin(ax) + z * Math.cos(ax);
        return [
          x * Math.cos(ay) + Z * Math.sin(ay),
          Y,
          -x * Math.sin(ay) + Z * Math.cos(ay),
        ];
      });
      const scale = Math.min(width / 32, height / 49) * zoom;
      const faces = mesh.triangles
        .map((t) => ({ t, z: t.reduce((a, i) => a + vertices[i][2], 0) }))
        .sort((a, b) => a.z - b.z);
      for (const { t } of faces) {
        const [a, b, c] = t.map((i) => vertices[i]);
        const u = b.map((v, i) => v - a[i]),
          v = c.map((v, i) => v - a[i]);
        const n = [
          u[1] * v[2] - u[2] * v[1],
          u[2] * v[0] - u[0] * v[2],
          u[0] * v[1] - u[1] * v[0],
        ];
        const length = Math.hypot(...n) || 1;
        const light =
          0.38 +
          0.62 * Math.abs((n[0] * -0.4 + n[1] * -0.5 + n[2] * 0.76) / length);
        ctx.fillStyle = `rgb(${Math.round(192 * light)},${Math.round(201 * light)},${Math.round(184 * light)})`;
        ctx.beginPath();
        ctx.moveTo(width / 2 + a[0] * scale, height / 2 - a[1] * scale);
        ctx.lineTo(width / 2 + b[0] * scale, height / 2 - b[1] * scale);
        ctx.lineTo(width / 2 + c[0] * scale, height / 2 - c[1] * scale);
        ctx.closePath();
        ctx.fill();
      }
    };
    redraw.current = () => {
      if (!frame) frame = requestAnimationFrame(draw);
    };
    const observer = new ResizeObserver(redraw.current);
    observer.observe(el);
    draw();
    setReady(true);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      redraw.current = () => {};
    };
  }, []);
  function preset(name: string, x: number, y: number) {
    rotation.current = { x, y, zoom: 1 };
    setView(name);
    redraw.current();
  }
  return (
    <div className="hardware-viewer">
      <div className="viewer-topline">
        <span>PULL / 001</span>
        <span>14 × 38 × 3 mm</span>
      </div>
      <div className="hardware-stage">
        {!ready && (
          <Image
            fill
            unoptimized
            sizes="100vw"
            src="/cad/field-01/pull-render.svg"
            alt="Isometric view of the actual CAD hardware model"
            className="hardware-fallback"
          />
        )}
        <canvas
          ref={canvas}
          tabIndex={0}
          role="img"
          aria-label="Interactive pull model. Drag or use arrow keys to rotate. Use plus and minus keys to zoom."
          onPointerDown={(e) => {
            dragging.current = { x: e.clientX, y: e.clientY };
            e.currentTarget.setPointerCapture(e.pointerId);
          }}
          onPointerMove={(e) => {
            if (!dragging.current) return;
            rotation.current.y += (e.clientX - dragging.current.x) * 0.012;
            rotation.current.x += (e.clientY - dragging.current.y) * 0.012;
            dragging.current = { x: e.clientX, y: e.clientY };
            setView("Custom");
            redraw.current();
          }}
          onPointerUp={() => {
            dragging.current = null;
          }}
          onPointerCancel={() => {
            dragging.current = null;
          }}
          onKeyDown={(e) => {
            const key = e.key;
            if (
              ![
                "ArrowLeft",
                "ArrowRight",
                "ArrowUp",
                "ArrowDown",
                "+",
                "=",
                "-",
              ].includes(key)
            )
              return;
            e.preventDefault();
            if (key === "ArrowLeft") rotation.current.y -= 0.15;
            if (key === "ArrowRight") rotation.current.y += 0.15;
            if (key === "ArrowUp") rotation.current.x -= 0.15;
            if (key === "ArrowDown") rotation.current.x += 0.15;
            if (key === "+" || key === "=")
              rotation.current.zoom = Math.min(
                1.6,
                rotation.current.zoom + 0.1,
              );
            if (key === "-")
              rotation.current.zoom = Math.max(
                0.6,
                rotation.current.zoom - 0.1,
              );
            setView("Custom");
            redraw.current();
          }}
        />
      </div>
      <div className="viewer-controls">
        <div className="view-switch" role="group" aria-label="Hardware view">
          <button
            type="button"
            aria-pressed={view === "Isometric"}
            onClick={() => preset("Isometric", -0.55, 0.65)}
          >
            3D
          </button>
          <button
            type="button"
            aria-pressed={view === "Top"}
            onClick={() => preset("Top", 0, 0)}
          >
            Top
          </button>
          <button
            type="button"
            aria-pressed={view === "Side"}
            onClick={() => preset("Side", 0, Math.PI / 2)}
          >
            Side
          </button>
        </div>
        <span className="drag-hint">Drag to rotate · arrow keys</span>
      </div>
      <div className="viewer-caption">
        <span>Solid model · STEP + STL</span>
        <a href="/cad/field-01/field-01-pull.step" download>
          Download STEP ↗
        </a>
      </div>
    </div>
  );
}
