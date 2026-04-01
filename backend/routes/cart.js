const express = require('express');
const { db } = require('../db');
const { authenticateToken } = require('../middleware/auth');
const { validateProductStock } = require('../utils/stock');

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

function parseQuantity(value) {
  const quantity = Number.parseInt(value, 10);
  if (!Number.isFinite(quantity) || quantity < 1) {
    return null;
  }

  return quantity;
}

// Get cart items for user
router.get('/', authenticateToken, (req, res) => {
  db.all(
    `SELECT cart.*, products.name, products.price, products.image, products.stock_quantity
     FROM cart
     JOIN products ON cart.product_id = products.id
     WHERE cart.user_id = ?`,
    [req.user.id],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ message: 'Database error' });
      }

      res.json(rows);
    }
  );
});

// Add to cart
router.post('/', authenticateToken, async (req, res) => {
  const { product_id, quantity } = req.body;
  const parsedProductId = Number.parseInt(product_id, 10);
  const parsedQuantity = parseQuantity(quantity) || 1;

  if (!Number.isFinite(parsedProductId)) {
    return res.status(400).json({ message: 'Invalid product' });
  }

  try {
    await validateProductStock(db, parsedProductId, parsedQuantity);
    await run(
      `INSERT OR REPLACE INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)`,
      [req.user.id, parsedProductId, parsedQuantity]
    );
    return res.status(201).json({ message: 'Added to cart' });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ message: error.message || 'Failed to add to cart' });
  }
});

// Update cart item
router.put('/:id', authenticateToken, async (req, res) => {
  const { quantity } = req.body;
  const parsedQuantity = parseQuantity(quantity);

  if (!parsedQuantity) {
    return res.status(400).json({ message: 'Quantity must be at least 1' });
  }

  try {
    const cartItem = await get(
      `SELECT cart.product_id
       FROM cart
       WHERE cart.id = ? AND cart.user_id = ?`,
      [req.params.id, req.user.id]
    );

    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    await validateProductStock(db, cartItem.product_id, parsedQuantity);
    await run(
      `UPDATE cart
       SET quantity = ?
       WHERE id = ? AND user_id = ?`,
      [parsedQuantity, req.params.id, req.user.id]
    );

    return res.json({ message: 'Cart updated' });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ message: error.message || 'Cart update failed' });
  }
});

// Remove from cart
router.delete('/:id', authenticateToken, (req, res) => {
  db.run(
    `DELETE FROM cart WHERE id = ? AND user_id = ?`,
    [req.params.id, req.user.id],
    function onDelete(err) {
      if (err) {
        return res.status(500).json({ message: 'Database error' });
      }

      res.json({ message: 'Removed from cart' });
    }
  );
});

module.exports = router;
