import { useState } from 'react';
import { Shield, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface LoginProps {
  onLoginSuccess: () => void;
  onSignUpClick: () => void;
}

type UserRole = 'inspector' | 'engineer' | 'admin' | 'contractor';

const roleDescriptions: Record<UserRole, string> = {
  inspector: 'Field survey staff conducting inspections',
  engineer: 'Reviews regional zone reports and trends',
  admin: 'NHAI headquarters admin access',
  contractor: 'Assigned defect and maintenance tasks',
};

export default function Login({ onLoginSuccess, onSignUpClick }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('inspector');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message || 'Invalid credentials');
        setLoading(false);
        return;
      }

      if (data?.user) {
        if (rememberMe) {
          localStorage.setItem('rememberEmail', email);
        } else {
          localStorage.removeItem('rememberEmail');
        }
        onLoginSuccess();
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
              <Shield className="w-6 h-6 text-cyan-400" />
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-bold text-white">ReflectScan</h1>
              <p className="text-cyan-400 text-xs font-medium">India · NHAI</p>
            </div>
          </div>
          <p className="text-slate-400 text-sm">Retroreflectivity Assessment Platform</p>
        </div>

        <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl p-8 space-y-6">
          <div>
            <h2 className="text-white text-xl font-semibold mb-1">Welcome Back</h2>
            <p className="text-slate-400 text-sm">Sign in to your ReflectScan account</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@nhai.gov.in"
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">Your Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20"
                disabled={loading}
              >
                <option value="inspector">Inspector - Field Staff</option>
                <option value="engineer">Regional Engineer</option>
                <option value="admin">Admin - NHAI HQ</option>
                <option value="contractor">Contractor</option>
              </select>
              <p className="text-slate-500 text-xs mt-1.5">{roleDescriptions[role]}</p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500/20 cursor-pointer"
                disabled={loading}
              />
              <label htmlFor="remember" className="text-slate-400 text-sm cursor-pointer">
                Remember my email
              </label>
            </div>

            {error && (
              <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white font-semibold rounded-lg hover:from-cyan-600 hover:to-cyan-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <button
            type="button"
            className="w-full py-2 text-slate-400 text-sm hover:text-slate-200 transition-colors"
            disabled={loading}
          >
            Forgot Password?
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-slate-900 text-slate-500">Don't have an account?</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onSignUpClick}
            className="w-full py-2.5 border border-slate-700 text-slate-300 font-semibold rounded-lg hover:bg-slate-800 hover:border-slate-600 transition-all duration-200"
          >
            Create Account
          </button>
        </div>

        <p className="text-center text-slate-500 text-xs mt-6">
          Demo Credentials • Email: test@nhai.gov.in • Password: test123
        </p>
      </div>
    </div>
  );
}
