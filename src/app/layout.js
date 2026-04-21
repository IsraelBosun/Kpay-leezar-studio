import './globals.css';
import { Inter, Playfair_Display } from 'next/font/google';
import { headers } from 'next/headers';
import ConditionalNavbar from '@/components/ConditionalNavbar';
import ConditionalFooter from '@/components/ConditionalFooter';
import WhatsAppButton from '@/components/WhatsAppButton';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans'
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--font-serif'
});

export const metadata = {
  title: 'photostudio.ng — Your photography studio, live in 10 minutes',
  description: 'Professional website, client galleries, online bookings, and Paystack payments for Nigerian photography studios. Free to start.',
};

export default async function RootLayout({ children }) {
  const h = await headers();
  const isStudioSite = h.get('x-is-studio-site') === '1';

  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} scroll-smooth`}>
      <body className="font-sans antialiased text-neutral-gray overflow-x-hidden">
        {!isStudioSite && <ConditionalNavbar />}
        {children}
        {!isStudioSite && <ConditionalFooter />}
        {!isStudioSite && <WhatsAppButton />}
      </body>
    </html>
  );
}
