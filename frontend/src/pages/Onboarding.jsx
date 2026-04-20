import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../api/client';

const GOALS = [
  { id: 'lose_weight',       label: 'Lose Weight',       emoji: '🔥', desc: 'Burn fat, feel lighter' },
  { id: 'build_muscle',      label: 'Build Muscle',      emoji: '💪', desc: 'Get stronger and bigger' },
  { id: 'maintain',          label: 'Stay Fit',          emoji: '⚖️', desc: 'Maintain current fitness' },
  { id: 'improve_endurance', label: 'Improve Endurance', emoji: '🏃', desc: 'Run longer, go harder' },
  { id: 'improve_strength',  label: 'Build Strength',    emoji: '🏋️', desc: 'Lift heavier, get powerful' },
];

const ACTIVITY_LEVELS = [
  { id: 'sedentary',    emoji: '🛋️', label: 'Sedentary',         desc: 'Little to no exercise',      multiplier: 1.2   },
  { id: 'light',        emoji: '🚶', label: 'Lightly Active',    desc: '1–3 days/week',              multiplier: 1.375 },
  { id: 'moderate',     emoji: '🏃', label: 'Moderately Active', desc: '3–5 days/week',              multiplier: 1.55  },
  { id: 'very_active',  emoji: '⚡', label: 'Very Active',       desc: '6–7 days/week',              multiplier: 1.725 },
  { id: 'extra_active', emoji: '🏆', label: 'Athlete',           desc: 'Twice daily / physical job', multiplier: 1.9   },
];

// BMR uses metric internally; all inputs converted before calling
function calcMacros(weightLbs, heightIn, age, gender, activity, goal) {
  const weight_kg = weightLbs / 2.20462;
  const height_cm = heightIn * 2.54;

  let bmr = gender === 'male'
    ? 10 * weight_kg + 6.25 * height_cm - 5 * age + 5
    : 10 * weight_kg + 6.25 * height_cm - 5 * age - 161;

  const actObj = ACTIVITY_LEVELS.find(a => a.id === activity) || ACTIVITY_LEVELS[2];
  let calories = Math.round(bmr * actObj.multiplier);

  if (goal === 'lose_weight')      calories = Math.round(calories * 0.8);
  if (goal === 'build_muscle')     calories = Math.round(calories * 1.1);
  if (goal === 'improve_strength') calories = Math.round(calories * 1.05);

  const protein = Math.round(weightLbs * 0.85);
  const fat     = Math.round((calories * 0.25) / 9);
  const carbs   = Math.round((calories - protein * 4 - fat * 9) / 4);

  return { calories, protein, carbs: Math.max(carbs, 50), fat };
}

// ── Stat Input Card ───────────────────────────────────────────────────────────
function StatCard({ label, value, onChange, unit, min, max, step = 1, placeholder, wide }) {
  return (
    <div className={`stat-input-card${wide ? ' wide' : ''}`}>
      <div className="sic-label">{label}</div>
      <input
        className="sic-value"
        type="number"
        inputMode="numeric"
        value={value}
        onChange={e => onChange(e.target.value)}
        min={min}
        max={max}
        step={step}
        placeholder={placeholder ?? '—'}
      />
      {unit && <div className="sic-unit">{unit}</div>}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function Onboarding() {
  const { user, login } = useAuth();
  const { addToast }    = useToast();
  const navigate        = useNavigate();

  const [step, setStep]     = useState(1);
  const [saving, setSaving] = useState(false);

  // Step 1
  const [goal, setGoal] = useState('');

  // Step 2
  const [unitSystem, setUnitSystem] = useState('imperial'); // 'imperial' | 'metric'
  const [gender, setGender]         = useState('male');
  const [age, setAge]               = useState('');
  const [heightFt, setHeightFt]     = useState('');       // imperial
  const [heightInPart, setHeightInPart] = useState('');   // imperial (0-11)
  const [heightCm, setHeightCm]     = useState('');       // metric
  const [weight, setWeight]         = useState('');       // lbs or kg per unitSystem
  const [activity, setActivity]     = useState('moderate');

  // Step 3
  const [macros, setMacros] = useState(null);

  // Derived helpers — always returns lbs / total inches / cm for saving
  const getWeightLbs = () => {
    const w = parseFloat(weight) || 0;
    return unitSystem === 'imperial' ? w : w * 2.20462;
  };
  const getHeightInTotal = () => {
    if (unitSystem === 'imperial') {
      return (parseInt(heightFt) || 0) * 12 + (parseInt(heightInPart) || 0);
    }
    return (parseFloat(heightCm) || 0) / 2.54;
  };
  const getHeightCmForProfile = () =>
    unitSystem === 'metric'
      ? parseFloat(heightCm) || 0
      : getHeightInTotal() * 2.54;

  const heightValid = unitSystem === 'imperial' ? !!heightFt : !!heightCm;
  const statsValid  = !!age && heightValid && !!weight;

  const goNext = () => setStep(s => s + 1);
  const goBack = () => setStep(s => s - 1);

  const handleStatsNext = () => {
    if (!statsValid) return;
    setMacros(calcMacros(
      getWeightLbs(), getHeightInTotal(),
      parseInt(age), gender, activity, goal
    ));
    goNext();
  };

  const handleFinish = async () => {
    setSaving(true);
    try {
      await api.put('/profile', {
        gender,
        height_cm:      Math.round(getHeightCmForProfile() * 10) / 10,
        fitness_goal:   goal,
        activity_level: activity,
      });
      await api.post('/bodyweight', {
        weight: Math.round(getWeightLbs() * 10) / 10,
        date:   new Date().toISOString().split('T')[0],
      });
      await api.put('/goals', {
        calorie_goal:          macros.calories,
        protein_goal:          macros.protein,
        carbs_goal:            macros.carbs,
        fat_goal:              macros.fat,
        steps_goal:            10000,
        water_goal_oz:         64,
        workout_days_per_week: 4,
      });
      await api.post('/auth/complete-onboarding');
      login({ ...user, onboarding_complete: 1 });
      navigate('/');
    } catch (err) {
      console.error('Onboarding finish error:', err);
      addToast('Something went wrong saving your profile. Please try again.', 'error');
    }
    setSaving(false);
  };

  // Weight display label for final checklist
  const weightDisplay = unitSystem === 'imperial'
    ? `${weight} lbs`
    : `${weight} kg (${Math.round(getWeightLbs())} lbs)`;

  return (
    <div className="onboarding-wrap">
      <div className="onboarding-card">

        {/* ── Progress dots ── */}
        <div className="onboarding-dots">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className={`onboarding-dot ${step >= i ? 'active' : ''}`} />
          ))}
        </div>

        {/* ══════════════════════════════════════════
            STEP 1 — Goal Selection
        ══════════════════════════════════════════ */}
        {step === 1 && (
          <div className="onboarding-step">
            <div className="onboarding-emoji">👋</div>
            <h1>Welcome to FitTrack</h1>
            <p className="onboarding-sub">
              Hey {user?.username}! Let's take 60 seconds to personalize the
              app so your goals, macros, and plans are set up perfectly for you.
            </p>
            <p className="onboarding-label">What's your main goal?</p>
            <div className="goal-grid">
              {GOALS.map(g => (
                <button
                  key={g.id}
                  className={`goal-card ${goal === g.id ? 'selected' : ''}`}
                  onClick={() => setGoal(g.id)}
                >
                  <span className="goal-emoji">{g.emoji}</span>
                  <span className="goal-label">{g.label}</span>
                  <span className="goal-desc">{g.desc}</span>
                </button>
              ))}
            </div>
            <button
              className="btn btn-primary onboarding-next"
              disabled={!goal}
              onClick={goNext}
            >
              Continue →
            </button>
          </div>
        )}

        {/* ══════════════════════════════════════════
            STEP 2 — Body Stats (redesigned)
        ══════════════════════════════════════════ */}
        {step === 2 && (
          <div className="onboarding-step">
            <div className="onboarding-emoji">📏</div>
            <h1>Your Stats</h1>
            <p className="onboarding-sub">
              Used to calculate your personalized calorie and macro targets.
            </p>

            {/* ── Measurement system toggle ── */}
            <div className="unit-system-toggle">
              <button
                className={unitSystem === 'imperial' ? 'active' : ''}
                onClick={() => setUnitSystem('imperial')}
              >
                🇺🇸 Imperial
              </button>
              <button
                className={unitSystem === 'metric' ? 'active' : ''}
                onClick={() => setUnitSystem('metric')}
              >
                📐 Metric
              </button>
            </div>

            {/* ── Gender ── */}
            <p className="onboarding-label">Gender</p>
            <div className="gender-cards">
              <button
                className={`gender-card ${gender === 'male' ? 'selected' : ''}`}
                onClick={() => setGender('male')}
              >
                <span className="gender-card-icon">♂</span>
                <span className="gender-card-text">Male</span>
              </button>
              <button
                className={`gender-card ${gender === 'female' ? 'selected' : ''}`}
                onClick={() => setGender('female')}
              >
                <span className="gender-card-icon">♀</span>
                <span className="gender-card-text">Female</span>
              </button>
            </div>

            {/* ── Stat input cards ── */}
            <p className="onboarding-label">Measurements</p>
            <div className="stat-input-row">
              <StatCard
                label="Age"
                value={age}
                onChange={setAge}
                unit="yrs"
                min={13} max={100}
                placeholder="25"
              />

              {unitSystem === 'imperial' ? (
                <>
                  <StatCard
                    label="Feet"
                    value={heightFt}
                    onChange={setHeightFt}
                    unit="ft"
                    min={3} max={8}
                    placeholder="5"
                  />
                  <StatCard
                    label="Inches"
                    value={heightInPart}
                    onChange={setHeightInPart}
                    unit="in"
                    min={0} max={11}
                    placeholder="10"
                  />
                </>
              ) : (
                <StatCard
                  label="Height"
                  value={heightCm}
                  onChange={setHeightCm}
                  unit="cm"
                  min={120} max={250}
                  placeholder="178"
                  wide
                />
              )}

              <StatCard
                label="Weight"
                value={weight}
                onChange={setWeight}
                unit={unitSystem === 'imperial' ? 'lbs' : 'kg'}
                min={unitSystem === 'imperial' ? 66 : 30}
                max={unitSystem === 'imperial' ? 660 : 300}
                placeholder={unitSystem === 'imperial' ? '175' : '80'}
              />
            </div>

            {/* ── Activity level ── */}
            <p className="onboarding-label">Activity Level</p>
            <div className="activity-list">
              {ACTIVITY_LEVELS.map(a => (
                <button
                  key={a.id}
                  className={`activity-item ${activity === a.id ? 'selected' : ''}`}
                  onClick={() => setActivity(a.id)}
                >
                  <span className="activity-emoji">{a.emoji}</span>
                  <div className="activity-text">
                    <span className="activity-label">{a.label}</span>
                    <span className="activity-desc">{a.desc}</span>
                  </div>
                  {activity === a.id && (
                    <span className="activity-check">✓</span>
                  )}
                </button>
              ))}
            </div>

            <div className="onboarding-nav">
              <button className="btn btn-ghost" onClick={goBack}>← Back</button>
              <button
                className="btn btn-primary"
                disabled={!statsValid}
                onClick={handleStatsNext}
              >
                Calculate →
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════
            STEP 3 — Macro Targets
        ══════════════════════════════════════════ */}
        {step === 3 && macros && (
          <div className="onboarding-step">
            <div className="onboarding-emoji">🎯</div>
            <h1>Your Daily Targets</h1>
            <p className="onboarding-sub">
              Based on your stats and goal, here are your personalized targets.
              You can always adjust these later in Goals.
            </p>

            <div className="macro-targets-grid">
              <div className="macro-target-card calories">
                <span className="mt-value">{macros.calories}</span>
                <span className="mt-label">Calories</span>
              </div>
              <div className="macro-target-card protein">
                <span className="mt-value">{macros.protein}g</span>
                <span className="mt-label">Protein</span>
              </div>
              <div className="macro-target-card carbs">
                <span className="mt-value">{macros.carbs}g</span>
                <span className="mt-label">Carbs</span>
              </div>
              <div className="macro-target-card fat">
                <span className="mt-value">{macros.fat}g</span>
                <span className="mt-label">Fat</span>
              </div>
            </div>

            <div className="onboarding-adjust">
              <p className="onboarding-label">Adjust if needed:</p>
              <div className="stat-input-row" style={{ flexWrap: 'wrap' }}>
                <StatCard
                  label="Calories"
                  value={macros.calories}
                  onChange={v => setMacros(m => ({ ...m, calories: parseInt(v) || 0 }))}
                  unit="kcal"
                  min={1000} max={6000} step={50}
                  wide
                />
                <StatCard
                  label="Protein"
                  value={macros.protein}
                  onChange={v => setMacros(m => ({ ...m, protein: parseInt(v) || 0 }))}
                  unit="g"
                  min={50} max={400}
                />
                <StatCard
                  label="Carbs"
                  value={macros.carbs}
                  onChange={v => setMacros(m => ({ ...m, carbs: parseInt(v) || 0 }))}
                  unit="g"
                  min={20} max={800}
                />
                <StatCard
                  label="Fat"
                  value={macros.fat}
                  onChange={v => setMacros(m => ({ ...m, fat: parseInt(v) || 0 }))}
                  unit="g"
                  min={20} max={300}
                />
              </div>
            </div>

            <div className="onboarding-nav">
              <button className="btn btn-ghost" onClick={goBack}>← Back</button>
              <button className="btn btn-primary" onClick={goNext}>Looks good →</button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════
            STEP 4 — All Set
        ══════════════════════════════════════════ */}
        {step === 4 && (
          <div className="onboarding-step onboarding-final">
            <div className="onboarding-emoji final-emoji">🚀</div>
            <h1>You're all set!</h1>
            <p className="onboarding-sub">
              Your personalized plan is ready. Track your workouts, hit your
              macros, and let's get to work.
            </p>
            <div className="final-checklist">
              <div className="final-check">✅ Goal: <strong>{GOALS.find(g => g.id === goal)?.label}</strong></div>
              <div className="final-check">✅ Daily calories: <strong>{macros?.calories} kcal</strong></div>
              <div className="final-check">✅ Protein target: <strong>{macros?.protein}g</strong></div>
              <div className="final-check">✅ Starting weight: <strong>{weightDisplay}</strong></div>
            </div>
            <button
              className="btn btn-primary onboarding-next"
              onClick={handleFinish}
              disabled={saving}
            >
              {saving ? 'Saving…' : 'Go to Dashboard 🎉'}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
