import { useState, useEffect } from 'react';
import api from '../api/client';
import { useToast } from '../context/ToastContext';
import NumberInput from '../components/NumberInput';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const TT = { contentStyle: { background: '#1a1a24', border: '1px solid #2a2a3a', borderRadius: 10, color: '#e8e8f0', fontSize: '0.8rem' }, cursor: { stroke: '#2a2a3a' } };

const BMI_CATS = [
  { label: 'Under', range: '< 18.5', color: '#60a5fa', max: 18.5 },
  { label: 'Normal', range: '18.5–24.9', color: '#22c55e', max: 25 },
  { label: 'Over', range: '25–29.9', color: '#f97316', max: 30 },
  { label: 'Obese', range: '30+', color: '#ef4444', max: Infinity },
];

function bmiCat(bmi) { return BMI_CATS.find(c => bmi < c.max) || BMI_CATS[3]; }

export default function BodyStats() {
  const { addToast } = useToast();
  const [stats, setStats]     = useState([]);
  const [profile, setProfile] = useState(null);
  const [form, setForm]       = useState({ date: new Date().toISOString().split('T')[0], weight_lbs: '', body_fat_pct: '', waist_in: '', chest_in: '', arms_in: '', hips_in: '', notes: '' });
  const [adding, setAdding]   = useState(false);

  useEffect(() => {
    api.get('/body-stats').then(r => setStats(r.data)).catch(() => {});
    api.get('/profile').then(r => setProfile(r.data)).catch(() => {});
  }, []);

  const bmiVal = profile?.height_in && form.weight_lbs
    ? ((703 * parseFloat(form.weight_lbs)) / Math.pow(parseFloat(profile.height_in), 2)).toFixed(1)
    : null;

  const addStats = async () => {
    if (!form.weight_lbs && !form.waist_in && !form.chest_in) return addToast('Enter at least one measurement', 'info');
    setAdding(true);
    try {
      const r = await api.post('/body-stats', form);
      setStats(prev => [...prev, r.data].sort((a, b) => a.date.localeCompare(b.date)));
      addToast('Measurements logged! 📏', 'success');
      setForm(f => ({ ...f, weight_lbs: '', body_fat_pct: '', waist_in: '', chest_in: '', arms_in: '', hips_in: '', notes: '' }));
    } catch { addToast('Failed to save', 'error'); }
    setAdding(false);
  };

  const del = async (id) => {
    try { await api.delete(`/body-stats/${id}`); setStats(prev => prev.filter(s => s.id !== id)); addToast('Entry deleted', 'info'); }
    catch {}
  };

  const latest = stats[stats.length - 1];
  const weightData = stats.filter(s => s.weight_lbs).map(s => ({ date: s.date.slice(5), weight: s.weight_lbs }));
  const fatData    = stats.filter(s => s.body_fat_pct).map(s => ({ date: s.date.slice(5), fat: s.body_fat_pct }));

  return (
    <div className="page">
      <div className="page-header">
        <h1>Body Stats</h1>
        <p>Track your measurements, body fat, and composition over time</p>
      </div>

      {/* Summary row */}
      {latest && (
        <div className="grid-4" style={{ marginBottom: '1.25rem' }}>
          {[
            { label: 'Weight',   val: latest.weight_lbs ? `${latest.weight_lbs} lbs` : '—', color: 'var(--indigo)' },
            { label: 'Body Fat', val: latest.body_fat_pct ? `${latest.body_fat_pct}%` : '—', color: 'var(--orange)' },
            { label: 'Waist',    val: latest.waist_in ? `${latest.waist_in}"` : '—', color: 'var(--violet)' },
            { label: 'Arms',     val: latest.arms_in  ? `${latest.arms_in}"` : '—', color: 'var(--green)' },
          ].map(({ label, val, color }) => (
            <div key={label} className="card">
              <div className="card-title">{label}</div>
              <div className="card-value" style={{ fontSize: '1.5rem', color }}>{val}</div>
              <div className="card-sub">Latest entry</div>
            </div>
          ))}
        </div>
      )}

      {/* BMI */}
      {bmiVal && (
        <div className="card" style={{ marginBottom: '1.25rem' }}>
          <div className="card-title">BMI — Live Preview</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: bmiCat(parseFloat(bmiVal)).color, lineHeight: 1 }}>{bmiVal}</div>
              <div style={{ fontWeight: 600, color: bmiCat(parseFloat(bmiVal)).color, fontSize: '0.9rem', marginTop: '0.25rem' }}>{bmiCat(parseFloat(bmiVal)).label}</div>
            </div>
            <div className="bmi-scale" style={{ flex: 1, minWidth: 200 }}>
              {BMI_CATS.map(c => (
                <div key={c.label} className="bmi-segment" style={{ background: c.color + '22', border: `1px solid ${c.color}44`, outline: parseFloat(bmiVal) < c.max && (BMI_CATS.indexOf(c) === 0 || parseFloat(bmiVal) >= BMI_CATS[BMI_CATS.indexOf(c) - 1]?.max) ? `2px solid ${c.color}` : 'none' }}>
                  <div className="bmi-seg-label" style={{ color: c.color }}>{c.label}</div>
                  <div className="bmi-seg-range">{c.range}</div>
                </div>
              ))}
            </div>
          </div>
          {!profile?.height_in && <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Set your height in Goals & Profile for live BMI calculation</div>}
        </div>
      )}

      <div className="grid-2 stack" style={{ alignItems: 'start', marginBottom: '1.25rem' }}>
        {/* Log form */}
        <div className="card">
          <div className="section-title">Log Measurements</div>
          <div className="form-group">
            <label className="form-label">Date</label>
            <input type="date" className="form-input" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Weight (lbs)</label>
              <NumberInput value={form.weight_lbs} onChange={v => setForm(f => ({ ...f, weight_lbs: v }))} min={50} max={700} step={0.1} unit="lbs" placeholder="175" />
            </div>
            <div className="form-group">
              <label className="form-label">Body Fat %</label>
              <NumberInput value={form.body_fat_pct} onChange={v => setForm(f => ({ ...f, body_fat_pct: v }))} min={3} max={60} step={0.1} unit="%" placeholder="15" />
            </div>
            <div className="form-group">
              <label className="form-label">Waist (in)</label>
              <NumberInput value={form.waist_in} onChange={v => setForm(f => ({ ...f, waist_in: v }))} min={10} max={80} step={0.25} unit="in" placeholder="32" />
            </div>
            <div className="form-group">
              <label className="form-label">Chest (in)</label>
              <NumberInput value={form.chest_in} onChange={v => setForm(f => ({ ...f, chest_in: v }))} min={20} max={80} step={0.25} unit="in" placeholder="42" />
            </div>
            <div className="form-group">
              <label className="form-label">Arms (in)</label>
              <NumberInput value={form.arms_in} onChange={v => setForm(f => ({ ...f, arms_in: v }))} min={5} max={30} step={0.25} unit="in" placeholder="15" />
            </div>
            <div className="form-group">
              <label className="form-label">Hips (in)</label>
              <NumberInput value={form.hips_in} onChange={v => setForm(f => ({ ...f, hips_in: v }))} min={20} max={80} step={0.25} unit="in" placeholder="38" />
            </div>
          </div>
          <div className="form-group" style={{ marginBottom: '0.85rem' }}>
            <label className="form-label">Notes</label>
            <input className="form-input" placeholder="Optional notes..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          </div>
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={addStats} disabled={adding}>
            {adding ? 'Saving…' : 'Log Measurements'}
          </button>
        </div>

        {/* Recent entries */}
        <div className="card">
          <div className="section-title">Recent Entries</div>
          {stats.length === 0
            ? <div className="empty"><div className="empty-icon">📏</div>No measurements yet</div>
            : <div style={{ display: 'flex', flexDirection: 'column', gap: 0, maxHeight: 380, overflowY: 'auto' }}>
                {[...stats].reverse().slice(0, 20).map(s => (
                  <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '0.6rem 0', borderBottom: '1px solid var(--border)' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{s.date}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem', display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                        {s.weight_lbs && <span>{s.weight_lbs} lbs</span>}
                        {s.body_fat_pct && <span>{s.body_fat_pct}% BF</span>}
                        {s.waist_in && <span>W: {s.waist_in}"</span>}
                        {s.chest_in && <span>C: {s.chest_in}"</span>}
                        {s.arms_in && <span>A: {s.arms_in}"</span>}
                      </div>
                    </div>
                    <button className="btn btn-danger btn-sm" onClick={() => del(s.id)}>✕</button>
                  </div>
                ))}
              </div>
          }
        </div>
      </div>

      {/* Charts */}
      {weightData.length >= 2 && (
        <div className="card" style={{ marginBottom: '1.25rem' }}>
          <div className="section-title">Weight Trend</div>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weightData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" />
                <XAxis dataKey="date" tick={{ fill: '#888899', fontSize: 11 }} />
                <YAxis domain={['auto', 'auto']} tick={{ fill: '#888899', fontSize: 11 }} />
                <Tooltip {...TT} formatter={v => [`${v} lbs`, 'Weight']} />
                <Line type="monotone" dataKey="weight" stroke="#6366f1" strokeWidth={2.5} dot={{ fill: '#6366f1', r: 3, strokeWidth: 0 }} activeDot={{ r: 5, fill: '#8b5cf6', strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {fatData.length >= 2 && (
        <div className="card">
          <div className="section-title">Body Fat % Trend</div>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={fatData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" />
                <XAxis dataKey="date" tick={{ fill: '#888899', fontSize: 11 }} />
                <YAxis domain={['auto', 'auto']} tick={{ fill: '#888899', fontSize: 11 }} />
                <Tooltip {...TT} formatter={v => [`${v}%`, 'Body Fat']} />
                <Line type="monotone" dataKey="fat" stroke="#f97316" strokeWidth={2.5} dot={{ fill: '#f97316', r: 3, strokeWidth: 0 }} activeDot={{ r: 5, strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
