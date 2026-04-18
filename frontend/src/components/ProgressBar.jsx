export default function ProgressBar({ value, max, color = '#6366f1' }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="progress-bar-container">
      <div className="progress-bar-track">
        <div
          className="progress-bar-fill"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}
