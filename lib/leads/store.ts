import "server-only";
/* Server-only: persists inquiries through the submit_lead() database
   function (supabase/migrations/0001_leads.sql), which is the only thing the
   publishable key can reach; the leads table itself is closed to it. Also
   optionally emails a notification through Resend. */
import type { Lead } from "./validate";

const env = (k: string) => process.env[k]?.trim() || "";

export const leadStoreConfigured = () => !!(env("SUPABASE_URL") && env("SUPABASE_PUBLISHABLE_KEY"));

/** Raised when the database rejects a submission for a reason the visitor can fix. */
export class LeadRejected extends Error {}

export async function saveLead(lead: Lead, meta: { userAgent: string }): Promise<{ id: string }> {
  const url = env("SUPABASE_URL").replace(/\/$/, "");
  const key = env("SUPABASE_PUBLISHABLE_KEY");
  const res = await fetch(`${url}/rest/v1/rpc/submit_lead`, {
    method: "POST",
    headers: { apikey: key, "Content-Type": "application/json" },
    body: JSON.stringify({
      p_name: lead.name,
      p_email: lead.email,
      p_company: lead.company || null,
      p_service: lead.service,
      p_package: lead.package || null,
      p_timeline: lead.timeline || null,
      p_brief: lead.brief,
      p_source_path: lead.sourcePath || null,
      p_referrer: lead.referrer || null,
      p_utm: lead.utm,
      p_user_agent: meta.userAgent.slice(0, 400) || null,
    }),
    cache: "no-store",
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { code?: string; message?: string };
    // 22023: validation, P0001: rate limit, both raised by submit_lead()
    if (body.code === "22023" || body.code === "P0001") throw new LeadRejected(body.message || "rejected");
    throw new Error(`submit_lead failed: ${res.status} ${body.code ?? ""} ${body.message ?? ""}`);
  }
  return { id: (await res.json()) as string };
}

const escape = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/** Emails the inquiry to the owner when RESEND_API_KEY and LEAD_NOTIFY_TO are set. */
export async function notifyLead(lead: Lead, id: string) {
  const key = env("RESEND_API_KEY"), to = env("LEAD_NOTIFY_TO");
  if (!key || !to) return;
  const from = env("LEAD_NOTIFY_FROM") || "Website <onboarding@resend.dev>";
  const rows: [string, string][] = [
    ["Name", lead.name], ["Email", lead.email], ["Company", lead.company], ["Service", lead.service],
    ["Package", lead.package], ["Timeline", lead.timeline], ["Came from", lead.sourcePath],
    ["Referrer", lead.referrer], ["Campaign", Object.entries(lead.utm).map(([k, v]) => `${k}=${v}`).join(" ")],
  ];
  const html = `<h2>New project inquiry</h2><table cellpadding="6">${rows.filter(([, v]) => v).map(([k, v]) => `<tr><td><b>${k}</b></td><td>${escape(v)}</td></tr>`).join("")}</table><h3>Brief</h3><p style="white-space:pre-wrap">${escape(lead.brief)}</p><p style="color:#888">Lead ${id}</p>`;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: [to], reply_to: lead.email, subject: `Inquiry: ${lead.service} · ${lead.name}${lead.company ? ` (${lead.company})` : ""}`, html }),
  });
  if (!res.ok) console.error("Lead notification failed", res.status, (await res.text()).slice(0, 300));
}
