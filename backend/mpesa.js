const axios = require('axios');

// M-Pesa credentials - In production, use environment variables
const CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY || 'your-consumer-key';
const CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET || 'your-consumer-secret';
const SHORTCODE = process.env.MPESA_SHORTCODE || '174379'; // Test shortcode
const PASSKEY = process.env.MPESA_PASSKEY || 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919'; // Test passkey
const BASE_URL = process.env.MPESA_BASE_URL || 'https://sandbox.safaricom.co.ke'; // Use https://api.safaricom.co.ke for production
const PUBLIC_URL = process.env.RENDER_EXTERNAL_URL || process.env.BASE_URL || 'http://localhost:5000';

// Cache access token to avoid unnecessary requests
let accessTokenCache = {
  token: null,
  expiresAt: null
};

// Get access token with caching
async function getAccessToken() {
  // Check if we have a valid cached token
  if (accessTokenCache.token && accessTokenCache.expiresAt > Date.now()) {
    return accessTokenCache.token;
  }

  const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');
  try {
    const response = await axios.get(`${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
      headers: {
        Authorization: `Basic ${auth}`
      },
      timeout: 30000 // 30 second timeout
    });

    // Cache the token (expires in ~1 hour, but we'll refresh after 50 minutes)
    accessTokenCache.token = response.data.access_token;
    accessTokenCache.expiresAt = Date.now() + (50 * 60 * 1000); // 50 minutes

    return response.data.access_token;
  } catch (error) {
    console.error('Error getting access token:', error.response?.data || error.message);
    throw new Error(`Failed to get M-Pesa access token: ${error.message}`);
  }
}

// Validate phone number format
function validatePhoneNumber(phoneNumber) {
  // Remove any spaces, hyphens, or brackets
  const cleanNumber = phoneNumber.replace(/[\s\-\(\)]/g, '');

  // Check if it's already in international format
  if (cleanNumber.startsWith('+254')) {
    return cleanNumber;
  }

  // Check if it starts with 0 (local format)
  if (cleanNumber.startsWith('0')) {
    return `+254${cleanNumber.substring(1)}`;
  }

  // Check if it starts with 254 (without +)
  if (cleanNumber.startsWith('254')) {
    return `+${cleanNumber}`;
  }

  // If it's just the last 9 digits
  if (cleanNumber.length === 9 && /^[0-9]+$/.test(cleanNumber)) {
    return `+254${cleanNumber}`;
  }

  throw new Error('Invalid phone number format. Use format: +254XXXXXXXXX or 07XXXXXXXX');
}

// Validate amount
function validateAmount(amount) {
  const numAmount = parseFloat(amount);
  if (isNaN(numAmount) || numAmount < 1 || numAmount > 150000) {
    throw new Error('Amount must be between KES 1 and KES 150,000');
  }
  return Math.round(numAmount); // M-Pesa expects whole numbers
}

// Initiate STK Push with improved error handling
async function initiateSTKPush(phoneNumber, amount, accountReference, transactionDesc) {
  try {
    // Validate inputs
    const validatedPhone = validatePhoneNumber(phoneNumber);
    const validatedAmount = validateAmount(amount);

    if (!accountReference || accountReference.length > 20) {
      throw new Error('Account reference is required and must be 20 characters or less');
    }

    const accessToken = await getAccessToken();
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
    const password = Buffer.from(`${SHORTCODE}${PASSKEY}${timestamp}`).toString('base64');

    const payload = {
      BusinessShortCode: SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: validatedAmount,
      PartyA: validatedPhone,
      PartyB: SHORTCODE,
      PhoneNumber: validatedPhone,
      CallBackURL: new URL('/mpesa/callback', PUBLIC_URL).toString(),
      AccountReference: accountReference,
      TransactionDesc: transactionDesc || 'Payment for goods/services'
    };

    console.log('Initiating M-Pesa STK Push:', {
      phoneNumber: validatedPhone,
      amount: validatedAmount,
      accountReference
    });

    const response = await axios.post(`${BASE_URL}/mpesa/stkpush/v1/processrequest`, payload, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 second timeout
    });

    console.log('M-Pesa STK Push Response:', response.data);
    return response.data;

  } catch (error) {
    console.error('Error initiating STK push:', error.response?.data || error.message);

    if (error.response?.data) {
      const errorData = error.response.data;
      if (errorData.errorCode) {
        throw new Error(`M-Pesa Error: ${errorData.errorMessage || 'Unknown error'}`);
      }
    }

    throw new Error(`Failed to initiate M-Pesa payment: ${error.message}`);
  }
}

// Query STK Push status with improved error handling
async function querySTKPush(checkoutRequestId) {
  try {
    if (!checkoutRequestId) {
      throw new Error('Checkout Request ID is required');
    }

    const accessToken = await getAccessToken();
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
    const password = Buffer.from(`${SHORTCODE}${PASSKEY}${timestamp}`).toString('base64');

    const payload = {
      BusinessShortCode: SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      CheckoutRequestID: checkoutRequestId
    };

    console.log('Querying M-Pesa STK Push status for:', checkoutRequestId);

    const response = await axios.post(`${BASE_URL}/mpesa/stkpushquery/v1/query`, payload, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 second timeout
    });

    console.log('M-Pesa Query Response:', response.data);
    return response.data;

  } catch (error) {
    console.error('Error querying STK push:', error.response?.data || error.message);

    if (error.response?.data) {
      const errorData = error.response.data;
      if (errorData.errorCode) {
        throw new Error(`M-Pesa Query Error: ${errorData.errorMessage || 'Unknown error'}`);
      }
    }

    throw new Error(`Failed to query payment status: ${error.message}`);
  }
}

// Check if M-Pesa credentials are configured
function isConfigured() {
  return CONSUMER_KEY !== 'your-consumer-key' &&
         CONSUMER_SECRET !== 'your-consumer-secret' &&
         SHORTCODE !== '174379';
}

module.exports = {
  initiateSTKPush,
  querySTKPush,
  validatePhoneNumber,
  validateAmount,
  isConfigured
};
