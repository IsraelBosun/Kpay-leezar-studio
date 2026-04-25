import { createServerSupabase } from '@/lib/supabase';
import Badge from '@/components/ui/Badge';

export default async function PaymentsPage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: studio } = await supabase
    .from('studios')
    .select('id')
    .eq('owner_id', user.id)
    .single();

  const { data: payments } = await supabase
    .from('payments')
    .select('*, bookings(client_name, client_email)')
    .eq('studio_id', studio.id)
    .order('created_at', { ascending: false });

  const collected = payments?.filter(p => p.status === 'paid').reduce((s, p) => s + Number(p.amount), 0) ?? 0;
  const pending   = payments?.filter(p => p.status === 'pending').reduce((s, p) => s + Number(p.amount), 0) ?? 0;
  const failed    = payments?.filter(p => p.status === 'failed').length ?? 0;

  const statusVariant = { paid: 'success', pending: 'warning', failed: 'danger' };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <p className="text-xs uppercase tracking-[0.4em] text-primary font-bold mb-1">Studio</p>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif text-black">Payments</h1>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white border border-gray-100 p-3 sm:p-6">
          <p className="text-[9px] sm:text-[10px] uppercase tracking-widest font-bold text-neutral-gray mb-1 sm:mb-2">Collected</p>
          <p className="text-base sm:text-2xl font-serif text-green-600 truncate">₦{collected.toLocaleString()}</p>
        </div>
        <div className="bg-white border border-gray-100 p-3 sm:p-6">
          <p className="text-[9px] sm:text-[10px] uppercase tracking-widest font-bold text-neutral-gray mb-1 sm:mb-2">Pending</p>
          <p className="text-base sm:text-2xl font-serif text-amber-600 truncate">₦{pending.toLocaleString()}</p>
        </div>
        <div className="bg-white border border-gray-100 p-3 sm:p-6">
          <p className="text-[9px] sm:text-[10px] uppercase tracking-widest font-bold text-neutral-gray mb-1 sm:mb-2">Failed</p>
          <p className="text-base sm:text-2xl font-serif text-red-500">{failed}</p>
        </div>
      </div>

      {/* Transactions */}
      {!payments || payments.length === 0 ? (
        <div className="bg-white border border-gray-100 px-4 sm:px-8 py-12 sm:py-16 text-center">
          <p className="font-serif text-2xl text-black mb-2">No payments yet</p>
          <p className="text-sm text-neutral-gray italic">Payments will appear here once clients pay via Paystack.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 overflow-hidden">
          {/* Desktop header */}
          <div className="hidden md:grid grid-cols-5 px-6 py-3 bg-gray-50 border-b border-gray-100">
            {['Client', 'Type', 'Amount', 'Status', 'Date'].map((h) => (
              <p key={h} className="text-[10px] uppercase tracking-widest font-bold text-neutral-gray">{h}</p>
            ))}
          </div>

          {payments.map((p, i) => (
            <div key={p.id} className={i < payments.length - 1 ? 'border-b border-gray-50' : ''}>
              {/* Mobile card */}
              <div className="md:hidden px-4 py-4 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-black truncate">{p.bookings?.client_name ?? '—'}</p>
                    <p className="text-xs text-neutral-gray truncate">{p.bookings?.client_email ?? ''}</p>
                  </div>
                  <Badge variant={statusVariant[p.status] ?? 'default'}>{p.status}</Badge>
                </div>
                <div className="flex items-center justify-between text-xs text-neutral-gray">
                  <span className="capitalize">{p.type}</span>
                  <span className="font-medium text-black">₦{Number(p.amount).toLocaleString()}</span>
                  <span>
                    {p.paid_at
                      ? new Date(p.paid_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })
                      : new Date(p.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>

              {/* Desktop row */}
              <div className="hidden md:grid grid-cols-5 px-6 py-4 gap-2 items-center">
                <div>
                  <p className="text-sm font-medium text-black">{p.bookings?.client_name ?? '—'}</p>
                  <p className="text-xs text-neutral-gray truncate">{p.bookings?.client_email ?? ''}</p>
                </div>
                <p className="text-sm text-neutral-gray capitalize">{p.type}</p>
                <p className="text-sm font-medium text-black">₦{Number(p.amount).toLocaleString()}</p>
                <Badge variant={statusVariant[p.status] ?? 'default'}>{p.status}</Badge>
                <p className="text-sm text-neutral-gray">
                  {p.paid_at
                    ? new Date(p.paid_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })
                    : new Date(p.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
