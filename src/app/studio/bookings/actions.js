'use server';

import { createServerSupabase } from '@/lib/supabase';
import { redirect } from 'next/navigation';
import { sendBookingConfirmation } from '@/lib/email';
import { generateInvoicePdf } from '@/lib/invoice-pdf';
import { isPro } from '@/lib/plan';

export async function createBooking(formData) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated.' };

  const { data: studio } = await supabase
    .from('studios')
    .select('id, name, email, phone, accent_color, plan, created_at, paystack_bank_name, paystack_account_number, paystack_account_name')
    .eq('owner_id', user.id)
    .single();
  if (!studio) return { error: 'Studio not found.' };

  if (!isPro(studio)) return { error: 'Bookings are a Pro feature. Upgrade to create bookings.' };

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

  const { data: newBooking, error } = await supabase.from('bookings').insert({
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
  }).select('id').single();

  if (error) return { error: error.message };

  const invoiceNumber = `INV-${new Date().getFullYear()}-${newBooking.id.slice(0, 6).toUpperCase()}`;

  // Generate PDF invoice if amounts are set — non-blocking, falls back to plain email
  const hasAmounts = depositAmount > 0 || balanceAmount > 0;
  const pdfPromise = hasAmounts
    ? generateInvoicePdf({
        invoiceNumber,
        invoiceDate: new Date().toISOString(),
        studioName: studio.name,
        accentColor: studio.accent_color || '#F0940A',
        clientName,
        clientEmail,
        clientPhone: formData.get('client_phone') || null,
        serviceName,
        sessionDate,
        depositAmount,
        balanceAmount,
        depositPaid: false,
        balancePaid: false,
        bankName: studio.paystack_bank_name,
        accountName: studio.paystack_account_name,
        accountNumber: studio.paystack_account_number,
        notes,
      }).catch(() => null)
    : Promise.resolve(null);

  pdfPromise.then((pdfAttachment) =>
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
      accentColor: studio.accent_color || '#F0940A',
      pdfAttachment,
      invoiceNumber: pdfAttachment ? invoiceNumber : undefined,
    }).catch(() => {})
  ).catch(() => {});

  redirect('/studio/bookings');
}

export async function updateBookingStatus(bookingId, status) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated.' };

  const { error } = await supabase
    .from('bookings')
    .update({ status, status_updated_at: new Date().toISOString() })
    .eq('id', bookingId);

  if (error) return { error: error.message };

  if (status === 'completed') {
    const { data: gallery } = await supabase
      .from('galleries')
      .select('id')
      .eq('booking_id', bookingId)
      .maybeSingle();
    if (gallery) {
      await supabase.from('galleries').update({ downloads_enabled: true }).eq('id', gallery.id);
    }
  }

  return { success: true };
}

export async function updateBookingDetails(bookingId, data) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated.' };

  const { data: studio } = await supabase
    .from('studios')
    .select('id')
    .eq('owner_id', user.id)
    .single();
  if (!studio) return { error: 'Studio not found.' };

  const { error } = await supabase
    .from('bookings')
    .update({
      client_name: data.client_name,
      client_email: data.client_email,
      client_phone: data.client_phone || null,
      service_id: data.service_id || null,
      session_date: data.session_date || null,
      deposit_amount: parseFloat(data.deposit_amount) || 0,
      balance_amount: parseFloat(data.balance_amount) || 0,
      notes: data.notes || null,
    })
    .eq('id', bookingId)
    .eq('studio_id', studio.id);

  if (error) return { error: error.message };
  return { success: true };
}
