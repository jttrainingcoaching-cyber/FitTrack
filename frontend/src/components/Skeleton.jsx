// Animated skeleton loading placeholders
export default function Skeleton({ height = 80, width = '100%', radius = 10, style }) {
  return (
    <div className="skeleton" style={{ height, width, borderRadius: radius, ...style }} />
  );
}

export function SkeletonCard({ lines = 2, style }) {
  return (
    <div className="card" style={{ marginBottom: '1.25rem', ...style }}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height={i === 0 ? 18 : 13}
          width={i === 0 ? '50%' : `${75 - i * 12}%`}
          radius={6}
          style={{ marginBottom: i < lines - 1 ? '0.65rem' : 0 }}
        />
      ))}
    </div>
  );
}

export function SkeletonStat() {
  return (
    <div className="card" style={{ marginBottom: 0 }}>
      <Skeleton height={13} width="45%" radius={5} style={{ marginBottom: '0.5rem' }} />
      <Skeleton height={32} width="60%" radius={6} style={{ marginBottom: '0.4rem' }} />
      <Skeleton height={8}  width="100%" radius={4} />
    </div>
  );
}

export function SkeletonPR() {
  return (
    <div className="pr-card">
      <Skeleton height={13} width="70%" radius={5} style={{ marginBottom: '0.5rem' }} />
      <Skeleton height={28} width="55%" radius={6} style={{ marginBottom: '0.35rem' }} />
      <Skeleton height={11} width="80%" radius={4} />
    </div>
  );
}
