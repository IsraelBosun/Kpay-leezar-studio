import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export default async function AdminRevenuePage() {
  const { data: payments } = await supabaseAdmin
    .from('payments')
    .select('*, bookings(client_name, client_email), studios(name, slug)')
    .order('created_at', { ascending: false });

  const paid = (payments ?? []).filter(p => p.status === 'paid');
  const totalRevenue   = paid.reduce((s, p) => s + Number(p.amount), 0);
  const depositRevenue = paid.filter(p => p.type === 'deposit').reduce((s, p) => s + Number(p.amount), 0);
  const balanceRevenue = paid.filter(p => p.type === 'balance').reduce((s, p) => s + Number(p.amount), 0);

  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <p className="text-[10px] uppercase tracking-[0.4em] font-bold mb-2" style={{ color: 'var(--a-accent)' }}>
          Platform Control
        </p>
        <h1 className="font-serif text-4xl md:text-5xl" style={{ color: 'var(--a-text)' }}>Revenue</h1>
        <p className="text-sm mt-1.5" style={{ color: 'var(--a-muted)' }}>All Paystack transactions across every studio.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Collected', value: `₦${totalRevenue.toLocaleString()}`,   accent: 'var(--a-green)' },
          { label: 'Deposits',        value: `₦${depositRevenue.toLocaleString()}` },
          { label: 'Balances',        value: `₦${balanceRevenue.toLocaleString()}` },
        ].map(s => (
          <div key={s.label} className="rounded-xl border p-6" style={{ backgroundColor: 'var(--a-surface)', borderColor: 'var(--a-border)' }}>
            <p className="text-[10px] uppercase tracking-widest font-bold mb-3" style={{ color: 'var(--a-subtle)' }}>{s.label}</p>
            <p className="font-serif text-4xl" style={{ color: s.accent || 'var(--a-text)' }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: 'var(--a-surface)', borderColor: 'var(--a-border)' }}>

        <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 px-6 py-3 border-b"
          style={{ borderColor: 'var(--a-border)', backgroundColor: 'var(--a-hover)' }}>
          {['Client', 'Studio', 'Amount', 'Type', 'Status'].map(h => (
            <p key={h} className="text-[10px] uppercase tracking-widest font-bold" style={{ color: 'var(--a-subtle)' }}>{h}</p>
          ))}
        </div>

        <div>
          {(payments ?? []).map(p => (
            <div key={p.id}
              className="grid grid-cols-2 md:grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 px-6 py-4 items-center border-b last:border-b-0 transition-colors"
              style={{ borderColor: 'var(--a-divider)' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--a-hover)'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = ''}>
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: 'var(--a-text)' }}>
                  {p.bookings?.client_name ?? '—'}
                </p>
                <p className="text-[11px] truncate" style={{ color: 'var(--a-subtle)' }}>{p.bookings?.client_email ?? ''}</p>
              </div>
              <p className="text-sm truncate" style={{ color: 'var(--a-muted)' }}>{p.studios?.name ?? '—'}</p>
              <p className="text-sm font-semibold" style={{ color: 'var(--a-text)' }}>₦{Number(p.amount).toLocaleString()}</p>
              <p className="text-[11px] uppercase tracking-widest hidden md:block capitalize" style={{ color: 'var(--a-muted)' }}>{p.type}</p>
              <span className="text-[9px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-full w-fit"
                style={{
                  backgroundColor: p.status === 'paid' ? 'var(--a-green-bg)' : 'var(--a-amber-bg)',
                  color:           p.status === 'paid' ? 'var(--a-green)'    : 'var(--a-amber)',
                }}>
                {p.status}
              </span>
            </div>
          ))}

          {(!payments || payments.length === 0) && (
            <p className="px-6 py-16 text-sm text-center" style={{ color: 'var(--a-muted)' }}>No payments yet.</p>
          )}
        </div>
      </div>

    </div>
  );
}
