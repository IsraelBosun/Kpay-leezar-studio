"use client";
import ContactForm from '@/components/ContactForm';
import { siteData } from '@/lib/data';
import { motion } from 'framer-motion';

export default function ContactPage() {
  return (
    <main className="min-h-screen flex flex-col lg:flex-row">

      {/* LEFT — Dark cinematic panel */}
      <div className="relative lg:sticky lg:top-0 lg:h-screen lg:w-[42%] flex-shrink-0 overflow-hidden bg-zinc-950">
        {/* Background image */}
        <img
          src="https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=900&h=1200&fit=crop&q=80"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
        {/* Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-zinc-950/30" />
        {/* Red glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(211,14,21,0.12)_0%,_transparent_60%)] pointer-events-none" />

        <div className="relative z-10 flex flex-col justify-between h-full p-10 md:p-14 py-32 lg:py-14">

          {/* Logo */}
          <a href="/" className="inline-flex flex-col items-start">
            <span className="font-serif text-2xl tracking-tight leading-none text-white">LUMIS</span>
            <span className="text-[8px] uppercase tracking-[0.3em] font-bold text-primary">Studio</span>
          </a>

          {/* Main copy */}
          <div>
            <motion.p
              className="text-xs uppercase tracking-[0.4em] text-primary font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Inquiries
            </motion.p>
            <motion.h1
              className="text-4xl md:text-5xl font-serif text-white leading-tight mb-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Let's create something <span className="italic text-white/70">remarkable</span>.
            </motion.h1>
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
            >
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-primary mb-2">Email</p>
                <a href={`mailto:${siteData.contact.email}`} className="text-white/80 hover:text-white transition-colors font-light text-sm">
                  {siteData.contact.email}
                </a>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-primary mb-2">Phone</p>
                <a href={`tel:${siteData.contact.phone}`} className="text-white/80 hover:text-white transition-colors font-light text-sm">
                  {siteData.contact.phone}
                </a>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-primary mb-2">Location</p>
                <p className="text-white/80 font-light text-sm">{siteData.contact.address}</p>
                <p className="text-white/40 text-[11px] uppercase tracking-widest mt-1">Available for Global Travel</p>
              </div>
            </motion.div>
          </div>

          {/* Socials */}
          <motion.div
            className="flex gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {siteData.contact.socials.map((social) => (
              <a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] uppercase tracking-widest font-bold text-white/40 hover:text-primary transition-colors"
              >
                {social.name}
              </a>
            ))}
          </motion.div>
        </div>
      </div>

      {/* RIGHT — Form panel */}
      <div className="flex-1 bg-white flex items-start justify-center px-6 md:px-12 lg:px-16 py-32 lg:py-20">
        <motion.div
          className="w-full max-w-xl"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
        >
          <h2 className="text-3xl font-serif text-black mb-2">Booking Request</h2>
          <p className="text-sm text-neutral-gray italic mb-10">Fill in your details and we'll be in touch shortly.</p>
          <ContactForm />
        </motion.div>
      </div>

    </main>
  );
}
