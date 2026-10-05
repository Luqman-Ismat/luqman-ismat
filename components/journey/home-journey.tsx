"use client";
import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import { animate, stagger, splitText } from "animejs";
import { chapters } from "@/lib/chapters";
import { journey, focusStation, explodeStation } from "@/lib/journey";
import { scrollToTarget } from "@/lib/scroll";
import { GarmentFlat } from "@/components/ten21/garment-flat";
import { colourwayById } from "@/lib/ten21/collection";

const JourneyScene = dynamic(() => import("./scene"), { ssr: false });

const fallbackImage: Record<string, string> = {
  controls: "/images/work/project-controls.webp",
  integrations: "/images/work/connected-operations.webp",
  engineering: "/images/work/inspection-planning.webp",
  about: "/images/luqman-portrait-blue.jpeg",
};

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/* The homepage: one scene, seven stations. Each chapter says one thing and
   offers one action. Explore explodes the station into its parts and opens
   the chapter, where every part is a live component. */
export function HomeJourney() {
  const router = useRouter();
  const root = useRef<HTMLDivElement>(null);
  const [gl, setGl] = useState<boolean | null>(null);
  const [active, setActive] = useState(0);
  const [exploring, setExploring] = useState<number | null>(null);
  const drag = useRef<{ x: number } | null>(null);

  useEffect(() => {
    // Feature detection has to run in the browser, after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setGl(hasWebGL());
    journey.focus = -1;
    journey.explode.fill(0);
    return () => { journey.focus = -1; journey.explode.fill(0); };
  }, []);

  useEffect(() => {
    const sections = [...(root.current?.querySelectorAll<HTMLElement>(".chapter") ?? [])];
    let frame = 0;
    const update = () => {
      const mid = scrollY + innerHeight * 0.5;
      let pos = 0;
      for (let i = 0; i < sections.length; i++) {
        const top = sections[i].offsetTop, h = sections[i].offsetHeight;
        if (mid >= top) pos = i + Math.min(1, (mid - top) / h) - 0.5;
      }
      journey.position = Math.max(0, Math.min(sections.length - 1, pos));
      const idx = Math.round(journey.position);
      setActive((a) => (a === idx ? a : idx));
    };
    const onScroll = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(update); };
    update();
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
    return () => { removeEventListener("scroll", onScroll); removeEventListener("resize", onScroll); };
  }, []);

  useEffect(() => {
    const move = (e: globalThis.PointerEvent) => {
      journey.pointer.x = (e.clientX / innerWidth) * 2 - 1;
      journey.pointer.y = (e.clientY / innerHeight) * 2 - 1;
    };
    addEventListener("pointermove", move, { passive: true });
    return () => removeEventListener("pointermove", move);
  }, []);

  useEffect(() => {
    const goTo = (i: number) => {
      const el = root.current?.querySelectorAll<HTMLElement>(".chapter")[Math.max(0, Math.min(chapters.length - 1, i))];
      if (el) scrollToTarget(el);
    };
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest("input, textarea, select, button, a, [contenteditable]") || document.documentElement.classList.contains("menu-open")) return;
      const at = Math.round(journey.position);
      if (e.key === "ArrowDown" || e.key === "PageDown") { e.preventDefault(); goTo(at + 1); }
      else if (e.key === "ArrowUp" || e.key === "PageUp") { e.preventDefault(); goTo(at - 1); }
      else if (/^[1-7]$/.test(e.key)) goTo(Number(e.key) - 1);
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = root.current?.querySelectorAll<HTMLElement>(".chapter")[active];
    if (!el || el.dataset.entered) return;
    el.dataset.entered = "1";
    const title = el.querySelector(".chapter-title");
    const split = title ? splitText(title as HTMLElement, { words: { wrap: "clip" } }) : null;
    if (split) animate(split.words, { y: ["105%", "0%"], duration: 1000, delay: stagger(55), ease: "outExpo" });
    animate(el.querySelectorAll(".chapter-fade"), { opacity: [0, 1], y: [20, 0], duration: 800, delay: stagger(80, { start: 250 }), ease: "outQuart" });
  }, [active]);

  const goTo = (i: number) => {
    const el = root.current?.querySelectorAll<HTMLElement>(".chapter")[i];
    if (el) scrollToTarget(el);
  };

  /* Explode the station, push the camera in, then open the chapter. */
  const explore = (i: number, href: string) => {
    router.prefetch(href);
    if (!gl || matchMedia("(prefers-reduced-motion: reduce)").matches) { router.push(href); return; }
    setExploring(i);
    focusStation(i);
    const s = { v: 0 };
    animate(s, { v: 1, duration: 1150, ease: "inOutCubic", onUpdate: () => explodeStation(i, s.v) });
    setTimeout(() => router.push(href), 1050);
  };

  const onDown = (e: PointerEvent) => { drag.current = { x: e.clientX }; };
  const onMove = (e: PointerEvent) => {
    if (!drag.current) return;
    journey.spin += (e.clientX - drag.current.x) * 0.008;
    drag.current.x = e.clientX;
  };
  const onUp = () => { drag.current = null; };

  return (
    <div ref={root} className={`journey${gl === false ? " no-webgl" : ""}${exploring !== null ? " is-exploring" : ""}`} data-active={chapters[active].id}>
      <div className="journey-stage" aria-hidden="true">{gl && <JourneyScene />}</div>

      <nav className="journey-rail" aria-label="Chapters">
        <ol>
          {chapters.map((c, i) => (
            <li key={c.id}>
              <button type="button" onClick={() => goTo(i)} aria-current={active === i ? "step" : undefined}>
                <span className="rail-label">{c.nav}</span>
                <span className="rail-tick">{c.index}</span>
              </button>
            </li>
          ))}
        </ol>
      </nav>

      {chapters.map((c, i) => (
        <section key={c.id} id={`chapter-${c.id}`} className={`chapter chapter-${c.id}${active === i ? " is-active" : ""}`} aria-labelledby={`chapter-${c.id}-title`}>
          {c.station === "exchanger" && (
            <div className="chapter-drag" onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerLeave={onUp} aria-hidden="true" data-cursor="Drag" />
          )}
          <div className="chapter-copy">
            <p className="chapter-kicker chapter-fade"><span>{c.index}</span>{c.kicker}</p>
            {i === 0 ? (
              <>
                <h1 id={`chapter-${c.id}-title`} className="chapter-title chapter-title-xl">Luqman <em className="accent-serif">Ismat</em></h1>
                <p className="chapter-statement chapter-fade">{c.title} <em className="accent-serif">{c.accent}</em></p>
              </>
            ) : (
              <h2 id={`chapter-${c.id}-title`} className="chapter-title">{c.title} <em className="accent-serif">{c.accent}</em></h2>
            )}
            <p className="chapter-text chapter-fade">{c.lede}</p>
            {c.explore && (
              <div className="chapter-fade">
                {c.id === "contact" ? (
                  <Link href={c.href} className="explore-btn"><span>{c.explore}</span><i aria-hidden="true">↗</i></Link>
                ) : (
                  <button type="button" className="explore-btn" onClick={() => explore(i, c.href)} data-cursor="Explore">
                    <span>Explore</span>
                    <i aria-hidden="true">
                      <svg viewBox="0 0 24 24"><path d="M4 12h16M12 4v16M6.5 6.5l11 11M17.5 6.5l-11 11" /></svg>
                    </i>
                    <small>{c.components.length > 0 ? `${c.components.length} live components` : c.nav}</small>
                  </button>
                )}
              </div>
            )}
          </div>
          {gl === false && (
            <div className="chapter-fallback">
              {c.id === "ten21" ? (
                <GarmentFlat slug="pashk-coat" view="front" mode="technical" colourway={colourwayById("shir")} title="Pashk Coat front" />
              ) : fallbackImage[c.id] ? (
                <Image src={fallbackImage[c.id]} alt="" fill sizes="50vw" />
              ) : null}
            </div>
          )}
          {i === 0 && (
            <button type="button" className="journey-cue chapter-fade" onClick={() => goTo(1)}>
              <span>Scroll, or press ↓</span>
              <i aria-hidden="true" />
            </button>
          )}
        </section>
      ))}
    </div>
  );
}
