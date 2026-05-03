'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { toggleGalleryLock, toggleGalleryDownloads, deletePhoto, deleteDeliveryPhoto } from '../actions';
import { FREE_STORAGE_LIMIT } from '@/lib/plan';

export default function GalleryManager({ gallery, photos: initialPhotos, deliveryPhotos: initialDelivery, selections, heartCounts = {}, clientUrl, isProStudio, storageUsedBytes = 0 }) {
  const [photos, setPhotos] = useState(initialPhotos);
  const [deliveryPhotos, setDeliveryPhotos] = useState(initialDelivery);
  const [storageUsed, setStorageUsed] = useState(storageUsedBytes);
  const [uploadQueue, setUploadQueue] = useState([]);
  const [deliveryQueue, setDeliveryQueue] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isDeliveryDragging, setIsDeliveryDragging] = useState(false);
  const [copied, setCopied] = useState(false);
  const [locked, setLocked] = useState(gallery.is_locked);
  const [downloadsEnabled, setDownloadsEnabled] = useState(gallery.downloads_enabled ?? false);
  const [togglingDownloads, setTogglingDownloads] = useState(false);
  const [activeTab, setActiveTab] = useState('photos');
  const [tabVisible, setTabVisible] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [deliveryLightboxIndex, setDeliveryLightboxIndex] = useState(null);
  const [selectionLightbox, setSelectionLightbox] = useState(null);
  const lastSelectionLightbox = useRef(null);
  if (selectionLightbox) lastSelectionLightbox.current = selectionLightbox;
  const displayedSelection = selectionLightbox || lastSelectionLightbox.current;
  const router = useRouter();

  const isOpen = lightboxIndex !== null;
  const currentPhoto = isOpen ? photos[lightboxIndex] : null;
  const isDeliveryOpen = deliveryLightboxIndex !== null;
  const currentDelivery = isDeliveryOpen ? deliveryPhotos[deliveryLightboxIndex] : null;

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const goNext = useCallback(() => setLightboxIndex(i => (i + 1) % photos.length), [photos.length]);
  const goPrev = useCallback(() => setLightboxIndex(i => (i - 1 + photos.length) % photos.length), [photos.length]);

  const closeDeliveryLightbox = useCallback(() => setDeliveryLightboxIndex(null), []);
  const goDeliveryNext = useCallback(() => setDeliveryLightboxIndex(i => (i + 1) % deliveryPhotos.length), [deliveryPhotos.length]);
  const goDeliveryPrev = useCallback(() => setDeliveryLightboxIndex(i => (i - 1 + deliveryPhotos.length) % deliveryPhotos.length), [deliveryPhotos.length]);

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
    if (!isDeliveryOpen) return;
    function onKey(e) {
      if (e.key === 'Escape') closeDeliveryLightbox();
      if (e.key === 'ArrowRight') goDeliveryNext();
      if (e.key === 'ArrowLeft') goDeliveryPrev();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isDeliveryOpen, closeDeliveryLightbox, goDeliveryNext, goDeliveryPrev]);

  useEffect(() => {
    document.body.style.overflow = (isOpen || isDeliveryOpen || selectionLightbox) ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen, isDeliveryOpen, selectionLightbox]);

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

  const selectionsByPerson = selections.reduce((acc, s) => {
    if (!acc[s.selector_name]) acc[s.selector_name] = [];
    acc[s.selector_name].push(s);
    return acc;
  }, {});

  async function uploadFiles(files) {
    const fileArray = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (!fileArray.length) return;
    const items = fileArray.map((file, i) => ({
      id: `${Date.now()}-${i}`, status: 'queued', name: file.name,
      previewUrl: URL.createObjectURL(file), file,
    }));
    setUploadQueue(items);
    for (const item of items) {
      setUploadQueue(prev => prev.map(q => q.id === item.id ? { ...q, status: 'uploading' } : q));
      const fd = new FormData();
      fd.append('file', item.file);
      fd.append('gallery_id', gallery.id);
      try {
        const res = await fetch('/api/galleries/upload', { method: 'POST', body: fd });
        const data = await res.json();
        if (data.photo) {
          setPhotos(prev => [...prev, data.photo]);
          setStorageUsed(prev => prev + (data.photo.file_size || 0));
          setUploadQueue(prev => prev.map(q => q.id === item.id ? { ...q, status: 'done' } : q));
        } else {
          setUploadQueue(prev => prev.map(q => q.id === item.id ? { ...q, status: 'error', errorMsg: data.error } : q));
        }
      } catch {
        setUploadQueue(prev => prev.map(q => q.id === item.id ? { ...q, status: 'error' } : q));
      }
    }
    router.refresh();
    setTimeout(() => {
      setUploadQueue([]);
      items.forEach(item => URL.revokeObjectURL(item.previewUrl));
    }, 1500);
  }

  async function uploadDeliveryFiles(files) {
    const fileArray = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (!fileArray.length) return;
    const items = fileArray.map((file, i) => ({
      id: `${Date.now()}-d-${i}`, status: 'queued', name: file.name,
      previewUrl: URL.createObjectURL(file), file,
    }));
    setDeliveryQueue(items);
    for (const item of items) {
      setDeliveryQueue(prev => prev.map(q => q.id === item.id ? { ...q, status: 'uploading' } : q));
      const fd = new FormData();
      fd.append('file', item.file);
      fd.append('gallery_id', gallery.id);
      try {
        const res = await fetch('/api/galleries/delivery', { method: 'POST', body: fd });
        const data = await res.json();
        if (data.photo) {
          setDeliveryPhotos(prev => [...prev, data.photo]);
          setStorageUsed(prev => prev + (data.photo.file_size || 0));
          setDeliveryQueue(prev => prev.map(q => q.id === item.id ? { ...q, status: 'done' } : q));
        } else {
          setDeliveryQueue(prev => prev.map(q => q.id === item.id ? { ...q, status: 'error', errorMsg: data.error } : q));
        }
      } catch {
        setDeliveryQueue(prev => prev.map(q => q.id === item.id ? { ...q, status: 'error' } : q));
      }
    }
    router.refresh();
    setTimeout(() => {
      setDeliveryQueue([]);
      items.forEach(item => URL.revokeObjectURL(item.previewUrl));
    }, 1500);
  }

  const handleDrop = useCallback((e) => { e.preventDefault(); setIsDragging(false); uploadFiles(e.dataTransfer.files); }, [gallery.id]);
  const handleDeliveryDrop = useCallback((e) => { e.preventDefault(); setIsDeliveryDragging(false); uploadDeliveryFiles(e.dataTransfer.files); }, [gallery.id]);

  async function handleDelete(photoId) {
    if (!confirm('Delete this photo? This cannot be undone.')) return;
    const photo = photos.find(p => p.id === photoId);
    const result = await deletePhoto(photoId);
    if (!result?.error) {
      setPhotos(prev => prev.filter(p => p.id !== photoId));
      if (photo?.file_size) setStorageUsed(prev => Math.max(0, prev - photo.file_size));
    }
  }

  async function handleDeleteDelivery(photoId) {
    if (!confirm('Delete this delivery photo? This cannot be undone.')) return;
    const photo = deliveryPhotos.find(p => p.id === photoId);
    const result = await deleteDeliveryPhoto(photoId);
    if (!result?.error) {
      setDeliveryPhotos(prev => prev.filter(p => p.id !== photoId));
      if (photo?.file_size) setStorageUsed(prev => Math.max(0, prev - photo.file_size));
    }
  }

  async function handleToggleLock() {
    const newLocked = !locked;
    await toggleGalleryLock(gallery.id, newLocked);
    setLocked(newLocked);
  }

  async function handleToggleDownloads() {
    setTogglingDownloads(true);
    const newVal = !downloadsEnabled;
    const result = await toggleGalleryDownloads(gallery.id, newVal);
    if (!result?.error) setDownloadsEnabled(newVal);
    setTogglingDownloads(false);
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

  const TABS = [
    { key: 'photos', label: `Photos (${photos.length})` },
    { key: 'selections', label: `Selections (${selections.length})` },
    { key: 'delivery', label: `Delivery (${deliveryPhotos.length})` },
  ];

  return (
    <div className="space-y-6">
      {/* Action bar */}
      <div className="p-4 bg-white border border-gray-100 space-y-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-0.5">Client Link</p>
            <p className="text-sm text-neutral-gray truncate font-mono">{clientUrl}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={copyLink}
            className={`flex-1 sm:flex-none px-4 py-2 text-xs uppercase tracking-widest font-bold transition-colors text-center ${copied ? 'bg-green-500 text-white' : 'bg-black text-white hover:bg-primary'}`}>
            {copied ? '✓ Copied' : 'Copy Link'}
          </button>
          <button onClick={handleToggleLock}
            className={`flex-1 sm:flex-none px-4 py-2 text-xs uppercase tracking-widest font-bold border transition-colors text-center ${locked ? 'border-amber-300 text-amber-700 hover:bg-amber-50' : 'border-green-300 text-green-700 hover:bg-green-50'}`}>
            {locked ? '🔒 Locked' : '🔓 Unlocked'}
          </button>
          {gallery.password_hash && (
            <div className="flex-1 sm:flex-none px-4 py-2 text-xs uppercase tracking-widest font-bold bg-gray-50 border border-gray-200 text-neutral-gray text-center">
              Password: {gallery.password_hash}
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 overflow-x-auto scrollbar-none">
        {TABS.map(tab => (
          <button key={tab.key} onClick={() => switchTab(tab.key)}
            className={`px-4 py-2.5 text-[10px] uppercase tracking-widest font-bold transition-all duration-200 whitespace-nowrap flex-shrink-0 active:opacity-70 ${
              activeTab === tab.key ? 'border-b-2 border-primary text-primary -mb-px' : 'text-neutral-gray hover:text-black'
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ opacity: tabVisible ? 1 : 0, transition: 'opacity 130ms ease' }}>

        {/* ── Photos tab ── */}
        {activeTab === 'photos' && (
          <div className="space-y-4">
            {!isProStudio && <StorageBar storageUsed={storageUsed} />}

            {(!isProStudio && storageUsed >= FREE_STORAGE_LIMIT) ? null : (
              <div onDrop={handleDrop} onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)}
                className={`border-2 border-dashed transition-all duration-200 ${isDragging ? 'border-primary bg-red-50 scale-[1.01]' : 'border-gray-200 hover:border-gray-300'}`}>
                <label className="flex flex-col items-center justify-center py-12 cursor-pointer">
                  <svg className="w-10 h-10 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-sm font-medium text-black mb-1">Drop photos here or click to upload</p>
                  <p className="text-xs text-neutral-gray">JPG, PNG, WebP — multiple files supported</p>
                  <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => uploadFiles(e.target.files)} />
                </label>
              </div>
            )}

            {uploadQueue.length > 0 && (() => {
              const done = uploadQueue.filter(q => q.status === 'done').length;
              const errors = uploadQueue.filter(q => q.status === 'error').length;
              const pct = Math.round((done / uploadQueue.length) * 100);
              return (
                <div className="px-5 py-4 bg-white border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold uppercase tracking-widest text-black">
                      {done < uploadQueue.length ? 'Uploading…' : 'Upload complete'}
                    </p>
                    <p className="text-xs text-neutral-gray tabular-nums">{done} / {uploadQueue.length}</p>
                  </div>
                  <div className="h-1 bg-gray-100 overflow-hidden">
                    <div className="h-full bg-primary transition-all duration-300" style={{ width: `${pct}%` }} />
                  </div>
                  {errors > 0 && (
                    <p className="text-xs text-red-500 mt-2">{errors} file{errors !== 1 ? 's' : ''} failed to upload</p>
                  )}
                </div>
              );
            })()}

            {photos.length === 0 && uploadQueue.length === 0 ? (
              <div className="bg-white border border-gray-100 py-16 text-center">
                <p className="font-serif text-xl text-black mb-1">No photos yet</p>
                <p className="text-sm text-neutral-gray italic">Upload photos above to populate this gallery.</p>
              </div>
            ) : (
              <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-2">
                {photos.map((photo, index) => {
                  const hearts = heartCounts[photo.id] || 0;
                  return (
                    <div key={photo.id} className="relative group bg-gray-100 overflow-hidden cursor-pointer break-inside-avoid mb-2" onClick={() => setLightboxIndex(index)}>
                      <img src={photo.thumbnail_url} alt={photo.file_name || 'Photo'} className="w-full h-auto block transition-transform duration-300 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200" />
                      {hearts > 0 && (
                        <div className="absolute bottom-1.5 left-1.5 flex items-center gap-1 bg-black/60 text-white rounded-full px-2 py-0.5">
                          <svg className="w-2.5 h-2.5 text-primary" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                          </svg>
                          <span className="text-[10px] font-bold leading-none">{hearts}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
                <UploadQueueGrid queue={uploadQueue} />
              </div>
            )}
          </div>
        )}

        {/* ── Delivery tab ── */}
        {activeTab === 'delivery' && (
          <div className="space-y-4">
            {/* Downloads toggle */}
            <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 py-4 border ${downloadsEnabled ? 'bg-green-50 border-green-200' : 'bg-white border-gray-100'}`}>
              <div>
                <p className="text-sm font-bold text-black mb-0.5">
                  {downloadsEnabled ? '✓ Downloads enabled' : 'Downloads disabled'}
                </p>
                <p className="text-xs text-neutral-gray">
                  {downloadsEnabled
                    ? 'Clients can view and download their final photos.'
                    : 'Upload edited finals below, then enable downloads when ready.'}
                </p>
              </div>
              <button
                onClick={handleToggleDownloads}
                disabled={togglingDownloads}
                className={`flex-shrink-0 px-5 py-2.5 text-xs uppercase tracking-widest font-bold transition-colors disabled:opacity-50 whitespace-nowrap ${
                  downloadsEnabled
                    ? 'border border-red-200 text-red-600 hover:bg-red-50'
                    : 'bg-primary text-white hover:bg-black'
                }`}>
                {togglingDownloads ? '...' : downloadsEnabled ? 'Disable Downloads' : 'Enable Downloads'}
              </button>
            </div>

            {!isProStudio && <StorageBar storageUsed={storageUsed} />}

            {(!isProStudio && storageUsed >= FREE_STORAGE_LIMIT) ? null : (
              <div onDrop={handleDeliveryDrop} onDragOver={(e) => { e.preventDefault(); setIsDeliveryDragging(true); }} onDragLeave={() => setIsDeliveryDragging(false)}
                className={`border-2 border-dashed transition-all duration-200 ${isDeliveryDragging ? 'border-primary bg-red-50 scale-[1.01]' : 'border-gray-200 hover:border-gray-300'}`}>
                <label className="flex flex-col items-center justify-center py-12 cursor-pointer">
                  <svg className="w-10 h-10 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-sm font-medium text-black mb-1">Drop edited finals here or click to upload</p>
                  <p className="text-xs text-neutral-gray">JPG, PNG, WebP — these are the photos clients will download</p>
                  <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => uploadDeliveryFiles(e.target.files)} />
                </label>
              </div>
            )}

            {deliveryQueue.length > 0 && (() => {
              const done = deliveryQueue.filter(q => q.status === 'done').length;
              const errors = deliveryQueue.filter(q => q.status === 'error').length;
              const pct = Math.round((done / deliveryQueue.length) * 100);
              return (
                <div className="px-5 py-4 bg-white border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold uppercase tracking-widest text-black">
                      {done < deliveryQueue.length ? 'Uploading…' : 'Upload complete'}
                    </p>
                    <p className="text-xs text-neutral-gray tabular-nums">{done} / {deliveryQueue.length}</p>
                  </div>
                  <div className="h-1 bg-gray-100 overflow-hidden">
                    <div className="h-full bg-primary transition-all duration-300" style={{ width: `${pct}%` }} />
                  </div>
                  {errors > 0 && (
                    <p className="text-xs text-red-500 mt-2">{errors} file{errors !== 1 ? 's' : ''} failed to upload</p>
                  )}
                </div>
              );
            })()}

            {deliveryPhotos.length === 0 && deliveryQueue.length === 0 ? (
              <div className="bg-white border border-gray-100 py-16 text-center">
                <p className="font-serif text-xl text-black mb-1">No edited finals yet</p>
                <p className="text-sm text-neutral-gray italic">Upload your retouched photos above, then enable downloads.</p>
              </div>
            ) : (
              <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-2">
                {deliveryPhotos.map((photo, index) => (
                  <div key={photo.id} className="relative group bg-gray-100 overflow-hidden cursor-pointer break-inside-avoid mb-2" onClick={() => setDeliveryLightboxIndex(index)}>
                    <img src={photo.thumbnail_url} alt={photo.file_name || 'Delivery photo'} className="w-full h-auto block transition-transform duration-300 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200" />
                  </div>
                ))}
                <UploadQueueGrid queue={deliveryQueue} />
              </div>
            )}
          </div>
        )}

        {/* ── Selections tab ── */}
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
                    <a href={`https://wa.me/?text=${encodeURIComponent(`${name}'s selections from ${gallery.title}:\n${picks.map((p, i) => `${i + 1}. Photo`).join('\n')}`)}`}
                      target="_blank" rel="noopener noreferrer"
                      className="text-[10px] uppercase tracking-widest font-bold text-green-600 hover:text-green-700 border border-green-200 px-3 py-1.5 hover:bg-green-50 transition-colors">
                      Share via WhatsApp
                    </a>
                  </div>
                  <div className="p-4 columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-3">
                    {picks.map((s, i) => (
                      <button key={s.id} onClick={() => setSelectionLightbox({ picks, index: i })}
                        className="relative bg-gray-100 overflow-hidden group focus:outline-none break-inside-avoid mb-3 block w-full">
                        {s.photos?.thumbnail_url && (
                          <img src={s.photos.thumbnail_url} alt="Selected photo"
                            className="w-full h-auto block transition-all duration-300 group-hover:scale-105 group-hover:brightness-110" />
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

      </div>

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
              <button onClick={() => setSelectionLightbox(null)} className="w-9 h-9 flex items-center justify-center text-white/60 hover:text-white bg-white/10 hover:bg-white/20 transition-colors active:scale-90">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="flex-1 relative flex items-center justify-center min-h-0">
              {picks.length > 1 && (
                <button onClick={() => setSelectionLightbox({ picks, index: (index - 1 + picks.length) % picks.length })}
                  className="absolute left-2 z-10 w-10 h-10 flex items-center justify-center bg-black/50 hover:bg-black/80 text-white transition-colors rounded-full">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                </button>
              )}
              <div className="relative w-full h-full">
                {imgSrc && <Image key={current.id} src={imgSrc} alt="" fill className="object-contain" sizes="100vw" unoptimized />}
              </div>
              {picks.length > 1 && (
                <button onClick={() => setSelectionLightbox({ picks, index: (index + 1) % picks.length })}
                  className="absolute right-2 z-10 w-10 h-10 flex items-center justify-center bg-black/50 hover:bg-black/80 text-white transition-colors rounded-full">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                </button>
              )}
            </div>
            {current?.note && <div className="flex-shrink-0 px-4 py-3 text-center"><p className="text-white/40 text-xs">{current.note}</p></div>}
          </div>
        );
      })()}

      {/* Photos lightbox */}
      {(() => {
        const photo = currentPhoto || photos[0];
        return (
          <div className={`fixed inset-0 z-50 bg-black flex flex-col transition-opacity duration-200 ${isOpen && currentPhoto ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
            <div className="flex items-center justify-between px-4 py-3 flex-shrink-0 bg-black/80">
              <div>
                <p className="text-white/60 text-xs truncate max-w-xs">{photo?.file_name}</p>
                <p className="text-white/30 text-[10px] tabular-nums">{lightboxIndex != null ? lightboxIndex + 1 : 0} / {photos.length}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={(e) => { e.stopPropagation(); if (photo) handleDelete(photo.id); closeLightbox(); }}
                  className="px-4 py-2 text-xs uppercase tracking-widest font-bold bg-red-500 hover:bg-red-600 text-white transition-colors">
                  Delete
                </button>
                <button onClick={closeLightbox} className="w-9 h-9 flex items-center justify-center text-white/60 hover:text-white bg-white/10 hover:bg-white/20 transition-colors active:scale-90">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </div>
            <div className="flex-1 relative flex items-center justify-center min-h-0">
              {photos.length > 1 && (
                <button onClick={goPrev} className="absolute left-2 z-10 w-10 h-10 flex items-center justify-center bg-black/50 hover:bg-black/80 text-white transition-colors rounded-full">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                </button>
              )}
              <div className="relative w-full h-full">
                {photo && <Image key={photo.id} src={photo.thumbnail_url} alt={photo.file_name || ''} fill className="object-contain" sizes="100vw" unoptimized />}
              </div>
              {photos.length > 1 && (
                <button onClick={goNext} className="absolute right-2 z-10 w-10 h-10 flex items-center justify-center bg-black/50 hover:bg-black/80 text-white transition-colors rounded-full">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                </button>
              )}
            </div>
          </div>
        );
      })()}

      {/* Delivery lightbox */}
      {(() => {
        const photo = currentDelivery || deliveryPhotos[0];
        return (
          <div className={`fixed inset-0 z-50 bg-black flex flex-col transition-opacity duration-200 ${isDeliveryOpen && currentDelivery ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
            <div className="flex items-center justify-between px-4 py-3 flex-shrink-0 bg-black/80">
              <div>
                <p className="text-white/60 text-xs truncate max-w-xs">{photo?.file_name}</p>
                <p className="text-white/30 text-[10px] tabular-nums">{deliveryLightboxIndex != null ? deliveryLightboxIndex + 1 : 0} / {deliveryPhotos.length}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={(e) => { e.stopPropagation(); if (photo) handleDeleteDelivery(photo.id); closeDeliveryLightbox(); }}
                  className="px-4 py-2 text-xs uppercase tracking-widest font-bold bg-red-500 hover:bg-red-600 text-white transition-colors">
                  Delete
                </button>
                <button onClick={closeDeliveryLightbox} className="w-9 h-9 flex items-center justify-center text-white/60 hover:text-white bg-white/10 hover:bg-white/20 transition-colors active:scale-90">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </div>
            <div className="flex-1 relative flex items-center justify-center min-h-0">
              {deliveryPhotos.length > 1 && (
                <button onClick={goDeliveryPrev} className="absolute left-2 z-10 w-10 h-10 flex items-center justify-center bg-black/50 hover:bg-black/80 text-white transition-colors rounded-full">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                </button>
              )}
              <div className="relative w-full h-full">
                {photo && <Image key={photo.id} src={photo.thumbnail_url} alt={photo.file_name || ''} fill className="object-contain" sizes="100vw" unoptimized />}
              </div>
              {deliveryPhotos.length > 1 && (
                <button onClick={goDeliveryNext} className="absolute right-2 z-10 w-10 h-10 flex items-center justify-center bg-black/50 hover:bg-black/80 text-white transition-colors rounded-full">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                </button>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
}

function formatBytes(bytes) {
  if (bytes >= 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.round(bytes / 1024)} KB`;
}

function StorageBar({ storageUsed }) {
  const pct = Math.min(100, (storageUsed / FREE_STORAGE_LIMIT) * 100);
  const isFull = storageUsed >= FREE_STORAGE_LIMIT;
  const isWarning = pct >= 70;

  return (
    <div className={`px-5 py-3 border space-y-2 ${isFull ? 'bg-red-50 border-red-200' : isWarning ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-gray-200'}`}>
      <div className="flex items-center justify-between gap-3">
        <p className={`text-xs font-bold ${isFull ? 'text-red-700' : isWarning ? 'text-amber-800' : 'text-neutral-gray'}`}>
          {isFull ? 'Storage full — upgrade to add more photos.' : `${formatBytes(storageUsed)} of 2 GB used`}
        </p>
        {(isFull || isWarning) && (
          <a href="/studio/settings" className={`text-[10px] uppercase tracking-widest font-bold hover:underline whitespace-nowrap ${isFull ? 'text-red-600' : 'text-amber-700'}`}>Upgrade →</a>
        )}
      </div>
      <div className="h-1 bg-white/60 overflow-hidden rounded-full">
        <div
          className={`h-full rounded-full transition-all duration-300 ${isFull ? 'bg-red-500' : isWarning ? 'bg-amber-400' : 'bg-primary'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function UploadQueueGrid({ queue }) {
  return queue.map(item => (
    <div key={item.id} className="relative bg-gray-100 overflow-hidden break-inside-avoid mb-2">
      <img src={item.previewUrl} alt={item.name} className="w-full h-auto block" />
      {item.status === 'queued' && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="w-4 h-4 rounded-full border-2 border-white/40" />
        </div>
      )}
      {item.status === 'uploading' && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      {item.status === 'done' && (
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
          <svg className="w-6 h-6 text-white drop-shadow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
      {item.status === 'error' && (
        <div className="absolute inset-0 bg-red-500/80 flex flex-col items-center justify-center gap-1">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          <p className="text-[9px] text-white uppercase tracking-wider">{item.errorMsg ? 'Limit reached' : 'Failed'}</p>
        </div>
      )}
    </div>
  ));
}
