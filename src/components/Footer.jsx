import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-zinc-200 py-8 px-6">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">

        <Link href="/" className="inline-flex items-baseline gap-0.5">
          <span className="font-bold text-base text-zinc-900 tracking-tight">photostudio</span>
          <span className="text-sm font-bold" style={{ color: '#F0940A' }}>.ng</span>
        </Link>

        <div className="flex items-center gap-6 text-sm text-zinc-400">
          <Link href="#" className="hover:text-zinc-700 transition-colors">Privacy</Link>
          <Link href="#" className="hover:text-zinc-700 transition-colors">Terms</Link>
          <Link href="mailto:hello@photostudio.ng" className="hover:text-zinc-700 transition-colors">Contact</Link>
        </div>
      </div>
    </footer>
  );
}
