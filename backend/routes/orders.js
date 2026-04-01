const express = require('express');
const { db } = require('../db');
const { authenticateToken } = require('../middleware/auth');
const { all } = require('../utils/stock');

const router = express.Router();

function run(dbInstance, sql, params = []) {
  return new Promise((resolve, reject) => {
    dbInstance.run(sql, params, function onRun(err) {
      if (err) {
        reject(err);
        return;
      }

      resolve(this);
    });
  });
}

// Get user orders
router.get('/', authenticateToken, (req, res) => {
  db.all(`SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC`, [req.user.id], (err, rows) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }
    res.json(rows);
  });
});

// Create order
router.post('/', authenticateToken, (req, res) => {

  (async () => {
    try {
      await run(db, 'BEGIN IMMEDIATE TRANSACTION');

      const cartItems = await all(
        db,
        `SELECT cart.product_id, cart.quantity, products.price, products.stock_quantity, products.name
         FROM cart
         JOIN products ON cart.product_id = products.id
         WHERE cart.user_id = ?`,
        [req.user.id]
      );

      if (!cartItems.length) {
        await run(db, 'ROLLBACK');
        return res.status(400).json({ message: 'Your cart is empty' });
      }

      const insufficientItem = cartItems.find((item) => Number(item.stock_quantity || 0) < Number(item.quantity || 0));
      if (insufficientItem) {
        await run(db, 'ROLLBACK');
        return res.status(400).json({
          message: `Only ${insufficientItem.stock_quantity || 0} left for ${insufficientItem.name}`,
        });
      }

      const orderTotal = cartItems.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0);

      const orderResult = await run(
        db,
        `INSERT INTO orders (user_id, total, status, stock_deducted_at)
         VALUES (?, ?, 'pending_payment', CURRENT_TIMESTAMP)`,
        [req.user.id, orderTotal]
      );
      const orderId = orderResult.lastID;

      for (const item of cartItems) {
        await run(
          db,
          `INSERT INTO order_items (order_id, product_id, quantity, price)
           VALUES (?, ?, ?, ?)`,
          [orderId, item.product_id, item.quantity, item.price]
        );
      }

      for (const item of cartItems) {
        await run(
          db,
          `UPDATE products
           SET stock_quantity = stock_quantity - ?
           WHERE id = ?`,
          [item.quantity, item.product_id]
        );
      }

      await run(db, `DELETE FROM cart WHERE user_id = ?`, [req.user.id]);
      await run(db, 'COMMIT');

      return res.status(201).json({ orderId });
    } catch (orderError) {
      await run(db, 'ROLLBACK').catch(() => {});
      return res.status(orderError.statusCode || 500).json({
        message: orderError.message || 'Failed to create order',
      });
    }
  })();
});

// Get order details
router.get('/:id', authenticateToken, (req, res) => {
  db.get(`SELECT * FROM orders WHERE id = ? AND user_id = ?`, [req.params.id, req.user.id], (err, order) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    db.all(`SELECT order_items.*, products.name FROM order_items 
            JOIN products ON order_items.product_id = products.id 
            WHERE order_id = ?`, [req.params.id], (err, items) => {
      if (err) {
        return res.status(500).json({ message: 'Database error' });
      }
      res.json({ ...order, items });
    });
  });
});

module.exports = router;
