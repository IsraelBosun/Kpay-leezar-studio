import Link from 'next/link';

export default function CTASection() {
  return (
    <section className="relative py-32 px-6 overflow-hidden">
      {/* Background Decorative Element - Subtly using the brand color */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <h2 className="text-sm uppercase tracking-[0.5em] text-primary font-bold mb-8 animate-fade-in">
          Get in Touch
        </h2>
        
        <h3 className="text-4xl md:text-6xl font-serif text-black mb-8 leading-tight">
          Let’s Create Something <span className="italic">Timeless</span>
        </h3>
        
        <p className="text-lg md:text-xl text-neutral-gray font-light mb-12 max-w-2xl mx-auto leading-relaxed">
          Whether it’s a personal session or a large-scale event, Leezar Studios is ready to bring your vision to life with precision and artistry.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <Link 
            href="/contact" 
            className="group relative bg-primary text-white px-12 py-5 uppercase tracking-widest text-sm font-bold overflow-hidden transition-all duration-300 hover:bg-black"
          >
            <span className="relative z-10">Book Your Session</span>
            <div className="absolute inset-0 bg-black translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          </Link>
          
          <Link 
            href="/gallery" 
            className="text-sm uppercase tracking-widest font-bold text-neutral-gray hover:text-primary transition-colors flex items-center gap-3"
          >
            Explore the Gallery
            <span className="w-8 h-[1px] bg-neutral-gray group-hover:bg-primary" />
          </Link>
        </div>

        {/* Brand Philosophy Subtext */}
        <p className="mt-16 text-[10px] uppercase tracking-[0.3em] text-gray-400 font-medium">
          Limited slots available for the current quarter
        </p>
      </div>
    </section>
  );
}