import { createServerSupabase } from '@/lib/supabase';
import { sendInvoiceEmail } from '@/lib/email';
import { generateInvoicePdf } from '@/lib/invoice-pdf';

export async function POST(req, { params }) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: studio } = await supabase
      .from('studios')
      .select('id, name, logo_url, email, phone, accent_color, paystack_bank_name, paystack_account_number, paystack_account_name')
      .eq('owner_id', user.id)
      .single();
    if (!studio) return Response.json({ error: 'Studio not found' }, { status: 404 });

    const { data: booking } = await supabase
      .from('bookings')
      .select('*, services(title)')
      .eq('id', id)
      .eq('studio_id', studio.id)
      .single();
    if (!booking) return Response.json({ error: 'Booking not found' }, { status: 404 });

    const { data: payments } = await supabase
      .from('payments')
      .select('type, status')
      .eq('booking_id', id);

    const depositPaid = !!payments?.find(p => p.type === 'deposit' && p.status === 'paid') || booking.deposit_paid;
    const balancePaid = !!payments?.find(p => p.type === 'balance' && p.status === 'paid') || booking.balance_paid;

    const invoiceNumber = `INV-${new Date(booking.created_at).getFullYear()}-${id.slice(0, 6).toUpperCase()}`;

    const pdfAttachment = await generateInvoicePdf({
      invoiceNumber,
      invoiceDate: booking.created_at,
      studioName: studio.name,
      accentColor: studio.accent_color || '#D30E15',
      clientName: booking.client_name,
      clientEmail: booking.client_email,
      clientPhone: booking.client_phone,
      serviceName: booking.services?.title || null,
      sessionDate: booking.session_date,
      depositAmount: Number(booking.deposit_amount),
      balanceAmount: Number(booking.balance_amount),
      depositPaid,
      balancePaid,
      bankName: studio.paystack_bank_name,
      accountName: studio.paystack_account_name,
      accountNumber: studio.paystack_account_number,
      notes: booking.notes,
    }).catch(() => null);

    await sendInvoiceEmail({
      to: booking.client_email,
      clientName: booking.client_name,
      clientEmail: booking.client_email,
      clientPhone: booking.client_phone,
      studioName: studio.name,
      studioLogoUrl: studio.logo_url,
      studioEmail: studio.email,
      studioPhone: studio.phone,
      accentColor: studio.accent_color || '#D30E15',
      bankName: studio.paystack_bank_name,
      accountNumber: studio.paystack_account_number,
      accountName: studio.paystack_account_name,
      serviceName: booking.services?.title || null,
      sessionDate: booking.session_date,
      depositAmount: Number(booking.deposit_amount),
      balanceAmount: Number(booking.balance_amount),
      depositPaid,
      balancePaid,
      notes: booking.notes,
      invoiceNumber,
      invoiceDate: booking.created_at,
      pdfAttachment,
    });

    return Response.json({ success: true });
  } catch (err) {
    console.error('Send invoice error:', err);
    return Response.json({ error: 'Failed to send invoice. Please try again.' }, { status: 500 });
  }
}
