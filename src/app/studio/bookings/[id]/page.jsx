import { createServerSupabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Badge from '@/components/ui/Badge';
import BookingDetail from './BookingDetail';

const statusVariant = {
  pending: 'warning',
  confirmed: 'success',
  completed: 'default',
  cancelled: 'danger',
};

export default async function BookingDetailPage({ params }) {
  const { id } = await params;
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: studio } = await supabase
    .from('studios')
    .select('id, paystack_subaccount_code')
    .eq('owner_id', user.id)
    .single();

  const { data: booking } = await supabase
    .from('bookings')
    .select('*, services(title)')
    .eq('id', id)
    .eq('studio_id', studio.id)
    .single();

  if (!booking) notFound();

  const { data: payments } = await supabase
    .from('payments')
    .select('*')
    .eq('booking_id', id)
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Header */}
      <div>
        <Link href="/studio/bookings"
          className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-bold text-neutral-gray hover:text-black transition-colors mb-4">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          Bookings
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-primary font-bold mb-1">Booking</p>
            <h1 className="text-3xl md:text-4xl font-serif text-black">{booking.client_name}</h1>
          </div>
          <Badge variant={statusVariant[booking.status] ?? 'default'}>{booking.status}</Badge>
        </div>
      </div>

      {/* Booking info */}
      <div className="bg-white border border-gray-100 divide-y divide-gray-50">
        <div className="px-6 py-5 grid sm:grid-cols-2 gap-5">
          <InfoRow label="Email" value={booking.client_email} />
          <InfoRow label="Phone" value={booking.client_phone || '—'} />
          <InfoRow label="Service" value={booking.services?.title || '—'} />
          <InfoRow label="Session Date" value={
            booking.session_date
              ? new Date(booking.session_date).toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
              : '—'
          } />
        </div>
        {booking.notes && (
          <div className="px-6 py-5">
            <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2">Notes</p>
            <p className="text-sm text-neutral-gray leading-relaxed">{booking.notes}</p>
          </div>
        )}
      </div>

      {/* Payments panel — client component */}
      <BookingDetail
        booking={booking}
        payments={payments ?? []}
        hasSubaccount={!!studio.paystack_subaccount_code}
      />
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-1">{label}</p>
      <p className="text-sm text-black">{value}</p>
    </div>
  );
}
