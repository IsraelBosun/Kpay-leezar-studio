import { siteData } from '@/lib/data';

export default function HeroSection() {
  return (
    <section className="relative h-screen flex items-center justify-center pt-20 overflow-hidden bg-gray-50">
      <div className="text-center z-10 px-6">
        <h2 className="text-sm uppercase tracking-[0.5em] mb-4 text-neutral-gray animate-fade-in">
          {siteData.hero.subtitle}
        </h2>
        <h1 className="text-6xl md:text-8xl font-serif mb-6 text-black">
          {siteData.hero.title}
        </h1>
        <p className="text-lg md:text-xl font-light italic mb-10 text-neutral-gray max-w-2xl mx-auto">
          {siteData.hero.tagline}
        </p>
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <button className="bg-primary text-white px-10 py-4 uppercase tracking-widest text-sm hover:bg-black transition-all duration-300">
            Book a Session
          </button>
          <button className="border border-neutral-gray px-10 py-4 uppercase tracking-widest text-sm hover:bg-neutral-gray hover:text-white transition-all duration-300">
            View Portfolio
          </button>
        </div>
      </div>
    </section>
  );
}