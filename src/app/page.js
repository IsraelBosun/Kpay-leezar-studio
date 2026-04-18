import HeroSection from '@/components/HeroSection';
import StatsSection from '@/components/StatsSection';
import MarqueeStrip from '@/components/MarqueeStrip';
import PortfolioPreview from '@/components/PortfolioPreview';
import AboutSection from '@/components/AboutSection';
import ServicesSection from '@/components/ServicesSection';
import TestimonialsSection from '@/components/TestimonialsSection';
import CTASection from '@/components/CTASection';

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <StatsSection />
      <MarqueeStrip />
      <PortfolioPreview />
      <div id="about">
        <AboutSection />
      </div>
      <div id="services">
        <ServicesSection />
      </div>
      <TestimonialsSection />
      <CTASection />
    </main>
  );
}
