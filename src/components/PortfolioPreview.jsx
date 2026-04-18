"use client";

import { siteData } from '@/lib/data';
import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

function BlurImage({ src, alt, className }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <img
      src={src}
      alt={alt}
      onLoad={() => setLoaded(true)}
      className={`${className} transition-all duration-700 ${loaded ? 'blur-0' : 'blur-sm'}`}
    />
  );
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function PortfolioPreview() {
  const [activeId, setActiveId] = useState(null);

  return (
    <section className="py-20 md:py-24 px-6 max-w-7xl mx-auto">
      {/* Section Header */}
      <motion.div
        className="mb-12 md:mb-16 text-center"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <h2 className="text-xs uppercase tracking-[0.5em] text-primary font-bold mb-4">
          Portfolio
        </h2>
        <h3 className="text-3xl md:text-4xl font-serif mb-4 text-black">Featured Work</h3>
        <p className="text-neutral-gray max-w-xl mx-auto italic text-sm md:text-base">
          A curated selection of moments captured with precision, emotion, and storytelling.
        </p>
      </motion.div>

      {/* Mobile: horizontal scroll carousel */}
      <div className="md:hidden flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 -mx-6 px-6 scrollbar-hide">
        {siteData.fullGallery.slice(0, 6).map((item) => (
          <div
            key={item.id}
            className="relative flex-shrink-0 w-72 h-96 snap-start overflow-hidden bg-gray-200 cursor-pointer"
            onClick={() => setActiveId(activeId === item.id ? null : item.id)}
          >
            <BlurImage
              src={item.src}
              alt={item.category}
              className="w-full h-full object-cover md:grayscale transition-all duration-700"
            />
            <div className="absolute inset-0 bg-black/30 flex items-end p-5">
              <span className="text-white text-[10px] uppercase tracking-widest font-bold">{item.category}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: masonry grid */}
      <motion.div
        className="hidden md:columns-2 lg:columns-3 md:block gap-6 space-y-6"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-40px' }}
      >
        {siteData.fullGallery.slice(0, 6).map((item) => (
          <motion.div
            key={item.id}
            className="relative group overflow-hidden bg-gray-200 cursor-pointer break-inside-avoid"
            variants={cardVariants}
            whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}
            onClick={() => setActiveId(activeId === item.id ? null : item.id)}
          >
            <BlurImage
              src={item.src}
              alt={item.category}
              className={`w-full transition-all duration-700 ease-in-out
                ${activeId === item.id
                  ? 'grayscale-0 scale-105'
                  : 'md:grayscale group-hover:grayscale-0 group-hover:scale-105'}
              `}
            />
            <div className={`absolute inset-0 bg-black/30 transition-opacity flex items-end p-5
              ${activeId === item.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
            `}>
              <span className="text-white text-[10px] uppercase tracking-widest font-bold">{item.category}</span>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* View All CTA */}
      <motion.div
        className="mt-14 text-center"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <Link
          href="/gallery"
          className="inline-flex items-center gap-4 border border-gray-200 text-black px-10 py-4 uppercase tracking-widest text-[11px] font-bold hover:bg-black hover:text-white hover:border-black transition-all duration-300 group"
        >
          View All Work
          <span className="w-6 h-px bg-current transition-all duration-300 group-hover:w-10" />
        </Link>
      </motion.div>
    </section>
  );
}
