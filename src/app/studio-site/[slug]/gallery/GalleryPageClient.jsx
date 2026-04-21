'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function GalleryPageClient({ studio, photos }) {
  const accent = studio.accent_color || '#D30E15';
  const [activeFilter, setActiveFilter] = useState('All');
  const [lightboxIndex, setLightboxIndex] = useState(null);

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

  return (
    <div style={{ '--accent': accent }} className="min-h-screen bg-zinc-950 text-white font-sans">

      {/* ── Header ── */}
      <header className="sticky top-0 z-50 bg-zinc-950/95 backdrop-blur-md border-b border-white/8">
        <div className="max-w-7xl mx-auto px-6 md:px-10 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3 group">
            <svg className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-[10px] uppercase tracking-widest font-bold text-white/40 group-hover:text-white transition-colors">Back</span>
          </Link>

          <div className="flex flex-col items-center">
            {studio.logo_url ? (
              <img src={studio.logo_url} alt={studio.name} className="h-8 w-auto object-contain" />
            ) : (
              <>
                <span className="font-serif text-lg tracking-tight text-white leading-none">{studio.name}</span>
                <span className="text-[7px] uppercase tracking-[0.3em] font-bold" style={{ color: accent }}>Photography</span>
              </>
            )}
          </div>

          <Link
            href="#"
            onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0 }); }}
            className="text-[10px] uppercase tracking-widest font-bold px-4 py-2 text-white transition-all hover:opacity-80"
            style={{ backgroundColor: accent }}>
            Book
          </Link>
        </div>
      </header>

      {/* ── Hero text ── */}
      <div className="pt-20 pb-12 px-6 md:px-10 max-w-7xl mx-auto">
        <p className="text-[10px] uppercase tracking-[0.4em] font-bold mb-3" style={{ color: accent }}>Portfolio</p>
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <h1 className="font-serif text-5xl md:text-6xl">Our Work</h1>
          <p className="text-white/40 text-sm max-w-xs leading-relaxed">
            {photos.length} {photos.length === 1 ? 'photograph' : 'photographs'} across {categories.length - 1 || 1} {(categories.length - 1) === 1 ? 'category' : 'categories'}.
          </p>
        </div>
      </div>

      {/* ── Category filters ── */}
      {categories.length > 1 && (
        <div className="px-6 md:px-10 max-w-7xl mx-auto mb-10 flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`text-[9px] uppercase tracking-widest font-bold px-5 py-2.5 border transition-all ${
                activeFilter === cat
                  ? 'text-white border-transparent'
                  : 'text-white/40 border-white/15 hover:text-white/70 hover:border-white/30'
              }`}
              style={activeFilter === cat ? { backgroundColor: accent, borderColor: accent } : {}}
            >
              {cat}
              {cat !== 'All' && (
                <span className="ml-2 opacity-50">
                  {photos.filter(p => p.category === cat).length}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* ── Grid ── */}
      <div className="px-6 md:px-10 max-w-7xl mx-auto pb-24">
        {filtered.length === 0 ? (
          <div className="py-32 text-center text-white/30 text-sm">No photos in this category yet.</div>
        ) : (
          <div className="columns-2 md:columns-3 lg:columns-4 gap-1.5 space-y-1.5">
            {filtered.map((photo, i) => (
              <button
                key={photo.id}
                onClick={() => setLightboxIndex(i)}
                className="relative w-full overflow-hidden group bg-zinc-900 focus:outline-none block break-inside-avoid"
              >
                <img
                  src={photo.thumbnail_url || photo.src}
                  alt={photo.category || ''}
                  className="w-full object-cover transition-all duration-700 group-hover:scale-105 brightness-75 group-hover:brightness-100"
                  loading="lazy"
                />
                <div
                  className="absolute inset-0 flex items-end opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: `linear-gradient(to top, ${accent}70, transparent 50%)` }}
                >
                  {photo.category && (
                    <p className="text-[9px] uppercase tracking-widest font-bold text-white px-3 pb-3">{photo.category}</p>
                  )}
                </div>
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
          className="fixed inset-0 z-[100] bg-black/97 flex items-center justify-center"
          onClick={() => setLightboxIndex(null)}
        >
          <button
            onClick={(e) => { e.stopPropagation(); setLightboxIndex(i => (i - 1 + filtered.length) % filtered.length); }}
            className="absolute left-4 md:left-8 p-3 text-white/50 hover:text-white transition-colors z-10">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <img
            src={filtered[lightboxIndex]?.src || filtered[lightboxIndex]?.thumbnail_url}
            alt=""
            className="max-h-[88vh] max-w-[88vw] object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />

          <button
            onClick={(e) => { e.stopPropagation(); setLightboxIndex(i => (i + 1) % filtered.length); }}
            className="absolute right-4 md:right-8 p-3 text-white/50 hover:text-white transition-colors z-10">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <button
            onClick={() => setLightboxIndex(null)}
            className="absolute top-5 right-5 p-2 text-white/50 hover:text-white transition-colors z-10">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="absolute bottom-6 left-0 right-0 flex flex-col items-center gap-1">
            <p className="text-[10px] uppercase tracking-widest text-white/30">
              {lightboxIndex + 1} / {filtered.length}
              {filtered[lightboxIndex]?.category && (
                <span style={{ color: accent }}> · {filtered[lightboxIndex].category}</span>
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
