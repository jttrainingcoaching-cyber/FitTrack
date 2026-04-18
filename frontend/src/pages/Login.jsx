import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

export default function Login() {
  const { login } = useAuth();
  const [form, setForm]     = useState({ email: '', password: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (email, password) => {
    setError('');
    setLoading(true);
    try {
      const r = await api.post('/auth/login', { email, password });
      login(r.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
    setLoading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    submit(form.email, form.password);
  };

  const demoLogin = () => submit('demo@fittrack.app', 'demo123');

  return (
    <div className="auth-page">
      <div className="auth-card card">
        <div className="auth-logo">FitTrack</div>
        <div className="auth-title">Welcome back</div>
        <div className="auth-subtitle">Sign in to your account</div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              className="form-input" type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="form-input" type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>
          <button className="btn btn-primary" style={{ width: '100%', marginTop: '0.25rem' }} disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <button
          className="btn btn-secondary"
          style={{ width: '100%', marginTop: '0.6rem' }}
          onClick={demoLogin}
          disabled={loading}
        >
          Try Demo Account
        </button>

        <div className="auth-footer">
          No account? <Link to="/register">Create one</Link>
        </div>
      </div>
    </div>
  );
}
