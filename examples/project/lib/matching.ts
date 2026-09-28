

const STOPWORDS = new Set(['the', 'a', 'an', 'of', 'and', 'to', 'for', 'in', 'on', 'with', '&']);


const SYNONYMS: Array<[RegExp, string]> = [
  [/\bmodell?ing\b/g, 'model'],
  [/\bcontrolling\b/g, 'controls'],
  [/\bschedule\b/g, 'plan'],
  [/\bexpenses?\b/g, 'expense'],
  [/\brentals?\b/g, 'rental'],
  [/\binvoicing\b/g, 'invoice'],
  [/\bmeetings?\b/g, 'meeting'],
  [/\bdevelopment\b/g, 'develop'],
];

export function normalizeName(value: string): string {
  let t = String(value || '').toLowerCase();
  // Strip a leading section enumerator ("2.3 ", "1. ", "4.1.2 ") or bare job
  // code ("0844 ", "7542 ") — these are WBS prefixes, not part of the name,
  // and would otherwise dilute similarity against the un-prefixed Timesheet task.
  t = t.replace(/^\s*\d+(\.\d+)*[.)]?\s+/, '');
  t = t.replace(/[^\w\s]/g, ' ');
  for (const [re, rep] of SYNONYMS) t = t.replace(re, rep);
  return t.replace(/\s+/g, ' ').trim();
}

function tokens(value: string): Set<string> {
  return new Set(normalizeName(value).split(' ').filter((w) => w && !STOPWORDS.has(w)));
}

function bigrams(value: string): Set<string> {
  const s = normalizeName(value).replace(/\s+/g, '');
  const out = new Set<string>();
  for (let i = 0; i <= s.length - 2; i++) out.add(s.slice(i, i + 2));
  return out;
}

function bigramSim(a: string, b: string): number {
  const x = bigrams(a);
  const y = bigrams(b);
  if (!x.size && !y.size) return 0;
  let inter = 0;
  for (const g of x) if (y.has(g)) inter++;
  return (2 * inter) / (x.size + y.size);
}


export function similarity(a: string, b: string): number {
  const na = normalizeName(a);
  const nb = normalizeName(b);
  if (!na || !nb) return 0;
  if (na === nb) return 1;
  const ta = tokens(a);
  const tb = tokens(b);
  if (!ta.size || !tb.size) return bigramSim(a, b);
  let inter = 0;
  for (const t of ta) if (tb.has(t)) inter++;
  const union = ta.size + tb.size - inter;
  const jaccard = union > 0 ? inter / union : 0;
  const coverage = Math.max(inter / ta.size, inter / tb.size);
  return jaccard * 0.5 + coverage * 0.3 + bigramSim(a, b) * 0.2;
}

export interface DMBucket {
  phase: string;
  task: string;
  hours: number;
  cost: number;
}

export interface DMPhase {
  id: string;
  name: string;
}

export interface DMTask {
  id: string;
  name: string;
  phaseId: string | null;
}

export type DMMatchKind = 'exact' | 'fuzzy' | 'unmapped';

export interface DMResult {
  phase: string;
  task: string;
  hours: number;
  cost: number;
  matchKind: DMMatchKind;
  score: number;

  mppPhaseId: string | null;
  mppPhaseName: string | null;

  mppTaskId: string | null;
  mppTaskName: string | null;
}

export interface DMOptions {

  phaseThreshold?: number;

  taskThreshold?: number;

  uniquenessGap?: number;
}

function bestMatch<T extends { name: string }>(
  query: string,
  candidates: T[],
): { cand: T | null; score: number; gap: number } {
  let best: T | null = null;
  let bestScore = -1;
  let secondScore = -1;
  for (const c of candidates) {
    const s = similarity(query, c.name);
    if (s > bestScore) {
      secondScore = bestScore;
      bestScore = s;
      best = c;
    } else if (s > secondScore) {
      secondScore = s;
    }
  }
  return { cand: best, score: bestScore < 0 ? 0 : bestScore, gap: bestScore - Math.max(secondScore, 0) };
}


export function runDeterministicMatch(
  buckets: DMBucket[],
  phases: DMPhase[],
  tasks: DMTask[],
  opts: DMOptions = {},
): DMResult[] {
  const phaseThreshold = opts.phaseThreshold ?? 0.55;
  const taskThreshold = opts.taskThreshold ?? 0.55;
  const uniquenessGap = opts.uniquenessGap ?? 0.0;

  const tasksByPhase = new Map<string, DMTask[]>();
  for (const t of tasks) {
    const key = t.phaseId ?? '__none__';
    const arr = tasksByPhase.get(key) ?? [];
    arr.push(t);
    tasksByPhase.set(key, arr);
  }
  const phaseById = new Map(phases.map((p) => [p.id, p] as const));

  // Index tasks by normalized name for the cross-phase exact fallback. Only
  // names that resolve to a SINGLE task are eligible (ambiguous names stay
  // phase-constrained) so the fallback can never guess wrong.
  const tasksByNorm = new Map<string, DMTask[]>();
  for (const t of tasks) {
    const n = normalizeName(t.name);
    if (!n) continue;
    const arr = tasksByNorm.get(n) ?? [];
    arr.push(t);
    tasksByNorm.set(n, arr);
  }

  return buckets.map((b): DMResult => {
    const base: DMResult = {
      phase: b.phase,
      task: b.task,
      hours: b.hours,
      cost: b.cost,
      matchKind: 'unmapped',
      score: 0,
      mppPhaseId: null,
      mppPhaseName: null,
      mppTaskId: null,
      mppTaskName: null,
    };

    const ph = bestMatch(b.phase, phases);
    if (ph.cand && ph.score >= phaseThreshold) {
      base.mppPhaseId = ph.cand.id;
      base.mppPhaseName = ph.cand.name;

      const candidates = tasksByPhase.get(ph.cand.id) ?? [];
      const tk = candidates.length ? bestMatch(b.task, candidates) : { cand: null, score: 0, gap: 0 };
      if (tk.cand && tk.score >= taskThreshold) {
        const exact = normalizeName(b.task) === normalizeName(tk.cand.name);
        // For fuzzy (non-exact) matches, require a minimum gap over the runner-up
        // so genuinely ambiguous buckets stay unmapped rather than guess.
        if (exact || tk.gap >= uniquenessGap) {
          base.matchKind = exact ? 'exact' : 'fuzzy';
          base.score = tk.score;
          base.mppTaskId = tk.cand.id;
          base.mppTaskName = tk.cand.name;
          return base;
        }
      }
    }

    // Cross-phase exact fallback: Timesheet phases frequently don't align with
    // the WBS phase tree, yet the task name is an exact match somewhere. Accept
    // only when the normalized name maps to exactly ONE task (never guess).
    const norm = normalizeName(b.task);
    const exactTasks = norm ? tasksByNorm.get(norm) : undefined;
    if (exactTasks && exactTasks.length === 1) {
      const t = exactTasks[0];
      const ph2 = t.phaseId ? phaseById.get(t.phaseId) ?? null : null;
      base.matchKind = 'exact';
      base.score = 1;
      base.mppPhaseId = ph2?.id ?? base.mppPhaseId;
      base.mppPhaseName = ph2?.name ?? base.mppPhaseName;
      base.mppTaskId = t.id;
      base.mppTaskName = t.name;
      return base;
    }

    return base;
  });
}
