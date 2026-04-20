'use server';

import { createServerSupabase } from '@/lib/supabase';
import { deleteFromR2 } from '@/lib/r2';
import { redirect } from 'next/navigation';

export async function createGallery(formData) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated.' };

  const { data: studio } = await supabase
    .from('studios')
    .select('id, plan')
    .eq('owner_id', user.id)
    .single();
  if (!studio) return { error: 'Studio not found.' };

  // Free plan: max 1 gallery
  if (studio.plan === 'free') {
    const { count } = await supabase
      .from('galleries')
      .select('*', { count: 'exact', head: true })
      .eq('studio_id', studio.id);
    if (count >= 1) return { error: 'Free plan allows 1 gallery. Upgrade to create more.' };
  }

  const title = formData.get('title');
  const bookingId = formData.get('booking_id') || null;
  const password = formData.get('password') || null;

  // Generate slug from title
  const base = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const suffix = Math.random().toString(36).slice(2, 6);
  const slug = `${base}-${suffix}`;

  const { data: gallery, error } = await supabase
    .from('galleries')
    .insert({
      studio_id: studio.id,
      booking_id: bookingId,
      title,
      slug,
      password_hash: password,
      is_locked: true,
    })
    .select()
    .single();

  if (error) return { error: error.message };
  redirect(`/studio/galleries/${gallery.id}`);
}

export async function toggleGalleryLock(galleryId, locked) {
  const supabase = await createServerSupabase();
  const { error } = await supabase
    .from('galleries')
    .update({ is_locked: locked })
    .eq('id', galleryId);
  if (error) return { error: error.message };
  return { success: true };
}

export async function deletePhoto(photoId) {
  const supabase = await createServerSupabase();
  const { data: photo } = await supabase
    .from('photos')
    .select('original_url, thumbnail_url, gallery_id, studio_id')
    .eq('id', photoId)
    .single();

  if (!photo) return { error: 'Photo not found.' };

  // Extract R2 keys from URLs and delete
  const publicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL;
  if (publicUrl) {
    const toKey = (url) => url?.replace(`${publicUrl}/`, '');
    await Promise.allSettled([
      deleteFromR2(toKey(photo.original_url)),
      photo.thumbnail_url !== photo.original_url ? deleteFromR2(toKey(photo.thumbnail_url)) : Promise.resolve(),
    ]);
  }

  const { error } = await supabase.from('photos').delete().eq('id', photoId);
  if (error) return { error: error.message };
  return { success: true };
}
