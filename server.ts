import express from 'express';
import path from 'path';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import * as insforge from './insforge.js';

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'vauth-jwt-secret-key-2026';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Global CORS & Public REST API Middleware for all /api/ endpoints
app.use('/api', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, api-key, secret-id, service, x-api-key, x-secret-id, x-service, service-name, Api-Key, Secret-Id, Service');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.header('Pragma', 'no-cache');
  res.header('Expires', '0');

  // Force Content-Type to application/json for API requests
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  // Handle preflight OPTIONS requests immediately
  if (req.method === 'OPTIONS') {
    return res.status(200).json({ ok: true });
  }
  next();
});

// In-Memory Database for VAuth Platform
interface DBUser {
  id: string;
  email: string;
  passwordHash: string;
  name?: string;
  createdAt: string;
}

interface DBService {
  id: string;
  userId: string;
  name: string;
  prefix: string;
  description: string;
  apiKey: string;
  secretId: string;
  createdAt: string;
}

interface DBLicense {
  id: string;
  serviceId: string;
  key: string;
  username: string;
  duration: string;
  expiresAt: string | null;
  status: 'active' | 'paused' | 'banned' | 'expired';
  rank: string;
  hwid: string | null;
  notes: string;
  createdAt: string;
  lastUsedAt: string | null;
}

interface DBRank {
  id: string;
  serviceId: string;
  name: string;
  color: string;
  createdAt: string;
}

interface DBVerificationLog {
  id: string;
  serviceId: string;
  key: string;
  serviceName: string;
  status: string;
  timestamp: string;
  ip: string;
}

const users: DBUser[] = [
  {
    id: 'user-demo-1',
    email: 'demo@vauth.dev',
    passwordHash: crypto.createHash('sha256').update('password123').digest('hex'),
    name: 'Demo Developer',
    createdAt: new Date().toISOString(),
  },
];

const services: DBService[] = [];

const licenses: DBLicense[] = [];

const ranks: DBRank[] = [];

const verificationLogs: DBVerificationLog[] = [];

// Helper Functions
function generateKey(prefix = 'VAUTH'): string {
  const cleanPrefix = (prefix || 'VAUTH').toUpperCase().replace(/[^A-Z0-9]/g, '');
  const r1 = crypto.randomBytes(2).toString('hex').toUpperCase();
  const r2 = crypto.randomBytes(2).toString('hex').toUpperCase();
  const r3 = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `${cleanPrefix}-${r1}-${r2}-${r3}`;
}

function generateApiKey(): string {
  return crypto.randomBytes(16).toString('hex');
}

function generateSecretId(): string {
  return 'sec_' + crypto.randomBytes(12).toString('hex');
}

function authenticateToken(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ detail: 'Not authenticated' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const user = users.find((u) => u.id === decoded.userId);
    if (!user) {
      return res.status(401).json({ detail: 'Invalid user account' });
    }
    (req as any).user = user;
    next();
  } catch (err) {
    return res.status(401).json({ detail: 'Token expired or invalid' });
  }
}

// AUTH API ROUTES
app.post('/api/auth/demo', (req, res) => {
  const user = users[0];
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
  return res.json({
    token,
    user: { id: user.id, email: user.email, name: user.name },
  });
});

app.post('/api/auth/register', (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password) {
    return res.status(400).json({ detail: 'Email and password are required' });
  }

  const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ detail: 'User with this email already exists' });
  }

  const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
  const newUser: DBUser = {
    id: 'user-' + Date.now(),
    email: email.toLowerCase(),
    passwordHash,
    name: name || email.split('@')[0],
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);

  const token = jwt.sign({ userId: newUser.id }, JWT_SECRET, { expiresIn: '7d' });
  return res.json({
    token,
    user: { id: newUser.id, email: newUser.email, name: newUser.name },
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ detail: 'Email and password are required' });
  }

  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  const hash = crypto.createHash('sha256').update(password).digest('hex');

  if (!user || user.passwordHash !== hash) {
    return res.status(401).json({ detail: 'Invalid email or password' });
  }

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
  return res.json({
    token,
    user: { id: user.id, email: user.email, name: user.name },
  });
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
  const user = (req as any).user as DBUser;
  return res.json({
    user: { id: user.id, email: user.email, name: user.name },
  });
});

// STATS ROUTE
app.get('/api/stats', authenticateToken, (req, res) => {
  const user = (req as any).user as DBUser;
  const userServices = services.filter((s) => s.userId === user.id);
  const userSrvIds = userServices.map((s) => s.id);
  const userLicenses = licenses.filter((l) => userSrvIds.includes(l.serviceId));

  const activeLicenses = userLicenses.filter((l) => l.status === 'active').length;
  const pausedLicenses = userLicenses.filter((l) => l.status === 'paused').length;
  const bannedLicenses = userLicenses.filter((l) => l.status === 'banned').length;
  const expiredLicenses = userLicenses.filter((l) => l.status === 'expired').length;
  const uniqueUsers = new Set(userLicenses.map((l) => l.username).filter(Boolean)).size;

  const userLogs = verificationLogs.filter((log) => userSrvIds.includes(log.serviceId));
  const totalVerifications = userLogs.length;
  const successfulVerifications = userLogs.filter((log) => log.status === 'Success').length;
  const failedVerifications = totalVerifications - successfulVerifications;

  const recentLogs = userLogs
    .slice(-15)
    .reverse();

  // Breakdown per service
  const serviceBreakdown = userServices.map((s) => {
    const srvLics = licenses.filter((l) => l.serviceId === s.id);
    const srvLogs = verificationLogs.filter((log) => log.serviceId === s.id);
    return {
      id: s.id,
      name: s.name,
      total_licenses: srvLics.length,
      active_licenses: srvLics.filter((l) => l.status === 'active').length,
      verifications_count: srvLogs.length,
    };
  });

  return res.json({
    services: userServices.length,
    licenses: userLicenses.length,
    active_licenses: activeLicenses,
    paused_licenses: pausedLicenses,
    banned_licenses: bannedLicenses,
    expired_licenses: expiredLicenses,
    users: uniqueUsers,
    total_verifications: totalVerifications,
    successful_verifications: successfulVerifications,
    failed_verifications: failedVerifications,
    service_breakdown: serviceBreakdown,
    recent_verifications: recentLogs,
  });
});

// Sync services with InsForge master table
async function syncServicesWithInsForge() {
  try {
    const dbServices = await insforge.getAllServices();
    if (Array.isArray(dbServices)) {
      const freshServices: DBService[] = dbServices
        .filter((record: any) => {
          if (!record) return false;
          const sName = String(record.name || record.service_name || record.title || record.service || '').toLowerCase();
          const sId = String(record.service_id || record.id || '').toLowerCase();
          if (sName.includes('vauth_services') || sName.includes('vauth services') || sId.includes('vauth_services')) {
            return false;
          }
          return sName.length > 0 || sId.length > 0;
        })
        .map((record: any) => {
          const sName = record.name || record.service_name || record.title || record.service || 'Servicio';
          const sId = String(record.service_id || record.id || 'srv-' + Date.now());
          return {
            id: sId,
            userId: record.user_id || record.userId || 'user-demo-1',
            name: String(sName),
            prefix: String(record.prefix || sName.slice(0, 3)).toUpperCase(),
            description: String(record.description || ''),
            apiKey: String(record.api_key || record.apiKey || generateApiKey()),
            secretId: String(record.secret_id || record.secretId || generateSecretId()),
            createdAt: String(record.created_at || record.createdAt || new Date().toISOString()),
          };
        });

      const freshIds = new Set(freshServices.map((f) => f.id));
      const freshNames = new Set(freshServices.map((f) => f.name.toLowerCase()));

      // Purge any local service that is no longer in InsForge or is a system table
      for (let i = services.length - 1; i >= 0; i--) {
        const current = services[i];
        const cName = current.name.toLowerCase();
        const cId = current.id.toLowerCase();
        const isSystem = cName.includes('vauth_services') || cName.includes('vauth services') || cId.includes('vauth_services');
        const existsInFresh = freshIds.has(current.id) || freshNames.has(cName);

        if (isSystem || !existsInFresh) {
          const deletedSrv = services.splice(i, 1)[0];
          // Clean up associated in-memory licenses and ranks
          for (let j = licenses.length - 1; j >= 0; j--) {
            if (licenses[j].serviceId === deletedSrv.id) licenses.splice(j, 1);
          }
          for (let j = ranks.length - 1; j >= 0; j--) {
            if (ranks[j].serviceId === deletedSrv.id) ranks.splice(j, 1);
          }
        }
      }

      // Update or add fresh services
      for (const fresh of freshServices) {
        const idx = services.findIndex(
          (s) => s.id === fresh.id || s.name.toLowerCase() === fresh.name.toLowerCase()
        );
        if (idx !== -1) {
          services[idx] = { ...services[idx], ...fresh };
        } else {
          services.push(fresh);
        }
      }
    }
  } catch (err: any) {
    // Quietly ignore sync errors
  }
}

// SERVICES API ROUTES
app.get('/api/services', authenticateToken, async (req, res) => {
  await syncServicesWithInsForge();
  const user = (req as any).user as DBUser;
  const userServices = services;

  const response = userServices.map((s) => {
    const srvLicenses = licenses.filter((l) => l.serviceId === s.id);
    const srvRanks = ranks.filter((r) => r.serviceId === s.id);
    return {
      id: s.id,
      user_id: s.userId,
      name: s.name,
      prefix: s.prefix,
      description: s.description,
      api_key: s.apiKey,
      secret_id: s.secretId,
      created_at: s.createdAt,
      licenses_count: srvLicenses.length,
      ranks_count: srvRanks.length,
    };
  });

  return res.json(response);
});

app.post('/api/services', authenticateToken, async (req, res) => {
  const user = (req as any).user as DBUser;
  const { name, prefix, description } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ detail: 'Service name is required' });
  }

  const apiKey = generateApiKey();
  const secretId = generateSecretId();
  const newSrv: DBService = {
    id: 'srv-' + Date.now(),
    userId: user.id,
    name: name.trim(),
    prefix: (prefix || name.slice(0, 3)).toUpperCase(),
    description: description || '',
    apiKey,
    secretId,
    createdAt: new Date().toISOString(),
  };

  services.push(newSrv);

  // Persist service to InsForge master table
  await insforge.insertServiceRecord({
    service_id: newSrv.id,
    user_id: newSrv.userId,
    name: newSrv.name,
    prefix: newSrv.prefix,
    description: newSrv.description,
    api_key: newSrv.apiKey,
    secret_id: newSrv.secretId,
    created_at: newSrv.createdAt,
  });

  // Create table in InsForge database for this service
  const tableName = insforge.getTableNameForService(newSrv.name);
  await insforge.ensureServiceTable(tableName);

  return res.json({
    service: {
      id: newSrv.id,
      user_id: newSrv.userId,
      name: newSrv.name,
      prefix: newSrv.prefix,
      description: newSrv.description,
      api_key: newSrv.apiKey,
      secret_id: newSrv.secretId,
      created_at: newSrv.createdAt,
      licenses_count: 0,
      ranks_count: 0,
    },
    api_key: apiKey,
    secret_id: secretId,
  });
});

app.get('/api/services/:id', authenticateToken, async (req, res) => {
  if (services.length === 0) {
    await syncServicesWithInsForge();
  }
  const user = (req as any).user as DBUser;
  const srv = services.find((s) => s.id === req.params.id && (s.userId === user.id || s.userId === 'user-demo-1' || !s.userId));

  if (!srv) {
    return res.status(404).json({ detail: 'Service not found' });
  }

  const srvLicenses = licenses.filter((l) => l.serviceId === srv.id);
  const srvRanks = ranks.filter((r) => r.serviceId === srv.id);

  return res.json({
    id: srv.id,
    user_id: srv.userId,
    name: srv.name,
    prefix: srv.prefix,
    description: srv.description,
    api_key: srv.apiKey,
    secret_id: srv.secretId,
    created_at: srv.createdAt,
    licenses_count: srvLicenses.length,
    ranks_count: srvRanks.length,
  });
});

app.delete('/api/services/:id', authenticateToken, async (req, res) => {
  const user = (req as any).user as DBUser;
  const index = services.findIndex((s) => s.id === req.params.id && (s.userId === user.id || s.userId === 'user-demo-1' || !s.userId));

  if (index === -1) {
    return res.status(404).json({ detail: 'Service not found' });
  }

  const deletedSrv = services.splice(index, 1)[0];
  await insforge.deleteServiceRecord(deletedSrv.id);

  const tableName = insforge.getTableNameForService(deletedSrv.name);
  await insforge.deleteServiceTable(tableName);

  // Clean up licenses and ranks
  for (let i = licenses.length - 1; i >= 0; i--) {
    if (licenses[i].serviceId === deletedSrv.id) licenses.splice(i, 1);
  }
  for (let i = ranks.length - 1; i >= 0; i--) {
    if (ranks[i].serviceId === deletedSrv.id) ranks.splice(i, 1);
  }

  return res.json({ message: 'Service deleted successfully', id: deletedSrv.id });
});

app.post('/api/services/:id/reset-api-key', authenticateToken, async (req, res) => {
  const user = (req as any).user as DBUser;
  const srv = services.find((s) => s.id === req.params.id && (s.userId === user.id || s.userId === 'user-demo-1' || !s.userId));

  if (!srv) {
    return res.status(404).json({ detail: 'Service not found' });
  }

  const newApiKey = generateApiKey();
  srv.apiKey = newApiKey;
  await insforge.updateServiceRecord(srv.id, { api_key: newApiKey });

  return res.json({ api_key: newApiKey, message: 'API key reset successfully' });
});

app.post('/api/services/:id/reset-secret-id', authenticateToken, async (req, res) => {
  const user = (req as any).user as DBUser;
  const srv = services.find((s) => s.id === req.params.id && (s.userId === user.id || s.userId === 'user-demo-1' || !s.userId));

  if (!srv) {
    return res.status(404).json({ detail: 'Service not found' });
  }

  const newSecretId = generateSecretId();
  srv.secretId = newSecretId;
  await insforge.updateServiceRecord(srv.id, { secret_id: newSecretId });

  return res.json({ secret_id: newSecretId, message: 'Secret ID reset successfully' });
});

// ALL LICENSES FOR USER (OPTIONAL QUERY service_id)
app.get('/api/licenses', authenticateToken, async (req, res) => {
  if (services.length === 0) {
    await syncServicesWithInsForge();
  }
  const user = (req as any).user as DBUser;
  const userServices = services.filter((s) => s.userId === user.id || s.userId === 'user-demo-1' || !s.userId);
  const serviceIdParam = req.query.service_id as string;

  let targetServices = userServices;
  if (serviceIdParam && serviceIdParam !== 'all') {
    targetServices = userServices.filter((s) => s.id === serviceIdParam);
  }

  for (const srv of targetServices) {
    const tableName = insforge.getTableNameForService(srv.name);
    const insRecords = await insforge.getRecords(tableName);
    if (insRecords && insRecords.length > 0) {
      for (const rec of insRecords) {
        if (!rec.license_key) continue;
        let existing = licenses.find((l) => l.serviceId === srv.id && l.key === rec.license_key);
        if (existing) {
          existing.username = rec.username || existing.username;
          existing.status = rec.status || existing.status;
          existing.rank = rec.rank || existing.rank;
          existing.hwid = rec.hwid ?? existing.hwid;
          existing.notes = rec.notes ?? existing.notes;
          existing.duration = rec.duration || existing.duration;
          existing.expiresAt = rec.expires_at ?? existing.expiresAt;
          existing.lastUsedAt = rec.last_used_at ?? existing.lastUsedAt;
        } else {
          licenses.push({
            id: rec.id || 'lic-' + Date.now(),
            serviceId: srv.id,
            key: rec.license_key,
            username: rec.username || 'unassigned',
            duration: rec.duration || '30 Days',
            expiresAt: rec.expires_at || null,
            status: rec.status || 'active',
            rank: rec.rank || 'Default',
            hwid: rec.hwid || null,
            notes: rec.notes || '',
            createdAt: rec.created_at || new Date().toISOString(),
            lastUsedAt: rec.last_used_at || null,
          });
        }
      }
    }
  }

  const targetServiceIds = new Set(targetServices.map((s) => s.id));
  const resultLicenses = licenses
    .filter((l) => targetServiceIds.has(l.serviceId))
    .map((l) => {
      const srv = services.find((s) => s.id === l.serviceId);
      return {
        id: l.id,
        service_id: l.serviceId,
        service_name: srv ? srv.name : 'Desconocido',
        key: l.key,
        username: l.username,
        duration: l.duration,
        expires_at: l.expiresAt,
        status: l.status,
        rank: l.rank,
        hwid: l.hwid,
        notes: l.notes,
        created_at: l.createdAt,
        last_used_at: l.lastUsedAt,
      };
    });

  return res.json(resultLicenses);
});

// LICENSES FOR SERVICE
app.get('/api/services/:id/licenses', authenticateToken, async (req, res) => {
  const user = (req as any).user as DBUser;
  const srv = services.find((s) => s.id === req.params.id && s.userId === user.id);

  if (!srv) {
    return res.status(404).json({ detail: 'Service not found' });
  }

  const tableName = insforge.getTableNameForService(srv.name);
  const insRecords = await insforge.getRecords(tableName);

  if (insRecords && insRecords.length > 0) {
    for (const rec of insRecords) {
      if (!rec.license_key) continue;
      const existing = licenses.find((l) => l.serviceId === srv.id && l.key === rec.license_key);
      if (existing) {
        existing.username = rec.username || existing.username;
        existing.status = rec.status || existing.status;
        existing.rank = rec.rank || existing.rank;
        existing.hwid = rec.hwid ?? existing.hwid;
        existing.notes = rec.notes ?? existing.notes;
        existing.duration = rec.duration || existing.duration;
        existing.expiresAt = rec.expires_at ?? existing.expiresAt;
        existing.lastUsedAt = rec.last_used_at ?? existing.lastUsedAt;
      } else {
        licenses.push({
          id: rec.id || 'lic-' + Date.now(),
          serviceId: srv.id,
          key: rec.license_key,
          username: rec.username || 'unassigned',
          duration: rec.duration || '30 Days',
          expiresAt: rec.expires_at || null,
          status: rec.status || 'active',
          rank: rec.rank || 'Default',
          hwid: rec.hwid || null,
          notes: rec.notes || '',
          createdAt: rec.created_at || new Date().toISOString(),
          lastUsedAt: rec.last_used_at || null,
        });
      }
    }
  }

  const srvLicenses = licenses
    .filter((l) => l.serviceId === srv.id)
    .map((l) => ({
      id: l.id,
      service_id: l.serviceId,
      key: l.key,
      username: l.username,
      duration: l.duration,
      expires_at: l.expiresAt,
      status: l.status,
      rank: l.rank,
      hwid: l.hwid,
      notes: l.notes,
      created_at: l.createdAt,
      last_used_at: l.lastUsedAt,
    }));

  return res.json(srvLicenses);
});

function parseDurationToMs(durationStr: string): number | null {
  if (!durationStr) return null;
  const lower = durationStr.toLowerCase().trim();
  if (['lifetime', 'vitalicia', 'ilimitado', 'unlimited', 'forever', '0'].includes(lower)) {
    return null;
  }

  // Check if it's a date string (e.g. ISO or YYYY-MM-DD)
  if (lower.includes('-') && !isNaN(Date.parse(lower))) {
    const diff = new Date(lower).getTime() - Date.now();
    return diff > 0 ? diff : 0;
  }

  // Regex to extract number and unit string
  // Matches e.g. "10s", "10 seconds", "10 segundos", "5m", "5 min", "5 minutos", "2h", "12 horas", "30d", "15 días", "1w", "2 semanas", "1mo", "3 meses", "1y", "2 años"
  const match = lower.match(/^(\d+)\s*([a-zñáéíóú]+)?$/);
  if (match) {
    const val = parseInt(match[1], 10);
    const unit = (match[2] || 'd').toLowerCase();

    // Seconds
    if (unit === 's' || unit === 'sec' || unit === 'secs' || unit.startsWith('seg') || unit.startsWith('second')) {
      return val * 1000;
    }
    // Minutes
    if (unit === 'm' || unit === 'min' || unit === 'mins' || unit.startsWith('minuto') || unit.startsWith('minute')) {
      return val * 60000;
    }
    // Hours
    if (unit === 'h' || unit === 'hr' || unit === 'hrs' || unit.startsWith('hor') || unit.startsWith('hour')) {
      return val * 3600000;
    }
    // Days
    if (unit === 'd' || unit === 'day' || unit === 'days' || unit.startsWith('dia') || unit.startsWith('días')) {
      return val * 86400000;
    }
    // Weeks
    if (unit === 'w' || unit === 'wk' || unit === 'wks' || unit.startsWith('week') || unit.startsWith('sem')) {
      return val * 7 * 86400000;
    }
    // Months
    if (unit === 'mo' || unit === 'mon' || unit === 'mons' || unit.startsWith('month') || unit.startsWith('mes')) {
      return val * 30 * 86400000;
    }
    // Years
    if (unit === 'y' || unit === 'yr' || unit === 'yrs' || unit.startsWith('year') || unit.startsWith('año') || unit.startsWith('ano')) {
      return val * 365 * 86400000;
    }
    // Default fallback
    return val * 86400000;
  }

  const num = parseInt(durationStr, 10);
  if (!isNaN(num) && num > 0) {
    return num * 86400000;
  }

  return 30 * 86400000;
}

function calculateExpirationDate(durationStr: string): string | null {
  const ms = parseDurationToMs(durationStr);
  if (ms === null) return null;
  return new Date(Date.now() + ms).toISOString();
}

app.post('/api/services/:id/licenses', authenticateToken, async (req, res) => {
  const user = (req as any).user as DBUser;
  const srv = services.find((s) => s.id === req.params.id && (s.userId === user.id || s.userId === 'user-demo-1' || !s.userId));

  if (!srv) {
    return res.status(404).json({ detail: 'Service not found' });
  }

  const { username, duration, rank, hwid, notes, expires_at } = req.body;

  const key = generateKey(srv.prefix || 'VAUTH');
  let expiresAt: string | null = null;

  if (expires_at) {
    expiresAt = new Date(expires_at).toISOString();
  } else if (hwid && duration && duration.toLowerCase() !== 'lifetime') {
    expiresAt = calculateExpirationDate(duration);
  }

  const newLic: DBLicense = {
    id: 'lic-' + Date.now(),
    serviceId: srv.id,
    key,
    username: username || 'unassigned',
    duration: duration || '30 Days',
    expiresAt,
    status: 'active',
    rank: rank || 'Default',
    hwid: hwid || null,
    notes: notes || '',
    createdAt: new Date().toISOString(),
    lastUsedAt: null,
  };

  licenses.push(newLic);

  const tableName = insforge.getTableNameForService(srv.name);
  await insforge.insertRecord(tableName, {
    license_key: newLic.key,
    username: newLic.username,
    duration: newLic.duration,
    status: newLic.status,
    rank: newLic.rank,
    hwid: newLic.hwid,
    notes: newLic.notes,
    expires_at: newLic.expiresAt,
    last_used_at: newLic.lastUsedAt,
  });

  return res.json({
    id: newLic.id,
    service_id: newLic.serviceId,
    key: newLic.key,
    username: newLic.username,
    duration: newLic.duration,
    expires_at: newLic.expiresAt,
    status: newLic.status,
    rank: newLic.rank,
    hwid: newLic.hwid,
    notes: newLic.notes,
    created_at: newLic.createdAt,
    last_used_at: newLic.lastUsedAt,
  });
});

app.delete('/api/services/:id/licenses/:licId', authenticateToken, async (req, res) => {
  const user = (req as any).user as DBUser;
  const srv = services.find((s) => s.id === req.params.id && s.userId === user.id);

  if (!srv) {
    return res.status(404).json({ detail: 'Service not found' });
  }

  const index = licenses.findIndex((l) => l.id === req.params.licId && l.serviceId === srv.id);
  if (index === -1) {
    return res.status(404).json({ detail: 'License not found' });
  }

  const deletedLic = licenses.splice(index, 1)[0];
  const tableName = insforge.getTableNameForService(srv.name);
  await insforge.deleteRecordByKey(tableName, deletedLic.key);

  return res.json({ message: 'License deleted successfully' });
});

app.patch('/api/services/:id/licenses/:licId', authenticateToken, async (req, res) => {
  const user = (req as any).user as DBUser;
  const srv = services.find((s) => s.id === req.params.id && (s.userId === user.id || s.userId === 'user-demo-1' || !s.userId));

  if (!srv) {
    return res.status(404).json({ detail: 'Service not found' });
  }

  const lic = licenses.find((l) => l.id === req.params.licId && l.serviceId === srv.id);
  if (!lic) {
    return res.status(404).json({ detail: 'License not found' });
  }

  const { status, hwid, rank, username, notes, duration, expires_at } = req.body;
  const updates: Record<string, any> = {};

  if (status !== undefined) {
    lic.status = status;
    updates.status = status;
  }
  if (hwid !== undefined) {
    lic.hwid = hwid && String(hwid).trim() !== '' ? String(hwid).trim() : null;
    updates.hwid = lic.hwid;
  }
  if (rank !== undefined) {
    lic.rank = rank;
    updates.rank = rank;
  }
  if (username !== undefined) {
    lic.username = username;
    updates.username = username;
  }
  if (notes !== undefined) {
    lic.notes = notes;
    updates.notes = notes;
  }
  if (duration !== undefined) {
    lic.duration = duration;
    updates.duration = duration;
    if (duration.toLowerCase() === 'lifetime' || duration.toLowerCase() === 'vitalicia') {
      lic.expiresAt = null;
      updates.expires_at = null;
    } else if (lic.expiresAt || lic.hwid) {
      lic.expiresAt = calculateExpirationDate(duration);
      updates.expires_at = lic.expiresAt;
    }
  }
  if (expires_at !== undefined) {
    lic.expiresAt = expires_at ? new Date(expires_at).toISOString() : null;
    updates.expires_at = lic.expiresAt;
  }

  const tableName = insforge.getTableNameForService(srv.name);
  await insforge.updateRecordByKey(tableName, lic.key, updates);

  return res.json({
    id: lic.id,
    service_id: lic.serviceId,
    key: lic.key,
    username: lic.username,
    duration: lic.duration,
    expires_at: lic.expiresAt,
    status: lic.status,
    rank: lic.rank,
    hwid: lic.hwid,
    notes: lic.notes,
    created_at: lic.createdAt,
    last_used_at: lic.lastUsedAt,
  });
});

// RANKS FOR SERVICE
app.get('/api/services/:id/ranks', authenticateToken, (req, res) => {
  const user = (req as any).user as DBUser;
  const srv = services.find((s) => s.id === req.params.id && s.userId === user.id);

  if (!srv) {
    return res.status(404).json({ detail: 'Service not found' });
  }

  const srvRanks = ranks
    .filter((r) => r.serviceId === srv.id)
    .map((r) => ({
      id: r.id,
      service_id: r.serviceId,
      name: r.name,
      color: r.color,
      created_at: r.createdAt,
    }));

  return res.json(srvRanks);
});

app.post('/api/services/:id/ranks', authenticateToken, (req, res) => {
  const user = (req as any).user as DBUser;
  const srv = services.find((s) => s.id === req.params.id && s.userId === user.id);

  if (!srv) {
    return res.status(404).json({ detail: 'Service not found' });
  }

  const { name, color } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ detail: 'Rank name is required' });
  }

  const newRank: DBRank = {
    id: 'rank-' + Date.now(),
    serviceId: srv.id,
    name: name.trim(),
    color: color || '#6366f1',
    createdAt: new Date().toISOString(),
  };

  ranks.push(newRank);

  return res.json({
    id: newRank.id,
    service_id: newRank.serviceId,
    name: newRank.name,
    color: newRank.color,
    created_at: newRank.createdAt,
  });
});

app.post('/api/services/:id/ranks/:name', authenticateToken, (req, res) => {
  const user = (req as any).user as DBUser;
  const srv = services.find((s) => s.id === req.params.id && s.userId === user.id);

  if (!srv) {
    return res.status(404).json({ detail: 'Service not found' });
  }

  const rankName = decodeURIComponent(req.params.name);
  const { color } = req.body;

  let existing = ranks.find((r) => r.serviceId === srv.id && r.name.toLowerCase() === rankName.toLowerCase());
  if (existing) {
    if (color) existing.color = color;
    return res.json({
      id: existing.id,
      service_id: existing.serviceId,
      name: existing.name,
      color: existing.color,
      created_at: existing.createdAt,
    });
  }

  const newRank: DBRank = {
    id: 'rank-' + Date.now(),
    serviceId: srv.id,
    name: rankName,
    color: color || '#6366f1',
    createdAt: new Date().toISOString(),
  };

  ranks.push(newRank);
  return res.json({
    id: newRank.id,
    service_id: newRank.serviceId,
    name: newRank.name,
    color: newRank.color,
    created_at: newRank.createdAt,
  });
});

// PUBLIC VERIFICATION & LICENSE SDK ENDPOINTS

// 3-CREDENTIAL SERVICE QUERY ENDPOINT FOR EXTERNAL APPLICATIONS
app.all(['/api/v1/service/query', '/api/service/query', '/api/v1/service/info'], async (req, res) => {
  if (services.length === 0) {
    await syncServicesWithInsForge();
  }

  const headerApiKey = (req.headers['api-key'] as string) || (req.headers['x-api-key'] as string);
  const headerSecretId = (req.headers['secret-id'] as string) || (req.headers['x-secret-id'] as string);
  const headerService = (req.headers['service'] as string) || (req.headers['x-service'] as string) || (req.headers['service-name'] as string);

  const apiKey = headerApiKey || req.body?.api_key || req.body?.apiKey || (req.query.api_key as string) || (req.query.apiKey as string);
  const secretId = headerSecretId || req.body?.secret_id || req.body?.secretId || (req.query.secret_id as string) || (req.query.secretId as string);
  const serviceParam = headerService || req.body?.service || req.body?.service_name || req.body?.service_id || req.body?.serviceName || (req.query.service as string) || (req.query.service_name as string) || (req.query.service_id as string);

  // Requirement: ALL 3 credentials MUST be provided!
  if (!apiKey || !secretId || !serviceParam) {
    return res.status(401).json({
      success: false,
      detail: "Acceso denegado: Para consultar la API se requieren los 3 parámetros obligatorios: 'api_key', 'secret_id' y 'service' (Nombre o ID del Servicio).",
      required_credentials: ["api_key", "secret_id", "service"],
      provided_status: {
        api_key: apiKey ? "provided" : "missing",
        secret_id: secretId ? "provided" : "missing",
        service: serviceParam ? "provided" : "missing"
      }
    });
  }

  // Find service strictly matching ALL THREE credentials
  const srv = services.find((s) => 
    s.apiKey === apiKey && 
    s.secretId === secretId && 
    (s.name.toLowerCase() === serviceParam.trim().toLowerCase() || s.id === serviceParam.trim())
  );

  if (!srv) {
    return res.status(401).json({
      success: false,
      detail: "Credenciales o nombre de servicio incorrectos. Los 3 valores (API Key, Secret ID y Servicio) deben ser válidos y coincidir entre sí."
    });
  }

  // Fetch licenses from InsForge
  const tableName = insforge.getTableNameForService(srv.name);
  const insRecords = await insforge.getRecords(tableName);

  if (insRecords && insRecords.length > 0) {
    for (const rec of insRecords) {
      if (!rec.license_key) continue;
      let existing = licenses.find((l) => l.serviceId === srv.id && l.key === rec.license_key);
      if (existing) {
        existing.username = rec.username || existing.username;
        existing.status = rec.status || existing.status;
        existing.rank = rec.rank || existing.rank;
        existing.hwid = rec.hwid ?? existing.hwid;
        existing.notes = rec.notes ?? existing.notes;
        existing.duration = rec.duration || existing.duration;
        existing.expiresAt = rec.expires_at ?? existing.expiresAt;
        existing.lastUsedAt = rec.last_used_at ?? existing.lastUsedAt;
      } else {
        licenses.push({
          id: rec.id || 'lic-' + Date.now(),
          serviceId: srv.id,
          key: rec.license_key,
          username: rec.username || 'unassigned',
          duration: rec.duration || '30 Days',
          expiresAt: rec.expires_at || null,
          status: rec.status || 'active',
          rank: rec.rank || 'Default',
          hwid: rec.hwid || null,
          notes: rec.notes || '',
          createdAt: rec.created_at || new Date().toISOString(),
          lastUsedAt: rec.last_used_at || null,
        });
      }
    }
  }

  const srvLicenses = licenses.filter((l) => l.serviceId === srv.id);

  const mappedKeys = srvLicenses.map((l) => {
    const isExpired = l.expiresAt ? new Date(l.expiresAt).getTime() < Date.now() : false;
    const isBanned = l.status === 'banned';
    const activeStatus = isBanned ? 'banned' : isExpired ? 'expired' : l.status;

    return {
      username: l.username,
      license_key: l.key,
      hwid: l.hwid || null,
      status: activeStatus,
      is_banned: isBanned,
      is_expired: isExpired,
      rank: l.rank,
      duration: l.duration,
      expires_at: l.expiresAt || (l.duration === 'Lifetime' ? 'Lifetime' : 'Pendiente de activación'),
    };
  });

  return res.json({
    users: mappedKeys,
  });
});

app.post('/api/verify', async (req, res) => {
  if (services.length === 0) {
    await syncServicesWithInsForge();
  }

  const headerApiKey = (req.headers['api-key'] as string) || (req.headers['x-api-key'] as string);
  const headerSecretId = (req.headers['secret-id'] as string) || (req.headers['x-secret-id'] as string);
  const headerService = (req.headers['service'] as string) || (req.headers['x-service'] as string) || (req.headers['service-name'] as string);

  const { api_key, secret_id, service, service_name, service_id, key, license_key, hwid } = req.body || {};

  const apiKey = headerApiKey || api_key;
  const secretId = headerSecretId || secret_id;
  const targetService = headerService || service || service_name || service_id;
  const targetKey = license_key || key;

  if (!apiKey && !secretId) {
    return res.status(400).json({ valid: false, detail: 'API Key or Secret ID required' });
  }

  const srv = services.find((s) => {
    const keyMatch = (apiKey && s.apiKey === apiKey) || (secretId && s.secretId === secretId);
    if (!keyMatch) return false;
    if (targetService) {
      return s.name.toLowerCase() === targetService.trim().toLowerCase() || s.id === targetService.trim();
    }
    return true;
  });

  if (!srv) {
    return res.status(401).json({ valid: false, detail: 'Invalid API key, Secret ID or Service credentials' });
  }

  if (!targetKey) {
    return res.status(400).json({ valid: false, detail: 'license_key required' });
  }

  const tableName = insforge.getTableNameForService(srv.name);

  // Check InsForge table
  let license = licenses.find((l) => l.serviceId === srv.id && l.key === targetKey);
  const insRecord = await insforge.findRecordByKey(tableName, targetKey);

  if (insRecord) {
    if (!license) {
      license = {
        id: insRecord.id || 'lic-' + Date.now(),
        serviceId: srv.id,
        key: insRecord.license_key,
        username: insRecord.username || 'unassigned',
        duration: insRecord.duration || '30 Days',
        expiresAt: insRecord.expires_at || null,
        status: insRecord.status || 'active',
        rank: insRecord.rank || 'Default',
        hwid: insRecord.hwid || null,
        notes: insRecord.notes || '',
        createdAt: insRecord.created_at || new Date().toISOString(),
        lastUsedAt: insRecord.last_used_at || null,
      };
      licenses.push(license);
    } else {
      license.status = insRecord.status || license.status;
      license.hwid = insRecord.hwid ?? license.hwid;
      license.rank = insRecord.rank || license.rank;
      license.expiresAt = insRecord.expires_at ?? license.expiresAt;
    }
  }

  if (!license) {
    verificationLogs.push({
      id: 'log-' + Date.now(),
      serviceId: srv.id,
      key: targetKey || 'NONE',
      serviceName: srv.name,
      status: 'Invalid Key',
      timestamp: new Date().toISOString(),
      ip: req.ip || '127.0.0.1',
    });
    return res.status(200).json({ valid: false, reason: 'not_found', detail: 'License key not found' });
  }

  if (license.status === 'banned') {
    return res.status(200).json({ valid: false, reason: 'banned', detail: 'License has been banned' });
  }

  if (license.status === 'paused') {
    return res.status(200).json({ valid: false, reason: 'paused', detail: 'License is currently paused' });
  }

  if (license.expiresAt && new Date(license.expiresAt).getTime() < Date.now()) {
    license.status = 'expired';
    await insforge.updateRecordByKey(tableName, license.key, { status: 'expired' });
    return res.status(200).json({ valid: false, reason: 'expired', detail: 'License has expired' });
  }

  // Activate expiration countdown on first redemption / use if not set
  if (!license.expiresAt && license.duration && !['lifetime', 'vitalicia', 'ilimitado', 'unlimited'].includes(license.duration.toLowerCase().trim())) {
    license.expiresAt = calculateExpirationDate(license.duration);
    await insforge.updateRecordByKey(tableName, license.key, { expires_at: license.expiresAt });
  }

  // HWID Verification
  if (hwid) {
    if (!license.hwid) {
      license.hwid = hwid; // Bind HWID on first use
      await insforge.updateRecordByKey(tableName, license.key, { hwid });
    } else if (license.hwid !== hwid) {
      verificationLogs.push({
        id: 'log-' + Date.now(),
        serviceId: srv.id,
        key: license.key,
        serviceName: srv.name,
        status: 'HWID Mismatch',
        timestamp: new Date().toISOString(),
        ip: req.ip || '127.0.0.1',
      });
      return res.status(200).json({ valid: false, reason: 'hwid_mismatch', detail: 'HWID mismatch. Reset HWID in dashboard.' });
    }
  }

  license.lastUsedAt = new Date().toISOString();
  await insforge.updateRecordByKey(tableName, license.key, { last_used_at: license.lastUsedAt });

  verificationLogs.push({
    id: 'log-' + Date.now(),
    serviceId: srv.id,
    key: license.key,
    serviceName: srv.name,
    status: 'Success',
    timestamp: new Date().toISOString(),
    ip: req.ip || '127.0.0.1',
  });

  return res.json({
    valid: true,
    message: 'License key is valid',
    license: {
      id: license.id,
      key: license.key,
      license_key: license.key,
      username: license.username,
      status: license.status,
      rank: license.rank,
      expires_at: license.expiresAt,
      hwid: license.hwid,
    },
  });
});

app.get('/api/licenses', async (req, res) => {
  const apiKey = (req.headers['api-key'] as string) || (req.headers['x-api-key'] as string) || (req.query.api_key as string);
  const secretId = (req.headers['secret-id'] as string) || (req.headers['x-secret-id'] as string) || (req.query.secret_id as string);
  const srv = services.find((s) => (apiKey && s.apiKey === apiKey) || (secretId && s.secretId === secretId));
  if (!srv) {
    return res.status(401).json({ detail: 'Invalid API key' });
  }

  const tableName = insforge.getTableNameForService(srv.name);
  const insRecords = await insforge.getRecords(tableName);

  if (insRecords && insRecords.length > 0) {
    const list = insRecords.map((r) => ({
      id: r.id,
      license_key: r.license_key,
      key: r.license_key,
      username: r.username,
      status: r.status,
      hwid: r.hwid,
      rank: r.rank,
      notes: r.notes,
      expires_at: r.expires_at,
      created_at: r.created_at,
    }));
    return res.json({ service: srv.name, licenses: list });
  }

  const list = licenses.filter((l) => l.serviceId === srv.id).map(l => ({
    id: l.id,
    license_key: l.key,
    key: l.key,
    username: l.username,
    status: l.status,
    hwid: l.hwid,
    rank: l.rank,
    notes: l.notes,
    expires_at: l.expiresAt,
    created_at: l.createdAt
  }));
  return res.json({ service: srv.name, licenses: list });
});

app.post('/api/create-license', async (req, res) => {
  const headerApiKey = (req.headers['api-key'] as string) || (req.headers['x-api-key'] as string);
  const headerSecretId = (req.headers['secret-id'] as string) || (req.headers['x-secret-id'] as string);
  const { api_key, secret_id, username, duration, duration_days, rank, hwid, notes } = req.body || {};

  const apiKey = headerApiKey || api_key;
  const secretId = headerSecretId || secret_id;

  const srv = services.find((s) => (apiKey && s.apiKey === apiKey) || (secretId && s.secretId === secretId));
  if (!srv) {
    return res.status(401).json({ detail: 'Invalid API key' });
  }

  const key = generateKey(srv.prefix || 'VAUTH');
  let expiresAt: string | null = null;

  const daysNum = duration_days !== undefined ? parseInt(duration_days) : (duration && duration.toLowerCase() !== 'lifetime' ? parseInt(duration) || 30 : 0);
  if (daysNum > 0) {
    expiresAt = new Date(Date.now() + daysNum * 86400000).toISOString();
  }

  const newLic: DBLicense = {
    id: 'lic-' + Date.now(),
    serviceId: srv.id,
    key,
    username: username || 'unassigned',
    duration: duration || (daysNum > 0 ? `${daysNum} Days` : 'Lifetime'),
    expiresAt,
    status: 'active',
    rank: rank || 'Default',
    hwid: hwid || null,
    notes: notes || '',
    createdAt: new Date().toISOString(),
    lastUsedAt: null,
  };

  licenses.push(newLic);

  const tableName = insforge.getTableNameForService(srv.name);
  await insforge.insertRecord(tableName, {
    license_key: newLic.key,
    username: newLic.username,
    duration: newLic.duration,
    status: newLic.status,
    rank: newLic.rank,
    hwid: newLic.hwid,
    notes: newLic.notes,
    expires_at: newLic.expiresAt,
    last_used_at: newLic.lastUsedAt,
  });

  return res.json({
    id: newLic.id,
    license_key: newLic.key,
    key: newLic.key,
    username: newLic.username,
    status: newLic.status,
    hwid: newLic.hwid,
    rank: newLic.rank,
    notes: newLic.notes,
    expires_at: newLic.expiresAt,
    created_at: newLic.createdAt,
  });
});

app.post('/api/update-license', async (req, res) => {
  const headerApiKey = (req.headers['api-key'] as string) || (req.headers['x-api-key'] as string);
  const headerSecretId = (req.headers['secret-id'] as string) || (req.headers['x-secret-id'] as string);
  const { api_key, secret_id, key, license_key, status, hwid, username, rank, notes, duration_days } = req.body || {};

  const apiKey = headerApiKey || api_key;
  const secretId = headerSecretId || secret_id;
  const targetKey = license_key || key;

  const srv = services.find((s) => (apiKey && s.apiKey === apiKey) || (secretId && s.secretId === secretId));
  if (!srv) {
    return res.status(401).json({ detail: 'Invalid API key' });
  }

  const lic = licenses.find((l) => l.serviceId === srv.id && l.key === targetKey);
  if (!lic) {
    return res.status(404).json({ detail: 'License not found' });
  }

  const updates: Record<string, any> = {};
  if (status) { lic.status = status; updates.status = status; }
  if (hwid !== undefined) { lic.hwid = hwid; updates.hwid = hwid; }
  if (username !== undefined) { lic.username = username; updates.username = username; }
  if (rank !== undefined) { lic.rank = rank; updates.rank = rank; }
  if (notes !== undefined) { lic.notes = notes; updates.notes = notes; }
  if (duration_days !== undefined) {
    const days = parseInt(duration_days);
    lic.expiresAt = days > 0 ? new Date(Date.now() + days * 86400000).toISOString() : null;
    updates.expires_at = lic.expiresAt;
  }

  const tableName = insforge.getTableNameForService(srv.name);
  await insforge.updateRecordByKey(tableName, lic.key, updates);

  return res.json({
    id: lic.id,
    license_key: lic.key,
    key: lic.key,
    username: lic.username,
    status: lic.status,
    hwid: lic.hwid,
    rank: lic.rank,
    notes: lic.notes,
    expires_at: lic.expiresAt,
    created_at: lic.createdAt,
  });
});

app.delete('/api/delete-license', async (req, res) => {
  const headerApiKey = (req.headers['api-key'] as string) || (req.headers['x-api-key'] as string);
  const headerSecretId = (req.headers['secret-id'] as string) || (req.headers['x-secret-id'] as string);
  const apiKey = headerApiKey || req.body?.api_key || (req.query?.api_key as string);
  const secretId = headerSecretId || req.body?.secret_id || (req.query?.secret_id as string);
  const targetKey = req.body?.license_key || req.body?.key || (req.query?.license_key as string) || (req.query?.key as string);

  const srv = services.find((s) => (apiKey && s.apiKey === apiKey) || (secretId && s.secretId === secretId));
  if (!srv) {
    return res.status(401).json({ detail: 'Invalid API key' });
  }

  const index = licenses.findIndex((l) => l.serviceId === srv.id && l.key === targetKey);
  if (index !== -1) {
    licenses.splice(index, 1);
  }

  const tableName = insforge.getTableNameForService(srv.name);
  await insforge.deleteRecordByKey(tableName, targetKey);

  return res.json({ ok: true });
});

// START VITE / SERVER
async function startServer() {
  console.log('[InsForge] Syncing persistent services from database...');
  await syncServicesWithInsForge();

  console.log('[InsForge] Initializing database tables for services...');
  for (const srv of services) {
    try {
      const tableName = insforge.getTableNameForService(srv.name);
      await insforge.ensureServiceTable(tableName);

      const existingRecords = await insforge.getRecords(tableName);
      const srvLics = licenses.filter((l) => l.serviceId === srv.id);
      for (const lic of srvLics) {
        const found = existingRecords.find((r) => r.license_key === lic.key);
        if (!found) {
          await insforge.insertRecord(tableName, {
            license_key: lic.key,
            username: lic.username,
            duration: lic.duration,
            status: lic.status,
            rank: lic.rank,
            hwid: lic.hwid,
            notes: lic.notes,
            expires_at: lic.expiresAt,
            last_used_at: lic.lastUsedAt,
          });
        }
      }
    } catch (err: any) {
      console.error(`[InsForge] Failed initializing service ${srv.name}:`, err.message);
    }
  }

  // Catch-all 404 for unhandled /api/* routes to prevent HTML SPA fallback
  app.all('/api/*', (req, res) => {
    res.status(404).json({
      success: false,
      valid: false,
      detail: `Endpoint de API no encontrado: ${req.method} ${req.originalUrl}`,
      path: req.originalUrl
    });
  });

  // Global Error handler for /api/* requests
  app.use('/api', (err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('[API Error]:', err);
    res.status(500).json({
      success: false,
      valid: false,
      detail: err?.message || 'Error interno del servidor API',
    });
  });

  if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else if (!process.env.VERCEL) {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Start polling InsForge
  setInterval(async () => {
    await syncServicesWithInsForge();
  }, 1000);

  if (!process.env.VERCEL) {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on http://0.0.0.0:${PORT}`);
    });
  }
}

export default app;
export { app };

if (!process.env.VERCEL) {
  startServer();
}

