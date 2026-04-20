'use client';

import { useState } from 'react';
import Link from 'next/link';
import { signUp } from '../actions';

export default function SignupPage() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.target);
    if (formData.get('password') !== formData.get('confirmPassword')) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    const result = await signUp(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">

      {/* Left — dark brand panel */}
      <div className="hidden lg:flex lg:w-[45%] relative bg-zinc-950 flex-col justify-between p-14 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=900&h=1200&fit=crop&q=80"
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
          <p className="text-xs uppercase tracking-[0.4em] text-primary font-bold">Get Started Free</p>
          <h1 className="text-4xl font-serif text-white leading-tight">
            Your studio website.<br />
            <span className="italic text-white/60">Live in 10 minutes.</span>
          </h1>
          <ul className="space-y-3 text-white/50 text-sm font-light">
            {[
              'Professional website at yourstudio.photostudio.ng',
              'Private client gallery portal',
              'Online booking & Paystack payments',
              'No web designer or developer needed',
            ].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="text-primary mt-0.5">—</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 text-[10px] uppercase tracking-widest text-white/20">
          &copy; {new Date().getFullYear()} photostudio.ng
        </p>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-16 bg-white">
        <div className="w-full max-w-sm">

          <Link href="/" className="inline-flex flex-col items-start mb-10 lg:hidden">
            <span className="font-serif text-2xl tracking-tight text-black leading-none">photostudio</span>
            <span className="text-[8px] uppercase tracking-[0.3em] font-bold text-primary">.ng</span>
          </Link>

          <h2 className="text-3xl font-serif text-black mb-1">Create your studio</h2>
          <p className="text-sm text-neutral-gray italic mb-10">Free to start — no credit card required</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">
                .ng Name
              </label>
              <input
                type="text"
                name="studioName"
                required
                placeholder="e.g. Lagos Lens Studio"
                className="bg-transparent border-b-2 border-gray-200 py-3 focus:outline-none focus:border-primary transition-all text-black placeholder:text-gray-300 font-light"
              />
            </div>

            <div className="flex flex-col space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                required
                placeholder="hello@yourstudio.com"
                className="bg-transparent border-b-2 border-gray-200 py-3 focus:outline-none focus:border-primary transition-all text-black placeholder:text-gray-300 font-light"
              />
            </div>

            <div className="flex flex-col space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">
                Password
              </label>
              <input
                type="password"
                name="password"
                required
                minLength={8}
                placeholder="Min. 8 characters"
                className="bg-transparent border-b-2 border-gray-200 py-3 focus:outline-none focus:border-primary transition-all text-black placeholder:text-gray-300 font-light"
              />
            </div>

            <div className="flex flex-col space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                required
                placeholder="Repeat password"
                className="bg-transparent border-b-2 border-gray-200 py-3 focus:outline-none focus:border-primary transition-all text-black placeholder:text-gray-300 font-light"
              />
            </div>

            {error && (
              <p className="text-xs text-red-500 italic bg-red-50 border border-red-100 px-4 py-3">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-4 text-xs uppercase tracking-widest font-bold hover:bg-black transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? 'Creating studio...' : 'Create .ng — Free'}
            </button>
          </form>

          <p className="mt-4 text-[10px] text-gray-400 text-center leading-relaxed">
            By signing up you agree to our terms of service.<br />
            No spam. No credit card required.
          </p>

          <p className="mt-6 text-sm text-neutral-gray text-center">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-black font-bold hover:text-primary transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
