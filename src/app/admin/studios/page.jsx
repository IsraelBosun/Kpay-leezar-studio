import { supabaseAdmin } from '@/lib/supabase';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

const PLAN_STYLES = {
  free:    'bg-zinc-700/50 text-zinc-400',
  starter: 'bg-blue-500/15 text-blue-400',
  studio:  'bg-violet-500/15 text-violet-400',
  pro:     'bg-amber-500/15 text-amber-400',
};

export default async function AdminStudiosPage() {
  const { data: studios } = await supabaseAdmin
    .from('studios')
    .select('id, name, slug, plan, created_at, email, location, accent_color')
    .order('created_at', { ascending: false });

  // Get booking + gallery counts per studio
  const studioIds = (studios ?? []).map(s => s.id);

  const [{ data: bookingCounts }, { data: galleryCounts }, { data: payments }] = await Promise.all([
    supabaseAdmin
      .from('bookings')
      .select('studio_id')
      .in('studio_id', studioIds.length ? studioIds : ['00000000-0000-0000-0000-000000000000']),
    supabaseAdmin
      .from('galleries')
      .select('studio_id')
      .in('studio_id', studioIds.length ? studioIds : ['00000000-0000-0000-0000-000000000000']),
    supabaseAdmin
      .from('payments')
      .select('studio_id, amount')
      .eq('status', 'paid')
      .in('studio_id', studioIds.length ? studioIds : ['00000000-0000-0000-0000-000000000000']),
  ]);

  const bookingsByStudio = (bookingCounts ?? []).reduce((acc, b) => {
    acc[b.studio_id] = (acc[b.studio_id] || 0) + 1;
    return acc;
  }, {});

  const galleriesByStudio = (galleryCounts ?? []).reduce((acc, g) => {
    acc[g.studio_id] = (acc[g.studio_id] || 0) + 1;
    return acc;
  }, {});

  const revenueByStudio = (payments ?? []).reduce((acc, p) => {
    acc[p.studio_id] = (acc[p.studio_id] || 0) + Number(p.amount);
    return acc;
  }, {});

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-violet-400 mb-2">Platform Control</p>
          <h1 className="font-serif text-4xl md:text-5xl text-white">Studios</h1>
          <p className="text-white/30 text-sm mt-2">{studios?.length ?? 0} total registered</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-zinc-900/60 border border-white/8 rounded-xl overflow-hidden">
        {/* Header row */}
        <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-4 px-6 py-3 border-b border-white/8 bg-white/3">
          {['Studio', 'Plan', 'Bookings', 'Galleries', 'Revenue', ''].map(h => (
            <p key={h} className="text-[10px] uppercase tracking-widest font-bold text-white/25">{h}</p>
          ))}
        </div>

        {/* Rows */}
        <div className="divide-y divide-white/5">
          {(studios ?? []).map(studio => (
            <div key={studio.id} className="grid grid-cols-2 md:grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-4 px-6 py-4 items-center hover:bg-white/3 transition-colors group">
              {/* Studio name */}
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${studio.accent_color || '#F0940A'}20`, border: `1px solid ${studio.accent_color || '#F0940A'}30` }}>
                  <span className="text-xs font-bold uppercase" style={{ color: studio.accent_color || '#F0940A' }}>
                    {studio.name?.[0] || '?'}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">{studio.name}</p>
                  <p className="text-[11px] text-white/25 truncate">{studio.slug}.photostudio.ng</p>
                </div>
              </div>

              {/* Plan */}
              <div>
                <span className={`text-[9px] uppercase tracking-widest font-bold px-2 py-1 rounded-full ${PLAN_STYLES[studio.plan] ?? PLAN_STYLES.free}`}>
                  {studio.plan}
                </span>
              </div>

              {/* Bookings */}
              <p className="hidden md:block text-sm text-white/50">
                {bookingsByStudio[studio.id] ?? 0}
              </p>

              {/* Galleries */}
              <p className="hidden md:block text-sm text-white/50">
                {galleriesByStudio[studio.id] ?? 0}
              </p>

              {/* Revenue */}
              <p className="hidden md:block text-sm font-medium" style={{ color: revenueByStudio[studio.id] ? '#10b981' : undefined }}>
                {revenueByStudio[studio.id] ? `₦${revenueByStudio[studio.id].toLocaleString()}` : <span className="text-white/20">₦0</span>}
              </p>

              {/* Actions */}
              <div className="flex items-center gap-2 justify-end">
                <Link
                  href={`/admin/studios/${studio.id}`}
                  className="text-[10px] uppercase tracking-widest font-bold text-violet-400 hover:text-violet-300 transition-colors px-3 py-1.5 rounded-lg hover:bg-violet-500/10">
                  View →
                </Link>
                <a
                  href={`https://${studio.slug}.photostudio.ng`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-white/20 hover:text-white/50 transition-colors px-2 py-1.5">
                  ↗
                </a>
              </div>
            </div>
          ))}

          {(!studios || studios.length === 0) && (
            <div className="px-6 py-20 text-center">
              <p className="font-serif text-2xl text-white/20 mb-2">No studios yet</p>
              <p className="text-sm text-white/15">Studios will appear here once photographers sign up.</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
