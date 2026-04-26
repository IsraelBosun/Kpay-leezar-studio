import Link from 'next/link';
import ResendButton from './ResendButton';

export default async function VerifyEmailPage({ searchParams }) {
  const { email = '' } = await searchParams;

  return (
    <div className="min-h-screen flex">

      {/* Left — dark brand panel */}
      <div className="hidden lg:flex lg:w-[45%] relative bg-zinc-950 flex-col justify-between p-14 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=900&h=1200&fit=crop&q=80"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-zinc-950/40" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(211,14,21,0.1)_0%,_transparent_60%)]" />

        <div className="relative z-10">
          <Link href="/" className="inline-flex flex-col items-start">
            <span className="font-serif text-2xl tracking-tight text-white leading-none">photostudio</span>
            <span className="text-[8px] uppercase tracking-[0.3em] font-bold text-primary">.ng</span>
          </Link>
        </div>

        <div className="relative z-10 space-y-4">
          <p className="text-xs uppercase tracking-[0.4em] text-primary font-bold">Almost there</p>
          <h1 className="text-4xl font-serif text-white leading-tight">
            One quick step.<br />
            <span className="italic text-white/60">Then you&apos;re live.</span>
          </h1>
          <p className="text-white/40 text-sm font-light leading-relaxed max-w-xs">
            Verifying your email keeps your studio account secure and ensures clients can always reach you.
          </p>
        </div>

        <p className="relative z-10 text-[10px] uppercase tracking-widest text-white/20">
          &copy; {new Date().getFullYear()} photostudio.ng
        </p>
      </div>

      {/* Right — content */}
      <div className="flex-1 flex items-center justify-center px-6 py-16 bg-white">
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <Link href="/" className="inline-flex flex-col items-start mb-10 lg:hidden">
            <span className="font-serif text-2xl tracking-tight text-black leading-none">photostudio</span>
            <span className="text-[8px] uppercase tracking-[0.3em] font-bold text-primary">.ng</span>
          </Link>

          {/* Icon */}
          <div className="w-14 h-14 flex items-center justify-center bg-primary/10 mb-8">
            <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>

          <h2 className="text-3xl font-serif text-black mb-2">Check your inbox</h2>
          <p className="text-sm text-neutral-gray italic mb-1">
            We sent a verification link to{' '}
            {email
              ? <span className="font-medium not-italic text-black">{email}</span>
              : 'your email address'
            }.
          </p>
          <p className="text-sm text-neutral-gray italic mb-8">
            Click the link to confirm your account and get started.
          </p>

          <div className="bg-gray-50 border border-gray-100 px-4 py-3 mb-8">
            <p className="text-xs text-neutral-gray leading-relaxed">
              <span className="font-bold text-black">Can&apos;t find it?</span>{' '}
              Check your spam or promotions folder — the email may have landed there.
            </p>
          </div>

          <ResendButton email={email} />

          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-sm text-neutral-gray text-center">
              Already verified?{' '}
              <Link href="/auth/login" className="text-black font-bold hover:text-primary transition-colors">
                Sign in
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
