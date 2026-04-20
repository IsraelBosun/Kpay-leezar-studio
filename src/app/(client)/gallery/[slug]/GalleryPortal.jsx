'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';

export default function GalleryPortal({ gallery, photos, studioName, accentColor, isLocked }) {
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [selectorName, setSelectorName] = useState('');
  const [selectorRole, setSelectorRole] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [nameStep, setNameStep] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const isOpen = lightboxIndex !== null;
  const currentPhoto = isOpen ? photos[lightboxIndex] : null;

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);

  const goNext = useCallback(() => {
    setLightboxIndex(i => (i + 1) % photos.length);
  }, [photos.length]);

  const goPrev = useCallback(() => {
    setLightboxIndex(i => (i - 1 + photos.length) % photos.length);
  }, [photos.length]);

  useEffect(() => {
    if (!isOpen) return;
    function onKey(e) {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, closeLightbox, goNext, goPrev]);

  // Lock body scroll when lightbox is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Touch swipe for mobile
  useEffect(() => {
    if (!isOpen) return;
    let startX = null;
    function onTouchStart(e) { startX = e.touches[0].clientX; }
    function onTouchEnd(e) {
      if (startX === null) return;
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) diff > 0 ? goNext() : goPrev();
      startX = null;
    }
    window.addEventListener('touchstart', onTouchStart);
    window.addEventListener('touchend', onTouchEnd);
    return () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [isOpen, goNext, goPrev]);

  function toggleSelect(photoId) {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(photoId) ? next.delete(photoId) : next.add(photoId);
      return next;
    });
  }

  async function submitSelections() {
    if (!selectorName.trim() || selectedIds.size === 0) return;
    setSubmitting(true);
    const payload = Array.from(selectedIds).map(photoId => ({
      gallery_id: gallery.id,
      photo_id: photoId,
      selector_name: selectorName.trim(),
      selector_role: selectorRole || null,
    }));
    await fetch('/api/galleries/selections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    setSubmitting(false);
    setSubmitted(true);
  }

  function shareWhatsApp() {
    const text = `My photo selections from ${gallery.title} (${studioName}):\n${selectedIds.size} photos selected.\n\nView gallery: ${window.location.href}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-6 text-center">
        <div className="space-y-5 max-w-md">
          <div className="w-16 h-16 mx-auto flex items-center justify-center" style={{ backgroundColor: accentColor }}>
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="font-serif text-3xl text-white">Selections submitted!</h2>
          <p className="text-white/50">
            {studioName} has received your {selectedIds.size} photo selections and will be in touch soon.
          </p>
          <button
            onClick={shareWhatsApp}
            className="flex items-center gap-2 mx-auto px-6 py-3 text-xs uppercase tracking-widest font-bold text-white bg-[#25D366] hover:bg-[#1da851] transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Share via WhatsApp
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-zinc-950/90 backdrop-blur-sm border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div>
          <p className="font-serif text-lg text-white leading-none">{gallery.title}</p>
          <p className="text-[10px] uppercase tracking-widest font-bold mt-0.5" style={{ color: accentColor }}>
            {studioName}
          </p>
        </div>
        {selectedIds.size > 0 && !nameStep && (
          <button onClick={submitSelections} disabled={submitting}
            className="px-5 py-2.5 text-xs uppercase tracking-widest font-bold text-white transition-colors disabled:opacity-50"
            style={{ backgroundColor: accentColor }}>
            {submitting ? 'Saving...' : `Submit ${selectedIds.size} selection${selectedIds.size !== 1 ? 's' : ''}`}
          </button>
        )}
      </header>

      {/* Name step */}
      {nameStep ? (
        <div className="flex items-center justify-center min-h-[80vh] px-6">
          <div className="w-full max-w-sm space-y-6">
            <div>
              <h2 className="font-serif text-3xl text-white mb-2">Welcome</h2>
              <p className="text-white/50 text-sm">Tell us who you are so we can keep your selections separate from others.</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] uppercase tracking-widest font-bold text-white/40 block mb-2">Your Name *</label>
                <input type="text" value={selectorName} onChange={(e) => setSelectorName(e.target.value)}
                  placeholder="e.g. Adaeze"
                  className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 focus:outline-none focus:border-white/30 font-light placeholder:text-white/20" />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest font-bold text-white/40 block mb-2">Your Role</label>
                <select value={selectorRole} onChange={(e) => setSelectorRole(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/10 text-white px-4 py-3 focus:outline-none focus:border-white/30 font-light">
                  <option value="">— Optional —</option>
                  <option value="bride">Bride</option>
                  <option value="groom">Groom</option>
                  <option value="family">Family</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <button onClick={() => selectorName.trim() && setNameStep(false)}
              disabled={!selectorName.trim()}
              className="w-full py-3.5 text-xs uppercase tracking-widest font-bold text-white transition-colors disabled:opacity-30"
              style={{ backgroundColor: accentColor }}>
              View Photos →
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="px-6 py-4 bg-zinc-900 border-b border-white/5 flex items-center justify-between flex-wrap gap-3">
            <p className="text-sm text-white/60">
              Tap to view · heart to select
              <span className="ml-2 text-white/30">{selectedIds.size} selected</span>
            </p>
            {selectedIds.size > 0 && (
              <button onClick={submitSelections} disabled={submitting}
                className="px-5 py-2 text-xs uppercase tracking-widest font-bold text-white transition-colors disabled:opacity-50"
                style={{ backgroundColor: accentColor }}>
                {submitting ? 'Saving...' : `Submit ${selectedIds.size}`}
              </button>
            )}
          </div>

          {photos.length === 0 ? (
            <div className="flex items-center justify-center min-h-[60vh]">
              <p className="text-white/30 font-serif text-2xl">No photos yet.</p>
            </div>
          ) : (
            <div className="p-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {photos.map((photo, index) => {
                const isSelected = selectedIds.has(photo.id);
                return (
                  <button key={photo.id} onClick={() => setLightboxIndex(index)}
                    className={`relative aspect-square overflow-hidden transition-all duration-200 ${
                      isSelected ? 'ring-2 ring-offset-1 ring-offset-zinc-950' : ''
                    }`}
                    style={isSelected ? { ringColor: accentColor } : {}}>
                    <Image src={photo.thumbnail_url} alt={photo.file_name || ''} fill
                      className="object-cover transition-all duration-300 brightness-75 hover:brightness-100"
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                      unoptimized />
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center shadow-lg"
                        style={{ backgroundColor: accentColor }}>
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                        </svg>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {isLocked && (
            <div className="fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-white/10 px-6 py-4">
              <p className="text-sm text-white/50 text-center">🔒 Full-resolution downloads unlock after payment.</p>
            </div>
          )}
        </>
      )}

      {/* Lightbox */}
      {isOpen && currentPhoto && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
          {/* Top bar */}
          <div className="flex items-center justify-between px-4 py-3 flex-shrink-0">
            <span className="text-white/40 text-xs tabular-nums">
              {lightboxIndex + 1} / {photos.length}
            </span>
            <div className="flex items-center gap-3">
              {/* Select toggle */}
              <button
                onClick={() => toggleSelect(currentPhoto.id)}
                className="flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-widest font-bold transition-colors"
                style={
                  selectedIds.has(currentPhoto.id)
                    ? { backgroundColor: accentColor, color: '#fff' }
                    : { backgroundColor: 'rgba(255,255,255,0.1)', color: '#fff' }
                }
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
                {selectedIds.has(currentPhoto.id) ? 'Selected' : 'Select'}
              </button>
              {/* Close */}
              <button onClick={closeLightbox}
                className="w-9 h-9 flex items-center justify-center text-white/60 hover:text-white transition-colors bg-white/10 hover:bg-white/20">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Image */}
          <div className="flex-1 relative flex items-center justify-center min-h-0">
            {/* Prev */}
            {photos.length > 1 && (
              <button onClick={goPrev}
                className="absolute left-2 z-10 w-10 h-10 flex items-center justify-center bg-black/50 hover:bg-black/80 text-white transition-colors rounded-full">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}

            <div className="relative w-full h-full">
              <Image
                key={currentPhoto.id}
                src={currentPhoto.thumbnail_url}
                alt={currentPhoto.file_name || ''}
                fill
                className="object-contain"
                sizes="100vw"
                unoptimized
              />
            </div>

            {/* Next */}
            {photos.length > 1 && (
              <button onClick={goNext}
                className="absolute right-2 z-10 w-10 h-10 flex items-center justify-center bg-black/50 hover:bg-black/80 text-white transition-colors rounded-full">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>

          {/* Bottom filename */}
          <div className="flex-shrink-0 px-4 py-3 text-center">
            <p className="text-white/30 text-xs truncate">{currentPhoto.file_name}</p>
          </div>
        </div>
      )}
    </div>
  );
}
