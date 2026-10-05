"use client";
import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { Component } from "@/lib/chapters";
import { PartGlyph } from "./part-glyph";
import { LiveView } from "./live-view";
import { PlantSchematic, type Hotspot } from "@/components/engivault/plant-schematic";

/* One exploded part, re-assembled as a live component: it rises into place
   in 3D as it enters, its plate traces itself in, and the explanation sits
   beside the working thing. */
export function ComponentSection({ c, n, hotspots = [], children }: { c: Component; n: string; hotspots?: Hotspot[]; children?: ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([en]) => { if (en.isIntersecting) { setInView(true); io.disconnect(); } }, { threshold: 0.08 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <section ref={ref} id={c.id} className={inView ? "cmp is-in" : "cmp"} aria-labelledby={`${c.id}-title`}>
      <header className="cmp-head">
        <div className="cmp-glyph"><PartGlyph part={c.part} /></div>
        <div className="cmp-title">
          <p className="cmp-n">Component {n}</p>
          <h2 id={`${c.id}-title`}>{c.title}</h2>
        </div>
        <div className="cmp-explain">
          <p className="cmp-purpose">{c.explain.purpose}</p>
          <p className="cmp-how">{c.explain.how}</p>
          {c.explain.steps.length > 0 && (
            <ol className="cmp-steps">
              {c.explain.steps.map((s, i) => <li key={i}><span>{String(i + 1).padStart(2, "0")}</span>{s}</li>)}
            </ol>
          )}
        </div>
      </header>
      <div className="cmp-panel">
        {c.kind === "project-view" && <LiveView kind="project" view={c.view} label={`${c.title}, working component with fictional data`} />}
        {c.kind === "inspection" && (
          <>
            <ul className="cmp-areas">
              {c.areas.map((a) => <li key={a.name}><b>{a.name}</b>{a.text}</li>)}
            </ul>
            <LiveView kind="inspection" label="Inspection planning workbench with fictional assets" />
          </>
        )}
        {c.kind === "calculators" && (
          <>
            <PlantSchematic hotspots={hotspots} />
            <div className="cmp-foot"><Link href="/engivault" className="pill pill-solid"><span className="pill-text">Open the full library</span><span className="pill-icon" aria-hidden="true">↗</span></Link></div>
          </>
        )}
        {c.kind === "text" && (
          <ul className="cmp-bullets">{c.bullets.map((b) => <li key={b}>{b}</li>)}</ul>
        )}
        {children}
      </div>
    </section>
  );
}
