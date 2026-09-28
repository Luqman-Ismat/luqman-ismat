'use client';

export type TrailEntry = {
  actor_role?: string | null;
  actor_id?: string | null;
  actor_name?: string | null;
  action: string;
  at?: string | null;
  comment?: string | null;
};

const ACTION_LABEL: Record<string, string> = {
  submitted:          'submitted',
  approved:           'approved',
  rejected:           'rejected',
  revision_requested: 'requested revision',
  voided:             'voided',
  superseded:         'superseded',
  finalized:          'finalized',
};

export default function ApprovalTrail({ trail }: { trail: TrailEntry[] | string | null | undefined }) {
  const entries: TrailEntry[] = Array.isArray(trail)
    ? trail
    : typeof trail === 'string'
      ? (() => { try { return JSON.parse(trail) as TrailEntry[]; } catch { return []; } })()
      : [];

  if (entries.length === 0) {
    return (
      <div className="ppm-fc-trail">
        <div className="ppm-fc-trail-head">Approval trail</div>
        <div className="ppm-fc-trail-row" style={{ paddingTop: 0 }}>
          <div className="ppm-fc-trail-body">
            <span className="t-small" style={{ color: 'var(--fg-3)' }}>No history yet.</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ppm-fc-trail">
      <div className="ppm-fc-trail-head">Approval trail</div>
      {entries.map((e, i) => {
        const cls = `is-${e.action}`;
        const who = `${e.actor_name || e.actor_id || 'system'}${e.actor_role ? ` (${e.actor_role})` : ''}`;
        const when = e.at ? new Date(e.at).toLocaleString() : '';
        return (
          <div key={i} className="ppm-fc-trail-row">
            <div className={`ppm-fc-trail-dot ${cls}`} />
            <div className="ppm-fc-trail-body">
              <div className="ppm-fc-trail-meta">
                <span className="ppm-fc-trail-who">{who}</span>
                <span className="ppm-fc-trail-action">{ACTION_LABEL[e.action] || e.action}</span>
                {when && <span className="ppm-fc-trail-when">· {when}</span>}
              </div>
              {e.comment && <div className="ppm-fc-trail-note">{e.comment}</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
