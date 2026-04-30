'use client';

import { useEffect } from 'react';
import posthog from 'posthog-js';

export default function PostHogIdentify({ userId, email, studioId, studioName, studioSlug, plan }) {
  useEffect(() => {
    if (!posthog.__loaded) return;
    posthog.identify(userId, {
      email,
      studio_id: studioId,
      studio_name: studioName,
      studio_slug: studioSlug,
      plan,
    });
  }, [userId, email, studioId, studioName, studioSlug, plan]);

  return null;
}
