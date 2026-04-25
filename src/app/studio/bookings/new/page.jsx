import { createServerSupabase } from '@/lib/supabase';
import { redirect } from 'next/navigation';
import NewBookingForm from './NewBookingForm';
import { isPro } from '@/lib/plan';

export default async function NewBookingPage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: studio } = await supabase
    .from('studios')
    .select('id, plan, created_at')
    .eq('owner_id', user.id)
    .single();

  if (!isPro(studio)) redirect('/studio/bookings');

  const { data: services } = await supabase
    .from('services')
    .select('id, title, price')
    .eq('studio_id', studio.id)
    .order('sort_order');

  return <NewBookingForm services={services ?? []} />;
}
