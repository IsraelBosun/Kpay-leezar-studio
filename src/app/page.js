import HeroSection from '@/components/HeroSection';
import StatsSection from '@/components/StatsSection';
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
