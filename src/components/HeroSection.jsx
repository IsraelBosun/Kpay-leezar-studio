"use client";
import { siteData } from '@/lib/data';
import Link from 'next/link';
import { motion } from 'framer-motion';

const titleLetters = siteData.hero.title.split('');

export default function HeroSection() {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden bg-zinc-900">
      {/* Background Photo — replace src with your actual hero image */}
      <motion.img
        src="https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=1920&h=1080&fit=crop&q=80"
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        initial={{ scale: 1 }}
        animate={{ scale: 1.08 }}
        transition={{ duration: 12, ease: 'easeInOut', repeat: Infinity, repeatType: 'reverse' }}
      />

      {/* Dark cinematic overlay */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Subtle red radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(211,14,21,0.07)_0%,_transparent_65%)] pointer-events-none" />

      <div className="text-center z-10 px-6 max-w-5xl mx-auto">
        {/* Subtitle */}
        <motion.h2
          className="text-xs md:text-sm uppercase tracking-[0.5em] mb-6 text-white/60 font-bold"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          {siteData.hero.subtitle}
        </motion.h2>

        {/* Title — letter by letter */}
        <h1 className="text-5xl sm:text-7xl md:text-9xl font-serif mb-8 text-white tracking-tighter overflow-hidden">
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
          className="text-base md:text-xl font-light italic mb-10 text-white/55 max-w-2xl mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.9 }}
        >
          {siteData.hero.tagline}
        </motion.p>

        {/* Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 1.1 }}
        >
          <Link
            href="/contact"
            className="w-full sm:w-auto bg-primary text-white px-10 py-4 uppercase tracking-[0.2em] text-[11px] font-bold
                       transition-all duration-300 hover:bg-white hover:text-black active:scale-95"
          >
            Book a Session
          </Link>
          <Link
            href="/gallery"
            className="w-full sm:w-auto border border-white/40 text-white px-10 py-4 uppercase tracking-[0.2em] text-[11px] font-bold
                       transition-all duration-300 hover:bg-white hover:text-black active:scale-95"
          >
            View Gallery
          </Link>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 0.8 }}
      >
        <motion.div
          className="w-[1px] h-12 bg-gradient-to-b from-white/40 to-transparent"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>
    </section>
  );
}
