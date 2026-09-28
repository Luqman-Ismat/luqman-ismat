'use client';


export default function VarianceBar({ value, baseline, money }: { value: number; baseline: number; money?: boolean }) {
  if (!baseline) {
    return <span style={{ color: 'var(--fg-3)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>—</span>;
  }
  const delta = (Number(value) || 0) - baseline;
  const pct = (delta / baseline) * 100;
  const capped = Math.max(-50, Math.min(50, pct));
  const tone = pct > 0 ? 'bad' : 'good';
  const widthPct = Math.abs(capped); // 0..50
  const isRight = pct > 0;
  return (
    <span className="ppm-var-bar">
      <span className="ppm-var-bar-track" title={`baseline ${baseline.toLocaleString()} · delta ${delta.toLocaleString()}`}>
        <span className="ppm-var-bar-mid" />
        <span
          className={`ppm-var-bar-fill ${tone}`}
          style={isRight
            ? { left: '50%', width: `${widthPct}%` }
            : { right: '50%', width: `${widthPct}%` }}
        />
      </span>
      <span style={{ color: pct > 0 ? 'var(--color-error)' : pct < 0 ? 'var(--color-success)' : 'var(--fg-3)', whiteSpace: 'nowrap' }}>
        {money && '$'}{pct >= 0 ? '+' : ''}{pct.toFixed(1)}%
      </span>
    </span>
  );
}
