import { supabaseAdmin } from '@/lib/supabase';
import { verifyGallerySession, cookieName } from '@/lib/gallery-session';
import { cookies } from 'next/headers';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const photoId = searchParams.get('photo_id');
    if (!photoId) return new Response('Missing photo_id', { status: 400 });

    const { data: photo } = await supabaseAdmin
      .from('photos')
      .select('original_url, file_name, gallery_id')
      .eq('id', photoId)
      .single();
    if (!photo) return new Response('Photo not found', { status: 404 });

    const { data: gallery } = await supabaseAdmin
      .from('galleries')
      .select('downloads_enabled, is_locked')
      .eq('id', photo.gallery_id)
      .single();
    if (!gallery?.downloads_enabled) {
      return new Response('Downloads not enabled for this gallery', { status: 403 });
    }

    if (gallery.is_locked) {
      const cookieStore = await cookies();
      const token = cookieStore.get(cookieName(photo.gallery_id))?.value;
      if (!token || !verifyGallerySession(photo.gallery_id, token)) {
        return new Response('Unauthorized', { status: 403 });
      }
    }

    const fileRes = await fetch(photo.original_url);
    if (!fileRes.ok) return new Response('File not found', { status: 404 });

    const contentType = fileRes.headers.get('content-type') || 'image/jpeg';
    const safeFilename = (photo.file_name || 'photo.jpg').replace(/[^a-zA-Z0-9._\-]/g, '_');

    return new Response(fileRes.body, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${safeFilename}"`,
        'Cache-Control': 'private, no-cache',
      },
    });
  } catch (err) {
    console.error('Download error:', err);
    return new Response('Download failed', { status: 500 });
  }
}
