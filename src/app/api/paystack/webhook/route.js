import { createServerSupabase } from '@/lib/supabase';
import { verifyWebhookSignature } from '@/lib/paystack';
import { sendGalleryReady } from '@/lib/email';

export async function POST(req) {
  const rawBody = await req.text();
  const signature = req.headers.get('x-paystack-signature');

  if (!verifyWebhookSignature(rawBody, signature)) {
    return new Response('Invalid signature', { status: 400 });
  }

  const event = JSON.parse(rawBody);

  // Only handle successful charges
  if (event.event !== 'charge.success') {
    return new Response('OK', { status: 200 });
  }

  const reference = event.data.reference;
  const supabase = await createServerSupabase();

  const { data: payment } = await supabase
    .from('payments')
    .select('*, bookings(id, client_name, client_email)')
    .eq('paystack_reference', reference)
    .maybeSingle();

  if (!payment) return new Response('OK', { status: 200 });
  if (payment.status === 'paid') return new Response('OK', { status: 200 }); // idempotent

  // Mark payment as paid
  await supabase
    .from('payments')
    .update({ status: 'paid', paid_at: new Date().toISOString() })
    .eq('id', payment.id);

  if (payment.type === 'deposit') {
    await supabase
      .from('bookings')
      .update({ deposit_paid: true, status: 'confirmed' })
      .eq('id', payment.booking_id);
  }

  if (payment.type === 'balance') {
    await supabase
      .from('bookings')
      .update({ balance_paid: true })
      .eq('id', payment.booking_id);

    // Unlock the linked gallery
    const { data: gallery } = await supabase
      .from('galleries')
      .select('id, slug')
      .eq('booking_id', payment.booking_id)
      .maybeSingle();

    if (gallery) {
      await supabase
        .from('galleries')
        .update({ is_locked: false })
        .eq('id', gallery.id);

      const { data: studio } = await supabase
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
