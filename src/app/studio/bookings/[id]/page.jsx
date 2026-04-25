import { createServerSupabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Badge from '@/components/ui/Badge';
import BookingInfo from './BookingInfo';
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

  const [{ data: booking }, { data: payments }, { data: services }] = await Promise.all([
    supabase
      .from('bookings')
      .select('*, services(title)')
      .eq('id', id)
      .eq('studio_id', studio.id)
      .single(),
    supabase
      .from('payments')
      .select('*')
      .eq('booking_id', id)
      .order('created_at', { ascending: false }),
    supabase
      .from('services')
      .select('id, title')
      .eq('studio_id', studio.id)
      .order('title'),
  ]);

  if (!booking) notFound();

  return (
    <div className="space-y-6 max-w-2xl">
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
            {booking.status_updated_at && (
              <p className="text-[10px] text-neutral-gray mt-1">
                Status updated {new Date(booking.status_updated_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            )}
          </div>
          <Badge variant={statusVariant[booking.status] ?? 'default'}>{booking.status}</Badge>
        </div>
      </div>

      {/* Booking info — editable */}
      <BookingInfo booking={booking} services={services ?? []} />

      {/* Payments + status controls */}
      <BookingDetail
        booking={booking}
        payments={payments ?? []}
        hasSubaccount={!!studio.paystack_subaccount_code}
      />
    </div>
  );
}
