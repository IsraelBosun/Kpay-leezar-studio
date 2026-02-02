"use client";
import { useState } from 'react';
import { siteData } from '@/lib/data';

// Extended gallery data for the full page
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
  const [activeImageId, setActiveImageId] = useState(null);

  const filteredImages = activeCategory === "All" 
    ? fullGallery 
    : fullGallery.filter(img => img.category === activeCategory);

  const handleImageTap = (id) => {
    setActiveImageId(activeImageId === id ? null : id);
  };

  return (
    <main className="pt-32 pb-24 min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Gallery Header */}
        <div className="mb-16 text-center">
          <h2 className="text-sm uppercase tracking-[0.5em] text-primary font-bold mb-4">
            Portfolio
          </h2>
          <h1 className="text-5xl md:text-7xl font-serif text-black mb-8">
            Our Work
          </h1>
          <p className="text-neutral-gray max-w-2xl mx-auto italic font-light text-lg">
            A visual collection of stories, moments, and emotions captured through the lens of excellence.
          </p>
        </div>

        {/* Editorial Filter System */}
        <div className="flex flex-wrap justify-center gap-8 mb-16 border-b border-gray-100 pb-8">
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
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-primary animate-in fade-in slide-in-from-left-2" />
              )}
            </button>
          ))}
        </div>

        {/* Masonry Grid */}
        <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8 animate-fade-in">
          {filteredImages.map((image) => (
            <div 
              key={image.id} 
              className="relative group overflow-hidden break-inside-avoid bg-gray-50 cursor-pointer"
              onClick={() => handleImageTap(image.id)}
            >
              <div className={`absolute inset-0 bg-black/40 z-10 flex flex-col justify-center items-center text-white p-6 transition-all duration-500 ${
                activeImageId === image.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
              }`}>
                <span className={`text-[10px] uppercase tracking-[0.3em] mb-2 transition-transform duration-500 ${
                  activeImageId === image.id ? 'translate-y-0' : 'translate-y-4 group-hover:translate-y-0'
                }`}>
                  {image.category}
                </span>
                <div className={`h-px w-8 bg-primary transition-transform duration-500 delay-75 ${
                  activeImageId === image.id ? 'translate-y-0' : 'translate-y-4 group-hover:translate-y-0'
                }`} />
                <button className="mt-4 text-xs uppercase tracking-widest border border-white/30 px-4 py-2 hover:bg-white hover:text-black transition-all">
                  View Full
                </button>
              </div>

              <img
                src={image.src}
                alt={image.category}
                className={`w-full h-auto object-cover transition-all duration-1000 ease-in-out ${
                  activeImageId === image.id 
                    ? 'grayscale-0 scale-110' 
                    : 'grayscale group-hover:grayscale-0 scale-100 group-hover:scale-110'
                }`}
              />
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredImages.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-neutral-gray italic">No masterpieces found in this category yet.</p>
          </div>
        )}
      </div>
    </main>
  );
}