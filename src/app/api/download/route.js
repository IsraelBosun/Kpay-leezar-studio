import { supabaseAdmin } from '@/lib/supabase';

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
      .select('downloads_enabled')
      .eq('id', photo.gallery_id)
      .single();
    if (!gallery?.downloads_enabled) {
      return new Response('Downloads not enabled for this gallery', { status: 403 });
    }

    const fileRes = await fetch(photo.original_url);
    if (!fileRes.ok) return new Response('File not found', { status: 404 });

    const contentType = fileRes.headers.get('content-type') || 'image/jpeg';
    const filename = photo.file_name || 'photo.jpg';

    return new Response(fileRes.body, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'private, no-cache',
      },
    });
  } catch (err) {
    console.error('Download error:', err);
    return new Response('Download failed', { status: 500 });
  }
}
