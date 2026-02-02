import { siteData } from '@/lib/data';

export default function AboutSection() {
  return (
    <section className="py-32 px-6 bg-white border-y border-gray-50">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Section Heading */}
          <div className="lg:col-span-4">
            <h2 className="text-sm uppercase tracking-[0.4em] text-primary font-bold mb-4">
              The Studio
            </h2>
            <h3 className="text-4xl md:text-5xl font-serif leading-tight text-black">
              {siteData.about.title}
            </h3>
          </div>

          {/* Body Content */}
          <div className="lg:col-span-8 space-y-8 text-neutral-gray leading-relaxed text-lg">
            {siteData.about.content.map((paragraph, index) => (
              <p key={index} className={index === 0 ? "text-xl text-black font-light italic" : ""}>
                {paragraph}
              </p>
            ))}
            
            <div className="pt-4">
              <div className="h-px w-20 bg-primary mb-6"></div>
              <p className="text-sm uppercase tracking-widest font-semibold text-black">
                Est. 2024 — Lagos based, Globally driven.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}