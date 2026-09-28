'use client';
/**
 * FilterBar — a thin, sticky row of filter controls used at the top of feature pages.
 * Children are usually <Dropdown>, <input>, or buttons. Right-side slot for actions.
 */
import type { ReactNode } from 'react';

export default function FilterBar({
  children, actions,
}: {
  children: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div
      className="glass filter-bar"
      style={{
        position: 'sticky', top: 'calc(var(--nav-height) + 8px)', zIndex: 5,
        padding: 10, marginBottom: 16,
        display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
        justifyContent: 'space-between',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>{children}</div>
      {actions && <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', minWidth: 0 }}>{actions}</div>}
    </div>
  );
}
