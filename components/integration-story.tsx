import Image from "next/image";
import Link from "next/link";

export function IntegrationStory() {
  return (
    <section className="site-container work-explained" id="workday">
      <header>
        <p className="eyebrow">Selected work / Workday integration</p>
        <h2>From enterprise records to project decisions.</h2>
        <p>I built a Workday-to-PostgreSQL integration that brings workforce, project, labor, contract, and invoice data into a project-controls application. The work spans the API connection, data model, reconciliation, and reporting experience.</p>
        <figure className="work-story-figure">
          <Link href="/demos/connected-operations"><Image src="/images/work/connected-operations.webp" width={1200} height={833} sizes="(max-width: 760px) 100vw, 35vw" alt="Portfolio demonstration matching fictional time entries to a project hierarchy" /></Link>
          <figcaption>Explore the reconciliation workflow with fictional records.</figcaption>
        </figure>
      </header>
      <div className="work-explanation-list">
        {[
          ["Connect & ingest", "Server-side requests retrieve Workday custom-report data. Date-window controls support labor imports and backfills, while credentials stay in the server environment."],
          ["Map & store", "Mapping functions turn source reports into application records. PostgreSQL tables preserve relationships between people, projects, phases, hours, contracts, and invoices. Duplicate handling and conflict-aware updates support repeat imports."],
          ["Reconcile & explain", "Source time entries are matched to the project hierarchy. Unmatched work remains visible for review, and mapped actuals feed cost and productivity reporting. A useful dashboard needs a traceable path back to its inputs."],
          ["Observe & maintain", "Sync-run history records status, timing, row counts, and errors. Connection-health tracking distinguishes the latest attempt from the last successful update, giving the operator a place to investigate stale data."],
        ].map(([title, body], i) => <article key={title}><span>{String(i + 1).padStart(2, "0")}</span><div><h3>{title}</h3><p>{body}</p></div></article>)}
      </div>
      <details><summary>About this example</summary><p>The integration described above is work I built. The public demo shows an adapted reconciliation workflow with synthetic data; it does not connect to Workday or a client database. Client identities, report addresses, credentials, and operational records are omitted. Workday is the source platform, not a claimed partnership or endorsement. Refresh timing depends on the configured sync process.</p></details>
      <div className="work-explained-cta"><p>See how source records become usable project actuals.</p><Link className="button-primary" href="/demos/connected-operations">Try the reconciliation demo ↗</Link></div>
    </section>
  );
}
