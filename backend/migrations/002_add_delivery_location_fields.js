/**
 * Migration: Add structured delivery location fields to orders table
 * Adds county, town, and postal code alongside the existing delivery address
 */

const migrate = async (db) => {
  try {
    console.log('Running migration: Adding delivery location fields to orders table...');

    let alreadyApplied = false;

    try {
      const result = await db.query(`
        SELECT column_name FROM information_schema.columns 
        WHERE table_name='orders' AND column_name='delivery_county'
      `);
      alreadyApplied = result.rows.length > 0;
    } catch (infoSchemaError) {
      const pragmaResult = await db.query(`PRAGMA table_info(orders)`);
      alreadyApplied = (pragmaResult.rows || []).some((column) => column.name === 'delivery_county');
    }

    if (alreadyApplied) {
      console.log('Migration already applied. Skipping...');
      return true;
    }

    const isSqlite = !!process.env.SQLITE_PATH || !process.env.DATABASE_URL;

    if (isSqlite) {
      await db.query(`ALTER TABLE orders ADD COLUMN delivery_county VARCHAR(100)`);
      await db.query(`ALTER TABLE orders ADD COLUMN delivery_town VARCHAR(100)`);
      await db.query(`ALTER TABLE orders ADD COLUMN delivery_postal_code VARCHAR(20)`);
    } else {
      await db.query(`
        ALTER TABLE orders
        ADD COLUMN IF NOT EXISTS delivery_county VARCHAR(100),
        ADD COLUMN IF NOT EXISTS delivery_town VARCHAR(100),
        ADD COLUMN IF NOT EXISTS delivery_postal_code VARCHAR(20)
      `);
    }

    console.log('✓ Successfully added delivery location fields to orders table');
    return true;
  } catch (error) {
    console.error('✗ Migration failed:', error.message);
    throw error;
  }
};

const rollback = async (db) => {
  try {
    console.log('Rolling back: Removing delivery location fields from orders table...');

    if (process.env.SQLITE_PATH || !process.env.DATABASE_URL) {
      console.log('SQLite rollback is a no-op for this migration.');
      return true;
    }

    await db.query(`
      ALTER TABLE orders
      DROP COLUMN IF EXISTS delivery_county,
      DROP COLUMN IF EXISTS delivery_town,
      DROP COLUMN IF EXISTS delivery_postal_code
    `);

    console.log('✓ Successfully rolled back delivery location fields');
    return true;
  } catch (error) {
    console.error('✗ Rollback failed:', error.message);
    throw error;
  }
};

module.exports = { migrate, rollback };
