'use client';

import { useState } from 'react';
import { saveStudioBasics, saveStudioBio, saveStudioServices, savePortfolioPhotos } from '../actions';

const ACCENT_COLORS = [
  { label: 'Crimson',  value: '#D30E15' },
  { label: 'Coral',    value: '#E8441A' },
  { label: 'Amber',    value: '#D97706' },
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

const DEMO = {
  name: 'Lagos Lens Studio',
  location: 'Lagos, Nigeria',
  phone: '+234 813 456 7890',
  bio: 'Lagos Lens is a premium photography studio based in Lagos, Nigeria. We specialise in capturing authentic moments that tell your story — from intimate portraits to grand celebrations. With an eye for detail and a passion for visual storytelling, every shoot is approached with intention and care. We have worked with hundreds of clients across Lagos, Abuja, and Port Harcourt, delivering images that our clients treasure for a lifetime.',
  accentColor: '#D30E15',
  logoUrl: 'https://ui-avatars.com/api/?name=LL&background=FFFFFF&color=1E3A8A&size=200&bold=true&format=png',
  services: [
    { title: 'Portrait Session', description: 'Personal, lifestyle, and professional portraits crafted to reflect your individuality.', price: '150000' },
    { title: 'Wedding Photography', description: 'Full-day wedding coverage — from getting ready to the last dance.', price: '650000' },
    { title: 'Event Photography', description: 'Corporate events, birthdays, and special occasions documented with precision.', price: '350000' },
    { title: 'Commercial & Brand', description: 'High-quality visuals designed to elevate brands, products, and corporate identity.', price: '500000' },
  ],
  portfolioPhotos: [
    { src: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&h=800&fit=crop', category: 'Weddings' },
    { src: 'https://images.unsplash.com/photo-1529636798458-92182e662485?w=800&h=800&fit=crop', category: 'Weddings' },
    { src: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&h=800&fit=crop', category: 'Portraits' },
    { src: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&h=800&fit=crop', category: 'Portraits' },
    { src: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=800&fit=crop', category: 'Events' },
    { src: 'https://images.unsplash.com/photo-1566737236500-f3c63b065e38?w=800&h=800&fit=crop', category: 'Events' },
    { src: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=800&fit=crop', category: 'Commercial' },
  ],
};

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [slug, setSlug] = useState('');
  const [demoMode, setDemoMode] = useState(false);

  // Controlled field state
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [phone, setPhone] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [bio, setBio] = useState('');
  const [accentColor, setAccentColor] = useState('#D30E15');
  const [services, setServices] = useState([
    { title: '', description: '', price: '' },
  ]);

  function fillDemo() {
    setDemoMode(true);
    if (step === 1) {
      setName(DEMO.name);
      setLocation(DEMO.location);
      setPhone(DEMO.phone);
      setLogoUrl(DEMO.logoUrl);
    }
    if (step === 2) {
      setBio(DEMO.bio);
      setAccentColor(DEMO.accentColor);
    }
    if (step === 3) {
      setServices(DEMO.services);
    }
  }

  async function handleStep1(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const fd = new FormData();
    fd.set('name', name);
    fd.set('location', location);
    fd.set('phone', phone);
    if (logoUrl) fd.set('logo_url', logoUrl);
    const result = await saveStudioBasics(fd);
    setLoading(false);
    if (result?.error) return setError(result.error);
    setSlug(result.slug);
    setStep(2);
  }

  async function handleStep2(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const fd = new FormData();
    fd.set('bio', bio);
    fd.set('accentColor', accentColor);
    const result = await saveStudioBio(fd);
    setLoading(false);
    if (result?.error) return setError(result.error);
    setStep(3);
  }

  async function handleStep3(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = await saveStudioServices(services);
    if (result?.error) {
      setLoading(false);
      return setError(result.error);
    }
    if (demoMode) await savePortfolioPhotos(DEMO.portfolioPhotos);
    // saveStudioServices redirects on success — loading stays true
  }

  function updateService(index, field, value) {
    setServices(prev => prev.map((s, i) => i === index ? { ...s, [field]: value } : s));
  }

  function addService() {
    setServices(prev => [...prev, { title: '', description: '', price: '' }]);
  }

  function removeService(index) {
    setServices(prev => prev.filter((_, i) => i !== index));
  }

  const inputClass = "bg-transparent border-b-2 border-gray-200 py-3 focus:outline-none focus:border-primary transition-all text-black placeholder:text-gray-300 font-light w-full";

  return (
    <div className="min-h-screen bg-[#f9f8f6] flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-xl">

        {/* Logo */}
        <div className="flex flex-col items-start mb-12">
          <span className="font-serif text-2xl tracking-tight text-black leading-none">photostudio</span>
          <span className="text-[8px] uppercase tracking-[0.3em] font-bold text-primary">.ng</span>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-3 mb-3">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-3">
              <div className={`w-8 h-8 flex items-center justify-center text-xs font-bold transition-colors duration-300 ${
                step === s ? 'bg-primary text-white' :
                step > s  ? 'bg-black text-white' :
                'bg-gray-200 text-gray-400'
              }`}>
                {step > s ? '✓' : s}
              </div>
              {s < 3 && <div className={`h-px w-12 ${step > s ? 'bg-black' : 'bg-gray-200'}`} />}
            </div>
          ))}
          <p className="ml-2 text-xs uppercase tracking-widest font-bold text-neutral-gray">
            {step === 1 && 'Studio Basics'}
            {step === 2 && 'Brand & Bio'}
            {step === 3 && 'Your Services'}
          </p>
        </div>

        {/* Demo data shortcut */}
        <div className="flex justify-end mb-8">
          <button type="button" onClick={fillDemo}
            className="text-[10px] uppercase tracking-widest font-bold text-primary hover:underline">
            ↓ Fill with demo data
          </button>
        </div>

        {/* ── Step 1 ── */}
        {step === 1 && (
          <form onSubmit={handleStep1} className="space-y-8">
            <div>
              <h2 className="text-3xl font-serif text-black mb-1">Set up your studio</h2>
              <p className="text-sm text-neutral-gray italic">This becomes your public website.</p>
            </div>

            <div className="space-y-6">
              <div className="flex flex-col space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Studio Name *</label>
                <input type="text" required value={name} onChange={e => setName(e.target.value)}
                  placeholder="e.g. Lagos Lens Studio" className={inputClass} />
              </div>

              <div className="flex flex-col space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">City / Location *</label>
                <input type="text" required value={location} onChange={e => setLocation(e.target.value)}
                  placeholder="e.g. Lagos, Nigeria" className={inputClass} />
              </div>

              <div className="flex flex-col space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">WhatsApp / Phone *</label>
                <input type="tel" required value={phone} onChange={e => setPhone(e.target.value)}
                  placeholder="+234 XXX XXX XXXX" className={inputClass} />
              </div>
            </div>

            {error && <p className="text-xs text-red-500 italic bg-red-50 border border-red-100 px-4 py-3">{error}</p>}

            <button type="submit" disabled={loading}
              className="w-full bg-primary text-white py-4 text-xs uppercase tracking-widest font-bold hover:bg-black transition-colors duration-300 disabled:opacity-50">
              {loading ? 'Saving...' : 'Continue →'}
            </button>
          </form>
        )}

        {/* ── Step 2 ── */}
        {step === 2 && (
          <form onSubmit={handleStep2} className="space-y-8">
            <div>
              <h2 className="text-3xl font-serif text-black mb-1">Brand & bio</h2>
              <p className="text-sm text-neutral-gray italic">Tell the world who you are.</p>
            </div>

            <div className="space-y-6">
              <div className="flex flex-col space-y-3">
                <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Accent Colour</label>
                <div className="flex flex-wrap gap-2">
                  {ACCENT_COLORS.map((c) => (
                    <button key={c.value} type="button" onClick={() => setAccentColor(c.value)}
                      className={`w-9 h-9 transition-all duration-200 relative ${accentColor === c.value ? 'ring-2 ring-offset-2 ring-black scale-110' : 'hover:scale-105'}`}
                      style={{ backgroundColor: c.value }} title={c.label}>
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
                <p className="text-[10px] text-gray-400">
                  Selected: <span className="font-bold text-black">{ACCENT_COLORS.find(c => c.value === accentColor)?.label}</span>
                </p>
              </div>

              <div className="flex flex-col space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Studio Bio *</label>
                <textarea required rows={6} value={bio} onChange={e => setBio(e.target.value)}
                  placeholder="Tell clients about your studio, your style, and what makes you unique..."
                  className="bg-transparent border-b-2 border-gray-200 py-3 focus:outline-none focus:border-primary transition-all text-black placeholder:text-gray-300 font-light resize-none" />
              </div>
            </div>

            {error && <p className="text-xs text-red-500 italic bg-red-50 border border-red-100 px-4 py-3">{error}</p>}

            <div className="flex gap-4">
              <button type="button" onClick={() => setStep(1)}
                className="flex-1 border border-gray-200 text-black py-4 text-xs uppercase tracking-widest font-bold hover:bg-gray-50 transition-colors">
                Back
              </button>
              <button type="submit" disabled={loading}
                className="flex-[2] bg-primary text-white py-4 text-xs uppercase tracking-widest font-bold hover:bg-black transition-colors duration-300 disabled:opacity-50">
                {loading ? 'Saving...' : 'Continue →'}
              </button>
            </div>
          </form>
        )}

        {/* ── Step 3 ── */}
        {step === 3 && (
          <form onSubmit={handleStep3} className="space-y-8">
            <div>
              <h2 className="text-3xl font-serif text-black mb-1">Your services</h2>
              <p className="text-sm text-neutral-gray italic">Add what you offer and your pricing. You can always edit later.</p>
            </div>

            <div className="space-y-4">
              {services.map((service, i) => (
                <div key={i} className="relative border border-gray-100 p-6 space-y-4 bg-white">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-primary">Service {i + 1}</span>
                    {services.length > 1 && (
                      <button type="button" onClick={() => removeService(i)}
                        className="text-[10px] uppercase tracking-widest text-gray-400 hover:text-red-500 transition-colors">
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="flex flex-col space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Title</label>
                    <input type="text" required value={service.title}
                      onChange={(e) => updateService(i, 'title', e.target.value)}
                      placeholder="e.g. Portrait Session"
                      className="bg-transparent border-b-2 border-gray-200 py-2 focus:outline-none focus:border-primary transition-all text-black placeholder:text-gray-300 font-light text-sm" />
                  </div>

                  <div className="flex flex-col space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Description</label>
                    <input type="text" value={service.description}
                      onChange={(e) => updateService(i, 'description', e.target.value)}
                      placeholder="Short description of this service"
                      className="bg-transparent border-b-2 border-gray-200 py-2 focus:outline-none focus:border-primary transition-all text-black placeholder:text-gray-300 font-light text-sm" />
                  </div>

                  <div className="flex flex-col space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Starting Price (₦)</label>
                    <input type="number" value={service.price}
                      onChange={(e) => updateService(i, 'price', e.target.value)}
                      placeholder="e.g. 150000"
                      className="bg-transparent border-b-2 border-gray-200 py-2 focus:outline-none focus:border-primary transition-all text-black placeholder:text-gray-300 font-light text-sm" />
                  </div>
                </div>
              ))}

              {services.length < 6 && (
                <button type="button" onClick={addService}
                  className="w-full border border-dashed border-gray-300 py-4 text-xs uppercase tracking-widest font-bold text-gray-400 hover:border-primary hover:text-primary transition-colors">
                  + Add Another Service
                </button>
              )}
            </div>

            {slug && (
              <div className="bg-black text-white px-6 py-4">
                <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1">Your studio will be live at</p>
                <p className="font-serif text-lg">{slug}.photostudio.ng</p>
              </div>
            )}

            {error && <p className="text-xs text-red-500 italic bg-red-50 border border-red-100 px-4 py-3">{error}</p>}

            <div className="flex gap-4">
              <button type="button" onClick={() => setStep(2)}
                className="flex-1 border border-gray-200 text-black py-4 text-xs uppercase tracking-widest font-bold hover:bg-gray-50 transition-colors">
                Back
              </button>
              <button type="submit" disabled={loading}
                className="flex-[2] bg-primary text-white py-4 text-xs uppercase tracking-widest font-bold hover:bg-black transition-colors duration-300 disabled:opacity-50">
                {loading ? 'Launching...' : '🎉 Launch My Studio'}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
