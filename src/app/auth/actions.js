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

  // Check slug is available
  const { data: existing } = await supabase
    .from('studios')
    .select('id')
    .eq('slug', slug)
    .single();

  if (existing) return { error: 'That studio name is already taken. Try a variation.' };

  const { error } = await supabase.from('studios').upsert({
    owner_id: user.id,
    name,
    slug,
    location,
    phone,
    email: user.email,
  }, { onConflict: 'owner_id' });

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
