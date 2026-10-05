"use client";
import { useEffect, useRef, useState } from "react";

type Kind = "project" | "inspection";
type Registry = Record<string, { mount: (el: HTMLElement, options?: { view?: number; bare?: boolean }) => () => void }>;
declare global {
  interface Window { __demos?: Registry }
}

const loading: Partial<Record<Kind, Promise<void>>> = {};
function loadBundle(kind: Kind) {
  if (window.__demos?.[kind]) return Promise.resolve();
  loading[kind] ??= new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = `/examples/${kind}/app.js`;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`Could not load the ${kind} application`));
    document.body.appendChild(s);
  });
  return loading[kind]!;
}

/* One working component, mounted straight into the page (no iframe) only
   when it comes near the viewport, so a chapter with several components
   stays fast. While it loads, a wireframe skeleton assembles itself. */
export function LiveView({ kind, view, label }: { kind: Kind; view?: number; label: string }) {
  const host = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"idle" | "loading" | "ready" | "error">("idle");
  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let unmount: (() => void) | undefined;
    let live = true;
    const io = new IntersectionObserver(([en]) => {
      if (!en.isIntersecting) return;
      io.disconnect();
      setState("loading");
      loadBundle(kind)
        .then(() => {
          if (!live) return;
          unmount = window.__demos![kind].mount(el, kind === "project" ? { view, bare: true } : {});
          requestAnimationFrame(() => live && setState("ready"));
        })
        .catch(() => live && setState("error"));
    }, { rootMargin: "500px 0px" });
    io.observe(el);
    return () => { live = false; io.disconnect(); unmount?.(); };
  }, [kind, view]);
  return (
    <div className={`live-view is-${state}`} aria-label={label}>
      <link rel="stylesheet" href={`/examples/${kind}/scoped.css`} precedence="demo" />
      {state !== "ready" && (
        <div className="live-skeleton" aria-hidden="true">
          <svg viewBox="0 0 400 140" preserveAspectRatio="none">
            <path d="M0 20H400M0 60H400M0 100H400M60 0V140M200 0V140M330 0V140" />
            <path className="live-skeleton-bar" d="M70 34H190M90 74H300M150 114H320" />
          </svg>
          <span>{state === "error" ? "This component could not load." : "Assembling the working component…"}</span>
        </div>
      )}
      <div ref={host} className="demo-scope" />
    </div>
  );
}
