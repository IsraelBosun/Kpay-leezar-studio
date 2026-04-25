'use server';

import { createServerSupabase } from '@/lib/supabase';

// Sample photos — different aspect ratios to mimic real photographer work
const SAMPLE_PHOTOS = [
  { seed: 'bride-veil',      w: 800,  h: 1100, category: 'Weddings' },    // portrait 8:11
  { seed: 'wedding-dance',   w: 1200, h: 800,  category: 'Weddings' },    // landscape 3:2
  { seed: 'woman-window',    w: 720,  h: 1080, category: 'Portraits' },   // portrait 2:3
  { seed: 'man-studio',      w: 1000, h: 1000, category: 'Portraits' },   // square
  { seed: 'event-crowd',     w: 1440, h: 810,  category: 'Events' },      // cinematic 16:9
  { seed: 'rooftop-party',   w: 900,  h: 1200, category: 'Events' },      // portrait 3:4
  { seed: 'product-shoot',   w: 1200, h: 900,  category: 'Commercial' },  // landscape 4:3
  { seed: 'fashion-model',   w: 800,  h: 1280, category: 'Commercial' },  // tall 5:8
];

export async function loadSamplePhotos() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated.' };

  const { data: studio } = await supabase
    .from('studios')
    .select('id')
    .eq('owner_id', user.id)
    .single();
  if (!studio) return { error: 'Studio not found.' };

  const { data: last } = await supabase
    .from('portfolio_photos')
    .select('sort_order')
    .eq('studio_id', studio.id)
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle();

  let sort_order = (last?.sort_order ?? -1) + 1;

  const inserts = SAMPLE_PHOTOS.map(s => {
    const src = `https://picsum.photos/seed/${s.seed}/${s.w}/${s.h}`;
    const thumbnail_url = `https://picsum.photos/seed/${s.seed}/600/${Math.round(600 * s.h / s.w)}`;
    return { studio_id: studio.id, src, thumbnail_url, category: s.category, sort_order: sort_order++ };
  });

  const { data: photos, error } = await supabase
    .from('portfolio_photos')
    .insert(inserts)
    .select();

  if (error) return { error: error.message };
  return { photos };
}

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
