/**
 * Database Migration Runner
 * Handles running and tracking migrations
 */

const path = require('path');
const fs = require('fs');

const MIGRATIONS_DIR = path.join(__dirname, '..', 'migrations');
const MIGRATIONS_TABLE = 'migrations';

const initMigrationsTable = async (db) => {
  await db.query(`
    CREATE TABLE IF NOT EXISTS ${MIGRATIONS_TABLE} (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
};

const getMigrations = async (db) => {
  const result = await db.query(`SELECT name FROM ${MIGRATIONS_TABLE} ORDER BY executed_at`);
  return result.rows.map(row => row.name);
};

const recordMigration = async (db, name) => {
  await db.query(`INSERT INTO ${MIGRATIONS_TABLE} (name) VALUES ($1)`, [name]);
};

const removeMigrationRecord = async (db, name) => {
  await db.query(`DELETE FROM ${MIGRATIONS_TABLE} WHERE name = $1`, [name]);
};

const runMigrations = async (db) => {
  try {
    await initMigrationsTable(db);
    
    const executedMigrations = await getMigrations(db);
    const files = fs.readdirSync(MIGRATIONS_DIR)
      .filter(f => f.endsWith('.js') && !f.startsWith('.'))
      .sort();

    let migrationsRun = 0;

    for (const file of files) {
      if (executedMigrations.includes(file)) {
        console.log(`⊘ Skipping already executed migration: ${file}`);
        continue;
      }

      console.log(`→ Running migration: ${file}`);
      const migration = require(path.join(MIGRATIONS_DIR, file));

      try {
        await migration.migrate(db);
        await recordMigration(db, file);
        migrationsRun++;
        console.log(`✓ Migration completed: ${file}`);
      } catch (error) {
        console.error(`✗ Migration failed: ${file}`);
        throw error;
      }
    }

    if (migrationsRun === 0) {
      console.log('No new migrations to run');
    } else {
      console.log(`Successfully ran ${migrationsRun} migration(s)`);
    }

    return migrationsRun;
  } catch (error) {
    console.error('Migration run failed:', error);
    throw error;
  }
};

const rollbackMigrations = async (db, count = 1) => {
  try {
    await initMigrationsTable(db);
    
    const executedMigrations = await getMigrations(db);
    
    if (executedMigrations.length === 0) {
      console.log('No migrations to rollback');
      return 0;
    }

    const toRollback = executedMigrations.slice(-count);
    let rolledBack = 0;

    for (const name of toRollback) {
      console.log(`↶ Rolling back migration: ${name}`);
      const migration = require(path.join(MIGRATIONS_DIR, name));

      try {
        await migration.rollback(db);
        await removeMigrationRecord(db, name);
        rolledBack++;
        console.log(`✓ Rollback completed: ${name}`);
      } catch (error) {
        console.error(`✗ Rollback failed: ${name}`);
        throw error;
      }
    }

    return rolledBack;
  } catch (error) {
    console.error('Rollback failed:', error);
    throw error;
  }
};

module.exports = { runMigrations, rollbackMigrations };
