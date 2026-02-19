"use client";
import { siteData } from '@/lib/data';
import { motion } from 'framer-motion';

export default function AboutSection() {
  return (
    <section className="py-24 md:py-32 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* Photo Column */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="relative overflow-hidden">
              {/* Replace src with an actual photo of the photographer/studio */}
              <img
                src="https://placehold.co/700x900/1a1a1a/333333?text=."
                alt="Leezar Studios — The Photographer"
                className="w-full h-[420px] lg:h-[580px] object-cover"
              />
              {/* Red corner accent */}
              <div className="absolute bottom-0 left-0 w-14 h-14 bg-primary" />
            </div>

            {/* Floating year badge — desktop only */}
            <div className="hidden lg:block absolute -bottom-6 -right-6 bg-white shadow-2xl shadow-black/10 p-6 border border-gray-100 z-10">
              <p className="text-[10px] uppercase tracking-widest font-bold text-primary mb-1">Est.</p>
              <p className="text-4xl font-serif text-black leading-none">2024</p>
            </div>
          </motion.div>

          {/* Text Column */}
          <div className="space-y-7 lg:pt-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              <h2 className="text-xs uppercase tracking-[0.4em] text-primary font-bold mb-4">
                The Studio
              </h2>
              <h3 className="text-3xl md:text-4xl lg:text-5xl font-serif leading-tight text-black">
                {siteData.about.title}
              </h3>
            </motion.div>

            <div className="space-y-5 text-neutral-gray leading-relaxed">
              {siteData.about.content.map((paragraph, index) => (
                <motion.p
                  key={index}
                  className={`text-base md:text-lg ${index === 0 ? 'text-lg md:text-xl text-black font-light italic' : ''}`}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.6, ease: 'easeOut', delay: index * 0.12 }}
                >
                  {paragraph}
                </motion.p>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.4 }}
            >
              <motion.div
                className="h-px bg-primary mb-5"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                style={{ width: '5rem', originX: 0 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
              />
              <p className="text-xs uppercase tracking-widest font-semibold text-black">
                Lagos based, Globally driven.
              </p>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
