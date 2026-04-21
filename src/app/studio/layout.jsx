import { redirect } from 'next/navigation';
import { createServerSupabase } from '@/lib/supabase';
import Sidebar from '@/components/studio/Sidebar';
import StudioPageFade from '@/components/studio/StudioPageFade';

export default async function StudioLayout({ children }) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/auth/login');

  // Fetch studio for this user
  const { data: studio } = await supabase
    .from('studios')
    .select('id, name, slug, plan')
    .eq('owner_id', user.id)
    .single();

  // No studio yet — send to onboarding
  if (!studio) redirect('/auth/onboarding');

  return (
    <div className="min-h-screen flex bg-[#f9f8f6]">
      <Sidebar studio={studio} />
      <main className="flex-1 min-w-0 lg:ml-64 pt-16 lg:pt-0">
        <div className="p-6 md:p-10 max-w-6xl mx-auto">
          <StudioPageFade>{children}</StudioPageFade>
        </div>
      </main>
    </div>
  );
}
