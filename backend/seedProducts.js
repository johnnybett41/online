const PRODUCTS_CATALOG_VERSION = 3;

const products = [
  {
    name: 'Bulb LED 7 Watts B22 (Pin)',
    description: 'Energy-saving 7W LED bulb with B22 base for everyday lighting.',
    price: 145,
    image: 'https://www.tronic.co.ke/cdn/shop/files/LE_0722-DL_75x75_crop_center.jpg?v=1756396790',
    category: 'Lighting',
  },
  {
    name: 'Bulb LED 13 Watts E27 (Screw)',
    description: 'Bright 13W LED bulb with E27 screw base for homes and offices.',
    price: 270,
    image: 'https://www.tronic.co.ke/cdn/shop/files/WEBSITEPICTURES_74_75x75_crop_center.png?v=1756397544',
    category: 'Lighting',
  },
  {
    name: 'Bulb LED 30 Watts B22 (Pin)',
    description: 'High-output 30W LED bulb with B22 pin base for larger spaces.',
    price: 350,
    image: 'https://www.tronic.co.ke/cdn/shop/files/LE-3022-DL_75x75_crop_center.jpg?v=1756397907',
    category: 'Lighting',
  },
  {
    name: 'Sensor Bulb LED 7 Watts E27 (Screw)',
    description: 'Motion-sensing 7W LED bulb with E27 screw base for energy savings.',
    price: 1450,
    image: 'https://www.tronic.co.ke/cdn/shop/files/WEBSITEPICTURES_39_75x75_crop_center.png?v=1756397899',
    category: 'Lighting',
  },
  {
    name: 'Grey - Single Blanking Plate - Screwless Design',
    description: 'Screwless blanking plate for a clean finish on unused wall openings.',
    price: 195,
    image: 'https://www.tronic.co.ke/cdn/shop/files/TD5100-GY_75x75_crop_center.jpg?v=1756397318',
    category: 'Switches & Sockets',
  },
  {
    name: '1 Gang 2 Way Switch - Black',
    description: 'Modern black 1-gang 2-way switch for elegant lighting control.',
    price: 290,
    image: 'https://www.tronic.co.ke/cdn/shop/files/TD5112-BK_1_75x75_crop_center.jpg?v=1756397571',
    category: 'Switches & Sockets',
  },
  {
    name: '1-Gang 2-Way Switch - Grey',
    description: 'Grey screwless 2-way switch with a clean, modern finish.',
    price: 290,
    image: 'https://www.tronic.co.ke/cdn/shop/files/TD5112-GY_bba9c1e7-c9a2-4808-ac0b-8598ad8875bf_75x75_crop_center.jpg?v=1756397589',
    category: 'Switches & Sockets',
  },
  {
    name: 'Waterproof Switch - 1 Gang 2 Way',
    description: 'IP66-rated waterproof 2-way switch for wet and outdoor areas.',
    price: 1120,
    image: 'https://www.tronic.co.ke/cdn/shop/files/TP5112-WP_75x75_crop_center.jpg?v=1756398465',
    category: 'Switches & Sockets',
  },
  {
    name: 'Grey Double Socket with Neon Light Indicator - 2 Gang, 13A',
    description: 'Grey twin socket with neon indicators and a screwless finish.',
    price: 750,
    image: 'https://www.tronic.co.ke/cdn/shop/files/5_b52069d2-062a-4f95-b20c-a816f9a3e631_75x75_crop_center.png?v=1770793228',
    category: 'Switches & Sockets',
  },
  {
    name: 'Gold 2-Gang Switched Socket with Neon - Single Pole',
    description: 'Premium gold twin switched socket with neon indicators.',
    price: 750,
    image: 'https://www.tronic.co.ke/cdn/shop/files/17_5e41eb81-3730-41ab-82d0-9a2957aea053_75x75_crop_center.png?v=1756398878',
    category: 'Switches & Sockets',
  },
  {
    name: '13A 3-Gang UK Socket Adaptor with Switches',
    description: 'Three-gang socket adaptor with switches for flexible power control.',
    price: 1320,
    image: 'https://www.tronic.co.ke/cdn/shop/files/ordinary3gang_75x75_crop_center.jpg?v=1756398917',
    category: 'Adaptors & Extensions',
  },
  {
    name: '13A 3-Gang UK Socket Adaptor with USB & Type-C',
    description: 'Three-gang adaptor with USB and Type-C charging in one unit.',
    price: 1915,
    image: 'https://www.tronic.co.ke/cdn/shop/files/usb3gang_75x75_crop_center.jpg?v=1756396512',
    category: 'Adaptors & Extensions',
  },
  {
    name: '3-Way Extension Socket with USB-C & USB-A Charging',
    description: 'Compact three-way extension socket with USB-C and USB-A charging.',
    price: 1400,
    image: 'https://www.tronic.co.ke/cdn/shop/files/TR-7864-UBC_75x75_crop_center.jpg?v=1756396760',
    category: 'Adaptors & Extensions',
  },
  {
    name: 'Extension 4 way Black',
    description: 'Black 4-way extension socket for powering multiple devices at once.',
    price: 1545,
    image: 'https://www.tronic.co.ke/cdn/shop/files/TRK7864-BK_75x75_crop_center.jpg?v=1756399001',
    category: 'Adaptors & Extensions',
  },
  {
    name: '4-Way Extension Socket with Switches & Neon',
    description: '4-way extension with switches, neon indicators, and a power button.',
    price: 1695,
    image: 'https://www.tronic.co.ke/cdn/shop/files/EC7694-BS_1_75x75_crop_center.jpg?v=1756396358',
    category: 'Adaptors & Extensions',
  },
  {
    name: '4-Way Extension Socket with Neon & Safety Shutters',
    description: '4-way socket with neon lights and safety shutters for added protection.',
    price: 1350,
    image: 'https://www.tronic.co.ke/cdn/shop/files/EC7674-BS_1_75x75_crop_center.jpg?v=1754857686',
    category: 'Adaptors & Extensions',
  },
  {
    name: '4-Way Extension Socket - 13A, 3M Cable',
    description: 'Four-way extension socket with a 3-meter cable for flexible placement.',
    price: 1850,
    image: 'https://www.tronic.co.ke/cdn/shop/files/EC7204_75x75_crop_center.jpg?v=1756396151',
    category: 'Adaptors & Extensions',
  },
  {
    name: '4-Way Extension Socket with Individual Switches - 3M Cable',
    description: 'Four-way extension with individual switches and a 3-meter cable.',
    price: 2220,
    image: 'https://www.tronic.co.ke/cdn/shop/files/EC7304_75x75_crop_center.jpg?v=1756396159',
    category: 'Adaptors & Extensions',
  },
  {
    name: '4-Way Extension Socket with USB & Type-C Ports - 13A, 3-Meter Cable',
    description: 'Modern extension socket with USB and Type-C ports for charging devices.',
    price: 2840,
    image: 'https://www.tronic.co.ke/cdn/shop/files/EC7304-UB_75x75_crop_center.jpg?v=1756396160',
    category: 'Adaptors & Extensions',
  },
  {
    name: '5-Way Extension Socket with Power Button - 13A, 3-Meter Cable',
    description: 'Five-way extension socket with a master power button and 3-meter cable.',
    price: 1975,
    image: 'https://www.tronic.co.ke/cdn/shop/files/EC7205_75x75_crop_center.jpg?v=1756396161',
    category: 'Adaptors & Extensions',
  },
  {
    name: '6 Way Extension Socket',
    description: 'Six-way extension socket for higher-capacity power distribution.',
    price: 2100,
    image: 'https://www.tronic.co.ke/cdn/shop/files/TRK7866_75x75_crop_center.jpg?v=1756398974',
    category: 'Adaptors & Extensions',
  },
  {
    name: 'DP Switch With Neon 45A BK',
    description: 'Heavy-duty 45A double pole switch with neon indicator and black finish.',
    price: 750,
    image: 'https://www.tronic.co.ke/cdn/shop/files/TD-5145-BK_75x75_crop_center.jpg?v=1754857522',
    category: 'Protection Devices',
  },
  {
    name: 'Digital Timer Switch 25Amps',
    description: '25A digital timer switch for automated control of electrical loads.',
    price: 1400,
    image: 'https://www.tronic.co.ke/cdn/shop/products/EM-DT25_75x75_crop_center.jpg?v=1756398879',
    category: 'Protection Devices',
  },
  {
    name: 'Miniature Circuit Breaker 1 Pole 10A',
    description: 'Single-pole 10A miniature circuit breaker for dependable protection.',
    price: 175,
    image: 'https://www.tronic.co.ke/cdn/shop/files/MC-1010-6K_75x75_crop_center.jpg?v=1756397276',
    category: 'Protection Devices',
  },
  {
    name: 'Miniature Circuit Breaker 1 Pole 25A',
    description: 'Single-pole 25A miniature circuit breaker for circuit protection.',
    price: 175,
    image: 'https://www.tronic.co.ke/cdn/shop/files/MC-1025-6K_75x75_crop_center.jpg?v=1756397465',
    category: 'Protection Devices',
  },
  {
    name: 'Miniature Circuit Breaker 1 Pole 40A',
    description: 'Single-pole 40A miniature circuit breaker for heavier electrical loads.',
    price: 210,
    image: 'https://www.tronic.co.ke/cdn/shop/files/MC-1040-6K_75x75_crop_center.jpg?v=1756397379',
    category: 'Protection Devices',
  },
  {
    name: 'Power Guard Voltage Protector 13A White',
    description: '13A voltage protector designed to help safeguard home appliances.',
    price: 1050,
    image: 'https://www.tronic.co.ke/cdn/shop/files/VP-HG13-BS_75x75_crop_center.jpg?v=1756396778',
    category: 'Protection Devices',
  },
  {
    name: 'Refrigerator Guard',
    description: 'Voltage protection for refrigerators and other sensitive appliances.',
    price: 1050,
    image: 'https://www.tronic.co.ke/cdn/shop/files/VP-HG13-BS_75x75_crop_center.jpg?v=1756396778',
    category: 'Protection Devices',
  },
  {
    name: 'Insulation Tape 20 Yard - Black',
    description: 'Durable black insulation tape for cable finishing and repairs.',
    price: 150,
    image: 'https://www.tronic.co.ke/cdn/shop/products/IT02BK_2476795c-6585-4d6b-8d43-f40c06ee8549_75x75_crop_center.jpg?v=1756396877',
    category: 'Accessories',
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
