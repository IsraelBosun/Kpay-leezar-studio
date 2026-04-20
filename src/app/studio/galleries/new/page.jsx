import { createServerSupabase } from '@/lib/supabase';
import NewGalleryForm from './NewGalleryForm';

export default async function NewGalleryPage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: studio } = await supabase
    .from('studios')
    .select('id')
    .eq('owner_id', user.id)
    .single();

  const { data: bookings } = await supabase
    .from('bookings')
    .select('id, client_name, session_date')
    .eq('studio_id', studio.id)
    .in('status', ['confirmed', 'completed', 'pending'])
    .order('session_date', { ascending: false });

  return <NewGalleryForm bookings={bookings ?? []} />;
}
