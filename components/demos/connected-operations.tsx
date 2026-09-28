"use client";
import { useState } from "react";
import { reconcile, demoCsv } from "@/lib/demos/models";
import { DemoNotice, DemoMetrics, downloadDemo } from "./shared";
export function ConnectedOperationsDemo() {
  const [ran, setRan] = useState(false);
  const [mapped, setMapped] = useState(false);
  const [applied, setApplied] = useState(false);
  const rows = reconcile(mapped);
  const ready = rows.filter((r) => r.status === "Ready");
  const total = ready.reduce((s, r) => s + r.hours, 0);
  return (
    <div className="demo-app">
      <DemoNotice />
      <div className="demo-toolbar">
        <div>
          <p className="eyebrow">
            Sample data flow / Validation & reconciliation
          </p>
          <h2>Connected operations</h2>
        </div>
        <button
          onClick={() => {
            setRan(false);
            setMapped(false);
            setApplied(false);
          }}
        >
          Reset demo
        </button>
      </div>
      <div className="demo-pipeline" aria-label="Demonstration pipeline">
        <div>
          <span>01</span>
          <h3>Source records</h3>
          <p>Fictional time entries</p>
        </div>
        <b aria-hidden="true">→</b>
        <div>
          <span>02</span>
          <h3>Validate & map</h3>
          <p>Reconcile task names</p>
        </div>
        <b aria-hidden="true">→</b>
        <div>
          <span>03</span>
          <h3>Review & apply</h3>
          <p>Update the local demo</p>
        </div>
      </div>
      <div className="demo-run">
        <button
          className="primary"
          onClick={() => {
            setRan(true);
            setApplied(false);
          }}
        >
          Run sample sync →
        </button>
        <p role="status">
          {applied
            ? "Sample snapshot updated. No external system was changed."
            : ran
              ? `${ready.length} of ${rows.length} records ready. ${rows.length - ready.length} awaiting mapping.`
              : "Ready to run. No live connection or credentials are used."}
        </p>
      </div>
      <DemoMetrics
        items={[
          ["Source hours", ran ? "68" : "—", "Five invented records"],
          ["Validated hours", ran ? String(total) : "—", "Only mapped records"],
          [
            "Needs mapping",
            ran ? String(rows.length - ready.length) : "—",
            "Blocked until reviewed",
          ],
          [
            "Applied hours",
            applied ? String(total) : "0",
            "Local demo snapshot",
          ],
        ]}
      />
      {ran ? (
        <>
          <div
            className="demo-table-scroll"
            role="region"
            aria-label="Integration records"
            tabIndex={0}
          >
            <table>
              <thead>
                <tr>
                  <th>Record</th>
                  <th>Source task</th>
                  <th>Target workstream</th>
                  <th>Hours</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <th scope="row">{r.id}</th>
                    <td>{r.source}</td>
                    <td>{r.target === "unmapped" ? "Not mapped" : r.target}</td>
                    <td>{r.hours}</td>
                    <td>
                      {r.status === "Ready" ? (
                        "Ready"
                      ) : (
                        <span className="demo-warning">Needs mapping</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!mapped && (
            <div className="demo-resolution">
              <div>
                <h3>One task needs a decision.</h3>
                <p>
                  “Review session” has no matching target. Map it to Quality
                  review before applying the sample batch.
                </p>
              </div>
              <button
                onClick={() => {
                  setMapped(true);
                  setApplied(false);
                }}
              >
                Map to Quality review
              </button>
            </div>
          )}
          <div className="demo-bottom">
            <p>
              Unmapped records block application. Reapplying the same sample
              batch replaces the snapshot rather than counting its hours twice.
            </p>
            <button
              className="primary"
              disabled={!mapped || applied}
              onClick={() => setApplied(true)}
            >
              {applied ? "Sample applied" : "Apply validated sample"}
            </button>
            <button
              disabled={!applied}
              onClick={() =>
                downloadDemo(
                  "sample-integration-receipt.csv",
                  demoCsv(
                    rows.map((r) => ({
                      record: r.id,
                      task: r.source,
                      target: r.target,
                      hours: r.hours,
                      status: "Applied in demo",
                    })),
                    ["record", "task", "target", "hours", "status"],
                  ),
                )
              }
            >
              Download receipt ↓
            </button>
          </div>
        </>
      ) : (
        <div className="demo-empty">
          <h3>Trace a record from source to dashboard.</h3>
          <p>
            Run the sample sync, resolve the unmapped task, and apply the
            validated batch. All changes stay in this page.
          </p>
        </div>
      )}
    </div>
  );
}
