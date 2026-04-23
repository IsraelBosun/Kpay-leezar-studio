import { resolveBankAccount } from '@/lib/paystack';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const account_number = searchParams.get('account_number');
  const bank_code = searchParams.get('bank_code');

  if (!account_number || !bank_code) {
    return Response.json({ error: 'account_number and bank_code are required' }, { status: 400 });
  }

  try {
    const result = await resolveBankAccount(account_number, bank_code);
    return Response.json({ account_name: result.account_name });
  } catch (err) {
    return Response.json({ error: err.message || 'Could not verify account' }, { status: 400 });
  }
}
