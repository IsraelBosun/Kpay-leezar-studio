'use client';

import { useState } from 'react';
import { createGallery } from '../actions';
import Link from 'next/link';

export default function NewGalleryForm({ bookings }) {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = await createGallery(new FormData(e.target));
    setLoading(false);
    if (result?.error) setError(result.error);
  }

  return (
    <div className="space-y-8 max-w-xl">
      <div>
        <Link href="/studio/galleries" className="text-xs uppercase tracking-widest text-neutral-gray hover:text-primary transition-colors font-bold">
          ← Back to Galleries
        </Link>
        <h1 className="text-3xl md:text-4xl font-serif text-black mt-4">New Gallery</h1>
        <p className="text-sm text-neutral-gray italic mt-1">Create a private gallery to share photos with a client.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-gray-100 divide-y divide-gray-50">
        <div className="px-8 py-6 space-y-5">

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Gallery Title *</label>
            <input type="text" name="title" required
              placeholder="e.g. Adaeze & Chidi Wedding"
              className="bg-transparent border-b-2 border-gray-200 py-2.5 focus:outline-none focus:border-primary transition-all text-black placeholder:text-gray-300 font-light text-sm" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Link to Booking</label>
            <select name="booking_id"
              className="bg-transparent border-b-2 border-gray-200 py-2.5 focus:outline-none focus:border-primary transition-all text-black font-light text-sm">
              <option value="">— None (standalone gallery) —</option>
              {bookings.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.client_name}{b.session_date ? ` — ${new Date(b.session_date).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Gallery Password</label>
            <input type="text" name="password"
              placeholder="Optional — leave blank for no password"
              className="bg-transparent border-b-2 border-gray-200 py-2.5 focus:outline-none focus:border-primary transition-all text-black placeholder:text-gray-300 font-light text-sm" />
            <p className="text-[10px] text-gray-400">If set, clients must enter this to view the gallery.</p>
          </div>
        </div>

        <div className="px-8 py-6 flex flex-col gap-3">
          {error && (
            <p className="text-xs text-red-500 bg-red-50 border border-red-100 px-4 py-3">{error}</p>
          )}
          <div className="flex gap-3">
            <Link href="/studio/galleries"
              className="flex-1 border border-gray-200 text-black py-3.5 text-xs uppercase tracking-widest font-bold hover:bg-gray-50 transition-colors text-center">
              Cancel
            </Link>
            <button type="submit" disabled={loading}
              className="flex-[2] bg-primary text-white py-3.5 text-xs uppercase tracking-widest font-bold hover:bg-black transition-colors disabled:opacity-50">
              {loading ? 'Creating...' : 'Create Gallery'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
