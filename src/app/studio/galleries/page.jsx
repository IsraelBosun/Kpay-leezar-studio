import { createServerSupabase } from '@/lib/supabase';
import Link from 'next/link';
import Badge from '@/components/ui/Badge';

export default async function GalleriesPage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: studio } = await supabase
    .from('studios')
    .select('id, plan')
    .eq('owner_id', user.id)
    .single();

  const { data: galleries } = await supabase
    .from('galleries')
    .select('*, bookings(client_name), photos(count)')
    .eq('studio_id', studio.id)
    .order('created_at', { ascending: false });

  const photoCountMap = {};
  const coverPhotoMap = {};
  if (galleries) {
    const galleryIds = galleries.map(g => g.id);
    if (galleryIds.length > 0) {
      const { data: photos } = await supabase
        .from('photos')
        .select('gallery_id, thumbnail_url')
        .in('gallery_id', galleryIds)
        .order('uploaded_at', { ascending: true });
      photos?.forEach(({ gallery_id, thumbnail_url }) => {
        photoCountMap[gallery_id] = (photoCountMap[gallery_id] || 0) + 1;
        if (!coverPhotoMap[gallery_id] && thumbnail_url) {
          coverPhotoMap[gallery_id] = thumbnail_url;
        }
      });
    }
  }

  const atLimit = studio.plan === 'free' && (galleries?.length ?? 0) >= 1;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-primary font-bold mb-1">Studio</p>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif text-black">Galleries</h1>
        </div>
        {atLimit ? (
          <div className="bg-amber-50 border border-amber-200 px-5 py-3 text-xs uppercase tracking-widest font-bold text-amber-700 flex items-center gap-3">
            Free plan: 1 gallery limit —
            <Link href="/studio/settings" className="underline hover:no-underline">Upgrade</Link>
          </div>
        ) : (
          <Link
            href="/studio/galleries/new"
            className="bg-primary text-white px-5 py-3 text-xs uppercase tracking-widest font-bold hover:bg-black transition-all duration-200 active:scale-[0.97] self-start sm:self-auto"
          >
            + New Gallery
          </Link>
        )}
      </div>

      {/* Gallery grid */}
      {!galleries || galleries.length === 0 ? (
        <div className="bg-white border border-gray-100 px-4 sm:px-8 py-12 sm:py-16 text-center">
          <p className="font-serif text-2xl text-black mb-2">No galleries yet</p>
          <p className="text-sm text-neutral-gray italic mb-6">Create a gallery and share photos with your clients.</p>
          <Link
            href="/studio/galleries/new"
            className="inline-block bg-primary text-white px-8 py-3 text-xs uppercase tracking-widest font-bold hover:bg-black transition-colors"
          >
            Create First Gallery
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {galleries.map((g) => (
            <Link
              key={g.id}
              href={`/studio/galleries/${g.id}`}
              className="bg-white border border-gray-100 hover:border-primary/30 hover:shadow-sm transition-all group overflow-hidden"
            >
              {/* Cover photo */}
              <div className="aspect-[3/2] bg-gray-50 overflow-hidden">
                {coverPhotoMap[g.id] ? (
                  <img
                    src={coverPhotoMap[g.id]}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>

              <div className="p-4">
                <p className="font-medium text-black text-sm mb-0.5 group-hover:text-primary transition-colors truncate">{g.title}</p>
                {g.bookings?.client_name && (
                  <p className="text-xs text-primary mb-3">for {g.bookings.client_name}</p>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                  <p className="text-xs text-neutral-gray">
                    {photoCountMap[g.id] ?? 0} photo{photoCountMap[g.id] !== 1 ? 's' : ''}
                  </p>
                  <Badge variant={g.is_locked ? 'warning' : 'success'}>
                    {g.is_locked ? 'Locked' : 'Unlocked'}
                  </Badge>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
