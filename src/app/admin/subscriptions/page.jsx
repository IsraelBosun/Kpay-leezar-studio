import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export default async function AdminSubscriptionsPage() {
  const [
    { data: payments },
    { data: proStudios },
  ] = await Promise.all([
    supabaseAdmin
      .from('subscription_payments')
      .select('*, studios(name, slug, accent_color)')
      .order('paid_at', { ascending: false }),
    supabaseAdmin
      .from('studios')
      .select('id, subscription_billing, subscription_status')
      .eq('plan', 'pro')
      .eq('subscription_status', 'active'),
  ]);

  const rows = payments ?? [];
  const totalRevenue = rows.reduce((s, p) => s + Number(p.amount), 0);
  const monthlyRevenue = rows.filter(p => p.billing === 'monthly').reduce((s, p) => s + Number(p.amount), 0);
  const yearlyRevenue  = rows.filter(p => p.billing === 'yearly').reduce((s, p) => s + Number(p.amount), 0);

  const activeStudios   = proStudios ?? [];
  const monthlyCount = activeStudios.filter(s => s.subscription_billing === 'monthly').length;
  const yearlyCount  = activeStudios.filter(s => s.subscription_billing === 'yearly').length;
  const mrr = (monthlyCount * 10000) + (yearlyCount * Math.round(100000 / 12));

  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <p className="text-[10px] uppercase tracking-[0.4em] font-bold mb-2" style={{ color: 'var(--a-accent)' }}>
          Platform Control
        </p>
        <h1 className="font-serif text-4xl md:text-5xl" style={{ color: 'var(--a-text)' }}>Subscriptions</h1>
        <p className="text-sm mt-1.5" style={{ color: 'var(--a-muted)' }}>Your platform revenue from Pro studio subscriptions.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Earned',      value: `₦${totalRevenue.toLocaleString()}`,   accent: 'var(--a-green)' },
          { label: 'MRR (Est.)',        value: `₦${mrr.toLocaleString()}`,             accent: 'var(--a-accent)' },
          { label: 'Monthly Plans',     value: monthlyCount, sub: `₦${monthlyRevenue.toLocaleString()} collected` },
          { label: 'Yearly Plans',      value: yearlyCount,  sub: `₦${yearlyRevenue.toLocaleString()} collected` },
        ].map(s => (
          <div key={s.label} className="rounded-xl border p-6" style={{ backgroundColor: 'var(--a-surface)', borderColor: 'var(--a-border)' }}>
            <p className="text-[10px] uppercase tracking-widest font-bold mb-3" style={{ color: 'var(--a-subtle)' }}>{s.label}</p>
            <p className="font-serif text-3xl leading-none" style={{ color: s.accent || 'var(--a-text)' }}>{s.value}</p>
            {s.sub && <p className="text-xs mt-2" style={{ color: 'var(--a-subtle)' }}>{s.sub}</p>}
          </div>
        ))}
      </div>

      {/* Active breakdown */}
      <div className="rounded-xl border p-6" style={{ backgroundColor: 'var(--a-surface)', borderColor: 'var(--a-border)' }}>
        <p className="text-[10px] uppercase tracking-widest font-bold mb-4" style={{ color: 'var(--a-subtle)' }}>
          Active Pro Studios — {activeStudios.length} total
        </p>
        <div className="flex flex-wrap gap-6 text-sm" style={{ color: 'var(--a-muted)' }}>
          <span><span className="font-bold" style={{ color: 'var(--a-text)' }}>{monthlyCount}</span> on Monthly · ₦10,000/mo each</span>
          <span><span className="font-bold" style={{ color: 'var(--a-text)' }}>{yearlyCount}</span> on Yearly · ₦100,000/yr each</span>
          <span style={{ color: 'var(--a-subtle)' }}>MRR est. based on active subscriptions</span>
        </div>
      </div>

      {/* Transaction log */}
      <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: 'var(--a-surface)', borderColor: 'var(--a-border)' }}>
        <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--a-border)', backgroundColor: 'var(--a-hover)' }}>
          <p className="text-[10px] uppercase tracking-widest font-bold" style={{ color: 'var(--a-subtle)' }}>Payment History</p>
        </div>

        <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 px-6 py-3 border-b"
          style={{ borderColor: 'var(--a-border)' }}>
          {['Studio', 'Plan', 'Amount', 'Date'].map(h => (
            <p key={h} className="text-[10px] uppercase tracking-widest font-bold" style={{ color: 'var(--a-subtle)' }}>{h}</p>
          ))}
        </div>

        <div>
          {rows.map(p => (
            <div key={p.id}
              className="admin-row grid grid-cols-2 md:grid-cols-[2fr_1fr_1fr_1fr] gap-4 px-6 py-4 items-center border-b last:border-b-0"
              style={{ borderColor: 'var(--a-divider)' }}>

              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold uppercase flex-shrink-0"
                  style={{ backgroundColor: `${p.studios?.accent_color || '#F0940A'}18`, color: p.studios?.accent_color || '#F0940A' }}>
                  {p.studios?.name?.[0] || '?'}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: 'var(--a-text)' }}>{p.studios?.name ?? '—'}</p>
                  <p className="text-[11px] truncate" style={{ color: 'var(--a-subtle)' }}>{p.studios?.slug}.photostudio.ng</p>
                </div>
              </div>

              <span className="text-[9px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-full w-fit"
                style={{
                  backgroundColor: p.billing === 'yearly' ? 'var(--a-accent-bg)' : 'var(--a-hover)',
                  color:           p.billing === 'yearly' ? 'var(--a-accent-text)' : 'var(--a-muted)',
                }}>
                {p.billing === 'yearly' ? 'Yearly' : 'Monthly'}
              </span>

              <p className="text-sm font-semibold" style={{ color: 'var(--a-green)' }}>
                ₦{Number(p.amount).toLocaleString()}
              </p>

              <p className="text-sm hidden md:block" style={{ color: 'var(--a-muted)' }}>
                {p.paid_at
                  ? new Date(p.paid_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })
                  : '—'}
              </p>
            </div>
          ))}

          {rows.length === 0 && (
            <div className="px-6 py-20 text-center">
              <p className="font-serif text-2xl mb-2" style={{ color: 'var(--a-muted)' }}>No subscription payments yet</p>
              <p className="text-sm" style={{ color: 'var(--a-subtle)' }}>
                Payments appear here after studios upgrade to Pro. Run the DB migration first if you just set this up.
              </p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
