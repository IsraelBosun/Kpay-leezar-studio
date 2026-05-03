import { createServerSupabase } from '@/lib/supabase';
import { uploadToR2, buildPhotoKey } from '@/lib/r2';
import { randomUUID } from 'crypto';
import { isPro, FREE_STORAGE_LIMIT } from '@/lib/plan';
import { fileTypeFromBuffer } from 'file-type';

const ALLOWED_MIME_TYPES = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: studio } = await supabase
      .from('studios')
      .select('id, plan, created_at, storage_used_bytes')
      .eq('owner_id', user.id)
      .single();
    if (!studio) return Response.json({ error: 'Studio not found' }, { status: 403 });

    const formData = await req.formData();
    const file = formData.get('file');
    const galleryId = formData.get('gallery_id');

    if (!file || !galleryId) {
      return Response.json({ error: 'Missing file or gallery_id' }, { status: 400 });
    }

    // Verify gallery belongs to this studio
    const { data: gallery } = await supabase
      .from('galleries')
      .select('id')
      .eq('id', galleryId)
      .eq('studio_id', studio.id)
      .single();
    if (!gallery) return Response.json({ error: 'Gallery not found' }, { status: 403 });

    // Free plan: 2 GB storage cap — atomic check-and-increment prevents race condition
    if (!isPro(studio)) {
      const { data: allowed, error: rpcError } = await supabase.rpc('increment_storage_checked', {
        p_studio_id: studio.id,
        p_bytes: file.size,
        p_limit: FREE_STORAGE_LIMIT,
      });
      if (rpcError) return Response.json({ error: 'Storage check failed.' }, { status: 500 });
      if (!allowed) return Response.json({ error: 'Storage limit reached. Free plan includes 2 GB. Upgrade to Pro for unlimited storage.' }, { status: 403 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const detected = await fileTypeFromBuffer(buffer);
    const mimeType = detected?.mime;
    const ext = ALLOWED_MIME_TYPES[mimeType];
    if (!ext) {
      return Response.json({ error: 'Only JPG, PNG and WebP files allowed' }, { status: 400 });
    }

    const fileId = randomUUID();
    const fileName = `${fileId}.${ext}`;
    const key = buildPhotoKey(studio.id, galleryId, fileName);

    const url = await uploadToR2(key, buffer, mimeType);

    const { data: photo, error } = await supabase
      .from('photos')
      .insert({
        gallery_id: galleryId,
        studio_id: studio.id,
        original_url: url,
        thumbnail_url: url,
        file_name: file.name,
        file_size: file.size,
      })
      .select()
      .single();

    if (error) return Response.json({ error: error.message }, { status: 500 });

    // Pro plan: no limit to enforce, so a simple counter update is fine
    if (isPro(studio)) {
      await supabase.from('studios')
        .update({ storage_used_bytes: Number(studio.storage_used_bytes ?? 0) + file.size })
        .eq('id', studio.id);
    }

    return Response.json({ photo });
  } catch (err) {
    console.error('Upload error:', err);
    return Response.json({ error: 'Upload failed' }, { status: 500 });
  }
}
