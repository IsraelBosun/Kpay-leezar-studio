import Link from 'next/link';

export default function PaymentSuccessPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div className="max-w-sm w-full text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="font-bold text-2xl text-zinc-900 mb-2">Payment received</h1>
        <p className="text-zinc-500 text-sm leading-relaxed mb-8">
          Your payment was successful. Your photographer has been notified and will be in touch shortly.
        </p>
        <p className="text-xs text-zinc-400">
          Powered by{' '}
          <Link href="/" className="font-semibold text-zinc-600 hover:text-zinc-900 transition-colors">
            photostudio.ng
          </Link>
        </p>
      </div>
    </main>
  );
}
