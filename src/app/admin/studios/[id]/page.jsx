import { supabaseAdmin } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

const STATUS_COLORS = {
  pending:   'bg-amber-500/15 text-amber-400',
  confirmed: 'bg-green-500/15 text-green-400',
  completed: 'bg-zinc-500/15 text-zinc-400',
  cancelled: 'bg-red-500/15 text-red-400',
};

const PLAN_STYLES = {
  free:    'bg-zinc-700/50 text-zinc-400',
  starter: 'bg-blue-500/15 text-blue-400',
  studio:  'bg-violet-500/15 text-violet-400',
  pro:     'bg-amber-500/15 text-amber-400',
};

export default async function AdminStudioDetail({ params }) {
  const { id } = await params;

  const { data: studio } = await supabaseAdmin
    .from('studios')
    .select('*')
    .eq('id', id)
    .single();

  if (!studio) notFound();

  const [
    { data: bookings },
    { data: galleries },
    { data: payments },
    { count: photoCount },
  ] = await Promise.all([
    supabaseAdmin.from('bookings').select('*').eq('studio_id', id).order('created_at', { ascending: false }),
    supabaseAdmin.from('galleries').select('id, title, slug, is_locked, created_at').eq('studio_id', id).order('created_at', { ascending: false }),
    supabaseAdmin.from('payments').select('*').eq('studio_id', id).order('created_at', { ascending: false }),
    supabaseAdmin.from('portfolio_photos').select('*', { count: 'exact', head: true }).eq('studio_id', id),
  ]);

  const totalRevenue = (payments ?? [])
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const accent = studio.accent_color || '#F0940A';

  return (
    <div className="space-y-8">

      {/* Back + header */}
      <div>
        <Link href="/admin/studios" className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-white/25 hover:text-white/60 transition-colors mb-6">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 19l-7-7 7-7" />
          </svg>
          All Studios
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold flex-shrink-0"
              style={{ backgroundColor: `${accent}20`, border: `1px solid ${accent}30`, color: accent }}>
              {studio.name?.[0]?.toUpperCase() || '?'}
            </div>
            <div>
              <h1 className="font-serif text-3xl md:text-4xl text-white">{studio.name}</h1>
              <p className="text-white/30 text-sm mt-0.5">{studio.slug}.photostudio.ng</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-[9px] uppercase tracking-widest font-bold px-3 py-1.5 rounded-full ${PLAN_STYLES[studio.plan] ?? PLAN_STYLES.free}`}>
              {studio.plan}
            </span>
            <a
              href={`https://${studio.slug}.photostudio.ng`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] uppercase tracking-widest font-bold px-4 py-2 rounded-lg border border-white/15 text-white/50 hover:text-white hover:border-white/30 transition-all">
              Visit Site ↗
            </a>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Bookings', value: bookings?.length ?? 0 },
          { label: 'Galleries', value: galleries?.length ?? 0 },
          { label: 'Portfolio Photos', value: photoCount ?? 0 },
          { label: 'Revenue', value: `₦${totalRevenue.toLocaleString()}`, accent: '#10b981' },
        ].map(s => (
          <div key={s.label} className="bg-zinc-900/60 border border-white/8 rounded-xl p-5">
            <p className="text-[10px] uppercase tracking-widest font-bold text-white/25 mb-3">{s.label}</p>
            <p className="font-serif text-3xl text-white" style={s.accent ? { color: s.accent } : {}}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Studio info */}
      <div className="bg-zinc-900/60 border border-white/8 rounded-xl p-6">
        <p className="text-[10px] uppercase tracking-widest font-bold text-white/25 mb-5">Studio Info</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: 'Email', value: studio.email },
            { label: 'Phone', value: studio.phone },
            { label: 'Location', value: studio.location },
            { label: 'Instagram', value: studio.instagram_url },
            { label: 'Signed up', value: new Date(studio.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' }) },
            { label: 'Accent color', value: studio.accent_color, isColor: true },
          ].map(field => field.value ? (
            <div key={field.label} className="flex items-start gap-3">
              <p className="text-[10px] uppercase tracking-widest font-bold text-white/20 w-24 flex-shrink-0 pt-0.5">{field.label}</p>
              {field.isColor ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: field.value }} />
                  <p className="text-sm text-white/50">{field.value}</p>
                </div>
              ) : (
                <p className="text-sm text-white/60 break-all">{field.value}</p>
              )}
            </div>
          ) : null)}
        </div>
        {studio.bio && (
          <div className="mt-5 pt-5 border-t border-white/8">
            <p className="text-[10px] uppercase tracking-widest font-bold text-white/20 mb-2">Bio</p>
            <p className="text-sm text-white/50 leading-relaxed">{studio.bio}</p>
          </div>
        )}
      </div>

      {/* Bookings */}
      <div className="bg-zinc-900/60 border border-white/8 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/8">
          <p className="text-[10px] uppercase tracking-widest font-bold text-white/25">Bookings ({bookings?.length ?? 0})</p>
        </div>
        {bookings && bookings.length > 0 ? (
          <div className="divide-y divide-white/5">
            {bookings.map(b => (
              <div key={b.id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-white">{b.client_name}</p>
                  <p className="text-[11px] text-white/30">{b.client_email} · {b.session_date ? new Date(b.session_date).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }) : 'No date'}</p>
                </div>
                <div className="flex items-center gap-3">
                  {b.deposit_paid && <span className="text-[10px] text-green-400 font-bold">Deposit ✓</span>}
                  {b.balance_paid && <span className="text-[10px] text-green-400 font-bold">Balance ✓</span>}
                  <span className={`text-[9px] uppercase tracking-widest font-bold px-2 py-1 rounded-full ${STATUS_COLORS[b.status] ?? 'bg-zinc-700/50 text-zinc-400'}`}>
                    {b.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="px-6 py-8 text-sm text-white/20 text-center">No bookings yet.</p>
        )}
      </div>

      {/* Galleries */}
      <div className="bg-zinc-900/60 border border-white/8 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/8">
          <p className="text-[10px] uppercase tracking-widest font-bold text-white/25">Galleries ({galleries?.length ?? 0})</p>
        </div>
        {galleries && galleries.length > 0 ? (
          <div className="divide-y divide-white/5">
            {galleries.map(g => (
              <div key={g.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">{g.title}</p>
                  <p className="text-[11px] text-white/30">/gallery/{g.slug}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[9px] uppercase tracking-widest font-bold px-2 py-1 rounded-full ${g.is_locked ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
                    {g.is_locked ? 'Locked' : 'Unlocked'}
                  </span>
                  <a
                    href={`/gallery/${g.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-white/25 hover:text-white/60 transition-colors">
                    ↗
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="px-6 py-8 text-sm text-white/20 text-center">No galleries yet.</p>
        )}
      </div>

      {/* Payments */}
      {payments && payments.length > 0 && (
        <div className="bg-zinc-900/60 border border-white/8 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/8">
            <p className="text-[10px] uppercase tracking-widest font-bold text-white/25">Payments</p>
          </div>
          <div className="divide-y divide-white/5">
            {payments.map(p => (
              <div key={p.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">₦{Number(p.amount).toLocaleString()}</p>
                  <p className="text-[11px] text-white/30 capitalize">{p.type} · {p.paystack_reference}</p>
                </div>
                <span className={`text-[9px] uppercase tracking-widest font-bold px-2 py-1 rounded-full ${p.status === 'paid' ? 'bg-green-500/10 text-green-400' : 'bg-amber-500/10 text-amber-400'}`}>
                  {p.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
