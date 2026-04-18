import { useState } from 'react';

const GUIDES = [
  {
    id: 'muscle',
    title: 'Muscle Building',
    subtitle: 'Hypertrophy & Strength',
    icon: '💪',
    accentColor: '#6366f1',
    accentBg: 'rgba(99,102,241,0.08)',
    accentBorder: 'rgba(99,102,241,0.25)',
    overview: 'Build lean muscle mass through progressive overload, high volume training, and strategic nutrition. This program focuses on compound lifts paired with isolation work to maximize muscle growth over 12+ weeks.',
    schedule: [
      { day: 'Monday',    session: 'Push — Chest, Shoulders, Triceps' },
      { day: 'Tuesday',   session: 'Pull — Back & Biceps' },
      { day: 'Wednesday', session: 'Rest / Active Recovery' },
      { day: 'Thursday',  session: 'Legs — Quads, Hamstrings, Glutes' },
      { day: 'Friday',    session: 'Upper — Chest & Back Volume' },
      { day: 'Saturday',  session: 'Arms & Shoulders' },
      { day: 'Sunday',    session: 'Rest / Mobility' },
    ],
    principles: [
      'Progressive overload: Add weight or reps every 1–2 weeks',
      'Eat at a 200–350 kcal surplus to fuel muscle growth',
      'Hit 0.7–1g of protein per lb of bodyweight daily',
      'Train each muscle group 2x per week for optimal stimulus',
      'Prioritize sleep — 7–9 hours is when muscles actually grow',
    ],
    sampleWorkout: {
      name: 'Push Day A — Chest Focus',
      exercises: [
        { name: 'Barbell Bench Press',       sets: '4 × 6–8',   note: '3 min rest' },
        { name: 'Incline Dumbbell Press',    sets: '3 × 8–10',  note: '2 min rest' },
        { name: 'Cable Chest Fly',           sets: '3 × 12–15', note: '90 sec rest' },
        { name: 'Overhead Press',            sets: '3 × 8–10',  note: '2 min rest' },
        { name: 'Lateral Raises',            sets: '4 × 15',    note: '60 sec rest' },
        { name: 'Tricep Rope Pushdown',      sets: '3 × 12',    note: '60 sec rest' },
        { name: 'Overhead Tricep Extension', sets: '3 × 12',    note: '60 sec rest' },
      ]
    },
    faqs: [
      { q: 'How long before I see results?', a: 'Most beginners see noticeable changes in 6–8 weeks. Strength gains come faster than visible size. Consistency over 12 weeks produces dramatic changes.' },
      { q: 'Should I do cardio while bulking?', a: 'Yes — 2–3 sessions of low-intensity cardio per week keeps your cardiovascular system healthy and improves nutrient delivery to muscles. Keep sessions under 30 min.' },
      { q: 'What if I miss a day?', a: 'Skip it and pick up the next scheduled session. Never try to cram missed workouts — that leads to overtraining.' },
    ]
  },
  {
    id: 'fatloss',
    title: 'Fat Loss',
    subtitle: 'Cut & Conditioning',
    icon: '🔥',
    accentColor: '#f97316',
    accentBg: 'rgba(249,115,22,0.08)',
    accentBorder: 'rgba(249,115,22,0.25)',
    overview: 'Lose body fat while preserving hard-earned muscle through a caloric deficit, maintained protein intake, and a blend of strength training and cardio. Sustainable fat loss is 0.5–1% of bodyweight per week.',
    schedule: [
      { day: 'Monday',    session: 'Full Body Strength A' },
      { day: 'Tuesday',   session: 'LISS Cardio — 30–45 min walk/bike' },
      { day: 'Wednesday', session: 'Full Body Strength B' },
      { day: 'Thursday',  session: 'HIIT — 20 min intervals' },
      { day: 'Friday',    session: 'Full Body Strength C' },
      { day: 'Saturday',  session: 'Active recovery — walk, swim, bike' },
      { day: 'Sunday',    session: 'Rest' },
    ],
    principles: [
      'Maintain a 300–500 kcal daily deficit for steady fat loss',
      'Keep protein high (0.8–1g/lb) to preserve muscle mass',
      'Strength training is non-negotiable — it keeps your metabolism up',
      'LISS cardio burns extra calories without excessive fatigue',
      'Track everything — awareness is the #1 fat loss tool',
    ],
    sampleWorkout: {
      name: 'Full Body Strength A',
      exercises: [
        { name: 'Goblet Squat',      sets: '4 × 12',  note: '90 sec rest' },
        { name: 'Dumbbell Row',      sets: '4 × 12',  note: '90 sec rest' },
        { name: 'Push-ups / Bench',  sets: '3 × 15',  note: '60 sec rest' },
        { name: 'Romanian Deadlift', sets: '3 × 12',  note: '90 sec rest' },
        { name: 'Shoulder Press',    sets: '3 × 12',  note: '60 sec rest' },
        { name: 'Plank',             sets: '3 × 45s', note: '45 sec rest' },
        { name: 'Mountain Climbers', sets: '3 × 30s', note: '30 sec rest' },
      ]
    },
    faqs: [
      { q: 'How fast should I lose weight?', a: '0.5–1% of your bodyweight per week is ideal. Faster loss risks muscle loss, fatigue, and rebound. Slow and steady wins the cut.' },
      { q: 'Can I do more cardio to lose fat faster?', a: 'Up to a point — too much cardio increases cortisol and can eat into muscle. Cap additional cardio at 3–4 hours/week beyond what\'s programmed.' },
      { q: 'I\'m not losing weight — what\'s wrong?', a: 'Most likely a tracking issue (underestimating calories) or a plateau. Recalculate your TDEE and try a 1–2 week diet break before continuing the deficit.' },
    ]
  },
  {
    id: 'cardio',
    title: 'Cardio Base',
    subtitle: 'Endurance & Conditioning',
    icon: '🏃',
    accentColor: '#22c55e',
    accentBg: 'rgba(34,197,94,0.08)',
    accentBorder: 'rgba(34,197,94,0.25)',
    overview: 'Build an aerobic base that improves heart health, boosts daily energy, and enhances recovery. This program progressively increases cardiovascular capacity through zone-based training.',
    schedule: [
      { day: 'Monday',    session: 'Easy Run / Walk — Zone 2, 30 min' },
      { day: 'Tuesday',   session: 'Strength + Core — 45 min' },
      { day: 'Wednesday', session: 'Tempo Run — Zone 3, 25 min' },
      { day: 'Thursday',  session: 'Rest / Easy Walk' },
      { day: 'Friday',    session: 'HIIT Intervals — 20 min' },
      { day: 'Saturday',  session: 'Long Easy Run — Zone 2, 45–60 min' },
      { day: 'Sunday',    session: 'Rest / Yoga' },
    ],
    principles: [
      '80% of cardio should be easy (Zone 2) — you should hold a conversation',
      'Gradually increase weekly volume by no more than 10% per week',
      'Strength train 2x/week to prevent muscle loss and injury',
      'Hydrate! Aim for half your bodyweight in oz of water daily',
      'Rest days are training days — sleep and nutrition drive adaptation',
    ],
    sampleWorkout: {
      name: 'HIIT Interval Session',
      exercises: [
        { name: 'Warm-up jog',   sets: '1 × 5 min', note: 'Easy pace' },
        { name: 'Sprint interval', sets: '8 × 30s', note: '90s walk recovery' },
        { name: 'Jump Rope',     sets: '3 × 60s',   note: '60s rest' },
        { name: 'Burpees',       sets: '3 × 10',    note: '60s rest' },
        { name: 'High Knees',    sets: '3 × 30s',   note: '30s rest' },
        { name: 'Cool-down walk', sets: '1 × 5 min', note: 'Easy pace' },
      ]
    },
    faqs: [
      { q: 'What is Zone 2 cardio?', a: 'Zone 2 is 60–70% of your max heart rate — a conversational, comfortable pace. It\'s the sweet spot for fat burning and aerobic base building.' },
      { q: 'How do I find my max heart rate?', a: 'Use 220 minus your age as a rough estimate. A sports watch with heart rate monitoring will give you real-time zone feedback.' },
      { q: 'Running hurts my knees — what should I do?', a: 'Swap running for cycling or rowing — same cardiovascular benefit, much less joint impact. Prioritize mobility and strength work for your knees.' },
    ]
  },
  {
    id: 'mobility',
    title: 'Mobility & Recovery',
    subtitle: 'Flexibility & Restoration',
    icon: '🧘',
    accentColor: '#06b6d4',
    accentBg: 'rgba(6,182,212,0.08)',
    accentBorder: 'rgba(6,182,212,0.25)',
    overview: 'Improve flexibility, joint health, and recovery through targeted mobility work. This program reduces injury risk, improves posture, and helps your body perform better in every other workout.',
    schedule: [
      { day: 'Monday',    session: 'Hip & Hamstring Mobility — 20 min' },
      { day: 'Tuesday',   session: 'Upper Body / Thoracic — 15 min' },
      { day: 'Wednesday', session: 'Full Body Yoga Flow — 30 min' },
      { day: 'Thursday',  session: 'Shoulder & Chest Opener — 15 min' },
      { day: 'Friday',    session: 'Hip Flexor & Ankle — 20 min' },
      { day: 'Saturday',  session: 'Foam Roll + Full Body Stretch — 30 min' },
      { day: 'Sunday',    session: 'Restorative Yoga / Breathing — 20 min' },
    ],
    principles: [
      'Hold static stretches for 30–60 seconds at the end of workouts',
      'Dynamic mobility before training, static stretching after',
      'Focus on areas you feel tight or restricted in daily life',
      'Consistency beats intensity — 15 min daily beats 2 hrs once a week',
      'Breathe deeply into stretches to release tension and increase range',
    ],
    sampleWorkout: {
      name: 'Hip & Lower Body Mobility',
      exercises: [
        { name: 'Hip 90/90 Stretch',      sets: '2 × 60s/side', note: 'Breathe into it' },
        { name: 'Couch Stretch',          sets: '2 × 60s/side', note: 'Hip flexor focus' },
        { name: 'World Greatest Stretch', sets: '5 reps/side',  note: 'Slow controlled' },
        { name: 'Pigeon Pose',            sets: '2 × 60s/side', note: 'Glute depth' },
        { name: 'Standing Hamstring Fold', sets: '3 × 30s',     note: 'Soft knees ok' },
        { name: 'Deep Squat Hold',        sets: '3 × 45s',      note: 'Use support if needed' },
        { name: 'Ankle Circles',          sets: '2 × 10/side',  note: 'Both directions' },
      ]
    },
    faqs: [
      { q: 'How often should I do mobility work?', a: 'Daily is ideal — even 10 minutes of targeted mobility dramatically improves range of motion over months. Attach it to something you already do (morning routine, post-workout).' },
      { q: 'Is stretching before lifting dangerous?', a: 'Static stretching before heavy lifting can temporarily reduce power output. Use dynamic mobility drills before lifting; save long holds for after.' },
      { q: 'I can\'t touch my toes — is that bad?', a: 'It\'s common, not dangerous. Practice the Standing Hamstring Fold and Hip 90/90 daily. Most people see significant improvement in 4–6 weeks.' },
    ]
  },
  {
    id: 'core',
    title: 'Core & Abs',
    subtitle: 'Strength, Stability & Definition',
    icon: '🎯',
    accentColor: '#8b5cf6',
    accentBg: 'rgba(139,92,246,0.08)',
    accentBorder: 'rgba(139,92,246,0.25)',
    overview: 'A strong core is the foundation of every movement you make. This guide covers anti-rotation, anti-extension, and anti-lateral-flexion work — far beyond crunches — to build a resilient, stable midsection.',
    schedule: [
      { day: 'Monday',    session: 'Anti-Extension Focus (Planks & RKC)' },
      { day: 'Tuesday',   session: 'Lift Day — Core integrated into compound movements' },
      { day: 'Wednesday', session: 'Rest' },
      { day: 'Thursday',  session: 'Anti-Rotation Focus (Pallof Press & Carries)' },
      { day: 'Friday',    session: 'Lift Day — Core integrated' },
      { day: 'Saturday',  session: 'Full Core Circuit — 20 min finisher' },
      { day: 'Sunday',    session: 'Rest / Mobility' },
    ],
    principles: [
      'The "core" is more than abs — it includes obliques, erectors, glutes, and hip flexors',
      'Prioritize anti-movement exercises over crunches for functional strength',
      'Brace the core before every heavy lift — imagine someone is about to punch you',
      'Visible abs are made in the kitchen — body fat % determines visibility',
      'Train core 3–4x per week with progressive difficulty',
    ],
    sampleWorkout: {
      name: 'Full Core Circuit',
      exercises: [
        { name: 'Plank',                  sets: '3 × 60s',    note: 'Full body tension' },
        { name: 'Dead Bug',               sets: '3 × 10/side', note: 'Lower back stays flat' },
        { name: 'Pallof Press',           sets: '3 × 12/side', note: 'Anti-rotation' },
        { name: 'Ab Wheel Rollout',       sets: '3 × 10',     note: 'Control the descent' },
        { name: 'Copenhagen Plank',       sets: '2 × 30s/side', note: 'Adductor stability' },
        { name: 'Hollow Body Hold',       sets: '3 × 30s',    note: 'Posterior pelvic tilt' },
        { name: 'Suitcase Carry',         sets: '3 × 30m/side', note: 'Anti-lateral flexion' },
      ]
    },
    faqs: [
      { q: 'How do I get a six-pack?', a: 'Two steps: build the rectus abdominis with direct training, then reduce body fat to visible levels (typically below 12% for men, 18% for women). Both take time.' },
      { q: 'Why do my abs hurt but I don\'t see them?', a: 'Your abs are there — they\'re covered by a layer of fat. No amount of ab exercises will spot-reduce fat. Focus on overall caloric deficit and cardio.' },
      { q: 'Are crunches bad for your back?', a: 'Not inherently — but heavy weighted crunches with poor form can be risky. Prioritize anti-movement exercises for the best functional and safe core training.' },
    ]
  },
  {
    id: 'hiit',
    title: 'HIIT Program',
    subtitle: 'High Intensity Interval Training',
    icon: '⚡',
    accentColor: '#eab308',
    accentBg: 'rgba(234,179,8,0.08)',
    accentBorder: 'rgba(234,179,8,0.25)',
    overview: 'Burn maximum calories, boost your metabolism, and improve cardiovascular fitness in minimal time. HIIT alternates between intense effort and brief recovery to spike heart rate and trigger the "afterburn" effect (EPOC) for hours post-workout.',
    schedule: [
      { day: 'Monday',    session: 'HIIT Circuit A — 25 min' },
      { day: 'Tuesday',   session: 'Active Recovery / Light Walk' },
      { day: 'Wednesday', session: 'HIIT Circuit B — 25 min' },
      { day: 'Thursday',  session: 'Strength Training' },
      { day: 'Friday',    session: 'HIIT Circuit C — 25 min' },
      { day: 'Saturday',  session: 'Strength or Long Walk' },
      { day: 'Sunday',    session: 'Full Rest' },
    ],
    principles: [
      'Work intervals should be 80–95% max effort — it should feel hard',
      'Recovery intervals are active rest — slow walking or easy movement',
      'Never do HIIT on consecutive days — your CNS needs 48 hrs to recover',
      'Start with 1:2 work:rest ratio (20s on / 40s off) and progress from there',
      'Stay hydrated — HIIT burns through electrolytes quickly',
    ],
    sampleWorkout: {
      name: 'HIIT Circuit A — Total Body',
      exercises: [
        { name: 'Jump Squat',     sets: '6 × 30s on / 30s off', note: '85–90% effort' },
        { name: 'Push-up',        sets: '6 × 30s on / 30s off', note: 'As many reps as possible' },
        { name: 'Jump Rope',      sets: '6 × 30s on / 30s off', note: 'Sprint pace' },
        { name: 'Burpee',         sets: '6 × 30s on / 30s off', note: 'Full extension at top' },
        { name: 'Mountain Climber', sets: '6 × 30s on / 30s off', note: 'Fast tempo' },
        { name: 'Lateral Shuffle', sets: '4 × 20s on / 40s off', note: 'Wide stance, stay low' },
      ]
    },
    faqs: [
      { q: 'How many calories does HIIT burn?', a: 'A 20–30 min HIIT session burns 200–400 calories depending on intensity and body size — plus an extra 50–150 calories from EPOC (afterburn) in the following hours.' },
      { q: 'Can beginners do HIIT?', a: 'Yes, but modify the intensity. Start with 1:3 work:rest ratio and lower-impact movements (step-jacks instead of jumping jacks, etc.). Build up over 4–6 weeks.' },
      { q: 'Is HIIT better than steady-state cardio?', a: 'Neither is objectively better — they serve different purposes. HIIT is time-efficient and raises metabolism long-term; steady-state cardio is easier to recover from and good for aerobic base.' },
    ]
  },
  {
    id: 'powerlifting',
    title: 'Powerlifting Basics',
    subtitle: 'Squat, Bench & Deadlift',
    icon: '🏆',
    accentColor: '#ef4444',
    accentBg: 'rgba(239,68,68,0.08)',
    accentBorder: 'rgba(239,68,68,0.25)',
    overview: 'Build maximum strength on the three competition lifts: squat, bench press, and deadlift. This program uses linear periodization with high focus on technique, accessory work, and peaking.',
    schedule: [
      { day: 'Monday',    session: 'Squat — Heavy + Accessories' },
      { day: 'Tuesday',   session: 'Rest / Upper Mobility' },
      { day: 'Wednesday', session: 'Bench Press — Heavy + Accessories' },
      { day: 'Thursday',  session: 'Rest / Lower Mobility' },
      { day: 'Friday',    session: 'Deadlift — Heavy + Accessories' },
      { day: 'Saturday',  session: 'Bench Press — Volume Day (lighter)' },
      { day: 'Sunday',    session: 'Full Rest' },
    ],
    principles: [
      'Technique first — perfect movement before adding weight',
      'Linear progression: add 5 lbs per session for upper, 10 lbs for lower until stalling',
      'The big three are the priority — everything else is accessory',
      'Eat to support strength — you cannot PR in a large deficit',
      'Video your lifts: what you feel and what\'s happening are often different',
    ],
    sampleWorkout: {
      name: 'Monday — Squat Day',
      exercises: [
        { name: 'Barbell Back Squat',   sets: '5 × 5 @ 80%',    note: 'Competition stance' },
        { name: 'Pause Squat',          sets: '3 × 3 @ 65%',    note: '3s pause at bottom' },
        { name: 'Romanian Deadlift',    sets: '3 × 8',           note: 'Posterior chain balance' },
        { name: 'Leg Press',            sets: '3 × 12',          note: 'Quad volume' },
        { name: 'Leg Curl',             sets: '3 × 12',          note: 'Hamstring balance' },
        { name: 'Ab Wheel Rollout',     sets: '3 × 10',          note: 'Core for squat stability' },
        { name: 'Calf Raises',          sets: '3 × 15',          note: 'Often neglected' },
      ]
    },
    faqs: [
      { q: 'What\'s a good beginner squat/bench/deadlift?', a: 'General benchmarks: squat 1× bodyweight, bench 0.75× bodyweight, deadlift 1.5× bodyweight are solid intermediate standards. Beginners work toward these.' },
      { q: 'Should I use a belt?', a: 'Start learning to brace without a belt. Once you\'re squatting/deadlifting 1.5× bodyweight, a belt can help maintain intra-abdominal pressure at max effort.' },
      { q: 'How do I break through a plateau?', a: 'Deload for 1 week (50% weight), then try a wave loading scheme (e.g., 3×5, 3×3, 1×1 over 3 weeks). Sometimes a technique fix is worth more than grinding.' },
    ]
  },
  {
    id: 'beginner',
    title: 'Beginner Program',
    subtitle: 'Start Here — 3 Days / Week',
    icon: '🌱',
    accentColor: '#10b981',
    accentBg: 'rgba(16,185,129,0.08)',
    accentBorder: 'rgba(16,185,129,0.25)',
    overview: 'The best beginner program is simple, consistent, and progressive. Three full-body days per week using compound movements covers everything you need in the first 6 months. Don\'t overcomplicate it — just show up and add weight.',
    schedule: [
      { day: 'Monday',    session: 'Full Body A — Squat + Press + Row' },
      { day: 'Tuesday',   session: 'Rest — Walk, light activity' },
      { day: 'Wednesday', session: 'Full Body B — Squat + Deadlift + Pull' },
      { day: 'Thursday',  session: 'Rest' },
      { day: 'Friday',    session: 'Full Body A — Squat + Press + Row' },
      { day: 'Saturday',  session: 'Active rest or extra cardio' },
      { day: 'Sunday',    session: 'Rest' },
    ],
    principles: [
      'Show up 3 days per week — that\'s it. Consistency beats perfection',
      'Add small amounts of weight each session (5 lbs upper, 10 lbs lower)',
      'Learn the movement first — watch videos, feel the muscle working',
      'Eat enough protein: at least 0.7g per lb of bodyweight daily',
      'Don\'t skip warmups — your joints will thank you in 10 years',
    ],
    sampleWorkout: {
      name: 'Day A — Push & Pull',
      exercises: [
        { name: 'Barbell Back Squat',   sets: '3 × 5',  note: 'Depth: thighs parallel or below' },
        { name: 'Barbell Bench Press',  sets: '3 × 5',  note: 'Full ROM, controlled descent' },
        { name: 'Barbell Row',          sets: '3 × 5',  note: 'Slight hinge, pull to belly button' },
        { name: 'Plank',                sets: '3 × 30s', note: 'Squeeze everything' },
        { name: 'Face Pulls',           sets: '3 × 15', note: 'Shoulder health — never skip' },
        { name: 'Dumbbell Curl',        sets: '2 × 12', note: 'Optional arm work' },
      ]
    },
    faqs: [
      { q: 'When will I stop feeling sore?', a: 'The intense soreness of the first 2–4 weeks (DOMS) fades as your body adapts. After 6 weeks you\'ll rarely be severely sore unless you change exercises significantly.' },
      { q: 'Should I do cardio as a beginner?', a: '2–3 walks per week is perfect — low impact, great for recovery and calorie burn. Avoid heavy cardio that competes with your lifting recovery.' },
      { q: 'What should I eat?', a: 'Hit your protein target (0.7–1g/lb bodyweight), eat mostly whole foods, and don\'t obsess over perfect macros yet. Get the basics right first.' },
    ]
  },
];

function GuideCard({ guide, onOpen }) {
  return (
    <div
      className="card"
      style={{
        borderColor: guide.accentBorder,
        cursor: 'pointer',
        transition: 'all 0.2s',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.6rem',
      }}
      onClick={() => onOpen(guide)}
      onMouseEnter={e => e.currentTarget.style.borderColor = guide.accentColor}
      onMouseLeave={e => e.currentTarget.style.borderColor = guide.accentBorder}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{
          width: 48, height: 48, borderRadius: 12,
          background: guide.accentBg, border: `1.5px solid ${guide.accentBorder}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.5rem', flexShrink: 0,
        }}>
          {guide.icon}
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '1rem' }}>{guide.title}</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{guide.subtitle}</div>
        </div>
      </div>
      <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
        {guide.overview.slice(0, 120)}...
      </p>
      <div style={{
        marginTop: 'auto',
        display: 'flex', alignItems: 'center', gap: '0.4rem',
        color: guide.accentColor, fontSize: '0.8rem', fontWeight: 600,
      }}>
        View Guide <span>→</span>
      </div>
    </div>
  );
}

function GuideModal({ guide, onClose }) {
  const [checkedExercises, setCheckedExercises] = useState({});
  const [activeTab, setActiveTab] = useState('workout'); // 'workout' | 'schedule' | 'principles' | 'faq'

  if (!guide) return null;

  const toggleCheck = (i) => setCheckedExercises(prev => ({ ...prev, [i]: !prev[i] }));
  const checkedCount = Object.values(checkedExercises).filter(Boolean).length;
  const totalEx = guide.sampleWorkout.exercises.length;
  const progress = Math.round((checkedCount / totalEx) * 100);

  const TAB_STYLE_BASE = {
    padding: '0.4rem 0.85rem', borderRadius: 8, border: 'none',
    cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.82rem', fontWeight: 600,
    transition: 'all 0.15s',
  };

  const tabs = [
    { id: 'workout',    label: '💪 Workout' },
    { id: 'schedule',   label: '📅 Schedule' },
    { id: 'principles', label: '📌 Principles' },
    { id: 'faq',        label: '❓ FAQ' },
  ];

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 500,
      background: 'rgba(0,0,0,0.75)',
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      padding: '1rem',
      overflowY: 'auto',
    }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: 'var(--bg-card)',
        border: `1px solid ${guide.accentBorder}`,
        borderRadius: 20,
        padding: '1.75rem',
        width: '100%',
        maxWidth: 700,
        margin: 'auto',
        position: 'relative',
        animation: 'fadeUp 0.2s ease both',
      }}>
        {/* Close button */}
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

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14,
            background: guide.accentBg, border: `1.5px solid ${guide.accentBorder}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.75rem', flexShrink: 0,
          }}>
            {guide.icon}
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, letterSpacing: '-0.02em' }}>{guide.title}</h2>
            <div style={{ fontSize: '0.82rem', color: guide.accentColor, fontWeight: 600 }}>{guide.subtitle}</div>
          </div>
        </div>

        {/* Overview */}
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.65, marginBottom: '1.25rem' }}>
          {guide.overview}
        </p>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.25rem', flexWrap: 'wrap', borderBottom: '1px solid var(--border)', paddingBottom: '0.85rem' }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                ...TAB_STYLE_BASE,
                background: activeTab === tab.id ? guide.accentBg : 'var(--bg-elevated)',
                color: activeTab === tab.id ? guide.accentColor : 'var(--text-muted)',
                border: `1.5px solid ${activeTab === tab.id ? guide.accentBorder : 'var(--border)'}`,
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab: Workout (interactive checklist) */}
        {activeTab === 'workout' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div className="section-title" style={{ marginBottom: 0 }}>
                {guide.sampleWorkout.name}
              </div>
              {checkedCount > 0 && (
                <span style={{ fontSize: '0.75rem', color: guide.accentColor, fontWeight: 700 }}>
                  {checkedCount}/{totalEx} done
                </span>
              )}
            </div>

            {/* Progress bar */}
            {checkedCount > 0 && (
              <div style={{ height: 4, background: 'var(--border)', borderRadius: 4, marginBottom: '0.85rem', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${progress}%`, background: guide.accentColor, borderRadius: 4, transition: 'width 0.3s' }} />
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {guide.sampleWorkout.exercises.map((ex, i) => (
                <div
                  key={i}
                  onClick={() => toggleCheck(i)}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '0.65rem 0.875rem',
                    background: checkedExercises[i] ? guide.accentBg : 'var(--bg-elevated)',
                    border: `1px solid ${checkedExercises[i] ? guide.accentBorder : 'var(--border)'}`,
                    borderRadius: 9,
                    flexWrap: 'wrap', gap: '0.4rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    opacity: checkedExercises[i] ? 0.75 : 1,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                      border: `2px solid ${checkedExercises[i] ? guide.accentColor : 'var(--border)'}`,
                      background: checkedExercises[i] ? guide.accentColor : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.15s',
                    }}>
                      {checkedExercises[i] && <span style={{ color: '#fff', fontSize: '0.65rem', fontWeight: 700 }}>✓</span>}
                    </div>
                    <div>
                      <div style={{
                        fontWeight: 500, fontSize: '0.875rem',
                        textDecoration: checkedExercises[i] ? 'line-through' : 'none',
                        color: checkedExercises[i] ? 'var(--text-muted)' : 'var(--text)',
                      }}>
                        {ex.name}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>{ex.note}</div>
                    </div>
                  </div>
                  <span style={{
                    padding: '0.2rem 0.6rem', borderRadius: 6,
                    background: guide.accentBg, border: `1px solid ${guide.accentBorder}`,
                    color: guide.accentColor, fontSize: '0.78rem', fontWeight: 700,
                    whiteSpace: 'nowrap',
                  }}>
                    {ex.sets}
                  </span>
                </div>
              ))}
            </div>

            {checkedCount === totalEx && (
              <div style={{
                marginTop: '1rem', padding: '0.85rem 1rem', textAlign: 'center',
                background: guide.accentBg, border: `1px solid ${guide.accentBorder}`,
                borderRadius: 12, fontWeight: 700, color: guide.accentColor,
              }}>
                🎉 Workout complete! Smashed it.
              </div>
            )}

            <div style={{ marginTop: '0.75rem', fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'center' }}>
              Tap an exercise to check it off as you go
            </div>
          </div>
        )}

        {/* Tab: Schedule */}
        {activeTab === 'schedule' && (
          <div>
            <div className="section-title">Weekly Schedule</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              {guide.schedule.map(s => (
                <div key={s.day} style={{
                  display: 'flex', gap: '0.85rem',
                  padding: '0.6rem 0.875rem',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border)',
                  borderRadius: 9, alignItems: 'center',
                }}>
                  <span style={{ fontWeight: 700, fontSize: '0.78rem', color: guide.accentColor, width: 80, flexShrink: 0 }}>{s.day}</span>
                  <span style={{ fontSize: '0.85rem' }}>{s.session}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab: Principles */}
        {activeTab === 'principles' && (
          <div>
            <div className="section-title">Key Principles</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {guide.principles.map((p, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.65rem', alignItems: 'flex-start' }}>
                  <span style={{
                    width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                    background: guide.accentBg, border: `1px solid ${guide.accentBorder}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.7rem', fontWeight: 700, color: guide.accentColor, marginTop: 2,
                  }}>
                    {i + 1}
                  </span>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{p}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab: FAQ */}
        {activeTab === 'faq' && (
          <div>
            <div className="section-title">Frequently Asked Questions</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {(guide.faqs || []).map((faq, i) => (
                <FAQItem key={i} faq={faq} accentColor={guide.accentColor} accentBg={guide.accentBg} accentBorder={guide.accentBorder} />
              ))}
            </div>
          </div>
        )}

        <button
          className="btn btn-secondary"
          style={{ width: '100%', marginTop: '1.5rem' }}
          onClick={onClose}
        >
          Close Guide
        </button>
      </div>
    </div>
  );
}

function FAQItem({ faq, accentColor, accentBg, accentBorder }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{
        padding: '0.85rem 1rem',
        background: open ? accentBg : 'var(--bg-elevated)',
        border: `1px solid ${open ? accentBorder : 'var(--border)'}`,
        borderRadius: 12, cursor: 'pointer', transition: 'all 0.15s',
      }}
      onClick={() => setOpen(v => !v)}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{faq.q}</span>
        <span style={{ color: accentColor, fontWeight: 700, flexShrink: 0 }}>{open ? '▲' : '▼'}</span>
      </div>
      {open && (
        <div style={{ marginTop: '0.65rem', fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
          {faq.a}
        </div>
      )}
    </div>
  );
}

export default function Guides() {
  const [openGuide, setOpenGuide] = useState(null);

  return (
    <div className="page">
      <div className="page-header">
        <h1>Workout Guides</h1>
        <p>Evidence-based training programs for every goal</p>
      </div>

      <div className="grid-2" style={{ gap: '1rem' }}>
        {GUIDES.map(guide => (
          <GuideCard key={guide.id} guide={guide} onOpen={setOpenGuide} />
        ))}
      </div>

      <div style={{ marginTop: '2rem', padding: '1rem 1.25rem', background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 12 }}>
        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
          <span style={{ fontWeight: 600, color: 'var(--indigo)' }}>Pro tip:</span> Open any guide and use the interactive workout checklist to follow along during your session. Tap each exercise to mark it done — your progress shows in real time.
        </div>
      </div>

      <GuideModal guide={openGuide} onClose={() => setOpenGuide(null)} />
    </div>
  );
}
