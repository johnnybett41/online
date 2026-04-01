const express = require('express');
const { db } = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get cart items for user
router.get('/', authenticateToken, (req, res) => {
  db.all(`SELECT cart.*, products.name, products.price, products.image 
          FROM cart 
          JOIN products ON cart.product_id = products.id 
          WHERE cart.user_id = ?`, [req.user.id], (err, rows) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }
    res.json(rows);
  });
});

// Add to cart
router.post('/', authenticateToken, (req, res) => {
  const { product_id, quantity } = req.body;
  db.run(`INSERT OR REPLACE INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)`,
    [req.user.id, product_id, quantity], function(err) {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }
    res.status(201).json({ message: 'Added to cart' });
  });
});

// Update cart item
router.put('/:id', authenticateToken, (req, res) => {
  const { quantity } = req.body;
  db.run(`UPDATE cart SET quantity = ? WHERE id = ? AND user_id = ?`,
    [quantity, req.params.id, req.user.id], function(err) {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }
    res.json({ message: 'Cart updated' });
  });
});

// Remove from cart
router.delete('/:id', authenticateToken, (req, res) => {
  db.run(`DELETE FROM cart WHERE id = ? AND user_id = ?`,
    [req.params.id, req.user.id], function(err) {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }
    res.json({ message: 'Removed from cart' });
  });
});

module.exports = router;