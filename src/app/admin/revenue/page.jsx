import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

const STATUS_STYLES = {
  paid:    'bg-green-500/15 text-green-400',
  pending: 'bg-amber-500/15 text-amber-400',
  failed:  'bg-red-500/15 text-red-400',
};

export default async function AdminRevenuePage() {
  const { data: payments } = await supabaseAdmin
    .from('payments')
    .select('*, bookings(client_name, client_email), studios(name, slug)')
    .order('created_at', { ascending: false });

  const paid = (payments ?? []).filter(p => p.status === 'paid');
  const totalRevenue = paid.reduce((sum, p) => sum + Number(p.amount), 0);
  const depositRevenue = paid.filter(p => p.type === 'deposit').reduce((sum, p) => sum + Number(p.amount), 0);
  const balanceRevenue = paid.filter(p => p.type === 'balance').reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-violet-400 mb-2">Platform Control</p>
        <h1 className="font-serif text-4xl md:text-5xl text-white">Revenue</h1>
        <p className="text-white/30 text-sm mt-2">All Paystack transactions across every studio.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Collected', value: `₦${totalRevenue.toLocaleString()}`, accent: '#10b981' },
          { label: 'Deposits', value: `₦${depositRevenue.toLocaleString()}` },
          { label: 'Balances', value: `₦${balanceRevenue.toLocaleString()}` },
        ].map(s => (
          <div key={s.label} className="bg-zinc-900/60 border border-white/8 rounded-xl p-6">
            <p className="text-[10px] uppercase tracking-widest font-bold text-white/25 mb-3">{s.label}</p>
            <p className="font-serif text-4xl text-white" style={s.accent ? { color: s.accent } : {}}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Payments table */}
      <div className="bg-zinc-900/60 border border-white/8 rounded-xl overflow-hidden">
        <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 px-6 py-3 border-b border-white/8 bg-white/3">
          {['Client', 'Studio', 'Amount', 'Type', 'Status'].map(h => (
            <p key={h} className="text-[10px] uppercase tracking-widest font-bold text-white/25">{h}</p>
          ))}
        </div>

        <div className="divide-y divide-white/5">
          {(payments ?? []).map(p => (
            <div key={p.id} className="grid grid-cols-2 md:grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 px-6 py-4 items-center">
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">{p.bookings?.client_name ?? '—'}</p>
                <p className="text-[11px] text-white/30 truncate">{p.bookings?.client_email ?? ''}</p>
              </div>
              <p className="text-sm text-white/50 truncate">{p.studios?.name ?? '—'}</p>
              <p className="text-sm font-medium text-white">₦{Number(p.amount).toLocaleString()}</p>
              <p className="text-[11px] uppercase tracking-widest text-white/40 hidden md:block capitalize">{p.type}</p>
              <span className={`text-[9px] uppercase tracking-widest font-bold px-2 py-1 rounded-full w-fit ${STATUS_STYLES[p.status] ?? 'bg-zinc-700/50 text-zinc-400'}`}>
                {p.status}
              </span>
            </div>
          ))}

          {(!payments || payments.length === 0) && (
            <p className="px-6 py-16 text-sm text-white/20 text-center">No payments yet.</p>
          )}
        </div>
      </div>

    </div>
  );
}
