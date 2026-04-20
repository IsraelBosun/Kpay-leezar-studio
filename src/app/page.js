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

const PLANS = [
  {
    name: 'Free',
    price: '₦0',
    description: 'Get your studio online today. No credit card needed.',
    cta: 'Start free',
    highlight: false,
    features: ['Studio website', 'Subdomain (yourstudio.photostudio.ng)', '1 client gallery', '50 photos per gallery', 'Client photo selections'],
    missing: ['Online bookings', 'Paystack payments', 'Custom domain'],
  },
  {
    name: 'Pro',
    price: '₦15,000',
    period: '/mo',
    description: 'For studios ready to grow and get paid properly.',
    cta: 'Start Pro',
    highlight: true,
    features: ['Everything in Free', 'Unlimited galleries & photos', 'Online bookings', 'Paystack deposit + balance', 'Custom domain', 'Invoice emails'],
    missing: [],
  },
  {
    name: 'Studio',
    price: '₦35,000',
    period: '/mo',
    description: 'For high-volume studios with a team.',
    cta: 'Start Studio',
    highlight: false,
    features: ['Everything in Pro', 'Desktop bulk uploader', 'Payment reminders', 'Analytics dashboard', 'Priority support'],
    missing: [],
  },
];

const STEPS = [
  { n: '01', title: 'Sign up in 60 seconds', body: 'Enter your studio name, location, and choose an accent colour.' },
  { n: '02', title: 'Upload your portfolio', body: 'Drag and drop 6–10 of your best photos. Write a short bio. Set your pricing.' },
  { n: '03', title: 'You\'re live', body: 'Share your link on Instagram. Clients book directly. Galleries go up after each shoot.' },
];

const MARQUEE_ITEMS = [
  'Professional website', 'Client galleries', 'Paystack payments', 'Online bookings',
  'Photo selections', 'WhatsApp share', 'No developer needed', 'Lagos · Abuja · Port Harcourt',
  'Free plan included', 'Live in 10 minutes',
];

export default function HomePage() {
  return (
    <main className="bg-zinc-950 text-white overflow-x-hidden">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section
        className="relative min-h-screen flex flex-col justify-center px-6 pt-32 pb-24 overflow-hidden"
        style={{ background: 'radial-gradient(ellipse 90% 60% at 50% -5%, rgba(211,14,21,0.2) 0%, transparent 55%), radial-gradient(ellipse 50% 70% at 100% 100%, rgba(211,14,21,0.06) 0%, transparent 50%), #09090b' }}
      >
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)', backgroundSize: '72px 72px' }} />

        <div className="relative max-w-5xl mx-auto w-full">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }}>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 text-[10px] uppercase tracking-[0.25em] font-bold text-white/50 mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Now in Beta — Join free
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 36 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, ease, delay: 0.1 }}
            className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-[88px] leading-[1.03] tracking-tight text-white mb-8"
          >
            Your photography<br />
            studio,{' '}
            <em className="not-italic" style={{ color: '#D30E15' }}>live</em>
            {' '}in<br />
            10 minutes.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease, delay: 0.25 }}
            className="text-white/45 text-lg md:text-xl max-w-xl leading-relaxed mb-12"
          >
            Professional website. Password-protected client galleries. Online bookings.
            Paystack payments. Everything Nigerian photography studios need — one subscription.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease, delay: 0.4 }}
            className="flex flex-wrap gap-4 mb-20"
          >
            <Link href="/auth/signup"
              className="inline-flex items-center gap-2.5 px-8 py-4 text-[11px] uppercase tracking-[0.2em] font-bold text-white hover:gap-4 transition-all duration-300"
              style={{ backgroundColor: '#D30E15' }}>
              Start free
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link href="/studio-site/demo"
              className="inline-flex items-center gap-2 px-8 py-4 text-[11px] uppercase tracking-[0.2em] font-bold text-white/55 border border-white/12 hover:border-white/30 hover:text-white transition-all duration-300">
              See a live demo
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-wrap gap-10 border-t pt-8"
            style={{ borderColor: 'rgba(255,255,255,0.07)' }}
          >
            {[
              { value: '10 min', label: 'to go live' },
              { value: '₦0', label: 'to start' },
              { value: '100%', label: 'Naira payments' },
              { value: '0', label: 'developers needed' },
            ].map(({ value, label }) => (
              <div key={label}>
                <p className="font-serif text-3xl text-white leading-none mb-1.5">{value}</p>
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/30">{label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Marquee ───────────────────────────────────────────────────────── */}
      <div className="border-y py-4 overflow-hidden" style={{ borderColor: 'rgba(255,255,255,0.07)', backgroundColor: 'rgba(255,255,255,0.02)' }}>
        <div className="animate-marquee flex whitespace-nowrap">
          {[0, 1].map((i) => (
            <span key={i} className="flex items-center">
              {MARQUEE_ITEMS.map((item) => (
                <span key={item} className="inline-flex items-center gap-4 px-8">
                  <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-white/25">{item}</span>
                  <span className="w-1 h-1 rounded-full bg-primary flex-shrink-0" />
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* ── Problem ───────────────────────────────────────────────────────── */}
      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto">
          <FadeUp className="mb-16">
            <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-primary mb-4">The problem</p>
            <h2 className="font-serif text-4xl md:text-5xl text-white leading-tight max-w-2xl">
              Most Nigerian photographers are running their business on WhatsApp and goodwill.
            </h2>
          </FadeUp>

          <Stagger className="grid md:grid-cols-2 gap-4">
            <Item>
              <div className="bg-zinc-900 border h-full p-8" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
                <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-white/25 mb-7">Without photostudio.ng</p>
                <ul className="space-y-4">
                  {[
                    'Sending 400 photos in a WhatsApp group',
                    'Chasing clients for bank transfers for weeks',
                    'No website — just an Instagram page',
                    'Client picks photos via voice note',
                    'Paying ₦200k+ for a basic website',
                    'Manual follow-ups for every single booking',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm text-white/35">
                      <span className="mt-0.5 w-4 h-4 rounded-full border border-red-900/60 flex items-center justify-center flex-shrink-0">
                        <svg className="w-2.5 h-2.5 text-red-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Item>

            <Item>
              <div className="h-full p-8 border" style={{ backgroundColor: 'rgba(211,14,21,0.05)', borderColor: 'rgba(211,14,21,0.25)' }}>
                <p className="text-[10px] uppercase tracking-[0.25em] font-bold mb-7" style={{ color: '#D30E15' }}>With photostudio.ng</p>
                <ul className="space-y-4">
                  {[
                    'Private gallery link — clients browse elegantly',
                    'Paystack deposit and balance, tracked automatically',
                    'Professional studio website live in 10 minutes',
                    'Clients select photos in a beautiful portal',
                    '₦0 to start — no developer, no Fiverr needed',
                    'Online booking form on your studio page',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm text-white/65">
                      <span className="mt-0.5 w-4 h-4 flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(211,14,21,0.18)' }}>
                        <svg className="w-2.5 h-2.5" style={{ color: '#D30E15' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Item>
          </Stagger>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────────────────── */}
      <section className="py-32 px-6" style={{ backgroundColor: 'rgba(255,255,255,0.015)' }} id="features">
        <div className="max-w-5xl mx-auto">
          <FadeUp className="mb-16">
            <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-primary mb-4">Features</p>
            <h2 className="font-serif text-4xl md:text-5xl text-white leading-tight max-w-lg">
              Everything in one subscription.
            </h2>
          </FadeUp>

          <Stagger className="grid md:grid-cols-3 gap-4">
            {/* Large card */}
            <Item className="md:col-span-2">
              <div className="bg-zinc-900 border p-8 h-full min-h-[300px] flex flex-col justify-between relative overflow-hidden" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
                <div className="absolute top-6 right-6 w-44 opacity-15 pointer-events-none">
                  <div className="bg-zinc-800 border border-white/10">
                    <div className="flex items-center gap-1 px-2.5 py-2 border-b border-white/10">
                      <span className="w-2 h-2 rounded-full bg-red-400/80" />
                      <span className="w-2 h-2 rounded-full bg-yellow-400/80" />
                      <span className="w-2 h-2 rounded-full bg-green-400/80" />
                    </div>
                    <div className="p-2.5 space-y-1.5">
                      <div className="h-6 bg-zinc-700 rounded-sm" />
                      <div className="grid grid-cols-3 gap-1">
                        {[...Array(6)].map((_, i) => <div key={i} className="aspect-square bg-zinc-700 rounded-sm" />)}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-primary mb-3">Studio Website</p>
                  <h3 className="font-serif text-3xl text-white mb-3 leading-tight">Your studio website,<br />live in minutes.</h3>
                  <p className="text-sm text-white/40 leading-relaxed max-w-sm">
                    A fully branded, mobile-first photography website created automatically on signup. Portfolio gallery, services, about, contact form — all included. Free forever.
                  </p>
                </div>
                <span className="inline-block mt-6 px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-bold bg-white/5 border text-white/40" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                  Free plan included
                </span>
              </div>
            </Item>

            <Item>
              <div className="bg-zinc-900 border p-8 h-full min-h-[300px] flex flex-col justify-between relative overflow-hidden" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
                <div className="absolute bottom-4 right-4 opacity-10 pointer-events-none">
                  <div className="grid grid-cols-3 gap-1">
                    {[...Array(9)].map((_, i) => (
                      <div key={i} className="w-9 h-9 bg-white relative">
                        {(i === 1 || i === 4 || i === 7) && <div className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-red-500" />}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="relative">
                  <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-primary mb-3">Client Galleries</p>
                  <h3 className="font-serif text-2xl text-white mb-3 leading-tight">Private galleries for every shoot.</h3>
                  <p className="text-sm text-white/40 leading-relaxed">Password-protected links. Compressed thumbnails for fast mobile loading.</p>
                </div>
              </div>
            </Item>

            <Item>
              <div className="bg-zinc-900 border p-8 h-full flex flex-col justify-between" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-primary mb-3">Photo Selections</p>
                  <h3 className="font-serif text-2xl text-white mb-3 leading-tight">Clients heart their favourites.</h3>
                  <p className="text-sm text-white/40 leading-relaxed">Multiple people submit picks independently. You see everything consolidated.</p>
                </div>
                <div className="flex gap-1.5 mt-5">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-8 h-8 bg-zinc-800 flex items-center justify-center">
                      <svg className="w-4 h-4" style={{ color: i < 3 ? '#D30E15' : 'rgba(255,255,255,0.15)' }}
                        fill={i < 3 ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                      </svg>
                    </div>
                  ))}
                </div>
              </div>
            </Item>

            <Item>
              <div className="bg-zinc-900 border p-8 h-full flex flex-col justify-between" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-primary mb-3">Paystack Payments</p>
                  <h3 className="font-serif text-2xl text-white mb-3 leading-tight">Get paid in Naira. Automatically.</h3>
                  <p className="text-sm text-white/40 leading-relaxed">Deposit and balance via Paystack. Gallery unlocks when balance is paid.</p>
                </div>
                <div className="flex items-center gap-2 mt-5 p-3 bg-zinc-800 border" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                  <span className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
                  <span className="text-xs text-white/45 font-mono">₦350,000 — paid</span>
                </div>
              </div>
            </Item>

            <Item>
              <div className="bg-zinc-900 border p-8 h-full flex flex-col justify-between" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-primary mb-3">Online Bookings</p>
                  <h3 className="font-serif text-2xl text-white mb-3 leading-tight">No more WhatsApp back-and-forth.</h3>
                  <p className="text-sm text-white/40 leading-relaxed">Clients book directly from your studio page. Deposits collected upfront.</p>
                </div>
              </div>
            </Item>

            <Item className="md:col-span-3">
              <div className="border p-12 text-center" style={{ background: 'linear-gradient(135deg, rgba(211,14,21,0.07) 0%, rgba(211,14,21,0.02) 100%)', borderColor: 'rgba(211,14,21,0.2)' }}>
                <p className="font-serif text-3xl md:text-4xl text-white mb-3">
                  No developer. No web designer.<br className="hidden md:block" /> No Fiverr. No separate software.
                </p>
                <p className="text-white/35 text-sm">Sign up, fill in your details, upload your photos — your studio is live.</p>
              </div>
            </Item>
          </Stagger>
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────────────────────── */}
      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto">
          <FadeUp className="mb-16">
            <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-primary mb-4">How it works</p>
            <h2 className="font-serif text-4xl md:text-5xl text-white leading-tight max-w-xl">
              From signup to live in three steps.
            </h2>
          </FadeUp>

          <Stagger className="grid md:grid-cols-3 gap-12 md:gap-8">
            {STEPS.map(({ n, title, body }) => (
              <Item key={n}>
                <p className="font-serif text-8xl leading-none mb-4" style={{ color: 'rgba(255,255,255,0.06)' }}>{n}</p>
                <div className="w-7 h-px bg-primary mb-5" />
                <h3 className="font-medium text-white text-lg mb-3">{title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{body}</p>
              </Item>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ── Pricing ───────────────────────────────────────────────────────── */}
      <section className="py-32 px-6" style={{ backgroundColor: 'rgba(255,255,255,0.015)' }} id="pricing">
        <div className="max-w-5xl mx-auto">
          <FadeUp className="mb-16">
            <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-primary mb-4">Pricing</p>
            <h2 className="font-serif text-4xl md:text-5xl text-white leading-tight max-w-xl">
              Start free. Upgrade when you're ready.
            </h2>
          </FadeUp>

          <Stagger className="grid md:grid-cols-3 gap-4">
            {PLANS.map((plan) => (
              <Item key={plan.name}>
                <div className="p-8 h-full flex flex-col border" style={{
                  backgroundColor: plan.highlight ? 'rgba(211,14,21,0.07)' : '#18181b',
                  borderColor: plan.highlight ? 'rgba(211,14,21,0.35)' : 'rgba(255,255,255,0.07)',
                }}>
                  {plan.highlight && (
                    <span className="inline-block mb-5 text-[9px] uppercase tracking-[0.25em] font-bold px-2 py-1 text-white self-start" style={{ backgroundColor: '#D30E15' }}>
                      Most popular
                    </span>
                  )}
                  <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/35 mb-2">{plan.name}</p>
                  <div className="flex items-end gap-1 mb-2">
                    <span className="font-serif text-4xl text-white">{plan.price}</span>
                    {plan.period && <span className="text-white/25 text-sm mb-1.5">{plan.period}</span>}
                  </div>
                  <p className="text-xs text-white/35 mb-8 leading-relaxed">{plan.description}</p>

                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm text-white/60">
                        <svg className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: '#D30E15' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                        </svg>
                        {f}
                      </li>
                    ))}
                    {plan.missing.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm text-white/18">
                        <svg className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-white/12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        {f}
                      </li>
                    ))}
                  </ul>

                  <Link href="/auth/signup"
                    className="block text-center py-3.5 text-[11px] uppercase tracking-[0.2em] font-bold transition-all duration-300"
                    style={plan.highlight
                      ? { backgroundColor: '#D30E15', color: 'white' }
                      : { backgroundColor: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.08)' }
                    }>
                    {plan.cta} →
                  </Link>
                </div>
              </Item>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────────────────── */}
      <section className="py-40 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 70% 70% at 50% 50%, rgba(211,14,21,0.13) 0%, transparent 65%)' }} />
        <FadeUp className="relative max-w-3xl mx-auto">
          <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-primary mb-6">Get started today</p>
          <h2 className="font-serif text-5xl md:text-6xl lg:text-7xl text-white mb-8 leading-[1.05]">
            Your studio website is<br />
            <span className="italic" style={{ color: '#D30E15' }}>one signup away.</span>
          </h2>
          <p className="text-white/35 text-lg mb-12">Free plan. No credit card. Live in 10 minutes.</p>
          <Link href="/auth/signup"
            className="inline-flex items-center gap-3 px-10 py-5 text-[11px] uppercase tracking-[0.25em] font-bold text-white transition-all duration-300 hover:opacity-85"
            style={{ backgroundColor: '#D30E15' }}>
            Create your free studio
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </FadeUp>
      </section>

    </main>
  );
}
