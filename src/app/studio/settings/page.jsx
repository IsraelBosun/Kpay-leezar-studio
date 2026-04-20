import { createServerSupabase } from '@/lib/supabase';
import SettingsForm from './SettingsForm';

export default async function SettingsPage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: studio } = await supabase
    .from('studios')
    .select('*')
    .eq('owner_id', user.id)
    .single();

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <p className="text-xs uppercase tracking-[0.4em] text-primary font-bold mb-1">Studio</p>
        <h1 className="text-3xl md:text-4xl font-serif text-black">Settings</h1>
        <p className="text-sm text-neutral-gray italic mt-1">Manage your studio profile and branding.</p>
      </div>
      <SettingsForm studio={studio} />
    </div>
  );
}
