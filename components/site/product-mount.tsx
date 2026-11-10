"use client";
import { useEffect, useRef, useState } from "react";

type Kind = "project" | "inspection";
type Registry = Record<string, { mount: (el: HTMLElement, options?: { view?: number; bare?: boolean }) => () => void }>;
declare global {
  interface Window {
    __demos?: Registry;
  }
}

const loading: Partial<Record<Kind, Promise<void>>> = {};
function loadBundle(kind: Kind) {
  if (window.__demos?.[kind]) return Promise.resolve();
  loading[kind] ??= new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = `/examples/${kind}/app.js`;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => {
      loading[kind] = undefined;
      reject(new Error(`Could not load the ${kind} application`));
    };
    document.body.appendChild(s);
  });
  return loading[kind]!;
}

/* The whole application, mounted straight into the page (no iframe). */
export function ProductMount({ kind, label, view }: { kind: Kind; label: string; view?: number }) {
  const host = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let unmount: (() => void) | undefined;
    let live = true;
    loadBundle(kind)
      .then(() => {
        if (!live) return;
        unmount = window.__demos![kind].mount(el, view != null ? { view, bare: true } : undefined);
        requestAnimationFrame(() => {
          if (!live) return;
          el.classList.add("is-ready");
          setState("ready");
          window.dispatchEvent(new Event("resize"));
        });
      })
      .catch(() => live && setState("error"));
    return () => {
      live = false;
      unmount?.();
    };
  }, [kind, view]);

  return (
    <div className={view != null ? "product-stage is-view" : "product-stage"} aria-label={label}>
      <link rel="stylesheet" href={`/examples/${kind}/scoped.css`} precedence="demo" />
      {state !== "ready" && (
        <div className="product-loading" aria-live="polite">
          <svg viewBox="0 0 400 140" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0 20H400M0 60H400M0 100H400M60 0V140M200 0V140M330 0V140" />
            <path className="bar" d="M70 34H190M90 74H300M150 114H320" />
          </svg>
          <span className="label">{state === "error" ? "The application could not load. Reload the page to try again." : "(Loading the application)"}</span>
        </div>
      )}
      <div ref={host} className="demo-scope" />
    </div>
  );
}
