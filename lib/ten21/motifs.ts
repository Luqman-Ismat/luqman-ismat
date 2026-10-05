/* Doch is counted-thread work: every motif sits on a grid of stitch blocks.
   These generators build motifs cell by cell, so the result reads as
   embroidery rather than wallpaper. Cell codes: a = base thread, b/c/d =
   contrast threads, m = mirror (shisha). */

export type Cell = "a" | "b" | "c" | "d" | "m";
export type Motif = { w: number; h: number; cells: Cell[][] };

const grid = (w: number, h: number, fn: (x: number, y: number) => Cell): Motif => ({
  w,
  h,
  cells: Array.from({ length: h }, (_, y) => Array.from({ length: w }, (_, x) => fn(x, y))),
});

/* Setareh: eight-point star (diamond ∪ square), concentric thread rings,
   a mirror at the centre and quarter rosettes in the tile corners. */
export function setareh(withMirror = true): Motif {
  const R = 8;
  return grid(R * 2 + 3, R * 2 + 3, (x, y) => {
    const cx = x - (R + 1), cy = y - (R + 1);
    const ax = Math.abs(cx), ay = Math.abs(cy);
    const diamond = ax + ay, square = Math.max(ax, ay);
    const inStar = diamond <= R + 1 || square <= Math.round(R * 0.62);
    if (withMirror && Math.hypot(cx, cy) <= 2.2) return "m";
    if (inStar) {
      const edge = diamond === R + 1 || (square === Math.round(R * 0.62) && diamond > R - 3);
      if (edge) return "c";
      const ring = Math.min(diamond, square + 2);
      return (["d", "b", "c", "b"] as Cell[])[Math.floor(ring / 2) % 4];
    }
    // corner rosettes shared with neighbouring tiles
    const kx = R + 1 - ax, ky = R + 1 - ay;
    if (kx + ky <= 3) return kx + ky <= 1 ? "c" : "d";
    return "a";
  });
}

/* Toi: chain of stepped diamonds joined point to point. */
export function toi(): Motif {
  const R = 5;
  return grid(R * 2 + 2, R * 2 + 2, (x, y) => {
    const cx = x - (R + 0.5), cy = y - (R + 0.5);
    const d = Math.abs(cx) + Math.abs(cy);
    if (d <= R) {
      const ring = Math.floor(d);
      return (["c", "d", "b", "c", "b", "c"] as Cell[])[ring] ?? "b";
    }
    // hooks between diamonds
    if ((Math.abs(cx) > R - 1 && Math.abs(cy) < 1) || (Math.abs(cy) > R - 1 && Math.abs(cx) < 1)) return "c";
    return "a";
  });
}

/* Gol: four-petal rosette with a stepped centre. */
export function gol(): Motif {
  const R = 6;
  return grid(R * 2 + 2, R * 2 + 2, (x, y) => {
    const cx = x - (R + 0.5), cy = y - (R + 0.5);
    const ax = Math.abs(cx), ay = Math.abs(cy);
    if (ax + ay <= 1.5) return "c";
    const petal = (ax <= 1.5 && ay <= R) || (ay <= 1.5 && ax <= R);
    if (petal) return ax + ay > R - 1 ? "c" : "d";
    if (ax + ay <= R - 1 && ax > 1.5 && ay > 1.5) return (Math.floor(ax + ay) % 2 ? "b" : "a");
    return "a";
  });
}

/* Kap: stepped triangle border, two rows. */
export function kap(): Motif {
  return grid(8, 6, (x, y) => {
    const t = Math.abs(x - 3.5);
    if (y >= 5) return "c";
    if (5 - y > t + 0.5) return y < 2 ? "d" : "b";
    return "a";
  });
}

/* Run-length encode a motif row by row so the SVG stays light. */
export function runs(m: Motif) {
  const out: { x: number; y: number; w: number; cell: Cell }[] = [];
  m.cells.forEach((row, y) => {
    let start = 0;
    for (let x = 1; x <= row.length; x++) {
      if (x === row.length || row[x] !== row[start]) {
        out.push({ x: start, y, w: x - start, cell: row[start] });
        start = x;
      }
    }
  });
  return out;
}
