import { supabaseAdmin } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { PlanBadge } from '@/app/admin/page';

export const dynamic = 'force-dynamic';

function StatusBadge({ status }) {
  const map = {
    pending:   { bg: 'var(--a-amber-bg)', text: 'var(--a-amber)' },
    confirmed: { bg: 'var(--a-green-bg)', text: 'var(--a-green)' },
    completed: { bg: 'var(--a-hover)',    text: 'var(--a-muted)' },
    cancelled: { bg: 'var(--a-red-bg)',   text: 'var(--a-red)' },
  };
  const s = map[status] ?? map.pending;
  return (
    <span className="text-[9px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-full"
      style={{ backgroundColor: s.bg, color: s.text }}>
      {status}
    </span>
  );
}

function Section({ title, children, count }) {
  return (
    <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: 'var(--a-surface)', borderColor: 'var(--a-border)' }}>
      <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--a-border)' }}>
        <p className="text-[10px] uppercase tracking-widest font-bold" style={{ color: 'var(--a-subtle)' }}>
          {title}{count !== undefined ? ` (${count})` : ''}
        </p>
      </div>
      {children}
    </div>
  );
}

export default async function AdminStudioDetail({ params }) {
  const { id } = await params;

  const { data: studio } = await supabaseAdmin.from('studios').select('*').eq('id', id).single();
  if (!studio) notFound();

  const [{ data: bookings }, { data: galleries }, { data: payments }, { count: photoCount }] = await Promise.all([
    supabaseAdmin.from('bookings').select('*').eq('studio_id', id).order('created_at', { ascending: false }),
    supabaseAdmin.from('galleries').select('id, title, slug, is_locked, created_at').eq('studio_id', id).order('created_at', { ascending: false }),
    supabaseAdmin.from('payments').select('*').eq('studio_id', id).order('created_at', { ascending: false }),
    supabaseAdmin.from('portfolio_photos').select('*', { count: 'exact', head: true }).eq('studio_id', id),
  ]);

  const totalRevenue = (payments ?? []).filter(p => p.status === 'paid').reduce((s, p) => s + Number(p.amount), 0);
  const accent = studio.accent_color || '#F0940A';

  return (
    <div className="space-y-8">

      {/* Back */}
      <Link href="/admin/studios"
        className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold hover:opacity-60 transition-opacity"
        style={{ color: 'var(--a-muted)' }}>
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 19l-7-7 7-7" />
        </svg>
        All Studios
      </Link>

      {/* Studio header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold flex-shrink-0"
            style={{ backgroundColor: `${accent}18`, border: `1.5px solid ${accent}30`, color: accent }}>
            {studio.name?.[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <h1 className="font-serif text-3xl md:text-4xl" style={{ color: 'var(--a-text)' }}>{studio.name}</h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--a-subtle)' }}>{studio.slug}.photostudio.ng</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <PlanBadge plan={studio.plan} />
          <a href={`https://${studio.slug}.photostudio.ng`} target="_blank" rel="noopener noreferrer"
            className="admin-outline-btn text-[10px] uppercase tracking-widest font-bold px-4 py-2 rounded-lg border"
            style={{ borderColor: 'var(--a-border)', color: 'var(--a-muted)' }}>
            Visit Site ↗
          </a>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Bookings',         value: bookings?.length ?? 0 },
          { label: 'Galleries',        value: galleries?.length ?? 0 },
          { label: 'Portfolio Photos', value: photoCount ?? 0 },
          { label: 'Revenue',          value: `₦${totalRevenue.toLocaleString()}`, accent: 'var(--a-green)' },
        ].map(s => (
          <div key={s.label} className="rounded-xl border p-5" style={{ backgroundColor: 'var(--a-surface)', borderColor: 'var(--a-border)' }}>
            <p className="text-[10px] uppercase tracking-widest font-bold mb-3" style={{ color: 'var(--a-subtle)' }}>{s.label}</p>
            <p className="font-serif text-3xl" style={{ color: s.accent || 'var(--a-text)' }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Studio info */}
      <Section title="Studio Info">
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: 'Email',     value: studio.email },
            { label: 'Phone',     value: studio.phone },
            { label: 'Location',  value: studio.location },
            { label: 'Instagram', value: studio.instagram_url },
            { label: 'Signed up', value: new Date(studio.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' }) },
          ].filter(f => f.value).map(field => (
            <div key={field.label} className="flex items-start gap-3">
              <p className="text-[10px] uppercase tracking-widest font-bold w-20 flex-shrink-0 pt-0.5" style={{ color: 'var(--a-subtle)' }}>
                {field.label}
              </p>
              <p className="text-sm break-all" style={{ color: 'var(--a-muted)' }}>{field.value}</p>
            </div>
          ))}
          {studio.accent_color && (
            <div className="flex items-start gap-3">
              <p className="text-[10px] uppercase tracking-widest font-bold w-20 flex-shrink-0 pt-0.5" style={{ color: 'var(--a-subtle)' }}>Accent</p>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: studio.accent_color, borderColor: 'var(--a-border)' }} />
                <p className="text-sm" style={{ color: 'var(--a-muted)' }}>{studio.accent_color}</p>
              </div>
            </div>
          )}
        </div>
        {studio.bio && (
          <div className="px-6 pb-6 border-t" style={{ borderColor: 'var(--a-border)' }}>
            <p className="text-[10px] uppercase tracking-widest font-bold mb-2 mt-5" style={{ color: 'var(--a-subtle)' }}>Bio</p>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--a-muted)' }}>{studio.bio}</p>
          </div>
        )}
      </Section>

      {/* Bookings */}
      <Section title="Bookings" count={bookings?.length ?? 0}>
        {bookings && bookings.length > 0 ? (
          <div>
            {bookings.map(b => (
              <div key={b.id} className="admin-row px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b last:border-b-0"
                style={{ borderColor: 'var(--a-divider)' }}>
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--a-text)' }}>{b.client_name}</p>
                  <p className="text-[11px] mt-0.5" style={{ color: 'var(--a-subtle)' }}>
                    {b.client_email}
                    {b.session_date && ` · ${new Date(b.session_date).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {b.deposit_paid && <span className="text-[10px] font-bold" style={{ color: 'var(--a-green)' }}>Deposit ✓</span>}
                  {b.balance_paid && <span className="text-[10px] font-bold" style={{ color: 'var(--a-green)' }}>Balance ✓</span>}
                  <StatusBadge status={b.status} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="px-6 py-8 text-sm text-center" style={{ color: 'var(--a-subtle)' }}>No bookings yet.</p>
        )}
      </Section>

      {/* Galleries */}
      <Section title="Galleries" count={galleries?.length ?? 0}>
        {galleries && galleries.length > 0 ? (
          <div>
            {galleries.map(g => (
              <div key={g.id} className="admin-row px-6 py-4 flex items-center justify-between border-b last:border-b-0"
                style={{ borderColor: 'var(--a-divider)' }}>
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--a-text)' }}>{g.title}</p>
                  <p className="text-[11px]" style={{ color: 'var(--a-subtle)' }}>/gallery/{g.slug}</p>
                </div>
                <span className="text-[9px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: g.is_locked ? 'var(--a-red-bg)' : 'var(--a-green-bg)', color: g.is_locked ? 'var(--a-red)' : 'var(--a-green)' }}>
                  {g.is_locked ? 'Locked' : 'Unlocked'}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="px-6 py-8 text-sm text-center" style={{ color: 'var(--a-subtle)' }}>No galleries yet.</p>
        )}
      </Section>

      {/* Payments */}
      {payments && payments.length > 0 && (
        <Section title="Payments" count={payments.length}>
          <div>
            {payments.map(p => (
              <div key={p.id} className="admin-row px-6 py-4 flex items-center justify-between border-b last:border-b-0"
                style={{ borderColor: 'var(--a-divider)' }}>
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--a-text)' }}>₦{Number(p.amount).toLocaleString()}</p>
                  <p className="text-[11px]" style={{ color: 'var(--a-subtle)' }}>{p.type} · {p.paystack_reference}</p>
                </div>
                <span className="text-[9px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: p.status === 'paid' ? 'var(--a-green-bg)' : 'var(--a-amber-bg)', color: p.status === 'paid' ? 'var(--a-green)' : 'var(--a-amber)' }}>
                  {p.status}
                </span>
              </div>
            ))}
          </div>
        </Section>
      )}

    </div>
  );
}
