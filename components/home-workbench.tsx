"use client";
import { useState } from "react";
import Link from "next/link";
import { workstreams } from "@/lib/demos/models";
export function HomeWorkbench() {
  const [view, setView] = useState("Project controls");
  return (
    <div className="home-workbench">
      <div className="workbench-top">
        <span>THE WORK / INTERACTIVE PREVIEW</span>
        <span className="sample-label">Fictional data</span>
      </div>
      <div className="workbench-tabs" role="group" aria-label="Work preview">
        {["Project controls", "Inspection planning", "Integrations"].map(
          (v) => (
            <button
              key={v}
              aria-pressed={view === v}
              onClick={() => setView(v)}
            >
              {v}
            </button>
          ),
        )}
      </div>
      <div className="workbench-content">
        {view === "Project controls" ? (
          <>
            <div className="workbench-heading">
              <h2>
                From plan
                <br />
                to a clear next step.
              </h2>
              <p>Schedule / Effort / Forecast</p>
            </div>
            <div className="home-schedule">
              {workstreams.map((r) => (
                <div key={r.id}>
                  <span>{r.name}</span>
                  <div>
                    <i
                      style={{
                        marginLeft: `${(r.start / 12) * 100}%`,
                        width: `${(r.weeks / 12) * 100}%`,
                      }}
                    />
                  </div>
                  <small>{r.progress}%</small>
                </div>
              ))}
            </div>
          </>
        ) : view === "Inspection planning" ? (
          <>
            <div className="workbench-heading">
              <h2>
                See the trend.
                <br />
                Review the decision.
              </h2>
              <p>Risk curves / Timing / Holds</p>
            </div>
            <svg
              viewBox="0 0 500 150"
              className="home-risk-curve"
              role="img"
              aria-label="Illustrative rising risk trend and review threshold"
            >
              <path d="M10 135 Q280 130 490 15" />
              <path d="M10 55H490" />
            </svg>
            <p className="preview-explanation">
              Inspect an asset, compare a timing scenario, and keep review holds
              visible.
            </p>
          </>
        ) : (
          <>
            <div className="workbench-heading">
              <h2>
                Connected data.
                <br />
                Traceable decisions.
              </h2>
              <p>Source / Validate / Reconcile</p>
            </div>
            <div className="home-integration-steps">
              <div>
                <span>01</span>Read the source
              </div>
              <div>
                <span>02</span>Resolve mismatches
              </div>
              <div>
                <span>03</span>Apply reviewed records
              </div>
            </div>
          </>
        )}
      </div>
      <Link
        className="workbench-open"
        href={
          view === "Project controls"
            ? "/demos/project-controls"
            : view === "Inspection planning"
              ? "/demos/inspection-planning"
              : "/demos/connected-operations"
        }
      >
        Open the full demo <span aria-hidden="true">↗</span>
      </Link>
    </div>
  );
}
