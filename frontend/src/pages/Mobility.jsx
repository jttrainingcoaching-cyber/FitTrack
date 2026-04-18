import { useState, useEffect } from 'react';

// ── Built-in exercise library ─────────────────────────────────────────────────

const SECTIONS = [
  {
    id: 'warmup',
    title: 'Dynamic Warmup',
    subtitle: 'Before your workout',
    icon: '🌅',
    accentColor: '#f97316',
    accentBg: 'rgba(249,115,22,0.08)',
    accentBorder: 'rgba(249,115,22,0.2)',
    description: 'Dynamic movements to activate muscles, increase blood flow, and prime your nervous system before training.',
    tip: 'Do 1–2 rounds of all exercises before your main workout. Total time: ~10 minutes.',
    exercises: [
      { name: 'Leg Swings',              detail: '10 reps/side',   muscle: 'Hips',         description: 'Stand holding a wall. Swing leg forward and back in a controlled arc. Gradually increase range.' },
      { name: 'Arm Circles',             detail: '10 reps/dir',    muscle: 'Shoulders',    description: 'Small to large circles in both directions. Opens up the shoulder joint before upper body work.' },
      { name: 'Hip Circles',             detail: '10 reps/side',   muscle: 'Hips',         description: 'Hands on hips, make large circles with your hips. Great for loosening the hip complex.' },
      { name: 'High Knees (in place)',   detail: '30 seconds',     muscle: 'Full Body',    description: 'Drive knees up to hip height. Pump arms. Gets heart rate up and activates hip flexors.' },
      { name: 'Inchworm',                detail: '8 reps',         muscle: 'Core',         description: 'Hinge at hips, walk hands out to plank, do one push-up, walk back. Full-body activation.' },
      { name: 'World\'s Greatest Stretch', detail: '5 reps/side', muscle: 'Full Body',    description: 'Lunge forward, place hand inside foot, reach opposite arm to sky. Best single warmup move.' },
      { name: 'Squat to Stand',          detail: '8 reps',         muscle: 'Legs',         description: 'Grab toes in bottom squat, straighten legs while holding toes, lower back down.' },
      { name: 'Thoracic Rotations',      detail: '10/side',        muscle: 'Upper Back',   description: 'In quadruped, place hand behind head and rotate elbow toward sky. Opens thoracic spine.' },
      { name: 'Hip 90/90 Rotations',     detail: '8 reps/side',   muscle: 'Hips',         description: 'Sit in 90/90 hip position, rotate to face each leg. Warms up internal and external rotation.' },
      { name: 'Scapular Push-ups',       detail: '10 reps',        muscle: 'Shoulders',   description: 'In plank, push shoulder blades apart and together. Activates serratus anterior.' },
      { name: 'Ankle Rotations',         detail: '10/dir/side',    muscle: 'Ankles',       description: 'Rotate each ankle through full range of motion. Essential before squats and running.' },
      { name: 'Cat-Cow',                 detail: '10 breaths',     muscle: 'Back',         description: 'Alternate between arching and rounding the back. Lubricates spinal joints, eases morning stiffness.' },
    ]
  },
  {
    id: 'stretch',
    title: 'Post-Workout Stretch',
    subtitle: 'After your workout',
    icon: '🧘',
    accentColor: '#6366f1',
    accentBg: 'rgba(99,102,241,0.08)',
    accentBorder: 'rgba(99,102,241,0.2)',
    description: 'Static stretches to lengthen worked muscles, improve flexibility, and begin the recovery process. Hold each for 30–60 seconds.',
    tip: 'Hold each stretch for at least 30 seconds without bouncing. Breathe deeply and relax into each stretch.',
    exercises: [
      { name: 'Standing Quad Stretch',    detail: '45s/side',   muscle: 'Legs',          description: 'Stand on one leg, pull heel to glute. Keep knees together. Use a wall for balance.' },
      { name: 'Lying Hamstring Stretch',  detail: '45s/side',   muscle: 'Legs',          description: 'Lie on back, pull one leg straight up. Keep the other leg flat. Use a strap if needed.' },
      { name: 'Pigeon Pose',              detail: '60s/side',   muscle: 'Hips',          description: 'From plank, bring one knee to wrist. Fold forward over the bent leg for a deep hip opener.' },
      { name: 'Doorway Chest Stretch',    detail: '45s',        muscle: 'Shoulders',     description: 'Stand in doorway, arms at 90°, lean forward gently. Opens anterior shoulder and pecs.' },
      { name: 'Child\'s Pose',            detail: '60s',        muscle: 'Back',          description: 'Kneel, sit back on heels, extend arms forward. Deep lower back and lat stretch.' },
      { name: 'Cross-Body Shoulder',      detail: '45s/side',   muscle: 'Shoulders',     description: 'Pull one arm across chest with the other arm. Feel the stretch in the back of the shoulder.' },
      { name: 'Seated Spinal Twist',      detail: '45s/side',   muscle: 'Back',          description: 'Sit, cross one leg over, rotate torso toward bent knee. Decompresses the spine.' },
      { name: 'Calf Stretch',             detail: '45s/side',   muscle: 'Ankles',        description: 'Hands on wall, step one foot back, press heel into floor. Essential after leg or cardio days.' },
      { name: 'Couch Stretch',            detail: '60s/side',   muscle: 'Hips',          description: 'Knee on floor, foot up on couch/wall behind. Deep hip flexor and quad stretch.' },
      { name: 'Lat Stretch',              detail: '45s/side',   muscle: 'Upper Back',    description: 'Hold a support, lean away with arm extended. Stretches the latissimus dorsi deeply.' },
      { name: 'Neck Side Stretch',        detail: '30s/side',   muscle: 'Shoulders',     description: 'Tilt head toward shoulder, use light hand pressure. Releases upper trap tension.' },
    ]
  },
  {
    id: 'recovery',
    title: 'Recovery',
    subtitle: 'Rest day restoration',
    icon: '💆',
    accentColor: '#06b6d4',
    accentBg: 'rgba(6,182,212,0.08)',
    accentBorder: 'rgba(6,182,212,0.2)',
    description: 'Gentle movement and self-care techniques for active rest days. These reduce soreness, maintain range of motion, and accelerate recovery.',
    tip: 'Recovery days are just as important as training days. Prioritize sleep and these techniques for best results.',
    exercises: [
      { name: 'Foam Roll — Quads',        detail: '60s/side',   muscle: 'Legs',          description: 'Roll slowly from hip to knee. Pause on tender spots for 5–10 seconds. Reduces DOMS.' },
      { name: 'Foam Roll — IT Band',      detail: '60s/side',   muscle: 'Legs',          description: 'Side-lying, roll from hip to knee. Common tightness area for runners and lifters.' },
      { name: 'Foam Roll — Upper Back',   detail: '60s',        muscle: 'Upper Back',    description: 'Lay over foam roller at mid-back. Extend arms overhead to open thoracic spine.' },
      { name: 'Foam Roll — Glutes',       detail: '60s/side',   muscle: 'Hips',          description: 'Sit on roller, cross one ankle over knee. Roll around to find tight spots in glute.' },
      { name: 'Supine Hip Twist',         detail: '60s/side',   muscle: 'Back',          description: 'Lie on back, pull one knee to chest then let it fall across body. Gentle spinal rotation.' },
      { name: '90/90 Hip Stretch',        detail: '60s/side',   muscle: 'Hips',          description: 'Sit with both legs at 90° angles. Hinge forward over front leg. Best hip mobility drill.' },
      { name: 'Cat-Cow',                  detail: '10 breaths', muscle: 'Back',          description: 'Alternate between arching and rounding the back. Lubricates spinal joints, eases stiffness.' },
      { name: 'Diaphragmatic Breathing',  detail: '5 min',      muscle: 'Full Body',     description: 'Lie flat, breathe into belly not chest. 4s inhale, 4s hold, 6s exhale. Activates recovery mode.' },
      { name: 'Legs Up The Wall',         detail: '5–10 min',   muscle: 'Full Body',     description: 'Lie on back, legs resting against wall at 90°. Promotes lymphatic drainage and relaxation.' },
      { name: 'Lacrosse Ball — Foot',     detail: '60s/foot',   muscle: 'Ankles',        description: 'Stand on a lacrosse ball and roll through the arch of the foot. Releases plantar fascia.' },
    ]
  }
];

// All unique muscle groups across all sections
const ALL_MUSCLES = ['All', 'Hips', 'Legs', 'Shoulders', 'Upper Back', 'Back', 'Core', 'Full Body', 'Ankles'];

const CUSTOM_KEY = 'fittrack_mobility_custom';

function loadCustom() {
  try {
    const saved = localStorage.getItem(CUSTOM_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch { return {}; }
}

function saveCustom(data) {
  localStorage.setItem(CUSTOM_KEY, JSON.stringify(data));
}

// ── Exercise Card ─────────────────────────────────────────────────────────────

function ExerciseCard({ exercise, accentColor, accentBg, accentBorder, onDelete }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      style={{
        padding: '0.85rem 1rem',
        background: 'var(--bg-elevated)',
        border: `1px solid ${expanded ? accentBorder : 'var(--border)'}`,
        borderRadius: 12,
        cursor: 'pointer',
        transition: 'all 0.15s',
      }}
      onClick={() => setExpanded(v => !v)}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{exercise.name}</span>
            <span style={{
              padding: '0.15rem 0.5rem', borderRadius: 6,
              background: accentBg, color: accentColor,
              fontSize: '0.7rem', fontWeight: 700,
              border: `1px solid ${accentBorder}`,
            }}>
              {exercise.muscle}
            </span>
            {exercise.custom && (
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>custom</span>
            )}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
            {exercise.detail}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
          {onDelete && (
            <button
              onClick={e => { e.stopPropagation(); onDelete(); }}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.85rem', padding: '0.2rem 0.4rem', borderRadius: 6 }}
              title="Delete custom exercise"
            >✕</button>
          )}
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            {expanded ? '▲' : '▼'}
          </span>
        </div>
      </div>
      {expanded && (
        <div style={{
          marginTop: '0.65rem', paddingTop: '0.65rem',
          borderTop: `1px solid ${accentBorder}`,
          fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.6,
        }}>
          {exercise.description}
        </div>
      )}
    </div>
  );
}

// ── Add Custom Exercise Form ──────────────────────────────────────────────────

function AddExerciseForm({ sectionId, accentColor, accentBg, accentBorder, onAdd, onClose }) {
  const [form, setForm] = useState({ name: '', detail: '', muscle: 'Full Body', description: '' });
  const muscles = ALL_MUSCLES.filter(m => m !== 'All');

  const handleSave = () => {
    if (!form.name.trim()) return;
    onAdd({ ...form, name: form.name.trim(), description: form.description.trim() || 'Custom exercise.', custom: true });
    onClose();
  };

  return (
    <div style={{
      padding: '1.25rem', background: accentBg,
      border: `1.5px solid ${accentBorder}`, borderRadius: 14,
      marginBottom: '1rem',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: accentColor }}>➕ Add Custom Exercise</div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1rem' }}>✕</button>
      </div>

      <div className="form-group">
        <label className="form-label">Exercise Name *</label>
        <input className="form-input" placeholder="e.g. Frog Stretch" value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Duration / Detail</label>
          <input className="form-input" placeholder="e.g. 60s/side" value={form.detail}
            onChange={e => setForm(f => ({ ...f, detail: e.target.value }))} />
        </div>
        <div className="form-group">
          <label className="form-label">Muscle Group</label>
          <select className="form-input" value={form.muscle}
            onChange={e => setForm(f => ({ ...f, muscle: e.target.value }))}
            style={{ cursor: 'pointer' }}>
            {muscles.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
      </div>

      <div className="form-group" style={{ marginBottom: '1rem' }}>
        <label className="form-label">How to do it (optional)</label>
        <input className="form-input" placeholder="Brief description of how to perform this exercise"
          value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
      </div>

      <button
        className="btn btn-primary"
        style={{ width: '100%', background: accentColor, border: 'none' }}
        onClick={handleSave}
        disabled={!form.name.trim()}
      >
        Save Exercise
      </button>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function Mobility() {
  const [activeSection, setActiveSection] = useState('warmup');
  const [muscleFilter, setMuscleFilter]   = useState('All');
  const [showAddForm, setShowAddForm]     = useState(false);
  const [customExercises, setCustomExercises] = useState(loadCustom);

  const section = SECTIONS.find(s => s.id === activeSection);

  // Get muscle groups present in this section
  const sectionMuscles = ['All', ...new Set([
    ...section.exercises.map(e => e.muscle),
    ...(customExercises[activeSection] || []).map(e => e.muscle),
  ])];

  const handleAddCustom = (exercise) => {
    const updated = {
      ...customExercises,
      [activeSection]: [...(customExercises[activeSection] || []), exercise],
    };
    setCustomExercises(updated);
    saveCustom(updated);
  };

  const handleDeleteCustom = (sectionId, index) => {
    const updated = {
      ...customExercises,
      [sectionId]: customExercises[sectionId].filter((_, i) => i !== index),
    };
    setCustomExercises(updated);
    saveCustom(updated);
  };

  const allExercises = [
    ...section.exercises,
    ...(customExercises[activeSection] || []),
  ];

  const filtered = muscleFilter === 'All'
    ? allExercises
    : allExercises.filter(ex => ex.muscle === muscleFilter);

  return (
    <div className="page">
      <div className="page-header">
        <h1>Warmup & Mobility</h1>
        <p>Dynamic warmups, post-workout stretches, and recovery techniques</p>
      </div>

      {/* Section tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {SECTIONS.map(s => (
          <button
            key={s.id}
            onClick={() => { setActiveSection(s.id); setMuscleFilter('All'); setShowAddForm(false); }}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: 10,
              border: `1.5px solid ${activeSection === s.id ? s.accentBorder : 'var(--border)'}`,
              background: activeSection === s.id ? s.accentBg : 'var(--bg-elevated)',
              color: activeSection === s.id ? s.accentColor : 'var(--text-muted)',
              cursor: 'pointer', fontFamily: 'inherit',
              fontSize: '0.875rem', fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              transition: 'all 0.15s', minHeight: 44,
            }}
          >
            <span>{s.icon}</span>
            {s.title}
          </button>
        ))}
      </div>

      {section && (
        <div>
          {/* Section header */}
          <div className="card" style={{ marginBottom: '1.25rem', borderColor: section.accentBorder }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '0.75rem' }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12, flexShrink: 0,
                background: section.accentBg, border: `1.5px solid ${section.accentBorder}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.5rem',
              }}>
                {section.icon}
              </div>
              <div>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{section.title}</h2>
                <div style={{ fontSize: '0.78rem', color: section.accentColor, fontWeight: 600 }}>{section.subtitle}</div>
              </div>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              {section.description}
            </p>
          </div>

          {/* Body Part / Muscle Group filter row */}
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginRight: '0.25rem' }}>
              Filter:
            </span>
            {sectionMuscles.map(muscle => (
              <button
                key={muscle}
                onClick={() => setMuscleFilter(muscle)}
                style={{
                  padding: '0.3rem 0.7rem',
                  borderRadius: 999,
                  border: `1.5px solid ${muscleFilter === muscle ? section.accentBorder : 'var(--border)'}`,
                  background: muscleFilter === muscle ? section.accentBg : 'var(--bg-elevated)',
                  color: muscleFilter === muscle ? section.accentColor : 'var(--text-muted)',
                  cursor: 'pointer', fontFamily: 'inherit',
                  fontSize: '0.78rem', fontWeight: 600,
                  transition: 'all 0.15s',
                }}
              >
                {muscle}
              </button>
            ))}
            <button
              onClick={() => setShowAddForm(v => !v)}
              style={{
                marginLeft: 'auto',
                padding: '0.3rem 0.7rem',
                borderRadius: 999,
                border: `1.5px solid ${showAddForm ? section.accentBorder : 'var(--border)'}`,
                background: showAddForm ? section.accentBg : 'var(--bg-elevated)',
                color: showAddForm ? section.accentColor : 'var(--text-muted)',
                cursor: 'pointer', fontFamily: 'inherit',
                fontSize: '0.78rem', fontWeight: 600,
                transition: 'all 0.15s',
              }}
            >
              {showAddForm ? '✕ Cancel' : '➕ Add Custom'}
            </button>
          </div>

          {/* Custom exercise form */}
          {showAddForm && (
            <AddExerciseForm
              sectionId={activeSection}
              accentColor={section.accentColor}
              accentBg={section.accentBg}
              accentBorder={section.accentBorder}
              onAdd={handleAddCustom}
              onClose={() => setShowAddForm(false)}
            />
          )}

          {/* Exercise count */}
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            {filtered.length} exercise{filtered.length !== 1 ? 's' : ''}
            {muscleFilter !== 'All' && ` · ${muscleFilter}`}
            {(customExercises[activeSection]?.length ?? 0) > 0 && ` · includes ${customExercises[activeSection].length} custom`}
          </div>

          {/* Exercise list */}
          {filtered.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              No exercises for "{muscleFilter}" in this section. Add a custom one above!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {filtered.map((ex, i) => {
                const globalIndex = allExercises.indexOf(ex);
                const builtInCount = section.exercises.length;
                const isCustom = globalIndex >= builtInCount;
                const customIdx = isCustom ? globalIndex - builtInCount : -1;

                return (
                  <ExerciseCard
                    key={`${ex.name}-${i}`}
                    exercise={ex}
                    accentColor={section.accentColor}
                    accentBg={section.accentBg}
                    accentBorder={section.accentBorder}
                    onDelete={isCustom ? () => handleDeleteCustom(activeSection, customIdx) : null}
                  />
                );
              })}
            </div>
          )}

          <div style={{ marginTop: '1.25rem', padding: '0.75rem 1rem', background: section.accentBg, border: `1px solid ${section.accentBorder}`, borderRadius: 10 }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>
              <span style={{ fontWeight: 600, color: section.accentColor }}>Tip: </span>
              {section.tip}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
