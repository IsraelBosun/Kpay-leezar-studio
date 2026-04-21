'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from '@/app/auth/actions';

const navLinks = [
  {
    label: 'Dashboard',
    href: '/studio/dashboard',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    label: 'Bookings',
    href: '/studio/bookings',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    label: 'Galleries',
    href: '/studio/galleries',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    label: 'Payments',
    href: '/studio/payments',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    label: 'Settings',
    href: '/studio/settings',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

export default function Sidebar({ studio }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-8 border-b border-white/10">
        <Link href="/studio/dashboard" className="inline-flex flex-col items-start">
          <span className="font-serif text-xl tracking-tight text-white leading-none">photostudio</span>
          <span className="text-[7px] uppercase tracking-[0.3em] font-bold text-primary">.ng</span>
        </Link>
      </div>

      {/* .ng name + plan badge */}
      <div className="px-6 py-5 border-b border-white/10">
        <p className="text-white font-medium text-sm truncate">{studio.name}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className={`text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 ${
            studio.plan === 'pro' ? 'bg-primary text-white' :
            studio.plan === 'studio' ? 'bg-yellow-500 text-black' :
            'bg-white/10 text-white/50'
          }`}>
            {studio.plan}
          </span>
          {studio.plan === 'free' && (
            <Link href="/studio/settings#upgrade" className="text-[9px] uppercase tracking-widest text-primary font-bold hover:underline">
              Upgrade
            </Link>
          )}
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-6 space-y-1">
        {navLinks.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-3 text-xs uppercase tracking-widest font-bold transition-all duration-200 ${
                active
                  ? 'bg-primary text-white'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              {link.icon}
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* View live site */}
      <div className="px-3 pb-4">
        <a
          href={
            process.env.NEXT_PUBLIC_ROOT_DOMAIN === 'photostudio.ng'
              ? `https://${studio.slug}.photostudio.ng`
              : `${process.env.NEXT_PUBLIC_APP_URL}/studio-site/${studio.slug}`
          }
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-3 py-3 text-xs uppercase tracking-widest font-bold text-white/30 hover:text-white transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          View My Site
        </a>
      </div>

      {/* Sign out */}
      <div className="px-3 pb-6 border-t border-white/10 pt-4">
        <form action={signOut}>
          <button
            type="submit"
            className="flex items-center gap-3 px-3 py-3 w-full text-xs uppercase tracking-widest font-bold text-white/30 hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed top-0 left-0 h-screen w-64 bg-zinc-950 flex-col z-50">
        <SidebarContent />
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-zinc-950 flex items-center justify-between px-6 py-4">
        <Link href="/studio/dashboard" className="inline-flex flex-col items-start">
          <span className="font-serif text-lg tracking-tight text-white leading-none">photostudio</span>
          <span className="text-[7px] uppercase tracking-[0.3em] font-bold text-primary">.ng</span>
        </Link>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="text-white p-1">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileOpen
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 6h16M4 12h16M4 18h16" />
            }
          </svg>
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="w-64 bg-zinc-950 h-full pt-16">
            <SidebarContent />
          </div>
          <div className="flex-1 bg-black/50" onClick={() => setMobileOpen(false)} />
        </div>
      )}

      {/* Mobile top padding */}
      <div className="lg:hidden h-16" />
    </>
  );
}
