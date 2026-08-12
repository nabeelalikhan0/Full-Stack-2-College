import React, { useState, useEffect, useCallback } from 'react';
import { Shield, Key, LogOut } from 'lucide-react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  exp?: number;
  iat?: number;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  method: string;
  path: string;
  headers: string;
  status: number | string;
  statusText?: string;
  resBody: string;
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

export type StorageType = 'memory' | 'local' | 'session';

// Helper to decode JWT payloads securely on the client side
export function decodeJwt(token: string): User | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
}

export default function App() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [storageType, setStorageType] = useState<StorageType>('local');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Function to display notification toasts
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  // Helper to add logs to our mock terminal console
  const addLog = useCallback((
    method: string, 
    path: string, 
    headers: Record<string, string>, 
    status: number | string, 
    statusText: string,
    resBody: any
  ) => {
    const newEntry: LogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      method,
      path,
      headers: Object.entries(headers)
        .map(([k, v]) => `${k}: ${v.length > 30 ? v.substring(0, 30) + '...' : v}`)
        .join('\n'),
      status,
      statusText,
      resBody: typeof resBody === 'string' ? resBody : JSON.stringify(resBody, null, 2)
    };
    setLogs(prev => [newEntry, ...prev].slice(0, 30)); // Cap logs at 30 entries
  }, []);

  // Sync token storage based on type
  useEffect(() => {
    let savedRefresh: string | null = null;
    if (storageType === 'local') {
      savedRefresh = localStorage.getItem('vortex_refresh_token');
    } else if (storageType === 'session') {
      savedRefresh = sessionStorage.getItem('vortex_refresh_token');
    }

    if (savedRefresh) {
      setRefreshToken(savedRefresh);
      // Perform automatic silent refresh on load if refresh token is found
      handleSilentRefresh(savedRefresh);
    }
  }, [storageType]);

  const handleSilentRefresh = async (token: string) => {
    const headers = { 'Content-Type': 'application/json' };
    const bodyObj = { refreshToken: token };
    
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers,
        body: JSON.stringify(bodyObj),
      });
      const data = await response.json();
      
      addLog('POST', '/api/auth/refresh', headers, response.status, response.statusText, data);
      
      if (response.ok && data.accessToken) {
        setAccessToken(data.accessToken);
        const decoded = decodeJwt(data.accessToken);
        setUser(decoded);
        showToast('Session restored via Refresh Token', 'success');
      } else {
        // Expired/Invalid refresh token
        handleLogout();
        showToast('Previous session expired. Please log in.', 'info');
      }
    } catch (err: any) {
      addLog('POST', '/api/auth/refresh', headers, 'ERR', 'Network Error', err.message);
      showToast('Network error during auto-session restore.', 'error');
    }
  };

  const handleLoginSuccess = (accToken: string, refToken: string, loggedUser: User) => {
    setAccessToken(accToken);
    setRefreshToken(refToken);
    setUser(loggedUser);

    if (storageType === 'local') {
      localStorage.setItem('vortex_refresh_token', refToken);
    } else if (storageType === 'session') {
      sessionStorage.setItem('vortex_refresh_token', refToken);
    }

    showToast(`Welcome back, ${loggedUser.name}!`, 'success');
  };

  const handleLogout = async () => {
    if (refreshToken) {
      const headers = { 'Content-Type': 'application/json' };
      try {
        const response = await fetch('/api/auth/logout', {
          method: 'POST',
          headers,
          body: JSON.stringify({ refreshToken })
        });
        const data = await response.json();
        addLog('POST', '/api/auth/logout', headers, response.status, response.statusText, data);
      } catch (err) {
        // Silent catch for logout network errors
      }
    }

    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);

    // Clear stores
    localStorage.removeItem('vortex_refresh_token');
    sessionStorage.removeItem('vortex_refresh_token');
    
    showToast('Logged out of system successfully.', 'info');
  };

  // Switches between storage mechanisms and migrates active tokens
  const updateStorageType = (newType: StorageType) => {
    // Clear current storage locations
    localStorage.removeItem('vortex_refresh_token');
    sessionStorage.removeItem('vortex_refresh_token');

    if (refreshToken) {
      if (newType === 'local') {
        localStorage.setItem('vortex_refresh_token', refreshToken);
      } else if (newType === 'session') {
        sessionStorage.setItem('vortex_refresh_token', refreshToken);
      }
    }

    setStorageType(newType);
    showToast(`Storage mechanism updated to: ${newType}`, 'info');
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="container animate-fade-in">
      {/* Header bar */}
      <header className="dashboard-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="auth-logo" style={{ width: '2.5rem', height: '2.5rem', margin: 0, borderRadius: '0.5rem' }}>
            <Shield size={20} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem' }}>Vortex Auth</h1>
            <p style={{ fontSize: '0.75rem' }}>Secure JWT Session Simulator (Experiment 3)</p>
          </div>
        </div>

        {user && (
          <div className="header-user-info">
            <div className="user-avatar">
              {user.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{user.name}</span>
                <span className={`badge ${user.role === 'admin' ? 'badge-danger' : 'badge-primary'}`}>
                  {user.role}
                </span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.email}</p>
            </div>
            <button className="btn btn-secondary btn-danger" onClick={handleLogout} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
              <LogOut size={14} />
              Logout
            </button>
          </div>
        )}
      </header>

      {/* Main body */}
      <main>
        {!user ? (
          <div className="auth-container">
            <Login 
              onLoginSuccess={handleLoginSuccess} 
              addLog={addLog} 
              showToast={showToast} 
            />
          </div>
        ) : (
          <Dashboard 
            accessToken={accessToken}
            setAccessToken={setAccessToken}
            refreshToken={refreshToken}
            user={user}
            storageType={storageType}
            updateStorageType={updateStorageType}
            logs={logs}
            addLog={addLog}
            showToast={showToast}
            handleSilentRefresh={() => handleSilentRefresh(refreshToken!)}
            handleLogout={handleLogout}
          />
        )}
      </main>

      {/* Toast Portal */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.type}`}>
            <span style={{ fontSize: '1.1rem' }}>
              {t.type === 'success' && '✓'}
              {t.type === 'error' && '⚠'}
              {t.type === 'warning' && '⚠'}
              {t.type === 'info' && 'ℹ'}
            </span>
            <span>{t.message}</span>
            <button className="close-toast" onClick={() => removeToast(t.id)}>×</button>
          </div>
        ))}
      </div>
    </div>
  );
}
