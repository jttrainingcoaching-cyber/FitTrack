import { useState, useRef, useEffect, useLayoutEffect, useCallback, useMemo } from 'react';
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

function calcMacros(weightLbs, heightIn, age, gender, activity, goal) {
  const wKg = weightLbs / 2.20462;
  const hCm = heightIn * 2.54;
  let bmr = gender === 'male'
    ? 10 * wKg + 6.25 * hCm - 5 * age + 5
    : 10 * wKg + 6.25 * hCm - 5 * age - 161;
  const actObj = ACTIVITY_LEVELS.find(a => a.id === activity) || ACTIVITY_LEVELS[2];
  let cal = Math.round(bmr * actObj.multiplier);
  if (goal === 'lose_weight')      cal = Math.round(cal * 0.8);
  if (goal === 'build_muscle')     cal = Math.round(cal * 1.1);
  if (goal === 'improve_strength') cal = Math.round(cal * 1.05);
  const protein = Math.round(weightLbs * 0.85);
  const fat     = Math.round((cal * 0.25) / 9);
  const carbs   = Math.round((cal - protein * 4 - fat * 9) / 4);
  return { calories: cal, protein, carbs: Math.max(carbs, 50), fat };
}

// ── Drum / Scroll Picker ──────────────────────────────────────────────────────
const ITEM_H  = 44;  // px height of each row
const VISIBLE = 5;   // rows shown
const PAD     = Math.floor(VISIBLE / 2); // blank rows top/bottom so endpoints can center

function DrumPicker({ value, onChange, min, max, step = 1, label, unit, wide }) {
  const items = useMemo(() => {
    const arr = [];
    for (let v = min; v <= max; v += step) arr.push(v);
    return arr;
  }, [min, max, step]);

  const listRef   = useRef(null);
  const timerRef  = useRef(null);
  const busy      = useRef(false);  // suppress re-entrant scroll-to-value

  // Set initial scroll position (synchronous, no animation, before first paint)
  useLayoutEffect(() => {
    const idx = items.indexOf(value);
    if (idx >= 0 && listRef.current) {
      listRef.current.scrollTop = idx * ITEM_H;
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // When value changes externally (e.g. unit conversion), animate scroll
  const prevValue = useRef(value);
  useEffect(() => {
    if (prevValue.current === value) return;
    prevValue.current = value;
    if (busy.current || !listRef.current) return;
    const idx = items.indexOf(value);
    if (idx < 0) return;
    busy.current = true;
    listRef.current.scrollTo({ top: idx * ITEM_H, behavior: 'smooth' });
    setTimeout(() => { busy.current = false; }, 450);
  }, [value, items]);

  // Detect scroll end, snap, update state
  const handleScroll = useCallback(() => {
    if (busy.current) return;
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (!listRef.current) return;
      const idx = Math.round(listRef.current.scrollTop / ITEM_H);
      const clamped = Math.max(0, Math.min(items.length - 1, idx));
      // Snap to exact position
      busy.current = true;
      listRef.current.scrollTo({ top: clamped * ITEM_H, behavior: 'smooth' });
      setTimeout(() => { busy.current = false; }, 350);
      onChange(items[clamped]);
    }, 120);
  }, [items, onChange]);

  // Click an item to jump to it
  const handleClick = useCallback((v, idx) => {
    if (busy.current) return;
    onChange(v);
    busy.current = true;
    listRef.current?.scrollTo({ top: idx * ITEM_H, behavior: 'smooth' });
    setTimeout(() => { busy.current = false; }, 400);
  }, [onChange]);

  return (
    <div className={`drum-wrap${wide ? ' wide' : ''}`}>
      {label && <div className="drum-label">{label}</div>}
      <div className="drum-outer">
        {/* Center highlight box */}
        <div className="drum-selection" />
        {/* Fade gradients */}
        <div className="drum-fade drum-fade-top" />
        <div className="drum-fade drum-fade-bottom" />
        {/* Scrollable list */}
        <div
          ref={listRef}
          className="drum-scroll"
          onScroll={handleScroll}
          style={{ height: ITEM_H * VISIBLE }}
        >
          {/* top padding */}
          {Array.from({ length: PAD }).map((_, i) => (
            <div key={`pt${i}`} className="drum-item drum-pad" style={{ height: ITEM_H }} />
          ))}
          {items.map((v, i) => (
            <div
              key={v}
              className={`drum-item${v === value ? ' drum-sel' : ''}`}
              style={{ height: ITEM_H }}
              onClick={() => handleClick(v, i)}
            >
              {v}
            </div>
          ))}
          {/* bottom padding */}
          {Array.from({ length: PAD }).map((_, i) => (
            <div key={`pb${i}`} className="drum-item drum-pad" style={{ height: ITEM_H }} />
          ))}
        </div>
      </div>
      {unit && <div className="drum-unit">{unit}</div>}
    </div>
  );
}

// ── Macro Adjust Card (Step 3 only) ──────────────────────────────────────────
function StatCard({ label, value, onChange, unit, min, max, step = 1, wide }) {
  return (
    <div className={`stat-input-card${wide ? ' wide' : ''}`}>
      <div className="sic-label">{label}</div>
      <input
        className="sic-value"
        type="number"
        inputMode="numeric"
        value={value === 0 ? '' : value}
        onChange={e => {
          const raw = e.target.value;
          onChange(raw === '' ? 0 : parseInt(raw, 10) || 0);
        }}
        min={min}
        max={max}
        step={step}
      />
      {unit && <div className="sic-unit">{unit}</div>}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function Onboarding() {
  const { user, login } = useAuth();
  const { addToast }    = useToast();

  const [step, setStep]     = useState(1);
  const [saving, setSaving] = useState(false);

  // Step 1
  const [goal, setGoal] = useState('');

  // Step 2 — all values are numbers with sensible defaults
  const [unitSystem, setUnitSystem] = useState('imperial');
  const [gender, setGender]         = useState('male');
  const [age, setAge]               = useState(25);
  const [heightFt, setHeightFt]     = useState(5);
  const [heightIn, setHeightIn]     = useState(8);    // 0-11 inches
  const [heightCm, setHeightCm]     = useState(173);  // metric
  const [weightVal, setWeightVal]   = useState(175);  // lbs or kg per unit system
  const [activity, setActivity]     = useState('moderate');

  // Step 3
  const [macros, setMacros] = useState(null);

  // ── Derived unit helpers ───────────────���──────────────────────────────────
  const getWeightLbs = () =>
    unitSystem === 'imperial' ? weightVal : Math.round(weightVal * 2.20462 * 10) / 10;
  const getHeightInTotal = () =>
    unitSystem === 'imperial' ? heightFt * 12 + heightIn : heightCm / 2.54;
  const getHeightCmForProfile = () =>
    unitSystem === 'metric' ? heightCm : (heightFt * 12 + heightIn) * 2.54;

  // ── Unit system switch with auto-conversion ───────────────────────────────
  const switchUnit = (newSys) => {
    if (newSys === unitSystem) return;
    if (newSys === 'metric') {
      setWeightVal(Math.max(30, Math.min(200, Math.round(weightVal / 2.20462))));
      const totalIn = heightFt * 12 + heightIn;
      setHeightCm(Math.max(140, Math.min(230, Math.round(totalIn * 2.54))));
    } else {
      setWeightVal(Math.max(80, Math.min(500, Math.round(weightVal * 2.20462))));
      const totalIn = Math.round(heightCm / 2.54);
      setHeightFt(Math.max(3, Math.min(8, Math.floor(totalIn / 12))));
      setHeightIn(Math.max(0, Math.min(11, totalIn % 12)));
    }
    setUnitSystem(newSys);
  };

  const goNext = () => setStep(s => s + 1);
  const goBack = () => setStep(s => s - 1);

  const handleStatsNext = () => {
    setMacros(calcMacros(getWeightLbs(), getHeightInTotal(), age, gender, activity, goal));
    goNext();
  };

  const handleFinish = async () => {
    setSaving(true);
    let step = 'profile';
    try {
      step = 'profile';
      await api.put('/profile', {
        gender,
        height_in:      Math.round(getHeightInTotal()),
        unit_system:    unitSystem,
        fitness_goal:   goal,
        activity_level: activity,
      });
      step = 'bodyweight';
      await api.post('/bodyweight', {
        weight: Math.round(getWeightLbs() * 10) / 10,
        date:   new Date().toISOString().split('T')[0],
      });
      step = 'goals';
      await api.put('/goals', {
        calorie_goal:          Number(macros.calories) || 2000,
        protein_goal:          Number(macros.protein)  || 150,
        carbs_goal:            Number(macros.carbs)    || 250,
        fat_goal:              Number(macros.fat)      || 65,
        steps_goal:            10000,
        water_goal_oz:         64,
        workout_days_per_week: 4,
      });
      step = 'complete-onboarding';
      await api.post('/auth/complete-onboarding');
      // Update user context — the App.jsx route guard will redirect to / automatically
      // once it sees onboarding_complete: 1 (no manual navigate needed; avoids race)
      login({ ...user, onboarding_complete: 1 });
    } catch (err) {
      const serverMsg = err.response?.data?.error || err.message || 'Unknown error';
      console.error(`Onboarding finish error at step "${step}":`, err.response?.data || err);
      addToast(`Save failed at ${step}: ${serverMsg}`, 'error');
    }
    setSaving(false);
  };

  const weightDisplay = unitSystem === 'imperial'
    ? `${weightVal} lbs`
    : `${weightVal} kg (${Math.round(getWeightLbs())} lbs)`;

  return (
    <div className="onboarding-wrap">
      <div className="onboarding-card">

        {/* Progress dots */}
        <div className="onboarding-dots">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className={`onboarding-dot ${step >= i ? 'active' : ''}`} />
          ))}
        </div>

        {/* ══ STEP 1 — Goal ══ */}
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
            <button className="btn btn-primary onboarding-next" disabled={!goal} onClick={goNext}>
              Continue →
            </button>
          </div>
        )}

        {/* ══ STEP 2 — Body Stats ══ */}
        {step === 2 && (
          <div className="onboarding-step">
            <div className="onboarding-emoji">📏</div>
            <h1>Your Stats</h1>
            <p className="onboarding-sub">
              Scroll each wheel to set your measurements. Used to calculate your
              personalized calorie and macro targets.
            </p>

            {/* Unit system toggle */}
            <div className="unit-system-toggle">
              <button className={unitSystem === 'imperial' ? 'active' : ''} onClick={() => switchUnit('imperial')}>
                🇺🇸 Imperial
              </button>
              <button className={unitSystem === 'metric' ? 'active' : ''} onClick={() => switchUnit('metric')}>
                📐 Metric
              </button>
            </div>

            {/* Gender */}
            <p className="onboarding-label">Gender</p>
            <div className="gender-cards">
              <button className={`gender-card ${gender === 'male' ? 'selected' : ''}`} onClick={() => setGender('male')}>
                <span className="gender-card-icon">♂</span>
                <span className="gender-card-text">Male</span>
              </button>
              <button className={`gender-card ${gender === 'female' ? 'selected' : ''}`} onClick={() => setGender('female')}>
                <span className="gender-card-icon">♀</span>
                <span className="gender-card-text">Female</span>
              </button>
            </div>

            {/* Drum pickers */}
            <p className="onboarding-label">Measurements</p>
            <div className="drum-row">
              <DrumPicker label="Age" value={age} onChange={setAge}
                min={13} max={100} unit="yrs" />

              {unitSystem === 'imperial' ? (
                <div className="drum-height-group">
                  <div className="drum-label">Height</div>
                  <div className="drum-height-inner">
                    <DrumPicker value={heightFt} onChange={setHeightFt}
                      min={3} max={8} unit="ft" />
                    <DrumPicker value={heightIn} onChange={setHeightIn}
                      min={0} max={11} unit="in" />
                  </div>
                </div>
              ) : (
                <DrumPicker label="Height" value={heightCm} onChange={setHeightCm}
                  min={140} max={230} unit="cm" wide />
              )}

              <DrumPicker
                label="Weight"
                value={weightVal}
                onChange={setWeightVal}
                min={unitSystem === 'imperial' ? 80 : 30}
                max={unitSystem === 'imperial' ? 500 : 230}
                unit={unitSystem === 'imperial' ? 'lbs' : 'kg'}
              />
            </div>

            {/* Activity level */}
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
                  {activity === a.id && <span className="activity-check">✓</span>}
                </button>
              ))}
            </div>

            <div className="onboarding-nav">
              <button className="btn btn-ghost" onClick={goBack}>← Back</button>
              <button className="btn btn-primary" onClick={handleStatsNext}>Calculate →</button>
            </div>
          </div>
        )}

        {/* ══ STEP 3 — Macro Targets ══ */}
        {step === 3 && macros && (
          <div className="onboarding-step">
            <div className="onboarding-emoji">🎯</div>
            <h1>Your Daily Targets</h1>
            <p className="onboarding-sub">
              Based on your stats and goal. Adjust if needed — you can always
              change these later in Goals.
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
              <p className="onboarding-label">Fine-tune if needed:</p>
              <div className="stat-input-row" style={{ flexWrap: 'wrap' }}>
                <StatCard label="Calories" value={macros.calories}
                  onChange={v => setMacros(m => ({ ...m, calories: parseInt(v)||0 }))}
                  unit="kcal" min={1000} max={6000} step={50} wide />
                <StatCard label="Protein" value={macros.protein}
                  onChange={v => setMacros(m => ({ ...m, protein: parseInt(v)||0 }))}
                  unit="g" min={50} max={400} />
                <StatCard label="Carbs" value={macros.carbs}
                  onChange={v => setMacros(m => ({ ...m, carbs: parseInt(v)||0 }))}
                  unit="g" min={20} max={800} />
                <StatCard label="Fat" value={macros.fat}
                  onChange={v => setMacros(m => ({ ...m, fat: parseInt(v)||0 }))}
                  unit="g" min={20} max={300} />
              </div>
            </div>

            <div className="onboarding-nav">
              <button className="btn btn-ghost" onClick={goBack}>← Back</button>
              <button className="btn btn-primary" onClick={goNext}>Looks good →</button>
            </div>
          </div>
        )}

        {/* ══ STEP 4 — All Set ══ */}
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
            <button className="btn btn-primary onboarding-next" onClick={handleFinish} disabled={saving}>
              {saving ? 'Saving…' : 'Go to Dashboard 🎉'}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
