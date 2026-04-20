import { createServerSupabase } from '@/lib/supabase';
import { uploadToR2, buildPhotoKey } from '@/lib/r2';
import { randomUUID } from 'crypto';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: studio } = await supabase
      .from('studios')
      .select('id')
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

    const ext = file.name.split('.').pop().toLowerCase();
    const allowed = ['jpg', 'jpeg', 'png', 'webp'];
    if (!allowed.includes(ext)) {
      return Response.json({ error: 'Only JPG, PNG and WebP files allowed' }, { status: 400 });
    }

    const fileId = randomUUID();
    const fileName = `${fileId}.${ext}`;
    const key = buildPhotoKey(studio.id, galleryId, fileName);

    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await uploadToR2(key, buffer, file.type);

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

    return Response.json({ photo });
  } catch (err) {
    console.error('Upload error:', err);
    return Response.json({ error: 'Upload failed' }, { status: 500 });
  }
}
