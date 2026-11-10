"use client";
/* One small, live, code-drawn visual per service. Each is the shape of the
   thing the service produces, not a stock illustration. All fictional. */
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { LiveChart } from "./live-chart";

function useIn(ref: React.RefObject<HTMLElement | SVGSVGElement | null>, fn: (el: Element) => void) {
  useEffect(() => {
    const el = ref.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => fn(el));
    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
const st = (el: Element, start = "top 80%") => ({ trigger: el, start, once: true as const });

/* 01 Websites: a page assembles itself, then switches to a phone. */
function Websites() {
  const ref = useRef<SVGSVGElement>(null);
  useIn(ref, (el) => {
    const tl = gsap.timeline({ scrollTrigger: st(el), repeat: -1, repeatDelay: 2.4, yoyo: true });
    tl.from(el.querySelectorAll(".ws-blk"), { scaleY: 0, transformOrigin: "top", duration: 0.9, ease: "expo.out", stagger: 0.08 })
      .from(el.querySelectorAll(".ws-txt"), { scaleX: 0, transformOrigin: "left", duration: 0.6, ease: "expo.out", stagger: 0.05 }, "-=0.5")
      .to(el.querySelector(".ws-desk"), { x: -40, opacity: 0.35, duration: 1, ease: "expo.inOut" }, "+=1.2")
      .from(el.querySelector(".ws-phone"), { y: 30, opacity: 0, duration: 1, ease: "expo.out" }, "<0.2");
  });
  return (
    <svg ref={ref} viewBox="0 0 640 300" className="sv" role="img" aria-label="A web page laying itself out, then the same page on a phone.">
      <g className="ws-desk">
        <rect x="60" y="30" width="400" height="240" rx="3" className="sv-frame" />
        <rect x="60" y="30" width="400" height="22" rx="3" className="sv-frame sv-fill" />
        <rect x="76" y="70" width="180" height="70" className="ws-blk sv-fill" />
        <rect x="76" y="150" width="120" height="8" className="ws-txt sv-txt" />
        <rect x="76" y="166" width="170" height="8" className="ws-txt sv-txt" />
        <rect x="76" y="182" width="90" height="8" className="ws-txt sv-txt" />
        <rect x="276" y="70" width="168" height="100" className="ws-blk sv-acc" />
        <rect x="76" y="212" width="112" height="34" className="ws-blk sv-frame" />
        <rect x="276" y="190" width="168" height="8" className="ws-txt sv-txt" />
        <rect x="276" y="206" width="130" height="8" className="ws-txt sv-txt" />
      </g>
      <g className="ws-phone">
        <rect x="500" y="40" width="100" height="220" rx="12" className="sv-frame" />
        <rect x="512" y="64" width="76" height="46" className="sv-acc" />
        <rect x="512" y="120" width="60" height="6" className="sv-txt" />
        <rect x="512" y="132" width="72" height="6" className="sv-txt" />
        <rect x="512" y="144" width="48" height="6" className="sv-txt" />
        <rect x="512" y="170" width="76" height="30" className="sv-frame" />
        <rect x="512" y="210" width="76" height="34" className="sv-fill" />
      </g>
    </svg>
  );
}

/* 03 Payments: an invoice sends, a card is charged, a booking lands. */
function Payments() {
  const ref = useRef<SVGSVGElement>(null);
  const [n, setN] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setN((v) => (v + 1) % 4), 2200);
    return () => clearInterval(id);
  }, []);
  useIn(ref, (el) => {
    gsap.from(el.querySelectorAll(".py-row"), { opacity: 0, y: 10, duration: 0.8, stagger: 0.1, ease: "expo.out", scrollTrigger: st(el) });
  });
  const rows = [
    ["INV-0231", "Site rebuild, phase 1", "$1,500.00", "Paid"],
    ["INV-0232", "Monthly care", "$180.00", "Sent"],
    ["BK-1180", "Consult, Thu 10:30", "$0.00", "Booked"],
    ["INV-0233", "Dashboard sprint", "$3,000.00", "Draft"],
  ];
  return (
    <svg ref={ref} viewBox="0 0 640 300" className="sv" role="img" aria-label="An invoice list: one paid, one sent, one booking, one draft.">
      <text x="40" y="44" className="sv-head">Invoices and bookings</text>
      <text x="600" y="44" textAnchor="end" className="sv-head">This week</text>
      <line x1="40" x2="600" y1="56" y2="56" className="sv-rule strong" />
      {rows.map((r, i) => (
        <g key={r[0]} className={i === n ? "py-row is-on" : "py-row"} transform={`translate(0 ${90 + i * 48})`}>
          <text x="40" y="0" className="sv-mono">{r[0]}</text>
          <text x="150" y="0" className="sv-text">{r[1]}</text>
          <text x="440" y="0" textAnchor="end" className="sv-text">{r[2]}</text>
          <rect x="500" y="-14" width="100" height="20" rx="10" className="py-pill" />
          <text x="550" y="0" textAnchor="middle" className="sv-mono py-state">{i === n && r[3] === "Sent" ? "Paid" : r[3]}</text>
          <line x1="40" x2="600" y1="18" y2="18" className="sv-rule" />
        </g>
      ))}
      <text x="40" y="290" className="sv-mono dim">Stripe · fictional ledger</text>
    </svg>
  );
}

/* 04 Automation: a pipeline of steps lights up in order. */
function Automation() {
  const ref = useRef<SVGSVGElement>(null);
  useIn(ref, (el) => {
    const tl = gsap.timeline({ scrollTrigger: st(el), repeat: -1, repeatDelay: 1.6 });
    const nodes = el.querySelectorAll(".au-node");
    const links = el.querySelectorAll<SVGPathElement>(".au-link");
    links.forEach((p) => {
      const len = p.getTotalLength();
      p.style.strokeDasharray = `${len}`;
      p.style.strokeDashoffset = `${len}`;
    });
    nodes.forEach((nd, i) => {
      tl.to(nd, { attr: { "data-on": 1 }, duration: 0.01 }, i * 0.7).fromTo(nd.querySelector(".au-ring"), { scale: 0.6, opacity: 0.9 }, { scale: 1.8, opacity: 0, duration: 0.9, transformOrigin: "center", ease: "expo.out" }, i * 0.7);
      if (links[i]) tl.to(links[i], { strokeDashoffset: 0, duration: 0.6, ease: "power2.inOut" }, i * 0.7 + 0.15);
    });
    tl.to(el.querySelector(".au-done"), { opacity: 1, duration: 0.4 }, nodes.length * 0.7).to(el.querySelector(".au-done"), { opacity: 0, duration: 0.4 }, "+=1");
    tl.to({}, { duration: 2.5 });
    tl.add(() => {
      nodes.forEach((nd) => nd.setAttribute("data-on", "0"));
      links.forEach((p) => (p.style.strokeDashoffset = p.style.strokeDasharray));
    });
  });
  const steps = ["Form submitted", "Record created", "Invoice drafted", "Owner notified", "Filed"];
  return (
    <svg ref={ref} viewBox="0 0 640 300" className="sv" role="img" aria-label="Five steps of an automation lighting up in sequence: form submitted, record created, invoice drafted, owner notified, filed.">
      {steps.map((s, i) => {
        const x = 70 + i * 125;
        return (
          <g key={s}>
            {i < steps.length - 1 && <path className="au-link" d={`M${x + 18} 150 H${x + 107}`} />}
            <g className="au-node" data-on="0">
              <circle className="au-ring" cx={x} cy="150" r="18" />
              <circle className="au-dot" cx={x} cy="150" r="18" />
              <text x={x} y="154" textAnchor="middle" className="sv-mono au-no">0{i + 1}</text>
              <text x={x} y="200" textAnchor="middle" className="sv-mono au-lbl">{s.split(" ")[0]}</text>
              <text x={x} y="214" textAnchor="middle" className="sv-mono au-lbl">{s.split(" ").slice(1).join(" ")}</text>
            </g>
          </g>
        );
      })}
      <text x="40" y="44" className="sv-head">New customer inquiry</text>
      <text x="600" y="44" textAnchor="end" className="sv-mono au-done" opacity="0">Done in 1.8 s, no one typed anything</text>
    </svg>
  );
}

/* 05 Knowledge base: a question, then an answer with its sources. */
function Knowledge() {
  const ref = useRef<SVGSVGElement>(null);
  useIn(ref, (el) => {
    const tl = gsap.timeline({ scrollTrigger: st(el), repeat: -1, repeatDelay: 2.6 });
    tl.from(el.querySelector(".kb-q"), { opacity: 0, y: 8, duration: 0.6, ease: "expo.out" })
      .from(el.querySelectorAll(".kb-think rect"), { opacity: 0, duration: 0.3, stagger: 0.15, repeat: 2, yoyo: true })
      .from(el.querySelectorAll(".kb-a"), { scaleX: 0, transformOrigin: "left", duration: 0.5, stagger: 0.08, ease: "expo.out" })
      .from(el.querySelectorAll(".kb-src"), { opacity: 0, x: -6, duration: 0.5, stagger: 0.12, ease: "expo.out" }, "-=0.2")
      .to(el.querySelectorAll(".kb-q, .kb-a, .kb-src"), { opacity: 0, duration: 0.5 }, "+=2");
  });
  return (
    <svg ref={ref} viewBox="0 0 640 300" className="sv" role="img" aria-label="A question to a company knowledge base and an answer that cites three internal documents.">
      <rect x="40" y="30" width="560" height="36" rx="3" className="sv-frame" />
      <text x="56" y="53" className="sv-text kb-q">What is our lead time on a 6 inch flanged spool?</text>
      <g className="kb-think">
        <rect x="56" y="90" width="6" height="6" className="sv-txt" />
        <rect x="68" y="90" width="6" height="6" className="sv-txt" />
        <rect x="80" y="90" width="6" height="6" className="sv-txt" />
      </g>
      <rect x="56" y="110" width="420" height="8" className="kb-a sv-txt" />
      <rect x="56" y="126" width="480" height="8" className="kb-a sv-txt" />
      <rect x="56" y="142" width="300" height="8" className="kb-a sv-txt" />
      {["Fabrication SOP v4, p.12", "Supplier terms, 2026", "Last 30 orders, ERP"].map((s, i) => (
        <g key={s} className="kb-src" transform={`translate(56 ${184 + i * 28})`}>
          <rect x="0" y="-12" width="14" height="16" className="sv-acc" />
          <text x="24" y="0" className="sv-mono">{s}</text>
        </g>
      ))}
      <text x="600" y="276" textAnchor="end" className="sv-mono dim">Answers cite your documents, or say they cannot</text>
    </svg>
  );
}

/* 06 Dashboards: the live chart. */
function Dashboards() {
  return <LiveChart />;
}

/* 07 Integrations: systems that connect; a record travels between them. */
function Integrations() {
  const ref = useRef<SVGSVGElement>(null);
  useIn(ref, (el) => {
    const paths = el.querySelectorAll<SVGPathElement>(".ig-link");
    paths.forEach((p) => {
      const len = p.getTotalLength();
      gsap.fromTo(p, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, duration: 1.4, ease: "expo.inOut", scrollTrigger: st(el) });
    });
    const dot = el.querySelector(".ig-dot");
    gsap.set(dot, { opacity: 0 });
    const tl = gsap.timeline({ scrollTrigger: st(el), repeat: -1, delay: 1.5 });
    paths.forEach((p) => {
      tl.set(dot, { opacity: 1 }).to(dot, { duration: 1.1, ease: "power1.inOut", motionPath: undefined, onUpdate() {
        const t = this.progress();
        const pt = p.getPointAtLength(t * p.getTotalLength());
        dot!.setAttribute("cx", String(pt.x)); dot!.setAttribute("cy", String(pt.y));
      } }).to(dot, { opacity: 0, duration: 0.2 });
    });
  });
  const sys = [["CRM", 90, 80], ["Accounting", 320, 50], ["Scheduler", 550, 80], ["Your site", 90, 230], ["Hub", 320, 160], ["Email", 550, 230]];
  const links = [[0, 4], [4, 1], [4, 2], [3, 4], [4, 5]];
  return (
    <svg ref={ref} viewBox="0 0 640 300" className="sv" role="img" aria-label="Six systems connected through one hub: CRM, accounting, scheduler, your site, email.">
      {links.map(([a, b]) => (
        <path key={`${a}${b}`} className="ig-link" d={`M${sys[a][1]} ${sys[a][2]} C${(Number(sys[a][1]) + Number(sys[b][1])) / 2} ${sys[a][2]}, ${(Number(sys[a][1]) + Number(sys[b][1])) / 2} ${sys[b][2]}, ${sys[b][1]} ${sys[b][2]}`} />
      ))}
      {sys.map(([n, x, y]) => (
        <g key={n} transform={`translate(${x} ${y})`}>
          <rect x="-46" y="-16" width="92" height="32" rx="2" className={n === "Hub" ? "sv-acc" : "sv-frame sv-fill"} />
          <text x="0" y="4" textAnchor="middle" className={n === "Hub" ? "sv-mono on-acc" : "sv-mono"}>{n}</text>
        </g>
      ))}
      <circle className="ig-dot" r="4" />
      <text x="40" y="284" className="sv-mono dim">One record, every system, no re-typing</text>
    </svg>
  );
}

/* 08 Engineering tools: a calculation that recomputes as an input slides. */
function Engineering() {
  const [v, setV] = useState(2.4);
  const ref = useRef<SVGSVGElement>(null);
  useIn(ref, (el) => {
    gsap.from(el.querySelectorAll(".en-row"), { opacity: 0, x: -8, duration: 0.8, stagger: 0.08, ease: "expo.out", scrollTrigger: st(el) });
  });
  const d = 0.1023, rho = 998, mu = 0.001;
  const re = (rho * v * d) / mu;
  const f = 0.3164 / Math.pow(re, 0.25);
  const dp = (f * (50 / d) * (rho * v * v)) / 2 / 1000;
  return (
    <div className="sv-wrap">
      <svg ref={ref} viewBox="0 0 640 300" className="sv" role="img" aria-label="Pressure drop in a 4 inch line at a chosen velocity, with the method written out.">
        <text x="40" y="44" className="sv-head">Pressure drop, 50 m of 4 inch schedule 40, water at 20 C</text>
        <line x1="40" x2="600" y1="56" y2="56" className="sv-rule strong" />
        {[["Velocity", `${v.toFixed(2)} m/s`], ["Reynolds number", re.toExponential(2).replace("e+", " × 10^")], ["Friction factor (Blasius)", f.toFixed(4)], ["Pressure drop", `${dp.toFixed(1)} kPa`]].map((r, i) => (
          <g key={r[0]} className="en-row" transform={`translate(0 ${90 + i * 40})`}>
            <text x="40" y="0" className="sv-text">{r[0]}</text>
            <text x="600" y="0" textAnchor="end" className={i === 3 ? "sv-mono big acc-fill" : "sv-mono"}>{r[1]}</text>
            <line x1="40" x2="600" y1="14" y2="14" className="sv-rule" />
          </g>
        ))}
        <text x="40" y="284" className="sv-mono dim">Re = ρvD/μ · f = 0.3164 Re^-0.25 · Δp = f (L/D) ρv²/2 · fictional line</text>
      </svg>
      <label className="sv-slider label">
        <span>Velocity</span>
        <input type="range" min="0.5" max="4" step="0.05" value={v} onChange={(e) => setV(Number(e.target.value))} aria-label="Velocity in metres per second" />
        <b>{v.toFixed(2)} m/s</b>
      </label>
    </div>
  );
}

/* 02 Custom visuals: shown by the visuals section itself; here a wire
   drawing of a part spinning in SVG. */
function Visuals() {
  const ref = useRef<SVGSVGElement>(null);
  useIn(ref, (el) => {
    const paths = el.querySelectorAll<SVGPathElement>(".vz-draw");
    paths.forEach((p, i) => {
      const len = p.getTotalLength();
      gsap.fromTo(p, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, duration: 1.6, delay: i * 0.08, ease: "expo.inOut", scrollTrigger: st(el) });
    });
    gsap.to(el.querySelector(".vz-rot"), { rotate: 360, duration: 28, repeat: -1, ease: "none", svgOrigin: "320 150" });
    gsap.from(el.querySelectorAll(".vz-dim"), { opacity: 0, duration: 0.8, delay: 1.6, stagger: 0.1, scrollTrigger: st(el) });
  });
  const ring = (r: number) => `M${320 + r} 150 A${r} ${r} 0 1 1 ${320 - r} 150 A${r} ${r} 0 1 1 ${320 + r} 150`;
  return (
    <svg ref={ref} viewBox="0 0 640 300" className="sv" role="img" aria-label="A wireframe flange drawn line by line, rotating slowly, with dimensions.">
      <g className="vz-rot">
        <path className="vz-draw sv-line" d={ring(110)} />
        <path className="vz-draw sv-line" d={ring(84)} />
        <path className="vz-draw sv-line acc-stroke" d={ring(46)} />
        {Array.from({ length: 8 }, (_, i) => {
          const a = (i / 8) * Math.PI * 2;
          const x = 320 + Math.cos(a) * 97, y = 150 + Math.sin(a) * 97;
          return <path key={i} className="vz-draw sv-line" d={`M${x + 7} ${y} A7 7 0 1 1 ${x - 7} ${y} A7 7 0 1 1 ${x + 7} ${y}`} />;
        })}
        <path className="vz-draw sv-line thin" d="M320 20 V280 M190 150 H450" />
      </g>
      <g className="vz-dim">
        <path className="sv-line thin" d="M470 40 V260 M465 40 H475 M465 260 H475" />
        <text x="486" y="154" className="sv-mono">Ø 220</text>
      </g>
      <g className="vz-dim">
        <path className="sv-line thin" d="M210 275 H430 M210 270 V280 M430 270 V280" />
        <text x="320" y="296" textAnchor="middle" className="sv-mono">PCD 194 · 8 × M16</text>
      </g>
      <text x="40" y="44" className="sv-head">Drawn by code, from your numbers</text>
    </svg>
  );
}

export function ServiceVisual({ id }: { id: string }) {
  switch (id) {
    case "websites": return <Websites />;
    case "visuals": return <Visuals />;
    case "payments": return <Payments />;
    case "automation": return <Automation />;
    case "knowledge": return <Knowledge />;
    case "dashboards": return <Dashboards />;
    case "integrations": return <Integrations />;
    case "engineering": return <Engineering />;
  }
  return null;
}
