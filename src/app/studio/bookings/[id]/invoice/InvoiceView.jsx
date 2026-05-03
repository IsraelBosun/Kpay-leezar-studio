'use client';

import { useState } from 'react';

export default function InvoiceView({ booking, studio, invoiceNumber, depositPaid, balancePaid }) {
  const accent = studio.accent_color || '#D30E15';
  const [downloading, setDownloading] = useState(false);
  const [downloadDone, setDownloadDone] = useState(false);

  async function downloadInvoice() {
    setDownloading(true);
    setDownloadDone(false);
    try {
      const res = await fetch(`/api/invoice/${booking.id}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${invoiceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setDownloadDone(true);
      setTimeout(() => setDownloadDone(false), 4000);
    } catch {
      // silently fail
    } finally {
      setDownloading(false);
    }
  }
  const total = Number(booking.deposit_amount) + Number(booking.balance_amount);
  const totalPaid = (depositPaid ? Number(booking.deposit_amount) : 0) + (balancePaid ? Number(booking.balance_amount) : 0);
  const totalDue = total - totalPaid;

  const invoiceDate = new Date(booking.created_at).toLocaleDateString('en-NG', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
  const sessionDate = booking.session_date
    ? new Date(booking.session_date).toLocaleDateString('en-NG', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      })
    : null;

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .invoice-wrapper { box-shadow: none !important; margin: 0 !important; max-width: 100% !important; }
        }
        @page { margin: 1.5cm; }
      `}</style>

      {/* Action bar — hidden on print */}
      <div className="no-print fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between gap-4">
        <a
          href={`/studio/bookings/${booking.id}`}
          className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-bold text-neutral-gray hover:text-black transition-colors"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Booking
        </a>
        <div className="flex flex-col items-end gap-1">
          <button
            onClick={downloadInvoice}
            disabled={downloading}
            className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold uppercase tracking-widest text-white transition-colors disabled:opacity-60"
            style={{ backgroundColor: accent }}
          >
            {downloading ? (
              <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            )}
            {downloading ? 'Generating…' : 'Download Invoice'}
          </button>
          {downloadDone && <p className="text-[10px] text-green-600 font-medium">Download complete</p>}
        </div>
      </div>

      {/* Invoice */}
      <div className="no-print pt-16" />
      <div className="min-h-screen bg-gray-50 py-10 px-4 print:bg-white print:p-0">
        <div className="invoice-wrapper max-w-2xl mx-auto bg-white shadow-sm">

          {/* Top accent bar */}
          <div style={{ backgroundColor: accent, height: '6px' }} />

          {/* Header */}
          <div className="px-10 pt-10 pb-8 flex items-start justify-between gap-6">
            <div>
              {studio.logo_url ? (
                <img src={studio.logo_url} alt={studio.name} className="h-14 w-auto object-contain mb-3" />
              ) : (
                <p className="font-serif text-2xl text-black leading-none mb-1">{studio.name}</p>
              )}
              <p className="text-[9px] font-bold tracking-[4px] uppercase" style={{ color: accent }}>Photography</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-[4px] font-bold text-gray-400 mb-1">Invoice</p>
              <p className="font-serif text-2xl text-black">{invoiceNumber}</p>
              <p className="text-xs text-neutral-gray mt-1">{invoiceDate}</p>
            </div>
          </div>

          {/* Divider */}
          <div className="mx-10 border-t border-gray-100" />

          {/* Billed to + session info */}
          <div className="px-10 py-8 grid grid-cols-2 gap-8">
            <div>
              <p className="text-[9px] uppercase tracking-[3px] font-bold text-gray-400 mb-3">Billed To</p>
              <p className="text-sm font-bold text-black">{booking.client_name}</p>
              <p className="text-xs text-neutral-gray mt-0.5">{booking.client_email}</p>
              {booking.client_phone && (
                <p className="text-xs text-neutral-gray mt-0.5">{booking.client_phone}</p>
              )}
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-[3px] font-bold text-gray-400 mb-3">Session Details</p>
              {booking.services?.title && (
                <p className="text-sm font-bold text-black">{booking.services.title}</p>
              )}
              {sessionDate && (
                <p className="text-xs text-neutral-gray mt-0.5">{sessionDate}</p>
              )}
              {!booking.services?.title && !sessionDate && (
                <p className="text-xs text-neutral-gray italic">No session details</p>
              )}
            </div>
          </div>

          {/* Payment breakdown */}
          <div className="px-10 pb-8">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: accent + '12' }}>
                  <th className="text-left text-[9px] uppercase tracking-[3px] font-bold text-gray-500 px-4 py-3">Description</th>
                  <th className="text-center text-[9px] uppercase tracking-[3px] font-bold text-gray-500 px-4 py-3">Status</th>
                  <th className="text-right text-[9px] uppercase tracking-[3px] font-bold text-gray-500 px-4 py-3">Amount</th>
                </tr>
              </thead>
              <tbody>
                {Number(booking.deposit_amount) > 0 && (
                  <tr className="border-b border-gray-50">
                    <td className="px-4 py-4 text-sm text-black">Deposit</td>
                    <td className="px-4 py-4 text-center">
                      {depositPaid
                        ? <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-green-700 bg-green-50 border border-green-200 px-2 py-0.5">✓ Paid</span>
                        : <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5">Unpaid</span>
                      }
                    </td>
                    <td className="px-4 py-4 text-right text-sm font-medium text-black">₦{Number(booking.deposit_amount).toLocaleString()}</td>
                  </tr>
                )}
                {Number(booking.balance_amount) > 0 && (
                  <tr className="border-b border-gray-50">
                    <td className="px-4 py-4 text-sm text-black">Balance</td>
                    <td className="px-4 py-4 text-center">
                      {balancePaid
                        ? <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-green-700 bg-green-50 border border-green-200 px-2 py-0.5">✓ Paid</span>
                        : <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5">Unpaid</span>
                      }
                    </td>
                    <td className="px-4 py-4 text-right text-sm font-medium text-black">₦{Number(booking.balance_amount).toLocaleString()}</td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                {totalPaid > 0 && totalPaid < total && (
                  <tr>
                    <td colSpan="2" className="px-4 pt-4 text-right text-xs text-neutral-gray">Amount Paid</td>
                    <td className="px-4 pt-4 text-right text-sm text-neutral-gray">₦{totalPaid.toLocaleString()}</td>
                  </tr>
                )}
                <tr>
                  <td colSpan="2" className="px-4 pt-3 pb-4 text-right text-[10px] uppercase tracking-widest font-bold text-black">
                    {totalDue > 0 ? 'Balance Due' : 'Total'}
                  </td>
                  <td className="px-4 pt-3 pb-4 text-right font-serif text-xl" style={{ color: totalDue > 0 ? accent : '#16a34a' }}>
                    ₦{(totalDue > 0 ? totalDue : total).toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Payment details + notes */}
          <div className="mx-10 border-t border-gray-100" />
          <div className="px-10 py-8 grid grid-cols-2 gap-8">
            {(studio.paystack_bank_name || studio.paystack_account_number) && (
              <div>
                <p className="text-[9px] uppercase tracking-[3px] font-bold text-gray-400 mb-3">Payment Details</p>
                {studio.paystack_bank_name && (
                  <p className="text-xs text-neutral-gray mb-0.5">Bank: <span className="text-black font-medium">{studio.paystack_bank_name}</span></p>
                )}
                {studio.paystack_account_name && (
                  <p className="text-xs text-neutral-gray mb-0.5">Account Name: <span className="text-black font-medium">{studio.paystack_account_name}</span></p>
                )}
                {studio.paystack_account_number && (
                  <p className="text-xs text-neutral-gray">Account Number: <span className="text-black font-bold tracking-wider">{studio.paystack_account_number}</span></p>
                )}
              </div>
            )}
            {booking.notes && (
              <div>
                <p className="text-[9px] uppercase tracking-[3px] font-bold text-gray-400 mb-3">Notes</p>
                <p className="text-xs text-neutral-gray leading-relaxed">{booking.notes}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{ backgroundColor: accent + '0D' }} className="px-10 py-6 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-neutral-gray">Thank you for choosing <span className="font-bold text-black">{studio.name}</span>.</p>
            <p className="text-[9px] uppercase tracking-[3px] text-gray-400">
              Powered by <span className="font-bold" style={{ color: accent }}>photostudio.ng</span>
            </p>
          </div>

        </div>
      </div>
    </>
  );
}
