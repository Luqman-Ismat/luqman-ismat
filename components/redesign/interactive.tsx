"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode, type PointerEvent } from "react";

export function LiveClock({ zone = "America/Chicago", label = "Houston" }: { zone?: string; label?: string }) {
  const [now, setNow] = useState<string | null>(null);
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-US", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: zone, timeZoneName: "short" });
    const tick = () => setNow(fmt.format(new Date()));
    tick();
    const id = setInterval(tick, 15_000);
    return () => clearInterval(id);
  }, [zone]);
  return (
    <span className="live-clock">
      <span className="live-dot" aria-hidden="true" />
      {label} <time suppressHydrationWarning>{now ?? "--:--"}</time>
    </span>
  );
}

/* Pointer-tracked radial highlight shared by every card inside the grid. */
export function SpotlightGrid({ className, children }: { className?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const move = (e: PointerEvent<HTMLDivElement>) => {
    const grid = ref.current;
    if (!grid) return;
    for (const card of grid.querySelectorAll<HTMLElement>(".spot")) {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - r.left}px`);
      card.style.setProperty("--my", `${e.clientY - r.top}px`);
    }
  };
  return (
    <div ref={ref} className={className} onPointerMove={move}>
      {children}
    </div>
  );
}

/* Gently pulls its child toward the pointer. */
export function Magnetic({ children, strength = 0.3 }: { children: ReactNode; strength?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const move = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = ref.current!;
    const r = el.getBoundingClientRect();
    el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * strength}px, ${(e.clientY - r.top - r.height / 2) * strength}px)`;
  };
  const reset = () => { if (ref.current) ref.current.style.transform = ""; };
  return (
    <div ref={ref} className="magnetic" onPointerMove={move} onPointerLeave={reset}>
      {children}
    </div>
  );
}

type Service = { n: string; title: string; text: string; href: string; tags: string[]; image: string };

/* Numbered index; on hover a preview follows the pointer. */
export function ServiceIndex({ services }: { services: Service[] }) {
  const wrap = useRef<HTMLDivElement>(null);
  const preview = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<number | null>(null);
  const move = (e: PointerEvent<HTMLDivElement>) => {
    const r = wrap.current!.getBoundingClientRect();
    preview.current?.style.setProperty("transform", `translate3d(${e.clientX - r.left}px, ${e.clientY - r.top}px, 0) translate(-50%, -50%)`);
  };
  return (
    <div ref={wrap} className="service-list" onPointerMove={move} onPointerLeave={() => setActive(null)}>
      {services.map((s, i) => (
        <Link
          key={s.n}
          href={s.href}
          className="service-row"
          data-reveal
         
          style={{ ["--delay" as string]: `${i * 70}ms` }}
          onPointerEnter={() => setActive(i)}
          onFocus={() => setActive(null)}
        >
          <span className="service-n">{s.n}</span>
          <h3>{s.title}</h3>
          <p>{s.text}</p>
          <ul aria-label="Includes">{s.tags.map((t) => <li key={t}>{t}</li>)}</ul>
          <span className="service-arrow" aria-hidden="true">→</span>
        </Link>
      ))}
      <div ref={preview} className={active === null ? "service-preview" : "service-preview is-on"} aria-hidden="true">
        {services.map((s, i) => (
          <Image key={s.n} src={s.image} alt="" fill sizes="360px" unoptimized={s.image.endsWith(".svg")} className={i === active ? "is-active" : undefined} />
        ))}
      </div>
    </div>
  );
}
