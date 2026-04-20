import { createServerSupabase } from '@/lib/supabase';
import NewBookingForm from './NewBookingForm';

export default async function NewBookingPage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: studio } = await supabase
    .from('studios')
    .select('id')
    .eq('owner_id', user.id)
    .single();

  const { data: services } = await supabase
    .from('services')
    .select('id, title, price')
    .eq('studio_id', studio.id)
    .order('sort_order');

  return <NewBookingForm services={services ?? []} />;
}
