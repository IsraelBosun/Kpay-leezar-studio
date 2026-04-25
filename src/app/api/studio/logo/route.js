import { createServerSupabase } from '@/lib/supabase';
import { uploadToR2 } from '@/lib/r2';
import { randomUUID } from 'crypto';

export const runtime = 'nodejs';

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
    if (!file) return Response.json({ error: 'No file provided' }, { status: 400 });

    const ext = file.name.split('.').pop().toLowerCase();
    if (!['jpg', 'jpeg', 'png', 'webp'].includes(ext)) {
      return Response.json({ error: 'Only JPG, PNG and WebP allowed' }, { status: 400 });
    }

    const key = `studios/${studio.id}/logo/${randomUUID()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await uploadToR2(key, buffer, file.type);

    await supabase.from('studios').update({ logo_url: url }).eq('id', studio.id);
    return Response.json({ logo_url: url });
  } catch (err) {
    console.error('Logo upload error:', err);
    return Response.json({ error: 'Upload failed' }, { status: 500 });
  }
}
