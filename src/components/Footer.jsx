import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-zinc-950 border-t py-16 px-6" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
      <div className="max-w-5xl mx-auto">
        <div className="grid md:grid-cols-4 gap-12 mb-12">

          <div className="md:col-span-2">
            <Link href="/" className="inline-flex flex-col items-start mb-5">
              <span className="font-serif text-xl text-white leading-none">photostudio</span>
              <span className="text-[7px] uppercase tracking-[0.3em] font-bold text-primary">.ng</span>
            </Link>
            <p className="text-sm text-white/30 leading-relaxed max-w-xs">
              Professional photography studio infrastructure for Nigerian photographers. Website, galleries, bookings, and payments — in one subscription.
            </p>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/20 mb-5">Product</p>
            <ul className="space-y-3 text-sm text-white/40">
              <li><a href="/#features" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="/#pricing" className="hover:text-white transition-colors">Pricing</a></li>
              <li><Link href="/studio-site/demo" className="hover:text-white transition-colors">Live demo</Link></li>
              <li><Link href="/auth/signup" className="hover:text-white transition-colors">Get started free</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/20 mb-5">Account</p>
            <ul className="space-y-3 text-sm text-white/40">
              <li><Link href="/auth/login" className="hover:text-white transition-colors">Log in</Link></li>
              <li><Link href="/auth/signup" className="hover:text-white transition-colors">Sign up</Link></li>
              <li>
                <a href="mailto:hello@photostudio.ng" className="hover:text-white transition-colors">
                  hello@photostudio.ng
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center border-t pt-8 gap-4" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <p className="text-[10px] uppercase tracking-widest text-white/18">
            &copy; {new Date().getFullYear()} photostudio.ng — Built for Nigerian photographers
          </p>
          <p className="text-[10px] uppercase tracking-widest text-white/12">
            Lagos · Abuja · Port Harcourt
          </p>
        </div>
      </div>
    </footer>
  );
}
