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
  { id: 'sedentary',    label: 'Sedentary',         desc: 'Little to no exercise',       multiplier: 1.2   },
  { id: 'light',        label: 'Lightly Active',    desc: '1–3 days/week',               multiplier: 1.375 },
  { id: 'moderate',     label: 'Moderately Active', desc: '3–5 days/week',               multiplier: 1.55  },
  { id: 'very_active',  label: 'Very Active',       desc: '6–7 days/week',               multiplier: 1.725 },
  { id: 'extra_active', label: 'Athlete',            desc: 'Twice daily / physical job', multiplier: 1.9   },
];

// Uses lbs + inches as inputs (US units), converts internally for Mifflin-St Jeor
function calcMacros(weightLbs, heightIn, age, gender, activity, goal) {
  const weight_kg = weightLbs / 2.20462;
  const height_cm = heightIn * 2.54;

  let bmr;
  if (gender === 'male') {
    bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age + 5;
  } else {
    bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age - 161;
  }

  const actObj = ACTIVITY_LEVELS.find(a => a.id === activity) || ACTIVITY_LEVELS[2];
  let tdee = Math.round(bmr * actObj.multiplier);

  let calories = tdee;
  if (goal === 'lose_weight')      calories = Math.round(tdee * 0.8);
  if (goal === 'build_muscle')     calories = Math.round(tdee * 1.1);
  if (goal === 'improve_strength') calories = Math.round(tdee * 1.05);

  const protein = Math.round(weightLbs * 0.85);    // ~0.85g per lb bodyweight
  const fat     = Math.round((calories * 0.25) / 9);
  const carbs   = Math.round((calories - protein * 4 - fat * 9) / 4);

  return { calories, protein, carbs: Math.max(carbs, 50), fat };
}

export default function Onboarding() {
  const { user, login }   = useAuth();
  const { addToast }      = useToast();
  const navigate          = useNavigate();
  const [step, setStep]   = useState(1);
  const [saving, setSaving] = useState(false);

  const [goal, setGoal]         = useState('');
  const [gender, setGender]     = useState('male');
  const [age, setAge]           = useState('');
  const [heightIn, setHeightIn] = useState('');   // inches
  const [weightLbs, setWeightLbs] = useState(''); // lbs
  const [activity, setActivity] = useState('moderate');
  const [macros, setMacros]     = useState(null);

  const goNext = () => setStep(s => s + 1);
  const goBack = () => setStep(s => s - 1);

  const handleStatsNext = () => {
    if (!age || !heightIn || !weightLbs) return;
    const calculated = calcMacros(
      parseFloat(weightLbs), parseFloat(heightIn),
      parseInt(age), gender, activity, goal
    );
    setMacros(calculated);
    goNext();
  };

  const handleFinish = async () => {
    setSaving(true);
    try {
      // 1. Save profile (height stored as cm internally)
      await api.put('/profile', {
        gender,
        height_cm: Math.round(parseFloat(heightIn) * 2.54 * 10) / 10,
        fitness_goal: goal,
        activity_level: activity,
      });

      // 2. Save starting body weight (lbs — same unit used throughout the app)
      await api.post('/bodyweight', {
        weight: parseFloat(weightLbs),
        date: new Date().toISOString().split('T')[0],
      });

      // 3. Save macro/calorie goals — use the correct field names the endpoint expects
      await api.put('/goals', {
        calorie_goal:        macros.calories,
        protein_goal:        macros.protein,
        carbs_goal:          macros.carbs,
        fat_goal:            macros.fat,
        steps_goal:          10000,
        water_goal_oz:       64,
        workout_days_per_week: 4,
      });

      // 4. Mark onboarding complete on the server
      await api.post('/auth/complete-onboarding');

      // 5. Update local user state so the redirect in PrivateRoute fires
      login({ ...user, onboarding_complete: 1 });
      navigate('/');
    } catch (err) {
      console.error('Onboarding finish error:', err);
      addToast('Something went wrong saving your profile. Please try again.', 'error');
    }
    setSaving(false);
  };

  return (
    <div className="onboarding-wrap">
      <div className="onboarding-card">
        {/* Progress dots */}
        <div className="onboarding-dots">
          {[1,2,3,4].map(i => (
            <div key={i} className={`onboarding-dot ${step >= i ? 'active' : ''}`} />
          ))}
        </div>

        {/* ── Step 1: Goal Selection ── */}
        {step === 1 && (
          <div className="onboarding-step">
            <div className="onboarding-emoji">👋</div>
            <h1>Welcome to FitTrack</h1>
            <p className="onboarding-sub">
              Hey {user?.username}! Let's take 60 seconds to personalize the app so
              your goals, macros, and plans are set up perfectly for you.
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

        {/* ── Step 2: Body Stats ── */}
        {step === 2 && (
          <div className="onboarding-step">
            <div className="onboarding-emoji">📏</div>
            <h1>Your Stats</h1>
            <p className="onboarding-sub">Used to calculate your personalized calorie and macro targets.</p>

            <div className="onboarding-fields">
              <div className="onboarding-field">
                <label>Gender</label>
                <div className="gender-toggle">
                  <button className={gender === 'male' ? 'active' : ''} onClick={() => setGender('male')}>Male</button>
                  <button className={gender === 'female' ? 'active' : ''} onClick={() => setGender('female')}>Female</button>
                </div>
              </div>
              <div className="onboarding-field">
                <label>Age</label>
                <input type="number" placeholder="25" value={age} onChange={e => setAge(e.target.value)} min="13" max="100" />
              </div>
              <div className="onboarding-field">
                <label>Height (inches)</label>
                <input type="number" placeholder="70  (e.g. 5′10″ = 70 in)" value={heightIn} onChange={e => setHeightIn(e.target.value)} min="48" max="96" />
              </div>
              <div className="onboarding-field">
                <label>Weight (lbs)</label>
                <input type="number" placeholder="175" value={weightLbs} onChange={e => setWeightLbs(e.target.value)} min="66" max="660" />
              </div>
            </div>

            <p className="onboarding-label" style={{ marginTop: '1.25rem' }}>Activity Level</p>
            <div className="activity-list">
              {ACTIVITY_LEVELS.map(a => (
                <button
                  key={a.id}
                  className={`activity-item ${activity === a.id ? 'selected' : ''}`}
                  onClick={() => setActivity(a.id)}
                >
                  <span className="activity-label">{a.label}</span>
                  <span className="activity-desc">{a.desc}</span>
                </button>
              ))}
            </div>

            <div className="onboarding-nav">
              <button className="btn btn-ghost" onClick={goBack}>← Back</button>
              <button
                className="btn btn-primary"
                disabled={!age || !heightIn || !weightLbs}
                onClick={handleStatsNext}
              >
                Calculate →
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Macro Targets ── */}
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
              <div className="onboarding-fields">
                <div className="onboarding-field">
                  <label>Calories</label>
                  <input type="number" value={macros.calories} onChange={e => setMacros(m => ({ ...m, calories: parseInt(e.target.value) || 0 }))} />
                </div>
                <div className="onboarding-field">
                  <label>Protein (g)</label>
                  <input type="number" value={macros.protein} onChange={e => setMacros(m => ({ ...m, protein: parseInt(e.target.value) || 0 }))} />
                </div>
                <div className="onboarding-field">
                  <label>Carbs (g)</label>
                  <input type="number" value={macros.carbs} onChange={e => setMacros(m => ({ ...m, carbs: parseInt(e.target.value) || 0 }))} />
                </div>
                <div className="onboarding-field">
                  <label>Fat (g)</label>
                  <input type="number" value={macros.fat} onChange={e => setMacros(m => ({ ...m, fat: parseInt(e.target.value) || 0 }))} />
                </div>
              </div>
            </div>

            <div className="onboarding-nav">
              <button className="btn btn-ghost" onClick={goBack}>← Back</button>
              <button className="btn btn-primary" onClick={goNext}>Looks good →</button>
            </div>
          </div>
        )}

        {/* ── Step 4: All Set ── */}
        {step === 4 && (
          <div className="onboarding-step onboarding-final">
            <div className="onboarding-emoji final-emoji">🚀</div>
            <h1>You're all set!</h1>
            <p className="onboarding-sub">
              Your personalized plan is ready. Track your workouts, hit your macros,
              and let's get to work.
            </p>
            <div className="final-checklist">
              <div className="final-check">✅ Goal set: <strong>{GOALS.find(g => g.id === goal)?.label}</strong></div>
              <div className="final-check">✅ Daily calories: <strong>{macros?.calories} kcal</strong></div>
              <div className="final-check">✅ Protein target: <strong>{macros?.protein}g</strong></div>
              <div className="final-check">✅ Starting weight: <strong>{weightLbs} lbs</strong></div>
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
