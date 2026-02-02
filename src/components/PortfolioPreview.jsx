import { siteData } from '@/lib/data';

export default function PortfolioPreview() {
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
          <div key={item.id} className="relative group overflow-hidden bg-gray-200">
            <img 
              src={item.src} 
              alt={item.category} 
              className="w-full grayscale hover:grayscale-0 transition-all duration-700 ease-in-out transform group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
              <span className="text-white text-xs uppercase tracking-widest">{item.category}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}