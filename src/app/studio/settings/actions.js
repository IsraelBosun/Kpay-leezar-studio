'use server';

import { createServerSupabase } from '@/lib/supabase';

export async function saveSettings(formData) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated.' };

  const { data: studio } = await supabase
    .from('studios')
    .select('id')
    .eq('owner_id', user.id)
    .single();
  if (!studio) return { error: 'Studio not found.' };

  const { error } = await supabase
    .from('studios')
    .update({
      name: formData.get('name'),
      location: formData.get('location'),
      phone: formData.get('phone'),
      email: formData.get('email'),
      bio: formData.get('bio'),
      accent_color: formData.get('accent_color'),
      instagram_url: formData.get('instagram_url') || null,
    })
    .eq('id', studio.id);

  if (error) return { error: error.message };
  return { success: true };
}
