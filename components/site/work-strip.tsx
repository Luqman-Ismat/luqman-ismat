"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

export type StripItem = { src: string; title: string; note: string; href: string; alt: string };

const VERT = /* glsl */ `
uniform float uBend;
uniform float uHalfW;
uniform float uVel;
varying vec2 vUv;
void main() {
  vUv = uv;
  vec4 wp = modelMatrix * vec4(position, 1.0);
  float nx = wp.x / uHalfW;
  wp.z -= (uBend + abs(uVel) * 0.012) * nx * nx * uHalfW * 0.42;
  wp.y += sin(uv.x * 3.14159) * uVel * 0.6;
  gl_Position = projectionMatrix * viewMatrix * wp;
}`;

const FRAG = /* glsl */ `
uniform sampler2D uTex;
uniform vec2 uCover;
uniform float uGray;
uniform float uDim;
uniform float uVel;
varying vec2 vUv;
void main() {
  vec2 uv = (vUv - 0.5) * uCover + 0.5;
  float s = clamp(uVel, -40.0, 40.0) * 0.0006;
  vec3 c = vec3(texture2D(uTex, uv + vec2(s, 0.0)).r, texture2D(uTex, uv).g, texture2D(uTex, uv - vec2(s, 0.0)).b);
  float l = dot(c, vec3(0.299, 0.587, 0.114));
  c = mix(c, vec3(l), uGray);
  c *= uDim;
  gl_FragColor = vec4(c, 1.0);
}`;

/* The work, as a bent strip you can drag. The centred piece is in colour;
   the rest fall back to grey and dim toward the edges. Without WebGL, or
   with reduced motion, it is a plain scrolling row of links. */
export function WorkStrip({ items }: { items: StripItem[] }) {
  const host = useRef<HTMLDivElement>(null);
  const openRef = useRef<HTMLAnchorElement>(null);
  const api = useRef<{ go: (d: number) => void } | null>(null);
  const [gl, setGl] = useState(false);
  const [at, setAt] = useState(0);
  const n = items.length;

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    } catch {
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    el.appendChild(renderer.domElement);
    renderer.domElement.setAttribute("aria-hidden", "true");

    const D = 900;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 10, 4000);
    camera.position.z = D;

    const geo = new THREE.PlaneGeometry(1, 1, 40, 1);
    const blank = new THREE.DataTexture(new Uint8Array([18, 18, 17, 255]), 1, 1);
    blank.needsUpdate = true;
    const loader = new THREE.TextureLoader();
    const meshes = items.map((it) => {
      const mat = new THREE.ShaderMaterial({
        vertexShader: VERT,
        fragmentShader: FRAG,
        uniforms: {
          uTex: { value: blank },
          uCover: { value: new THREE.Vector2(1, 1) },
          uGray: { value: 1 },
          uDim: { value: 1 },
          uVel: { value: 0 },
          uBend: { value: 0.32 },
          uHalfW: { value: 700 },
        },
      });
      const m = new THREE.Mesh(geo, mat);
      m.userData.aspect = 1.44;
      loader.load(it.src, (t) => {
        t.minFilter = THREE.LinearFilter;
        t.generateMipmaps = false;
        mat.uniforms.uTex.value = t;
        const img = t.image as HTMLImageElement;
        m.userData.imgAspect = img.width / img.height;
        layout();
      });
      scene.add(m);
      return m;
    });

    let w = 0,
      h = 0,
      cardW = 0,
      cardH = 0,
      step = 0,
      total = 0;
    function layout() {
      w = el!.clientWidth;
      h = el!.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.fov = (2 * Math.atan(h / 2 / D) * 180) / Math.PI;
      camera.updateProjectionMatrix();
      const mobile = w < 760;
      cardH = Math.min(h * (mobile ? 0.84 : 0.86), (mobile ? w * 0.76 : w * 0.5) / 1.44);
      cardW = cardH * 1.44;
      step = cardW + Math.max(14, cardW * 0.08);
      total = step * n;
      meshes.forEach((m) => {
        m.scale.set(cardW, cardH, 1);
        const u = (m.material as THREE.ShaderMaterial).uniforms;
        u.uHalfW.value = w / 2;
        const ia = m.userData.imgAspect || 1.44;
        const pa = cardW / cardH;
        u.uCover.value.set(ia > pa ? pa / ia : 1, ia > pa ? 1 : ia / pa);
      });
    }
    layout();

    let target = 0,
      current = 0,
      vel = 0,
      shown = -1;
    const wrap = (v: number) => ((((v + total / 2) % total) + total) % total) - total / 2;
    const go = (d: number) => {
      target = Math.round(target / step) * step + d * step;
    };
    api.current = { go };

    // drag
    let dragging = false,
      startX = 0,
      lastX = 0,
      moved = 0,
      flick = 0;
    const down = (e: PointerEvent) => {
      dragging = true;
      startX = lastX = e.clientX;
      moved = 0;
      flick = 0;
      el.classList.add("is-drag");
    };
    const move = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - lastX;
      lastX = e.clientX;
      moved = Math.max(moved, Math.abs(e.clientX - startX));
      target -= dx * 1.25;
      flick = dx;
    };
    const up = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      el.classList.remove("is-drag");
      if (moved < 6) {
        // click: centre the card under the pointer, or open the centred one
        const r = el.getBoundingClientRect();
        const px = e.clientX - r.left - w / 2;
        let hit = -1;
        meshes.forEach((m, i) => {
          if (Math.abs(px - m.position.x) < cardW / 2) hit = i;
        });
        if (hit === -1) return;
        const ci = ((Math.round(current / step) % n) + n) % n;
        if (hit === ci) openRef.current?.click();
        else target = Math.round(current / step) * step + Math.round(meshes[hit].position.x / step) * step;
        return;
      }
      target -= flick * 14;
      target = Math.round(target / step) * step;
    };
    let wheelT = 0;
    const wheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      target += e.deltaX;
      window.clearTimeout(wheelT);
      wheelT = window.setTimeout(() => {
        target = Math.round(target / step) * step;
      }, 140);
    };
    el.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    el.addEventListener("wheel", wheel, { passive: false });

    // render only while visible
    let visible = false,
      raf = 0;
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !raf) raf = requestAnimationFrame(frame);
    });
    io.observe(el);
    const ro = new ResizeObserver(() => layout());
    ro.observe(el);

    function frame() {
      raf = 0;
      if (!visible) return;
      const prev = current;
      current += (target - current) * 0.085;
      vel += (current - prev - vel) * 0.25;
      meshes.forEach((m, i) => {
        const x = wrap(i * step - current);
        m.position.x = x;
        const u = (m.material as THREE.ShaderMaterial).uniforms;
        const d = Math.abs(x);
        u.uGray.value = Math.min(1, Math.max(0, (d - step * 0.15) / (step * 0.45)));
        u.uDim.value = 1 - 0.55 * Math.min(1, d / (w * 0.6));
        u.uVel.value = vel;
      });
      const ci = ((Math.round(current / step) % n) + n) % n;
      if (ci !== shown) {
        shown = ci;
        setAt(ci);
      }
      renderer.render(scene, camera);
      raf = requestAnimationFrame(frame);
    }
    const ready = requestAnimationFrame(() => setGl(true));

    return () => {
      cancelAnimationFrame(ready);
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      el.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      el.removeEventListener("wheel", wheel);
      meshes.forEach((m) => {
        const mat = m.material as THREE.ShaderMaterial;
        const t = mat.uniforms.uTex.value as THREE.Texture;
        if (t !== blank) t.dispose();
        mat.dispose();
      });
      geo.dispose();
      blank.dispose();
      renderer.dispose();
      renderer.domElement.remove();
      api.current = null;
      setGl(false);
    };
  }, [items, n]);

  const cur = items[at];
  return (
    <div className="strip-wrap">
      <div ref={host} className={gl ? "strip has-gl" : "strip"}>
        {gl && <span className="label strip-hint" aria-hidden="true">(Drag)</span>}
        <div className="strip-fallback" aria-hidden={gl || undefined}>
          {items.map((it) => (
            <Link key={it.src} href={it.href} tabIndex={gl ? -1 : undefined} className="mono-img">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={it.src} alt={it.alt} loading="lazy" />
            </Link>
          ))}
        </div>
      </div>
      <div className="strip-caption" aria-live="polite">
        <span className="label count">
          ({String(at + 1).padStart(2, "0")}/{String(n).padStart(2, "0")})
          {gl && (
            <>
              {" "}
              <button type="button" className="strip-btn" onClick={() => api.current?.go(-1)} aria-label="Previous piece">
                ←
              </button>
              <button type="button" className="strip-btn" onClick={() => api.current?.go(1)} aria-label="Next piece">
                →
              </button>
            </>
          )}
        </span>
        <span className="title">{cur.title}</span>
        <span className="label note">{cur.note}</span>
        <Link ref={openRef} href={cur.href} className="label open">
          Open <span className="arrow" aria-hidden="true">↗</span>
        </Link>
      </div>
    </div>
  );
}
