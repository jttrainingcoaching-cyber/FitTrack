import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { usePreferences } from '../context/PreferencesContext';
import { useState, useEffect } from 'react';
import api from '../api/client';

const NAV_MAIN = [
  { path: '/',           label: 'Dashboard',  icon: '⊞' },
  { path: '/workouts',   label: 'Workouts',   icon: '🏋️' },
  { path: '/nutrition',  label: 'Nutrition',  icon: '🥗' },
  { path: '/progress',   label: 'Progress',   icon: '📈' },
];

const NAV_MORE = [
  { path: '/goals',         label: 'Goals',         icon: '🎯' },
  { path: '/body-stats',    label: 'Body Stats',    icon: '📏' },
  { path: '/calculator',    label: 'Calculator',    icon: '🧮' },
  { path: '/guides',        label: 'Guides',        icon: '📚' },
  { path: '/photos',        label: 'Photos',        icon: '📸' },
  { path: '/mobility',      label: 'Mobility',      icon: '🧘' },
  { path: '/mental-health', label: 'Wellbeing',     icon: '💙' },
  { path: '/settings',      label: 'Settings',      icon: '⚙️' },
];

export default function Navbar() {
  const { logout, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { isPrenatal } = usePreferences();
  const { pathname } = useLocation();
  const [isCoach, setIsCoach] = useState(false);

  useEffect(() => {
    if (!user) return;
    api.get('/coach/profile')
      .then(r => { if (r.data?.coach) setIsCoach(true); })
      .catch(() => {});
  }, [user]);

  const ALL_NAV = [
    ...NAV_MAIN,
    ...NAV_MORE,
    ...(isCoach   ? [{ path: '/coach',    label: 'Coaching', icon: '🏆' }] : []),
    ...(isPrenatal ? [{ path: '/prenatal', label: 'Prenatal', icon: '🌸' }] : []),
  ];

  const BOTTOM_NAV = [
    { path: '/',          label: 'Home',      icon: '⊞' },
    { path: '/workouts',  label: 'Workouts',  icon: '🏋️' },
    { path: '/nutrition', label: 'Nutrition', icon: '🥗' },
    { path: '/progress',  label: 'Progress',  icon: '📈' },
    { path: '/guides',    label: 'Guides',    icon: '📚' },
    { path: '/settings',  label: 'Settings',  icon: '⚙️' },
  ];

  return (
    <>
      {/* ── Desktop top bar ── */}
      <nav className="navbar">
        <div className="navbar-brand">FitTrack</div>
        <div className="navbar-links">
          {ALL_NAV.map(({ path, label, icon }) => (
            <Link key={path} to={path} className={`nav-link ${pathname === path ? 'active' : ''}`}>
              <span>{icon}</span>{label}
            </Link>
          ))}
        </div>
        <div className="navbar-user">
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <span>{user?.username}</span>
          <button className="btn-ghost" onClick={logout}>Logout</button>
        </div>
      </nav>

      {/* ── Mobile bottom bar ── */}
      <nav className="bottom-nav">
        <div className="bottom-nav-inner">
          {BOTTOM_NAV.map(({ path, label, icon }) => (
            <Link key={path} to={path} className={`bottom-nav-link ${pathname === path ? 'active' : ''}`}>
              <span className="nav-icon">{icon}</span>
              <span>{label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
