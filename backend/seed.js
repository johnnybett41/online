const sqlite3 = require('sqlite3').verbose();
const { seedProductsIfNeeded } = require('./seedProducts');

const DB_PATH = process.env.DATABASE_PATH || './database.db';

const db = new sqlite3.Database(DB_PATH);

seedProductsIfNeeded(db)
  .then((seeded) => {
    if (seeded) {
      console.log('Database initialized and sample products added.');
    } else {
      console.log('Products already seeded.');
    }
  })
  .catch((err) => {
    console.error('Error initializing database:', err.message);
  })
  .finally(() => {
    db.close((err) => {
      if (err) {
        console.error(err.message);
      }
    });
  });
