import React, { useState, useEffect } from 'react';
import './App.css';

const API_BASE = 'http://localhost:8080';

export default function App() {
  const [backendOnline, setBackendOnline] = useState(false);
  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');

  // Canary Deployment State
  const [canaryWeight, setCanaryWeight] = useState(10);
  const [metrics, setMetrics] = useState({
    totalRequests: 0,
    stableRequests: 0,
    canaryRequests: 0,
    actualCanaryPercentage: '0.0%',
    lastRoutedTo: 'None'
  });
  const [lastResponse, setLastResponse] = useState(null);
  const [trafficLog, setTrafficLog] = useState([]);

  // Contract Testing State
  const [contractResult, setContractResult] = useState(null);
  const [contractLoading, setContractLoading] = useState(false);

  // Unit Test Calculator State
  const [calcA, setCalcA] = useState(2);
  const [calcB, setCalcB] = useState(3);
  const [calcResult, setCalcResult] = useState(null);

  // Fetch initial posts & check backend health
  const checkHealth = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/posts`);
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
        setBackendOnline(true);
      } else {
        setBackendOnline(false);
      }
    } catch (e) {
      setBackendOnline(false);
    }
  };

  const fetchMetrics = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/canary/metrics`);
      if (res.ok) {
        const data = await res.json();
        setMetrics(data);
        setCanaryWeight(data.configuredPercentage);
      }
    } catch (e) {
      // offline
    }
  };

  useEffect(() => {
    checkHealth();
    fetchMetrics();
    const interval = setInterval(() => {
      checkHealth();
      fetchMetrics();
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Update Canary Weight
  const updateCanaryWeight = async (newWeight) => {
    try {
      const res = await fetch(`${API_BASE}/api/canary/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ canaryPercentage: newWeight })
      });
      if (res.ok) {
        setCanaryWeight(newWeight);
        fetchMetrics();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Send Single Routed Request
  const sendRoutedRequest = async (forceCanary = false) => {
    try {
      const headers = {};
      if (forceCanary) headers['X-Canary-Force'] = 'true';
      const res = await fetch(`${API_BASE}/api/canary/route`, { headers });
      const data = await res.json();
      setLastResponse(data);
      setTrafficLog((prev) => [
        {
          id: Date.now() + Math.random(),
          time: new Date().toLocaleTimeString(),
          instance: data.servedBy,
          version: data.version,
          isCanary: data.servedBy.includes('Canary')
        },
        ...prev.slice(0, 19) // Keep last 20 logs
      ]);
      fetchMetrics();
    } catch (e) {
      console.error(e);
    }
  };

  // Blast Batch Traffic (50 Requests)
  const sendBatchTraffic = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/canary/batch?count=50`, { method: 'POST' });
      const data = await res.json();
      setLastResponse({
        servedBy: `Batch of 50 Requests (${data.actualCanaryPercentage} routed to Canary)`,
        version: `Current Weight: ${data.currentConfiguredWeight}`,
        message: 'Batch traffic burst processed according to Canary weights.'
      });
      fetchMetrics();
    } catch (e) {
      console.error(e);
    }
  };

  // Reset Canary Metrics
  const resetCanaryMetrics = async () => {
    try {
      await fetch(`${API_BASE}/api/canary/reset`, { method: 'POST' });
      setTrafficLog([]);
      setLastResponse(null);
      fetchMetrics();
    } catch (e) {
      console.error(e);
    }
  };

  // Contract Testing: Verify Compliant vs Breaking Payload
  const testContract = async (type) => {
    setContractLoading(true);
    try {
      const sampleRes = await fetch(`${API_BASE}/api/contract/sample/${type}`);
      const payload = await sampleRes.json();
      const verifyRes = await fetch(`${API_BASE}/api/contract/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await verifyRes.json();
      setContractResult({ ...data, testedType: type, payloadSent: payload });
    } catch (e) {
      console.error(e);
    } finally {
      setContractLoading(false);
    }
  };

  // Calculator Service Unit Test Endpoint
  const runCalculator = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/calculator/add?a=${calcA}&b=${calcB}`);
      const data = await res.json();
      setCalcResult(data.result);
    } catch (e) {
      console.error(e);
    }
  };

  // Create Post
  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!title) return;
    try {
      await fetch(`${API_BASE}/api/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content: content || 'Demo post for CI/CD automated pipeline testing.',
          author: author || 'Student QA',
          version: 'v1.0.0'
        })
      });
      setTitle('');
      setContent('');
      setAuthor('');
      checkHealth();
    } catch (e) {
      console.error(e);
    }
  };

  const total = metrics.totalRequests || 0;
  const canaryPctNum = total > 0 ? (metrics.canaryRequests / total) * 100 : canaryWeight;

  return (
    <div className="container">
      {/* Header */}
      <header className="header">
        <div className="header-top">
          <div className="badge">Unit 3 • Experiment 9</div>
          <div className={`status-pill ${backendOnline ? 'online' : 'offline'}`}>
            <span className="dot"></span>
            {backendOnline ? 'Backend Online (Port 8080)' : 'Backend Offline'}
          </div>
        </div>
        <h1>CI/CD Pipeline with Testing & Staged Deployment</h1>
        <p className="subtitle">
          Automated Testing (Unit, MockMvc API, Contract Tests) • Containerization • GitHub Actions • Canary Deployment
        </p>
      </header>

      {/* CI/CD Pipeline Visualizer */}
      <section className="card pipeline-card">
        <h2>🚀 Complete CI/CD Automated Workflow</h2>
        <div className="pipeline-steps">
          <div className="step-box active">
            <div className="step-num">1</div>
            <div className="step-info">
              <strong>Code Push</strong>
              <span>git push main</span>
            </div>
          </div>
          <div className="arrow">➔</div>
          <div className="step-box active">
            <div className="step-num">2</div>
            <div className="step-info">
              <strong>CI Trigger</strong>
              <span>GitHub Actions</span>
            </div>
          </div>
          <div className="arrow">➔</div>
          <div className="step-box active">
            <div className="step-num">3</div>
            <div className="step-info">
              <strong>Build & Compile</strong>
              <span>mvn clean compile</span>
            </div>
          </div>
          <div className="arrow">➔</div>
          <div className="step-box active">
            <div className="step-num">4</div>
            <div className="step-info">
              <strong>Automated Tests</strong>
              <span>JUnit 5 & MockMvc (18/18)</span>
            </div>
          </div>
          <div className="arrow">➔</div>
          <div className="step-box active">
            <div className="step-num">5</div>
            <div className="step-info">
              <strong>Docker Build</strong>
              <span>Dockerfile Container</span>
            </div>
          </div>
          <div className="arrow">➔</div>
          <div className="step-box canary-step">
            <div className="step-num">6</div>
            <div className="step-info">
              <strong>Canary Rollout</strong>
              <span>Staged Traffic Split</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid: Canary Deployment & Contract Testing */}
      <div className="grid-2">
        {/* Section 1: Canary Deployment Controller */}
        <section className="card">
          <div className="card-header">
            <h2>🎯 Assignment 5: Canary Deployment Strategy</h2>
            <button className="btn-secondary btn-sm" onClick={resetCanaryMetrics}>Reset Stats</button>
          </div>
          <p className="description">
            Gradually route real user traffic between <strong>Stable (v1.0.0)</strong> and <strong>Canary (v2.0.0)</strong> to detect production regressions with zero downtime.
          </p>

          <div className="weight-control">
            <div className="weight-label">
              <span>Target Canary Traffic Weight:</span>
              <strong className="canary-highlight">{canaryWeight}%</strong>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={canaryWeight}
              onChange={(e) => updateCanaryWeight(parseInt(e.target.value))}
              className="slider"
            />
            <div className="quick-buttons">
              <button className={`chip ${canaryWeight === 0 ? 'active' : ''}`} onClick={() => updateCanaryWeight(0)}>0% (Stable Only)</button>
              <button className={`chip ${canaryWeight === 10 ? 'active' : ''}`} onClick={() => updateCanaryWeight(10)}>10% (Default Canary)</button>
              <button className={`chip ${canaryWeight === 25 ? 'active' : ''}`} onClick={() => updateCanaryWeight(25)}>25% (Expanded)</button>
              <button className={`chip ${canaryWeight === 50 ? 'active' : ''}`} onClick={() => updateCanaryWeight(50)}>50% (Half Rollout)</button>
              <button className={`chip ${canaryWeight === 100 ? 'active' : ''}`} onClick={() => updateCanaryWeight(100)}>100% (Promoted)</button>
            </div>
          </div>

          {/* Traffic Split Visual Bar */}
          <div className="split-bar-wrapper">
            <div className="bar-labels">
              <span>Stable v1: {Math.max(0, 100 - Math.round(canaryPctNum))}%</span>
              <span>Canary v2: {Math.round(canaryPctNum)}%</span>
            </div>
            <div className="split-progress">
              <div className="bar-stable" style={{ width: `${100 - canaryPctNum}%` }}></div>
              <div className="bar-canary" style={{ width: `${canaryPctNum}%` }}></div>
            </div>
          </div>

          {/* Metrics summary cards */}
          <div className="metrics-grid">
            <div className="metric-box">
              <span className="m-label">Total Requests</span>
              <span className="m-value">{metrics.totalRequests}</span>
            </div>
            <div className="metric-box">
              <span className="m-label">Stable v1 Hits</span>
              <span className="m-value stable-text">{metrics.stableRequests}</span>
            </div>
            <div className="metric-box">
              <span className="m-label">Canary v2 Hits</span>
              <span className="m-value canary-text">{metrics.canaryRequests}</span>
            </div>
            <div className="metric-box">
              <span className="m-label">Actual Canary %</span>
              <span className="m-value">{metrics.actualCanaryPercentage || '0.0%'}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-row">
            <button className="btn-primary" onClick={() => sendRoutedRequest(false)}>
              Send 1 Request
            </button>
            <button className="btn-secondary" onClick={() => sendRoutedRequest(true)}>
              Force Canary (Header)
            </button>
            <button className="btn-accent" onClick={sendBatchTraffic}>
              Blast 50 Requests (Traffic Burst)
            </button>
          </div>

          {/* Last Response Inspector */}
          {lastResponse && (
            <div className="inspector-box">
              <div className="inspector-title">
                <span>Last Routed Response:</span>
                <span className={`tag ${lastResponse.servedBy?.includes('Canary') ? 'tag-canary' : 'tag-stable'}`}>
                  {lastResponse.servedBy}
                </span>
              </div>
              <pre className="json-code">{JSON.stringify(lastResponse, null, 2)}</pre>
            </div>
          )}

          {/* Real-time traffic log */}
          {trafficLog.length > 0 && (
            <div className="traffic-history">
              <h4>Recent Request Routing Stream:</h4>
              <div className="log-chips">
                {trafficLog.map((log) => (
                  <span key={log.id} className={`chip-log ${log.isCanary ? 'canary-pill' : 'stable-pill'}`}>
                    {log.isCanary ? '🐥 v2 Canary' : '🛡️ v1 Stable'}
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Section 2: Contract Testing Laboratory */}
        <section className="card">
          <h2>🤝 Contract Testing (Pact Concept)</h2>
          <p className="description">
            Directly replicates the scenario in <strong>Experiment 9 PDF</strong>:
            <br />
            Frontend expects: <code>{'{ name: "XYZ" }'}</code> | Backend sends: <code>{'{ username: "XYZ" }'}</code>
            <br />
            Contract Testing intercepts schema drift before breaking changes hit production!
          </p>

          <div className="contract-buttons">
            <button
              className="btn-success"
              onClick={() => testContract('compliant')}
              disabled={contractLoading}
            >
              Verify Compliant Contract (name)
            </button>
            <button
              className="btn-danger"
              onClick={() => testContract('breaking')}
              disabled={contractLoading}
            >
              Simulate Breaking Schema (username)
            </button>
          </div>

          {contractResult && (
            <div className={`contract-card ${contractResult.contractStatus === 'PASSED' ? 'contract-pass' : 'contract-fail'}`}>
              <div className="contract-header">
                <h3>Contract Status: {contractResult.contractStatus}</h3>
                <span className="tested-tag">Mode: {contractResult.testedType}</span>
              </div>
              <p>{contractResult.explanation}</p>

              {contractResult.discrepancies?.length > 0 && (
                <div className="discrepancy-list">
                  <strong>🚨 Breaking Discrepancy Caught:</strong>
                  <ul>
                    {contractResult.discrepancies.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="payload-inspect">
                <small>Payload Verified by Contract:</small>
                <pre>{JSON.stringify(contractResult.payloadSent, null, 2)}</pre>
              </div>
            </div>
          )}

          {/* Unit Testing: Calculator Logic */}
          <div className="calculator-section">
            <h3>⚡ Assignment 1: Unit Testing (Calculator Logic)</h3>
            <p className="description">
              As defined on PDF Page 2: <code>calculator.add(2, 3) = 5</code>
            </p>
            <div className="calc-inputs">
              <input
                type="number"
                value={calcA}
                onChange={(e) => setCalcA(parseInt(e.target.value) || 0)}
              />
              <span>+</span>
              <input
                type="number"
                value={calcB}
                onChange={(e) => setCalcB(parseInt(e.target.value) || 0)}
              />
              <button className="btn-secondary" onClick={runCalculator}>Run Add()</button>
              {calcResult !== null && <span className="calc-res">= {calcResult}</span>}
            </div>
          </div>
        </section>
      </div>

      {/* Section 3: REST API & Posts Manager (MockMvc Integration Test Endpoint) */}
      <section className="card posts-card">
        <div className="card-header">
          <h2>📋 Assignment 2: MockMvc API Integration (/api/posts)</h2>
          <span className="post-count-badge">{posts.length} Live Records</span>
        </div>

        <form onSubmit={handleCreatePost} className="post-form">
          <input
            type="text"
            placeholder="Post Title (e.g., Continuous Delivery with Testcontainers)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Author (e.g., DevOps Architect)"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
          />
          <input
            type="text"
            placeholder="Content..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <button type="submit" className="btn-primary">Create Post (POST /posts)</button>
        </form>

        <div className="posts-list">
          {posts.map((post) => (
            <div key={post.id} className="post-item">
              <div className="post-meta">
                <span className="post-id">ID: #{post.id}</span>
                <span className="post-version">{post.version || 'v1.0.0'}</span>
                <span className="post-author">{post.author}</span>
              </div>
              <h3 className="post-title">{post.title}</h3>
              <p className="post-body">{post.content}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>Experiment 9: CI/CD Pipeline with Testing & Deployment • Prepared for SEM-5</p>
      </footer>
    </div>
  );
}

