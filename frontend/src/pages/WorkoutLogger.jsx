import { useState, useEffect, useRef } from 'react';
import api from '../api/client';
import { useToast } from '../context/ToastContext';
import NumberInput from '../components/NumberInput';
import WorkoutTimer from '../components/WorkoutTimer';
import ExerciseSubstitutes from '../components/ExerciseSubstitutes';
import EXERCISE_LIBRARY from '../data/exerciseLibrary';

const TYPES = ['Push', 'Pull', 'Legs', 'Cardio', 'Full Body', 'Upper', 'Lower'];

function FeelDots({ value, onChange, label }) {
  return (
    <div className="feel-item">
      <span className="feel-label">{label}</span>
      <div className="feel-dots">
        {[1, 2, 3, 4, 5].map(n => (
          <button key={n} type="button" className={`feel-dot ${value === n ? 'selected' : ''}`} onClick={() => onChange(n)}>
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Exercise Info Modal ────────────────────────────────────────────────────────

function ExerciseInfoModal({ exercise, onClose }) {
  if (!exercise) return null;

  const searchUrl = `https://musclewiki.com/?q=${encodeURIComponent(exercise.name)}`;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 600,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem',
    }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 18,
        padding: '1.75rem',
        width: '100%',
        maxWidth: 520,
        position: 'relative',
        animation: 'fadeUp 0.2s ease both',
        maxHeight: '85vh',
        overflowY: 'auto',
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: '1rem', right: '1rem',
            background: 'var(--bg-elevated)', border: '1px solid var(--border)',
            color: 'var(--text-muted)', borderRadius: 8, width: 32, height: 32,
            cursor: 'pointer', fontSize: '1rem', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
          }}
        >✕</button>

        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.25rem', paddingRight: '2.5rem' }}>
          {exercise.name}
        </h2>

        {/* Muscle tags */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          {exercise.primary && (
            <span style={{
              padding: '0.2rem 0.55rem', borderRadius: 6,
              background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)',
              color: '#a5b4fc', fontSize: '0.72rem', fontWeight: 700,
            }}>
              Primary: {exercise.primary}
            </span>
          )}
          {exercise.secondary && (
            <span style={{
              padding: '0.2rem 0.55rem', borderRadius: 6,
              background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.25)',
              color: '#fdba74', fontSize: '0.72rem', fontWeight: 600,
            }}>
              Secondary: {exercise.secondary}
            </span>
          )}
        </div>

        {/* How to perform */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            How to Perform
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text)', lineHeight: 1.7 }}>
            {exercise.desc}
          </p>
        </div>

        {/* Visual guide link */}
        <a
          href={searchUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
            padding: '0.75rem 1rem',
            background: 'rgba(99,102,241,0.08)',
            border: '1px solid rgba(99,102,241,0.25)',
            borderRadius: 12,
            color: '#a5b4fc',
            textDecoration: 'none',
            fontSize: '0.875rem',
            fontWeight: 600,
            marginBottom: '1rem',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.15)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(99,102,241,0.08)'}
        >
          🎬 View Visual Demo on MuscleWiki →
        </a>

        <button className="btn btn-secondary" style={{ width: '100%' }} onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}

// ── Exercise Library Dropdown ──────────────────────────────────────────────────

function ExerciseLibraryDropdown({ type, searchText, onPick, onShowInfo }) {
  const [activeMuscle, setActiveMuscle] = useState(null);

  const typeData = EXERCISE_LIBRARY[type] || {};
  const muscleGroups = Object.keys(typeData);

  // Flatten all exercises for search filtering
  const allExercises = muscleGroups.flatMap(group =>
    typeData[group].map(ex => ({ ...ex, group }))
  );

  // If user has typed something, filter across all groups
  const isSearching = searchText.length > 0;
  const filtered = isSearching
    ? allExercises.filter(ex =>
        ex.name.toLowerCase().includes(searchText.toLowerCase()) ||
        (ex.primary && ex.primary.toLowerCase().includes(searchText.toLowerCase()))
      )
    : [];

  // Group display: show muscle group tabs when not searching
  const displayGroup = activeMuscle || muscleGroups[0];
  const groupExercises = typeData[displayGroup] || [];

  return (
    <div style={{
      position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
      background: 'var(--bg-card)', border: '1.5px solid var(--border)',
      borderRadius: 14, boxShadow: '0 8px 28px rgba(0,0,0,0.3)',
      maxHeight: 380, overflowY: 'auto', marginTop: 4,
    }}>
      {isSearching ? (
        /* ── Search results ── */
        <>
          <div style={{ padding: '0.5rem 0.85rem', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>
            {filtered.length} result{filtered.length !== 1 ? 's' : ''} for "{searchText}"
          </div>
          {filtered.length === 0 ? (
            <div style={{ padding: '1.25rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No exercises found. Type a name or try a different workout type.
            </div>
          ) : (
            filtered.map(ex => (
              <ExerciseDropdownItem key={`${ex.group}-${ex.name}`} exercise={ex} onPick={onPick} onInfo={onShowInfo} />
            ))
          )}
        </>
      ) : (
        /* ── Browse by muscle group ── */
        <>
          {/* Muscle group tabs */}
          <div style={{
            display: 'flex', gap: '0.35rem', padding: '0.6rem 0.75rem',
            borderBottom: '1px solid var(--border)', flexWrap: 'wrap',
            position: 'sticky', top: 0, background: 'var(--bg-card)', zIndex: 2,
          }}>
            {muscleGroups.map(group => (
              <button
                key={group}
                onMouseDown={e => { e.preventDefault(); setActiveMuscle(group); }}
                style={{
                  padding: '0.25rem 0.6rem', borderRadius: 6,
                  border: `1.5px solid ${displayGroup === group ? 'rgba(99,102,241,0.4)' : 'var(--border)'}`,
                  background: displayGroup === group ? 'rgba(99,102,241,0.1)' : 'var(--bg-elevated)',
                  color: displayGroup === group ? '#a5b4fc' : 'var(--text-muted)',
                  cursor: 'pointer', fontFamily: 'inherit',
                  fontSize: '0.72rem', fontWeight: 700,
                  transition: 'all 0.12s',
                }}
              >
                {group}
              </button>
            ))}
          </div>

          {/* Exercises in selected group */}
          <div style={{ padding: '0.25rem 0' }}>
            {groupExercises.map(ex => (
              <ExerciseDropdownItem key={ex.name} exercise={ex} onPick={onPick} onInfo={onShowInfo} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function ExerciseDropdownItem({ exercise, onPick, onInfo }) {
  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        padding: '0.55rem 0.85rem',
        borderBottom: '1px solid var(--border)',
        transition: 'background 0.1s',
        cursor: 'pointer',
      }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
      onMouseLeave={e => e.currentTarget.style.background = 'none'}
    >
      {/* Main clickable area — picks the exercise */}
      <div
        style={{ flex: 1, minWidth: 0 }}
        onMouseDown={() => onPick(exercise.name)}
      >
        <div style={{ fontWeight: 500, fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {exercise.name}
        </div>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
          {exercise.primary}{exercise.secondary ? ` · ${exercise.secondary}` : ''}
        </div>
      </div>

      {/* Info button */}
      <button
        onMouseDown={e => { e.preventDefault(); e.stopPropagation(); onInfo(exercise); }}
        style={{
          background: 'none', border: '1px solid var(--border)',
          borderRadius: 6, width: 28, height: 28, flexShrink: 0,
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.75rem', color: 'var(--text-muted)',
          transition: 'all 0.12s',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)'; e.currentTarget.style.color = '#a5b4fc'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
        title="How to perform this exercise"
      >
        ℹ️
      </button>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function WorkoutLogger() {
  const { addToast } = useToast();
  const [type, setType]           = useState('Push');
  const [name, setName]           = useState('');
  const [exercises, setEx]        = useState([]);
  const [exForm, setExForm]       = useState({ name: '', sets: 3, reps: '', weight: '' });
  const [workouts, setWorkouts]   = useState([]);
  const [templates, setTemplates] = useState([]);
  const [saving, setSaving]       = useState(false);
  const [activePanel, setActivePanel] = useState(null);
  const [feel, setFeel]           = useState({ sleep_hours: 7, sleep_quality: 3, energy_level: 3, soreness_level: 2, notes: '' });
  const [sessionDuration, setSessionDuration] = useState(0);
  const [exInputFocused, setExInputFocused] = useState(false);
  const [infoExercise, setInfoExercise] = useState(null); // for the info modal
  const exInputRef = useRef(null);

  useEffect(() => { loadWorkouts(); loadTemplates(); }, []);

  const loadWorkouts  = async () => { try { setWorkouts((await api.get('/workouts')).data); } catch {} };
  const loadTemplates = async () => { try { setTemplates((await api.get('/templates')).data); } catch {} };

  const togglePanel = (panel) => setActivePanel(p => p === panel ? null : panel);

  const addExercise = () => {
    if (!exForm.name.trim()) return;
    setEx(prev => [...prev, { ...exForm, _id: Date.now() }]);
    setExForm(f => ({ ...f, name: '', reps: '', weight: '' }));
    setExInputFocused(false);
    if (window.__fittrack_startRest) window.__fittrack_startRest();
  };

  const pickExercise = (exName) => {
    setExForm(f => ({ ...f, name: exName }));
    setExInputFocused(false);
    exInputRef.current?.focus();
  };

  const saveWorkout = async () => {
    if (!name.trim() && !exercises.length) return;
    setSaving(true);
    try {
      const w = await api.post('/workouts', {
        type,
        name: name.trim() || `${type} Day`,
        duration_seconds: sessionDuration,
        exercises: exercises.map(e => ({
          name: e.name,
          sets: parseInt(e.sets) || 1,
          reps: parseInt(e.reps) || null,
          weight: parseFloat(e.weight) || null,
        }))
      });

      if (activePanel === 'feel' && feel.sleep_quality) {
        await api.post(`/workouts/${w.data.id}/feeling`, feel).catch(() => {});
      }

      addToast(`Workout saved! ${exercises.length} exercises logged 💪`, 'success');
      setName(''); setEx([]); setActivePanel(null); setSessionDuration(0);
      loadWorkouts();
    } catch {
      addToast('Failed to save workout', 'error');
    }
    setSaving(false);
  };

  const useTemplate = async (t) => {
    try {
      await api.post(`/templates/${t.id}/use`);
      addToast(`Started "${t.name}" from template!`, 'success');
      setName(t.name);
      setType(t.type);
      setEx(t.exercises.map((ex, i) => ({ ...ex, _id: Date.now() + i })));
      setActivePanel(null);
    } catch { addToast('Could not load template', 'error'); }
  };

  const today = new Date().toISOString().split('T')[0];
  const todayWorkouts = workouts.filter(w => w.date === today);
  const pastWorkouts  = workouts.filter(w => w.date !== today);

  const showLibrary = exInputFocused;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Workout Logger</h1>
        <p>Track your sets, reps, and weights</p>
      </div>

      <div className="grid-2 stack" style={{ alignItems: 'start' }}>
        {/* ── Form ── */}
        <div>
          {/* Panel tabs — mutually exclusive */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.85rem', flexWrap: 'wrap' }}>
            <button
              className={`btn btn-sm ${activePanel === 'timer' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => togglePanel('timer')}
            >⏱ Timer</button>
            <button
              className={`btn btn-sm ${activePanel === 'templates' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => togglePanel('templates')}
            >📋 Templates</button>
            <button
              className={`btn btn-sm ${activePanel === 'feel' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => togglePanel('feel')}
            >🧠 How do you feel?</button>
          </div>

          {activePanel === 'timer' && (
            <WorkoutTimer onSessionEnd={s => setSessionDuration(s)} />
          )}

          {activePanel === 'templates' && (
            <div className="card" style={{ marginBottom: '1rem' }}>
              <div className="section-title">Your Templates</div>
              {templates.length === 0
                ? <div className="empty" style={{ padding: '1rem' }}>No templates yet — save a workout as a template below</div>
                : <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {templates.map(t => (
                      <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.75rem', background: 'var(--bg-elevated)', borderRadius: 9, border: '1px solid var(--border)' }}>
                        <div>
                          <span className={`badge badge-${t.type.toLowerCase().replace(' ', '-')}`} style={{ marginRight: '0.4rem' }}>{t.type}</span>
                          <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>{t.name}</span>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>{t.exercises?.length ?? 0} exercises</div>
                        </div>
                        <button className="btn btn-primary btn-sm" onClick={() => useTemplate(t)}>Use</button>
                      </div>
                    ))}
                  </div>
              }
            </div>
          )}

          {activePanel === 'feel' && (
            <div className="card" style={{ marginBottom: '1rem' }}>
              <div className="section-title">Today's Feel Check</div>
              <div className="feel-row">
                <FeelDots label="Sleep 😴" value={feel.sleep_quality} onChange={v => setFeel(f => ({ ...f, sleep_quality: v }))} />
                <FeelDots label="Energy ⚡" value={feel.energy_level} onChange={v => setFeel(f => ({ ...f, energy_level: v }))} />
                <FeelDots label="Soreness 🤕" value={feel.soreness_level} onChange={v => setFeel(f => ({ ...f, soreness_level: v }))} />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.5rem' }}>
                <label className="form-label" style={{ marginBottom: 0, whiteSpace: 'nowrap' }}>Sleep hrs</label>
                <NumberInput value={feel.sleep_hours} onChange={v => setFeel(f => ({ ...f, sleep_hours: v }))} min={0} max={24} step={0.5} unit="h" />
              </div>
              <div className="form-group" style={{ marginTop: '0.75rem', marginBottom: 0 }}>
                <label className="form-label">Notes</label>
                <input className="form-input" placeholder="How are you feeling today?" value={feel.notes} onChange={e => setFeel(f => ({ ...f, notes: e.target.value }))} />
              </div>
            </div>
          )}

          {/* Workout type + name */}
          <div className="card" style={{ marginBottom: '1rem' }}>
            <div className="section-title">Workout Type</div>
            <div className="type-selector">
              {TYPES.map(t => (
                <button key={t} className={`type-btn ${type === t ? 'selected' : ''}`} onClick={() => setType(t)}>{t}</button>
              ))}
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Session Name</label>
              <input className="form-input" placeholder="e.g. Chest & Triceps" value={name} onChange={e => setName(e.target.value)} />
            </div>
          </div>

          {/* Add exercise */}
          <div className="card" style={{ marginBottom: '1rem' }}>
            <div className="section-title">Add Exercise</div>
            <div className="form-group" style={{ position: 'relative' }}>
              <label className="form-label">
                Exercise Name
                <span style={{ fontWeight: 400, color: 'var(--text-muted)', marginLeft: '0.4rem', fontSize: '0.75rem' }}>
                  — tap to browse {type} exercises by muscle group
                </span>
              </label>
              <input
                ref={exInputRef}
                className="form-input"
                placeholder={`Search or pick a ${type} exercise…`}
                value={exForm.name}
                onChange={e => setExForm(f => ({ ...f, name: e.target.value }))}
                onFocus={() => setExInputFocused(true)}
                onBlur={() => setTimeout(() => setExInputFocused(false), 200)}
                onKeyDown={e => e.key === 'Enter' && addExercise()}
              />

              {/* Full exercise library dropdown with muscle group tabs */}
              {showLibrary && (
                <ExerciseLibraryDropdown
                  type={type}
                  searchText={exForm.name}
                  onPick={pickExercise}
                  onShowInfo={setInfoExercise}
                />
              )}

              {/* Substitutes (shown when typing 3+ chars and dropdown is closed) */}
              {!exInputFocused && exForm.name.length > 2 && (
                <div style={{ marginTop: '0.4rem' }}>
                  <ExerciseSubstitutes
                    exerciseName={exForm.name}
                    compact
                    onSelect={n => setExForm(f => ({ ...f, name: n }))}
                  />
                </div>
              )}
            </div>
            <div className="form-row-3">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Sets</label>
                <NumberInput value={exForm.sets} onChange={v => setExForm(f => ({ ...f, sets: v }))} min={1} max={20} step={1} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Reps</label>
                <NumberInput value={exForm.reps} onChange={v => setExForm(f => ({ ...f, reps: v }))} min={1} max={100} step={1} placeholder="—" />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Weight</label>
                <NumberInput value={exForm.weight} onChange={v => setExForm(f => ({ ...f, weight: v }))} min={0} max={2000} step={2.5} unit="lbs" placeholder="0" />
              </div>
            </div>
            <button className="btn btn-secondary" style={{ width: '100%', marginTop: '0.75rem' }} onClick={addExercise}>+ Add Exercise</button>
          </div>

          {/* Queue */}
          {exercises.length > 0 && (
            <div className="card" style={{ marginBottom: '1rem' }}>
              <div className="section-title">Queued ({exercises.length})</div>
              <div className="exercise-list" style={{ marginTop: 0 }}>
                {exercises.map(ex => (
                  <div key={ex._id} className="exercise-item">
                    <div>
                      <div className="exercise-name">{ex.name}</div>
                      <div className="exercise-meta">
                        {ex.sets && <span>{ex.sets} sets</span>}
                        {ex.reps && <span>× {ex.reps} reps</span>}
                        {ex.weight > 0 && <span>@ {ex.weight} lbs</span>}
                      </div>
                    </div>
                    <button className="btn btn-danger btn-sm" onClick={() => setEx(prev => prev.filter(e => e._id !== ex._id))}>✕</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button className="btn btn-primary" style={{ width: '100%' }} onClick={saveWorkout}
            disabled={saving || (!name.trim() && !exercises.length)}>
            {saving ? 'Saving…' : `Save Workout${exercises.length ? ` (${exercises.length} exercises)` : ''}`}
          </button>
        </div>

        {/* ── History ── */}
        <div>
          {todayWorkouts.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <div className="section-title">Today</div>
              {todayWorkouts.map(w => <WorkoutCard key={w.id} workout={w} onDelete={() => api.delete(`/workouts/${w.id}`).then(loadWorkouts)} />)}
            </div>
          )}
          <div className="section-title">History</div>
          {pastWorkouts.length === 0
            ? <div className="empty"><div className="empty-icon">🏋️</div>No workouts logged yet</div>
            : pastWorkouts.slice(0, 15).map(w => <WorkoutCard key={w.id} workout={w} onDelete={() => api.delete(`/workouts/${w.id}`).then(loadWorkouts)} />)
          }
        </div>
      </div>

      {/* Exercise info modal */}
      <ExerciseInfoModal exercise={infoExercise} onClose={() => setInfoExercise(null)} />
    </div>
  );
}

function WorkoutCard({ workout, onDelete }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="card workout-card">
      <div className="workout-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem', flexWrap: 'wrap' }}>
            <span className={`badge badge-${workout.type.toLowerCase().replace(' ', '-')}`}>{workout.type}</span>
            <span className="workout-title">{workout.name}</span>
          </div>
          <div className="workout-date">
            {workout.date} · {workout.exercises?.length ?? 0} exercises
            {workout.duration_seconds > 0 && ` · ${Math.round(workout.duration_seconds / 60)}min`}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setOpen(v => !v)}>{open ? 'Hide' : 'Show'}</button>
          <button className="btn btn-danger btn-sm" onClick={onDelete}>✕</button>
        </div>
      </div>
      {open && workout.exercises?.length > 0 && (
        <div className="exercise-list">
          {workout.exercises.map((ex, i) => (
            <div key={i} className="exercise-item">
              <div className="exercise-name">{ex.name}</div>
              <div className="exercise-meta">
                {ex.sets && <span>{ex.sets}×</span>}
                {ex.reps && <span>{ex.reps} reps</span>}
                {ex.weight > 0 && <span>{ex.weight} lbs</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
