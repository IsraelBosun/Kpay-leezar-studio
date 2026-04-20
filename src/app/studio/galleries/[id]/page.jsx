import { createServerSupabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import GalleryManager from './GalleryManager';

export default async function GalleryDetailPage({ params }) {
  const { id } = await params;
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: studio } = await supabase
    .from('studios')
    .select('id, slug')
    .eq('owner_id', user.id)
    .single();

  const { data: gallery } = await supabase
    .from('galleries')
    .select('*, bookings(client_name, client_email)')
    .eq('id', id)
    .eq('studio_id', studio.id)
    .single();

  if (!gallery) notFound();

  const { data: photos } = await supabase
    .from('photos')
    .select('*')
    .eq('gallery_id', id)
    .order('uploaded_at', { ascending: true });

  const { data: selections } = await supabase
    .from('selections')
    .select('*, photos(thumbnail_url)')
    .eq('gallery_id', id)
    .order('created_at', { ascending: true });

  const clientUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/gallery/${gallery.slug}`;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <Link href="/studio/galleries" className="text-xs uppercase tracking-widest text-neutral-gray hover:text-primary transition-colors font-bold">
            ← Galleries
          </Link>
          <h1 className="text-3xl md:text-4xl font-serif text-black mt-3">{gallery.title}</h1>
          {gallery.bookings?.client_name && (
            <p className="text-sm text-neutral-gray mt-1">for {gallery.bookings.client_name}</p>
          )}
        </div>

        {/* Status badge */}
        <div className={`px-4 py-2 text-xs uppercase tracking-widest font-bold self-start ${
          gallery.is_locked ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-green-50 text-green-700 border border-green-200'
        }`}>
          {gallery.is_locked ? 'Locked' : 'Unlocked'}
        </div>
      </div>

      <GalleryManager
        gallery={gallery}
        photos={photos ?? []}
        selections={selections ?? []}
        clientUrl={clientUrl}
      />
    </div>
  );
}
