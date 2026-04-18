import { useState } from 'react';
import NumberInput from '../components/NumberInput';

// ── TDEE (Mifflin-St Jeor) ────────────────────────
function calcTDEE(weight_lbs, height_in, age, gender, activity) {
  const kg = weight_lbs * 0.453592;
  const cm = height_in * 2.54;
  const bmr = gender === 'male'
    ? 10 * kg + 6.25 * cm - 5 * age + 5
    : 10 * kg + 6.25 * cm - 5 * age - 161;
  const mult = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9 };
  return Math.round(bmr * (mult[activity] || 1.55));
}

function macroSplit(tdee, goal) {
  const adj = goal === 'lose' ? tdee - 400 : goal === 'gain' ? tdee + 300 : tdee;
  const p = Math.round((adj * 0.30) / 4);
  const f = Math.round((adj * 0.25) / 9);
  const c = Math.round((adj - p * 4 - f * 9) / 4);
  return { calories: adj, protein: p, carbs: c, fat: f };
}

// ── 1RM (Epley) ────────────────────────────────────
function calc1RM(weight, reps) {
  if (reps === 1) return weight;
  return Math.round(weight * (1 + reps / 30));
}

function repMaxTable(orm) {
  return [1, 2, 3, 4, 5, 6, 8, 10, 12, 15].map(r => ({
    reps: r,
    weight: Math.round(orm / (1 + r / 30)),
    pct: Math.round((1 / (1 + r / 30)) * 100)
  }));
}

// ── Unit converter ────────────────────────────────
const CONVERSIONS = {
  'lbs → kg':  v => (v * 0.453592).toFixed(2) + ' kg',
  'kg → lbs':  v => (v * 2.20462).toFixed(2) + ' lbs',
  'in → cm':   v => (v * 2.54).toFixed(2) + ' cm',
  'cm → in':   v => (v / 2.54).toFixed(2) + ' in',
  'kcal → kJ': v => (v * 4.184).toFixed(1) + ' kJ',
  'kJ → kcal': v => (v / 4.184).toFixed(1) + ' kcal',
  'oz → g':    v => (v * 28.3495).toFixed(2) + ' g',
  'g → oz':    v => (v / 28.3495).toFixed(3) + ' oz',
  'oz → ml':   v => (v * 29.5735).toFixed(1) + ' ml',
  'ml → oz':   v => (v / 29.5735).toFixed(2) + ' oz',
};

export default function Calculator() {
  const [tab, setTab] = useState('macro');

  // Macro calc state
  const [mc, setMc] = useState({ weight: 175, height: 70, age: 25, gender: 'male', activity: 'moderate', goal: 'maintain' });
  const [macroResult, setMacroResult] = useState(null);

  // Training calc state
  const [tc, setTc] = useState({ weight: 135, reps: 5 });
  const [orm, setOrm] = useState(null);

  // Unit conv state
  const [uc, setUc] = useState({ type: 'lbs → kg', value: '' });

  const runMacro = () => {
    const tdee = calcTDEE(mc.weight, mc.height, mc.age, mc.gender, mc.activity);
    setMacroResult({ tdee, ...macroSplit(tdee, mc.goal) });
  };

  const runOrm = () => setOrm(calc1RM(parseFloat(tc.weight), parseInt(tc.reps)));

  const unitResult = uc.value ? CONVERSIONS[uc.type]?.(parseFloat(uc.value)) : null;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Calculators</h1>
        <p>Nutrition planner, strength estimator, and unit converter</p>
      </div>

      <div className="calc-tabs">
        {[
          { id: 'macro',    label: '🥗 Nutrition' },
          { id: 'training', label: '💪 Training'  },
          { id: 'units',    label: '⚖️ Units'     },
        ].map(t => (
          <button key={t.id} className={`btn ${tab === t.id ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── MACRO / NUTRITION CALCULATOR ── */}
      {tab === 'macro' && (
        <div className="card">
          <div className="section-title">TDEE & Macro Planner</div>
          <div className="grid-2" style={{ marginBottom: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Body Weight (lbs)</label>
              <NumberInput value={mc.weight} onChange={v => setMc(p => ({ ...p, weight: v }))} min={50} max={700} step={1} unit="lbs" />
            </div>
            <div className="form-group">
              <label className="form-label">Height (in)</label>
              <NumberInput value={mc.height} onChange={v => setMc(p => ({ ...p, height: v }))} min={36} max={96} step={0.5} unit="in" />
            </div>
            <div className="form-group">
              <label className="form-label">Age</label>
              <NumberInput value={mc.age} onChange={v => setMc(p => ({ ...p, age: v }))} min={13} max={100} step={1} unit="yrs" />
            </div>
            <div className="form-group">
              <label className="form-label">Biological Sex</label>
              <select className="form-select" value={mc.gender} onChange={e => setMc(p => ({ ...p, gender: e.target.value }))}>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Activity Level</label>
              <select className="form-select" value={mc.activity} onChange={e => setMc(p => ({ ...p, activity: e.target.value }))}>
                <option value="sedentary">Sedentary</option>
                <option value="light">Light (1–3×/wk)</option>
                <option value="moderate">Moderate (3–5×/wk)</option>
                <option value="active">Active (6–7×/wk)</option>
                <option value="very_active">Very Active</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Goal</label>
              <select className="form-select" value={mc.goal} onChange={e => setMc(p => ({ ...p, goal: e.target.value }))}>
                <option value="lose">Lose Weight (−400 kcal)</option>
                <option value="maintain">Maintain</option>
                <option value="gain">Build Muscle (+300 kcal)</option>
              </select>
            </div>
          </div>
          <button className="btn btn-primary" onClick={runMacro}>Calculate</button>

          {macroResult && (
            <div className="calc-result">
              <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Your Results</div>
              <div className="calc-result-row"><span className="calc-result-label">Maintenance (TDEE)</span><span className="calc-result-value">{macroResult.tdee} kcal</span></div>
              <div className="calc-result-row"><span className="calc-result-label">Target Calories</span><span className="calc-result-value" style={{ color: 'var(--orange)' }}>{macroResult.calories} kcal</span></div>
              <div className="calc-result-row"><span className="calc-result-label">Protein</span><span className="calc-result-value" style={{ color: 'var(--indigo)' }}>{macroResult.protein}g</span></div>
              <div className="calc-result-row"><span className="calc-result-label">Carbohydrates</span><span className="calc-result-value" style={{ color: 'var(--green)' }}>{macroResult.carbs}g</span></div>
              <div className="calc-result-row"><span className="calc-result-label">Fat</span><span className="calc-result-value" style={{ color: 'var(--yellow)' }}>{macroResult.fat}g</span></div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
                Calculated using the Mifflin-St Jeor formula. These are estimates — adjust based on your real-world results.
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TRAINING / 1RM CALCULATOR ── */}
      {tab === 'training' && (
        <div className="card">
          <div className="section-title">One Rep Max Estimator (Epley Formula)</div>
          <div className="form-row" style={{ marginBottom: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Weight Lifted (lbs)</label>
              <NumberInput value={tc.weight} onChange={v => setTc(p => ({ ...p, weight: v }))} min={0} max={2000} step={2.5} unit="lbs" />
            </div>
            <div className="form-group">
              <label className="form-label">Reps Performed</label>
              <NumberInput value={tc.reps} onChange={v => setTc(p => ({ ...p, reps: v }))} min={1} max={30} step={1} unit="reps" />
            </div>
          </div>
          <button className="btn btn-primary" onClick={runOrm}>Calculate 1RM</button>

          {orm && (
            <div className="calc-result">
              <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)' }}>Estimated 1RM</div>
                <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--indigo)', lineHeight: 1.1 }}>{orm} lbs</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{(orm * 0.453592).toFixed(1)} kg</div>
              </div>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Rep Max Table</div>
              {repMaxTable(orm).map(row => (
                <div key={row.reps} className="calc-result-row">
                  <span className="calc-result-label">{row.reps} rep{row.reps > 1 ? 's' : ''} <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>({row.pct}%)</span></span>
                  <span className="calc-result-value">{row.weight} lbs <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>/ {(row.weight * 0.453592).toFixed(1)} kg</span></span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── UNIT CONVERTER ── */}
      {tab === 'units' && (
        <div className="card">
          <div className="section-title">Unit Converter</div>
          <div className="form-group">
            <label className="form-label">Conversion Type</label>
            <select className="form-select" value={uc.type} onChange={e => setUc(p => ({ ...p, type: e.target.value }))}>
              {Object.keys(CONVERSIONS).map(k => <option key={k} value={k}>{k}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Value</label>
            <NumberInput value={uc.value} onChange={v => setUc(p => ({ ...p, value: v }))} min={0} step={0.01} placeholder="Enter value…" />
          </div>
          {unitResult && (
            <div className="calc-result" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>{uc.value} {uc.type.split('→')[0].trim()} =</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--indigo)' }}>{unitResult}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
