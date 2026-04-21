'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export default function StudioSiteClient({ studio, portfolio, services }) {
  const accent = studio.accent_color || '#D30E15';
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const heroRef = useRef(null);

  const [form, setForm] = useState({ client_name: '', client_email: '', client_phone: '', service_id: '', session_date: '', notes: '' });
  const [formLoading, setFormLoading] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState(null);

  const categories = ['All', ...Array.from(new Set(portfolio.map(p => p.category).filter(Boolean)))];
  const filtered = activeFilter === 'All' ? portfolio : portfolio.filter(p => p.category === activeFilter);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (lightboxIndex === null) return;
      if (e.key === 'Escape') setLightboxIndex(null);
      if (e.key === 'ArrowRight') setLightboxIndex(i => (i + 1) % filtered.length);
      if (e.key === 'ArrowLeft') setLightboxIndex(i => (i - 1 + filtered.length) % filtered.length);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxIndex, filtered.length]);

  useEffect(() => {
    document.body.style.overflow = lightboxIndex !== null ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [lightboxIndex]);

  const heroPhoto = portfolio[0]?.thumbnail_url || portfolio[0]?.src || null;

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

  return (
    <div style={{ '--accent': accent }} className="min-h-screen bg-zinc-950 text-white font-sans">

      {/* ── Nav ── */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'bg-zinc-950/95 backdrop-blur-md border-b border-white/8 py-4' : 'bg-transparent py-6'
      }`}>
        <div className="max-w-7xl mx-auto px-6 md:px-10 flex items-center justify-between">
          <a href="#" className="flex flex-col items-start group">
            {studio.logo_url ? (
              <img src={studio.logo_url} alt={studio.name} className="h-9 w-auto object-contain" />
            ) : (
              <>
                <span className="font-serif text-xl tracking-tight text-white leading-none">{studio.name}</span>
                <span className="text-[7px] uppercase tracking-[0.3em] font-bold transition-colors" style={{ color: accent }}>
                  Photography
                </span>
              </>
            )}
          </a>

          <nav className="hidden md:flex items-center gap-8">
            {portfolio.length > 0 && (
              <a href="/gallery" className="text-[10px] uppercase tracking-widest font-bold text-white/50 hover:text-white transition-colors">Gallery</a>
            )}
            {services.length > 0 && (
              <a href="#services" className="text-[10px] uppercase tracking-widest font-bold text-white/50 hover:text-white transition-colors">Services</a>
            )}
            <a href="#contact" className="text-[10px] uppercase tracking-widest font-bold text-white/50 hover:text-white transition-colors">Contact</a>
            <a href="#contact"
              className="text-[10px] uppercase tracking-widest font-bold px-5 py-2.5 text-white transition-all hover:opacity-80"
              style={{ backgroundColor: accent }}>
              Book Now
            </a>
          </nav>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(o => !o)}
            className="md:hidden flex flex-col gap-1.5 p-2"
            aria-label="Menu">
            <span className={`block w-6 h-px bg-white transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block w-6 h-px bg-white transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-6 h-px bg-white transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>

        {/* Mobile menu */}
        <div className={`md:hidden transition-all duration-300 overflow-hidden ${menuOpen ? 'max-h-72 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="bg-zinc-950 border-t border-white/8 px-6 py-6 flex flex-col gap-5">
            {portfolio.length > 0 && (
              <a href="/gallery" onClick={() => setMenuOpen(false)} className="text-[10px] uppercase tracking-widest font-bold text-white/60">Gallery</a>
            )}
            {services.length > 0 && (
              <a href="#services" onClick={() => setMenuOpen(false)} className="text-[10px] uppercase tracking-widest font-bold text-white/60">Services</a>
            )}
            <a href="#contact" onClick={() => setMenuOpen(false)} className="text-[10px] uppercase tracking-widest font-bold text-white/60">Contact</a>
            <a href="#contact" onClick={() => setMenuOpen(false)}
              className="text-[10px] uppercase tracking-widest font-bold px-5 py-3 text-white text-center"
              style={{ backgroundColor: accent }}>
              Book Now
            </a>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden">
        {heroPhoto ? (
          <>
            <div className="absolute inset-0">
              <img
                src={heroPhoto}
                alt=""
                className="w-full h-full object-cover opacity-40"
                style={{ animation: 'kenBurns 20s ease-in-out infinite alternate' }}
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/60 via-zinc-950/40 to-zinc-950" />
          </>
        ) : (
          <>
            <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950" />
            <div className="absolute inset-0 opacity-[0.03]"
              style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
            <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at 60% 40%, ${accent}20 0%, transparent 60%)` }} />
          </>
        )}

        <div className="relative z-10 space-y-6 max-w-3xl">
          {studio.location && (
            <p className="text-[10px] uppercase tracking-[0.4em] font-bold" style={{ color: accent }}>
              {studio.location}
            </p>
          )}
          <h1 className="font-serif text-6xl md:text-8xl leading-none tracking-tight">
            {studio.name}
          </h1>
          <p className="text-white/60 text-lg font-light max-w-xl mx-auto leading-relaxed">
            {studio.bio || 'Capturing moments that last forever.'}
          </p>
          <div className="flex items-center justify-center gap-4 pt-4">
            <a href="#contact"
              className="px-8 py-4 text-xs uppercase tracking-widest font-bold text-white transition-all hover:opacity-80"
              style={{ backgroundColor: accent }}>
              Book a Session
            </a>
            {services.length > 0 && (
              <a href="#services"
                className="px-8 py-4 text-xs uppercase tracking-widest font-bold text-white/60 border border-white/15 hover:border-white/40 hover:text-white transition-all">
                View Services
              </a>
            )}
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30">
          <div className="w-px h-12 bg-white animate-pulse" />
          <p className="text-[9px] uppercase tracking-widest">Scroll</p>
        </div>
      </section>

      {/* ── Marquee strip ── */}
      {portfolio.length > 0 && (
        <div className="overflow-hidden border-y py-4" style={{ borderColor: `${accent}30` }}>
          <div className="flex gap-8 animate-marquee whitespace-nowrap">
            {[...categories, ...categories, ...categories].map((cat, i) => (
              <span key={i} className="text-[9px] uppercase tracking-[0.4em] font-bold flex items-center gap-8">
                <span className="opacity-30 text-white">{cat}</span>
                <span style={{ color: accent }}>—</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Portfolio preview ── */}
      {portfolio.length > 0 && (
        <section id="portfolio" className="py-32 px-6 md:px-16 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12 gap-6">
            <div>
              <p className="text-[10px] uppercase tracking-[0.4em] font-bold mb-3" style={{ color: accent }}>Portfolio</p>
              <h2 className="font-serif text-4xl md:text-5xl">Our Work</h2>
            </div>
            <a href="/gallery"
              className="text-[10px] uppercase tracking-widest font-bold text-white/40 hover:text-white transition-colors flex items-center gap-2 self-start md:self-auto">
              View All
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1.5">
            {portfolio.slice(0, 8).map((photo, i) => (
              <button
                key={photo.id}
                onClick={() => setLightboxIndex(i)}
                className="relative aspect-square overflow-hidden group bg-zinc-900 focus:outline-none"
              >
                <img
                  src={photo.thumbnail_url || photo.src}
                  alt={photo.category || ''}
                  className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105 brightness-75 group-hover:brightness-100"
                />
                <div className="absolute inset-0 flex items-end opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: `linear-gradient(to top, ${accent}60, transparent)` }}>
                  {photo.category && (
                    <p className="text-[9px] uppercase tracking-widest font-bold text-white px-3 pb-3">{photo.category}</p>
                  )}
                </div>
              </button>
            ))}
          </div>

          {portfolio.length > 8 && (
            <div className="mt-10 text-center">
              <a href="/gallery"
                className="inline-flex items-center gap-3 px-8 py-4 text-xs uppercase tracking-widest font-bold text-white/60 border border-white/15 hover:border-white/40 hover:text-white transition-all">
                View Full Gallery
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          )}
        </section>
      )}

      {/* ── Services ── */}
      {services.length > 0 && (
        <section id="services" className="py-32 px-6 md:px-16 max-w-7xl mx-auto">
          <div className="mb-16">
            <p className="text-[10px] uppercase tracking-[0.4em] font-bold mb-3" style={{ color: accent }}>What We Offer</p>
            <h2 className="font-serif text-4xl md:text-5xl">Services</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/5">
            {services.map((s, i) => (
              <div key={s.id} className="bg-zinc-950 p-10 group hover:bg-zinc-900/80 transition-colors">
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

      {/* ── About ── */}
      {studio.bio && (
        <section className="py-32 px-6 md:px-16 max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <p className="text-[10px] uppercase tracking-[0.4em] font-bold" style={{ color: accent }}>About</p>
              <h2 className="font-serif text-4xl md:text-5xl leading-tight">The Story Behind<br />the Lens</h2>
              <p className="text-white/50 leading-relaxed">{studio.bio}</p>
              <a href="#contact"
                className="inline-block px-8 py-4 text-xs uppercase tracking-widest font-bold text-white transition-all hover:opacity-80"
                style={{ backgroundColor: accent }}>
                Work With Us
              </a>
            </div>
            {portfolio.length > 1 && (
              <div className="grid grid-cols-2 gap-2">
                {portfolio.slice(1, 5).map((p, i) => (
                  <div key={p.id} className={`relative overflow-hidden bg-zinc-900 ${i === 0 ? 'row-span-2' : ''}`}
                    style={{ aspectRatio: i === 0 ? '3/4' : '1/1' }}>
                    <img src={p.thumbnail_url || p.src} alt="" className="w-full h-full object-cover brightness-75" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Booking / Contact ── */}
      <section id="contact" className="py-32 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[10px] uppercase tracking-[0.4em] font-bold mb-3" style={{ color: accent }}>Book a Session</p>
            <h2 className="font-serif text-4xl md:text-5xl">Let's work together</h2>
            <p className="text-white/40 mt-4 leading-relaxed">Fill in the form and we'll be in touch to confirm your booking.</p>
          </div>

          {formSuccess ? (
            <div className="text-center py-16 px-8 border border-white/10 space-y-4">
              <div className="w-12 h-12 mx-auto flex items-center justify-center border-2" style={{ borderColor: accent }}>
                <svg className="w-5 h-5" style={{ color: accent }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="font-serif text-2xl text-white">Booking request sent!</h3>
              <p className="text-white/40 text-sm">Check your email for a confirmation. We'll be in touch shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleBooking} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-white/40">Full Name *</label>
                  <input
                    required
                    type="text"
                    value={form.client_name}
                    onChange={e => setForm(f => ({ ...f, client_name: e.target.value }))}
                    placeholder="Your full name"
                    className="bg-transparent border-b border-white/20 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-white/60 transition-colors text-sm"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-white/40">Email *</label>
                  <input
                    required
                    type="email"
                    value={form.client_email}
                    onChange={e => setForm(f => ({ ...f, client_email: e.target.value }))}
                    placeholder="your@email.com"
                    className="bg-transparent border-b border-white/20 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-white/60 transition-colors text-sm"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-white/40">Phone</label>
                  <input
                    type="tel"
                    value={form.client_phone}
                    onChange={e => setForm(f => ({ ...f, client_phone: e.target.value }))}
                    placeholder="+234 800 000 0000"
                    className="bg-transparent border-b border-white/20 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-white/60 transition-colors text-sm"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-white/40">Preferred Date</label>
                  <input
                    type="date"
                    value={form.session_date}
                    onChange={e => setForm(f => ({ ...f, session_date: e.target.value }))}
                    className="bg-transparent border-b border-white/20 py-3 text-white/60 focus:outline-none focus:border-white/60 transition-colors text-sm [color-scheme:dark]"
                  />
                </div>
              </div>

              {services.length > 0 && (
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-white/40">Service</label>
                  <select
                    value={form.service_id}
                    onChange={e => setForm(f => ({ ...f, service_id: e.target.value }))}
                    className="bg-zinc-900 border-b border-white/20 py-3 text-white/60 focus:outline-none focus:border-white/60 transition-colors text-sm appearance-none cursor-pointer"
                  >
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
                <label className="text-[10px] uppercase tracking-widest font-bold text-white/40">Message</label>
                <textarea
                  rows={4}
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Tell us about your shoot — location, style, occasion..."
                  className="bg-transparent border-b border-white/20 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-white/60 transition-colors text-sm resize-none"
                />
              </div>

              {formError && (
                <p className="text-xs text-red-400 bg-red-950/30 border border-red-900/40 px-4 py-3">{formError}</p>
              )}

              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 py-4 text-xs uppercase tracking-widest font-bold text-white transition-all hover:opacity-80 disabled:opacity-40"
                  style={{ backgroundColor: accent }}>
                  {formLoading ? 'Sending...' : 'Send Booking Request'}
                </button>
                {studio.phone && (
                  <a
                    href={`https://wa.me/${studio.phone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-6 py-4 text-xs uppercase tracking-widest font-bold text-white/60 border border-white/15 hover:border-white/40 hover:text-white transition-all">
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

      {/* ── Footer ── */}
      <footer className="border-t px-8 py-12" style={{ borderColor: `${accent}20` }}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
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
            Powered by <span style={{ color: accent }}>photostudio.ng</span>
          </p>
        </div>
      </footer>

      {/* ── Lightbox ── */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
          onClick={() => setLightboxIndex(null)}
        >
          <button
            onClick={(e) => { e.stopPropagation(); setLightboxIndex(i => (i - 1 + filtered.length) % filtered.length); }}
            className="absolute left-4 md:left-8 p-3 text-white/60 hover:text-white transition-colors z-10">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <img
            src={filtered[lightboxIndex]?.src || filtered[lightboxIndex]?.thumbnail_url}
            alt=""
            className="max-h-[85vh] max-w-[85vw] object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          <button
            onClick={(e) => { e.stopPropagation(); setLightboxIndex(i => (i + 1) % filtered.length); }}
            className="absolute right-4 md:right-8 p-3 text-white/60 hover:text-white transition-colors z-10">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <button
            onClick={() => setLightboxIndex(null)}
            className="absolute top-4 right-4 p-3 text-white/60 hover:text-white transition-colors z-10">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-widest text-white/30">
            {lightboxIndex + 1} / {filtered.length}
            {filtered[lightboxIndex]?.category && ` — ${filtered[lightboxIndex].category}`}
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
