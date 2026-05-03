'use client';

import { useState } from 'react';
import { saveSettings, saveBankDetails } from './actions';


const NIGERIAN_BANKS = [
  { name: 'Access Bank',                  code: '044' },
  { name: 'Citibank Nigeria',             code: '023' },
  { name: 'Ecobank Nigeria',              code: '050' },
  { name: 'Fidelity Bank',               code: '070' },
  { name: 'First Bank of Nigeria',        code: '011' },
  { name: 'First City Monument Bank',     code: '214' },
  { name: 'Guaranty Trust Bank',          code: '058' },
  { name: 'Heritage Bank',               code: '030' },
  { name: 'Keystone Bank',               code: '082' },
  { name: 'Kuda Bank',                   code: '50211' },
  { name: 'Moniepoint MFB',              code: '50515' },
  { name: 'OPay',                        code: '999992' },
  { name: 'PalmPay',                     code: '999991' },
  { name: 'Polaris Bank',                code: '076' },
  { name: 'Providus Bank',               code: '101' },
  { name: 'Stanbic IBTC Bank',           code: '221' },
  { name: 'Sterling Bank',               code: '232' },
  { name: 'Union Bank of Nigeria',        code: '032' },
  { name: 'United Bank for Africa',       code: '033' },
  { name: 'Unity Bank',                  code: '215' },
  { name: 'Wema Bank',                   code: '035' },
  { name: 'Zenith Bank',                 code: '057' },
];

export default function SettingsForm({ studio }) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // Payout state
  const [bankCode, setBankCode] = useState(studio.paystack_bank_code || '');
  const [bankName, setBankName] = useState(studio.paystack_bank_name || '');
  const [accountNumber, setAccountNumber] = useState(studio.paystack_account_number || '');
  const [accountName, setAccountName] = useState(studio.paystack_account_name || '');
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState(null);
  const [savingBank, setSavingBank] = useState(false);
  const [bankStatus, setBankStatus] = useState(null);
  const [bankError, setBankError] = useState(null);

  // Upgrade state
  const [billing, setBilling] = useState('monthly');
  const [upgrading, setUpgrading] = useState(false);
  const [upgradeError, setUpgradeError] = useState(null);

  async function handleUpgrade() {
    setUpgrading(true);
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
      setUpgradeError(err.message || 'Failed to start upgrade. Please try again.');
      setUpgrading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    const fd = new FormData(e.target);
    const result = await saveSettings(fd);
    setLoading(false);
    if (result?.error) { setStatus('error'); setErrorMsg(result.error); }
    else setStatus('saved');
  }

  async function handleVerify() {
    if (!bankCode || accountNumber.length !== 10) return;
    setVerifying(true);
    setVerifyError(null);
    setAccountName('');
    try {
      const res = await fetch(`/api/paystack/resolve-account?account_number=${accountNumber}&bank_code=${bankCode}`);
      const data = await res.json();
      if (data.error) setVerifyError(data.error);
      else setAccountName(data.account_name);
    } catch {
      setVerifyError('Network error. Please try again.');
    }
    setVerifying(false);
  }

  async function handleSaveBank() {
    if (!accountName) return;
    setSavingBank(true);
    setBankStatus(null);
    setBankError(null);
    const fd = new FormData();
    fd.set('bank_code', bankCode);
    fd.set('bank_name', bankName);
    fd.set('account_number', accountNumber);
    fd.set('account_name', accountName);
    const result = await saveBankDetails(fd);
    setSavingBank(false);
    if (result?.error) setBankError(result.error);
    else setBankStatus('saved');
  }

  const alreadySetUp = !!studio.paystack_subaccount_code;
  const canVerify = bankCode && accountNumber.length === 10;
  const canSaveBank = !!accountName;

  return (
    <div className="space-y-4">

      <form onSubmit={handleSubmit} className="bg-white border border-gray-100 divide-y divide-gray-50">

        {/* Studio info */}
        <div className="px-8 py-6 space-y-5">
          <p className="text-[10px] uppercase tracking-widest font-bold text-primary">Studio Info</p>
          <div className="grid sm:grid-cols-2 gap-5">
            <Field label="Studio Name *">
              <input type="text" name="name" required defaultValue={studio.name} className={inputClass} />
            </Field>
            <Field label="City / Location">
              <input type="text" name="location" defaultValue={studio.location || ''}
                placeholder="e.g. Lagos, Nigeria" className={inputClass} />
            </Field>
          </div>
        </div>

        {/* Contact */}
        <div className="px-8 py-6 space-y-5">
          <p className="text-[10px] uppercase tracking-widest font-bold text-primary">Contact</p>
          <div className="grid sm:grid-cols-2 gap-5">
            <Field label="Phone / WhatsApp">
              <input type="tel" name="phone" defaultValue={studio.phone || ''}
                placeholder="+234 XXX XXX XXXX" className={inputClass} />
            </Field>
            <Field label="Email">
              <input type="email" name="email" defaultValue={studio.email || ''}
                placeholder="studio@email.com" className={inputClass} />
            </Field>
          </div>
          <Field label="Instagram URL">
            <input type="url" name="instagram_url" defaultValue={studio.instagram_url || ''}
              placeholder="https://instagram.com/yourstudio" className={inputClass} />
          </Field>
        </div>


        {/* Plan */}
        <div className="px-8 py-6 space-y-4">
          <p className="text-[10px] uppercase tracking-widest font-bold text-primary">Plan</p>

          {studio.plan === 'pro' ? (
            <div className="flex items-center gap-3 px-4 py-3.5 bg-green-50 border border-green-200">
              <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-bold text-black">Pro Plan — Active</p>
                <p className="text-xs text-neutral-gray mt-0.5">Online booking, Paystack payments, and unlimited galleries enabled.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-bold text-black">Free Plan</p>
                <p className="text-xs text-neutral-gray mt-0.5">Upgrade to unlock online booking and client payments.</p>
              </div>

              {/* Billing toggle */}
              <div className="flex border border-gray-200 w-fit">
                <button type="button" onClick={() => setBilling('monthly')}
                  className={`px-5 py-2.5 text-xs font-bold uppercase tracking-widest transition-colors ${billing === 'monthly' ? 'bg-black text-white' : 'text-neutral-gray hover:text-black'}`}>
                  Monthly
                </button>
                <button type="button" onClick={() => setBilling('yearly')}
                  className={`px-5 py-2.5 text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2 ${billing === 'yearly' ? 'bg-black text-white' : 'text-neutral-gray hover:text-black'}`}>
                  Yearly
                  <span className={`text-[9px] font-bold ${billing === 'yearly' ? 'text-amber-400' : 'text-amber-500'}`}>2 MONTHS FREE</span>
                </button>
              </div>

              {/* Price card */}
              <div className="border border-amber-200 bg-amber-50/50 px-5 py-4 space-y-3">
                <div>
                  <p className="text-2xl font-serif text-black leading-none">
                    ₦{billing === 'monthly' ? '10,000' : '100,000'}
                    <span className="text-sm font-sans font-normal text-neutral-gray ml-1">
                      /{billing === 'monthly' ? 'month' : 'year'}
                    </span>
                  </p>
                  {billing === 'yearly' && (
                    <p className="text-xs text-amber-700 mt-1">₦8,333/mo — save ₦20,000 per year</p>
                  )}
                </div>
                <ul className="space-y-1.5 text-xs text-neutral-gray">
                  {[
                    'Unlimited bookings',
                    'Paystack deposit & balance collection',
                    'Unlimited client galleries & photos',
                    'Studio website at slug.photostudio.ng',
                    'Email notifications',
                  ].map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <span className="text-amber-500 mt-px">—</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              <button type="button" onClick={handleUpgrade} disabled={upgrading}
                className="w-full py-3.5 text-xs uppercase tracking-widest font-bold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#F0940A' }}>
                {upgrading ? 'Redirecting to Paystack...' : `Upgrade to Pro — ₦${billing === 'monthly' ? '10,000/mo' : '100,000/yr'} →`}
              </button>

              {upgradeError && (
                <p className="text-xs text-red-500 bg-red-50 border border-red-100 px-3 py-2">{upgradeError}</p>
              )}

              <p className="text-[10px] text-gray-400 text-center">
                Secure payment via Paystack · Cancel anytime
              </p>
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="px-8 py-6 flex flex-col gap-3">
          {status === 'saved' && (
            <p className="text-xs text-green-600 bg-green-50 border border-green-200 px-4 py-3 font-bold uppercase tracking-widest">
              ✓ Settings saved
            </p>
          )}
          {status === 'error' && (
            <p className="text-xs text-red-500 bg-red-50 border border-red-100 px-4 py-3">{errorMsg}</p>
          )}
          <button type="submit" disabled={loading}
            className="bg-primary text-white py-3.5 text-xs uppercase tracking-widest font-bold hover:bg-black transition-colors disabled:opacity-50">
            {loading ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>

      {/* ── Payouts ─────────────────────────────────────────────────────── */}
      <div className="bg-white border border-gray-100 divide-y divide-gray-50">
        <div className="px-8 py-6 space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-widest font-bold text-primary mb-1">Payouts</p>
              <p className="text-xs text-neutral-gray leading-relaxed max-w-sm">
                Add your bank account so clients can pay you directly via Paystack.
                You don&apos;t need a Paystack account — just your Nigerian bank details.
              </p>
            </div>
            {alreadySetUp && (
              <span className="flex-shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 border border-green-200 text-green-700 text-[10px] font-bold uppercase tracking-widest">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                Active
              </span>
            )}
          </div>

          {alreadySetUp && (
            <div className="bg-gray-50 border border-gray-100 px-4 py-3 flex items-center gap-3">
              <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <p className="text-xs font-bold text-black">{studio.paystack_account_name}</p>
                <p className="text-[10px] text-neutral-gray">{studio.paystack_bank_name} · ••••{studio.paystack_account_number?.slice(-4)}</p>
              </div>
            </div>
          )}

          {/* Bank form */}
          <div className="space-y-4">
            <Field label="Bank">
              <select
                value={bankCode}
                onChange={(e) => {
                  setBankCode(e.target.value);
                  setBankName(e.target.options[e.target.selectedIndex].text);
                  setAccountName('');
                  setVerifyError(null);
                }}
                className={inputClass}>
                <option value="">Select your bank</option>
                {NIGERIAN_BANKS.map((b) => (
                  <option key={b.code} value={b.code}>{b.name}</option>
                ))}
              </select>
            </Field>

            <div className="flex gap-3 items-end">
              <Field label="Account Number" className="flex-1">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="10-digit account number"
                  value={accountNumber}
                  onChange={(e) => {
                    setAccountNumber(e.target.value.replace(/\D/g, '').slice(0, 10));
                    setAccountName('');
                    setVerifyError(null);
                  }}
                  className={inputClass}
                />
              </Field>
              <button
                type="button"
                onClick={handleVerify}
                disabled={!canVerify || verifying}
                className="flex-shrink-0 px-5 py-2.5 bg-black text-white text-xs uppercase tracking-widest font-bold hover:bg-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed mb-px">
                {verifying ? 'Checking...' : 'Verify'}
              </button>
            </div>

            {verifyError && (
              <p className="text-xs text-red-500 bg-red-50 border border-red-100 px-3 py-2">{verifyError}</p>
            )}

            {accountName && (
              <div className="flex items-center gap-2 px-3 py-2.5 bg-green-50 border border-green-200">
                <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <p className="text-xs font-bold text-green-800">{accountName}</p>
                  <p className="text-[10px] text-green-600">Account verified — confirm this is you</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="px-8 py-5 flex flex-col gap-3">
          {bankStatus === 'saved' && (
            <p className="text-xs text-green-600 bg-green-50 border border-green-200 px-4 py-3 font-bold uppercase tracking-widest">
              ✓ Bank account saved — you&apos;re ready to receive payments
            </p>
          )}
          {bankError && (
            <p className="text-xs text-red-500 bg-red-50 border border-red-100 px-4 py-3">{bankError}</p>
          )}
          <button
            type="button"
            onClick={handleSaveBank}
            disabled={!canSaveBank || savingBank}
            className="bg-primary text-white py-3.5 text-xs uppercase tracking-widest font-bold hover:bg-black transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            {savingBank ? 'Saving...' : alreadySetUp ? 'Update Bank Account' : 'Save Bank Account'}
          </button>
        </div>
      </div>

    </div>
  );
}

function Field({ label, children, className = '' }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">{label}</label>
      {children}
    </div>
  );
}

const inputClass = 'bg-transparent border-b-2 border-gray-200 py-2.5 focus:outline-none focus:border-primary transition-all text-black placeholder:text-gray-300 font-light text-sm w-full';
