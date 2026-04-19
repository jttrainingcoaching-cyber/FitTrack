import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token              = localStorage.getItem('token');
    const username           = localStorage.getItem('username');
    const email              = localStorage.getItem('email');
    const userId             = localStorage.getItem('userId');
    const onboarding_complete = parseInt(localStorage.getItem('onboarding_complete') || '1');
    if (token) setUser({ token, username, email, userId, onboarding_complete });
    setLoading(false);
  }, []);

  const login = (data) => {
    localStorage.setItem('token',               data.token);
    localStorage.setItem('username',            data.username);
    localStorage.setItem('email',               data.email || '');
    localStorage.setItem('userId',              String(data.userId));
    localStorage.setItem('onboarding_complete', String(data.onboarding_complete ?? 1));
    setUser(data);
  };

  const logout = () => {
    ['token','username','email','userId','onboarding_complete'].forEach(k => localStorage.removeItem(k));
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
