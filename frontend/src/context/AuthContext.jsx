import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token    = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    const email    = localStorage.getItem('email');
    const userId   = localStorage.getItem('userId');
    if (token) setUser({ token, username, email, userId });
    setLoading(false);
  }, []);

  const login = (data) => {
    localStorage.setItem('token',    data.token);
    localStorage.setItem('username', data.username);
    localStorage.setItem('email',    data.email || '');
    localStorage.setItem('userId',   String(data.userId));
    setUser(data);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('email');
    localStorage.removeItem('userId');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
