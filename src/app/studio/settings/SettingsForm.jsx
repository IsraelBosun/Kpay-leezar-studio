'use client';

import { useState } from 'react';
import { saveSettings } from './actions';

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

export default function SettingsForm({ studio }) {
  const [accentColor, setAccentColor] = useState(studio.accent_color || '#D30E15');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // 'saved' | 'error'
  const [errorMsg, setErrorMsg] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    const fd = new FormData(e.target);
    fd.set('accent_color', accentColor);
    const result = await saveSettings(fd);
    setLoading(false);
    if (result?.error) { setStatus('error'); setErrorMsg(result.error); }
    else setStatus('saved');
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-100 divide-y divide-gray-50">

      {/* Studio info */}
      <div className="px-8 py-6 space-y-5">
        <p className="text-[10px] uppercase tracking-widest font-bold text-primary">Studio Info</p>

        <div className="grid sm:grid-cols-2 gap-5">
          <Field label="Studio Name *">
            <input type="text" name="name" required defaultValue={studio.name}
              className={inputClass} />
          </Field>
          <Field label="City / Location">
            <input type="text" name="location" defaultValue={studio.location || ''}
              placeholder="e.g. Lagos, Nigeria" className={inputClass} />
          </Field>
        </div>

        <Field label="Bio">
          <textarea name="bio" rows={4} defaultValue={studio.bio || ''}
            placeholder="Tell clients about your style and what makes your studio unique."
            className={`${inputClass} resize-none`} />
        </Field>
      </div>

      {/* Contact */}
      <div className="px-8 py-6 space-y-5">
        <p className="text-[10px] uppercase tracking-widest font-bold text-primary">Contact</p>

        <div className="grid sm:grid-cols-2 gap-5">
          <Field label="Phone / WhatsApp">
            <input type="tel" name="phone" defaultValue={studio.phone || ''}
              placeholder="+234 XXX XXX XXXX" className={inputClass} />
          </Field>
          <Field label="Email">
            <input type="email" name="email" defaultValue={studio.email || ''}
              placeholder="studio@email.com" className={inputClass} />
          </Field>
        </div>

        <Field label="Instagram URL">
          <input type="url" name="instagram_url" defaultValue={studio.instagram_url || ''}
            placeholder="https://instagram.com/yourstudio" className={inputClass} />
        </Field>
      </div>

      {/* Branding */}
      <div className="px-8 py-6 space-y-5">
        <p className="text-[10px] uppercase tracking-widest font-bold text-primary">Branding</p>

        <div>
          <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 block mb-3">
            Accent Colour
          </label>
          <div className="flex flex-wrap gap-2">
            {ACCENT_COLORS.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setAccentColor(c.value)}
                className={`w-9 h-9 transition-all duration-200 relative ${accentColor === c.value ? 'ring-2 ring-offset-2 ring-black scale-110' : 'hover:scale-105'}`}
                style={{ backgroundColor: c.value }}
                title={c.label}
              >
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
          <p className="text-[10px] text-gray-400 mt-2">
            Selected: <span className="font-bold text-black">{ACCENT_COLORS.find(c => c.value === accentColor)?.label}</span>
          </p>
        </div>
      </div>

      {/* Plan info */}
      <div className="px-8 py-6 space-y-3">
        <p className="text-[10px] uppercase tracking-widest font-bold text-primary">Plan</p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-black capitalize">{studio.plan} Plan</p>
            <p className="text-xs text-neutral-gray mt-0.5">
              {studio.plan === 'free' && 'Upgrade to Pro for online booking and Paystack payments.'}
              {studio.plan === 'pro' && 'Online booking and payments enabled.'}
              {studio.plan === 'studio' && 'All features unlocked.'}
            </p>
          </div>
          {studio.plan === 'free' && (
            <button type="button"
              className="bg-primary text-white px-4 py-2 text-xs uppercase tracking-widest font-bold hover:bg-black transition-colors whitespace-nowrap">
              Upgrade →
            </button>
          )}
        </div>
      </div>

      {/* Submit */}
      <div className="px-8 py-6 flex flex-col gap-3">
        {status === 'saved' && (
          <p className="text-xs text-green-600 bg-green-50 border border-green-200 px-4 py-3 font-bold uppercase tracking-widest">
            ✓ Settings saved
          </p>
        )}
        {status === 'error' && (
          <p className="text-xs text-red-500 bg-red-50 border border-red-100 px-4 py-3">{errorMsg}</p>
        )}
        <button type="submit" disabled={loading}
          className="bg-primary text-white py-3.5 text-xs uppercase tracking-widest font-bold hover:bg-black transition-colors disabled:opacity-50">
          {loading ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </form>
  );
}

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">{label}</label>
      {children}
    </div>
  );
}

const inputClass = 'bg-transparent border-b-2 border-gray-200 py-2.5 focus:outline-none focus:border-primary transition-all text-black placeholder:text-gray-300 font-light text-sm w-full';
