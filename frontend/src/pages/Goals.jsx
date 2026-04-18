import { useState, useEffect } from 'react';
import api from '../api/client';
import { useToast } from '../context/ToastContext';
import NumberInput from '../components/NumberInput';
import MacroRing from '../components/MacroRing';

const ACTIVITY_LABELS = {
  sedentary: 'Sedentary — desk job, little movement',
  light: 'Light — 1–3 workouts/week',
  moderate: 'Moderate — 3–5 workouts/week',
  active: 'Active — 6–7 workouts/week',
  very_active: 'Very Active — athlete / physical job',
};

export default function Goals() {
  const { addToast } = useToast();
  const [goals, setGoals]   = useState({ calorie_goal: 2000, protein_goal: 150, carbs_goal: 250, fat_goal: 65, steps_goal: 10000, water_goal_oz: 64, workout_days_per_week: 4 });
  const [profile, setProfile] = useState({ height_in: '', date_of_birth: '', gender: '', unit_system: 'imperial', fitness_goal: 'maintain', activity_level: 'moderate' });
  const [totals, setTotals] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    Promise.all([
      api.get('/goals').then(r => setGoals(r.data)).catch(() => {}),
      api.get('/profile').then(r => { if (r.data?.user_id) setProfile(r.data); }).catch(() => {}),
      api.get(`/meals?date=${today}`).then(r => {
        const meals = r.data || [];
        setTotals(meals.reduce(
          (a, m) => ({ calories: a.calories + m.calories, protein: a.protein + m.protein, carbs: a.carbs + m.carbs, fat: a.fat + m.fat }),
          { calories: 0, protein: 0, carbs: 0, fat: 0 }
        ));
      }).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  const saveGoals = async () => {
    try { await api.put('/goals', goals); addToast('Goals saved! 🎯', 'success'); }
    catch { addToast('Failed to save goals', 'error'); }
  };

  const saveProfile = async () => {
    try { await api.put('/profile', profile); addToast('Profile saved!', 'success'); }
    catch { addToast('Failed to save profile', 'error'); }
  };

  if (loading) return <div className="loading">Loading…</div>;

  const g = goals;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Goals & Profile</h1>
        <p>Set your daily targets and personal information</p>
      </div>

      {/* Daily targets */}
      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <div className="section-title">Daily Targets</div>
        <div className="grid-2" style={{ marginBottom: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Calories (kcal)</label>
            <NumberInput value={g.calorie_goal} onChange={v => setGoals(p => ({ ...p, calorie_goal: v }))} min={500} max={10000} step={50} unit="kcal" />
          </div>
          <div className="form-group">
            <label className="form-label">Protein (g)</label>
            <NumberInput value={g.protein_goal} onChange={v => setGoals(p => ({ ...p, protein_goal: v }))} min={0} max={500} step={5} unit="g" />
          </div>
          <div className="form-group">
            <label className="form-label">Carbohydrates (g)</label>
            <NumberInput value={g.carbs_goal} onChange={v => setGoals(p => ({ ...p, carbs_goal: v }))} min={0} max={1000} step={10} unit="g" />
          </div>
          <div className="form-group">
            <label className="form-label">Fat (g)</label>
            <NumberInput value={g.fat_goal} onChange={v => setGoals(p => ({ ...p, fat_goal: v }))} min={0} max={300} step={5} unit="g" />
          </div>
          <div className="form-group">
            <label className="form-label">Daily Steps</label>
            <NumberInput value={g.steps_goal} onChange={v => setGoals(p => ({ ...p, steps_goal: v }))} min={0} max={50000} step={500} />
          </div>
          <div className="form-group">
            <label className="form-label">Water (oz)</label>
            <NumberInput value={g.water_goal_oz} onChange={v => setGoals(p => ({ ...p, water_goal_oz: v }))} min={8} max={256} step={8} unit="oz" />
          </div>
          <div className="form-group">
            <label className="form-label">Workout Days / Week</label>
            <NumberInput value={g.workout_days_per_week} onChange={v => setGoals(p => ({ ...p, workout_days_per_week: v }))} min={1} max={7} step={1} unit="days" />
          </div>
        </div>

        {/* Macro split preview + Today's progress rings */}
        <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          {/* Macro split */}
          <div style={{ flex: '1 1 180px', padding: '0.75rem 1rem', background: 'var(--bg-elevated)', borderRadius: 10 }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Macro Split Preview</div>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              {[
                { label: 'Protein', kcal: g.protein_goal * 4, color: 'var(--indigo)' },
                { label: 'Carbs',   kcal: g.carbs_goal * 4,   color: 'var(--green)'  },
                { label: 'Fat',     kcal: g.fat_goal * 9,     color: 'var(--yellow)' },
              ].map(({ label, kcal, color }) => {
                const pct = g.calorie_goal > 0 ? Math.round((kcal / g.calorie_goal) * 100) : 0;
                return (
                  <div key={label}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{label}</div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color }}>{pct}%</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{kcal} kcal</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Today's progress rings */}
          <div style={{ flex: '1 1 300px', padding: '0.75rem 1rem', background: 'var(--bg-elevated)', borderRadius: 10 }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Today's Progress</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center' }}>
              <MacroRing label="Calories" value={Math.round(totals.calories)} goal={g.calorie_goal} color="var(--orange)" unit="kcal" />
              <MacroRing label="Protein"  value={Math.round(totals.protein)}  goal={g.protein_goal}  color="var(--indigo)" unit="g" />
              <MacroRing label="Carbs"    value={Math.round(totals.carbs)}    goal={g.carbs_goal}    color="var(--green)"  unit="g" />
              <MacroRing label="Fat"      value={Math.round(totals.fat)}      goal={g.fat_goal}      color="var(--yellow)" unit="g" />
            </div>
          </div>
        </div>

        <button className="btn btn-primary" onClick={saveGoals}>Save Goals</button>
      </div>

      {/* Profile */}
      <div className="card">
        <div className="section-title">Personal Profile</div>
        <div className="grid-2" style={{ marginBottom: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Height</label>
            <NumberInput value={profile.height_in || ''} onChange={v => setProfile(p => ({ ...p, height_in: v }))} min={36} max={96} step={0.5} unit="in" placeholder="72" />
          </div>
          <div className="form-group">
            <label className="form-label">Date of Birth</label>
            <input type="date" className="form-input" value={profile.date_of_birth || ''} onChange={e => setProfile(p => ({ ...p, date_of_birth: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Gender</label>
            <select className="form-select" value={profile.gender || ''} onChange={e => setProfile(p => ({ ...p, gender: e.target.value }))}>
              <option value="">Prefer not to say</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Primary Goal</label>
            <select className="form-select" value={profile.fitness_goal || 'maintain'} onChange={e => setProfile(p => ({ ...p, fitness_goal: e.target.value }))}>
              <option value="lose">Lose Weight / Fat Loss</option>
              <option value="maintain">Maintain / Body Recomp</option>
              <option value="gain">Build Muscle / Bulk</option>
            </select>
          </div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Activity Level</label>
            <select className="form-select" value={profile.activity_level || 'moderate'} onChange={e => setProfile(p => ({ ...p, activity_level: e.target.value }))}>
              {Object.entries(ACTIVITY_LABELS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>
        </div>
        <button className="btn btn-primary" onClick={saveProfile}>Save Profile</button>
      </div>
    </div>
  );
}
