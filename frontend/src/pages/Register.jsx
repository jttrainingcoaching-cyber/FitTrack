import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

export default function Register() {
  const { login } = useAuth();
  const [form, setForm]       = useState({ username: '', email: '', password: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const r = await api.post('/auth/register', form);
      login(r.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-card card">
        <div className="auth-logo">FitTrack</div>
        <div className="auth-title">Create account</div>
        <div className="auth-subtitle">Start tracking your fitness journey</div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              className="form-input"
              placeholder="athlete123"
              value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })}
              required
            />
          </div>
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
              required minLength={6}
            />
          </div>
          <button className="btn btn-primary" style={{ width: '100%', marginTop: '0.25rem' }} disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
