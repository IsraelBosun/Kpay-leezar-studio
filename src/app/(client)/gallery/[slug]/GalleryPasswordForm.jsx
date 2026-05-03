'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function GalleryPasswordForm({ slug, galleryId, studioName, logoUrl, accentColor = '#F0940A', studioTheme }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const bg = studioTheme?.bg ?? '#0a0a0a';
  const text = studioTheme?.text ?? '#ffffff';
  const textMuted = studioTheme?.textMuted ?? 'rgba(255,255,255,0.45)';
  const inputBg = studioTheme?.surface ?? '#111111';
  const inputBorder = studioTheme?.inputBorder ?? 'rgba(255,255,255,0.2)';
  const inputText = studioTheme?.inputText ?? '#ffffff';

  async function handleSubmit(e) {
    e.preventDefault();
    if (!password.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/gallery/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ galleryId, password }),
      });
      if (res.ok) {
        router.push(`/gallery/${slug}`);
        router.refresh();
      } else {
        setError('Incorrect password. Please try again.');
        setLoading(false);
      }
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: bg }}>
      <div className="w-full max-w-sm space-y-8">

        <div className="text-center">
          {logoUrl ? (
            <img src={logoUrl} alt={studioName} className="h-10 w-auto mx-auto mb-4 object-contain" />
          ) : (
            <p className="font-serif text-2xl mb-1" style={{ color: text }}>{studioName}</p>
          )}
          <p className="text-[10px] uppercase tracking-[0.3em] font-bold" style={{ color: accentColor }}>Private Gallery</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] uppercase tracking-widest font-bold block mb-2" style={{ color: textMuted }}>
              Enter Gallery Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              placeholder="Password"
              style={{ background: inputBg, borderColor: inputBorder, color: inputText }}
              className="w-full border px-4 py-3 focus:outline-none font-light"
            />
          </div>
          {error && (
            <p className="text-xs text-red-400">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 text-xs uppercase tracking-widest font-bold text-white transition-opacity hover:opacity-80 disabled:opacity-50"
            style={{ backgroundColor: accentColor }}>
            {loading ? 'Checking…' : 'View Gallery'}
          </button>
        </form>
      </div>
    </div>
  );
}
