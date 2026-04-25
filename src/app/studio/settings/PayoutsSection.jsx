'use client';

import { useState } from 'react';
import { saveBankDetails } from './actions';

const NIGERIAN_BANKS = [
  { name: 'Access Bank',              code: '044' },
  { name: 'Citibank Nigeria',         code: '023' },
  { name: 'Ecobank Nigeria',          code: '050' },
  { name: 'Fidelity Bank',           code: '070' },
  { name: 'First Bank of Nigeria',    code: '011' },
  { name: 'First City Monument Bank', code: '214' },
  { name: 'Guaranty Trust Bank',      code: '058' },
  { name: 'Heritage Bank',           code: '030' },
  { name: 'Keystone Bank',           code: '082' },
  { name: 'Kuda Bank',               code: '50211' },
  { name: 'Moniepoint MFB',          code: '50515' },
  { name: 'OPay',                    code: '999992' },
  { name: 'PalmPay',                 code: '999991' },
  { name: 'Polaris Bank',            code: '076' },
  { name: 'Providus Bank',           code: '101' },
  { name: 'Stanbic IBTC Bank',       code: '221' },
  { name: 'Sterling Bank',           code: '232' },
  { name: 'Union Bank of Nigeria',    code: '032' },
  { name: 'United Bank for Africa',   code: '033' },
  { name: 'Unity Bank',              code: '215' },
  { name: 'Wema Bank',               code: '035' },
  { name: 'Zenith Bank',             code: '057' },
];

export default function PayoutsSection({ studio }) {
  const alreadySetUp = !!studio.paystack_subaccount_code;
  const [editing, setEditing]         = useState(!alreadySetUp); // open by default only if not set up
  const [bankCode, setBankCode]       = useState('');
  const [bankName, setBankName]       = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [verifying, setVerifying]     = useState(false);
  const [verifyError, setVerifyError] = useState(null);
  const [saving, setSaving]           = useState(false);
  const [saveStatus, setSaveStatus]   = useState(null);
  const [saveError, setSaveError]     = useState(null);

  const canVerify = bankCode && accountNumber.length === 10;
  const canSave   = !!accountName;

  function handleCancelEdit() {
    setBankCode('');
    setBankName('');
    setAccountNumber('');
    setAccountName('');
    setVerifyError(null);
    setSaveError(null);
    setEditing(false);
  }

  async function handleVerify() {
    if (!canVerify) return;
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

  async function handleSave() {
    if (!canSave) return;
    setSaving(true);
    setSaveStatus(null);
    setSaveError(null);
    const fd = new FormData();
    fd.set('bank_code', bankCode);
    fd.set('bank_name', bankName);
    fd.set('account_number', accountNumber);
    fd.set('account_name', accountName);
    const result = await saveBankDetails(fd);
    setSaving(false);
    if (result?.error) {
      setSaveError(result.error);
    } else {
      setSaveStatus('saved');
      setEditing(false);
    }
  }

  // ── Read-only view ────────────────────────────────────────────────────────
  if (alreadySetUp && !editing) {
    return (
      <div className="bg-white border border-gray-100 px-8 py-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          <div>
            <p className="text-sm font-bold text-black">{studio.paystack_account_name}</p>
            <p className="text-xs text-neutral-gray mt-0.5">
              {studio.paystack_bank_name} · ••••{studio.paystack_account_number?.slice(-4)}
            </p>
          </div>
        </div>
        <button type="button" onClick={() => setEditing(true)}
          className="flex-shrink-0 text-[10px] uppercase tracking-widest font-bold text-neutral-gray hover:text-black transition-colors border border-gray-200 px-3 py-1.5 hover:border-black">
          Edit
        </button>
      </div>
    );
  }

  // ── Edit / setup form ─────────────────────────────────────────────────────
  return (
    <div className="bg-white border border-gray-100 divide-y divide-gray-50">
      <div className="px-8 py-6 space-y-5">
        {alreadySetUp && (
          <div className="flex items-center justify-between">
            <p className="text-xs text-neutral-gray">Enter new bank details and verify before saving.</p>
            <button type="button" onClick={handleCancelEdit}
              className="text-xs text-neutral-gray hover:text-black transition-colors">
              Cancel
            </button>
          </div>
        )}

        {!alreadySetUp && (
          <p className="text-xs text-neutral-gray leading-relaxed max-w-sm">
            Add your Nigerian bank account so clients can pay you directly via Paystack.
            You don&apos;t need a Paystack account — just your bank details.
          </p>
        )}

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
        {saveStatus === 'saved' && (
          <p className="text-xs text-green-600 bg-green-50 border border-green-200 px-4 py-3 font-bold uppercase tracking-widest">
            ✓ Bank account saved — you&apos;re ready to receive payments
          </p>
        )}
        {saveError && (
          <p className="text-xs text-red-500 bg-red-50 border border-red-100 px-4 py-3">{saveError}</p>
        )}
        <button
          type="button"
          onClick={handleSave}
          disabled={!canSave || saving}
          className="bg-primary text-white py-3.5 text-xs uppercase tracking-widest font-bold hover:bg-black transition-colors disabled:opacity-40 disabled:cursor-not-allowed w-full sm:w-auto sm:px-8">
          {saving ? 'Saving...' : alreadySetUp ? 'Update Bank Account' : 'Save Bank Account'}
        </button>
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
