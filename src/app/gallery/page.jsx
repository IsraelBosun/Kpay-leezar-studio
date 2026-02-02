"use client";
import { useState, useEffect } from 'react';
import { siteData } from '@/lib/data';

// Full gallery data
const fullGallery = [
  ...siteData.galleryPreview,
  { id: 7, src: "https://placehold.co/600x900/EEE/545454?text=Wedding+2", category: "Weddings" },
  { id: 8, src: "https://placehold.co/800x600/EEE/545454?text=Commercial+2", category: "Commercial" },
  { id: 9, src: "https://placehold.co/600x800/EEE/545454?text=Portrait+3", category: "Portraits" },
  { id: 10, src: "https://placehold.co/700x500/EEE/545454?text=Event+3", category: "Events" },
  { id: 11, src: "https://placehold.co/600x900/EEE/545454?text=Commercial+3", category: "Commercial" },
  { id: 12, src: "https://placehold.co/600x600/EEE/545454?text=Wedding+3", category: "Weddings" },
];

const categories = ["All", "Portraits", "Events", "Weddings", "Commercial"];

export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedImage, setSelectedImage] = useState(null);

  const filteredImages = activeCategory === "All" 
    ? fullGallery 
    : fullGallery.filter(img => img.category === activeCategory);

  // Prevent background scroll when lightbox is open
  useEffect(() => {
    if (selectedImage) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
  }, [selectedImage]);

  return (
    <main className="pt-32 pb-24 min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Gallery Header */}
        <div className="mb-16 text-center animate-fade-in">
          <h2 className="text-sm uppercase tracking-[0.5em] text-primary font-bold mb-4">
            Portfolio
          </h2>
          <h1 className="text-5xl md:text-7xl font-serif text-black mb-8 leading-tight">
            Our Work
          </h1>
          <p className="text-neutral-gray max-w-2xl mx-auto italic font-light text-lg">
            A visual collection of stories and emotions captured through the lens of excellence.
          </p>
        </div>

        {/* Editorial Filter System */}
        <div className="flex flex-wrap justify-center gap-6 md:gap-12 mb-16 border-b border-gray-100 pb-8 overflow-x-auto no-scrollbar whitespace-nowrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`text-[11px] uppercase tracking-[0.2em] font-bold transition-all relative pb-2 px-2 ${
                activeCategory === cat ? 'text-primary' : 'text-neutral-gray hover:text-black active:text-primary'
              }`}
            >
              {cat}
              {activeCategory === cat && (
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-primary animate-in fade-in slide-in-from-left-2" />
              )}
            </button>
          ))}
        </div>

        {/* Responsive Masonry Grid */}
        <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
          {filteredImages.map((image) => (
            <div 
              key={image.id} 
              onClick={() => setSelectedImage(image)}
              className="relative group overflow-hidden break-inside-avoid bg-gray-50 cursor-zoom-in"
            >
              {/* Overlay: Always visible at bottom on mobile, centers on hover for desktop */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent md:bg-black/40 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-500 z-10 flex flex-col justify-end md:justify-center items-start md:items-center p-6 text-white">
                <span className="text-[10px] uppercase tracking-[0.3em] font-bold mb-1 md:mb-2 md:translate-y-4 md:group-hover:translate-y-0 transition-transform duration-500">
                  {image.category}
                </span>
                <div className="h-px w-8 bg-primary md:translate-y-4 md:group-hover:translate-y-0 transition-transform duration-500 delay-75 mb-2 md:mb-0" />
                <span className="md:hidden text-[9px] uppercase tracking-[0.2em] opacity-60">Tap to view</span>
                
                <button className="hidden md:block mt-6 text-[10px] uppercase tracking-widest border border-white/30 px-6 py-2 hover:bg-white hover:text-black transition-all">
                  Expand Image
                </button>
              </div>

              <img
                src={image.src}
                alt={image.category}
                className="w-full h-auto object-cover grayscale-[0.4] md:grayscale group-hover:grayscale-0 transition-all duration-1000 ease-in-out scale-100 group-hover:scale-105"
              />
            </div>
          ))}
        </div>

        {/* Lightbox Component */}
        {selectedImage && (
          <div 
            className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-4 md:p-12 animate-in fade-in duration-300"
            onClick={() => setSelectedImage(null)}
          >
            <button className="absolute top-10 right-10 text-white text-4xl font-light hover:text-primary transition-colors">&times;</button>
            <div className="relative max-w-5xl w-full h-full flex flex-col items-center justify-center">
              <img 
                src={selectedImage.src} 
                alt="Selected" 
                className="max-w-full max-h-[80vh] object-contain shadow-2xl"
              />
              <div className="mt-8 text-center text-white">
                <p className="text-[10px] uppercase tracking-[0.4em] text-primary font-bold mb-2">{selectedImage.category}</p>
                <p className="text-xl font-serif italic">Leezar Studios Original</p>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredImages.length === 0 && (
          <div className="py-24 text-center">
            <p className="text-neutral-gray font-serif italic text-xl">Selection coming soon...</p>
          </div>
        )}
      </div>
    </main>
  );
}