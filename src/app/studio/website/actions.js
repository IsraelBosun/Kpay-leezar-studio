'use server';

import { createServerSupabase } from '@/lib/supabase';

export async function saveWebsiteConfig(config) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated.' };

  const { error } = await supabase
    .from('studios')
    .update({ website_config: config })
    .eq('owner_id', user.id);

  if (error) return { error: error.message };
  return { success: true };
}

export async function savePhotoCategories(updates) {
  // updates: [{ id, category }]
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated.' };

  const { data: studio } = await supabase
    .from('studios')
    .select('id')
    .eq('owner_id', user.id)
    .single();
  if (!studio) return { error: 'Studio not found.' };

  const results = await Promise.all(
    updates.map(({ id, category }) =>
      supabase
        .from('portfolio_photos')
        .update({ category })
        .eq('id', id)
        .eq('studio_id', studio.id)
    )
  );

  const failed = results.find(r => r.error);
  if (failed) return { error: failed.error.message };
  return { success: true };
}
