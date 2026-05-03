import { createServerSupabase } from '@/lib/supabase';
import Link from 'next/link';
import PaymentsClient from './PaymentsClient';

export default async function PaymentsPage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: studio } = await supabase
    .from('studios')
    .select('id, name, accent_color, paystack_subaccount_code')
    .eq('owner_id', user.id)
    .single();

  const { data: payments } = await supabase
    .from('payments')
    .select('*, bookings(client_name, client_email)')
    .eq('studio_id', studio.id)
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.4em] text-primary font-bold mb-1">Studio</p>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif text-black">Payments</h1>
      </div>

      {!payments || payments.length === 0 ? (
        <div className="bg-white border border-gray-100 px-4 sm:px-8 py-12 sm:py-16 text-center">
          <p className="font-serif text-2xl text-black mb-2">No payments yet</p>
          {studio.paystack_subaccount_code ? (
            <p className="text-sm text-neutral-gray italic max-w-sm mx-auto">
              When a client pays a deposit or balance through your booking link, it appears here. Funds settle to your bank account the next business day.
            </p>
          ) : (
            <>
              <p className="text-sm text-neutral-gray italic mb-6 max-w-sm mx-auto">
                Connect your bank account first so clients can pay you directly via Paystack. You don&apos;t need a Paystack account — just your bank details.
              </p>
              <Link href="/studio/settings" className="inline-block bg-primary text-white px-8 py-3 text-xs uppercase tracking-widest font-bold hover:bg-black transition-colors">
                Set Up Bank Account
              </Link>
            </>
          )}
        </div>
      ) : (
        <PaymentsClient payments={payments} studio={studio} />
      )}
    </div>
  );
}
