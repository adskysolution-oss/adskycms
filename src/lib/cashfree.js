import crypto from 'crypto';

const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID || '';
const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY || '';
const CASHFREE_ENV = process.env.CASHFREE_ENV || 'production';

const BASE_URL = CASHFREE_ENV === 'sandbox' 
  ? 'https://sandbox.cashfree.com/pg' 
  : 'https://api.cashfree.com/pg';

const API_VERSION = '2023-08-01';

/**
 * Create a Cashfree payment order
 */
export async function createCashfreeOrder(params) {
  const appId = process.env.CASHFREE_APP_ID || CASHFREE_APP_ID;
  const secretKey = process.env.CASHFREE_SECRET_KEY || CASHFREE_SECRET_KEY;
  const env = process.env.CASHFREE_ENV || CASHFREE_ENV;
  const baseUrl = env === 'sandbox' ? 'https://sandbox.cashfree.com/pg' : 'https://api.cashfree.com/pg';

  // Ensure returnUrl and notifyUrl use https:// for Cashfree compliance
  const returnUrl = (params.returnUrl || '').replace(/^http:\/\//i, 'https://');
  const notifyUrl = params.notifyUrl ? params.notifyUrl.replace(/^http:\/\//i, 'https://') : undefined;

  const body = {
    order_id: params.orderId,
    order_amount: params.orderAmount,
    order_currency: 'INR',
    customer_details: {
      customer_id: params.customerId || (params.orderId.split('_')[1] || params.orderId),
      customer_name: params.customerName || 'Customer',
      customer_phone: params.customerPhone || '9999999999',
      customer_email: params.customerEmail || `${params.customerPhone || 'customer'}@nextview.network`,
    },
    order_meta: {
      return_url: returnUrl,
      ...(notifyUrl ? { notify_url: notifyUrl } : {}),
    },
  };

  const response = await fetch(`${baseUrl}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-client-id': appId,
      'x-client-secret': secretKey,
      'x-api-version': API_VERSION,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('Cashfree Create Order Error:', errorData);
    throw new Error(errorData?.message || `Cashfree order creation failed with status ${response.status}`);
  }

  return response.json();
}

/**
 * Fetch order status from Cashfree
 */
export async function getCashfreeOrderStatus(orderId) {
  const appId = process.env.CASHFREE_APP_ID || CASHFREE_APP_ID;
  const secretKey = process.env.CASHFREE_SECRET_KEY || CASHFREE_SECRET_KEY;
  const env = process.env.CASHFREE_ENV || CASHFREE_ENV;
  const baseUrl = env === 'sandbox' ? 'https://sandbox.cashfree.com/pg' : 'https://api.cashfree.com/pg';

  const response = await fetch(`${baseUrl}/orders/${orderId}`, {
    method: 'GET',
    headers: {
      'x-client-id': appId,
      'x-client-secret': secretKey,
      'x-api-version': API_VERSION,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.message || 'Failed to fetch Cashfree order status');
  }

  return response.json();
}

/**
 * Fetch payments for a Cashfree order
 */
export async function getCashfreePayments(orderId) {
  const appId = process.env.CASHFREE_APP_ID || CASHFREE_APP_ID;
  const secretKey = process.env.CASHFREE_SECRET_KEY || CASHFREE_SECRET_KEY;
  const env = process.env.CASHFREE_ENV || CASHFREE_ENV;
  const baseUrl = env === 'sandbox' ? 'https://sandbox.cashfree.com/pg' : 'https://api.cashfree.com/pg';

  const response = await fetch(`${baseUrl}/orders/${orderId}/payments`, {
    method: 'GET',
    headers: {
      'x-client-id': appId,
      'x-client-secret': secretKey,
      'x-api-version': API_VERSION,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.message || 'Failed to fetch payments');
  }

  return response.json();
}

/**
 * Verify Cashfree webhook signature
 */
export function verifyCashfreeWebhook(rawBody, timestamp, signature) {
  const secretKey = process.env.CASHFREE_SECRET_KEY || CASHFREE_SECRET_KEY;
  if (!secretKey) return false;
  const signatureData = timestamp + rawBody;
  const expectedSignature = crypto
    .createHmac('sha256', secretKey)
    .update(signatureData)
    .digest('base64');
  return expectedSignature === signature;
}

/**
 * Check if Cashfree is configured
 */
export function isCashfreeConfigured() {
  const appId = process.env.CASHFREE_APP_ID || CASHFREE_APP_ID;
  const secretKey = process.env.CASHFREE_SECRET_KEY || CASHFREE_SECRET_KEY;
  return !!(
    appId && 
    secretKey && 
    !appId.includes('YOUR_') &&
    !secretKey.includes('YOUR_')
  );
}

/**
 * Get Cashfree SDK v3 URL
 */
export function getCashfreeJsUrl() {
  return 'https://sdk.cashfree.com/js/v3/cashfree.js';
}

export { CASHFREE_ENV };
