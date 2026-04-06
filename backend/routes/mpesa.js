const express = require('express');
const { initiateSTKPush, querySTKPush } = require('../mpesa');
const { db } = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

function updateOrderPaymentRequest(orderId, checkoutRequestId, phoneNumber) {
  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE orders
       SET mpesa_checkout_request_id = $1, mpesa_phone_number = $2, status = 'payment_initiated'
       WHERE id = $3`,
      [checkoutRequestId, phoneNumber, orderId],
      function (err) {
        if (err) {
          reject(err);
          return;
        }
        resolve(this);
      }
    );
  });
}

function markOrderPaid({ orderId, checkoutRequestId, receiptNumber, phoneNumber }) {
  return new Promise((resolve, reject) => {
    const params = [checkoutRequestId, receiptNumber, phoneNumber, orderId];
    db.run(
      `UPDATE orders
       SET status = 'paid',
           mpesa_checkout_request_id = COALESCE(mpesa_checkout_request_id, $1),
           mpesa_receipt_number = COALESCE($2, mpesa_receipt_number),
           mpesa_phone_number = COALESCE($3, mpesa_phone_number),
           mpesa_paid_at = CURRENT_TIMESTAMP
       WHERE id = $4`,
      params,
      function (err) {
        if (err) {
          reject(err);
          return;
        }
        resolve(this);
      }
    );
  });
}

function getOrderIdByCheckoutRequestId(checkoutRequestId) {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT id FROM orders WHERE mpesa_checkout_request_id = $1 LIMIT 1`,
      [checkoutRequestId],
      (err, row) => {
        if (err) {
          reject(err);
          return;
        }

        resolve(row?.id || null);
      }
    );
  });
}

// Initiate payment
router.post('/pay', authenticateToken, async (req, res) => {
  const { phoneNumber, amount, orderId } = req.body;

  try {
    const result = await initiateSTKPush(phoneNumber, amount, `Order-${orderId}`, 'Payment for electrical devices');
    await updateOrderPaymentRequest(orderId, result.CheckoutRequestID, phoneNumber);
    res.json({ success: true, checkoutRequestId: result.CheckoutRequestID, responseCode: result.ResponseCode });
  } catch (error) {
    console.error('Payment initiation failed:', error.message);
    res.status(500).json({ success: false, message: error.message || 'Payment initiation failed' });
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
    const queryOrderId = req.query.orderId ? String(req.query.orderId) : null;

    if (resultCode === 0) {
      // Payment successful
      const callbackMetadata = stkCallback.CallbackMetadata.Item;
      const amount = callbackMetadata.find(item => item.Name === 'Amount').Value;
      const mpesaReceiptNumber = callbackMetadata.find(item => item.Name === 'MpesaReceiptNumber').Value;
      const transactionDate = callbackMetadata.find(item => item.Name === 'TransactionDate').Value;
      const phoneNumber = callbackMetadata.find(item => item.Name === 'PhoneNumber').Value;
      const fallbackOrderId = queryOrderId || null;

      const finalizePayment = async () => {
        const resolvedOrderId = fallbackOrderId || await getOrderIdByCheckoutRequestId(checkoutRequestId);

        if (!resolvedOrderId) {
          console.warn('Unable to resolve order for checkout request:', checkoutRequestId);
          return;
        }

        await markOrderPaid({
          orderId: resolvedOrderId,
          checkoutRequestId,
          receiptNumber: mpesaReceiptNumber,
          phoneNumber
        });

        console.log(`Order ${resolvedOrderId} marked as paid`);
      };

      finalizePayment().catch((err) => {
        console.error('Error updating order status:', err);
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

    if (result.ResponseCode === '0' && result.ResultCode === '0') {
      const orderId = await getOrderIdByCheckoutRequestId(req.params.checkoutRequestId);
      if (orderId) {
        await markOrderPaid({
          orderId,
          checkoutRequestId: req.params.checkoutRequestId,
          receiptNumber: null,
          phoneNumber: null
        });
      }
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to query payment status' });
  }
});

module.exports = router;
