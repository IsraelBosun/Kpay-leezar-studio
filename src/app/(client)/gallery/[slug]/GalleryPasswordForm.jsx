'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function GalleryPasswordForm({ slug, studioName, logoUrl, accentColor = '#F0940A', studioTheme }) {
  const [password, setPassword] = useState('');
  const router = useRouter();

  const bg = studioTheme?.bg ?? '#0a0a0a';
  const surface = studioTheme?.surface ?? '#111111';
  const text = studioTheme?.text ?? '#ffffff';
  const textMuted = studioTheme?.textMuted ?? 'rgba(255,255,255,0.45)';
  const border = studioTheme?.border ?? 'rgba(255,255,255,0.08)';
  const inputBg = studioTheme?.surface ?? '#111111';
  const inputBorder = studioTheme?.inputBorder ?? 'rgba(255,255,255,0.2)';
  const inputText = studioTheme?.inputText ?? '#ffffff';

  function handleSubmit(e) {
    e.preventDefault();
    if (!password.trim()) return;
    router.push(`/gallery/${slug}?pw=${encodeURIComponent(password)}`);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: bg }}>
      <div className="w-full max-w-sm space-y-8">

        {/* Logo / studio name */}
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
          <button
            type="submit"
            className="w-full py-3.5 text-xs uppercase tracking-widest font-bold text-white transition-opacity hover:opacity-80"
            style={{ backgroundColor: accentColor }}>
            View Gallery
          </button>
        </form>
      </div>
    </div>
  );
}
