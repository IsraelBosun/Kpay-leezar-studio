"use client";
import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

const stats = [
  { number: 120, suffix: "+", label: "Sessions Completed" },
  { number: 80,  suffix: "+", label: "Happy Clients" },
  { number: 3,   suffix: "",  label: "Service Offerings" },
  { number: null, suffix: "∞", label: "Stories Told" },
];

function CountUp({ target, suffix, inView }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView || target === null) return;
    let frame;
    const duration = 1800;
    const startTime = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, target]);

  if (target === null) return <span>∞</span>;
  return <span>{count}{suffix}</span>;
}

export default function StatsSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section ref={ref} className="py-12 md:py-16 px-6 bg-gray-50 border-y border-gray-100">
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
              {i > 0 && (
                <div className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 w-px h-10 bg-gray-200" />
              )}
              <p className="text-4xl md:text-5xl font-serif text-black mb-2 leading-none">
                <CountUp target={stat.number} suffix={stat.suffix} inView={inView} />
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
