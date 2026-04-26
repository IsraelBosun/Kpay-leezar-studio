'use client';

import { useState } from 'react';
import { resendVerificationEmail } from '../actions';

export default function ResendButton({ email }) {
  const [status, setStatus] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  async function handleResend() {
    setStatus('sending');
    setErrorMsg('');
    const result = await resendVerificationEmail(email);
    if (result?.error) {
      setErrorMsg(result.error);
      setStatus('error');
    } else {
      setStatus('sent');
    }
  }

  if (status === 'sent') {
    return (
      <div className="flex items-center gap-3 px-4 py-3 bg-green-50 border border-green-200">
        <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
        </svg>
        <p className="text-sm text-green-800">Email sent — check your inbox again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {status === 'error' && (
        <p className="text-xs text-red-500 italic bg-red-50 border border-red-100 px-4 py-3">{errorMsg}</p>
      )}
      <button
        onClick={handleResend}
        disabled={status === 'sending'}
        className="w-full border-2 border-black text-black py-4 text-xs uppercase tracking-widest font-bold hover:bg-black hover:text-white transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {status === 'sending' ? 'Sending...' : 'Resend verification email'}
      </button>
    </div>
  );
}
