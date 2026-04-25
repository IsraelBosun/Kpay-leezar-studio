const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
const BASE = 'https://api.paystack.co';

const headers = {
  Authorization: `Bearer ${PAYSTACK_SECRET}`,
  'Content-Type': 'application/json',
};

export async function initializePayment({ email, amountNaira, reference, metadata, callbackUrl, subaccountCode }) {
  const body = {
    email,
    amount: Math.round(amountNaira * 100),
    reference,
    metadata,
    callback_url: callbackUrl,
  };

  if (subaccountCode) {
    body.subaccount = subaccountCode;
    body.bearer = 'account'; // platform account bears Paystack fees (subaccount keeps 100%)
  }

  const res = await fetch(`${BASE}/transaction/initialize`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!data.status) throw new Error(data.message);
  return data.data; // { authorization_url, access_code, reference }
}

export async function verifyPayment(reference) {
  const res = await fetch(`${BASE}/transaction/verify/${reference}`, { headers });
  const data = await res.json();
  if (!data.status) throw new Error(data.message);
  return data.data;
}

export async function resolveBankAccount(accountNumber, bankCode) {
  const res = await fetch(
    `${BASE}/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`,
    { headers, cache: 'no-store' }
  );
  const data = await res.json();
  if (!data.status) throw new Error(data.message || 'Could not verify account');
  return data.data; // { account_name, account_number }
}

export async function createSubaccount({ businessName, bankCode, accountNumber }) {
  const res = await fetch(`${BASE}/subaccount`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      business_name: businessName,
      settlement_bank: bankCode,
      account_number: accountNumber,
      percentage_charge: 0,
    }),
  });
  const data = await res.json();
  if (!data.status) throw new Error(data.message || 'Failed to create subaccount');
  return data.data; // { subaccount_code, ... }
}

export async function updateSubaccount(subaccountCode, { bankCode, accountNumber }) {
  const res = await fetch(`${BASE}/subaccount/${subaccountCode}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({
      settlement_bank: bankCode,
      account_number: accountNumber,
      percentage_charge: 0,
    }),
  });
  const data = await res.json();
  if (!data.status) throw new Error(data.message || 'Failed to update subaccount');
  return data.data;
}

export function verifyWebhookSignature(payload, signature) {
  const crypto = require('crypto');
  const hash = crypto
    .createHmac('sha512', PAYSTACK_SECRET)
    .update(payload)
    .digest('hex');
  return hash === signature;
}
