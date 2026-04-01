const sqlite3 = require('sqlite3').verbose();

const DB_PATH = process.env.DATABASE_PATH || './database.db';

const db = new sqlite3.Database(DB_PATH);

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    email TEXT UNIQUE,
    password TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    description TEXT,
    price REAL,
    image TEXT,
    category TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS cart (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    product_id INTEGER,
    quantity INTEGER,
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (product_id) REFERENCES products (id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    total REAL,
    status TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER,
    product_id INTEGER,
    quantity INTEGER,
    price REAL,
    FOREIGN KEY (order_id) REFERENCES orders (id),
    FOREIGN KEY (product_id) REFERENCES products (id)
  )`);

  db.get('SELECT COUNT(*) AS count FROM products', [], (countErr, row) => {
    if (countErr) {
      console.error('Error checking product count:', countErr.message);
      return db.close((err) => {
        if (err) {
          console.error(err.message);
        }
      });
    }

    if (row.count > 0) {
      console.log('Products already seeded.');
      return db.close((err) => {
        if (err) {
          console.error(err.message);
        }
      });
    }

    const products = [
    { name: 'LED Bulb', description: 'Energy-efficient LED bulb', price: 250, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop', category: 'Lighting' },
    { name: 'Power Strip', description: '6-outlet power strip with surge protection', price: 800, image: 'https://images.unsplash.com/photo-1625842268584-8f3296236761?w=400&h=400&fit=crop', category: 'Power' },
    { name: 'Extension Cord', description: '10-foot extension cord', price: 500, image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=400&fit=crop', category: 'Power' },
    { name: 'Smart Plug', description: 'WiFi-enabled smart plug', price: 1200, image: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=400&h=400&fit=crop', category: 'Smart Home' },
    { name: 'Circuit Breaker', description: '20-amp circuit breaker', price: 450, image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=400&fit=crop', category: 'Electrical' },
    { name: 'Wire Stripper', description: 'Professional wire stripper tool', price: 750, image: 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=400&h=400&fit=crop', category: 'Tools' },
    { name: 'Schneider Electric MCB', description: 'Miniature Circuit Breaker - Schneider Electric brand, 10A', price: 600, image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=400&fit=crop', category: 'Power & Protection' },
    { name: 'ABB MCB', description: 'Miniature Circuit Breaker - ABB brand, 16A', price: 750, image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=400&fit=crop', category: 'Power & Protection' },
    { name: 'Hager MCB', description: 'Miniature Circuit Breaker - Hager brand, 20A', price: 850, image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13400&h=400&fit=crop', category: 'Power & Protection' },
    { name: 'Distribution Board', description: 'DB Box - 8-way distribution board for electrical circuits', price: 3500, image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=400&fit=crop', category: 'Power & Protection' },
    { name: 'Changeover Switch', description: 'Manual changeover switch for power backup systems', price: 2500, image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=400&fit=crop', category: 'Power & Protection' },
    { name: 'Residual Current Device', description: 'RCD - 30mA residual current device for safety protection', price: 1800, image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=400&fit=crop', category: 'Power & Protection' },
    { name: 'LED Bulb 9W', description: 'High-efficiency 9W LED bulb - Energy saving lighting solution', price: 200, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop', category: 'Lighting' },
    { name: 'LED Bulb 12W', description: 'Bright 12W LED bulb - Perfect for general lighting', price: 250, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop', category: 'Lighting' },
    { name: 'LED Bulb 15W', description: 'Powerful 15W LED bulb - High brightness for larger spaces', price: 300, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop', category: 'Lighting' },
    { name: 'LED Floodlight', description: 'Outdoor LED floodlight with motion sensor - 50W equivalent', price: 1500, image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop', category: 'Lighting' },
    { name: 'LED Tube 2ft', description: '2-foot LED tube light - Perfect for under-cabinet or display lighting', price: 450, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop', category: 'Lighting' },
    { name: 'LED Tube 4ft', description: '4-foot LED tube light - Ideal for office and commercial spaces', price: 800, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop', category: 'Lighting' },
    { name: 'Security Light with Sensor', description: 'Motion-activated security light - PIR sensor, 20W LED', price: 1200, image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop', category: 'Lighting' },
    { name: 'Single Socket', description: 'Standard single electrical socket - 13A rated', price: 150, image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=400&fit=crop', category: 'Wiring Accessories' },
    { name: 'Double Socket', description: 'Twin electrical socket - 13A rated, space-saving design', price: 300, image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=400&fit=crop', category: 'Wiring Accessories' },
    { name: 'Light Switch', description: 'Single pole light switch - 10A rated', price: 180, image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=400&fit=crop', category: 'Wiring Accessories' },
    { name: 'Extension Cable 5m', description: '5-meter extension cable with 3-pin plug and socket', price: 400, image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=400&fit=crop', category: 'Wiring Accessories' },
    { name: 'Extension Cable 10m', description: '10-meter heavy-duty extension cable', price: 700, image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=400&fit=crop', category: 'Wiring Accessories' },
    { name: 'Plug Top', description: '3-pin plug top - 13A fused', price: 100, image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=400&fit=crop', category: 'Wiring Accessories' },
    { name: 'Power Inverter 1000W', description: '1000W pure sine wave power inverter - 12V to 220V', price: 6500, image: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=400&h=400&fit=crop', category: 'Backup & Power' },
    { name: 'Power Inverter 2000W', description: '2000W modified sine wave power inverter - 12V to 220V', price: 9500, image: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=400&h=400&fit=crop', category: 'Backup & Power' },
    { name: 'Solar Charge Controller 30A', description: '30A MPPT solar charge controller - PWM technology', price: 3500, image: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=400&h=400&fit=crop', category: 'Backup & Power' },
    { name: 'Solar Charge Controller 50A', description: '50A MPPT solar charge controller - LCD display', price: 5500, image: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=400&h=400&fit=crop', category: 'Backup & Power' },
    { name: 'Solar Battery 100Ah', description: '100Ah deep cycle solar battery - 12V tubular', price: 18000, image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=400&fit=crop', category: 'Backup & Power' },
    { name: 'Inverter Battery 150Ah', description: '150Ah tall tubular inverter battery - 12V', price: 22000, image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=400&fit=crop', category: 'Backup & Power' },
  ];

    const stmt = db.prepare(`INSERT INTO products (name, description, price, image, category) VALUES (?, ?, ?, ?, ?)`);
    products.forEach(product => {
      stmt.run(product.name, product.description, product.price, product.image, product.category);
    });
    stmt.finalize(() => {
      console.log('Database initialized and sample products added.');
      db.close((err) => {
        if (err) {
          console.error(err.message);
        }
      });
    });
  });
});
