import { createServerSupabase } from '@/lib/supabase';
import StudioDetailsForm from './StudioDetailsForm';
import PlanSection from './PlanSection';
import PayoutsSection from './PayoutsSection';

export default async function SettingsPage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: studio } = await supabase
    .from('studios')
    .select('*')
    .eq('owner_id', user.id)
    .single();

  return (
    <div className="space-y-12 max-w-2xl">
      <div>
        <p className="text-xs uppercase tracking-[0.4em] text-primary font-bold mb-1">Studio</p>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif text-black">Settings</h1>
      </div>

      <Section title="Studio Details" description="Your studio profile and contact information.">
        <StudioDetailsForm studio={studio} />
      </Section>

      <Section title="Your Plan" description="Manage your subscription and billing.">
        <PlanSection studio={studio} />
      </Section>

      <Section title="Payouts" description="Your Nigerian bank account for receiving client payments via Paystack.">
        <PayoutsSection studio={studio} />
      </Section>
    </div>
  );
}

function Section({ title, description, children }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-sm font-bold text-black uppercase tracking-widest">{title}</h2>
        <p className="text-xs text-neutral-gray mt-1">{description}</p>
      </div>
      {children}
    </div>
  );
}
