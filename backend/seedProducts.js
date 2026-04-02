const { PRODUCTS_CATALOG_VERSION, buildProductCatalog } = require('./utils/productCatalog');

const products = buildProductCatalog();

function run(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function onRun(err) {
      if (err) {
        reject(err);
        return;
      }

      resolve(this);
    });
  });
}

function get(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(row);
    });
  });
}

function all(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(rows);
    });
  });
}

async function ensureSchema(db) {
  await run(db, 'PRAGMA foreign_keys = ON');

  await run(
    db,
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`
  );

  await run(
    db,
    `CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      image TEXT,
      category TEXT,
      is_active INTEGER NOT NULL DEFAULT 0
    )`
  );

  const productColumns = await all(db, 'PRAGMA table_info(products)');
  const hasIsActive = productColumns.some((column) => column.name === 'is_active');
  if (!hasIsActive) {
    await run(db, 'ALTER TABLE products ADD COLUMN is_active INTEGER NOT NULL DEFAULT 0');
  }

  const hasStockQuantity = productColumns.some((column) => column.name === 'stock_quantity');
  if (!hasStockQuantity) {
    await run(db, 'ALTER TABLE products ADD COLUMN stock_quantity INTEGER NOT NULL DEFAULT 0');
  }

  await run(
    db,
    `CREATE TABLE IF NOT EXISTS cart (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      UNIQUE(user_id, product_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id)
    )`
  );

  await run(
    db,
    `CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      total REAL NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'pending_payment',
      stock_deducted_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`
  );

  const orderColumns = await all(db, 'PRAGMA table_info(orders)');
  const addOrderColumnIfMissing = async (name, definition) => {
    const exists = orderColumns.some((column) => column.name === name);
    if (!exists) {
      await run(db, `ALTER TABLE orders ADD COLUMN ${definition}`);
    }
  };

  await addOrderColumnIfMissing('mpesa_checkout_request_id', 'mpesa_checkout_request_id TEXT');
  await addOrderColumnIfMissing('mpesa_receipt_number', 'mpesa_receipt_number TEXT');
  await addOrderColumnIfMissing('mpesa_phone_number', 'mpesa_phone_number TEXT');
  await addOrderColumnIfMissing('mpesa_paid_at', 'mpesa_paid_at DATETIME');
  await addOrderColumnIfMissing('stock_deducted_at', 'stock_deducted_at DATETIME');

  await run(
    db,
    `CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      price REAL NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id)
    )`
  );

  await run(
    db,
    `CREATE TABLE IF NOT EXISTS app_meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )`
  );
}

async function seedProductsIfNeeded(db) {
  await ensureSchema(db);

  const desiredNames = products.map((product) => product.name);
  const placeholders = desiredNames.map(() => '?').join(', ');
  let changed = false;

  for (const product of products) {
    const existing = await get(db, 'SELECT id, is_active FROM products WHERE name = ? LIMIT 1', [product.name]);

    if (existing) {
      await run(
        db,
        `UPDATE products
         SET description = ?, price = ?, image = ?, category = ?, stock_quantity = ?, is_active = 1
         WHERE id = ?`,
        [product.description, product.price, product.image, product.category, product.stock_quantity, existing.id]
      );
      if (!existing.is_active) {
        changed = true;
      }
      if (existing.stock_quantity !== product.stock_quantity) {
        changed = true;
      }
    } else {
      await run(
        db,
        `INSERT INTO products (name, description, price, image, category, stock_quantity, is_active)
         VALUES (?, ?, ?, ?, ?, ?, 1)`,
        [product.name, product.description, product.price, product.image, product.category, product.stock_quantity]
      );
      changed = true;
    }
  }

  const deactivateResult = await run(
    db,
    `UPDATE products
     SET is_active = 0
     WHERE name NOT IN (${placeholders})`,
    desiredNames
  );

  if (deactivateResult.changes > 0) {
    changed = true;
  }

  const currentVersion = await get(db, 'SELECT value FROM app_meta WHERE key = ?', ['product_catalog_version']);
  if (!currentVersion || currentVersion.value !== String(PRODUCTS_CATALOG_VERSION)) {
    await run(
      db,
      `INSERT INTO app_meta (key, value)
       VALUES (?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
      ['product_catalog_version', String(PRODUCTS_CATALOG_VERSION)]
    );
    changed = true;
  }

  return changed;
}

module.exports = { seedProductsIfNeeded };
