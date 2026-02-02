import { siteData } from '@/lib/data';
import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-100 pt-24 pb-12 px-6 bg-[radial-gradient(circle,_rgba(211,14,21,0.03)_0%,_transparent_70%)]">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-24">
          
          {/* Brand Column */}
          <div className="md:col-span-1">
            <Link href="/" className="text-2xl font-serif tracking-tighter block mb-6">
                        <img
              src="/logooo.png"
              alt="Leezar Studios Logo"
              className="w-20 h-auto mb-1 group-hover:opacity-80 transition-opacity duration-300"
            />
              {/* LEEZAR <span className="block text-[10px] uppercase tracking-[0.3em] text-neutral-gray">Studios</span> */}
            </Link>
            <p className="text-sm text-neutral-gray leading-relaxed max-w-xs">
              Capturing authentic moments and transforming them into timeless visual stories.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-[11px] uppercase tracking-[0.2em] font-bold text-black mb-8">Navigation</h4>
            <ul className="space-y-4 text-sm text-neutral-gray">
              <li><Link href="/#about" className="hover:text-primary transition-colors">About the Studio</Link></li>
              <li><Link href="/gallery" className="hover:text-primary transition-colors">Portfolio</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors">Bookings</Link></li>
              <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-[11px] uppercase tracking-[0.2em] font-bold text-black mb-8">Connect</h4>
            <ul className="space-y-4 text-sm text-neutral-gray">
              <li><a href={`mailto:${siteData.contact.email}`} className="hover:text-primary transition-colors">{siteData.contact.email}</a></li>
              <li><a href={`tel:${siteData.contact.phone}`} className="hover:text-primary transition-colors">{siteData.contact.phone}</a></li>
              <li>{siteData.contact.address}</li>
            </ul>
          </div>

          {/* Socials */}
          <div>
            <h4 className="text-[11px] uppercase tracking-[0.2em] font-bold text-black mb-8">Social</h4>
            <div className="flex gap-6">
              {siteData.contact.socials.map((social) => (
                <a 
                  key={social.name} 
                  href={social.url} 
                  className="text-neutral-gray hover:text-primary transition-colors text-sm"
                >
                  {social.name}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center border-t border-gray-50 pt-8 gap-4">
          <p className="text-[10px] uppercase tracking-widest text-gray-400">
            &copy; {currentYear} Leezar Studios. All Rights Reserved.
          </p>
          <p className="text-[10px] uppercase tracking-widest text-gray-400">
            Design by Leezar Creative
          </p>
        </div>
      </div>
    </footer>
  );
}