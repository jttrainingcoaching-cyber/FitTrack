import { useState, useEffect } from 'react';
import api from '../api/client';
import { useToast } from '../context/ToastContext';

function BecomeCoachForm({ onSuccess }) {
  const { addToast } = useToast();
  const [form, setForm] = useState({ bio: '', specialty: '' });
  const [saving, setSaving] = useState(false);

  const SPECIALTIES = [
    'Strength & Powerlifting',
    'Bodybuilding & Physique',
    'Fat Loss & Body Recomp',
    'Athletic Performance',
    'Cardio & Endurance',
    'Mobility & Flexibility',
    'General Fitness',
    'Nutrition Coaching',
    'Online Coaching',
  ];

  const handleSubmit = async () => {
    if (!form.bio || !form.specialty) {
      addToast('Please fill in bio and specialty', 'error');
      return;
    }
    setSaving(true);
    try {
      const r = await api.post('/coach/become-coach', form);
      addToast('Welcome, Coach! 🎉', 'success');
      onSuccess(r.data);
    } catch {
      addToast('Failed to set up coach profile', 'error');
    }
    setSaving(false);
  };

  return (
    <div className="card" style={{ maxWidth: 540, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🏆</div>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Become a Coach</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.35rem' }}>
          Set up your coach profile to start working with clients on FitTrack
        </p>
      </div>

      <div className="form-group">
        <label className="form-label">Specialty</label>
        <select
          className="form-select"
          value={form.specialty}
          onChange={e => setForm(f => ({ ...f, specialty: e.target.value }))}
        >
          <option value="">Select your specialty…</option>
          {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">Bio</label>
        <textarea
          className="form-input"
          style={{ minHeight: 100, resize: 'vertical' }}
          placeholder="Tell clients about your background, certifications, and coaching philosophy…"
          value={form.bio}
          onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
        />
      </div>

      <button
        className="btn btn-primary"
        style={{ width: '100%', marginTop: '0.5rem' }}
        onClick={handleSubmit}
        disabled={saving || !form.bio || !form.specialty}
      >
        {saving ? 'Setting up…' : 'Become a Coach'}
      </button>
    </div>
  );
}

function ClientCard({ client }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="card" style={{ marginBottom: '0.75rem' }}>
      <div
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', flexWrap: 'wrap', gap: '0.5rem' }}
        onClick={() => setExpanded(v => !v)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            width: 42, height: 42, borderRadius: '50%',
            background: 'rgba(99,102,241,0.15)', border: '1.5px solid rgba(99,102,241,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.1rem', fontWeight: 700, color: 'var(--indigo)', flexShrink: 0,
          }}>
            {client.username?.[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <div style={{ fontWeight: 600 }}>{client.username}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{client.email}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {client.latest_weight && (
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Weight</div>
              <div style={{ fontWeight: 700, color: 'var(--indigo)' }}>{client.latest_weight.weight} lbs</div>
            </div>
          )}
          {client.workout_streak > 0 && (
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Streak</div>
              <div style={{ fontWeight: 700, color: 'var(--orange)' }}>🔥 {client.workout_streak}d</div>
            </div>
          )}
          {client.last_workout && (
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Last Workout</div>
              <div style={{ fontWeight: 600, fontSize: '0.8rem' }}>{client.last_workout.date}</div>
            </div>
          )}
          <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{expanded ? '▲' : '▼'}</span>
        </div>
      </div>

      {expanded && (
        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
          <ClientDashboard clientId={client.id} />
        </div>
      )}
    </div>
  );
}

function ClientDashboard({ clientId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/coach/clients/${clientId}/dashboard`)
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [clientId]);

  if (loading) return <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Loading client data…</div>;
  if (!data) return <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Could not load data</div>;

  return (
    <div>
      <div className="grid-3" style={{ marginBottom: '1rem' }}>
        <div style={{ padding: '0.75rem', background: 'var(--bg-elevated)', borderRadius: 10, border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.25rem' }}>Latest Weight</div>
          <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--indigo)' }}>
            {data.recentWeights?.length > 0 ? `${data.recentWeights[data.recentWeights.length - 1]?.weight} lbs` : '—'}
          </div>
        </div>
        <div style={{ padding: '0.75rem', background: 'var(--bg-elevated)', borderRadius: 10, border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.25rem' }}>Workouts (recent)</div>
          <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--violet)' }}>{data.recentWorkouts?.length ?? 0}</div>
        </div>
        <div style={{ padding: '0.75rem', background: 'var(--bg-elevated)', borderRadius: 10, border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.25rem' }}>Today's Calories</div>
          <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--orange)' }}>
            {data.todayMeals?.reduce((s, m) => s + (m.calories || 0), 0) || '—'}
          </div>
        </div>
      </div>

      {data.recentWorkouts?.length > 0 && (
        <div>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Recent Workouts</div>
          {data.recentWorkouts.slice(0, 5).map(w => (
            <div key={w.id} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '0.5rem 0.75rem', marginBottom: '0.35rem',
              background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8,
              flexWrap: 'wrap', gap: '0.4rem',
            }}>
              <div>
                <span className={`badge badge-${w.type.toLowerCase().replace(' ', '-')}`}>{w.type}</span>
                <span style={{ fontWeight: 500, fontSize: '0.85rem', marginLeft: '0.6rem' }}>{w.name}</span>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{w.date}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Coach() {
  const { addToast } = useToast();
  const [profile, setProfile] = useState(null);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    api.get('/coach/profile')
      .then(r => {
        setProfile(r.data);
        if (r.data.coach) {
          return api.get('/coach/clients');
        }
      })
      .then(r => { if (r) setClients(r.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    setInviting(true);
    try {
      await api.post(`/coach/invite/${encodeURIComponent(inviteEmail.trim())}`);
      addToast(`${inviteEmail} added as client!`, 'success');
      setInviteEmail('');
      const r = await api.get('/coach/clients');
      setClients(r.data);
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to invite client', 'error');
    }
    setInviting(false);
  };

  if (loading) return <div className="page"><div className="loading">Loading...</div></div>;

  const isCoach = profile?.coach !== null && profile?.coach !== undefined;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Coach Mode</h1>
        <p>{isCoach ? 'Manage your clients and track their progress' : 'Set up your coaching profile'}</p>
      </div>

      {!isCoach
        ? <BecomeCoachForm onSuccess={(coach) => setProfile(p => ({ ...p, coach }))} />
        : <>
            {/* Coach Profile */}
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--indigo), var(--violet))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.4rem', fontWeight: 700, color: '#fff', flexShrink: 0,
                }}>
                  {profile?.user?.username?.[0]?.toUpperCase() || '?'}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{profile?.user?.username}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--indigo)', fontWeight: 600, marginTop: '0.1rem' }}>
                    🏆 {profile?.coach?.specialty || 'Coach'}
                  </div>
                  {profile?.coach?.bio && (
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.35rem', maxWidth: 400 }}>
                      {profile.coach.bio}
                    </div>
                  )}
                </div>
                <div style={{ marginLeft: 'auto', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--violet)' }}>{clients.length}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Clients</div>
                </div>
              </div>
            </div>

            {/* Invite client */}
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <div className="section-title">Add Client</div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <input
                  className="form-input"
                  type="email"
                  placeholder="client@email.com"
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleInvite()}
                  style={{ flex: 1 }}
                />
                <button
                  className="btn btn-primary"
                  onClick={handleInvite}
                  disabled={inviting || !inviteEmail.trim()}
                  style={{ flexShrink: 0 }}
                >
                  {inviting ? 'Adding…' : 'Add Client'}
                </button>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                The client must already have a FitTrack account with that email address
              </div>
            </div>

            {/* Clients list */}
            <div>
              <div className="section-title" style={{ marginBottom: '0.85rem' }}>
                Your Clients ({clients.length})
              </div>
              {clients.length === 0
                ? <div className="card"><div className="empty"><div className="empty-icon">👥</div>No clients yet — add a client using their email above</div></div>
                : clients.map(client => <ClientCard key={client.id} client={client} />)
              }
            </div>
          </>
      }
    </div>
  );
}
