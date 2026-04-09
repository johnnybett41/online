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
  db.all(`SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC`, [req.user.id], (err, rows) => {
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
      await run(db, 'BEGIN');

      const cartItems = await all(
        db,
        `SELECT cart.product_id, cart.quantity, products.price, products.stock_quantity, products.name
         FROM cart
         JOIN products ON cart.product_id = products.id
         WHERE cart.user_id = $1`,
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
         VALUES ($1, $2, 'pending_payment', CURRENT_TIMESTAMP) RETURNING id`,
        [req.user.id, orderTotal]
      );
      const orderId = orderResult.lastID || orderResult.rows?.[0]?.id;

      for (const item of cartItems) {
        await run(
          db,
          `INSERT INTO order_items (order_id, product_id, quantity, price)
           VALUES ($1, $2, $3, $4)`,
          [orderId, item.product_id, item.quantity, item.price]
        );
      }

      for (const item of cartItems) {
        await run(
          db,
          `UPDATE products
           SET stock_quantity = stock_quantity - $1
           WHERE id = $2`,
          [item.quantity, item.product_id]
        );
      }

      await run(db, `DELETE FROM cart WHERE user_id = $1`, [req.user.id]);
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
  db.get(`SELECT * FROM orders WHERE id = $1 AND user_id = $2`, [req.params.id, req.user.id], (err, order) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    db.all(`SELECT order_items.*, products.name FROM order_items 
            JOIN products ON order_items.product_id = products.id 
            WHERE order_id = $1`, [req.params.id], (err, items) => {
      if (err) {
        return res.status(500).json({ message: 'Database error' });
      }
      res.json({ ...order, items });
    });
  });
});

// Create order with delivery information
router.post('/delivery/checkout', authenticateToken, (req, res) => {
  const {
    delivery_address,
    delivery_method,
    payment_method,
    phone_number,
    delivery_county,
    delivery_town,
    delivery_postal_code,
  } = req.body;

  if (!delivery_address || !delivery_method || !payment_method || !phone_number) {
    return res.status(400).json({ message: 'Missing required delivery information' });
  }

  const deliveryOptions = {
    standard: 200,
    express: 500,
    pickup: 0,
  };

  const delivery_cost = deliveryOptions[delivery_method] || 0;

  if (!delivery_cost && delivery_method !== 'pickup') {
    return res.status(400).json({ message: 'Invalid delivery method' });
  }

  (async () => {
    try {
      await run(db, 'BEGIN');

      // Get cart items
      const cartItems = await all(
        db,
        `SELECT cart.product_id, cart.quantity, products.price, products.stock_quantity, products.name
         FROM cart
         JOIN products ON cart.product_id = products.id
         WHERE cart.user_id = $1`,
        [req.user.id]
      );

      if (!cartItems.length) {
        await run(db, 'ROLLBACK');
        return res.status(400).json({ message: 'Your cart is empty' });
      }

      // Check stock
      const insufficientItem = cartItems.find((item) => Number(item.stock_quantity || 0) < Number(item.quantity || 0));
      if (insufficientItem) {
        await run(db, 'ROLLBACK');
        return res.status(400).json({
          message: `Only ${insufficientItem.stock_quantity || 0} left for ${insufficientItem.name}`,
        });
      }

      // Calculate totals
      const subtotal = cartItems.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0);
      const total = subtotal + delivery_cost;

      // Calculate estimated delivery date
      const deliveryDays = delivery_method === 'express' ? 2 : delivery_method === 'pickup' ? 0 : 5;
      const estimated_delivery_date = new Date();
      estimated_delivery_date.setDate(estimated_delivery_date.getDate() + deliveryDays);

      // Create order with delivery info
      const orderResult = await run(
        db,
        `INSERT INTO orders (
          user_id,
          total,
          status,
          delivery_address,
          delivery_method,
          delivery_cost,
          estimated_delivery_date,
          payment_method,
          phone_number,
          delivery_county,
          delivery_town,
          delivery_postal_code,
          stock_deducted_at
        )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, CURRENT_TIMESTAMP) RETURNING id`,
        [
          req.user.id,
          total,
          payment_method === 'mpesa' ? 'pending_payment' : 'pending_confirmation',
          delivery_address,
          delivery_method,
          delivery_cost,
          estimated_delivery_date.toISOString(),
          payment_method,
          phone_number,
          delivery_county || null,
          delivery_town || null,
          delivery_postal_code || null,
        ]
      );

      const orderId = orderResult.lastID || orderResult.rows?.[0]?.id;

      // Add order items
      for (const item of cartItems) {
        await run(
          db,
          `INSERT INTO order_items (order_id, product_id, quantity, price)
           VALUES ($1, $2, $3, $4)`,
          [orderId, item.product_id, item.quantity, item.price]
        );
      }

      // Update stock
      for (const item of cartItems) {
        await run(
          db,
          `UPDATE products
           SET stock_quantity = stock_quantity - $1
           WHERE id = $2`,
          [item.quantity, item.product_id]
        );
      }

      // Clear cart
      await run(db, `DELETE FROM cart WHERE user_id = $1`, [req.user.id]);
      await run(db, 'COMMIT');

      return res.status(201).json({
        orderId,
        total,
        delivery_cost,
        payment_method,
        estimated_delivery_date,
        delivery_county: delivery_county || null,
        delivery_town: delivery_town || null,
        delivery_postal_code: delivery_postal_code || null,
        status: payment_method === 'mpesa' ? 'pending_payment' : 'pending_confirmation',
      });
    } catch (orderError) {
      await run(db, 'ROLLBACK').catch(() => {});
      console.error('Delivery checkout error:', orderError);
      return res.status(orderError.statusCode || 500).json({
        message: orderError.message || 'Failed to create delivery order',
      });
    }
  })();
});

module.exports = router;
