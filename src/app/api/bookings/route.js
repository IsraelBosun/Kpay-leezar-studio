import { createServerSupabase } from '@/lib/supabase';
import { sendBookingConfirmation } from '@/lib/email';

export async function POST(req) {
  try {
    const body = await req.json();
    const { studio_slug, client_name, client_email, client_phone, service_id, session_date, notes } = body;

    if (!studio_slug || !client_name || !client_email) {
      return Response.json({ error: 'Name, email and studio are required.' }, { status: 400 });
    }

    const supabase = await createServerSupabase();

    const { data: studio } = await supabase
      .from('studios')
      .select('id, name, email, phone, accent_color')
      .eq('slug', studio_slug)
      .single();

    if (!studio) return Response.json({ error: 'Studio not found.' }, { status: 404 });

    let serviceName = null;
    if (service_id) {
      const { data: service } = await supabase
        .from('services')
        .select('title')
        .eq('id', service_id)
        .single();
      serviceName = service?.title ?? null;
    }

    const { error } = await supabase.from('bookings').insert({
      studio_id: studio.id,
      client_name,
      client_email,
      client_phone: client_phone || null,
      service_id: service_id || null,
      session_date: session_date || null,
      notes: notes || null,
      status: 'pending',
      deposit_amount: 0,
      balance_amount: 0,
    });

    if (error) return Response.json({ error: error.message }, { status: 500 });

    // Send confirmation email — non-blocking
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
      accentColor: studio.accent_color || '#D30E15',
    }).catch(() => {});

    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
