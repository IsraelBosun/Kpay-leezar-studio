"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  // Handle scroll effect for premium glassmorphism
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent scrolling when mobile menu is open
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
          
          {/* Logo - Leezar Studios */}
          <Link href="/" className="group flex flex-col z-[110]" onClick={() => setIsOpen(false)}>
            <img
              src="/logooo.png"
              alt="Leezar Studios Logo"
              className="w-38 h-auto mb-1 group-hover:opacity-80 transition-opacity duration-300"
            />
            {/* <span className="text-2xl font-serif tracking-tighter text-black group-hover:text-primary transition-colors">
              LEEZAR
            </span>
            <span className="text-[10px] uppercase tracking-[0.4em] text-neutral-gray -mt-1 font-bold">
              Studios
            </span> */}
          </Link>

          {/* Desktop Nav (Links 1-4 + CTA Button 5) */}
          <nav className="hidden md:flex items-center space-x-10">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                href={link.href} 
                className={`text-[11px] uppercase tracking-[0.2em] font-bold transition-all duration-300 hover:text-primary ${
                  pathname === link.href ? 'text-primary' : 'text-neutral-gray'
                }`}
              >
                {link.name}
              </Link>
            ))}
            
            {/* 5th Link: Book Now Button */}
            <Link 
              href="/contact" 
              className="bg-primary text-white px-7 py-3 text-[11px] uppercase tracking-[0.2em] font-bold hover:bg-black transition-all duration-300"
            >
              Book Now
            </Link>
          </nav>

          {/* Mobile Hamburger Button */}
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden relative z-[110] w-10 h-10 flex flex-col justify-center items-end gap-2 focus:outline-none group"
            aria-label="Toggle Menu"
          >
            <span className={`h-[1.5px] bg-black transition-all duration-300 ${isOpen ? 'w-8 rotate-45 translate-y-[4.5px]' : 'w-8 group-hover:w-6'}`} />
            <span className={`h-[1.5px] bg-black transition-all duration-300 ${isOpen ? 'opacity-0' : 'w-5'}`} />
            <span className={`h-[1.5px] bg-black transition-all duration-300 ${isOpen ? 'w-8 -rotate-45 -translate-y-[4.5px]' : 'w-7 group-hover:w-8'}`} />
          </button>
        </div>
      </header>

      {/* Epic Full-Screen Mobile Menu Overlay */}
      <div 
        className={`fixed inset-0 bg-white z-[105] flex flex-col transition-all duration-700 ease-in-out ${
          isOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex-grow flex flex-col justify-center px-12 space-y-8">
          {navLinks.map((link, i) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className={`block text-5xl font-serif text-black hover:text-primary transition-all duration-500 transform ${
                isOpen ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'
              }`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              {link.name}
            </Link>
          ))}
          
          {/* Mobile CTA (5th Link) */}
          <Link
            href="/contact"
            onClick={() => setIsOpen(false)}
            className={`block text-2xl font-serif italic text-primary transform transition-all duration-500 ${
                isOpen ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'
            }`}
            style={{ transitionDelay: `400ms` }}
          >
            Book Your Session →
          </Link>
        </div>

        {/* Mobile Footer Info */}
        <div className={`p-12 border-t border-gray-100 transition-opacity duration-1000 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
          <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400 mb-2 font-bold">General Inquiries</p>
          <p className="text-lg font-serif text-black">hello@leezarstudios.com</p>
        </div>
      </div>
    </>
  );
}