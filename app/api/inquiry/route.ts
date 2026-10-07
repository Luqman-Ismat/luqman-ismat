import { after } from "next/server";
import { checkLead } from "@/lib/leads/validate";
import { LeadRejected, leadStoreConfigured, notifyLead, saveLead } from "@/lib/leads/store";

/* Receives project inquiries from the contact form. Spam is answered with a
   normal success so bots learn nothing; real failures tell the visitor to
   use email instead, so no inquiry is silently lost. */
export async function POST(request: Request) {
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return Response.json({ ok: false, error: "Unsupported content type." }, { status: 415 });
  }
  const origin = request.headers.get("origin");
  if (origin && new URL(origin).host !== new URL(request.url).host) {
    return Response.json({ ok: false, error: "Cross-site submissions are not accepted." }, { status: 403 });
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }
  const checked = checkLead(body);
  if (!checked.ok) {
    if (checked.spam) return Response.json({ ok: true });
    return Response.json({ ok: false, errors: checked.errors }, { status: 422 });
  }
  if (!leadStoreConfigured()) {
    return Response.json({ ok: false, fallback: true, error: "Online submissions are not available right now." }, { status: 503 });
  }
  try {
    const { id } = await saveLead(checked.lead, { userAgent: request.headers.get("user-agent") || "" });
    after(() => notifyLead(checked.lead, id));
    return Response.json({ ok: true });
  } catch (err) {
    if (err instanceof LeadRejected) {
      const tooMany = err.message.includes("too many");
      return Response.json({ ok: false, error: tooMany ? "You’ve sent several inquiries in the last hour. Please email directly instead." : "Please check your details and try again." }, { status: tooMany ? 429 : 422 });
    }
    console.error(err);
    return Response.json({ ok: false, fallback: true, error: "Your brief could not be saved." }, { status: 502 });
  }
}
