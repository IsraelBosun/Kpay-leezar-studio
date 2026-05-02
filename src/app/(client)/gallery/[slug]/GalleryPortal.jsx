'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';

function formatCoverDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  const months = ['JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE','JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER'];
  const day = d.getDate();
  const v = day % 100;
  const suffix = (['TH','ST','ND','RD'])[(v - 20) % 10] || (['TH','ST','ND','RD'])[v] || 'TH';
  return `${months[d.getMonth()]} ${day}${suffix}, ${d.getFullYear()}`;
}

export default function GalleryPortal({
  gallery, photos, deliveryPhotos, studioName,
  studioTheme, accentColor, isLocked, downloadsEnabled, initialHeartCounts,
}) {
  const deliveryMode = downloadsEnabled && deliveryPhotos.length > 0;
  const activePhotos = deliveryMode ? deliveryPhotos : photos;

  // Hearts
  const [heartCounts, setHeartCounts] = useState(initialHeartCounts ?? {});
  const [myHearts,    setMyHearts]    = useState(new Set());
  const [heartingId,  setHeartingId]  = useState(null);

  // Name — asked lazily on first heart attempt
  const [selectorName,   setSelectorName]   = useState('');
  const [selectorRole,   setSelectorRole]   = useState('');
  const [showNameModal,  setShowNameModal]  = useState(false);
  const [pendingHeartId, setPendingHeartId] = useState(null);
  const [nameLoading,    setNameLoading]    = useState(false);

  // Stagger — fires when gallery section scrolls into view
  const [visible,     setVisible]    = useState(new Set());
  const galleryRef = useRef(null);
  const staggered  = useRef(false);

  useEffect(() => {
    const node = galleryRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !staggered.current) {
        staggered.current = true;
        observer.disconnect();
        activePhotos.forEach((p, i) => {
          setTimeout(() => setVisible(prev => new Set([...prev, p.id])), i * 45);
        });
      }
    }, { threshold: 0.05 });
    observer.observe(node);
    return () => observer.disconnect();
  }, [activePhotos.length]);

  // Lightbox
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const isOpen       = lightboxIndex !== null;
  const currentPhoto = isOpen ? activePhotos[lightboxIndex] : null;

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const goNext = useCallback(() => setLightboxIndex(i => (i + 1) % activePhotos.length), [activePhotos.length]);
  const goPrev = useCallback(() => setLightboxIndex(i => (i - 1 + activePhotos.length) % activePhotos.length), [activePhotos.length]);

  useEffect(() => {
    if (!isOpen) return;
    function onKey(e) {
      if (e.key === 'Escape')     closeLightbox();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft')  goPrev();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, closeLightbox, goNext, goPrev]);

  useEffect(() => {
    document.body.style.overflow = (isOpen || showNameModal) ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen, showNameModal]);

  useEffect(() => {
    if (!isOpen) return;
    let startX = null;
    const onTouchStart = (e) => { startX = e.touches[0].clientX; };
    const onTouchEnd   = (e) => {
      if (startX === null) return;
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) diff > 0 ? goNext() : goPrev();
      startX = null;
    };
    window.addEventListener('touchstart', onTouchStart);
    window.addEventListener('touchend', onTouchEnd);
    return () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [isOpen, goNext, goPrev]);

  function scrollToGallery() {
    galleryRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  // Heart attempt — prompts for name if not set yet
  function handleHeartAttempt(photoId) {
    if (!selectorName.trim()) {
      setPendingHeartId(photoId);
      setShowNameModal(true);
      return;
    }
    toggleHeart(photoId);
  }

  async function handleNameSubmit() {
    if (!selectorName.trim()) return;
    setNameLoading(true);
    try {
      const res = await fetch(`/api/galleries/hearts?gallery_id=${gallery.id}&selector_name=${encodeURIComponent(selectorName.trim())}`);
      const data = await res.json();
      if (data.myHearts) setMyHearts(new Set(data.myHearts));
      if (data.counts)   setHeartCounts(data.counts);
    } catch {}
    setNameLoading(false);
    setShowNameModal(false);
    if (pendingHeartId) {
      await toggleHeart(pendingHeartId);
      setPendingHeartId(null);
    }
  }

  async function toggleHeart(photoId) {
    if (!selectorName.trim() || heartingId === photoId) return;
    setHeartingId(photoId);
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
      setHeartCounts(prev => ({ ...prev, [photoId]: data.count ?? prev[photoId] }));
    } catch {
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

  const coverPhoto    = activePhotos[0];
  const shootDate     = gallery.bookings?.session_date || gallery.created_at;
  const formattedDate = formatCoverDate(shootDate);
  const totalHearts   = Object.values(heartCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="bg-white">

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <div className="relative h-svh flex flex-col overflow-hidden" style={{ background: '#0a0a0a' }}>
        {coverPhoto && (
          <img src={coverPhoto.thumbnail_url} alt="" className="absolute inset-0 w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-black/55" />

        {/* Center content */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-8 gap-5">
          <h1 className="text-5xl sm:text-6xl font-bold uppercase tracking-wider text-white leading-tight">
            {gallery.title}
          </h1>
          {formattedDate && (
            <p className="text-[11px] uppercase tracking-[0.35em] text-white/60">{formattedDate}</p>
          )}
          <button
            onClick={scrollToGallery}
            className="mt-3 px-10 py-3.5 border border-white/80 text-white text-[11px] uppercase tracking-widest font-bold hover:bg-white hover:text-black transition-all duration-200"
          >
            View Gallery
          </button>
        </div>

        {/* Studio name */}
        <div className="relative z-10 pb-8 text-center">
          <p className="text-[10px] uppercase tracking-[0.3em] text-white/35">{studioName}</p>
        </div>

        {/* Scroll hint chevron */}
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-10 animate-bounce">
          <svg className="w-5 h-5 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* ── STICKY HEADER (appears once hero scrolls away) ────────────── */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-black leading-tight">{gallery.title}</p>
            <p className="text-[10px] uppercase tracking-widest text-neutral-gray mt-0.5">{studioName}</p>
          </div>
          <div className="flex items-center gap-3">
            {totalHearts > 0 && (
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" style={{ color: accentColor }}>
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
                <span className="text-xs font-bold text-black">{totalHearts}</span>
              </div>
            )}
            {deliveryMode && (
              <div className="text-right">
                <p className="text-[10px] text-neutral-gray">{deliveryPhotos.length} ready</p>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── DELIVERY READY BANNER ─────────────────────────────────────── */}
      {deliveryMode && (
        <div className="flex items-center gap-3 px-4 py-3 bg-green-50 border-b border-green-100">
          <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 bg-green-500 rounded-full">
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-xs text-green-800">Your photos are ready — tap any to view, or tap the download icon to save.</p>
        </div>
      )}

      {/* ── PHOTO GRID ───────────────────────────────────────────────── */}
      <div ref={galleryRef}>
        {activePhotos.length === 0 ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <p className="font-serif text-2xl text-neutral-gray">No photos yet.</p>
          </div>
        ) : (
          <div className="columns-2 sm:columns-3 gap-0.5">
            {activePhotos.map((photo, index) => {
              const hearted = myHearts.has(photo.id);
              const count   = heartCounts[photo.id] || 0;
              return (
                <div key={photo.id}
                  className="break-inside-avoid mb-0.5 relative group overflow-hidden cursor-pointer"
                  style={{
                    opacity:   visible.has(photo.id) ? 1 : 0,
                    transform: visible.has(photo.id) ? 'none' : 'translateY(10px)',
                    transition: 'opacity 0.45s ease, transform 0.45s ease',
                  }}
                  onClick={() => setLightboxIndex(index)}>

                  <img src={photo.thumbnail_url} alt="" className="w-full h-auto block" />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {deliveryMode ? (
                    <button
                      onClick={(e) => { e.stopPropagation(); downloadPhoto(photo); }}
                      className="absolute bottom-2 right-2 z-10 w-8 h-8 flex items-center justify-center bg-black/60 hover:bg-black/80 text-white rounded-full sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                      style={{ touchAction: 'manipulation' }}
                      aria-label="Download">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </button>
                  ) : (
                    <>
                      {/* Heart button — always visible on mobile, hover on desktop */}
                      <div
                        className="absolute bottom-2 left-2 flex items-center gap-1.5 z-10 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200"
                        onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => handleHeartAttempt(photo.id)}
                          disabled={heartingId === photo.id}
                          className={`w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200 focus:outline-none ${hearted ? 'scale-110' : 'hover:scale-110'}`}
                          style={{ background: hearted ? accentColor : 'rgba(0,0,0,0.55)', touchAction: 'manipulation' }}
                          aria-label={hearted ? 'Unheart' : 'Heart'}>
                          <svg className={`w-3.5 h-3.5 text-white ${heartingId === photo.id ? 'animate-pulse' : ''}`}
                            fill={hearted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                          </svg>
                        </button>
                        {hearted && count > 0 && (
                          <span className="text-[10px] font-bold text-white drop-shadow">{count}</span>
                        )}
                      </div>

                      {/* Always-visible hearted badge */}
                      {hearted && (
                        <div className="absolute top-2 right-2 z-10 sm:group-hover:opacity-0 transition-opacity duration-200">
                          <div className="w-6 h-6 flex items-center justify-center rounded-full" style={{ background: accentColor }}>
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                            </svg>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {isLocked && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-4 text-center">
          <p className="text-sm text-neutral-gray">🔒 Full-resolution downloads unlock after payment.</p>
        </div>
      )}

      <div className="py-6 text-center border-t border-gray-100 mt-1">
        <a href="https://photostudio.ng" target="_blank" rel="noopener noreferrer"
          className="text-[10px] uppercase tracking-widest font-bold text-neutral-gray hover:opacity-70 transition-opacity">
          Powered by <span style={{ color: accentColor }}>photostudio.ng</span>
        </a>
      </div>

      {/* ── NAME MODAL (bottom sheet) ─────────────────────────────────── */}
      {showNameModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowNameModal(false)} />
          <div className="relative z-10 w-full sm:max-w-sm bg-white px-6 pt-6 pb-10 sm:pb-6 space-y-4 rounded-t-2xl sm:rounded-none">
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-2 sm:hidden" />
            <div>
              <h3 className="font-serif text-xl text-black">Who are you?</h3>
              <p className="text-xs text-neutral-gray mt-1">Enter your name so your hearts are saved.</p>
            </div>
            <input
              type="text"
              value={selectorName}
              onChange={e => setSelectorName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && selectorName.trim() && handleNameSubmit()}
              placeholder="Your name (e.g. Adaeze)"
              autoFocus
              className="w-full border border-gray-200 px-4 py-3 focus:outline-none text-sm text-black"
            />
            <input
              type="text"
              value={selectorRole}
              onChange={e => setSelectorRole(e.target.value)}
              maxLength={10}
              placeholder="Your role — Bride, Friend… (optional)"
              className="w-full border border-gray-200 px-4 py-3 focus:outline-none text-sm text-black"
            />
            <button
              onClick={handleNameSubmit}
              disabled={!selectorName.trim() || nameLoading}
              className="w-full py-3.5 text-xs uppercase tracking-widest font-bold text-white disabled:opacity-30 transition-opacity"
              style={{ backgroundColor: accentColor }}>
              {nameLoading ? 'Loading…' : 'Continue →'}
            </button>
          </div>
        </div>
      )}

      {/* ── LIGHTBOX ─────────────────────────────────────────────────── */}
      {isOpen && currentPhoto && (
        <Lightbox
          photo={currentPhoto}
          index={lightboxIndex}
          total={activePhotos.length}
          onClose={closeLightbox}
          onNext={goNext}
          onPrev={goPrev}
          extra={
            deliveryMode ? (
              <button onClick={() => downloadPhoto(currentPhoto)}
                className="flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-widest font-bold text-white bg-white/10 hover:bg-white/20 transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download
              </button>
            ) : (
              <button
                onClick={() => myHearts.has(currentPhoto.id) ? toggleHeart(currentPhoto.id) : handleHeartAttempt(currentPhoto.id)}
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
            )
          }
        />
      )}
    </div>
  );
}

function Lightbox({ photo, index, total, onClose, onNext, onPrev, extra }) {
  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0 bg-black/60">
        <span className="text-white/40 text-xs tabular-nums">{index + 1} / {total}</span>
        <div className="flex items-center gap-2">
          {extra}
          <button onClick={onClose}
            className="w-9 h-9 flex items-center justify-center text-white/60 hover:text-white bg-white/10 hover:bg-white/20 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      <div className="flex-1 relative min-h-0">
        {total > 1 && (
          <button onClick={onPrev} className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center bg-black/50 hover:bg-black/80 text-white transition-colors rounded-full">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        <div className="relative w-full h-full">
          <Image key={photo.id} src={photo.thumbnail_url} alt={photo.file_name || ''} fill className="object-contain" sizes="100vw" unoptimized />
        </div>
        {total > 1 && (
          <button onClick={onNext} className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center bg-black/50 hover:bg-black/80 text-white transition-colors rounded-full">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>
      <div className="flex-shrink-0 px-4 py-3 text-center bg-black/60">
        <p className="text-white/30 text-xs truncate">{photo.file_name}</p>
      </div>
    </div>
  );
}
