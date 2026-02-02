import { siteData } from '@/lib/data';
import Link from 'next/link';

export default function ServicesSection() {
  return (
    <section className="py-32 px-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Area */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
          <div className="max-w-xl">
            <h2 className="text-sm uppercase tracking-[0.4em] text-primary font-bold mb-4">
              Expertise
            </h2>
            <h3 className="text-4xl md:text-6xl font-serif text-black leading-tight">
              What We Offer
            </h3>
          </div>
          <div className="max-w-xs border-l-2 border-primary pl-6 py-2">
            <p className="text-neutral-gray italic text-sm leading-relaxed">
              Every project is unique. Our pricing is meticulously tailored to the specific vision and requirements of our clients.
            </p>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {siteData.services.map((service, index) => (
            <div 
              key={index} 
              className="group relative p-10 bg-white hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] transition-all duration-500 border border-transparent hover:border-gray-100 flex flex-col h-full"
            >
              {/* Service Numbering */}
              <span className="block text-xs font-bold text-primary mb-10 tracking-[0.2em]">
                0{index + 1} &mdash;
              </span>
              
              <h4 className="text-2xl font-serif mb-6 text-black group-hover:text-primary transition-colors duration-300">
                {service.title}
              </h4>
              
              <p className="text-neutral-gray leading-relaxed mb-10 flex-grow font-light">
                {service.description}
              </p>
              
              <Link 
                href="/contact"
                className="inline-flex items-center text-xs uppercase tracking-widest font-bold text-black group-hover:text-primary transition-all"
              >
                Inquire for Details
                <svg 
                  className="ml-3 w-5 h-5 transform group-hover:translate-x-2 transition-transform duration-300" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          ))}
        </div>

        {/* Investment & Pricing Section */}
        <div className="mt-24 bg-white border border-gray-100 p-8 md:p-16 relative overflow-hidden">
          {/* Subtle Background Mark */}
          <div className="absolute top-0 right-0 text-[12rem] font-serif text-gray-50 select-none pointer-events-none translate-x-1/4 -translate-y-1/4">
            $
          </div>

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="max-w-md">
              <h4 className="text-xs uppercase tracking-[0.3em] font-bold text-primary mb-4">Investment</h4>
              <p className="text-xl text-black font-serif italic mb-4">
                "Quality is remembered long after price is forgotten."
              </p>
              <p className="text-neutral-gray text-sm leading-relaxed">
                Premium photography is an investment in your visual legacy. Our bespoke sessions begin at 
                <span className="text-black font-bold mx-1 whitespace-nowrap">₦500,000</span>.
              </p>
            </div>

            <div className="flex flex-col items-center md:items-end gap-6 w-full md:w-auto">
              <Link 
                href="/contact" 
                className="bg-black text-white px-10 py-4 uppercase tracking-widest text-xs font-bold hover:bg-primary transition-colors duration-300 w-full md:w-auto text-center"
              >
                Request Rate Card
              </Link>
              <p className="text-[10px] uppercase tracking-widest text-gray-400">
                Customized quotes available upon request
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}