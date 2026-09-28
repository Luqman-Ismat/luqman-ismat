"use client";
import { inquiryServices } from "@/lib/site";
import { useSyncExternalStore, useRef, useState, type FormEvent } from "react";
const subscribeHydration = () => () => {};
const clientReady = () => true;
const serverReady = () => false;
export function ProjectInquiry({
  initialService,
  initialPackage,
}: {
  initialService: string;
  initialPackage: string;
}) {
  const ready = useSyncExternalStore(
    subscribeHydration,
    clientReady,
    serverReady,
  );
  const [draft, setDraft] = useState<{ subject: string; body: string } | null>(
    null,
  );
  const [copyStatus, setCopyStatus] = useState("");
  const draftHeading = useRef<HTMLHeadingElement>(null);
  function prepare(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const nameField = form.elements.namedItem("name") as HTMLInputElement;
    const briefField = form.elements.namedItem("brief") as HTMLTextAreaElement;
    nameField.setCustomValidity(
      nameField.value.trim() ? "" : "Please enter your name.",
    );
    briefField.setCustomValidity(
      briefField.value.trim().length >= 20
        ? ""
        : "Please add at least 20 characters describing your project.",
    );
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const service = String(data.get("service") || "General inquiry");
    const selectedPackage = String(
      data.get("package") || "Not sure yet",
    ).trim();
    setDraft({
      subject: `${service} project inquiry${selectedPackage ? `: ${selectedPackage}` : ""}`,
      body: `Hi Luqman,\n\nI’d like to discuss a project in ${service.toLowerCase()}.\n\nName: ${String(data.get("name")).trim()}\nEmail: ${String(data.get("email")).trim()}\nCompany / brand: ${String(data.get("company") || "Not provided").trim()}\nPackage: ${selectedPackage || "Not sure yet"}\nTarget timeline: ${String(data.get("timeline") || "Flexible").trim()}\n\nProject brief:\n${String(data.get("brief")).trim()}\n\nThanks!`,
    });
    setCopyStatus("");
    requestAnimationFrame(() => {
      draftHeading.current?.focus();
      draftHeading.current?.scrollIntoView({
        behavior: "instant",
        block: "center",
      });
    });
  }
  async function copyDraft() {
    if (!draft) return;
    try {
      await navigator.clipboard.writeText(
        `To: Luqman.ismat@gmail.com\nSubject: ${draft.subject}\n\n${draft.body}`,
      );
      setCopyStatus(
        "Copied. Paste the brief into your email and send it when you’re ready.",
      );
    } catch {
      setCopyStatus(
        "Copy is unavailable in this browser. Select and copy the text below instead.",
      );
    }
  }
  return (
    <form
      className="inquiry-form"
      onSubmit={prepare}
      onChange={(event) => {
        const field = event.target;
        if (
          field instanceof HTMLInputElement ||
          field instanceof HTMLTextAreaElement
        )
          field.setCustomValidity("");
        setDraft(null);
        setCopyStatus("");
      }}
    >
      <div className="form-grid">
        <div>
          <label htmlFor="name">
            Your name <span>(required)</span>
          </label>
          <input
            id="name"
            name="name"
            autoComplete="name"
            required
            maxLength={100}
          />
        </div>
        <div>
          <label htmlFor="email">
            Email <span>(required)</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={200}
          />
        </div>
        <div>
          <label htmlFor="company">Company or brand</label>
          <input
            id="company"
            name="company"
            autoComplete="organization"
            maxLength={150}
          />
        </div>
        <div>
          <label htmlFor="service">What can I help with?</label>
          <select id="service" name="service" defaultValue={initialService}>
            {Object.values(inquiryServices).map((service) => (
              <option key={service} value={service}>
                {service}
              </option>
            ))}
            <option value="General inquiry">Not sure yet</option>
          </select>
        </div>
        <div>
          <label htmlFor="package">Package or starting point</label>
          <input
            id="package"
            name="package"
            defaultValue={initialPackage}
            placeholder="Not sure yet is fine"
            maxLength={150}
          />
        </div>
        <div>
          <label htmlFor="timeline">Target timeline</label>
          <input
            id="timeline"
            name="timeline"
            placeholder="A date or a rough timeframe"
            maxLength={150}
          />
        </div>
      </div>
      <div>
        <label htmlFor="brief">
          Tell me about the project <span>(required)</span>
        </label>
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
        <p id="brief-help" className="field-help">
          At least 20 characters. You can add reference files when you send the
          email.
        </p>
      </div>
      <p className="field-help">
        This form prepares an email brief on your device. It does not submit or
        store your information on this website.
      </p>
      <button className="consulting-button" type="submit" disabled={!ready}>
        Prepare email brief <span aria-hidden="true">↗</span>
      </button>
      <noscript>
        Please use the email link above to send your project brief. The brief
        builder requires JavaScript.
      </noscript>
      {draft && (
        <section className="email-draft" aria-label="Prepared email">
          <h2 ref={draftHeading} tabIndex={-1}>
            Your brief is ready to send.
          </h2>
          <p>
            Review the draft, then open it in your email app or copy it into
            your preferred email service. Nothing has been sent yet.
          </p>
          <p>
            <strong>To:</strong> Luqman.ismat@gmail.com
            <br />
            <strong>Subject:</strong> {draft.subject}
          </p>
          <pre>{draft.body}</pre>
          <div className="action-row">
            <a
              className="consulting-button"
              href={`mailto:Luqman.ismat@gmail.com?subject=${encodeURIComponent(draft.subject)}&body=${encodeURIComponent(draft.body)}`}
            >
              Open email draft ↗
            </a>
            <button
              type="button"
              className="consulting-button secondary"
              onClick={copyDraft}
            >
              Copy brief
            </button>
          </div>
          <p role="status" className="field-help">
            {copyStatus}
          </p>
        </section>
      )}
    </form>
  );
}
