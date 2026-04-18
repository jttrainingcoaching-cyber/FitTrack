import { useState } from 'react';
import { usePreferences } from '../context/PreferencesContext';
import { useToast } from '../context/ToastContext';

const TRIMESTER_GUIDES = [
  {
    id: 't1',
    title: 'First Trimester',
    subtitle: 'Weeks 1–12',
    icon: '🌱',
    accentColor: '#22c55e',
    accentBg: 'rgba(34,197,94,0.08)',
    accentBorder: 'rgba(34,197,94,0.2)',
    overview: 'The first trimester is about maintaining existing fitness while your body undergoes major hormonal changes. Focus on listening to your body — nausea, fatigue, and sensitivity are common and normal.',
    keyPoints: [
      'Continue your current exercise routine at a slightly reduced intensity if needed',
      'Heart rate guidelines are outdated — use the "talk test" instead (you should be able to hold a conversation)',
      'Avoid overheating — stay cool, hydrate well, and skip hot yoga or saunas',
      'Core work is still safe — focus on functional movements, not heavy crunches',
      'If you\'re new to exercise, now is a great time to start walking, swimming, or prenatal yoga',
      'Protein needs increase slightly — aim for an extra 10–25g per day',
    ],
    exercises: [
      { name: 'Walking',              sets: '20–45 min/day',  note: 'Low impact, mood-boosting, safe for all trimesters' },
      { name: 'Swimming',             sets: '30–45 min',      note: 'Ideal — reduces joint stress, keeps you cool' },
      { name: 'Bodyweight Squats',    sets: '3 × 15',         note: 'Builds glute and leg strength for labor prep' },
      { name: 'Dumbbell Row',         sets: '3 × 12',         note: 'Upper back strength — important as posture shifts' },
      { name: 'Bird-Dog',             sets: '3 × 10/side',    note: 'Core stability without spinal flexion' },
      { name: 'Pelvic Floor Bridges', sets: '3 × 15',         note: 'Activates glutes + pelvic floor simultaneously' },
      { name: 'Prenatal Yoga',        sets: '20–30 min',      note: 'Mobility, breathing, and relaxation' },
    ],
    avoid: [
      'Lying flat on your back for extended periods (after ~12 weeks)',
      'Contact sports or activities with fall risk',
      'Heavy Valsalva breathing (breath-holding during max effort lifts)',
      'Exercising to exhaustion',
    ]
  },
  {
    id: 't2',
    title: 'Second Trimester',
    subtitle: 'Weeks 13–26',
    icon: '🌸',
    accentColor: '#f97316',
    accentBg: 'rgba(249,115,22,0.08)',
    accentBorder: 'rgba(249,115,22,0.2)',
    overview: 'Many people feel their best in the second trimester as nausea often subsides. The belly is growing — modify exercises to accommodate your changing center of gravity and avoid lying on your back.',
    keyPoints: [
      'Avoid lying flat on your back — use a wedge or side-lying position for floor work',
      'Center of gravity shifts — reduce dynamic balance challenges',
      'Pelvic floor exercises (Kegels) become increasingly important',
      'Calorie needs increase by ~300–350 kcal/day — don\'t under-eat',
      'Protein target increases — aim for 80–100g/day minimum',
      'Stay hydrated — water needs increase significantly',
    ],
    exercises: [
      { name: 'Incline Dumbbell Press',    sets: '3 × 12',      note: 'Modify flat bench to incline to avoid supine position' },
      { name: 'Seated Overhead Press',     sets: '3 × 12',      note: 'Sitting reduces stability demands on growing belly' },
      { name: 'Sumo Squat',               sets: '3 × 15',       note: 'Wider stance accommodates belly comfortably' },
      { name: 'Side-Lying Hip Abduction', sets: '3 × 15/side',  note: 'Glute med work — important for pelvic stability' },
      { name: 'Cable Row (seated)',        sets: '3 × 12',       note: 'Safe back exercise throughout all trimesters' },
      { name: 'Step-ups',                 sets: '3 × 12/side',  note: 'Lower body strength with less balance demand than lunges' },
      { name: 'Kegel Exercises',          sets: '3 × 10 holds', note: '10-second holds. Critical for pelvic floor health' },
      { name: 'Prenatal Pilates',         sets: '30 min',       note: 'Core and pelvic floor focus' },
    ],
    avoid: [
      'Lying flat on your back (supine position)',
      'Twisting exercises that compress the belly',
      'High-impact jumping or running if uncomfortable',
      'Heavy overhead lifting that causes breath-holding',
    ]
  },
  {
    id: 't3',
    title: 'Third Trimester',
    subtitle: 'Weeks 27–40',
    icon: '🌟',
    accentColor: '#8b5cf6',
    accentBg: 'rgba(139,92,246,0.08)',
    accentBorder: 'rgba(139,92,246,0.2)',
    overview: 'Movement in the third trimester supports labor preparation, reduces back pain, and improves sleep. Intensity naturally decreases — focus on staying active, comfortable, and mentally prepared.',
    keyPoints: [
      'Relaxin hormone increases — ligaments are looser, so avoid rapid direction changes',
      'Pelvic girdle pain is common — reduce impact, use a support belt if needed',
      'Walking, swimming, and prenatal yoga are ideal in late pregnancy',
      'Sleep can be challenging — use a pregnancy pillow and side-sleeping position',
      'Focus on labor-prep movements: squats, cat-cow, pelvic circles',
      'Continue pelvic floor work but avoid heavy Kegel holds if experiencing pelvic pain',
    ],
    exercises: [
      { name: 'Walking',                  sets: '20–30 min/day', note: 'Best exercise in late pregnancy — maintain until labor' },
      { name: 'Wall Squat',               sets: '3 × 30–45s',    note: 'Lower body strength without balance risk' },
      { name: 'Cat-Cow',                  sets: '10 breaths',    note: 'Relieves back pain, prepares baby for optimal position' },
      { name: 'Pelvic Circles (on ball)', sets: '2 min',         note: 'Birthing ball exercise — opens pelvis, eases discomfort' },
      { name: 'Glute Bridge (modified)',  sets: '3 × 15',        note: 'Use wedge or reduce time to avoid prolonged supine' },
      { name: 'Side-Lying Clam Shell',    sets: '3 × 15/side',   note: 'Pelvic stability without lying on back' },
      { name: 'Prenatal Yoga',            sets: '20–40 min',     note: 'Breathing, relaxation, labor preparation' },
    ],
    avoid: [
      'High-impact exercise if experiencing discomfort',
      'Exercises that cause or worsen pelvic girdle pain',
      'Activities with fall risk',
      'Any exercise that feels wrong — trust your body',
    ]
  },
];

const PARTNER_GUIDE = {
  title: 'For Partners & Support People',
  icon: '🤝',
  accentColor: '#06b6d4',
  accentBg: 'rgba(6,182,212,0.08)',
  accentBorder: 'rgba(6,182,212,0.2)',
  sections: [
    {
      title: 'How You Can Help',
      items: [
        'Join them for walks, prenatal yoga classes, or gentle workouts — the accountability is powerful',
        'Learn what exercises are safe so you can encourage without adding pressure or worry',
        'Take over household tasks that involve heavy lifting, bending, or prolonged standing',
        'Prep high-protein, nutrient-dense meals together — nutrition is even more important now',
        'Celebrate non-scale wins: energy levels, sleep quality, staying active',
      ]
    },
    {
      title: 'Your Own Fitness During This Season',
      items: [
        'Pregnancy and the newborn period will challenge your routine too — plan ahead',
        'Short, efficient workouts (20–30 min) are more sustainable than long sessions',
        'Walking together is one of the best things you can do for both of you',
        'If your partner is experiencing fatigue or nausea, adjust the environment to support them (cooler room, etc.)',
        'Your mental health matters too — stay connected to your own support systems',
      ]
    },
    {
      title: 'Postpartum (After Birth)',
      items: [
        'The 4th trimester is real — both parents need recovery time',
        'Pelvic floor rehabilitation should happen before return to high-impact exercise',
        'Typical return to exercise: walking at 2–3 weeks, gentle exercise at 6 weeks (with clearance)',
        'Breastfeeding affects nutrition needs — protein and calorie requirements remain elevated',
        'Sleep deprivation impacts recovery — prioritize rest over training in the early weeks',
        'Be patient with each other and with the process',
      ]
    }
  ]
};

const NUTRITION_NOTES = [
  { trimester: 'T1', extra_cal: '+0–100 kcal', protein: '75–100g/day', key: 'Folate (400–800mcg), Iron, Vitamin D, Omega-3s' },
  { trimester: 'T2', extra_cal: '+300–350 kcal', protein: '80–110g/day', key: 'Calcium, Iron, Vitamin D, Fiber' },
  { trimester: 'T3', extra_cal: '+450–500 kcal', protein: '90–120g/day', key: 'Iron, Calcium, DHA, Protein' },
];

function TrimesterCard({ guide }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="card" style={{ marginBottom: '1rem', borderColor: expanded ? guide.accentBorder : 'var(--border)', transition: 'border-color 0.15s' }}>
      <div
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', gap: '0.75rem' }}
        onClick={() => setExpanded(v => !v)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: 50, height: 50, borderRadius: 12, flexShrink: 0,
            background: guide.accentBg, border: `1.5px solid ${guide.accentBorder}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem',
          }}>
            {guide.icon}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1rem' }}>{guide.title}</div>
            <div style={{ fontSize: '0.78rem', color: guide.accentColor, fontWeight: 600, marginTop: '0.1rem' }}>{guide.subtitle}</div>
          </div>
        </div>
        <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>{expanded ? '▲' : '▼'}</span>
      </div>

      {expanded && (
        <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: `1px solid ${guide.accentBorder}` }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.65, marginBottom: '1.25rem' }}>
            {guide.overview}
          </p>

          {/* Key Points */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div className="section-title">Key Points</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              {guide.keyPoints.map((p, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start', fontSize: '0.85rem' }}>
                  <span style={{ color: guide.accentColor, fontWeight: 700, flexShrink: 0, marginTop: '0.1rem' }}>✓</span>
                  <span style={{ color: 'var(--text-muted)', lineHeight: 1.5 }}>{p}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Exercises */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div className="section-title">Recommended Exercises</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {guide.exercises.map((ex, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '0.6rem 0.875rem', background: guide.accentBg,
                  border: `1px solid ${guide.accentBorder}`, borderRadius: 9, flexWrap: 'wrap', gap: '0.4rem',
                }}>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>{ex.name}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>{ex.note}</div>
                  </div>
                  <span style={{ padding: '0.2rem 0.6rem', borderRadius: 6, background: 'var(--bg-elevated)', border: '1px solid var(--border)', fontSize: '0.75rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
                    {ex.sets}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Avoid */}
          <div>
            <div className="section-title">What to Avoid</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {guide.avoid.map((a, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--red)', flexShrink: 0, marginTop: '0.1rem' }}>✗</span>
                  <span style={{ color: 'var(--text-muted)', lineHeight: 1.5 }}>{a}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Prenatal() {
  const { prefs, updatePrefs } = usePreferences();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('pregnant');

  const handleRoleChange = async (role) => {
    setActiveTab(role);
    await updatePrefs({ prenatal_role: role });
  };

  const TABS = [
    { id: 'pregnant', label: 'Pregnancy Guide', icon: '🌸' },
    { id: 'partner',  label: 'Partners & Support', icon: '🤝' },
    { id: 'nutrition', label: 'Nutrition', icon: '🥗' },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <h1>Prenatal Fitness</h1>
        <p>Safe, evidence-based fitness guidance through pregnancy and beyond</p>
      </div>

      {/* Disclaimer */}
      <div style={{
        padding: '0.85rem 1.1rem', marginBottom: '1.5rem',
        background: 'rgba(234,179,8,0.07)', border: '1px solid rgba(234,179,8,0.2)',
        borderRadius: 12, fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.55,
        display: 'flex', gap: '0.6rem', alignItems: 'flex-start',
      }}>
        <span style={{ flexShrink: 0, fontSize: '1rem' }}>⚠️</span>
        <span>
          <strong style={{ color: 'var(--yellow)' }}>Always consult your OB/midwife before starting or continuing exercise during pregnancy.</strong>
          {' '}This guide reflects general evidence-based recommendations — your care team knows your specific situation.
        </span>
      </div>

      {/* Tab selector */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '0.5rem 1.1rem', borderRadius: 10, minHeight: 44,
              border: `1.5px solid ${activeTab === tab.id ? 'rgba(99,102,241,0.5)' : 'var(--border)'}`,
              background: activeTab === tab.id ? 'rgba(99,102,241,0.12)' : 'var(--bg-elevated)',
              color: activeTab === tab.id ? 'var(--indigo)' : 'var(--text-muted)',
              cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.875rem', fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: '0.4rem', transition: 'all 0.15s',
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Pregnancy Trimester Guides */}
      {activeTab === 'pregnant' && (
        <div>
          <div style={{ padding: '0.85rem 1.1rem', marginBottom: '1.25rem', background: 'rgba(139,92,246,0.07)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: 12, fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            <strong style={{ color: 'var(--violet)' }}>Your body, your pace.</strong> These guides give you a framework — but your energy, symptoms, and comfort are the real guide. Movement during pregnancy has significant benefits for you and your baby. Do what feels right.
          </div>
          {TRIMESTER_GUIDES.map(g => <TrimesterCard key={g.id} guide={g} />)}
        </div>
      )}

      {/* Partner Guide */}
      {activeTab === 'partner' && (
        <div>
          <div className="card" style={{ marginBottom: '1rem', borderColor: PARTNER_GUIDE.accentBorder }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ fontSize: '2rem' }}>{PARTNER_GUIDE.icon}</div>
              <div>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{PARTNER_GUIDE.title}</h2>
                <div style={{ fontSize: '0.8rem', color: PARTNER_GUIDE.accentColor, fontWeight: 600, marginTop: '0.15rem' }}>Supporting a pregnant partner through fitness and beyond</div>
              </div>
            </div>
            {PARTNER_GUIDE.sections.map((section, si) => (
              <div key={si} style={{ marginBottom: si < PARTNER_GUIDE.sections.length - 1 ? '1.25rem' : 0 }}>
                <div className="section-title">{section.title}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                  {section.items.map((item, ii) => (
                    <div key={ii} style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start', fontSize: '0.85rem' }}>
                      <span style={{ color: PARTNER_GUIDE.accentColor, fontWeight: 700, flexShrink: 0, marginTop: '0.1rem' }}>→</span>
                      <span style={{ color: 'var(--text-muted)', lineHeight: 1.55 }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Nutrition */}
      {activeTab === 'nutrition' && (
        <div>
          <div className="card" style={{ marginBottom: '1rem' }}>
            <div className="section-title">Calorie & Protein Needs by Trimester</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {NUTRITION_NOTES.map((n, i) => (
                <div key={i} style={{
                  display: 'grid', gridTemplateColumns: '60px 1fr 1fr',
                  gap: '0.75rem', padding: '0.85rem 0',
                  borderBottom: i < NUTRITION_NOTES.length - 1 ? '1px solid var(--border)' : 'none',
                  alignItems: 'start',
                }}>
                  <div style={{
                    padding: '0.25rem 0.5rem', borderRadius: 8, textAlign: 'center',
                    background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)',
                    fontWeight: 700, fontSize: '0.82rem', color: 'var(--indigo)',
                  }}>
                    {n.trimester}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Extra Calories</div>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--orange)', marginTop: '0.15rem' }}>{n.extra_cal}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Protein</div>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--indigo)', marginTop: '0.15rem' }}>{n.protein}</div>
                  </div>
                  <div style={{ gridColumn: '1 / -1', paddingLeft: '0' }}>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      <span style={{ fontWeight: 600 }}>Key nutrients: </span>{n.key}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={{ marginBottom: '1rem' }}>
            <div className="section-title">General Nutrition Principles</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {[
                { icon: '🥩', title: 'Prioritize Protein', body: 'Protein supports fetal tissue development, placenta growth, and maternal muscle maintenance. Lean meats, eggs, dairy, legumes, and protein shakes all count.' },
                { icon: '🥦', title: 'Eat Iron-Rich Foods', body: 'Blood volume increases ~50% during pregnancy. Red meat, spinach, lentils, and fortified cereals help prevent anemia — pair with vitamin C for better absorption.' },
                { icon: '🐟', title: 'Omega-3 Fatty Acids', body: 'DHA is critical for fetal brain and eye development. Eat low-mercury fish 2x/week (salmon, sardines) or take a prenatal DHA supplement.' },
                { icon: '💊', title: 'Take Your Prenatal', body: 'A prenatal vitamin covers folate (neural tube prevention), iron, calcium, and vitamin D. Start before conception if possible.' },
                { icon: '💧', title: 'Hydrate More', body: 'Water needs increase significantly. Aim for at least 10 cups (80 oz) per day — more if exercising or in hot weather.' },
                { icon: '🚫', title: 'What to Avoid', body: 'Raw fish, high-mercury fish (shark, swordfish), undercooked meat, unpasteurized dairy, alcohol, and excessive caffeine (keep under 200mg/day).' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.75rem', padding: '0.75rem', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 10 }}>
                  <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>{item.icon}</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.25rem' }}>{item.title}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>{item.body}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
