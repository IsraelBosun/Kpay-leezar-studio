'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBooking } from '../actions';
import Link from 'next/link';

export default function NewBookingForm({ services }) {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = await createBooking(new FormData(e.target));
    setLoading(false);
    if (result?.error) setError(result.error);
  }

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Header */}
      <div>
        <Link href="/studio/bookings" className="text-xs uppercase tracking-widest text-neutral-gray hover:text-primary transition-colors font-bold">
          ← Back to Bookings
        </Link>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif text-black mt-4">New Booking</h1>
        <p className="text-sm text-neutral-gray italic mt-1">Add a client session to your calendar.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-gray-100 divide-y divide-gray-50">

        {/* Client details */}
        <div className="px-4 sm:px-8 py-6 space-y-5">
          <p className="text-[10px] uppercase tracking-widest font-bold text-primary">Client Details</p>

          <div className="grid sm:grid-cols-2 gap-5">
            <Field label="Client Name *">
              <input type="text" name="client_name" required placeholder="e.g. Adaeze Okonkwo"
                className={inputClass} />
            </Field>
            <Field label="Email *">
              <input type="email" name="client_email" required placeholder="client@email.com"
                className={inputClass} />
            </Field>
          </div>

          <Field label="Phone / WhatsApp">
            <input type="tel" name="client_phone" placeholder="+234 XXX XXX XXXX"
              className={inputClass} />
          </Field>
        </div>

        {/* Session details */}
        <div className="px-4 sm:px-8 py-6 space-y-5">
          <p className="text-[10px] uppercase tracking-widest font-bold text-primary">Session Details</p>

          <div className="grid sm:grid-cols-2 gap-5">
            <Field label="Service">
              <select name="service_id" className={inputClass}>
                <option value="">— Select service —</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>{s.title}{s.price ? ` — ₦${Number(s.price).toLocaleString()}` : ''}</option>
                ))}
              </select>
            </Field>
            <Field label="Session Date">
              <input type="date" name="session_date" className={inputClass} />
            </Field>
          </div>

          <Field label="Notes">
            <textarea name="notes" rows={3} placeholder="Any special requests or additional details..."
              className={`${inputClass} resize-none`} />
          </Field>
        </div>

        {/* Payment */}
        <div className="px-4 sm:px-8 py-6 space-y-5">
          <p className="text-[10px] uppercase tracking-widest font-bold text-primary">Payment</p>

          <div className="grid sm:grid-cols-2 gap-5">
            <Field label="Deposit Amount (₦)">
              <input type="number" name="deposit_amount" placeholder="e.g. 50000" min="0" step="500"
                className={inputClass} />
            </Field>
            <Field label="Balance Amount (₦)">
              <input type="number" name="balance_amount" placeholder="e.g. 100000" min="0" step="500"
                className={inputClass} />
            </Field>
          </div>
        </div>

        {/* Submit */}
        <div className="px-4 sm:px-8 py-6 flex flex-col gap-3">
          {error && (
            <p className="text-xs text-red-500 bg-red-50 border border-red-100 px-4 py-3">{error}</p>
          )}
          <div className="flex gap-3">
            <Link href="/studio/bookings"
              className="flex-1 border border-gray-200 text-black py-3.5 text-xs uppercase tracking-widest font-bold hover:bg-gray-50 transition-colors text-center">
              Cancel
            </Link>
            <button type="submit" disabled={loading}
              className="flex-[2] bg-primary text-white py-3.5 text-xs uppercase tracking-widest font-bold hover:bg-black transition-colors disabled:opacity-50">
              {loading ? 'Saving...' : 'Create Booking'}
            </button>
          </div>
        </div>
      </form>
    </div>
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
