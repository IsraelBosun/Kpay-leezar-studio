'use client';

import { useState, useCallback } from 'react';
import { THEMES, resolveConfig } from '@/lib/themes';
import { saveWebsiteConfig, savePhotoCategories, loadSamplePhotos, saveStudioContent } from './actions';

const CATEGORIES = ['Weddings', 'Portraits', 'Events', 'Commercial', 'Other'];

const ACCENT_COLORS = [
  { label: 'Crimson',  value: '#D30E15' },
  { label: 'Coral',    value: '#E8441A' },
  { label: 'Amber',    value: '#F0940A' },
  { label: 'Gold',     value: '#B8860B' },
  { label: 'Sage',     value: '#4A7C59' },
  { label: 'Forest',   value: '#2D5016' },
  { label: 'Teal',     value: '#0D7377' },
  { label: 'Ocean',    value: '#1E6B9E' },
  { label: 'Navy',     value: '#1B2A4A' },
  { label: 'Violet',   value: '#5B21B6' },
  { label: 'Plum',     value: '#6B2D5E' },
  { label: 'Rose',     value: '#BE185D' },
  { label: 'Blush',    value: '#C4748A' },
  { label: 'Slate',    value: '#475569' },
  { label: 'Charcoal', value: '#374151' },
  { label: 'Obsidian', value: '#111111' },
];

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
  const [loadingSamples, setLoadingSamples] = useState(false);

  const [config, setConfig] = useState(resolveConfig(websiteConfig));
  const [savingDesign, setSavingDesign] = useState(false);
  const [designSaved, setDesignSaved] = useState(false);

  // ── Content state ──────────────────────────────────────────────────
  const [bio, setBio] = useState(studio.bio || '');
  const [email, setEmail] = useState(studio.email || '');
  const [phone, setPhone] = useState(studio.phone || '');
  const [instagramUrl, setInstagramUrl] = useState(studio.instagram_url || '');
  const [accentColor, setAccentColor] = useState(studio.accent_color || '#F0940A');
  const [savingContent, setSavingContent] = useState(false);
  const [contentSaved, setContentSaved] = useState(false);

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

  // ── Sample photos ────────────────────────────────────────────────────
  async function handleLoadSamples() {
    setLoadingSamples(true);
    const result = await loadSamplePhotos();
    setLoadingSamples(false);
    if (result?.photos) {
      setPhotos(prev => [...prev, ...result.photos]);
      setCategories(prev => ({
        ...prev,
        ...Object.fromEntries(result.photos.map(p => [p.id, p.category || ''])),
      }));
    }
  }

  // ── Content save ─────────────────────────────────────────────────────
  async function handleSaveContent() {
    setSavingContent(true);
    setContentSaved(false);
    await saveStudioContent({ bio, email, phone, instagram_url: instagramUrl, accent_color: accentColor });
    setSavingContent(false);
    setContentSaved(true);
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
    { id: 'content', label: 'Content' },
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

          {/* Sample photos shortcut */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleLoadSamples}
              disabled={loadingSamples}
              className="flex items-center gap-2 px-4 py-2.5 border border-dashed border-gray-300 text-[10px] uppercase tracking-widest font-bold text-zinc-400 hover:border-primary hover:text-primary transition-colors disabled:opacity-40">
              {loadingSamples ? (
                <>
                  <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Loading samples...
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Use sample photos
                </>
              )}
            </button>
            <p className="text-[10px] text-neutral-gray">8 photos · 4 categories · mixed sizes</p>
          </div>

          {/* Photos grid */}
          {photos.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-neutral-gray italic">No photos yet. Upload some or use the sample photos above.</p>
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
                    <div className="h-16 bg-gray-50 border border-gray-200 rounded-sm mb-3 p-2 grid grid-cols-3 gap-1.5 overflow-hidden">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className="bg-zinc-300 rounded-sm" />
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

      {/* ── Content tab ── */}
      {activeTab === 'content' && (
        <div className="p-6 md:p-8 space-y-10">

          {/* Bio */}
          <div>
            <p className="text-[10px] uppercase tracking-widest font-bold text-primary mb-1">About</p>
            <p className="text-xs text-neutral-gray mb-5">This appears in the About section of your website. Keep it short and punchy — 2 to 3 sentences.</p>
            <textarea
              rows={4}
              maxLength={300}
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="Tell clients about your style, your background, and what makes your studio unique..."
              className={`w-full text-sm bg-gray-50 border py-3 px-4 focus:outline-none text-black placeholder:text-zinc-400 resize-none transition-colors ${
                bio.length >= 280 ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-primary'
              }`}
            />
            <div className="flex items-center justify-between mt-1.5">
              <p className={`text-[11px] font-medium ${
                bio.length >= 300 ? 'text-red-500' :
                bio.length >= 280 ? 'text-amber-500' :
                'text-zinc-400'
              }`}>
                {300 - bio.length} characters remaining
              </p>
              <p className="text-[11px] text-zinc-300">{bio.length} / 300</p>
            </div>
          </div>

          {/* Contact */}
          <div>
            <p className="text-[10px] uppercase tracking-widest font-bold text-primary mb-1">Contact</p>
            <p className="text-xs text-neutral-gray mb-5">Shown in your website footer and booking form.</p>
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-zinc-400">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="studio@email.com"
                    className="text-sm bg-gray-50 border border-gray-200 py-3 px-4 focus:outline-none focus:border-primary text-black placeholder:text-zinc-400"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-zinc-400">Phone / WhatsApp</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+234 800 000 0000"
                    className="text-sm bg-gray-50 border border-gray-200 py-3 px-4 focus:outline-none focus:border-primary text-black placeholder:text-zinc-400"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-widest font-bold text-zinc-400">Instagram URL</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2">
                    <svg className="w-4 h-4 text-zinc-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </span>
                  <input
                    type="url"
                    value={instagramUrl}
                    onChange={e => setInstagramUrl(e.target.value)}
                    placeholder="https://instagram.com/yourstudio"
                    className="w-full text-sm bg-gray-50 border border-gray-200 py-3 pl-11 pr-4 focus:outline-none focus:border-primary text-black placeholder:text-zinc-400"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Accent colour */}
          <div>
            <p className="text-[10px] uppercase tracking-widest font-bold text-primary mb-1">Accent Colour</p>
            <p className="text-xs text-neutral-gray mb-5">The brand colour used for buttons, highlights, and links across your site.</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {ACCENT_COLORS.map(c => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setAccentColor(c.value)}
                  title={c.label}
                  className={`w-9 h-9 transition-all duration-150 relative flex-shrink-0 ${accentColor === c.value ? 'ring-2 ring-offset-2 ring-black scale-110' : 'hover:scale-105'}`}
                  style={{ backgroundColor: c.value }}>
                  {accentColor === c.value && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <svg className="w-4 h-4 text-white drop-shadow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                  )}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-zinc-400">
              Selected: <span className="font-bold text-black">{ACCENT_COLORS.find(c => c.value === accentColor)?.label ?? accentColor}</span>
            </p>
          </div>

          {/* Save */}
          <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
            <button
              onClick={handleSaveContent}
              disabled={savingContent}
              className="bg-primary text-white px-6 py-3.5 text-xs uppercase tracking-widest font-bold hover:bg-black transition-colors disabled:opacity-50">
              {savingContent ? 'Saving...' : 'Save Content'}
            </button>
            {contentSaved && (
              <span className="text-xs text-green-600 font-bold uppercase tracking-widest">✓ Live on your site</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
