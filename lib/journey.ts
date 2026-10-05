/* Mutable, render-loop friendly state shared between the DOM overlay and the
   WebGL scene. Written by scroll/pointer handlers, read inside useFrame, so
   no React re-render happens per frame. */
export const journey = {
  /** Continuous position along the chapters: 0 = intro, 1 = controls, … */
  position: 0,
  /** How far each station is exploded, 0..1. */
  explode: [0, 0, 0, 0, 0, 0, 0] as number[],
  /** Station being explored: the camera pushes toward it. */
  focus: -1,
  /** Normalised pointer, -1..1. */
  pointer: { x: 0, y: 0 },
  /** Accumulated drag rotation for the exchanger, radians. */
  spin: 0,
};

/** Mark a station as the one being explored (the camera pushes toward it). */
export function focusStation(i: number) {
  journey.focus = i;
}
/** Set how far station `i` has come apart, 0 assembled to 1 exploded. */
export function explodeStation(i: number, v: number) {
  journey.explode[i] = v;
}
