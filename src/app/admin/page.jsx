import { supabaseAdmin } from '@/lib/supabase';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

function StatCard({ label, value, sub, accent, href }) {
  const inner = (
    <div className="admin-card rounded-xl p-6 border"
      style={{ backgroundColor: 'var(--a-surface)', borderColor: 'var(--a-border)' }}>
      <p className="text-[10px] uppercase tracking-widest font-bold mb-4" style={{ color: 'var(--a-subtle)' }}>
        {label}
      </p>
      <p className="font-serif text-4xl leading-none mb-2" style={{ color: accent || 'var(--a-text)' }}>
        {value}
      </p>
      {sub && <p className="text-xs" style={{ color: 'var(--a-muted)' }}>{sub}</p>}
    </div>
  );
  return href ? <Link href={href} className="block">{inner}</Link> : inner;
}

function PlanBar({ plan, count, total, color }) {
  const pct = total ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <p className="text-xs w-16 capitalize" style={{ color: 'var(--a-muted)' }}>{plan}</p>
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--a-hover)' }}>
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <p className="text-xs w-8 text-right font-medium" style={{ color: 'var(--a-text)' }}>{count}</p>
    </div>
  );
}

export default async function AdminOverview() {
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [
    { count: totalStudios },
    { count: newThisWeek },
    { data: allStudios },
    { count: totalBookings },
    { count: totalGalleries },
    { data: payments },
    { data: recentStudios },
  ] = await Promise.all([
    supabaseAdmin.from('studios').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('studios').select('*', { count: 'exact', head: true }).gte('created_at', oneWeekAgo),
    supabaseAdmin.from('studios').select('plan'),
    supabaseAdmin.from('bookings').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('galleries').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('payments').select('amount').eq('status', 'paid'),
    supabaseAdmin.from('studios')
      .select('id, name, slug, plan, subscription_billing, created_at, accent_color')
      .order('created_at', { ascending: false })
      .limit(8),
  ]);

  const totalRevenue = payments?.reduce((sum, p) => sum + Number(p.amount), 0) ?? 0;

  const planCounts = (allStudios ?? []).reduce((acc, s) => {
    acc[s.plan] = (acc[s.plan] || 0) + 1;
    return acc;
  }, {});

  const PLAN_ORDER = ['free', 'pro'];
  const planColors = { free: '#9ca3af', pro: '#f59e0b' };
  const proCount = (planCounts.pro ?? 0);

  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <p className="text-[10px] uppercase tracking-[0.4em] font-bold mb-2" style={{ color: 'var(--a-accent)' }}>
          Platform Control
        </p>
        <h1 className="font-serif text-4xl md:text-5xl" style={{ color: 'var(--a-text)' }}>Overview</h1>
        <p className="text-sm mt-1.5" style={{ color: 'var(--a-muted)' }}>Everything happening on photostudio.ng.</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="Total Studios" value={totalStudios ?? 0} sub={`+${newThisWeek ?? 0} this week`} href="/admin/studios" />
        <StatCard label="Platform Revenue" value={`₦${totalRevenue.toLocaleString()}`} sub="All paid payments" accent="var(--a-green)" href="/admin/revenue" />
        <StatCard label="Total Bookings" value={totalBookings ?? 0} sub="Across all studios" />
        <StatCard label="Galleries Created" value={totalGalleries ?? 0} sub="Client galleries" />
        <StatCard label="New This Week" value={newThisWeek ?? 0} sub="Studio signups" accent="var(--a-accent)" />
        <StatCard
          label="Avg Revenue / Studio"
          value={totalStudios ? `₦${Math.round(totalRevenue / totalStudios).toLocaleString()}` : '₦0'}
          sub="Lifetime average"
          accent="var(--a-amber)"
        />
      </div>

      {/* Plans breakdown + Recent signups */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Plans */}
        <div className="rounded-xl border p-6" style={{ backgroundColor: 'var(--a-surface)', borderColor: 'var(--a-border)' }}>
          <p className="text-[10px] uppercase tracking-widest font-bold mb-6" style={{ color: 'var(--a-subtle)' }}>
            Plans Breakdown
          </p>
          <div className="space-y-4">
            {PLAN_ORDER.map(plan => (
              <PlanBar key={plan} plan={plan} count={planCounts[plan] ?? 0} total={totalStudios ?? 1} color={planColors[plan]} />
            ))}
          </div>
          <div className="mt-6 pt-5 border-t" style={{ borderColor: 'var(--a-border)' }}>
            <p className="text-xs" style={{ color: 'var(--a-subtle)' }}>
              {proCount} Pro · {planCounts.free ?? 0} Free
            </p>
          </div>
        </div>

        {/* Recent signups */}
        <div className="lg:col-span-2 rounded-xl border overflow-hidden" style={{ backgroundColor: 'var(--a-surface)', borderColor: 'var(--a-border)' }}>
          <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--a-border)' }}>
            <p className="text-[10px] uppercase tracking-widest font-bold" style={{ color: 'var(--a-subtle)' }}>Recent Signups</p>
            <Link href="/admin/studios" className="text-[10px] uppercase tracking-widest font-bold transition-opacity hover:opacity-70"
              style={{ color: 'var(--a-accent)' }}>
              View All →
            </Link>
          </div>
          <div>
            {(recentStudios ?? []).map(studio => (
              <Link
                key={studio.id}
                href={`/admin/studios/${studio.id}`}
                className="admin-row flex items-center justify-between px-6 py-3.5 border-b last:border-b-0"
                style={{ borderColor: 'var(--a-divider)' }}>
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold uppercase"
                    style={{ backgroundColor: `${studio.accent_color || '#F0940A'}18`, color: studio.accent_color || '#F0940A' }}>
                    {studio.name?.[0] || '?'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--a-text)' }}>{studio.name}</p>
                    <p className="text-[11px] truncate" style={{ color: 'var(--a-subtle)' }}>{studio.slug}.photostudio.ng</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                  <PlanBadge plan={studio.plan} billing={studio.subscription_billing} />
                  <p className="text-[11px] hidden sm:block" style={{ color: 'var(--a-subtle)' }}>
                    {new Date(studio.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}
                  </p>
                </div>
              </Link>
            ))}
            {(!recentStudios || recentStudios.length === 0) && (
              <p className="px-6 py-12 text-sm text-center" style={{ color: 'var(--a-muted)' }}>No studios yet.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export function PlanBadge({ plan, billing }) {
  const isPro = plan === 'pro';
  const label = isPro
    ? billing === 'monthly' ? 'Pro Monthly'
    : billing === 'yearly'  ? 'Pro Yearly'
    : 'Pro'
    : 'Free';
  const style = isPro
    ? { backgroundColor: 'var(--a-amber-bg)', color: 'var(--a-amber)' }
    : { backgroundColor: 'var(--a-hover)',     color: 'var(--a-muted)' };
  return (
    <span className="text-[9px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-full"
      style={style}>
      {label}
    </span>
  );
}
