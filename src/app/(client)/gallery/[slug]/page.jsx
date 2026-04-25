import { createServerSupabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import GalleryPortal from './GalleryPortal';
import GalleryPasswordForm from './GalleryPasswordForm';
import { isPro } from '@/lib/plan';

export default async function ClientGalleryPage({ params, searchParams }) {
  const { slug } = await params;
  const { pw } = await searchParams;

  const supabase = await createServerSupabase();

  const { data: gallery } = await supabase
    .from('galleries')
    .select('*, studios(name, accent_color, plan, created_at), bookings(status)')
    .eq('slug', slug)
    .single();

  if (!gallery) notFound();

  const studio = gallery.studios;

  // Access control: Pro studio, oldest gallery, booking completed, or already delivered
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
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-6">
        <div className="text-center space-y-4 max-w-sm">
          <p className="font-serif text-3xl text-white">{gallery.title}</p>
          <p className="text-white/40 text-sm">
            This gallery is currently unavailable. Please contact {studio?.name ?? 'the studio'} for access.
          </p>
        </div>
      </div>
    );
  }

  // Password only required while gallery is locked
  if (gallery.is_locked && gallery.password_hash && pw !== gallery.password_hash) {
    return (
      <GalleryPasswordForm
        slug={slug}
        studioName={studio?.name}
        accentColor={studio?.accent_color}
      />
    );
  }

  const [{ data: photos }, { data: deliveryPhotos }] = await Promise.all([
    supabase.from('photos').select('id, thumbnail_url, original_url, file_name').eq('gallery_id', gallery.id).eq('photo_type', 'selection').order('uploaded_at', { ascending: true }),
    supabase.from('photos').select('id, thumbnail_url, original_url, file_name').eq('gallery_id', gallery.id).eq('photo_type', 'delivery').order('uploaded_at', { ascending: true }),
  ]);

  return (
    <GalleryPortal
      gallery={gallery}
      photos={photos ?? []}
      deliveryPhotos={deliveryPhotos ?? []}
      studioName={studio?.name}
      accentColor={studio?.accent_color || '#F0940A'}
      isLocked={gallery.is_locked}
      downloadsEnabled={gallery.downloads_enabled ?? false}
    />
  );
}
