/**
 * Friendly empty state. Use for empty tables/lists and "no results" pages.
 */
import type { ReactNode } from 'react';

export default function EmptyState({
  title, body, action,
}: {
  title: string;
  body?: string;
  action?: ReactNode;
}) {
  return (
    <div className="glass" style={{ padding: 32, display: 'grid', placeItems: 'center', gap: 8, textAlign: 'center' }}>
      <div style={{ fontSize: 'var(--fs-md)', fontWeight: 'var(--fw-semibold)', color: 'var(--fg-1)' }}>{title}</div>
      {body && <p className="t-small" style={{ color: 'var(--fg-3)', maxWidth: 420 }}>{body}</p>}
      {action}
    </div>
  );
}
