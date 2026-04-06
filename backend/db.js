const { Pool } = require('pg');
const { seedProductsIfNeeded } = require('./seedProducts');
const { runMigrations } = require('./utils/migrationRunner');

// PostgreSQL connection pool
const poolConfig = process.env.DATABASE_URL ? {
  connectionString: process.env.DATABASE_URL,
} : {
  // For local development only
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'online_db',
};

console.log('Database configuration:', {
  hasDatabaseUrl: !!process.env.DATABASE_URL,
  databaseUrlLength: process.env.DATABASE_URL ? process.env.DATABASE_URL.length : 0,
  usingConnectionString: !!process.env.DATABASE_URL,
  poolConfigKeys: Object.keys(poolConfig)
});

const pool = new Pool(poolConfig);

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

console.log('PostgreSQL pool initialized');

// Create a wrapper object with methods that match the old SQLite interface
const db = {
  run: (sql, params = [], callback = () => {}) => {
    pool.query(sql, params, (err, result) => {
      if (err) {
        return callback(err);
      }
      // Handle RETURNING id for INSERT/UPDATE queries
      const lastID = result.rows?.[0]?.id || null;
      callback(null, { 
        changes: result.rowCount,
        lastID: lastID,
        // Make it compatible with SQLite's this context
        rows: result.rows
      });
    });
  },
  get: (sql, params = [], callback = () => {}) => {
    pool.query(sql, params, (err, result) => {
      if (err) {
        return callback(err);
      }
      callback(null, result.rows[0]);
    });
  },
  all: (sql, params = [], callback = () => {}) => {
    pool.query(sql, params, (err, result) => {
      if (err) {
        return callback(err);
      }
      callback(null, result.rows);
    });
  },
};

// Promise-based version for seedProductsIfNeeded
const dbPromise = {
  run: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      pool.query(sql, params, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve({ changes: result.rowCount });
        }
      });
    });
  },
  get: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      pool.query(sql, params, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result.rows[0]);
        }
      });
    });
  },
  all: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      pool.query(sql, params, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result.rows);
        }
      });
    });
  },
  query: (sql, params = []) => {
    return pool.query(sql, params);
  },
};

const dbReady = seedProductsIfNeeded(dbPromise)
  .then((seeded) => {
    if (seeded) {
      console.log('Database initialized and sample products added.');
    } else {
      console.log('Products already seeded.');
    }
    // Run migrations after seeding
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
