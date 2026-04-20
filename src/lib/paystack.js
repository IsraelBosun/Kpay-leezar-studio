const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
const BASE_URL = 'https://api.paystack.co';

const headers = {
  Authorization: `Bearer ${PAYSTACK_SECRET}`,
  'Content-Type': 'application/json',
};

// Initialize a payment — returns a checkout URL to redirect the client to
export async function initializePayment({ email, amountNaira, reference, metadata, callbackUrl }) {
  const res = await fetch(`${BASE_URL}/transaction/initialize`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      email,
      amount: amountNaira * 100, // Paystack uses kobo
      reference,
      metadata,
      callback_url: callbackUrl,
    }),
  });
  const data = await res.json();
  if (!data.status) throw new Error(data.message);
  return data.data; // { authorization_url, access_code, reference }
}

// Verify a payment after callback
export async function verifyPayment(reference) {
  const res = await fetch(`${BASE_URL}/transaction/verify/${reference}`, { headers });
  const data = await res.json();
  if (!data.status) throw new Error(data.message);
  return data.data; // { status: 'success' | 'failed', amount, customer, ... }
}

// Verify a Paystack webhook signature
export function verifyWebhookSignature(payload, signature) {
  const crypto = require('crypto');
  const hash = crypto
    .createHmac('sha512', PAYSTACK_SECRET)
    .update(payload)
    .digest('hex');
  return hash === signature;
}
