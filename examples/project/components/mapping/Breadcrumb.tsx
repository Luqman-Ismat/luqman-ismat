'use client';

const LIME = '#84cc16';
const MUTED = 'var(--fg-3)';
const FG1 = 'var(--fg-1)';

type Props = {
  breadcrumb: string[];
  onClick?: () => void;
  maxWidth?: number;
};

export default function Breadcrumb({ breadcrumb, onClick, maxWidth = 400 }: Props) {
  if (!breadcrumb || breadcrumb.length === 0) return null;

  const parts = breadcrumb;

  // Truncate middle segments if too many
  const display: string[] = parts.length > 3
    ? [parts[0], '…', parts[parts.length - 1]]
    : parts;

  return (
    <span
      onClick={onClick}
      title={breadcrumb.join(' > ')}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0,
        maxWidth,
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
        whiteSpace: 'nowrap',
        fontSize: 12,
      }}
    >
      {display.map((seg, i) => (
        <span key={i} style={{ display: 'inline-flex', alignItems: 'center', minWidth: 0 }}>
          {i > 0 && (
            <span style={{ color: MUTED, margin: '0 4px', fontSize: 11 }}>›</span>
          )}
          {i === 0 ? (
            <span style={{ fontFamily: 'monospace', color: LIME, fontWeight: 600, fontSize: 12 }}>
              {seg}
            </span>
          ) : i === display.length - 1 ? (
            <span style={{ color: FG1, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {seg}
            </span>
          ) : (
            <span style={{ color: MUTED }}>{seg}</span>
          )}
        </span>
      ))}
    </span>
  );
}
