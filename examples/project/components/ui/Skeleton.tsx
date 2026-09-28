/**
 * Skeleton loader strip. Inherits the keyframes from globals.css (.skeleton class
 * is also valid inline CSS we redeclare here for componentized use).
 */
type Props = { width?: number | string; height?: number | string; radius?: number | string };

export default function Skeleton({ width = '100%', height = 16, radius = 'var(--radius-sm)' }: Props) {
  return (
    <span
      aria-hidden
      style={{
        display: 'block', width, height, borderRadius: radius,
        background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 0, rgba(255,255,255,0.10) 50%, rgba(255,255,255,0.04) 100%)',
        backgroundSize: '800px 100%',
        animation: 'shimmer 1.4s infinite linear',
      }}
    />
  );
}
