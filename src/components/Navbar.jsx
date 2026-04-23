'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

const NAV_LINKS = [
  { name: 'Features', href: '/#features' },
  { name: 'Pricing', href: '/#pricing' },
  { name: 'Blog', href: '#' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <>
      <header className={`fixed top-0 w-full z-[100] transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md py-3.5 border-b border-zinc-200 shadow-sm'
          : 'bg-white py-5 border-b border-zinc-100'
      }`}>
        <div className="max-w-4xl mx-auto px-6 flex justify-between items-center">

          <Link href="/" className="inline-flex items-baseline gap-0.5 z-[110]" onClick={() => setIsOpen(false)}>
            <span className="font-bold text-lg text-zinc-900 tracking-tight">photostudio</span>
            <span className="text-sm font-bold" style={{ color: '#F0940A' }}>.ng</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <Link key={link.name} href={link.href}
                className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors duration-200">
                {link.name}
              </Link>
            ))}
            <Link href="/auth/signup"
              className="px-5 py-2 text-sm font-semibold text-zinc-900 border border-zinc-900 hover:bg-zinc-900 hover:text-white transition-all duration-200 rounded-sm">
              Get started
            </Link>
          </nav>

          <button onClick={() => setIsOpen(!isOpen)}
            className="md:hidden relative z-[110] w-9 h-9 flex flex-col justify-center items-end gap-[6px] focus:outline-none">
            <motion.span className="h-px bg-zinc-900 block"
              animate={isOpen ? { width: 26, rotate: 45, y: 6.5 } : { width: 26, rotate: 0, y: 0 }}
              transition={{ duration: 0.3 }} />
            <motion.span className="h-px bg-zinc-900 block"
              animate={isOpen ? { opacity: 0 } : { opacity: 1, width: 18 }}
              transition={{ duration: 0.3 }} />
            <motion.span className="h-px bg-zinc-900 block"
              animate={isOpen ? { width: 26, rotate: -45, y: -6.5 } : { width: 22, rotate: 0, y: 0 }}
              transition={{ duration: 0.3 }} />
          </button>
        </div>
      </header>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-white z-[105] flex flex-col"
            initial={{ y: '-100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '-100%', opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex-grow flex flex-col justify-center px-8 space-y-7 pt-20">
              {NAV_LINKS.map((link, i) => (
                <motion.div key={link.name}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.07 }}>
                  <Link href={link.href} onClick={() => setIsOpen(false)}
                    className="block text-4xl font-bold text-zinc-900 hover:opacity-60 transition-opacity">
                    {link.name}
                  </Link>
                </motion.div>
              ))}
              <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.24 }}>
                <Link href="/auth/signup" onClick={() => setIsOpen(false)}
                  className="inline-block text-2xl font-bold" style={{ color: '#F0940A' }}>
                  Get started →
                </Link>
              </motion.div>
            </div>
            <div className="p-8 border-t border-zinc-100">
              <p className="text-xs text-zinc-400">hello@photostudio.ng</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
