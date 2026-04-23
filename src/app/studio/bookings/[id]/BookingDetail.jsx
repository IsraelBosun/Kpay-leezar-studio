'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function BookingDetail({ booking, payments, hasSubaccount }) {
  const depositPayment = payments.find(p => p.type === 'deposit' && p.status === 'paid');
  const balancePayment = payments.find(p => p.type === 'balance' && p.status === 'paid');

  return (
    <div className="space-y-4">
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
      />
    </div>
  );
}

function PaymentRow({ label, amount, isPaid, paidAt, bookingId, paymentType, clientName, hasSubaccount, disabled }) {
  const [link, setLink] = useState(null);
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
    <div className="bg-white border border-gray-100 px-6 py-5">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-1">{label}</p>
          <p className="text-2xl font-serif text-black">
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
            <p className="text-xs text-red-500 bg-red-50 border border-red-100 px-3 py-2">{error}</p>
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
                <button
                  onClick={() => setLink(null)}
                  className="px-4 py-2 text-xs text-neutral-gray hover:text-black transition-colors">
                  Refresh link
                </button>
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
