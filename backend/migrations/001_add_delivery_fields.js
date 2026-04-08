/**
 * Migration: Add delivery tracking fields to orders table
 * Adds support for delivery address, method, cost, and estimated delivery date
 */

const migrate = async (db) => {
  try {
    console.log('Running migration: Adding delivery fields to orders table...');

    let alreadyApplied = false;

    try {
      const result = await db.query(`
        SELECT column_name FROM information_schema.columns 
        WHERE table_name='orders' AND column_name='delivery_address'
      `);
      alreadyApplied = result.rows.length > 0;
    } catch (infoSchemaError) {
      const pragmaResult = await db.query(`PRAGMA table_info(orders)`);
      alreadyApplied = (pragmaResult.rows || []).some((column) => column.name === 'delivery_address');
    }

    if (alreadyApplied) {
      console.log('Migration already applied. Skipping...');
      return true;
    }

    const isSqlite = !!process.env.SQLITE_PATH || !process.env.DATABASE_URL;

    if (isSqlite) {
      await db.query(`ALTER TABLE orders ADD COLUMN delivery_address TEXT`);
      await db.query(`ALTER TABLE orders ADD COLUMN delivery_method VARCHAR(50) DEFAULT 'standard'`);
      await db.query(`ALTER TABLE orders ADD COLUMN delivery_cost NUMERIC DEFAULT 0`);
      await db.query(`ALTER TABLE orders ADD COLUMN estimated_delivery_date TIMESTAMP`);
      await db.query(`ALTER TABLE orders ADD COLUMN payment_method VARCHAR(50) DEFAULT 'mpesa'`);
      await db.query(`ALTER TABLE orders ADD COLUMN phone_number VARCHAR(20)`);
    } else {
      await db.query(`
        ALTER TABLE orders
        ADD COLUMN IF NOT EXISTS delivery_address TEXT,
        ADD COLUMN IF NOT EXISTS delivery_method VARCHAR(50) DEFAULT 'standard',
        ADD COLUMN IF NOT EXISTS delivery_cost NUMERIC DEFAULT 0,
        ADD COLUMN IF NOT EXISTS estimated_delivery_date TIMESTAMP,
        ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) DEFAULT 'mpesa',
        ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20)
      `);
    }

    console.log('✓ Successfully added delivery fields to orders table');
    return true;
  } catch (error) {
    console.error('✗ Migration failed:', error.message);
    throw error;
  }
};

const rollback = async (db) => {
  try {
    console.log('Rolling back: Removing delivery fields from orders table...');

    if (process.env.SQLITE_PATH || !process.env.DATABASE_URL) {
      console.log('SQLite rollback is a no-op for this migration.');
      return true;
    }

    await db.query(`
      ALTER TABLE orders
      DROP COLUMN IF EXISTS delivery_address,
      DROP COLUMN IF EXISTS delivery_method,
      DROP COLUMN IF EXISTS delivery_cost,
      DROP COLUMN IF EXISTS estimated_delivery_date,
      DROP COLUMN IF EXISTS payment_method,
      DROP COLUMN IF EXISTS phone_number
    `);

    console.log('✓ Successfully rolled back delivery fields');
    return true;
  } catch (error) {
    console.error('✗ Rollback failed:', error.message);
    throw error;
  }
};

module.exports = { migrate, rollback };
