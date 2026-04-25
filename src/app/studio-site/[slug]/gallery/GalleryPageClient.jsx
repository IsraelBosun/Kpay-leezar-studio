'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export default function GalleryPageClient({ studio, photos }) {
  const accent = studio.accent_color || '#F0940A';
  const [activeFilter, setActiveFilter] = useState('All');
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const touchStartX = useRef(null);
  const filterRef = useRef(null);

  const categories = ['All', ...Array.from(new Set(photos.map(p => p.category).filter(Boolean)))];
  const filtered = activeFilter === 'All' ? photos : photos.filter(p => p.category === activeFilter);

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

  // Scroll active filter tab into view
  useEffect(() => {
    if (!filterRef.current) return;
    const active = filterRef.current.querySelector('[data-active="true"]');
    if (active) active.scrollIntoView({ inline: 'center', behavior: 'smooth', block: 'nearest' });
  }, [activeFilter]);

  // Lightbox swipe handlers
  function onTouchStart(e) { touchStartX.current = e.touches[0].clientX; }
  function onTouchEnd(e) {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) < 40) return;
    if (dx < 0) setLightboxIndex(i => (i + 1) % filtered.length);
    else setLightboxIndex(i => (i - 1 + filtered.length) % filtered.length);
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans">

      {/* ── Header ── */}
      <header className="sticky top-0 z-50 bg-zinc-950/95 backdrop-blur-md border-b border-white/8">
        <div className="max-w-7xl mx-auto px-4 md:px-10 flex items-center justify-between h-14 md:h-16 gap-4">

          {/* Back */}
          <Link href="/"
            className="flex items-center gap-2 group flex-shrink-0 py-3 pr-3 -ml-1">
            <span className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 group-hover:bg-white/10 group-active:scale-90 transition-all duration-200">
              <svg className="w-4 h-4 text-white/60 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 19l-7-7 7-7" />
              </svg>
            </span>
            <span className="hidden sm:block text-[10px] uppercase tracking-widest font-bold text-white/40 group-hover:text-white transition-colors">Back</span>
          </Link>

          {/* Studio name — centre */}
          <div className="flex flex-col items-center flex-1 min-w-0">
            {studio.logo_url ? (
              <img src={studio.logo_url} alt={studio.name} className="h-7 md:h-8 w-auto object-contain" />
            ) : (
              <>
                <span className="font-serif text-base md:text-lg tracking-tight text-white leading-none truncate max-w-[160px]">{studio.name}</span>
                <span className="text-[7px] uppercase tracking-[0.3em] font-bold hidden sm:block" style={{ color: accent }}>Photography</span>
              </>
            )}
          </div>

          {/* Book CTA */}
          <Link
            href="/#contact"
            className="flex-shrink-0 text-[10px] uppercase tracking-widest font-bold px-4 py-2.5 text-white transition-all active:scale-95 rounded-sm"
            style={{ backgroundColor: accent }}>
            Book
          </Link>
        </div>
      </header>

      {/* ── Hero text ── */}
      <div className="pt-10 md:pt-20 pb-8 md:pb-12 px-5 md:px-10 max-w-7xl mx-auto">
        <p className="text-[10px] uppercase tracking-[0.4em] font-bold mb-3" style={{ color: accent }}>Portfolio</p>
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
          <h1 className="font-serif text-4xl md:text-6xl">Our Work</h1>
          <p className="text-white/40 text-sm max-w-xs leading-relaxed">
            {photos.length} {photos.length === 1 ? 'photograph' : 'photographs'}
            {categories.length > 2 && ` · ${categories.length - 1} categories`}
          </p>
        </div>
      </div>

      {/* ── Category filters — horizontally scrollable on mobile ── */}
      {categories.length > 1 && (
        <div
          ref={filterRef}
          className="flex gap-2 overflow-x-auto px-5 md:px-10 pb-2 mb-8 max-w-7xl mx-auto [&::-webkit-scrollbar]:hidden"
          style={{ scrollbarWidth: 'none' }}>
          {categories.map(cat => (
            <button
              key={cat}
              data-active={activeFilter === cat}
              onClick={() => setActiveFilter(cat)}
              className="flex-shrink-0 text-[9px] uppercase tracking-widest font-bold px-5 py-2.5 border transition-all duration-200 active:scale-95 rounded-sm"
              style={activeFilter === cat
                ? { backgroundColor: accent, borderColor: accent, color: '#fff' }
                : { color: 'rgba(255,255,255,0.4)', borderColor: 'rgba(255,255,255,0.15)' }}>
              {cat}
              {cat !== 'All' && (
                <span className="ml-1.5 opacity-50">{photos.filter(p => p.category === cat).length}</span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* ── Photo grid ── */}
      <div className="px-5 md:px-10 max-w-7xl mx-auto pb-24">
        {filtered.length === 0 ? (
          <div className="py-32 text-center text-white/30 text-sm">No photos in this category yet.</div>
        ) : (
          <div className="columns-2 md:columns-3 lg:columns-4 gap-1.5 space-y-1.5">
            {filtered.map((photo, i) => (
              <button
                key={photo.id}
                onClick={() => setLightboxIndex(i)}
                className="relative w-full overflow-hidden group bg-zinc-900 focus:outline-none block break-inside-avoid transition-transform duration-200 active:scale-[0.96]"
                style={{ touchAction: 'manipulation' }}>
                <img
                  src={photo.thumbnail_url || photo.src}
                  alt={photo.category || ''}
                  className="w-full object-cover transition-all duration-700 brightness-75 group-hover:brightness-100 group-active:brightness-90"
                  loading="lazy"
                />
                {/* Hover/tap overlay */}
                <div
                  className="absolute inset-0 flex items-end opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity duration-300"
                  style={{ background: `linear-gradient(to top, ${accent}80, transparent 55%)` }}>
                  {photo.category && (
                    <p className="text-[9px] uppercase tracking-widest font-bold text-white px-3 pb-3">{photo.category}</p>
                  )}
                </div>
                {/* Tap flash — instant white ripple on press */}
                <div className="absolute inset-0 bg-white/0 active:bg-white/10 transition-colors duration-100 pointer-events-none" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <footer className="border-t px-8 py-8 text-center" style={{ borderColor: `${accent}20` }}>
        <p className="text-[10px] text-white/20 uppercase tracking-widest">
          Powered by <span style={{ color: accent }}>photostudio.ng</span>
        </p>
      </footer>

      {/* ── Lightbox ── */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-[200] bg-black/97"
          onClick={() => setLightboxIndex(null)}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}>

          {/* Prev */}
          <button
            onClick={(e) => { e.stopPropagation(); setLightboxIndex(i => (i - 1 + filtered.length) % filtered.length); }}
            className="absolute left-3 md:left-8 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-auto md:h-auto flex items-center justify-center rounded-full bg-white/10 md:bg-transparent md:p-3 text-white/60 hover:text-white active:scale-90 transition-all">
            <svg className="w-5 h-5 md:w-7 md:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <img
            src={filtered[lightboxIndex]?.src || filtered[lightboxIndex]?.thumbnail_url}
            alt=""
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 max-h-[85vh] max-w-[88vw] object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()} />

          {/* Next */}
          <button
            onClick={(e) => { e.stopPropagation(); setLightboxIndex(i => (i + 1) % filtered.length); }}
            className="absolute right-3 md:right-8 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-auto md:h-auto flex items-center justify-center rounded-full bg-white/10 md:bg-transparent md:p-3 text-white/60 hover:text-white active:scale-90 transition-all">
            <svg className="w-5 h-5 md:w-7 md:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Close */}
          <button
            onClick={() => setLightboxIndex(null)}
            className="absolute top-4 right-4 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 active:scale-90 transition-all text-white/70 hover:text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Counter + category */}
          <div className="absolute bottom-5 left-0 right-0 flex flex-col items-center gap-1 pointer-events-none">
            {filtered[lightboxIndex]?.category && (
              <p className="text-[10px] uppercase tracking-widest font-bold" style={{ color: accent }}>
                {filtered[lightboxIndex].category}
              </p>
            )}
            <p className="text-[10px] uppercase tracking-widest text-white/25">
              {lightboxIndex + 1} / {filtered.length}
            </p>
            <p className="text-[10px] text-white/20 mt-1 md:hidden">swipe to navigate</p>
          </div>
        </div>
      )}
    </div>
  );
}
