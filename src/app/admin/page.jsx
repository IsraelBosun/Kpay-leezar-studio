import { supabaseAdmin } from '@/lib/supabase';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

function StatCard({ label, value, sub, accent, href }) {
  const inner = (
    <div className={`bg-zinc-900/60 border border-white/8 rounded-xl p-6 hover:border-white/16 transition-all duration-300 group ${href ? 'cursor-pointer' : ''}`}>
      <p className="text-[10px] uppercase tracking-widest font-bold text-white/30 mb-4 group-hover:text-white/50 transition-colors">{label}</p>
      <p className="font-serif text-4xl text-white leading-none mb-2" style={{ color: accent }}>{value}</p>
      {sub && <p className="text-xs text-white/30">{sub}</p>}
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

function PlanBar({ plan, count, total, color }) {
  const pct = total ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <p className="text-xs text-white/40 w-16 capitalize">{plan}</p>
      <div className="flex-1 h-1.5 bg-white/8 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <p className="text-xs text-white/50 w-8 text-right">{count}</p>
    </div>
  );
}

export default async function AdminOverview() {
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

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
      .select('id, name, slug, plan, created_at, email, location')
      .order('created_at', { ascending: false })
      .limit(8),
  ]);

  const totalRevenue = payments?.reduce((sum, p) => sum + Number(p.amount), 0) ?? 0;

  const planCounts = (allStudios ?? []).reduce((acc, s) => {
    acc[s.plan] = (acc[s.plan] || 0) + 1;
    return acc;
  }, {});

  const planColors = {
    free: '#6b7280',
    starter: '#3b82f6',
    studio: '#8b5cf6',
    pro: '#f59e0b',
  };

  const PLAN_ORDER = ['free', 'starter', 'studio', 'pro'];

  return (
    <div className="space-y-10">

      {/* Header */}
      <div>
        <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-violet-400 mb-2">Platform Control</p>
        <h1 className="font-serif text-4xl md:text-5xl text-white">Overview</h1>
        <p className="text-white/30 text-sm mt-2">Everything happening on photostudio.ng — right now.</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          label="Total Studios"
          value={totalStudios ?? 0}
          sub={`+${newThisWeek ?? 0} this week`}
          href="/admin/studios"
        />
        <StatCard
          label="Platform Revenue"
          value={`₦${totalRevenue.toLocaleString()}`}
          sub="All paid payments"
          accent="#10b981"
          href="/admin/revenue"
        />
        <StatCard
          label="Total Bookings"
          value={totalBookings ?? 0}
          sub="Across all studios"
        />
        <StatCard
          label="Galleries Created"
          value={totalGalleries ?? 0}
          sub="Client galleries"
        />
        <StatCard
          label="New This Week"
          value={newThisWeek ?? 0}
          sub="Studio signups"
          accent="#818cf8"
        />
        <StatCard
          label="Avg Revenue / Studio"
          value={totalStudios ? `₦${Math.round(totalRevenue / totalStudios).toLocaleString()}` : '₦0'}
          sub="Lifetime average"
          accent="#f59e0b"
        />
      </div>

      {/* Plans breakdown + Recent signups */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Plans */}
        <div className="bg-zinc-900/60 border border-white/8 rounded-xl p-6">
          <p className="text-[10px] uppercase tracking-widest font-bold text-white/30 mb-6">Plans Breakdown</p>
          <div className="space-y-4">
            {PLAN_ORDER.map(plan => (
              <PlanBar
                key={plan}
                plan={plan}
                count={planCounts[plan] ?? 0}
                total={totalStudios ?? 1}
                color={planColors[plan]}
              />
            ))}
          </div>
          <div className="mt-6 pt-5 border-t border-white/8">
            <p className="text-xs text-white/20">
              {Math.round(((planCounts.free ?? 0) / (totalStudios || 1)) * 100)}% on free plan
            </p>
          </div>
        </div>

        {/* Recent signups */}
        <div className="lg:col-span-2 bg-zinc-900/60 border border-white/8 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/8 flex items-center justify-between">
            <p className="text-[10px] uppercase tracking-widest font-bold text-white/30">Recent Signups</p>
            <Link href="/admin/studios" className="text-[10px] uppercase tracking-widest font-bold text-violet-400 hover:text-violet-300 transition-colors">
              View All →
            </Link>
          </div>
          <div className="divide-y divide-white/5">
            {(recentStudios ?? []).map(studio => (
              <Link
                key={studio.id}
                href={`/admin/studios/${studio.id}`}
                className="flex items-center justify-between px-6 py-3.5 hover:bg-white/3 transition-colors group">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-white/8 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-white/40 uppercase">{studio.name?.[0] || '?'}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate group-hover:text-violet-300 transition-colors">{studio.name}</p>
                    <p className="text-[11px] text-white/30 truncate">{studio.slug}.photostudio.ng</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                  <PlanBadge plan={studio.plan} />
                  <p className="text-[11px] text-white/25 hidden sm:block">
                    {new Date(studio.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}
                  </p>
                </div>
              </Link>
            ))}
            {(!recentStudios || recentStudios.length === 0) && (
              <p className="px-6 py-10 text-sm text-white/20 text-center">No studios yet.</p>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}

function PlanBadge({ plan }) {
  const styles = {
    free:    'bg-zinc-700/50 text-zinc-400',
    starter: 'bg-blue-500/15 text-blue-400',
    studio:  'bg-violet-500/15 text-violet-400',
    pro:     'bg-amber-500/15 text-amber-400',
  };
  return (
    <span className={`text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full ${styles[plan] ?? styles.free}`}>
      {plan}
    </span>
  );
}
