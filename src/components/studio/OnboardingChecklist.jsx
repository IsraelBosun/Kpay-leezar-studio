'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function OnboardingChecklist({ steps, studioUrl, studioSlug }) {
  const [linkCopied, setLinkCopied] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setLinkCopied(!!localStorage.getItem(`link_copied_${studioSlug}`));
    setDismissed(!!localStorage.getItem(`checklist_dismissed_${studioSlug}`));
  }, [studioSlug]);

  const allSteps = [
    ...steps,
    {
      id: 'share',
      done: linkCopied,
      label: 'Share your studio link with your first client',
      isAction: true,
    },
  ];

  const completedCount = allSteps.filter(s => s.done).length;
  const allDone = completedCount === allSteps.length;

  if (!mounted || dismissed || allDone) return null;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(studioUrl);
    } catch {
      // fallback — still mark done
    }
    localStorage.setItem(`link_copied_${studioSlug}`, '1');
    setLinkCopied(true);
  }

  function handleDismiss() {
    localStorage.setItem(`checklist_dismissed_${studioSlug}`, '1');
    setDismissed(true);
  }

  return (
    <div className="bg-white border border-gray-100 px-6 py-5">
      <div className="flex items-start justify-between mb-5">
        <div>
          <p className="text-[10px] uppercase tracking-widest font-bold text-primary mb-0.5">Get started</p>
          <p className="text-xs text-neutral-gray">{completedCount} of {allSteps.length} steps complete</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-20 h-1 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500 rounded-full"
              style={{ width: `${(completedCount / allSteps.length) * 100}%` }}
            />
          </div>
          <button
            onClick={handleDismiss}
            className="text-neutral-gray hover:text-black transition-colors"
            aria-label="Dismiss checklist"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {allSteps.map((s) => (
          <div key={s.id} className="flex items-center gap-3">
            <div className={`w-5 h-5 flex-shrink-0 flex items-center justify-center border-2 transition-colors ${
              s.done ? 'border-green-500 bg-green-500' : 'border-gray-200'
            }`}>
              {s.done && (
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            {s.done ? (
              <span className="text-sm text-neutral-gray line-through">{s.label}</span>
            ) : s.isAction ? (
              <button
                onClick={handleCopy}
                className="text-sm text-black font-medium hover:text-primary transition-colors text-left"
              >
                {s.label} <span className="text-primary">→ Copy link</span>
              </button>
            ) : (
              <Link
                href={s.href}
                className="text-sm text-black font-medium hover:text-primary transition-colors"
              >
                {s.label} <span className="text-primary">→</span>
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
