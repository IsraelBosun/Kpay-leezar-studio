'use client';

import { useState } from 'react';
import { saveStudioBasics, saveStudioBio, saveStudioServices } from '../actions';

const ACCENT_COLORS = [
  { label: 'Red',    value: '#D30E15' },
  { label: 'Black',  value: '#111111' },
  { label: 'Gold',   value: '#B8860B' },
  { label: 'Navy',   value: '#1B2A4A' },
  { label: 'Forest', value: '#2D5016' },
  { label: 'Plum',   value: '#6B2D5E' },
];

const DEFAULT_SERVICES = [
  { title: 'Portrait Session', description: 'Personal, lifestyle, and professional portraits.', price: '150000' },
  { title: 'Event Photography', description: 'Weddings, corporate events, and special occasions.', price: '350000' },
  { title: 'Commercial & Brand', description: 'High-quality visuals for brands and products.', price: '500000' },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [slug, setSlug] = useState('');
  const [accentColor, setAccentColor] = useState('#D30E15');
  const [services, setServices] = useState(DEFAULT_SERVICES);

  async function handleStep1(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = await saveStudioBasics(new FormData(e.target));
    setLoading(false);
    if (result?.error) return setError(result.error);
    setSlug(result.slug);
    setStep(2);
  }

  async function handleStep2(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const fd = new FormData(e.target);
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
    setLoading(false);
    if (result?.error) setError(result.error);
    // redirect happens inside saveStudioServices
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

  return (
    <div className="min-h-screen bg-[#f9f8f6] flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-xl">

        {/* Logo */}
        <div className="flex flex-col items-start mb-12">
          <span className="font-serif text-2xl tracking-tight text-black leading-none">LUMIS</span>
          <span className="text-[8px] uppercase tracking-[0.3em] font-bold text-primary">Studio</span>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-3 mb-10">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-3">
              <div className={`w-8 h-8 flex items-center justify-center text-xs font-bold transition-colors duration-300 ${
                step === s ? 'bg-primary text-white' :
                step > s  ? 'bg-black text-white' :
                'bg-gray-200 text-gray-400'
              }`}>
                {step > s ? '✓' : s}
              </div>
              {s < 3 && <div className={`flex-1 h-px w-12 ${step > s ? 'bg-black' : 'bg-gray-200'}`} />}
            </div>
          ))}
          <p className="ml-2 text-xs uppercase tracking-widest font-bold text-neutral-gray">
            {step === 1 && 'Studio Basics'}
            {step === 2 && 'Brand & Bio'}
            {step === 3 && 'Your Services'}
          </p>
        </div>

        {/* ── Step 1 — Basics ── */}
        {step === 1 && (
          <form onSubmit={handleStep1} className="space-y-8">
            <div>
              <h2 className="text-3xl font-serif text-black mb-1">Set up your studio</h2>
              <p className="text-sm text-neutral-gray italic">This becomes your public website.</p>
            </div>

            <div className="space-y-6">
              <div className="flex flex-col space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Studio Name *</label>
                <input
                  type="text" name="name" required
                  placeholder="e.g. Lumis Studio"
                  className="bg-transparent border-b-2 border-gray-200 py-3 focus:outline-none focus:border-primary transition-all text-black placeholder:text-gray-300 font-light"
                />
              </div>

              <div className="flex flex-col space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">City / Location *</label>
                <input
                  type="text" name="location" required
                  placeholder="e.g. Lagos, Nigeria"
                  className="bg-transparent border-b-2 border-gray-200 py-3 focus:outline-none focus:border-primary transition-all text-black placeholder:text-gray-300 font-light"
                />
              </div>

              <div className="flex flex-col space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">WhatsApp / Phone *</label>
                <input
                  type="tel" name="phone" required
                  placeholder="+234 XXX XXX XXXX"
                  className="bg-transparent border-b-2 border-gray-200 py-3 focus:outline-none focus:border-primary transition-all text-black placeholder:text-gray-300 font-light"
                />
              </div>
            </div>

            {error && <p className="text-xs text-red-500 italic bg-red-50 border border-red-100 px-4 py-3">{error}</p>}

            <button type="submit" disabled={loading}
              className="w-full bg-primary text-white py-4 text-xs uppercase tracking-widest font-bold hover:bg-black transition-colors duration-300 disabled:opacity-50">
              {loading ? 'Saving...' : 'Continue →'}
            </button>
          </form>
        )}

        {/* ── Step 2 — Brand & Bio ── */}
        {step === 2 && (
          <form onSubmit={handleStep2} className="space-y-8">
            <div>
              <h2 className="text-3xl font-serif text-black mb-1">Brand & bio</h2>
              <p className="text-sm text-neutral-gray italic">Tell the world who you are.</p>
            </div>

            <div className="space-y-6">
              <div className="flex flex-col space-y-3">
                <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Accent Colour</label>
                <div className="flex flex-wrap gap-3">
                  {ACCENT_COLORS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setAccentColor(c.value)}
                      className={`w-8 h-8 transition-all duration-200 ${accentColor === c.value ? 'ring-2 ring-offset-2 ring-black scale-110' : ''}`}
                      style={{ backgroundColor: c.value }}
                      title={c.label}
                    />
                  ))}
                </div>
              </div>

              <div className="flex flex-col space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Studio Bio *</label>
                <textarea
                  name="bio" required rows={5}
                  placeholder="Tell clients about your studio, your style, and what makes you unique. Keep it authentic — this is your first impression."
                  className="bg-transparent border-b-2 border-gray-200 py-3 focus:outline-none focus:border-primary transition-all text-black placeholder:text-gray-300 font-light resize-none"
                />
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

        {/* ── Step 3 — Services ── */}
        {step === 3 && (
          <form onSubmit={handleStep3} className="space-y-8">
            <div>
              <h2 className="text-3xl font-serif text-black mb-1">Your services</h2>
              <p className="text-sm text-neutral-gray italic">Add what you offer and your pricing. You can always edit later.</p>
            </div>

            <div className="space-y-6">
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
                    <input
                      type="text" value={service.title} required
                      onChange={(e) => updateService(i, 'title', e.target.value)}
                      placeholder="e.g. Portrait Session"
                      className="bg-transparent border-b-2 border-gray-200 py-2 focus:outline-none focus:border-primary transition-all text-black placeholder:text-gray-300 font-light text-sm"
                    />
                  </div>

                  <div className="flex flex-col space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Description</label>
                    <input
                      type="text" value={service.description}
                      onChange={(e) => updateService(i, 'description', e.target.value)}
                      placeholder="Short description of this service"
                      className="bg-transparent border-b-2 border-gray-200 py-2 focus:outline-none focus:border-primary transition-all text-black placeholder:text-gray-300 font-light text-sm"
                    />
                  </div>

                  <div className="flex flex-col space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Starting Price (₦)</label>
                    <input
                      type="number" value={service.price}
                      onChange={(e) => updateService(i, 'price', e.target.value)}
                      placeholder="e.g. 150000"
                      className="bg-transparent border-b-2 border-gray-200 py-2 focus:outline-none focus:border-primary transition-all text-black placeholder:text-gray-300 font-light text-sm"
                    />
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
