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

export async function saveStudioContent({ bio, email, phone, instagram_url, accent_color }) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated.' };

  const { error } = await supabase
    .from('studios')
    .update({ bio, email, phone, instagram_url: instagram_url || null, accent_color })
    .eq('owner_id', user.id);

  if (error) return { error: error.message };
  return { success: true };
}

export async function saveServices({ toUpsert, toDelete }) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated.' };

  const { data: studio } = await supabase
    .from('studios')
    .select('id')
    .eq('owner_id', user.id)
    .single();
  if (!studio) return { error: 'Studio not found.' };

  if (toDelete.length) {
    const { error } = await supabase.from('services').delete().in('id', toDelete).eq('studio_id', studio.id);
    if (error) return { error: error.message };
  }

  const existing = toUpsert.filter(s => s.id);
  for (const s of existing) {
    const { error } = await supabase.from('services').update({
      title: s.title,
      description: s.description || null,
      price: s.price !== '' ? Number(s.price) : null,
    }).eq('id', s.id).eq('studio_id', studio.id);
    if (error) return { error: error.message };
  }

  const newOnes = toUpsert.filter(s => !s.id);
  let inserted = [];
  if (newOnes.length) {
    const { data, error } = await supabase.from('services').insert(
      newOnes.map(s => ({
        studio_id: studio.id,
        title: s.title,
        description: s.description || null,
        price: s.price !== '' ? Number(s.price) : null,
      }))
    ).select();
    if (error) return { error: error.message };
    inserted = data ?? [];
  }

  return { success: true, inserted };
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
