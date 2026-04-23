import { createServerSupabase } from '@/lib/supabase';
import { initializePayment } from '@/lib/paystack';
import { randomUUID } from 'crypto';

export async function POST(req) {
  try {
    const { booking_id, payment_type } = await req.json();

    if (!booking_id || !payment_type) {
      return Response.json({ error: 'booking_id and payment_type are required' }, { status: 400 });
    }

    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return Response.json({ error: 'Not authenticated' }, { status: 401 });

    // Verify this booking belongs to the authenticated photographer
    const { data: studio } = await supabase
      .from('studios')
      .select('id, name, paystack_subaccount_code')
      .eq('owner_id', user.id)
      .single();
    if (!studio) return Response.json({ error: 'Studio not found' }, { status: 404 });

    const { data: booking } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', booking_id)
      .eq('studio_id', studio.id)
      .single();
    if (!booking) return Response.json({ error: 'Booking not found' }, { status: 404 });

    const amount = payment_type === 'deposit' ? Number(booking.deposit_amount) : Number(booking.balance_amount);
    if (!amount || amount <= 0) {
      return Response.json({ error: `No ${payment_type} amount set on this booking` }, { status: 400 });
    }

    // Reuse existing pending reference so the photographer can re-share the same link
    const { data: existing } = await supabase
      .from('payments')
      .select('paystack_reference')
      .eq('booking_id', booking_id)
      .eq('type', payment_type)
      .eq('status', 'pending')
      .maybeSingle();

    const reference = existing?.paystack_reference
      || `ps_${randomUUID().replace(/-/g, '').slice(0, 20)}`;

    const paymentData = await initializePayment({
      email: booking.client_email,
      amountNaira: amount,
      reference,
      subaccountCode: studio.paystack_subaccount_code || null,
      metadata: {
        booking_id,
        payment_type,
        studio_name: studio.name,
        client_name: booking.client_name,
      },
      callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/pay/success`,
    });

    // Create payment record if one doesn't exist yet
    if (!existing) {
      await supabase.from('payments').insert({
        booking_id,
        studio_id: studio.id,
        amount,
        currency: 'NGN',
        type: payment_type,
        paystack_reference: reference,
        status: 'pending',
      });
    }

    return Response.json({ authorization_url: paymentData.authorization_url, reference });
  } catch (err) {
    console.error('Payment init error:', err);
    return Response.json({ error: err.message || 'Failed to initialize payment' }, { status: 500 });
  }
}
