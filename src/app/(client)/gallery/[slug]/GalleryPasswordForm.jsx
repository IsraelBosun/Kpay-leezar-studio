'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function GalleryPasswordForm({ slug, studioName, accentColor = '#F0940A' }) {
  const [password, setPassword] = useState('');
  const router = useRouter();

  function handleSubmit(e) {
    e.preventDefault();
    if (!password.trim()) return;
    router.push(`/gallery/${slug}?pw=${encodeURIComponent(password)}`);
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <p className="font-serif text-3xl text-white mb-2">{studioName}</p>
          <p className="text-xs uppercase tracking-[0.3em] font-bold" style={{ color: accentColor }}>Private Gallery</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] uppercase tracking-widest font-bold text-white/40 block mb-2">
              Enter Gallery Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 focus:outline-none focus:border-white/30 font-light placeholder:text-white/20"
              placeholder="Password"
            />
          </div>
          <button type="submit"
            className="w-full py-3.5 text-xs uppercase tracking-widest font-bold text-white transition-colors"
            style={{ backgroundColor: accentColor }}>
            View Gallery
          </button>
        </form>
      </div>
    </div>
  );
}
