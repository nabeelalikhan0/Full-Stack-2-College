import React, { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff, Loader2, Sparkles } from 'lucide-react';
import { User as UserType } from '../App';

interface LoginProps {
  onLoginSuccess: (accessToken: string, refreshToken: string, user: UserType) => void;
  addLog: (method: string, path: string, headers: Record<string, string>, status: number | string, statusText: string, resBody: any) => void;
  showToast: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
}

export default function Login({ onLoginSuccess, addLog, showToast }: LoginProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('user');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Simple password strength calculation
  const getPasswordStrength = () => {
    if (!password) return { text: '', score: 0, color: 'transparent' };
    let score = 0;
    if (password.length >= 6) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    switch (score) {
      case 1: return { text: 'Weak', score: 25, color: '#ef4444' };
      case 2: return { text: 'Fair', score: 50, color: '#f59e0b' };
      case 3: return { text: 'Good', score: 75, color: '#3b82f6' };
      case 4: return { text: 'Strong', score: 100, color: '#10b981' };
      default: return { text: 'Weak', score: 25, color: '#ef4444' };
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Frontend validations
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }
    if (isRegister && !name.trim()) {
      setErrorMsg('Name is required.');
      return;
    }

    setLoading(true);
    const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
    const payload = isRegister 
      ? { email, password, name, role }
      : { email, password };
    
    const headers = { 'Content-Type': 'application/json' };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });
      const data = await response.json();

      addLog('POST', endpoint, headers, response.status, response.statusText, data);

      if (response.ok) {
        if (isRegister) {
          showToast('Account registered successfully! Please log in.', 'success');
          setIsRegister(false); // Switch to login tab
          setPassword('');
          setErrorMsg(null);
        } else {
          onLoginSuccess(data.accessToken, data.refreshToken, data.user);
        }
      } else {
        setErrorMsg(data.message || 'Authentication failed.');
      }
    } catch (err: any) {
      addLog('POST', endpoint, headers, 'ERR', 'Network Error', err.message);
      setErrorMsg('Could not connect to the backend server. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (roleType: 'admin' | 'user') => {
    setEmail(roleType === 'admin' ? 'admin@vortex.io' : 'user@vortex.io');
    setPassword(roleType === 'admin' ? 'admin123' : 'user123');
    setIsRegister(false);
    setErrorMsg(null);
  };

  const passwordStrength = getPasswordStrength();

  return (
    <div className="glass-card auth-card animate-slide-up">
      <div className="auth-header">
        <div className="auth-logo">
          <Sparkles size={24} />
        </div>
        <h2>{isRegister ? 'Create Account' : 'Welcome to Vortex'}</h2>
        <p className="auth-subtitle">
          {isRegister ? 'Register your keys to join the network' : 'Sign in to access secure payload dashboards'}
        </p>
      </div>

      {errorMsg && (
        <div className="badge badge-danger" style={{ display: 'block', width: '100%', padding: '0.75rem', marginBottom: '1.25rem', fontSize: '0.8rem', textTransform: 'none', borderRadius: '0.5rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleFormSubmit}>
        {isRegister && (
          <div className="form-group animate-fade-in">
            <label className="form-label">Full Name</label>
            <div className="input-wrapper">
              <User className="input-icon-left" size={16} />
              <input
                type="text"
                placeholder="Arthur Dent"
                className="form-input form-input-with-icon"
                value={name}
                onChange={e => setName(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Email Address</label>
          <div className="input-wrapper">
            <Mail className="input-icon-left" size={16} />
            <input
              type="text"
              placeholder="user@vortex.io"
              className="form-input form-input-with-icon"
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Password</label>
          <div className="input-wrapper">
            <Lock className="input-icon-left" size={16} />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className="form-input form-input-with-icon"
              value={password}
              onChange={e => setPassword(e.target.value)}
              disabled={loading}
            />
            <button
              type="button"
              className="input-icon-right"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {/* Password strength visualizer */}
          {isRegister && password && (
            <div className="animate-fade-in" style={{ marginTop: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Strength:</span>
                <span style={{ color: passwordStrength.color, fontWeight: 600 }}>{passwordStrength.text}</span>
              </div>
              <div className="progress-track" style={{ height: '0.25rem' }}>
                <div 
                  className="progress-bar" 
                  style={{ 
                    width: `${passwordStrength.score}%`, 
                    backgroundColor: passwordStrength.color,
                    transition: 'all 0.3s ease'
                  }} 
                />
              </div>
            </div>
          )}
        </div>

        {isRegister && (
          <div className="form-group animate-fade-in">
            <label className="form-label">Account Role</label>
            <select
              className="form-input"
              value={role}
              onChange={e => setRole(e.target.value)}
              disabled={loading}
              style={{ paddingRight: '2rem' }}
            >
              <option value="user">User (Standard Access)</option>
              <option value="admin">Administrator (Full Access)</option>
            </select>
          </div>
        )}

        <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="spinner" size={16} />
              Processing Authorization...
            </>
          ) : (
            isRegister ? 'Register Credentials' : 'Request Token Session'
          )}
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
        <button
          type="button"
          className="btn-quick-login"
          style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.85rem', textDecoration: 'underline' }}
          onClick={() => {
            setIsRegister(!isRegister);
            setErrorMsg(null);
            setPassword('');
          }}
          disabled={loading}
        >
          {isRegister ? 'Already registered? Sign In' : "Don't have an account? Sign Up"}
        </button>
      </div>

      {/* Quick Login Assist Panel */}
      {!isRegister && (
        <div className="quick-login-box">
          <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Quick Sandbox Access
          </p>
          <div className="quick-login-grid">
            <button className="btn btn-quick-login" onClick={() => handleQuickLogin('user')} disabled={loading}>
              Standard User
            </button>
            <button className="btn btn-quick-login" onClick={() => handleQuickLogin('admin')} disabled={loading}>
              Administrator
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
