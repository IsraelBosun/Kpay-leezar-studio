"use client";
import { siteData } from '@/lib/data';
import { motion } from 'framer-motion';

export default function AboutSection() {
  return (
    <section className="py-32 px-6 bg-white border-y border-gray-50">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* Section Heading — slides in from left */}
          <motion.div
            className="lg:col-span-4"
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <h2 className="text-sm uppercase tracking-[0.4em] text-primary font-bold mb-4">
              The Studio
            </h2>
            <h3 className="text-4xl md:text-5xl font-serif leading-tight text-black">
              {siteData.about.title}
            </h3>
          </motion.div>

          {/* Body Content — paragraphs stagger up */}
          <div className="lg:col-span-8 space-y-8 text-neutral-gray leading-relaxed text-lg">
            {siteData.about.content.map((paragraph, index) => (
              <motion.p
                key={index}
                className={index === 0 ? "text-xl text-black font-light italic" : ""}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{
                  duration: 0.6,
                  ease: 'easeOut',
                  delay: index * 0.12,
                }}
              >
                {paragraph}
              </motion.p>
            ))}

            <motion.div
              className="pt-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.4 }}
            >
              {/* Red line grows in */}
              <motion.div
                className="h-px bg-primary mb-6"
                initial={{ scaleX: 0, originX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
                style={{ width: '5rem' }}
              />
              <p className="text-sm uppercase tracking-widest font-semibold text-black">
                Est. 2024 — Lagos based, Globally driven.
              </p>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
