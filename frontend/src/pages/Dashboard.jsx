import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/PreferencesContext';
import ProgressBar from '../components/ProgressBar';
import NumberInput from '../components/NumberInput';
import WellnessCheckin from '../components/WellnessCheckin';
import Skeleton, { SkeletonCard, SkeletonStat } from '../components/Skeleton';

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
}

const STREAK_MESSAGES = {
  workout: [
    { min: 1,  msg: "You showed up today. That's everything. 💪" },
    { min: 3,  msg: "3 days strong! Keep that momentum going 🔥" },
    { min: 7,  msg: "One full week of consistency! You're building something real 🌟" },
    { min: 14, msg: "Two weeks! Your future self is thanking you right now 🚀" },
    { min: 30, msg: "30 days. You're not just working out — you're becoming someone who works out 🏆" },
  ],
  nutrition: [
    { min: 1,  msg: "Fueling right today. Every meal counts 🥗" },
    { min: 3,  msg: "3 days of solid nutrition tracking! Consistency is the secret weapon ✅" },
    { min: 7,  msg: "A week of dialed-in nutrition! You're in control 🎯" },
  ]
};

function getStreakMsg(count, type) {
  const msgs = STREAK_MESSAGES[type] || [];
  const match = [...msgs].reverse().find(m => count >= m.min);
  return match?.msg || null;
}

// ── Active Program Widget ─────────────────────────────────────────────────────

function ActiveProgramWidget() {
  const [prog, setProg]   = useState(null);
  const [loading, setLoad] = useState(true);

  useEffect(() => {
    api.get('/programs/active/today')
      .then(r => setProg(r.data))
      .catch(() => setProg(null))
      .finally(() => setLoad(false));
  }, []);

  if (loading) return (
    <div className="card" style={{ marginBottom: '1rem', borderColor: 'rgba(99,102,241,0.3)' }}>
      <Skeleton height={14} width="35%" radius={5} style={{ marginBottom: '0.5rem' }} />
      <Skeleton height={20} width="65%" radius={6} style={{ marginBottom: '0.75rem' }} />
      <Skeleton height={8}  width="100%" radius={4} style={{ marginBottom: '0.85rem' }} />
      <Skeleton height={13} width="50%" radius={5} />
    </div>
  );

  if (!prog || !prog.program) return null;

  const { program, today_workout, day_number, total_days } = prog;
  const pct = total_days > 0 ? Math.round((day_number / total_days) * 100) : 0;
  const isRest = !today_workout || today_workout.is_rest_day;

  return (
    <div className="card" style={{ marginBottom: '1rem', borderColor: 'rgba(99,102,241,0.35)', background: 'rgba(99,102,241,0.04)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
        <div>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--indigo)', marginBottom: '0.2rem' }}>
            Active Program
          </div>
          <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>{program.name}</div>
        </div>
        <Link to="/programs" style={{ fontSize: '0.75rem', color: 'var(--indigo)', textDecoration: 'none', fontWeight: 600, marginTop: '0.1rem' }}>
          View →
        </Link>
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
          <span>Day {day_number} of {total_days}</span>
          <span>{pct}% complete</span>
        </div>
        <div className="prog-progress-bar">
          <div className="prog-progress-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {isRest ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 0.85rem', background: 'var(--bg-elevated)', borderRadius: 10 }}>
          <span style={{ fontSize: '1.3rem' }}>😴</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>Rest Day</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Recovery is where the gains happen</div>
          </div>
        </div>
      ) : (
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.82rem', marginBottom: '0.4rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Today · {today_workout.name}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            {(today_workout.exercises || []).slice(0, 4).map((ex, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0.7rem', background: 'var(--bg-elevated)', borderRadius: 8 }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{ex.name}</span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {ex.sets && ex.reps ? `${ex.sets}×${ex.reps}` : ex.sets ? `${ex.sets} sets` : ''}
                  {ex.weight ? ` @ ${ex.weight}lbs` : ''}
                </span>
              </div>
            ))}
            {(today_workout.exercises || []).length > 4 && (
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', padding: '0.3rem' }}>
                +{today_workout.exercises.length - 4} more exercises
              </div>
            )}
          </div>
          <Link to="/workouts" style={{ textDecoration: 'none', display: 'block', marginTop: '0.65rem' }}>
            <button className="btn btn-primary" style={{ width: '100%' }}>
              💪 Start Today's Workout
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}

// ── Recent PRs Strip ──────────────────────────────────────────────────────────

function RecentPRsStrip({ prs }) {
  if (!prs || prs.length === 0) return null;

  return (
    <div style={{ marginBottom: '1rem' }}>
      <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
        Recent PRs
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
        {prs.map(pr => (
          <div key={pr.exercise_name} style={{
            flexShrink: 0,
            padding: '0.5rem 0.85rem',
            background: 'rgba(234,179,8,0.07)',
            border: '1px solid rgba(234,179,8,0.25)',
            borderRadius: 10,
            minWidth: 0,
          }}>
            <div style={{ fontSize: '0.68rem', color: 'var(--yellow)', fontWeight: 700, marginBottom: '0.15rem' }}>🏆 PR</div>
            <div style={{ fontWeight: 700, fontSize: '0.85rem', whiteSpace: 'nowrap' }}>{pr.exercise_name}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>{pr.weight} lbs</div>
          </div>
        ))}
        <Link to="/progress" style={{
          flexShrink: 0,
          padding: '0.5rem 0.85rem',
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border)',
          borderRadius: 10,
          textDecoration: 'none',
          display: 'flex', alignItems: 'center',
          color: 'var(--indigo)', fontSize: '0.8rem', fontWeight: 600,
          whiteSpace: 'nowrap',
        }}>
          All PRs →
        </Link>
      </div>
    </div>
  );
}

// ── Weekly Summary Row ────────────────────────────────────────────────────────

function WeeklySummary({ summary, goals }) {
  if (!summary) return null;
  const { workouts, avgCalories, weightChange } = summary;

  const changeColor = weightChange === null ? 'var(--text-muted)'
    : weightChange < 0 ? 'var(--green)'
    : weightChange > 0 ? 'var(--orange)'
    : 'var(--text-muted)';

  return (
    <div style={{ marginBottom: '1rem' }}>
      <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
        This Week
      </div>
      <div className="weekly-summary-row">
        <div className="weekly-stat">
          <div className="weekly-stat-val" style={{ color: 'var(--violet)' }}>{workouts}</div>
          <div className="weekly-stat-label">Workouts</div>
          <div className="weekly-stat-sub">/ {goals?.workout_days_per_week ?? 4} goal</div>
        </div>
        <div className="weekly-stat">
          <div className="weekly-stat-val" style={{ color: 'var(--orange)' }}>
            {avgCalories > 0 ? avgCalories.toLocaleString() : '—'}
          </div>
          <div className="weekly-stat-label">Avg Cal/Day</div>
          <div className="weekly-stat-sub">kcal average</div>
        </div>
        <div className="weekly-stat">
          <div className="weekly-stat-val" style={{ color: changeColor }}>
            {weightChange === null ? '—' : `${weightChange > 0 ? '+' : ''}${weightChange}`}
          </div>
          <div className="weekly-stat-label">Weight Δ</div>
          <div className="weekly-stat-sub">lbs this week</div>
        </div>
      </div>
    </div>
  );
}

// ── Minimal Mode Dashboard ────────────────────────────────────────────────────

function MinimalDashboard({ data, user }) {
  const { updatePrefs } = usePreferences();
  const goals   = data?.goals ?? { calorie_goal: 2000, protein_goal: 150, workout_days_per_week: 4 };
  const n       = data?.nutrition ?? {};
  const streaks = data?.streaks ?? { workout: 0 };
  const today   = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="page" style={{ maxWidth: 480, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, letterSpacing: '-0.03em' }}>
            {greeting()}, {user?.username?.split(' ')[0]} 👋
          </h1>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{today}</div>
        </div>
        <button
          onClick={() => updatePrefs({ minimal_mode: false })}
          style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-muted)', padding: '0.3rem 0.65rem', cursor: 'pointer', fontSize: '0.75rem', fontFamily: 'inherit', flexShrink: 0 }}
          title="Switch to full dashboard"
        >
          Full View
        </button>
      </div>

      <WellnessCheckin />

      {/* Single focus stat */}
      <div className="card" style={{ marginBottom: '1.25rem', textAlign: 'center', padding: '2rem 1.5rem' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Today's Protein</div>
        <div style={{ fontSize: '3.5rem', fontWeight: 800, color: 'var(--indigo)', letterSpacing: '-0.03em', lineHeight: 1 }}>
          {Math.round(n.protein ?? 0)}<span style={{ fontSize: '1.5rem', fontWeight: 500, color: 'var(--text-muted)' }}>g</span>
        </div>
        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>goal: {goals.protein_goal}g</div>
        <ProgressBar value={n.protein ?? 0} max={goals.protein_goal} color="var(--indigo)" />
      </div>

      {/* Streak */}
      {streaks.workout > 0 && (
        <div style={{
          padding: '1rem 1.25rem', marginBottom: '1.25rem',
          background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)', borderRadius: 14,
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>🔥</div>
          <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--orange)' }}>{streaks.workout} day streak</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>Keep it going!</div>
        </div>
      )}

      {/* One action */}
      <Link to="/workouts" style={{ textDecoration: 'none', display: 'block' }}>
        <div className="btn btn-primary" style={{ width: '100%', fontSize: '1rem', padding: '1rem', borderRadius: 14, justifyContent: 'center' }}>
          💪 Log Today's Workout
        </div>
      </Link>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.75rem' }}>
        <Link to="/nutrition" style={{ textDecoration: 'none' }}>
          <div className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center', borderRadius: 12 }}>🥗 Log Meal</div>
        </Link>
        <Link to="/progress" style={{ textDecoration: 'none' }}>
          <div className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center', borderRadius: 12 }}>📈 Progress</div>
        </Link>
      </div>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────

export default function Dashboard() {
  const { user } = useAuth();
  const { isMinimal } = usePreferences();
  const [data, setData]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [steps, setSteps] = useState(() => parseInt(localStorage.getItem('steps_today') || '0'));
  const [water, setWater] = useState(0);

  useEffect(() => {
    api.get('/dashboard').then(r => {
      setData(r.data);
      setWater(r.data.waterToday ?? 0);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleSteps = (v) => {
    const val = parseInt(v) || 0;
    setSteps(val);
    localStorage.setItem('steps_today', val);
  };

  const tapCup = async (cupIndex) => {
    const isFilled = cupIndex < filledCups;
    const targetOz = isFilled ? cupIndex * 8 : (cupIndex + 1) * 8;
    const prev = water;
    setWater(targetOz);
    try {
      const r = await api.put('/water', { amount_oz: targetOz });
      setWater(r.data.total_oz);
    } catch {
      setWater(prev);
    }
  };

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const goals = data?.goals ?? { calorie_goal: 2000, protein_goal: 150, steps_goal: 10000, water_goal_oz: 64, workout_days_per_week: 4 };
  const n = data?.nutrition ?? {};
  const streaks = data?.streaks ?? { workout: 0, nutrition: 0 };
  const waterCups = Math.round(goals.water_goal_oz / 8);
  const filledCups = Math.round(water / 8);

  if (isMinimal) return <MinimalDashboard data={data} user={user} />;

  return (
    <div className="page">
      <div className="page-header">
        <h1>{greeting()}, {user?.username}</h1>
        <p>{today}</p>
      </div>

      {/* Wellness check-in */}
      <WellnessCheckin />

      {/* Streak chips */}
      {(streaks.workout > 0 || streaks.nutrition > 0) && (
        <div className="streak-row">
          {streaks.workout > 0 && (
            <div className={`streak-chip ${streaks.workout >= 3 ? 'hot' : ''}`}>
              🔥 {streaks.workout} day workout streak
            </div>
          )}
          {streaks.nutrition > 0 && (
            <div className={`streak-chip ${streaks.nutrition >= 3 ? 'hot' : ''}`}>
              ✅ {streaks.nutrition} day nutrition streak
            </div>
          )}
        </div>
      )}

      {/* Motivational message */}
      {(() => {
        const msg = getStreakMsg(streaks.workout, 'workout') || getStreakMsg(streaks.nutrition, 'nutrition');
        return msg ? (
          <div style={{ padding: '0.75rem 1rem', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 12, fontSize: '0.875rem', color: '#c7d2fe', marginBottom: '1.25rem' }}>
            {msg}
          </div>
        ) : null;
      })()}

      {/* Stat cards */}
      {loading ? (
        <div className="grid-4" style={{ marginBottom: '1rem' }}>
          {[0,1,2,3].map(i => <SkeletonStat key={i} />)}
        </div>
      ) : (
        <div className="grid-4" style={{ marginBottom: '1rem' }}>
          <div className="card stat-orange">
            <div className="card-title">Calories</div>
            <div className="card-value">{Math.round(n.calories ?? 0)}</div>
            <div className="card-sub">/ {goals.calorie_goal} kcal</div>
            <ProgressBar value={n.calories ?? 0} max={goals.calorie_goal} color="var(--orange)" />
          </div>
          <div className="card stat-indigo">
            <div className="card-title">Protein</div>
            <div className="card-value">{Math.round(n.protein ?? 0)}g</div>
            <div className="card-sub">/ {goals.protein_goal}g</div>
            <ProgressBar value={n.protein ?? 0} max={goals.protein_goal} color="var(--indigo)" />
          </div>
          <div className="card stat-green">
            <div className="card-title">Steps</div>
            <div className="card-value">{steps.toLocaleString()}</div>
            <div className="card-sub">/ {(goals.steps_goal ?? 10000).toLocaleString()}</div>
            <ProgressBar value={steps} max={goals.steps_goal ?? 10000} color="var(--green)" />
            <NumberInput value={steps || ''} onChange={handleSteps} min={0} max={100000} step={500} placeholder="Log steps" />
          </div>
          <div className="card stat-violet">
            <div className="card-title">Workouts</div>
            <div className="card-value">{data?.workouts?.length ?? 0}</div>
            <div className="card-sub">{data?.weeklyWorkouts ?? 0} this week</div>
            <ProgressBar value={data?.weeklyWorkouts ?? 0} max={goals.workout_days_per_week ?? 4} color="var(--violet)" />
          </div>
        </div>
      )}

      {/* Weekly Summary */}
      {!loading && <WeeklySummary summary={data?.weeklySummary} goals={goals} />}

      <div className="grid-2" style={{ marginBottom: '1rem' }}>
        {/* Macros + volume */}
        <div className="card">
          <div className="card-title">Today's Macros</div>
          {loading ? (
            <>
              <Skeleton height={14} width="55%" radius={5} style={{ marginBottom: '0.5rem', marginTop: '0.5rem' }} />
              <Skeleton height={14} width="40%" radius={5} />
            </>
          ) : (
            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
              <MacroStat label="Protein" value={`${Math.round(n.protein ?? 0)}g`} color="var(--indigo)" />
              <MacroStat label="Carbs"   value={`${Math.round(n.carbs ?? 0)}g`}   color="var(--green)"  />
              <MacroStat label="Fat"     value={`${Math.round(n.fat ?? 0)}g`}     color="var(--yellow)" />
            </div>
          )}
          {data?.latestWeight && (
            <>
              <hr className="divider" />
              <div className="card-title" style={{ marginBottom: '0.2rem' }}>Body Weight</div>
              <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>{data.latestWeight.weight} lbs</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginLeft: '0.5rem' }}>{data.latestWeight.date}</span>
            </>
          )}
        </div>

        {/* Water tracker */}
        <div className="card stat-cyan">
          <div className="card-title">Water</div>
          <div className="card-value">{water}<span style={{ fontSize: '1rem', fontWeight: 400, color: 'var(--text-muted)' }}> / {goals.water_goal_oz}oz</span></div>
          <ProgressBar value={water} max={goals.water_goal_oz ?? 64} color="var(--cyan)" />
          <div className="water-cups" style={{ marginTop: '0.75rem' }}>
            {Array.from({ length: waterCups }).map((_, i) => (
              <button
                key={i}
                className={`water-cup ${i < filledCups ? 'filled' : ''}`}
                onClick={() => tapCup(i)}
                title={i < filledCups ? 'Tap to reduce water' : 'Tap to log 8oz'}
              >💧</button>
            ))}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>Tap a cup to log 8oz</div>
        </div>
      </div>

      {/* Active Program Widget */}
      <ActiveProgramWidget />

      {/* Recent PRs */}
      {!loading && <RecentPRsStrip prs={data?.recentPRs} />}

      {/* Today's workouts */}
      {data?.workouts?.length > 0 && (
        <div className="card" style={{ marginBottom: '1rem' }}>
          <div className="card-title">Today's Sessions</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.4rem' }}>
            {data.workouts.map(w => (
              <div key={w.id} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.5rem 0.75rem', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 9 }}>
                <span className={`badge badge-${w.type.toLowerCase().replace(' ', '-')}`}>{w.type}</span>
                <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>{w.name}</span>
                <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{w.exercise_count} exercises</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick links */}
      <div className="grid-3">
        {[
          { to: '/goals',      icon: '🎯', label: 'Edit Goals' },
          { to: '/body-stats', icon: '📏', label: 'Log Measurements' },
          { to: '/calculator', icon: '🧮', label: 'Calculators' },
        ].map(({ to, icon, label }) => (
          <Link key={to} to={to} style={{ textDecoration: 'none' }}>
            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.85rem 1rem', cursor: 'pointer', transition: 'border-color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--indigo)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = ''}>
              <span style={{ fontSize: '1.2rem' }}>{icon}</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{label}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function MacroStat({ label, value, color }) {
  return (
    <div>
      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.15rem' }}>{label}</div>
      <div style={{ fontSize: '1.25rem', fontWeight: 700, color }}>{value}</div>
    </div>
  );
}
