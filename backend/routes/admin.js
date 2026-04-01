const express = require('express');
const { db } = require('../db');
const { authenticateToken } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/admin');

const router = express.Router();

function run(sql, params = []) {
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

function get(sql, params = []) {
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

router.use(authenticateToken, requireAdmin);

router.get('/stock', (req, res) => {
  db.all(
    `SELECT id, name, description, price, image, category, stock_quantity, is_active
     FROM products
     ORDER BY is_active DESC, stock_quantity ASC, name ASC`,
    [],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ message: 'Database error' });
      }

      const enhancedRows = rows.map((product) => ({
        ...product,
        stock_status: product.stock_quantity <= 0 ? 'sold_out' : product.stock_quantity <= 5 ? 'low_stock' : 'in_stock',
      }));

      return res.json(enhancedRows);
    }
  );
});

router.patch('/products/:id/stock', async (req, res) => {
  const productId = Number.parseInt(req.params.id, 10);
  const stockQuantity = Number.parseInt(req.body.stock_quantity, 10);

  if (!Number.isFinite(productId)) {
    return res.status(400).json({ message: 'Invalid product id' });
  }

  if (!Number.isFinite(stockQuantity) || stockQuantity < 0) {
    return res.status(400).json({ message: 'Stock quantity must be zero or more' });
  }

  try {
    const product = await get(`SELECT id FROM products WHERE id = ?`, [productId]);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await run(
      `UPDATE products
       SET stock_quantity = ?
       WHERE id = ?`,
      [stockQuantity, productId]
    );

    return res.json({ message: 'Stock updated', stock_quantity: stockQuantity });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update stock' });
  }
});

router.post('/products/:id/restock', async (req, res) => {
  const productId = Number.parseInt(req.params.id, 10);
  const quantity = Number.parseInt(req.body.quantity, 10);

  if (!Number.isFinite(productId)) {
    return res.status(400).json({ message: 'Invalid product id' });
  }

  if (!Number.isFinite(quantity) || quantity <= 0) {
    return res.status(400).json({ message: 'Restock quantity must be greater than zero' });
  }

  try {
    const product = await get(`SELECT id FROM products WHERE id = ?`, [productId]);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await run(
      `UPDATE products
       SET stock_quantity = stock_quantity + ?
       WHERE id = ?`,
      [quantity, productId]
    );

    const updated = await get(`SELECT stock_quantity FROM products WHERE id = ?`, [productId]);
    return res.json({
      message: 'Stock increased',
      stock_quantity: updated?.stock_quantity ?? quantity,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to restock product' });
  }
});

module.exports = router;
