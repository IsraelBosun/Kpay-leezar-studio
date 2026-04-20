import { createServerSupabase } from '@/lib/supabase';
import Link from 'next/link';
import Badge from '@/components/ui/Badge';

const STATUS_TABS = ['all', 'pending', 'confirmed', 'completed', 'cancelled'];

const statusVariant = {
  pending: 'warning',
  confirmed: 'success',
  completed: 'default',
  cancelled: 'danger',
};

export default async function BookingsPage({ searchParams }) {
  const { filter = 'all' } = await searchParams;
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: studio } = await supabase
    .from('studios')
    .select('id')
    .eq('owner_id', user.id)
    .single();

  let query = supabase
    .from('bookings')
    .select('*, services(title)')
    .eq('studio_id', studio.id)
    .order('created_at', { ascending: false });

  if (filter !== 'all') query = query.eq('status', filter);

  const { data: bookings } = await query;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-primary font-bold mb-1">Studio</p>
          <h1 className="text-3xl md:text-4xl font-serif text-black">Bookings</h1>
        </div>
        <Link
          href="/studio/bookings/new"
          className="bg-primary text-white px-5 py-3 text-xs uppercase tracking-widest font-bold hover:bg-black transition-colors self-start sm:self-auto"
        >
          + New Booking
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {STATUS_TABS.map((tab) => (
          <Link
            key={tab}
            href={`/studio/bookings?filter=${tab}`}
            className={`px-4 py-2.5 text-[10px] uppercase tracking-widest font-bold transition-colors capitalize ${
              filter === tab
                ? 'border-b-2 border-primary text-primary -mb-px'
                : 'text-neutral-gray hover:text-black'
            }`}
          >
            {tab}
          </Link>
        ))}
      </div>

      {/* Table */}
      {!bookings || bookings.length === 0 ? (
        <div className="bg-white border border-gray-100 px-8 py-16 text-center">
          <p className="font-serif text-2xl text-black mb-2">No bookings found</p>
          <p className="text-sm text-neutral-gray italic mb-6">
            {filter === 'all' ? 'Add your first booking to get started.' : `No ${filter} bookings.`}
          </p>
          <Link
            href="/studio/bookings/new"
            className="inline-block bg-primary text-white px-8 py-3 text-xs uppercase tracking-widest font-bold hover:bg-black transition-colors"
          >
            Add Booking
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 overflow-hidden">
          {/* Header row */}
          <div className="hidden md:grid grid-cols-6 px-6 py-3 bg-gray-50 border-b border-gray-100">
            {['Client', 'Service', 'Date', 'Status', 'Deposit', 'Balance'].map((h) => (
              <p key={h} className="text-[10px] uppercase tracking-widest font-bold text-neutral-gray">{h}</p>
            ))}
          </div>

          {bookings.map((b, i) => (
            <Link
              key={b.id}
              href={`/studio/bookings/${b.id}`}
              className={`grid grid-cols-2 md:grid-cols-6 px-6 py-4 gap-2 hover:bg-gray-50 transition-colors group ${
                i < bookings.length - 1 ? 'border-b border-gray-50' : ''
              }`}
            >
              <div>
                <p className="text-sm font-medium text-black group-hover:text-primary transition-colors">{b.client_name}</p>
                <p className="text-xs text-neutral-gray truncate">{b.client_email}</p>
              </div>
              <p className="text-sm text-neutral-gray truncate">{b.services?.title || '—'}</p>
              <p className="text-sm text-neutral-gray">
                {b.session_date
                  ? new Date(b.session_date).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })
                  : '—'}
              </p>
              <div>
                <Badge variant={statusVariant[b.status] ?? 'default'}>{b.status}</Badge>
              </div>
              <p className={`text-sm font-medium ${b.deposit_paid ? 'text-green-600' : 'text-neutral-gray'}`}>
                {b.deposit_paid ? '✓ ' : ''}₦{Number(b.deposit_amount).toLocaleString()}
              </p>
              <p className={`text-sm font-medium ${b.balance_paid ? 'text-green-600' : 'text-neutral-gray'}`}>
                {b.balance_paid ? '✓ ' : ''}₦{Number(b.balance_amount).toLocaleString()}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
