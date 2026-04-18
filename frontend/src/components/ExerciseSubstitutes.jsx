import { useState } from 'react';
import api from '../api/client';

export default function ExerciseSubstitutes({ exerciseName, onSelect, compact = false }) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen]       = useState(false);

  const load = async () => {
    if (data) { setOpen(v => !v); return; }
    setLoading(true);
    try {
      const r = await api.get(`/workouts/substitutes?name=${encodeURIComponent(exerciseName)}`);
      setData(r.data);
      setOpen(true);
    } catch {}
    setLoading(false);
  };

  return (
    <div>
      <button
        onClick={load}
        disabled={loading}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
          padding: compact ? '0.25rem 0.6rem' : '0.4rem 0.85rem',
          borderRadius: 8,
          border: '1px solid rgba(99,102,241,0.3)',
          background: 'rgba(99,102,241,0.08)',
          color: 'var(--indigo)',
          cursor: loading ? 'wait' : 'pointer',
          fontSize: compact ? '0.72rem' : '0.78rem',
          fontWeight: 600, fontFamily: 'inherit',
          transition: 'all 0.15s',
          whiteSpace: 'nowrap',
        }}
        title="Suggest substitute exercises"
      >
        {loading ? '…' : open ? '▲ Hide Subs' : '🔄 Substitutes'}
      </button>

      {open && data && (
        <div style={{
          marginTop: '0.5rem',
          padding: '0.75rem',
          background: 'rgba(99,102,241,0.05)',
          border: '1px solid rgba(99,102,241,0.2)',
          borderRadius: 10,
          animation: 'fadeUp 0.15s ease both',
        }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--indigo)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.5rem' }}>
            {data.muscleGroup} — Alternatives
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {data.substitutes.map(sub => (
              <button
                key={sub}
                onClick={() => { onSelect && onSelect(sub); setOpen(false); }}
                style={{
                  padding: '0.3rem 0.7rem',
                  borderRadius: 7,
                  border: '1px solid var(--border)',
                  background: 'var(--bg-elevated)',
                  color: 'var(--text)',
                  cursor: onSelect ? 'pointer' : 'default',
                  fontSize: '0.78rem', fontWeight: 500,
                  fontFamily: 'inherit',
                  transition: 'all 0.12s',
                }}
                onMouseEnter={e => { if (onSelect) { e.currentTarget.style.borderColor = 'var(--indigo)'; e.currentTarget.style.color = 'var(--indigo)'; }}}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text)'; }}
              >
                {sub}
              </button>
            ))}
          </div>
          {onSelect && (
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              Tap any exercise to use it
            </div>
          )}
        </div>
      )}
    </div>
  );
}
