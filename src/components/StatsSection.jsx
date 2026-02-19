"use client";
import { motion } from 'framer-motion';

const stats = [
  { number: "120+", label: "Sessions Completed" },
  { number: "80+", label: "Happy Clients" },
  { number: "3", label: "Service Offerings" },
  { number: "∞", label: "Stories Told" },
];

export default function StatsSection() {
  return (
    <section className="py-12 md:py-16 px-6 bg-gray-50 border-y border-gray-100">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              className="text-center relative"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: 'easeOut', delay: i * 0.1 }}
            >
              {/* Divider between items on desktop */}
              {i > 0 && (
                <div className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 w-px h-10 bg-gray-200" />
              )}
              <p className="text-4xl md:text-5xl font-serif text-black mb-2 leading-none">
                {stat.number}
              </p>
              <p className="text-[10px] uppercase tracking-widest font-bold text-neutral-gray">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
