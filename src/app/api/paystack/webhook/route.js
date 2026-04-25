import { supabaseAdmin } from '@/lib/supabase';
import { verifyWebhookSignature } from '@/lib/paystack';
import { sendGalleryReady } from '@/lib/email';

export async function POST(req) {
  const rawBody = await req.text();
  const signature = req.headers.get('x-paystack-signature');

  if (!verifyWebhookSignature(rawBody, signature)) {
    return new Response('Invalid signature', { status: 400 });
  }

  const event = JSON.parse(rawBody);

  // ── Subscription: initial payment ────────────────────────────────────────
  // charge.success fires for both booking payments and subscription initial payments.
  // Distinguish by checking for studio_id + billing in metadata.
  if (event.event === 'charge.success') {
    const metadata = event.data.metadata || {};

    if (metadata.studio_id && metadata.billing) {
      // This is a subscription payment, not a booking payment
      await supabaseAdmin
        .from('studios')
        .update({
          plan: 'pro',
          subscription_status: 'active',
          subscription_customer_email: event.data.customer?.email || event.data.email,
          subscription_billing: metadata.billing,
        })
        .eq('id', metadata.studio_id);

      await supabaseAdmin.from('subscription_payments').insert({
        studio_id: metadata.studio_id,
        amount: Math.round(event.data.amount / 100),
        billing: metadata.billing,
        paystack_reference: event.data.reference,
        paid_at: new Date().toISOString(),
      });

      return new Response('OK', { status: 200 });
    }

    // ── Booking payment ───────────────────────────────────────────────────
    const reference = event.data.reference;

    const { data: payment } = await supabaseAdmin
      .from('payments')
      .select('*, bookings(id, client_name, client_email)')
      .eq('paystack_reference', reference)
      .maybeSingle();

    if (!payment) return new Response('OK', { status: 200 });
    if (payment.status === 'paid') return new Response('OK', { status: 200 });

    await supabaseAdmin
      .from('payments')
      .update({ status: 'paid', paid_at: new Date().toISOString() })
      .eq('id', payment.id);

    if (payment.type === 'deposit') {
      await supabaseAdmin
        .from('bookings')
        .update({ deposit_paid: true, status: 'confirmed' })
        .eq('id', payment.booking_id);
    }

    if (payment.type === 'balance') {
      await supabaseAdmin
        .from('bookings')
        .update({ balance_paid: true, status: 'completed' })
        .eq('id', payment.booking_id);

      const { data: gallery } = await supabaseAdmin
        .from('galleries')
        .select('id, slug')
        .eq('booking_id', payment.booking_id)
        .maybeSingle();

      if (gallery) {
        await supabaseAdmin
          .from('galleries')
          .update({ is_locked: false, downloads_enabled: true })
          .eq('id', gallery.id);

        const { data: studio } = await supabaseAdmin
          .from('studios')
          .select('name, accent_color')
          .eq('id', payment.studio_id)
          .single();

        if (payment.bookings?.client_email) {
          sendGalleryReady({
            to: payment.bookings.client_email,
            clientName: payment.bookings.client_name,
            studioName: studio?.name,
            galleryUrl: `${process.env.NEXT_PUBLIC_APP_URL}/gallery/${gallery.slug}`,
            accentColor: studio?.accent_color || '#F0940A',
          }).catch(() => {});
        }
      }
    }

    return new Response('OK', { status: 200 });
  }

  // ── Subscription: renewal payment ─────────────────────────────────────────
  if (event.event === 'invoice.payment_succeeded') {
    const customerEmail = event.data.customer?.email;
    if (!customerEmail) return new Response('OK', { status: 200 });

    const { data: studio } = await supabaseAdmin
      .from('studios')
      .select('id, subscription_billing')
      .eq('subscription_customer_email', customerEmail)
      .maybeSingle();

    await supabaseAdmin
      .from('studios')
      .update({
        plan: 'pro',
        subscription_status: 'active',
        plan_expires_at: event.data.next_payment_date || null,
      })
      .eq('subscription_customer_email', customerEmail);

    if (studio && event.data.amount) {
      await supabaseAdmin.from('subscription_payments').insert({
        studio_id: studio.id,
        amount: Math.round(event.data.amount / 100),
        billing: studio.subscription_billing,
        paystack_reference: event.data.reference || null,
        paid_at: new Date().toISOString(),
      });
    }

    return new Response('OK', { status: 200 });
  }

  // ── Subscription: cancelled / expired ─────────────────────────────────────
  if (event.event === 'subscription.disabled') {
    const customerEmail = event.data.customer?.email;
    if (!customerEmail) return new Response('OK', { status: 200 });

    await supabaseAdmin
      .from('studios')
      .update({
        plan: 'free',
        subscription_status: 'disabled',
      })
      .eq('subscription_customer_email', customerEmail);

    return new Response('OK', { status: 200 });
  }

  return new Response('OK', { status: 200 });
}
