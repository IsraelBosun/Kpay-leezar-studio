import { siteData } from '@/lib/data';
import Link from 'next/link';

export default function HeroSection() {
  return (
    <section className="relative h-screen flex items-center justify-center pt-20 overflow-hidden bg-gray-50">
      {/* Decorative Background Element */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-[radial-gradient(circle,_rgba(211,14,21,0.03)_0%,_transparent_70%)] pointer-events-none" />

      <div className="text-center z-10 px-6">
        <h2 className="text-sm uppercase tracking-[0.5em] mb-6 text-neutral-gray animate-fade-in font-bold">
          {siteData.hero.subtitle}
        </h2>
        
        <h1 className="text-6xl md:text-9xl font-serif mb-8 text-black tracking-tighter">
          {siteData.hero.title}
        </h1>
        
        <p className="text-lg md:text-2xl font-light italic mb-12 text-neutral-gray max-w-2xl mx-auto leading-relaxed">
          {siteData.hero.tagline}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          {/* Primary Action: Book a Session */}
          <Link 
            href="/contact"
            className="w-full sm:w-auto bg-primary text-white px-12 py-5 uppercase tracking-[0.2em] text-[11px] font-bold 
                       transition-all duration-300 
                       hover:bg-black hover:shadow-2xl hover:shadow-primary/20
                       active:scale-95 active:bg-black"
          >
            Book a Session
          </Link>
          
          {/* Secondary Action: View Portfolio */}
          <Link 
            href="/gallery"
            className="w-full sm:w-auto border border-neutral-gray text-neutral-gray px-12 py-5 uppercase tracking-[0.2em] text-[11px] font-bold 
                       transition-all duration-300 
                       hover:bg-neutral-gray hover:text-white
                       active:scale-95 active:bg-neutral-gray active:text-white"
          >
            View Gallery
          </Link>
        </div>
      </div>

      {/* Subtle Scroll Indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-[1px] h-12 bg-gradient-to-b from-primary to-transparent" />
      </div>
    </section>
  );
}