import { createServerSupabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import StudioSiteClient from './StudioSiteClient';

export default async function StudioSitePage({ params }) {
  const { slug } = await params;
  const supabase = await createServerSupabase();

  const { data: studio } = await supabase
    .from('studios')
    .select('*, services(*)')
    .eq('slug', slug)
    .single();

  if (!studio) notFound();

  const { data: portfolioPhotos } = await supabase
    .from('portfolio_photos')
    .select('*')
    .eq('studio_id', studio.id)
    .order('sort_order', { ascending: true });

  const services = studio.services?.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)) ?? [];
  const portfolio = portfolioPhotos ?? [];

  return <StudioSiteClient studio={studio} portfolio={portfolio} services={services} websiteConfig={studio.website_config} />;
}
