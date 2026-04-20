'use server';

import { createServerSupabase } from '@/lib/supabase';
import { redirect } from 'next/navigation';
import { sendBookingConfirmation } from '@/lib/email';

export async function createBooking(formData) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated.' };

  const { data: studio } = await supabase
    .from('studios')
    .select('id, name, email, phone, accent_color')
    .eq('owner_id', user.id)
    .single();
  if (!studio) return { error: 'Studio not found.' };

  const serviceId = formData.get('service_id') || null;
  const sessionDate = formData.get('session_date') || null;
  const clientName = formData.get('client_name');
  const clientEmail = formData.get('client_email');
  const depositAmount = parseFloat(formData.get('deposit_amount')) || 0;
  const balanceAmount = parseFloat(formData.get('balance_amount')) || 0;
  const notes = formData.get('notes') || null;

  // Get service name if selected
  let serviceName = null;
  if (serviceId) {
    const { data: service } = await supabase.from('services').select('title').eq('id', serviceId).single();
    serviceName = service?.title ?? null;
  }

  const { error } = await supabase.from('bookings').insert({
    studio_id: studio.id,
    client_name: clientName,
    client_email: clientEmail,
    client_phone: formData.get('client_phone') || null,
    service_id: serviceId,
    session_date: sessionDate,
    notes,
    deposit_amount: depositAmount,
    balance_amount: balanceAmount,
    status: 'pending',
  });

  if (error) return { error: error.message };

  // Send confirmation email — non-blocking, don't fail the booking if email fails
  sendBookingConfirmation({
    to: clientEmail,
    clientName,
    studioName: studio.name,
    studioEmail: studio.email,
    studioPhone: studio.phone,
    serviceName,
    sessionDate,
    depositAmount,
    balanceAmount,
    notes,
    accentColor: studio.accent_color || '#D30E15',
  }).catch(() => {});

  redirect('/studio/bookings');
}

export async function updateBookingStatus(bookingId, status) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated.' };

  const { error } = await supabase
    .from('bookings')
    .update({ status })
    .eq('id', bookingId);

  if (error) return { error: error.message };
  return { success: true };
}
