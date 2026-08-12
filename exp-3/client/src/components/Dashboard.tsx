import React, { useState, useEffect } from 'react';
import { Shield, Key, Terminal, Database, Activity, RefreshCw, AlertTriangle, HelpCircle } from 'lucide-react';
import { User, LogEntry, StorageType, decodeJwt } from '../App';

interface DashboardProps {
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
  refreshToken: string | null;
  user: User;
  storageType: StorageType;
  updateStorageType: (type: StorageType) => void;
  logs: LogEntry[];
  addLog: (method: string, path: string, headers: Record<string, string>, status: number | string, statusText: string, resBody: any) => void;
  showToast: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
  handleSilentRefresh: () => void;
  handleLogout: () => void;
}

export default function Dashboard({
  accessToken,
  setAccessToken,
  refreshToken,
  user,
  storageType,
  updateStorageType,
  logs,
  addLog,
  showToast,
  handleSilentRefresh,
  handleLogout
}: DashboardProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [percentLeft, setPercentLeft] = useState<number>(100);
  const [activeTab, setActiveTab] = useState<'raw' | 'decoded'>('decoded');
  const [apiLoading, setApiLoading] = useState<string | null>(null);
  
  // State for tampered token simulation
  const [isTampered, setIsTampered] = useState(false);
  const [backupToken, setBackupToken] = useState<string | null>(null);

  // Parse token segments for visual styling
  const tokenParts = accessToken ? accessToken.split('.') : [];
  const headerEncoded = tokenParts[0] || '';
  const payloadEncoded = tokenParts[1] || '';
  const signatureEncoded = tokenParts[2] || '';

  // Decode Header and Payload segments for details view
  const headerDecoded = accessToken ? decodeSegment(headerEncoded) : null;
  const payloadDecoded = accessToken ? decodeSegment(payloadEncoded) : null;

  function decodeSegment(base64Url: string) {
    try {
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      return JSON.stringify(JSON.parse(window.atob(base64)), null, 2);
    } catch (e) {
      return 'Failed to decode segment.';
    }
  }

  // Token Expiration Countdown Loop
  useEffect(() => {
    if (!accessToken) return;
    
    const decoded = decodeJwt(accessToken);
    if (!decoded || !decoded.exp || !decoded.iat) return;

    const interval = setInterval(() => {
      const currentUnix = Math.floor(Date.now() / 1000);
      const remaining = Math.max(0, decoded.exp! - currentUnix);
      const totalDuration = decoded.exp! - decoded.iat!;
      const percent = (remaining / totalDuration) * 100;

      setTimeLeft(remaining);
      setPercentLeft(percent);

      if (remaining === 0) {
        clearInterval(interval);
        showToast('Access token has expired! Protected requests will now fail.', 'warning');
      }
    }, 1000);

    // Initial run
    const currentUnix = Math.floor(Date.now() / 1000);
    const remaining = Math.max(0, decoded.exp! - currentUnix);
    const totalDuration = decoded.exp! - decoded.iat!;
    setTimeLeft(remaining);
    setPercentLeft((remaining / totalDuration) * 100);

    return () => clearInterval(interval);
  }, [accessToken, showToast]);

  // Performs HTTP requests and records the operation details inside the API Console
  const triggerApi = async (type: 'public' | 'profile' | 'admin') => {
    let endpoint = '';
    const headers: Record<string, string> = {};

    if (type === 'public') {
      endpoint = '/api/public/stats';
    } else if (type === 'profile') {
      endpoint = '/api/protected/profile';
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }
    } else if (type === 'admin') {
      endpoint = '/api/protected/admin';
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }
    }

    setApiLoading(type);
    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        headers
      });
      const responseData = await response.json();
      
      addLog('GET', endpoint, headers, response.status, response.statusText, responseData);

      if (response.ok) {
        showToast(`Request success: ${type.toUpperCase()}`, 'success');
      } else {
        if (responseData.expired) {
          showToast('Request rejected: Access Token Expired', 'error');
        } else {
          showToast(`Request rejected: ${response.status} ${response.statusText}`, 'error');
        }
      }
    } catch (err: any) {
      addLog('GET', endpoint, headers, 'ERR', 'Network Error', err.message);
      showToast('Network error triggering API.', 'error');
    } finally {
      setApiLoading(null);
    }
  };

  // Simulated manipulation of JWT to demonstrate signing integrity checks
  const handleTamperToken = () => {
    if (!accessToken) return;

    if (isTampered) {
      // Restore back from backup token
      if (backupToken) {
        setAccessToken(backupToken);
        setBackupToken(null);
        setIsTampered(false);
        showToast('Original cryptographically valid JWT restored.', 'success');
      }
    } else {
      // Append characters to signature, corrupting the HMAC verification
      setBackupToken(accessToken);
      const tampered = accessToken + 'xyz_tampered';
      setAccessToken(tampered);
      setIsTampered(true);
      showToast('JWT signature modified! Signature check will now fail on backend.', 'warning');
    }
  };

  // Get progress bar color based on time remaining
  const getProgressBarColor = () => {
    if (timeLeft <= 0) return 'var(--danger)';
    if (timeLeft <= 10) return 'var(--danger)';
    if (timeLeft <= 30) return 'var(--warning)';
    return 'var(--success)';
  };

  return (
    <div className="dashboard-grid">
      
      {/* LEFT COLUMN: Controls, Terminal, Storage */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Session Status Panel */}
        <section className="glass-card monitor-panel">
          <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
              <Activity size={18} className="animate-pulse" style={{ color: 'var(--primary)' }} />
              Session Status Monitor
            </h3>
            {timeLeft > 0 ? (
              <span className="badge badge-success">Session Active</span>
            ) : (
              <span className="badge badge-danger" style={{ animation: 'pulse 1.5s infinite' }}>Session Expired</span>
            )}
          </div>

          <div className="timer-container">
            <div className="timer-labels">
              <span style={{ color: 'var(--text-secondary)' }}>Access Token Expiration:</span>
              <span style={{ fontFamily: 'monospace', fontWeight: 'bold', color: getProgressBarColor() }}>
                {timeLeft > 0 ? `${timeLeft}s remaining` : 'EXPIRED (0s)'}
              </span>
            </div>
            
            <div className="progress-track">
              <div 
                className="progress-bar"
                style={{ 
                  width: `${percentLeft}%`, 
                  backgroundColor: getProgressBarColor(),
                  animation: timeLeft <= 10 && timeLeft > 0 ? 'pulse 1s infinite' : 'none'
                }}
              />
            </div>
            
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Access token is deliberately set to 1-minute expiration in this lab sandbox to let you easily witness session timeouts and try sliding refreshes.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
            <button 
              className="btn btn-primary" 
              onClick={handleSilentRefresh} 
              style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
            >
              <RefreshCw size={14} />
              Refresh Session (Use Refresh Token)
            </button>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
              Requesting /auth/refresh swaps the refresh token for a fresh 1-minute access token without asking for credentials again.
            </p>
          </div>
        </section>

        {/* API Endpoint Panel */}
        <section className="glass-card api-console-card">
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Terminal size={18} style={{ color: 'var(--secondary)' }} />
            API Request Simulator
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
            Dispatch requests to Node.js backend routes. Monitor the headers injected and response codes below.
          </p>

          <div className="api-buttons-grid">
            <button 
              className="btn btn-secondary" 
              onClick={() => triggerApi('public')}
              disabled={!!apiLoading}
            >
              Get Public Stats
            </button>
            <button 
              className="btn btn-secondary" 
              onClick={() => triggerApi('profile')}
              disabled={!!apiLoading}
              style={{ borderLeft: '3px solid var(--primary)' }}
            >
              Get User Profile
            </button>
            <button 
              className="btn btn-secondary" 
              onClick={() => triggerApi('admin')}
              disabled={!!apiLoading}
              style={{ borderLeft: '3px solid var(--danger)' }}
            >
              Get Admin Secrets
            </button>
          </div>

          {/* Terminal Box */}
          <div className="terminal-window">
            <div className="terminal-header">
              <div className="terminal-dots">
                <div className="terminal-dot" />
                <div className="terminal-dot" />
                <div className="terminal-dot" />
              </div>
              <span className="terminal-title">HTTP Request/Response Console</span>
            </div>
            
            <div className="terminal-body">
              {logs.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0', fontSize: '0.75rem' }}>
                  No request activities logged yet. Click any API button above to dispatch a request.
                </div>
              ) : (
                logs.map(log => (
                  <div key={log.id} className="console-entry animate-fade-in">
                    <div className="console-req-line">
                      <span>{log.method} {log.path}</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>{log.timestamp}</span>
                    </div>
                    <pre className="console-headers">
{`Request Headers:
  Content-Type: application/json
  ${log.headers}`}
                    </pre>
                    <div className={`console-res-status ${Number(log.status) >= 200 && Number(log.status) < 300 ? 'success' : 'error'}`}>
                      Response Status: {log.status} {log.statusText}
                    </div>
                    <pre className="console-res-body">{log.resBody}</pre>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Security & Client-side Storage Panel */}
        <section className="glass-card security-card">
          <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Database size={18} style={{ color: 'var(--success)' }} />
            Security & Client-side Token Storage
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            JWT authentication is stateless. The token must be saved locally. Choose where the long-lived session Refresh Token is stored:
          </p>

          <div className="storage-select-grid">
            <div 
              className={`storage-option ${storageType === 'memory' ? 'active' : ''}`}
              onClick={() => updateStorageType('memory')}
            >
              <h4>In-Memory State</h4>
              <p>React State variable</p>
            </div>
            <div 
              className={`storage-option ${storageType === 'session' ? 'active' : ''}`}
              onClick={() => updateStorageType('session')}
            >
              <h4>sessionStorage</h4>
              <p>Browser Session tab</p>
            </div>
            <div 
              className={`storage-option ${storageType === 'local' ? 'active' : ''}`}
              onClick={() => updateStorageType('local')}
            >
              <h4>localStorage</h4>
              <p>Persistent device store</p>
            </div>
          </div>

          <div className="storage-security-text">
            {storageType === 'memory' && (
              <p>
                <strong>Security Impact (Memory):</strong> Very Secure against XSS (Cross-Site Scripting) since scripts cannot read closures easily. However, refreshing the page or closing the tab will completely wipe the session, requiring credentials again.
              </p>
            )}
            {storageType === 'session' && (
              <p>
                <strong>Security Impact (sessionStorage):</strong> Moderate security. Survives page reloads. However, it is vulnerable to XSS; malicious scripts injected into the page can access <code>sessionStorage</code> and extract tokens. Token is cleared when closing the tab.
              </p>
            )}
            {storageType === 'local' && (
              <p>
                <strong>Security Impact (localStorage):</strong> High convenience, high risk. Token persists forever even when browser/tab is closed. However, it is highly vulnerable to XSS data theft. In production systems, storing high-privilege refresh tokens in localStorage is discouraged without strict XSS prevention measures.
              </p>
            )}
          </div>

          {/* Tampering Simulation Section */}
          <div className="tamper-controls">
            <h4 style={{ fontSize: '0.9rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertTriangle size={16} style={{ color: 'var(--warning)' }} />
              Lab Simulation: Token Integrity Attack
            </h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              JWTs are signed with a private secret key. A client can read the claims, but cannot modify them without invalidating the signature. Appending corrupted content tests signature checking:
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.25rem' }}>
              <button 
                className={`btn ${isTampered ? 'btn-secondary' : 'btn-danger'}`} 
                onClick={handleTamperToken}
                style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}
              >
                {isTampered ? 'Restore Valid Token' : 'Tamper Signature (Inject Corrupt Bits)'}
              </button>
              <span style={{ fontSize: '0.75rem', color: isTampered ? 'var(--danger)' : 'var(--text-muted)' }}>
                {isTampered ? 'WARNING: Token is corrupted.' : 'Token is cryptographically valid.'}
              </span>
            </div>
          </div>
        </section>
      </div>

      {/* RIGHT COLUMN: JWT Inspector */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <section className="glass-card jwt-inspector-card" style={{ height: '100%' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Key size={18} style={{ color: 'var(--jwt-header)' }} />
            Real-time JWT Token Inspector
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
            Here is the active short-lived JWT Access Token issued by the server. Inspect its three parts.
          </p>

          <div className="jwt-tabs">
            <button 
              className={`jwt-tab ${activeTab === 'decoded' ? 'active' : ''}`}
              onClick={() => setActiveTab('decoded')}
            >
              Decoded View
            </button>
            <button 
              className={`jwt-tab ${activeTab === 'raw' ? 'active' : ''}`}
              onClick={() => setActiveTab('raw')}
            >
              Raw Token (Base64Url)
            </button>
          </div>

          {!accessToken ? (
            <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              Access token is empty. Click "Refresh Session" to obtain a new token.
            </div>
          ) : (
            <div className="jwt-container">
              
              {activeTab === 'raw' ? (
                <div className="raw-jwt-box">
                  <span className="raw-jwt-part header">{headerEncoded}</span>
                  <span className="raw-jwt-part dot">.</span>
                  <span className="raw-jwt-part payload">{payloadEncoded}</span>
                  <span className="raw-jwt-part dot">.</span>
                  <span className="raw-jwt-part signature">{signatureEncoded}</span>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  
                  {/* Decoded Header */}
                  <div className="decoded-box">
                    <div className="decoded-header-title header">
                      <span>Header (Algorithm & Type)</span>
                      <span className="badge badge-danger" style={{ background: 'rgba(244, 63, 94, 0.15)', color: 'var(--jwt-header)' }}>Part 1</span>
                    </div>
                    <pre className="decoded-body">{headerDecoded}</pre>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', padding: '0.5rem 0.85rem', background: '#05070c', borderTop: '1px solid var(--border-color)' }}>
                      Defines the signing algorithm (e.g., HS256 = HMAC using SHA-256) and type.
                    </p>
                  </div>

                  {/* Decoded Payload */}
                  <div className="decoded-box">
                    <div className="decoded-header-title payload">
                      <span>Payload (Claims Data)</span>
                      <span className="badge badge-primary" style={{ background: 'rgba(14, 165, 233, 0.15)', color: 'var(--jwt-payload)' }}>Part 2</span>
                    </div>
                    <pre className="decoded-body">{payloadDecoded}</pre>
                    
                    {/* Explanations of Claims */}
                    <div style={{ background: '#05070c', padding: '0.65rem 0.85rem', borderTop: '1px solid var(--border-color)', fontSize: '0.7rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      <p style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Claims Dictionary:</p>
                      <div style={{ display: 'grid', gridTemplateColumns: '50px 1fr', gap: '0.25rem' }}>
                        <code style={{ color: 'var(--jwt-payload)' }}>id</code>
                        <span>User database ID.</span>
                        <code style={{ color: 'var(--jwt-payload)' }}>role</code>
                        <span>Access authorization group (e.g., admin / user).</span>
                        <code style={{ color: 'var(--jwt-payload)' }}>iat</code>
                        <span>Issued At: Unix epoch ({payloadDecoded && JSON.parse(payloadDecoded).iat})</span>
                        <code style={{ color: 'var(--jwt-payload)' }}>exp</code>
                        <span>Expiration: Unix epoch ({payloadDecoded && JSON.parse(payloadDecoded).exp})</span>
                      </div>
                    </div>
                  </div>

                  {/* Decoded Signature */}
                  <div className="decoded-box">
                    <div className="decoded-header-title signature">
                      <span>Signature (Cryptographic Verification)</span>
                      <span className="badge badge-success" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--jwt-signature)' }}>Part 3</span>
                    </div>
                    <div className="decoded-signature-body">
                      <p style={{ color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                        Signature verifies that the sender is who they claim to be and ensures the message wasn't modified in transit. It is calculated by taking the encoded header, encoded payload, signing secret key, and applying the defined algorithm:
                      </p>
                      <pre>
{`HMACSHA256(
  base64UrlEncode(header) + "." +
  base64UrlEncode(payload),
  server_private_key
)`}
                      </pre>
                      
                      <div style={{ marginTop: '0.85rem', padding: '0.5rem', background: isTampered ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', borderRadius: '0.25rem', border: `1px solid ${isTampered ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)'}`, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: isTampered ? 'var(--danger)' : 'var(--success)' }} />
                        <span style={{ fontSize: '0.725rem', fontWeight: 600, color: isTampered ? '#f87171' : '#34d399' }}>
                          {isTampered ? 'Signature Integrity Compromised (Reject Claim)' : 'Signature Verified (Stateless Trust Achieved)'}
                        </span>
                      </div>
                    </div>
                  </div>

                </div>
              )}

            </div>
          )}
        </section>
      </div>

    </div>
  );
}
