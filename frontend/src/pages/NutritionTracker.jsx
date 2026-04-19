import { useState, useEffect } from 'react';
import api from '../api/client';
import MacroRing from '../components/MacroRing';
import { useToast } from '../context/ToastContext';

const DEFAULT_GOALS = { calories: 2000, protein: 150, carbs: 250, fat: 65 };

// ── Built-in Quick Add Defaults ───────────────────────────────────────────────
const DEFAULT_QUICK_ADDS = [
  {
    category: '🌅 Breakfast',
    items: [
      { name: 'Oatmeal w/ Banana',     calories: 350, protein: 12, carbs: 62, fat: 6  },
      { name: 'Scrambled Eggs (3)',     calories: 240, protein: 18, carbs: 1,  fat: 16 },
      { name: 'Greek Yogurt Bowl',      calories: 200, protein: 20, carbs: 22, fat: 3  },
      { name: 'Protein Shake',          calories: 180, protein: 30, carbs: 8,  fat: 3  },
      { name: 'Avocado Toast',          calories: 310, protein: 9,  carbs: 34, fat: 15 },
    ],
  },
  {
    category: '☀️ Lunch',
    items: [
      { name: 'Chicken & Rice',         calories: 480, protein: 45, carbs: 52, fat: 8  },
      { name: 'Turkey Wrap',            calories: 420, protein: 32, carbs: 45, fat: 12 },
      { name: 'Tuna Salad Bowl',        calories: 300, protein: 35, carbs: 8,  fat: 14 },
      { name: 'Salmon & Sweet Potato',  calories: 450, protein: 40, carbs: 35, fat: 12 },
    ],
  },
  {
    category: '🌙 Dinner',
    items: [
      { name: 'Ground Beef & Rice',     calories: 550, protein: 38, carbs: 52, fat: 18 },
      { name: 'Pasta w/ Chicken',       calories: 520, protein: 40, carbs: 58, fat: 10 },
      { name: 'Steak & Veggies',        calories: 480, protein: 42, carbs: 18, fat: 24 },
      { name: 'Chicken Stir Fry',       calories: 410, protein: 38, carbs: 30, fat: 14 },
    ],
  },
  {
    category: '🍎 Snacks',
    items: [
      { name: 'Protein Bar',            calories: 200, protein: 20, carbs: 22, fat: 7  },
      { name: 'Almonds (1oz)',          calories: 164, protein: 6,  carbs: 6,  fat: 14 },
      { name: 'Banana & Peanut Butter', calories: 270, protein: 7,  carbs: 32, fat: 11 },
      { name: 'Cottage Cheese Cup',     calories: 150, protein: 25, carbs: 5,  fat: 2  },
      { name: 'Rice Cakes & PB (2)',    calories: 210, protein: 7,  carbs: 28, fat: 9  },
    ],
  },
];

// ── Barcode Scanner ──────────────────────────────────────────────────────────

function BarcodeScanner({ onFill }) {
  const [barcode, setBarcode] = useState('');
  const [servingG, setServingG] = useState(100);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);

  const lookup = async () => {
    if (!barcode.trim()) return;
    setLoading(true);
    setError('');
    setProduct(null);
    try {
      const res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode.trim()}.json`);
      const data = await res.json();
      if (data.status !== 1 || !data.product) {
        setError('Product not found. Try a different barcode.');
        setLoading(false);
        return;
      }
      const p = data.product;
      const n = p.nutriments || {};
      setProduct({
        name: p.product_name || p.product_name_en || 'Unknown Product',
        cal100:     parseFloat(n['energy-kcal_100g'] || n['energy-kcal'] || 0),
        protein100: parseFloat(n['proteins_100g']    || n['protein_100g'] || 0),
        carbs100:   parseFloat(n['carbohydrates_100g'] || 0),
        fat100:     parseFloat(n['fat_100g']          || 0),
      });
    } catch {
      setError('Failed to fetch product. Check your internet connection.');
    }
    setLoading(false);
  };

  const calc = (per100) => Math.round((per100 * servingG) / 100 * 10) / 10;

  const handleUse = () => {
    if (!product) return;
    onFill({
      name:     `${product.name} (${servingG}g)`,
      calories: Math.round(calc(product.cal100)),
      protein:  calc(product.protein100),
      carbs:    calc(product.carbs100),
      fat:      calc(product.fat100),
    });
    setOpen(false);
    setProduct(null);
    setBarcode('');
    setServingG(100);
  };

  if (!open) {
    return (
      <button
        className="btn btn-secondary"
        style={{ width: '100%', marginBottom: '0.85rem' }}
        onClick={() => setOpen(true)}
      >
        📷 Scan Barcode
      </button>
    );
  }

  return (
    <div style={{
      padding: '1rem', background: 'var(--bg-elevated)',
      border: '1.5px solid var(--border)', borderRadius: 12,
      marginBottom: '0.85rem',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>📷 Barcode Lookup</div>
        <button
          onClick={() => setOpen(false)}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1rem' }}
        >✕</button>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.65rem' }}>
        <input
          className="form-input"
          style={{ flex: 1 }}
          type="text"
          placeholder="Enter barcode number (e.g. 0037600155403)"
          value={barcode}
          onChange={e => setBarcode(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && lookup()}
        />
        <button
          className="btn btn-primary"
          onClick={lookup}
          disabled={loading || !barcode.trim()}
          style={{ flexShrink: 0, padding: '0.5rem 1rem' }}
        >
          {loading ? '…' : 'Look Up'}
        </button>
      </div>

      {error && (
        <div style={{ color: 'var(--red)', fontSize: '0.8rem', padding: '0.5rem 0.75rem', background: 'rgba(239,68,68,0.08)', borderRadius: 8, marginBottom: '0.65rem' }}>
          {error}
        </div>
      )}

      {product && (
        <div style={{ padding: '0.85rem', background: 'var(--bg-card)', borderRadius: 10, border: '1px solid var(--border)' }}>
          <div style={{ fontWeight: 700, marginBottom: '0.65rem' }}>{product.name}</div>
          <div className="form-group" style={{ marginBottom: '0.75rem' }}>
            <label className="form-label">Serving Size (grams)</label>
            <input
              className="form-input"
              type="number"
              min="1"
              max="2000"
              value={servingG}
              onChange={e => setServingG(Math.max(1, parseInt(e.target.value) || 100))}
            />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', fontSize: '0.82rem', marginBottom: '0.85rem' }}>
            <span style={{ color: 'var(--orange)', fontWeight: 600 }}>{calc(product.cal100)} kcal</span>
            <span style={{ color: '#a5b4fc' }}>P {calc(product.protein100)}g</span>
            <span style={{ color: '#86efac' }}>C {calc(product.carbs100)}g</span>
            <span style={{ color: '#fde68a' }}>F {calc(product.fat100)}g</span>
          </div>
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleUse}>
            Use This Food
          </button>
        </div>
      )}

      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
        Powered by Open Food Facts · Type a UPC/EAN barcode number
      </div>
    </div>
  );
}

// ── Food Search ──────────────────────────────────────────────────────────────

function FoodSearch({ onFill }) {
  const [query, setQuery]     = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen]       = useState(false);

  useEffect(() => {
    if (!query || query.length < 2) { setResults([]); return; }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.get(`/foods/search?q=${encodeURIComponent(query)}`);
        setResults(res.data);
      } catch { setResults([]); }
      setLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  const handlePick = (food) => {
    onFill({
      name:     food.name,
      calories: food.calories,
      protein:  food.protein,
      carbs:    food.carbs,
      fat:      food.fat,
    });
    setQuery('');
    setResults([]);
    setOpen(false);
  };

  if (!open) {
    return (
      <button
        className="btn btn-secondary"
        style={{ width: '100%', marginBottom: '0.5rem' }}
        onClick={() => setOpen(true)}
      >
        🔍 Search Foods
      </button>
    );
  }

  return (
    <div style={{
      padding: '1rem', background: 'var(--bg-elevated)',
      border: '1.5px solid var(--border)', borderRadius: 12,
      marginBottom: '0.85rem',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>🔍 Search Foods</div>
        <button onClick={() => { setOpen(false); setQuery(''); setResults([]); }}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1rem' }}>✕</button>
      </div>

      <input
        className="form-input"
        type="text"
        placeholder="Search: chicken breast, oats, banana…"
        value={query}
        onChange={e => setQuery(e.target.value)}
        autoFocus
      />

      {loading && (
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', padding: '0.5rem 0' }}>Searching…</div>
      )}

      {results.length > 0 && (
        <div style={{ marginTop: '0.5rem', maxHeight: 260, overflowY: 'auto' }}>
          {results.map((food, i) => (
            <button
              key={i}
              onClick={() => handlePick(food)}
              style={{
                width: '100%', textAlign: 'left', padding: '0.65rem 0.75rem',
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 8, marginBottom: '0.35rem', cursor: 'pointer',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem',
              }}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text)' }}>{food.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>per {food.serving}</div>
              </div>
              <div style={{ fontSize: '0.78rem', textAlign: 'right', flexShrink: 0 }}>
                <span style={{ color: 'var(--orange)', fontWeight: 700 }}>{food.calories} kcal</span>
                <div style={{ color: 'var(--text-muted)' }}>P{food.protein} C{food.carbs} F{food.fat}</div>
              </div>
            </button>
          ))}
        </div>
      )}

      {!loading && query.length >= 2 && results.length === 0 && (
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', padding: '0.5rem 0' }}>
          No results found. Try a different name or log manually.
        </div>
      )}
    </div>
  );
}

// ── Create Preset Form ────────────────────────────────────────────────────────

function CreatePresetForm({ onSaved, onClose }) {
  const { addToast } = useToast();
  const [form, setForm] = useState({ name: '', calories: '', protein: '', carbs: '', fat: '' });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      await api.post('/meals/presets', {
        name:     form.name.trim(),
        calories: parseInt(form.calories)  || 0,
        protein:  parseFloat(form.protein) || 0,
        carbs:    parseFloat(form.carbs)   || 0,
        fat:      parseFloat(form.fat)     || 0,
      });
      addToast(`"${form.name}" added to Quick Add!`, 'success');
      onSaved();
      onClose();
    } catch {
      addToast('Failed to save preset', 'error');
    }
    setSaving(false);
  };

  return (
    <div style={{
      padding: '1.25rem', background: 'var(--bg-elevated)',
      border: '1.5px solid rgba(99,102,241,0.35)', borderRadius: 14,
      marginBottom: '1rem',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>➕ New Quick Add Item</div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1rem' }}>✕</button>
      </div>

      <div className="form-group">
        <label className="form-label">Food Name</label>
        <input className="form-input" placeholder="e.g. Chicken Breast 150g" value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          onKeyDown={e => e.key === 'Enter' && handleSave()} />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Calories</label>
          <input className="form-input" type="number" min="0" placeholder="250"
            value={form.calories} onChange={e => setForm(f => ({ ...f, calories: e.target.value }))} />
        </div>
        <div className="form-group">
          <label className="form-label">Protein (g)</label>
          <input className="form-input" type="number" min="0" placeholder="30"
            value={form.protein} onChange={e => setForm(f => ({ ...f, protein: e.target.value }))} />
        </div>
      </div>

      <div className="form-row" style={{ marginBottom: '1rem' }}>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Carbs (g)</label>
          <input className="form-input" type="number" min="0" placeholder="0"
            value={form.carbs} onChange={e => setForm(f => ({ ...f, carbs: e.target.value }))} />
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Fat (g)</label>
          <input className="form-input" type="number" min="0" placeholder="5"
            value={form.fat} onChange={e => setForm(f => ({ ...f, fat: e.target.value }))} />
        </div>
      </div>

      <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleSave}
        disabled={saving || !form.name.trim()}>
        {saving ? 'Saving…' : '💾 Save to Quick Add'}
      </button>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function NutritionTracker() {
  const { addToast } = useToast();
  const [date, setDate]         = useState(new Date().toISOString().split('T')[0]);
  const [meals, setMeals]       = useState([]);
  const [presets, setPresets]   = useState([]);
  const [goals, setGoals]       = useState(DEFAULT_GOALS);
  const [form, setForm]         = useState({ name: '', calories: '', protein: '', carbs: '', fat: '' });
  const [adding, setAdding]     = useState(false);
  const [quickAdding, setQuickAdding] = useState(null);
  const [showPresetForm, setShowPresetForm] = useState(false);
  const [quickTab, setQuickTab] = useState('defaults'); // 'defaults' | 'mine'
  const [defaultCategory, setDefaultCategory] = useState(0);

  useEffect(() => {
    loadPresets();
    // Fetch the user's actual goals from the Goals page
    api.get('/goals').then(r => {
      const g = r.data;
      setGoals({
        calories: g.calorie_goal ?? DEFAULT_GOALS.calories,
        protein:  g.protein_goal ?? DEFAULT_GOALS.protein,
        carbs:    g.carbs_goal   ?? DEFAULT_GOALS.carbs,
        fat:      g.fat_goal     ?? DEFAULT_GOALS.fat,
      });
    }).catch(() => {});
  }, []);

  useEffect(() => { loadMeals(); }, [date]);

  const loadMeals   = async () => { try { setMeals((await api.get(`/meals?date=${date}`)).data); } catch {} };
  const loadPresets = async () => { try { setPresets((await api.get('/meals/presets')).data); } catch {} };

  const totals = meals.reduce(
    (a, m) => ({ calories: a.calories + m.calories, protein: a.protein + m.protein, carbs: a.carbs + m.carbs, fat: a.fat + m.fat }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const addMeal = async (meal) => {
    try { await api.post('/meals', { ...meal, date }); loadMeals(); } catch {}
  };

  const handleAdd = async () => {
    if (!form.name.trim()) return;
    setAdding(true);
    await addMeal({
      name:     form.name.trim(),
      calories: parseInt(form.calories)   || 0,
      protein:  parseFloat(form.protein)  || 0,
      carbs:    parseFloat(form.carbs)    || 0,
      fat:      parseFloat(form.fat)      || 0,
    });
    addToast(`${form.name} logged!`, 'success');
    setForm({ name: '', calories: '', protein: '', carbs: '', fat: '' });
    setAdding(false);
  };

  const handleQuickAdd = async (p) => {
    setQuickAdding(p.id);
    try {
      await addMeal(p);
      addToast(`${p.name} added — ${p.calories} kcal`, 'success');
    } catch {
      addToast('Failed to add meal', 'error');
    }
    setQuickAdding(null);
  };

  // Quick-add a default item (no id, use name as key)
  const handleDefaultAdd = async (item) => {
    setQuickAdding(`d_${item.name}`);
    try {
      await addMeal(item);
      addToast(`${item.name} added — ${item.calories} kcal`, 'success');
    } catch {
      addToast('Failed to add', 'error');
    }
    setQuickAdding(null);
  };

  const deleteMeal = async (id) => {
    try { await api.delete(`/meals/${id}`); loadMeals(); } catch {}
  };

  // Pre-fill form from barcode scan
  const fillFromBarcode = (product) => {
    setForm({
      name:     product.name,
      calories: String(product.calories),
      protein:  String(product.protein),
      carbs:    String(product.carbs),
      fat:      String(product.fat),
    });
  };

  const dateLabel = new Date(date + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric'
  });

  return (
    <div className="page">
      <div className="page-header">
        <h1>Nutrition Tracker</h1>
        <p>Log meals and track your daily macros</p>
      </div>

      {/* Date picker */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <input
          type="date" className="form-input"
          style={{ width: 'auto' }}
          value={date}
          onChange={e => setDate(e.target.value)}
        />
        <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{dateLabel}</span>
      </div>

      {/* Macro rings + Progress bars — side by side */}
      {(() => {
        const pcts = {
          calories: Math.min(100, goals.calories > 0 ? (totals.calories / goals.calories) * 100 : 0),
          protein:  Math.min(100, goals.protein  > 0 ? (totals.protein  / goals.protein)  * 100 : 0),
          carbs:    Math.min(100, goals.carbs    > 0 ? (totals.carbs    / goals.carbs)    * 100 : 0),
          fat:      Math.min(100, goals.fat      > 0 ? (totals.fat      / goals.fat)      * 100 : 0),
        };
        const overall = Math.round((pcts.calories + pcts.protein + pcts.carbs + pcts.fat) / 4);
        const allHit = pcts.calories >= 100 && pcts.protein >= 100 && pcts.carbs >= 100 && pcts.fat >= 100;

        return (
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div className="card-title">Daily Overview</div>
            <div className="macro-overview-layout">
              {/* Left: Macro Rings */}
              <div className="macro-rings">
                <MacroRing label="Calories" value={Math.round(totals.calories)} goal={goals.calories} color="var(--orange)" unit="kcal" />
                <MacroRing label="Protein"  value={Math.round(totals.protein)}  goal={goals.protein}  color="var(--indigo)" unit="g" />
                <MacroRing label="Carbs"    value={Math.round(totals.carbs)}    goal={goals.carbs}    color="var(--green)"  unit="g" />
                <MacroRing label="Fat"      value={Math.round(totals.fat)}      goal={goals.fat}      color="var(--yellow)" unit="g" />
              </div>

              {/* Right: Progress bars */}
              <div className="macro-progress-panel">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text)' }}>Goal Progress</span>
                  <span style={{
                    fontSize: '0.82rem', fontWeight: 700,
                    color: allHit ? 'var(--green)' : overall >= 75 ? 'var(--orange)' : 'var(--text-muted)',
                  }}>
                    {allHit ? '🎯 Goals Met!' : `${overall}%`}
                  </span>
                </div>

                {/* Overall bar */}
                <div style={{
                  height: 8, borderRadius: 4, background: 'var(--bg-surface)',
                  overflow: 'hidden', marginBottom: '0.85rem',
                }}>
                  <div style={{
                    height: '100%', borderRadius: 4,
                    width: `${Math.min(100, overall)}%`,
                    background: allHit
                      ? 'linear-gradient(90deg, var(--green), #34d399)'
                      : overall >= 75
                        ? 'linear-gradient(90deg, var(--orange), #fbbf24)'
                        : 'linear-gradient(90deg, var(--indigo), #818cf8)',
                    transition: 'width 0.5s ease',
                  }} />
                </div>

                {/* Individual macro bars */}
                {[
                  { label: 'Calories', pct: pcts.calories, current: Math.round(totals.calories), goal: goals.calories, unit: 'kcal', color: 'var(--orange)' },
                  { label: 'Protein',  pct: pcts.protein,  current: Math.round(totals.protein),  goal: goals.protein,  unit: 'g',    color: 'var(--indigo)' },
                  { label: 'Carbs',    pct: pcts.carbs,    current: Math.round(totals.carbs),    goal: goals.carbs,    unit: 'g',    color: 'var(--green)' },
                  { label: 'Fat',      pct: pcts.fat,      current: Math.round(totals.fat),      goal: goals.fat,      unit: 'g',    color: 'var(--yellow)' },
                ].map(m => (
                  <div key={m.label} style={{ marginBottom: '0.55rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.2rem' }}>
                      <span style={{ color: m.color, fontWeight: 600 }}>{m.label}</span>
                      <span style={{ color: 'var(--text-muted)' }}>
                        {m.current} / {m.goal} {m.unit}
                        <span style={{ marginLeft: '0.35rem', fontWeight: 600, color: m.pct >= 100 ? 'var(--green)' : 'var(--text-muted)' }}>
                          {m.pct >= 100 ? '✓' : `${Math.round(m.pct)}%`}
                        </span>
                      </span>
                    </div>
                    <div style={{
                      height: 5, borderRadius: 3, background: 'var(--bg-surface)', overflow: 'hidden',
                    }}>
                      <div style={{
                        height: '100%', borderRadius: 3,
                        width: `${Math.min(100, m.pct)}%`,
                        background: m.pct >= 100 ? 'var(--green)' : m.color,
                        transition: 'width 0.5s ease',
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Quick Add */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        {/* Header with tabs */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
          <div className="card-title" style={{ marginBottom: 0 }}>Quick Add</div>
          {quickTab === 'mine' && (
            <button className="btn btn-secondary btn-sm" onClick={() => setShowPresetForm(v => !v)} style={{ fontSize: '0.78rem' }}>
              {showPresetForm ? '✕ Cancel' : '➕ New Item'}
            </button>
          )}
        </div>

        {/* Tab switcher */}
        <div className="quick-add-tabs">
          <button className={`qa-tab ${quickTab === 'defaults' ? 'active' : ''}`} onClick={() => setQuickTab('defaults')}>
            Defaults
          </button>
          <button className={`qa-tab ${quickTab === 'mine' ? 'active' : ''}`} onClick={() => setQuickTab('mine')}>
            My Items {presets.length > 0 && <span className="qa-tab-badge">{presets.length}</span>}
          </button>
        </div>

        {/* Defaults tab */}
        {quickTab === 'defaults' && (
          <div>
            {/* Category pills */}
            <div className="qa-categories">
              {DEFAULT_QUICK_ADDS.map((cat, i) => (
                <button
                  key={i}
                  className={`qa-cat-pill ${defaultCategory === i ? 'active' : ''}`}
                  onClick={() => setDefaultCategory(i)}
                >
                  {cat.category}
                </button>
              ))}
            </div>
            <div className="preset-grid">
              {DEFAULT_QUICK_ADDS[defaultCategory].items.map((item) => (
                <button
                  key={item.name}
                  className="preset-btn preset-btn-default"
                  onClick={() => handleDefaultAdd(item)}
                  disabled={quickAdding === `d_${item.name}`}
                  style={{ opacity: quickAdding === `d_${item.name}` ? 0.6 : 1 }}
                >
                  <div className="preset-btn-name">{item.name}</div>
                  <div className="preset-btn-cal">{item.calories} kcal · {item.protein}g P</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* My Items tab */}
        {quickTab === 'mine' && (
          <div>
            {showPresetForm && (
              <CreatePresetForm onSaved={loadPresets} onClose={() => setShowPresetForm(false)} />
            )}
            {presets.length === 0 && !showPresetForm ? (
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', padding: '0.5rem 0' }}>
                No saved items yet. Click "New Item" to save your go-to meals here.
              </div>
            ) : (
              <div className="preset-grid">
                {presets.map(p => (
                  <button
                    key={p.id}
                    className="preset-btn"
                    onClick={() => handleQuickAdd(p)}
                    disabled={quickAdding === p.id}
                    style={{ opacity: quickAdding === p.id ? 0.6 : 1, position: 'relative' }}
                  >
                    {quickAdding === p.id && (
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-elevated)', borderRadius: 'inherit', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Adding…</div>
                    )}
                    <div className="preset-btn-name">{p.name}</div>
                    <div className="preset-btn-cal">{p.calories} kcal · {p.protein}g P</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="grid-2" style={{ alignItems: 'start' }}>
        {/* Custom form */}
        <div className="card">
          <div className="section-title">Custom Meal</div>

          {/* Food search + barcode */}
          <FoodSearch onFill={fillFromBarcode} />
          <BarcodeScanner onFill={fillFromBarcode} />

          <div className="form-group">
            <label className="form-label">Meal Name</label>
            <input
              className="form-input"
              placeholder="e.g. Chicken Breast & Rice"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Calories</label>
              <input className="form-input" type="number" min="0" placeholder="450"
                value={form.calories} onChange={e => setForm({ ...form, calories: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Protein (g)</label>
              <input className="form-input" type="number" min="0" placeholder="35"
                value={form.protein} onChange={e => setForm({ ...form, protein: e.target.value })} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Carbs (g)</label>
              <input className="form-input" type="number" min="0" placeholder="50"
                value={form.carbs} onChange={e => setForm({ ...form, carbs: e.target.value })} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Fat (g)</label>
              <input className="form-input" type="number" min="0" placeholder="12"
                value={form.fat} onChange={e => setForm({ ...form, fat: e.target.value })} />
            </div>
          </div>
          <button
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.85rem' }}
            onClick={handleAdd}
            disabled={adding || !form.name.trim()}
          >
            {adding ? 'Adding…' : '+ Log Meal'}
          </button>
        </div>

        {/* Meals list */}
        <div>
          <div className="section-title">Meals ({meals.length})</div>
          {meals.length === 0
            ? <div className="empty"><div className="empty-icon">🥗</div>No meals logged for this day</div>
            : meals.map(m => (
                <div key={m.id} className="meal-item">
                  <div>
                    <div className="meal-name">{m.name}</div>
                    <div className="meal-macros">
                      <span className="macro-cal">{m.calories} kcal</span>
                      <span className="macro-protein">P {m.protein}g</span>
                      <span className="macro-carbs">C {m.carbs}g</span>
                      <span className="macro-fat">F {m.fat}g</span>
                    </div>
                  </div>
                  <button className="btn btn-danger btn-sm" onClick={() => deleteMeal(m.id)}>✕</button>
                </div>
              ))
          }
          {meals.length > 0 && (
            <div style={{
              marginTop: '0.75rem', padding: '0.75rem',
              background: 'var(--bg-elevated)', borderRadius: 8,
              fontSize: '0.825rem', color: 'var(--text-muted)',
              display: 'flex', gap: '1rem', flexWrap: 'wrap'
            }}>
              <span>Total: <strong style={{ color: 'var(--orange)' }}>{Math.round(totals.calories)} kcal</strong></span>
              <span>P: <strong style={{ color: 'var(--indigo)' }}>{Math.round(totals.protein)}g</strong></span>
              <span>C: <strong style={{ color: 'var(--green)' }}>{Math.round(totals.carbs)}g</strong></span>
              <span>F: <strong style={{ color: 'var(--yellow)' }}>{Math.round(totals.fat)}g</strong></span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
