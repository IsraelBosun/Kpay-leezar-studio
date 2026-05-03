'use client';

import { useState } from 'react';
import Link from 'next/link';
import { updateBookingStatus } from '../actions';

const STATUS_FLOW = [
  { key: 'pending',   label: 'Pending',   color: 'bg-amber-400' },
  { key: 'confirmed', label: 'Confirmed', color: 'bg-green-500' },
  { key: 'completed', label: 'Completed', color: 'bg-blue-500' },
];

export default function BookingDetail({ booking, payments, hasSubaccount, studio }) {
  const depositPayment = payments.find(p => p.type === 'deposit' && p.status === 'paid');
  const balancePayment = payments.find(p => p.type === 'balance' && p.status === 'paid');
  const depositPending = payments.find(p => p.type === 'deposit' && p.status === 'pending');
  const balancePending = payments.find(p => p.type === 'balance' && p.status === 'pending');

  const [status, setStatus] = useState(booking.status);
  const [statusLoading, setStatusLoading] = useState(false);
  const [sendingInvoice, setSendingInvoice] = useState(false);
  const [invoiceSent, setInvoiceSent] = useState(false);
  const [invoiceError, setInvoiceError] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadDone, setDownloadDone] = useState(false);

  const hasAmounts = Number(booking.deposit_amount) + Number(booking.balance_amount) > 0;

  async function sendInvoice() {
    setSendingInvoice(true);
    setInvoiceError(null);
    try {
      const res = await fetch(`/api/bookings/${booking.id}/send-invoice`, { method: 'POST' });
      const data = await res.json();
      if (data.error) setInvoiceError(data.error);
      else { setInvoiceSent(true); setTimeout(() => setInvoiceSent(false), 4000); }
    } catch {
      setInvoiceError('Network error. Please try again.');
    }
    setSendingInvoice(false);
  }

  async function downloadInvoice() {
    setDownloading(true);
    setDownloadDone(false);
    try {
      const res = await fetch(`/api/invoice/${booking.id}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `INV-${new Date(booking.created_at).getFullYear()}-${booking.id.slice(0, 6).toUpperCase()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setDownloadDone(true);
      setTimeout(() => setDownloadDone(false), 4000);
    } catch {
      // silently fail — browser will show nothing downloaded
    } finally {
      setDownloading(false);
    }
  }

  async function handleStatusChange(newStatus) {
    setStatusLoading(true);
    const result = await updateBookingStatus(booking.id, newStatus);
    if (!result?.error) setStatus(newStatus);
    setStatusLoading(false);
  }

  const isCancelled = status === 'cancelled';

  return (
    <div className="space-y-4">

      {/* How it works */}
      <div className="bg-gray-50 border border-gray-100 px-4 py-4 space-y-3">
        <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400">How Booking Status Works</p>
        <div className="flex items-center gap-0 flex-wrap">
          {STATUS_FLOW.map((s, i) => (
            <div key={s.key} className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${s.color}`} />
                <span className={`text-xs font-bold ${status === s.key ? 'text-black' : 'text-neutral-gray'}`}>{s.label}</span>
              </div>
              {i < STATUS_FLOW.length - 1 && (
                <span className="text-gray-300 mx-2">→</span>
              )}
            </div>
          ))}
        </div>
        <p className="text-xs text-neutral-gray leading-relaxed">
          <span className="font-medium text-black">Pending</span> — new booking, awaiting deposit.{' '}
          <span className="font-medium text-black">Confirmed</span> — deposit received, session is locked in.{' '}
          <span className="font-medium text-black">Completed</span> — shoot is done and balance is settled.
          <br />
          Paystack payments update status automatically. Use the buttons below if your client paid by bank transfer or cash.
        </p>
      </div>

      {/* Manual status controls */}
      {!isCancelled && (
        <div className="bg-white border border-gray-100 px-4 sm:px-6 py-4">
          <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-3">Update Status Manually</p>
          <div className="flex flex-wrap gap-2">
            {status === 'pending' && (
              <StatusButton
                label="Mark Confirmed"
                onClick={() => handleStatusChange('confirmed')}
                loading={statusLoading}
                variant="success"
              />
            )}
            {(status === 'pending' || status === 'confirmed') && (
              <StatusButton
                label="Mark Completed"
                onClick={() => handleStatusChange('completed')}
                loading={statusLoading}
                variant="primary"
              />
            )}
            {status !== 'completed' && (
              <StatusButton
                label="Cancel Booking"
                onClick={() => handleStatusChange('cancelled')}
                loading={statusLoading}
                variant="danger"
              />
            )}
          </div>
          {status === 'completed' && (
            <p className="text-xs text-neutral-gray mt-2 italic">This booking is complete.</p>
          )}
        </div>
      )}

      {isCancelled && (
        <div className="bg-white border border-gray-100 px-6 py-4 flex items-center justify-between gap-4">
          <p className="text-xs text-neutral-gray italic">This booking was cancelled.</p>
          <StatusButton
            label="Reopen"
            onClick={() => handleStatusChange('pending')}
            loading={statusLoading}
            variant="outline"
          />
        </div>
      )}

      {!hasSubaccount && (
        <div className="bg-amber-50 border border-amber-200 px-5 py-4 flex items-start gap-3">
          <svg className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-xs text-amber-800 leading-relaxed">
            Add your bank account in{' '}
            <Link href="/studio/settings" className="font-bold underline">Settings → Payouts</Link>
            {' '}before sending payment links to clients.
          </p>
        </div>
      )}

      {/* Deposit */}
      <PaymentRow
        label="Deposit"
        amount={booking.deposit_amount}
        isPaid={booking.deposit_paid || !!depositPayment}
        paidAt={depositPayment?.paid_at}
        bookingId={booking.id}
        paymentType="deposit"
        clientName={booking.client_name}
        hasSubaccount={hasSubaccount}
        initialLink={depositPending?.authorization_url || null}
      />

      {/* Balance */}
      <PaymentRow
        label="Balance"
        amount={booking.balance_amount}
        isPaid={booking.balance_paid || !!balancePayment}
        paidAt={balancePayment?.paid_at}
        bookingId={booking.id}
        paymentType="balance"
        clientName={booking.client_name}
        hasSubaccount={hasSubaccount}
        disabled={!booking.deposit_paid && !depositPayment}
        initialLink={balancePending?.authorization_url || null}
      />

      {/* Invoice */}
      <div className="bg-white border border-gray-100 px-4 sm:px-6 py-4">
        <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-3">Invoice</p>
        <div className="flex flex-wrap gap-2">
          <div className="flex flex-col gap-1">
            <button
              onClick={downloadInvoice}
              disabled={downloading}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-xs font-bold uppercase tracking-widest text-black hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {downloading ? (
                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              )}
              {downloading ? 'Generating…' : 'Download PDF'}
            </button>
            {downloadDone && <p className="text-[10px] text-green-600 font-medium">Download complete</p>}
          </div>
          <button
            onClick={sendInvoice}
            disabled={sendingInvoice || !hasAmounts}
            className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {invoiceSent ? '✓ Invoice Sent' : sendingInvoice ? 'Sending...' : 'Send Invoice to Client'}
          </button>
        </div>
        {!hasAmounts && (
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2 mt-3">
            Edit this booking to add deposit or balance amounts before sending an invoice.
          </p>
        )}
        {invoiceError && (
          <p className="text-xs text-red-600 mt-2">{invoiceError}</p>
        )}
        {hasAmounts && (
          <p className="text-[10px] text-neutral-gray mt-3">
            Sends a detailed invoice to {booking.client_email} with payment breakdown and bank details.
          </p>
        )}
      </div>
    </div>
  );
}

function StatusButton({ label, onClick, loading, variant }) {
  const styles = {
    success: 'bg-green-600 text-white hover:bg-green-700',
    primary: 'bg-black text-white hover:bg-primary',
    danger:  'border border-red-200 text-red-600 hover:bg-red-50',
    outline: 'border border-gray-300 text-black hover:bg-gray-50',
  };
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className={`px-4 py-2 text-xs font-bold uppercase tracking-widest transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${styles[variant]}`}
    >
      {loading ? '...' : label}
    </button>
  );
}

function PaymentRow({ label, amount, isPaid, paidAt, bookingId, paymentType, clientName, hasSubaccount, disabled, initialLink }) {
  const [link, setLink] = useState(initialLink || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const nairaAmount = Number(amount);

  async function getLink() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/paystack/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booking_id: bookingId, payment_type: paymentType }),
      });
      const data = await res.json();
      if (data.error) setError(data.error);
      else setLink(data.authorization_url);
    } catch {
      setError('Network error. Please try again.');
    }
    setLoading(false);
  }

  function copyLink() {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const whatsappText = encodeURIComponent(
    `Hi ${clientName}, here's your payment link for the ${label.toLowerCase()} (₦${nairaAmount.toLocaleString()}):\n${link}`
  );

  return (
    <div className="bg-white border border-gray-100 px-4 sm:px-6 py-4 sm:py-5">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-1">{label}</p>
          <p className="text-xl sm:text-2xl font-serif text-black">
            {nairaAmount > 0 ? `₦${nairaAmount.toLocaleString()}` : '—'}
          </p>
        </div>
        {isPaid ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 border border-green-200 text-green-700 text-[10px] font-bold uppercase tracking-widest flex-shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            Paid {paidAt ? new Date(paidAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' }) : ''}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 border border-gray-200 text-gray-500 text-[10px] font-bold uppercase tracking-widest flex-shrink-0">
            Unpaid
          </span>
        )}
      </div>

      {!isPaid && nairaAmount > 0 && (
        <div className="space-y-3">
          {disabled && (
            <p className="text-xs text-neutral-gray italic">Collect deposit first before requesting balance.</p>
          )}

          {!disabled && !link && (
            <button
              onClick={getLink}
              disabled={loading || !hasSubaccount}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-xs uppercase tracking-widest font-bold hover:bg-black transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
              {loading ? 'Generating...' : 'Get payment link'}
              {!loading && (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              )}
            </button>
          )}

          {error && (
            <p className="text-xs bg-amber-50 border border-amber-200 text-amber-800 px-3 py-2 leading-relaxed">
              {error}
            </p>
          )}

          {link && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-2.5">
                <p className="text-xs text-neutral-gray truncate flex-1 font-mono">{link}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={copyLink}
                  className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-xs font-bold uppercase tracking-widest text-black hover:bg-gray-50 transition-colors">
                  {copied ? '✓ Copied' : 'Copy link'}
                </button>
                <a
                  href={`https://wa.me/?text=${whatsappText}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#25D366] text-white text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-opacity">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.117.549 4.11 1.508 5.84L0 24l6.335-1.482A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.371l-.36-.214-3.732.873.936-3.62-.235-.374A9.818 9.818 0 1112 21.818z"/>
                  </svg>
                  Share via WhatsApp
                </a>
              </div>
              <p className="text-[10px] text-neutral-gray">
                Share this link with {clientName}. Once paid, this page updates automatically.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
