import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { usePreferences } from '../context/PreferencesContext';
import api from '../api/client';

function ToggleSwitch({ checked, onChange }) {
  return (
    <label className="toggle-switch">
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span className="toggle-slider" />
    </label>
  );
}

function ExportButton({ label, icon, endpoint, filename, type = 'csv' }) {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/export/${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Export failed');

      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      addToast(`${label} exported!`, 'success');
    } catch {
      addToast(`Failed to export ${label}`, 'error');
    }
    setLoading(false);
  };

  return (
    <button
      className="btn btn-secondary"
      onClick={handleExport}
      disabled={loading}
      style={{ gap: '0.5rem' }}
    >
      <span>{icon}</span>
      {loading ? 'Exporting…' : label}
    </button>
  );
}

export default function Settings() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { addToast } = useToast();
  const { prefs, updatePrefs } = usePreferences();
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="page">
      <div className="page-header">
        <h1>Settings</h1>
        <p>Preferences, data export, and account management</p>
      </div>

      {/* ── Appearance ── */}
      <div className="card settings-section">
        <div className="section-title">Appearance</div>

        <div className="settings-row">
          <div>
            <div className="settings-row-label">
              {theme === 'dark' ? '🌙 Dark Mode' : '☀️ Light Mode'}
            </div>
            <div className="settings-row-sub">
              {theme === 'dark'
                ? 'Easy on the eyes in low-light environments'
                : 'Bright and clean for daytime use'}
            </div>
          </div>
          <ToggleSwitch checked={theme === 'light'} onChange={toggleTheme} />
        </div>

        <div className="settings-row">
          <div>
            <div className="settings-row-label">⚡ Minimal Mode</div>
            <div className="settings-row-sub">
              Strips the dashboard down to one stat + one action. Perfect for busy days.
            </div>
          </div>
          <ToggleSwitch
            checked={!!prefs.minimal_mode}
            onChange={() => updatePrefs({ minimal_mode: !prefs.minimal_mode })}
          />
        </div>

        <div className="settings-row">
          <div>
            <div className="settings-row-label">🌸 Prenatal Mode</div>
            <div className="settings-row-sub">
              Unlocks the Prenatal Fitness guide for pregnancy and postpartum support.
            </div>
          </div>
          <ToggleSwitch
            checked={!!prefs.prenatal_mode}
            onChange={() => updatePrefs({ prenatal_mode: !prefs.prenatal_mode })}
          />
        </div>

        {!!prefs.prenatal_mode && (
          <div className="settings-row">
            <div>
              <div className="settings-row-label">I am…</div>
              <div className="settings-row-sub">Sets the default view in the Prenatal guide</div>
            </div>
            <select
              className="form-select"
              value={prefs.prenatal_role || 'pregnant'}
              onChange={e => updatePrefs({ prenatal_role: e.target.value })}
              style={{ width: 'auto', minWidth: 160 }}
            >
              <option value="pregnant">Pregnant</option>
              <option value="partner">A Partner / Support Person</option>
              <option value="postpartum">Postpartum</option>
              <option value="coach">A Coach</option>
            </select>
          </div>
        )}
      </div>

      {/* ── Export Data ── */}
      <div className="card settings-section">
        <div className="section-title">Export Your Data</div>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.25rem', lineHeight: 1.6 }}>
          Download your data as CSV files (open in Excel, Google Sheets, etc.) or as a full JSON backup.
          Your data is yours — export any time.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          <div className="settings-row">
            <div>
              <div className="settings-row-label">💪 Workout History</div>
              <div className="settings-row-sub">All sessions, exercises, sets, reps & weight</div>
            </div>
            <ExportButton
              label="Download CSV"
              icon="⬇️"
              endpoint="workouts"
              filename={`fittrack-workouts-${today}.csv`}
            />
          </div>

          <div className="settings-row">
            <div>
              <div className="settings-row-label">🥗 Nutrition Log</div>
              <div className="settings-row-sub">All meals with calories and macros</div>
            </div>
            <ExportButton
              label="Download CSV"
              icon="⬇️"
              endpoint="meals"
              filename={`fittrack-meals-${today}.csv`}
            />
          </div>

          <div className="settings-row">
            <div>
              <div className="settings-row-label">⚖️ Body Weight</div>
              <div className="settings-row-sub">Your complete weight tracking history</div>
            </div>
            <ExportButton
              label="Download CSV"
              icon="⬇️"
              endpoint="bodyweight"
              filename={`fittrack-bodyweight-${today}.csv`}
            />
          </div>

          <div className="settings-row">
            <div>
              <div className="settings-row-label">📏 Body Measurements</div>
              <div className="settings-row-sub">Body fat %, waist, chest, arms, hips</div>
            </div>
            <ExportButton
              label="Download CSV"
              icon="⬇️"
              endpoint="bodystats"
              filename={`fittrack-bodystats-${today}.csv`}
            />
          </div>

          <div className="settings-row">
            <div>
              <div className="settings-row-label">📦 Full Data Backup</div>
              <div className="settings-row-sub">Everything in one JSON file — workouts, meals, weight, stats, goals</div>
            </div>
            <ExportButton
              label="Download JSON"
              icon="💾"
              endpoint="all"
              filename={`fittrack-backup-${today}.json`}
              type="json"
            />
          </div>
        </div>
      </div>

      {/* ── Account ── */}
      <div className="card settings-section">
        <div className="section-title">Account</div>

        <div className="settings-row">
          <div>
            <div className="settings-row-label">👤 {user?.username}</div>
            <div className="settings-row-sub">{user?.email}</div>
          </div>
          <div style={{
            padding: '0.25rem 0.7rem',
            background: 'rgba(99,102,241,0.12)',
            border: '1px solid rgba(99,102,241,0.25)',
            borderRadius: 999,
            fontSize: '0.72rem',
            fontWeight: 700,
            color: 'var(--indigo)',
            textTransform: 'uppercase',
            letterSpacing: '0.07em',
          }}>
            Member
          </div>
        </div>

        <div className="settings-row">
          <div>
            <div className="settings-row-label">🚪 Sign Out</div>
            <div className="settings-row-sub">Sign out of your FitTrack account on this device</div>
          </div>
          <button className="btn btn-danger btn-sm" onClick={logout}>
            Sign Out
          </button>
        </div>
      </div>

      {/* ── Quick Links ── */}
      <div className="card settings-section">
        <div className="section-title">Resources</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          <div className="settings-row">
            <div>
              <div className="settings-row-label">💙 Mental Health & Wellbeing</div>
              <div className="settings-row-sub">Breathing techniques, crisis support, apps, and professional help</div>
            </div>
            <Link to="/mental-health" style={{ textDecoration: 'none' }}>
              <button className="btn btn-secondary btn-sm">View →</button>
            </Link>
          </div>
          {!!prefs.prenatal_mode && (
            <div className="settings-row">
              <div>
                <div className="settings-row-label">🌸 Prenatal Fitness Guide</div>
                <div className="settings-row-sub">Trimester-by-trimester guides, nutrition, and partner support</div>
              </div>
              <Link to="/prenatal" style={{ textDecoration: 'none' }}>
                <button className="btn btn-secondary btn-sm">View →</button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ── About ── */}
      <div className="card">
        <div className="section-title">About FitTrack</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {[
            { label: 'Version',  value: '2.0.0 — Phase 3' },
            { label: 'Stack',    value: 'React + Vite · Node/Express · SQLite' },
            { label: 'Storage',  value: 'Local — your data never leaves your machine' },
            { label: 'Photos',   value: 'Stored as encrypted Base64 in local database' },
          ].map(({ label, value }) => (
            <div key={label} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '0.45rem 0', borderBottom: '1px solid var(--border)',
              flexWrap: 'wrap', gap: '0.4rem',
            }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{label}</span>
              <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
