"use client";

import { siteData } from '@/lib/data';
import { useState } from 'react';

export default function PortfolioPreview() {
  const [activeId, setActiveId] = useState(null);

  const handleTap = (id) => {
    setActiveId(activeId === id ? null : id);
  };

  return (
    <section className="py-24 px-6 max-w-7xl mx-auto">
      <div className="mb-16 text-center">
        <h2 className="text-3xl font-serif mb-4">Featured Work</h2>
        <p className="text-neutral-gray max-w-xl mx-auto italic">
          A curated selection of moments captured with precision, emotion, and storytelling.
        </p>
      </div>
      
      <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
        {siteData.galleryPreview.map((item) => (
          <div 
            key={item.id} 
            className="relative group overflow-hidden bg-gray-200 cursor-pointer"
            onClick={() => handleTap(item.id)}
          >
            <img 
              src={item.src} 
              alt={item.category} 
              className={`w-full transition-all duration-700 ease-in-out transform
                ${activeId === item.id ? 'grayscale-0 scale-105' : 'grayscale group-hover:grayscale-0 group-hover:scale-105'}
              `}
            />
            <div className={`absolute inset-0 bg-black/20 transition-opacity flex items-end p-6
              ${activeId === item.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
            `}>
              <span className="text-white text-xs uppercase tracking-widest">{item.category}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}