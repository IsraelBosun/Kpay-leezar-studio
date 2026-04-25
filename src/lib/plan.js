const TRIAL_DAYS = 14;

export function isPro(studio) {
  if (studio.plan === 'pro') return true;
  const trialEnds = new Date(new Date(studio.created_at).getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000);
  return new Date() < trialEnds;
}
