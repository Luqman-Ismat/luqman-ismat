"use client";
import { inquiryServices } from "@/lib/site";
import { track } from "@vercel/analytics";
import { Check } from "lucide-react";
import { readFirstTouch } from "@/lib/leads/attribution";
import { useEffect, useRef, useState, type FormEvent } from "react";

const BOOKING_URL = process.env.NEXT_PUBLIC_BOOKING_URL || "";
const EMAIL = "Luqman.ismat@gmail.com";

type Draft = { subject: string; body: string };
type State =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "sent"; name: string }
  | { kind: "failed"; message: string; draft: Draft };

function draftFrom(data: FormData): Draft {
  const service = String(data.get("service") || "General inquiry");
  const pkg = String(data.get("package") || "").trim();
  return {
    subject: `${service} project inquiry${pkg ? `: ${pkg}` : ""}`,
    body: `Hi Luqman,\n\nI’d like to discuss a project in ${service.toLowerCase()}.\n\nName: ${String(data.get("name")).trim()}\nEmail: ${String(data.get("email")).trim()}\nCompany / brand: ${String(data.get("company") || "Not provided").trim()}\nPackage: ${pkg || "Not sure yet"}\nTarget timeline: ${String(data.get("timeline") || "Flexible").trim()}\n\nProject brief:\n${String(data.get("brief")).trim()}\n\nThanks!`,
  };
}

/* The project brief form. Submits to /api/inquiry, which stores the lead;
   if that is unavailable, the visitor gets a ready-made email instead, so an
   inquiry is never lost. */
export function ProjectInquiry({ initialService, initialPackage }: { initialService: string; initialPackage: string }) {
  const [state, setState] = useState<State>({ kind: "idle" });
  const [copyStatus, setCopyStatus] = useState("");
  const shownAt = useRef(0);
  const result = useRef<HTMLHeadingElement>(null);
  useEffect(() => { shownAt.current = Date.now(); }, []);
  useEffect(() => {
    if (state.kind === "sent" || state.kind === "failed") {
      result.current?.focus();
      result.current?.scrollIntoView({ behavior: "instant", block: "center" });
    }
  }, [state.kind]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const name = form.elements.namedItem("name") as HTMLInputElement;
    const brief = form.elements.namedItem("brief") as HTMLTextAreaElement;
    name.setCustomValidity(name.value.trim() ? "" : "Please enter your name.");
    brief.setCustomValidity(brief.value.trim().length >= 20 ? "" : "Please add at least 20 characters describing your project.");
    if (!form.reportValidity()) return;

    const data = new FormData(form);
    const touch = readFirstTouch();
    setState({ kind: "sending" });
    try {
      const res = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          company: data.get("company"),
          service: data.get("service"),
          package: data.get("package"),
          timeline: data.get("timeline"),
          brief: data.get("brief"),
          website: data.get("website"),
          elapsed: Date.now() - shownAt.current,
          sourcePath: touch.sourcePath,
          referrer: touch.referrer,
          utm: touch.utm,
        }),
      });
      const json = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; errors?: Record<string, string> };
      if (res.ok && json.ok) {
        track("inquiry_submitted", { service: String(data.get("service") || "") });
        setState({ kind: "sent", name: String(data.get("name")).trim().split(" ")[0] });
        form.reset();
        return;
      }
      if (json.errors) {
        for (const [field, message] of Object.entries(json.errors)) {
          const el = form.elements.namedItem(field);
          if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) el.setCustomValidity(message);
        }
        form.reportValidity();
        setState({ kind: "idle" });
        return;
      }
      setState({ kind: "failed", message: json.error || "Your brief could not be sent from the website.", draft: draftFrom(data) });
    } catch {
      setState({ kind: "failed", message: "You appear to be offline, or the website could not be reached.", draft: draftFrom(data) });
    }
  }

  async function copyDraft(draft: Draft) {
    try {
      await navigator.clipboard.writeText(`To: ${EMAIL}\nSubject: ${draft.subject}\n\n${draft.body}`);
      setCopyStatus("Copied. Paste it into your email and send it when you’re ready.");
    } catch {
      setCopyStatus("Copy is unavailable in this browser. Select and copy the text below instead.");
    }
  }

  if (state.kind === "sent") {
    return (
      <section className="inquiry-sent" aria-live="polite">
        <p className="inquiry-sent-icon" aria-hidden="true"><Check size={22} strokeWidth={2.25} /></p>
        <h2 ref={result} tabIndex={-1}>Thanks{state.name ? `, ${state.name}` : ""}. I’ll reply within two business days.</h2>
        <p>You’ll hear from me at the email you entered.{BOOKING_URL ? " If it helps to talk it through, pick a time below." : ""}</p>
        <div className="action-row">
          {BOOKING_URL && (
            <a className="consulting-button" href={BOOKING_URL} target="_blank" rel="noopener noreferrer" onClick={() => track("booking_opened", { from: "inquiry" })}>
              Book a 20-minute call <span aria-hidden="true">↗</span>
            </a>
          )}
          <button type="button" className="consulting-button secondary" onClick={() => setState({ kind: "idle" })}>
            Send another brief
          </button>
        </div>
      </section>
    );
  }

  return (
    <form
      className="inquiry-form"
      onSubmit={submit}
     
      onChange={(event) => {
        const field = event.target;
        if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement) field.setCustomValidity("");
        if (state.kind === "failed") setState({ kind: "idle" });
      }}
    >
      <div className="form-grid">
        <div>
          <label htmlFor="name">Your name <span>(required)</span></label>
          <input id="name" name="name" autoComplete="name" required maxLength={100} />
        </div>
        <div>
          <label htmlFor="email">Email <span>(required)</span></label>
          <input id="email" name="email" type="email" autoComplete="email" required maxLength={200} />
        </div>
        <div>
          <label htmlFor="company">Company or brand</label>
          <input id="company" name="company" autoComplete="organization" maxLength={150} />
        </div>
        <div>
          <label htmlFor="service">What can I help with?</label>
          <select id="service" name="service" defaultValue={initialService}>
            {Object.values(inquiryServices).map((service) => <option key={service} value={service}>{service}</option>)}
            <option value="General inquiry">Not sure yet</option>
          </select>
        </div>
        <div>
          <label htmlFor="package">Package or starting point</label>
          <input id="package" name="package" defaultValue={initialPackage} placeholder="Not sure yet is fine" maxLength={150} />
        </div>
        <div>
          <label htmlFor="timeline">Target timeline</label>
          <input id="timeline" name="timeline" placeholder="A date or a rough timeframe" maxLength={150} />
        </div>
      </div>
      <div>
        <label htmlFor="brief">Tell me about the project <span>(required)</span></label>
        <textarea
          id="brief"
          name="brief"
          required
          minLength={20}
          maxLength={5000}
          rows={6}
          placeholder="What are you trying to make or improve? What exists today, and what would a useful result look like?"
          aria-describedby="brief-help"
        />
        <p id="brief-help" className="field-help">At least 20 characters. Please don’t include passwords or confidential documents.</p>
      </div>
      {/* Honeypot: hidden from people and assistive tech; bots fill it in. */}
      <div className="hp-field" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <p className="field-help">Your brief is sent to me and stored securely so I can reply. See the <a href="/privacy">privacy notes</a>.</p>
      <button className="consulting-button" type="submit" disabled={state.kind === "sending"}>
        {state.kind === "sending" ? "Sending…" : "Send project brief"} <span aria-hidden="true">↗</span>
      </button>
      <noscript>Please email your brief to {EMAIL}. The form requires JavaScript.</noscript>

      {state.kind === "failed" && (
        <section className="email-draft" aria-label="Send by email instead">
          <h2 ref={result} tabIndex={-1}>{state.message} Send it by email instead.</h2>
          <p>Your brief is ready below. Open it in your email app, or copy it. Nothing has been sent yet.</p>
          <p><strong>To:</strong> {EMAIL}<br /><strong>Subject:</strong> {state.draft.subject}</p>
          <pre>{state.draft.body}</pre>
          <div className="action-row">
            <a className="consulting-button" href={`mailto:${EMAIL}?subject=${encodeURIComponent(state.draft.subject)}&body=${encodeURIComponent(state.draft.body)}`}>Open email draft ↗</a>
            <button type="button" className="consulting-button secondary" onClick={() => copyDraft(state.draft)}>Copy brief</button>
          </div>
          <p role="status" className="field-help">{copyStatus}</p>
        </section>
      )}
    </form>
  );
}
