'use client';

import { useState } from 'react';
import Link from 'next/link';
import { signIn } from '../actions';

export default function LoginPage() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = await signIn(new FormData(e.target));
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
          src="https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=900&h=1200&fit=crop&q=80"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-zinc-950/40" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(211,14,21,0.1)_0%,_transparent_60%)]" />

        {/* Logo */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex flex-col items-start">
            <span className="font-serif text-2xl tracking-tight text-white leading-none">photostudio</span>
            <span className="text-[8px] uppercase tracking-[0.3em] font-bold text-primary">.ng</span>
          </Link>
        </div>

        {/* Copy */}
        <div className="relative z-10 space-y-4">
          <p className="text-xs uppercase tracking-[0.4em] text-primary font-bold">Platform</p>
          <h1 className="text-4xl font-serif text-white leading-tight">
            Everything your studio needs.<br />
            <span className="italic text-white/60">In one place.</span>
          </h1>
          <p className="text-white/40 text-sm font-light leading-relaxed max-w-xs">
            Website, client galleries, bookings, and payments — all under your brand.
          </p>
        </div>

        {/* Bottom */}
        <p className="relative z-10 text-[10px] uppercase tracking-widest text-white/20">
          &copy; {new Date().getFullYear()} photostudio.ng
        </p>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-16 bg-white">
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <Link href="/" className="inline-flex flex-col items-start mb-10 lg:hidden">
            <span className="font-serif text-2xl tracking-tight text-black leading-none">photostudio</span>
            <span className="text-[8px] uppercase tracking-[0.3em] font-bold text-primary">.ng</span>
          </Link>

          <h2 className="text-3xl font-serif text-black mb-1">Welcome back</h2>
          <p className="text-sm text-neutral-gray italic mb-10">Sign in to your studio dashboard</p>

          <form onSubmit={handleSubmit} className="space-y-6">
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
                placeholder="••••••••"
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
              className="w-full bg-black text-white py-4 text-xs uppercase tracking-widest font-bold hover:bg-primary transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="mt-8 text-sm text-neutral-gray text-center">
            New studio?{' '}
            <Link href="/auth/signup" className="text-black font-bold hover:text-primary transition-colors">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
