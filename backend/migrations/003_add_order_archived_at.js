/**
 * Migration: Add archived_at to orders table
 * Allows users to hide past purchases without deleting them permanently.
 */

const migrate = async (db) => {
  try {
    console.log('Running migration: Adding archived_at to orders table...');

    let alreadyApplied = false;

    try {
      const result = await db.query(`
        SELECT column_name FROM information_schema.columns
        WHERE table_name='orders' AND column_name='archived_at'
      `);
      alreadyApplied = result.rows.length > 0;
    } catch (infoSchemaError) {
      const pragmaResult = await db.query(`PRAGMA table_info(orders)`);
      alreadyApplied = (pragmaResult.rows || []).some((column) => column.name === 'archived_at');
    }

    if (alreadyApplied) {
      console.log('Migration already applied. Skipping...');
      return true;
    }

    const isSqlite = !!process.env.SQLITE_PATH || !process.env.DATABASE_URL;

    if (isSqlite) {
      await db.query(`ALTER TABLE orders ADD COLUMN archived_at TIMESTAMP`);
    } else {
      await db.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP`);
    }

    console.log('✓ Successfully added archived_at to orders table');
    return true;
  } catch (error) {
    console.error('✗ Migration failed:', error.message);
    throw error;
  }
};

const rollback = async (db) => {
  try {
    console.log('Rolling back: Removing archived_at from orders table...');

    if (process.env.SQLITE_PATH || !process.env.DATABASE_URL) {
      console.log('SQLite rollback is a no-op for this migration.');
      return true;
    }

    await db.query(`ALTER TABLE orders DROP COLUMN IF EXISTS archived_at`);

    console.log('✓ Successfully rolled back archived_at');
    return true;
  } catch (error) {
    console.error('✗ Rollback failed:', error.message);
    throw error;
  }
};

module.exports = { migrate, rollback };
