'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAdminTheme } from './AdminThemeContext';

const NAV = [
  {
    label: 'Overview',
    href: '/admin',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10-2a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1h-4a1 1 0 01-1-1v-6z" />
      </svg>
    ),
  },
  {
    label: 'Studios',
    href: '/admin/studios',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    label: 'Revenue',
    href: '/admin/revenue',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

function SunIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
  );
}

export default function AdminSidebar({ userEmail }) {
  const pathname = usePathname();
  const { dark, toggle } = useAdminTheme();
  const [open, setOpen] = useState(false);

  const isActive = (href) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);

  const SidebarContent = () => (
    <div className="flex flex-col h-full" style={{ backgroundColor: 'var(--a-surface)' }}>
      {/* Logo */}
      <div className="px-6 py-5 border-b" style={{ borderColor: 'var(--a-border)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-1">
            <span className="font-bold text-sm tracking-tight" style={{ color: 'var(--a-text)' }}>photostudio</span>
            <span className="text-sm font-bold text-[#F0940A]">.ng</span>
          </div>
          <span className="text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: 'var(--a-accent-bg)', color: 'var(--a-accent-text)' }}>
            admin
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-0.5">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150"
            style={isActive(item.href)
              ? { backgroundColor: 'var(--a-accent-bg)', color: 'var(--a-accent-text)' }
              : { color: 'var(--a-muted)' }}
            onMouseEnter={e => { if (!isActive(item.href)) { e.currentTarget.style.backgroundColor = 'var(--a-hover)'; e.currentTarget.style.color = 'var(--a-text)'; } }}
            onMouseLeave={e => { if (!isActive(item.href)) { e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.color = 'var(--a-muted)'; } }}>
            {item.icon}
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-4 py-4 border-t space-y-2" style={{ borderColor: 'var(--a-border)' }}>
        {/* Dark mode toggle */}
        <button
          onClick={toggle}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150"
          style={{ color: 'var(--a-muted)' }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--a-hover)'; e.currentTarget.style.color = 'var(--a-text)'; }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.color = 'var(--a-muted)'; }}>
          {dark ? <SunIcon /> : <MoonIcon />}
          {dark ? 'Light mode' : 'Dark mode'}
        </button>

        <Link
          href="/studio/dashboard"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150"
          style={{ color: 'var(--a-muted)' }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--a-hover)'; e.currentTarget.style.color = 'var(--a-text)'; }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.color = 'var(--a-muted)'; }}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Exit Admin
        </Link>

        <p className="text-[11px] px-3 truncate" style={{ color: 'var(--a-subtle)' }}>{userEmail}</p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-60 border-r z-40"
        style={{ borderColor: 'var(--a-border)', backgroundColor: 'var(--a-surface)' }}>
        <SidebarContent />
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 border-b h-16 flex items-center px-4 justify-between backdrop-blur-md"
        style={{ borderColor: 'var(--a-border)', backgroundColor: 'var(--a-surface)' }}>
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm" style={{ color: 'var(--a-text)' }}>photostudio<span className="text-[#F0940A]">.ng</span></span>
          <span className="text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: 'var(--a-accent-bg)', color: 'var(--a-accent-text)' }}>admin</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={toggle} className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
            style={{ color: 'var(--a-muted)', backgroundColor: 'var(--a-hover)' }}>
            {dark ? <SunIcon /> : <MoonIcon />}
          </button>
          <button
            onClick={() => setOpen(o => !o)}
            className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
            style={{ color: 'var(--a-muted)', backgroundColor: 'var(--a-hover)' }}>
            {open ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-40" onClick={() => setOpen(false)}
          style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}>
          <div className="w-64 h-full border-r" style={{ borderColor: 'var(--a-border)', backgroundColor: 'var(--a-surface)' }}
            onClick={e => e.stopPropagation()}>
            <div className="pt-16 h-full">
              <SidebarContent />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
