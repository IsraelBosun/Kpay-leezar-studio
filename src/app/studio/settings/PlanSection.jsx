'use client';

import { useState } from 'react';

const FEATURES = [
  'Unlimited bookings',
  'Paystack deposit & balance collection',
  'Unlimited client galleries (20 photos each)',
  'Your studio URL at yourstudio.photostudio.ng',
  'Email notifications to clients',
];

export default function PlanSection({ studio }) {
  const isPro = studio.plan === 'pro';

  const [loadingBilling, setLoadingBilling] = useState(null);
  const [upgradeError, setUpgradeError] = useState(null);

  async function handleUpgrade(billing) {
    setLoadingBilling(billing);
    setUpgradeError(null);
    try {
      const res = await fetch('/api/paystack/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ billing }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      window.location.href = data.authorization_url;
    } catch (err) {
      setUpgradeError(err.message || 'Something went wrong. Please try again.');
      setLoadingBilling(null);
    }
  }

  if (isPro) {
    return (
      <div className="bg-white border border-gray-100 px-8 py-6 flex items-center gap-4">
        <span className="w-3 h-3 rounded-full bg-green-500 flex-shrink-0" />
        <div>
          <p className="text-sm font-bold text-black">Pro Plan — Active</p>
          <p className="text-xs text-neutral-gray mt-0.5">
            Online booking, Paystack payments, and unlimited galleries are enabled.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white border border-gray-100 px-8 py-4 flex items-center gap-3">
        <span className="w-2 h-2 rounded-full bg-gray-300 flex-shrink-0" />
        <p className="text-sm text-neutral-gray">
          You&apos;re on the <span className="font-bold text-black">Free plan.</span> Upgrade to unlock booking and payments.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {/* Monthly */}
        <PlanCard
          title="Pro Monthly"
          price="₦10,000"
          period="per month"
          note={null}
          features={FEATURES}
          loading={loadingBilling === 'monthly'}
          disabled={!!loadingBilling}
          onUpgrade={() => handleUpgrade('monthly')}
          highlight={false}
        />

        {/* Yearly */}
        <PlanCard
          title="Pro Yearly"
          price="₦100,000"
          period="per year"
          note="₦8,333/mo — save ₦20,000"
          features={FEATURES}
          loading={loadingBilling === 'yearly'}
          disabled={!!loadingBilling}
          onUpgrade={() => handleUpgrade('yearly')}
          highlight={true}
        />
      </div>

      {upgradeError && (
        <p className="text-xs text-red-500 bg-red-50 border border-red-100 px-4 py-3">{upgradeError}</p>
      )}

      <p className="text-[10px] text-gray-400 text-center">
        Secure payment via Paystack · Cancel anytime · 14-day free trial included
      </p>
    </div>
  );
}

function PlanCard({ title, price, period, note, features, loading, disabled, onUpgrade, highlight }) {
  return (
    <div className={`bg-white border flex flex-col ${highlight ? 'border-amber-300' : 'border-gray-100'}`}>
      {highlight && (
        <div className="px-6 py-2 text-center" style={{ backgroundColor: '#F0940A' }}>
          <p className="text-[10px] uppercase tracking-widest font-bold text-white">Best Value</p>
        </div>
      )}

      <div className="px-4 sm:px-6 py-4 sm:py-6 flex-1 space-y-5">
        <div>
          <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2">{title}</p>
          <p className="text-3xl font-serif text-black leading-none">{price}</p>
          <p className="text-xs text-neutral-gray mt-1">{period}</p>
          {note && <p className="text-xs text-amber-600 font-medium mt-1">{note}</p>}
        </div>

        <ul className="space-y-2">
          {features.map((f) => (
            <li key={f} className="flex items-start gap-2 text-xs text-neutral-gray">
              <span className="text-primary mt-px flex-shrink-0">—</span>
              {f}
            </li>
          ))}
        </ul>
      </div>

      <div className="px-4 sm:px-6 pb-4 sm:pb-6">
        <button
          type="button"
          onClick={onUpgrade}
          disabled={disabled}
          className={`w-full py-3 text-xs uppercase tracking-widest font-bold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${highlight ? 'hover:opacity-90' : 'bg-black hover:bg-primary'}`}
          style={highlight ? { backgroundColor: '#F0940A' } : {}}>
          {loading ? 'Redirecting...' : 'Upgrade →'}
        </button>
      </div>
    </div>
  );
}
