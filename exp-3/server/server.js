const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// JWT secrets - fallback to defaults for easy setup
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'vortex_secret_access_key_987654321_long_and_secure';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'vortex_secret_refresh_key_123456789_long_and_secure';

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // Vite default port
  credentials: true
}));
app.use(express.json());

// Simulation latency middleware to showcase frontend loading states
const latencyMiddleware = (req, res, next) => {
  setTimeout(next, 400);
};

// In-memory Database
const users = [
  {
    id: '1',
    email: 'admin@vortex.io',
    password: 'admin123', // In a real-world app, hash with bcrypt!
    role: 'admin',
    name: 'Alex Vance'
  },
  {
    id: '2',
    email: 'user@vortex.io',
    password: 'user123',
    role: 'user',
    name: 'Jane Doe'
  }
];

// Active refresh tokens list (in-memory)
let refreshTokens = [];

// Helper functions for JWT
function generateAccessToken(user) {
  // 1-minute expiration so the user can easily see token expiration and refresh flow in action!
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    ACCESS_TOKEN_SECRET,
    { expiresIn: '1m' }
  );
}

function generateRefreshToken(user) {
  // Long-lived refresh token
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    REFRESH_TOKEN_SECRET,
    { expiresIn: '7d' }
  );
}

// Authentication Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  // Authorization header: Bearer <token>
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      error: 'Access Token Missing',
      message: 'Authorization header is empty or missing Bearer token.'
    });
  }

  jwt.verify(token, ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          error: 'Access Token Expired',
          message: 'The token expired at ' + err.expiredAt.toISOString() + '. Please refresh session.',
          expired: true
        });
      }
      return res.status(403).json({
        error: 'Invalid Access Token',
        message: 'Cryptographic signature verification failed. The token has been tampered with or is invalid.'
      });
    }
    req.user = decoded;
    next();
  });
}

// Role Authorization Middleware
function requireRole(role) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({
        error: 'Access Forbidden',
        message: `Requires role: ${role}. Current user role: ${req.user ? req.user.role : 'none'}`
      });
    }
    next();
  };
}

// --- API Endpoints ---

// Public Statistics
app.get('/api/public/stats', (req, res) => {
  res.json({
    status: 'success',
    timestamp: new Date().toISOString(),
    data: {
      activeSessions: refreshTokens.length,
      totalUsers: users.length,
      serverUptime: Math.floor(process.uptime()) + ' seconds',
      description: 'This is public data. No authentication was required to fetch this.'
    }
  });
});

// User Registration
app.post('/api/auth/register', latencyMiddleware, (req, res) => {
  const { email, password, name, role } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Validation Failed', message: 'Name, email, and password are required.' });
  }

  const userExists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
  if (userExists) {
    return res.status(409).json({ error: 'Conflict', message: 'Email address is already registered.' });
  }

  const newUser = {
    id: String(users.length + 1),
    email: email.toLowerCase(),
    password, // In prod, encrypt password!
    role: role || 'user',
    name
  };

  users.push(newUser);
  res.status(201).json({
    status: 'success',
    message: 'User registered successfully. You can now log in.'
  });
});

// User Login
app.post('/api/auth/login', latencyMiddleware, (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Validation Failed', message: 'Email and password are required.' });
  }

  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized', message: 'Invalid email or password.' });
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // Store refresh token in-memory
  refreshTokens.push(refreshToken);

  res.json({
    status: 'success',
    message: 'Authentication successful.',
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    }
  });
});

// Token Refresh Endpoint
app.post('/api/auth/refresh', latencyMiddleware, (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ error: 'Refresh Token Missing', message: 'Refresh token is required.' });
  }

  if (!refreshTokens.includes(refreshToken)) {
    return res.status(403).json({
      error: 'Invalid Refresh Token',
      message: 'Refresh token is expired, revoked, or invalid.'
    });
  }

  jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({
        error: 'Invalid Refresh Token',
        message: 'Refresh token signature validation failed. Please log in again.'
      });
    }

    // Refresh token is valid, check if user still exists
    const user = users.find(u => u.id === decoded.id);
    if (!user) {
      return res.status(404).json({ error: 'User Not Found', message: 'The user associated with this token no longer exists.' });
    }

    // Generate new short-lived access token
    const newAccessToken = generateAccessToken(user);
    res.json({
      status: 'success',
      accessToken: newAccessToken
    });
  });
});

// Logout Endpoint
app.post('/api/auth/logout', (req, res) => {
  const { refreshToken } = req.body;
  // Remove token from list
  refreshTokens = refreshTokens.filter(t => t !== refreshToken);
  res.json({ status: 'success', message: 'Logged out successfully, refresh token revoked.' });
});

// Protected Profile Endpoint
app.get('/api/protected/profile', authenticateToken, (req, res) => {
  res.json({
    status: 'success',
    message: 'Authorized access to profile information.',
    user: req.user,
    sensitiveData: {
      phone: '+1 (555) 019-2834',
      address: '742 Evergreen Terrace, Springfield',
      joinedAt: '2026-01-15T08:30:00Z',
      accountBalance: '$12,450.00'
    }
  });
});

// Protected Admin Secrets Endpoint
app.get('/api/protected/admin', authenticateToken, requireRole('admin'), (req, res) => {
  res.json({
    status: 'success',
    message: 'Authorized access to administrative database.',
    adminDetails: req.user,
    systemMetrics: {
      dbStatus: 'Healthy (0.8ms latency)',
      cpuUsage: '12%',
      memoryUsed: '245MB / 1024MB',
      criticalAlerts: 0,
      adminNotes: 'System kernel update scheduled for next Sunday at 02:00 UTC.'
    }
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`  Vortex Secure Auth Server is running on port ${PORT}`);
  console.log(`  Access Tokens: Expire in 1 minute (for testing)`);
  console.log(`  Refresh Tokens: Expire in 7 days`);
  console.log(`==================================================`);
});
