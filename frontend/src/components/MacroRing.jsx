import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

export default function MacroRing({ label, value, goal, color, unit }) {
  const pct = goal > 0 ? Math.min((value / goal) * 100, 100) : 0;
  const data = [{ value: pct }, { value: 100 - pct }];
  const remaining = Math.max(goal - value, 0);

  return (
    <div className="macro-ring-item">
      <div style={{ width: 110, height: 110, position: 'relative' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%" cy="50%"
              innerRadius={35} outerRadius={48}
              startAngle={90} endAngle={-270}
              dataKey="value"
              strokeWidth={0}
            >
              <Cell fill={color} />
              <Cell fill="#22222e" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center', pointerEvents: 'none'
        }}>
          <div style={{ fontSize: '1.05rem', fontWeight: 700, lineHeight: 1, color }}>{value}</div>
          <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: 2 }}>{unit}</div>
        </div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div className="macro-ring-label">{label}</div>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          {remaining}{unit} left
        </div>
      </div>
    </div>
  );
}
