import { createServerSupabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import GalleryPortal from './GalleryPortal';
import GalleryPasswordForm from './GalleryPasswordForm';

export default async function ClientGalleryPage({ params, searchParams }) {
  const { slug } = await params;
  const { pw } = await searchParams;

  const supabase = await createServerSupabase();

  const { data: gallery } = await supabase
    .from('galleries')
    .select('*, studios(name, accent_color)')
    .eq('slug', slug)
    .single();

  if (!gallery) notFound();

  // Password check
  if (gallery.password_hash && pw !== gallery.password_hash) {
    return (
      <GalleryPasswordForm
        slug={slug}
        studioName={gallery.studios?.name}
        accentColor={gallery.studios?.accent_color}
      />
    );
  }

  const { data: photos } = await supabase
    .from('photos')
    .select('id, thumbnail_url, original_url, file_name')
    .eq('gallery_id', gallery.id)
    .order('uploaded_at', { ascending: true });

  return (
    <GalleryPortal
      gallery={gallery}
      photos={photos ?? []}
      studioName={gallery.studios?.name}
      accentColor={gallery.studios?.accent_color || '#F0940A'}
      isLocked={gallery.is_locked}
    />
  );
}
