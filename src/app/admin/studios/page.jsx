import { supabaseAdmin } from '@/lib/supabase';
import Link from 'next/link';
import { PlanBadge } from '@/app/admin/page';

export const dynamic = 'force-dynamic';

export default async function AdminStudiosPage() {
  const { data: studios } = await supabaseAdmin
    .from('studios')
    .select('id, name, slug, plan, created_at, email, location, accent_color')
    .order('created_at', { ascending: false });

  const studioIds = (studios ?? []).map(s => s.id);
  const fallbackId = '00000000-0000-0000-0000-000000000000';

  const [{ data: bookingRows }, { data: galleryRows }, { data: paymentRows }] = await Promise.all([
    supabaseAdmin.from('bookings').select('studio_id').in('studio_id', studioIds.length ? studioIds : [fallbackId]),
    supabaseAdmin.from('galleries').select('studio_id').in('studio_id', studioIds.length ? studioIds : [fallbackId]),
    supabaseAdmin.from('payments').select('studio_id, amount').eq('status', 'paid').in('studio_id', studioIds.length ? studioIds : [fallbackId]),
  ]);

  const countBy  = (rows, key) => (rows ?? []).reduce((acc, r) => { acc[r[key]] = (acc[r[key]] || 0) + 1; return acc; }, {});
  const sumBy    = (rows, key, val) => (rows ?? []).reduce((acc, r) => { acc[r[key]] = (acc[r[key]] || 0) + Number(r[val]); return acc; }, {});

  const bookings  = countBy(bookingRows,  'studio_id');
  const galleries = countBy(galleryRows,  'studio_id');
  const revenue   = sumBy(paymentRows,    'studio_id', 'amount');

  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <p className="text-[10px] uppercase tracking-[0.4em] font-bold mb-2" style={{ color: 'var(--a-accent)' }}>
          Platform Control
        </p>
        <h1 className="font-serif text-4xl md:text-5xl" style={{ color: 'var(--a-text)' }}>Studios</h1>
        <p className="text-sm mt-1.5" style={{ color: 'var(--a-muted)' }}>{studios?.length ?? 0} total registered</p>
      </div>

      {/* Table */}
      <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: 'var(--a-surface)', borderColor: 'var(--a-border)' }}>

        <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-4 px-6 py-3 border-b"
          style={{ borderColor: 'var(--a-border)', backgroundColor: 'var(--a-hover)' }}>
          {['Studio', 'Plan', 'Bookings', 'Galleries', 'Revenue', ''].map(h => (
            <p key={h} className="text-[10px] uppercase tracking-widest font-bold" style={{ color: 'var(--a-subtle)' }}>{h}</p>
          ))}
        </div>

        <div>
          {(studios ?? []).map(studio => (
            <div key={studio.id}
              className="admin-row grid grid-cols-2 md:grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-4 px-6 py-4 items-center border-b last:border-b-0"
              style={{ borderColor: 'var(--a-divider)' }}>

              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold uppercase"
                  style={{ backgroundColor: `${studio.accent_color || '#F0940A'}18`, color: studio.accent_color || '#F0940A' }}>
                  {studio.name?.[0] || '?'}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: 'var(--a-text)' }}>{studio.name}</p>
                  <p className="text-[11px] truncate" style={{ color: 'var(--a-subtle)' }}>{studio.slug}.photostudio.ng</p>
                </div>
              </div>

              <div><PlanBadge plan={studio.plan} /></div>

              <p className="hidden md:block text-sm" style={{ color: 'var(--a-muted)' }}>{bookings[studio.id] ?? 0}</p>
              <p className="hidden md:block text-sm" style={{ color: 'var(--a-muted)' }}>{galleries[studio.id] ?? 0}</p>

              <p className="hidden md:block text-sm font-medium"
                style={{ color: revenue[studio.id] ? 'var(--a-green)' : 'var(--a-subtle)' }}>
                {revenue[studio.id] ? `₦${revenue[studio.id].toLocaleString()}` : '₦0'}
              </p>

              <div className="flex items-center gap-1 justify-end">
                <Link href={`/admin/studios/${studio.id}`}
                  className="admin-link-btn text-[10px] uppercase tracking-widest font-bold px-3 py-1.5 rounded-lg"
                  style={{ color: 'var(--a-accent)' }}>
                  View →
                </Link>
                <a href={`https://${studio.slug}.photostudio.ng`} target="_blank" rel="noopener noreferrer"
                  className="text-sm px-2 py-1.5 transition-colors hover:opacity-60"
                  style={{ color: 'var(--a-subtle)' }}>
                  ↗
                </a>
              </div>
            </div>
          ))}

          {(!studios || studios.length === 0) && (
            <div className="px-6 py-20 text-center">
              <p className="font-serif text-2xl mb-2" style={{ color: 'var(--a-muted)' }}>No studios yet</p>
              <p className="text-sm" style={{ color: 'var(--a-subtle)' }}>Studios appear here when photographers sign up.</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
