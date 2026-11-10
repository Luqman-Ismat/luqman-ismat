"use client";
import { useEffect, useRef, useState } from "react";
import type * as THREE_NS from "three";

/* A shell-and-tube heat exchanger drawn as a wireframe in WebGL. It turns
   slowly, follows the pointer, and the tube bundle slides out on hover.
   three.js loads only when the panel comes near the viewport. */
export function WireScene() {
  const host = useRef<HTMLDivElement>(null);
  const [gl, setGl] = useState(false);

  useEffect(() => {
    const el = host.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let teardown: (() => void) | undefined;
    let cancelled = false;

    const start = (THREE: typeof THREE_NS) => {
      let renderer: THREE_NS.WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      } catch {
        return () => {};
      }
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
      renderer.setClearColor(0x000000, 0);
      el.appendChild(renderer.domElement);
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
      camera.position.set(0, 1.2, 12.5);
      camera.lookAt(0, 0, 0);

      const paper = 0xecebe6;
      const strong = new THREE.LineBasicMaterial({ color: paper, transparent: true, opacity: 0.9 });
      const faint = new THREE.LineBasicMaterial({ color: paper, transparent: true, opacity: 0.22 });
      const mid = new THREE.LineBasicMaterial({ color: paper, transparent: true, opacity: 0.5 });

      const rig = new THREE.Group();
      scene.add(rig);
      const edges = (g: THREE_NS.BufferGeometry, m: THREE_NS.LineBasicMaterial, angle = 1) => new THREE.LineSegments(new THREE.EdgesGeometry(g, angle), m);

      // shell
      const shell = new THREE.Group();
      const skin = edges(new THREE.CylinderGeometry(1, 1, 5.2, 24, 1, true), faint, 10);
      skin.rotation.x = Math.PI / 2;
      shell.add(skin);
      const ring = (z: number, r = 1, m = strong) => {
        const pts = Array.from({ length: 49 }, (_, i) => new THREE.Vector3(Math.cos((i / 48) * Math.PI * 2) * r, Math.sin((i / 48) * Math.PI * 2) * r, z));
        return new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), m);
      };
      [-2.6, -1.3, 0, 1.3, 2.6].forEach((z) => shell.add(ring(z, 1, z === 0 || Math.abs(z) === 2.6 ? strong : mid)));
      // long shell lines
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        shell.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(Math.cos(a), Math.sin(a), -2.6), new THREE.Vector3(Math.cos(a), Math.sin(a), 2.6)]), faint));
      }
      // heads
      [-1, 1].forEach((s) => {
        const head = edges(new THREE.CylinderGeometry(1.12, 1.12, 0.9, 24, 1, false), mid, 20);
        head.rotation.x = Math.PI / 2;
        head.position.z = s * 3.05;
        shell.add(head);
        shell.add(ring(s * 3.5, 1.12));
        const noz = edges(new THREE.CylinderGeometry(0.22, 0.22, 0.7, 12, 1, true), mid, 20);
        noz.position.set(0, s > 0 ? 1.3 : -1.3, s * 3.05);
        shell.add(noz);
      });
      // shell nozzles
      [-1.9, 1.9].forEach((z, k) => {
        const noz = edges(new THREE.CylinderGeometry(0.26, 0.26, 0.8, 12, 1, true), mid, 20);
        noz.position.set(0, k ? 1.3 : -1.3, z);
        shell.add(noz);
      });
      rig.add(shell);

      // tube bundle: hex pattern
      const bundle = new THREE.Group();
      const tubes: THREE_NS.Vector3[] = [];
      const pitch = 0.27;
      for (let q = -3; q <= 3; q++)
        for (let r = -3; r <= 3; r++) {
          const px = pitch * (q + r / 2) * 1.0;
          const py = pitch * r * 0.866;
          if (Math.hypot(px, py) < 0.82) tubes.push(new THREE.Vector3(px, py, 0));
        }
      const tubePts: THREE_NS.Vector3[] = [];
      tubes.forEach((t) => {
        tubePts.push(new THREE.Vector3(t.x, t.y, -2.5), new THREE.Vector3(t.x, t.y, 2.5));
      });
      bundle.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(tubePts), new THREE.LineBasicMaterial({ color: paper, transparent: true, opacity: 0.55 })));
      // baffles
      [-1.6, -0.5, 0.6, 1.7].forEach((z, k) => {
        const pts: THREE_NS.Vector3[] = [];
        const cut = k % 2 ? 0.55 : -0.55;
        for (let i = 0; i <= 40; i++) {
          const a = (i / 40) * Math.PI * 2;
          const yy = Math.sin(a) * 0.95;
          if (k % 2 ? yy < cut : yy > cut) pts.push(new THREE.Vector3(Math.cos(a) * 0.95, yy, z));
        }
        bundle.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), mid));
      });
      // tube sheets
      [-2.5, 2.5].forEach((z) => bundle.add(ring(z, 0.96, strong)));
      rig.add(bundle);

      rig.rotation.y = -1.15;
      rig.rotation.x = 0.18;

      let w = 0,
        h = 0;
      const layout = () => {
        w = el.clientWidth;
        h = el.clientHeight;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      };
      layout();
      const ro = new ResizeObserver(layout);
      ro.observe(el);

      let tx = 0,
        ty = 0,
        px = 0,
        py = 0,
        pull = 0,
        hover = 0;
      const onMove = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
        ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
      };
      const enter = () => (hover = 1);
      const leave = () => {
        hover = 0;
        tx = 0;
        ty = 0;
      };
      el.addEventListener("pointermove", onMove);
      el.addEventListener("pointerenter", enter);
      el.addEventListener("pointerleave", leave);

      let visible = false,
        raf = 0,
        t0 = performance.now();
      const io = new IntersectionObserver(([e]) => {
        visible = e.isIntersecting;
        if (visible && !raf) raf = requestAnimationFrame(frame);
      });
      io.observe(el);
      function frame(now: number) {
        raf = 0;
        if (!visible) return;
        const t = (now - t0) / 1000;
        px += (tx - px) * 0.06;
        py += (ty - py) * 0.06;
        pull += (hover - pull) * 0.05;
        rig.rotation.y = -1.15 + t * 0.14 + px * 0.5;
        rig.rotation.x = 0.18 + py * 0.3;
        bundle.position.z = -pull * 3.4;
        renderer.render(scene, camera);
        raf = requestAnimationFrame(frame);
      }
      const ready = requestAnimationFrame(() => setGl(true));
      return () => {
        cancelAnimationFrame(ready);
        cancelAnimationFrame(raf);
        io.disconnect();
        ro.disconnect();
        el.removeEventListener("pointermove", onMove);
        el.removeEventListener("pointerenter", enter);
        el.removeEventListener("pointerleave", leave);
        scene.traverse((o) => {
          const m = o as THREE_NS.Line;
          m.geometry?.dispose?.();
        });
        [strong, faint, mid].forEach((m) => m.dispose());
        renderer.dispose();
        renderer.domElement.remove();
        setGl(false);
      };
    };

    const near = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        near.disconnect();
        import("three").then((T) => {
          if (!cancelled) teardown = start(T);
        });
      },
      { rootMargin: "500px 0px" },
    );
    near.observe(el);
    return () => {
      cancelled = true;
      near.disconnect();
      teardown?.();
    };
  }, []);

  return (
    <div ref={host} className={gl ? "wire has-gl" : "wire"} aria-label="A shell and tube heat exchanger drawn as a wireframe. Hover to pull the tube bundle out." role="img">
      {!gl && (
        <svg className="wire-fallback" viewBox="0 0 400 200" aria-hidden="true">
          <rect x="60" y="60" width="280" height="80" rx="40" />
          <path d="M60 100h280M100 60v80M200 60v80M300 60v80" />
        </svg>
      )}
    </div>
  );
}
