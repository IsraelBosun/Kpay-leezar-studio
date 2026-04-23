import { createServerSupabase } from '@/lib/supabase';
import { deleteFromR2 } from '@/lib/r2';

export const runtime = 'nodejs';

export async function DELETE(req) {
  try {
    const { photoId } = await req.json();
    if (!photoId) return Response.json({ error: 'photoId required' }, { status: 400 });

    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: studio } = await supabase
      .from('studios')
      .select('id')
      .eq('owner_id', user.id)
      .single();
    if (!studio) return Response.json({ error: 'Studio not found' }, { status: 403 });

    const { data: photo } = await supabase
      .from('portfolio_photos')
      .select('id, src')
      .eq('id', photoId)
      .eq('studio_id', studio.id)
      .single();
    if (!photo) return Response.json({ error: 'Photo not found' }, { status: 404 });

    // Delete from R2 — extract key from public URL
    try {
      const publicBase = process.env.CLOUDFLARE_R2_PUBLIC_URL;
      if (publicBase && photo.src.startsWith(publicBase)) {
        const key = photo.src.slice(publicBase.length + 1);
        await deleteFromR2(key);
      }
    } catch {
      // Continue even if R2 delete fails — DB record is the source of truth
    }

    await supabase.from('portfolio_photos').delete().eq('id', photoId);
    return Response.json({ success: true });
  } catch (err) {
    console.error('Portfolio delete error:', err);
    return Response.json({ error: 'Delete failed' }, { status: 500 });
  }
}
