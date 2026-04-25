'use client';

import { useState } from 'react';
import { saveStudioBasics } from '../actions';

export default function OnboardingPage() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [phone, setPhone] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const fd = new FormData();
    fd.set('name', name);
    fd.set('location', location);
    fd.set('phone', phone);
    const result = await saveStudioBasics(fd);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
    // saveStudioBasics returns { success, slug } — redirect happens next
    if (result?.success) {
      window.location.href = '/studio/dashboard';
    }
  }

  const inputClass = "bg-transparent border-b-2 border-gray-200 py-3 focus:outline-none focus:border-primary transition-all text-black placeholder:text-gray-300 font-light w-full";

  return (
    <div className="min-h-screen bg-[#f9f8f6] flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-xl">

        <div className="flex flex-col items-start mb-12">
          <span className="font-serif text-2xl tracking-tight text-black leading-none">photostudio</span>
          <span className="text-[8px] uppercase tracking-[0.3em] font-bold text-primary">.ng</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <h2 className="text-3xl font-serif text-black mb-1">Set up your studio</h2>
            <p className="text-sm text-neutral-gray italic">Just the basics — you can fill in everything else from your dashboard.</p>
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
            {loading ? 'Creating your studio...' : 'Go to Dashboard →'}
          </button>
        </form>

      </div>
    </div>
  );
}
