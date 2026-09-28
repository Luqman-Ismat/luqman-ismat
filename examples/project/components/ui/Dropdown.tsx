'use client';
/**
 * Dropdown — single, multi, or searchable. Uses the design-system's `.dd-*` classes
 * for the panel chrome (`ppm-design-system/project/ui_kits/ppm-app/dropdowns.css`).
 *
 *   <Dropdown options=[...] />              single select
 *   <Dropdown multi options=[...] />        multi-select
 *   <Dropdown searchable options=[...] />   typeahead
 *
 * The panel is portaled to <body> and positioned via getBoundingClientRect on the
 * trigger, so it escapes any ancestor `overflow:auto` (assignments table, modals,
 * sidebars, …). It tracks the trigger via scroll/resize listeners; only scrolls
 * OUTSIDE both the trigger and the panel close it (so users can scroll the panel
 * body or the trigger's own overflow without losing the popover).
 *
 * Keyboard: Enter/Space opens; ↑↓ navigate; Enter selects; Esc closes.
 */
import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export type Option = { value: string; label: string; hint?: string; group?: string };

type Common = {
  label?: string;
  placeholder?: string;
  options: Option[];
  searchable?: boolean;
  disabled?: boolean;
  width?: number | string;
  maxHeight?: number;
  /** Minimum width for the popover panel (px). Useful when the trigger lives in a
   *  narrow table cell — the panel can grow beyond the trigger to fit the labels. */
  panelMinWidth?: number;
};

type SingleProps = Common & { multi?: false; value: string | null; onChange: (v: string | null) => void };
type MultiProps  = Common & { multi: true; value: string[]; onChange: (v: string[]) => void };
type Props = SingleProps | MultiProps;

export default function Dropdown(props: Props) {
  const { label, placeholder = 'Select…', options, searchable, disabled, width, maxHeight = 320, panelMinWidth } = props;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const [pos, setPos] = useState<{ top: number; left: number; width: number } | null>(null);
  const triggerId = useId();
  const wrapRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(
    () => (!searchable || !query
      ? options
      : options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))),
    [options, query, searchable],
  );

  const isMulti = props.multi === true;
  const selected: Set<string> = isMulti
    ? new Set((props.value as string[]) || [])
    : (props.value ? new Set([props.value as string]) : new Set());

  const triggerLabel = isMulti
    ? (selected.size ? `${selected.size} selected` : placeholder)
    : (options.find((o) => o.value === props.value)?.label || placeholder);

  /** Recompute panel position from the trigger rect; call on open + on scroll/resize. */
  const reposition = useCallback(() => {
    const trigger = wrapRef.current;
    if (!trigger) return;
    const r = trigger.getBoundingClientRect();
    setPos({ top: r.bottom + 4, left: r.left, width: r.width });
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    reposition();
  }, [open, reposition]);

  useEffect(() => {
    if (!open) return;

    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node | null;
      if (wrapRef.current?.contains(t)) return;
      if (panelRef.current?.contains(t)) return;
      setOpen(false);
    };

    /** Outside-scroll closes; trigger scroll or panel scroll repositions. */
    const onScroll = (e: Event) => {
      const t = e.target as Node | null;
      const insideTrigger = wrapRef.current?.contains(t as Node);
      const insidePanel   = panelRef.current?.contains(t as Node);
      if (insideTrigger || insidePanel) return;
      reposition();
    };

    const onResize = () => reposition();

    document.addEventListener('mousedown', onDoc);
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onResize);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onResize);
    };
  }, [open, reposition]);

  function pick(opt: Option) {
    if (isMulti) {
      const next = new Set(selected);
      if (next.has(opt.value)) next.delete(opt.value);
      else next.add(opt.value);
      (props.onChange as (v: string[]) => void)(Array.from(next));
    } else {
      (props.onChange as (v: string | null) => void)(opt.value === (props.value as string | null) ? null : opt.value);
      setOpen(false);
    }
  }

  function onKey(e: React.KeyboardEvent<HTMLButtonElement>) {
    if (disabled) return;
    if (!open && (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown')) {
      e.preventDefault(); setOpen(true); setActive(0); return;
    }
    if (!open) return;
    if (e.key === 'Escape')   { setOpen(false); return; }
    if (e.key === 'ArrowDown'){ e.preventDefault(); setActive((i) => Math.min(filtered.length - 1, i + 1)); }
    if (e.key === 'ArrowUp')  { e.preventDefault(); setActive((i) => Math.max(0, i - 1)); }
    if (e.key === 'Enter')    { e.preventDefault(); const o = filtered[active]; if (o) pick(o); }
  }

  const groups = useMemo(() => {
    const m = new Map<string, Option[]>();
    filtered.forEach((o) => {
      const k = o.group || '';
      if (!m.has(k)) m.set(k, []);
      m.get(k)!.push(o);
    });
    return Array.from(m.entries());
  }, [filtered]);

  return (
    <div ref={wrapRef} style={{ position: 'relative', width }}>
      {label && <div className="t-label" style={{ marginBottom: 6 }}>{label}</div>}
      <button
        id={triggerId}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => !disabled && setOpen((o) => !o)}
        onKeyDown={onKey}
        className="input"
        style={{
          textAlign: 'left',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 8, cursor: disabled ? 'not-allowed' : 'pointer',
          color: triggerLabel === placeholder ? 'var(--fg-3)' : 'var(--fg-1)',
          width: '100%',
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{triggerLabel}</span>
        <span aria-hidden style={{ color: 'var(--fg-3)', fontSize: 10 }}>▾</span>
      </button>

      {open && pos && typeof document !== 'undefined' && createPortal(
        <div
          ref={panelRef}
          className="dd-panel"
          role="listbox"
          style={(() => {
            const desired = Math.max(pos.width, panelMinWidth ?? 0);
            // Keep the panel inside the viewport: shift left if it would overflow the right edge.
            const margin = 8;
            const viewportW = typeof window !== 'undefined' ? window.innerWidth : desired;
            const left = Math.min(pos.left, Math.max(margin, viewportW - desired - margin));
            return {
              position: 'fixed' as const,
              top: pos.top,
              left,
              width: desired,
              zIndex: 10_000,
            };
          })()}
        >
          {searchable && (
            <div className="dd-search">
              <span aria-hidden style={{ fontSize: 12 }}>⌕</span>
              <input
                autoFocus
                placeholder="Filter…"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setActive(0); }}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') setOpen(false);
                  if (e.key === 'ArrowDown') { e.preventDefault(); setActive((i) => Math.min(filtered.length - 1, i + 1)); }
                  if (e.key === 'ArrowUp')   { e.preventDefault(); setActive((i) => Math.max(0, i - 1)); }
                  if (e.key === 'Enter')     { e.preventDefault(); const o = filtered[active]; if (o) pick(o); }
                }}
              />
              <span className="kbd">Esc</span>
            </div>
          )}
          <div className="dd-body" style={{ maxHeight, overflowY: 'auto' }}>
            {filtered.length === 0 && (
              <div className="t-small" style={{ padding: '8px 6px', color: 'var(--fg-3)' }}>No matches</div>
            )}
            {groups.map(([groupName, items]) => (
              <div key={groupName || '_'}>
                {groupName && <div className="dd-group-label">{groupName}</div>}
                {items.map((o) => {
                  const idx = filtered.indexOf(o);
                  const isActive = idx === active;
                  const isSelected = selected.has(o.value);
                  return (
                    <button
                      key={o.value}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      className={`dd-row${isActive ? ' active' : ''}`}
                      onMouseEnter={() => setActive(idx)}
                      onClick={() => pick(o)}
                    >
                      {isMulti && (
                        <span style={{
                          width: 14, height: 14, borderRadius: 3,
                          border: '1px solid var(--glass-border-hover)',
                          background: isSelected ? 'var(--accent)' : 'transparent',
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          marginRight: 8,
                          position: 'relative',
                        }}>
                          {isSelected && (
                            <span style={{
                              width: 6, height: 6, background: '#0a0b0c', borderRadius: 1,
                            }} />
                          )}
                        </span>
                      )}
                      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.label}</span>
                      {o.hint && <span className="dd-row-meta">{o.hint}</span>}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}
