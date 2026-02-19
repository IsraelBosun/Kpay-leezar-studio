"use client";
import ContactForm from '@/components/ContactForm';
import { siteData } from '@/lib/data';
import { motion } from 'framer-motion';

export default function ContactPage() {
  return (
    <main className="pt-32 pb-24 px-6 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto">

        {/* Hero Header */}
        <div className="mb-20">
          <motion.h2
            className="text-sm uppercase tracking-[0.4em] text-primary font-bold mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            Inquiries
          </motion.h2>

          <motion.h1
            className="text-5xl md:text-7xl font-serif text-black leading-tight max-w-3xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          >
            Let's discuss your vision and create something <span className="italic">remarkable</span>.
          </motion.h1>

          <motion.p
            className="mt-8 text-lg text-neutral-gray max-w-xl font-light leading-relaxed border-l-2 border-gray-100 pl-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.25 }}
          >
            Whether you are planning a high-profile corporate event, a private portrait session, or a global brand campaign, we are ready to bring our lens to your story.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">

          {/* Form Section */}
          <motion.div
            className="lg:col-span-7"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
          >
            <ContactForm />
          </motion.div>

          {/* Details & Social Section */}
          <motion.div
            className="lg:col-span-5 space-y-12"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.45 }}
          >
            <div>
              <h4 className="text-xs uppercase tracking-[0.3em] font-bold text-primary mb-6">Direct Contact</h4>
              <div className="space-y-4">
                <a
                  href={`mailto:${siteData.contact.email}`}
                  className="block text-2xl font-serif text-black hover:text-primary transition-colors group"
                >
                  <span className="inline-block group-hover:translate-x-1 transition-transform">
                    {siteData.contact.email}
                  </span>
                </a>
                <a
                  href={`tel:${siteData.contact.phone}`}
                  className="block text-2xl font-serif text-black hover:text-primary transition-colors group"
                >
                  <span className="inline-block group-hover:translate-x-1 transition-transform">
                    {siteData.contact.phone}
                  </span>
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-xs uppercase tracking-[0.3em] font-bold text-primary mb-6">Location</h4>
              <p className="text-xl font-serif text-black leading-relaxed">
                {siteData.contact.address}<br />
                <span className="text-sm font-sans uppercase tracking-widest text-neutral-gray italic mt-2 inline-block">
                  Available for Global Travel
                </span>
              </p>
            </div>

            <div>
              <h4 className="text-xs uppercase tracking-[0.3em] font-bold text-primary mb-6">Social Discovery</h4>
              <div className="flex flex-wrap gap-8">
                {siteData.contact.socials.map((social) => (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm uppercase tracking-widest font-bold text-black border-b-2 border-transparent hover:border-primary hover:text-primary transition-all pb-1"
                  >
                    {social.name}
                  </a>
                ))}
              </div>
            </div>

            <div className="pt-8 border-t border-gray-100">
              <p className="text-xs text-neutral-gray italic leading-relaxed">
                We typically respond to all inquiries within 24 hours. For urgent requests, please call directly.
              </p>
            </div>
          </motion.div>

        </div>
      </div>
    </main>
  );
}
