import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';

export default function WellnessCheckin() {
  const [checkin, setCheckin]           = useState(null);
  const [response, setResponse]         = useState('');
  const [submitting, setSubmitting]     = useState(false);
  const [dismissed, setDismissed]       = useState(false);
  const [showMentalHealth, setShowMH]   = useState(false);

  useEffect(() => {
    api.get('/wellness')
      .then(r => { if (r.data) setCheckin(r.data); })
      .catch(() => {});
  }, []);

  if (!checkin || dismissed) return null;

  const handleRespond = async () => {
    setSubmitting(true);
    try {
      const r = await api.post(`/wellness/${checkin.id}/respond`, { response: response.trim() || 'acknowledged' });
      if (r.data?.suggest_mental_health) {
        setShowMH(true);
      } else {
        setDismissed(true);
      }
    } catch {}
    setSubmitting(false);
  };

  const handleDismiss = async () => {
    try { await api.post(`/wellness/dismiss/${checkin.id}`); } catch {}
    setDismissed(true);
  };

  // Show mental health prompt after a tough response
  if (showMentalHealth) {
    return (
      <div style={{
        marginBottom: '1.25rem',
        padding: '1.1rem 1.25rem',
        background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.08))',
        border: '1px solid rgba(99,102,241,0.25)',
        borderRadius: 16,
        animation: 'fadeUp 0.3s ease both',
      }}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
            background: 'rgba(99,102,241,0.15)', border: '1.5px solid rgba(99,102,241,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem',
          }}>
            💙
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.35rem' }}>
              Thanks for sharing that.
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '0.85rem' }}>
              It sounds like things have been tough lately. That's okay — it happens to everyone.
              We've put together some resources that might help.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <Link to="/mental-health">
                <button className="btn btn-primary" style={{ fontSize: '0.82rem', minHeight: 38, padding: '0.45rem 1rem' }}>
                  💙 View Resources
                </button>
              </Link>
              <button
                className="btn btn-secondary"
                onClick={() => setDismissed(true)}
                style={{ fontSize: '0.82rem', minHeight: 38, padding: '0.45rem 0.875rem' }}
              >
                I'm okay, thanks
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      marginBottom: '1.25rem',
      padding: '1rem 1.25rem',
      background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.08))',
      border: '1px solid rgba(99,102,241,0.25)',
      borderRadius: 16,
      position: 'relative',
      animation: 'fadeUp 0.3s ease both',
    }}>
      <button
        onClick={handleDismiss}
        style={{
          position: 'absolute', top: '0.75rem', right: '0.75rem',
          background: 'none', border: 'none', color: 'var(--text-muted)',
          cursor: 'pointer', fontSize: '1rem', lineHeight: 1, padding: '0.25rem',
        }}
        title="Dismiss"
      >✕</button>

      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
          background: 'rgba(99,102,241,0.15)', border: '1.5px solid rgba(99,102,241,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem',
        }}>
          💙
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--indigo)', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
            Check-in
          </div>
          <div style={{ fontSize: '0.9rem', color: 'var(--text)', lineHeight: 1.55, marginBottom: '0.85rem' }}>
            {checkin.message}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="How are you feeling? (optional)"
              value={response}
              onChange={e => setResponse(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleRespond()}
              style={{
                flex: 1, minWidth: 160,
                padding: '0.55rem 0.875rem',
                background: 'var(--bg-elevated)',
                border: '1.5px solid var(--border)',
                borderRadius: 9, color: 'var(--text)',
                fontFamily: 'inherit', fontSize: '0.85rem',
                outline: 'none', minHeight: 40,
              }}
            />
            <button
              className="btn btn-primary"
              onClick={handleRespond}
              disabled={submitting}
              style={{ minHeight: 40, padding: '0.5rem 1rem', fontSize: '0.82rem' }}
            >
              {submitting ? '…' : 'Respond'}
            </button>
            <button
              className="btn btn-secondary"
              onClick={handleDismiss}
              style={{ minHeight: 40, padding: '0.5rem 0.875rem', fontSize: '0.82rem' }}
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
