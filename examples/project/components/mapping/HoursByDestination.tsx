'use client';
import { useState } from 'react';
import Breadcrumb from './Breadcrumb';

const MUTED = 'var(--fg-3)';
const AMBER = '#f59e0b';
const LIME = '#84cc16';
const RED = '#ef4444';

type DestinationNode = {
  id: string;
  name: string;
  kind: 'unit' | 'phase' | 'task' | 'sub_task';
  breadcrumb: string[];
  actual_hours: number;
  children?: DestinationNode[];
  source_buckets?: { bucket_id: string; phase: string; task: string | null; hours: number; entries: number }[];
  mismatch?: boolean;
};

type Props = {
  tree: DestinationNode[];
  onOpenBucket?: (bucketId: string) => void;
  onReApply?: (bucketId: string) => void;
};

export default function HoursByDestination({ tree, onOpenBucket, onReApply }: Props) {
  if (!tree || tree.length === 0) {
    return (
      <div style={{ padding: '32px', textAlign: 'center', color: MUTED, fontSize: 13 }}>
        No hours mapped yet. Apply mappings in Triage to see hours roll up here.
      </div>
    );
  }

  return (
    <div>
      {tree.map(unit => (
        <UnitNode key={unit.id} node={unit} onOpenBucket={onOpenBucket} onReApply={onReApply} depth={0} />
      ))}
    </div>
  );
}

function UnitNode({ node, onOpenBucket, onReApply, depth }: {
  node: DestinationNode;
  onOpenBucket?: (id: string) => void;
  onReApply?: (id: string) => void;
  depth: number;
}) {
  const [open, setOpen] = useState(true);
  const hrs = node.actual_hours.toLocaleString(undefined, { maximumFractionDigits: 1 });
  const hasChildren = node.children && node.children.length > 0;
  const isLeaf = !hasChildren;

  return (
    <div style={{ marginBottom: depth === 0 ? 12 : 0 }}>
      {/* Node header */}
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: `${depth === 0 ? 10 : 7}px ${8 + depth * 16}px`,
          cursor: hasChildren ? 'pointer' : 'default',
          background: depth === 0 ? 'var(--surface-2)' : 'transparent',
          borderRadius: depth === 0 ? 8 : 0,
          borderBottom: depth === 0 ? 'none' : '1px solid var(--glass-border)',
        }}
      >
        {hasChildren && (
          <span style={{ color: MUTED, fontSize: 11, width: 12, flexShrink: 0 }}>
            {open ? '▾' : '▸'}
          </span>
        )}
        {isLeaf && (
          <span style={{ color: MUTED, fontSize: 11, width: 12, flexShrink: 0 }}>·</span>
        )}

        <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          {depth === 0 ? (
            <span style={{ fontFamily: 'monospace', color: LIME, fontWeight: 700, fontSize: 13 }}>
              {node.name}
            </span>
          ) : (
            <span style={{ fontSize: 13, color: 'var(--fg-1)', fontWeight: depth === 1 ? 600 : 400 }}>
              {node.name}
            </span>
          )}
          {node.mismatch && (
            <span style={{ fontSize: 11, color: AMBER }}>⚠ MISMATCH SUSPECTED</span>
          )}
        </div>

        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-1)', flexShrink: 0 }}>
          {hrs} hrs
        </span>

        {isLeaf && node.source_buckets && (
          <span style={{ fontSize: 12, color: MUTED, flexShrink: 0 }}>
            from {node.source_buckets.length} bucket{node.source_buckets.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Mismatch detail inline */}
      {node.mismatch && node.source_buckets && (
        <div style={{
          margin: `4px ${8 + depth * 16}px`,
          padding: '10px 14px',
          background: '#1a0a0a',
          borderRadius: 6,
          border: `1px solid #450a0a`,
        }}>
          {node.source_buckets.map(b => (
            <div key={b.bucket_id} style={{ fontSize: 12, marginBottom: 6 }}>
              <div style={{ color: AMBER, fontWeight: 600, marginBottom: 2 }}>
                ⚠ Mismatch: {b.phase}{b.task ? ` · ${b.task}` : ''}
              </div>
              <div style={{ color: MUTED }}>
                {b.hours.toLocaleString(undefined, { maximumFractionDigits: 1 })} hrs · {b.entries} entries
              </div>
              <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                {onOpenBucket && (
                  <MiniBtn label="Open bucket" onClick={() => onOpenBucket(b.bucket_id)} />
                )}
                {onReApply && (
                  <MiniBtn label="Re-apply with UUID" onClick={() => onReApply(b.bucket_id)} highlight />
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Children */}
      {hasChildren && open && (
        <div>
          {node.children!.map(child => (
            <UnitNode key={child.id} node={child} onOpenBucket={onOpenBucket} onReApply={onReApply} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

function MiniBtn({ label, onClick, highlight }: { label: string; onClick: () => void; highlight?: boolean }) {
  return (
    <button onClick={onClick} style={{
      padding: '3px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, cursor: 'pointer',
      border: `1px solid ${highlight ? LIME : 'var(--glass-border)'}`,
      background: 'transparent',
      color: highlight ? LIME : MUTED,
    }}>
      {label}
    </button>
  );
}
