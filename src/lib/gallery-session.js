import { createHmac, timingSafeEqual } from 'crypto';

function secret() {
  const s = process.env.GALLERY_SESSION_SECRET;
  if (!s) throw new Error('GALLERY_SESSION_SECRET env var is required');
  return s;
}

export function signGallerySession(galleryId) {
  return createHmac('sha256', secret()).update(galleryId).digest('hex');
}

export function verifyGallerySession(galleryId, token) {
  try {
    const expected = signGallerySession(galleryId);
    const a = Buffer.from(expected, 'hex');
    const b = Buffer.from(token, 'hex');
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function cookieName(galleryId) {
  return `gal_${galleryId.replace(/-/g, '')}`;
}
