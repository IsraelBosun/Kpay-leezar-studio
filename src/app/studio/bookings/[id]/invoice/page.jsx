import { createServerSupabase } from '@/lib/supabase';
import { notFound, redirect } from 'next/navigation';
import InvoiceView from './InvoiceView';

export default async function InvoicePage({ params }) {
  const { id } = await params;
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/sign-in');

  const { data: studio } = await supabase
    .from('studios')
    .select('id, name, logo_url, email, phone, accent_color, paystack_bank_name, paystack_account_number, paystack_account_name')
    .eq('owner_id', user.id)
    .single();

  const [{ data: booking }, { data: payments }] = await Promise.all([
    supabase.from('bookings').select('*, services(title)').eq('id', id).eq('studio_id', studio.id).single(),
    supabase.from('payments').select('type, status').eq('booking_id', id),
  ]);

  if (!booking) notFound();

  const depositPaid = !!payments?.find(p => p.type === 'deposit' && p.status === 'paid') || booking.deposit_paid;
  const balancePaid = !!payments?.find(p => p.type === 'balance' && p.status === 'paid') || booking.balance_paid;
  const invoiceNumber = `INV-${new Date(booking.created_at).getFullYear()}-${id.slice(0, 6).toUpperCase()}`;

  return (
    <InvoiceView
      booking={booking}
      studio={studio}
      invoiceNumber={invoiceNumber}
      depositPaid={depositPaid}
      balancePaid={balancePaid}
    />
  );
}
