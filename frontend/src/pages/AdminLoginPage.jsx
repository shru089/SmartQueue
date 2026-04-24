import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, Eye, EyeOff, ShieldCheck, AlertCircle } from 'lucide-react';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please enter credentials');
      return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 700));

    // Demo: admin/admin123
    if (username === 'admin' && password === 'admin123') {
      navigate('/admin/dashboard');
    } else {
      setError('Invalid credentials. Use admin / admin123 for demo.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--surface)' }}>
      <div className="w-full max-w-sm animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="w-16 h-16 rounded-3xl mx-auto mb-4 flex items-center justify-center shadow-card"
            style={{ background: 'var(--secondary)' }}
          >
            <ShieldCheck size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-secondary">Admin Portal</h1>
          <p className="text-sm text-gray-500 mt-1">SmartQueue — Queue Management</p>
        </div>

        {/* Form Card */}
        <div className="card shadow-card-hover">
          <form onSubmit={handleLogin} noValidate>
            <div className="mb-4">
              <label htmlFor="admin-username" className="input-label">Username</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  id="admin-username"
                  type="text"
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); setError(''); }}
                  placeholder="admin"
                  className="input-field pl-9"
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="mb-5">
              <label htmlFor="admin-password" className="input-label">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  id="admin-password"
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  placeholder="••••••••"
                  className="input-field pl-9 pr-10"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  id="toggle-password-btn"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl mb-4" style={{ background: '#FDECEA' }}>
                <AlertCircle size={14} style={{ color: '#D32F2F' }} />
                <p className="text-xs font-medium" style={{ color: '#D32F2F' }}>{error}</p>
              </div>
            )}

            <button
              id="admin-login-btn"
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center justify-center gap-2"
            >
              {loading
                ? <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                : <>
                    <ShieldCheck size={16} />
                    Sign In as Admin
                  </>
              }
            </button>
          </form>

          <div
            className="mt-4 p-3 rounded-xl text-center"
            style={{ background: 'var(--neutral-50)' }}
          >
            <p className="text-xs text-gray-500">
              Demo credentials: <span className="font-bold text-secondary">admin</span> / <span className="font-bold text-secondary">admin123</span>
            </p>
          </div>
        </div>

        <button
          id="back-to-user-btn"
          onClick={() => navigate('/')}
          className="w-full text-center text-sm text-gray-500 mt-4 hover:text-secondary transition-colors"
        >
          ← Back to User Portal
        </button>
      </div>
    </div>
  );
}
