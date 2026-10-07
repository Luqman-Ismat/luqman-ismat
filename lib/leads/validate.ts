/* Validation for project inquiries. Pure (no server or browser APIs) so the
   same rules run in the form, in the API route and in tests. */

export type LeadInput = {
  name: string;
  email: string;
  company: string;
  service: string;
  package: string;
  timeline: string;
  brief: string;
  /** Honeypot: hidden from people, filled by naive bots. Must stay empty. */
  website: string;
  /** Milliseconds between the form rendering and submit. */
  elapsed: number;
  sourcePath: string;
  referrer: string;
  utm: Record<string, string>;
};

export type Lead = Omit<LeadInput, "website" | "elapsed">;

export type Checked =
  | { ok: true; lead: Lead }
  | { ok: false; spam: true }
  | { ok: false; spam?: false; errors: Partial<Record<keyof LeadInput, string>> };

const LIMITS = { name: 100, email: 200, company: 150, service: 120, package: 150, timeline: 150, brief: 5000, sourcePath: 300, referrer: 500 } as const;
const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"] as const;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
/** People take longer than this to fill the form; scripts usually don't. */
export const MIN_ELAPSED_MS = 3000;

const text = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export function checkLead(raw: unknown): Checked {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  // bots: filled honeypot, or submitted faster than a person could type
  if (text(r.website, 200) !== "") return { ok: false, spam: true };
  const elapsed = typeof r.elapsed === "number" && Number.isFinite(r.elapsed) ? r.elapsed : 0;
  if (elapsed < MIN_ELAPSED_MS) return { ok: false, spam: true };

  const utmIn = (r.utm && typeof r.utm === "object" ? r.utm : {}) as Record<string, unknown>;
  const utm: Record<string, string> = {};
  for (const k of UTM_KEYS) {
    const v = text(utmIn[k], 120);
    if (v) utm[k] = v;
  }
  const lead: Lead = {
    name: text(r.name, LIMITS.name),
    email: text(r.email, LIMITS.email).toLowerCase(),
    company: text(r.company, LIMITS.company),
    service: text(r.service, LIMITS.service) || "General inquiry",
    package: text(r.package, LIMITS.package),
    timeline: text(r.timeline, LIMITS.timeline),
    brief: text(r.brief, LIMITS.brief),
    sourcePath: text(r.sourcePath, LIMITS.sourcePath),
    referrer: text(r.referrer, LIMITS.referrer),
    utm,
  };
  const errors: Partial<Record<keyof LeadInput, string>> = {};
  if (!lead.name) errors.name = "Please enter your name.";
  if (!EMAIL.test(lead.email)) errors.email = "Please enter a valid email address.";
  if (lead.brief.length < 20) errors.brief = "Please add at least 20 characters describing your project.";
  if (Object.keys(errors).length) return { ok: false, errors };
  return { ok: true, lead };
}
