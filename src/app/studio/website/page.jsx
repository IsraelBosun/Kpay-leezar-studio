import { createServerSupabase } from '@/lib/supabase';
import WebsiteEditor from './WebsiteEditor';

export default async function WebsitePage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: studio } = await supabase
    .from('studios')
    .select('id, name, slug, accent_color, website_config, bio, email, phone, instagram_url, logo_url')
    .eq('owner_id', user.id)
    .single();

  const { data: portfolioPhotos } = await supabase
    .from('portfolio_photos')
    .select('*')
    .eq('studio_id', studio.id)
    .order('sort_order', { ascending: true });

  const { data: services } = await supabase
    .from('services')
    .select('*')
    .eq('studio_id', studio.id)
    .order('created_at', { ascending: true });

  const siteUrl = process.env.NEXT_PUBLIC_ROOT_DOMAIN === 'photostudio.ng'
    ? `https://${studio.slug}.photostudio.ng`
    : `${process.env.NEXT_PUBLIC_APP_URL}/studio-site/${studio.slug}`;

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-primary font-bold mb-1">Studio</p>
          <h1 className="text-3xl md:text-4xl font-serif text-black">Website</h1>
          <p className="text-sm text-neutral-gray italic mt-1">Manage your portfolio photos and site design.</p>
        </div>
        <a
          href={siteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-xs uppercase tracking-widest font-bold text-neutral-gray hover:text-black hover:border-black transition-all">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          View Site
        </a>
      </div>

      <WebsiteEditor
        studio={studio}
        portfolioPhotos={portfolioPhotos ?? []}
        websiteConfig={studio.website_config}
        initialServices={services ?? []}
      />
    </div>
  );
}
