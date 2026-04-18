import './globals.css';
import { Inter, Playfair_Display } from 'next/font/google';
import ConditionalNavbar from '@/components/ConditionalNavbar';
import Footer from '@/components/Footer';
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
  title: 'Lumis Studio | Premium Photography & Visual Storytelling',
  description: 'A boutique photography studio specializing in portraits, events, and brand storytelling.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} scroll-smooth`}>
      <body className="font-sans antialiased text-neutral-gray overflow-x-hidden">
        <ConditionalNavbar />
        {children}
        <Footer />
        <WhatsAppButton />
      </body>
    </html>
  );
}
