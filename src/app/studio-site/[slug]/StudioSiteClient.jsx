'use client';

import { useState, useEffect, useRef } from 'react';
import { THEMES, resolveConfig } from '@/lib/themes';

export default function StudioSiteClient({ studio, portfolio, services, websiteConfig }) {
  const accent = studio.accent_color || '#F0940A';
  const config = resolveConfig(websiteConfig);
  const theme = THEMES[config.theme] || THEMES.light;

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const heroRef = useRef(null);

  const [form, setForm] = useState({ client_name: '', client_email: '', client_phone: '', service_id: '', session_date: '', notes: '' });
  const [formLoading, setFormLoading] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState(null);

  const categories = ['All', ...Array.from(new Set(portfolio.map(p => p.category).filter(Boolean)))];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (lightboxIndex === null) return;
      if (e.key === 'Escape') setLightboxIndex(null);
      if (e.key === 'ArrowRight') setLightboxIndex(i => (i + 1) % portfolio.length);
      if (e.key === 'ArrowLeft') setLightboxIndex(i => (i - 1 + portfolio.length) % portfolio.length);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxIndex, portfolio.length]);

  useEffect(() => {
    document.body.style.overflow = (lightboxIndex !== null || menuOpen) ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [lightboxIndex, menuOpen]);

  const heroPortfolioPhoto = config.hero_photo_id
    ? portfolio.find(p => p.id === config.hero_photo_id)
    : portfolio[0];
  const heroPhoto = heroPortfolioPhoto?.thumbnail_url || heroPortfolioPhoto?.src || null;

  async function handleBooking(e) {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studio_slug: studio.slug, ...form }),
      });
      const data = await res.json();
      if (!res.ok) setFormError(data.error || 'Something went wrong.');
      else setFormSuccess(true);
    } catch {
      setFormError('Could not send. Please try again.');
    } finally {
      setFormLoading(false);
    }
  }

  const isFullscreen = config.hero_style === 'fullscreen';

  return (
    <div style={{ backgroundColor: theme.bg, color: theme.text }} className="min-h-screen font-sans">

      {/* ── Nav ── */}
      <header
        style={{
          backgroundColor: scrolled ? theme.navScrolled : 'transparent',
          borderColor: theme.border,
        }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 backdrop-blur-md ${scrolled ? 'border-b py-3' : 'py-5'}`}>
        <div className="max-w-7xl mx-auto px-5 md:px-10 flex items-center justify-between">
          <a href="#" className="flex flex-col items-start">
            {studio.logo_url ? (
              <img src={studio.logo_url} alt={studio.name} className="h-8 w-auto object-contain" />
            ) : (
              <>
                <span className="font-serif text-lg md:text-xl tracking-tight leading-none"
                  style={{ color: isFullscreen && !scrolled ? '#ffffff' : theme.text }}>
                  {studio.name}
                </span>
                <span className="text-[7px] uppercase tracking-[0.3em] font-bold" style={{ color: accent }}>Photography</span>
              </>
            )}
          </a>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {portfolio.length > 0 && (
              <a href="/gallery" style={{ color: theme.textMuted }}
                className="text-[10px] uppercase tracking-widest font-bold hover:opacity-100 transition-opacity">Gallery</a>
            )}
            {services.length > 0 && (
              <a href="#services" style={{ color: theme.textMuted }}
                className="text-[10px] uppercase tracking-widest font-bold hover:opacity-100 transition-opacity">Services</a>
            )}
            <a href="#contact" style={{ color: theme.textMuted }}
              className="text-[10px] uppercase tracking-widest font-bold hover:opacity-100 transition-opacity">Contact</a>
            <a href="#contact"
              className="text-[10px] uppercase tracking-widest font-bold px-5 py-2.5 text-white transition-all hover:opacity-80"
              style={{ backgroundColor: accent }}>
              Book Now
            </a>
          </nav>

          {/* Hamburger — two bars that morph to X */}
          <button onClick={() => setMenuOpen(o => !o)} className="md:hidden p-2 -mr-1 flex flex-col justify-center items-center w-10 h-10" aria-label="Menu">
            <span className={`block w-6 h-[1.5px] transition-all duration-300 origin-center ${menuOpen ? 'rotate-45 translate-y-[3.5px]' : ''}`}
              style={{ backgroundColor: isFullscreen && !scrolled ? '#ffffff' : theme.text }} />
            <span className={`block w-6 h-[1.5px] mt-[5px] transition-all duration-300 origin-center ${menuOpen ? '-rotate-45 -translate-y-[3.5px]' : ''}`}
              style={{ backgroundColor: isFullscreen && !scrolled ? '#ffffff' : theme.text }} />
          </button>
        </div>
      </header>

      {/* ── Mobile fullscreen overlay ── */}
      <div
        className={`md:hidden fixed inset-0 z-[60] flex flex-col transition-all duration-500 ${menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        style={{ backgroundColor: theme.bg }}>

        {/* Top bar: logo + close */}
        <div className="flex items-center justify-between px-5 py-5">
          <a href="#" onClick={() => setMenuOpen(false)} className="flex flex-col items-start">
            {studio.logo_url ? (
              <img src={studio.logo_url} alt={studio.name} className="h-8 w-auto object-contain" />
            ) : (
              <>
                <span className="font-serif text-lg tracking-tight leading-none" style={{ color: theme.text }}>{studio.name}</span>
                <span className="text-[7px] uppercase tracking-[0.3em] font-bold" style={{ color: accent }}>Photography</span>
              </>
            )}
          </a>
          <button onClick={() => setMenuOpen(false)} className="p-2 -mr-1 w-10 h-10 flex items-center justify-center" aria-label="Close">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: theme.text }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Accent divider */}
        <div className="mx-5 h-px" style={{ backgroundColor: `${accent}30` }} />

        {/* Nav links — large serif, staggered */}
        <nav className="flex-1 flex flex-col justify-center px-6 gap-1">
          {[
            ...(portfolio.length > 0 ? [{ label: 'Gallery', href: '/gallery' }] : []),
            ...(services.length > 0 ? [{ label: 'Services', href: '#services' }] : []),
            { label: 'Contact', href: '#contact' },
          ].map((link, i) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="font-serif text-5xl leading-tight py-3 border-b transition-all duration-500"
              style={{
                color: theme.text,
                borderColor: `${theme.border}`,
                transitionDelay: menuOpen ? `${80 + i * 60}ms` : '0ms',
                transform: menuOpen ? 'translateY(0)' : 'translateY(12px)',
                opacity: menuOpen ? 1 : 0,
              }}>
              {link.label}
              <span className="block text-[10px] font-sans uppercase tracking-widest mt-0.5" style={{ color: accent }}>→</span>
            </a>
          ))}
        </nav>

        {/* Bottom CTA */}
        <div className="px-5 pb-10 pt-6 space-y-3">
          <a
            href="#contact"
            onClick={() => setMenuOpen(false)}
            className="flex items-center justify-center gap-2 w-full py-4 text-xs uppercase tracking-widest font-bold text-white transition-all duration-500"
            style={{
              backgroundColor: accent,
              transitionDelay: menuOpen ? '320ms' : '0ms',
              opacity: menuOpen ? 1 : 0,
              transform: menuOpen ? 'translateY(0)' : 'translateY(8px)',
            }}>
            Book a Session
          </a>
          {(studio.email || studio.phone) && (
            <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1" style={{ color: theme.textMuted }}>
              {studio.email && (
                <a href={`mailto:${studio.email}`} className="text-[11px] opacity-60 hover:opacity-100 transition-opacity">{studio.email}</a>
              )}
              {studio.phone && (
                <a href={`tel:${studio.phone}`} className="text-[11px] opacity-60 hover:opacity-100 transition-opacity">{studio.phone}</a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Hero: Fullscreen ── */}
      {isFullscreen && (
        <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center text-center px-5 overflow-hidden">
          {heroPhoto ? (
            <>
              <div className="absolute inset-0">
                <img src={heroPhoto} alt="" className="w-full h-full object-cover"
                  style={{ animation: 'kenBurns 20s ease-in-out infinite alternate' }} />
              </div>
              <div className="absolute inset-0 bg-black/50" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/30" />
            </>
          ) : (
            <div className="absolute inset-0" style={{ backgroundColor: '#111', background: `radial-gradient(ellipse at 60% 40%, ${accent}25 0%, transparent 60%)` }} />
          )}

          <div className="relative z-10 space-y-5 max-w-2xl text-white" style={{ textShadow: '0 2px 16px rgba(0,0,0,0.6)' }}>
            {studio.location && (
              <p className="text-[10px] uppercase tracking-[0.4em] font-bold" style={{ color: accent }}>{studio.location}</p>
            )}
            <h1 className="font-serif text-5xl sm:text-6xl md:text-8xl leading-[1.05] tracking-tight">{studio.name}</h1>
            <p className="text-white/60 text-base md:text-lg font-light max-w-md mx-auto leading-relaxed">
              {studio.bio || 'Capturing moments that last forever.'}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <a href="#contact"
                className="w-full sm:w-auto px-8 py-4 text-xs uppercase tracking-widest font-bold text-white text-center transition-all hover:opacity-80"
                style={{ backgroundColor: accent }}>
                Book a Session
              </a>
              {services.length > 0 && (
                <a href="#services"
                  className="w-full sm:w-auto px-8 py-4 text-xs uppercase tracking-widest font-bold text-white/60 border border-white/20 hover:border-white/50 hover:text-white text-center transition-all">
                  View Services
                </a>
              )}
            </div>
          </div>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30">
            <div className="w-px h-10 bg-white animate-pulse" />
            <p className="text-[9px] uppercase tracking-widest text-white">Scroll</p>
          </div>
        </section>
      )}

      {/* ── Hero: Minimal ── */}
      {!isFullscreen && (
        <section className="pt-36 md:pt-44 pb-16 md:pb-24 px-5 text-center" style={{ backgroundColor: theme.bg }}>
          <div className="max-w-2xl mx-auto space-y-5">
            {studio.location && (
              <p className="text-[10px] uppercase tracking-[0.4em] font-bold" style={{ color: accent }}>{studio.location}</p>
            )}
            <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl leading-[1.05] tracking-tight" style={{ color: theme.text }}>
              {studio.name}
            </h1>
            <p className="text-base md:text-lg font-light max-w-md mx-auto leading-relaxed" style={{ color: theme.textMuted }}>
              {studio.bio || 'Capturing moments that last forever.'}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <a href="#contact"
                className="w-full sm:w-auto px-8 py-4 text-xs uppercase tracking-widest font-bold text-white text-center transition-all hover:opacity-80"
                style={{ backgroundColor: accent }}>
                Book a Session
              </a>
              {services.length > 0 && (
                <a href="#services"
                  className="w-full sm:w-auto px-8 py-4 text-xs uppercase tracking-widest font-bold text-center transition-all"
                  style={{ border: `1px solid ${theme.border}`, color: theme.textMuted }}>
                  View Services
                </a>
              )}
            </div>
            <div className="mx-auto mt-6 w-12 h-0.5 rounded-full" style={{ backgroundColor: accent }} />
          </div>
        </section>
      )}

      {/* ── Marquee strip ── */}
      {categories.length > 1 && (
        <div className="overflow-hidden border-y py-3" style={{ borderColor: `${accent}25` }}>
          <div className="flex gap-6 animate-marquee whitespace-nowrap">
            {[...categories, ...categories, ...categories].map((cat, i) => (
              <span key={i} className="text-[9px] uppercase tracking-[0.35em] font-bold flex items-center gap-6">
                <span style={{ color: theme.textMuted }}>{cat}</span>
                <span style={{ color: accent }}>✦</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Portfolio preview ── */}
      {portfolio.length > 0 && (
        <section id="portfolio" className="py-14 md:py-24 px-5 md:px-12 max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-8 md:mb-12 gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.4em] font-bold mb-2" style={{ color: accent }}>Portfolio</p>
              <h2 className="font-serif text-3xl md:text-5xl" style={{ color: theme.text }}>Our Work</h2>
            </div>
            <a href="/gallery"
              className="flex-shrink-0 text-[10px] uppercase tracking-widest font-bold flex items-center gap-1.5 transition-opacity hover:opacity-100 opacity-40"
              style={{ color: theme.text }}>
              View All
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>

          {/* Masonry layout */}
          {config.portfolio_layout === 'masonry' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1 md:gap-1.5">
              {portfolio.slice(0, 8).map((photo, i) => (
                <button key={photo.id} onClick={() => setLightboxIndex(i)}
                  className="relative aspect-square overflow-hidden group bg-zinc-200 focus:outline-none">
                  <img src={photo.thumbnail_url || photo.src} alt={photo.category || ''}
                    className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-all duration-300 flex items-end">
                    {photo.category && (
                      <p className="text-[9px] uppercase tracking-widest font-bold text-white px-2.5 pb-2.5 opacity-0 group-hover:opacity-100 transition-opacity">{photo.category}</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Grid layout */}
          {config.portfolio_layout === 'grid' && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
              {portfolio.slice(0, 9).map((photo, i) => (
                <button key={photo.id} onClick={() => setLightboxIndex(i)}
                  className="relative aspect-square overflow-hidden group bg-zinc-200 focus:outline-none rounded-sm">
                  <img src={photo.thumbnail_url || photo.src} alt={photo.category || ''}
                    className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-all duration-300 flex items-end">
                    {photo.category && (
                      <p className="text-[9px] uppercase tracking-widest font-bold text-white px-3 pb-3 opacity-0 group-hover:opacity-100 transition-opacity">{photo.category}</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {portfolio.length > (config.portfolio_layout === 'grid' ? 9 : 8) && (
            <div className="mt-8 text-center">
              <a href="/gallery"
                className="inline-flex items-center gap-2 px-6 py-3.5 text-xs uppercase tracking-widest font-bold transition-all"
                style={{ border: `1px solid ${theme.border}`, color: theme.textMuted }}>
                View Full Gallery
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          )}
        </section>
      )}

      {/* ── Services ── */}
      {config.show_services && services.length > 0 && (
        <section id="services" className="py-14 md:py-24 px-5 md:px-12" style={{ backgroundColor: theme.surface }}>
          <div className="max-w-7xl mx-auto">
            <div className="mb-10 md:mb-14">
              <p className="text-[10px] uppercase tracking-[0.4em] font-bold mb-2" style={{ color: accent }}>What We Offer</p>
              <h2 className="font-serif text-3xl md:text-5xl" style={{ color: theme.text }}>Services</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px" style={{ backgroundColor: theme.border }}>
              {services.map((s, i) => (
                <div key={s.id} className="p-7 md:p-10" style={{ backgroundColor: theme.cardBg }}>
                  <p className="text-xs font-bold uppercase tracking-widest mb-5 opacity-25" style={{ color: theme.text }}>
                    {String(i + 1).padStart(2, '0')}
                  </p>
                  <h3 className="font-serif text-xl md:text-2xl mb-2" style={{ color: theme.text }}>{s.title}</h3>
                  {s.description && (
                    <p className="text-sm leading-relaxed mb-6" style={{ color: theme.textMuted }}>{s.description}</p>
                  )}
                  {s.price > 0 && (
                    <p className="text-sm font-bold" style={{ color: accent }}>
                      From ₦{Number(s.price).toLocaleString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── About ── */}
      {config.show_about && studio.bio && (
        <section className="py-14 md:py-24 px-5 md:px-12 max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
            <div className="space-y-5 order-2 md:order-1">
              <p className="text-[10px] uppercase tracking-[0.4em] font-bold" style={{ color: accent }}>About</p>
              <h2 className="font-serif text-3xl md:text-5xl leading-tight" style={{ color: theme.text }}>
                The Story Behind the Lens
              </h2>
              <p className="leading-relaxed text-sm md:text-base" style={{ color: theme.textMuted }}>{studio.bio}</p>
              <a href="#contact"
                className="inline-block px-7 py-3.5 text-xs uppercase tracking-widest font-bold text-white transition-all hover:opacity-80"
                style={{ backgroundColor: accent }}>
                Work With Us
              </a>
            </div>

            {/* Photo collage — hidden on mobile to keep layout clean */}
            {portfolio.length > 1 && (
              <div className="order-1 md:order-2">
                {/* Mobile: single wide image */}
                <div className="md:hidden aspect-video overflow-hidden rounded-sm bg-zinc-200">
                  <img src={portfolio[1]?.thumbnail_url || portfolio[1]?.src} alt=""
                    className="w-full h-full object-cover" />
                </div>
                {/* Desktop: collage */}
                <div className="hidden md:grid grid-cols-2 gap-2">
                  {portfolio.slice(1, 5).map((p, i) => (
                    <div key={p.id}
                      className={`relative overflow-hidden bg-zinc-200 ${i === 0 ? 'row-span-2' : ''}`}
                      style={{ aspectRatio: i === 0 ? '3/4' : '1/1' }}>
                      <img src={p.thumbnail_url || p.src} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Booking / Contact ── */}
      {config.show_booking && (
        <section id="contact" className="py-14 md:py-24 px-5" style={{ backgroundColor: theme.surface }}>
          <div className="max-w-xl mx-auto">
            <div className="text-center mb-10">
              <p className="text-[10px] uppercase tracking-[0.4em] font-bold mb-2" style={{ color: accent }}>Book a Session</p>
              <h2 className="font-serif text-3xl md:text-5xl" style={{ color: theme.text }}>Let's work together</h2>
              <p className="mt-3 text-sm leading-relaxed" style={{ color: theme.textMuted }}>
                Fill in the form and we'll be in touch to confirm your booking.
              </p>
            </div>

            {formSuccess ? (
              <div className="text-center py-14 px-6 space-y-4" style={{ border: `1px solid ${theme.border}` }}>
                <div className="w-11 h-11 mx-auto flex items-center justify-center border-2 rounded-full" style={{ borderColor: accent }}>
                  <svg className="w-5 h-5" style={{ color: accent }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="font-serif text-2xl" style={{ color: theme.text }}>Booking request sent!</h3>
                <p className="text-sm" style={{ color: theme.textMuted }}>Check your email. We'll be in touch shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleBooking} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold" style={{ color: theme.textMuted }}>Full Name *</label>
                    <input required type="text" value={form.client_name}
                      onChange={e => setForm(f => ({ ...f, client_name: e.target.value }))}
                      placeholder="Your full name"
                      className="bg-transparent py-3 text-sm focus:outline-none border-b"
                      style={{ borderColor: theme.inputBorder, color: theme.inputText }} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold" style={{ color: theme.textMuted }}>Email *</label>
                    <input required type="email" value={form.client_email}
                      onChange={e => setForm(f => ({ ...f, client_email: e.target.value }))}
                      placeholder="your@email.com"
                      className="bg-transparent py-3 text-sm focus:outline-none border-b"
                      style={{ borderColor: theme.inputBorder, color: theme.inputText }} />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold" style={{ color: theme.textMuted }}>Phone</label>
                    <input type="tel" value={form.client_phone}
                      onChange={e => setForm(f => ({ ...f, client_phone: e.target.value }))}
                      placeholder="+234 800 000 0000"
                      className="bg-transparent py-3 text-sm focus:outline-none border-b"
                      style={{ borderColor: theme.inputBorder, color: theme.inputText }} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold" style={{ color: theme.textMuted }}>Preferred Date</label>
                    <input type="date" value={form.session_date}
                      onChange={e => setForm(f => ({ ...f, session_date: e.target.value }))}
                      className="bg-transparent py-3 text-sm focus:outline-none border-b"
                      style={{ borderColor: theme.inputBorder, color: theme.inputText, colorScheme: theme.dark ? 'dark' : 'light' }} />
                  </div>
                </div>

                {services.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold" style={{ color: theme.textMuted }}>Service</label>
                    <select value={form.service_id}
                      onChange={e => setForm(f => ({ ...f, service_id: e.target.value }))}
                      className="py-3 text-sm focus:outline-none appearance-none cursor-pointer border-b"
                      style={{ backgroundColor: theme.selectBg, borderColor: theme.inputBorder, color: theme.inputText }}>
                      <option value="">Select a service (optional)</option>
                      {services.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.title}{s.price > 0 ? ` — ₦${Number(s.price).toLocaleString()}` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold" style={{ color: theme.textMuted }}>Message</label>
                  <textarea rows={4} value={form.notes}
                    onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    placeholder="Tell us about your shoot — location, style, occasion..."
                    className="bg-transparent py-3 text-sm focus:outline-none resize-none border-b"
                    style={{ borderColor: theme.inputBorder, color: theme.inputText }} />
                </div>

                {formError && (
                  <p className="text-xs px-4 py-3 rounded" style={{ color: '#dc2626', backgroundColor: '#fef2f2', border: '1px solid #fecaca' }}>{formError}</p>
                )}

                <div className="flex flex-col sm:flex-row gap-3 pt-1">
                  <button type="submit" disabled={formLoading}
                    className="flex-1 py-4 text-xs uppercase tracking-widest font-bold text-white transition-all hover:opacity-80 disabled:opacity-40"
                    style={{ backgroundColor: accent }}>
                    {formLoading ? 'Sending...' : 'Send Booking Request'}
                  </button>
                  {studio.phone && (
                    <a href={`https://wa.me/${studio.phone.replace(/[^0-9]/g, '')}`}
                      target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 px-5 py-4 text-xs uppercase tracking-widest font-bold transition-all"
                      style={{ border: `1px solid ${theme.border}`, color: theme.textMuted }}>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                      WhatsApp
                    </a>
                  )}
                </div>
              </form>
            )}
          </div>
        </section>
      )}

      {!config.show_booking && <div id="contact" />}

      {/* ── Footer ── */}
      <footer className="border-t px-5 md:px-12 py-10" style={{ borderColor: theme.border, backgroundColor: theme.bg }}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex flex-col items-start mb-2">
              <span className="font-serif text-lg tracking-tight leading-none" style={{ color: theme.text }}>{studio.name}</span>
              <span className="text-[7px] uppercase tracking-[0.3em] font-bold" style={{ color: accent }}>Photography</span>
            </div>
            {studio.location && (
              <p className="text-xs uppercase tracking-widest mt-1" style={{ color: theme.textMuted }}>{studio.location}</p>
            )}
          </div>

          <div className="flex flex-col gap-2 text-xs" style={{ color: theme.textMuted }}>
            {studio.email && (
              <a href={`mailto:${studio.email}`} className="hover:opacity-100 opacity-60 transition-opacity flex items-center gap-2">
                <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {studio.email}
              </a>
            )}
            {studio.phone && (
              <a href={`tel:${studio.phone}`} className="hover:opacity-100 opacity-60 transition-opacity flex items-center gap-2">
                <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {studio.phone}
              </a>
            )}
            {studio.instagram_url && (
              <a href={studio.instagram_url} target="_blank" rel="noopener noreferrer"
                className="hover:opacity-100 opacity-60 transition-opacity flex items-center gap-2">
                <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                Instagram
              </a>
            )}
          </div>

          <a
            href="https://photostudio.ng"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] uppercase tracking-widest hover:opacity-70 transition-opacity"
            style={{ color: theme.textMuted }}>
            Powered by <span style={{ color: accent }}>photostudio.ng</span>
          </a>
        </div>
      </footer>

      {/* ── Lightbox ── */}
      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-[200] bg-black/95"
          onClick={() => setLightboxIndex(null)}>
          <button
            onClick={(e) => { e.stopPropagation(); setLightboxIndex(i => (i - 1 + portfolio.length) % portfolio.length); }}
            className="absolute left-3 md:left-8 top-1/2 -translate-y-1/2 p-3 text-white/60 hover:text-white transition-colors z-10">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <img
            src={portfolio[lightboxIndex]?.src || portfolio[lightboxIndex]?.thumbnail_url}
            alt=""
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 max-h-[85vh] max-w-[90vw] md:max-w-[85vw] object-contain"
            onClick={(e) => e.stopPropagation()} />

          <button
            onClick={(e) => { e.stopPropagation(); setLightboxIndex(i => (i + 1) % portfolio.length); }}
            className="absolute right-3 md:right-8 top-1/2 -translate-y-1/2 p-3 text-white/60 hover:text-white transition-colors z-10">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <button onClick={() => setLightboxIndex(null)}
            className="absolute top-4 right-4 p-3 text-white/60 hover:text-white transition-colors z-10">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <p className="absolute bottom-5 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-widest text-white/30">
            {lightboxIndex + 1} / {portfolio.length}
            {portfolio[lightboxIndex]?.category && ` — ${portfolio[lightboxIndex].category}`}
          </p>
        </div>
      )}

      <style>{`
        @keyframes kenBurns {
          from { transform: scale(1) translate(0, 0); }
          to   { transform: scale(1.08) translate(-1%, -1%); }
        }
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .animate-marquee { animation: marquee 30s linear infinite; }
      `}</style>
    </div>
  );
}
