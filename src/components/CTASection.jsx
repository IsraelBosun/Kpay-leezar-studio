"use client";
import Link from 'next/link';
import { motion } from 'framer-motion';

const headlineWords = ["Let's", "Create", "Something", "Timeless"];

export default function CTASection() {
  return (
    <section className="relative py-32 px-6 overflow-hidden">
      {/* Background Decorative Element */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto text-center relative z-10">

        {/* Label */}
        <motion.h2
          className="text-sm uppercase tracking-[0.5em] text-primary font-bold mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          Get in Touch
        </motion.h2>

        {/* Word-by-word headline */}
        <h3 className="text-4xl md:text-6xl font-serif text-black mb-8 leading-tight">
          {headlineWords.map((word, i) => (
            <motion.span
              key={i}
              className={`inline-block mr-[0.25em] ${i === 3 ? 'italic' : ''}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{
                duration: 0.5,
                ease: [0.22, 1, 0.36, 1],
                delay: 0.1 + i * 0.1,
              }}
            >
              {word}
            </motion.span>
          ))}
        </h3>

        {/* Body */}
        <motion.p
          className="text-lg md:text-xl text-neutral-gray font-light mb-12 max-w-2xl mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.35 }}
        >
          Whether it's a personal session or a large-scale event, Leezar Studios is ready to bring your vision to life with precision and artistry.
        </motion.p>

        {/* Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.5 }}
        >
          <motion.div
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <Link
              href="/contact"
              className="group relative bg-primary text-white px-12 py-5 uppercase tracking-widest text-sm font-bold overflow-hidden transition-all duration-300 hover:bg-black inline-block"
            >
              <span className="relative z-10">Book Your Session</span>
              <div className="absolute inset-0 bg-black translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </Link>
          </motion.div>

          <motion.div
            whileHover={{ x: 4 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <Link
              href="/gallery"
              className="text-sm uppercase tracking-widest font-bold text-neutral-gray hover:text-primary transition-colors flex items-center gap-3"
            >
              Explore the Gallery
              <span className="w-8 h-[1px] bg-neutral-gray group-hover:bg-primary" />
            </Link>
          </motion.div>
        </motion.div>

        {/* Subtext */}
        <motion.p
          className="mt-16 text-[10px] uppercase tracking-[0.3em] text-gray-400 font-medium"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          Limited slots available for the current quarter
        </motion.p>
      </div>
    </section>
  );
}
