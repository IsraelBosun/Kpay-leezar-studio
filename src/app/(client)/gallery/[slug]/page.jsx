import { createServerSupabase } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import { THEMES, resolveConfig } from '@/lib/themes';
import { isPro } from '@/lib/plan';
import GalleryPortal from './GalleryPortal';
import GalleryPasswordForm from './GalleryPasswordForm';

export default async function ClientGalleryPage({ params, searchParams }) {
  const { slug } = await params;
  const { pw } = await searchParams;

  const supabase = await createServerSupabase();

  const { data: gallery } = await supabase
    .from('galleries')
    .select('*, studios(name, accent_color, logo_url, website_config, plan, created_at), bookings(status, session_date)')
    .eq('slug', slug)
    .single();

  if (!gallery) notFound();

  const studio = gallery.studios;
  const config = resolveConfig(studio?.website_config);
  const studioTheme = THEMES[config.theme] || THEMES.classic;
  const accentColor = studio?.accent_color || '#F0940A';

  // Access control
  const studioIsPro = isPro(studio);
  let accessible = studioIsPro || gallery.downloads_enabled || gallery.bookings?.status === 'completed';

  if (!accessible) {
    const { data: oldest } = await supabase
      .from('galleries')
      .select('id')
      .eq('studio_id', gallery.studio_id)
      .order('created_at', { ascending: true })
      .limit(1)
      .single();
    accessible = oldest?.id === gallery.id;
  }

  if (!accessible) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ background: studioTheme.bg }}>
        <div className="text-center space-y-4 max-w-sm">
          <p className="font-serif text-3xl" style={{ color: studioTheme.text }}>{gallery.title}</p>
          <p className="text-sm" style={{ color: studioTheme.textMuted }}>
            This gallery is currently unavailable. Please contact {studio?.name ?? 'the studio'} for access.
          </p>
        </div>
      </div>
    );
  }

  // Password gate
  if (gallery.is_locked && gallery.password_hash && pw !== gallery.password_hash) {
    return (
      <GalleryPasswordForm
        slug={slug}
        studioName={studio?.name}
        logoUrl={studio?.logo_url}
        accentColor={accentColor}
        studioTheme={studioTheme}
      />
    );
  }

  const [{ data: photos }, { data: deliveryPhotos }, { data: allHearts }] = await Promise.all([
    supabase.from('photos').select('id, thumbnail_url, original_url, file_name').eq('gallery_id', gallery.id).eq('photo_type', 'selection').order('uploaded_at', { ascending: true }),
    supabase.from('photos').select('id, thumbnail_url, original_url, file_name').eq('gallery_id', gallery.id).eq('photo_type', 'delivery').order('uploaded_at', { ascending: true }),
    supabaseAdmin.from('photo_hearts').select('photo_id').eq('gallery_id', gallery.id),
  ]);

  const initialHeartCounts = {};
  allHearts?.forEach(h => { initialHeartCounts[h.photo_id] = (initialHeartCounts[h.photo_id] || 0) + 1; });

  return (
    <GalleryPortal
      gallery={gallery}
      photos={photos ?? []}
      deliveryPhotos={deliveryPhotos ?? []}
      studioName={studio?.name}
      logoUrl={studio?.logo_url || null}
      studioTheme={studioTheme}
      accentColor={accentColor}
      isLocked={gallery.is_locked}
      downloadsEnabled={gallery.downloads_enabled ?? false}
      initialHeartCounts={initialHeartCounts}
    />
  );
}
