import { createServerSupabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import GalleryPageClient from './GalleryPageClient';

export default async function StudioGalleryPage({ params }) {
  const { slug } = await params;
  const supabase = await createServerSupabase();

  const { data: studio } = await supabase
    .from('studios')
    .select('id, name, slug, accent_color, logo_url, location')
    .eq('slug', slug)
    .single();

  if (!studio) notFound();

  const { data: photos } = await supabase
    .from('portfolio_photos')
    .select('*')
    .eq('studio_id', studio.id)
    .order('sort_order', { ascending: true });

  return <GalleryPageClient studio={studio} photos={photos ?? []} />;
}
