'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';

export default function GalleryPortal({
  gallery, photos, deliveryPhotos, studioName, logoUrl,
  studioTheme, accentColor, isLocked, downloadsEnabled, initialHeartCounts,
}) {
  const deliveryMode = downloadsEnabled && deliveryPhotos.length > 0;

  // ── Theme shortcuts ────────────────────────────────────────────────
  const bg         = studioTheme?.bg         ?? '#0a0a0a';
  const surface    = studioTheme?.surface    ?? '#111111';
  const text       = studioTheme?.text       ?? '#ffffff';
  const textMuted  = studioTheme?.textMuted  ?? 'rgba(255,255,255,0.45)';
  const border     = studioTheme?.border     ?? 'rgba(255,255,255,0.08)';
  const inputBg    = studioTheme?.surface    ?? '#111111';
  const inputBorder= studioTheme?.inputBorder?? 'rgba(255,255,255,0.2)';
  const inputText  = studioTheme?.inputText  ?? '#ffffff';
  const isDark     = studioTheme?.dark       ?? true;

  // ── Hearts state ───────────────────────────────────────────────────
  const [heartCounts, setHeartCounts] = useState(initialHeartCounts ?? {});
  const [myHearts, setMyHearts] = useState(new Set());
  const [heartingId, setHeartingId] = useState(null);

  // ── Selection/name state ───────────────────────────────────────────
  const [selectorName, setSelectorName] = useState('');
  const [selectorRole, setSelectorRole] = useState('');
  const [nameStep, setNameStep] = useState(true);

  // ── Stagger fade-in ────────────────────────────────────────────────
  const [visible, setVisible] = useState(new Set());
  useEffect(() => {
    if (nameStep) return;
    const allPhotos = deliveryMode ? deliveryPhotos : photos;
    allPhotos.forEach((p, i) => {
      setTimeout(() => setVisible(prev => new Set([...prev, p.id])), i * 55);
    });
  }, [nameStep, deliveryMode]);

  // ── Lightbox state ─────────────────────────────────────────────────
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const isOpen = lightboxIndex !== null;
  const activePhotos = deliveryMode ? deliveryPhotos : photos;
  const currentPhoto = isOpen ? activePhotos[lightboxIndex] : null;

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const goNext = useCallback(() => setLightboxIndex(i => (i + 1) % activePhotos.length), [activePhotos.length]);
  const goPrev = useCallback(() => setLightboxIndex(i => (i - 1 + activePhotos.length) % activePhotos.length), [activePhotos.length]);

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

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Touch swipe in lightbox
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

  // ── Enter gallery: load this person's previous hearts ──────────────
  async function handleEnterGallery() {
    if (!selectorName.trim()) return;
    setNameStep(false);
    try {
      const res = await fetch(`/api/galleries/hearts?gallery_id=${gallery.id}&selector_name=${encodeURIComponent(selectorName.trim())}`);
      const data = await res.json();
      if (data.myHearts) setMyHearts(new Set(data.myHearts));
      if (data.counts) setHeartCounts(data.counts);
    } catch { /* keep initial counts */ }
  }

  // ── Toggle heart ───────────────────────────────────────────────────
  async function toggleHeart(photoId) {
    if (!selectorName.trim() || heartingId === photoId) return;
    setHeartingId(photoId);

    // Optimistic update
    const wasHearted = myHearts.has(photoId);
    setMyHearts(prev => {
      const next = new Set(prev);
      wasHearted ? next.delete(photoId) : next.add(photoId);
      return next;
    });
    setHeartCounts(prev => ({
      ...prev,
      [photoId]: Math.max(0, (prev[photoId] || 0) + (wasHearted ? -1 : 1)),
    }));

    try {
      const res = await fetch('/api/galleries/hearts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gallery_id: gallery.id, photo_id: photoId, selector_name: selectorName.trim() }),
      });
      const data = await res.json();
      // Reconcile with server count
      setHeartCounts(prev => ({ ...prev, [photoId]: data.count ?? prev[photoId] }));
    } catch {
      // Revert on error
      setMyHearts(prev => {
        const next = new Set(prev);
        wasHearted ? next.add(photoId) : next.delete(photoId);
        return next;
      });
      setHeartCounts(prev => ({
        ...prev,
        [photoId]: Math.max(0, (prev[photoId] || 0) + (wasHearted ? 1 : -1)),
      }));
    } finally {
      setHeartingId(null);
    }
  }

  function downloadPhoto(photo) {
    const a = document.createElement('a');
    a.href = `/api/download?photo_id=${photo.id}`;
    a.download = photo.file_name || 'photo.jpg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  // ── Shared header ──────────────────────────────────────────────────
  const Header = ({ right }) => (
    <header className="sticky top-0 z-30 backdrop-blur-sm border-b px-4 sm:px-6 py-4"
      style={{ background: `${surface}f0`, borderColor: border }}>
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {logoUrl ? (
            <img src={logoUrl} alt={studioName} className="h-7 w-auto object-contain flex-shrink-0" />
          ) : (
            <p className="font-serif text-base leading-none" style={{ color: text }}>{studioName}</p>
          )}
          <div style={{ width: 1, height: 20, background: border }} className="flex-shrink-0" />
          <p className="text-xs font-medium truncate" style={{ color: textMuted }}>{gallery.title}</p>
        </div>
        {right}
      </div>
    </header>
  );

  // ── Heart button component ─────────────────────────────────────────
  const HeartButton = ({ photo, size = 'md' }) => {
    const hearted = myHearts.has(photo.id);
    const count = heartCounts[photo.id] || 0;
    const isLoading = heartingId === photo.id;
    const btnSize = size === 'sm' ? 'w-7 h-7' : 'w-9 h-9';
    const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';
    return (
      <button
        onClick={(e) => { e.stopPropagation(); toggleHeart(photo.id); }}
        disabled={isLoading}
        className={`${btnSize} flex items-center justify-center rounded-full transition-all duration-200 focus:outline-none disabled:opacity-60 ${hearted ? 'scale-110' : 'hover:scale-110'}`}
        style={{ background: hearted ? accentColor : 'rgba(0,0,0,0.45)', touchAction: 'manipulation' }}
        aria-label={hearted ? 'Unheart' : 'Heart'}>
        <svg className={`${iconSize} text-white ${isLoading ? 'animate-pulse' : ''}`}
          fill={hearted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
        {count > 0 && (
          <span className="absolute -top-1.5 -right-1.5 text-[9px] font-bold text-white rounded-full w-4 h-4 flex items-center justify-center"
            style={{ background: accentColor }}>
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>
    );
  };

  // ── Name step ──────────────────────────────────────────────────────
  if (nameStep) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: bg }}>
        <Header right={null} />
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-sm space-y-7">
            <div>
              <h2 className="font-serif text-3xl mb-2" style={{ color: text }}>Welcome</h2>
              <p className="text-sm" style={{ color: textMuted }}>
                Tell us who you are so your hearts are saved when you come back.
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] uppercase tracking-widest font-bold block mb-2" style={{ color: textMuted }}>
                  Your Name *
                </label>
                <input
                  type="text"
                  value={selectorName}
                  onChange={e => setSelectorName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && selectorName.trim() && handleEnterGallery()}
                  placeholder="e.g. Adaeze"
                  autoFocus
                  style={{ background: inputBg, borderColor: inputBorder, color: inputText }}
                  className="w-full border px-4 py-3 focus:outline-none font-light text-sm"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold" style={{ color: textMuted }}>Your Role</label>
                  <span className="text-[10px]" style={{ color: textMuted }}>{selectorRole.length}/10</span>
                </div>
                <input
                  type="text"
                  value={selectorRole}
                  onChange={e => setSelectorRole(e.target.value)}
                  maxLength={10}
                  placeholder="e.g. Bride, Friend… (optional)"
                  style={{ background: inputBg, borderColor: inputBorder, color: inputText }}
                  className="w-full border px-4 py-3 focus:outline-none font-light text-sm"
                />
              </div>
            </div>
            <button
              onClick={handleEnterGallery}
              disabled={!selectorName.trim()}
              className="w-full py-3.5 text-xs uppercase tracking-widest font-bold text-white transition-opacity hover:opacity-80 disabled:opacity-30"
              style={{ backgroundColor: accentColor }}>
              View Photos →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Delivery mode ──────────────────────────────────────────────────
  if (deliveryMode) {
    return (
      <div className="min-h-screen" style={{ background: bg }}>
        <Header right={
          <div className="text-right">
            <p className="text-xs font-bold" style={{ color: text }}>{deliveryPhotos.length} photo{deliveryPhotos.length !== 1 ? 's' : ''}</p>
            <p className="text-[10px]" style={{ color: textMuted }}>Ready to download</p>
          </div>
        } />

        <div className="max-w-6xl mx-auto px-3 sm:px-6 py-6">
          <div className="flex items-center gap-3 px-5 py-4 mb-6 border"
            style={{ background: surface, borderColor: border }}>
            <div className="w-8 h-8 flex items-center justify-center flex-shrink-0" style={{ backgroundColor: accentColor }}>
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold" style={{ color: text }}>Your photos are ready</p>
              <p className="text-xs" style={{ color: textMuted }}>Tap any photo to view full screen, or tap the download icon.</p>
            </div>
          </div>

          {/* Masonry grid */}
          <div className="columns-2 sm:columns-3 lg:columns-4 gap-2">
            {deliveryPhotos.map((photo, index) => (
              <div key={photo.id} className="break-inside-avoid mb-2 relative group overflow-hidden cursor-pointer"
                style={{
                  opacity: visible.has(photo.id) ? 1 : 0,
                  transform: visible.has(photo.id) ? 'none' : 'translateY(10px)',
                  transition: `opacity 0.4s ease, transform 0.4s ease`,
                }}
                onClick={() => setLightboxIndex(index)}>
                <img src={photo.thumbnail_url} alt={photo.file_name || ''} className="w-full h-auto block transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-all duration-300" />
                <button
                  onClick={(e) => { e.stopPropagation(); downloadPhoto(photo); }}
                  className="absolute bottom-2 right-2 z-10 w-8 h-8 flex items-center justify-center bg-black/60 hover:bg-black/80 text-white transition-all duration-200 rounded-full opacity-0 group-hover:opacity-100"
                  style={{ touchAction: 'manipulation' }}
                  aria-label="Download">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Lightbox */}
        {isOpen && currentPhoto && (
          <Lightbox photo={currentPhoto} index={lightboxIndex} total={deliveryPhotos.length}
            onClose={closeLightbox} onNext={goNext} onPrev={goPrev}
            extra={
              <button onClick={() => downloadPhoto(currentPhoto)}
                className="flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-widest font-bold text-white bg-white/10 hover:bg-white/20 transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download
              </button>
            }
          />
        )}
      </div>
    );
  }

  // ── Selection / hearts mode ────────────────────────────────────────
  const totalHearts = Object.values(heartCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen" style={{ background: bg }}>
      <Header right={
        totalHearts > 0 ? (
          <div className="flex items-center gap-1.5 text-xs" style={{ color: textMuted }}>
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24" style={{ color: accentColor }}>
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
            <span>{totalHearts} heart{totalHearts !== 1 ? 's' : ''}</span>
          </div>
        ) : null
      } />

      {/* Hint bar */}
      <div className="px-4 sm:px-6 py-3 border-b flex items-center justify-between gap-4 text-xs"
        style={{ background: surface, borderColor: border, color: textMuted }}>
        <span>Tap the heart to save your favourites · tap any photo to view</span>
        {myHearts.size > 0 && (
          <span className="font-bold flex-shrink-0" style={{ color: accentColor }}>
            {myHearts.size} hearted
          </span>
        )}
      </div>

      {photos.length === 0 ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="font-serif text-2xl" style={{ color: textMuted }}>No photos yet.</p>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto px-2 sm:px-4 py-4">
          {/* Masonry grid */}
          <div className="columns-2 sm:columns-3 lg:columns-4 gap-2">
            {photos.map((photo, index) => {
              const hearted = myHearts.has(photo.id);
              const count = heartCounts[photo.id] || 0;
              return (
                <div key={photo.id}
                  className="break-inside-avoid mb-2 relative group overflow-hidden cursor-pointer"
                  style={{
                    opacity: visible.has(photo.id) ? 1 : 0,
                    transform: visible.has(photo.id) ? 'none' : 'translateY(10px)',
                    transition: `opacity 0.45s ease, transform 0.45s ease`,
                    outline: hearted ? `2px solid ${accentColor}` : 'none',
                    outlineOffset: '2px',
                  }}
                  onClick={() => setLightboxIndex(index)}>

                  <img src={photo.thumbnail_url} alt={photo.file_name || ''}
                    className="w-full h-auto block transition-transform duration-500 group-hover:scale-105" />

                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Heart button + count */}
                  <div className="absolute bottom-2 left-2 flex items-center gap-1.5 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => toggleHeart(photo.id)}
                      disabled={heartingId === photo.id}
                      className={`w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200 focus:outline-none ${hearted ? 'scale-110' : 'hover:scale-110'}`}
                      style={{ background: hearted ? accentColor : 'rgba(0,0,0,0.55)', touchAction: 'manipulation' }}
                      aria-label={hearted ? 'Unheart' : 'Heart'}>
                      <svg className={`w-3.5 h-3.5 text-white ${heartingId === photo.id ? 'animate-pulse' : ''}`}
                        fill={hearted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                      </svg>
                    </button>
                    {count > 0 && (
                      <span className="text-[10px] font-bold text-white drop-shadow">{count}</span>
                    )}
                  </div>

                  {/* Always-visible heart badge if hearted by me */}
                  {hearted && (
                    <div className="absolute top-2 right-2 z-10 group-hover:opacity-0 transition-opacity duration-200">
                      <div className="w-6 h-6 flex items-center justify-center rounded-full" style={{ background: accentColor }}>
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {isLocked && (
        <div className="fixed bottom-0 left-0 right-0 border-t px-6 py-4 text-center"
          style={{ background: surface, borderColor: border }}>
          <p className="text-sm" style={{ color: textMuted }}>🔒 Full-resolution downloads unlock after payment.</p>
        </div>
      )}

      {/* Lightbox */}
      {isOpen && currentPhoto && (
        <Lightbox photo={currentPhoto} index={lightboxIndex} total={photos.length}
          onClose={closeLightbox} onNext={goNext} onPrev={goPrev}
          extra={
            <button
              onClick={() => toggleHeart(currentPhoto.id)}
              disabled={heartingId === currentPhoto.id}
              className="flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-widest font-bold text-white transition-colors disabled:opacity-50"
              style={{ backgroundColor: myHearts.has(currentPhoto.id) ? accentColor : 'rgba(255,255,255,0.1)' }}>
              <svg className="w-3.5 h-3.5" fill={myHearts.has(currentPhoto.id) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
              {myHearts.has(currentPhoto.id) ? 'Hearted' : 'Heart'}
              {heartCounts[currentPhoto.id] > 0 && (
                <span className="opacity-60">· {heartCounts[currentPhoto.id]}</span>
              )}
            </button>
          }
        />
      )}
    </div>
  );
}

// ── Shared lightbox component ──────────────────────────────────────────
function Lightbox({ photo, index, total, onClose, onNext, onPrev, extra }) {
  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0 bg-black/60">
        <span className="text-white/40 text-xs tabular-nums">{index + 1} / {total}</span>
        <div className="flex items-center gap-2">
          {extra}
          <button onClick={onClose}
            className="w-9 h-9 flex items-center justify-center text-white/60 hover:text-white transition-colors bg-white/10 hover:bg-white/20">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      <div className="flex-1 relative min-h-0">
        {total > 1 && (
          <button onClick={onPrev} className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center bg-black/50 hover:bg-black/80 text-white transition-colors rounded-full">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
          </button>
        )}
        <div className="relative w-full h-full">
          <Image key={photo.id} src={photo.thumbnail_url} alt={photo.file_name || ''} fill className="object-contain" sizes="100vw" unoptimized />
        </div>
        {total > 1 && (
          <button onClick={onNext} className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center bg-black/50 hover:bg-black/80 text-white transition-colors rounded-full">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
          </button>
        )}
      </div>
      <div className="flex-shrink-0 px-4 py-3 text-center bg-black/60">
        <p className="text-white/30 text-xs truncate">{photo.file_name}</p>
      </div>
    </div>
  );
}
