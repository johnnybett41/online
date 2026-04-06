const { PRODUCTS_CATALOG_VERSION, buildProductCatalog } = require('./utils/productCatalog');

const products = buildProductCatalog();

async function ensureSchema(db) {
  // Create users table
  await db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create products table
  await db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      price NUMERIC NOT NULL,
      image TEXT,
      category TEXT,
      is_active BOOLEAN NOT NULL DEFAULT false,
      stock_quantity INTEGER NOT NULL DEFAULT 0
    )
  `);

  // Create cart table
  await db.run(`
    CREATE TABLE IF NOT EXISTS cart (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      UNIQUE(user_id, product_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id)
    )
  `);

  // Create orders table
  await db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      total NUMERIC NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'pending_payment',
      mpesa_checkout_request_id TEXT,
      mpesa_receipt_number TEXT,
      mpesa_phone_number TEXT,
      mpesa_paid_at TIMESTAMP,
      stock_deducted_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Create order_items table
  await db.run(`
    CREATE TABLE IF NOT EXISTS order_items (
      id SERIAL PRIMARY KEY,
      order_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      price NUMERIC NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id)
    )
  `);

  // Create app_meta table
  await db.run(`
    CREATE TABLE IF NOT EXISTS app_meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `);
}

async function seedProductsIfNeeded(db) {
  await ensureSchema(db);

  const desiredNames = products.map((product) => product.name);
  let changed = false;

  for (const product of products) {
    const existing = await db.get(
      'SELECT id, is_active, stock_quantity FROM products WHERE name = $1 LIMIT 1',
      [product.name]
    );

    if (existing) {
      const result = await db.run(
        `UPDATE products
         SET description = $1, price = $2, image = $3, category = $4, stock_quantity = $5, is_active = true
         WHERE id = $6`,
        [product.description, product.price, product.image, product.category, product.stock_quantity, existing.id]
      );
      if (!existing.is_active) {
        changed = true;
      }
      if (existing.stock_quantity !== product.stock_quantity) {
        changed = true;
      }
    } else {
      await db.run(
        `INSERT INTO products (name, description, price, image, category, stock_quantity, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, true)`,
        [product.name, product.description, product.price, product.image, product.category, product.stock_quantity]
      );
      changed = true;
    }
  }

  // Deactivate products not in the catalog
  const placeholders = desiredNames.map((_, i) => `$${i + 1}`).join(', ');
  const deactivateResult = await db.run(
    `UPDATE products
     SET is_active = false
     WHERE name NOT IN (${placeholders})`,
    desiredNames
  );

  if (deactivateResult.changes > 0) {
    changed = true;
  }

  // Update product catalog version
  const currentVersion = await db.get(
    'SELECT value FROM app_meta WHERE key = $1',
    ['product_catalog_version']
  );

  if (!currentVersion || currentVersion.value !== String(PRODUCTS_CATALOG_VERSION)) {
    await db.run(
      `INSERT INTO app_meta (key, value) VALUES ($1, $2)
       ON CONFLICT(key) DO UPDATE SET value = EXCLUDED.value`,
      ['product_catalog_version', String(PRODUCTS_CATALOG_VERSION)]
    );
    changed = true;
  }

  return changed;
}

module.exports = { seedProductsIfNeeded };
