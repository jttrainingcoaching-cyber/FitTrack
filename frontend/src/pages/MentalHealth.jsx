import { useState } from 'react';

const RESOURCES = [
  {
    id: 'crisis',
    title: 'Crisis Support',
    icon: '🆘',
    accentColor: '#ef4444',
    accentBg: 'rgba(239,68,68,0.08)',
    accentBorder: 'rgba(239,68,68,0.25)',
    description: 'If you\'re in crisis or need to talk to someone right now:',
    items: [
      { name: '988 Suicide & Crisis Lifeline',   detail: 'Call or text 988 (US)',          link: 'tel:988' },
      { name: 'Crisis Text Line',                detail: 'Text HOME to 741741',             link: null },
      { name: 'International Association for Suicide Prevention', detail: 'https://www.iasp.info/resources/Crisis_Centres/', link: 'https://www.iasp.info/resources/Crisis_Centres/' },
    ]
  },
  {
    id: 'breathing',
    title: 'Breathing & Grounding',
    icon: '🌬️',
    accentColor: '#06b6d4',
    accentBg: 'rgba(6,182,212,0.08)',
    accentBorder: 'rgba(6,182,212,0.2)',
    description: 'Simple techniques you can do anywhere, right now:',
    items: [
      { name: 'Box Breathing (4-4-4-4)',         detail: 'Inhale 4s → Hold 4s → Exhale 4s → Hold 4s. Repeat 4 times.' },
      { name: '4-7-8 Breathing',                 detail: 'Inhale 4s → Hold 7s → Exhale 8s. Activates the parasympathetic nervous system.' },
      { name: '5-4-3-2-1 Grounding',             detail: 'Name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste. Anchors you to the present.' },
      { name: 'Cold Water Reset',                detail: 'Splash cold water on your face or hold ice — activates the dive reflex, slows heart rate in seconds.' },
    ]
  },
  {
    id: 'movement',
    title: 'Movement as Medicine',
    icon: '🏃',
    accentColor: '#22c55e',
    accentBg: 'rgba(34,197,94,0.08)',
    accentBorder: 'rgba(34,197,94,0.2)',
    description: 'Physical activity is one of the most evidence-backed tools for mental health:',
    items: [
      { name: 'Walk for 10–20 Minutes',          detail: 'Even a short walk outside reduces cortisol and boosts serotonin. You don\'t need a full workout.' },
      { name: 'Zone 2 Cardio',                   detail: 'Low-intensity steady-state — where you can still hold a conversation. Research shows it significantly reduces anxiety.' },
      { name: 'Strength Training',               detail: 'Lifting weights improves self-efficacy and has been shown in multiple studies to reduce symptoms of depression.' },
      { name: 'Yoga or Stretching',              detail: 'Even 10 minutes of slow, intentional movement calms the nervous system. See the Mobility section for routines.' },
    ]
  },
  {
    id: 'apps',
    title: 'Mental Health Apps',
    icon: '📱',
    accentColor: '#8b5cf6',
    accentBg: 'rgba(139,92,246,0.08)',
    accentBorder: 'rgba(139,92,246,0.2)',
    description: 'Clinically-backed tools available on your phone:',
    items: [
      { name: 'Woebot',          detail: 'AI-assisted CBT (Cognitive Behavioral Therapy). Free. Evidence-based.',    link: 'https://woebothealth.com' },
      { name: 'Calm',            detail: 'Meditation, sleep stories, and breathing exercises.',                       link: 'https://www.calm.com' },
      { name: 'Headspace',       detail: 'Guided meditation and mindfulness. Great for beginners.',                   link: 'https://www.headspace.com' },
      { name: 'Daylio',          detail: 'Mood tracking journal — helps identify patterns between activity and mood.', link: 'https://daylio.net' },
      { name: 'Finch',           detail: 'Self-care companion app — gentle, goal-based wellbeing check-ins.',          link: 'https://finchcare.com' },
    ]
  },
  {
    id: 'selfcare',
    title: 'Daily Self-Care Habits',
    icon: '💙',
    accentColor: '#6366f1',
    accentBg: 'rgba(99,102,241,0.08)',
    accentBorder: 'rgba(99,102,241,0.2)',
    description: 'Small consistent actions compound into meaningful change:',
    items: [
      { name: 'Sleep 7–9 Hours',           detail: 'Sleep is the foundation. Poor sleep amplifies every negative emotion. Protect it like a training session.' },
      { name: 'Limit Alcohol',             detail: 'Alcohol is a depressant. Even moderate drinking disrupts sleep architecture and increases anxiety the next day.' },
      { name: 'Connect with Someone',      detail: 'Call a friend, text a family member, talk to a teammate. Social connection is a fundamental human need.' },
      { name: 'Spend Time Outside',        detail: 'Natural light regulates circadian rhythm and boosts vitamin D — both critical for mood regulation.' },
      { name: 'Eat Whole Foods',           detail: 'Gut health is directly linked to mental health. High-protein, whole-food diets support neurotransmitter production.' },
      { name: 'Write It Down',             detail: 'Journaling for 5 minutes — even just listing what happened today — externalizes rumination and creates clarity.' },
    ]
  },
  {
    id: 'professional',
    title: 'Professional Help',
    icon: '🩺',
    accentColor: '#f97316',
    accentBg: 'rgba(249,115,22,0.08)',
    accentBorder: 'rgba(249,115,22,0.2)',
    description: 'There\'s strength in asking for help. These make it easier:',
    items: [
      { name: 'Psychology Today Therapist Finder', detail: 'Search by location, insurance, specialty.',  link: 'https://www.psychologytoday.com/us/therapists' },
      { name: 'Open Path Collective',              detail: 'Affordable therapy ($30–$80/session).',      link: 'https://openpathcollective.org' },
      { name: 'BetterHelp',                        detail: 'Online therapy — video, phone, or text.',    link: 'https://www.betterhelp.com' },
      { name: 'Talkspace',                         detail: 'Licensed therapists via app.',               link: 'https://www.talkspace.com' },
      { name: 'NAMI HelpLine',                     detail: '1-800-950-NAMI (6264) — info and support.', link: 'tel:18009506264' },
    ]
  },
];

function ResourceCard({ resource }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="card" style={{ marginBottom: '0.85rem', borderColor: expanded ? resource.accentBorder : 'var(--border)', transition: 'border-color 0.15s' }}>
      <div
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', gap: '0.75rem' }}
        onClick={() => setExpanded(v => !v)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            width: 44, height: 44, borderRadius: 11, flexShrink: 0,
            background: resource.accentBg, border: `1.5px solid ${resource.accentBorder}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem',
          }}>
            {resource.icon}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{resource.title}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
              {resource.items.length} resources
            </div>
          </div>
        </div>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', flexShrink: 0 }}>{expanded ? '▲' : '▼'}</span>
      </div>

      {expanded && (
        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: `1px solid ${resource.accentBorder}` }}>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.85rem', lineHeight: 1.55 }}>
            {resource.description}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
            {resource.items.map((item, i) => (
              <div key={i} style={{
                padding: '0.75rem 1rem',
                background: resource.accentBg,
                border: `1px solid ${resource.accentBorder}`,
                borderRadius: 10,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{item.name}</div>
                  {item.link && (
                    <a
                      href={item.link}
                      target={item.link.startsWith('tel:') ? '_self' : '_blank'}
                      rel="noopener noreferrer"
                      style={{
                        fontSize: '0.72rem', fontWeight: 700,
                        color: resource.accentColor,
                        textDecoration: 'none',
                        padding: '0.2rem 0.5rem',
                        border: `1px solid ${resource.accentBorder}`,
                        borderRadius: 6,
                        flexShrink: 0,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {item.link.startsWith('tel:') ? '📞 Call' : 'Visit →'}
                    </a>
                  )}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.35rem', lineHeight: 1.5 }}>
                  {item.detail}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function MentalHealth() {
  return (
    <div className="page">
      <div className="page-header">
        <h1>Mental Health & Wellbeing</h1>
        <p>Resources, tools, and support — because fitness is more than the physical</p>
      </div>

      {/* Warm intro card */}
      <div style={{
        padding: '1.25rem 1.4rem',
        background: 'linear-gradient(135deg, rgba(99,102,241,0.07), rgba(139,92,246,0.07))',
        border: '1px solid rgba(99,102,241,0.2)',
        borderRadius: 16,
        marginBottom: '1.5rem',
      }}>
        <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>💙</div>
        <p style={{ fontSize: '0.9rem', lineHeight: 1.7, color: 'var(--text)' }}>
          Physical training and mental health are deeply connected. Stress, sleep, mood, and motivation all
          affect how you train — and how you train affects all of them back.
        </p>
        <p style={{ fontSize: '0.875rem', lineHeight: 1.65, color: 'var(--text-muted)', marginTop: '0.75rem' }}>
          This page isn't a diagnosis tool or a replacement for professional support. It's a collection of
          evidence-backed resources to help you feel better and know where to turn. <strong style={{ color: 'var(--text)' }}>You're not alone, and asking
          for help is the strongest thing you can do.</strong>
        </p>
      </div>

      {/* Crisis banner always visible at top */}
      <div style={{
        padding: '0.85rem 1.1rem',
        background: 'rgba(239,68,68,0.07)',
        border: '1px solid rgba(239,68,68,0.2)',
        borderRadius: 12,
        marginBottom: '1.5rem',
        display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap',
      }}>
        <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>🆘</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#fca5a5' }}>In crisis? You don't have to wait.</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
            Call or text <strong style={{ color: '#fca5a5' }}>988</strong> (US Suicide & Crisis Lifeline) — available 24/7, free, confidential
          </div>
        </div>
        <a href="tel:988" style={{
          padding: '0.4rem 0.9rem', borderRadius: 8,
          background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
          color: '#fca5a5', fontWeight: 700, fontSize: '0.82rem',
          textDecoration: 'none', flexShrink: 0,
        }}>
          Call 988
        </a>
      </div>

      {/* Resource cards */}
      {RESOURCES.map(r => <ResourceCard key={r.id} resource={r} />)}

      <div style={{ marginTop: '1.5rem', padding: '1rem 1.25rem', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 12 }}>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.6, textAlign: 'center' }}>
          FitTrack does not provide medical advice. The resources listed are for informational purposes only.
          If you're experiencing a mental health emergency, please contact emergency services or a crisis line immediately.
        </p>
      </div>
    </div>
  );
}
