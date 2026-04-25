'use client';

import { useState } from 'react';
import { saveSettings } from './actions';

export default function StudioDetailsForm({ studio }) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    const result = await saveSettings(new FormData(e.target));
    setLoading(false);
    if (result?.error) { setStatus('error'); setErrorMsg(result.error); }
    else setStatus('saved');
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-100 divide-y divide-gray-50">
      <div className="px-8 py-6 space-y-5">
        <div className="grid sm:grid-cols-2 gap-5">
          <Field label="Studio Name *">
            <input type="text" name="name" required defaultValue={studio.name} className={inputClass} />
          </Field>
          <Field label="City / Location">
            <input type="text" name="location" defaultValue={studio.location || ''}
              placeholder="e.g. Lagos, Nigeria" className={inputClass} />
          </Field>
        </div>
        <div className="grid sm:grid-cols-2 gap-5">
          <Field label="Phone / WhatsApp">
            <input type="tel" name="phone" defaultValue={studio.phone || ''}
              placeholder="+234 XXX XXX XXXX" className={inputClass} />
          </Field>
          <Field label="Contact Email">
            <input type="email" name="email" defaultValue={studio.email || ''}
              placeholder="studio@email.com" className={inputClass} />
          </Field>
        </div>
        <Field label="Instagram URL">
          <input type="url" name="instagram_url" defaultValue={studio.instagram_url || ''}
            placeholder="https://instagram.com/yourstudio" className={inputClass} />
        </Field>
      </div>

      <div className="px-8 py-5 flex flex-col gap-3">
        {status === 'saved' && (
          <p className="text-xs text-green-600 bg-green-50 border border-green-200 px-4 py-3 font-bold uppercase tracking-widest">
            ✓ Details saved
          </p>
        )}
        {status === 'error' && (
          <p className="text-xs text-red-500 bg-red-50 border border-red-100 px-4 py-3">{errorMsg}</p>
        )}
        <button type="submit" disabled={loading}
          className="bg-primary text-white py-3.5 text-xs uppercase tracking-widest font-bold hover:bg-black transition-colors disabled:opacity-50 w-full sm:w-auto sm:px-8">
          {loading ? 'Saving...' : 'Save Details'}
        </button>
      </div>
    </form>
  );
}

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">{label}</label>
      {children}
    </div>
  );
}

const inputClass = 'bg-transparent border-b-2 border-gray-200 py-2.5 focus:outline-none focus:border-primary transition-all text-black placeholder:text-gray-300 font-light text-sm w-full';
