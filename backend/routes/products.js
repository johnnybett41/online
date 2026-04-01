const express = require('express');
const { db } = require('../db');

const router = express.Router();

// Get all products
router.get('/', (req, res) => {
  db.all(`SELECT * FROM products WHERE is_active = 1 ORDER BY id`, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }
    res.json(rows);
  });
});

// Get product by id
router.get('/:id', (req, res) => {
  db.get(`SELECT * FROM products WHERE id = ?`, [req.params.id], (err, row) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }
    if (!row) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(row);
  });
});

// Add product (admin only, but for simplicity)
router.post('/', (req, res) => {
  const { name, description, price, image, category, stock_quantity } = req.body;
  const parsedStockQuantity = Number.parseInt(stock_quantity, 10);
  const safeStockQuantity = Number.isFinite(parsedStockQuantity) && parsedStockQuantity >= 0
    ? parsedStockQuantity
    : 0;

  db.run(`INSERT INTO products (name, description, price, image, category, stock_quantity, is_active) VALUES (?, ?, ?, ?, ?, ?, 1)`,
    [name, description, price, image, category, safeStockQuantity], function(err) {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }
    res.status(201).json({ id: this.lastID });
  });
});

module.exports = router;
