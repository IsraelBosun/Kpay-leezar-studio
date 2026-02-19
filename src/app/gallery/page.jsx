"use client";
import { useState, useEffect, useCallback } from 'react';
import { siteData } from '@/lib/data';
import { motion, AnimatePresence } from 'framer-motion';

const fullGallery = [
  ...siteData.galleryPreview,
  { id: 7,  src: "https://placehold.co/600x900/EEE/545454?text=Wedding+2",    category: "Weddings" },
  { id: 8,  src: "https://placehold.co/800x600/EEE/545454?text=Commercial+2", category: "Commercial" },
  { id: 9,  src: "https://placehold.co/600x800/EEE/545454?text=Portrait+3",   category: "Portraits" },
  { id: 10, src: "https://placehold.co/700x500/EEE/545454?text=Event+3",      category: "Events" },
  { id: 11, src: "https://placehold.co/600x900/EEE/545454?text=Commercial+3", category: "Commercial" },
  { id: 12, src: "https://placehold.co/600x600/EEE/545454?text=Wedding+3",    category: "Weddings" },
];

const categories = ["All", "Portraits", "Events", "Weddings", "Commercial"];

export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [lightboxId, setLightboxId] = useState(null);

  const filteredImages = activeCategory === "All"
    ? fullGallery
    : fullGallery.filter(img => img.category === activeCategory);

  const currentIndex = filteredImages.findIndex(img => img.id === lightboxId);
  const lightboxImage = filteredImages[currentIndex] ?? null;

  const closeLightbox = useCallback(() => setLightboxId(null), []);

  const navigate = useCallback((dir) => {
    const next = (currentIndex + dir + filteredImages.length) % filteredImages.length;
    setLightboxId(filteredImages[next].id);
  }, [currentIndex, filteredImages]);

  // Keyboard navigation
  useEffect(() => {
    if (!lightboxId) return;
    const onKey = (e) => {
      if (e.key === 'Escape')      closeLightbox();
      if (e.key === 'ArrowRight')  navigate(1);
      if (e.key === 'ArrowLeft')   navigate(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxId, navigate, closeLightbox]);

  // Body scroll lock when lightbox open
  useEffect(() => {
    document.body.style.overflow = lightboxId ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [lightboxId]);

  // Close lightbox if current image disappears after filter change
  useEffect(() => {
    if (lightboxId && currentIndex === -1) setLightboxId(null);
  }, [activeCategory, currentIndex, lightboxId]);

  return (
    <main className="pt-28 md:pt-32 pb-24 min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6">

        {/* Gallery Header */}
        <motion.div
          className="mb-12 md:mb-16 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <h2 className="text-xs uppercase tracking-[0.5em] text-primary font-bold mb-4">
            Portfolio
          </h2>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif text-black mb-6">
            Our Work
          </h1>
          <p className="text-neutral-gray max-w-2xl mx-auto italic font-light text-base md:text-lg">
            A visual collection of stories, moments, and emotions captured through the lens of excellence.
          </p>
        </motion.div>

        {/* Filter Tabs */}
        <motion.div
          className="flex flex-wrap justify-center gap-6 md:gap-8 mb-12 md:mb-16 border-b border-gray-100 pb-6 md:pb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut', delay: 0.2 }}
        >
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`text-[11px] uppercase tracking-[0.2em] font-bold transition-all relative pb-2 ${
                activeCategory === cat ? 'text-primary' : 'text-neutral-gray hover:text-black'
              }`}
            >
              {cat}
              {activeCategory === cat && (
                <motion.span
                  layoutId="filter-underline"
                  className="absolute bottom-0 left-0 w-full h-[2px] bg-primary"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          ))}
        </motion.div>

        {/* Masonry Grid */}
        <motion.div className="columns-2 lg:columns-3 gap-3 space-y-3 md:gap-8 md:space-y-8">
          <AnimatePresence mode="popLayout">
            {filteredImages.map((image) => (
              <motion.div
                key={image.id}
                layout
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="relative group overflow-hidden break-inside-avoid bg-gray-50 cursor-pointer"
                onClick={() => setLightboxId(image.id)}
              >
                <div className="absolute inset-0 bg-black/40 z-10 flex flex-col justify-center items-center text-white p-6
                                opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <span className="text-[10px] uppercase tracking-[0.3em] mb-2 translate-y-3 group-hover:translate-y-0 transition-transform duration-500">
                    {image.category}
                  </span>
                  <div className="h-px w-8 bg-primary translate-y-3 group-hover:translate-y-0 transition-transform duration-500 delay-75" />
                  <span className="mt-4 text-xs uppercase tracking-widest border border-white/30 px-4 py-2
                                   translate-y-3 group-hover:translate-y-0 transition-transform duration-500 delay-100
                                   hover:bg-white hover:text-black">
                    View Full
                  </span>
                </div>
                <img
                  src={image.src}
                  alt={image.category}
                  className="w-full h-auto object-cover grayscale group-hover:grayscale-0 scale-100 group-hover:scale-105 transition-all duration-700"
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Empty State */}
        <AnimatePresence>
          {filteredImages.length === 0 && (
            <motion.div
              className="py-20 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <p className="text-neutral-gray italic">No masterpieces found in this category yet.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Lightbox ── */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div
            className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={closeLightbox}
          >
            {/* Close button */}
            <button
              onClick={closeLightbox}
              className="absolute top-5 right-5 text-white/60 hover:text-white transition-colors z-10 p-2"
              aria-label="Close"
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Counter */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 text-[11px] uppercase tracking-widest text-white/40 font-bold">
              {currentIndex + 1} / {filteredImages.length}
            </div>

            {/* Prev */}
            {filteredImages.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); navigate(-1); }}
                className="absolute left-4 md:left-8 text-white/50 hover:text-white transition-colors z-10 p-2"
                aria-label="Previous"
              >
                <svg className="w-8 h-8 md:w-10 md:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}

            {/* Image */}
            <motion.img
              key={lightboxImage.id}
              src={lightboxImage.src}
              alt={lightboxImage.category}
              className="max-h-[85vh] max-w-[90vw] md:max-w-[75vw] object-contain shadow-2xl"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
            />

            {/* Next */}
            {filteredImages.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); navigate(1); }}
                className="absolute right-4 md:right-8 text-white/50 hover:text-white transition-colors z-10 p-2"
                aria-label="Next"
              >
                <svg className="w-8 h-8 md:w-10 md:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}

            {/* Category label */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[11px] uppercase tracking-widest text-white/40 font-bold">
              {lightboxImage.category}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
