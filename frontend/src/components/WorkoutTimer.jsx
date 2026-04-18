import { useState, useEffect, useRef, useCallback } from 'react';
import NumberInput from './NumberInput';

const fmt = (s) => {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
};

export default function WorkoutTimer({ autoStartRest = false, onSessionEnd }) {
  const [sessionSecs, setSessionSecs]   = useState(0);
  const [sessionActive, setSessionActive] = useState(false);
  const [restDuration, setRestDuration] = useState(60);
  const [restRemaining, setRestRemaining] = useState(null);
  const [autoRest, setAutoRest]         = useState(autoStartRest);
  const [restDone, setRestDone]         = useState(false);
  const sessionRef = useRef(null);
  const restRef    = useRef(null);

  // Session timer
  useEffect(() => {
    if (sessionActive) {
      sessionRef.current = setInterval(() => setSessionSecs(s => s + 1), 1000);
    } else {
      clearInterval(sessionRef.current);
    }
    return () => clearInterval(sessionRef.current);
  }, [sessionActive]);

  // Rest countdown
  useEffect(() => {
    if (restRemaining === null) return;
    if (restRemaining <= 0) {
      setRestDone(true);
      setRestRemaining(null);
      if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
      setTimeout(() => setRestDone(false), 2000);
      return;
    }
    restRef.current = setTimeout(() => setRestRemaining(r => r - 1), 1000);
    return () => clearTimeout(restRef.current);
  }, [restRemaining]);

  const startSession = () => { setSessionSecs(0); setSessionActive(true); };
  const stopSession  = () => {
    setSessionActive(false);
    if (onSessionEnd) onSessionEnd(sessionSecs);
  };

  const startRest = useCallback(() => {
    setRestDone(false);
    setRestRemaining(restDuration);
  }, [restDuration]);

  const cancelRest = () => { clearTimeout(restRef.current); setRestRemaining(null); };

  // Expose startRest for parent (after logging a set)
  useEffect(() => {
    window.__fittrack_startRest = autoRest ? startRest : null;
  }, [autoRest, startRest]);

  const restPct = restRemaining !== null ? (restRemaining / restDuration) * 100 : 0;

  return (
    <div className="workout-timer">
      {/* Session */}
      <div className="timer-block">
        <div className="timer-label">Session</div>
        <div className="timer-display">{fmt(sessionSecs)}</div>
        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
          {!sessionActive
            ? <button className="btn btn-primary btn-sm" onClick={startSession}>Start</button>
            : <button className="btn btn-secondary btn-sm" onClick={stopSession}>Finish</button>
          }
        </div>
      </div>

      {/* Divider */}
      <div style={{ width: '1px', background: 'var(--border)', alignSelf: 'stretch' }} />

      {/* Rest */}
      <div className="timer-block" style={{ flex: 2 }}>
        <div className="timer-label">Rest Timer</div>
        <div className={`timer-display ${restRemaining !== null ? 'rest-active' : ''} ${restDone ? 'done' : ''}`}>
          {restDone ? 'Go! 💪' : restRemaining !== null ? `${restRemaining}s` : '—'}
        </div>

        {/* Progress ring bar */}
        {restRemaining !== null && (
          <div style={{ height: 4, background: 'var(--border)', borderRadius: 999, marginBottom: '0.5rem', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${restPct}%`, background: 'var(--orange)', borderRadius: 999, transition: 'width 1s linear' }} />
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
          <NumberInput value={restDuration} onChange={setRestDuration} min={10} max={600} step={5} unit="s" />
          {restRemaining === null
            ? <button className="btn btn-secondary btn-sm" onClick={startRest}>Start</button>
            : <button className="btn btn-danger btn-sm" onClick={cancelRest}>Cancel</button>
          }
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', cursor: 'pointer', justifyContent: 'center' }}>
          <input type="checkbox" checked={autoRest} onChange={e => setAutoRest(e.target.checked)} style={{ accentColor: 'var(--indigo)' }} />
          Auto-start after each set
        </label>
      </div>
    </div>
  );
}
