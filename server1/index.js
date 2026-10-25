require('dotenv').config();

const path = require('path');
const crypto = require('crypto');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { initDb, sanitizeKey } = require('./db');

const app = express();
const PORT = process.env.PORT || 4000;
const TOKEN_TTL_MS = Number(process.env.ADMIN_TOKEN_TTL_MS || 1000 * 60 * 60 * 12);

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@wgc.local';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin';
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'data', 'cms.sqlite');

const CORE_DYNAMIC_COLLECTIONS = ['events', 'media', 'new-members', 'testimonies', 'pages'];

const ROLE_PERMISSIONS = {
  super_admin: [
    'dashboard.read',
    'forms.read',
    'forms.update',
    'forms.delete',
    'content.read',
    'content.create',
    'content.update',
    'content.delete',
    'content.publish',
    'users.read',
    'users.create',
    'users.update',
    'users.delete',
    'appointments.read',
    'appointments.create',
    'appointments.update',
    'appointments.delete',
  ],
  admin: [
    'dashboard.read',
    'forms.read',
    'forms.update',
    'forms.delete',
    'content.read',
    'content.create',
    'content.update',
    'content.delete',
    'content.publish',
    'appointments.read',
    'appointments.create',
    'appointments.update',
    'appointments.delete',
  ],
  editor: ['dashboard.read', 'content.read', 'content.create', 'content.update', 'content.publish'],
  forms_manager: ['dashboard.read', 'forms.read', 'forms.update', 'appointments.read', 'appointments.update'],
  viewer: ['dashboard.read', 'forms.read', 'content.read'],
};

const db = initDb({
  dbPath: DB_PATH,
  dataDir: path.join(__dirname, 'data'),
  adminEmail: ADMIN_EMAIL,
  adminPassword: ADMIN_PASSWORD,
  rolePermissions: ROLE_PERMISSIONS,
  coreCollections: CORE_DYNAMIC_COLLECTIONS,
});

const activeSessions = new Map();

app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(morgan('dev'));

function issueSession(user) {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = Date.now() + TOKEN_TTL_MS;
  activeSessions.set(token, {
    userId: user.id,
    email: user.email,
    role: user.role,
    permissions: user.permissions,
    expiresAt,
  });
  return { token, expiresAt };
}

function getSessionFromAuthHeader(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.replace('Bearer ', '').trim();
  const session = activeSessions.get(token);
  if (!session) return null;
  if (Date.now() > session.expiresAt) {
    activeSessions.delete(token);
    return null;
  }
  return { token, ...session };
}

function requireAuth(req, res, next) {
  const session = getSessionFromAuthHeader(req.headers.authorization);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });
  req.admin = session;
  next();
}

function requirePermission(permission) {
  return (req, res, next) => {
    if (!req.admin?.permissions?.includes(permission)) {
      return res.status(403).json({ error: `Forbidden: missing permission ${permission}` });
    }
    next();
  };
}

function guardPublish(req, res, next) {
  const nextStatus = req.body?.status;
  if (nextStatus === 'published' && !req.admin.permissions.includes('content.publish')) {
    return res.status(403).json({ error: 'Forbidden: missing permission content.publish' });
  }
  next();
}

function toMinutes(hhmm) {
  const [h, m] = String(hhmm || '00:00').split(':').map((x) => Number(x) || 0);
  return h * 60 + m;
}

function overlap(startA, endA, startB, endB) {
  return startA < endB && startB < endA;
}

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'wgc-admin-backend',
    timestamp: new Date().toISOString(),
    collections: CORE_DYNAMIC_COLLECTIONS,
    roles: Object.keys(ROLE_PERMISSIONS),
    storage: 'sqlite',
  });
});

app.post('/api/admin/auth/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

  const userWithHash = db.getUserWithHashByEmail(email);
  if (!userWithHash || !userWithHash.active) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const incomingHash = db.hashPassword(password);
  if (incomingHash !== userWithHash.password_hash) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const user = db.getUserById(userWithHash.id);
  const session = issueSession(user);
  return res.json({
    ok: true,
    token: session.token,
    expiresAt: new Date(session.expiresAt).toISOString(),
    admin: user,
  });
});

app.post('/api/admin/auth/logout', requireAuth, (req, res) => {
  activeSessions.delete(req.admin.token);
  res.json({ ok: true });
});

app.get('/api/admin/auth/me', requireAuth, (req, res) => {
  const user = db.getUserById(req.admin.userId);
  if (!user || !user.active) return res.status(401).json({ error: 'Unauthorized' });

  res.json({
    ok: true,
    admin: {
      ...user,
      expiresAt: new Date(req.admin.expiresAt).toISOString(),
    },
  });
});

app.get('/api/admin/dashboard', requireAuth, requirePermission('dashboard.read'), (_req, res) => {
  res.json({
    contentStats: db.contentStats(CORE_DYNAMIC_COLLECTIONS),
    formsTotal: db.countForms(),
    activeSessions: activeSessions.size,
    users: db.listUsers(),
  });
});

app.get('/api/admin/analytics', requireAuth, requirePermission('dashboard.read'), (_req, res) => {
  const analytics = {
    totalPageViews: 0, // TODO: Implement page view tracking
    uniqueVisitors: 0, // TODO: Implement visitor tracking
    formSubmissions: db.countForms(),
    newMembers: db.countContent('new-members'),
    testimonies: db.countContent('testimonies'),
    eventsCreated: db.countContent('events'),
    mediaUploads: db.countContent('media'),
    recentActivity: [] // TODO: Implement activity tracking
  };
  res.json(analytics);
});

app.get('/api/admin/settings', requireAuth, requirePermission('users.update'), (_req, res) => {
  res.json(db.getSettings());
});

app.post('/api/admin/settings', requireAuth, requirePermission('users.update'), (req, res) => {
  const settings = req.body;
  if (!settings || typeof settings !== 'object') {
    return res.status(400).json({ error: 'Invalid settings data' });
  }
  db.saveSettings(settings);
  res.json({ ok: true });
});

app.get('/api/admin/settings', requireAuth, requirePermission('users.update'), (_req, res) => {
  const settings = db.getSettings();
  res.json(settings);
});

app.post('/api/admin/settings', requireAuth, requirePermission('users.update'), (req, res) => {
  const settings = req.body;
  if (!settings || typeof settings !== 'object') {
    return res.status(400).json({ error: 'Invalid settings payload' });
  }
  db.saveSettings(settings);
  res.json({ ok: true, message: 'Settings saved successfully' });
});

// Public form submission endpoint
app.post('/api/forms/:type', (req, res) => {
  const type = sanitizeKey(req.params.type);
  const payload = req.body;
  if (!payload || typeof payload !== 'object') {
    return res.status(400).json({ error: 'Missing payload' });
  }

  const row = db.createFormSubmission(type, payload);
  return res.json({ ok: true, type, id: row.id, received: true });
});

app.get('/api/forms/:type', (req, res) => {
  const type = sanitizeKey(req.params.type);
  const result = db.listFormSubmissions(type, {
    page: req.query.page,
    pageSize: req.query.pageSize,
    status: req.query.status,
  });
  res.json(result.items);
});

// Admin forms management
app.get('/api/admin/forms', requireAuth, requirePermission('forms.read'), (_req, res) => {
  res.json(db.listFormSummary());
});

app.get('/api/admin/forms/all', requireAuth, requirePermission('forms.read'), (req, res) => {
  const result = db.listAllFormSubmissions({
    page: req.query.page,
    pageSize: req.query.pageSize,
    status: req.query.status,
  });
  res.json(result);
});

app.get('/api/admin/forms/:type', requireAuth, requirePermission('forms.read'), (req, res) => {
  const type = sanitizeKey(req.params.type);
  const result = db.listFormSubmissions(type, {
    page: req.query.page,
    pageSize: req.query.pageSize,
    status: req.query.status,
  });
  res.json(result);
});

app.patch('/api/admin/forms/:type/:id', requireAuth, requirePermission('forms.update'), (req, res) => {
  const type = sanitizeKey(req.params.type);
  const updated = db.updateFormSubmission(type, req.params.id, req.body || {});
  if (!updated) return res.status(404).json({ error: 'Submission not found' });
  res.json(updated);
});

app.delete('/api/admin/forms/:type/:id', requireAuth, requirePermission('forms.delete'), (req, res) => {
  const type = sanitizeKey(req.params.type);
  const deleted = db.deleteFormSubmission(type, req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Submission not found' });
  res.json({ ok: true, deleted });
});

// Admin appointments management (Calendly-style backend)
app.get('/api/admin/appointments/overview', requireAuth, requirePermission('appointments.read'), (_req, res) => {
  const stats = db.appointmentStats();
  const upcoming = db.listAppointments({ page: 1, pageSize: 10, from: new Date().toISOString() });
  res.json({ stats, upcoming: upcoming.items });
});

app.get('/api/admin/appointments/types', requireAuth, requirePermission('appointments.read'), (req, res) => {
  const activeOnly = String(req.query.activeOnly || '') === 'true';
  res.json(db.listAppointmentTypes({ activeOnly }));
});

app.post('/api/admin/appointments/types', requireAuth, requirePermission('appointments.create'), (req, res) => {
  const payload = req.body || {};
  if (!payload.name) return res.status(400).json({ error: 'name is required' });
  const created = db.createAppointmentType(payload, req.admin.email);
  res.status(201).json(created);
});

app.patch('/api/admin/appointments/types/:id', requireAuth, requirePermission('appointments.update'), (req, res) => {
  const updated = db.updateAppointmentType(req.params.id, req.body || {});
  if (!updated) return res.status(404).json({ error: 'Appointment type not found' });
  res.json(updated);
});

app.delete('/api/admin/appointments/types/:id', requireAuth, requirePermission('appointments.delete'), (req, res) => {
  const deleted = db.deleteAppointmentType(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Appointment type not found' });
  res.json({ ok: true, deleted });
});

app.get('/api/admin/appointments/availability', requireAuth, requirePermission('appointments.read'), (_req, res) => {
  res.json(db.listAppointmentAvailability());
});

app.post('/api/admin/appointments/availability', requireAuth, requirePermission('appointments.create'), (req, res) => {
  const payload = req.body || {};
  if (payload.dayOfWeek === undefined || !payload.startTime || !payload.endTime) {
    return res.status(400).json({ error: 'dayOfWeek, startTime and endTime are required' });
  }
  const created = db.createAppointmentAvailability(payload);
  res.status(201).json(created);
});

app.patch('/api/admin/appointments/availability/:id', requireAuth, requirePermission('appointments.update'), (req, res) => {
  const updated = db.updateAppointmentAvailability(req.params.id, req.body || {});
  if (!updated) return res.status(404).json({ error: 'Availability block not found' });
  res.json(updated);
});

app.delete('/api/admin/appointments/availability/:id', requireAuth, requirePermission('appointments.delete'), (req, res) => {
  const deleted = db.deleteAppointmentAvailability(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Availability block not found' });
  res.json({ ok: true, deleted });
});

app.get('/api/admin/appointments/blackouts', requireAuth, requirePermission('appointments.read'), (_req, res) => {
  res.json(db.listAppointmentBlackouts());
});

app.post('/api/admin/appointments/blackouts', requireAuth, requirePermission('appointments.create'), (req, res) => {
  const payload = req.body || {};
  if (!payload.startAt || !payload.endAt) {
    return res.status(400).json({ error: 'startAt and endAt are required' });
  }
  const created = db.createAppointmentBlackout(payload);
  res.status(201).json(created);
});

app.patch('/api/admin/appointments/blackouts/:id', requireAuth, requirePermission('appointments.update'), (req, res) => {
  const updated = db.updateAppointmentBlackout(req.params.id, req.body || {});
  if (!updated) return res.status(404).json({ error: 'Blackout window not found' });
  res.json(updated);
});

app.delete('/api/admin/appointments/blackouts/:id', requireAuth, requirePermission('appointments.delete'), (req, res) => {
  const deleted = db.deleteAppointmentBlackout(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Blackout window not found' });
  res.json({ ok: true, deleted });
});

app.post('/api/admin/appointments/slots/preview', requireAuth, requirePermission('appointments.read'), (req, res) => {
  const { typeId, startDate, endDate } = req.body || {};
  if (!typeId || !startDate || !endDate) {
    return res.status(400).json({ error: 'typeId, startDate and endDate are required' });
  }

  const type = db.getAppointmentTypeById(typeId);
  if (!type || !type.isActive) return res.status(404).json({ error: 'Appointment type not found or inactive' });

  const availability = db.listAppointmentAvailability().filter((x) => x.isActive);
  const blackouts = db.listAppointmentBlackouts();
  const existing = db.listAppointments({
    page: 1,
    pageSize: 1000,
    from: `${startDate}T00:00:00.000Z`,
    to: `${endDate}T23:59:59.999Z`,
  }).items.filter((item) => !['cancelled', 'completed', 'archived'].includes(String(item.status || '').toLowerCase()));

  const slots = [];
  const duration = Number(type.durationMinutes) || 30;
  const minNoticeMs = (Number(type.minNoticeHours) || 0) * 60 * 60 * 1000;
  const maxAdvanceMs = (Number(type.maxDaysInAdvance) || 60) * 24 * 60 * 60 * 1000;
  const nowDate = Date.now();

  for (let cursor = new Date(`${startDate}T00:00:00`); cursor <= new Date(`${endDate}T00:00:00`); cursor.setDate(cursor.getDate() + 1)) {
    const day = cursor.getDay();
    const rules = availability.filter((r) => Number(r.dayOfWeek) === day);
    for (const rule of rules) {
      const startMin = toMinutes(rule.startTime);
      const endMin = toMinutes(rule.endTime);
      for (let min = startMin; min + duration <= endMin; min += duration) {
        const slotStart = new Date(cursor);
        slotStart.setHours(Math.floor(min / 60), min % 60, 0, 0);
        const slotEnd = new Date(slotStart.getTime() + duration * 60000);

        if (slotStart.getTime() - nowDate < minNoticeMs) continue;
        if (slotStart.getTime() - nowDate > maxAdvanceMs) continue;

        const blocked = blackouts.some((b) => overlap(
          slotStart.getTime(),
          slotEnd.getTime(),
          new Date(b.startAt).getTime(),
          new Date(b.endAt).getTime(),
        ));
        if (blocked) continue;

        const occupied = existing.some((appt) => overlap(
          slotStart.getTime(),
          slotEnd.getTime(),
          new Date(appt.startAt).getTime(),
          new Date(appt.endAt).getTime(),
        ));
        if (occupied) continue;

        slots.push({ startAt: slotStart.toISOString(), endAt: slotEnd.toISOString() });
      }
    }
  }

  res.json({ type, slots, total: slots.length });
});

app.get('/api/admin/appointments', requireAuth, requirePermission('appointments.read'), (req, res) => {
  const result = db.listAppointments({
    page: req.query.page,
    pageSize: req.query.pageSize,
    status: req.query.status,
    typeId: req.query.typeId,
    from: req.query.from,
    to: req.query.to,
    search: req.query.search,
  });
  res.json(result);
});

app.post('/api/admin/appointments', requireAuth, requirePermission('appointments.create'), (req, res) => {
  const payload = req.body || {};
  if (!payload.guestName || !payload.guestEmail || !payload.startAt || !payload.endAt) {
    return res.status(400).json({ error: 'guestName, guestEmail, startAt and endAt are required' });
  }
  const created = db.createAppointment(payload, req.admin.email);
  res.status(201).json(created);
});

app.get('/api/admin/appointments/:id', requireAuth, requirePermission('appointments.read'), (req, res) => {
  const item = db.getAppointmentById(req.params.id);
  if (!item) return res.status(404).json({ error: 'Appointment not found' });
  res.json(item);
});

app.patch('/api/admin/appointments/:id', requireAuth, requirePermission('appointments.update'), (req, res) => {
  const updated = db.updateAppointment(req.params.id, req.body || {}, req.admin.email);
  if (!updated) return res.status(404).json({ error: 'Appointment not found' });
  res.json(updated);
});

app.delete('/api/admin/appointments/:id', requireAuth, requirePermission('appointments.delete'), (req, res) => {
  const deleted = db.deleteAppointment(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Appointment not found' });
  res.json({ ok: true, deleted });
});

app.get('/api/admin/appointments/:id/activity', requireAuth, requirePermission('appointments.read'), (req, res) => {
  const item = db.getAppointmentById(req.params.id);
  if (!item) return res.status(404).json({ error: 'Appointment not found' });
  res.json(db.listAppointmentActivity(req.params.id));
});

function addAdminContentRoutes(basePath, collectionName) {
  app.get(basePath, requireAuth, requirePermission('content.read'), (req, res) => {
    const result = db.listContent(collectionName, {
      page: req.query.page,
      pageSize: req.query.pageSize,
      status: req.query.status,
      includeDraft: true,
    });
    res.json(result);
  });

  app.post(basePath, requireAuth, requirePermission('content.create'), guardPublish, (req, res) => {
    const payload = req.body;
    if (!payload || typeof payload !== 'object') {
      return res.status(400).json({ error: 'Payload is required' });
    }
    const created = db.createContent(collectionName, payload, req.admin.email);
    res.status(201).json(created);
  });

  app.get(`${basePath}/:id`, requireAuth, requirePermission('content.read'), (req, res) => {
    const item = db.getContentById(collectionName, req.params.id, { includeDraft: true });
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.json(item);
  });

  app.patch(`${basePath}/:id`, requireAuth, requirePermission('content.update'), guardPublish, (req, res) => {
    const item = db.updateContent(collectionName, req.params.id, req.body || {});
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.json(item);
  });

  app.delete(`${basePath}/:id`, requireAuth, requirePermission('content.delete'), (req, res) => {
    const deleted = db.deleteContent(collectionName, req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Item not found' });
    res.json({ ok: true, deleted });
  });
}

function addPublicContentRoutes(basePath, collectionName) {
  app.get(basePath, (req, res) => {
    const result = db.listContent(collectionName, {
      page: req.query.page,
      pageSize: req.query.pageSize,
      status: req.query.status,
      includeDraft: false,
    });
    res.json(result);
  });

  app.get(`${basePath}/:id`, (req, res) => {
    const item = db.getContentById(collectionName, req.params.id, { includeDraft: false });
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.json(item);
  });
}

for (const collection of CORE_DYNAMIC_COLLECTIONS) {
  addAdminContentRoutes(`/api/admin/${collection}`, collection);
  addPublicContentRoutes(`/api/${collection}`, collection);
}

// Generic dynamic collections
app.get('/api/admin/content/:collection', requireAuth, requirePermission('content.read'), (req, res) => {
  const collection = sanitizeKey(req.params.collection);
  const result = db.listContent(collection, {
    page: req.query.page,
    pageSize: req.query.pageSize,
    status: req.query.status,
    includeDraft: true,
  });
  res.json(result);
});

app.post('/api/admin/content/:collection', requireAuth, requirePermission('content.create'), guardPublish, (req, res) => {
  const collection = sanitizeKey(req.params.collection);
  const payload = req.body;
  if (!payload || typeof payload !== 'object') {
    return res.status(400).json({ error: 'Payload is required' });
  }
  const created = db.createContent(collection, { ...payload, collection }, req.admin.email);
  res.status(201).json(created);
});

app.get('/api/admin/content/:collection/:id', requireAuth, requirePermission('content.read'), (req, res) => {
  const collection = sanitizeKey(req.params.collection);
  const item = db.getContentById(collection, req.params.id, { includeDraft: true });
  if (!item) return res.status(404).json({ error: 'Item not found' });
  res.json(item);
});

app.patch('/api/admin/content/:collection/:id', requireAuth, requirePermission('content.update'), guardPublish, (req, res) => {
  const collection = sanitizeKey(req.params.collection);
  const updated = db.updateContent(collection, req.params.id, req.body || {});
  if (!updated) return res.status(404).json({ error: 'Item not found' });
  res.json(updated);
});

app.delete('/api/admin/content/:collection/:id', requireAuth, requirePermission('content.delete'), (req, res) => {
  const collection = sanitizeKey(req.params.collection);
  const deleted = db.deleteContent(collection, req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Item not found' });
  res.json({ ok: true, deleted });
});

app.get('/api/content/:collection', (req, res) => {
  const collection = sanitizeKey(req.params.collection);
  const result = db.listContent(collection, {
    page: req.query.page,
    pageSize: req.query.pageSize,
    status: req.query.status,
    includeDraft: false,
  });
  res.json(result);
});

app.get('/api/content/:collection/:id', (req, res) => {
  const collection = sanitizeKey(req.params.collection);
  const item = db.getContentById(collection, req.params.id, { includeDraft: false });
  if (!item) return res.status(404).json({ error: 'Item not found' });
  res.json(item);
});

// UAC users management
app.get('/api/admin/users', requireAuth, requirePermission('users.read'), (_req, res) => {
  res.json(db.listUsers());
});

app.post('/api/admin/users', requireAuth, requirePermission('users.create'), (req, res) => {
  const { email, name, role, password, active = true } = req.body || {};
  if (!email || !name || !role || !password) {
    return res.status(400).json({ error: 'email, name, role and password are required' });
  }
  if (!ROLE_PERMISSIONS[role]) {
    return res.status(400).json({ error: 'Invalid role' });
  }
  const existing = db.getUserByEmail(email);
  if (existing) return res.status(409).json({ error: 'User email already exists' });

  const user = db.createUser({ email, name, role, password, active: Boolean(active) });
  res.status(201).json(user);
});

app.patch('/api/admin/users/:id', requireAuth, requirePermission('users.update'), (req, res) => {
  const { role } = req.body || {};
  if (role && !ROLE_PERMISSIONS[role]) {
    return res.status(400).json({ error: 'Invalid role' });
  }

  const updated = db.updateUser(req.params.id, req.body || {});
  if (!updated) return res.status(404).json({ error: 'User not found' });
  res.json(updated);
});

app.delete('/api/admin/users/:id', requireAuth, requirePermission('users.delete'), (req, res) => {
  if (req.params.id === req.admin.userId) {
    return res.status(400).json({ error: 'You cannot delete your own account' });
  }
  const deleted = db.deleteUser(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'User not found' });
  res.json({ ok: true, deleted });
});

app.listen(PORT, () => {
  console.log(`Admin backend listening on http://localhost:${PORT}`);
  console.log(`Storage: SQLite (${DB_PATH})`);
  console.log(`Seed super admin email: ${ADMIN_EMAIL}`);
  console.log('Seed extra users: editor@wgc.local, forms@wgc.local, viewer@wgc.local');
});
