import { createServerSupabase, supabaseAdmin } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import GalleryManager from './GalleryManager';
import { isPro } from '@/lib/plan';

export default async function GalleryDetailPage({ params }) {
  const { id } = await params;
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: studio } = await supabase
    .from('studios')
    .select('id, slug, plan, created_at')
    .eq('owner_id', user.id)
    .single();

  const { data: gallery } = await supabase
    .from('galleries')
    .select('*, bookings(client_name, client_email)')
    .eq('id', id)
    .eq('studio_id', studio.id)
    .single();

  if (!gallery) notFound();

  const [{ data: photos }, { data: deliveryPhotos }] = await Promise.all([
    supabase.from('photos').select('*').eq('gallery_id', id).eq('photo_type', 'selection').order('uploaded_at', { ascending: true }),
    supabase.from('photos').select('*').eq('gallery_id', id).eq('photo_type', 'delivery').order('uploaded_at', { ascending: true }),
  ]);

  const { data: selections } = await supabase
    .from('selections')
    .select('*, photos(thumbnail_url)')
    .eq('gallery_id', id)
    .order('created_at', { ascending: true });

  const { data: hearts } = await supabaseAdmin
    .from('photo_hearts')
    .select('photo_id')
    .eq('gallery_id', id);

  const heartCounts = {};
  hearts?.forEach(h => { heartCounts[h.photo_id] = (heartCounts[h.photo_id] || 0) + 1; });

  const clientUrl = `${process.env.NEXT_PUBLIC_APP_URL}/gallery/${gallery.slug}`;
  const isProStudio = isPro(studio);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Link href="/studio/galleries" className="text-xs uppercase tracking-widest text-neutral-gray hover:text-primary transition-colors font-bold">
          ← Galleries
        </Link>
        <h1 className="text-3xl md:text-4xl font-serif text-black mt-3">{gallery.title}</h1>
        {gallery.bookings?.client_name && (
          <p className="text-sm text-neutral-gray mt-1">for {gallery.bookings.client_name}</p>
        )}
      </div>

      <GalleryManager
        gallery={gallery}
        photos={photos ?? []}
        deliveryPhotos={deliveryPhotos ?? []}
        selections={selections ?? []}
        heartCounts={heartCounts}
        clientUrl={clientUrl}
        isProStudio={isProStudio}
      />
    </div>
  );
}
