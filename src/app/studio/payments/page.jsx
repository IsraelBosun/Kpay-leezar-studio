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
  const pending = payments?.filter(p => p.status === 'pending').reduce((s, p) => s + Number(p.amount), 0) ?? 0;
  const failed = payments?.filter(p => p.status === 'failed').length ?? 0;

  const statusVariant = { paid: 'success', pending: 'warning', failed: 'danger' };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <p className="text-xs uppercase tracking-[0.4em] text-primary font-bold mb-1">Studio</p>
        <h1 className="text-3xl md:text-4xl font-serif text-black">Payments</h1>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-gray-100 p-6">
          <p className="text-[10px] uppercase tracking-widest font-bold text-neutral-gray mb-2">Collected</p>
          <p className="text-2xl font-serif text-green-600">₦{collected.toLocaleString()}</p>
        </div>
        <div className="bg-white border border-gray-100 p-6">
          <p className="text-[10px] uppercase tracking-widest font-bold text-neutral-gray mb-2">Pending</p>
          <p className="text-2xl font-serif text-amber-600">₦{pending.toLocaleString()}</p>
        </div>
        <div className="bg-white border border-gray-100 p-6">
          <p className="text-[10px] uppercase tracking-widest font-bold text-neutral-gray mb-2">Failed</p>
          <p className="text-2xl font-serif text-red-500">{failed}</p>
        </div>
      </div>

      {/* Transactions */}
      {!payments || payments.length === 0 ? (
        <div className="bg-white border border-gray-100 px-8 py-16 text-center">
          <p className="font-serif text-2xl text-black mb-2">No payments yet</p>
          <p className="text-sm text-neutral-gray italic">Payments will appear here once clients pay via Paystack.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 overflow-hidden">
          <div className="hidden md:grid grid-cols-5 px-6 py-3 bg-gray-50 border-b border-gray-100">
            {['Client', 'Type', 'Amount', 'Status', 'Date'].map((h) => (
              <p key={h} className="text-[10px] uppercase tracking-widest font-bold text-neutral-gray">{h}</p>
            ))}
          </div>

          {payments.map((p, i) => (
            <div
              key={p.id}
              className={`grid grid-cols-2 md:grid-cols-5 px-6 py-4 gap-2 ${i < payments.length - 1 ? 'border-b border-gray-50' : ''}`}
            >
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
          ))}
        </div>
      )}
    </div>
  );
}
