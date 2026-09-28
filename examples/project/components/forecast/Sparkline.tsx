'use client';


export default function Sparkline({ data, width = 80, height = 22, stroke = 'var(--accent)' }: { data: number[]; width?: number; height?: number; stroke?: string }) {
  if (!data || data.length === 0) {
    return <svg className="ppm-sparkline" width={width} height={height} aria-hidden />;
  }
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const stepX = data.length > 1 ? width / (data.length - 1) : 0;
  const path = data.map((v, i) => {
    const x = i * stepX;
    const y = height - ((v - min) / range) * height;
    return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(' ');
  const last = data[data.length - 1];
  const lastX = (data.length - 1) * stepX;
  const lastY = height - ((last - min) / range) * height;
  return (
    <svg className="ppm-sparkline" width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <path d={path} fill="none" stroke={stroke} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={lastX} cy={lastY} r={2} fill={stroke} />
    </svg>
  );
}
