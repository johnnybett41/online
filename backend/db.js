const sqlite3 = require('sqlite3').verbose();
const { seedProductsIfNeeded } = require('./seedProducts');

const DB_PATH = process.env.DATABASE_PATH || './database.db';

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the SQLite database.');
});

const dbReady = seedProductsIfNeeded(db)
  .then((seeded) => {
    if (seeded) {
      console.log('Database initialized and sample products added.');
    } else {
      console.log('Products already seeded.');
    }
  })
  .catch((err) => {
    console.error('Database initialization failed:', err.message);
    throw err;
  });

module.exports = { db, dbReady };
