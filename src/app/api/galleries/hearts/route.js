import { supabaseAdmin } from '@/lib/supabase';
import { verifyGallerySession, cookieName } from '@/lib/gallery-session';
import { cookies } from 'next/headers';

async function hasGalleryAccess(galleryId) {
  const { data: gallery } = await supabaseAdmin
    .from('galleries')
    .select('id, is_locked')
    .eq('id', galleryId)
    .single();
  if (!gallery) return false;
  if (!gallery.is_locked) return true;
  const cookieStore = await cookies();
  const token = cookieStore.get(cookieName(galleryId))?.value;
  return !!token && verifyGallerySession(galleryId, token);
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const gallery_id = searchParams.get('gallery_id');
  const selector_name = searchParams.get('selector_name');

  if (!gallery_id) return Response.json({ error: 'gallery_id required' }, { status: 400 });

  if (!await hasGalleryAccess(gallery_id)) {
    return Response.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const [{ data: allHearts }, { data: myHeartsData }] = await Promise.all([
    supabaseAdmin.from('photo_hearts').select('photo_id').eq('gallery_id', gallery_id),
    selector_name
      ? supabaseAdmin.from('photo_hearts').select('photo_id').eq('gallery_id', gallery_id).eq('selector_name', selector_name)
      : Promise.resolve({ data: [] }),
  ]);

  const counts = {};
  allHearts?.forEach(h => { counts[h.photo_id] = (counts[h.photo_id] || 0) + 1; });
  const myHearts = myHeartsData?.map(h => h.photo_id) || [];

  return Response.json({ counts, myHearts });
}

export async function POST(request) {
  try {
    const { gallery_id, photo_id, selector_name } = await request.json();
    if (!gallery_id || !photo_id || !selector_name?.trim()) {
      return Response.json({ error: 'Missing fields' }, { status: 400 });
    }

    if (!await hasGalleryAccess(gallery_id)) {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { data: existing } = await supabaseAdmin
      .from('photo_hearts')
      .select('id')
      .eq('gallery_id', gallery_id)
      .eq('photo_id', photo_id)
      .eq('selector_name', selector_name.trim())
      .maybeSingle();

    let hearted;
    if (existing) {
      await supabaseAdmin.from('photo_hearts').delete().eq('id', existing.id);
      await supabaseAdmin.from('selections')
        .delete()
        .eq('gallery_id', gallery_id)
        .eq('photo_id', photo_id)
        .eq('selector_name', selector_name.trim());
      hearted = false;
    } else {
      await supabaseAdmin.from('photo_hearts').insert({ gallery_id, photo_id, selector_name: selector_name.trim() });
      await supabaseAdmin.from('selections').upsert(
        { gallery_id, photo_id, selector_name: selector_name.trim() },
        { onConflict: 'gallery_id,photo_id,selector_name' }
      );
      hearted = true;
    }

    const { count } = await supabaseAdmin
      .from('photo_hearts')
      .select('*', { count: 'exact', head: true })
      .eq('gallery_id', gallery_id)
      .eq('photo_id', photo_id);

    return Response.json({ hearted, count: count ?? 0 });
  } catch {
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}
