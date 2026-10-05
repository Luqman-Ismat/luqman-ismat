"use client";
import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import { animate, stagger, splitText } from "animejs";
import { chapters, journey } from "@/lib/journey";
import { scrollToTarget } from "@/lib/scroll";
import { colourways, colourwayById } from "@/lib/indus/collection";
import { GarmentFlat } from "@/components/indus/garment-flat";
import { HoldButton } from "./hold-button";

const JourneyScene = dynamic(() => import("./scene"), { ssr: false });

const fallbackImage: Record<string, string> = {
  controls: "/images/work/project-controls.webp",
  integrations: "/images/work/connected-operations.webp",
  engineering: "/images/consulting/engivault-calculator.png",
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

/* The homepage as a journey: a fixed WebGL world behind chapters of text.
   Scroll position drives the camera; each chapter can be acted on. */
export function HomeJourney() {
  const root = useRef<HTMLDivElement>(null);
  const [gl, setGl] = useState<boolean | null>(null);
  const [active, setActive] = useState(0);
  const [colourway, setColourway] = useState("tech");
  const drag = useRef<{ x: number } | null>(null);

  useEffect(() => {
    // Feature detection has to run in the browser, after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setGl(hasWebGL());
  }, []);

  // scroll → continuous chapter position
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

  // pointer parallax
  useEffect(() => {
    const move = (e: globalThis.PointerEvent) => {
      journey.pointer.x = (e.clientX / innerWidth) * 2 - 1;
      journey.pointer.y = (e.clientY / innerHeight) * 2 - 1;
    };
    addEventListener("pointermove", move, { passive: true });
    return () => removeEventListener("pointermove", move);
  }, []);

  // keyboard: arrows / page keys / numbers move between chapters
  useEffect(() => {
    const go = (i: number) => {
      const el = root.current?.querySelectorAll<HTMLElement>(".chapter")[Math.max(0, Math.min(chapters.length - 1, i))];
      if (el) scrollToTarget(el);
    };
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest("input, textarea, select, button, [contenteditable]") || document.documentElement.classList.contains("menu-open")) return;
      const at = Math.round(journey.position);
      if (e.key === "ArrowDown" || e.key === "PageDown") { e.preventDefault(); go(at + 1); }
      else if (e.key === "ArrowUp" || e.key === "PageUp") { e.preventDefault(); go(at - 1); }
      else if (/^[1-7]$/.test(e.key)) go(Number(e.key) - 1);
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, []);

  // chapter text enters word by word as it becomes active
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

  // drag the exchanger
  const onDown = (e: PointerEvent) => { drag.current = { x: e.clientX }; };
  const onMove = (e: PointerEvent) => {
    if (!drag.current) return;
    journey.spin += (e.clientX - drag.current.x) * 0.008;
    drag.current.x = e.clientX;
  };
  const onUp = () => { drag.current = null; };

  return (
    <div ref={root} className={gl === false ? "journey no-webgl" : "journey"} data-active={chapters[active].id}>
      <div className="journey-stage" aria-hidden="true">{gl && <JourneyScene colourway={colourway} />}</div>

      <nav className="journey-rail" aria-label="Chapters">
        <ol>
          {chapters.map((c, i) => (
            <li key={c.id}>
              <button type="button" onClick={() => goTo(i)} aria-current={active === i ? "step" : undefined}>
                <span className="rail-label">{c.kicker.split("·")[0].trim()}</span>
                <span className="rail-tick">{c.index}</span>
              </button>
            </li>
          ))}
        </ol>
      </nav>

      {chapters.map((c, i) => (
        <section
          key={c.id}
          id={`chapter-${c.id}`}
          className={`chapter chapter-${c.id}${active === i ? " is-active" : ""}`}
          aria-labelledby={`chapter-${c.id}-title`}
        >
          {c.id === "engineering" && (
            <div className="chapter-drag" onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerLeave={onUp} aria-hidden="true" data-cursor="Drag" />
          )}
          <div className="chapter-copy">
            <p className="chapter-kicker chapter-fade"><span>{c.index}</span>{c.kicker}</p>
            {i === 0 ? (
              <h1 id={`chapter-${c.id}-title`} className="chapter-title chapter-title-xl">
                Luqman <em className="accent-serif">Ismat</em>
              </h1>
            ) : (
              <h2 id={`chapter-${c.id}-title`} className="chapter-title">
                {c.title} <em className="accent-serif">{c.accent}</em>
              </h2>
            )}
            {i === 0 && <p className="chapter-statement chapter-fade">{c.title} <em className="accent-serif">{c.accent}</em></p>}
            <p className="chapter-text chapter-fade">{c.text}</p>
            {c.hold && gl && <div className="chapter-fade"><HoldButton id={c.id} {...c.hold} /></div>}
            {c.id === "indus" && (
              <div className="chapter-fade chapter-colourways" role="radiogroup" aria-label="Colourway">
                <button type="button" role="radio" aria-checked={colourway === "tech"} onClick={() => setColourway("tech")} title="Technical line drawing">
                  <span style={{ background: "#fff" }} />
                  Technical
                </button>
                {colourways.map((cw) => (
                  <button key={cw.id} type="button" role="radio" aria-checked={colourway === cw.id} onClick={() => setColourway(cw.id)} title={`${cw.name} · ${cw.meaning}`}>
                    <span style={{ background: cw.ground }} />
                    {cw.name}
                  </button>
                ))}
              </div>
            )}
            <div className="chapter-links chapter-fade">
              {c.links.map((l, k) => {
                const external = l.href.startsWith("http") || l.href.startsWith("mailto:");
                const cls = k === 0 ? "pill pill-solid" : "pill pill-ghost";
                const inner = (<><span className="pill-text">{l.label}</span><span className="pill-icon" aria-hidden="true">↗</span></>);
                return external ? (
                  <a key={l.href} href={l.href} className={cls} target={l.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer">{inner}</a>
                ) : (
                  <Link key={l.href} href={l.href} className={cls}>{inner}</Link>
                );
              })}
            </div>
          </div>
          {gl === false && (
            <div className="chapter-fallback">
              {c.id === "indus" ? (
                <GarmentFlat slug="pashk-coat" view="front" mode={colourway === "tech" ? "technical" : "rendered"} colourway={colourwayById(colourway === "tech" ? "shir" : colourway)} title="Pashk Coat front" />
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

