import { createServerSupabase } from '@/lib/supabase';

export async function POST(req) {
  try {
    const { billing } = await req.json(); // 'monthly' or 'yearly'

    if (!['monthly', 'yearly'].includes(billing)) {
      return Response.json({ error: 'Invalid billing period' }, { status: 400 });
    }

    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return Response.json({ error: 'Not authenticated' }, { status: 401 });

    const { data: studio } = await supabase
      .from('studios')
      .select('id, name, email')
      .eq('owner_id', user.id)
      .single();
    if (!studio) return Response.json({ error: 'Studio not found' }, { status: 404 });

    const planCode = billing === 'monthly'
      ? process.env.PAYSTACK_PLAN_MONTHLY
      : process.env.PAYSTACK_PLAN_YEARLY;

    // Initialize a Paystack transaction with a plan — Paystack creates the subscription automatically on payment
    const res = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: user.email,
        amount: billing === 'monthly' ? 1000000 : 10000000, // kobo
        plan: planCode,
        metadata: {
          studio_id: studio.id,
          studio_name: studio.name,
          billing,
        },
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/studio/dashboard?upgraded=1`,
      }),
    });

    const data = await res.json();
    if (!data.status) throw new Error(data.message);

    return Response.json({ authorization_url: data.data.authorization_url });
  } catch (err) {
    console.error('Subscribe error:', err);
    return Response.json({ error: err.message || 'Failed to create subscription' }, { status: 500 });
  }
}
