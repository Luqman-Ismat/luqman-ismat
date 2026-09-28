'use client';
import { useState, useMemo, useRef, useEffect } from 'react';
import Breadcrumb from './Breadcrumb';

const MUTED = 'var(--fg-3)';
const LIME = '#84cc16';

type HierarchyItem = {
  id: string;
  name: string;
  table: 'units' | 'phases' | 'tasks' | 'sub_tasks';
  breadcrumb: string;
};

type Suggestion = {
  target_id: string;
  target_name: string;
  breadcrumb: string[];
  target_kind: string;
  method: string;
  confidence: number;
};

type Props = {
  bucketLabel: string;
  hierarchy: HierarchyItem[];
  suggestions?: Suggestion[];
  onApply: (item: { target_id: string; target_name: string; target_kind: string; breadcrumb: string[] }) => void;
  onClose: () => void;
};

const KIND_ORDER: Record<string, number> = { tasks: 0, sub_tasks: 1, phases: 2, units: 3 };

export default function MppPicker({ bucketLabel, hierarchy, suggestions, onApply, onClose }: Props) {
  const [search, setSearch] = useState('');
  const [unitFilter, setUnitFilter] = useState<string | null>(null);
  const [levelFilter, setLevelFilter] = useState<string>('tasks');
  const [selected, setSelected] = useState<HierarchyItem | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  // Extract unique units from hierarchy
  const units = useMemo(() =>
    [...new Set(hierarchy.filter(h => h.table === 'units').map(h => h.name))],
    [hierarchy],
  );

  // Filter hierarchy items
  const filtered = useMemo(() => {
    let items = hierarchy;
    if (levelFilter !== 'all') {
      items = items.filter(h => h.table === levelFilter);
    }
    if (unitFilter) {
      items = items.filter(h => h.breadcrumb.startsWith(unitFilter));
    }
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      items = items.filter(h =>
        h.name.toLowerCase().includes(q) ||
        h.breadcrumb.toLowerCase().includes(q),
      );
    }
    return items.slice(0, 100);
  }, [hierarchy, levelFilter, unitFilter, search]);

  const handleApply = () => {
    if (!selected) return;
    onApply({
      target_id: selected.id,
      target_name: selected.name,
      target_kind: selected.table,
      breadcrumb: selected.breadcrumb.split(' > '),
    });
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 300 }}
      />
      {/* Modal */}
      <div style={{
        position: 'fixed', top: '10vh', left: '50%', transform: 'translateX(-50%)',
        width: 580, maxHeight: '75vh',
        background: 'var(--surface-1)', borderRadius: 12,
        border: '1px solid var(--glass-border)',
        zIndex: 301, display: 'flex', flexDirection: 'column',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
      }}>
        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--glass-border)' }}>
          <div style={{ fontSize: 11, color: MUTED, marginBottom: 4 }}>Pick MPP target for</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg-1)', marginBottom: 12 }}>
            {bucketLabel}
          </div>
          <input
            ref={inputRef}
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search tasks, phases…"
            style={{
              width: '100%', padding: '8px 12px', borderRadius: 6,
              background: 'var(--surface-2)', border: '1px solid var(--glass-border)',
              color: 'var(--fg-1)', fontSize: 13, outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Filters */}
        <div style={{
          padding: '10px 20px', borderBottom: '1px solid var(--glass-border)',
          display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center',
        }}>
          {/* Unit chips */}
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            <Chip label="All units" active={!unitFilter} onClick={() => setUnitFilter(null)} />
            {units.slice(0, 8).map(u => (
              <Chip key={u} label={u} active={unitFilter === u} onClick={() => setUnitFilter(unitFilter === u ? null : u)} />
            ))}
          </div>

          <div style={{ width: 1, height: 20, background: 'var(--glass-border)' }} />

          {/* Level chips */}
          {(['tasks', 'phases', 'sub_tasks', 'units'] as const).map(l => (
            <Chip key={l} label={l.replace('_', ' ')} active={levelFilter === l}
              onClick={() => setLevelFilter(l)} small />
          ))}
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
          {/* Suggestions first */}
          {suggestions && suggestions.length > 0 && !search && (
            <div>
              <div style={groupLabel}>Suggestions</div>
              {suggestions.map(s => {
                const item: HierarchyItem = {
                  id: s.target_id, name: s.target_name,
                  table: s.target_kind as HierarchyItem['table'],
                  breadcrumb: s.breadcrumb.join(' > '),
                };
                const isSel = selected?.id === s.target_id;
                return (
                  <PickerRow key={s.target_id} item={item} selected={isSel} onSelect={() => setSelected(isSel ? null : item)} />
                );
              })}
              <div style={{ height: 1, background: 'var(--glass-border)', margin: '6px 0' }} />
            </div>
          )}

          {/* All matching */}
          {filtered.length > 0
            ? (
              <div>
                {!search && suggestions?.length ? <div style={groupLabel}>All matching</div> : null}
                {filtered.map(item => {
                  const isSel = selected?.id === item.id;
                  return <PickerRow key={item.id} item={item} selected={isSel} onSelect={() => setSelected(isSel ? null : item)} />;
                })}
              </div>
            )
            : <div style={{ padding: '20px', fontSize: 13, color: MUTED, textAlign: 'center' }}>No matches</div>
          }
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 20px', borderTop: '1px solid var(--glass-border)',
          display: 'flex', gap: 8, justifyContent: 'flex-end',
        }}>
          <button onClick={onClose} style={btnCancel}>Cancel</button>
          <button
            onClick={handleApply}
            disabled={!selected}
            style={{ ...btnApply, opacity: selected ? 1 : 0.4, cursor: selected ? 'pointer' : 'not-allowed' }}
          >
            Apply selected
          </button>
        </div>
      </div>
    </>
  );
}

function Chip({ label, active, onClick, small }: { label: string; active: boolean; onClick: () => void; small?: boolean }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: small ? '2px 8px' : '3px 10px',
        borderRadius: 4,
        border: active ? `1px solid ${LIME}` : '1px solid var(--glass-border)',
        background: active ? '#1a3a1a' : 'transparent',
        color: active ? LIME : 'var(--fg-2)',
        fontSize: 11, fontWeight: 600, cursor: 'pointer',
        textTransform: 'capitalize',
      }}
    >
      {label}
    </button>
  );
}

function PickerRow({ item, selected, onSelect }: { item: HierarchyItem; selected: boolean; onSelect: () => void }) {
  const bc = item.breadcrumb.split(' > ');
  return (
    <div
      onClick={onSelect}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '8px 20px', cursor: 'pointer',
        background: selected ? '#1a3a1a' : 'transparent',
        borderLeft: selected ? `2px solid ${LIME}` : '2px solid transparent',
      }}
    >
      <div style={{
        width: 16, height: 16, borderRadius: '50%', flexShrink: 0,
        border: `2px solid ${selected ? LIME : 'var(--fg-3)'}`,
        background: selected ? LIME : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {selected && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#000' }} />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--fg-1)' }}>{item.name}</div>
        <div style={{ marginTop: 1 }}>
          <Breadcrumb breadcrumb={bc} maxWidth={360} />
        </div>
      </div>
      <div style={{
        fontSize: 10, fontWeight: 600, color: MUTED, textTransform: 'uppercase',
        letterSpacing: '0.05em', flexShrink: 0,
      }}>
        {item.table.replace('_', ' ')}
      </div>
    </div>
  );
}

const groupLabel: React.CSSProperties = {
  fontSize: 11, fontWeight: 600, color: MUTED,
  textTransform: 'uppercase', letterSpacing: '0.05em',
  padding: '4px 20px 6px',
};
const btnCancel: React.CSSProperties = {
  padding: '7px 16px', borderRadius: 6, border: '1px solid var(--glass-border)',
  background: 'transparent', color: 'var(--fg-2)', fontSize: 13, cursor: 'pointer', fontWeight: 600,
};
const btnApply: React.CSSProperties = {
  ...btnCancel,
  background: LIME, color: '#000', border: 'none',
};
