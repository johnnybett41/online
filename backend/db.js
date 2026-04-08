const path = require('path');
const { DatabaseSync } = require('node:sqlite');
const { Pool } = require('pg');
const { seedProductsIfNeeded } = require('./seedProducts');
const { runMigrations } = require('./utils/migrationRunner');

const usePostgres = Boolean(process.env.DATABASE_URL);

function isReturningStatement(sql) {
  return /\bselect\b/i.test(sql) || /\breturning\b/i.test(sql) || /^\s*with\b/i.test(sql);
}

function normalizeSql(sql) {
  return String(sql).replace(/\$\d+/g, '?');
}

function createSqliteDriver() {
  const dbPath = process.env.SQLITE_PATH || path.join(__dirname, 'database.db');
  const sqlite = new DatabaseSync(dbPath);

  sqlite.exec('PRAGMA foreign_keys = ON;');

  const runSync = (sql, params = []) => {
    const normalizedSql = normalizeSql(sql);
    const trimmed = String(normalizedSql).trim();

    if (/^(begin|commit|rollback)\b/i.test(trimmed) || /^pragma\b/i.test(trimmed)) {
      sqlite.exec(trimmed);
      return { changes: 0, lastID: null, rows: [] };
    }

    const stmt = sqlite.prepare(normalizedSql);
    if (isReturningStatement(normalizedSql)) {
      const rows = stmt.all(...params);
      return {
        changes: rows.length,
        lastID: rows[0]?.id || null,
        rows,
      };
    }

    const result = stmt.run(...params);
    return {
      changes: Number(result?.changes || 0),
      lastID: result?.lastInsertRowid ? Number(result.lastInsertRowid) : null,
      rows: [],
    };
  };

  const getSync = (sql, params = []) => {
    const normalizedSql = normalizeSql(sql);
    if (/^(begin|commit|rollback)\b/i.test(String(normalizedSql).trim())) {
      sqlite.exec(String(normalizedSql).trim());
      return undefined;
    }

    const stmt = sqlite.prepare(normalizedSql);
    if (isReturningStatement(normalizedSql)) {
      return stmt.all(...params)[0];
    }

    return stmt.get(...params);
  };

  const allSync = (sql, params = []) => {
    const normalizedSql = normalizeSql(sql);
    if (/^(begin|commit|rollback)\b/i.test(String(normalizedSql).trim())) {
      sqlite.exec(String(normalizedSql).trim());
      return [];
    }

    const stmt = sqlite.prepare(normalizedSql);
    if (isReturningStatement(normalizedSql)) {
      return stmt.all(...params);
    }

    return stmt.all(...params);
  };

  const querySync = (sql, params = []) => {
    const normalizedSql = normalizeSql(sql);
    const trimmed = String(normalizedSql).trim();

    if (/^(begin|commit|rollback)\b/i.test(trimmed) || /^pragma\b/i.test(trimmed)) {
      sqlite.exec(trimmed);
      return { rows: [], rowCount: 0 };
    }

    const stmt = sqlite.prepare(normalizedSql);
    if (isReturningStatement(normalizedSql)) {
      const rows = stmt.all(...params);
      return {
        rows,
        rowCount: rows.length,
        lastID: rows[0]?.id || null,
      };
    }

    const result = stmt.run(...params);
    return {
      rows: [],
      rowCount: Number(result?.changes || 0),
      lastID: result?.lastInsertRowid ? Number(result.lastInsertRowid) : null,
    };
  };

  return { runSync, getSync, allSync, querySync };
}

function createPostgresDriver() {
  const poolConfig = {
    connectionString: process.env.DATABASE_URL,
  };

  console.log('Database configuration:', {
    hasDatabaseUrl: true,
    databaseUrlLength: process.env.DATABASE_URL ? process.env.DATABASE_URL.length : 0,
    usingConnectionString: true,
    poolConfigKeys: Object.keys(poolConfig),
  });

  const pool = new Pool(poolConfig);

  pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
  });

  console.log('PostgreSQL pool initialized');

  const query = (sql, params = []) =>
    new Promise((resolve, reject) => {
      pool.query(sql, params, (err, result) => {
        if (err) {
          reject(err);
          return;
        }

        resolve(result);
      });
    });

  return {
    runSync: (sql, params = []) => {
      throw new Error(`runSync is not available for PostgreSQL adapter: ${sql}`);
    },
    getSync: (sql, params = []) => {
      throw new Error(`getSync is not available for PostgreSQL adapter: ${sql}`);
    },
    allSync: (sql, params = []) => {
      throw new Error(`allSync is not available for PostgreSQL adapter: ${sql}`);
    },
    querySync: (sql, params = []) => {
      throw new Error(`querySync is not available for PostgreSQL adapter: ${sql}`);
    },
    query,
  };
}

const driver = usePostgres ? createPostgresDriver() : createSqliteDriver();

const db = usePostgres
  ? {
      run: (sql, params = [], callback = () => {}) => {
        driver.query(sql, params)
          .then((result) => {
            const runResult = {
              changes: result.rowCount,
              lastID: result.rows?.[0]?.id || null,
              rows: result.rows,
            };
            callback.call(runResult, null, runResult);
          })
          .catch((err) => callback(err));
      },
      get: (sql, params = [], callback = () => {}) => {
        driver.query(sql, params)
          .then((result) => callback(null, result.rows[0]))
          .catch((err) => callback(err));
      },
      all: (sql, params = [], callback = () => {}) => {
        driver.query(sql, params)
          .then((result) => callback(null, result.rows))
          .catch((err) => callback(err));
      },
      query: driver.query,
    }
  : {
      run: (sql, params = [], callback = () => {}) => {
        try {
          const result = driver.runSync(sql, params);
          callback.call(result, null, result);
        } catch (err) {
          callback(err);
        }
      },
      get: (sql, params = [], callback = () => {}) => {
        try {
          callback(null, driver.getSync(sql, params));
        } catch (err) {
          callback(err);
        }
      },
      all: (sql, params = [], callback = () => {}) => {
        try {
          callback(null, driver.allSync(sql, params));
        } catch (err) {
          callback(err);
        }
      },
      query: (sql, params = []) => Promise.resolve(driver.querySync(sql, params)),
    };

const dbPromise = usePostgres
  ? {
      run: (sql, params = []) =>
        driver.query(sql, params).then((result) => ({ changes: result.rowCount, rows: result.rows })),
      get: (sql, params = []) => driver.query(sql, params).then((result) => result.rows[0]),
      all: (sql, params = []) => driver.query(sql, params).then((result) => result.rows),
      query: driver.query,
    }
  : {
      run: (sql, params = []) => Promise.resolve(driver.runSync(sql, params)),
      get: (sql, params = []) => Promise.resolve(driver.getSync(sql, params)),
      all: (sql, params = []) => Promise.resolve(driver.allSync(sql, params)),
      query: (sql, params = []) => Promise.resolve(driver.querySync(sql, params)),
    };

const dbReady = seedProductsIfNeeded(dbPromise)
  .then((seeded) => {
    if (seeded) {
      console.log('Database initialized and sample products added.');
    } else {
      console.log('Products already seeded.');
    }
    return runMigrations(dbPromise);
  })
  .then((migrationsRun) => {
    console.log(`Database migrations completed (${migrationsRun} new migrations).`);
  })
  .catch((err) => {
    console.error('Database initialization failed:', err.message);
    throw err;
  });

module.exports = { db, dbReady };
