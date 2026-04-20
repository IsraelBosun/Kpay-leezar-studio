'use server';

import { createServerSupabase } from '@/lib/supabase';
import { redirect } from 'next/navigation';

// ── Sign Up ──────────────────────────────────────────────
export async function signUp(formData) {
  const supabase = await createServerSupabase();

  const email = formData.get('email');
  const password = formData.get('password');
  const studioName = formData.get('studioName');

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { studio_name: studioName },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  });

  if (error) return { error: error.message };
  if (!data.user) return { error: 'Signup failed. Please try again.' };

  redirect('/auth/onboarding');
}

// ── Sign In ──────────────────────────────────────────────
export async function signIn(formData) {
  const supabase = await createServerSupabase();

  const email = formData.get('email');
  const password = formData.get('password');

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return { error: error.message };

  redirect('/studio/dashboard');
}

// ── Sign Out ─────────────────────────────────────────────
export async function signOut() {
  const supabase = await createServerSupabase();
  await supabase.auth.signOut();
  redirect('/auth/login');
}

// ── Save onboarding step 1 — Studio basics ───────────────
export async function saveStudioBasics(formData) {
  const supabase = await createServerSupabase();

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return { error: 'Not authenticated.' };

  const name = formData.get('name');
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const location = formData.get('location');
  const phone = formData.get('phone');
  const logo_url = formData.get('logo_url') || null;

  // Check if this user already has a studio
  const { data: myStudio } = await supabase
    .from('studios')
    .select('id, slug')
    .eq('owner_id', user.id)
    .single();

  // Check slug availability (ignore own studio's current slug)
  const { data: slugTaken } = await supabase
    .from('studios')
    .select('id')
    .eq('slug', slug)
    .neq('owner_id', user.id)
    .maybeSingle();

  if (slugTaken) return { error: 'That studio name is already taken. Try a variation.' };

  let error;
  const studioData = { name, slug, location, phone, email: user.email, ...(logo_url && { logo_url }) };

  if (myStudio) {
    ({ error } = await supabase.from('studios').update(studioData).eq('id', myStudio.id));
  } else {
    ({ error } = await supabase.from('studios').insert({ owner_id: user.id, ...studioData }));
  }

  if (error) return { error: error.message };
  return { success: true, slug };
}

// ── Save onboarding step 2 — Bio ─────────────────────────
export async function saveStudioBio(formData) {
  const supabase = await createServerSupabase();

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return { error: 'Not authenticated.' };

  const bio = formData.get('bio');
  const accentColor = formData.get('accentColor') || '#D30E15';

  const { error } = await supabase
    .from('studios')
    .update({ bio, accent_color: accentColor })
    .eq('owner_id', user.id);

  if (error) return { error: error.message };
  return { success: true };
}

// ── Save onboarding step 3 — Services ────────────────────
export async function saveStudioServices(services) {
  const supabase = await createServerSupabase();

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return { error: 'Not authenticated.' };

  const { data: studio } = await supabase
    .from('studios')
    .select('id')
    .eq('owner_id', user.id)
    .single();

  if (!studio) return { error: 'Studio not found.' };

  // Delete existing services and reinsert
  await supabase.from('services').delete().eq('studio_id', studio.id);

  const rows = services.map((s, i) => ({
    studio_id: studio.id,
    title: s.title,
    description: s.description,
    price: parseFloat(s.price) || 0,
    sort_order: i,
  }));

  const { error } = await supabase.from('services').insert(rows);
  if (error) return { error: error.message };

  redirect('/studio/dashboard');
}

// ── Save portfolio photos ─────────────────────────────────
export async function savePortfolioPhotos(photos) {
  const supabase = await createServerSupabase();

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return { error: 'Not authenticated.' };

  const { data: studio } = await supabase
    .from('studios')
    .select('id')
    .eq('owner_id', user.id)
    .single();

  if (!studio) return { error: 'Studio not found.' };

  await supabase.from('portfolio_photos').delete().eq('studio_id', studio.id);

  const rows = photos.map((p, i) => ({
    studio_id: studio.id,
    src: p.src,
    thumbnail_url: p.src,
    category: p.category,
    sort_order: i,
  }));

  const { error } = await supabase.from('portfolio_photos').insert(rows);
  if (error) return { error: error.message };
  return { success: true };
}
