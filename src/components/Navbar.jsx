"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

const menuVariants = {
  closed: {
    y: '-100%',
    opacity: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
  open: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

const linkVariants = {
  closed: { x: -20, opacity: 0 },
  open: (i) => ({
    x: 0,
    opacity: 1,
    transition: { duration: 0.4, ease: 'easeOut', delay: i * 0.08 },
  }),
};

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
  }, [isOpen]);

  const navLinks = [
    { name: "About", href: "/#about" },
    { name: "Services", href: "/#services" },
    { name: "Gallery", href: "/gallery" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <>
      <header
        className={`fixed top-0 w-full z-[100] transition-all duration-500 ${
          scrolled ? 'bg-white/90 backdrop-blur-md py-4 shadow-sm' : 'bg-transparent py-8'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">

          {/* Logo */}
          <Link href="/" className="group flex flex-col items-start z-[110]" onClick={() => setIsOpen(false)}>
            <span className={`font-serif text-2xl tracking-tight leading-none transition-opacity duration-300 group-hover:opacity-70 ${scrolled ? 'text-black' : 'text-white'}`}>
              LUMIS
            </span>
            <span className={`text-[8px] uppercase tracking-[0.3em] font-bold transition-opacity duration-300 group-hover:opacity-70 ${scrolled ? 'text-primary' : 'text-primary'}`}>
              Studio
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-10">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`text-[11px] uppercase tracking-[0.2em] font-bold transition-all duration-300 hover:text-primary ${
                  pathname === link.href ? 'text-primary' : scrolled ? 'text-neutral-gray' : 'text-white/80'
                }`}
              >
                {link.name}
              </Link>
            ))}
            <Link
              href="/contact"
              className="bg-primary text-white px-7 py-3 text-[11px] uppercase tracking-[0.2em] font-bold hover:bg-black transition-all duration-300"
            >
              Book Now
            </Link>
          </nav>

          {/* Hamburger */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden relative z-[110] w-10 h-10 flex flex-col justify-center items-end gap-2 focus:outline-none group"
            aria-label="Toggle Menu"
          >
            <motion.span
              className={`h-[1.5px] block ${scrolled || isOpen ? 'bg-black' : 'bg-white'}`}
              animate={isOpen ? { width: 32, rotate: 45, y: 4.5 } : { width: 32, rotate: 0, y: 0 }}
              transition={{ duration: 0.3 }}
            />
            <motion.span
              className={`h-[1.5px] block ${scrolled || isOpen ? 'bg-black' : 'bg-white'}`}
              animate={isOpen ? { opacity: 0, width: 20 } : { opacity: 1, width: 20 }}
              transition={{ duration: 0.3 }}
            />
            <motion.span
              className={`h-[1.5px] block ${scrolled || isOpen ? 'bg-black' : 'bg-white'}`}
              animate={isOpen ? { width: 32, rotate: -45, y: -4.5 } : { width: 28, rotate: 0, y: 0 }}
              transition={{ duration: 0.3 }}
            />
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-white z-[105] flex flex-col"
            variants={menuVariants}
            initial="closed"
            animate="open"
            exit="closed"
          >
            <div className="flex-grow flex flex-col justify-center px-12 space-y-8">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.name}
                  custom={i}
                  variants={linkVariants}
                  initial="closed"
                  animate="open"
                  exit="closed"
                >
                  <Link
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="block text-5xl font-serif text-black hover:text-primary transition-colors duration-300"
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}

              <motion.div
                custom={navLinks.length}
                variants={linkVariants}
                initial="closed"
                animate="open"
                exit="closed"
              >
                <Link
                  href="/contact"
                  onClick={() => setIsOpen(false)}
                  className="block text-2xl font-serif italic text-primary"
                >
                  Book Your Session →
                </Link>
              </motion.div>
            </div>

            {/* Mobile Footer Info */}
            <motion.div
              className="p-12 border-t border-gray-100"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.4 }}
            >
              <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400 mb-2 font-bold">General Inquiries</p>
              <p className="text-lg font-serif text-black">hello@lumisstudio.com</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
