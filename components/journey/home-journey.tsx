"use client";
import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { animate, stagger, splitText } from "animejs";
import { track } from "@vercel/analytics";
import { chapters, sheetHref } from "@/lib/chapters";
import { scroller, scrollToTarget } from "@/lib/scroll";
import type { MachineStationId } from "@/components/ui/agentic-factory-3d";
import { ExploreParam } from "./explore-param";
import { GarmentFlat } from "@/components/ten21/garment-flat";
import { colourwayById } from "@/lib/ten21/collection";

const Machine = dynamic(() => import("@/components/ui/agentic-factory-3d"), { ssr: false });
const ChapterSheet = dynamic(() => import("@/components/chapter/chapter-sheet"), { ssr: false });

type Sheet = { id: string; c: string | null };
const indexOf = (id: string) => chapters.findIndex((c) => c.id === id);
const isSheet = (id: string | null) => !!id && chapters.some((c) => c.id === id && c.components.length > 0);

const fallbackImage: Record<string, string> = {
  controls: "/images/work/project-controls.webp",
  integrations: "/images/work/connected-operations.webp",
  engineering: "/images/work/inspection-planning.webp",
  about: "/images/about/luqman-uh-graduation.jpg",
};

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/* The homepage: one machine, one station per chapter. Scrolling flies the
   camera to the chapter's station; Explore (or clicking a station) opens the
   chapter, where every part is a live component. */
export function HomeJourney() {
  const router = useRouter();
  const root = useRef<HTMLDivElement>(null);
  const [gl, setGl] = useState<boolean | null>(null);
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  const [exploring, setExploring] = useState<number | null>(null);
  const [sheet, setSheet] = useState<Sheet | null>(null);
  const [closing, setClosing] = useState(false);
  const [paused, setPaused] = useState(false);
  const [origin, setOrigin] = useState({ x: 0, y: 0 });
  const sheetRef = useRef<Sheet | null>(null);
  const pushed = useRef(false);

  useEffect(() => {
    // Feature detection has to run in the browser, after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setGl(hasWebGL());
  }, []);

  useEffect(() => {
    const sections = [...(root.current?.querySelectorAll<HTMLElement>(".chapter") ?? [])];
    let frame = 0;
    const update = () => {
      const mid = scrollY + innerHeight * 0.5;
      let idx = 0;
      for (let i = 0; i < sections.length; i++) if (mid >= sections[i].offsetTop) idx = i;
      activeRef.current = idx;
      setActive((a) => (a === idx ? a : idx));
    };
    const onScroll = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(update); };
    update();
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
    return () => { removeEventListener("scroll", onScroll); removeEventListener("resize", onScroll); };
  }, []);

  useEffect(() => {
    const goTo = (i: number) => {
      const el = root.current?.querySelectorAll<HTMLElement>(".chapter")[Math.max(0, Math.min(chapters.length - 1, i))];
      if (el) scrollToTarget(el);
    };
    const onKey = (e: KeyboardEvent) => {
      const html = document.documentElement;
      if ((e.target as HTMLElement).closest("input, textarea, select, button, a, [contenteditable]") || html.classList.contains("menu-open") || html.classList.contains("sheet-open")) return;
      const at = activeRef.current;
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

  /* The URL is the source of truth for the open sheet: Explore pushes
     ?s=<chapter>, Back or Close removes it, the menu can link straight to
     a chapter (and component). */
  const onParam = useCallback((s: string | null, c: string | null) => {
    const cur = sheetRef.current;
    if (isSheet(s)) {
      const i = indexOf(s!);
      if (!cur) setOrigin((o) => (o.x || o.y ? o : { x: innerWidth / 2, y: innerHeight / 2 }));
      if (!cur || cur.id !== s) {
        // put the chapter's station behind the glass (after the route's own scroll reset)
        setTimeout(() => {
          const el = root.current?.querySelectorAll<HTMLElement>(".chapter")[i];
          if (el) scrollToTarget(el, true);
        }, 60);
      }
      const next = { id: s!, c };
      sheetRef.current = next;
      setClosing(false);
      setSheet(next);
      setExploring(null);
      return;
    }
    if (!cur) return;
    // close: the glass retracts into the aperture, then the page comes back
    sheetRef.current = null;
    pushed.current = false;
    setClosing(true);
    setPaused(false);
    setTimeout(() => {
      setSheet(null);
      setClosing(false);
      setOrigin({ x: 0, y: 0 });
    }, 650);
  }, []);

  const closeSheet = useCallback(() => {
    if (pushed.current) history.back();
    else history.replaceState(null, "", "/");
  }, []);

  // while a sheet is open: page locked and inert behind it, scene paused once revealed
  useEffect(() => {
    if (!sheet) return;
    const html = document.documentElement;
    const behind = [root.current, document.querySelector<HTMLElement>(".site-footer")].filter((x): x is HTMLElement => !!x);
    html.classList.add("sheet-open");
    behind.forEach((el) => el.setAttribute("inert", ""));
    scroller.lenis?.stop();
    return () => {
      html.classList.remove("sheet-open");
      behind.forEach((el) => el.removeAttribute("inert"));
      scroller.lenis?.start();
    };
  }, [sheet]);
  useEffect(() => {
    if (!sheet || closing) return;
    const t = setTimeout(() => setPaused(true), 1000);
    return () => clearTimeout(t);
  }, [sheet, closing]);

  /* Explore: fly the camera to the chapter's station, then open the chapter
     as a sheet (work chapters) or navigate (About, Contact). */
  const open = (i: number, via: "button" | "station", at?: { x: number; y: number }) => {
    const c = chapters[i];
    track("chapter_opened", { chapter: c.id, via });
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fly = !!gl && !reduced && !!c.machine;
    if (!isSheet(c.id)) {
      router.prefetch(c.href);
      if (!fly) { router.push(c.href); return; }
      setExploring(i);
      setTimeout(() => router.push(c.href), 700);
      return;
    }
    setOrigin(at ?? { x: innerWidth / 2, y: innerHeight / 2 });
    const push = () => { pushed.current = true; history.pushState(null, "", sheetHref(c.id)); };
    if (!fly) { push(); return; }
    setExploring(i);
    setTimeout(push, 700);
  };
  const explore = (i: number, e: MouseEvent<HTMLButtonElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    open(i, "button", { x: r.left + r.width - 38, y: r.top + r.height / 2 });
  };
  const onStation = useCallback((id: MachineStationId) => {
    if (sheetRef.current) return;
    const i = chapters.findIndex((c) => c.machine === id);
    if (i >= 0) open(i, "station");
    // open() only reads refs, router and stable state setters
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gl]);

  const focusIndex = sheet ? indexOf(sheet.id) : exploring ?? active;
  const focus = chapters[focusIndex]?.machine ?? null;

  return (
    <div ref={root} className={`journey${gl === false ? " no-webgl" : ""}${exploring !== null ? " is-exploring" : ""}${sheet ? " has-sheet" : ""}`} data-active={chapters[active].id}>
      <div className="journey-stage">
        {gl && <Machine embed height="100%" focus={focus} paused={paused} onStation={onStation} />}
      </div>
      <Suspense fallback={null}><ExploreParam onChange={onParam} /></Suspense>
      {sheet && createPortal(
        <ChapterSheet chapter={chapters[indexOf(sheet.id)]} focus={sheet.c} origin={origin} closing={closing} onClose={closeSheet} />,
        document.body,
      )}

      <nav className="journey-rail" aria-label="Chapters">
        <ol>
          {chapters.map((c, i) => (
            <li key={c.id}>
              <button type="button" onClick={() => goTo(i)} aria-current={active === i ? "step" : undefined}>
                <span className="rail-label">{c.nav}</span>
                <span className="rail-tick" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ol>
      </nav>

      {chapters.map((c, i) => (
        <section key={c.id} id={`chapter-${c.id}`} className={`chapter chapter-${c.id}${active === i ? " is-active" : ""}`} aria-labelledby={`chapter-${c.id}-title`}>
          <div className="chapter-copy">
            {i === 0 ? (
              <>
                <h1 id={`chapter-${c.id}-title`} className="chapter-title chapter-title-xl">Luqman <em>Ismat</em></h1>
                <p className="chapter-statement chapter-fade">{c.title}</p>
              </>
            ) : (
              <h2 id={`chapter-${c.id}-title`} className="chapter-title">{c.title}{c.accent && <> <em>{c.accent}</em></>}</h2>
            )}
            <p className="chapter-text chapter-fade">{c.lede}</p>
            {c.explore && (
              <div className="chapter-fade">
                {c.id === "contact" ? (
                  <Link href={c.href} className="explore-btn"><span>{c.explore}</span><i aria-hidden="true"><ArrowUpRight size={20} strokeWidth={1.75} /></i></Link>
                ) : (
                  <button type="button" className="explore-btn" onClick={(e) => explore(i, e)} aria-haspopup={c.components.length > 0 ? "dialog" : undefined}>
                    <span>Explore</span>
                    <i aria-hidden="true"><ArrowRight size={20} strokeWidth={1.75} /></i>
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
        </section>
      ))}
    </div>
  );
}
