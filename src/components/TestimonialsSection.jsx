"use client";
import { siteData } from '@/lib/data';
import { motion } from 'framer-motion';

export default function TestimonialsSection() {
  return (
    <section className="py-24 md:py-32 px-6 bg-zinc-950">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <motion.div
          className="text-center mb-16 md:mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <h2 className="text-xs uppercase tracking-[0.5em] text-primary font-bold mb-4">
            Kind Words
          </h2>
          <h3 className="text-4xl md:text-5xl font-serif text-white">
            Client Stories
          </h3>
        </motion.div>

        {/* Testimonial Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {siteData.testimonials.map((t, i) => (
            <motion.div
              key={i}
              className="relative p-8 md:p-10 border border-white/10 hover:border-primary/40 transition-colors duration-500"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: i * 0.15 }}
              whileHover={{ y: -6, transition: { duration: 0.3 } }}
            >
              {/* Decorative quote mark */}
              <span className="absolute top-6 right-8 text-7xl font-serif text-primary/15 leading-none select-none pointer-events-none">
                "
              </span>

              {/* Stars */}
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, s) => (
                  <svg key={s} className="w-3 h-3 fill-primary" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              <p className="text-white/75 font-light leading-relaxed text-base md:text-lg italic mb-8 relative z-10">
                "{t.quote}"
              </p>

              <div className="flex items-center gap-3">
                <div className="w-8 h-px bg-primary flex-shrink-0" />
                <p className="text-[11px] uppercase tracking-widest font-bold text-white/40">
                  {t.author}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
