"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { animate, stagger, svg } from "animejs";

export type Hotspot = { id: string; slug: string; tag: string; title: string; category: string };

type HotProps = { id: string; children: React.ReactNode; labelAt?: [number, number]; bubble?: [number, number]; spots: Hotspot[]; active: string | null; onActive: (id: string | null) => void };
function Hot({ id, children, labelAt, bubble, spots, active, onActive }: HotProps) {
  const h = spots.find((x) => x.id === id)!;
  return (
    <Link
      href={`/engivault/calculators/${h.slug}`}
      className={active === id ? "pid-hot is-active" : "pid-hot"}
      onPointerEnter={() => onActive(id)}
      onPointerLeave={() => onActive(null)}
      onFocus={() => onActive(id)}
      onBlur={() => onActive(null)}
      aria-label={`${h.tag}: open ${h.title}`}
     
    >
      {children}
      {labelAt && <text className="pid-tag" x={labelAt[0]} y={labelAt[1]}>{h.tag}</text>}
      {bubble && (
        <text className="pid-tag pid-tag-in" x={bubble[0]} y={bubble[1]} textAnchor="middle">
          <tspan x={bubble[0]} dy="-3">{h.tag.split(" ")[0]}</tspan>
          <tspan x={bubble[0]} dy="14">{h.tag.split(" ")[1]}</tspan>
        </text>
      )}
    </Link>
  );
}

/* An illustrative process loop drawn as a P&ID. Each piece of equipment and
   instrument links to the EngiVault calculation that describes it. */
export function PlantSchematic({ hotspots }: { hotspots: Hotspot[] }) {
  const root = useRef<SVGSVGElement>(null);
  const [active, setActive] = useState<string | null>(null);
  const spot = (id: string) => hotspots.find((h) => h.id === id)!;
  const current = active ? spot(active) : null;

  useEffect(() => {
    const el = root.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const drawn = svg.createDrawable(el.querySelectorAll(".pid-draw"));
    const a = animate(drawn, { draw: ["0 0", "0 1"], duration: 1400, delay: stagger(40), ease: "inOutQuad" });
    const b = animate(el.querySelectorAll(".pid-tag"), { opacity: [0, 1], translateY: [6, 0], duration: 600, delay: stagger(60, { start: 900 }), ease: "outQuart" });
    return () => { a.revert(); b.revert(); };
  }, []);

  return (
    <div className="plant">
      <svg ref={root} viewBox="0 0 1000 540" className="plant-svg" role="group" aria-label="Interactive process schematic. Each item opens a calculator.">
        <defs>
          <pattern id="pid-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <path d="M0 0v6" className="pid-hatch-line" />
          </pattern>
          <marker id="pid-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M0 0 10 5 0 10z" className="pid-arrowhead" />
          </marker>
        </defs>

        {/* process lines */}
        <g className="pid-lines">
          <path className="pid-draw pid-line" d="M130 400V470H322" />
          <path className="pid-draw pid-line" d="M360 440V300H520" />
          <path className="pid-draw pid-line" d="M760 300H842" />
          <path className="pid-draw pid-line" d="M878 300H980" markerEnd="url(#pid-arrow)" />
          <path className="pid-flow" d="M130 400V470H322" />
          <path className="pid-flow" d="M360 440V300H520" />
          <path className="pid-flow" d="M760 300H842M878 300H980" />
        </g>

        <Hot spots={hotspots} active={active} onActive={setActive} id="vessel" labelAt={[96, 96]}>
          <path className="pid-draw pid-equip" d="M70 140a60 30 0 0 1 120 0V370a60 30 0 0 1-120 0Z" />
          <path className="pid-draw pid-level" d="M72 205q14-6 29 0t29 0 29 0 29 0" />
          <rect className="pid-hit" x="60" y="100" width="140" height="310" />
        </Hot>

        <Hot spots={hotspots} active={active} onActive={setActive} id="level" bubble={[260, 180]}>
          <path className="pid-draw pid-signal" d="M190 180H236" />
          <circle className="pid-draw pid-bubble" cx="260" cy="180" r="24" />
          <rect className="pid-hit" x="226" y="146" width="68" height="68" />
        </Hot>

        <Hot spots={hotspots} active={active} onActive={setActive} id="suction" labelAt={[200, 494]}>
          <rect className="pid-hit" x="120" y="455" width="200" height="30" />
        </Hot>

        <Hot spots={hotspots} active={active} onActive={setActive} id="pump" labelAt={[338, 528]}>
          <circle className="pid-draw pid-equip" cx="360" cy="470" r="30" />
          <path className="pid-draw pid-equip" d="M336 452 360 440 384 452M345 492 375 492" />
          <rect className="pid-hit" x="326" y="436" width="68" height="70" />
        </Hot>

        <Hot spots={hotspots} active={active} onActive={setActive} id="shaft" labelAt={[383, 438]}>
          <path className="pid-draw pid-shaft" d="M390 470H424" />
          <rect className="pid-hit" x="390" y="458" width="34" height="24" />
        </Hot>

        <Hot spots={hotspots} active={active} onActive={setActive} id="motor" labelAt={[438, 522]}>
          <rect className="pid-draw pid-equip" x="424" y="446" width="66" height="48" rx="4" />
          <text className="pid-glyph" x="457" y="477">M</text>
          <rect className="pid-hit" x="420" y="440" width="76" height="60" />
        </Hot>

        <Hot spots={hotspots} active={active} onActive={setActive} id="discharge" labelAt={[318, 376]}>
          <rect className="pid-hit" x="346" y="316" width="28" height="120" />
        </Hot>

        <Hot spots={hotspots} active={active} onActive={setActive} id="flow" bubble={[440, 240]}>
          <path className="pid-draw pid-equip" d="M434 286V314M446 286V314" />
          <path className="pid-draw pid-signal" d="M440 286V264" />
          <circle className="pid-draw pid-bubble" cx="440" cy="240" r="24" />
          <rect className="pid-hit" x="410" y="206" width="60" height="112" />
        </Hot>

        <Hot spots={hotspots} active={active} onActive={setActive} id="exchanger" labelAt={[610, 368]}>
          <path className="pid-draw pid-equip" d="M540 270H740a20 30 0 0 1 0 60H540a20 30 0 0 1 0-60Z" />
          <path className="pid-draw pid-tubes" d="M548 286H732M548 300H732M548 314H732" />
          <path className="pid-draw pid-equip" d="M580 270V330M700 270V330" />
          <rect className="pid-hit" x="516" y="262" width="248" height="78" />
        </Hot>

        <Hot spots={hotspots} active={active} onActive={setActive} id="steam" labelAt={[612, 110]}>
          <path className="pid-draw pid-line pid-steam" d="M620 130V270" markerEnd="url(#pid-arrow)" />
          <path className="pid-draw pid-line pid-steam" d="M700 330V410" markerEnd="url(#pid-arrow)" />
          <text className="pid-note" x="716" y="400">COND.</text>
          <rect className="pid-hit" x="600" y="120" width="40" height="150" />
        </Hot>

        <Hot spots={hotspots} active={active} onActive={setActive} id="temperature" bubble={[800, 250]}>
          <path className="pid-draw pid-signal" d="M800 300V274" />
          <circle className="pid-draw pid-bubble" cx="800" cy="250" r="24" />
          <rect className="pid-hit" x="770" y="216" width="60" height="90" />
        </Hot>

        <Hot spots={hotspots} active={active} onActive={setActive} id="valve" labelAt={[840, 360]}>
          <path className="pid-draw pid-equip" d="M842 286 878 314V286L842 314Z" />
          <path className="pid-draw pid-equip" d="M860 300V266M842 266a18 14 0 0 1 36 0Z" />
          <rect className="pid-hit" x="834" y="246" width="52" height="76" />
        </Hot>

        <Hot spots={hotspots} active={active} onActive={setActive} id="insulation" labelAt={[912, 340]}>
          <rect className="pid-insul" x="890" y="290" width="80" height="20" />
          <rect className="pid-hit" x="886" y="282" width="92" height="36" />
        </Hot>

        <text className="pid-note" x="980" y="282" textAnchor="end">TO PROCESS</text>
        <text className="pid-title" x="20" y="26">V-101 · P-101 · E-101 · FV-104  —  illustrative loop</text>
      </svg>

      <div className={current ? "plant-card is-on" : "plant-card"} aria-live="polite">
        {current ? (
          <>
            <span className="plant-card-tag">{current.tag} · {current.category}</span>
            <strong>{current.title}</strong>
            <span className="plant-card-go">Open calculation →</span>
          </>
        ) : (
          <>
            <span className="plant-card-tag">Interactive schematic</span>
            <strong>Select any equipment or instrument</strong>
            <span className="plant-card-go">Each one opens the calculation behind it</span>
          </>
        )}
      </div>
    </div>
  );
}
