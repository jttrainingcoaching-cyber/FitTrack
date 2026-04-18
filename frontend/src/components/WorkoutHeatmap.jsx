import { useState, useEffect, useRef } from 'react';
import api from '../api/client';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function clampCount(n) {
  if (n === 0) return 0;
  if (n === 1) return 1;
  if (n === 2) return 2;
  if (n === 3) return 3;
  return 4; // 4+
}

export default function WorkoutHeatmap() {
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [tooltip, setTooltip] = useState(null); // { x, y, date, count }
  const tooltipRef = useRef(null);

  useEffect(() => {
    api.get('/workouts/heatmap?weeks=52')
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="empty">Loading heatmap…</div>;

  // Group days into weeks (columns of 7)
  // Pad the start so first day lands on the correct weekday
  const firstDate = data.length > 0 ? new Date(data[0].date) : new Date();
  const startDow  = firstDate.getDay(); // 0=Sun

  // Build grid: array of week-columns, each column = 7 cells (Sun→Sat)
  // Prepend empty padding so the grid aligns to Sun
  const padded = [
    ...Array(startDow).fill(null),
    ...data,
  ];

  const weeks = [];
  for (let i = 0; i < padded.length; i += 7) {
    weeks.push(padded.slice(i, i + 7));
  }

  // Build month label positions
  const monthLabels = [];
  let lastMonth = -1;
  weeks.forEach((week, wi) => {
    const firstReal = week.find(d => d !== null);
    if (!firstReal) return;
    const m = new Date(firstReal.date).getMonth();
    if (m !== lastMonth) {
      monthLabels.push({ month: m, col: wi });
      lastMonth = m;
    }
  });

  const totalWorkouts = data.reduce((s, d) => s + d.count, 0);
  const activeDays    = data.filter(d => d.count > 0).length;

  const handleMouseEnter = (e, cell) => {
    if (!cell) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({
      x: rect.left + rect.width / 2,
      y: rect.top - 8,
      date: cell.date,
      count: cell.count,
    });
  };

  const handleMouseLeave = () => setTooltip(null);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <div>
      {/* Stats row */}
      <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--indigo)', lineHeight: 1 }}>{totalWorkouts}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Workouts (52 wks)</div>
        </div>
        <div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--violet)', lineHeight: 1 }}>{activeDays}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Active Days</div>
        </div>
        <div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--green)', lineHeight: 1 }}>
            {totalWorkouts > 0 ? Math.round((activeDays / 365) * 100) : 0}%
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Consistency</div>
        </div>
      </div>

      <div className="heatmap-wrap">
        {/* Month labels */}
        <div className="heatmap-months" style={{ paddingLeft: 30 }}>
          {monthLabels.map(({ month, col }, i) => {
            const prevCol = i > 0 ? monthLabels[i-1].col : 0;
            const gap = col - (i > 0 ? prevCol : 0);
            return (
              <div key={`${month}-${col}`} style={{ width: gap * 16, flexShrink: 0, overflow: 'hidden' }}>
                {MONTH_NAMES[month]}
              </div>
            );
          })}
        </div>

        {/* Grid with day labels */}
        <div style={{ display: 'flex', gap: 0 }}>
          {/* Day-of-week labels */}
          <div className="heatmap-days" style={{ paddingTop: 0 }}>
            {DAY_LABELS.map((d, i) => (
              <div key={d} className="heatmap-day-label" style={{ opacity: i % 2 === 1 ? 1 : 0 }}>
                {d}
              </div>
            ))}
          </div>

          {/* Week columns */}
          <div className="heatmap-grid">
            {weeks.map((week, wi) => (
              <div key={wi} className="heatmap-col">
                {week.map((cell, di) => (
                  <div
                    key={di}
                    className="heatmap-cell"
                    data-count={cell ? clampCount(cell.count) : 0}
                    style={!cell ? { opacity: 0, pointerEvents: 'none' } : {}}
                    onMouseEnter={e => handleMouseEnter(e, cell)}
                    onMouseLeave={handleMouseLeave}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="heatmap-legend" style={{ paddingLeft: 30 }}>
          <span>Less</span>
          <div className="heatmap-legend-cells">
            {[0, 1, 2, 3, 4].map(n => (
              <div key={n} className="heatmap-cell" data-count={n} style={{ position: 'static', cursor: 'default' }} />
            ))}
          </div>
          <span>More</span>
        </div>
      </div>

      {/* Floating tooltip */}
      {tooltip && (
        <div
          ref={tooltipRef}
          className="heatmap-tooltip"
          style={{
            left: tooltip.x,
            top:  tooltip.y,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <strong>{formatDate(tooltip.date)}</strong>
          {' · '}
          {tooltip.count === 0
            ? 'No workouts'
            : `${tooltip.count} workout${tooltip.count > 1 ? 's' : ''}`}
        </div>
      )}
    </div>
  );
}
