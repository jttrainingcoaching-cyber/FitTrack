import { useState, useEffect } from 'react';
import api from '../api/client';
import {
  LineChart, Line, BarChart, Bar,
  ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import WorkoutHeatmap from '../components/WorkoutHeatmap';
import ExerciseSubstitutes from '../components/ExerciseSubstitutes';
import Skeleton, { SkeletonPR } from '../components/Skeleton';

// ── Personal Records ──────────────────────────────────────────────────────────

function PersonalRecords() {
  const [prs, setPRs]       = useState([]);
  const [loading, setLoad]  = useState(true);

  useEffect(() => {
    api.get('/workouts/prs')
      .then(r => setPRs(r.data))
      .catch(() => {})
      .finally(() => setLoad(false));
  }, []);

  return (
    <div className="card" style={{ marginBottom: '1.5rem', borderColor: 'rgba(234,179,8,0.35)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.2rem' }}>🏆</span>
          <div className="section-title" style={{ margin: 0 }}>Personal Records</div>
        </div>
        {!loading && prs.length > 0 && (
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {prs.length} exercise{prs.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {loading ? (
        <div className="pr-grid">
          {[0,1,2,3,4,5].map(i => <SkeletonPR key={i} />)}
        </div>
      ) : prs.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">🏋️</div>
          Log workouts with weights to start tracking your personal records
        </div>
      ) : (
        <div className="pr-grid">
          {prs.map(pr => (
            <div key={pr.exercise_name} className="pr-card">
              <div className="pr-trophy">🏆</div>
              <div className="pr-exercise">{pr.exercise_name}</div>
              <div className="pr-weight">
                {pr.weight}<span className="pr-unit">lbs</span>
              </div>
              {(pr.reps || pr.one_rep_max) && (
                <div className="pr-detail">
                  {pr.reps ? `${pr.reps} reps` : ''}
                  {pr.reps && pr.one_rep_max ? ' · ' : ''}
                  {pr.one_rep_max ? `~${pr.one_rep_max} 1RM` : ''}
                </div>
              )}
              <div className="pr-date">{pr.date}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const TOOLTIP_STYLE = {
  contentStyle: {
    background: '#1a1a24',
    border: '1px solid #2a2a3a',
    borderRadius: 10,
    color: '#e8e8f0',
    fontSize: '0.8rem'
  },
  cursor: { stroke: '#2a2a3a' }
};

// ── Overlapping Multi-Dataset Chart ─────────────────────────────────────────

function OverlapChart({ weights, volume }) {
  const [show, setShow] = useState({ weight: true, calories: true, volume: true });
  const [calories, setCalories] = useState([]);

  useEffect(() => {
    api.get('/workouts/calorie-summary?days=30').then(r => setCalories(r.data)).catch(() => {});
  }, []);

  // Merge all datasets by date
  const dateMap = {};
  weights.forEach(w => {
    dateMap[w.date] = { ...dateMap[w.date], date: w.date.slice(5), fullDate: w.date, weight: w.weight };
  });
  calories.forEach(c => {
    dateMap[c.date] = { ...dateMap[c.date], date: c.date.slice(5), fullDate: c.date, calories: c.calories };
  });
  volume.forEach(v => {
    dateMap[v.date] = { ...dateMap[v.date], date: v.date.slice(5), fullDate: v.date, volume: Math.round(v.volume) };
  });

  const data = Object.values(dateMap).sort((a, b) => a.fullDate.localeCompare(b.fullDate));

  const toggles = [
    { key: 'weight',   label: 'Weight (lbs)',   color: '#6366f1' },
    { key: 'calories', label: 'Calories (kcal)', color: '#f97316' },
    { key: 'volume',   label: 'Volume (lbs)',    color: '#8b5cf6' },
  ];

  return (
    <div className="card" style={{ marginBottom: '1.5rem' }}>
      <div className="section-title">Multi-Dataset Overview</div>
      <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        {toggles.map(t => (
          <button
            key={t.key}
            onClick={() => setShow(s => ({ ...s, [t.key]: !s[t.key] }))}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.35rem 0.75rem', borderRadius: 8,
              border: `1.5px solid ${show[t.key] ? t.color : 'var(--border)'}`,
              background: show[t.key] ? `${t.color}22` : 'var(--bg-elevated)',
              color: show[t.key] ? t.color : 'var(--text-muted)',
              cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600,
              fontFamily: 'inherit', transition: 'all 0.15s',
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: show[t.key] ? t.color : 'var(--border)', flexShrink: 0 }} />
            {t.label}
          </button>
        ))}
      </div>
      {data.length < 2
        ? <div className="empty"><div className="empty-icon">📊</div>Log workouts, meals, and weight to see overlay charts</div>
        : <div className="chart-wrapper" style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" />
                <XAxis dataKey="date" tick={{ fill: '#888899', fontSize: 11 }} />
                {show.weight   && <YAxis yAxisId="weight"   orientation="left"  tick={{ fill: '#6366f1', fontSize: 10 }} width={40} />}
                {show.calories && <YAxis yAxisId="calories" orientation="right" tick={{ fill: '#f97316', fontSize: 10 }} width={45} />}
                {show.volume   && <YAxis yAxisId="volume"   orientation="right" tick={{ fill: '#8b5cf6', fontSize: 10 }} width={50} hide />}
                <Tooltip {...TOOLTIP_STYLE} />
                {show.weight && (
                  <Line yAxisId="weight" type="monotone" dataKey="weight" name="Weight (lbs)"
                    stroke="#6366f1" strokeWidth={2.5} dot={{ fill: '#6366f1', r: 3, strokeWidth: 0 }}
                    activeDot={{ r: 5, fill: '#6366f1', strokeWidth: 0 }} connectNulls />
                )}
                {show.calories && (
                  <Line yAxisId="calories" type="monotone" dataKey="calories" name="Calories (kcal)"
                    stroke="#f97316" strokeWidth={2} strokeDasharray="4 2"
                    dot={{ fill: '#f97316', r: 2, strokeWidth: 0 }} connectNulls />
                )}
                {show.volume && (
                  <Bar yAxisId="volume" dataKey="volume" name="Volume (lbs)" fill="#8b5cf6" opacity={0.6} radius={[3, 3, 0, 0]} />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
      }
    </div>
  );
}

// ── Exercise Strength Progression ────────────────────────────────────────────

function StrengthChart() {
  const [exerciseNames, setExerciseNames] = useState([]);
  const [selectedEx, setSelectedEx] = useState('');
  const [progressData, setProgressData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/workouts/exercise-names').then(r => {
      setExerciseNames(r.data);
      if (r.data.length > 0) setSelectedEx(r.data[0]);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedEx) return;
    setLoading(true);
    api.get(`/workouts/exercise-progress?name=${encodeURIComponent(selectedEx)}`)
      .then(r => setProgressData(r.data))
      .catch(() => setProgressData([]))
      .finally(() => setLoading(false));
  }, [selectedEx]);

  const chartData = progressData.map(d => ({
    date: d.date.slice(5),
    weight: d.max_weight,
    reps: d.max_reps,
  }));

  return (
    <div className="card" style={{ marginBottom: '1.5rem' }}>
      <div className="section-title">Strength Progression</div>
      {exerciseNames.length === 0
        ? <div className="empty"><div className="empty-icon">🏋️</div>Log exercises with weights to see progression charts</div>
        : <>
            <div style={{ marginBottom: '1rem' }}>
              <select
                className="form-select"
                value={selectedEx}
                onChange={e => setSelectedEx(e.target.value)}
                style={{ maxWidth: 280 }}
              >
                {exerciseNames.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            {loading
              ? <div className="empty">Loading...</div>
              : chartData.length < 2
                ? <div className="empty">Not enough data yet — log at least 2 sessions of {selectedEx}</div>
                : <div className="chart-wrapper">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" />
                        <XAxis dataKey="date" tick={{ fill: '#888899', fontSize: 11 }} />
                        <YAxis domain={['auto', 'auto']} tick={{ fill: '#888899', fontSize: 11 }} />
                        <Tooltip {...TOOLTIP_STYLE} formatter={v => [`${v} lbs`, 'Max Weight']} />
                        <Line
                          type="monotone" dataKey="weight" name="Max Weight"
                          stroke="#22c55e" strokeWidth={2.5}
                          dot={{ fill: '#22c55e', r: 4, strokeWidth: 0 }}
                          activeDot={{ r: 6, fill: '#22c55e', strokeWidth: 0 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
            }
          </>
      }
    </div>
  );
}

// ── Plateau Radar ─────────────────────────────────────────────────────────────

function PlateauRadar() {
  const [plateaus, setPlateaus] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/workouts/plateau-check')
      .then(r => setPlateaus(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;
  if (plateaus.length === 0) return (
    <div className="card" style={{ marginBottom: '1.5rem' }}>
      <div className="section-title">Plateau Radar</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--green)', fontSize: '0.875rem' }}>
        <span style={{ fontSize: '1.2rem' }}>✅</span>
        <span>All exercises are showing progression — keep it up!</span>
      </div>
    </div>
  );

  return (
    <div className="card" style={{ marginBottom: '1.5rem', borderColor: 'rgba(234,179,8,0.3)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.85rem' }}>
        <span style={{ fontSize: '1.2rem' }}>🔍</span>
        <div className="section-title" style={{ margin: 0 }}>Plateau Radar</div>
      </div>
      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.85rem' }}>
        These exercises have been steady for a few sessions — might be time to mix things up!
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        {plateaus.map(p => (
          <div key={p.exercise} style={{
            padding: '0.75rem 1rem',
            background: 'rgba(234,179,8,0.05)',
            border: '1px solid rgba(234,179,8,0.2)',
            borderRadius: 10,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.4rem' }}>
              <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{p.exercise}</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--yellow)', fontWeight: 600 }}>
                Steady at {p.weight} lbs
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', marginBottom: '0.6rem' }}>
              Stuck at {p.weight} lbs for a while — consider a deload week, adding volume, or swapping the exercise.
            </div>
            <ExerciseSubstitutes exerciseName={p.exercise} compact />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Feel & Performance Chart ──────────────────────────────────────────────────

function FeelCorrelation() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/insights/feel-correlation')
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;
  if (data.length === 0) return (
    <div className="card" style={{ marginBottom: '1.5rem' }}>
      <div className="section-title">Feel & Performance</div>
      <div className="empty"><div className="empty-icon">😴</div>Log workout feelings to see your performance patterns by day</div>
    </div>
  );

  return (
    <div className="card" style={{ marginBottom: '1.5rem' }}>
      <div className="section-title">Feel & Performance by Day</div>
      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
        Average energy, sleep quality, and soreness by day of week
      </p>
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" />
            <XAxis dataKey="day" tick={{ fill: '#888899', fontSize: 11 }} />
            <YAxis domain={[0, 5]} ticks={[1,2,3,4,5]} tick={{ fill: '#888899', fontSize: 11 }} />
            <Tooltip
              {...TOOLTIP_STYLE}
              formatter={(v, name) => [v ? v.toFixed(1) : 'N/A', name]}
            />
            <Legend wrapperStyle={{ fontSize: '0.75rem', color: '#888899' }} />
            <Bar dataKey="avg_energy"   name="Energy"        fill="#f97316" radius={[4, 4, 0, 0]} />
            <Bar dataKey="avg_sleep"    name="Sleep Quality" fill="#6366f1" radius={[4, 4, 0, 0]} />
            <Bar dataKey="avg_soreness" name="Soreness"      fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
        {data.map(d => (
          <div key={d.day} style={{ fontSize: '0.75rem', textAlign: 'center' }}>
            <div style={{ fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.15rem' }}>{d.day.slice(0,3)}</div>
            <div style={{ color: 'var(--text-muted)' }}>{d.session_count} sessions</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Progress Page ────────────────────────────────────────────────────────

export default function Progress() {
  const [weights, setWeights] = useState([]);
  const [volume,  setVolume]  = useState([]);
  const [wForm, setWForm]     = useState({ weight: '', date: new Date().toISOString().split('T')[0] });
  const [adding, setAdding]   = useState(false);

  useEffect(() => {
    api.get('/bodyweight').then(r => setWeights(r.data)).catch(() => {});
    api.get('/workouts/volume').then(r => setVolume(r.data)).catch(() => {});
  }, []);

  const addWeight = async () => {
    if (!wForm.weight) return;
    setAdding(true);
    try {
      const r = await api.post('/bodyweight', wForm);
      setWeights(prev => [...prev, r.data].sort((a, b) => a.date.localeCompare(b.date)));
      setWForm({ weight: '', date: new Date().toISOString().split('T')[0] });
    } catch {}
    setAdding(false);
  };

  const deleteWeight = async (id) => {
    try {
      await api.delete(`/bodyweight/${id}`);
      setWeights(prev => prev.filter(w => w.id !== id));
    } catch {}
  };

  const latest    = weights[weights.length - 1]?.weight;
  const first     = weights[0]?.weight;
  const change    = latest != null && first != null ? (latest - first).toFixed(1) : null;
  const changeNum = parseFloat(change);

  const weightData = weights.map(w => ({ date: w.date.slice(5), weight: w.weight }));
  const volData    = volume.map(v => ({ date: v.date.slice(5), volume: Math.round(v.volume) }));

  return (
    <div className="page">
      <div className="page-header">
        <h1>Progress</h1>
        <p>Body weight trends, training volume, and strength progression</p>
      </div>

      {/* Personal Records */}
      <PersonalRecords />

      {/* Summary cards */}
      <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
        <div className="card">
          <div className="card-title">Current Weight</div>
          <div className="card-value" style={{ color: 'var(--indigo)' }}>{latest ?? '—'}</div>
          <div className="card-sub">lbs</div>
        </div>
        <div className="card">
          <div className="card-title">Total Change</div>
          <div className="card-value" style={{ color: change === null ? 'var(--text-muted)' : changeNum > 0 ? 'var(--red)' : 'var(--green)' }}>
            {change !== null ? `${changeNum > 0 ? '+' : ''}${change}` : '—'}
          </div>
          <div className="card-sub">lbs since first entry</div>
        </div>
        <div className="card">
          <div className="card-title">Weigh-ins Logged</div>
          <div className="card-value" style={{ color: 'var(--violet)' }}>{weights.length}</div>
          <div className="card-sub">total entries</div>
        </div>
      </div>

      {/* Workout Frequency Heatmap */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="section-title">Workout Frequency — Last 52 Weeks</div>
        <WorkoutHeatmap />
      </div>

      {/* Multi-dataset overlay chart */}
      <OverlapChart weights={weights} volume={volume} />

      {/* Body weight chart */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="section-title">Body Weight Over Time</div>
        {weightData.length < 2
          ? <div className="empty"><div className="empty-icon">📈</div>Log at least 2 entries to see your trend</div>
          : <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weightData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" />
                  <XAxis dataKey="date" tick={{ fill: '#888899', fontSize: 11 }} />
                  <YAxis domain={['auto', 'auto']} tick={{ fill: '#888899', fontSize: 11 }} />
                  <Tooltip {...TOOLTIP_STYLE} formatter={v => [`${v} lbs`, 'Weight']} />
                  <Line
                    type="monotone" dataKey="weight" stroke="#6366f1" strokeWidth={2.5}
                    dot={{ fill: '#6366f1', r: 3, strokeWidth: 0 }}
                    activeDot={{ r: 5, fill: '#8b5cf6', strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
        }
      </div>

      {/* Volume chart */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="section-title">Training Volume (lbs lifted per session)</div>
        {volData.length === 0
          ? <div className="empty"><div className="empty-icon">💪</div>No volume data yet — log some workouts with weights</div>
          : <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={volData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" />
                  <XAxis dataKey="date" tick={{ fill: '#888899', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#888899', fontSize: 11 }} />
                  <Tooltip {...TOOLTIP_STYLE} formatter={v => [`${v.toLocaleString()} lbs`, 'Volume']} />
                  <Bar dataKey="volume" fill="#8b5cf6" radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
        }
      </div>

      {/* Strength Progression */}
      <StrengthChart />

      {/* Plateau Radar */}
      <PlateauRadar />

      {/* Feel & Performance */}
      <FeelCorrelation />

      <div className="grid-2" style={{ alignItems: 'start' }}>
        {/* Log weight */}
        <div className="card">
          <div className="section-title">Log Body Weight</div>
          <div className="form-row">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Weight (lbs)</label>
              <input
                className="form-input" type="number" step="0.1" min="0"
                placeholder="175.5"
                value={wForm.weight}
                onChange={e => setWForm({ ...wForm, weight: e.target.value })}
                onKeyDown={e => e.key === 'Enter' && addWeight()}
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Date</label>
              <input
                className="form-input" type="date"
                value={wForm.date}
                onChange={e => setWForm({ ...wForm, date: e.target.value })}
              />
            </div>
          </div>
          <button
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.85rem' }}
            onClick={addWeight}
            disabled={adding || !wForm.weight}
          >
            {adding ? 'Saving…' : 'Log Weight'}
          </button>
        </div>

        {/* History list */}
        <div className="card">
          <div className="section-title">Recent Entries</div>
          {weights.length === 0
            ? <div className="empty">No entries yet</div>
            : <div style={{ display: 'flex', flexDirection: 'column', gap: '0', maxHeight: 300, overflowY: 'auto' }}>
                {[...weights].reverse().slice(0, 20).map(w => (
                  <div key={w.id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '0.5rem 0', borderBottom: '1px solid var(--border)'
                  }}>
                    <div>
                      <span style={{ fontWeight: 600 }}>{w.weight} lbs</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginLeft: '0.75rem' }}>{w.date}</span>
                    </div>
                    <button className="btn btn-danger btn-sm" onClick={() => deleteWeight(w.id)}>✕</button>
                  </div>
                ))}
              </div>
          }
        </div>
      </div>
    </div>
  );
}
