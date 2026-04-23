import { createServerSupabase } from '@/lib/supabase';
import { uploadToR2 } from '@/lib/r2';
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
    const category = formData.get('category') || '';

    if (!file) return Response.json({ error: 'No file provided' }, { status: 400 });

    const ext = file.name.split('.').pop().toLowerCase();
    if (!['jpg', 'jpeg', 'png', 'webp'].includes(ext)) {
      return Response.json({ error: 'Only JPG, PNG and WebP allowed' }, { status: 400 });
    }

    const fileId = randomUUID();
    const key = `studios/${studio.id}/portfolio/${fileId}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await uploadToR2(key, buffer, file.type);

    // Get current max sort_order
    const { data: last } = await supabase
      .from('portfolio_photos')
      .select('sort_order')
      .eq('studio_id', studio.id)
      .order('sort_order', { ascending: false })
      .limit(1)
      .maybeSingle();

    const sort_order = (last?.sort_order ?? -1) + 1;

    const { data: photo, error } = await supabase
      .from('portfolio_photos')
      .insert({ studio_id: studio.id, src: url, thumbnail_url: url, category, sort_order })
      .select()
      .single();

    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json({ photo });
  } catch (err) {
    console.error('Portfolio upload error:', err);
    return Response.json({ error: 'Upload failed' }, { status: 500 });
  }
}
