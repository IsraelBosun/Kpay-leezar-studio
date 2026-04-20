import { createServerSupabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';

export default async function StudioSitePage({ params }) {
  const { slug } = await params;
  const supabase = await createServerSupabase();

  const { data: studio } = await supabase
    .from('studios')
    .select('*, services(*)')
    .eq('slug', slug)
    .single();

  const { data: portfolioPhotos } = await supabase
    .from('portfolio_photos')
    .select('*')
    .eq('studio_id', studio?.id)
    .order('sort_order', { ascending: true });

  if (!studio) notFound();

  const accent = studio.accent_color || '#D30E15';
  const services = studio.services?.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)) ?? [];
  const portfolio = portfolioPhotos ?? [];
  const categories = ['All', ...Array.from(new Set(portfolio.map(p => p.category).filter(Boolean)))];

  return (
    <div style={{ '--accent': accent }} className="min-h-screen bg-zinc-950 text-white font-sans">

      {/* Nav */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-5 bg-zinc-950/80 backdrop-blur-sm border-b border-white/5">
        <div className="flex items-center gap-3">
          {studio.logo_url && (
            <img src={studio.logo_url} alt={studio.name} className="w-9 h-9 object-contain" />
          )}
          <div className="flex flex-col items-start">
            <span className="font-serif text-xl tracking-tight text-white leading-none">{studio.name}</span>
            <span className="text-[7px] uppercase tracking-[0.3em] font-bold" style={{ color: accent }}>
              Photography
            </span>
          </div>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          {portfolio.length > 0 && (
            <a href="#portfolio" className="text-[10px] uppercase tracking-widest font-bold text-white/50 hover:text-white transition-colors">
              Work
            </a>
          )}
          {['Services', 'Contact'].map((l) => (
            <a key={l} href={`#${l.toLowerCase()}`}
              className="text-[10px] uppercase tracking-widest font-bold text-white/50 hover:text-white transition-colors">
              {l}
            </a>
          ))}
          <a href="#contact"
            className="text-[10px] uppercase tracking-widest font-bold px-5 py-2.5 text-white transition-colors"
            style={{ backgroundColor: accent }}>
            Book Now
          </a>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-24">
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950" />
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        <div className="relative z-10 space-y-6 max-w-3xl">
          <p className="text-[10px] uppercase tracking-[0.4em] font-bold" style={{ color: accent }}>
            {studio.location}
          </p>
          <h1 className="font-serif text-6xl md:text-8xl leading-none tracking-tight">
            {studio.name}
          </h1>
          <p className="text-white/50 text-lg font-light max-w-xl mx-auto leading-relaxed">
            {studio.bio || 'Capturing moments that last forever.'}
          </p>
          <div className="flex items-center justify-center gap-4 pt-4">
            <a href="#contact"
              className="px-8 py-4 text-xs uppercase tracking-widest font-bold text-white transition-all hover:opacity-90"
              style={{ backgroundColor: accent }}>
              Book a Session
            </a>
            {services.length > 0 && (
              <a href="#services"
                className="px-8 py-4 text-xs uppercase tracking-widest font-bold text-white/60 border border-white/10 hover:border-white/30 hover:text-white transition-all">
                View Services
              </a>
            )}
          </div>
        </div>
        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30">
          <div className="w-px h-12 bg-white" />
          <p className="text-[9px] uppercase tracking-widest">Scroll</p>
        </div>
      </section>

      {/* Portfolio */}
      {portfolio.length > 0 && (
        <section id="portfolio" className="py-32 px-6 md:px-16 max-w-6xl mx-auto">
          <div className="mb-12">
            <p className="text-[10px] uppercase tracking-[0.4em] font-bold mb-3" style={{ color: accent }}>
              Portfolio
            </p>
            <h2 className="font-serif text-4xl md:text-5xl">Our Work</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {portfolio.map((photo) => (
              <div key={photo.id} className="relative aspect-square overflow-hidden group bg-zinc-900">
                <img
                  src={photo.thumbnail_url || photo.src}
                  alt={photo.category || ''}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 brightness-90 group-hover:brightness-100"
                />
                {photo.category && (
                  <div className="absolute bottom-0 left-0 right-0 px-3 py-2 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <p className="text-[9px] uppercase tracking-widest font-bold text-white/70">{photo.category}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Services */}
      {services.length > 0 && (
        <section id="services" className="py-32 px-6 md:px-16 max-w-6xl mx-auto">
          <div className="mb-16">
            <p className="text-[10px] uppercase tracking-[0.4em] font-bold mb-3" style={{ color: accent }}>
              What We Offer
            </p>
            <h2 className="font-serif text-4xl md:text-5xl">Services</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-px bg-white/5">
            {services.map((s, i) => (
              <div key={s.id} className="bg-zinc-950 p-10 group hover:bg-zinc-900 transition-colors">
                <p className="text-xs font-bold uppercase tracking-widest mb-6 opacity-20">
                  {String(i + 1).padStart(2, '0')}
                </p>
                <h3 className="font-serif text-2xl mb-3">{s.title}</h3>
                {s.description && (
                  <p className="text-white/40 text-sm leading-relaxed mb-8">{s.description}</p>
                )}
                {s.price > 0 && (
                  <p className="text-sm font-bold" style={{ color: accent }}>
                    From ₦{Number(s.price).toLocaleString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Contact / Booking */}
      <section id="contact" className="py-32 px-6">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <p className="text-[10px] uppercase tracking-[0.4em] font-bold" style={{ color: accent }}>
            Get In Touch
          </p>
          <h2 className="font-serif text-4xl md:text-5xl">Let's work together</h2>
          <p className="text-white/40 leading-relaxed">
            Ready to book a session or have questions? Reach out below.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            {studio.phone && (
              <a
                href={`https://wa.me/${studio.phone.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-8 py-4 text-xs uppercase tracking-widest font-bold text-white transition-all hover:opacity-90 w-full sm:w-auto justify-center"
                style={{ backgroundColor: accent }}>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp Us
              </a>
            )}
            {studio.email && (
              <a href={`mailto:${studio.email}`}
                className="flex items-center gap-3 px-8 py-4 text-xs uppercase tracking-widest font-bold text-white/60 border border-white/10 hover:border-white/30 hover:text-white transition-all w-full sm:w-auto justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Send Email
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 px-8 py-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex flex-col items-start mb-3">
              <span className="font-serif text-lg tracking-tight text-white leading-none">{studio.name}</span>
              <span className="text-[7px] uppercase tracking-[0.3em] font-bold" style={{ color: accent }}>Photography</span>
            </div>
            {studio.location && (
              <p className="text-xs text-white/30 uppercase tracking-widest">{studio.location}</p>
            )}
          </div>

          <div className="flex flex-col gap-2 text-xs text-white/30">
            {studio.email && (
              <a href={`mailto:${studio.email}`} className="hover:text-white/60 transition-colors flex items-center gap-2">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {studio.email}
              </a>
            )}
            {studio.phone && (
              <a href={`tel:${studio.phone}`} className="hover:text-white/60 transition-colors flex items-center gap-2">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {studio.phone}
              </a>
            )}
          </div>

          <p className="text-[10px] text-white/20 uppercase tracking-widest">
            Powered by{' '}
            <span style={{ color: accent }}>photostudio.ng</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
