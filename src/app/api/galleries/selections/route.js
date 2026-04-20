import { createServerSupabase } from '@/lib/supabase';

export async function POST(req) {
  try {
    const supabase = await createServerSupabase();
    const payload = await req.json();

    if (!Array.isArray(payload) || payload.length === 0) {
      return Response.json({ error: 'No selections provided' }, { status: 400 });
    }

    const { gallery_id, selector_name } = payload[0];
    if (!gallery_id || !selector_name) {
      return Response.json({ error: 'Missing gallery_id or selector_name' }, { status: 400 });
    }

    // Delete existing selections by this person for this gallery, then reinsert
    await supabase
      .from('selections')
      .delete()
      .eq('gallery_id', gallery_id)
      .eq('selector_name', selector_name);

    const { error } = await supabase.from('selections').insert(payload);
    if (error) return Response.json({ error: error.message }, { status: 500 });

    return Response.json({ success: true, count: payload.length });
  } catch (err) {
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}
