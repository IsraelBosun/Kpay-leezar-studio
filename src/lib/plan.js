const TRIAL_DAYS = 14;

export const FREE_STORAGE_LIMIT = 2 * 1024 * 1024 * 1024; // 2 GB in bytes
export const FREE_GALLERY_LIMIT = 5;

export function isPro(studio) {
  if (studio.plan === 'pro') return true;
  const trialEnds = new Date(new Date(studio.created_at).getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000);
  return new Date() < trialEnds;
}
