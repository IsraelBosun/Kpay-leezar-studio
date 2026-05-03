import { supabaseAdmin } from '@/lib/supabase';
import { signGallerySession, cookieName } from '@/lib/gallery-session';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  try {
    const { galleryId, password } = await req.json();
    if (!galleryId || !password) {
      return Response.json({ error: 'Missing fields' }, { status: 400 });
    }

    const { data: gallery } = await supabaseAdmin
      .from('galleries')
      .select('id, password_hash, is_locked')
      .eq('id', galleryId)
      .single();

    if (!gallery?.is_locked || !gallery.password_hash) {
      return Response.json({ error: 'Gallery is not locked' }, { status: 400 });
    }

    const valid = await bcrypt.compare(password, gallery.password_hash);
    if (!valid) {
      return Response.json({ error: 'Incorrect password' }, { status: 401 });
    }

    const cookieStore = await cookies();
    cookieStore.set(cookieName(gallery.id), signGallerySession(gallery.id), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return Response.json({ success: true });
  } catch (err) {
    console.error('Gallery unlock error:', err);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}
