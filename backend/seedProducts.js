const PRODUCTS_CATALOG_VERSION = 1;

const products = [
  {
    name: 'Bulb LED 7 Watts B22 (Pin)',
    description: 'Energy-saving 7W LED bulb with B22 base for reliable everyday lighting.',
    price: 145,
    image: 'https://www.tronic.co.ke/cdn/shop/files/LE_0722-DL_75x75_crop_center.jpg?v=1756396790',
    category: 'Lighting',
  },
  {
    name: 'Insulation Tape 20 Yard - Black',
    description: 'Durable black insulation tape for electrical repairs and cable finishing.',
    price: 150,
    image: 'https://www.tronic.co.ke/cdn/shop/products/IT02BK_2476795c-6585-4d6b-8d43-f40c06ee8549_75x75_crop_center.jpg?v=1756396877',
    category: 'Wiring Accessories',
  },
  {
    name: 'Grey - Single Blanking Plate – Screwless Design',
    description: 'Screwless blanking plate for a clean finish on unused wall openings.',
    price: 195,
    image: 'https://www.tronic.co.ke/cdn/shop/files/TD5100-GY_75x75_crop_center.jpg?v=1756397318',
    category: 'Wiring Accessories',
  },
  {
    name: '1 Gang 2 Way Switch – Black',
    description: 'Modern black 1-gang 2-way switch for elegant lighting control.',
    price: 280,
    image: 'https://www.tronic.co.ke/cdn/shop/files/TD5112-BK_1_75x75_crop_center.jpg?v=1756397571',
    category: 'Wiring Accessories',
  },
  {
    name: '1-Gang 2-Way Switch – Grey',
    description: 'Grey screwless 2-way switch designed for stylish and practical installations.',
    price: 290,
    image: 'https://www.tronic.co.ke/cdn/shop/files/TD5112-GY_bba9c1e7-c9a2-4808-ac0b-8598ad8875bf_75x75_crop_center.jpg?v=1756397589',
    category: 'Wiring Accessories',
  },
  {
    name: 'DP Switch With Neon 45A BK',
    description: 'Heavy-duty 45A double pole switch with neon indicator and a black finish.',
    price: 750,
    image: 'https://www.tronic.co.ke/cdn/shop/files/TD-5145-BK_75x75_crop_center.jpg?v=1754857522',
    category: 'Power & Protection',
  },
  {
    name: 'Grey Double Socket with Neon Light Indicator – 2 Gang, 13A',
    description: 'Grey twin socket with neon indicators and a clean, screwless modern finish.',
    price: 750,
    image: 'https://www.tronic.co.ke/cdn/shop/files/TD_5213-NE-GY_e9f70474-7177-41e6-864d-f520d71c4d69_75x75_crop_center.jpg?v=1770793228',
    category: 'Wiring Accessories',
  },
  {
    name: 'Gold 2-Gang Switched Socket with Neon – Single Pole',
    description: 'Gold twin switched socket with neon indicators for a premium wall finish.',
    price: 770,
    image: 'https://www.tronic.co.ke/cdn/shop/files/17_5e41eb81-3730-41ab-82d0-9a2957aea053_75x75_crop_center.png?v=1756398878',
    category: 'Wiring Accessories',
  },
  {
    name: 'Refrigerator Guard',
    description: 'Voltage protection for refrigerators and other sensitive appliances.',
    price: 1050,
    image: 'https://www.tronic.co.ke/cdn/shop/files/VP-HG13-BS_75x75_crop_center.jpg?v=1756396778',
    category: 'Power & Protection',
  },
  {
    name: 'Power Guard Voltage Protector 13A White',
    description: '13A voltage protector designed to help safeguard home appliances.',
    price: 1050,
    image: 'https://www.tronic.co.ke/cdn/shop/files/VP-HG13-BS_75x75_crop_center.jpg?v=1756396778',
    category: 'Power & Protection',
  },
  {
    name: 'Digital Timer Switch 25Amps',
    description: '25A digital timer switch for automated control of electrical loads.',
    price: 1400,
    image: 'https://www.tronic.co.ke/cdn/shop/products/EM-DT25_75x75_crop_center.jpg?v=1756398879',
    category: 'Power & Protection',
  },
  {
    name: 'Extension 4 way Black',
    description: 'Black 4-way extension socket for powering multiple devices at once.',
    price: 1545,
    image: 'https://www.tronic.co.ke/cdn/shop/files/TRK7864-BK_75x75_crop_center.jpg?v=1756399001',
    category: 'Power & Protection',
  },
  {
    name: '4-Way Extension Socket with USB & Type-C Ports – 13A, 3-Meter Cable',
    description: 'Multi-socket extension with USB and Type-C charging in one convenient strip.',
    price: 2050,
    image: 'https://www.tronic.co.ke/cdn/shop/files/17_5e41eb81-3730-41ab-82d0-9a2957aea053_75x75_crop_center.png?v=1756398878',
    category: 'Power & Protection',
  },
  {
    name: 'Waterproof Switch - 1 Gang 2 Way',
    description: 'IP66-rated waterproof 2-way switch for outdoor and wet environments.',
    price: 1120,
    image: 'https://www.tronic.co.ke/cdn/shop/files/TP5112-WP_75x75_crop_center.jpg?v=1756398465',
    category: 'Wiring Accessories',
  },
];

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
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`
  );

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
         SET description = ?, price = ?, image = ?, category = ?, is_active = 1
         WHERE id = ?`,
        [product.description, product.price, product.image, product.category, existing.id]
      );
      if (!existing.is_active) {
        changed = true;
      }
    } else {
      await run(
        db,
        `INSERT INTO products (name, description, price, image, category, is_active)
         VALUES (?, ?, ?, ?, ?, 1)`,
        [product.name, product.description, product.price, product.image, product.category]
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
