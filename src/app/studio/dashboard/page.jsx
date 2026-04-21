import { createServerSupabase } from '@/lib/supabase';
import Link from 'next/link';
import Badge from '@/components/ui/Badge';

export default async function DashboardPage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: studio } = await supabase
    .from('studios')
    .select('*')
    .eq('owner_id', user.id)
    .single();

  // Fetch all stats in parallel
  const [
    { count: totalBookings },
    { count: pendingBookings },
    { count: totalGalleries },
    { data: recentBookings },
    { data: payments },
  ] = await Promise.all([
    supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('studio_id', studio.id),
    supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('studio_id', studio.id).eq('status', 'pending'),
    supabase.from('galleries').select('*', { count: 'exact', head: true }).eq('studio_id', studio.id),
    supabase.from('bookings').select('*').eq('studio_id', studio.id).order('created_at', { ascending: false }).limit(5),
    supabase.from('payments').select('amount').eq('studio_id', studio.id).eq('status', 'paid'),
  ]);

  const totalRevenue = payments?.reduce((sum, p) => sum + Number(p.amount), 0) ?? 0;

  const stats = [
    { label: 'Total Bookings', value: totalBookings ?? 0, sub: `${pendingBookings ?? 0} pending`, href: '/studio/bookings' },
    { label: 'Galleries', value: totalGalleries ?? 0, sub: 'Client galleries', href: '/studio/galleries' },
    { label: 'Revenue', value: `₦${totalRevenue.toLocaleString()}`, sub: 'Total collected', href: '/studio/payments' },
    { label: 'Studio Plan', value: studio.plan.toUpperCase(), sub: studio.plan === 'free' ? 'Upgrade for more' : 'Active', href: '/studio/settings' },
  ];

  const statusVariant = {
    pending: 'warning',
    confirmed: 'success',
    completed: 'default',
    cancelled: 'danger',
  };

  return (
    <div className="space-y-10">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-primary font-bold mb-1">Dashboard</p>
          <h1 className="text-3xl md:text-4xl font-serif text-black">
            Welcome back{studio.name ? `, ${studio.name.split(' ')[0]}` : ''}.
          </h1>
        </div>
        <div className="flex gap-3">
          <Link
            href="/studio/bookings/new"
            className="bg-primary text-white px-5 py-3 text-xs uppercase tracking-widest font-bold hover:bg-black transition-colors"
          >
            + New Booking
          </Link>
          <Link
            href="/studio/galleries/new"
            className="border border-gray-200 text-black px-5 py-3 text-xs uppercase tracking-widest font-bold hover:bg-black hover:text-white transition-colors"
          >
            + New Gallery
          </Link>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="bg-white border border-gray-100 p-6 hover:border-primary/30 hover:shadow-sm transition-all duration-300 group"
          >
            <p className="text-[10px] uppercase tracking-widest font-bold text-neutral-gray mb-3 group-hover:text-primary transition-colors">
              {stat.label}
            </p>
            <p className="text-3xl font-serif text-black leading-none mb-1">{stat.value}</p>
            <p className="text-xs text-neutral-gray">{stat.sub}</p>
          </Link>
        ))}
      </div>

      {/* Studio URL banner */}
      <div className="bg-zinc-950 px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1">Your Studio Website</p>
          {process.env.NEXT_PUBLIC_ROOT_DOMAIN === 'photostudio.ng' ? (
            <p className="font-serif text-white text-lg">{studio.slug}.photostudio.ng</p>
          ) : (
            <p className="font-serif text-white text-lg">{process.env.NEXT_PUBLIC_APP_URL}/studio-site/{studio.slug}</p>
          )}
        </div>
        <div className="flex gap-3">
          <a
            href={
              process.env.NEXT_PUBLIC_ROOT_DOMAIN === 'photostudio.ng'
                ? `https://${studio.slug}.photostudio.ng`
                : `${process.env.NEXT_PUBLIC_APP_URL}/studio-site/${studio.slug}`
            }
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs uppercase tracking-widest font-bold text-white border border-white/20 px-4 py-2 hover:bg-white hover:text-black transition-colors"
          >
            Preview
          </a>
          <Link
            href="/studio/settings"
            className="text-xs uppercase tracking-widest font-bold text-white/40 hover:text-white transition-colors px-4 py-2"
          >
            Edit Site
          </Link>
        </div>
      </div>

      {/* Recent bookings */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xs uppercase tracking-[0.4em] font-bold text-black">Recent Bookings</h2>
          <Link href="/studio/bookings" className="text-xs uppercase tracking-widest font-bold text-neutral-gray hover:text-primary transition-colors">
            View All →
          </Link>
        </div>

        {!recentBookings || recentBookings.length === 0 ? (
          <div className="bg-white border border-gray-100 px-8 py-16 text-center">
            <p className="font-serif text-2xl text-black mb-2">No bookings yet</p>
            <p className="text-sm text-neutral-gray italic mb-6">When clients book sessions they'll appear here.</p>
            <Link
              href="/studio/bookings/new"
              className="inline-block bg-primary text-white px-8 py-3 text-xs uppercase tracking-widest font-bold hover:bg-black transition-colors"
            >
              Add First Booking
            </Link>
          </div>
        ) : (
          <div className="bg-white border border-gray-100 overflow-hidden">
            {/* Table header */}
            <div className="hidden md:grid grid-cols-5 px-6 py-3 border-b border-gray-50 bg-gray-50">
              {['Client', 'Date', 'Status', 'Deposit', 'Balance'].map((h) => (
                <p key={h} className="text-[10px] uppercase tracking-widest font-bold text-neutral-gray">{h}</p>
              ))}
            </div>
            {/* Rows */}
            {recentBookings.map((booking, i) => (
              <Link
                key={booking.id}
                href={`/studio/bookings/${booking.id}`}
                className={`grid grid-cols-2 md:grid-cols-5 px-6 py-4 gap-2 hover:bg-gray-50 transition-colors ${i < recentBookings.length - 1 ? 'border-b border-gray-50' : ''}`}
              >
                <div>
                  <p className="text-sm font-medium text-black">{booking.client_name}</p>
                  <p className="text-xs text-neutral-gray">{booking.client_email}</p>
                </div>
                <div className="text-sm text-neutral-gray">
                  {booking.session_date
                    ? new Date(booking.session_date).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })
                    : '—'}
                </div>
                <div>
                  <Badge variant={statusVariant[booking.status] ?? 'default'}>
                    {booking.status}
                  </Badge>
                </div>
                <div className="text-sm text-black">
                  {booking.deposit_paid
                    ? <span className="text-green-600 font-medium">✓ ₦{Number(booking.deposit_amount).toLocaleString()}</span>
                    : <span className="text-neutral-gray">₦{Number(booking.deposit_amount).toLocaleString()}</span>
                  }
                </div>
                <div className="text-sm text-black">
                  {booking.balance_paid
                    ? <span className="text-green-600 font-medium">✓ ₦{Number(booking.balance_amount).toLocaleString()}</span>
                    : <span className="text-neutral-gray">₦{Number(booking.balance_amount).toLocaleString()}</span>
                  }
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
