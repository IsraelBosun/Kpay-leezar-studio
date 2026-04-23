'use client';

import { useState, useCallback } from 'react';
import { THEMES, resolveConfig } from '@/lib/themes';
import { saveWebsiteConfig, savePhotoCategories } from './actions';

const CATEGORIES = ['Weddings', 'Portraits', 'Events', 'Commercial', 'Other'];

export default function WebsiteEditor({ studio, portfolioPhotos: initial, websiteConfig }) {
  const [activeTab, setActiveTab] = useState('photos');
  const [photos, setPhotos] = useState(initial);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState(
    Object.fromEntries(initial.map(p => [p.id, p.category || '']))
  );
  const [savingCats, setSavingCats] = useState(false);
  const [catsSaved, setCatsSaved] = useState(false);

  const [config, setConfig] = useState(resolveConfig(websiteConfig));
  const [savingDesign, setSavingDesign] = useState(false);
  const [designSaved, setDesignSaved] = useState(false);

  // ── Photo upload ────────────────────────────────────────────────────
  const uploadFiles = useCallback(async (files) => {
    const imageFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (!imageFiles.length) return;
    setUploading(true);

    for (const file of imageFiles) {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('category', '');
      try {
        const res = await fetch('/api/portfolio/upload', { method: 'POST', body: fd });
        const data = await res.json();
        if (data.photo) {
          setPhotos(prev => [...prev, data.photo]);
          setCategories(prev => ({ ...prev, [data.photo.id]: '' }));
        }
      } catch {
        // silently skip failed files
      }
    }
    setUploading(false);
  }, []);

  function onDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    uploadFiles(e.dataTransfer.files);
  }

  async function deletePhoto(id) {
    if (!confirm('Remove this photo from your website?')) return;
    const res = await fetch('/api/portfolio/delete', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ photoId: id }),
    });
    if (res.ok) {
      setPhotos(prev => prev.filter(p => p.id !== id));
      setCategories(prev => { const next = { ...prev }; delete next[id]; return next; });
    }
  }

  async function handleSaveCategories() {
    setSavingCats(true);
    setCatsSaved(false);
    const updates = photos.map(p => ({ id: p.id, category: categories[p.id] || '' }));
    const result = await savePhotoCategories(updates);
    setSavingCats(false);
    if (!result?.error) setCatsSaved(true);
  }

  // ── Design save ─────────────────────────────────────────────────────
  async function handleSaveDesign() {
    setSavingDesign(true);
    setDesignSaved(false);
    await saveWebsiteConfig(config);
    setSavingDesign(false);
    setDesignSaved(true);
  }

  const tabs = [
    { id: 'photos', label: 'Photos' },
    { id: 'design', label: 'Design' },
  ];

  return (
    <div className="bg-white border border-gray-100">
      {/* Tab bar */}
      <div className="flex border-b border-gray-100">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-8 py-4 text-[10px] uppercase tracking-widest font-bold transition-colors ${
              activeTab === t.id
                ? 'border-b-2 border-primary text-primary -mb-px'
                : 'text-zinc-400 hover:text-black'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Photos tab ── */}
      {activeTab === 'photos' && (
        <div className="p-6 md:p-8 space-y-6">

          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onDrop}
            className={`border-2 border-dashed rounded-sm p-10 text-center transition-all duration-200 ${
              isDragging ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'
            }`}>
            <input
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              id="portfolio-upload"
              onChange={e => uploadFiles(e.target.files)}
            />
            <label htmlFor="portfolio-upload" className="cursor-pointer">
              <div className="w-10 h-10 mx-auto mb-3 flex items-center justify-center bg-gray-100 rounded-full">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </div>
              {uploading ? (
                <p className="text-sm text-primary font-semibold">Uploading...</p>
              ) : (
                <>
                  <p className="text-sm font-semibold text-black mb-1">Drop photos here or click to upload</p>
                  <p className="text-xs text-neutral-gray">JPG, PNG or WebP — these appear on your public website</p>
                </>
              )}
            </label>
          </div>

          {/* Photos grid */}
          {photos.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-neutral-gray italic">No photos yet. Upload some to get your website looking great.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {photos.map(photo => (
                  <div key={photo.id} className="group relative">
                    <div className="aspect-square bg-gray-100 overflow-hidden rounded-sm">
                      <img
                        src={photo.thumbnail_url || photo.src}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {/* Delete button */}
                    <button
                      onClick={() => deletePhoto(photo.id)}
                      className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-sm hover:bg-red-600">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    {/* Category select */}
                    <select
                      value={categories[photo.id] || ''}
                      onChange={e => setCategories(prev => ({ ...prev, [photo.id]: e.target.value }))}
                      className="mt-1.5 w-full text-[10px] bg-gray-50 border border-gray-200 py-1.5 px-2 focus:outline-none focus:border-primary text-zinc-600">
                      <option value="">No category</option>
                      {CATEGORIES.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handleSaveCategories}
                  disabled={savingCats}
                  className="bg-primary text-white px-6 py-3 text-xs uppercase tracking-widest font-bold hover:bg-black transition-colors disabled:opacity-50">
                  {savingCats ? 'Saving...' : 'Save Categories'}
                </button>
                {catsSaved && (
                  <span className="text-xs text-green-600 font-bold uppercase tracking-widest">✓ Saved</span>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Design tab ── */}
      {activeTab === 'design' && (
        <div className="p-6 md:p-8 space-y-10">

          {/* Theme picker */}
          <div>
            <p className="text-[10px] uppercase tracking-widest font-bold text-primary mb-1">Theme</p>
            <p className="text-xs text-neutral-gray mb-5">Choose the overall look and feel of your website.</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Object.entries(THEMES).map(([key, theme]) => (
                <button
                  key={key}
                  onClick={() => setConfig(c => ({ ...c, theme: key }))}
                  className={`text-left p-4 border rounded-sm transition-all ${
                    config.theme === key
                      ? 'border-primary ring-1 ring-primary'
                      : 'border-gray-200 hover:border-gray-400'
                  }`}>
                  {/* Color swatches */}
                  <div className="flex gap-1 mb-3">
                    {theme.swatch.map((color, i) => (
                      <div key={i} className="w-6 h-6 rounded-full border border-black/10 flex-shrink-0"
                        style={{ backgroundColor: color }} />
                    ))}
                    <div className="w-6 h-6 rounded-full border border-black/10 flex-shrink-0"
                      style={{ backgroundColor: studio.accent_color || '#F0940A' }} />
                  </div>
                  <p className="text-xs font-bold text-black">{theme.name}</p>
                  <p className="text-[10px] text-neutral-gray mt-0.5 leading-snug">{theme.description}</p>
                  {config.theme === key && (
                    <p className="text-[10px] font-bold text-primary mt-1.5 uppercase tracking-widest">Active</p>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Hero style */}
          <div>
            <p className="text-[10px] uppercase tracking-widest font-bold text-primary mb-1">Hero Style</p>
            <p className="text-xs text-neutral-gray mb-5">How the top section of your site looks.</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  key: 'fullscreen',
                  label: 'Full Screen',
                  desc: 'Your photo fills the screen with text on top',
                  preview: (
                    <div className="h-16 bg-zinc-800 relative overflow-hidden rounded-sm mb-3">
                      <div className="absolute inset-0 bg-black/40" />
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                        <div className="w-16 h-2 bg-white/70 rounded" />
                        <div className="w-10 h-1.5 bg-white/40 rounded" />
                      </div>
                    </div>
                  ),
                },
                {
                  key: 'minimal',
                  label: 'Minimal',
                  desc: 'Bold typography only, no hero image',
                  preview: (
                    <div className="h-16 bg-gray-50 border border-gray-200 relative overflow-hidden rounded-sm mb-3 flex flex-col items-center justify-center gap-1">
                      <div className="w-20 h-2.5 bg-zinc-800 rounded" />
                      <div className="w-12 h-1.5 bg-zinc-300 rounded" />
                    </div>
                  ),
                },
              ].map(opt => (
                <button
                  key={opt.key}
                  onClick={() => setConfig(c => ({ ...c, hero_style: opt.key }))}
                  className={`text-left p-4 border rounded-sm transition-all ${
                    config.hero_style === opt.key
                      ? 'border-primary ring-1 ring-primary'
                      : 'border-gray-200 hover:border-gray-400'
                  }`}>
                  {opt.preview}
                  <p className="text-xs font-bold text-black">{opt.label}</p>
                  <p className="text-[10px] text-neutral-gray mt-0.5">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Portfolio layout */}
          <div>
            <p className="text-[10px] uppercase tracking-widest font-bold text-primary mb-1">Portfolio Layout</p>
            <p className="text-xs text-neutral-gray mb-5">How your photos are arranged in the grid.</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  key: 'masonry',
                  label: 'Masonry',
                  desc: 'Photos fill a flowing square grid',
                  preview: (
                    <div className="h-16 bg-gray-50 border border-gray-200 rounded-sm mb-3 p-2 grid grid-cols-4 gap-1">
                      {[...Array(8)].map((_, i) => (
                        <div key={i} className="bg-zinc-300 rounded-sm" />
                      ))}
                    </div>
                  ),
                },
                {
                  key: 'grid',
                  label: 'Clean Grid',
                  desc: 'Uniform rows with more breathing room',
                  preview: (
                    <div className="h-16 bg-gray-50 border border-gray-200 rounded-sm mb-3 p-2 grid grid-cols-3 gap-1.5">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className="bg-zinc-300 rounded-sm aspect-square" />
                      ))}
                    </div>
                  ),
                },
              ].map(opt => (
                <button
                  key={opt.key}
                  onClick={() => setConfig(c => ({ ...c, portfolio_layout: opt.key }))}
                  className={`text-left p-4 border rounded-sm transition-all ${
                    config.portfolio_layout === opt.key
                      ? 'border-primary ring-1 ring-primary'
                      : 'border-gray-200 hover:border-gray-400'
                  }`}>
                  {opt.preview}
                  <p className="text-xs font-bold text-black">{opt.label}</p>
                  <p className="text-[10px] text-neutral-gray mt-0.5">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Section toggles */}
          <div>
            <p className="text-[10px] uppercase tracking-widest font-bold text-primary mb-1">Sections</p>
            <p className="text-xs text-neutral-gray mb-5">Choose which sections appear on your website.</p>
            <div className="space-y-3">
              {[
                { key: 'show_services', label: 'Services & Pricing', desc: 'Your list of services with prices' },
                { key: 'show_about', label: 'About Section', desc: 'Your bio and collage of photos' },
                { key: 'show_booking', label: 'Booking Form', desc: 'Online enquiry form for clients' },
              ].map(({ key, label, desc }) => (
                <label key={key} className="flex items-center justify-between gap-4 p-4 border border-gray-100 hover:border-gray-200 cursor-pointer rounded-sm transition-colors">
                  <div>
                    <p className="text-sm font-semibold text-black">{label}</p>
                    <p className="text-xs text-neutral-gray">{desc}</p>
                  </div>
                  <div
                    onClick={() => setConfig(c => ({ ...c, [key]: !c[key] }))}
                    className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${config[key] ? 'bg-primary' : 'bg-gray-200'}`}>
                    <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${config[key] ? 'translate-x-5' : ''}`} />
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Save */}
          <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
            <button
              onClick={handleSaveDesign}
              disabled={savingDesign}
              className="bg-primary text-white px-6 py-3.5 text-xs uppercase tracking-widest font-bold hover:bg-black transition-colors disabled:opacity-50">
              {savingDesign ? 'Saving...' : 'Save Design'}
            </button>
            {designSaved && (
              <span className="text-xs text-green-600 font-bold uppercase tracking-widest">✓ Live on your site</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
