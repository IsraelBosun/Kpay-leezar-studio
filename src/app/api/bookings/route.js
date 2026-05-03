import { supabaseAdmin } from '@/lib/supabase';
import { createServerSupabase } from '@/lib/supabase';
import { sendBookingConfirmation, sendBookingNotification } from '@/lib/email';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

async function isRateLimited(ip) {
  try {
    const key = `booking:${ip}`;
    const count = await redis.incr(key);
    if (count === 1) await redis.expire(key, 600); // 10-minute window
    return count > 5;
  } catch {
    return false; // fail open — never block real clients due to Redis being down
  }
}

export async function POST(req) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim()
      || req.headers.get('x-real-ip')
      || 'unknown';

    if (await isRateLimited(ip)) {
      return Response.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    const body = await req.json();
    const { studio_slug, client_name, client_email, client_phone, service_id, session_date, notes } = body;

    if (!studio_slug || !client_name || !client_email) {
      return Response.json({ error: 'Name, email and studio are required.' }, { status: 400 });
    }

    if (client_name.length > 100) return Response.json({ error: 'Name too long.' }, { status: 400 });
    if (client_email.length > 254) return Response.json({ error: 'Email too long.' }, { status: 400 });
    if (client_phone && client_phone.length > 30) return Response.json({ error: 'Phone too long.' }, { status: 400 });
    if (notes && notes.length > 2000) return Response.json({ error: 'Notes too long.' }, { status: 400 });

    const supabase = await createServerSupabase();

    const { data: studio } = await supabase
      .from('studios')
      .select('id, name, email, phone, accent_color')
      .eq('slug', studio_slug)
      .single();

    if (!studio) return Response.json({ error: 'Studio not found.' }, { status: 404 });

    // Verify service belongs to this studio before using it
    let serviceName = null;
    if (service_id) {
      const { data: service } = await supabase
        .from('services')
        .select('title')
        .eq('id', service_id)
        .eq('studio_id', studio.id)
        .single();
      serviceName = service?.title ?? null;
    }

    const { data: booking, error } = await supabaseAdmin.from('bookings').insert({
      studio_id: studio.id,
      client_name,
      client_email,
      client_phone: client_phone || null,
      service_id: serviceName ? service_id : null,
      session_date: session_date || null,
      notes: notes || null,
      status: 'pending',
      deposit_amount: 0,
      balance_amount: 0,
    }).select('id').single();

    if (error) return Response.json({ error: error.message }, { status: 500 });

    const bookingUrl = `${process.env.NEXT_PUBLIC_APP_URL}/studio/bookings/${booking.id}`;

    // Send confirmation to client — non-blocking
    sendBookingConfirmation({
      to: client_email,
      clientName: client_name,
      studioName: studio.name,
      studioEmail: studio.email,
      studioPhone: studio.phone,
      serviceName,
      sessionDate: session_date,
      depositAmount: 0,
      balanceAmount: 0,
      notes,
      accentColor: studio.accent_color || '#F0940A',
    }).catch(() => {});

    // Notify studio owner — non-blocking
    if (studio.email) {
      sendBookingNotification({
        to: studio.email,
        clientName: client_name,
        clientEmail: client_email,
        clientPhone: client_phone || null,
        studioName: studio.name,
        serviceName,
        sessionDate: session_date,
        notes,
        bookingUrl,
        accentColor: studio.accent_color || '#F0940A',
      }).catch(() => {});
    }

    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
