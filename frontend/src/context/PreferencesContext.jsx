import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';
import { useAuth } from './AuthContext';

const STORAGE_KEY = 'fittrack_prefs';

const DEFAULTS = {
  minimal_mode:   0,
  prenatal_mode:  0,
  prenatal_role:  'pregnant',
  focus_exercise: '',
};

function loadLocal() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? { ...DEFAULTS, ...JSON.parse(saved) } : { ...DEFAULTS };
  } catch {
    return { ...DEFAULTS };
  }
}

const PreferencesContext = createContext({});

export function PreferencesProvider({ children }) {
  const { user } = useAuth();
  const [prefs, setPrefs] = useState(loadLocal);

  // Sync from server on login
  useEffect(() => {
    if (!user) return;
    api.get('/preferences')
      .then(r => {
        const merged = { ...DEFAULTS, ...r.data };
        setPrefs(merged);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      })
      .catch(() => {}); // keep local state if API fails
  }, [user?.userId]);

  const updatePrefs = async (changes) => {
    // Optimistic update — instant UI response
    const next = { ...prefs, ...changes };
    setPrefs(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    // Sync to server in background
    try {
      const r = await api.put('/preferences', changes);
      const synced = { ...DEFAULTS, ...r.data };
      setPrefs(synced);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(synced));
    } catch {} // local update already applied, silent fail is fine
  };

  const isMinimal  = !!prefs.minimal_mode;
  const isPrenatal = !!prefs.prenatal_mode;

  return (
    <PreferencesContext.Provider value={{ prefs, updatePrefs, isMinimal, isPrenatal }}>
      {children}
    </PreferencesContext.Provider>
  );
}

export const usePreferences = () => useContext(PreferencesContext);
