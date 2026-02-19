"use client";
import { useState } from 'react';
import { siteData } from '@/lib/data';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function ServicesSection() {
  const [activeService, setActiveService] = useState(null);

  const handleServiceTap = (index) => {
    setActiveService(activeService === index ? null : index);
  };

  return (
    <section className="py-32 px-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">

        {/* Header Area */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
          <motion.div
            className="max-w-xl"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <h2 className="text-sm uppercase tracking-[0.4em] text-primary font-bold mb-4">
              Expertise
            </h2>
            <h3 className="text-4xl md:text-6xl font-serif text-black leading-tight">
              What We Offer
            </h3>
          </motion.div>

          <motion.div
            className="max-w-xs border-l-2 border-primary pl-6 py-2"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.15 }}
          >
            <p className="text-neutral-gray italic text-sm leading-relaxed">
              Every project is unique. Our pricing is meticulously tailored to the specific vision and requirements of our clients.
            </p>
          </motion.div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {siteData.services.map((service, index) => (
            <motion.div
              key={index}
              className={`group relative p-10 bg-white transition-colors duration-500 border flex flex-col h-full cursor-pointer ${
                activeService === index
                  ? 'border-gray-100'
                  : 'border-transparent hover:border-gray-100'
              }`}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{
                duration: 0.6,
                ease: [0.22, 1, 0.36, 1],
                delay: index * 0.15,
              }}
              whileHover={{
                y: -8,
                boxShadow: '0 20px 50px rgba(0,0,0,0.08)',
                transition: { duration: 0.3, ease: 'easeOut' },
              }}
              onClick={() => handleServiceTap(index)}
            >
              {/* Service Numbering */}
              <span className="block text-xs font-bold text-primary mb-10 tracking-[0.2em]">
                0{index + 1} &mdash;
              </span>

              <h4 className={`text-2xl font-serif mb-6 transition-colors duration-300 ${
                activeService === index ? 'text-primary' : 'text-black group-hover:text-primary'
              }`}>
                {service.title}
              </h4>

              <p className="text-neutral-gray leading-relaxed mb-10 flex-grow font-light">
                {service.description}
              </p>

              <Link
                href="/contact"
                className={`inline-flex items-center text-xs uppercase tracking-widest font-bold transition-all ${
                  activeService === index ? 'text-primary' : 'text-black group-hover:text-primary'
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                Inquire for Details
                <svg
                  className={`ml-3 w-5 h-5 transition-transform duration-300 ${
                    activeService === index ? 'translate-x-2' : 'group-hover:translate-x-2'
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Investment Block */}
        <motion.div
          className="mt-24 bg-white border border-gray-100 p-8 md:p-16 relative overflow-hidden"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
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
        </motion.div>

      </div>
    </section>
  );
}
