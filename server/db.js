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

    CREATE INDEX IF NOT EXISTS idx_content_collection ON content_items(collection);
    CREATE INDEX IF NOT EXISTS idx_content_status ON content_items(status);
    CREATE INDEX IF NOT EXISTS idx_forms_type ON form_submissions(type);
    CREATE INDEX IF NOT EXISTS idx_forms_status ON form_submissions(status);
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
