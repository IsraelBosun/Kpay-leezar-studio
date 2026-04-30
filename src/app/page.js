'use client';

import { useRef, useState } from 'react';
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

const FREE_FEATURES = [
  'Studio website + subdomain',
  '20 portfolio photos',
  '1 client gallery (20 photos max)',
  'Photo selections (hearts)',
];

const PRO_FEATURES = [
  'Everything in Free',
  'Unlimited galleries + photos',
  'Online booking form',
  'Paystack payment links',
  'Password-protected galleries',
  'Gallery auto-unlock after payment',
  'Priority support',
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

const FAQ_ITEMS = [
  {
    q: 'How long does it take to set up my studio?',
    a: 'Under 10 minutes. Fill in your name, bio, and services, upload a few portfolio photos, and your website is live at yourname.photostudio.ng. No developer needed.',
  },
  {
    q: 'Do I need any technical knowledge?',
    a: 'None at all. If you can fill out a form and drag photos, you can set up your studio. Everything is designed for photographers, not developers.',
  },
  {
    q: 'What happens if I don\'t upgrade after the free trial?',
    a: 'Your studio website stays live and clients can still browse your portfolio. But booking, payments, and new galleries are locked. You can upgrade anytime to unlock them — your data is never deleted.',
  },
  {
    q: 'Can I cancel my Pro plan anytime?',
    a: 'Yes. Cancel from your settings and you won\'t be billed again. Your account drops to the free plan at the end of the current billing period.',
  },
  {
    q: 'What\'s the difference between monthly and yearly billing?',
    a: 'Monthly is ₦10,000/month. Yearly is ₦100,000 upfront — that\'s two months free, saving you ₦20,000 per year.',
  },
  {
    q: 'Can multiple people select photos from the same gallery?',
    a: 'Yes. Each person (bride, groom, family, etc.) enters their name when they open the gallery, and their selections are tracked separately. You see everyone\'s picks consolidated in your dashboard.',
  },
  {
    q: 'How do clients access their gallery?',
    a: 'You share a private link. Clients open it, enter their name, and start selecting photos. Galleries can be password-protected for extra privacy.',
  },
  {
    q: 'How do clients pay?',
    a: 'Via Paystack — card, bank transfer, or USSD. You send them a payment link from your dashboard. Deposit first to confirm the booking, balance before the gallery unlocks.',
  },
  {
    q: 'When does the money reach my account?',
    a: 'Your dashboard shows "paid" the moment Paystack confirms the transaction. The money hits your bank account the next business day (T+1 settlement).',
  },
  {
    q: 'Do you take a percentage of my payments?',
    a: 'No. 100% of what your clients pay goes straight to your bank account via Paystack. We charge a flat monthly or yearly subscription — no commissions, no hidden fees.',
  },
];

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-zinc-200 last:border-0">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-4 py-5 text-left group"
      >
        <span className="text-sm font-semibold text-zinc-800 group-hover:text-zinc-900 transition-colors leading-snug">{q}</span>
        <span
          className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full border border-zinc-200 group-hover:border-zinc-400 transition-all"
          style={open ? { backgroundColor: AMBER, borderColor: AMBER } : {}}
        >
          <svg className="w-3 h-3 transition-transform duration-200" style={{ color: open ? '#fff' : '#71717a', transform: open ? 'rotate(45deg)' : 'none' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 5v14M5 12h14" />
          </svg>
        </span>
      </button>
      {open && (
        <p className="text-sm text-zinc-500 leading-relaxed pb-5 pr-10">{a}</p>
      )}
    </div>
  );
}

function FAQSection() {
  return (
    <section className="py-24 px-6 bg-white border-t border-zinc-200" id="faq">
      <div className="max-w-2xl mx-auto">
        <FadeUp className="mb-12">
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: AMBER }}>FAQ</p>
          <h2 className="font-bold text-3xl md:text-4xl text-zinc-900">Common questions</h2>
        </FadeUp>
        <div>
          {FAQ_ITEMS.map((item) => (
            <FAQItem key={item.q} q={item.q} a={item.a} />
          ))}
        </div>
      </div>
    </section>
  );
}

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
        <div className="max-w-3xl mx-auto">
          <FadeUp className="mb-4">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: AMBER }}>Pricing</p>
            <h2 className="font-bold text-3xl md:text-4xl text-zinc-900">Two plans. No confusion.</h2>
          </FadeUp>
          <FadeUp delay={0.08} className="mb-12">
            <p className="text-zinc-500">Start free. Upgrade when you need bookings and payments.</p>
          </FadeUp>

          <Stagger className="grid md:grid-cols-2 gap-5 mb-6">

            {/* Free */}
            <Item>
              <div className="bg-white p-7 h-full flex flex-col rounded-sm border border-zinc-200">
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-3">Free</p>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="font-bold text-4xl text-zinc-900">₦0</span>
                </div>
                <p className="text-xs text-zinc-400 mb-6">Forever</p>
                <ul className="space-y-3 mb-8 flex-1">
                  {FREE_FEATURES.map(f => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-zinc-600">
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5 bg-zinc-300" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/auth/signup"
                  className="block text-center py-3 text-sm font-semibold rounded-sm transition-all duration-200 border border-zinc-300 text-zinc-700 hover:border-zinc-900 hover:text-zinc-900">
                  Start free
                </Link>
              </div>
            </Item>

            {/* Pro */}
            <Item>
              <div className="bg-white p-7 h-full flex flex-col rounded-sm relative"
                style={{ border: `2px solid ${AMBER}` }}>
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-widest px-3 py-1 text-white rounded-full whitespace-nowrap"
                  style={{ backgroundColor: AMBER }}>
                  14-day free trial
                </span>
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-3">Pro</p>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="font-bold text-4xl text-zinc-900">₦10,000</span>
                  <span className="text-xs text-zinc-400">/month</span>
                </div>
                <p className="text-xs mb-6" style={{ color: AMBER }}>
                  or ₦100,000/year — 2 months free
                </p>
                <ul className="space-y-3 mb-8 flex-1">
                  {PRO_FEATURES.map(f => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-zinc-600">
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5 flex-shrink-0" style={{ backgroundColor: AMBER }} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/auth/signup"
                  className="block text-center py-3 text-sm font-semibold rounded-sm transition-all duration-200 text-white hover:opacity-90"
                  style={{ backgroundColor: AMBER }}>
                  Start free trial — no card needed
                </Link>
              </div>
            </Item>

          </Stagger>

          <FadeUp delay={0.15}>
            <p className="text-center text-xs text-zinc-400">
              Every new studio gets <span className="font-semibold text-zinc-600">14 days of Pro free</span>. No credit card required. Cancel anytime.
            </p>
          </FadeUp>
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

      {/* ── Contact ───────────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-white border-t border-zinc-200" id="contact">
        <div className="max-w-2xl mx-auto text-center">
          <FadeUp>
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: AMBER }}>Get in touch</p>
            <h2 className="font-bold text-3xl md:text-4xl text-zinc-900 mb-4">Have a question?</h2>
            <p className="text-zinc-500 mb-10">Reach us via email or WhatsApp — we reply fast.</p>
          </FadeUp>
          <Stagger className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Item>
              <a href="mailto:photostudios@gmail.com"
                className="flex items-center gap-3 px-6 py-4 bg-gray-50 border border-zinc-200 rounded-sm hover:border-zinc-400 transition-colors group w-full sm:w-auto">
                <span className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: 'rgba(240,148,10,0.1)' }}>
                  <svg className="w-4 h-4" style={{ color: AMBER }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </span>
                <span className="text-sm font-medium text-zinc-700 group-hover:text-zinc-900 transition-colors">photostudios@gmail.com</span>
              </a>
            </Item>
            <Item>
              <a href="https://wa.me/2349133105749" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 px-6 py-4 bg-gray-50 border border-zinc-200 rounded-sm hover:border-zinc-400 transition-colors group w-full sm:w-auto">
                <span className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 bg-green-100">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </span>
                <span className="text-sm font-medium text-zinc-700 group-hover:text-zinc-900 transition-colors">+234 913 310 5794</span>
              </a>
            </Item>
          </Stagger>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────────── */}
      <FAQSection />

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
