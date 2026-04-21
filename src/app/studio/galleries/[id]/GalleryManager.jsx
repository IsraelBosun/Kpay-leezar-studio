'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { toggleGalleryLock, deletePhoto } from '../actions';

export default function GalleryManager({ gallery, photos: initialPhotos, selections, clientUrl }) {
  const [photos, setPhotos] = useState(initialPhotos);
  const [uploading, setUploading] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [copied, setCopied] = useState(false);
  const [locked, setLocked] = useState(gallery.is_locked);
  const [activeTab, setActiveTab] = useState('photos');
  const [tabVisible, setTabVisible] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [selectionLightbox, setSelectionLightbox] = useState(null);
  const lastSelectionLightbox = useRef(null);
  if (selectionLightbox) lastSelectionLightbox.current = selectionLightbox;
  const displayedSelection = selectionLightbox || lastSelectionLightbox.current;
  const router = useRouter();

  const isOpen = lightboxIndex !== null;
  const currentPhoto = isOpen ? photos[lightboxIndex] : null;

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const goNext = useCallback(() => setLightboxIndex(i => (i + 1) % photos.length), [photos.length]);
  const goPrev = useCallback(() => setLightboxIndex(i => (i - 1 + photos.length) % photos.length), [photos.length]);

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
    document.body.style.overflow = (isOpen || selectionLightbox) ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen, selectionLightbox]);

  useEffect(() => {
    if (!selectionLightbox) return;
    function onKey(e) {
      const { picks, index } = selectionLightbox;
      if (e.key === 'Escape') setSelectionLightbox(null);
      if (e.key === 'ArrowRight') setSelectionLightbox({ picks, index: (index + 1) % picks.length });
      if (e.key === 'ArrowLeft') setSelectionLightbox({ picks, index: (index - 1 + picks.length) % picks.length });
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectionLightbox]);

  // Group selections by selector_name
  const selectionsByPerson = selections.reduce((acc, s) => {
    if (!acc[s.selector_name]) acc[s.selector_name] = [];
    acc[s.selector_name].push(s);
    return acc;
  }, {});

  async function uploadFiles(files) {
    const fileArray = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (!fileArray.length) return;

    const ids = fileArray.map((_, i) => `${Date.now()}-${i}`);
    setUploading(ids);

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      const fd = new FormData();
      fd.append('file', file);
      fd.append('gallery_id', gallery.id);

      try {
        const res = await fetch('/api/galleries/upload', { method: 'POST', body: fd });
        const data = await res.json();
        if (data.photo) {
          setPhotos(prev => [...prev, data.photo]);
        }
      } catch {
        // individual upload failure — continue with rest
      }
      setUploading(prev => prev.filter(id => id !== ids[i]));
    }
    router.refresh();
  }

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    uploadFiles(e.dataTransfer.files);
  }, [gallery.id]);

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);

  async function handleDelete(photoId) {
    if (!confirm('Delete this photo? This cannot be undone.')) return;
    const result = await deletePhoto(photoId);
    if (!result?.error) setPhotos(prev => prev.filter(p => p.id !== photoId));
  }

  async function handleToggleLock() {
    const newLocked = !locked;
    await toggleGalleryLock(gallery.id, newLocked);
    setLocked(newLocked);
  }

  function switchTab(tab) {
    if (tab === activeTab) return;
    setTabVisible(false);
    setTimeout(() => { setActiveTab(tab); setTabVisible(true); }, 130);
  }

  function copyLink() {
    navigator.clipboard.writeText(clientUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-6">
      {/* Action bar */}
      <div className="flex flex-wrap gap-3 items-center p-5 bg-white border border-gray-100">
        {/* Client link */}
        <div className="flex-1 min-w-0">
          <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-1">Client Link</p>
          <p className="text-sm text-neutral-gray truncate font-mono">{clientUrl}</p>
        </div>
        <button onClick={copyLink}
          className={`px-4 py-2 text-xs uppercase tracking-widest font-bold transition-colors whitespace-nowrap ${
            copied ? 'bg-green-500 text-white' : 'bg-black text-white hover:bg-primary'
          }`}>
          {copied ? '✓ Copied' : 'Copy Link'}
        </button>
        <button onClick={handleToggleLock}
          className={`px-4 py-2 text-xs uppercase tracking-widest font-bold border transition-colors whitespace-nowrap ${
            locked
              ? 'border-amber-300 text-amber-700 hover:bg-amber-50'
              : 'border-green-300 text-green-700 hover:bg-green-50'
          }`}>
          {locked ? '🔒 Unlock Gallery' : '🔓 Lock Gallery'}
        </button>
        {gallery.password_hash && (
          <div className="px-4 py-2 text-xs uppercase tracking-widest font-bold bg-gray-50 border border-gray-200 text-neutral-gray">
            Password: {gallery.password_hash}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {['photos', 'selections'].map(tab => (
          <button key={tab} onClick={() => switchTab(tab)}
            className={`px-4 py-2.5 text-[10px] uppercase tracking-widest font-bold transition-all duration-200 capitalize active:opacity-70 ${
              activeTab === tab ? 'border-b-2 border-primary text-primary -mb-px' : 'text-neutral-gray hover:text-black'
            }`}>
            {tab} {tab === 'photos' ? `(${photos.length})` : `(${selections.length})`}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ opacity: tabVisible ? 1 : 0, transition: 'opacity 130ms ease' }}>

      {/* Photos tab */}
      {activeTab === 'photos' && (
        <div className="space-y-4">
          {/* Upload zone */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`border-2 border-dashed transition-all duration-200 ${
              isDragging ? 'border-primary bg-red-50 scale-[1.01]' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <label className="flex flex-col items-center justify-center py-12 cursor-pointer">
              <svg className="w-10 h-10 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-sm font-medium text-black mb-1">Drop photos here or click to upload</p>
              <p className="text-xs text-neutral-gray">JPG, PNG, WebP — multiple files supported</p>
              <input type="file" multiple accept="image/*" className="hidden"
                onChange={(e) => uploadFiles(e.target.files)} />
            </label>
          </div>

          {/* Upload progress */}
          {uploading.length > 0 && (
            <div className="flex items-center gap-3 px-5 py-3 bg-blue-50 border border-blue-200">
              <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
                Uploading {uploading.length} photo{uploading.length !== 1 ? 's' : ''}...
              </p>
            </div>
          )}

          {/* Photo grid */}
          {photos.length === 0 && uploading.length === 0 ? (
            <div className="bg-white border border-gray-100 py-16 text-center">
              <p className="font-serif text-xl text-black mb-1">No photos yet</p>
              <p className="text-sm text-neutral-gray italic">Upload photos above to populate this gallery.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
              {photos.map((photo, index) => (
                <div key={photo.id} className="relative group aspect-square bg-gray-100 overflow-hidden cursor-pointer"
                  onClick={() => setLightboxIndex(index)}>
                  <Image
                    src={photo.thumbnail_url}
                    alt={photo.file_name || 'Photo'}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200" />
                </div>
              ))}
              {uploading.map(id => (
                <div key={id} className="aspect-square bg-gray-100 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-gray-300 border-t-primary rounded-full animate-spin" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Selections tab */}
      {activeTab === 'selections' && (
        <div className="space-y-6">
          {selections.length === 0 ? (
            <div className="bg-white border border-gray-100 py-16 text-center">
              <p className="font-serif text-xl text-black mb-1">No selections yet</p>
              <p className="text-sm text-neutral-gray italic">Share the client link and they'll heart their favourite photos here.</p>
            </div>
          ) : (
            Object.entries(selectionsByPerson).map(([name, picks]) => (
              <div key={name} className="bg-white border border-gray-100">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
                  <div>
                    <p className="font-medium text-sm text-black">{name}</p>
                    <p className="text-xs text-neutral-gray">{picks.length} photo{picks.length !== 1 ? 's' : ''} selected</p>
                  </div>
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(`${name}'s selections from ${gallery.title}:\n${picks.map((p, i) => `${i + 1}. Photo`).join('\n')}`)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="text-[10px] uppercase tracking-widest font-bold text-green-600 hover:text-green-700 border border-green-200 px-3 py-1.5 hover:bg-green-50 transition-colors"
                  >
                    Share via WhatsApp
                  </a>
                </div>
                <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {picks.map((s, i) => (
                    <button
                      key={s.id}
                      onClick={() => setSelectionLightbox({ picks, index: i })}
                      className="relative aspect-square bg-gray-100 overflow-hidden group focus:outline-none"
                    >
                      {s.photos?.thumbnail_url && (
                        <Image
                          src={s.photos.thumbnail_url}
                          alt="Selected photo"
                          fill
                          className="object-cover transition-all duration-300 group-hover:scale-105 group-hover:brightness-110"
                          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                          unoptimized
                        />
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200" />
                      <div className="absolute top-2 right-2 w-6 h-6 bg-primary flex items-center justify-center shadow">
                        <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                        </svg>
                      </div>
                      {s.note && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1">
                          <p className="text-[9px] text-white truncate">{s.note}</p>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      </div>{/* end tab content */}

      {/* Selection lightbox */}
      {(() => {
        if (!displayedSelection) return null;
        const { picks, index } = displayedSelection;
        const current = picks[index];
        const imgSrc = current?.photos?.thumbnail_url;
        return (
          <div className={`fixed inset-0 z-50 bg-black flex flex-col transition-opacity duration-200 ${selectionLightbox ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
            <div className="flex items-center justify-between px-4 py-3 flex-shrink-0 bg-black/80">
              <div>
                <p className="text-white/60 text-xs">{current?.selector_name}</p>
                <p className="text-white/30 text-[10px] tabular-nums">{index + 1} / {picks.length}</p>
              </div>
              <button onClick={() => setSelectionLightbox(null)}
                className="w-9 h-9 flex items-center justify-center text-white/60 hover:text-white bg-white/10 hover:bg-white/20 transition-colors active:scale-90">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 relative flex items-center justify-center min-h-0">
              {picks.length > 1 && (
                <button
                  onClick={() => setSelectionLightbox({ picks, index: (index - 1 + picks.length) % picks.length })}
                  className="absolute left-2 z-10 w-10 h-10 flex items-center justify-center bg-black/50 hover:bg-black/80 text-white transition-colors rounded-full">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}
              <div className="relative w-full h-full">
                {imgSrc && <Image key={current.id} src={imgSrc} alt="" fill className="object-contain" sizes="100vw" unoptimized />}
              </div>
              {picks.length > 1 && (
                <button
                  onClick={() => setSelectionLightbox({ picks, index: (index + 1) % picks.length })}
                  className="absolute right-2 z-10 w-10 h-10 flex items-center justify-center bg-black/50 hover:bg-black/80 text-white transition-colors rounded-full">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </div>
            {current?.note && (
              <div className="flex-shrink-0 px-4 py-3 text-center">
                <p className="text-white/40 text-xs">{current.note}</p>
              </div>
            )}
          </div>
        );
      })()}

      {/* Photos lightbox */}
      {(() => {
        const photo = currentPhoto || photos[0];
        return (
        <div className={`fixed inset-0 z-50 bg-black flex flex-col transition-opacity duration-200 ${isOpen && currentPhoto ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
          {/* Top bar */}
          <div className="flex items-center justify-between px-4 py-3 flex-shrink-0 bg-black/80">
            <div>
              <p className="text-white/60 text-xs truncate max-w-xs">{photo?.file_name}</p>
              <p className="text-white/30 text-[10px] tabular-nums">{lightboxIndex != null ? lightboxIndex + 1 : 0} / {photos.length}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); if (photo) handleDelete(photo.id); closeLightbox(); }}
                className="px-4 py-2 text-xs uppercase tracking-widest font-bold bg-red-500 hover:bg-red-600 text-white transition-colors"
              >
                Delete
              </button>
              <button onClick={closeLightbox}
                className="w-9 h-9 flex items-center justify-center text-white/60 hover:text-white bg-white/10 hover:bg-white/20 transition-colors active:scale-90">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Image */}
          <div className="flex-1 relative flex items-center justify-center min-h-0">
            {photos.length > 1 && (
              <button onClick={goPrev}
                className="absolute left-2 z-10 w-10 h-10 flex items-center justify-center bg-black/50 hover:bg-black/80 text-white transition-colors rounded-full">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <div className="relative w-full h-full">
              {photo && (
                <Image
                  key={photo.id}
                  src={photo.thumbnail_url}
                  alt={photo.file_name || ''}
                  fill
                  className="object-contain"
                  sizes="100vw"
                  unoptimized
                />
              )}
            </div>
            {photos.length > 1 && (
              <button onClick={goNext}
                className="absolute right-2 z-10 w-10 h-10 flex items-center justify-center bg-black/50 hover:bg-black/80 text-white transition-colors rounded-full">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>
        </div>
        );
      })()}
    </div>
  );
}
