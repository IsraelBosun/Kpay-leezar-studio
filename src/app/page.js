'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';

const ease = [0.22, 1, 0.36, 1];

function FadeUp({ children, delay = 0, className = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease, delay }}
      className={className}>
      {children}
    </motion.div>
  );
}

function Stagger({ children, className = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div ref={ref}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={{ visible: { transition: { staggerChildren: 0.09 } } }}
      className={className}>
      {children}
    </motion.div>
  );
}

function Item({ children, className = '' }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 22 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease } },
      }}
      className={className}>
      {children}
    </motion.div>
  );
}

const AMBER = '#F0940A';

const PLANS = [
  {
    name: 'Starter',
    price: '₦15,000',
    period: '/per month',
    highlight: false,
    features: ['1 photographer', '50GB storage', '20 active galleries', 'Paystack payments'],
  },
  {
    name: 'Studio',
    price: '₦35,000',
    period: '/per month',
    highlight: true,
    features: ['3 photographers', '200GB storage', 'Unlimited galleries', 'Client proofing'],
  },
  {
    name: 'Pro',
    price: '₦65,000',
    period: '/per month',
    highlight: false,
    features: ['Unlimited team', '500GB storage', 'Custom domain', 'Priority support'],
  },
];

const FEATURES = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
        <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
    title: 'Client galleries',
    body: 'Password-protected galleries your clients can browse, proof, and download from any device.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
        <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
      </svg>
    ),
    title: 'Online booking',
    body: 'Clients book sessions directly from your studio page. No more back-and-forth scheduling.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
        <rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" />
      </svg>
    ),
    title: 'Paystack payments',
    body: 'Collect deposits and balances in Naira. No FX stress, no Stripe, no PayPal.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
        <path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
        <polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" />
      </svg>
    ),
    title: 'Desktop uploader',
    body: 'Drag your Lightroom export folder and upload hundreds of photos in the background.',
  },
];

const STEPS = [
  { n: 1, title: 'Create your studio', body: 'Set up your profile at yourname.photostudio.ng in minutes.' },
  { n: 2, title: 'Upload your galleries', body: 'Share password-protected galleries with each client after every shoot.' },
  { n: 3, title: 'Get paid', body: 'Clients pay deposits and balances directly. Naira. Instantly.' },
];

export default function HomePage() {
  return (
    <main className="overflow-x-hidden bg-white">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="pt-36 pb-20 px-6 bg-gray-50 border-b border-zinc-200">
        <div className="max-w-3xl mx-auto text-center">

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold text-white mb-8"
              style={{ backgroundColor: AMBER }}>
              Built for Nigerian photographers
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease, delay: 0.1 }}
            className="font-bold text-5xl sm:text-6xl md:text-[68px] text-zinc-900 leading-[1.06] tracking-tight mb-5"
          >
            Your studio, <span style={{ color: AMBER }}>online.</span><br />
            Bookings, galleries &amp; payments.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease, delay: 0.2 }}
            className="text-zinc-500 text-lg max-w-xl mx-auto leading-relaxed mb-8"
          >
            Stop sending photos on Google Drive and chasing clients on WhatsApp. Everything your studio needs, in one place.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease, delay: 0.3 }}
            className="flex flex-col items-center gap-3 mb-14"
          >
            <Link href="/auth/signup"
              className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-semibold text-white rounded-sm hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#111' }}>
              Get started — it&apos;s free
            </Link>
            <p className="text-xs text-zinc-400">No credit card required · Set up in 5 minutes</p>
          </motion.div>

          {/* Dashboard mockup */}
          <motion.div
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease, delay: 0.45 }}
            className="max-w-2xl mx-auto"
          >
            <div className="bg-white border border-zinc-200 rounded-lg shadow-xl overflow-hidden">
              <div className="flex items-center gap-1.5 px-4 py-3 border-b border-zinc-100 bg-zinc-50">
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-300" />
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-300" />
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-300" />
              </div>
              <div className="p-6 grid grid-cols-3 gap-3">
                {[
                  { label: 'Active galleries', value: '24', sub: '+3 this week' },
                  { label: 'Pending payments', value: '₦840k', sub: '4 invoices' },
                  { label: 'Bookings this month', value: '12', sub: '2 unconfirmed' },
                ].map(({ label, value, sub }) => (
                  <div key={label} className="text-left p-4 bg-gray-50 border border-zinc-100 rounded-md">
                    <p className="text-[10px] text-zinc-400 mb-1 leading-tight">{label}</p>
                    <p className="font-bold text-xl text-zinc-900">{value}</p>
                    <p className="text-[10px] text-zinc-400 mt-0.5">{sub}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Photo strip ──────────────────────────────────────────────────── */}
      <section className="bg-gray-50 pb-16">
        <FadeUp className="max-w-4xl mx-auto">
          {/* Mobile: horizontal scroll — Desktop: 3-col grid */}
          <div
            className="flex md:grid md:grid-cols-3 gap-3 overflow-x-auto md:overflow-visible snap-x snap-mandatory px-6 md:px-0 [&::-webkit-scrollbar]:hidden"
            style={{ scrollbarWidth: 'none' }}>
            {[
              { seed: 'studio-bride',    offset: '' },
              { seed: 'studio-event',    offset: 'md:mt-6' },
              { seed: 'studio-portrait', offset: '' },
            ].map(({ seed, offset }) => (
              <motion.div
                key={seed}
                whileHover={{ y: -6 }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.35, ease }}
                className={`flex-shrink-0 w-[72vw] md:w-auto snap-start ${offset}`}>
                <div className="aspect-[4/5] overflow-hidden rounded-sm group cursor-pointer relative">
                  <img
                    src={`https://picsum.photos/seed/${seed}/600/750`}
                    alt=""
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                  />
                  {/* Subtle dark veil on hover */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 group-active:bg-black/25 transition-colors duration-500 rounded-sm" />
                </div>
              </motion.div>
            ))}
          </div>
          <p className="text-xs text-zinc-400 text-center mt-5 px-6 md:px-0">Your client galleries, delivered beautifully.</p>
        </FadeUp>
      </section>

      {/* ── Problem ───────────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-zinc-900">
        <FadeUp className="max-w-2xl mx-auto text-center">
          <p className="text-xl md:text-2xl text-white/70 leading-relaxed">
            Tired of sending photos on{' '}
            <span className="font-semibold" style={{ color: AMBER }}>Google Drive</span>
            ? Clients ghost on payments? Bookings scattered across{' '}
            <span className="font-semibold" style={{ color: AMBER }}>WhatsApp DMs</span>?
            <br className="hidden md:block" />
            <span className="text-white"> You&apos;re running a premium studio — your software should match.</span>
          </p>
        </FadeUp>
      </section>

      {/* ── Features ──────────────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-gray-50" id="features">
        <div className="max-w-4xl mx-auto">
          <FadeUp className="mb-12">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: AMBER }}>What you get</p>
            <h2 className="font-bold text-3xl md:text-4xl text-zinc-900">Everything your studio needs</h2>
          </FadeUp>

          <Stagger className="grid sm:grid-cols-2 gap-4">
            {FEATURES.map(({ icon, title, body }) => (
              <Item key={title}>
                <div className="bg-white border border-zinc-200 p-6 rounded-sm h-full">
                  <div className="w-10 h-10 rounded-md flex items-center justify-center mb-4 flex-shrink-0"
                    style={{ backgroundColor: 'rgba(240,148,10,0.1)', color: AMBER }}>
                    {icon}
                  </div>
                  <h3 className="font-semibold text-zinc-900 mb-2">{title}</h3>
                  <p className="text-sm text-zinc-500 leading-relaxed">{body}</p>
                </div>
              </Item>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <FadeUp className="mb-12">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: AMBER }}>How it works</p>
            <h2 className="font-bold text-3xl md:text-4xl text-zinc-900">Up and running in minutes</h2>
          </FadeUp>

          <Stagger className="grid md:grid-cols-3 gap-4">
            {STEPS.map(({ n, title, body }) => (
              <Item key={n}>
                <div className="bg-white border border-zinc-200 rounded-sm p-7 h-full flex flex-col">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm mb-5 flex-shrink-0"
                    style={{ backgroundColor: AMBER }}>
                    {n}
                  </div>
                  <h3 className="font-semibold text-zinc-900 mb-2">{title}</h3>
                  <p className="text-sm text-zinc-500 leading-relaxed">{body}</p>
                </div>
              </Item>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ── Pricing ───────────────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-gray-50" id="pricing">
        <div className="max-w-4xl mx-auto">
          <FadeUp className="mb-12">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: AMBER }}>Pricing</p>
            <h2 className="font-bold text-3xl md:text-4xl text-zinc-900">Simple Naira pricing</h2>
          </FadeUp>

          <Stagger className="grid md:grid-cols-3 gap-5">
            {PLANS.map((plan) => (
              <Item key={plan.name}>
                <div className="bg-white p-6 h-full flex flex-col rounded-sm relative"
                  style={{
                    border: plan.highlight ? `2px solid ${AMBER}` : '1px solid #e4e4e7',
                  }}>
                  {plan.highlight && (
                    <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-widest px-3 py-1 text-white rounded-full whitespace-nowrap"
                      style={{ backgroundColor: AMBER }}>
                      Most popular
                    </span>
                  )}
                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-3">{plan.name}</p>
                  <div className="flex items-baseline gap-1 mb-5">
                    <span className="font-bold text-3xl text-zinc-900">{plan.price}</span>
                    <span className="text-xs text-zinc-400">{plan.period}</span>
                  </div>
                  <ul className="space-y-2.5 mb-6 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-zinc-600">
                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: AMBER }} />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link href="/auth/signup"
                    className="block text-center py-2.5 text-sm font-semibold rounded-sm transition-all duration-200"
                    style={plan.highlight
                      ? { backgroundColor: AMBER, color: 'white', border: `1px solid ${AMBER}` }
                      : { backgroundColor: 'white', color: '#18181b', border: '1px solid #d4d4d8' }
                    }>
                    Get started
                  </Link>
                </div>
              </Item>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ── Early Access ──────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-white">
        <FadeUp className="max-w-xl mx-auto text-center">
          <p className="text-xs font-bold uppercase tracking-widest mb-5" style={{ color: AMBER }}>Early Access</p>
          <h2 className="font-bold text-2xl md:text-3xl text-zinc-900 mb-8 leading-tight">
            Join the studios already building with us
          </h2>
          <div className="flex items-center justify-center gap-3">
            <div className="flex -space-x-2">
              {['A', 'B', 'C', 'D'].map((letter, i) => (
                <div key={letter} className="w-9 h-9 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold"
                  style={{ backgroundColor: AMBER, opacity: 1 - i * 0.18 }}>
                  {letter}
                </div>
              ))}
            </div>
            <p className="text-sm text-zinc-500">12 Lagos studios on the waitlist</p>
          </div>
        </FadeUp>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-gray-50 border-t border-zinc-200">
        <FadeUp className="max-w-2xl mx-auto text-center">
          <h2 className="font-bold text-4xl md:text-5xl text-zinc-900 mb-4 leading-tight">
            Ready to run your studio properly?
          </h2>
          <p className="text-zinc-500 mb-8 text-lg">
            Join Nigerian photographers already building on photostudio.ng
          </p>
          <Link href="/auth/signup"
            className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-semibold text-white rounded-sm hover:opacity-90 transition-opacity mb-4"
            style={{ backgroundColor: '#111' }}>
            Get started — it&apos;s free
          </Link>
          <p className="text-xs text-zinc-400 mt-3">No credit card · Setup in 5 minutes · Cancel anytime</p>
        </FadeUp>
      </section>

    </main>
  );
}
