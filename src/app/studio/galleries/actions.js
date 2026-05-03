'use server';

import { createServerSupabase } from '@/lib/supabase';
import { deleteFromR2 } from '@/lib/r2';
import { redirect } from 'next/navigation';
import { isPro, FREE_GALLERY_LIMIT } from '@/lib/plan';
import bcrypt from 'bcryptjs';

export async function createGallery(formData) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated.' };

  const { data: studio } = await supabase
    .from('studios')
    .select('id, plan, created_at')
    .eq('owner_id', user.id)
    .single();
  if (!studio) return { error: 'Studio not found.' };

  if (!isPro(studio)) {
    const { count } = await supabase
      .from('galleries')
      .select('*', { count: 'exact', head: true })
      .eq('studio_id', studio.id);
    if (count >= FREE_GALLERY_LIMIT) return { error: `Free plan allows ${FREE_GALLERY_LIMIT} galleries. Upgrade to Pro to create more.` };
  }

  const title = formData.get('title');
  const bookingId = formData.get('booking_id') || null;
  const rawPassword = formData.get('password') || null;
  const password_hash = rawPassword ? await bcrypt.hash(rawPassword, 10) : null;

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
      password_hash,
      is_locked: true,
    })
    .select()
    .single();

  if (error) return { error: error.message };
  redirect(`/studio/galleries/${gallery.id}`);
}

export async function toggleGalleryDownloads(galleryId, enabled) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated.' };
  const { data: studio } = await supabase.from('studios').select('id').eq('owner_id', user.id).single();
  if (!studio) return { error: 'Studio not found.' };
  const { error } = await supabase
    .from('galleries')
    .update({ downloads_enabled: enabled })
    .eq('id', galleryId)
    .eq('studio_id', studio.id);
  if (error) return { error: error.message };
  return { success: true };
}

export async function toggleGalleryLock(galleryId, locked) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated.' };
  const { data: studio } = await supabase.from('studios').select('id').eq('owner_id', user.id).single();
  if (!studio) return { error: 'Studio not found.' };
  const { error } = await supabase
    .from('galleries')
    .update({ is_locked: locked })
    .eq('id', galleryId)
    .eq('studio_id', studio.id);
  if (error) return { error: error.message };
  return { success: true };
}

export async function updateGalleryPassword(galleryId, newPassword) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated.' };

  const { data: studio } = await supabase
    .from('studios')
    .select('id')
    .eq('owner_id', user.id)
    .single();
  if (!studio) return { error: 'Studio not found.' };

  const password_hash = newPassword ? await bcrypt.hash(newPassword, 10) : null;

  const { error } = await supabase
    .from('galleries')
    .update({ password_hash, is_locked: !!newPassword })
    .eq('id', galleryId)
    .eq('studio_id', studio.id);

  if (error) return { error: error.message };
  return { success: true };
}

export async function deleteDeliveryPhoto(photoId) {
  return deletePhoto(photoId);
}

export async function deletePhoto(photoId) {
  const supabase = await createServerSupabase();
  const { data: photo } = await supabase
    .from('photos')
    .select('original_url, thumbnail_url, gallery_id, studio_id, file_size')
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

  // Decrement studio storage counter
  if (photo.file_size && photo.studio_id) {
    const { data: studio } = await supabase
      .from('studios')
      .select('storage_used_bytes')
      .eq('id', photo.studio_id)
      .single();
    if (studio) {
      const newBytes = Math.max(0, (Number(studio.storage_used_bytes) || 0) - photo.file_size);
      await supabase.from('studios').update({ storage_used_bytes: newBytes }).eq('id', photo.studio_id);
    }
  }

  return { success: true };
}
