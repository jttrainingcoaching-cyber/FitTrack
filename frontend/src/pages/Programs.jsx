import { useState, useEffect } from 'react';
import api from '../api/client';
import { useToast } from '../context/ToastContext';

const GOAL_COLOR = {
  'Build Muscle': 'var(--indigo)',
  'Strength':     'var(--violet)',
  'Lose Weight':  'var(--orange)',
  'Endurance':    'var(--cyan)',
};
const DIFFICULTY_BADGE = {
  Beginner:     { bg: 'var(--green)',  label: 'Beginner' },
  Intermediate: { bg: 'var(--indigo)', label: 'Intermediate' },
  Advanced:     { bg: 'var(--red)',    label: 'Advanced' },
};

export default function Programs() {
  const { showToast } = useToast();
  const [programs, setPrograms]   = useState([]);
  const [active, setActive]       = useState(null);
  const [selected, setSelected]   = useState(null);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/programs').then(r => r.data),
      api.get('/programs/active/today').then(r => r.data).catch(() => null),
    ]).then(([progs, act]) => {
      setPrograms(progs);
      if (act?.active) setActive(act);
      setLoading(false);
    });
  }, []);

  const startProgram = async (id) => {
    try {
      await api.post(`/programs/${id}/start`);
      const act = await api.get('/programs/active/today').then(r => r.data);
      setActive(act);
      setSelected(null);
      showToast('Program started! 💪', 'success');
    } catch {
      showToast('Failed to start program', 'error');
    }
  };

  const quitProgram = async () => {
    if (!confirm('Quit your current program? Progress will be lost.')) return;
    await api.delete('/programs/active');
    setActive(null);
    showToast('Program stopped', 'info');
  };

  const advanceDay = async () => {
    try {
      const res = await api.post('/programs/active/advance').then(r => r.data);
      if (res.complete) {
        showToast('🎉 Program complete! Incredible work!', 'success');
        setActive(null);
      } else {
        const act = await api.get('/programs/active/today').then(r => r.data);
        setActive(act);
        showToast('Day logged! Keep it up 🔥', 'success');
      }
    } catch {
      showToast('Error advancing day', 'error');
    }
  };

  if (loading) return <div className="loading">Loading programs…</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Training Programs</h1>
        <p className="page-sub">Expert-designed programs. Follow the plan, trust the process.</p>
      </div>

      {/* Active program banner */}
      {active && active.today && (
        <div className="card active-program-card">
          <div className="active-prog-header">
            <div>
              <div className="active-prog-label">ACTIVE PROGRAM</div>
              <div className="active-prog-name">{active.program.name}</div>
              <div className="active-prog-meta">
                Week {active.userProgram.current_week} of {active.program.duration_weeks} ·
                Day {active.userProgram.current_day}
              </div>
            </div>
            <div className="active-prog-pct">{active.progressPercent}%</div>
          </div>

          <div className="prog-progress-bar">
            <div className="prog-progress-fill" style={{ width: `${active.progressPercent}%` }} />
          </div>

          {active.today.type === 'Rest' ? (
            <div className="rest-day-box">
              <span className="rest-emoji">😴</span>
              <div>
                <strong>Rest Day</strong>
                <p>Recovery is part of the process. Eat well, sleep well.</p>
              </div>
            </div>
          ) : (
            <div className="today-workout">
              <div className="today-workout-title">Today: {active.today.name}</div>
              <div className="today-exercises">
                {active.today.exercises.map((ex, i) => (
                  <div key={i} className="today-exercise-row">
                    <span className="today-ex-name">{ex.exercise_name}</span>
                    <span className="today-ex-detail">{ex.sets} × {ex.reps}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="active-prog-actions">
            <button className="btn btn-primary" onClick={advanceDay}>
              {active.today.type === 'Rest' ? '✓ Log Rest Day' : '✓ Mark Day Complete'}
            </button>
            <button className="btn btn-ghost" onClick={quitProgram}>Quit Program</button>
          </div>
        </div>
      )}

      {/* Program browser */}
      <div className="section-title" style={{ marginTop: '1.5rem' }}>
        {active ? 'Browse Other Programs' : 'Choose Your Program'}
      </div>

      <div className="programs-grid">
        {programs.map(prog => (
          <div
            key={prog.id}
            className="program-card"
            onClick={() => setSelected(selected?.id === prog.id ? null : prog)}
          >
            <div className="prog-card-top">
              <div className="prog-card-info">
                <div className="prog-card-name">{prog.name}</div>
                <div className="prog-card-meta">
                  {prog.days_per_week} days/week · {prog.duration_weeks} weeks
                </div>
              </div>
              <div
                className="prog-difficulty-badge"
                style={{ background: DIFFICULTY_BADGE[prog.difficulty]?.bg || 'var(--indigo)' }}
              >
                {prog.difficulty}
              </div>
            </div>

            <p className="prog-card-desc">{prog.description}</p>

            <div className="prog-card-footer">
              <span
                className="prog-goal-tag"
                style={{ color: GOAL_COLOR[prog.goal] || 'var(--indigo)' }}
              >
                {prog.goal}
              </span>
              <span className="prog-expand">{selected?.id === prog.id ? '▲ Hide' : '▼ Preview'}</span>
            </div>

            {/* Expanded preview */}
            {selected?.id === prog.id && (
              <div className="prog-preview" onClick={e => e.stopPropagation()}>
                <div className="prog-preview-title">Week 1 Schedule</div>
                {prog.schedule?.map((day, i) => (
                  day.type !== 'Rest' && (
                    <div key={i} className="prog-preview-day">
                      <div className="prog-preview-day-name">Day {day.day}: {day.name}</div>
                      {day.exercises.map((ex, j) => (
                        <div key={j} className="prog-preview-ex">
                          {ex.exercise_name} — {ex.sets}×{ex.reps}
                        </div>
                      ))}
                    </div>
                  )
                ))}
                <button
                  className="btn btn-primary"
                  style={{ width: '100%', marginTop: '1rem' }}
                  onClick={() => startProgram(prog.id)}
                >
                  {active?.program?.id === prog.id ? '↺ Restart Program' : 'Start This Program'}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
