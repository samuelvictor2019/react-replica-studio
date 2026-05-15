const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const Database = require('better-sqlite3');

function now() {
  return new Date().toISOString();
}

function uuid() {
  return crypto.randomUUID();
}

function hashPassword(password) {
  return crypto.createHash('sha256').update(String(password || '')).digest('hex');
}

function sanitizeKey(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, '-');
}

function readJson(filePath, fallback) {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function parsePayload(payloadText) {
  try {
    return payloadText ? JSON.parse(payloadText) : {};
  } catch {
    return {};
  }
}

function initDb({ dbPath, dataDir, adminEmail, adminPassword, rolePermissions, coreCollections }) {
  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      active INTEGER NOT NULL DEFAULT 1,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS content_items (
      id TEXT PRIMARY KEY,
      collection TEXT NOT NULL,
      title TEXT,
      slug TEXT,
      status TEXT NOT NULL,
      payload_json TEXT NOT NULL,
      created_by TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS form_submissions (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      status TEXT NOT NULL,
      notes TEXT,
      data_json TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS appointment_types (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      description TEXT,
      duration_minutes INTEGER NOT NULL DEFAULT 30,
      buffer_before_minutes INTEGER NOT NULL DEFAULT 0,
      buffer_after_minutes INTEGER NOT NULL DEFAULT 0,
      location TEXT,
      color TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      min_notice_hours INTEGER NOT NULL DEFAULT 2,
      max_days_in_advance INTEGER NOT NULL DEFAULT 60,
      created_by TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS appointment_availability (
      id TEXT PRIMARY KEY,
      day_of_week INTEGER NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS appointment_blackouts (
      id TEXT PRIMARY KEY,
      start_at TEXT NOT NULL,
      end_at TEXT NOT NULL,
      reason TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS appointments (
      id TEXT PRIMARY KEY,
      type_id TEXT,
      title TEXT,
      guest_name TEXT NOT NULL,
      guest_email TEXT NOT NULL,
      guest_phone TEXT,
      start_at TEXT NOT NULL,
      end_at TEXT NOT NULL,
      timezone TEXT,
      status TEXT NOT NULL DEFAULT 'scheduled',
      source TEXT NOT NULL DEFAULT 'admin',
      notes TEXT,
      internal_notes TEXT,
      created_by TEXT,
      data_json TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (type_id) REFERENCES appointment_types(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS appointment_activity (
      id TEXT PRIMARY KEY,
      appointment_id TEXT NOT NULL,
      action TEXT NOT NULL,
      actor TEXT,
      meta_json TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_content_collection ON content_items(collection);
    CREATE INDEX IF NOT EXISTS idx_content_status ON content_items(status);
    CREATE INDEX IF NOT EXISTS idx_forms_type ON form_submissions(type);
    CREATE INDEX IF NOT EXISTS idx_forms_status ON form_submissions(status);
    CREATE INDEX IF NOT EXISTS idx_appointment_types_active ON appointment_types(is_active);
    CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
    CREATE INDEX IF NOT EXISTS idx_appointments_start ON appointments(start_at);
    CREATE INDEX IF NOT EXISTS idx_appointments_type ON appointments(type_id);
    CREATE INDEX IF NOT EXISTS idx_appointments_email ON appointments(guest_email);
    CREATE INDEX IF NOT EXISTS idx_appointments_activity_appointment ON appointment_activity(appointment_id);
  `);

  const contentDir = path.join(dataDir, 'content');
  const formsDir = path.join(dataDir, 'forms');
  const usersFile = path.join(dataDir, 'admin-users.json');

  const usersCount = db.prepare('SELECT COUNT(*) AS count FROM users').get().count;
  if (usersCount === 0) {
    const fromJson = readJson(usersFile, []);
    if (Array.isArray(fromJson) && fromJson.length) {
      const insertUser = db.prepare(`
        INSERT INTO users (id, email, name, role, active, password_hash, created_at, updated_at)
        VALUES (@id, @email, @name, @role, @active, @password_hash, @created_at, @updated_at)
      `);
      const tx = db.transaction((rows) => {
        for (const row of rows) {
          insertUser.run({
            id: row.id || uuid(),
            email: row.email,
            name: row.name || row.email,
            role: row.role || 'viewer',
            active: row.active === false ? 0 : 1,
            password_hash: row.passwordHash || hashPassword('change-me-password'),
            created_at: row.createdAt || now(),
            updated_at: row.updatedAt || row.createdAt || now(),
          });
        }
      });
      tx(fromJson.filter((x) => x.email));
    }
  }

  const usersCountAfterImport = db.prepare('SELECT COUNT(*) AS count FROM users').get().count;
  if (usersCountAfterImport === 0) {
    const seedUsers = [
      { email: adminEmail, name: 'Super Admin', role: 'super_admin', password: adminPassword },
      { email: 'editor@wgc.local', name: 'Content Editor', role: 'editor', password: 'editor-password' },
      { email: 'forms@wgc.local', name: 'Forms Manager', role: 'forms_manager', password: 'forms-password' },
      { email: 'viewer@wgc.local', name: 'Read Only Viewer', role: 'viewer', password: 'viewer-password' },
    ];

    const insert = db.prepare(`
      INSERT INTO users (id, email, name, role, active, password_hash, created_at, updated_at)
      VALUES (@id, @email, @name, @role, 1, @password_hash, @created_at, @updated_at)
    `);

    const tx = db.transaction((rows) => {
      for (const row of rows) {
        const timestamp = now();
        insert.run({
          id: uuid(),
          email: row.email,
          name: row.name,
          role: row.role,
          password_hash: hashPassword(row.password),
          created_at: timestamp,
          updated_at: timestamp,
        });
      }
    });

    tx(seedUsers);
  }

  const contentCount = db.prepare('SELECT COUNT(*) AS count FROM content_items').get().count;
  if (contentCount === 0 && fs.existsSync(contentDir)) {
    const insertContent = db.prepare(`
      INSERT INTO content_items (id, collection, title, slug, status, payload_json, created_by, created_at, updated_at)
      VALUES (@id, @collection, @title, @slug, @status, @payload_json, @created_by, @created_at, @updated_at)
    `);

    const tx = db.transaction((entries) => {
      for (const entry of entries) insertContent.run(entry);
    });

    const rows = [];
    const files = fs.readdirSync(contentDir).filter((name) => name.endsWith('.json'));
    for (const fileName of files) {
      const collection = sanitizeKey(fileName.replace('.json', ''));
      const records = readJson(path.join(contentDir, fileName), []);
      if (!Array.isArray(records)) continue;
      for (const item of records) {
        const createdAt = item.createdAt || now();
        rows.push({
          id: item.id || uuid(),
          collection,
          title: item.title || null,
          slug: item.slug || null,
          status: item.status || 'draft',
          payload_json: JSON.stringify(item),
          created_by: item.createdBy || null,
          created_at: createdAt,
          updated_at: item.updatedAt || createdAt,
        });
      }
    }

    if (rows.length) tx(rows);
  }

  const formsCount = db.prepare('SELECT COUNT(*) AS count FROM form_submissions').get().count;
  if (formsCount === 0 && fs.existsSync(formsDir)) {
    const insertForm = db.prepare(`
      INSERT INTO form_submissions (id, type, status, notes, data_json, created_at, updated_at)
      VALUES (@id, @type, @status, @notes, @data_json, @created_at, @updated_at)
    `);

    const tx = db.transaction((entries) => {
      for (const entry of entries) insertForm.run(entry);
    });

    const rows = [];
    const files = fs.readdirSync(formsDir).filter((name) => name.endsWith('.json'));
    for (const fileName of files) {
      const type = sanitizeKey(fileName.replace('.json', ''));
      if (type === 'admin-users') continue;
      const records = readJson(path.join(formsDir, fileName), []);
      if (!Array.isArray(records)) continue;
      for (const item of records) {
        const createdAt = item.createdAt || item.receivedAt || now();
        rows.push({
          id: item.id || uuid(),
          type,
          status: item.status || 'new',
          notes: item.notes || null,
          data_json: JSON.stringify(item.data || item.payload || item),
          created_at: createdAt,
          updated_at: item.updatedAt || createdAt,
        });
      }
    }

    if (rows.length) tx(rows);
  }

  const contentCountAfterImport = db.prepare('SELECT COUNT(*) AS count FROM content_items').get().count;
  if (contentCountAfterImport === 0) {
    const insertContent = db.prepare(`
      INSERT INTO content_items (id, collection, title, slug, status, payload_json, created_by, created_at, updated_at)
      VALUES (@id, @collection, @title, @slug, @status, @payload_json, @created_by, @created_at, @updated_at)
    `);

    const samples = [
      { collection: 'events', title: 'Leadership Bootcamp 2026', slug: 'leadership-bootcamp-2026' },
      { collection: 'media', title: 'Sunday Worship Replay', slug: 'sunday-worship-replay' },
      { collection: 'new-members', title: 'New Members Intake - March', slug: 'new-members-intake-march' },
      { collection: 'testimonies', title: 'Healing Testimony - Esther', slug: 'healing-testimony-esther' },
      { collection: 'pages', title: 'House Groups Dynamic Content', slug: 'house-groups-dynamic-content' },
    ];

    const tx = db.transaction((rows) => {
      for (const row of rows) {
        const timestamp = now();
        const payload = {
          title: row.title,
          slug: row.slug,
          status: 'published',
          summary: 'Seed content generated for admin dashboard testing.',
          body: 'This is pseudo sample content stored in SQLite for dynamic rendering.',
        };

        insertContent.run({
          id: uuid(),
          collection: row.collection,
          title: row.title,
          slug: row.slug,
          status: 'published',
          payload_json: JSON.stringify(payload),
          created_by: adminEmail,
          created_at: timestamp,
          updated_at: timestamp,
        });
      }
    });

    tx(samples);
  }

  const formsCountAfterImport = db.prepare('SELECT COUNT(*) AS count FROM form_submissions').get().count;
  if (formsCountAfterImport === 0) {
    const insertForm = db.prepare(`
      INSERT INTO form_submissions (id, type, status, notes, data_json, created_at, updated_at)
      VALUES (@id, @type, @status, @notes, @data_json, @created_at, @updated_at)
    `);

    const samples = [
      { type: 'first-timer-form', data: { fullName: 'John Doe', phone: '+2348000000001' } },
      { type: 'testimony-form', data: { fullName: 'Esther A.', testimony: 'God healed me completely.' } },
      { type: 'counselling-request', data: { fullName: 'Samuel B.', request: 'Need prayer and guidance.' } },
    ];

    const tx = db.transaction((rows) => {
      for (const row of rows) {
        const timestamp = now();
        insertForm.run({
          id: uuid(),
          type: row.type,
          status: 'new',
          notes: null,
          data_json: JSON.stringify(row.data),
          created_at: timestamp,
          updated_at: timestamp,
        });
      }
    });

    tx(samples);
  }

  function mapUser(row) {
    if (!row) return null;
    return {
      id: row.id,
      email: row.email,
      name: row.name,
      role: row.role,
      active: Boolean(row.active),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      permissions: rolePermissions[row.role] || [],
    };
  }

  function mapContent(row) {
    if (!row) return null;
    const payload = parsePayload(row.payload_json);
    return {
      ...payload,
      id: row.id,
      collection: row.collection,
      title: row.title ?? payload.title,
      slug: row.slug ?? payload.slug,
      status: row.status,
      createdBy: row.created_by,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  function mapForm(row) {
    if (!row) return null;
    return {
      id: row.id,
      type: row.type,
      status: row.status,
      notes: row.notes,
      data: parsePayload(row.data_json),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  function mapAppointmentType(row) {
    if (!row) return null;
    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description,
      durationMinutes: row.duration_minutes,
      bufferBeforeMinutes: row.buffer_before_minutes,
      bufferAfterMinutes: row.buffer_after_minutes,
      location: row.location,
      color: row.color,
      isActive: Boolean(row.is_active),
      minNoticeHours: row.min_notice_hours,
      maxDaysInAdvance: row.max_days_in_advance,
      createdBy: row.created_by,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  function mapAvailability(row) {
    if (!row) return null;
    return {
      id: row.id,
      dayOfWeek: row.day_of_week,
      startTime: row.start_time,
      endTime: row.end_time,
      isActive: Boolean(row.is_active),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  function mapBlackout(row) {
    if (!row) return null;
    return {
      id: row.id,
      startAt: row.start_at,
      endAt: row.end_at,
      reason: row.reason,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  function mapAppointment(row) {
    if (!row) return null;
    return {
      id: row.id,
      typeId: row.type_id,
      type: row.type_id ? {
        id: row.type_id,
        name: row.type_name || null,
        slug: row.type_slug || null,
      } : null,
      title: row.title,
      guestName: row.guest_name,
      guestEmail: row.guest_email,
      guestPhone: row.guest_phone,
      startAt: row.start_at,
      endAt: row.end_at,
      timezone: row.timezone,
      status: row.status,
      source: row.source,
      notes: row.notes,
      internalNotes: row.internal_notes,
      createdBy: row.created_by,
      data: parsePayload(row.data_json),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  function mapAppointmentActivity(row) {
    if (!row) return null;
    return {
      id: row.id,
      appointmentId: row.appointment_id,
      action: row.action,
      actor: row.actor,
      meta: parsePayload(row.meta_json),
      createdAt: row.created_at,
    };
  }

  function addAppointmentActivity({ appointmentId, action, actor, meta }) {
    db.prepare(`
      INSERT INTO appointment_activity (id, appointment_id, action, actor, meta_json, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(uuid(), appointmentId, action, actor || null, JSON.stringify(meta || {}), now());
  }

  return {
    hashPassword,

    getUserByEmail(email) {
      return mapUser(db.prepare('SELECT * FROM users WHERE lower(email) = lower(?) LIMIT 1').get(email));
    },

    getUserWithHashByEmail(email) {
      return db.prepare('SELECT * FROM users WHERE lower(email) = lower(?) LIMIT 1').get(email);
    },

    getUserById(id) {
      return mapUser(db.prepare('SELECT * FROM users WHERE id = ? LIMIT 1').get(id));
    },

    listUsers() {
      return db.prepare('SELECT * FROM users ORDER BY created_at DESC').all().map(mapUser);
    },

    createUser({ email, name, role, active, password }) {
      const id = uuid();
      const timestamp = now();
      db.prepare(`
        INSERT INTO users (id, email, name, role, active, password_hash, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(id, email, name, role, active ? 1 : 0, hashPassword(password), timestamp, timestamp);
      return this.getUserById(id);
    },

    updateUser(id, patch) {
      const existing = db.prepare('SELECT * FROM users WHERE id = ? LIMIT 1').get(id);
      if (!existing) return null;
      const merged = {
        ...existing,
        ...(patch.name !== undefined ? { name: patch.name } : {}),
        ...(patch.role !== undefined ? { role: patch.role } : {}),
        ...(patch.active !== undefined ? { active: patch.active ? 1 : 0 } : {}),
        ...(patch.password ? { password_hash: hashPassword(patch.password) } : {}),
        updated_at: now(),
      };

      db.prepare(`
        UPDATE users
        SET name = ?, role = ?, active = ?, password_hash = ?, updated_at = ?
        WHERE id = ?
      `).run(merged.name, merged.role, merged.active, merged.password_hash, merged.updated_at, id);

      return this.getUserById(id);
    },

    deleteUser(id) {
      const user = this.getUserById(id);
      if (!user) return null;
      db.prepare('DELETE FROM users WHERE id = ?').run(id);
      return user;
    },

    countUsers() {
      return db.prepare('SELECT COUNT(*) AS count FROM users').get().count;
    },

    createFormSubmission(type, data) {
      const id = uuid();
      const timestamp = now();
      db.prepare(`
        INSERT INTO form_submissions (id, type, status, notes, data_json, created_at, updated_at)
        VALUES (?, ?, 'new', NULL, ?, ?, ?)
      `).run(id, type, JSON.stringify(data), timestamp, timestamp);
      return this.getFormSubmissionById(type, id);
    },

    getFormSubmissionById(type, id) {
      return mapForm(db.prepare('SELECT * FROM form_submissions WHERE type = ? AND id = ? LIMIT 1').get(type, id));
    },

    listFormSummary() {
      return db
        .prepare(`
          SELECT type, COUNT(*) AS total,
          SUM(CASE WHEN status = 'new' THEN 1 ELSE 0 END) AS newCount
          FROM form_submissions
          GROUP BY type
          ORDER BY type ASC
        `)
        .all()
        .map((x) => ({ type: x.type, total: x.total, newCount: x.newCount || 0 }));
    },

    listFormSubmissions(type, { status, page, pageSize }) {
      const p = Math.max(Number(page) || 1, 1);
      const size = Math.min(Math.max(Number(pageSize) || 50, 1), 200);
      const offset = (p - 1) * size;

      let where = 'WHERE type = ?';
      const params = [type];
      if (status) {
        where += ' AND status = ?';
        params.push(status);
      }

      const items = db
        .prepare(`SELECT * FROM form_submissions ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`)
        .all(...params, size, offset)
        .map(mapForm);

      const total = db.prepare(`SELECT COUNT(*) AS count FROM form_submissions ${where}`).get(...params).count;
      return {
        items,
        page: p,
        pageSize: size,
        total,
        totalPages: Math.max(Math.ceil(total / size), 1),
      };
    },

    listAllFormSubmissions({ status, page, pageSize }) {
      const p = Math.max(Number(page) || 1, 1);
      const size = Math.min(Math.max(Number(pageSize) || 50, 1), 200);
      const offset = (p - 1) * size;

      let where = '';
      const params = [];
      if (status) {
        where = 'WHERE status = ?';
        params.push(status);
      }

      const items = db
        .prepare(`SELECT * FROM form_submissions ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`)
        .all(...params, size, offset)
        .map(mapForm);

      const total = db.prepare(`SELECT COUNT(*) AS count FROM form_submissions ${where}`).get(...params).count;
      return {
        items,
        page: p,
        pageSize: size,
        total,
        totalPages: Math.max(Math.ceil(total / size), 1),
      };
    },

    updateFormSubmission(type, id, { status, notes }) {
      const row = db.prepare('SELECT * FROM form_submissions WHERE type = ? AND id = ? LIMIT 1').get(type, id);
      if (!row) return null;
      db.prepare(`
        UPDATE form_submissions
        SET status = ?, notes = ?, updated_at = ?
        WHERE type = ? AND id = ?
      `).run(status || row.status, notes ?? row.notes, now(), type, id);
      return this.getFormSubmissionById(type, id);
    },

    deleteFormSubmission(type, id) {
      const row = this.getFormSubmissionById(type, id);
      if (!row) return null;
      db.prepare('DELETE FROM form_submissions WHERE type = ? AND id = ?').run(type, id);
      return row;
    },

    listAppointmentTypes({ activeOnly = false } = {}) {
      let where = '';
      const params = [];
      if (activeOnly) {
        where = 'WHERE is_active = 1';
      }
      return db
        .prepare(`SELECT * FROM appointment_types ${where} ORDER BY name ASC`)
        .all(...params)
        .map(mapAppointmentType);
    },

    getAppointmentTypeById(id) {
      return mapAppointmentType(db.prepare('SELECT * FROM appointment_types WHERE id = ? LIMIT 1').get(id));
    },

    createAppointmentType(payload, createdBy) {
      const id = uuid();
      const timestamp = now();
      const slug = sanitizeKey(payload.slug || payload.name || `appointment-type-${id.slice(0, 8)}`);
      db.prepare(`
        INSERT INTO appointment_types (
          id, name, slug, description, duration_minutes,
          buffer_before_minutes, buffer_after_minutes,
          location, color, is_active, min_notice_hours,
          max_days_in_advance, created_by, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        id,
        payload.name,
        slug,
        payload.description || null,
        Number(payload.durationMinutes) || 30,
        Number(payload.bufferBeforeMinutes) || 0,
        Number(payload.bufferAfterMinutes) || 0,
        payload.location || null,
        payload.color || '#0f1b37',
        payload.isActive === false ? 0 : 1,
        Number(payload.minNoticeHours) || 2,
        Number(payload.maxDaysInAdvance) || 60,
        createdBy || null,
        timestamp,
        timestamp,
      );
      return this.getAppointmentTypeById(id);
    },

    updateAppointmentType(id, patch) {
      const existing = db.prepare('SELECT * FROM appointment_types WHERE id = ? LIMIT 1').get(id);
      if (!existing) return null;
      const merged = {
        ...existing,
        name: patch.name ?? existing.name,
        slug: patch.slug ? sanitizeKey(patch.slug) : existing.slug,
        description: patch.description ?? existing.description,
        duration_minutes: patch.durationMinutes ?? existing.duration_minutes,
        buffer_before_minutes: patch.bufferBeforeMinutes ?? existing.buffer_before_minutes,
        buffer_after_minutes: patch.bufferAfterMinutes ?? existing.buffer_after_minutes,
        location: patch.location ?? existing.location,
        color: patch.color ?? existing.color,
        is_active: patch.isActive === undefined ? existing.is_active : (patch.isActive ? 1 : 0),
        min_notice_hours: patch.minNoticeHours ?? existing.min_notice_hours,
        max_days_in_advance: patch.maxDaysInAdvance ?? existing.max_days_in_advance,
        updated_at: now(),
      };

      db.prepare(`
        UPDATE appointment_types
        SET name = ?, slug = ?, description = ?, duration_minutes = ?,
            buffer_before_minutes = ?, buffer_after_minutes = ?, location = ?,
            color = ?, is_active = ?, min_notice_hours = ?, max_days_in_advance = ?, updated_at = ?
        WHERE id = ?
      `).run(
        merged.name,
        merged.slug,
        merged.description,
        merged.duration_minutes,
        merged.buffer_before_minutes,
        merged.buffer_after_minutes,
        merged.location,
        merged.color,
        merged.is_active,
        merged.min_notice_hours,
        merged.max_days_in_advance,
        merged.updated_at,
        id,
      );

      return this.getAppointmentTypeById(id);
    },

    deleteAppointmentType(id) {
      const existing = this.getAppointmentTypeById(id);
      if (!existing) return null;
      db.prepare('DELETE FROM appointment_types WHERE id = ?').run(id);
      return existing;
    },

    listAppointmentAvailability() {
      return db
        .prepare('SELECT * FROM appointment_availability ORDER BY day_of_week ASC, start_time ASC')
        .all()
        .map(mapAvailability);
    },

    createAppointmentAvailability(payload) {
      const id = uuid();
      const timestamp = now();
      db.prepare(`
        INSERT INTO appointment_availability (id, day_of_week, start_time, end_time, is_active, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        id,
        Number(payload.dayOfWeek),
        payload.startTime,
        payload.endTime,
        payload.isActive === false ? 0 : 1,
        timestamp,
        timestamp,
      );
      return mapAvailability(db.prepare('SELECT * FROM appointment_availability WHERE id = ?').get(id));
    },

    updateAppointmentAvailability(id, patch) {
      const existing = db.prepare('SELECT * FROM appointment_availability WHERE id = ? LIMIT 1').get(id);
      if (!existing) return null;
      const merged = {
        ...existing,
        day_of_week: patch.dayOfWeek ?? existing.day_of_week,
        start_time: patch.startTime ?? existing.start_time,
        end_time: patch.endTime ?? existing.end_time,
        is_active: patch.isActive === undefined ? existing.is_active : (patch.isActive ? 1 : 0),
        updated_at: now(),
      };
      db.prepare(`
        UPDATE appointment_availability
        SET day_of_week = ?, start_time = ?, end_time = ?, is_active = ?, updated_at = ?
        WHERE id = ?
      `).run(merged.day_of_week, merged.start_time, merged.end_time, merged.is_active, merged.updated_at, id);
      return mapAvailability(db.prepare('SELECT * FROM appointment_availability WHERE id = ?').get(id));
    },

    deleteAppointmentAvailability(id) {
      const existing = mapAvailability(db.prepare('SELECT * FROM appointment_availability WHERE id = ? LIMIT 1').get(id));
      if (!existing) return null;
      db.prepare('DELETE FROM appointment_availability WHERE id = ?').run(id);
      return existing;
    },

    listAppointmentBlackouts() {
      return db
        .prepare('SELECT * FROM appointment_blackouts ORDER BY start_at ASC')
        .all()
        .map(mapBlackout);
    },

    createAppointmentBlackout(payload) {
      const id = uuid();
      const timestamp = now();
      db.prepare(`
        INSERT INTO appointment_blackouts (id, start_at, end_at, reason, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(id, payload.startAt, payload.endAt, payload.reason || null, timestamp, timestamp);
      return mapBlackout(db.prepare('SELECT * FROM appointment_blackouts WHERE id = ? LIMIT 1').get(id));
    },

    updateAppointmentBlackout(id, patch) {
      const existing = db.prepare('SELECT * FROM appointment_blackouts WHERE id = ? LIMIT 1').get(id);
      if (!existing) return null;
      const merged = {
        ...existing,
        start_at: patch.startAt ?? existing.start_at,
        end_at: patch.endAt ?? existing.end_at,
        reason: patch.reason ?? existing.reason,
        updated_at: now(),
      };
      db.prepare(`
        UPDATE appointment_blackouts
        SET start_at = ?, end_at = ?, reason = ?, updated_at = ?
        WHERE id = ?
      `).run(merged.start_at, merged.end_at, merged.reason, merged.updated_at, id);
      return mapBlackout(db.prepare('SELECT * FROM appointment_blackouts WHERE id = ? LIMIT 1').get(id));
    },

    deleteAppointmentBlackout(id) {
      const existing = mapBlackout(db.prepare('SELECT * FROM appointment_blackouts WHERE id = ? LIMIT 1').get(id));
      if (!existing) return null;
      db.prepare('DELETE FROM appointment_blackouts WHERE id = ?').run(id);
      return existing;
    },

    listAppointments({ page, pageSize, status, typeId, from, to, search }) {
      const p = Math.max(Number(page) || 1, 1);
      const size = Math.min(Math.max(Number(pageSize) || 20, 1), 200);
      const offset = (p - 1) * size;

      let where = 'WHERE 1=1';
      const params = [];

      if (status) {
        where += ' AND a.status = ?';
        params.push(status);
      }
      if (typeId) {
        where += ' AND a.type_id = ?';
        params.push(typeId);
      }
      if (from) {
        where += ' AND a.start_at >= ?';
        params.push(from);
      }
      if (to) {
        where += ' AND a.start_at <= ?';
        params.push(to);
      }
      if (search) {
        where += ' AND (a.guest_name LIKE ? OR a.guest_email LIKE ? OR a.title LIKE ?)';
        const likeTerm = `%${search}%`;
        params.push(likeTerm, likeTerm, likeTerm);
      }

      const items = db
        .prepare(`
          SELECT a.*, t.name as type_name, t.slug as type_slug
          FROM appointments a
          LEFT JOIN appointment_types t ON t.id = a.type_id
          ${where}
          ORDER BY a.start_at ASC
          LIMIT ? OFFSET ?
        `)
        .all(...params, size, offset)
        .map(mapAppointment);

      const total = db.prepare(`SELECT COUNT(*) as count FROM appointments a ${where}`).get(...params).count;
      return {
        items,
        page: p,
        pageSize: size,
        total,
        totalPages: Math.max(Math.ceil(total / size), 1),
      };
    },

    getAppointmentById(id) {
      const row = db.prepare(`
        SELECT a.*, t.name as type_name, t.slug as type_slug
        FROM appointments a
        LEFT JOIN appointment_types t ON t.id = a.type_id
        WHERE a.id = ?
        LIMIT 1
      `).get(id);
      return mapAppointment(row);
    },

    createAppointment(payload, createdBy) {
      const id = uuid();
      const timestamp = now();
      db.prepare(`
        INSERT INTO appointments (
          id, type_id, title, guest_name, guest_email, guest_phone,
          start_at, end_at, timezone, status, source, notes,
          internal_notes, created_by, data_json, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        id,
        payload.typeId || null,
        payload.title || null,
        payload.guestName,
        payload.guestEmail,
        payload.guestPhone || null,
        payload.startAt,
        payload.endAt,
        payload.timezone || 'Africa/Lagos',
        payload.status || 'scheduled',
        payload.source || 'admin',
        payload.notes || null,
        payload.internalNotes || null,
        createdBy || null,
        JSON.stringify(payload.data || {}),
        timestamp,
        timestamp,
      );

      addAppointmentActivity({
        appointmentId: id,
        action: 'created',
        actor: createdBy || null,
        meta: { status: payload.status || 'scheduled', source: payload.source || 'admin' },
      });

      return this.getAppointmentById(id);
    },

    updateAppointment(id, patch, actor) {
      const existingRow = db.prepare('SELECT * FROM appointments WHERE id = ? LIMIT 1').get(id);
      if (!existingRow) return null;

      const existingData = parsePayload(existingRow.data_json);
      const merged = {
        ...existingRow,
        type_id: patch.typeId ?? existingRow.type_id,
        title: patch.title ?? existingRow.title,
        guest_name: patch.guestName ?? existingRow.guest_name,
        guest_email: patch.guestEmail ?? existingRow.guest_email,
        guest_phone: patch.guestPhone ?? existingRow.guest_phone,
        start_at: patch.startAt ?? existingRow.start_at,
        end_at: patch.endAt ?? existingRow.end_at,
        timezone: patch.timezone ?? existingRow.timezone,
        status: patch.status ?? existingRow.status,
        source: patch.source ?? existingRow.source,
        notes: patch.notes ?? existingRow.notes,
        internal_notes: patch.internalNotes ?? existingRow.internal_notes,
        data_json: JSON.stringify({ ...existingData, ...(patch.data || {}) }),
        updated_at: now(),
      };

      db.prepare(`
        UPDATE appointments
        SET type_id = ?, title = ?, guest_name = ?, guest_email = ?, guest_phone = ?,
            start_at = ?, end_at = ?, timezone = ?, status = ?, source = ?, notes = ?,
            internal_notes = ?, data_json = ?, updated_at = ?
        WHERE id = ?
      `).run(
        merged.type_id,
        merged.title,
        merged.guest_name,
        merged.guest_email,
        merged.guest_phone,
        merged.start_at,
        merged.end_at,
        merged.timezone,
        merged.status,
        merged.source,
        merged.notes,
        merged.internal_notes,
        merged.data_json,
        merged.updated_at,
        id,
      );

      addAppointmentActivity({
        appointmentId: id,
        action: patch.status && patch.status !== existingRow.status ? 'status_changed' : 'updated',
        actor: actor || null,
        meta: {
          fromStatus: existingRow.status,
          toStatus: merged.status,
        },
      });

      return this.getAppointmentById(id);
    },

    deleteAppointment(id) {
      const existing = this.getAppointmentById(id);
      if (!existing) return null;
      db.prepare('DELETE FROM appointments WHERE id = ?').run(id);
      return existing;
    },

    listAppointmentActivity(appointmentId) {
      return db
        .prepare('SELECT * FROM appointment_activity WHERE appointment_id = ? ORDER BY created_at DESC')
        .all(appointmentId)
        .map(mapAppointmentActivity);
    },

    appointmentStats() {
      const total = db.prepare('SELECT COUNT(*) as count FROM appointments').get().count || 0;
      const upcoming = db.prepare("SELECT COUNT(*) as count FROM appointments WHERE status IN ('scheduled','confirmed') AND start_at >= ?").get(now()).count || 0;
      const completed = db.prepare("SELECT COUNT(*) as count FROM appointments WHERE status = 'completed'").get().count || 0;
      const cancelled = db.prepare("SELECT COUNT(*) as count FROM appointments WHERE status = 'cancelled'").get().count || 0;
      const noShow = db.prepare("SELECT COUNT(*) as count FROM appointments WHERE status = 'no_show'").get().count || 0;
      return { total, upcoming, completed, cancelled, noShow };
    },

    countForms() {
      return db.prepare('SELECT COUNT(*) AS count FROM form_submissions').get().count;
    },

    listContent(collection, { status, page, pageSize, includeDraft = true }) {
      const p = Math.max(Number(page) || 1, 1);
      const size = Math.min(Math.max(Number(pageSize) || 50, 1), 200);
      const offset = (p - 1) * size;
      let where = 'WHERE collection = ?';
      const params = [collection];

      if (status) {
        where += ' AND status = ?';
        params.push(status);
      } else if (!includeDraft) {
        where += " AND status != 'draft'";
      }

      const items = db
        .prepare(`SELECT * FROM content_items ${where} ORDER BY updated_at DESC LIMIT ? OFFSET ?`)
        .all(...params, size, offset)
        .map(mapContent);

      const total = db.prepare(`SELECT COUNT(*) AS count FROM content_items ${where}`).get(...params).count;
      return {
        items,
        page: p,
        pageSize: size,
        total,
        totalPages: Math.max(Math.ceil(total / size), 1),
      };
    },

    getContentById(collection, id, { includeDraft = true } = {}) {
      const row = db.prepare('SELECT * FROM content_items WHERE collection = ? AND id = ? LIMIT 1').get(collection, id);
      if (!row) return null;
      if (!includeDraft && row.status === 'draft') return null;
      return mapContent(row);
    },

    createContent(collection, payload, createdBy) {
      const id = uuid();
      const timestamp = now();
      const status = payload.status || 'draft';
      db.prepare(`
        INSERT INTO content_items (id, collection, title, slug, status, payload_json, created_by, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        id,
        collection,
        payload.title || null,
        payload.slug || null,
        status,
        JSON.stringify(payload),
        createdBy || null,
        timestamp,
        timestamp,
      );
      return this.getContentById(collection, id);
    },

    updateContent(collection, id, patch) {
      const row = db.prepare('SELECT * FROM content_items WHERE collection = ? AND id = ? LIMIT 1').get(collection, id);
      if (!row) return null;

      const oldPayload = parsePayload(row.payload_json);
      const newPayload = { ...oldPayload, ...patch };
      const newStatus = patch.status || row.status;

      db.prepare(`
        UPDATE content_items
        SET title = ?, slug = ?, status = ?, payload_json = ?, updated_at = ?
        WHERE collection = ? AND id = ?
      `).run(newPayload.title || null, newPayload.slug || null, newStatus, JSON.stringify(newPayload), now(), collection, id);

      return this.getContentById(collection, id);
    },

    deleteContent(collection, id) {
      const existing = this.getContentById(collection, id);
      if (!existing) return null;
      db.prepare('DELETE FROM content_items WHERE collection = ? AND id = ?').run(collection, id);
      return existing;
    },

    contentStats(collections) {
      return collections.map((collection) => {
        const row = db
          .prepare(`
            SELECT
              COUNT(*) AS total,
              SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END) AS published,
              SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) AS draft
            FROM content_items
            WHERE collection = ?
          `)
          .get(collection);
        return {
          collection,
          total: row.total || 0,
          published: row.published || 0,
          draft: row.draft || 0,
        };
      });
    },

    getSettings() {
      const row = db.prepare('SELECT value FROM settings WHERE key = ?').get('church_settings');
      return row ? JSON.parse(row.value) : {
        churchName: '',
        churchAddress: '',
        churchPhone: '',
        churchEmail: '',
        churchWebsite: '',
        pastorName: '',
        serviceTimes: '',
        socialLinks: {},
        aboutText: ''
      };
    },

    saveSettings(settings) {
      const value = JSON.stringify(settings);
      db.prepare(`
        INSERT OR REPLACE INTO settings (key, value, updated_at)
        VALUES (?, ?, ?)
      `).run('church_settings', value, now());
    },

    countContent(collection) {
      const row = db.prepare('SELECT COUNT(*) as count FROM content_items WHERE collection = ?').get(collection);
      return row.count || 0;
    },

    countForms() {
      const row = db.prepare('SELECT COUNT(*) as count FROM form_submissions').get();
      return row.count || 0;
    },
  };
}

module.exports = {
  initDb,
  sanitizeKey,
};
