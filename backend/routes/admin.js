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

router.get('/orders', (req, res) => {
  db.all(
    `SELECT orders.id, orders.total, orders.status, orders.delivery_method, orders.delivery_address,
            orders.payment_method, orders.created_at, orders.estimated_delivery_date,
            users.username, users.email
     FROM orders
     JOIN users ON users.id = orders.user_id
     ORDER BY orders.created_at DESC
     LIMIT 25`,
    [],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ message: 'Database error' });
      }

      return res.json(rows);
    }
  );
});

router.get('/orders/:id', (req, res) => {
  const orderId = Number.parseInt(req.params.id, 10);

  if (!Number.isFinite(orderId)) {
    return res.status(400).json({ message: 'Invalid order id' });
  }

  db.get(
    `SELECT orders.id, orders.user_id, orders.total, orders.status, orders.delivery_method, orders.delivery_address,
            orders.delivery_cost, orders.estimated_delivery_date, orders.payment_method, orders.phone_number,
            orders.mpesa_paid_at, orders.mpesa_receipt_number, orders.created_at,
            users.username, users.email
     FROM orders
     JOIN users ON users.id = orders.user_id
     WHERE orders.id = $1`,
    [orderId],
    (err, order) => {
      if (err) {
        return res.status(500).json({ message: 'Database error' });
      }

      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      db.all(
        `SELECT order_items.quantity, order_items.price, products.id AS product_id, products.name, products.image, products.category
         FROM order_items
         JOIN products ON products.id = order_items.product_id
         WHERE order_items.order_id = $1
         ORDER BY products.name ASC`,
        [orderId],
        (itemsErr, items) => {
          if (itemsErr) {
            return res.status(500).json({ message: 'Database error' });
          }

          return res.json({ ...order, items });
        }
      );
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
    const product = await get(`SELECT id FROM products WHERE id = $1`, [productId]);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await run(
      `UPDATE products
       SET stock_quantity = $1
       WHERE id = $2`,
      [stockQuantity, productId]
    );

    return res.json({ message: 'Stock updated', stock_quantity: stockQuantity });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update stock' });
  }
});

router.patch('/orders/:id/status', async (req, res) => {
  const orderId = Number.parseInt(req.params.id, 10);
  const status = String(req.body?.status || '').trim();

  const allowedStatuses = new Set([
    'pending_payment',
    'payment_initiated',
    'pending_confirmation',
    'paid',
    'processing',
    'shipped',
    'delivered',
    'failed',
  ]);

  if (!Number.isFinite(orderId)) {
    return res.status(400).json({ message: 'Invalid order id' });
  }

  if (!allowedStatuses.has(status)) {
    return res.status(400).json({ message: 'Invalid order status' });
  }

  try {
    const order = await get(`SELECT id FROM orders WHERE id = $1`, [orderId]);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    await run(
      `UPDATE orders
       SET status = $1
       WHERE id = $2`,
      [status, orderId]
    );

    const updated = await get(
      `SELECT id, user_id, total, status, delivery_address, delivery_method, delivery_cost,
              estimated_delivery_date, payment_method, phone_number, mpesa_paid_at, mpesa_receipt_number,
              created_at
       FROM orders
       WHERE id = $1`,
      [orderId]
    );

    return res.json({
      message: 'Order status updated',
      order: updated,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update order status' });
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
    const product = await get(`SELECT id FROM products WHERE id = $1`, [productId]);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await run(
      `UPDATE products
       SET stock_quantity = stock_quantity + $1
       WHERE id = $2`,
      [quantity, productId]
    );

    const updated = await get(`SELECT stock_quantity FROM products WHERE id = $1`, [productId]);
    return res.json({
      message: 'Stock increased',
      stock_quantity: updated?.stock_quantity ?? quantity,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to restock product' });
  }
});

module.exports = router;
