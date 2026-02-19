"use client";
import { siteData } from '@/lib/data';
import Link from 'next/link';
import { motion } from 'framer-motion';

const titleLetters = siteData.hero.title.split('');

export default function HeroSection() {
  return (
    <section className="relative h-screen flex items-center justify-center pt-20 overflow-hidden bg-gray-50">
      {/* Decorative Background Element */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-[radial-gradient(circle,_rgba(211,14,21,0.03)_0%,_transparent_70%)] pointer-events-none" />

      <div className="text-center z-10 px-6">
        {/* Subtitle */}
        <motion.h2
          className="text-sm uppercase tracking-[0.5em] mb-6 text-neutral-gray font-bold"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          {siteData.hero.subtitle}
        </motion.h2>

        {/* Title — letter by letter */}
        <h1 className="text-6xl md:text-9xl font-serif mb-8 text-black tracking-tighter overflow-hidden">
          {titleLetters.map((char, i) => (
            <motion.span
              key={i}
              className="inline-block"
              style={{ whiteSpace: char === ' ' ? 'pre' : 'normal' }}
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                ease: [0.22, 1, 0.36, 1],
                delay: 0.3 + i * 0.04,
              }}
            >
              {char}
            </motion.span>
          ))}
        </h1>

        {/* Tagline */}
        <motion.p
          className="text-lg md:text-2xl font-light italic mb-12 text-neutral-gray max-w-2xl mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.9 }}
        >
          {siteData.hero.tagline}
        </motion.p>

        {/* Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-6 justify-center items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 1.1 }}
        >
          <Link
            href="/contact"
            className="w-full sm:w-auto bg-primary text-white px-12 py-5 uppercase tracking-[0.2em] text-[11px] font-bold
                       transition-all duration-300
                       hover:bg-black hover:shadow-2xl hover:shadow-primary/20
                       active:scale-95 active:bg-black"
          >
            Book a Session
          </Link>

          <Link
            href="/gallery"
            className="w-full sm:w-auto border border-neutral-gray text-neutral-gray px-12 py-5 uppercase tracking-[0.2em] text-[11px] font-bold
                       transition-all duration-300
                       hover:bg-neutral-gray hover:text-white
                       active:scale-95 active:bg-neutral-gray active:text-white"
          >
            View Gallery
          </Link>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 0.8 }}
      >
        <motion.div
          className="w-[1px] h-12 bg-gradient-to-b from-primary to-transparent"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>
    </section>
  );
}
