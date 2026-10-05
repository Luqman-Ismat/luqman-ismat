"use client";
import { useRef, useState } from "react";
import { animate, type JSAnimation } from "animejs";
import { journey } from "@/lib/journey";

/* Press and hold (mouse, touch, or Space/Enter) to drive a chapter's
   interaction. Releasing early lets the progress fall back. */
export function HoldButton({ id, label, done, note }: { id: string; label: string; done: string; note?: string }) {
  const ring = useRef<SVGCircleElement>(null);
  const anim = useRef<JSAnimation | null>(null);
  const state = useRef({ v: journey.hold[id] ?? 0 });
  const [complete, setComplete] = useState(false);
  const C = 2 * Math.PI * 22;

  const draw = () => {
    journey.hold[id] = state.current.v;
    ring.current?.setAttribute("stroke-dashoffset", String(C * (1 - state.current.v)));
  };
  const start = () => {
    if (complete) return;
    anim.current?.pause();
    anim.current = animate(state.current, {
      v: 1,
      duration: 1600 * (1 - state.current.v),
      ease: "linear",
      onUpdate: draw,
      onComplete: () => {
        setComplete(true);
        navigator.vibrate?.(20);
      },
    });
  };
  const stop = () => {
    if (complete) return;
    anim.current?.pause();
    anim.current = animate(state.current, { v: 0, duration: 500 * state.current.v, ease: "outQuad", onUpdate: draw });
  };
  const reset = () => {
    setComplete(false);
    anim.current?.pause();
    anim.current = animate(state.current, { v: 0, duration: 700, ease: "inOutQuad", onUpdate: draw });
  };

  return (
    <div className="hold">
      <button
        type="button"
        className={complete ? "hold-btn is-done" : "hold-btn"}
        onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); start(); }}
        onPointerUp={stop}
        onPointerCancel={stop}
        onKeyDown={(e) => { if ((e.key === " " || e.key === "Enter") && !e.repeat) { e.preventDefault(); start(); } }}
        onKeyUp={(e) => { if (e.key === " " || e.key === "Enter") stop(); }}
        onClick={() => { if (complete) reset(); }}
        aria-label={complete ? `${done}. Press to reset` : `${label} (press and hold)`}
        data-cursor={complete ? "Reset" : "Hold"}
      >
        <svg viewBox="0 0 50 50" aria-hidden="true">
          <circle cx="25" cy="25" r="22" className="hold-track" />
          <circle ref={ring} cx="25" cy="25" r="22" className="hold-ring" strokeDasharray={C} strokeDashoffset={C} />
        </svg>
        <span className="hold-dot" aria-hidden="true" />
      </button>
      <div className="hold-copy">
        <span className="hold-label" aria-live="polite">{complete ? done : label}</span>
        {note && <span className="hold-note">{note}</span>}
      </div>
    </div>
  );
}
