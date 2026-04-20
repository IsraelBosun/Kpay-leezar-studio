'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

const NAV_LINKS = [
  { name: 'Features', href: '/#features' },
  { name: 'Pricing', href: '/#pricing' },
  { name: 'Demo', href: '/studio-site/demo' },
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
      <header className={`fixed top-0 w-full z-[100] transition-all duration-500 ${
        scrolled
          ? 'bg-zinc-950/95 backdrop-blur-md py-4 border-b border-white/8'
          : 'bg-transparent py-7'
      }`}>
        <div className="max-w-5xl mx-auto px-6 flex justify-between items-center">

          {/* Logo */}
          <Link href="/" className="group inline-flex flex-col items-start z-[110]" onClick={() => setIsOpen(false)}>
            <span className="font-serif text-xl tracking-tight text-white leading-none group-hover:opacity-70 transition-opacity duration-300">
              photostudio
            </span>
            <span className="text-[7px] uppercase tracking-[0.3em] font-bold text-primary group-hover:opacity-70 transition-opacity duration-300">
              .ng
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link key={link.name} href={link.href}
                className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/45 hover:text-white transition-colors duration-300">
                {link.name}
              </Link>
            ))}
            <Link href="/auth/login"
              className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/45 hover:text-white transition-colors duration-300">
              Log in
            </Link>
            <Link href="/auth/signup"
              className="px-6 py-2.5 text-[10px] uppercase tracking-[0.2em] font-bold text-white hover:opacity-85 transition-opacity duration-300"
              style={{ backgroundColor: '#D30E15' }}>
              Get started
            </Link>
          </nav>

          {/* Hamburger */}
          <button onClick={() => setIsOpen(!isOpen)}
            className="md:hidden relative z-[110] w-9 h-9 flex flex-col justify-center items-end gap-[7px] focus:outline-none">
            <motion.span className="h-px bg-white block"
              animate={isOpen ? { width: 28, rotate: 45, y: 7 } : { width: 28, rotate: 0, y: 0 }}
              transition={{ duration: 0.3 }} />
            <motion.span className="h-px bg-white block"
              animate={isOpen ? { opacity: 0 } : { opacity: 1, width: 20 }}
              transition={{ duration: 0.3 }} />
            <motion.span className="h-px bg-white block"
              animate={isOpen ? { width: 28, rotate: -45, y: -7 } : { width: 24, rotate: 0, y: 0 }}
              transition={{ duration: 0.3 }} />
          </button>
        </div>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-zinc-950 z-[105] flex flex-col"
            initial={{ y: '-100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '-100%', opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex-grow flex flex-col justify-center px-10 space-y-8 pt-20">
              {NAV_LINKS.map((link, i) => (
                <motion.div key={link.name}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.08, duration: 0.4 }}>
                  <Link href={link.href} onClick={() => setIsOpen(false)}
                    className="block font-serif text-5xl text-white hover:text-primary transition-colors duration-300">
                    {link.name}
                  </Link>
                </motion.div>
              ))}
              <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.28 }}>
                <Link href="/auth/signup" onClick={() => setIsOpen(false)}
                  className="block font-serif text-3xl italic text-primary">
                  Get started →
                </Link>
              </motion.div>
            </div>
            <div className="p-10 border-t" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
              <p className="text-[10px] uppercase tracking-widest text-white/20 font-bold mb-1">Contact</p>
              <p className="text-sm text-white/40">hello@photostudio.ng</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
