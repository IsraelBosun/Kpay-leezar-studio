'use client';

import { useState } from 'react';
import { updateBookingDetails } from '../actions';

export default function BookingInfo({ booking, services }) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    client_name:    booking.client_name || '',
    client_email:   booking.client_email || '',
    client_phone:   booking.client_phone || '',
    service_id:     booking.service_id || '',
    session_date:   booking.session_date ? booking.session_date.slice(0, 10) : '',
    deposit_amount: booking.deposit_amount ?? '',
    balance_amount: booking.balance_amount ?? '',
    notes:          booking.notes || '',
  });

  // Mirror local state so the view mode reflects saved edits without a page reload
  const [display, setDisplay] = useState({
    client_name:  booking.client_name,
    client_email: booking.client_email,
    client_phone: booking.client_phone,
    service:      booking.services?.title || null,
    session_date: booking.session_date,
    deposit_amount: booking.deposit_amount,
    balance_amount: booking.balance_amount,
    notes:        booking.notes,
  });

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function handleSave() {
    setSaving(true);
    setSaveError(null);
    const result = await updateBookingDetails(booking.id, form);
    setSaving(false);
    if (result?.error) {
      setSaveError(result.error);
      return;
    }
    // Update display state so view reflects changes immediately
    const selectedService = services?.find(s => s.id === form.service_id);
    setDisplay({
      client_name:    form.client_name,
      client_email:   form.client_email,
      client_phone:   form.client_phone,
      service:        selectedService?.title || null,
      session_date:   form.session_date || null,
      deposit_amount: form.deposit_amount,
      balance_amount: form.balance_amount,
      notes:          form.notes,
    });
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 3000);
  }

  function handleCancel() {
    // Reset form to current display values
    setForm({
      client_name:    display.client_name || '',
      client_email:   display.client_email || '',
      client_phone:   display.client_phone || '',
      service_id:     booking.service_id || '',
      session_date:   display.session_date ? display.session_date.slice(0, 10) : '',
      deposit_amount: display.deposit_amount ?? '',
      balance_amount: display.balance_amount ?? '',
      notes:          display.notes || '',
    });
    setSaveError(null);
    setEditing(false);
  }

  const formatDate = (d) => d
    ? new Date(d).toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : '—';

  if (editing) {
    return (
      <div className="bg-white border border-gray-100 divide-y divide-gray-50">
        <div className="px-4 sm:px-6 py-4 flex items-center justify-between">
          <p className="text-[10px] uppercase tracking-widest font-bold text-primary">Edit Booking</p>
          <button type="button" onClick={handleCancel}
            className="text-xs text-neutral-gray hover:text-black transition-colors">
            Cancel
          </button>
        </div>

        <div className="px-4 sm:px-6 py-5 grid sm:grid-cols-2 gap-4 sm:gap-5">
          <EditField label="Client Name *">
            <input type="text" required value={form.client_name}
              onChange={e => set('client_name', e.target.value)} className={inputClass} />
          </EditField>
          <EditField label="Client Email">
            <input type="email" value={form.client_email}
              onChange={e => set('client_email', e.target.value)} className={inputClass} />
          </EditField>
          <EditField label="Client Phone">
            <input type="tel" value={form.client_phone}
              onChange={e => set('client_phone', e.target.value)}
              placeholder="+234 XXX XXX XXXX" className={inputClass} />
          </EditField>
          <EditField label="Service">
            <select value={form.service_id} onChange={e => set('service_id', e.target.value)} className={inputClass}>
              <option value="">No service selected</option>
              {services?.map(s => (
                <option key={s.id} value={s.id}>{s.title}</option>
              ))}
            </select>
          </EditField>
          <EditField label="Session Date">
            <input type="date" value={form.session_date}
              onChange={e => set('session_date', e.target.value)} className={inputClass} />
          </EditField>
        </div>

        <div className="px-4 sm:px-6 py-5 grid sm:grid-cols-2 gap-4 sm:gap-5">
          <EditField label="Deposit Amount (₦)">
            <input type="number" min="0" value={form.deposit_amount}
              onChange={e => set('deposit_amount', e.target.value)} className={inputClass} />
          </EditField>
          <EditField label="Balance Amount (₦)">
            <input type="number" min="0" value={form.balance_amount}
              onChange={e => set('balance_amount', e.target.value)} className={inputClass} />
          </EditField>
        </div>

        <div className="px-4 sm:px-6 py-5">
          <EditField label="Notes">
            <textarea rows={3} value={form.notes}
              onChange={e => set('notes', e.target.value)}
              placeholder="Session notes, special requests..."
              className={`${inputClass} resize-none`} />
          </EditField>
        </div>

        <div className="px-4 sm:px-6 py-4 flex flex-col gap-3">
          {saveError && (
            <p className="text-xs text-red-500 bg-red-50 border border-red-100 px-3 py-2">{saveError}</p>
          )}
          <div className="flex gap-3">
            <button type="button" onClick={handleSave} disabled={saving || !form.client_name}
              className="bg-primary text-white px-6 py-2.5 text-xs uppercase tracking-widest font-bold hover:bg-black transition-colors disabled:opacity-50">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button type="button" onClick={handleCancel}
              className="border border-gray-200 text-black px-6 py-2.5 text-xs uppercase tracking-widest font-bold hover:bg-gray-50 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-100 divide-y divide-gray-50">
      {saved && (
        <div className="px-6 py-3 bg-green-50 border-b border-green-100">
          <p className="text-xs text-green-700 font-bold">✓ Booking updated</p>
        </div>
      )}
      <div className="px-6 py-5 flex items-start justify-between gap-4">
        <div className="grid sm:grid-cols-2 gap-5 flex-1">
          <InfoRow label="Email" value={display.client_email} />
          <InfoRow label="Phone" value={display.client_phone || '—'} />
          <InfoRow label="Service" value={display.service || '—'} />
          <InfoRow label="Session Date" value={formatDate(display.session_date)} />
          <InfoRow label="Deposit" value={display.deposit_amount > 0 ? `₦${Number(display.deposit_amount).toLocaleString()}` : '—'} />
          <InfoRow label="Balance" value={display.balance_amount > 0 ? `₦${Number(display.balance_amount).toLocaleString()}` : '—'} />
        </div>
        <button type="button" onClick={() => setEditing(true)}
          className="flex-shrink-0 text-[10px] uppercase tracking-widest font-bold text-neutral-gray hover:text-black transition-colors border border-gray-200 px-3 py-1.5 hover:border-black">
          Edit
        </button>
      </div>
      {display.notes && (
        <div className="px-4 sm:px-6 py-5">
          <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2">Notes</p>
          <p className="text-sm text-neutral-gray leading-relaxed">{display.notes}</p>
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-1">{label}</p>
      <p className="text-sm text-black">{value}</p>
    </div>
  );
}

function EditField({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">{label}</label>
      {children}
    </div>
  );
}

const inputClass = 'bg-transparent border-b-2 border-gray-200 py-2 focus:outline-none focus:border-primary transition-all text-black text-sm font-light w-full';
