import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/PreferencesContext';
import ProgressBar from '../components/ProgressBar';
import NumberInput from '../components/NumberInput';
import WellnessCheckin from '../components/WellnessCheckin';

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

export default function Dashboard() {
  const { user } = useAuth();
  const { isMinimal } = usePreferences();
  const [data, setData]     = useState(null);
  const [steps, setSteps]   = useState(() => parseInt(localStorage.getItem('steps_today') || '0'));
  const [water, setWater]   = useState(0);

  useEffect(() => {
    api.get('/dashboard').then(r => {
      setData(r.data);
      setWater(r.data.waterToday ?? 0);
    }).catch(() => {});
  }, []);

  const handleSteps = (v) => {
    const val = parseInt(v) || 0;
    setSteps(val);
    localStorage.setItem('steps_today', val);
  };

  // Tap an empty cup → fill up to that cup. Tap a filled cup → un-fill it.
  // Uses PUT /water to SET the day's total directly — no delta arithmetic needed.
  const tapCup = async (cupIndex) => {
    const isFilled = cupIndex < filledCups;
    // Filled cup: remove it (target = cups before it). Empty cup: fill up to it.
    const targetOz = isFilled ? cupIndex * 8 : (cupIndex + 1) * 8;
    const prev = water;
    setWater(targetOz); // optimistic
    try {
      const r = await api.put('/water', { amount_oz: targetOz });
      setWater(r.data.total_oz);
    } catch {
      setWater(prev); // revert on failure
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

      <div className="grid-2" style={{ marginBottom: '1rem' }}>
        {/* Macros + volume */}
        <div className="card">
          <div className="card-title">Today's Macros</div>
          <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
            <MacroStat label="Protein" value={`${Math.round(n.protein ?? 0)}g`} color="var(--indigo)" />
            <MacroStat label="Carbs"   value={`${Math.round(n.carbs ?? 0)}g`}   color="var(--green)"  />
            <MacroStat label="Fat"     value={`${Math.round(n.fat ?? 0)}g`}     color="var(--yellow)" />
          </div>
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
