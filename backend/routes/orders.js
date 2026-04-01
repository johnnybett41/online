const express = require('express');
const { db } = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

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
  const { total } = req.body;

  db.run(`INSERT INTO orders (user_id, total, status) VALUES (?, ?, 'pending_payment')`,
    [req.user.id, total], function(err) {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }
    const orderId = this.lastID;

    // Move cart items to order_items
    db.all(`SELECT * FROM cart WHERE user_id = ?`, [req.user.id], (err, cartItems) => {
      if (err) return res.status(500).json({ message: 'Database error' });

      cartItems.forEach(item => {
        db.run(`INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)`,
          [orderId, item.product_id, item.quantity, item.price]);
      });

      // Clear cart
      db.run(`DELETE FROM cart WHERE user_id = ?`, [req.user.id]);

      res.status(201).json({ orderId });
    });
  });
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