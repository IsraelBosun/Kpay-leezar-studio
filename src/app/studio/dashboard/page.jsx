import { createServerSupabase } from '@/lib/supabase';
import Link from 'next/link';
import Badge from '@/components/ui/Badge';

export default async function DashboardPage({ searchParams }) {
  const params = await searchParams;
  const upgraded = params?.upgraded === '1';
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
    { count: servicesCount },
  ] = await Promise.all([
    supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('studio_id', studio.id),
    supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('studio_id', studio.id).eq('status', 'pending'),
    supabase.from('galleries').select('*', { count: 'exact', head: true }).eq('studio_id', studio.id),
    supabase.from('bookings').select('*').eq('studio_id', studio.id).order('created_at', { ascending: false }).limit(5),
    supabase.from('payments').select('amount').eq('studio_id', studio.id).eq('status', 'paid'),
    supabase.from('services').select('*', { count: 'exact', head: true }).eq('studio_id', studio.id),
  ]);

  const totalRevenue = payments?.reduce((sum, p) => sum + Number(p.amount), 0) ?? 0;

  // Trial: 14 days from signup
  const trialEndsAt = new Date(new Date(studio.created_at).getTime() + 14 * 24 * 60 * 60 * 1000);
  const now = new Date();
  const trialDaysLeft = Math.max(0, Math.ceil((trialEndsAt - now) / (1000 * 60 * 60 * 24)));
  const inTrial = studio.plan === 'free' && now < trialEndsAt;
  const trialExpired = studio.plan === 'free' && now >= trialEndsAt;

  const stats = [
    { label: 'Total Bookings', value: totalBookings ?? 0, sub: `${pendingBookings ?? 0} pending`, href: '/studio/bookings' },
    { label: 'Galleries', value: totalGalleries ?? 0, sub: 'Client galleries', href: '/studio/galleries' },
    { label: 'Revenue', value: `₦${totalRevenue.toLocaleString()}`, sub: 'Total collected', href: '/studio/payments', accent: 'green' },
    { label: 'Studio Plan', value: studio.plan.toUpperCase(), sub: studio.plan === 'free' ? 'Upgrade for more' : 'Active', href: '/studio/settings', accent: 'amber' },
  ];

  const statusVariant = {
    pending: 'warning',
    confirmed: 'success',
    completed: 'default',
    cancelled: 'danger',
  };

  return (
    <div className="space-y-10">

      {/* Upgrade success banner */}
      {upgraded && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 px-5 py-4">
          <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
          <p className="text-sm text-green-800">
            <span className="font-bold">Welcome to Pro!</span> Your plan upgrade is being processed — all features will be active within a minute.
          </p>
        </div>
      )}

      {/* Trial banner */}
      {!upgraded && inTrial && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-amber-50 border border-amber-200 px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
            <p className="text-sm text-amber-900">
              <span className="font-bold">Free trial — {trialDaysLeft} day{trialDaysLeft !== 1 ? 's' : ''} left.</span>{' '}
              You have full Pro access until your trial ends.
            </p>
          </div>
          <Link href="/studio/settings"
            className="flex-shrink-0 text-[10px] uppercase tracking-widest font-bold px-4 py-2 text-white transition-colors hover:opacity-90"
            style={{ backgroundColor: '#F0940A' }}>
            Upgrade to Pro
          </Link>
        </div>
      )}

      {!upgraded && trialExpired && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-950 px-5 py-4">
          <div>
            <p className="text-sm font-bold text-white mb-0.5">Your free trial has ended.</p>
            <p className="text-xs text-white/50">Upgrade to Pro to keep using booking, payments, and unlimited galleries.</p>
          </div>
          <Link href="/studio/settings"
            className="flex-shrink-0 text-[10px] uppercase tracking-widest font-bold px-5 py-2.5 text-white transition-colors hover:opacity-90"
            style={{ backgroundColor: '#F0940A' }}>
            Upgrade — ₦10,000/mo
          </Link>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-primary font-bold mb-1">Dashboard</p>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif text-black">
            Welcome back{studio.name ? `, ${studio.name.split(' ')[0]}` : ''}.
          </h1>
        </div>
        <div className="flex gap-3">
          <Link
            href="/studio/bookings/new"
            className="bg-primary text-white px-5 py-3 text-xs uppercase tracking-widest font-bold hover:bg-black transition-all duration-200 active:scale-[0.97]"
          >
            + New Booking
          </Link>
          <Link
            href="/studio/galleries/new"
            className="border border-gray-200 text-black px-5 py-3 text-xs uppercase tracking-widest font-bold hover:bg-black hover:text-white transition-all duration-200 active:scale-[0.97]"
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
            className="bg-white border p-6 hover:shadow-sm transition-all duration-300 group"
            style={{
              borderColor: stat.accent === 'green' ? '#bbf7d0' : stat.accent === 'amber' ? '#fde68a' : '#f3f4f6',
              backgroundColor: stat.accent === 'green' ? '#f0fdf4' : stat.accent === 'amber' ? '#fffbeb' : '#ffffff',
            }}
          >
            <p className="text-[10px] uppercase tracking-widest font-bold mb-3 group-hover:text-primary transition-colors"
              style={{ color: stat.accent === 'green' ? '#16a34a' : stat.accent === 'amber' ? '#d97706' : '#6b7280' }}>
              {stat.label}
            </p>
            <p className="text-3xl font-serif leading-none mb-1"
              style={{ color: stat.accent === 'green' ? '#15803d' : stat.accent === 'amber' ? '#b45309' : '#000000' }}>
              {stat.value}
            </p>
            <p className="text-xs text-neutral-gray">{stat.sub}</p>
          </Link>
        ))}
      </div>

      {/* Profile completion checklist */}
      {(() => {
        const steps = [
          { done: !!studio.bio, label: 'Add your studio bio', href: '/studio/settings' },
          { done: !!studio.logo_url, label: 'Upload your logo', href: '/studio/settings' },
          { done: (servicesCount ?? 0) > 0, label: 'Add your services & pricing', href: '/studio/website' },
        ];
        const remaining = steps.filter(s => !s.done);
        if (remaining.length === 0) return null;
        return (
          <div className="bg-white border border-gray-100 px-6 py-5">
            <p className="text-[10px] uppercase tracking-widest font-bold text-primary mb-4">Complete your profile</p>
            <div className="space-y-3">
              {steps.map((s) => (
                <div key={s.label} className="flex items-center gap-3">
                  <div className={`w-5 h-5 flex-shrink-0 flex items-center justify-center border-2 ${s.done ? 'border-green-500 bg-green-500' : 'border-gray-200'}`}>
                    {s.done && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  {s.done ? (
                    <span className="text-sm text-neutral-gray line-through">{s.label}</span>
                  ) : (
                    <Link href={s.href} className="text-sm text-black font-medium hover:text-primary transition-colors">{s.label} →</Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })()}

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
          <div className="bg-white border border-gray-100 px-4 sm:px-8 py-12 sm:py-16 text-center">
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
                className={`hover:bg-gray-50 transition-colors ${i < recentBookings.length - 1 ? 'border-b border-gray-50' : ''}`}
              >
                {/* Mobile layout */}
                <div className="md:hidden px-4 py-4 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-black truncate">{booking.client_name}</p>
                      <p className="text-xs text-neutral-gray truncate">{booking.client_email}</p>
                    </div>
                    <Badge variant={statusVariant[booking.status] ?? 'default'}>{booking.status}</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-neutral-gray">
                    {booking.session_date && (
                      <span>{new Date(booking.session_date).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    )}
                  </div>
                  <div className="flex gap-4 text-xs font-medium">
                    <span className={booking.deposit_paid ? 'text-green-600' : 'text-neutral-gray'}>
                      Deposit: {booking.deposit_paid ? '✓ ' : ''}₦{Number(booking.deposit_amount).toLocaleString()}
                    </span>
                    <span className={booking.balance_paid ? 'text-green-600' : 'text-neutral-gray'}>
                      Balance: {booking.balance_paid ? '✓ ' : ''}₦{Number(booking.balance_amount).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Desktop layout */}
                <div className="hidden md:grid grid-cols-5 px-6 py-4 gap-2">
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
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
