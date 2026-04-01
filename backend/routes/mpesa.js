const express = require('express');
const { initiateSTKPush, querySTKPush } = require('../mpesa');
const { db } = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Initiate payment
router.post('/pay', authenticateToken, async (req, res) => {
  const { phoneNumber, amount, orderId } = req.body;

  try {
    const result = await initiateSTKPush(phoneNumber, amount, `Order-${orderId}`, 'Payment for electrical devices');
    res.json({ success: true, checkoutRequestId: result.CheckoutRequestID, responseCode: result.ResponseCode });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Payment initiation failed' });
  }
});

// M-Pesa callback
router.post('/callback', (req, res) => {
  const callbackData = req.body;
  console.log('M-Pesa Callback:', JSON.stringify(callbackData, null, 2));

  if (callbackData.Body && callbackData.Body.stkCallback) {
    const stkCallback = callbackData.Body.stkCallback;
    const resultCode = stkCallback.ResultCode;
    const checkoutRequestId = stkCallback.CheckoutRequestID;

    if (resultCode === 0) {
      // Payment successful
      const callbackMetadata = stkCallback.CallbackMetadata.Item;
      const amount = callbackMetadata.find(item => item.Name === 'Amount').Value;
      const mpesaReceiptNumber = callbackMetadata.find(item => item.Name === 'MpesaReceiptNumber').Value;
      const transactionDate = callbackMetadata.find(item => item.Name === 'TransactionDate').Value;
      const phoneNumber = callbackMetadata.find(item => item.Name === 'PhoneNumber').Value;

      // Extract order ID from account reference (assuming format "Order-{orderId}")
      const accountReference = stkCallback.AccountReference || '';
      const orderId = accountReference.replace('Order-', '');

      // Update order status to paid
      db.run(`UPDATE orders SET status = 'paid' WHERE id = ?`, [orderId], function(err) {
        if (err) {
          console.error('Error updating order status:', err);
        } else {
          console.log(`Order ${orderId} marked as paid`);
        }
      });

      // You might want to store payment details in a payments table
    } else {
      // Payment failed
      console.log(`Payment failed for checkout request ${checkoutRequestId}: ${stkCallback.ResultDesc}`);
    }
  }

  res.json({ success: true });
});

// Query payment status
router.get('/status/:checkoutRequestId', async (req, res) => {
  try {
    const result = await querySTKPush(req.params.checkoutRequestId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to query payment status' });
  }
});

module.exports = router;